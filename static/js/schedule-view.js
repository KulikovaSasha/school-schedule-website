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

    // Функции для работы с просмотром расписания
    function initScheduleView() {
        console.log('Schedule view initialized');

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
                window.print();
            });
        }

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

})();