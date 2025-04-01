class AnalyticsManager {
    constructor() {
        this.events = [];
        this.userId = null;
        this.sessionId = this.generateSessionId();
        this.init();
    }

    generateSessionId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    async init() {
        try {
            const userData = await window.Telegram.WebApp.getUserData();
            this.userId = userData.id;
            this.trackEvent('session_start', {
                platform: 'telegram',
                language: navigator.language,
                screen_size: `${window.innerWidth}x${window.innerHeight}`
            });
        } catch (error) {
            console.error('Failed to initialize analytics:', error);
        }
    }

    trackEvent(eventName, properties = {}) {
        const event = {
            event_name: eventName,
            user_id: this.userId,
            session_id: this.sessionId,
            timestamp: new Date().toISOString(),
            properties: {
                ...properties,
                url: window.location.href,
                referrer: document.referrer,
                user_agent: navigator.userAgent
            }
        };

        this.events.push(event);
        this.sendEvent(event);
    }

    async sendEvent(event) {
        try {
            const response = await fetch('/api/analytics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(event)
            });

            if (!response.ok) {
                throw new Error('Failed to send analytics event');
            }
        } catch (error) {
            console.error('Failed to send analytics event:', error);
            // Сохраняем событие в localStorage для повторной отправки
            this.saveFailedEvent(event);
        }
    }

    saveFailedEvent(event) {
        const failedEvents = JSON.parse(localStorage.getItem('failed_analytics_events') || '[]');
        failedEvents.push(event);
        localStorage.setItem('failed_analytics_events', JSON.stringify(failedEvents));
    }

    async retryFailedEvents() {
        const failedEvents = JSON.parse(localStorage.getItem('failed_analytics_events') || '[]');
        if (failedEvents.length === 0) return;

        for (const event of failedEvents) {
            try {
                await this.sendEvent(event);
                failedEvents.splice(failedEvents.indexOf(event), 1);
                localStorage.setItem('failed_analytics_events', JSON.stringify(failedEvents));
            } catch (error) {
                console.error('Failed to retry analytics event:', error);
            }
        }
    }

    // Методы для отслеживания конкретных событий
    trackPageView(pageName) {
        this.trackEvent('page_view', { page_name: pageName });
    }

    trackCollectionView(collectionId, collectionName) {
        this.trackEvent('collection_view', {
            collection_id: collectionId,
            collection_name: collectionName
        });
    }

    trackGiftView(giftId, giftName) {
        this.trackEvent('gift_view', {
            gift_id: giftId,
            gift_name: giftName
        });
    }

    trackCollectionCreate(collectionId, collectionName) {
        this.trackEvent('collection_create', {
            collection_id: collectionId,
            collection_name: collectionName
        });
    }

    trackGiftCreate(giftId, giftName) {
        this.trackEvent('gift_create', {
            gift_id: giftId,
            gift_name: giftName
        });
    }

    trackPurchase(giftId, giftName, price) {
        this.trackEvent('purchase', {
            gift_id: giftId,
            gift_name: giftName,
            price: price
        });
    }

    trackSearch(query, resultsCount) {
        this.trackEvent('search', {
            query: query,
            results_count: resultsCount
        });
    }

    trackFilter(filterType, value) {
        this.trackEvent('filter_apply', {
            filter_type: filterType,
            value: value
        });
    }

    trackUserAction(action, context) {
        this.trackEvent('user_action', {
            action: action,
            context: context
        });
    }
}

// Создаем глобальный экземпляр менеджера аналитики
window.analyticsManager = new AnalyticsManager();

// Автоматически отслеживаем просмотры страниц
document.addEventListener('DOMContentLoaded', () => {
    const pageName = document.title;
    window.analyticsManager.trackPageView(pageName);
});

// Периодически пытаемся отправить неудачные события
setInterval(() => {
    window.analyticsManager.retryFailedEvents();
}, 5 * 60 * 1000); // Каждые 5 минут 