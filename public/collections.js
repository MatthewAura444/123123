// Инициализация WebSocket соединения
const API_URL = 'https://matthewaura444.github.io/123123';
const ws = new WebSocket('wss://matthewaura444.github.io/123123');

// Обработка сообщений WebSocket
ws.onmessage = function(event) {
    const update = JSON.parse(event.data);
    if (update.type === 'new_listing') {
        // Обновляем список подарков в Trade Market
        updateTradeMarket();
    }
};

// Функция для получения подарков пользователя из Telegram
async function getUserCollectionGifts() {
    try {
        const tg = window.Telegram.WebApp;
        const userId = tg.initDataUnsafe.user.id;
        
        // В случае с GitHub Pages используем тестовые данные
        return [
            {
                id: '1',
                name: 'Christmas Gift',
                type: 'Holiday Collection',
                image: 'https://via.placeholder.com/300',
            },
            {
                id: '2',
                name: 'Birthday Present',
                type: 'Special Collection',
                image: 'https://via.placeholder.com/300',
            }
        ];
    } catch (error) {
        console.error('Error fetching user gifts:', error);
        return [];
    }
}

// Функция для отображения подарков в коллекции
async function displayUserCollectionGifts() {
    const container = document.getElementById('userCollectionsGrid');
    const gifts = await getUserCollectionGifts();

    container.innerHTML = gifts.map(gift => `
        <div class="collection-gift-card" data-gift-id="${gift.id}">
            <div class="collection-gift-preview">
                <img src="${gift.image}" alt="${gift.name}">
            </div>
            <div class="collection-gift-info">
                <div class="collection-gift-name">${gift.name}</div>
                <div class="collection-gift-type">${gift.type}</div>
                <button class="sell-gift-btn" onclick="showSetPriceModal('${gift.id}', '${gift.name}', '${gift.type}', '${gift.image}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 8v8m-4-4h8"/>
                    </svg>
                    Выставить на продажу
                </button>
            </div>
        </div>
    `).join('');
}

// Функция для открытия модального окна установки цены
function showSetPriceModal(giftId, giftName, giftType, giftImage) {
    const modal = document.getElementById('setPriceModal');
    const preview = document.getElementById('selectedGiftPreview');

    preview.innerHTML = `
        <img src="${giftImage}" alt="${giftName}">
        <div class="gift-preview-info">
            <h3>${giftName}</h3>
            <p>${giftType}</p>
        </div>
    `;

    preview.dataset.giftId = giftId;
    modal.classList.add('active');
}

// Функция для закрытия модального окна установки цены
function hideSetPriceModal() {
    const modal = document.getElementById('setPriceModal');
    modal.classList.remove('active');
    document.getElementById('setPriceInput').value = '';
    document.getElementById('setPriceDescription').value = '';
}

// Функция для выставления подарка на продажу
async function listGiftForSale() {
    const preview = document.getElementById('selectedGiftPreview');
    const giftId = preview.dataset.giftId;
    const price = document.getElementById('setPriceInput').value;
    const description = document.getElementById('setPriceDescription').value;

    if (!price) {
        alert('Пожалуйста, укажите цену');
        return;
    }

    try {
        // В случае с GitHub Pages просто показываем сообщение об успехе
        alert('Подарок успешно выставлен на продажу!');
        hideSetPriceModal();
        showTradeMarket();
    } catch (error) {
        console.error('Error creating listing:', error);
        alert('Произошла ошибка при создании объявления');
    }
}

// Функция для обновления Trade Market
async function updateTradeMarket() {
    try {
        // В случае с GitHub Pages используем тестовые данные
        const listings = [
            {
                id: '1',
                name: 'Christmas Gift',
                type: 'Holiday Collection',
                price: 100,
                image: 'https://via.placeholder.com/300',
            },
            {
                id: '2',
                name: 'Birthday Present',
                type: 'Special Collection',
                price: 200,
                image: 'https://via.placeholder.com/300',
            }
        ];
        
        const container = document.getElementById('giftsContainer');
        container.innerHTML = listings.map(listing => `
            <div class="gift-card">
                <div class="gift-image">
                    <img src="${listing.image}" alt="${listing.name}">
                </div>
                <div class="gift-info">
                    <div class="gift-name">${listing.name}</div>
                    <div class="gift-model">${listing.type}</div>
                    <div class="gift-price">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                        </svg>
                        ${listing.price} TON
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error updating trade market:', error);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Отображаем подарки пользователя в коллекции
    displayUserCollectionGifts();
    
    // Обновляем Trade Market
    updateTradeMarket();
}); 