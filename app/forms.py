from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, SelectMultipleField, IntegerField, SelectField
from wtforms.validators import DataRequired, Length, Email, EqualTo
from wtforms import SelectMultipleField, widgets
from datetime import datetime
from app.models import User


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

    def validate_username(self, username):
        pass

    def validate_email(self, email):
        pass

class MultiCheckboxField(SelectMultipleField):
    widget = widgets.ListWidget(prefix_label=False)
    option_widget = widgets.CheckboxInput()


class ScheduleForm(FlaskForm):
    title = StringField('Название расписания',
                        validators=[DataRequired(), Length(max=100)])

    days_of_week = MultiCheckboxField('Дни недели',
                                      choices=[
                                          ('mon', 'Понедельник'),
                                          ('tue', 'Вторник'),
                                          ('wed', 'Среда'),
                                          ('thu', 'Четверг'),
                                          ('fri', 'Пятница'),
                                          ('sat', 'Суббота'),
                                          ('sun', 'Воскресенье')
                                      ],
                                      validators=[DataRequired()],
                                      default=['mon', 'tue', 'wed', 'thu', 'fri'])

    def validate_days(self, field):
        """Валидация выбранных дней недели"""
        valid_days = {'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'}
        for day in field.data:
            if day not in valid_days:
                raise ValidationError(f'Неверный день недели: {day}')

    # Убрано поле lessons_per_day
    start_time = SelectField('Время начала', choices=[], validators=[DataRequired()])
    end_time = SelectField('Время окончания', choices=[], validators=[DataRequired()])  # Добавлено поле окончания
    submit = SubmitField('Создать расписание')

    def __init__(self, *args, **kwargs):
        super(ScheduleForm, self).__init__(*args, **kwargs)
        # Заполняем варианты времени
        self.start_time.choices = self.get_time_choices()
        self.end_time.choices = self.get_time_choices()  # Добавлено для окончания

    def get_time_choices(self):
        """Возвращает список времени с 8:00 до 20:45 с интервалом 5 минут"""
        times = []
        for hour in range(8, 21):
            for minute in [0,5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]:
                time_str = f"{hour:02d}:{minute:02d}"
                times.append((time_str, time_str))
        return times