from __future__ import annotations

import json
import re
import threading
import time
from dataclasses import dataclass
from datetime import date, datetime
from decimal import Decimal
from typing import Any

import pyodbc


PERSIAN_COLLATION = "Persian_100_CI_AI"


def normalize_persian(text: str) -> str:
    text = (
        text.lower()
        .replace("ي", "ی")
        .replace("ك", "ک")
        .replace("\u200c", " ")
    )
    return re.sub(r"[^\w\sآ-ی]", " ", text, flags=re.UNICODE).strip()


STOP_WORDS = {
    "از", "به", "در", "را", "با", "برای", "که", "این", "آن", "یک", "و", "یا",
    "چه", "چی", "چیه", "کدام", "کدوم", "هست", "هستند", "است", "دارید", "داره",
    "دارن", "لطفا", "لطفاً", "میخوام", "می‌خوام", "من", "شما", "آیتک", "آی‌تک",
    "aitech", "آکادمی", "اطلاعات", "درباره", "مورد", "بگو", "بده", "هایی", "های",
    "چیست", "کیست", "کسانی", "چقدر", "برگزار", "میشود", "می", "شود", "شده",
    "کرده", "کنید", "کنم", "هستش", "هستن", "چطور", "چگونه", "میتونم",
    "میتوانم", "می‌توانم",
}
STOP_WORDS.update({
    "دارد", "دارند", "دارید", "سرفصل", "سرفصلها", "سرفصل‌های",
    "زمانی", "برگزار", "میشود", "می‌شود", "چند", "مبلغ",
})

INTENT_WORDS = {
    "course": {
        "دوره", "دوره‌ها", "کلاس", "کلاس‌ها", "آموزش", "ثبت", "نام", "گروه",
        "گروه‌ها", "شهریه", "هزینه", "قیمت", "ظرفیت", "برنامه", "زمان", "ساعت",
    },
    "teacher": {"استاد", "اساتید", "مدرس", "مدرسین", "معلم", "رزومه"},
    "event": {"رویداد", "رویدادها", "همایش", "وبینار", "سمینار"},
    "news": {"خبر", "اخبار", "تازه", "جدیدترین", "آخرین"},
    "article": {"مقاله", "مقالات", "نوشته", "مطالب"},
    "book": {"کتاب", "کتاب‌ها", "منبع", "منابع"},
}

LATEST_WORDS = {"جدیدترین", "آخرین", "تازه‌ترین", "تازه", "latest", "newest"}

QUERY_SYNONYMS = {
    "معماری": [
        "معماری",
        "architecture",
        "طراحی",
        "هوش مصنوعی در معماری",
        "ساختمان",
    ],
    "پایتون": [
        "پایتون",
        "python",
        "برنامه نویسی",
    ],
    "هوش": [
        "هوش مصنوعی",
        "ai",
        "machine learning",
        "یادگیری ماشین",
    ],
    "دیتا": [
        "داده",
        "علم داده",
        "data",
        "power bi",
        "تحلیل داده",
    ],
}

@dataclass(frozen=True)
class Intent:
    name: str
    terms: tuple[str, ...]
    latest: bool = False


@dataclass
class CacheEntry:
    value: Any
    expires_at: float


class TTLCache:
    def __init__(self, ttl_seconds: int = 60, max_items: int = 256):
        self.ttl_seconds = ttl_seconds
        self.max_items = max_items
        self._items: dict[str, CacheEntry] = {}
        self._lock = threading.Lock()

    def get(self, key: str) -> Any | None:
        now = time.monotonic()
        with self._lock:
            entry = self._items.get(key)
            if entry is None:
                return None
            if entry.expires_at <= now:
                self._items.pop(key, None)
                return None
            return entry.value

    def set(self, key: str, value: Any) -> None:
        with self._lock:
            if len(self._items) >= self.max_items:
                oldest = min(
                    self._items,
                    key=lambda item: self._items[item].expires_at,
                )
                self._items.pop(oldest, None)
            self._items[key] = CacheEntry(
                value=value,
                expires_at=time.monotonic() + self.ttl_seconds,
            )


class FastAcademyRAG:
    def __init__(
        self,
        connection_string: str,
        query_timeout: int = 8,
        connect_timeout: int = 5,
        max_records: int = 12,
        cache_ttl_seconds: int = 90,
    ):
        self.connection_string = connection_string
        self.query_timeout = query_timeout
        self.connect_timeout = connect_timeout
        self.max_records = max_records
        self.cache = TTLCache(cache_ttl_seconds)
        self._connection: pyodbc.Connection | None = None
        self._connection_lock = threading.Lock()
        pyodbc.pooling = True

    def classify(self, question: str) -> Intent:
        normalized = normalize_persian(question)
        words = normalized.split()

        scores = {
            intent: sum(
                2 if word in vocabulary else 0
                for word in words
            )
            for intent, vocabulary in INTENT_WORDS.items()
        }

        if "استاد" in words or "مدرس" in words:
            name = "teacher"

        elif "رویداد" in words:
            name = "event"

        elif "خبر" in words or "اخبار" in words:
            name = "news"

        else:
            name = max(scores, key=scores.get)

            if scores[name] == 0:
                name = "general"

        blocked = (
            STOP_WORDS
            | set().union(*INTENT_WORDS.values())
            | LATEST_WORDS
        )

        terms = tuple(
            dict.fromkeys(
                word
                for word in words
                if (
                    len(word) >= 2
                    and word not in blocked
                    and not word.isdigit()
                )
            )
        )

        terms = self._expand_terms(terms)

        return Intent(
            name=name,
            terms=terms[:8],
            latest=bool(set(words) & LATEST_WORDS),
        )

    def retrieve(self, question: str) -> dict[str, Any]:
        key = normalize_persian(question)
        cached = self.cache.get(key)
        if cached is not None:
            return {**cached, "cache_hit": True}

        intent = self.classify(question)
        started_at = time.perf_counter()
        with self._connection_lock:
            connection = self._get_connection()
            try:
                records = self._retrieve_for_intent(connection, intent)
            except pyodbc.Error:
                try:
                    connection.close()
                except pyodbc.Error:
                    pass
                self._connection = None
                connection = self._get_connection()
                records = self._retrieve_for_intent(connection, intent)

        result = {
            "intent": intent.name,
            "terms": list(intent.terms),
            "records": records[:self.max_records],
            "cache_hit": False,
            "retrieval_ms": round((time.perf_counter() - started_at) * 1000),
        }
        self.cache.set(key, result)
        return result

    def _get_connection(self) -> pyodbc.Connection:
        if self._connection is None:
            self._connection = pyodbc.connect(
                self.connection_string,
                timeout=self.connect_timeout,
                autocommit=True,
            )
            self._connection.timeout = self.query_timeout
        return self._connection

    def _retrieve_for_intent(
        self,
        connection: pyodbc.Connection,
        intent: Intent,
    ) -> list[dict[str, Any]]:
        handlers = {
            "course": self._courses,
            "teacher": self._teachers,
            "event": self._events,
            "news": self._news,
            "article": self._articles,
            "book": self._books,
            "general": self._global_search,
        }
        return handlers[intent.name](connection, intent)

    def _search_clause(
        self,
        terms: tuple[str, ...],
        columns: tuple[str, ...],
    ) -> tuple[str, list[str]]:

        if not terms:
            return "1=1", []

        pieces = []
        params = []

        for term in terms:
            for column in columns:

                pieces.append(f"""
                (
                    COALESCE({column}, N'')
                    COLLATE {PERSIAN_COLLATION}
                    LIKE ?
                )
                """)

                params.append(f"%{term}%")

        return "(" + " OR ".join(pieces) + ")", params

    def _fetch(
        self,
        connection: pyodbc.Connection,
        sql: str,
        params: list[Any] | None = None,
    ) -> list[dict[str, Any]]:
        cursor = connection.cursor()
        cursor.execute(sql, params or [])
        columns = [column[0] for column in cursor.description]
        return [
            {
                key: self._serialize(value)
                for key, value in zip(columns, row)
            }
            for row in cursor.fetchmany(self.max_records)
        ]

    @staticmethod
    def _serialize(value: Any) -> Any:
        if isinstance(value, (datetime, date)):
            return value.isoformat()
        if isinstance(value, Decimal):
            return float(value)
        return value

    def _courses(
        self,
        connection: pyodbc.Connection,
        intent: Intent,
    ) -> list[dict[str, Any]]:
        if intent.terms:
            title_where, title_params = self._search_clause(
                intent.terms,
                ("c.Title", "g.Name"),
            )
            title_rows = self._fetch(
                connection,
                self._course_sql(title_where),
                title_params,
            )
            if title_rows:
                return title_rows
        where, params = self._search_clause(
            intent.terms,
            ("c.Title", "c.Description", "g.Name", "g.Note"),
        )
        return self._fetch(
            connection,
            self._course_sql(where),
            params,
        )

    def _course_sql(self, where: str) -> str:
        return f"""
            SELECT TOP {self.max_records}
                c.ID AS course_id,
                c.Title AS course_title,
                c.Description AS course_description,
                g.ID AS group_id,
                g.Name AS group_name,
                g.DayOfWeek AS day_of_week,
                g.StartTime AS start_time,
                g.EndTime AS end_time,
                g.StartDate AS start_date,
                g.EndDate AS end_date,
                g.Fee AS fee,
                g.GroupType AS group_type,
                g.GroupCapacity AS capacity,
                g.RegisterCount AS registered_count
            FROM Courses AS c
            LEFT JOIN Groups AS g
              ON g.CourseId = c.ID
             AND (g.IsActive = 1 OR g.IsActive IS NULL)
            WHERE (c.IsActive = 1 OR c.IsActive IS NULL)
              AND {where}
            ORDER BY c.UpdateDate DESC, g.StartDate DESC
            """

    def _teachers(
        self,
        connection: pyodbc.Connection,
        intent: Intent,
    ) -> list[dict[str, Any]]:
        if intent.terms:
            course_where, course_params = self._search_clause(
                intent.terms,
                ("c.Title", "g.Name"),
            )
            course_rows = self._fetch(
                connection,
                self._teacher_sql(course_where),
                course_params,
            )
            if course_rows:
                return course_rows
        where, params = self._search_clause(
            intent.terms,
            (
                "u.FirstName",
                "u.LastName",
                "r.Title",
                "r.Description",
                "c.Title",
                "g.Name",
            ),
        )
        return self._fetch(
            connection,
            self._teacher_sql(where),
            params,
        )

    def _teacher_sql(self, where: str) -> str:
        return f"""
            SELECT TOP {self.max_records}
                u.ID AS teacher_id,
                u.FirstName AS first_name,
                u.LastName AS last_name,
                r.Title AS resume_title,
                r.Description AS resume_description,
                r.DateAchieved AS date_achieved,
                c.Title AS course_title,
                g.Name AS group_name
            FROM Users AS u
            INNER JOIN TeacherResumes AS r ON r.UserId = u.ID
            LEFT JOIN Groups AS g
              ON g.TeacherId = u.ID
             AND (g.IsActive = 1 OR g.IsActive IS NULL)
            LEFT JOIN Courses AS c
              ON c.ID = g.CourseId
             AND (c.IsActive = 1 OR c.IsActive IS NULL)
            WHERE (u.IsActive = 1 OR u.IsActive IS NULL)
              AND (r.IsActive = 1 OR r.IsActive IS NULL)
              AND {where}
            ORDER BY u.IsFeaturedTeacher DESC, r.UpdateDate DESC
            """

    def _events(
        self,
        connection: pyodbc.Connection,
        intent: Intent,
    ) -> list[dict[str, Any]]:
        where, params = self._search_clause(
            intent.terms,
            ("Title", "Description", "Keywords"),
        )
        limit = 1 if intent.latest else self.max_records
        return self._fetch(
            connection,
            f"""
            SELECT TOP {limit}
                ID AS event_id,
                Title AS title,
                Description AS description,
                EventDate AS event_date,
                Fee AS fee,
                UrlSlug AS url_slug
            FROM Events
            WHERE (IsActive = 1 OR IsActive IS NULL)
              AND {where}
            ORDER BY EventDate DESC
            """,
            params,
        )

    def _news(
        self,
        connection: pyodbc.Connection,
        intent: Intent,
    ) -> list[dict[str, Any]]:
        where, params = self._search_clause(
            intent.terms,
            ("Title", "Content", "Keywords"),
        )
        limit = 1 if intent.latest else self.max_records
        rows = self._fetch(
            connection,
            f"""
            SELECT TOP {limit}
                ID AS news_id,
                Title AS title,
                Content AS content,
                Source AS source,
                PublishDate AS publish_date
            FROM News
            WHERE (IsActive = 1 OR IsActive IS NULL)
              AND {where}
            ORDER BY COALESCE(PublishDate, CreateDate) DESC
            """,
            params,
        )
        for row in rows:
            row["url"] = f"https://aitechac.com/news/{row['news_id']}"
        return rows

    def _articles(
        self,
        connection: pyodbc.Connection,
        intent: Intent,
    ) -> list[dict[str, Any]]:
        where, params = self._search_clause(
            intent.terms,
            ("Title", "Description", "AuthorName"),
        )
        limit = 1 if intent.latest else self.max_records
        return self._fetch(
            connection,
            f"""
            SELECT TOP {limit}
                ID AS article_id,
                Title AS title,
                Description AS description,
                AuthorName AS author,
                CreateDate AS create_date,
                UpdateDate AS update_date
            FROM Articles
            WHERE (IsActive = 1 OR IsActive IS NULL)
              AND {where}
            ORDER BY COALESCE(UpdateDate, CreateDate) DESC
            """,
            params,
        )

    def _books(
        self,
        connection: pyodbc.Connection,
        intent: Intent,
    ) -> list[dict[str, Any]]:
        where, params = self._search_clause(
            intent.terms,
            ("Title", "Description", "AuthorName", "Note"),
        )
        return self._fetch(
            connection,
            f"""
            SELECT TOP {self.max_records}
                ID AS book_id,
                Title AS title,
                Description AS description,
                AuthorName AS author,
                Note AS note
            FROM Books
            WHERE (IsActive = 1 OR IsActive IS NULL)
              AND {where}
            ORDER BY COALESCE(UpdateDate, CreateDate) DESC
            """,
            params,
        )

    def _global_search(
        self,
        connection: pyodbc.Connection,
        intent: Intent,
    ) -> list[dict[str, Any]]:

        if not intent.terms:
            return []

        where_courses, p1 = self._search_clause(
            intent.terms,
            ("Title", "Description", "Note")
        )

        where_events, p2 = self._search_clause(
            intent.terms,
            ("Title", "Description", "Keywords")
        )

        where_news, p3 = self._search_clause(
            intent.terms,
            ("Title", "Content", "Keywords")
        )

        where_articles, p4 = self._search_clause(
            intent.terms,
            ("Title", "Description", "AuthorName")
        )

        where_books, p5 = self._search_clause(
            intent.terms,
            ("Title", "Description", "AuthorName")
        )

        where_teachers, p6 = self._search_clause(
            intent.terms,
            (
                "u.FirstName",
                "u.LastName",
                "r.Title",
                "r.Description",
                "c.Title",
            ),
        )

        sql = f"""
        SELECT TOP 20 *
        FROM (

            SELECT
                N'course' AS source,
                c.ID AS item_id,
                c.Title AS title,
                c.Description AS details,
                c.UpdateDate AS item_date,
                CAST(NULL AS NVARCHAR(500)) AS extra
            FROM Courses c
            WHERE c.IsActive = 1
            AND {where_courses}

            UNION ALL

            SELECT
                N'teacher',
                u.ID,
                CONCAT(u.FirstName, N' ', u.LastName),
                r.Description,
                r.UpdateDate,
                c.Title
            FROM Users u
            LEFT JOIN TeacherResumes r
                ON r.UserId = u.ID
            LEFT JOIN Groups g
                ON g.TeacherId = u.ID
            LEFT JOIN Courses c
                ON c.ID = g.CourseId
            WHERE u.IsActive = 1
            AND {where_teachers}

            UNION ALL

            SELECT
                N'event',
                ID,
                Title,
                Description,
                EventDate,
                UrlSlug
            FROM Events
            WHERE IsActive = 1
            AND {where_events}

            UNION ALL

            SELECT
                N'news',
                ID,
                Title,
                Content,
                PublishDate,
                Source
            FROM News
            WHERE IsActive = 1
            AND {where_news}

            UNION ALL

            SELECT
                N'article',
                ID,
                Title,
                Description,
                UpdateDate,
                AuthorName
            FROM Articles
            WHERE IsActive = 1
            AND {where_articles}

            UNION ALL

            SELECT
                N'book',
                ID,
                Title,
                Description,
                UpdateDate,
                AuthorName
            FROM Books
            WHERE IsActive = 1
            AND {where_books}

        ) x
        ORDER BY item_date DESC
        """

        return self._fetch(
            connection,
            sql,
            p1 + p6 + p2 + p3 + p4 + p5,
        )

    def _expand_terms(
        self,
        terms: tuple[str, ...]
    ) -> tuple[str, ...]:

        expanded = []

        for term in terms:
            expanded.append(term)

            for key, values in QUERY_SYNONYMS.items():
                if key in term or term in key:
                    expanded.extend(values)

        return tuple(dict.fromkeys(expanded))
    
def compact_context(records: list[dict[str, Any]], max_chars: int = 6500) -> str:
    compacted = []
    for record in records:
        clean = {}
        for key, value in record.items():
            if value is None:
                continue
            text = str(value)
            if key in {"description", "course_description", "content", "details"}:
                text = re.sub(r"<[^>]+>", " ", text)
                text = re.sub(r"\s+", " ", text).strip()
            limit = 1400 if key in {
                "description", "course_description", "content", "details",
            } else 600
            clean[key] = text[:limit] + ("..." if len(text) > limit else "")
        candidate = json.dumps(
            compacted + [clean],
            ensure_ascii=False,
            default=str,
        )
        if len(candidate) > max_chars:
            break
        compacted.append(clean)
    return json.dumps(compacted, ensure_ascii=False, default=str)
