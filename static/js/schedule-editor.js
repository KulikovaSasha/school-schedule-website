// static/js/schedule-editor.js
(function() {
    'use strict';

    // Глобальная переменная для хранения текущего поля ввода ссылки
    let currentLinkInput = null;

    // Функция для инициализации кнопок выбора платформы
    function initPlatformButtons() {
        const linkSections = document.querySelectorAll('.link-section');
        linkSections.forEach(section => {
            const linkInput = section.querySelector('.lesson-link-input');
            if (!linkInput) return;

            // Проверяем, не добавлена ли уже кнопка
            if (linkInput.nextElementSibling && linkInput.nextElementSibling.classList.contains('platform-btn')) {
                return;
            }

            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn btn-outline-secondary btn-sm platform-btn';
            button.innerHTML = '<i class="fas fa-link"></i>';
            button.onclick = () => openPlatformModal(linkInput);
            button.style.marginLeft = '5px';
            button.title = 'Выбрать платформу';

            linkInput.parentNode.appendChild(button);
        });
    }

    // Функция для открытия модального окна
    function openPlatformModal(inputElement) {
        const modal = document.getElementById('platformModal');
        if (!modal) return;

        currentLinkInput = inputElement;
        modal.style.display = 'block';
    }

    // Функция для вставки ссылки из популярных платформ
    function insertPlatformLink(platform, platformName) {
        let link = '';
        switch(platform) {
            case 'zoom':
                link = 'https://zoom.us/j/ваш-id';
                break;
            case 'google_meet':
                link = 'https://meet.google.com/ваша-встреча';
                break;
            case 'microsoft_teams':
                link = 'https://teams.microsoft.com/l/meetup-join/ваша-встреча';
                break;
            case 'discord':
                link = 'https://discord.gg/ваша-ссылка';
                break;
            case 'skype':
                link = 'skype:ваш-логин?call';
                break;
            case 'youtube':
                link = 'https://youtube.com/ваша-трансляция';
                break;
        }

        if (currentLinkInput) {
            currentLinkInput.value = link;
            currentLinkInput.dispatchEvent(new Event('input'));
        }

        closePlatformModal();
    }

    // Функция для вставки своей ссылки
    function insertCustomLink() {
        const customLinkInput = document.getElementById('customPlatformLink');
        if (!customLinkInput) return;

        const customLink = customLinkInput.value;
        if (customLink) {
            if (currentLinkInput) {
                currentLinkInput.value = customLink;
                currentLinkInput.dispatchEvent(new Event('input'));
            }
            closePlatformModal();
        } else {
            alert('Пожалуйста, введите ссылку');
        }
    }

    // Функция для закрытия модального окна
    function closePlatformModal() {
        const modal = document.getElementById('platformModal');
        if (modal) {
            modal.style.display = 'none';
        }

        // Безопасная очистка поля кастомной ссылки
        const customLinkInput = document.getElementById('customPlatformLink');
        if (customLinkInput) {
            customLinkInput.value = '';
        }

        currentLinkInput = null;
    }

    // Обработчик для закрытия модального окна по клику вне его
    document.addEventListener('click', function(event) {
        const modal = document.getElementById('platformModal');
        if (modal && event.target === modal) {
            closePlatformModal();
        }
    });

    // Обработчик для закрытия по ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closePlatformModal();
        }
    });

    // Основная функция инициализации редактора
    function initScheduleEditor() {
        initPlatformButtons();
        initColorPickers();
        initFontSelectors();
        initSaveHandler();
        initBulkActions();
    }

    // Инициализация цветовых пикеров
    function initColorPickers() {
        const colorPickers = document.querySelectorAll('.color-picker');
        colorPickers.forEach(picker => {
            picker.addEventListener('input', function() {
                const cell = this.closest('.lesson-cell');
                if (cell) {
                    cell.style.backgroundColor = this.value;
                }
            });
        });
    }

    // Инициализация селекторов шрифтов
    function initFontSelectors() {
        const fontSelectors = document.querySelectorAll('.font-selector');
        fontSelectors.forEach(selector => {
            selector.addEventListener('change', function() {
                const input = this.closest('.lesson-controls').querySelector('.subject-input');
                if (input) {
                    input.style.fontFamily = this.value;
                }
            });
        });
    }

    // Обработчик сохранения
    function initSaveHandler() {
        const saveButton = document.getElementById('save-schedule');
        if (saveButton) {
            saveButton.addEventListener('click', function(e) {
                e.preventDefault();
                saveSchedule();
            });
        }
    }

    // Массовые действия
    function initBulkActions() {
        // Инициализация массовых действий
        const bulkFontSelector = document.getElementById('bulk-font-selector');
        const bulkColorPicker = document.getElementById('bulk-color-picker');

        if (bulkFontSelector) {
            bulkFontSelector.addEventListener('change', function() {
                if (this.value) {
                    applyFontToAll(this.value);
                }
            });
        }

        if (bulkColorPicker) {
            bulkColorPicker.addEventListener('input', function() {
                applyColorToAll(this.value);
            });
        }
    }

    // Применить шрифт ко всем ячейкам
    function applyFontToAll(fontFamily = null) {
        const fontValue = fontFamily || document.getElementById('bulk-font-selector')?.value;
        if (!fontValue) return;

        const inputs = document.querySelectorAll('.subject-input');
        inputs.forEach(input => {
            input.style.fontFamily = fontValue;
        });

        const selectors = document.querySelectorAll('.font-selector');
        selectors.forEach(selector => {
            selector.value = fontValue;
        });
    }

    // Применить цвет ко всем ячейкам
    function applyColorToAll(color = null) {
        const colorValue = color || document.getElementById('bulk-color-picker')?.value;
        if (!colorValue) return;

        const cells = document.querySelectorAll('.lesson-cell');
        cells.forEach(cell => {
            cell.style.backgroundColor = colorValue;
        });

        const pickers = document.querySelectorAll('.color-picker');
        pickers.forEach(picker => {
            picker.value = colorValue;
        });
    }

    // Показать уведомление
    function showNotification(message, type = 'info') {
        // Создаем элемент уведомления
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show`;
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.zIndex = '1000';
        notification.style.minWidth = '300px';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        // Добавляем на страницу
        document.body.appendChild(notification);

        // Автоматически скрываем через 3 секунды
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }

    // Сохранение расписания
    function saveSchedule() {
        const scheduleId = document.getElementById('schedule-id')?.value;
        if (!scheduleId) return;

        const lessons = {};

        // Собираем данные в правильном формате
        document.querySelectorAll('.lesson-cell').forEach(cell => {
            const day = cell.dataset.day;
            const lessonIndex = cell.dataset.lesson;
            const subjectInput = cell.querySelector('.subject-input');
            const linkInput = cell.querySelector('.lesson-link-input');
            const linkTextInput = cell.querySelector('.link-text-input');
            const fontSelector = cell.querySelector('.font-selector');
            const colorPicker = cell.querySelector('.color-picker');

            const key = `${day}_${lessonIndex}`;
            lessons[key] = {
                subject: subjectInput?.value || '',
                link: linkInput?.value || '',
                link_text: linkTextInput?.value || 'Перейти к уроку',
                font: fontSelector?.value || 'Arial',
                color: colorPicker?.value || '#FFFFFF'
            };
        });

        // Показываем индикатор загрузки
        const saveButton = document.getElementById('save-schedule');
        const originalText = saveButton?.innerHTML;
        if (saveButton) {
            saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Сохранение...';
            saveButton.disabled = true;
        }

        // Отправка данных на сервер
        fetch(`/schedule/${scheduleId}/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(lessons)
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            if (data.success) {
                showNotification('Расписание успешно сохранено!', 'success');
            } else {
                showNotification('Ошибка при сохранении: ' + (data.error || 'неизвестная ошибка'), 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Ошибка: ' + error.message, 'error');
        })
        .finally(() => {
            // Восстанавливаем кнопку
            if (saveButton) {
                saveButton.innerHTML = originalText;
                saveButton.disabled = false;
            }
        });
    }

    // Инициализация при загрузке документа
    document.addEventListener('DOMContentLoaded', function() {
        initScheduleEditor();
    });

})();