// Инициализация Telegram WebApp
let tg = window.Telegram.WebApp;
let currentOrder = null;
let starsGrid = document.querySelector('.stars-grid');
let paymentModal = document.getElementById('paymentModal');
let modalClose = document.querySelector('.modal-close');
let payButton = document.getElementById('payButton');
let starsAmount = document.getElementById('starsAmount');
let paymentAmount = document.getElementById('paymentAmount');

// Цены на Stars
const STAR_PRICES = {
    100: 0.5,   // 100 Stars за 0.5 TON
    500: 2.0,   // 500 Stars за 2.0 TON
    1000: 3.5,  // 1000 Stars за 3.5 TON
    2000: 6.0,  // 2000 Stars за 6.0 TON
    5000: 14.0  // 5000 Stars за 14.0 TON
};

// Инициализация приложения
async function initApp() {
    try {
        // Получаем данные пользователя и конфигурацию
        const response = await fetch('/api/telegram/init', {
            headers: {
                'X-Telegram-Init-Data': tg.initData
            }
        });
        const data = await response.json();
        
        // Настраиваем главную кнопку
        tg.MainButton.setText(data.config.mainButtonText);
        tg.MainButton.setColor(data.config.mainButtonColor);
        
        // Загружаем начальные данные
        await loadInitialData();
        
        // Показываем главную кнопку
        tg.MainButton.show();
    } catch (error) {
        console.error('Ошибка инициализации:', error);
        showError('Ошибка загрузки приложения');
    }
}

// Загрузка начальных данных
async function loadInitialData() {
    try {
        // Загружаем подарки пользователя
        const giftsResponse = await fetch('/api/telegram/gifts', {
            headers: {
                'X-Telegram-Init-Data': tg.initData
            }
        });
        const gifts = await giftsResponse.json();
        
        // Загружаем статистику
        const statsResponse = await fetch('/api/telegram/stats', {
            headers: {
                'X-Telegram-Init-Data': tg.initData
            }
        });
        const stats = await statsResponse.json();
        
        // Обновляем интерфейс
        updateGiftsList(gifts);
        updateStats(stats);
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        showError('Ошибка загрузки данных');
    }
}

// Обновление списка подарков
function updateGiftsList(gifts) {
    const container = document.getElementById('gifts-list');
    if (!container) return;
    
    container.innerHTML = gifts.map(gift => `
        <div class="gift-card" data-id="${gift.id}">
            <div class="gift-image">
                <img src="${gift.backgroundUrl}" alt="${gift.name}">
                <div class="gift-stats">
                    <span>👁️ ${gift.stats.views}</span>
                    <span>💰 ${gift.stats.sales}</span>
                    <span>⭐ ${gift.stats.rating.toFixed(1)}</span>
                </div>
            </div>
            <div class="gift-info">
                <h3>${gift.name}</h3>
                <p>${gift.description}</p>
                <div class="gift-price">${gift.price} TON</div>
                <div class="gift-actions">
                    <button onclick="editGift('${gift.id}')">Редактировать</button>
                    <button onclick="deleteGift('${gift.id}')">Удалить</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Обновление статистики
function updateStats(stats) {
    const container = document.getElementById('stats-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${stats.totalGifts}</div>
                <div class="stat-label">Всего подарков</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.activeGifts}</div>
                <div class="stat-label">Активных</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.totalSales}</div>
                <div class="stat-label">Продаж</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.totalRevenue} TON</div>
                <div class="stat-label">Доход</div>
            </div>
        </div>
        <div class="recent-deals">
            <h3>Последние сделки</h3>
            ${stats.recentDeals.map(deal => `
                <div class="deal-item">
                    <div class="deal-info">
                        <div class="deal-gift">${deal.gift.name}</div>
                        <div class="deal-amount">${deal.amount} TON</div>
                    </div>
                    <div class="deal-date">${new Date(deal.createdAt).toLocaleDateString()}</div>
                </div>
            `).join('')}
        </div>
    `;
}

// Создание нового подарка
async function createGift(formData) {
    try {
        const response = await fetch('/api/telegram/gifts', {
            method: 'POST',
            headers: {
                'X-Telegram-Init-Data': tg.initData
            },
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Ошибка создания подарка');
        }
        
        const gift = await response.json();
        showSuccess('Подарок успешно создан');
        await loadInitialData();
        return gift;
    } catch (error) {
        console.error('Ошибка создания подарка:', error);
        showError('Ошибка создания подарка');
        throw error;
    }
}

// Редактирование подарка
async function editGift(giftId) {
    try {
        const gift = await fetch(`/api/telegram/gifts/${giftId}`, {
            headers: {
                'X-Telegram-Init-Data': tg.initData
            }
        }).then(res => res.json());
        
        // Показываем форму редактирования
        showEditForm(gift);
    } catch (error) {
        console.error('Ошибка получения данных подарка:', error);
        showError('Ошибка загрузки данных подарка');
    }
}

// Удаление подарка
async function deleteGift(giftId) {
    if (!confirm('Вы уверены, что хотите удалить этот подарок?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/telegram/gifts/${giftId}`, {
            method: 'DELETE',
            headers: {
                'X-Telegram-Init-Data': tg.initData
            }
        });
        
        if (!response.ok) {
            throw new Error('Ошибка удаления подарка');
        }
        
        showSuccess('Подарок успешно удален');
        await loadInitialData();
    } catch (error) {
        console.error('Ошибка удаления подарка:', error);
        showError('Ошибка удаления подарка');
    }
}

// Вспомогательные функции
function showSuccess(message) {
    tg.showAlert(message);
}

function showError(message) {
    tg.showAlert(message);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Инициализация Telegram WebApp
    tg.expand();
    tg.ready();
    
    // Загрузка Stars
    loadStars();
    
    // Обработчики событий
    modalClose.addEventListener('click', closePaymentModal);
    payButton.addEventListener('click', handlePayment);
});

// Обработчики событий Telegram
tg.MainButton.onClick(() => {
    // Показываем форму создания подарка
    showCreateForm();
});

// Экспортируем функции для использования в HTML
window.createGift = createGift;
window.editGift = editGift;
window.deleteGift = deleteGift;

// Функции для работы с формами
function showCreateForm() {
    const form = document.getElementById('create-gift-form');
    form.style.display = 'flex';
    tg.MainButton.hide();
}

function closeCreateForm() {
    const form = document.getElementById('create-gift-form');
    form.style.display = 'none';
    tg.MainButton.show();
}

function showEditForm(gift) {
    const form = document.getElementById('edit-gift-form');
    const idInput = document.getElementById('edit-id');
    const nameInput = document.getElementById('edit-name');
    const descriptionInput = document.getElementById('edit-description');
    const priceInput = document.getElementById('edit-price');
    const categoryInput = document.getElementById('edit-category');
    
    idInput.value = gift.id;
    nameInput.value = gift.name;
    descriptionInput.value = gift.description;
    priceInput.value = gift.price;
    categoryInput.value = gift.category;
    
    form.style.display = 'flex';
    tg.MainButton.hide();
}

function closeEditForm() {
    const form = document.getElementById('edit-gift-form');
    form.style.display = 'none';
    tg.MainButton.show();
}

// Обработчики отправки форм
async function handleGiftSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    try {
        await createGift(formData);
        closeCreateForm();
        form.reset();
    } catch (error) {
        console.error('Ошибка создания подарка:', error);
    }
}

async function handleEditSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const giftId = formData.get('id');
    
    try {
        const response = await fetch(`/api/telegram/gifts/${giftId}`, {
            method: 'PUT',
            headers: {
                'X-Telegram-Init-Data': tg.initData
            },
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Ошибка обновления подарка');
        }
        
        showSuccess('Подарок успешно обновлен');
        closeEditForm();
        await loadInitialData();
    } catch (error) {
        console.error('Ошибка обновления подарка:', error);
        showError('Ошибка обновления подарка');
    }
}

// Обработчики закрытия модальных окон
document.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
        if (event.target.id === 'create-gift-form') {
            closeCreateForm();
        } else if (event.target.id === 'edit-gift-form') {
            closeEditForm();
        }
    }
});

// Предотвращение закрытия при клике на содержимое модального окна
document.querySelectorAll('.modal-content').forEach(content => {
    content.addEventListener('click', (event) => {
        event.stopPropagation();
    });
});

// Загрузка статистики пользователя
async function loadUserStats() {
    try {
        const response = await fetch('https://your-bot-domain.com/get_stats', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: tg.initDataUnsafe.user.id
            })
        });
        
        const data = await response.json();
        if (data.action === 'stats_update') {
            document.getElementById('total-stars').textContent = data.stars_bought;
            document.getElementById('total-spent').textContent = data.total_spent;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Загрузка Stars
function loadStars() {
    // Очистка сетки
    starsGrid.innerHTML = '';
    
    // Создание карточек Stars
    Object.entries(STAR_PRICES).forEach(([amount, price]) => {
        const card = createStarCard(amount, price);
        starsGrid.appendChild(card);
    });
}

// Создание карточки Star
function createStarCard(amount, price) {
    const card = document.createElement('div');
    card.className = 'star-card';
    card.innerHTML = `
        <h3>${amount} Stars</h3>
        <div class="price">${price} TON</div>
        <button class="primary-button">Купить</button>
    `;
    
    // Обработчик клика
    card.addEventListener('click', () => {
        openPaymentModal(amount, price);
    });
    
    return card;
}

// Открытие модального окна оплаты
function openPaymentModal(amount, price) {
    starsAmount.textContent = amount;
    paymentAmount.textContent = `${price} TON`;
    paymentModal.style.display = 'block';
}

// Закрытие модального окна оплаты
function closePaymentModal() {
    paymentModal.style.display = 'none';
}

// Обработка оплаты
async function handlePayment() {
    try {
        // Отправка данных на сервер
        const response = await fetch('/api/payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: parseInt(starsAmount.textContent),
                price: parseFloat(paymentAmount.textContent),
                user_id: tg.initDataUnsafe.user.id
            })
        });
        
        if (!response.ok) {
            throw new Error('Ошибка при создании платежа');
        }
        
        const data = await response.json();
        
        // Отправка данных в Telegram
        tg.sendData(JSON.stringify({
            type: 'payment',
            payment_id: data.payment_id,
            amount: data.amount,
            price: data.price
        }));
        
        // Закрытие модального окна
        closePaymentModal();
        
    } catch (error) {
        console.error('Ошибка при обработке платежа:', error);
        alert('Произошла ошибка при обработке платежа. Пожалуйста, попробуйте позже.');
    }
}

// Обработка ошибок
window.onerror = function(message, source, lineno, colno, error) {
    console.error('Ошибка:', {message, source, lineno, colno, error});
    alert('Произошла ошибка. Пожалуйста, попробуйте позже.');
    return false;
}; 