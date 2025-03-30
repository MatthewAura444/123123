class ProfileManager {
    constructor() {
        this.profileContainer = document.querySelector('.profile-container');
        this.currentUser = null;
        this.userData = null;
        this.init();
    }

    async init() {
        try {
            // Получаем данные пользователя из Telegram Web App
            this.currentUser = window.Telegram.WebApp.initDataUnsafe.user;
            
            // Загружаем данные профиля
            await this.loadProfile();
            
            // Инициализируем обработчики событий
            this.initEventHandlers();
        } catch (error) {
            console.error('Error initializing profile page:', error);
            window.location.href = '/market';
        }
    }

    async loadProfile() {
        try {
            const response = await fetch(`/api/users/${this.currentUser.id}`);
            if (!response.ok) {
                throw new Error('Failed to load profile');
            }
            
            this.userData = await response.json();
            
            // Рендерим профиль
            this.renderProfile();
        } catch (error) {
            console.error('Error loading profile:', error);
            window.location.href = '/market';
        }
    }

    renderProfile() {
        // Создаем HTML для профиля
        const html = `
            <div class="profile-header">
                <div class="profile-avatar">
                    <img src="${this.userData.avatar}" alt="${this.userData.name}">
                    <button class="btn btn-icon change-avatar">
                        <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.05c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                    </button>
                </div>
                <div class="profile-info">
                    <h1 class="profile-name">${this.userData.name}</h1>
                    <p class="profile-bio">${this.userData.bio || 'Нет описания'}</p>
                    <div class="profile-stats">
                        <div class="stat-item">
                            <span class="stat-value">${this.userData.collectionsCount}</span>
                            <span class="stat-label">Коллекций</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">${this.userData.giftsCount}</span>
                            <span class="stat-label">Подарков</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">${this.userData.salesCount}</span>
                            <span class="stat-label">Продаж</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="profile-content">
                <div class="profile-tabs">
                    <button class="tab-btn active" data-tab="collections">
                        <svg viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
                        Коллекции
                    </button>
                    <button class="tab-btn" data-tab="gifts">
                        <svg viewBox="0 0 24 24"><path d="M20 12v10H4V12c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2zm-2 0H6v8h12v-8z"/></svg>
                        Подарки
                    </button>
                    <button class="tab-btn" data-tab="favorites">
                        <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                        Избранное
                    </button>
                    <button class="tab-btn" data-tab="settings">
                        <svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.39-.29-.61-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.23-.08-.49 0-.61.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.39.29.61.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.23.08.49 0 .61-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
                        Настройки
                    </button>
                </div>
                <div class="tab-content">
                    <div class="tab-pane active" id="collections">
                        ${this.renderCollections()}
                    </div>
                    <div class="tab-pane" id="gifts">
                        ${this.renderGifts()}
                    </div>
                    <div class="tab-pane" id="favorites">
                        ${this.renderFavorites()}
                    </div>
                    <div class="tab-pane" id="settings">
                        ${this.renderSettings()}
                    </div>
                </div>
            </div>
        `;
        
        // Вставляем HTML в контейнер
        this.profileContainer.innerHTML = html;
    }

    renderCollections() {
        if (!this.userData.collections.length) {
            return `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
                    <h3>Нет коллекций</h3>
                    <p>Создайте свою первую коллекцию подарков</p>
                    <a href="/create-collection" class="btn btn-primary">Создать коллекцию</a>
                </div>
            `;
        }
        
        return `
            <div class="collections-grid">
                ${this.userData.collections.map(collection => `
                    <div class="collection-card">
                        <div class="collection-image" style="background-image: url('${collection.image}')">
                            <div class="collection-overlay">
                                <div class="collection-actions">
                                    <button class="btn btn-icon edit-collection" data-id="${collection.id}">
                                        <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.05c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                                    </button>
                                    <button class="btn btn-icon delete-collection" data-id="${collection.id}">
                                        <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="collection-info">
                            <h3 class="collection-name">${collection.name}</h3>
                            <p class="collection-description">${collection.description}</p>
                            <div class="collection-meta">
                                <span class="collection-stats">
                                    <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                    ${collection.favorites}
                                </span>
                                <span class="collection-stats">
                                    <svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                                    ${collection.views}
                                </span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderGifts() {
        if (!this.userData.gifts.length) {
            return `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24"><path d="M20 12v10H4V12c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2zm-2 0H6v8h12v-8z"/></svg>
                    <h3>Нет подарков</h3>
                    <p>Создайте свой первый подарок</p>
                    <a href="/create-gift" class="btn btn-primary">Создать подарок</a>
                </div>
            `;
        }
        
        return `
            <div class="gifts-grid">
                ${this.userData.gifts.map(gift => `
                    <div class="gift-card">
                        <div class="gift-image" style="background-image: url('${gift.image}')">
                            <div class="gift-overlay">
                                <div class="gift-actions">
                                    <button class="btn btn-icon edit-gift" data-id="${gift.id}">
                                        <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.05c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                                    </button>
                                    <button class="btn btn-icon delete-gift" data-id="${gift.id}">
                                        <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="gift-info">
                            <h3 class="gift-name">${gift.name}</h3>
                            <p class="gift-description">${gift.description}</p>
                            <div class="gift-meta">
                                <span class="gift-category">${gift.category}</span>
                                <span class="gift-price">${this.formatPrice(gift.price)}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderFavorites() {
        if (!this.userData.favorites.length) {
            return `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    <h3>Нет избранного</h3>
                    <p>Добавьте подарки в избранное</p>
                    <a href="/market" class="btn btn-primary">Перейти в магазин</a>
                </div>
            `;
        }
        
        return `
            <div class="favorites-grid">
                ${this.userData.favorites.map(gift => `
                    <div class="gift-card">
                        <div class="gift-image" style="background-image: url('${gift.image}')">
                            <div class="gift-overlay">
                                <div class="gift-actions">
                                    <button class="btn btn-icon remove-favorite" data-id="${gift.id}">
                                        <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="gift-info">
                            <h3 class="gift-name">${gift.name}</h3>
                            <p class="gift-description">${gift.description}</p>
                            <div class="gift-meta">
                                <span class="gift-category">${gift.category}</span>
                                <span class="gift-price">${this.formatPrice(gift.price)}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderSettings() {
        return `
            <div class="settings-form">
                <div class="form-group">
                    <label for="name">Имя</label>
                    <input type="text" id="name" name="name" value="${this.userData.name}">
                </div>
                <div class="form-group">
                    <label for="bio">О себе</label>
                    <textarea id="bio" name="bio" rows="4">${this.userData.bio || ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" value="${this.userData.email || ''}">
                </div>
                <div class="form-group">
                    <label for="phone">Телефон</label>
                    <input type="tel" id="phone" name="phone" value="${this.userData.phone || ''}">
                </div>
                <div class="form-actions">
                    <button class="btn btn-primary save-settings">Сохранить</button>
                </div>
            </div>
        `;
    }

    formatPrice(price) {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB'
        }).format(price);
    }

    initEventHandlers() {
        // Обработчики вкладок
        const tabButtons = this.profileContainer.querySelectorAll('.tab-btn');
        const tabPanes = this.profileContainer.querySelectorAll('.tab-pane');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.dataset.tab;
                
                // Активируем кнопку
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Показываем содержимое вкладки
                tabPanes.forEach(pane => {
                    pane.classList.remove('active');
                    if (pane.id === tabId) {
                        pane.classList.add('active');
                    }
                });
            });
        });
        
        // Обработчик изменения аватара
        const changeAvatarButton = this.profileContainer.querySelector('.change-avatar');
        if (changeAvatarButton) {
            changeAvatarButton.addEventListener('click', this.handleAvatarChange.bind(this));
        }
        
        // Обработчики коллекций
        this.profileContainer.querySelectorAll('.edit-collection').forEach(button => {
            button.addEventListener('click', (e) => {
                const collectionId = e.currentTarget.dataset.id;
                window.location.href = `/edit-collection?id=${collectionId}`;
            });
        });
        
        this.profileContainer.querySelectorAll('.delete-collection').forEach(button => {
            button.addEventListener('click', (e) => {
                const collectionId = e.currentTarget.dataset.id;
                this.handleDeleteCollection(collectionId);
            });
        });
        
        // Обработчики подарков
        this.profileContainer.querySelectorAll('.edit-gift').forEach(button => {
            button.addEventListener('click', (e) => {
                const giftId = e.currentTarget.dataset.id;
                window.location.href = `/edit-gift?id=${giftId}`;
            });
        });
        
        this.profileContainer.querySelectorAll('.delete-gift').forEach(button => {
            button.addEventListener('click', (e) => {
                const giftId = e.currentTarget.dataset.id;
                this.handleDeleteGift(giftId);
            });
        });
        
        // Обработчики избранного
        this.profileContainer.querySelectorAll('.remove-favorite').forEach(button => {
            button.addEventListener('click', (e) => {
                const giftId = e.currentTarget.dataset.id;
                this.handleRemoveFavorite(giftId);
            });
        });
        
        // Обработчик сохранения настроек
        const saveSettingsButton = this.profileContainer.querySelector('.save-settings');
        if (saveSettingsButton) {
            saveSettingsButton.addEventListener('click', this.handleSaveSettings.bind(this));
        }
    }

    async handleAvatarChange() {
        try {
            // Создаем input для выбора файла
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                // Проверяем тип файла
                if (!file.type.startsWith('image/')) {
                    window.Telegram.WebApp.showAlert('Пожалуйста, выберите изображение');
                    return;
                }
                
                // Проверяем размер файла (максимум 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    window.Telegram.WebApp.showAlert('Размер изображения не должен превышать 5MB');
                    return;
                }
                
                // Показываем уведомление о загрузке
                window.Telegram.WebApp.showPopup({
                    title: 'Загрузка аватара',
                    message: 'Пожалуйста, подождите...',
                    buttons: []
                });
                
                // Загружаем изображение
                const formData = new FormData();
                formData.append('avatar', file);
                
                const response = await fetch('/api/users/avatar', {
                    method: 'POST',
                    body: formData
                });
                
                if (!response.ok) {
                    throw new Error('Failed to upload avatar');
                }
                
                const { url: avatarUrl } = await response.json();
                
                // Обновляем аватар
                const avatarImg = this.profileContainer.querySelector('.profile-avatar img');
                avatarImg.src = avatarUrl;
                
                // Закрываем уведомление
                window.Telegram.WebApp.closePopup();
                
                // Показываем уведомление об успехе
                window.Telegram.WebApp.showAlert('Аватар успешно обновлен');
            };
            
            input.click();
        } catch (error) {
            console.error('Error changing avatar:', error);
            window.Telegram.WebApp.showAlert('Произошла ошибка при обновлении аватара');
        }
    }

    async handleDeleteCollection(collectionId) {
        try {
            // Показываем подтверждение
            const confirmed = await window.Telegram.WebApp.showConfirm(
                'Вы уверены, что хотите удалить эту коллекцию?'
            );
            
            if (!confirmed) return;
            
            // Показываем уведомление о загрузке
            window.Telegram.WebApp.showPopup({
                title: 'Удаление коллекции',
                message: 'Пожалуйста, подождите...',
                buttons: []
            });
            
            // Отправляем запрос на удаление
            const response = await fetch(`/api/collections/${collectionId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete collection');
            }
            
            // Закрываем уведомление
            window.Telegram.WebApp.closePopup();
            
            // Показываем уведомление об успехе
            window.Telegram.WebApp.showAlert('Коллекция успешно удалена');
            
            // Обновляем профиль
            await this.loadProfile();
        } catch (error) {
            console.error('Error deleting collection:', error);
            window.Telegram.WebApp.showAlert('Произошла ошибка при удалении коллекции');
        }
    }

    async handleDeleteGift(giftId) {
        try {
            // Показываем подтверждение
            const confirmed = await window.Telegram.WebApp.showConfirm(
                'Вы уверены, что хотите удалить этот подарок?'
            );
            
            if (!confirmed) return;
            
            // Показываем уведомление о загрузке
            window.Telegram.WebApp.showPopup({
                title: 'Удаление подарка',
                message: 'Пожалуйста, подождите...',
                buttons: []
            });
            
            // Отправляем запрос на удаление
            const response = await fetch(`/api/gifts/${giftId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete gift');
            }
            
            // Закрываем уведомление
            window.Telegram.WebApp.closePopup();
            
            // Показываем уведомление об успехе
            window.Telegram.WebApp.showAlert('Подарок успешно удален');
            
            // Обновляем профиль
            await this.loadProfile();
        } catch (error) {
            console.error('Error deleting gift:', error);
            window.Telegram.WebApp.showAlert('Произошла ошибка при удалении подарка');
        }
    }

    async handleRemoveFavorite(giftId) {
        try {
            // Показываем уведомление о загрузке
            window.Telegram.WebApp.showPopup({
                title: 'Удаление из избранного',
                message: 'Пожалуйста, подождите...',
                buttons: []
            });
            
            // Отправляем запрос на удаление из избранного
            const response = await fetch(`/api/gifts/${giftId}/favorite`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error('Failed to remove from favorites');
            }
            
            // Закрываем уведомление
            window.Telegram.WebApp.closePopup();
            
            // Показываем уведомление об успехе
            window.Telegram.WebApp.showAlert('Подарок удален из избранного');
            
            // Обновляем профиль
            await this.loadProfile();
        } catch (error) {
            console.error('Error removing from favorites:', error);
            window.Telegram.WebApp.showAlert('Произошла ошибка при удалении из избранного');
        }
    }

    async handleSaveSettings() {
        try {
            // Собираем данные формы
            const formData = new FormData(this.profileContainer.querySelector('.settings-form'));
            const data = {
                name: formData.get('name'),
                bio: formData.get('bio'),
                email: formData.get('email'),
                phone: formData.get('phone')
            };
            
            // Валидация
            if (!data.name) {
                window.Telegram.WebApp.showAlert('Пожалуйста, введите имя');
                return;
            }
            
            // Показываем уведомление о загрузке
            window.Telegram.WebApp.showPopup({
                title: 'Сохранение настроек',
                message: 'Пожалуйста, подождите...',
                buttons: []
            });
            
            // Отправляем запрос на обновление
            const response = await fetch(`/api/users/${this.currentUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error('Failed to update settings');
            }
            
            // Закрываем уведомление
            window.Telegram.WebApp.closePopup();
            
            // Показываем уведомление об успехе
            window.Telegram.WebApp.showAlert('Настройки успешно сохранены');
            
            // Обновляем профиль
            await this.loadProfile();
        } catch (error) {
            console.error('Error saving settings:', error);
            window.Telegram.WebApp.showAlert('Произошла ошибка при сохранении настроек');
        }
    }
}

// Создаем глобальный экземпляр
window.profileManager = new ProfileManager(); 