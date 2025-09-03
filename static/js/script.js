// static/js/script.js

// Функции для dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard loaded');

    // Инициализация tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Подтверждение удаления
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (!confirm('Вы уверены, что хотите удалить это расписание?')) {
                e.preventDefault();
            }
        });
    });

    // Анимация загрузки
    const loadingSpinner = document.getElementById('loading-spinner');
    if (loadingSpinner) {
        setTimeout(() => {
            loadingSpinner.style.display = 'none';
        }, 1000);
    }
});