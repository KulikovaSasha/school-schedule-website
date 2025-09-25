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


def calculate_lesson_times(start_time, end_time):
    """Рассчитывает время начала и окончания каждого урока (фиксированная длительность 60 минут)"""
    try:
        # Проверка на None
        if not start_time or not end_time:
            print(f"⚠️ WARNING: start_time or end_time is None. start_time: {start_time}, end_time: {end_time}")
            # Возвращаем значения по умолчанию
            return [{'start': f'Урок {i + 1}', 'end': ''} for i in range(6)]

        start = datetime.strptime(start_time, '%H:%M')
        end = datetime.strptime(end_time, '%H:%M')

        # Расчет общего времени в минутах
        total_minutes = (end - start).total_seconds() / 60

        # Количество уроков по 60 минут каждый - ОКРУГЛЯЕМ В БОЛЬШУЮ СТОРОНУ
        lessons_count = int((total_minutes + 59) // 60)  # Округляем вверх
        lessons_count = max(1, lessons_count)  # Минимум 1 урок

        times = []
        for i in range(lessons_count):
            lesson_start = start + timedelta(minutes=60 * i)  # Фиксированная длительность 60 минут
            lesson_end = lesson_start + timedelta(minutes=60)  # Фиксированная длительность 60 минут
            times.append({
                'start': lesson_start.strftime('%H:%M'),
                'end': lesson_end.strftime('%H:%M')
            })

        return times
    except ValueError as e:
        print(f"❌ ERROR in calculate_lesson_times: {e}")
        print(f"🔍 DEBUG: start_time: {start_time}, end_time: {end_time}")
        # Если формат времени неверный, возвращаем простую нумерацию
        return [{'start': f'Урок {i + 1}', 'end': ''} for i in range(6)]


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
        'san': 'Воскресенье',
    }

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
        reverse=True
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

            # Проверка времени (без всплывающих окон)
            start_time = form.start_time.data
            end_time = form.end_time.data

            if start_time and end_time:
                try:
                    start = datetime.strptime(start_time, '%H:%M')
                    end = datetime.strptime(end_time, '%H:%M')

                    if end <= start:
                        flash('Время окончания должно быть позже времени начала!', 'danger')
                        return render_template('create_schedule.html', form=form)
                except ValueError as e:
                    flash('Неверный формат времени! Используйте формат ЧЧ:MM', 'danger')
                    return render_template('create_schedule.html', form=form)

            # Обработка дней недели
            if isinstance(form.days_of_week.data, str):
                if ',' in form.days_of_week.data:
                    days_list = form.days_of_week.data.split(',')
                else:
                    try:
                        days_list = json.loads(form.days_of_week.data)
                    except json.JSONDecodeError:
                        days_list = [form.days_of_week.data]
            else:
                days_list = form.days_of_week.data

            # Конвертируем в JSON строку
            days_json = json.dumps(days_list)
            print(f"DEBUG: Days JSON - {days_json}")

            # Создаем новое расписание
            schedule = Schedule(
                title=form.title.data,
                user_id=current_user.id,
                days_of_week=days_json,
                start_time=form.start_time.data,
                end_time=form.end_time.data
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

    # Используем новую функцию с временем окончания
    lesson_times = calculate_lesson_times(schedule.start_time, schedule.end_time)

    # Загружаем существующие уроки если они есть и преобразуем в словари
    lessons = {}
    existing_lessons = Lesson.query.filter_by(schedule_id=schedule_id).all()
    for lesson in existing_lessons:
        key = f"{lesson.day_index}_{lesson.lesson_index}"
        lessons[key] = {
            'subject_name': lesson.subject_name,
            'color': lesson.color,
            'lesson_link': lesson.lesson_link,
            'link_text': lesson.link_text,
            'font_family': lesson.font_family
        }

    # Список доступных предметов для красивого выбора
    available_subjects = [
        "Алгебра", "Английский язык", "Астрономия", "Биология", "География",
        "Геометрия", "ИЗО", "Информатика", "Испанский язык", "История",
        "Литература", "Литературное чтение", "Математика", "Музыка",
        "Немецкий язык", "Обществознание", "Окружающий мир", "Программирование",
        "Программирование в Python", "Разработка сайтов в Python", "Русский язык",
        "Теория вероятностей и статистика", "Технология", "Физика",
        "Физическая культура", "Химия", "Черчение", "Японский язык"
    ]

    # Популярные цвета для уроков
    popular_colors = [
        "#d6d4fb", "#fcbfe7", "#ffffff", "#caf2c0", "#f5d5fb", "#fbffbd", "#a5e1f7"
    ]

    return render_template('edit_schedule.html',
                           schedule=schedule,
                           days=display_days,
                           day_codes=days_list,
                           lesson_times=lesson_times,
                           lessons=lessons,
                           available_subjects=available_subjects,
                           popular_colors=popular_colors,
                           available_fonts=AVAILABLE_FONTS)


@main.route('/schedule/<int:schedule_id>/save', methods=['POST'])
@login_required
def save_schedule(schedule_id):
    print(f"🔍 DEBUG: Save request received for schedule {schedule_id}")

    try:
        schedule = Schedule.query.get_or_404(schedule_id)
        print(f"🔍 DEBUG: Schedule found: {schedule.title}")

        # Проверка прав доступа
        if schedule.user_id != current_user.id:
            return jsonify({'success': False, 'error': 'Access denied'}), 403

        data = request.get_json()
        print(f"🔍 DEBUG: Received data: {data}")

        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400

        # Удаляем существующие уроки
        Lesson.query.filter_by(schedule_id=schedule_id).delete()

        # Получаем дни недели из расписания
        try:
            days_list = json.loads(schedule.days_of_week)
        except (json.JSONDecodeError, TypeError):
            days_list = ['mon', 'tue', 'wed', 'thu', 'fri']

        # Сохраняем новые уроки
        new_lessons_count = 0
        for key, lesson_data in data.items():
            if '_' in key:
                try:
                    day_index, lesson_index = map(int, key.split('_'))

                    # Используем автоматически рассчитанное количество уроков
                    if (0 <= day_index < len(days_list) and
                            0 <= lesson_index < schedule.lessons_per_day):
                        font_family = lesson_data.get('font_family', 'Bookman Old Style')
                        print(f"🔍 DEBUG: Saving lesson {key} with font: '{font_family}'")

                        lesson = Lesson(
                            schedule_id=schedule_id,
                            day_index=day_index,
                            lesson_index=lesson_index,
                            subject_name=lesson_data.get('subject_name', ''),
                            color=lesson_data.get('color', '#FFFFFF'),
                            lesson_link=lesson_data.get('lesson_link', ''),
                            link_text=lesson_data.get('link_text', ''),
                            font_family=font_family
                        )
                        db.session.add(lesson)
                        new_lessons_count += 1

                except (ValueError, TypeError) as e:
                    print(f"🔍 DEBUG: Error processing key {key}: {e}")
                    continue

        db.session.commit()
        print(f"🔍 DEBUG: Successfully saved {new_lessons_count} lessons")
        return jsonify({'success': True, 'message': f'Сохранено {new_lessons_count} уроков'})

    except Exception as e:
        db.session.rollback()
        print(f"❌ ERROR in save_schedule: {str(e)}")
        import traceback
        traceback.print_exc()
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
        days_list = json.loads(schedule.days_of_week)
    except (json.JSONDecodeError, TypeError):
        days_list = ['mon', 'tue', 'wed', 'thu', 'fri']

    # Безопасное преобразование кодов дней
    display_days = [get_day_display_name(day) for day in days_list]

    # Используем новую функцию с временем окончания
    lesson_times = calculate_lesson_times(schedule.start_time, schedule.end_time)

    # Загружаем уроки и преобразуем в словари
    lessons = {}
    existing_lessons = Lesson.query.filter_by(schedule_id=schedule_id).all()
    for lesson in existing_lessons:
        key = f"{lesson.day_index}_{lesson.lesson_index}"
        lessons[key] = {
            'subject_name': lesson.subject_name,
            'color': lesson.color,
            'lesson_link': lesson.lesson_link,
            'link_text': lesson.link_text,
            'font_family': lesson.font_family
        }

    current_time = datetime.now().strftime("%d.%m.%Y %H:%M")

    return render_template('view_schedule.html',
                           schedule=schedule,
                           days=display_days,
                           lesson_times=lesson_times,
                           lessons=lessons,
                           current_time=current_time)


# (login, register, logout, profile, about, help, contact, error handlers и т.д.)

# Удаление расписания - ДОБАВЬТЕ ЭТОТ МАРШРУТ
@main.route('/schedule/<int:schedule_id>/delete', methods=['POST'])
@login_required
def delete_schedule(schedule_id):
    """Удаление расписания"""
    schedule = Schedule.query.get_or_404(schedule_id)

    # Проверяем права доступа
    if schedule.user_id != current_user.id:
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

@main.route('/logout')
@login_required
def logout():
    """Выход из системы"""
    logout_user()
    flash('Вы вышли из системы.', 'info')
    return redirect(url_for('main.index'))


# ... остальной код маршрутов


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


@main.route('/profile')
@login_required
def user_profile():
    """Страница профиля пользователя"""
    try:
        print(f"DEBUG: Loading profile for user {current_user.id}")

        # Получаем статистику пользователя
        schedules_count = Schedule.query.filter_by(user_id=current_user.id).count()
        print(f"DEBUG: Schedules count: {schedules_count}")

        # Считаем общее количество уроков
        total_lessons = 0
        user_schedules = Schedule.query.filter_by(user_id=current_user.id).all()

        for schedule in user_schedules:
            try:
                days_list = json.loads(schedule.days_of_week)
                total_lessons += schedule.lessons_per_day * len(days_list)
            except (json.JSONDecodeError, TypeError) as e:
                print(f"DEBUG: Error parsing days for schedule {schedule.id}: {e}")
                total_lessons += schedule.lessons_per_day * 5

        print(f"DEBUG: Total lessons: {total_lessons}")

        return render_template('profile.html',
                               schedules_count=schedules_count,
                               total_lessons=total_lessons)

    except Exception as e:
        print(f"ERROR in user_profile: {str(e)}")
        import traceback
        traceback.print_exc()
        flash('Ошибка при загрузке профиля', 'error')
        return redirect(url_for('main.dashboard'))


@main.route('/change-password', methods=['POST'])
@login_required
def change_password():
    """Смена пароля пользователя"""
    try:
        current_password = request.form.get('current_password')
        new_password = request.form.get('new_password')
        confirm_password = request.form.get('confirm_password')

        if not all([current_password, new_password, confirm_password]):
            flash('Все поля обязательны для заполнения', 'danger')
            return redirect(url_for('main.user_profile'))

        if new_password != confirm_password:
            flash('Пароли не совпадают', 'danger')
            return redirect(url_for('main.user_profile'))

        if len(new_password) < 6:
            flash('Пароль должен содержать минимум 6 символов', 'danger')
            return redirect(url_for('main.user_profile'))

        # Проверяем текущий пароль
        if not current_user.check_password(current_password):
            flash('Неверный текущий пароль', 'danger')
            return redirect(url_for('main.user_profile'))

        # Устанавливаем новый пароль
        current_user.set_password(new_password)
        db.session.commit()

        flash('Пароль успешно изменен', 'success')
        return redirect(url_for('main.user_profile'))

    except Exception as e:
        db.session.rollback()
        flash('Ошибка при изменении пароля', 'error')
        return redirect(url_for('main.user_profile'))


@main.route('/schedule/<int:schedule_id>/update_title', methods=['POST'])
@login_required
def update_schedule_title(schedule_id):
    """Обновление названия расписания"""
    try:
        schedule = Schedule.query.get_or_404(schedule_id)

        # Проверка прав доступа
        if schedule.user_id != current_user.id:
            return jsonify({'success': False, 'error': 'Доступ запрещен'}), 403

        data = request.get_json()
        new_title = data.get('title', '').strip()

        if not new_title:
            return jsonify({'success': False, 'error': 'Название не может быть пустым'}), 400

        if len(new_title) > 100:
            return jsonify({'success': False, 'error': 'Название слишком длинное'}), 400

        schedule.title = new_title
        db.session.commit()

        return jsonify({'success': True, 'message': 'Название сохранено'})

    except Exception as e:
        db.session.rollback()
        print(f"ERROR in update_schedule_title: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500