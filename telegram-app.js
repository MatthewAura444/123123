// Инициализация Telegram WebApp
let tg = window.Telegram.WebApp;

// Инициализация переменных
let starsGrid = document.querySelector('.stars-grid');
let paymentModal = document.getElementById('paymentModal');
let modalClose = document.querySelector('.modal-close');
let payButton = document.getElementById('payButton');
let starsAmount = document.getElementById('starsAmount');
let paymentAmount = document.getElementById('paymentAmount');
let recipientInput = document.getElementById('recipientInput');
let userBalance = document.getElementById('userBalance');

// Цены на Stars
const STAR_PRICES = {
    100: 0.5,    // 100 Stars за 0.5 TON
    500: 2.0,    // 500 Stars за 2.0 TON
    1000: 3.5,   // 1000 Stars за 3.5 TON
    2000: 6.0,   // 2000 Stars за 6.0 TON
    5000: 14.0,  // 5000 Stars за 14.0 TON
    10000: 25.0  // 10000 Stars за 25.0 TON
};

// Установка темы
function setTheme() {
    document.documentElement.className = tg.colorScheme;
    document.documentElement.style.setProperty('--tg-theme-bg-color', tg.backgroundColor);
    document.documentElement.style.setProperty('--tg-theme-text-color', tg.textColor);
    document.documentElement.style.setProperty('--tg-theme-hint-color', tg.hintColor);
    document.documentElement.style.setProperty('--tg-theme-link-color', tg.linkColor);
    document.documentElement.style.setProperty('--tg-theme-button-color', tg.buttonColor);
    document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.buttonTextColor);
}

// Загрузка баланса пользователя
async function loadUserBalance() {
    try {
        const response = await fetch('/api/telegram/balance', {
            headers: {
                'X-Telegram-Init-Data': tg.initData
            }
        });
        const data = await response.json();
        userBalance.textContent = `${data.balance} Stars`;
    } catch (error) {
        console.error('Ошибка загрузки баланса:', error);
        userBalance.textContent = '0 Stars';
    }
}

// Инициализация сетки Stars
function initStarsGrid() {
    starsGrid.innerHTML = Object.entries(STAR_PRICES).map(([amount, price]) => `
        <div class="stars-card" data-amount="${amount}" data-price="${price}">
            <div class="stars-amount">
                <i class="fas fa-star"></i>
                <span>${amount}</span>
            </div>
            <div class="stars-price">
                <img src="https://ton.org/download/ton_symbol.svg" alt="TON" class="ton-logo">
                <span>${price} TON</span>
            </div>
            <button class="buy-button">
                <i class="fas fa-shopping-cart"></i>
                Купить
            </button>
        </div>
    `).join('');

    // Добавляем обработчики для карточек
    starsGrid.querySelectorAll('.stars-card').forEach(card => {
        card.querySelector('.buy-button').addEventListener('click', () => {
            const amount = parseInt(card.dataset.amount);
            const price = parseFloat(card.dataset.price);
            openPaymentModal(amount, price);
        });
    });
}

// Открытие модального окна оплаты
function openPaymentModal(amount, price) {
    starsAmount.textContent = amount;
    paymentAmount.textContent = `${price} TON`;
    paymentModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Закрытие модального окна
function closePaymentModal() {
    paymentModal.classList.remove('active');
    document.body.style.overflow = '';
    recipientInput.value = '';
}

// Обработка оплаты
async function handlePayment() {
    const amount = parseInt(starsAmount.textContent);
    const price = parseFloat(paymentAmount.textContent);
    const recipient = recipientInput.value.trim();

    if (!recipient) {
        tg.showPopup({
            title: 'Ошибка',
            message: 'Пожалуйста, укажите получателя Stars',
            buttons: [{type: 'ok'}]
        });
        return;
    }

    try {
        const response = await fetch('/api/telegram/purchase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Telegram-Init-Data': tg.initData
            },
            body: JSON.stringify({
                amount,
                price,
                recipient
            })
        });

        const data = await response.json();

        if (response.ok) {
            closePaymentModal();
            tg.showPopup({
                title: 'Успех',
                message: `Stars успешно отправлены пользователю ${recipient}!`,
                buttons: [{type: 'ok'}]
            });
            loadUserBalance();
        } else {
            throw new Error(data.message || 'Ошибка при обработке платежа');
        }
    } catch (error) {
        console.error('Ошибка оплаты:', error);
        tg.showPopup({
            title: 'Ошибка',
            message: error.message || 'Произошла ошибка при обработке платежа',
            buttons: [{type: 'ok'}]
        });
    }
}

// Инициализация приложения
function initApp() {
    // Расширяем на весь экран
    tg.expand();

    // Устанавливаем тему
    setTheme();

    // Загружаем баланс пользователя
    loadUserBalance();

    // Инициализируем сетку Stars
    initStarsGrid();

    // Добавляем обработчики событий
    modalClose.addEventListener('click', closePaymentModal);
    payButton.addEventListener('click', handlePayment);

    // Закрытие модального окна при клике вне его
    paymentModal.addEventListener('click', (e) => {
        if (e.target === paymentModal) {
            closePaymentModal();
        }
    });
}

// Запускаем приложение
document.addEventListener('DOMContentLoaded', initApp); 