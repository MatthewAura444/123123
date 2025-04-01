class SearchManager {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.searchResults = document.getElementById('searchResults');
        this.currentQuery = '';
        this.searchTimeout = null;
        this.init();
    }

    init() {
        try {
            // Добавляем обработчики событий
            this.addEventListeners();

            // Подписываемся на WebSocket события
            window.wsClient.on('searchResults', this.handleSearchResults.bind(this));
        } catch (error) {
            console.error('Ошибка инициализации SearchManager:', error);
            window.notificationManager.error('Ошибка инициализации поиска');
        }
    }

    addEventListeners() {
        if (this.searchInput) {
            // Обработка ввода
            this.searchInput.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value);
            });

            // Обработка очистки
            this.searchInput.addEventListener('clear', () => {
                this.clearSearch();
            });

            // Обработка отправки формы
            this.searchInput.form?.addEventListener('submit', (e) => {
                e.preventDefault();
                this.performSearch();
            });
        }
    }

    handleSearchInput(value) {
        // Очищаем предыдущий таймаут
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        this.currentQuery = value;

        // Если строка поиска пуста, очищаем результаты
        if (!value.trim()) {
            this.clearSearch();
            return;
        }

        // Устанавливаем новый таймаут для поиска
        this.searchTimeout = setTimeout(() => {
            this.performSearch();
        }, 300);
    }

    async performSearch() {
        try {
            const loadingNotification = window.notificationManager.showLoading('Поиск...');
            
            // Отправляем запрос на поиск
            const results = await window.api.searchGifts(this.currentQuery);
            
            // Отображаем результаты
            this.displaySearchResults(results);
            
            window.notificationManager.removeLoading(loadingNotification);
        } catch (error) {
            console.error('Ошибка поиска:', error);
            window.notificationManager.error('Ошибка поиска');
        }
    }

    displaySearchResults(results) {
        if (!this.searchResults) return;

        if (results.length === 0) {
            this.searchResults.innerHTML = `
                <div class="no-results">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    <p>Ничего не найдено</p>
                </div>
            `;
            return;
        }

        this.searchResults.innerHTML = results.map(gift => `
            <div class="search-result-item" data-id="${gift._id}">
                <div class="result-image">
                    <img src="${gift.imageUrl}" alt="${gift.name}" loading="lazy">
                </div>
                <div class="result-info">
                    <h3 class="result-name">${gift.name}</h3>
                    <p class="result-description">${gift.description || 'Нет описания'}</p>
                    <div class="result-meta">
                        <span class="result-category">${gift.category || 'Без категории'}</span>
                        <span class="result-price">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                            </svg>
                            ${gift.price} ${gift.currency}
                        </span>
                    </div>
                </div>
            </div>
        `).join('');

        // Добавляем анимации для результатов
        this.searchResults.querySelectorAll('.search-result-item').forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
            window.animationManager.animateCardEnter(item);
        });

        // Добавляем обработчики кликов
        this.addResultClickHandlers();
    }

    addResultClickHandlers() {
        this.searchResults.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const giftId = item.dataset.id;
                this.handleResultClick(giftId);
            });
        });
    }

    handleResultClick(giftId) {
        // Переходим к деталям подарка
        window.location.href = `/gift/${giftId}`;
    }

    clearSearch() {
        if (this.searchInput) {
            this.searchInput.value = '';
        }
        if (this.searchResults) {
            this.searchResults.innerHTML = '';
        }
        this.currentQuery = '';
    }

    handleSearchResults(results) {
        this.displaySearchResults(results);
    }

    // Метод для поиска по коллекциям
    async searchCollections(query) {
        try {
            const loadingNotification = window.notificationManager.showLoading('Поиск коллекций...');
            const results = await window.api.searchCollections(query);
            this.displayCollectionResults(results);
            window.notificationManager.removeLoading(loadingNotification);
        } catch (error) {
            console.error('Ошибка поиска коллекций:', error);
            window.notificationManager.error('Ошибка поиска коллекций');
        }
    }

    displayCollectionResults(results) {
        if (!this.searchResults) return;

        if (results.length === 0) {
            this.searchResults.innerHTML = `
                <div class="no-results">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    <p>Коллекции не найдены</p>
                </div>
            `;
            return;
        }

        this.searchResults.innerHTML = results.map(collection => `
            <div class="search-result-item collection" data-id="${collection._id}">
                <div class="result-image">
                    <img src="${collection.coverImage}" alt="${collection.name}" loading="lazy">
                </div>
                <div class="result-info">
                    <h3 class="result-name">${collection.name}</h3>
                    <p class="result-description">${collection.description || 'Нет описания'}</p>
                    <div class="result-meta">
                        <span class="result-category">${collection.category}</span>
                        <span class="result-gifts">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 12v10H4V12"/>
                                <path d="M2 7h20v5H2z"/>
                                <path d="M12 22V7"/>
                                <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                                <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                            </svg>
                            ${collection.gifts?.length || 0}
                        </span>
                    </div>
                </div>
            </div>
        `).join('');

        // Добавляем анимации для результатов
        this.searchResults.querySelectorAll('.search-result-item').forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
            window.animationManager.animateCardEnter(item);
        });

        // Добавляем обработчики кликов
        this.addCollectionClickHandlers();
    }

    addCollectionClickHandlers() {
        this.searchResults.querySelectorAll('.search-result-item.collection').forEach(item => {
            item.addEventListener('click', () => {
                const collectionId = item.dataset.id;
                this.handleCollectionClick(collectionId);
            });
        });
    }

    handleCollectionClick(collectionId) {
        // Переходим к деталям коллекции
        window.location.href = `/collection/${collectionId}`;
    }
}

// Создаем глобальный экземпляр
window.searchManager = new SearchManager(); 