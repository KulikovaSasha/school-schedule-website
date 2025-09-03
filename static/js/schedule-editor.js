(function() {
    'use strict';

    // УДАЛЕНО: currentLinkInput и все функции платформ

    // Функция для инициализации кнопок выбора платформы - УДАЛЯЕМ
    function initPlatformButtons() {
        // Эту функцию полностью удаляем
    }

    // Остаются только эти функции:
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

    function initSaveHandler() {
        const saveButton = document.getElementById('save-schedule');
        if (saveButton) {
            saveButton.addEventListener('click', function(e) {
                e.preventDefault();
                saveSchedule();
            });
        }
    }

    function initBulkActions() {
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

    function showNotification(message, type = 'info') {
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

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }

    function saveSchedule() {
        const scheduleId = document.getElementById('schedule-id')?.value;
        if (!scheduleId) return;

        const lessons = {};

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

        const saveButton = document.getElementById('save-schedule');
        const originalText = saveButton?.innerHTML;
        if (saveButton) {
            saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Сохранение...';
            saveButton.disabled = true;
        }

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
            if (data.success) {
                showNotification('Расписание успешно сохранено!', 'success');
            } else {
                showNotification('Ошибка при сохранении: ' + (data.error || 'неизвестная ошибка'), 'error');
            }
        })
        .catch(error => {
            showNotification('Ошибка: ' + error.message, 'error');
        })
        .finally(() => {
            if (saveButton) {
                saveButton.innerHTML = originalText;
                saveButton.disabled = false;
            }
        });
    }

    function initScheduleEditor() {
        // УДАЛЕНО: initPlatformButtons()
        initColorPickers();
        initFontSelectors();
        initSaveHandler();
        initBulkActions();
    }

    document.addEventListener('DOMContentLoaded', function() {
        initScheduleEditor();
    });

})();