class MarketManager {
    constructor() {
        this.marketContainer = document.getElementById('marketContainer');
        this.currentUser = null;
        this.gifts = [];
        this.filters = {
            sort: 'popular',
            price: {
                min: 0,
                max: Infinity
            },
            category: [],
            rating: 0
        };
        this.init();
    }

    async init() {
        try {
            // Получаем данные пользователя из Telegram Web App
            const tg = window.Telegram.WebApp;
            if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
                this.currentUser = tg.initDataUnsafe.user;
                await this.loadMarket();
            }

            // Подписываемся на WebSocket события
            window.wsClient.on('giftUpdate', this.handleGiftUpdate.bind(this));
            window.wsClient.on('giftDelete', this.handleGiftDelete.bind(this));
            window.wsClient.on('giftSold', this.handleGiftSold.bind(this));
            window.wsClient.on('newGift', this.handleNewGift.bind(this));
        } catch (error) {
            console.error('Ошибка инициализации MarketManager:', error);
            window.notificationManager.error('Ошибка инициализации маркета');
        }
    }

    async loadMarket() {
        try {
            const loadingNotification = window.notificationManager.showLoading('Загрузка маркета...');
            
            // Загружаем подарки с учетом фильтров
            this.gifts = await window.api.getGifts(this.filters);
            
            // Отображаем подарки
            this.renderMarket();
            
            window.notificationManager.removeLoading(loadingNotification);
        } catch (error) {
            console.error('Ошибка загрузки маркета:', error);
            window.notificationManager.error('Ошибка загрузки маркета');
        }
    }

    renderMarket() {
        if (!this.marketContainer) return;

        if (this.gifts.length === 0) {
            this.marketContainer.innerHTML = `
                <div class="no-gifts">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 12v10H4V12"/>
                        <path d="M2 7h20v5H2z"/>
                        <path d="M12 22V7"/>
                        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                    </svg>
                    <h3>Подарки не найдены</h3>
                    <p>Попробуйте изменить фильтры или загрузить новые подарки</p>
                </div>
            `;
            return;
        }

        this.marketContainer.innerHTML = this.gifts.map(gift => `
            <div class="gift-card" data-id="${gift._id}">
                <div class="gift-image">
                    <img src="${gift.imageUrl}" alt="${gift.name}" loading="lazy">
                    ${gift.is3D ? '<span class="gift-3d-badge">3D</span>' : ''}
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
                    <div class="gift-price">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                        </svg>
                        ${gift.price} ${gift.currency}
                    </div>
                    <div class="gift-actions">
                        ${this.currentUser && this.currentUser.id === gift.userId ? `
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
                                    <path d="M9 20a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM20 20a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
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
        `).join('');

        // Добавляем анимации для карточек
        this.marketContainer.querySelectorAll('.gift-card').forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            window.animationManager.animateCardEnter(card);
        });

        // Добавляем обработчики событий
        this.addEventHandlers();
    }

    addEventHandlers() {
        // Обработка редактирования подарка
        this.marketContainer.querySelectorAll('.edit-gift').forEach(button => {
            button.addEventListener('click', (e) => {
                const giftId = e.currentTarget.dataset.id;
                this.editGift(giftId);
            });
        });

        // Обработка удаления подарка
        this.marketContainer.querySelectorAll('.delete-gift').forEach(button => {
            button.addEventListener('click', (e) => {
                const giftId = e.currentTarget.dataset.id;
                this.deleteGift(giftId);
            });
        });

        // Обработка покупки подарка
        this.marketContainer.querySelectorAll('.buy-gift').forEach(button => {
            button.addEventListener('click', (e) => {
                const giftId = e.currentTarget.dataset.id;
                this.buyGift(giftId);
            });
        });

        // Обработка добавления в избранное
        this.marketContainer.querySelectorAll('.favorite-gift').forEach(button => {
            button.addEventListener('click', (e) => {
                const giftId = e.currentTarget.dataset.id;
                this.toggleFavorite(giftId);
            });
        });
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
                        this.loadMarket();
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
                            this.loadMarket();
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
            if (!window.tonConnect.isConnected()) {
                window.notificationManager.warning('Для покупки необходимо подключить кошелек');
                return;
            }

            // Показываем подтверждение покупки
            window.modalManager.openModal('confirmModal', {
                content: `
                    <div class="modal-header">
                        <h3 class="modal-title">Подтверждение покупки</h3>
                    </div>
                    <div class="modal-body">
                        <p>Вы собираетесь купить подарок "${gift.name}"</p>
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
                            const loadingNotification = window.notificationManager.showLoading('Обработка покупки...');
                            
                            // Отправляем транзакцию
                            await window.tonConnect.sendTransaction({
                                to: gift.walletAddress,
                                amount: gift.price
                            });

                            // Обновляем статус подарка
                            await window.api.buyGift(giftId);

                            window.notificationManager.removeLoading(loadingNotification);
                            window.notificationManager.success('Подарок успешно куплен');
                            window.modalManager.closeModal('confirmModal');
                            this.loadMarket();
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

    async toggleFavorite(giftId) {
        try {
            const button = this.marketContainer.querySelector(`.favorite-gift[data-id="${giftId}"]`);
            if (!button) return;

            const isFavorite = button.classList.contains('active');
            
            // Обновляем UI
            button.classList.toggle('active');
            window.buttonManager.setLoading(button.id, true);

            // Отправляем запрос
            await window.api.toggleFavorite(giftId);

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
            this.renderMarket();
        }
    }

    handleGiftDelete(giftId) {
        this.gifts = this.gifts.filter(g => g._id !== giftId);
        this.renderMarket();
    }

    handleGiftSold(giftId) {
        const gift = this.gifts.find(g => g._id === giftId);
        if (gift) {
            gift.isSold = true;
            this.renderMarket();
        }
    }

    handleNewGift(newGift) {
        this.gifts.unshift(newGift);
        this.renderMarket();
    }

    // Метод для обновления фильтров
    updateFilters(newFilters) {
        this.filters = { ...this.filters, ...newFilters };
        this.loadMarket();
    }

    // Метод для сброса фильтров
    resetFilters() {
        this.filters = {
            sort: 'popular',
            price: {
                min: 0,
                max: Infinity
            },
            category: [],
            rating: 0
        };
        this.loadMarket();
    }
}

// Создаем глобальный экземпляр
window.marketManager = new MarketManager(); 