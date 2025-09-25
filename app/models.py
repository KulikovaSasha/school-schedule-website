from app import db, login_manager
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import json


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    schedules = db.relationship('Schedule', backref='author', lazy=True, cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.username}>'


class Schedule(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    days_of_week = db.Column(db.String(200))
    start_time = db.Column(db.String(5))
    end_time = db.Column(db.String(5))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    lessons = db.relationship('Lesson', backref='schedule', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Schedule {self.title}>'

    @property
    def days_count(self):
        """Возвращает количество дней в расписании"""
        if self.days_of_week:
            try:
                days_list = json.loads(self.days_of_week)
                return len(days_list)
            except (json.JSONDecodeError, TypeError):
                return 0
        return 0

    @property
    def lessons_per_day(self):
        """Автоматически рассчитывает количество уроков в день (фиксированная длительность 60 минут)"""
        # Проверка на None
        if not self.start_time or not self.end_time:
            print(
                f"⚠️ WARNING: start_time or end_time is None. start_time: {self.start_time}, end_time: {self.end_time}")
            return 6  # Значение по умолчанию

        try:
            start = datetime.strptime(self.start_time, '%H:%M')
            end = datetime.strptime(self.end_time, '%H:%M')

            # Расчет разницы в минутах
            total_minutes = (end - start).total_seconds() / 60

            # Количество уроков по 60 минут каждый - ОКРУГЛЯЕМ В БОЛЬШУЮ СТОРОНУ
            lessons_count = int((total_minutes + 59) // 60)  # Округляем вверх

            return max(1, lessons_count)  # Минимум 1 урок
        except ValueError as e:
            print(f"❌ ERROR in lessons_per_day calculation: {e}")
            print(f"🔍 DEBUG: start_time: {self.start_time}, end_time: {self.end_time}")
            return 6  # Значение по умолчанию при ошибке

    @property
    def lesson_duration(self):
        """Фиксированная длительность урока - 60 минут"""
        return 60

    @property
    def created_at_display(self):
        """Форматированная дата создания"""
        if self.created_at:
            return self.created_at.strftime('%d.%m.%Y %H:%M')
        return 'Не указана'

    @property
    def updated_at_display(self):
        """Форматированная дата обновления"""
        if self.updated_at:
            return self.updated_at.strftime('%d.%m.%Y %H:%M')
        return 'Не указана'


class Lesson(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    schedule_id = db.Column(db.Integer, db.ForeignKey('schedule.id'), nullable=False)
    day_index = db.Column(db.Integer)
    lesson_index = db.Column(db.Integer)
    subject_name = db.Column(db.String(100))
    color = db.Column(db.String(7), default='#FFFFFF')
    font_family = db.Column(db.String(50), default='Bookman Old Style')
    lesson_link = db.Column(db.String(500))
    link_text = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<Lesson {self.subject_name}>'

    @property
    def font_family_safe(self):
        """Безопасное значение font-family для CSS"""
        if self.font_family and self.font_family in [font['value'] for font in AVAILABLE_FONTS]:
            return f"'{self.font_family}'"
        return "'Bookman Old Style'"


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


# Константы для использования в формах и шаблонах
AVAILABLE_FONTS = [
    {'value': 'Arial', 'name': 'Arial', 'category': 'Без засечек'},
    {'value': 'Helvetica', 'name': 'Helvetica', 'category': 'Без засечек'},
    {'value': 'Times New Roman', 'name': 'Times New Roman', 'category': 'С засечками'},
    {'value': 'Georgia', 'name': 'Georgia', 'category': 'С засечками'},
    {'value': 'Courier New', 'name': 'Courier New', 'category': 'Моноширинный'},
    {'value': 'Verdana', 'name': 'Verdana', 'category': 'Без засечек'},
    {'value': 'Tahoma', 'name': 'Tahoma', 'category': 'Без засечек'},
    {'value': 'Comic Sans MS', 'name': 'Comic Sans MS', 'category': 'Рукописный'},
    {'value': 'Trebuchet MS', 'name': 'Trebuchet MS', 'category': 'Без засечек'},
    {'value': 'Bookman Old Style', 'name': 'Bookman Old Style', 'category': 'Без засечек'},
    {'value': 'Impact', 'name': 'Impact', 'category': 'Без засечек'},
    {'value': 'Palatino Linotype', 'name': 'Palatino', 'category': 'С засечками'},
    {'value': 'Garamond', 'name': 'Garamond', 'category': 'С засечками'},
    {'value': 'Lucida Sans Unicode', 'name': 'Lucida Sans', 'category': 'Без засечек'},
    {'value': 'MS Sans Serif', 'name': 'MS Sans Serif', 'category': 'Без засечек'},
    {'value': 'MS Serif', 'name': 'MS Serif', 'category': 'С засечками'},
    {'value': 'Symbol', 'name': 'Symbol', 'category': 'Декоративный'},
    {'value': 'Webdings', 'name': 'Webdings', 'category': 'Декоративный'},
    {'value': 'Wingdings', 'name': 'Wingdings', 'category': 'Декоративный'},
    {'value': 'System', 'name': 'Системный шрифт', 'category': 'Системный'}
]

COLOR_PALETTE = {
    'yellow': '#FFF9C4',
    'green': '#C8E6C9',
    'blue': '#B3E5FC',
    'purple': '#E1BEE7',
    'orange': '#FFE0B2',
    'pink': '#FFCDD2',
    'lilac': '#D1C4E9',
    'red': '#FFEBEE',
    'cyan': '#B2EBF2',
    'teal': '#B2DFDB'
}

DAY_NAMES = {
    'mon': 'Понедельник',
    'tue': 'Вторник',
    'wed': 'Среда',
    'thu': 'Четверг',
    'fri': 'Пятница',
    'sat': 'Суббота',
    'sun': 'Воскресенье'
}
