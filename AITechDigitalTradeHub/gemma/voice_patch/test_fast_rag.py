import unittest
from unittest.mock import Mock, patch

from fast_rag import FastAcademyRAG, normalize_persian
import qwen_server


class RouterTests(unittest.TestCase):
    def setUp(self):
        self.rag = FastAcademyRAG("unused")

    def test_normalizes_persian_characters(self):
        self.assertEqual(normalize_persian("كلاس يادگيري"), "کلاس یادگیری")

    def test_routes_course_fee(self):
        intent = self.rag.classify("شهریه دوره پایتون چقدر است؟")
        self.assertEqual(intent.name, "course")
        self.assertIn("پایتون", intent.terms)

    def test_routes_latest_event(self):
        intent = self.rag.classify("آخرین رویداد آیتک چیست؟")
        self.assertEqual(intent.name, "event")
        self.assertTrue(intent.latest)

    def test_routes_teacher(self):
        self.assertEqual(
            self.rag.classify("مدرس دوره هوش مصنوعی کیست؟").name,
            "teacher",
        )

    def test_search_requires_every_meaningful_term(self):
        clause, params = self.rag._search_clause(
            ("پایتون", "پیشرفته"),
            ("c.Title", "g.Name"),
        )
        self.assertIn(" AND ", clause)
        self.assertEqual(params.count("%پایتون%"), 2)
        self.assertEqual(params.count("%پیشرفته%"), 2)


class ServerTests(unittest.TestCase):
    def test_direct_contact_answer_avoids_model(self):
        with patch.object(qwen_server, "call_gemma") as call:
            response = qwen_server.chat(
                qwen_server.ChatRequest(
                    messages=[{"role": "user", "content": "شماره تماس آیتک چنده؟"}]
                )
            )
        call.assert_not_called()
        self.assertIn("03136671590", response["choices"][0]["message"]["content"])

    def test_course_list_can_answer_without_model(self):
        fake_payload = {
            "choices": [{"message": {"role": "assistant", "content": "پاسخ"}}]
        }
        with (
            patch.object(
                qwen_server.rag,
                "retrieve",
                return_value={
                    "intent": "course",
                    "records": [{"course_title": "پایتون"}],
                    "cache_hit": False,
                    "retrieval_ms": 12,
                },
            ),
            patch.object(
                qwen_server,
                "call_gemma",
                return_value=fake_payload,
            ) as call,
        ):
            response = qwen_server.chat(
                qwen_server.ChatRequest(
                    messages=[{"role": "user", "content": "دوره پایتون دارید؟"}]
                )
            )
        call.assert_not_called()
        self.assertIn(
            "پایتون",
            response["choices"][0]["message"]["content"],
        )

    def test_syllabus_question_keeps_database_context_for_model(self):
        retrieval = {
            "intent": "course",
            "records": [{
                "course_title": "پایتون پیشرفته",
                "course_description": "فصل اول: ساخت API با FastAPI",
            }],
            "cache_hit": False,
            "retrieval_ms": 12,
        }
        self.assertIsNone(
            qwen_server.format_retrieval_answer(
                "سرفصل دوره پایتون پیشرفته چیست؟",
                retrieval,
            )
        )

    def test_json_knowledge_is_loaded(self):
        self.assertTrue(qwen_server.KNOWLEDGE_DOCUMENTS)
        self.assertIn(
            "توانمندسازی",
            qwen_server.direct_answer("ماموریت آیتک چیست؟"),
        )
        self.assertIn(
            "مدیر فنی",
            qwen_server.direct_answer("مهندس ناصر عباسی چه سمتی دارد؟"),
        )


if __name__ == "__main__":
    unittest.main()
