
// Функции для режима просмотра расписания
document.addEventListener('DOMContentLoaded', function() {
    initViewMode();
});

function initViewMode() {
    // Инициализация кнопок копирования ссылок
    initCopyButtons();

    // Инициализация hover-эффектов
    initHoverEffects();

    console.log('Schedule View initialized');
}

function initCopyButtons() {
    // Добавляем обработчики для всех кнопок копирования
    document.querySelectorAll('.copy-link-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const link = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            copyLinkToClipboard(link);
        });
    });
}

function initHoverEffects() {
    // Добавляем эффекты при наведении на ячейки
    document.querySelectorAll('.lesson-view-cell').forEach(cell => {
        cell.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
            this.style.transform = 'translateY(-2px)';
        });

        cell.addEventListener('mouseleave', function() {
            this.style.boxShadow = '';
            this.style.transform = '';
        });
    });
}

function copyLinkToClipboard(link) {
    navigator.clipboard.writeText(link).then(() => {
        showNotification('Ссылка скопирована в буфер обмена!', 'success');
    }).catch(err => {
        console.error('Copy error:', err);
        showNotification('Ошибка при копировании ссылки', 'error');
    });
}

function showNotification(message, type = 'info', duration = 3000) {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;

    // Стили для уведомления
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;

    document.body.appendChild(notification);

    // Удаляем уведомление через указанное время
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'info': 'fa-info-circle'
    };
    return icons[type] || 'fa-info-circle';
}

function getNotificationColor(type) {
    const colors = {
        'success': '#4CAF50',
        'error': '#f44336',
        'info': '#2196F3'
    };
    return colors[type] || '#2196F3';
}

// Добавляем стили для анимаций
// static/js/schedule-view.js

// Создаем стили для просмотра расписания
const scheduleStyle = document.createElement('style'); // Изменили имя переменной
scheduleStyle.textContent = `
    .schedule-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
    }

    .schedule-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px;
        border-radius: 10px;
        margin-bottom: 20px;
    }

    .schedule-table {
        width: 100%;
        border-collapse: collapse;
        background: white;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .schedule-table th {
        background-color: #f8f9fa;
        padding: 15px;
        text-align: center;
        font-weight: 600;
        border-bottom: 2px solid #dee2e6;
    }

    .schedule-table td {
        padding: 15px;
        border: 1px solid #dee2e6;
        vertical-align: top;
    }

    .time-cell {
        background-color: #f8f9fa;
        font-weight: 500;
        text-align: center;
    }

    .lesson-cell {
        transition: all 0.3s ease;
    }

    .lesson-cell:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .lesson-title {
        font-weight: 600;
        margin-bottom: 5px;
        font-size: 16px;
    }

    .lesson-link {
        color: #007bff;
        text-decoration: none;
        font-size: 14px;
    }

    .lesson-link:hover {
        text-decoration: underline;
    }

    .empty-lesson {
        color: #6c757d;
        font-style: italic;
    }

    @media print {
        .schedule-header {
            background: none;
            color: black;
        }

        .schedule-table {
            box-shadow: none;
        }

        .no-print {
            display: none;
        }
    }

    @media (max-width: 768px) {
        .schedule-table {
            font-size: 14px;
        }

        .schedule-table th,
        .schedule-table td {
            padding: 8px;
        }
    }
`;

// Добавляем стили в документ
document.head.appendChild(scheduleStyle);

// Функции для работы с просмотром расписания
function initScheduleView() {
    console.log('Schedule view initialized');

    // Инициализация tooltips
    const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    if (typeof bootstrap !== 'undefined') {
        [...tooltips].map(el => new bootstrap.Tooltip(el));
    }

    // Обработка кликов по ссылкам
    const lessonLinks = document.querySelectorAll('.lesson-link');
    lessonLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.href && this.href !== '#') {
                // Открываем ссылку в новой вкладке
                window.open(this.href, '_blank');
                e.preventDefault();
            }
        });
    });
}

// Инициализация при загрузке документа
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScheduleView);
} else {
    initScheduleView();
}

// Экспорт функций для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initScheduleView };
}
