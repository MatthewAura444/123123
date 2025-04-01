// Инициализация Telegram WebApp
let tg = window.Telegram.WebApp;
let currentOrder = null;

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
document.addEventListener('DOMContentLoaded', function() {
    tg.expand();
    loadUserStats();
    initializeStarsGrid();
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

// Инициализация сетки Stars
function initializeStarsGrid() {
    const starsGrid = document.getElementById('stars-grid');
    const starOptions = [
        { amount: 100, price: 0.5 },
        { amount: 500, price: 2.0 },
        { amount: 1000, price: 3.5 },
        { amount: 2000, price: 6.0 },
        { amount: 5000, price: 14.0 }
    ];

    starOptions.forEach(option => {
        const starCard = createStarCard(option);
        starsGrid.appendChild(starCard);
    });
}

// Создание карточки Stars
function createStarCard(option) {
    const card = document.createElement('div');
    card.className = 'star-card';
    card.onclick = () => showPaymentModal(option);

    card.innerHTML = `
        <div class="star-icon"></div>
        <div class="star-info">
            <div class="star-amount">${option.amount} Stars</div>
            <div class="star-price">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                ${option.price} TON
            </div>
            <button class="buy-button">Buy Now</button>
        </div>
    `;

    return card;
}

// Показ модального окна оплаты
function showPaymentModal(option) {
    const modal = document.getElementById('payment-modal');
    const amountElement = document.getElementById('payment-amount');
    const commission = option.price * 0.02; // 2% комиссия
    const totalAmount = option.price + commission;

    currentOrder = {
        amount: option.amount,
        price_per_star: option.price,
        total_price: option.price,
        commission: commission,
        final_price: totalAmount
    };

    amountElement.textContent = totalAmount.toFixed(2);
    modal.style.display = 'flex';
}

// Закрытие модального окна
function closePaymentModal() {
    const modal = document.getElementById('payment-modal');
    modal.style.display = 'none';
    currentOrder = null;
}

// Подтверждение платежа
async function confirmPayment() {
    if (!currentOrder) return;

    try {
        const response = await fetch('https://your-bot-domain.com/buy_stars', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: tg.initDataUnsafe.user.id,
                amount: currentOrder.amount,
                price_per_star: currentOrder.price_per_star,
                total_price: currentOrder.total_price,
                commission: currentOrder.commission,
                final_price: currentOrder.final_price
            })
        });

        const data = await response.json();
        if (data.success) {
            closePaymentModal();
            loadUserStats(); // Обновляем статистику
            showSuccessMessage('Stars have been sent to your account!');
        } else {
            showErrorMessage('Failed to process payment. Please try again.');
        }
    } catch (error) {
        console.error('Error confirming payment:', error);
        showErrorMessage('An error occurred. Please try again.');
    }
}

// Показ сообщения об успехе
function showSuccessMessage(message) {
    tg.showAlert(message);
}

// Показ сообщения об ошибке
function showErrorMessage(message) {
    tg.showAlert(message);
} 