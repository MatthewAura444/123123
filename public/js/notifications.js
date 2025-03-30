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
        
        // Добавляем стили
        this.addStyles();
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.className = 'notifications-container';
        document.body.appendChild(this.container);
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .notifications-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-width: 400px;
                pointer-events: none;
            }

            .notification {
                background: var(--surface-color);
                border-radius: 8px;
                padding: 16px;
                box-shadow: var(--shadow-md);
                display: flex;
                align-items: flex-start;
                gap: 12px;
                pointer-events: auto;
                animation: slideIn 0.3s ease forwards;
                position: relative;
                overflow: hidden;
            }

            .notification::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 4px;
                height: 100%;
                background: var(--primary-color);
            }

            .notification.success::before {
                background: var(--success-color);
            }

            .notification.error::before {
                background: var(--error-color);
            }

            .notification.warning::before {
                background: var(--warning-color);
            }

            .notification.info::before {
                background: var(--info-color);
            }

            .notification-icon {
                width: 24px;
                height: 24px;
                flex-shrink: 0;
            }

            .notification-content {
                flex: 1;
            }

            .notification-title {
                font-weight: 600;
                margin: 0 0 4px;
                color: var(--text-primary);
            }

            .notification-message {
                margin: 0;
                color: var(--text-muted);
                font-size: 0.875rem;
            }

            .notification-close {
                width: 20px;
                height: 20px;
                flex-shrink: 0;
                cursor: pointer;
                opacity: 0.5;
                transition: opacity 0.2s ease;
            }

            .notification-close:hover {
                opacity: 1;
            }

            .notification-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: var(--primary-color);
                transition: width 0.1s linear;
            }

            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }

            @media (max-width: 768px) {
                .notifications-container {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }
            }
        `;
        document.head.appendChild(style);
    }

    show(message, options = {}) {
        const {
            type = 'info',
            title = '',
            duration = 5000,
            closable = true,
            icon = this.getIcon(type)
        } = options;

        // Создаем уведомление
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        notification.innerHTML = `
            <div class="notification-icon">${icon}</div>
            <div class="notification-content">
                ${title ? `<div class="notification-title">${title}</div>` : ''}
                <div class="notification-message">${message}</div>
            </div>
            ${closable ? '<div class="notification-close">&times;</div>' : ''}
            <div class="notification-progress"></div>
        `;

        // Добавляем в контейнер
        this.container.appendChild(notification);

        // Анимируем появление
        window.animationManager.animateNotificationEnter(notification);

        // Добавляем обработчики
        if (closable) {
            const closeBtn = notification.querySelector('.notification-close');
            closeBtn.addEventListener('click', () => this.close(notification));
        }

        // Добавляем в массив
        this.notifications.push(notification);

        // Ограничиваем количество уведомлений
        if (this.notifications.length > this.maxNotifications) {
            this.close(this.notifications[0]);
        }

        // Устанавливаем таймер для автоматического закрытия
        if (duration > 0) {
            const progress = notification.querySelector('.notification-progress');
            const startTime = Date.now();
            
            const updateProgress = () => {
                const elapsed = Date.now() - startTime;
                const remaining = duration - elapsed;
                
                if (remaining <= 0) {
                    this.close(notification);
                    return;
                }
                
                progress.style.width = `${(remaining / duration) * 100}%`;
                requestAnimationFrame(updateProgress);
            };
            
            updateProgress();
            
            setTimeout(() => {
                this.close(notification);
            }, duration);
        }

        return notification;
    }

    success(message, options = {}) {
        return this.show(message, { ...options, type: 'success' });
    }

    error(message, options = {}) {
        return this.show(message, { ...options, type: 'error' });
    }

    warning(message, options = {}) {
        return this.show(message, { ...options, type: 'warning' });
    }

    info(message, options = {}) {
        return this.show(message, { ...options, type: 'info' });
    }

    close(notification) {
        if (!notification) return;

        // Анимируем исчезновение
        notification.style.animation = 'slideOut 0.3s ease forwards';

        // Удаляем после завершения анимации
        notification.addEventListener('animationend', () => {
            notification.remove();
            this.notifications = this.notifications.filter(n => n !== notification);
        });
    }

    closeAll() {
        this.notifications.forEach(notification => this.close(notification));
    }

    getIcon(type) {
        const icons = {
            success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 6L9 17l-5-5"/>
            </svg>`,
            error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
            </svg>`,
            warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>`,
            info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4M12 8h.01"/>
            </svg>`
        };

        return icons[type] || icons.info;
    }

    showLoading(message = 'Загрузка...') {
        const notification = this.show(message, {
            closable: false,
            duration: 0,
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" stroke-dasharray="60" stroke-dashoffset="60"/>
            </svg>`
        });

        // Анимируем иконку загрузки
        const icon = notification.querySelector('.notification-icon svg');
        icon.style.animation = 'spin 1s linear infinite';

        return notification;
    }

    removeLoading(notification) {
        if (notification) {
            this.close(notification);
        }
    }
}

// Создаем глобальный экземпляр менеджера уведомлений
window.notificationManager = new NotificationManager(); 