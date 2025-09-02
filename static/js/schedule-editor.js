
// Основной модуль редактора расписания
class ScheduleEditor {
    constructor() {
        this.currentCell = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupColorPickers();
        this.setupFontSelectors();
        this.setupLinkPreviews();
        console.log('Schedule Editor initialized');
    }

    setupEventListeners() {
        // Обработчик сохранения
        const saveBtn = document.getElementById('save-schedule');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveSchedule());
        }

        // Обработчики для ячеек
        document.querySelectorAll('.lesson-cell').forEach(cell => {
            cell.addEventListener('mouseenter', () => this.handleCellHover(cell));
            cell.addEventListener('click', () => this.handleCellClick(cell));
        });

        // Глобальные обработчики
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    setupColorPickers() {
        document.querySelectorAll('.color-picker').forEach(picker => {
            picker.addEventListener('change', (e) => {
                const cell = e.target.closest('.lesson-cell');
                cell.style.backgroundColor = e.target.value;
                this.updateCellState(cell, 'has-color', true);
            });
        });
    }

    setupFontSelectors() {
        document.querySelectorAll('.font-selector').forEach(select => {
            select.addEventListener('change', (e) => {
                const input = e.target.closest('.lesson-controls').querySelector('.subject-input');
                input.style.fontFamily = e.target.value;
            });
        });
    }

    setupLinkPreviews() {
        document.querySelectorAll('.lesson-link-input').forEach(input => {
            input.addEventListener('blur', (e) => {
                this.validateAndFormatLink(e.target);
                this.toggleLinkIndicator(e.target);
            });

            input.addEventListener('focus', (e) => {
                this.showPlatformModalIfEmpty(e.target);
            });
        });
    }

    validateAndFormatLink(input) {
        let link = input.value.trim();
        if (!link) return;

        // Добавляем https:// если нет протокола
        if (!link.startsWith('http://') && !link.startsWith('https://')) {
            link = 'https://' + link;
        }

        // Проверяем валидность URL
        try {
            new URL(link);
            input.value = link;
            input.classList.remove('error');
        } catch (e) {
            input.classList.add('error');
            this.showNotification('Пожалуйста, введите корректную ссылку', 'error');
        }
    }

    toggleLinkIndicator(input) {
        const cell = input.closest('.lesson-cell');
        if (input.value) {
            cell.classList.add('has-link');
        } else {
            cell.classList.remove('has-link');
        }
    }

    showPlatformModalIfEmpty(input) {
        if (!input.value) {
            this.openPlatformModal(input);
        }
    }

    openPlatformModal(contextInput) {
        this.currentCell = contextInput.closest('.lesson-cell');
        const modal = document.getElementById('platformModal');
        modal.style.display = 'block';
        modal.setAttribute('data-context', 'link-input');
    }

    closePlatformModal() {
        const modal = document.getElementById('platformModal');
        modal.style.display = 'none';
        this.currentCell = null;
    }

    insertPlatformLink(platform, platformName) {
        if (!this.currentCell) return;

        const linkInput = this.currentCell.querySelector('.lesson-link-input');
        const textInput = this.currentCell.querySelector('.link-text-input');

        const links = {
            'zoom': 'https://zoom.us/j/ВАШ_ID_КОМНАТЫ',
            'google_meet': 'https://meet.google.com/abc-def-ghi',
            'microsoft_teams': 'https://teams.microsoft.com/l/meetup-join/ВАША_ССЫЛКА',
            'discord': 'https://discord.gg/ВАША_ССЫЛКА',
            'skype': 'skype:ВАШ_ЛОГИН?call',
            'youtube': 'https://youtube.com/ВАШ_КАНАЛ'
        };

        const texts = {
            'zoom': 'Присоединиться к Zoom',
            'google_meet': 'Присоединиться к Google Meet',
            'microsoft_teams': 'Присоединиться к Teams',
            'discord': 'Присоединиться к Discord',
            'skype': 'Позвонить в Skype',
            'youtube': 'Смотреть на YouTube'
        };

        linkInput.value = links[platform] || '';
        textInput.value = texts[platform] || `Перейти к ${platformName}`;

        this.toggleLinkIndicator(linkInput);
        this.closePlatformModal();
        this.showNotification(`Шаблон для ${platformName} добавлен!`, 'success');
    }

    handleCellHover(cell) {
        cell.style.zIndex = '1';
    }

    handleCellClick(cell) {
        // Сбрасываем z-index у всех ячеек
        document.querySelectorAll('.lesson-cell').forEach(c => {
            c.style.zIndex = '0';
        });

        // Устанавливаем высокий z-index для текущей ячейки
        cell.style.zIndex = '2';
        this.currentCell = cell;
    }

    handleKeyPress(e) {
        // Ctrl+Enter для сохранения
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            this.saveSchedule();
        }

        // Escape для отмены
        if (e.key === 'Escape') {
            this.closePlatformModal();
        }
    }

    collectScheduleData() {
        const data = {};

        document.querySelectorAll('.lesson-cell').forEach(cell => {
            const dayIndex = cell.dataset.day;
            const lessonIndex = cell.dataset.lesson;
            const key = `${dayIndex}_${lessonIndex}`;

            const subject = cell.querySelector('.subject-input').value;
            const link = cell.querySelector('.lesson-link-input').value;
            const linkText = cell.querySelector('.link-text-input').value;
            const font = cell.querySelector('.font-selector').value;
            const color = cell.querySelector('.color-picker').value;

            data[key] = {
                subject: subject,
                link: link,
                link_text: linkText,
                font: font,
                color: color
            };
        });

        return data;
    }

    async saveSchedule() {
        const scheduleId = document.getElementById('schedule-id').value;
        const data = this.collectScheduleData();

        try {
            const saveBtn = document.getElementById('save-schedule');
            const originalText = saveBtn.innerHTML;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Сохранение...';
            saveBtn.disabled = true;

            const response = await fetch(`/schedule/${scheduleId}/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCSRFToken()
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification('Расписание успешно сохранено!', 'success');
                // Обновляем временную метку
                this.updateLastSavedTime();
            } else {
                this.showNotification('Ошибка при сохранении: ' + result.error, 'error');
            }

        } catch (error) {
            console.error('Error:', error);
            this.showNotification('Произошла ошибка при сохранении', 'error');
        } finally {
            const saveBtn = document.getElementById('save-schedule');
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
        }
    }

    updateLastSavedTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('ru-RU');
        this.showNotification(`Последнее сохранение: ${timeString}`, 'info', 2000);
    }

    getCSRFToken() {
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        if (metaTag) {
            return metaTag.content;
        }

        const input = document.querySelector('input[name="csrf_token"]');
        return input ? input.value : '';
    }

    showNotification(message, type = 'info', duration = 3000) {
        // Создаем элемент уведомления
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        // Стили для уведомления
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
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

    getNotificationIcon(type) {
        const icons = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'warning': 'fa-exclamation-triangle',
            'info': 'fa-info-circle'
        };
        return icons[type] || 'fa-info-circle';
    }

    getNotificationColor(type) {
        const colors = {
            'success': '#4CAF50',
            'error': '#f44336',
            'warning': '#ff9800',
            'info': '#2196F3'
        };
        return colors[type] || '#2196F3';
    }

    updateCellState(cell, state, add) {
        if (add) {
            cell.classList.add(state);
        } else {
            cell.classList.remove(state);
        }
    }
}

// Глобальные функции для массовых действий
function applyFontToAll() {
    const font = document.getElementById('bulk-font-selector').value;
    if (!font) {
        alert('Пожалуйста, выберите шрифт');
        return;
    }

    document.querySelectorAll('.font-selector').forEach(select => {
        select.value = font;
        const input = select.closest('.lesson-controls').querySelector('.subject-input');
        input.style.fontFamily = font;
    });

    showGlobalNotification(`Шрифт "${font}" применен ко всем ячейкам`, 'success');
}

function applyColorToAll() {
    const color = document.getElementById('bulk-color-picker').value;

    document.querySelectorAll('.color-picker').forEach(picker => {
        picker.value = color;
        const cell = picker.closest('.lesson-cell');
        cell.style.backgroundColor = color;
    });

    showGlobalNotification('Цвет применен ко всем ячейкам', 'success');
}

function showGlobalNotification(message, type) {
    // Используем метод из класса ScheduleEditor
    if (window.scheduleEditor) {
        window.scheduleEditor.showNotification(message, type);
    } else {
        alert(message);
    }
}

// Функции для модального окна платформ
function openPlatformModal() {
    if (window.scheduleEditor) {
        const activeInput = document.querySelector('.lesson-link-input:focus');
        if (activeInput) {
            window.scheduleEditor.openPlatformModal(activeInput);
        }
    }
}

function closePlatformModal() {
    if (window.scheduleEditor) {
        window.scheduleEditor.closePlatformModal();
    }
}

function insertPlatformLink(platform, platformName) {
    if (window.scheduleEditor) {
        window.scheduleEditor.insertPlatformLink(platform, platformName);
    }
}

// Инициализация при загрузке документа
document.addEventListener('DOMContentLoaded', function() {
    window.scheduleEditor = new ScheduleEditor();

    // Закрытие модального окна по клику вне его
    document.addEventListener('click', function(e) {
        const modal = document.getElementById('platformModal');
        if (modal && modal.style.display === 'block' && e.target === modal) {
            closePlatformModal();
        }
    });

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

        .notification.fade-out {
            animation: fadeOut 0.3s ease;
        }
    `;
    document.head.appendChild(style);

    console.log('Schedule Editor loaded successfully');
});

// Функция для копирования ссылки
function copyLinkToClipboard(link) {
    navigator.clipboard.writeText(link).then(() => {
        if (window.scheduleEditor) {
            window.scheduleEditor.showNotification('Ссылка скопирована в буфер обмена!', 'success');
        }
    }).catch(err => {
        console.error('Copy error:', err);
        if (window.scheduleEditor) {
            window.scheduleEditor.showNotification('Ошибка при копировании ссылки', 'error');
        }
    });
}
