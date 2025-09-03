// Глобальная переменная для хранения текущего поля ввода ссылки
let currentLinkInput = null;

// Функция для инициализации кнопок выбора платформы
function initPlatformButtons() {
    const linkSections = document.querySelectorAll('.link-section');
    linkSections.forEach(section => {
        const linkInput = section.querySelector('.lesson-link-input');
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn btn-outline-secondary btn-sm';
        button.innerHTML = '<i class="fas fa-link"></i>';
        button.onclick = () => openPlatformModal(linkInput);
        button.style.marginLeft = '5px';
        button.title = 'Выбрать платформу';
        linkInput.parentNode.appendChild(button);
    });
}

// Функция для открытия модального окна
function openPlatformModal(inputElement) {
    currentLinkInput = inputElement;
    document.getElementById('platformModal').style.display = 'block';
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
        // Триггерим событие изменения для обновления предпросмотра
        currentLinkInput.dispatchEvent(new Event('input'));
    }

    closePlatformModal();
}

// Функция для вставки своей ссылки
function insertCustomLink() {
    const customLink = document.getElementById('customPlatformLink').value;
    if (customLink) {
        if (currentLinkInput) {
            currentLinkInput.value = customLink;
            // Триггерим событие изменения
            currentLinkInput.dispatchEvent(new Event('input'));
        }
        closePlatformModal();
    } else {
        alert('Пожалуйста, введите ссылку');
    }
}

// Функция для закрытия модального окна
function closePlatformModal() {
    document.getElementById('platformModal').style.display = 'none';
    // Очищаем поле кастомной ссылки при закрытии
    document.getElementById('customPlatformLink').value = '';
    currentLinkInput = null;
}

// Обработчик для закрытия модального окна по клику вне его
document.addEventListener('click', function(event) {
    const modal = document.getElementById('platformModal');
    if (event.target === modal) {
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
            cell.style.backgroundColor = this.value;
        });
    });
}

// Инициализация селекторов шрифтов
function initFontSelectors() {
    const fontSelectors = document.querySelectorAll('.font-selector');
    fontSelectors.forEach(selector => {
        selector.addEventListener('change', function() {
            const input = this.closest('.lesson-controls').querySelector('.subject-input');
            input.style.fontFamily = this.value;
        });
    });
}

// Обработчик сохранения
function initSaveHandler() {
    const saveButton = document.getElementById('save-schedule');
    if (saveButton) {
        saveButton.addEventListener('click', saveSchedule);
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
    const fontValue = fontFamily || document.getElementById('bulk-font-selector').value;
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
    const colorValue = color || document.getElementById('bulk-color-picker').value;

    const cells = document.querySelectorAll('.lesson-cell');
    cells.forEach(cell => {
        cell.style.backgroundColor = colorValue;
    });

    const pickers = document.querySelectorAll('.color-picker');
    pickers.forEach(picker => {
        picker.value = colorValue;
    });
}

// Сохранение расписания
function saveSchedule() {
    const scheduleId = document.getElementById('schedule-id').value;
    const lessons = [];

    document.querySelectorAll('.lesson-cell').forEach(cell => {
        const day = cell.dataset.day;
        const lessonIndex = cell.dataset.lesson;
        const subjectInput = cell.querySelector('.subject-input');
        const linkInput = cell.querySelector('.lesson-link-input');
        const linkTextInput = cell.querySelector('.link-text-input');
        const fontSelector = cell.querySelector('.font-selector');
        const colorPicker = cell.querySelector('.color-picker');

        lessons.push({
            day: parseInt(day),
            lesson_index: parseInt(lessonIndex),
            subject_name: subjectInput.value,
            lesson_link: linkInput.value,
            link_text: linkTextInput.value,
            font_family: fontSelector.value,
            color: colorPicker.value
        });
    });

    // Отправка данных на сервер
    fetch(`/api/schedule/${scheduleId}/lessons`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lessons: lessons })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Расписание успешно сохранено!', 'success');
        } else {
            showNotification('Ошибка при сохранении: ' + data.error, 'error');
        }
    })
    .catch(error => {
        showNotification('Ошибка сети: ' + error, 'error');
    });
}

// Показать уведомление
function showNotification(message, type = 'info') {
    // Реализация показа уведомлений
    alert(message); // Временная реализация
}

// Инициализация при загрузке документа
document.addEventListener('DOMContentLoaded', function() {
    initPlatformButtons();
    initScheduleEditor();
});