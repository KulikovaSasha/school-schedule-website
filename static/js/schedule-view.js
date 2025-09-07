// static/js/schedule-view.js
(function() {
    'use strict';
    
    // Создаем стили для просмотра расписания
    const style = document.createElement('style');
    style.textContent = `
        .schedule-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            font-family: 'Bookman Old Style', sans-serif;
        }
        
        .schedule-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px;
            border-radius: 15px;
            margin-bottom: 25px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        
        .schedule-header h1 {
            margin: 0;
            font-size: 2.2em;
            font-weight: 700;
        }
        
        .schedule-header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 1.1em;
        }
        
        .schedule-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 25px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
        }
        
        .info-item {
            padding: 10px;
        }
        
        .info-item strong {
            color: #495057;
            display: block;
            margin-bottom: 5px;
            font-size: 0.9em;
        }
        
        .info-item span {
            color: #212529;
            font-size: 1.1em;
        }
        
        .schedule-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            margin-bottom: 30px;
        }
        
        .schedule-table th {
            background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
            color: white;
            padding: 18px;
            text-align: center;
            font-weight: 600;
            font-size: 1.1em;
            border: none;
        }
        
        .schedule-table td {
            padding: 20px;
            border: 1px solid #e9ecef;
            vertical-align: top;
            transition: all 0.3s ease;
        }
        
        .time-cell {
            background-color: #f8f9fa;
            font-weight: 600;
            text-align: center;
            color: #495057;
            font-size: 1.1em;
            width: 120px;
        }
        
        .time-display {
            font-size: 0.95em;
            color: #6c757d;
        }
        
        .lesson-cell {
            background: #ffffff;
            min-height: 120px;
            position: relative;
        }
        
        .lesson-cell:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            z-index: 2;
        }
        
        .lesson-content {
            height: 100%;
        }

        .lesson-title {
            font-weight: 700;
            margin-bottom: 8px;
            font-size: 1.2em;
            color: #212529;
            line-height: 1.3;
        }

        .lesson-teacher {
            color: #6c757d;
            font-size: 0.95em;
            margin-bottom: 5px;
        }

        .lesson-classroom {
            color: #495057;
            font-size: 0.9em;
            margin-bottom: 10px;
            padding: 3px 8px;
            background: #e9ecef;
            border-radius: 4px;
            display: inline-block;
        }

        .lesson-link {
            color: #007bff;
            text-decoration: none;
            font-size: 0.95em;
            display: inline-block;
            margin-top: 8px;
            padding: 5px 12px;
            background: #e8f4ff;
            border-radius: 20px;
            transition: all 0.3s ease;
        }

        .lesson-link:hover {
            color: #0056b3;
            background: #d1e7ff;
            text-decoration: none;
            transform: translateX(5px);
        }

        .empty-lesson {
            color: #adb5bd;
            font-style: italic;
            text-align: center;
            padding: 30px;
            font-size: 1.1em;
        }

        .action-buttons {
            margin-top: 25px;
            text-align: center;
            padding: 20px;
        }

        .btn-print {
            background: linear-gradient(135deg, #fd7e14 0%, #fdb750 100%);
            border: none;
            padding: 12px 25px;
            font-size: 1.1em;
            border-radius: 25px;
            margin: 0 10px;
            transition: all 0.3s ease;
        }

        .btn-print:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(253, 126, 20, 0.3);
        }

        .btn-back {
            background: linear-gradient(135deg, #6c757d 0%, #adb5bd 100%);
            border: none;
            padding: 12px 25px;
            font-size: 1.1em;
            border-radius: 25px;
            margin: 0 10px;
            transition: all 0.3s ease;
        }

        .btn-back:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
        }

        @media print {
            .schedule-header {
                background: none !important;
                color: black !important;
                padding: 15px !important;
            }

            .schedule-table {
                box-shadow: none !important;
                border: 2px solid #000 !important;
            }

            .schedule-table th {
                background: #f0f0f0 !important;
                color: black !important;
                border: 1px solid #000 !important;
            }

            .schedule-table td {
                border: 1px solid #000 !important;
            }

            .no-print {
                display: none !important;
            }

            .lesson-link {
                color: #000 !important;
                background: none !important;
                text-decoration: underline !important;
            }

            /* ДОБАВЛЕНО: Сохранение шрифтов для печати */
            .lesson-title,
            .subject-name {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color: #000 !important;
            }

            /* ДОБАВЛЕНО: Применение индивидуальных шрифтов */
            .font-applied {
                font-family: inherit !important;
            }
        }

        @media (max-width: 992px) {
            .schedule-container {
                padding: 15px;
            }

            .schedule-info {
                grid-template-columns: 1fr;
            }

            .schedule-table {
                font-size: 14px;
            }

            .schedule-table th,
            .schedule-table td {
                padding: 12px;
            }

            .time-cell {
                width: 100px;
            }
        }

        @media (max-width: 768px) {
            .schedule-header h1 {
                font-size: 1.8em;
            }

            .schedule-header {
                padding: 20px;
            }

            .schedule-table {
                display: block;
                overflow-x: auto;
            }

            .schedule-table th,
            .schedule-table td {
                padding: 10px;
                font-size: 13px;
            }

            .time-cell {
                width: 80px;
            }

            .action-buttons {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .btn-print,
            .btn-back {
                width: 100%;
                margin: 5px 0;
            }
        }

        @media (max-width: 576px) {
            .schedule-header h1 {
                font-size: 1.5em;
            }

            .schedule-info {
                padding: 15px;
            }

            .schedule-table th,
            .schedule-table td {
                padding: 8px;
                font-size: 12px;
            }

            .lesson-title {
                font-size: 1.1em;
            }
        }

        /* Анимации */
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .schedule-table tr {
            animation: fadeIn 0.5s ease forwards;
        }

        .schedule-table tr:nth-child(1) { animation-delay: 0.1s; }
        .schedule-table tr:nth-child(2) { animation-delay: 0.2s; }
        .schedule-table tr:nth-child(3) { animation-delay: 0.3s; }
        .schedule-table tr:nth-child(4) { animation-delay: 0.4s; }
        .schedule-table tr:nth-child(5) { animation-delay: 0.5s; }
        .schedule-table tr:nth-child(6) { animation-delay: 0.6s; }
    `;

    // Добавляем стили в документ
    document.head.appendChild(style);

    // Функция для применения шрифтов к названиям уроков
    function applyLessonFonts() {
        const lessonsData = window.lessonsData || {};

        document.querySelectorAll('.lesson-cell, .lesson-view-cell').forEach(cell => {
            const dayIndex = cell.getAttribute('data-day');
            const lessonIndex = cell.getAttribute('data-lesson');
            const lessonKey = `${dayIndex}_${lessonIndex}`;
            const lesson = lessonsData[lessonKey];

            if (lesson && lesson.font_family) {
                const titleElement = cell.querySelector('.subject-name, .lesson-title');
                if (titleElement) {
                    titleElement.style.fontFamily = `'${lesson.font_family}'`;
                    titleElement.classList.add('font-applied');
                    titleElement.setAttribute('data-font-family', lesson.font_family);

                    // Сохраняем шрифт в data-атрибуте родительской ячейки
                    cell.setAttribute('data-font-family', lesson.font_family);
                }
            }
        });
    }

    // Функция для создания print-friendly версии
    function createPrintVersion() {
        const printContainer = document.createElement('div');
        printContainer.className = 'print-version';
        printContainer.style.cssText = `
            position: absolute;
            left: -9999px;
            top: -9999px;
            width: 210mm;
            padding: 20mm;
            background: white;
        `;

        // Копируем основную таблицу
        const originalTable = document.querySelector('.schedule-table');
        if (originalTable) {
            const printTable = originalTable.cloneNode(true);

            // Сохраняем все примененные стили, включая шрифты
            printTable.querySelectorAll('.font-applied, [data-font-family]').forEach(element => {
                const fontFamily = element.getAttribute('data-font-family') ||
                                  element.style.fontFamily ||
                                  'Bookman Old Style';
                element.style.fontFamily = `'${fontFamily}'`;
                element.style.color = '#000000';
                element.style.fontWeight = 'bold';
                element.style.fontSize = '18px'; // Увеличиваем шрифт
                element.style.lineHeight = '1.2';
                element.style.textAlign = 'center';
                element.style.verticalAlign = 'middle';

                // Убеждаемся, что стили сохраняются для печати
                element.style.setProperty('font-family', `'${fontFamily}'`, 'important');
                element.style.setProperty('font-size', '18px', 'important');
            });

            // Убираем ненужные элементы для печати
            printTable.querySelectorAll('.no-print, .lesson-link, .action-buttons, .time-display').forEach(el => {
                el.remove();
            });

            // Упрощаем стили таблицы для печати
            printTable.style.border = '2px solid #000';
            printTable.style.borderCollapse = 'collapse';
            printTable.style.width = '100%';

            // Увеличиваем размеры ячеек для печати
            printTable.querySelectorAll('th, td').forEach(cell => {
                cell.style.border = '2px solid #000';
                cell.style.padding = '15px 8px';
                cell.style.textAlign = 'center';
                cell.style.verticalAlign = 'middle';
                cell.style.height = '60px'; // Высота ячеек
                cell.style.minWidth = '120px'; // Минимальная ширина
            });

            printTable.querySelectorAll('th').forEach(th => {
                th.style.background = '#f0f0f0';
                th.style.color = '#000';
                th.style.fontWeight = 'bold';
                th.style.fontSize = '16px';
                th.style.padding = '12px 8px';
            });

            printTable.querySelectorAll('.time-cell').forEach(td => {
                td.style.background = '#e0e0e0';
                td.style.fontWeight = 'bold';
                td.style.fontSize = '14px';
                td.style.width = '100px';
            });

            // Увеличиваем шрифт в ячейках времени
            printTable.querySelectorAll('.time-cell .time-display').forEach(el => {
                el.style.fontSize = '14px';
                el.style.fontWeight = 'bold';
            });

            printContainer.appendChild(printTable);
            document.body.appendChild(printContainer);

            return printContainer;
        }
        return null;
    }

    // Улучшенная функция печати с крупным шрифтом
    function printScheduleWithLargeFont() {
        // Сначала применяем шрифты (на случай динамических изменений)
        applyLessonFonts();

        const printContainer = createPrintVersion();
        if (printContainer) {
            // Используем стандартную печать, но с нашим контейнером
            const originalDisplay = printContainer.style.display;
            printContainer.style.display = 'block';
            printContainer.style.position = 'fixed';
            printContainer.style.left = '0';
            printContainer.style.top = '0';
            printContainer.style.zIndex = '9999';
            printContainer.style.width = '100%';
            printContainer.style.height = '100%';
            printContainer.style.overflow = 'auto';
            printContainer.style.background = 'white';
            printContainer.style.padding = '20px';

            // Скрываем все остальное
            document.body.querySelectorAll('*:not(.print-version)').forEach(el => {
                el.style.visibility = 'hidden';
            });

            window.print();

            // Восстанавливаем видимость
            document.body.querySelectorAll('*:not(.print-version)').forEach(el => {
                el.style.visibility = 'visible';
            });

            // Удаляем контейнер
            document.body.removeChild(printContainer);
        } else {
            // Fallback на стандартную печать
            window.print();
        }
    }

    // Альтернативный метод печати через iframe с крупным шрифтом
    function printScheduleWithLargeFontAlternative() {
        // Создаем iframe для печати
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';

        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

        // Собираем HTML с сохраненными шрифтами и крупным текстом
        let printHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Расписание: ${document.title}</title>
                <style>
                    body {
                        margin: 0;
                        padding: 10mm;
                        background: white;
                        font-family: Arial, sans-serif;
                    }
                    .print-schedule {
                        width: 100%;
                        border-collapse: collapse;
                        border: 3px solid #000;
                    }
                    .print-schedule th, .print-schedule td {
                        border: 2px solid #000;
                        padding: 15px 10px;
                        text-align: center;
                        vertical-align: middle;
                        height: 70px;
                        min-width: 140px;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .print-schedule th {
                        background: #f0f0f0 !important;
                        color: #000 !important;
                        font-weight: bold;
                        font-size: 18px;
                        padding: 12px 10px;
                    }
                    .time-header {
                        background: #e0e0e0 !important;
                        font-weight: bold;
                        font-size: 16px;
                        width: 120px;
                    }
                    .lesson-cell {
                        font-size: 20px !important;
                        font-weight: bold;
                        line-height: 1.2;
                        text-align: center;
                        vertical-align: middle;
                    }
                    .schedule-title {
                        text-align: center;
                        font-size: 24px;
                        font-weight: bold;
                        margin-bottom: 20px;
                        color: #000;
                    }
                    .print-date {
                        text-align: center;
                        font-size: 14px;
                        color: #666;
                        margin-bottom: 30px;
                    }
                    @media print {
                        body {
                            margin: 0;
                            padding: 0;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                        .print-schedule {
                            page-break-inside: avoid;
                            width: 100% !important;
                            font-size: 20px !important;
                        }
                        * {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        @page {
                            margin: 15mm;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="schedule-title">Расписание занятий</div>
                <div class="print-date">Напечатано: ${new Date().toLocaleString()}</div>
                <table class="print-schedule">
                    <thead>
                        <tr>
                            <th class="time-header">Время</th>
        `;

        // Добавляем заголовки дней
        document.querySelectorAll('.day-header').forEach(header => {
            printHTML += `<th>${header.textContent}</th>`;
        });

        printHTML += `</tr></thead><tbody>`;

        // Добавляем строки с уроками
        document.querySelectorAll('.schedule-table tbody tr').forEach(row => {
            printHTML += '<tr>';
            row.querySelectorAll('td').forEach((cell, index) => {
                if (index === 0) {
                    // Время
                    const timeText = cell.querySelector('.time-display') ? cell.querySelector('.time-display').textContent : cell.textContent;
                    printHTML += `<td class="time-header">${timeText}</td>`;
                } else {
                    // Уроки
                    const subjectElement = cell.querySelector('.subject-name, .lesson-title');
                    const subjectText = subjectElement ? subjectElement.textContent : '';
                    const fontFamily = subjectElement ? subjectElement.style.fontFamily : 'Bookman Old Style';

                    printHTML += `<td class="lesson-cell" style="font-family: ${fontFamily} !important; font-size: 20px !important;">${subjectText}</td>`;
                }
            });
            printHTML += '</tr>';
        });

        printHTML += `</tbody></table></body></html>`;

        iframeDoc.open();
        iframeDoc.write(printHTML);
        iframeDoc.close();

        // Печатаем из iframe
        iframe.contentWindow.focus();
        setTimeout(() => {
            iframe.contentWindow.print();
            // Удаляем iframe после печати
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 1000);
        }, 500);
    }

    // Функции для работы с просмотром расписания
    function initScheduleView() {
        console.log('Schedule view initialized');

        // Применяем шрифты к урокам
        applyLessonFonts();

        // Инициализация tooltips Bootstrap
        const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        if (typeof bootstrap !== 'undefined') {
            [...tooltips].map(el => new bootstrap.Tooltip(el));
        }

        // Обработка кликов по ссылкам уроков
        const lessonLinks = document.querySelectorAll('.lesson-link');
        lessonLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                if (this.href && this.href !== '#' && !this.href.includes('javascript:')) {
                    window.open(this.href, '_blank');
                    e.preventDefault();
                }
            });
        });

        // Функция печати
        const printBtn = document.getElementById('print-schedule');
        if (printBtn) {
            printBtn.addEventListener('click', function() {
                printScheduleWithLargeFontAlternative(); // Используем версию с крупным шрифтом
            });
        }

        // Горячая клавиша Ctrl+P
        document.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                printScheduleWithLargeFontAlternative();
            }
        });

        // Подсветка текущего времени
        highlightCurrentTime();

        // Анимация загрузки
        animateSchedule();
    }

    // Подсветка текущего времени
    function highlightCurrentTime() {
        const now = new Date();
        const currentDay = now.getDay(); // 0-6 (воскресенье-суббота)
        const currentTime = now.getHours() * 60 + now.getMinutes();

        // Преобразуем день недели к нашему формату (1-6)
        const scheduleDay = currentDay === 0 ? 6 : currentDay - 1;

        document.querySelectorAll('.lesson-cell').forEach(cell => {
            const day = parseInt(cell.dataset.day);
            const lessonIndex = parseInt(cell.dataset.lesson);

            if (day === scheduleDay) {
                cell.style.boxShadow = '0 0 0 2px #007bff';
                cell.style.zIndex = '3';
            }
        });
    }

    // Анимация расписания
    function animateSchedule() {
        const cells = document.querySelectorAll('.lesson-cell');
        cells.forEach((cell, index) => {
            cell.style.opacity = '0';
            cell.style.transform = 'translateY(20px)';

            setTimeout(() => {
                cell.style.transition = 'all 0.5s ease';
                cell.style.opacity = '1';
                cell.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }

    // Инициализация при загрузке документа
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initScheduleView);
    } else {
        initScheduleView();
    }


    // Экспортируем функции для глобального доступа
    window.ScheduleView = {
        printSchedule: printScheduleWithLargeFontAlternative,
        applyLessonFonts: applyLessonFonts,
        printLarge: printScheduleWithLargeFontAlternative
    };

})();