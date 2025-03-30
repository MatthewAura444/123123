class WebSocketClient {
    constructor() {
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.handlers = new Map();
        this.connected = false;
    }

    connect(userId) {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws?userId=${userId}`;

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            console.log('WebSocket подключен');
            this.connected = true;
            this.reconnectAttempts = 0;
            this.emit('connected');
        };

        this.ws.onclose = () => {
            console.log('WebSocket отключен');
            this.connected = false;
            this.emit('disconnected');
            this.reconnect();
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket ошибка:', error);
            this.emit('error', error);
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            } catch (error) {
                console.error('Ошибка обработки сообщения:', error);
            }
        };
    }

    reconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Попытка переподключения ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
            
            setTimeout(() => {
                if (this.ws.readyState === WebSocket.CLOSED) {
                    this.connect();
                }
            }, this.reconnectDelay * this.reconnectAttempts);
        } else {
            console.error('Превышено максимальное количество попыток переподключения');
            this.emit('maxReconnectAttemptsReached');
        }
    }

    handleMessage(data) {
        const { type, payload } = data;
        
        switch (type) {
            case 'GIFT_ADDED':
                this.emit('giftAdded', payload);
                break;
            case 'GIFT_SOLD':
                this.emit('giftSold', payload);
                break;
            case 'COLLECTION_ADDED':
                this.emit('collectionAdded', payload);
                break;
            case 'USER_UPDATE':
                this.emit('userUpdate', payload);
                break;
            case 'TRANSACTION_UPDATE':
                this.emit('transactionUpdate', payload);
                break;
            default:
                console.warn('Неизвестный тип сообщения:', type);
        }
    }

    send(data) {
        if (this.connected && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        } else {
            console.error('WebSocket не подключен');
        }
    }

    on(event, handler) {
        if (!this.handlers.has(event)) {
            this.handlers.set(event, new Set());
        }
        this.handlers.get(event).add(handler);
    }

    off(event, handler) {
        if (this.handlers.has(event)) {
            this.handlers.get(event).delete(handler);
        }
    }

    emit(event, data) {
        if (this.handlers.has(event)) {
            this.handlers.get(event).forEach(handler => handler(data));
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
            this.connected = false;
            this.emit('disconnected');
        }
    }

    isConnected() {
        return this.connected;
    }
}

// Создаем глобальный экземпляр
window.wsClient = new WebSocketClient();

// Инициализируем при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Получаем userId из Telegram Web App
    const tg = window.Telegram.WebApp;
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        window.wsClient.connect(tg.initDataUnsafe.user.id);
    }
}); 