
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
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }

    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }

    .notification {
        animation: slideIn 0.3s ease;
    }
`;
document.head.appendChild(style);

