// Массив категорий подарков
const categories = [
    'Все подарки',
    'Магия',
    'Еда',
    'Мода',
    'Декор',
    'Украшения',
    'Игрушки',
    'Музыка',
    'Офис',
    'Праздники',
    'Романтика',
    'Трофеи',
    'Красота',
    'Напитки',
    'Роскошь',
    'Технологии',
    'Особые',
    'Цветы'
];

// Функции для управления анимациями переходов
const pageTransition = {
    element: document.querySelector('.page-transition'),
    pageContent: document.querySelector('.page-content'),
    
    // Инициализация анимаций
    init() {
        // Показываем контент после загрузки страницы
        setTimeout(() => {
            this.pageContent.classList.add('visible');
        }, 100);
    },
    
    // Анимация перехода к новой странице
    async navigateTo(url) {
        // Активируем анимацию перехода
        this.element.classList.add('active');
        
        // Ждем завершения анимации
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Переходим на новую страницу
        window.location.href = url;
    },
    
    // Анимация возврата на предыдущую страницу
    async navigateBack() {
        // Активируем анимацию перехода
        this.element.classList.add('active');
        
        // Ждем завершения анимации
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Возвращаемся назад
        window.history.back();
    }
};

// Массив подарков
const gifts = [
    {
        id: 'love-potion',
        name: 'Любовное зелье',
        price: 100,
        category: 'Магия',
        image: 'images/gifts/love-potion.png',
        model: 'models/gifts/love-potion.glb',
        texture: 'images/gifts/textures/love-potion-texture.png',
        description: 'Магическое зелье, которое приносит любовь и счастье',
        rarity: 'legendary'
    },
    {
        id: 'plush-pepe',
        name: 'Плюшевый Pepe',
        price: 50,
        category: 'Игрушки',
        image: 'images/gifts/plush-pepe.png',
        model: 'models/gifts/plush-pepe.glb',
        texture: 'images/gifts/textures/plush-pepe-texture.png',
        description: 'Мягкая игрушка в виде популярного мема',
        rarity: 'rare'
    },
    {
        id: 'music-box',
        name: 'Музыкальная шкатулка',
        price: 75,
        category: 'Музыка',
        image: 'images/gifts/music-box.png',
        model: 'models/gifts/music-box.glb',
        texture: 'images/gifts/textures/music-box-texture.png',
        description: 'Волшебная шкатулка, играющая прекрасную мелодию',
        rarity: 'epic'
    },
    {
        id: 'office-chair',
        name: 'Офисное кресло',
        price: 200,
        category: 'Офис',
        image: 'images/gifts/office-chair.png',
        model: 'models/gifts/office-chair.glb',
        texture: 'images/gifts/textures/office-chair-texture.png',
        description: 'Удобное кресло для работы',
        rarity: 'common'
    },
    {
        id: 'birthday-cake',
        name: 'Праздничный торт',
        price: 25,
        category: 'Праздники',
        image: 'images/gifts/birthday-cake.png',
        model: 'models/gifts/birthday-cake.glb',
        texture: 'images/gifts/textures/birthday-cake-texture.png',
        description: 'Вкусный торт со свечами',
        rarity: 'common'
    },
    {
        id: 'rose-bouquet',
        name: 'Букет роз',
        price: 150,
        category: 'Романтика',
        image: 'images/gifts/rose-bouquet.png',
        model: 'models/gifts/rose-bouquet.glb',
        texture: 'images/gifts/textures/rose-bouquet-texture.png',
        description: 'Красивый букет красных роз',
        rarity: 'rare'
    },
    {
        id: 'trophy',
        name: 'Трофей',
        price: 300,
        category: 'Трофеи',
        image: 'images/gifts/trophy.png',
        model: 'models/gifts/trophy.glb',
        texture: 'images/gifts/textures/trophy-texture.png',
        description: 'Блестящий трофей победителя',
        rarity: 'epic'
    },
    {
        id: 'beauty-kit',
        name: 'Косметический набор',
        price: 100,
        category: 'Красота',
        image: 'images/gifts/beauty-kit.png',
        model: 'models/gifts/beauty-kit.glb',
        texture: 'images/gifts/textures/beauty-kit-texture.png',
        description: 'Набор косметики для ухода за собой',
        rarity: 'rare'
    },
    {
        id: 'cocktail',
        name: 'Коктейль',
        price: 30,
        category: 'Напитки',
        image: 'images/gifts/cocktail.png',
        model: 'models/gifts/cocktail.glb',
        texture: 'images/gifts/textures/cocktail-texture.png',
        description: 'Освежающий коктейль',
        rarity: 'common'
    },
    {
        id: 'smartphone',
        name: 'Смартфон',
        price: 500,
        category: 'Технологии',
        image: 'images/gifts/smartphone.png',
        model: 'models/gifts/smartphone.glb',
        texture: 'images/gifts/textures/smartphone-texture.png',
        description: 'Современный смартфон',
        rarity: 'legendary'
    },
    {
        id: 'magic-crystal',
        name: 'Магический кристалл',
        price: 250,
        category: 'Особые',
        image: 'images/gifts/magic-crystal.png',
        model: 'models/gifts/magic-crystal.glb',
        texture: 'images/gifts/textures/magic-crystal-texture.png',
        description: 'Волшебный кристалл с магическими свойствами',
        rarity: 'epic'
    },
    {
        id: 'flower-bouquet',
        name: 'Букет цветов',
        price: 80,
        category: 'Цветы',
        image: 'images/gifts/flower-bouquet.png',
        model: 'models/gifts/flower-bouquet.glb',
        texture: 'images/gifts/textures/flower-bouquet-texture.png',
        description: 'Красивый букет свежих цветов',
        rarity: 'common'
    }
];

// Импорт менеджера моделей
import modelManager from './models/model-manager.js';

// Кэш для хранения загруженных моделей
const modelCache = new Map();

// Статистика просмотров
const viewStats = {
    totalViews: 0,
    giftViews: new Map(),
    popularGifts: new Set()
};

// Элементы интерфейса
const elements = {
    searchInput: document.getElementById('searchInput'),
    priceRange: document.getElementById('priceRange'),
    priceValue: document.getElementById('priceValue'),
    sortSelect: document.getElementById('sortSelect'),
    categoriesScroll: document.querySelector('.categories-scroll'),
    giftsGrid: document.querySelector('.gifts-grid'),
    loadingIndicator: document.querySelector('.loading-indicator'),
    modal: document.getElementById('giftModal'),
    modalClose: document.querySelector('.modal-close'),
    modalModelViewer: document.getElementById('modalModelViewer'),
    modalTitle: document.getElementById('modalTitle'),
    viewCount: document.getElementById('viewCount'),
    popularity: document.getElementById('popularity')
};

// Функция для получения текста редкости
function getRarityText(rarity) {
    const rarityMap = {
        'common': 'Обычный',
        'rare': 'Редкий',
        'epic': 'Эпический',
        'legendary': 'Легендарный'
    };
    return rarityMap[rarity] || rarity;
}

// Функция для отображения карточки подарка
function renderGiftCard(gift) {
    const card = document.createElement('div');
    card.className = 'gift-card';
    card.dataset.giftId = gift.id;

    card.innerHTML = `
        <img class="gift-image" src="${gift.image}" alt="${gift.name}" loading="lazy">
        <div class="gift-3d-preview">
            <model-viewer
                src="${gift.model}"
                camera-controls
                auto-rotate
                camera-orbit="45deg 55deg 2.5m"
                min-camera-orbit="auto auto 0.5m"
                max-camera-orbit="auto auto 10m"
                shadow-intensity="1"
                exposure="1"
                environment-image="neutral"
                loading="lazy">
            </model-viewer>
        </div>
        <div class="gift-info">
            <div class="gift-name">${gift.name}</div>
            <div class="gift-price">${gift.price} TON</div>
            <div class="gift-rarity rarity-${gift.rarity}">${getRarityText(gift.rarity)}</div>
        </div>
    `;

    // Добавляем обработчики событий
    card.addEventListener('click', () => showGiftDetails(gift));
    card.addEventListener('mouseenter', () => preloadModel(gift));

    return card;
}

// Функция для отображения категорий
function renderCategories() {
    elements.categoriesScroll.innerHTML = categories.map(category => `
        <button class="category-button" data-category="${category}">${category}</button>
    `).join('');

    // Добавляем обработчики для кнопок категорий
    elements.categoriesScroll.querySelectorAll('.category-button').forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category;
            showCategory(category);
            updateActiveCategory(button);
        });
    });
}

// Функция для отображения подарков категории
async function showCategory(category) {
    elements.loadingIndicator.style.display = 'flex';
    elements.giftsGrid.innerHTML = '';

    const filteredGifts = category === 'Все подарки' 
        ? gifts 
        : gifts.filter(gift => gift.category === category);

    // Применяем текущие фильтры
    const filteredAndSortedGifts = applyFilters(filteredGifts);

    // Отображаем подарки
    filteredAndSortedGifts.forEach(gift => {
        elements.giftsGrid.appendChild(renderGiftCard(gift));
    });

    elements.loadingIndicator.style.display = 'none';
}

// Функция для применения фильтров
function applyFilters(gifts) {
    const searchQuery = elements.searchInput.value.toLowerCase();
    const maxPrice = parseInt(elements.priceRange.value);
    const sortBy = elements.sortSelect.value;

    let filtered = gifts.filter(gift => {
        const matchesSearch = gift.name.toLowerCase().includes(searchQuery);
        const matchesPrice = gift.price <= maxPrice;
        return matchesSearch && matchesPrice;
    });

    // Сортировка
    switch (sortBy) {
        case 'name':
            filtered.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'price-asc':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filtered.sort((a, b) => b.price - a.price);
            break;
        case 'rarity':
            filtered.sort((a, b) => b.rarity - a.rarity);
            break;
    }

    return filtered;
}

// Функция для предзагрузки 3D модели
async function preloadModel(gift) {
    if (!modelCache.has(gift.id)) {
        try {
            const model = await modelManager.loadModel(gift.id, gift.model, gift.texture);
            modelCache.set(gift.id, model);
        } catch (error) {
            console.error('Ошибка загрузки модели:', error);
        }
    }
}

// Функция для отображения деталей подарка
function showGiftDetails(gift) {
    // Обновляем статистику просмотров
    updateViewStats(gift);

    // Заполняем модальное окно
    elements.modalTitle.textContent = gift.name;
    elements.modalModelViewer.src = gift.model;
    elements.viewCount.textContent = viewStats.giftViews.get(gift.id) || 0;
    elements.popularity.textContent = calculatePopularity(gift) + '%';

    // Показываем модальное окно
    elements.modal.classList.add('active');
}

// Функция для обновления статистики просмотров
function updateViewStats(gift) {
    viewStats.totalViews++;
    const currentViews = viewStats.giftViews.get(gift.id) || 0;
    viewStats.giftViews.set(gift.id, currentViews + 1);

    // Обновляем список популярных подарков
    updatePopularGifts();
}

// Функция для расчета популярности подарка
function calculatePopularity(gift) {
    const views = viewStats.giftViews.get(gift.id) || 0;
    const maxViews = Math.max(...Array.from(viewStats.giftViews.values()));
    return maxViews > 0 ? Math.round((views / maxViews) * 100) : 0;
}

// Функция для обновления списка популярных подарков
function updatePopularGifts() {
    const sortedGifts = Array.from(viewStats.giftViews.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    viewStats.popularGifts = new Set(sortedGifts.map(([id]) => id));
}

// Функция для обновления активной категории
function updateActiveCategory(selectedButton) {
    elements.categoriesScroll.querySelectorAll('.category-button').forEach(button => {
        button.classList.remove('active');
    });
    selectedButton.classList.add('active');
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    // Инициализируем анимации переходов
    pageTransition.init();

    // Рендерим категории
    renderCategories();

    // Показываем все подарки по умолчанию
    showCategory('Все подарки');

    // Добавляем обработчики событий
    elements.searchInput.addEventListener('input', () => showCategory('Все подарки'));
    elements.priceRange.addEventListener('input', (e) => {
        elements.priceValue.textContent = e.target.value + ' TON';
        showCategory('Все подарки');
    });
    elements.sortSelect.addEventListener('change', () => showCategory('Все подарки'));
    elements.modalClose.addEventListener('click', () => {
        elements.modal.classList.remove('active');
    });

    // Добавляем обработчики для свайпов на мобильных устройствах
    let touchStartX = 0;
    let touchEndX = 0;

    elements.categoriesScroll.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    });

    elements.categoriesScroll.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].clientX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            const currentCategory = elements.categoriesScroll.querySelector('.category-button.active');
            const categories = Array.from(elements.categoriesScroll.querySelectorAll('.category-button'));
            const currentIndex = categories.indexOf(currentCategory);

            if (diff > 0 && currentIndex < categories.length - 1) {
                // Свайп влево
                categories[currentIndex + 1].click();
            } else if (diff < 0 && currentIndex > 0) {
                // Свайп вправо
                categories[currentIndex - 1].click();
            }
        }
    }

    // Добавляем обработчики для анимаций переходов
    document.querySelectorAll('a[data-transition]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const url = link.getAttribute('href');
            pageTransition.navigateTo(url);
        });
    });

    // Добавляем обработчик для кнопки "назад"
    window.addEventListener('popstate', () => {
        pageTransition.navigateBack();
    });
});

class GiftsManager {
    constructor() {
        this.giftsContainer = document.getElementById('giftsContainer');
        this.currentUser = null;
        this.gifts = [];
        this.filters = {
            sort: 'newest',
            price: { min: 0, max: null },
            category: null,
            search: ''
        };
        this.init();
    }

    async init() {
        try {
            // Получаем данные пользователя из Telegram Web App
            const tg = window.Telegram.WebApp;
            if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
                this.currentUser = tg.initDataUnsafe.user;
                await this.loadGifts();
            }

            // Подписываемся на WebSocket события
            window.wsClient.on('giftAdded', this.handleNewGift.bind(this));
            window.wsClient.on('giftSold', this.handleGiftSold.bind(this));
            window.wsClient.on('giftUpdated', this.handleGiftUpdate.bind(this));
            window.wsClient.on('giftDeleted', this.handleGiftDelete.bind(this));

            // Инициализируем фильтры
            this.initializeFilters();
        } catch (error) {
            console.error('Ошибка инициализации GiftsManager:', error);
        }
    }

    async loadGifts() {
        try {
            const gifts = await window.api.getGifts(this.filters);
            this.gifts = gifts;
            this.renderGifts();
        } catch (error) {
            console.error('Ошибка загрузки подарков:', error);
            window.Telegram.WebApp.showAlert('Ошибка загрузки подарков');
        }
    }

    renderGifts() {
        if (!this.giftsContainer) return;

        this.giftsContainer.innerHTML = this.gifts.map(gift => `
            <div class="gift-card" data-id="${gift._id}">
                <div class="gift-image">
                    <img src="${gift.imageUrl}" alt="${gift.name}">
                    <div class="gift-overlay">
                        ${this.currentUser && gift.creator === this.currentUser.id ? `
                            <button class="edit-gift-btn" onclick="giftsManager.editGift('${gift._id}')">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                            </button>
                            <button class="delete-gift-btn" onclick="giftsManager.deleteGift('${gift._id}')">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                </svg>
                            </button>
                        ` : ''}
                        <button class="favorite-gift-btn" onclick="giftsManager.toggleFavorite('${gift._id}')">
                            <svg viewBox="0 0 24 24" fill="${gift.likes?.includes(this.currentUser?.id) ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="gift-info">
                    <h3 class="gift-name">${gift.name}</h3>
                    <p class="gift-description">${gift.description || 'Нет описания'}</p>
                    <div class="gift-meta">
                        <span class="gift-category">${gift.category || 'Без категории'}</span>
                        <span class="gift-views">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                            ${gift.views || 0}
                        </span>
                    </div>
                    <div class="gift-price">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                        </svg>
                        ${gift.price} ${gift.currency}
                    </div>
                    ${gift.status === 'available' ? `
                        <button class="buy-gift-btn" onclick="giftsManager.buyGift('${gift._id}')">
                            Купить
                        </button>
                    ` : `
                        <div class="gift-status ${gift.status}">
                            ${gift.status === 'sold' ? 'Продано' : 'Забронировано'}
                        </div>
                    `}
                </div>
            </div>
        `).join('');
    }

    async createGift(data) {
        try {
            const gift = await window.api.createGift({
                ...data,
                creator: this.currentUser.id
            });
            
            this.gifts.unshift(gift);
            this.renderGifts();
            
            // Отправляем уведомление через WebSocket
            window.wsClient.send({
                type: 'NEW_GIFT',
                gift
            });

            window.Telegram.WebApp.showAlert('Подарок успешно создан!');
            return gift;
        } catch (error) {
            console.error('Ошибка создания подарка:', error);
            window.Telegram.WebApp.showAlert('Ошибка создания подарка');
            throw error;
        }
    }

    async editGift(id) {
        try {
            const gift = this.gifts.find(g => g._id === id);
            if (!gift) return;

            // Показываем модальное окно редактирования
            const modal = document.getElementById('editGiftModal');
            if (modal) {
                document.getElementById('editGiftName').value = gift.name;
                document.getElementById('editGiftDescription').value = gift.description || '';
                document.getElementById('editGiftPrice').value = gift.price;
                document.getElementById('editGiftCategory').value = gift.category || '';
                modal.style.display = 'block';
            }
        } catch (error) {
            console.error('Ошибка редактирования подарка:', error);
            window.Telegram.WebApp.showAlert('Ошибка редактирования подарка');
        }
    }

    async updateGift(id, data) {
        try {
            const updatedGift = await window.api.updateGift(id, data);
            const index = this.gifts.findIndex(g => g._id === id);
            if (index !== -1) {
                this.gifts[index] = updatedGift;
                this.renderGifts();
            }

            // Отправляем уведомление через WebSocket
            window.wsClient.send({
                type: 'GIFT_UPDATE',
                gift: updatedGift
            });

            window.Telegram.WebApp.showAlert('Подарок успешно обновлен!');
            return updatedGift;
        } catch (error) {
            console.error('Ошибка обновления подарка:', error);
            window.Telegram.WebApp.showAlert('Ошибка обновления подарка');
            throw error;
        }
    }

    async deleteGift(id) {
        try {
            if (await window.Telegram.WebApp.showConfirm('Вы уверены, что хотите удалить этот подарок?')) {
                await window.api.deleteGift(id);
                this.gifts = this.gifts.filter(g => g._id !== id);
                this.renderGifts();

                // Отправляем уведомление через WebSocket
                window.wsClient.send({
                    type: 'GIFT_DELETE',
                    giftId: id
                });

                window.Telegram.WebApp.showAlert('Подарок успешно удален!');
            }
        } catch (error) {
            console.error('Ошибка удаления подарка:', error);
            window.Telegram.WebApp.showAlert('Ошибка удаления подарка');
        }
    }

    async buyGift(id) {
        try {
            const gift = this.gifts.find(g => g._id === id);
            if (!gift) return;

            // Проверяем подключение кошелька
            if (!window.tonConnect.isConnected()) {
                await window.tonConnect.connect();
            }

            // Создаем транзакцию
            const transaction = await window.api.createTransaction({
                gift: id,
                seller: gift.creator,
                buyer: this.currentUser.id,
                amount: gift.price,
                currency: gift.currency,
                paymentMethod: 'TON_WALLET'
            });

            // Отправляем транзакцию через TON Connect
            const result = await window.tonConnect.sendTransaction({
                validUntil: Date.now() + 5 * 60 * 1000, // 5 минут
                messages: [
                    {
                        address: gift.creator,
                        amount: gift.price * 1000000000 // Конвертируем в нано TON
                    }
                ]
            });

            // Обновляем статус транзакции
            await window.api.updateTransaction(transaction._id, {
                status: 'completed',
                transactionHash: result.hash
            });

            // Обновляем статус подарка
            await this.updateGift(id, { status: 'sold' });

            window.Telegram.WebApp.showAlert('Подарок успешно куплен!');
        } catch (error) {
            console.error('Ошибка покупки подарка:', error);
            window.Telegram.WebApp.showAlert('Ошибка покупки подарка');
        }
    }

    async toggleFavorite(id) {
        try {
            const gift = this.gifts.find(g => g._id === id);
            if (!gift) return;

            if (gift.likes?.includes(this.currentUser.id)) {
                await window.api.removeFromFavorites(id);
                gift.likes = gift.likes.filter(userId => userId !== this.currentUser.id);
            } else {
                await window.api.addToFavorites(id);
                if (!gift.likes) gift.likes = [];
                gift.likes.push(this.currentUser.id);
            }

            this.renderGifts();
        } catch (error) {
            console.error('Ошибка обновления избранного:', error);
            window.Telegram.WebApp.showAlert('Ошибка обновления избранного');
        }
    }

    initializeFilters() {
        // Добавляем обработчики для фильтров
        const filterElements = document.querySelectorAll('.filter-input');
        filterElements.forEach(element => {
            element.addEventListener('change', (e) => {
                this.filters[e.target.name] = e.target.value;
                this.loadGifts();
            });
        });
    }

    handleNewGift(gift) {
        this.gifts.unshift(gift);
        this.renderGifts();
    }

    handleGiftSold(giftId) {
        const gift = this.gifts.find(g => g._id === giftId);
        if (gift) {
            gift.status = 'sold';
            this.renderGifts();
        }
    }

    handleGiftUpdate(gift) {
        const index = this.gifts.findIndex(g => g._id === gift._id);
        if (index !== -1) {
            this.gifts[index] = gift;
            this.renderGifts();
        }
    }

    handleGiftDelete(giftId) {
        this.gifts = this.gifts.filter(g => g._id !== giftId);
        this.renderGifts();
    }
}

// Создаем глобальный экземпляр
window.giftsManager = new GiftsManager(); 