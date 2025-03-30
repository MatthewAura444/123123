class NotificationManager {
    constructor() {
        this.container = null;
        this.notifications = [];
        this.maxNotifications = 5;
        this.init();
    }

    init() {
        // Создаем контейнер для уведомлений
        this.createContainer();

        // Подписываемся на WebSocket события
        window.wsClient.on('notification', this.handleNotification.bind(this));
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.className = 'notifications-container';
        document.body.appendChild(this.container);
    }

    show(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    ${this.getIcon(type)}
                </div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close" onclick="notificationManager.close(this.parentElement)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
            </button>
        `;

        // Добавляем уведомление в контейнер
        this.container.appendChild(notification);

        // Анимируем появление
        window.animationManager.animateNotification(notification);

        // Удаляем уведомление после указанной задержки
        setTimeout(() => {
            this.close(notification);
        }, duration);

        // Сохраняем уведомление в истории
        this.notifications.push({
            message,
            type,
            timestamp: Date.now()
        });

        // Ограничиваем количество уведомлений в истории
        if (this.notifications.length > this.maxNotifications) {
            this.notifications.shift();
        }
    }

    close(notification) {
        // Анимируем исчезновение
        notification.classList.add('notification-exit');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }

    getIcon(type) {
        switch (type) {
            case 'success':
                return `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 6L9 17l-5-5"/>
                    </svg>
                `;
            case 'error':
                return `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                `;
            case 'warning':
                return `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>
                `;
            default:
                return `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                `;
        }
    }

    handleNotification(data) {
        const { message, type } = data;
        this.show(message, type);
    }

    // Вспомогательные методы для разных типов уведомлений
    success(message) {
        this.show(message, 'success');
    }

    error(message) {
        this.show(message, 'error');
    }

    warning(message) {
        this.show(message, 'warning');
    }

    info(message) {
        this.show(message, 'info');
    }

    // Метод для показа уведомления о транзакции
    showTransactionNotification(transaction) {
        const message = `Транзакция ${transaction.status === 'completed' ? 'успешно выполнена' : 'не удалась'}`;
        this.show(message, transaction.status === 'completed' ? 'success' : 'error');
    }

    // Метод для показа уведомления о новом подарке
    showNewGiftNotification(gift) {
        const message = `Новый подарок: ${gift.name}`;
        this.show(message, 'info');
    }

    // Метод для показа уведомления о продаже
    showSaleNotification(gift) {
        const message = `Подарок "${gift.name}" успешно продан!`;
        this.show(message, 'success');
    }

    // Метод для показа уведомления о подключении кошелька
    showWalletNotification(connected) {
        const message = connected ? 'Кошелек успешно подключен' : 'Кошелек отключен';
        this.show(message, connected ? 'success' : 'warning');
    }

    // Метод для показа уведомления о загрузке
    showLoading(message = 'Загрузка...') {
        const notification = document.createElement('div');
        notification.className = 'notification notification-loading';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 12a9 9 0 11-6.219-8.56"/>
                    </svg>
                </div>
                <div class="notification-message">${message}</div>
            </div>
        `;

        this.container.appendChild(notification);
        return notification;
    }

    // Метод для удаления уведомления о загрузке
    removeLoading(notification) {
        if (notification) {
            this.close(notification);
        }
    }
}

// Создаем глобальный экземпляр
window.notificationManager = new NotificationManager(); 