from app import create_app, db
from app.models import User, Schedule, Lesson
import sqlite3
from datetime import datetime


def fix_database():
    app = create_app()

    with app.app_context():
        try:
            # Проверяем существование столбцов в таблице user
            conn = sqlite3.connect('app.db')
            cursor = conn.cursor()

            # Проверяем наличие столбцов
            cursor.execute("PRAGMA table_info(user)")
            columns = [column[1] for column in cursor.fetchall()]

            # Добавляем недостающие столбцы
            if 'created_at' not in columns:
                print("Добавляем столбец created_at в таблицу user...")
                cursor.execute("ALTER TABLE user ADD COLUMN created_at DATETIME")

            if 'updated_at' not in columns:
                print("Добавляем столбец updated_at в таблицу user...")
                cursor.execute("ALTER TABLE user ADD COLUMN updated_at DATETIME")

            # Проверяем таблицу schedule
            cursor.execute("PRAGMA table_info(schedule)")
            schedule_columns = [column[1] for column in cursor.fetchall()]

            if 'created_at' not in schedule_columns:
                print("Добавляем столбец created_at в таблицу schedule...")
                cursor.execute("ALTER TABLE schedule ADD COLUMN created_at DATETIME")

            if 'updated_at' not in schedule_columns:
                print("Добавляем столбец updated_at в таблицу schedule...")
                cursor.execute("ALTER TABLE schedule ADD COLUMN updated_at DATETIME")

            # Проверяем таблицу lesson
            cursor.execute("PRAGMA table_info(lesson)")
            lesson_columns = [column[1] for column in cursor.fetchall()]

            if 'created_at' not in lesson_columns:
                print("Добавляем столбец created_at в таблицу lesson...")
                cursor.execute("ALTER TABLE lesson ADD COLUMN created_at DATETIME")

            if 'updated_at' not in lesson_columns:
                print("Добавляем столбец updated_at в таблицу lesson...")
                cursor.execute("ALTER TABLE lesson ADD COLUMN updated_at DATETIME")

            conn.commit()
            print("Столбцы успешно добавлены!")

            # Обновляем существующие записи
            print("Обновляем существующие записи...")
            current_time = datetime.utcnow()

            # Обновляем пользователей
            cursor.execute("UPDATE user SET created_at = ?, updated_at = ? WHERE created_at IS NULL",
                           (current_time, current_time))

            # Обновляем расписания
            cursor.execute("UPDATE schedule SET created_at = ?, updated_at = ? WHERE created_at IS NULL",
                           (current_time, current_time))

            # Обновляем уроки
            cursor.execute("UPDATE lesson SET created_at = ?, updated_at = ? WHERE created_at IS NULL",
                           (current_time, current_time))

            conn.commit()
            print("Данные успешно обновлены!")

        except Exception as e:
            print(f"Ошибка: {e}")
            conn.rollback()
        finally:
            conn.close()


if __name__ == '__main__':
    fix_database()