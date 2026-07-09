import sys
import time

sys.path.insert(0, r"D:\Voice_final_3\voice-assistant-main")

import pyodbc
import qwen_server


started = time.perf_counter()
connection = pyodbc.connect(qwen_server.DB_CONN, timeout=10)
print("connect_ms", round((time.perf_counter() - started) * 1000))

cursor = connection.cursor()
cursor.execute(
    """
    SELECT TABLE_NAME, COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME IN (
        'Users', 'Courses', 'Groups', 'TeacherResumes',
        'Events', 'News', 'Articles', 'Books'
    )
    ORDER BY TABLE_NAME, ORDINAL_POSITION
    """
)
for table, column in cursor.fetchall():
    print(f"{table}.{column}")

connection.close()
