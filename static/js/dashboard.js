// Dashboard functionality
class Dashboard {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupScheduleCards();
        console.log('Dashboard initialized');
    }

    setupEventListeners() {
        // Global event listeners
        document.addEventListener('click', this.handleGlobalClick.bind(this));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
    }

    setupScheduleCards() {
        const cards = document.querySelectorAll('.schedule-card');
        
        cards.forEach(card => {
            card.addEventListener('click', (e) => this.handleCardClick(e, card));
            card.addEventListener('mouseenter', () => this.handleCardHover(card));
            card.addEventListener('mouseleave', () => this.handleCardLeave(card));
        });
    }

    handleCardClick(e, card) {
        // Ignore clicks on action buttons
        if (this.isActionElement(e.target)) {
            return;
        }
        
        // Navigate to view schedule
        const viewLink = card.querySelector('a[href*="view_schedule"]');
        if (viewLink) {
            window.location.href = viewLink.href;
        }
    }

    handleCardHover(card) {
        card.style.cursor = 'pointer';
        card.style.boxShadow = '0 10px 30px rgba(76, 175, 80, 0.2)';
    }

    handleCardLeave(card) {
        card.style.cursor = 'default';
        card.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
    }

    isActionElement(element) {
        return element.closest('.schedule-actions') || 
               element.tagName === 'A' || 
               element.tagName === 'BUTTON' ||
               element.closest('a') || 
               element.closest('button');
    }

    handleGlobalClick(e) {
        // Close modals when clicking outside
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    }

    handleKeyPress(e) {
        // Keyboard shortcuts
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            this.navigateToCreate();
        }
        
        if (e.key === '/') {
            e.preventDefault();
            this.focusSearch();
        }
        
        if (e.key === 'Escape') {
            this.closeModals();
        }
    }

    navigateToCreate() {
        window.location.href = '/create-schedule';
    }

    focusSearch() {
        const searchInput = document.getElementById('scheduleSearch');
        if (searchInput) {
            searchInput.focus();
        }
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    showNotification(message, type = 'info') {
        // Implementation for showing notifications
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    window.dashboard = new Dashboard();
});