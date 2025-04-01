// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();
tg.enableClosingConfirmation();

// DOM элементы
const starsGrid = document.getElementById('starsGrid');
const paymentModal = document.getElementById('paymentModal');
const userBalance = document.getElementById('userBalance');
const selectedPackage = document.getElementById('selectedPackage');
const packagePrice = document.getElementById('packagePrice');
const recipientUsername = document.getElementById('recipientUsername');

// Цены на Stars
const STAR_PRICES = {
    100: 0.5,
    500: 2.0,
    1000: 3.5,
    2000: 6.0,
    5000: 14.0,
    10000: 25.0
};

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// Инициализация приложения
async function initApp() {
    try {
        // Получаем данные пользователя
        const user = tg.initDataUnsafe.user;
        if (!user) {
            throw new Error('User data not available');
        }

        // Загружаем баланс пользователя
        await loadUserBalance();

        // Инициализируем сетку Stars
        initStarsGrid();

        // Сообщаем Telegram что приложение готово
        tg.ready();
    } catch (error) {
        console.error('Error initializing app:', error);
        showError('Ошибка инициализации приложения');
    }
}

// Загрузка баланса пользователя
async function loadUserBalance() {
    try {
        const response = await fetch('/api/telegram/balance');
        const data = await response.json();
        userBalance.textContent = `${data.balance} TON`;
    } catch (error) {
        console.error('Error loading balance:', error);
        userBalance.textContent = '0 TON';
    }
}

// Инициализация сетки пакетов Stars
function initStarsGrid() {
    starsGrid.innerHTML = '';
    
    for (const [amount, price] of Object.entries(STAR_PRICES)) {
        const package = document.createElement('div');
        package.className = 'star-package';
        package.innerHTML = `
            <div class="star-amount">${amount} ⭐️</div>
            <div class="star-price">${price} TON</div>
            <button class="btn" onclick="openPaymentModal(${amount}, ${price})">
                Купить
            </button>
        `;
        starsGrid.appendChild(package);
    }
}

// Открытие модального окна оплаты
function openPaymentModal(amount, price) {
    selectedPackage.textContent = `${amount} Stars`;
    packagePrice.textContent = `${price} TON`;
    paymentModal.style.display = 'block';
}

// Закрытие модального окна оплаты
function closePaymentModal() {
    paymentModal.style.display = 'none';
    recipientUsername.value = '';
}

// Подтверждение оплаты
async function confirmPayment() {
    const username = recipientUsername.value.trim();
    if (!username) {
        showError('Пожалуйста, введите username получателя');
        return;
    }

    try {
        const data = {
            action: 'buy_stars',
            recipient: username,
            amount: parseInt(selectedPackage.textContent),
            price: parseFloat(packagePrice.textContent)
        };

        // Отправляем данные в Telegram
        tg.sendData(JSON.stringify(data));
        
        // Закрываем модальное окно
        closePaymentModal();
    } catch (error) {
        console.error('Error confirming payment:', error);
        showError('Ошибка при подтверждении оплаты');
    }
}

// Показ ошибки
function showError(message) {
    tg.showPopup({
        title: 'Ошибка',
        message: message,
        buttons: [{
            type: 'ok'
        }]
    });
}

// Обработка данных от Telegram
tg.onEvent('mainButtonClicked', () => {
    tg.sendData(JSON.stringify({
        action: 'close_app'
    }));
}); 