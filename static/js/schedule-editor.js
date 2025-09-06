

// Хранилище данных уроков
let lessonsData = {};
let currentEditingCell = null;

// В начале файла, после объявления переменных
console.log('🔍 Checking DOM elements:');
console.log('fontFamily element:', document.getElementById('fontFamily'));
console.log('subjectColor element:', document.getElementById('subjectColor'));
console.log('lessonForm element:', document.getElementById('lessonForm'));

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 Schedule editor initialized');

    // Инициализируем данные из глобальной переменной
    if (typeof window.lessonsData !== 'undefined') {
        lessonsData = window.lessonsData;
        console.log('📦 Lessons data loaded:', lessonsData);

        // Немедленно применяем шрифты после загрузки данных
        setTimeout(applyFontsOnLoad, 100);
    }

    initializeEventListeners();
});

// Инициализация обработчиков событий
function initializeEventListeners() {
    console.log('🔗 Setting up event listeners');

    // Клик по ячейке урока
    document.querySelectorAll('.lesson-cell').forEach(cell => {
        cell.addEventListener('click', function(e) {
            if (!e.target.closest('a')) {
                openEditModal(this);
            }
        });
    });

    // Закрытие модального окна
    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // Клик вне модального окна
    document.addEventListener('click', function(e) {
        const modal = document.getElementById('editModal');
        if (modal && e.target === modal) {
            closeModal();
        }
    });

    // Обработка формы урока
    const lessonForm = document.getElementById('lessonForm');
    if (lessonForm) {
        lessonForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveLesson();
        });
    }

    // Горячие клавиши
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeModal();
    });

    // Обработчики для цветовых опций
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            const color = this.getAttribute('data-color');
            setColor(color);
        });
    });
}

// Применение шрифтов при загрузке
function applyFontsOnLoad() {
    console.log('🎨 Applying fonts on load');

    let appliedCount = 0;

    document.querySelectorAll('.lesson-cell').forEach(cell => {
        const subjectName = cell.querySelector('.subject-name');
        if (subjectName && subjectName.textContent !== '+ Добавить урок') {
            const dayIndex = cell.getAttribute('data-day');
            const lessonIndex = cell.getAttribute('data-lesson');
            const lessonKey = `${dayIndex}_${lessonIndex}`;
            const lesson = lessonsData[lessonKey];

            if (lesson && lesson.font_family) {
                subjectName.style.fontFamily = `'${lesson.font_family}'`;
                console.log(`✅ Applied font: '${lesson.font_family}' to ${lessonKey}`);
                appliedCount++;
            } else {
                subjectName.style.fontFamily = "'Bookman Old Style'";
            }
        }
    });

    console.log(`🎯 Applied fonts to ${appliedCount} lessons`);
}

// Открытие модального окна редактирования
function openEditModal(cell) {
    console.log('📝 Opening edit modal');

    currentEditingCell = cell;
    const dayIndex = cell.getAttribute('data-day');
    const lessonIndex = cell.getAttribute('data-lesson');
    const lessonKey = `${dayIndex}_${lessonIndex}`;

    const currentLesson = lessonsData[lessonKey] || {};
    const subjectNameElement = cell.querySelector('.subject-name');

    // Определяем текущий шрифт
    let currentFontFamily = 'Bookman Old Style';
    if (subjectNameElement && subjectNameElement.style.fontFamily) {
        currentFontFamily = subjectNameElement.style.fontFamily.replace(/['"]/g, '');
    } else if (currentLesson.font_family) {
        currentFontFamily = currentLesson.font_family;
    }

    console.log('🔤 Current font family:', currentFontFamily);

    // Заполняем форму данными
    document.getElementById('editDayIndex').value = dayIndex;
    document.getElementById('editLessonIndex').value = lessonIndex;
    document.getElementById('subjectName').value = currentLesson.subject_name || '';
    document.getElementById('subjectColor').value = currentLesson.color || '#4a6fa5';
    document.getElementById('colorHex').value = currentLesson.color || '#4a6fa5';
    document.getElementById('lessonLink').value = currentLesson.lesson_link || '';
    document.getElementById('linkText').value = currentLesson.link_text || '';
    document.getElementById('fontFamily').value = currentFontFamily;

    // Показываем модальное окно
    document.getElementById('editModal').style.display = 'block';
}

// Закрытие модального окна
function closeModal() {
    document.getElementById('editModal').style.display = 'none';
    currentEditingCell = null;
}

// Установка цвета
function setColor(color) {
    document.getElementById('subjectColor').value = color;
    document.getElementById('colorHex').value = color;
}

// Сохранение урока
function saveLesson() {
    const dayIndex = document.getElementById('editDayIndex').value;
    const lessonIndex = document.getElementById('editLessonIndex').value;
    const subjectName = document.getElementById('subjectName').value;
    const color = document.getElementById('subjectColor').value;
    const lessonLink = document.getElementById('lessonLink').value;
    const linkText = document.getElementById('linkText').value;

    // ИСПРАВЛЕНИЕ 1: Правильное получение значения шрифта
    const fontFamilySelect = document.getElementById('fontFamily');
    const fontFamily = fontFamilySelect ? fontFamilySelect.value : 'Bookman Old Style';

    console.log('💾 Saving lesson:', {
        dayIndex,
        lessonIndex,
        subjectName,
        fontFamily  // Добавляем в лог
    });

    if (!subjectName.trim()) {
        showNotification('Пожалуйста, введите название предмета', 'error');
        return;
    }

    const lessonKey = `${dayIndex}_${lessonIndex}`;
    lessonsData[lessonKey] = {
        subject_name: subjectName,
        color: color,
        lesson_link: lessonLink,
        link_text: linkText,
        font_family: fontFamily  // Сохраняем только значение
    };

    console.log('📊 Updated lessonsData:', lessonsData[lessonKey]);

    // Обновляем интерфейс
    if (currentEditingCell) {
        updateLessonCell(currentEditingCell, subjectName, color, lessonLink, linkText, fontFamily);
    }

    showNotification('✅ Урок сохранен! Не забудьте сохранить всё расписание.', 'success');
    closeModal();
}

// Обновление ячейки урока
// Обновление ячейки урока
function updateLessonCell(cell, subjectName, color, lessonLink, linkText, fontFamily) {
    console.log('🔄 Updating cell with font:', fontFamily);

    const brightness = calculateBrightness(color);
    const textColor = brightness > 160 ? '#000000' : '#ffffff';

    const lessonContent = cell.querySelector('.lesson-content');
    if (lessonContent) {
        lessonContent.style.backgroundColor = color;
        lessonContent.style.color = textColor;

        // Убедимся, что fontFamily - это строка, а не объект
        const cleanFontFamily = typeof fontFamily === 'string' ? fontFamily : 'Bookman Old Style';

        lessonContent.innerHTML = `
            <div class="subject-name" style="font-family: '${cleanFontFamily}'">${subjectName}</div>
            ${lessonLink ? `<a href="${lessonLink}" class="lesson-link" target="_blank" style="color: ${textColor}">
                <i class="fas fa-link"></i> ${linkText || 'Ссылка'}
            </a>` : ''}
        `;
    }
}

// Расчет яркости цвета
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

// Сохранение всего расписания
function saveSchedule() {
    console.log('💾 Saving entire schedule:', lessonsData);
    showNotification('⏳ Сохранение расписания...', 'success');

    // Проверяем, есть ли данные о шрифтах
    let hasFontData = false;
    for (const key in lessonsData) {
        if (lessonsData[key]?.font_family) {
            hasFontData = true;
            console.log(`📝 Lesson ${key} has font: ${lessonsData[key].font_family}`);
            break;
        }
    }
    console.log('📋 Schedule contains font data:', hasFontData);

    fetch(window.saveScheduleUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify(lessonsData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('✅ Расписание успешно сохранено!', 'success');
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } else {
            showNotification('❌ Ошибка при сохранении: ' + data.error, 'error');
        }
    })
    .catch(error => {
        console.error('❌ Error:', error);
        showNotification('❌ Ошибка при сохранении расписания', 'error');
    });
}

// Функция для получения CSRF токена
function getCSRFToken() {
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    return metaTag ? metaTag.getAttribute('content') : '';
}

// Показать уведомление
function showNotification(message, type) {
    // Удаляем старые уведомления
    document.querySelectorAll('.notification').forEach(notif => notif.remove());

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        ${message}
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Делаем функции глобальными
window.openEditModal = openEditModal;
window.setColor = setColor;
window.saveLesson = saveLesson;
window.saveSchedule = saveSchedule;
window.closeModal = closeModal;
window.enableTitleEdit = enableTitleEdit;
window.cancelTitleEdit = cancelTitleEdit;
window.saveTitle = saveTitle;