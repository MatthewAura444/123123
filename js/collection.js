class CollectionManager {
    constructor() {
        this.collectionContainer = document.getElementById('collectionContainer');
        this.giftsContainer = document.getElementById('giftsContainer');
        this.currentUser = null;
        this.collection = null;
        this.gifts = [];
        this.init();
    }

    async init() {
        try {
            // Получаем данные пользователя из Telegram Web App
            const tg = window.Telegram.WebApp;
            if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
                this.currentUser = tg.initDataUnsafe.user;
            }

            // Получаем ID коллекции из URL
            const collectionId = window.location.pathname.split('/').pop();
            await this.loadCollection(collectionId);

            // Подписываемся на WebSocket события
            window.wsClient.on('giftUpdate', this.handleGiftUpdate.bind(this));
            window.wsClient.on('giftDelete', this.handleGiftDelete.bind(this));
            window.wsClient.on('newGift', this.handleNewGift.bind(this));
            window.wsClient.on('collectionUpdate', this.handleCollectionUpdate.bind(this));
        } catch (error) {
            console.error('Ошибка инициализации CollectionManager:', error);
            window.notificationManager.error('Ошибка загрузки коллекции');
        }
    }

    async loadCollection(collectionId) {
        try {
            const loadingNotification = window.notificationManager.showLoading('Загрузка коллекции...');
            
            // Загружаем данные коллекции
            this.collection = await window.api.getCollection(collectionId);
            
            // Загружаем подарки коллекции
            this.gifts = await window.api.getCollectionGifts(collectionId);
            
            // Отображаем коллекцию и подарки
            this.renderCollection();
            this.renderGifts();
            
            window.notificationManager.removeLoading(loadingNotification);
        } catch (error) {
            console.error('Ошибка загрузки коллекции:', error);
            window.notificationManager.error('Ошибка загрузки коллекции');
        }
    }

    renderCollection() {
        if (!this.collectionContainer || !this.collection) return;

        this.collectionContainer.innerHTML = `
            <div class="collection-header">
                <div class="collection-cover">
                    <img src="${this.collection.coverImage}" alt="${this.collection.name}" loading="lazy">
                    <div class="collection-overlay">
                        <div class="collection-stats">
                            <div class="collection-stat">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M20 12v10H4V12"/>
                                    <path d="M2 7h20v5H2z"/>
                                    <path d="M12 22V7"/>
                                    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                                    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                                </svg>
                                ${this.gifts.length}
                            </div>
                            <div class="collection-stat">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                                </svg>
                                ${this.collection.totalValue} ${this.collection.currency}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="collection-info">
                    <div class="collection-header-content">
                        <h1 class="collection-name">${this.collection.name}</h1>
                        <div class="collection-meta">
                            <div class="collection-category">${this.collection.category || 'Без категории'}</div>
                            <div class="collection-rating">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                                </svg>
                                ${this.collection.rating.toFixed(1)}
                            </div>
                        </div>
                    </div>
                    <p class="collection-description">${this.collection.description || 'Нет описания'}</p>
                    <div class="collection-actions">
                        ${this.currentUser && this.currentUser.id === this.collection.userId ? `
                            <button class="btn btn-secondary edit-collection" data-id="${this.collection._id}">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                                Редактировать
                            </button>
                            <button class="btn btn-danger delete-collection" data-id="${this.collection._id}">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                </svg>
                                Удалить
                            </button>
                        ` : `
                            <button class="btn btn-primary view-gifts">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                    <circle cx="12" cy="12" r="3"/>
                                </svg>
                                Просмотреть подарки
                            </button>
                            <button class="btn btn-secondary favorite-collection ${this.collection.isFavorite ? 'active' : ''}" data-id="${this.collection._id}">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                </svg>
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;

        // Добавляем обработчики событий
        this.addCollectionEventHandlers();
    }

    renderGifts() {
        if (!this.giftsContainer) return;

        if (this.gifts.length === 0) {
            this.giftsContainer.innerHTML = `
                <div class="no-gifts">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 12v10H4V12"/>
                        <path d="M2 7h20v5H2z"/>
                        <path d="M12 22V7"/>
                        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                    </svg>
                    <h3>Подарки не найдены</h3>
                    <p>В этой коллекции пока нет подарков</p>
                </div>
            `;
            return;
        }

        this.giftsContainer.innerHTML = `
            <div class="gifts-grid">
                ${this.gifts.map(gift => `
                    <div class="gift-card" data-id="${gift._id}">
                        <div class="gift-image">
                            <img src="${gift.image}" alt="${gift.name}" loading="lazy">
                            <div class="gift-overlay">
                                <div class="gift-price">
                                    ${gift.price} ${gift.currency}
                                </div>
                            </div>
                        </div>
                        <div class="gift-info">
                            <h3 class="gift-name">${gift.name}</h3>
                            <p class="gift-description">${gift.description || 'Нет описания'}</p>
                            <div class="gift-meta">
                                <div class="gift-category">${gift.category || 'Без категории'}</div>
                                <div class="gift-rating">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                                    </svg>
                                    ${gift.rating.toFixed(1)}
                                </div>
                            </div>
                            <div class="gift-actions">
                                ${this.currentUser && this.currentUser.id === this.collection.userId ? `
                                    <button class="btn btn-secondary btn-sm edit-gift" data-id="${gift._id}">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                        </svg>
                                        Редактировать
                                    </button>
                                    <button class="btn btn-danger btn-sm delete-gift" data-id="${gift._id}">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                        </svg>
                                        Удалить
                                    </button>
                                ` : `
                                    <button class="btn btn-primary btn-sm buy-gift" data-id="${gift._id}">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0zm-8 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/>
                                        </svg>
                                        Купить
                                    </button>
                                    <button class="btn btn-secondary btn-sm favorite-gift ${gift.isFavorite ? 'active' : ''}" data-id="${gift._id}">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                        </svg>
                                    </button>
                                `}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Добавляем анимации для карточек
        this.giftsContainer.querySelectorAll('.gift-card').forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            window.animationManager.animateCardEnter(card);
        });

        // Добавляем обработчики событий
        this.addGiftEventHandlers();
    }

    addCollectionEventHandlers() {
        // Обработка редактирования коллекции
        const editButton = this.collectionContainer.querySelector('.edit-collection');
        if (editButton) {
            editButton.addEventListener('click', () => {
                this.editCollection();
            });
        }

        // Обработка удаления коллекции
        const deleteButton = this.collectionContainer.querySelector('.delete-collection');
        if (deleteButton) {
            deleteButton.addEventListener('click', () => {
                this.deleteCollection();
            });
        }

        // Обработка добавления в избранное
        const favoriteButton = this.collectionContainer.querySelector('.favorite-collection');
        if (favoriteButton) {
            favoriteButton.addEventListener('click', () => {
                this.toggleFavorite();
            });
        }

        // Обработка просмотра подарков
        const viewGiftsButton = this.collectionContainer.querySelector('.view-gifts');
        if (viewGiftsButton) {
            viewGiftsButton.addEventListener('click', () => {
                this.scrollToGifts();
            });
        }
    }

    addGiftEventHandlers() {
        // Обработка редактирования подарка
        this.giftsContainer.querySelectorAll('.edit-gift').forEach(button => {
            button.addEventListener('click', (e) => {
                const giftId = e.currentTarget.dataset.id;
                this.editGift(giftId);
            });
        });

        // Обработка удаления подарка
        this.giftsContainer.querySelectorAll('.delete-gift').forEach(button => {
            button.addEventListener('click', (e) => {
                const giftId = e.currentTarget.dataset.id;
                this.deleteGift(giftId);
            });
        });

        // Обработка покупки подарка
        this.giftsContainer.querySelectorAll('.buy-gift').forEach(button => {
            button.addEventListener('click', (e) => {
                const giftId = e.currentTarget.dataset.id;
                this.buyGift(giftId);
            });
        });

        // Обработка добавления подарка в избранное
        this.giftsContainer.querySelectorAll('.favorite-gift').forEach(button => {
            button.addEventListener('click', (e) => {
                const giftId = e.currentTarget.dataset.id;
                this.toggleGiftFavorite(giftId);
            });
        });
    }

    async editCollection() {
        try {
            // Открываем модальное окно редактирования
            window.modalManager.openModal('editCollectionModal', {
                onOpen: () => {
                    window.formManager.setFormValues('editCollectionForm', {
                        name: this.collection.name,
                        description: this.collection.description,
                        category: this.collection.category
                    });
                },
                onSubmit: async (data) => {
                    try {
                        await window.api.updateCollection(this.collection._id, data);
                        window.notificationManager.success('Коллекция успешно обновлена');
                        window.modalManager.closeModal('editCollectionModal');
                        this.loadCollection(this.collection._id);
                    } catch (error) {
                        console.error('Ошибка обновления коллекции:', error);
                        window.notificationManager.error('Ошибка обновления коллекции');
                    }
                }
            });
        } catch (error) {
            console.error('Ошибка редактирования коллекции:', error);
            window.notificationManager.error('Ошибка редактирования коллекции');
        }
    }

    async deleteCollection() {
        try {
            // Показываем подтверждение
            window.modalManager.openModal('confirmModal', {
                content: `
                    <div class="modal-header">
                        <h3 class="modal-title">Удаление коллекции</h3>
                    </div>
                    <div class="modal-body">
                        <p>Вы уверены, что хотите удалить эту коллекцию?</p>
                        <p>Это действие нельзя отменить.</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" data-action="cancel">Отмена</button>
                        <button class="btn btn-danger" data-action="confirm">Удалить</button>
                    </div>
                `,
                onOpen: () => {
                    const modal = document.getElementById('confirmModal');
                    modal.querySelector('[data-action="confirm"]').addEventListener('click', async () => {
                        try {
                            await window.api.deleteCollection(this.collection._id);
                            window.notificationManager.success('Коллекция успешно удалена');
                            window.modalManager.closeModal('confirmModal');
                            window.location.href = '/collections';
                        } catch (error) {
                            console.error('Ошибка удаления коллекции:', error);
                            window.notificationManager.error('Ошибка удаления коллекции');
                        }
                    });
                    modal.querySelector('[data-action="cancel"]').addEventListener('click', () => {
                        window.modalManager.closeModal('confirmModal');
                    });
                }
            });
        } catch (error) {
            console.error('Ошибка удаления коллекции:', error);
            window.notificationManager.error('Ошибка удаления коллекции');
        }
    }

    async toggleFavorite() {
        try {
            const button = this.collectionContainer.querySelector('.favorite-collection');
            if (!button) return;

            const isFavorite = button.classList.contains('active');
            
            // Обновляем UI
            button.classList.toggle('active');
            window.buttonManager.setLoading(button.id, true);

            // Отправляем запрос
            await window.api.toggleCollectionFavorite(this.collection._id);

            window.buttonManager.setLoading(button.id, false);
            window.notificationManager.success(isFavorite ? 'Коллекция удалена из избранного' : 'Коллекция добавлена в избранное');
        } catch (error) {
            console.error('Ошибка обновления избранного:', error);
            window.notificationManager.error('Ошибка обновления избранного');
        }
    }

    scrollToGifts() {
        this.giftsContainer.scrollIntoView({ behavior: 'smooth' });
    }

    async editGift(giftId) {
        try {
            const gift = this.gifts.find(g => g._id === giftId);
            if (!gift) return;

            // Открываем модальное окно редактирования
            window.modalManager.openModal('editGiftModal', {
                onOpen: () => {
                    window.formManager.setFormValues('editGiftForm', {
                        name: gift.name,
                        description: gift.description,
                        price: gift.price,
                        category: gift.category
                    });
                },
                onSubmit: async (data) => {
                    try {
                        await window.api.updateGift(giftId, data);
                        window.notificationManager.success('Подарок успешно обновлен');
                        window.modalManager.closeModal('editGiftModal');
                        this.loadCollection(this.collection._id);
                    } catch (error) {
                        console.error('Ошибка обновления подарка:', error);
                        window.notificationManager.error('Ошибка обновления подарка');
                    }
                }
            });
        } catch (error) {
            console.error('Ошибка редактирования подарка:', error);
            window.notificationManager.error('Ошибка редактирования подарка');
        }
    }

    async deleteGift(giftId) {
        try {
            // Показываем подтверждение
            window.modalManager.openModal('confirmModal', {
                content: `
                    <div class="modal-header">
                        <h3 class="modal-title">Удаление подарка</h3>
                    </div>
                    <div class="modal-body">
                        <p>Вы уверены, что хотите удалить этот подарок?</p>
                        <p>Это действие нельзя отменить.</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" data-action="cancel">Отмена</button>
                        <button class="btn btn-danger" data-action="confirm">Удалить</button>
                    </div>
                `,
                onOpen: () => {
                    const modal = document.getElementById('confirmModal');
                    modal.querySelector('[data-action="confirm"]').addEventListener('click', async () => {
                        try {
                            await window.api.deleteGift(giftId);
                            window.notificationManager.success('Подарок успешно удален');
                            window.modalManager.closeModal('confirmModal');
                            this.loadCollection(this.collection._id);
                        } catch (error) {
                            console.error('Ошибка удаления подарка:', error);
                            window.notificationManager.error('Ошибка удаления подарка');
                        }
                    });
                    modal.querySelector('[data-action="cancel"]').addEventListener('click', () => {
                        window.modalManager.closeModal('confirmModal');
                    });
                }
            });
        } catch (error) {
            console.error('Ошибка удаления подарка:', error);
            window.notificationManager.error('Ошибка удаления подарка');
        }
    }

    async buyGift(giftId) {
        try {
            const gift = this.gifts.find(g => g._id === giftId);
            if (!gift) return;

            // Проверяем подключен ли кошелек
            if (!window.walletManager.isConnected()) {
                window.notificationManager.warning('Пожалуйста, подключите кошелек для покупки');
                return;
            }

            // Проверяем достаточно ли средств
            const balance = await window.walletManager.getBalance();
            if (balance < gift.price) {
                window.notificationManager.error('Недостаточно средств');
                return;
            }

            // Показываем подтверждение
            window.modalManager.openModal('confirmModal', {
                content: `
                    <div class="modal-header">
                        <h3 class="modal-title">Покупка подарка</h3>
                    </div>
                    <div class="modal-body">
                        <p>Вы уверены, что хотите купить этот подарок?</p>
                        <p>Стоимость: ${gift.price} ${gift.currency}</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" data-action="cancel">Отмена</button>
                        <button class="btn btn-primary" data-action="confirm">Купить</button>
                    </div>
                `,
                onOpen: () => {
                    const modal = document.getElementById('confirmModal');
                    modal.querySelector('[data-action="confirm"]').addEventListener('click', async () => {
                        try {
                            // Отправляем транзакцию
                            const transaction = await window.walletManager.sendTransaction({
                                to: gift.owner,
                                amount: gift.price,
                                currency: gift.currency
                            });

                            // Обновляем статус подарка
                            await window.api.updateGiftStatus(giftId, 'sold');

                            window.notificationManager.success('Подарок успешно куплен');
                            window.modalManager.closeModal('confirmModal');
                            this.loadCollection(this.collection._id);
                        } catch (error) {
                            console.error('Ошибка покупки подарка:', error);
                            window.notificationManager.error('Ошибка покупки подарка');
                        }
                    });
                    modal.querySelector('[data-action="cancel"]').addEventListener('click', () => {
                        window.modalManager.closeModal('confirmModal');
                    });
                }
            });
        } catch (error) {
            console.error('Ошибка покупки подарка:', error);
            window.notificationManager.error('Ошибка покупки подарка');
        }
    }

    async toggleGiftFavorite(giftId) {
        try {
            const button = this.giftsContainer.querySelector(`.favorite-gift[data-id="${giftId}"]`);
            if (!button) return;

            const isFavorite = button.classList.contains('active');
            
            // Обновляем UI
            button.classList.toggle('active');
            window.buttonManager.setLoading(button.id, true);

            // Отправляем запрос
            await window.api.toggleGiftFavorite(giftId);

            window.buttonManager.setLoading(button.id, false);
            window.notificationManager.success(isFavorite ? 'Подарок удален из избранного' : 'Подарок добавлен в избранное');
        } catch (error) {
            console.error('Ошибка обновления избранного:', error);
            window.notificationManager.error('Ошибка обновления избранного');
        }
    }

    handleGiftUpdate(updatedGift) {
        const index = this.gifts.findIndex(g => g._id === updatedGift._id);
        if (index !== -1) {
            this.gifts[index] = updatedGift;
            this.renderGifts();
        }
    }

    handleGiftDelete(giftId) {
        this.gifts = this.gifts.filter(g => g._id !== giftId);
        this.renderGifts();
    }

    handleNewGift(newGift) {
        this.gifts.push(newGift);
        this.renderGifts();
    }

    handleCollectionUpdate(updatedCollection) {
        if (updatedCollection._id === this.collection._id) {
            this.collection = updatedCollection;
            this.renderCollection();
        }
    }
}

// Создаем глобальный экземпляр
window.collectionManager = new CollectionManager(); 