class WebSocketManager {
    constructor(wss) {
        this.wss = wss;
        this.clients = new Map();
        this.init();
    }

    init() {
        this.wss.on('connection', this.handleConnection.bind(this));
    }

    handleConnection(ws, req) {
        try {
            // Получаем userId из URL
            const url = new URL(req.url, 'ws://localhost');
            const userId = url.searchParams.get('userId');

            if (!userId) {
                ws.close(1008, 'User ID is required');
                return;
            }

            // Сохраняем соединение
            this.clients.set(userId, ws);

            // Обработка сообщений
            ws.on('message', (message) => this.handleMessage(userId, message));

            // Обработка закрытия соединения
            ws.on('close', () => this.handleClose(userId));

            // Обработка ошибок
            ws.on('error', (error) => this.handleError(userId, error));

            // Отправляем приветственное сообщение
            this.sendToUser(userId, {
                type: 'CONNECTED',
                message: 'Successfully connected to WebSocket server'
            });
        } catch (error) {
            console.error('Error in handleConnection:', error);
            ws.close(1011, 'Internal server error');
        }
    }

    handleMessage(userId, message) {
        try {
            const data = JSON.parse(message);

            switch (data.type) {
                case 'SUBSCRIBE':
                    this.handleSubscribe(userId, data);
                    break;
                case 'UNSUBSCRIBE':
                    this.handleUnsubscribe(userId, data);
                    break;
                case 'PING':
                    this.handlePing(userId);
                    break;
                default:
                    console.warn('Unknown message type:', data.type);
            }
        } catch (error) {
            console.error('Error in handleMessage:', error);
            this.sendToUser(userId, {
                type: 'ERROR',
                message: 'Invalid message format'
            });
        }
    }

    handleClose(userId) {
        this.clients.delete(userId);
        console.log(`Client disconnected: ${userId}`);
    }

    handleError(userId, error) {
        console.error(`Error for client ${userId}:`, error);
        this.clients.delete(userId);
    }

    handleSubscribe(userId, data) {
        // Здесь можно добавить логику подписки на определенные события
        this.sendToUser(userId, {
            type: 'SUBSCRIBED',
            message: 'Successfully subscribed to updates'
        });
    }

    handleUnsubscribe(userId, data) {
        // Здесь можно добавить логику отписки от определенных событий
        this.sendToUser(userId, {
            type: 'UNSUBSCRIBED',
            message: 'Successfully unsubscribed from updates'
        });
    }

    handlePing(userId) {
        this.sendToUser(userId, {
            type: 'PONG',
            timestamp: Date.now()
        });
    }

    // Методы для отправки сообщений

    sendToUser(userId, data) {
        const client = this.clients.get(userId);
        if (client && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    }

    broadcast(data, excludeUserId = null) {
        this.clients.forEach((client, userId) => {
            if (userId !== excludeUserId && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    }

    // События для уведомлений

    notifyNewGift(gift) {
        this.broadcast({
            type: 'NEW_GIFT',
            gift
        });
    }

    notifyGiftUpdated(gift) {
        this.broadcast({
            type: 'GIFT_UPDATED',
            gift
        });
    }

    notifyGiftDeleted(giftId) {
        this.broadcast({
            type: 'GIFT_DELETED',
            giftId
        });
    }

    notifyNewCollection(collection) {
        this.broadcast({
            type: 'NEW_COLLECTION',
            collection
        });
    }

    notifyCollectionUpdated(collection) {
        this.broadcast({
            type: 'COLLECTION_UPDATED',
            collection
        });
    }

    notifyCollectionDeleted(collectionId) {
        this.broadcast({
            type: 'COLLECTION_DELETED',
            collectionId
        });
    }

    notifyNewTransaction(transaction) {
        this.broadcast({
            type: 'NEW_TRANSACTION',
            transaction
        });
    }

    notifyTransactionUpdated(transaction) {
        this.broadcast({
            type: 'TRANSACTION_UPDATED',
            transaction
        });
    }

    notifyNewReview(giftId, review) {
        this.broadcast({
            type: 'NEW_REVIEW',
            giftId,
            review
        });
    }

    notifyUserStatus(userId, status) {
        this.broadcast({
            type: 'USER_STATUS',
            userId,
            status
        });
    }
}

module.exports = WebSocketManager; 