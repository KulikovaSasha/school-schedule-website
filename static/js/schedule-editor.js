(function() {
    'use strict';

    // Добавьте эту функцию в начало файла
    function restoreButton(button, originalHTML) {
        if (button && originalHTML) {
            button.innerHTML = originalHTML;
            button.disabled = false;

            // Дополнительно сбрасываем стили если меняли их
            button.style.backgroundColor = '';
            button.style.borderColor = '';
            button.style.opacity = '';
        }
    }

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

                // Также применяем шрифт к названию предмета в ячейке
                const cell = this.closest('.lesson-cell');
                if (cell) {
                    const subjectName = cell.querySelector('.subject-name');
                    if (subjectName) {
                        subjectName.style.fontFamily = this.value;
                    }
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

        // Также применяем шрифт ко всем названиям предметов
        const subjectNames = document.querySelectorAll('.subject-name');
        subjectNames.forEach(name => {
            name.style.fontFamily = fontValue;
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
        const saveButton = document.getElementById('save-schedule');
        const originalHTML = saveButton?.innerHTML;

        // Сохраняем оригинальное состояние
        if (saveButton) {
            saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Сохранение...';
            saveButton.disabled = true;
        }

        // Принудительное восстановление через 3 секунды на всякий случай
        const safetyTimeout = setTimeout(() => {
            restoreButton(saveButton, originalHTML);
        }, 3000);

        // Собираем данные
        const scheduleId = document.getElementById('schedule-id')?.value;
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
                font: fontSelector?.value || 'Bookman Old Style',
                color: colorPicker?.value || '#FFFFFF'
            };
        });

        // Делаем запрос
        fetch(`/schedule/${scheduleId}/save?t=${Date.now()}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken() // Добавляем CSRF токен
            },
            body: JSON.stringify(lessons)
        })
        .then(response => response.json())
        .then(data => {
            clearTimeout(safetyTimeout); // Отменяем safety timeout
            restoreButton(saveButton, originalHTML);

            if (data.success) {
                showNotification('Сохранено успешно!', 'success');
            } else {
                showNotification('Ошибка сервера: ' + data.error, 'error');
            }
        })
        .catch(error => {
            clearTimeout(safetyTimeout); // Отменяем safety timeout
            restoreButton(saveButton, originalHTML);
            showNotification('Ошибка сети', 'error');
        });
    }

    // Функция для получения CSRF токена
    function getCSRFToken() {
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        return metaTag ? metaTag.getAttribute('content') : '';
    }

    // Функция для открытия модального окна редактирования
    function openEditModal(cell) {
        const dayIndex = cell.getAttribute('data-day');
        const lessonIndex = cell.getAttribute('data-lesson');

        // Заполняем форму данными из ячейки
        const subjectName = cell.querySelector('.subject-name')?.textContent || '';
        const lessonLink = cell.querySelector('.lesson-link')?.href || '';
        const linkText = cell.querySelector('.lesson-link')?.textContent || '';
        const backgroundColor = cell.style.backgroundColor || '#f8f9fa';
        const fontFamily = cell.querySelector('.subject-name')?.style.fontFamily || 'Bookman Old Style';

        // Заполняем модальное окно
        document.getElementById('editDayIndex').value = dayIndex;
        document.getElementById('editLessonIndex').value = lessonIndex;
        document.getElementById('subjectName').value = subjectName;
        document.getElementById('subjectColor').value = rgbToHex(backgroundColor);
        document.getElementById('colorHex').value = rgbToHex(backgroundColor);
        document.getElementById('lessonLink').value = lessonLink;
        document.getElementById('linkText').value = linkText.replace('Ссылка', '').trim();
        document.getElementById('fontFamily').value = fontFamily.replace(/['"]/g, '');

        // Показываем модальное окно
        document.getElementById('editModal').style.display = 'block';
    }

    // Функция для преобразования RGB в HEX
    function rgbToHex(rgb) {
        if (rgb.startsWith('#')) return rgb;

        const rgbMatch = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if (rgbMatch) {
            return '#' +
                parseInt(rgbMatch[1]).toString(16).padStart(2, '0') +
                parseInt(rgbMatch[2]).toString(16).padStart(2, '0') +
                parseInt(rgbMatch[3]).toString(16).padStart(2, '0');
        }
        return '#FFFFFF';
    }

    // Функция для установки цвета
    function setColor(color) {
        document.getElementById('subjectColor').value = color;
        document.getElementById('colorHex').value = color;
    }

    function initScheduleEditor() {
        // УДАЛЕНО: initPlatformButtons()
        initColorPickers();
        initFontSelectors();
        initSaveHandler();
        initBulkActions();

        // Добавляем обработчики для ячеек уроков
        document.querySelectorAll('.lesson-cell').forEach(cell => {
            cell.addEventListener('click', function(e) {
                if (e.target.tagName !== 'A') {
                    openEditModal(this);
                }
            });
        });

        // Обработчик закрытия модального окна
        document.querySelector('.close').addEventListener('click', function() {
            document.getElementById('editModal').style.display = 'none';
        });

        // Обработчик клика вне модального окна
        document.getElementById('editModal').addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });

        // Обработчик формы урока
        document.getElementById('lessonForm').addEventListener('submit', function(e) {
            e.preventDefault();
            saveLesson();
        });
    }

    function saveLesson() {
        const dayIndex = document.getElementById('editDayIndex').value;
        const lessonIndex = document.getElementById('editLessonIndex').value;
        const subjectName = document.getElementById('subjectName').value;
        const color = document.getElementById('subjectColor').value;
        const lessonLink = document.getElementById('lessonLink').value;
        const linkText = document.getElementById('linkText').value;
        const fontFamily = document.getElementById('fontFamily').value;

        if (!subjectName.trim()) {
            showNotification('Пожалуйста, введите название предмета', 'error');
            return;
        }

        // Находим ячейку и обновляем её содержимое
        const cell = document.querySelector(`.lesson-cell[data-day="${dayIndex}"][data-lesson="${lessonIndex}"]`);
        if (cell) {
            const brightness = calculateBrightness(color);
            const textColor = brightness > 160 ? '#000000' : '#ffffff';

            cell.style.backgroundColor = color;
            cell.innerHTML = `
                <div class="subject-name" style="font-family: '${fontFamily}'; color: ${textColor}">
                    ${subjectName}
                </div>
                ${lessonLink ? `
                <a href="${lessonLink}" class="lesson-link" target="_blank" style="color: ${textColor}">
                    <i class="fas fa-link"></i> ${linkText || 'Ссылка'}
                </a>
                ` : ''}
            `;
        }

        showNotification('Урок сохранен!', 'success');
        document.getElementById('editModal').style.display = 'none';
    }

    // Функция для расчета яркости цвета
    function calculateBrightness(hex) {
        hex = hex.replace('#', '');
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }

        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        return (r * 299 + g * 587 + b * 114) / 1000;
    }

    document.addEventListener('DOMContentLoaded', function() {
        initScheduleEditor();
    });

})();