class WebSocketManager {
    constructor() {
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.eventHandlers = new Map();
        this.isConnected = false;
        this.init();
    }

    init() {
        this.connect();
        this.setupEventHandlers();
    }

    connect() {
        try {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${protocol}//${window.location.hostname}:${window.location.port}/ws`;
            
            this.ws = new WebSocket(wsUrl);
            
            this.ws.onopen = this.handleOpen.bind(this);
            this.ws.onclose = this.handleClose.bind(this);
            this.ws.onerror = this.handleError.bind(this);
            this.ws.onmessage = this.handleMessage.bind(this);
        } catch (error) {
            console.error('Failed to connect to WebSocket:', error);
            this.handleError(error);
        }
    }

    setupEventHandlers() {
        // Обработчики для различных событий
        this.on('market_update', this.handleMarketUpdate.bind(this));
        this.on('gift_update', this.handleGiftUpdate.bind(this));
        this.on('collection_update', this.handleCollectionUpdate.bind(this));
        this.on('user_update', this.handleUserUpdate.bind(this));
        this.on('transaction_update', this.handleTransactionUpdate.bind(this));
        this.on('notification', this.handleNotification.bind(this));
    }

    handleOpen() {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Отправляем информацию о пользователе
        if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
            this.send('auth', {
                user: window.Telegram.WebApp.initDataUnsafe.user
            });
        }
    }

    handleClose() {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        this.attemptReconnect();
    }

    handleError(error) {
        console.error('WebSocket error:', error);
        this.isConnected = false;
        this.attemptReconnect();
    }

    handleMessage(event) {
        try {
            const data = JSON.parse(event.data);
            const { type, payload } = data;

            // Вызываем обработчик события, если он существует
            const handler = this.eventHandlers.get(type);
            if (handler) {
                handler(payload);
            }
        } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
        }
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            
            setTimeout(() => {
                this.connect();
            }, this.reconnectDelay * this.reconnectAttempts);
        } else {
            console.error('Max reconnection attempts reached');
            window.notificationManager.error('Соединение потеряно. Пожалуйста, обновите страницу.');
        }
    }

    send(type, payload) {
        if (this.isConnected && this.ws) {
            this.ws.send(JSON.stringify({ type, payload }));
        } else {
            console.warn('WebSocket is not connected');
        }
    }

    on(type, handler) {
        this.eventHandlers.set(type, handler);
    }

    off(type) {
        this.eventHandlers.delete(type);
    }

    // Обработчики конкретных событий
    handleMarketUpdate(data) {
        // Обновляем данные рынка
        if (window.marketManager) {
            window.marketManager.updateMarketData(data);
        }
    }

    handleGiftUpdate(data) {
        // Обновляем данные подарка
        if (window.giftManager) {
            window.giftManager.updateGiftData(data);
        }
    }

    handleCollectionUpdate(data) {
        // Обновляем данные коллекции
        if (window.collectionManager) {
            window.collectionManager.updateCollectionData(data);
        }
    }

    handleUserUpdate(data) {
        // Обновляем данные пользователя
        if (window.profileManager) {
            window.profileManager.updateUserData(data);
        }
    }

    handleTransactionUpdate(data) {
        // Обновляем статус транзакции
        if (window.transactionManager) {
            window.transactionManager.updateTransactionStatus(data);
        }
    }

    handleNotification(data) {
        // Показываем уведомление
        if (window.notificationManager) {
            window.notificationManager.show(data.message, {
                type: data.type,
                title: data.title
            });
        }
    }

    // Методы для подписки на обновления
    subscribeToMarket() {
        this.send('subscribe', { type: 'market' });
    }

    subscribeToGift(giftId) {
        this.send('subscribe', { type: 'gift', id: giftId });
    }

    subscribeToCollection(collectionId) {
        this.send('subscribe', { type: 'collection', id: collectionId });
    }

    subscribeToUser(userId) {
        this.send('subscribe', { type: 'user', id: userId });
    }

    // Методы для отписки от обновлений
    unsubscribeFromMarket() {
        this.send('unsubscribe', { type: 'market' });
    }

    unsubscribeFromGift(giftId) {
        this.send('unsubscribe', { type: 'gift', id: giftId });
    }

    unsubscribeFromCollection(collectionId) {
        this.send('unsubscribe', { type: 'collection', id: collectionId });
    }

    unsubscribeFromUser(userId) {
        this.send('unsubscribe', { type: 'user', id: userId });
    }

    // Метод для проверки состояния соединения
    isWebSocketConnected() {
        return this.isConnected && this.ws?.readyState === WebSocket.OPEN;
    }

    // Метод для принудительного переподключения
    reconnect() {
        if (this.ws) {
            this.ws.close();
        }
        this.reconnectAttempts = 0;
        this.connect();
    }
}

// Создаем глобальный экземпляр менеджера WebSocket
window.wsClient = new WebSocketManager();

// Инициализируем при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
        window.wsClient.connect();
    }
}); 