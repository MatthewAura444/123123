class FiltersManager {
    constructor() {
        this.filtersContainer = document.getElementById('filtersContainer');
        this.activeFilters = new Set();
        this.filterValues = {
            price: {
                min: 0,
                max: Infinity
            },
            category: [],
            rating: 0,
            sort: 'popular'
        };
        this.init();
    }

    init() {
        try {
            // Добавляем обработчики событий
            this.addEventListeners();

            // Подписываемся на WebSocket события
            window.wsClient.on('filterUpdate', this.handleFilterUpdate.bind(this));
        } catch (error) {
            console.error('Ошибка инициализации FiltersManager:', error);
            window.notificationManager.error('Ошибка инициализации фильтров');
        }
    }

    addEventListeners() {
        if (this.filtersContainer) {
            // Обработка изменения цены
            const priceInputs = this.filtersContainer.querySelectorAll('.price-input');
            priceInputs.forEach(input => {
                input.addEventListener('change', (e) => {
                    this.handlePriceChange(e.target);
                });
            });

            // Обработка выбора категорий
            const categoryCheckboxes = this.filtersContainer.querySelectorAll('.category-checkbox');
            categoryCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', (e) => {
                    this.handleCategoryChange(e.target);
                });
            });

            // Обработка изменения рейтинга
            const ratingInput = this.filtersContainer.querySelector('.rating-input');
            if (ratingInput) {
                ratingInput.addEventListener('change', (e) => {
                    this.handleRatingChange(e.target);
                });
            }

            // Обработка сортировки
            const sortSelect = this.filtersContainer.querySelector('.sort-select');
            if (sortSelect) {
                sortSelect.addEventListener('change', (e) => {
                    this.handleSortChange(e.target);
                });
            }

            // Обработка сброса фильтров
            const resetButton = this.filtersContainer.querySelector('.reset-filters');
            if (resetButton) {
                resetButton.addEventListener('click', () => {
                    this.resetFilters();
                });
            }
        }
    }

    handlePriceChange(input) {
        const { name, value } = input;
        this.filterValues.price[name] = Number(value);

        // Проверяем валидность диапазона цен
        if (this.filterValues.price.min > this.filterValues.price.max) {
            window.notificationManager.warning('Минимальная цена не может быть больше максимальной');
            return;
        }

        this.updateFilters();
    }

    handleCategoryChange(checkbox) {
        const category = checkbox.value;
        
        if (checkbox.checked) {
            this.filterValues.category.push(category);
        } else {
            this.filterValues.category = this.filterValues.category.filter(c => c !== category);
        }

        this.updateFilters();
    }

    handleRatingChange(input) {
        this.filterValues.rating = Number(input.value);
        this.updateFilters();
    }

    handleSortChange(select) {
        this.filterValues.sort = select.value;
        this.updateFilters();
    }

    resetFilters() {
        // Сбрасываем все значения фильтров
        this.filterValues = {
            price: {
                min: 0,
                max: Infinity
            },
            category: [],
            rating: 0,
            sort: 'popular'
        };

        // Сбрасываем UI
        this.resetFilterUI();

        // Обновляем фильтры
        this.updateFilters();
    }

    resetFilterUI() {
        // Сбрасываем поля цены
        const priceInputs = this.filtersContainer.querySelectorAll('.price-input');
        priceInputs.forEach(input => {
            input.value = input.name === 'min' ? '0' : '';
        });

        // Сбрасываем чекбоксы категорий
        const categoryCheckboxes = this.filtersContainer.querySelectorAll('.category-checkbox');
        categoryCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });

        // Сбрасываем рейтинг
        const ratingInput = this.filtersContainer.querySelector('.rating-input');
        if (ratingInput) {
            ratingInput.value = '0';
        }

        // Сбрасываем сортировку
        const sortSelect = this.filtersContainer.querySelector('.sort-select');
        if (sortSelect) {
            sortSelect.value = 'popular';
        }
    }

    updateFilters() {
        // Отправляем обновленные фильтры через WebSocket
        window.wsClient.emit('updateFilters', this.filterValues);

        // Обновляем UI
        this.updateFilterUI();
    }

    updateFilterUI() {
        // Обновляем активные фильтры
        this.updateActiveFilters();

        // Обновляем счетчик активных фильтров
        this.updateFilterCounter();
    }

    updateActiveFilters() {
        const activeFiltersContainer = this.filtersContainer.querySelector('.active-filters');
        if (!activeFiltersContainer) return;

        // Очищаем контейнер
        activeFiltersContainer.innerHTML = '';

        // Добавляем активные фильтры
        if (this.filterValues.price.min > 0 || this.filterValues.price.max < Infinity) {
            this.addActiveFilter('price', `Цена: ${this.formatPriceRange()}`);
        }

        if (this.filterValues.category.length > 0) {
            this.addActiveFilter('category', `Категории: ${this.filterValues.category.join(', ')}`);
        }

        if (this.filterValues.rating > 0) {
            this.addActiveFilter('rating', `Рейтинг: ${this.filterValues.rating}+`);
        }

        if (this.filterValues.sort !== 'popular') {
            this.addActiveFilter('sort', `Сортировка: ${this.getSortLabel(this.filterValues.sort)}`);
        }
    }

    addActiveFilter(type, label) {
        const activeFiltersContainer = this.filtersContainer.querySelector('.active-filters');
        if (!activeFiltersContainer) return;

        const filterElement = document.createElement('div');
        filterElement.className = 'active-filter';
        filterElement.dataset.type = type;
        filterElement.innerHTML = `
            <span class="filter-label">${label}</span>
            <button class="remove-filter" data-type="${type}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
            </button>
        `;

        // Добавляем обработчик удаления
        const removeButton = filterElement.querySelector('.remove-filter');
        removeButton.addEventListener('click', () => {
            this.removeFilter(type);
        });

        activeFiltersContainer.appendChild(filterElement);
    }

    removeFilter(type) {
        switch (type) {
            case 'price':
                this.filterValues.price = { min: 0, max: Infinity };
                this.resetFilterUI();
                break;
            case 'category':
                this.filterValues.category = [];
                this.resetFilterUI();
                break;
            case 'rating':
                this.filterValues.rating = 0;
                this.resetFilterUI();
                break;
            case 'sort':
                this.filterValues.sort = 'popular';
                this.resetFilterUI();
                break;
        }

        this.updateFilters();
    }

    updateFilterCounter() {
        const counter = this.filtersContainer.querySelector('.filter-counter');
        if (!counter) return;

        const activeCount = this.getActiveFilterCount();
        counter.textContent = activeCount > 0 ? activeCount : '';
        counter.style.display = activeCount > 0 ? 'block' : 'none';
    }

    getActiveFilterCount() {
        let count = 0;

        if (this.filterValues.price.min > 0 || this.filterValues.price.max < Infinity) count++;
        if (this.filterValues.category.length > 0) count++;
        if (this.filterValues.rating > 0) count++;
        if (this.filterValues.sort !== 'popular') count++;

        return count;
    }

    formatPriceRange() {
        const { min, max } = this.filterValues.price;
        if (min > 0 && max < Infinity) {
            return `${min} - ${max} ${window.currency}`;
        } else if (min > 0) {
            return `от ${min} ${window.currency}`;
        } else if (max < Infinity) {
            return `до ${max} ${window.currency}`;
        }
        return '';
    }

    getSortLabel(sort) {
        const sortLabels = {
            popular: 'Популярные',
            new: 'Новые',
            price_asc: 'Цена (по возрастанию)',
            price_desc: 'Цена (по убыванию)',
            rating: 'По рейтингу'
        };
        return sortLabels[sort] || sort;
    }

    handleFilterUpdate(filters) {
        // Обновляем значения фильтров
        this.filterValues = { ...filters };
        
        // Обновляем UI
        this.updateFilterUI();
    }
}

// Создаем глобальный экземпляр
window.filtersManager = new FiltersManager(); 