from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_migrate import Migrate
from flask_wtf.csrf import CSRFProtect
from datetime import timedelta
import os
import json

# Инициализация расширений
db = SQLAlchemy()
login_manager = LoginManager()
migrate = Migrate()
csrf = CSRFProtect()  # CSRF защита

def create_app():
    # Создание экземпляра приложения
    app = Flask(__name__, template_folder='../templates', static_folder='../static')

    # Базовая конфигурация
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY') or 'your-super-secret-key-here-123'
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL') or 'sqlite:///app.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Конфигурация CSRF защиты
    app.config['WTF_CSRF_ENABLED'] = True
    app.config['WTF_CSRF_SECRET_KEY'] = os.environ.get('CSRF_SECRET_KEY') or 'csrf-super-secret-key-456'
    app.config['WTF_CSRF_TIME_LIMIT'] = 3600  # 1 час в секундах

    # Конфигурация сессии
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SECURE'] = False  # True для production с HTTPS
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

    # Инициализация расширений с приложением
    db.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    login_manager.login_message = 'Пожалуйста, войдите для доступа к этой странице.'
    login_manager.login_message_category = 'info'
    migrate.init_app(app, db)
    csrf.init_app(app)  # Инициализация CSRF защиты

    # Регистрация blueprint'ов
    register_blueprints(app)

    # Регистрация обработчиков ошибок
    register_error_handlers(app)

    # Создание контекста shell
    register_shell_context(app)

    @app.template_filter('from_json')
    def from_json_filter(value):
        """Фильтр для преобразования JSON строки в объект Python"""
        try:
            return json.loads(value)
        except (TypeError, json.JSONDecodeError):
            return []

    @app.template_filter('to_json')
    def to_json_filter(value):
        """Фильтр для преобразования объекта Python в JSON строку"""
        return json.dumps(value, ensure_ascii=False)

    return app


def register_blueprints(app):
    """Регистрация всех blueprint'ов приложения"""
    from app.routes import main
    from app.auth import auth_bp

    app.register_blueprint(main)
    app.register_blueprint(auth_bp)


def register_error_handlers(app):
    """Регистрация обработчиков ошибок"""
    from flask import render_template

    @app.errorhandler(404)
    def not_found_error(error):
        return render_template('404.html'), 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return render_template('500.html'), 500

    @app.errorhandler(403)
    def forbidden_error(error):
        return render_template('403.html'), 403

    @app.errorhandler(401)
    def unauthorized_error(error):
        return redirect(url_for('auth.login'))


def register_shell_context(app):
    """Регистрация контекста для Flask shell"""
    from app.models import User, Schedule, Lesson

    @app.shell_context_processor
    def make_shell_context():
        return {
            'db': db,
            'User': User,
            'Schedule': Schedule,
            'Lesson': Lesson,
            'app': app
        }