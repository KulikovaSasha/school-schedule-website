from flask import Blueprint, render_template, redirect, url_for, flash, request, jsonify
from flask_login import login_required, current_user, logout_user, login_user
from app import db
from app.forms import LoginForm, RegistrationForm, ScheduleForm
from app.models import Schedule, Lesson, User, AVAILABLE_FONTS
import json
from datetime import datetime, timedelta

# Создаем Blueprint с именем 'main'
main = Blueprint('main', __name__)

@main.app_template_filter('count_days')
def count_days_filter(days_json):
    """Фильтр для подсчета дней из JSON строки"""
    try:
        days_list = json.loads(days_json)
        return len(days_list)
    except (json.JSONDecodeError, TypeError):
        return 0

def calculate_lesson_times(start_time, duration_minutes, lessons_count):
    """Рассчитывает время начала и окончания каждого урока"""
    try:
        start = datetime.strptime(start_time, '%H:%M')
        times = []

        for i in range(lessons_count):
            lesson_start = start + timedelta(minutes=duration_minutes * i)
            lesson_end = lesson_start + timedelta(minutes=duration_minutes)
            times.append({
                'start': lesson_start.strftime('%H:%M'),
                'end': lesson_end.strftime('%H:%M')
            })

        return times
    except ValueError:
        # Если формат времени неверный, возвращаем простую нумерацию
        return [{'start': f'Урок {i + 1}', 'end': ''} for i in range(lessons_count)]

def get_day_display_name(day_code):
    """Безопасное получение отображаемого имени дня недели"""
    day_mapping = {
        'mon': 'Понедельник',
        'tue': 'Вторник',
        'wed': 'Среда',
        'thu': 'Четверг',
        'fri': 'Пятница',
        'sat': 'Суббота',
        'sun': 'Воскресенье',
        'san': 'Воскресенье',  # Для старых опечаток
    }

    # Исправляем распространенные опечатки
    corrections = {
        'san': 'sun',
        'sut': 'sat',
        'thus': 'thu',
        'wend': 'wed'
    }

    corrected_code = corrections.get(day_code, day_code)
    return day_mapping.get(corrected_code, f'День ({day_code})')

# Главная страница
@main.route('/')
def index():
    """Главная страница приложения"""
    return render_template('index.html')

# Панель управления пользователя
@main.route('/dashboard')
@login_required
def dashboard():
    """Личный кабинет пользователя со списком расписаний"""
    schedules = Schedule.query.filter_by(user_id=current_user.id).all()

    # Безопасная сортировка с обработкой None значений
    sorted_schedules = sorted(
        schedules,
        key=lambda x: x.created_at if x.created_at is not None else datetime.min,
        reverse=True  # Сначала новые расписания
    )

    return render_template('dashboard.html', schedules=sorted_schedules)

# Создание нового расписания
@main.route('/create-schedule', methods=['GET', 'POST'])
@login_required
def create_schedule():
    """Страница создания нового расписания"""
    form = ScheduleForm()

    if form.validate_on_submit():
        try:
            print(f"DEBUG: Form data - {form.data}")
            print(f"DEBUG: Days of week data - {form.days_of_week.data}, type: {type(form.days_of_week.data)}")

            # ИСПРАВЛЕНИЕ: Правильно обрабатываем строку с днями
            if isinstance(form.days_of_week.data, str):
                # Если это строка с разделителями, преобразуем в список
                if ',' in form.days_of_week.data:
                    days_list = form.days_of_week.data.split(',')
                else:
                    # Если это один день или JSON строка
                    try:
                        # Пробуем распарсить как JSON
                        days_list = json.loads(form.days_of_week.data)
                    except json.JSONDecodeError:
                        # Если не JSON, создаем список из одного элемента
                        days_list = [form.days_of_week.data]
            else:
                # Если это уже список
                days_list = form.days_of_week.data

            # Конвертируем в JSON строку
            days_json = json.dumps(days_list)
            print(f"DEBUG: Days JSON - {days_json}")

            # Создаем новое расписание
            schedule = Schedule(
                title=form.title.data,
                user_id=current_user.id,
                days_of_week=days_json,
                lessons_per_day=form.lessons_per_day.data,
                start_time=form.start_time.data,
                lesson_duration=form.lesson_duration.data
            )

            db.session.add(schedule)
            db.session.commit()

            flash('Расписание успешно создано! Теперь вы можете его заполнить.', 'success')
            return redirect(url_for('main.edit_schedule', schedule_id=schedule.id))

        except Exception as e:
            db.session.rollback()
            print(f"ERROR in create_schedule: {str(e)}")
            import traceback
            traceback.print_exc()
            flash(f'Ошибка при создании расписания: {str(e)}', 'danger')

    return render_template('create_schedule.html', form=form)

@main.route('/schedule/<int:schedule_id>/edit')
@login_required
def edit_schedule(schedule_id):
    """Страница редактирования расписания"""
    schedule = Schedule.query.get_or_404(schedule_id)

    # Проверяем, что пользователь имеет доступ к этому расписанию
    if schedule.user_id != current_user.id:
        flash('У вас нет доступа к этому расписанию.', 'danger')
        return redirect(url_for('main.dashboard'))

    try:
        days_list = json.loads(schedule.days_of_week)
    except (json.JSONDecodeError, TypeError):
        days_list = ['mon', 'tue', 'wed', 'thu', 'fri']

    # Безопасное преобразование кодов дней в читаемые названия
    display_days = [get_day_display_name(day) for day in days_list]

    lesson_times = calculate_lesson_times(
        schedule.start_time,
        schedule.lesson_duration,
        schedule.lessons_per_day
    )

    # Загружаем существующие уроки если они есть
    lessons = {}
    existing_lessons = Lesson.query.filter_by(schedule_id=schedule_id).all()
    for lesson in existing_lessons:
        key = f"{lesson.day_index}_{lesson.lesson_index}"
        lessons[key] = lesson

    return render_template('edit_schedule.html',
                           schedule=schedule,
                           days=display_days,
                           day_codes=days_list,
                           lesson_times=lesson_times,
                           lessons=lessons,
                           available_fonts=AVAILABLE_FONTS)

# Сохранение данных расписания (AJAX)
@main.route('/schedule/<int:schedule_id>/save', methods=['POST'])
@login_required
def save_schedule(schedule_id):
    """API endpoint для сохранения данных расписания"""
    try:
        schedule = Schedule.query.get_or_404(schedule_id)

        # Проверка прав доступа
        if schedule.user_id != current_user.id:
            return jsonify({'success': False, 'error': 'Access denied'}), 403

        data = request.get_json()

        # Удаляем существующие уроки для этого расписания
        Lesson.query.filter_by(schedule_id=schedule_id).delete()

        # Получаем дни недели из расписания, а не из формы
        try:
            days_list = json.loads(schedule.days_of_week)
        except (json.JSONDecodeError, TypeError):
            days_list = ['mon', 'tue', 'wed', 'thu', 'fri']  # Значение по умолчанию

        # Сохраняем новые данные
        for day_index in range(len(days_list)):
            for lesson_index in range(schedule.lessons_per_day):
                key = f"{day_index}_{lesson_index}"
                cell_data = data.get(key, {})

                lesson = Lesson(
                    schedule_id=schedule_id,
                    day_index=day_index,
                    lesson_index=lesson_index,
                    subject_name=cell_data.get('subject', ''),
                    lesson_link=cell_data.get('link', ''),
                    link_text=cell_data.get('link_text', 'Перейти к уроку'),
                    font_family=cell_data.get('font', 'Arial'),
                    color=cell_data.get('color', '#FFFFFF')
                )

                db.session.add(lesson)

        db.session.commit()
        return jsonify({'success': True})

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# Просмотр расписания
@main.route('/schedule/<int:schedule_id>/view')
@login_required
def view_schedule(schedule_id):
    """Страница просмотра готового расписания"""
    schedule = Schedule.query.get_or_404(schedule_id)

    # Проверяем права доступа
    if schedule.user_id != current_user.id:
        flash('У вас нет доступа к этому расписанию.', 'danger')
        return redirect(url_for('main.dashboard'))

    try:
        # ИСПРАВЛЕНО: days_list вместо days_list
        days_list = json.loads(schedule.days_of_week)
    except (json.JSONDecodeError, TypeError):
        days_list = ['mon', 'tue', 'wed', 'thu', 'fri']  # Значение по умолчанию

    # Безопасное преобразование кодов дней
    display_days = [get_day_display_name(day) for day in days_list]

    lesson_times = calculate_lesson_times(
        schedule.start_time,
        schedule.lesson_duration,
        schedule.lessons_per_day
    )

    # Загружаем уроки
    lessons = {}
    existing_lessons = Lesson.query.filter_by(schedule_id=schedule_id).all()
    for lesson in existing_lessons:
        key = f"{lesson.day_index}_{lesson.lesson_index}"
        lessons[key] = lesson

    return render_template('view_schedule.html',
                           schedule=schedule,
                           days=display_days,
                           lesson_times=lesson_times,
                           lessons=lessons)


# Удаление расписания
@main.route('/schedule/<int:schedule_id>/delete', methods=['POST'])
@login_required
def delete_schedule(schedule_id):
    """Удаление расписания"""
    schedule = Schedule.query.get_or_404(schedule_id)

    # Проверяем права доступа
    if schedule.user_id != current_user.id:  # Исправлено: user_id вместо author
        flash('У вас нет доступа к этому расписанию.', 'danger')
        return redirect(url_for('main.dashboard'))

    try:
        # Удаляем связанные уроки
        Lesson.query.filter_by(schedule_id=schedule_id).delete()
        # Удаляем само расписание
        db.session.delete(schedule)
        db.session.commit()

        flash('Расписание успешно удалено.', 'success')
    except Exception as e:
        db.session.rollback()
        flash(f'Ошибка при удалении расписания: {str(e)}', 'danger')

    return redirect(url_for('main.dashboard'))

# Вход в систему
@main.route('/login', methods=['GET', 'POST'])
def login():
    """Вход в систему"""
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user and user.check_password(form.password.data):
            login_user(user)
            flash('Вы успешно вошли в систему!', 'success')
            return redirect(url_for('main.dashboard'))
        else:
            flash('Неверное имя пользователя или пароль.', 'danger')
    return render_template('login.html', form=form)

# Регистрация
@main.route('/register', methods=['GET', 'POST'])
def register():
    """Регистрация нового пользователя"""
    form = RegistrationForm()
    if form.validate_on_submit():
        # Валидация username
        if User.query.filter_by(username=form.username.data).first():
            flash('Это имя пользователя уже занято.', 'danger')
            return render_template('register.html', form=form)

        # Валидация email
        if User.query.filter_by(email=form.email.data).first():
            flash('Этот email уже используется.', 'danger')
            return render_template('register.html', form=form)

        # Создание пользователя
        user = User(username=form.username.data, email=form.email.data)
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.commit()

        flash('Регистрация прошла успешно! Теперь вы можете войти.', 'success')
        return redirect(url_for('main.login'))

    return render_template('register.html', form=form)

# Выход из системы
@main.route('/logout')
@login_required
def logout():
    """Выход из системы"""
    logout_user()
    flash('Вы вышли из системы.', 'info')
    return redirect(url_for('main.index'))

# Страница профиля
@main.route('/profile')
@login_required
def profile():
    """Страница профиля пользователя"""
    return render_template('profile.html', user=current_user)

# О программе
@main.route('/about')
def about():
    """Страница о программе"""
    return render_template('about.html')

# Помощь
@main.route('/help')
def help():
    """Страница помощи"""
    return render_template('help.html')

# Контакты
@main.route('/contact')
def contact():
    """Страница контактов"""
    return render_template('contact.html')

# Обработчик ошибки 404
@main.app_errorhandler(404)
def not_found_error(error):
    return render_template('404.html'), 404

# Обработчик ошибки 500
@main.app_errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return render_template('500.html'), 500

# Health check
@main.route('/health')
def health_check():
    """Проверка работоспособности приложения"""
    return jsonify({
        'status': 'ok',
        'message': 'Application is running',
        'timestamp': datetime.now().isoformat()
    })

# Дополнительные маршруты для будущего использования
@main.route('/export-pdf/<int:schedule_id>')
@login_required
def export_pdf(schedule_id):
    """Экспорт в PDF (заглушка)"""
    flash('Функция экспорта в PDF будет реализована в ближайшее время.', 'info')
    return redirect(url_for('main.view_schedule', schedule_id=schedule_id))

@main.route('/sync-google/<int:schedule_id>')
@login_required
def sync_google_calendar(schedule_id):
    """Синхронизация с Google Calendar (заглушка)"""
    flash('Функция синхронизации с Google Calendar будет реализована в ближайшее время.', 'info')
    return redirect(url_for('main.view_schedule', schedule_id=schedule_id))

# Функция для исправления старых данных
@main.route('/fix-old-data')
@login_required
def fix_old_data():
    """Исправление старых данных с опечаткой 'san'"""
    if current_user.username != 'admin':
        flash('Доступ запрещен.', 'danger')
        return redirect(url_for('main.dashboard'))

    try:
        schedules = Schedule.query.all()
        fixed_count = 0

        for schedule in schedules:
            days_list = json.loads(schedule.days_of_week)

            if 'san' in days_list:
                corrected_days = ['sun' if day == 'san' else day for day in days_list]
                schedule.days_of_week = json.dumps(corrected_days)
                fixed_count += 1

        db.session.commit()
        flash(f'Исправлено расписаний: {fixed_count}', 'success')

    except Exception as e:
        db.session.rollback()
        flash(f'Ошибка при исправлении данных: {str(e)}', 'danger')

    return redirect(url_for('main.dashboard'))