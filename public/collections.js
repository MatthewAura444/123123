// Функция для получения подарков пользователя
async function getUserCollectionGifts() {
    const tg = window.Telegram.WebApp;
    // Здесь будет запрос к API Telegram для получения подарков
    // Пока используем тестовые данные
    const userGifts = [
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

    return userGifts;
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
        // Здесь будет логика создания объявления
        console.log('Creating listing:', {
            giftId,
            price,
            description
        });

        // После успешного создания
        hideSetPriceModal();
        showTradeMarket(); // Показываем Trade Market с обновленным списком
    } catch (error) {
        console.error('Error creating listing:', error);
        alert('Произошла ошибка при создании объявления');
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Отображаем подарки пользователя в коллекции
    displayUserCollectionGifts();
}); 