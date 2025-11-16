import os
import django
from django.conf import settings

# Настройка Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from django.db import connection

try:
    with connection.cursor() as cursor:
        cursor.execute("SHOW TABLES;")
        tables = cursor.fetchall()
        print("Успешное подключение к БД!")
        print(f"Найдено таблиц: {len(tables)}")
        for table in tables:
            print(f"Таблица: {table[0]}")
except Exception as e:
    print(f"Ошибка подключения: {e}")