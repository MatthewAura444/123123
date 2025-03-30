class CollectionsManager {
    constructor() {
        this.collectionsContainer = document.getElementById('collectionsContainer');
        this.currentUser = null;
        this.collections = [];
        this.init();
    }

    async init() {
        try {
            // Получаем данные пользователя из Telegram Web App
            const tg = window.Telegram.WebApp;
            if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
                this.currentUser = tg.initDataUnsafe.user;
                await this.loadCollections();
            }

            // Подписываемся на WebSocket события
            window.wsClient.on('collectionUpdate', this.handleCollectionUpdate.bind(this));
            window.wsClient.on('collectionDelete', this.handleCollectionDelete.bind(this));
            window.wsClient.on('newCollection', this.handleNewCollection.bind(this));
        } catch (error) {
            console.error('Ошибка инициализации CollectionsManager:', error);
            window.notificationManager.error('Ошибка инициализации коллекций');
        }
    }

    async loadCollections() {
        try {
            const loadingNotification = window.notificationManager.showLoading('Загрузка коллекций...');
            
            // Загружаем коллекции
            this.collections = await window.api.getCollections();
            
            // Отображаем коллекции
            this.renderCollections();
            
            window.notificationManager.removeLoading(loadingNotification);
        } catch (error) {
            console.error('Ошибка загрузки коллекций:', error);
            window.notificationManager.error('Ошибка загрузки коллекций');
        }
    }

    renderCollections() {
        if (!this.collectionsContainer) return;

        if (this.collections.length === 0) {
            this.collectionsContainer.innerHTML = `
                <div class="no-collections">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                    </svg>
                    <h3>Коллекции не найдены</h3>
                    <p>Создайте свою первую коллекцию подарков</p>
                </div>
            `;
            return;
        }

        this.collectionsContainer.innerHTML = this.collections.map(collection => `
            <div class="collection-card" data-id="${collection._id}">
                <div class="collection-image">
                    <img src="${collection.coverImage}" alt="${collection.name}" loading="lazy">
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
                                ${collection.gifts?.length || 0}
                            </div>
                            <div class="collection-stat">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                                </svg>
                                ${collection.totalValue} ${collection.currency}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="collection-info">
                    <h3 class="collection-name">${collection.name}</h3>
                    <p class="collection-description">${collection.description || 'Нет описания'}</p>
                    <div class="collection-meta">
                        <div class="collection-category">${collection.category || 'Без категории'}</div>
                        <div class="collection-rating">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                            </svg>
                            ${collection.rating.toFixed(1)}
                        </div>
                    </div>
                    <div class="collection-actions">
                        ${this.currentUser && this.currentUser.id === collection.userId ? `
                            <button class="btn btn-secondary btn-sm edit-collection" data-id="${collection._id}">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                                Редактировать
                            </button>
                            <button class="btn btn-danger btn-sm delete-collection" data-id="${collection._id}">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                </svg>
                                Удалить
                            </button>
                        ` : `
                            <button class="btn btn-primary btn-sm view-collection" data-id="${collection._id}">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                    <circle cx="12" cy="12" r="3"/>
                                </svg>
                                Просмотреть
                            </button>
                            <button class="btn btn-secondary btn-sm favorite-collection ${collection.isFavorite ? 'active' : ''}" data-id="${collection._id}">
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
        this.collectionsContainer.querySelectorAll('.collection-card').forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            window.animationManager.animateCardEnter(card);
        });

        // Добавляем обработчики событий
        this.addEventHandlers();
    }

    addEventHandlers() {
        // Обработка редактирования коллекции
        this.collectionsContainer.querySelectorAll('.edit-collection').forEach(button => {
            button.addEventListener('click', (e) => {
                const collectionId = e.currentTarget.dataset.id;
                this.editCollection(collectionId);
            });
        });

        // Обработка удаления коллекции
        this.collectionsContainer.querySelectorAll('.delete-collection').forEach(button => {
            button.addEventListener('click', (e) => {
                const collectionId = e.currentTarget.dataset.id;
                this.deleteCollection(collectionId);
            });
        });

        // Обработка просмотра коллекции
        this.collectionsContainer.querySelectorAll('.view-collection').forEach(button => {
            button.addEventListener('click', (e) => {
                const collectionId = e.currentTarget.dataset.id;
                this.viewCollection(collectionId);
            });
        });

        // Обработка добавления в избранное
        this.collectionsContainer.querySelectorAll('.favorite-collection').forEach(button => {
            button.addEventListener('click', (e) => {
                const collectionId = e.currentTarget.dataset.id;
                this.toggleFavorite(collectionId);
            });
        });
    }

    async editCollection(collectionId) {
        try {
            const collection = this.collections.find(c => c._id === collectionId);
            if (!collection) return;

            // Открываем модальное окно редактирования
            window.modalManager.openModal('editCollectionModal', {
                onOpen: () => {
                    window.formManager.setFormValues('editCollectionForm', {
                        name: collection.name,
                        description: collection.description,
                        category: collection.category
                    });
                },
                onSubmit: async (data) => {
                    try {
                        await window.api.updateCollection(collectionId, data);
                        window.notificationManager.success('Коллекция успешно обновлена');
                        window.modalManager.closeModal('editCollectionModal');
                        this.loadCollections();
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

    async deleteCollection(collectionId) {
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
                            await window.api.deleteCollection(collectionId);
                            window.notificationManager.success('Коллекция успешно удалена');
                            window.modalManager.closeModal('confirmModal');
                            this.loadCollections();
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

    async viewCollection(collectionId) {
        try {
            // Переходим на страницу коллекции
            window.location.href = `/collection/${collectionId}`;
        } catch (error) {
            console.error('Ошибка просмотра коллекции:', error);
            window.notificationManager.error('Ошибка просмотра коллекции');
        }
    }

    async toggleFavorite(collectionId) {
        try {
            const button = this.collectionsContainer.querySelector(`.favorite-collection[data-id="${collectionId}"]`);
            if (!button) return;

            const isFavorite = button.classList.contains('active');
            
            // Обновляем UI
            button.classList.toggle('active');
            window.buttonManager.setLoading(button.id, true);

            // Отправляем запрос
            await window.api.toggleCollectionFavorite(collectionId);

            window.buttonManager.setLoading(button.id, false);
            window.notificationManager.success(isFavorite ? 'Коллекция удалена из избранного' : 'Коллекция добавлена в избранное');
        } catch (error) {
            console.error('Ошибка обновления избранного:', error);
            window.notificationManager.error('Ошибка обновления избранного');
        }
    }

    handleCollectionUpdate(updatedCollection) {
        const index = this.collections.findIndex(c => c._id === updatedCollection._id);
        if (index !== -1) {
            this.collections[index] = updatedCollection;
            this.renderCollections();
        }
    }

    handleCollectionDelete(collectionId) {
        this.collections = this.collections.filter(c => c._id !== collectionId);
        this.renderCollections();
    }

    handleNewCollection(newCollection) {
        this.collections.unshift(newCollection);
        this.renderCollections();
    }
}

// Создаем глобальный экземпляр
window.collectionsManager = new CollectionsManager(); 
window.collectionsManager = new CollectionsManager(); 