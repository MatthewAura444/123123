class TonConnect {
    constructor() {
        this.manifestUrl = 'https://your-domain.com/tonconnect-manifest.json';
        this.buttonRootId = 'ton-connect';
        this.connected = false;
        this.account = null;
        this.connector = null;
    }

    async init() {
        try {
            // Проверяем, установлен ли TonConnect
            if (typeof window.tonConnectUI === 'undefined') {
                console.error('TonConnect не установлен');
                return;
            }

            // Инициализируем TonConnect
            this.connector = new window.tonConnectUI.TonConnect({
                manifestUrl: this.manifestUrl,
                buttonRootId: this.buttonRootId
            });

            // Подписываемся на события
            this.connector.onStatusChange(wallet => {
                this.connected = !!wallet;
                this.account = wallet;
                this.onStatusChange(wallet);
            });

            // Проверяем текущее состояние подключения
            const wallet = await this.connector.getWallet();
            if (wallet) {
                this.connected = true;
                this.account = wallet;
                this.onStatusChange(wallet);
            }
        } catch (error) {
            console.error('Ошибка инициализации TonConnect:', error);
        }
    }

    async connect() {
        try {
            if (!this.connector) {
                await this.init();
            }

            const wallet = await this.connector.connectWallet();
            this.connected = true;
            this.account = wallet;
            return wallet;
        } catch (error) {
            console.error('Ошибка подключения кошелька:', error);
            throw error;
        }
    }

    async disconnect() {
        try {
            if (this.connector) {
                await this.connector.disconnect();
                this.connected = false;
                this.account = null;
            }
        } catch (error) {
            console.error('Ошибка отключения кошелька:', error);
            throw error;
        }
    }

    async sendTransaction(transaction) {
        try {
            if (!this.connected) {
                throw new Error('Кошелек не подключен');
            }

            const result = await this.connector.sendTransaction(transaction);
            return result;
        } catch (error) {
            console.error('Ошибка отправки транзакции:', error);
            throw error;
        }
    }

    onStatusChange(wallet) {
        // Событие изменения статуса подключения
        const event = new CustomEvent('tonConnectStatusChange', {
            detail: { wallet, connected: !!wallet }
        });
        window.dispatchEvent(event);
    }

    getAccount() {
        return this.account;
    }

    isConnected() {
        return this.connected;
    }
}

// Создаем глобальный экземпляр
window.tonConnect = new TonConnect();

// Инициализируем при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.tonConnect.init();
}); 