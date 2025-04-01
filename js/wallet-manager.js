// Менеджер кошельков

class WalletManager {
    constructor() {
        this.wallets = new Map();
        this.transactions = new Map();
        this.balanceUpdateInterval = 30000; // 30 секунд
        this.loadWallets();
        this.startBalanceUpdates();
    }

    // Загрузка кошельков из localStorage
    async loadWallets() {
        try {
            const encryptedWallets = localStorage.getItem('wallets');
            if (encryptedWallets) {
                const wallets = await SecurityUtils.Encryption.decrypt(
                    JSON.parse(encryptedWallets),
                    'your-secret-key'
                );
                wallets.forEach(wallet => this.wallets.set(wallet.id, wallet));
            }
        } catch (error) {
            SecurityUtils.Logger.log('ERROR', 'Error loading wallets', error);
        }
    }

    // Сохранение кошельков в localStorage
    async saveWallets() {
        try {
            const wallets = Array.from(this.wallets.values());
            const encryptedWallets = await SecurityUtils.Encryption.encrypt(
                wallets,
                'your-secret-key'
            );
            localStorage.setItem('wallets', JSON.stringify(encryptedWallets));
        } catch (error) {
            SecurityUtils.Logger.log('ERROR', 'Error saving wallets', error);
        }
    }

    // Добавление нового кошелька
    async addWallet(type, address) {
        try {
            // Валидация адреса
            if (!this.validateWalletAddress(type, address)) {
                throw new Error('Invalid wallet address');
            }

            const wallet = {
                id: crypto.randomUUID(),
                type,
                address,
                balance: 0,
                createdAt: Date.now(),
                lastUpdated: Date.now()
            };

            this.wallets.set(wallet.id, wallet);
            await this.saveWallets();
            SecurityUtils.Logger.log('INFO', `Wallet added: ${type} - ${address}`);
            return wallet;
        } catch (error) {
            SecurityUtils.Logger.log('ERROR', 'Error adding wallet', error);
            throw error;
        }
    }

    // Удаление кошелька
    async removeWallet(walletId) {
        try {
            this.wallets.delete(walletId);
            await this.saveWallets();
            SecurityUtils.Logger.log('INFO', `Wallet removed: ${walletId}`);
        } catch (error) {
            SecurityUtils.Logger.log('ERROR', 'Error removing wallet', error);
            throw error;
        }
    }

    // Валидация адреса кошелька
    validateWalletAddress(type, address) {
        switch (type) {
            case 'telegram':
                return SecurityUtils.WalletValidator.validateTelegramAddress(address);
            case 'tonkeeper':
                return SecurityUtils.WalletValidator.validateTonkeeperAddress(address);
            case 'mytonwallet':
                return SecurityUtils.WalletValidator.validateMyTonWalletAddress(address);
            case 'tonhub':
                return SecurityUtils.WalletValidator.validateTonHubAddress(address);
            default:
                return false;
        }
    }

    // Обновление баланса кошелька
    async updateWalletBalance(walletId) {
        try {
            const wallet = this.wallets.get(walletId);
            if (!wallet) throw new Error('Wallet not found');

            let balance;
            switch (wallet.type) {
                case 'telegram':
                    balance = await this.getTelegramWalletBalance(wallet.address);
                    break;
                case 'tonkeeper':
                    balance = await this.getTonkeeperBalance(wallet.address);
                    break;
                case 'mytonwallet':
                    balance = await this.getMyTonWalletBalance(wallet.address);
                    break;
                case 'tonhub':
                    balance = await this.getTonHubBalance(wallet.address);
                    break;
            }

            wallet.balance = balance;
            wallet.lastUpdated = Date.now();
            await this.saveWallets();
            this.notifyBalanceUpdate(walletId, balance);
        } catch (error) {
            SecurityUtils.Logger.log('ERROR', 'Error updating wallet balance', error);
            throw error;
        }
    }

    // Автоматическое обновление балансов
    startBalanceUpdates() {
        setInterval(() => {
            this.wallets.forEach((wallet, walletId) => {
                this.updateWalletBalance(walletId);
            });
        }, this.balanceUpdateInterval);
    }

    // Получение баланса Telegram Wallet
    async getTelegramWalletBalance(address) {
        // Реализация получения баланса Telegram Wallet
        return 0;
    }

    // Получение баланса Tonkeeper
    async getTonkeeperBalance(address) {
        // Реализация получения баланса Tonkeeper
        return 0;
    }

    // Получение баланса MyTonWallet
    async getMyTonWalletBalance(address) {
        // Реализация получения баланса MyTonWallet
        return 0;
    }

    // Получение баланса TonHub
    async getTonHubBalance(address) {
        // Реализация получения баланса TonHub
        return 0;
    }

    // Добавление транзакции
    async addTransaction(walletId, transaction) {
        try {
            // Проверка на дубликаты
            if (await SecurityUtils.TransactionProtection.checkDuplicateTransaction(transaction.id)) {
                throw new Error('Duplicate transaction');
            }

            const wallet = this.wallets.get(walletId);
            if (!wallet) throw new Error('Wallet not found');

            transaction.walletId = walletId;
            transaction.timestamp = Date.now();
            transaction.status = 'pending';

            this.transactions.set(transaction.id, transaction);
            SecurityUtils.TransactionProtection.addTransaction(transaction.id);
            
            // Обновляем баланс
            await this.updateWalletBalance(walletId);
            
            // Отправляем уведомление
            this.notifyTransactionUpdate(transaction);
        } catch (error) {
            SecurityUtils.Logger.log('ERROR', 'Error adding transaction', error);
            throw error;
        }
    }

    // Уведомление об обновлении баланса
    notifyBalanceUpdate(walletId, balance) {
        const event = new CustomEvent('walletBalanceUpdate', {
            detail: { walletId, balance }
        });
        window.dispatchEvent(event);
    }

    // Уведомление об обновлении транзакции
    notifyTransactionUpdate(transaction) {
        const event = new CustomEvent('transactionUpdate', {
            detail: { transaction }
        });
        window.dispatchEvent(event);
    }

    // Получение истории транзакций
    getTransactionHistory(walletId) {
        return Array.from(this.transactions.values())
            .filter(t => t.walletId === walletId)
            .sort((a, b) => b.timestamp - a.timestamp);
    }
}

// Создаем экземпляр менеджера кошельков
const walletManager = new WalletManager();

// Экспортируем менеджер
window.walletManager = walletManager; 