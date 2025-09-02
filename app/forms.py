
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, SelectMultipleField, IntegerField, SelectField
from wtforms.validators import DataRequired, Length, Email, EqualTo
from wtforms import ValidationError


class LoginForm(FlaskForm):
    username = StringField('Имя пользователя', validators=[DataRequired()])
    password = PasswordField('Пароль', validators=[DataRequired()])
    submit = SubmitField('Войти')


class RegistrationForm(FlaskForm):
    username = StringField('Имя пользователя', validators=[DataRequired(), Length(min=3, max=80)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Пароль', validators=[DataRequired(), Length(min=6)])
    password2 = PasswordField('Повторите пароль', validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField('Зарегистрироваться')

    # ПЕРЕМЕСТИТЕ валидацию в routes или оставьте здесь, но без импорта User
    def validate_username(self, username):
        # Валидация будет выполнена в роуте
        pass

    def validate_email(self, email):
        # Валидация будет выполнена в роуте
        pass


class ScheduleForm(FlaskForm):
    title = StringField('Название расписания', validators=[DataRequired(), Length(max=100)])

    days = SelectMultipleField('Дни недели', choices=[
        ('mon', 'Понедельник'),
        ('tue', 'Вторник'),
        ('wed', 'Среда'),
        ('thu', 'Четверг'),
        ('fri', 'Пятница'),
        ('sat', 'Суббота'),
        ('sun', 'Воскресенье')
    ], validators=[DataRequired()])

    def validate_days(self, field):
        """Валидация выбранных дней недели"""
        valid_days = {'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'}
        for day in field.data:
            if day not in valid_days:
                raise ValidationError(f'Неверный день недели: {day}')

    lessons_per_day = IntegerField('Количество уроков в день', validators=[DataRequired()])
    start_time = StringField('Время первого урока (например, 09:00)', validators=[DataRequired()])
    lesson_duration = IntegerField('Длительность урока (минуты)', validators=[DataRequired()])
    submit = SubmitField('Создать расписание')