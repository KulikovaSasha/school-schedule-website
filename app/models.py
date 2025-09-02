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
    lessons_per_day = db.Column(db.Integer)
    start_time = db.Column(db.String(5))
    lesson_duration = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    lessons = db.relationship('Lesson', backref='schedule', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Schedule {self.title}>'

    @property
    def days_count(self):
        """Возвращает количество дней в расписании"""
        if self.days_of_week:
            return len(json.loads(self.days_of_week))
        return 0

    @property
    def created_at_display(self):
        """Форматированная дата создания"""
        return self.created_at.strftime('%d.%m.%Y %H:%M')

    @property
    def updated_at_display(self):
        """Форматированная дата обновления"""
        return self.updated_at.strftime('%d.%m.%Y %H:%M')


class Lesson(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    schedule_id = db.Column(db.Integer, db.ForeignKey('schedule.id'), nullable=False)
    day_index = db.Column(db.Integer)
    lesson_index = db.Column(db.Integer)
    subject_name = db.Column(db.String(100))
    color = db.Column(db.String(7), default='#FFFFFF')
    font_family = db.Column(db.String(50), default='Arial')
    lesson_link = db.Column(db.String(500))
    link_text = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<Lesson {self.subject_name}>'


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
    {'value': 'Impact', 'name': 'Impact', 'category': 'Без засечек'}
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