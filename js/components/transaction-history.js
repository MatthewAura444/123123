// Компонент истории транзакций

class TransactionHistory {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.transactions = [];
        this.setupEventListeners();
    }

    setupEventListeners() {
        window.addEventListener('transactionUpdate', (event) => {
            this.handleTransactionUpdate(event.detail.transaction);
        });

        window.addEventListener('walletBalanceUpdate', (event) => {
            this.handleBalanceUpdate(event.detail);
        });
    }

    async handleTransactionUpdate(transaction) {
        this.transactions.unshift(transaction);
        this.render();
        this.showNotification(transaction);
    }

    handleBalanceUpdate({ walletId, balance }) {
        const wallet = walletManager.wallets.get(walletId);
        if (wallet) {
            this.showBalanceNotification(wallet, balance);
        }
    }

    render() {
        if (!this.container) return;

        const template = document.createElement('template');
        template.innerHTML = `
            <div class="transaction-history">
                <h3>История транзакций</h3>
                <div class="transaction-list">
                    ${this.transactions.map(transaction => this.renderTransaction(transaction)).join('')}
                </div>
            </div>
        `;

        this.container.innerHTML = '';
        this.container.appendChild(template.content.cloneNode(true));
    }

    renderTransaction(transaction) {
        const wallet = walletManager.wallets.get(transaction.walletId);
        const date = new Date(transaction.timestamp).toLocaleString();
        
        return `
            <div class="transaction-item ${transaction.status}">
                <div class="transaction-header">
                    <span class="transaction-date">${date}</span>
                    <span class="transaction-status">${this.getStatusText(transaction.status)}</span>
                </div>
                <div class="transaction-details">
                    <span class="wallet-address">${wallet?.address || 'Unknown'}</span>
                    <span class="transaction-amount">${transaction.amount} TON</span>
                </div>
                <div class="transaction-hash">
                    <a href="https://tonscan.org/tx/${transaction.hash}" target="_blank">
                        ${transaction.hash.slice(0, 8)}...${transaction.hash.slice(-8)}
                    </a>
                </div>
            </div>
        `;
    }

    getStatusText(status) {
        const statusMap = {
            pending: 'В обработке',
            completed: 'Завершено',
            failed: 'Ошибка',
            cancelled: 'Отменено'
        };
        return statusMap[status] || status;
    }

    showNotification(transaction) {
        const notification = document.createElement('div');
        notification.className = `notification transaction-notification ${transaction.status}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getStatusIcon(transaction.status)}</span>
                <span class="notification-text">${this.getNotificationText(transaction)}</span>
            </div>
            <button class="notification-close">✕</button>
        `;

        document.body.appendChild(notification);

        // Анимация появления
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // Закрытие уведомления
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.onclick = () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        };

        // Автоматическое закрытие через 5 секунд
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    showBalanceNotification(wallet, balance) {
        const notification = document.createElement('div');
        notification.className = 'notification balance-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">💰</span>
                <span class="notification-text">Баланс кошелька ${wallet.address.slice(0, 8)}... обновлен: ${balance} TON</span>
            </div>
            <button class="notification-close">✕</button>
        `;

        document.body.appendChild(notification);

        // Анимация появления
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // Закрытие уведомления
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.onclick = () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        };

        // Автоматическое закрытие через 3 секунды
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }
        }, 3000);
    }

    getStatusIcon(status) {
        const iconMap = {
            pending: '⏳',
            completed: '✅',
            failed: '❌',
            cancelled: '🚫'
        };
        return iconMap[status] || '❓';
    }

    getNotificationText(transaction) {
        const wallet = walletManager.wallets.get(transaction.walletId);
        const amount = transaction.amount;
        const status = this.getStatusText(transaction.status);
        
        return `Транзакция ${amount} TON на кошелек ${wallet?.address.slice(0, 8)}... ${status}`;
    }
}

// Добавляем стили
const styles = document.createElement('style');
styles.textContent = `
    .transaction-history {
        background: var(--tg-theme-secondary-bg-color);
        border-radius: 12px;
        padding: 20px;
        margin: 20px 0;
    }

    .transaction-list {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }

    .transaction-item {
        background: var(--tg-theme-bg-color);
        border-radius: 8px;
        padding: 15px;
        transition: transform 0.2s;
    }

    .transaction-item:hover {
        transform: translateY(-2px);
    }

    .transaction-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
    }

    .transaction-date {
        color: var(--tg-theme-hint-color);
        font-size: 0.9em;
    }

    .transaction-status {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.8em;
    }

    .transaction-status.pending {
        background: #ffd700;
        color: #000;
    }

    .transaction-status.completed {
        background: #4CAF50;
        color: white;
    }

    .transaction-status.failed {
        background: #f44336;
        color: white;
    }

    .transaction-status.cancelled {
        background: #9e9e9e;
        color: white;
    }

    .transaction-details {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
    }

    .wallet-address {
        font-family: monospace;
        color: var(--tg-theme-text-color);
    }

    .transaction-amount {
        font-weight: bold;
        color: var(--tg-theme-text-color);
    }

    .transaction-hash {
        font-size: 0.8em;
    }

    .transaction-hash a {
        color: var(--tg-theme-link-color);
        text-decoration: none;
    }

    .notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--tg-theme-secondary-bg-color);
        border-radius: 12px;
        padding: 15px;
        display: flex;
        align-items: center;
        gap: 10px;
        transform: translateX(120%);
        transition: transform 0.3s ease;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .notification.show {
        transform: translateX(0);
    }

    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .notification-icon {
        font-size: 1.2em;
    }

    .notification-text {
        color: var(--tg-theme-text-color);
    }

    .notification-close {
        background: none;
        border: none;
        color: var(--tg-theme-hint-color);
        cursor: pointer;
        padding: 4px;
        font-size: 1.2em;
    }

    .notification-close:hover {
        color: var(--tg-theme-text-color);
    }
`;
document.head.appendChild(styles);

// Экспортируем компонент
window.TransactionHistory = TransactionHistory; 