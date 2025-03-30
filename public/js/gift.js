class GiftManager {
    constructor() {
        this.giftContainer = document.querySelector('.gift-container');
        this.currentUser = null;
        this.giftId = null;
        this.giftData = null;
        this.init();
    }

    async init() {
        try {
            // Получаем данные пользователя из Telegram Web App
            this.currentUser = window.Telegram.WebApp.initDataUnsafe.user;
            
            // Получаем ID подарка из URL
            const urlParams = new URLSearchParams(window.location.search);
            this.giftId = urlParams.get('id');
            
            if (!this.giftId) {
                window.location.href = '/market';
                return;
            }

            // Загружаем данные подарка
            await this.loadGift();
            
            // Инициализируем обработчики событий
            this.initEventHandlers();
        } catch (error) {
            console.error('Error initializing gift page:', error);
            window.location.href = '/market';
        }
    }

    async loadGift() {
        try {
            const response = await fetch(`/api/gifts/${this.giftId}`);
            if (!response.ok) {
                throw new Error('Failed to load gift');
            }
            
            this.giftData = await response.json();
            
            // Рендерим подарок
            this.renderGift();
        } catch (error) {
            console.error('Error loading gift:', error);
            window.location.href = '/market';
        }
    }

    renderGift() {
        // Создаем HTML для подарка
        const html = `
            <div class="gift-header">
                <div class="gift-image" style="background-image: url('${this.giftData.image}')">
                    ${this.giftData.model ? '<div class="gift-model-preview"></div>' : ''}
                </div>
                <div class="gift-info">
                    <h1 class="gift-name">${this.giftData.name}</h1>
                    <div class="gift-meta">
                        <span class="gift-category">${this.giftData.category}</span>
                        <span class="gift-rating">
                            ${this.generateRatingStars(this.giftData.rating)}
                            <span class="rating-count">(${this.giftData.ratingCount})</span>
                        </span>
                    </div>
                    <p class="gift-description">${this.giftData.description}</p>
                    <div class="gift-price">${this.formatPrice(this.giftData.price)}</div>
                    <div class="gift-actions">
                        ${this.generateActionButtons()}
                    </div>
                </div>
            </div>
            ${this.giftData.model ? this.generateModelViewer() : ''}
            <div class="gift-details">
                <div class="gift-collection">
                    <h2>Коллекция</h2>
                    <a href="/collection?id=${this.giftData.collectionId}" class="collection-link">
                        ${this.giftData.collectionName}
                    </a>
                </div>
                <div class="gift-author">
                    <h2>Автор</h2>
                    <div class="author-info">
                        <img src="${this.giftData.authorAvatar}" alt="${this.giftData.authorName}" class="author-avatar">
                        <span class="author-name">${this.giftData.authorName}</span>
                    </div>
                </div>
                <div class="gift-stats">
                    <h2>Статистика</h2>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <span class="stat-value">${this.giftData.views}</span>
                            <span class="stat-label">Просмотров</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">${this.giftData.sales}</span>
                            <span class="stat-label">Продаж</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">${this.giftData.favorites}</span>
                            <span class="stat-label">В избранном</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Вставляем HTML в контейнер
        this.giftContainer.innerHTML = html;
        
        // Инициализируем 3D просмотрщик, если есть модель
        if (this.giftData.model) {
            this.initModelViewer();
        }
    }

    generateRatingStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let stars = '';
        
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars += '<svg class="star full" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>';
            } else if (i === fullStars && hasHalfStar) {
                stars += '<svg class="star half" viewBox="0 0 24 24"><path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27V2z"/></svg>';
            } else {
                stars += '<svg class="star empty" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>';
            }
        }
        
        return stars;
    }

    formatPrice(price) {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB'
        }).format(price);
    }

    generateActionButtons() {
        const buttons = [];
        
        // Кнопка покупки
        if (this.giftData.authorId !== this.currentUser.id) {
            buttons.push(`
                <button class="btn btn-primary buy-gift">
                    <svg viewBox="0 0 24 24"><path d="M17 18c-1.11 0-2 .9-2 2s.89 2 2 2 2-.9 2-2-.89-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.11 0-2 .9-2 2s.89 2 2 2 2-.9 2-2-.89-2-2-2z"/></svg>
                    Купить
                </button>
            `);
        }
        
        // Кнопка редактирования
        if (this.giftData.authorId === this.currentUser.id) {
            buttons.push(`
                <button class="btn btn-secondary edit-gift">
                    <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.05c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                    Редактировать
                </button>
            `);
        }
        
        // Кнопка избранного
        buttons.push(`
            <button class="btn btn-icon favorite-gift ${this.giftData.isFavorite ? 'active' : ''}">
                <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            </button>
        `);
        
        return buttons.join('');
    }

    generateModelViewer() {
        return `
            <div class="model-viewer">
                <div class="model-viewer-container"></div>
                <div class="model-controls">
                    <button class="btn btn-icon rotate-left">
                        <svg viewBox="0 0 24 24"><path d="M7.11 8.53L5.7 7.11C4.8 8.27 4.24 9.61 4.07 11h2.02c.14-.87.49-1.72 1.02-2.47zM6.09 13H4.07c.17 1.39.72 2.73 1.62 3.89l1.41-1.42c.52-.75.87-1.6 1.01-2.47zm1.01 5.32c1.16.9 2.51 1.44 3.9 1.61V17.9c-.87-.15-1.71-.49-2.46-1.03L7.1 18.32zM13 4.07V1L8.45 5.55 13 10V6.09c2.84.48 5 2.94 5 5.91s-2.16 5.43-5 5.91v2.02c3.95-.49 7-3.85 7-7.93s-3.05-7.44-7-7.93z"/></svg>
                    </button>
                    <button class="btn btn-icon rotate-right">
                        <svg viewBox="0 0 24 24"><path d="M15.55 5.55L11 1v3.07C7.06 4.56 4 7.92 4 12s3.05 7.44 7 7.93v-2.02c-2.84-.48-5-2.94-5-5.91s2.16-5.43 5-5.91V10l4.55-4.45zM19.93 11c-.17-1.39-.72-2.73-1.62-3.89l-1.42 1.42c.54.75.88 1.6 1.02 2.47h2.02zM13 17.9v2.02c1.39-.17 2.74-.71 3.9-1.61l-1.43-1.43c-.75.54-1.59.89-2.47 1.02zm3.89-2.42l1.42 1.41c.9-1.16 1.45-2.5 1.62-3.89h-2.02c-.14.87-.48 1.72-1.02 2.48z"/></svg>
                    </button>
                    <button class="btn btn-icon zoom-in">
                        <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                    </button>
                    <button class="btn btn-icon zoom-out">
                        <svg viewBox="0 0 24 24"><path d="M19 13H5v-2h14v2z"/></svg>
                    </button>
                </div>
            </div>
        `;
    }

    initModelViewer() {
        // Здесь будет инициализация 3D просмотрщика
        // Например, с использованием Three.js или других библиотек
    }

    initEventHandlers() {
        // Обработчик покупки
        const buyButton = this.giftContainer.querySelector('.buy-gift');
        if (buyButton) {
            buyButton.addEventListener('click', this.handleBuy.bind(this));
        }
        
        // Обработчик редактирования
        const editButton = this.giftContainer.querySelector('.edit-gift');
        if (editButton) {
            editButton.addEventListener('click', this.handleEdit.bind(this));
        }
        
        // Обработчик избранного
        const favoriteButton = this.giftContainer.querySelector('.favorite-gift');
        if (favoriteButton) {
            favoriteButton.addEventListener('click', this.handleFavorite.bind(this));
        }
        
        // Обработчики управления 3D моделью
        if (this.giftData.model) {
            const rotateLeftButton = this.giftContainer.querySelector('.rotate-left');
            const rotateRightButton = this.giftContainer.querySelector('.rotate-right');
            const zoomInButton = this.giftContainer.querySelector('.zoom-in');
            const zoomOutButton = this.giftContainer.querySelector('.zoom-out');
            
            if (rotateLeftButton) {
                rotateLeftButton.addEventListener('click', () => this.rotateModel(-45));
            }
            
            if (rotateRightButton) {
                rotateRightButton.addEventListener('click', () => this.rotateModel(45));
            }
            
            if (zoomInButton) {
                zoomInButton.addEventListener('click', () => this.zoomModel(1.1));
            }
            
            if (zoomOutButton) {
                zoomOutButton.addEventListener('click', () => this.zoomModel(0.9));
            }
        }
    }

    async handleBuy() {
        try {
            // Показываем уведомление о загрузке
            window.Telegram.WebApp.showPopup({
                title: 'Покупка подарка',
                message: 'Пожалуйста, подождите...',
                buttons: []
            });
            
            // Отправляем запрос на покупку
            const response = await fetch(`/api/gifts/${this.giftId}/buy`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to buy gift');
            }
            
            // Закрываем уведомление
            window.Telegram.WebApp.closePopup();
            
            // Показываем уведомление об успехе
            window.Telegram.WebApp.showAlert('Подарок успешно куплен!');
            
            // Обновляем статистику
            this.giftData.sales++;
            this.renderGift();
        } catch (error) {
            console.error('Error buying gift:', error);
            window.Telegram.WebApp.showAlert('Произошла ошибка при покупке подарка');
        }
    }

    handleEdit() {
        window.location.href = `/edit-gift?id=${this.giftId}`;
    }

    async handleFavorite() {
        try {
            const favoriteButton = this.giftContainer.querySelector('.favorite-gift');
            const isFavorite = favoriteButton.classList.contains('active');
            
            // Отправляем запрос на изменение избранного
            const response = await fetch(`/api/gifts/${this.giftId}/favorite`, {
                method: isFavorite ? 'DELETE' : 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to toggle favorite');
            }
            
            // Обновляем состояние кнопки
            favoriteButton.classList.toggle('active');
            
            // Обновляем статистику
            this.giftData.favorites += isFavorite ? -1 : 1;
            this.renderGift();
        } catch (error) {
            console.error('Error toggling favorite:', error);
            window.Telegram.WebApp.showAlert('Произошла ошибка при изменении избранного');
        }
    }

    rotateModel(angle) {
        // Здесь будет логика вращения 3D модели
    }

    zoomModel(factor) {
        // Здесь будет логика масштабирования 3D модели
    }
}

// Создаем глобальный экземпляр
window.giftManager = new GiftManager(); 