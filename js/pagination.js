class PaginationManager {
    constructor() {
        this.paginationContainer = document.getElementById('paginationContainer');
        this.currentPage = 1;
        this.totalPages = 1;
        this.itemsPerPage = 12;
        this.init();
    }

    init() {
        try {
            // Добавляем обработчики событий
            this.addEventListeners();

            // Подписываемся на WebSocket события
            window.wsClient.on('paginationUpdate', this.handlePaginationUpdate.bind(this));
        } catch (error) {
            console.error('Ошибка инициализации PaginationManager:', error);
            window.notificationManager.error('Ошибка инициализации пагинации');
        }
    }

    addEventListeners() {
        if (this.paginationContainer) {
            // Обработка кликов по кнопкам пагинации
            this.paginationContainer.addEventListener('click', (e) => {
                const button = e.target.closest('.pagination-button');
                if (button) {
                    const page = parseInt(button.dataset.page);
                    if (!isNaN(page)) {
                        this.handlePageChange(page);
                    }
                }
            });
        }
    }

    handlePageChange(page) {
        if (page === this.currentPage || page < 1 || page > this.totalPages) {
            return;
        }

        this.currentPage = page;
        this.updatePagination();
        this.scrollToTop();
    }

    updatePagination() {
        if (!this.paginationContainer) return;

        // Отправляем событие изменения страницы через WebSocket
        window.wsClient.emit('pageChange', {
            page: this.currentPage,
            itemsPerPage: this.itemsPerPage
        });

        // Обновляем UI
        this.renderPagination();
    }

    renderPagination() {
        if (!this.paginationContainer) return;

        const pages = this.generatePageNumbers();
        this.paginationContainer.innerHTML = this.generatePaginationHTML(pages);
    }

    generatePageNumbers() {
        const pages = [];
        const maxVisiblePages = 5;
        const halfMaxPages = Math.floor(maxVisiblePages / 2);

        let startPage = Math.max(1, this.currentPage - halfMaxPages);
        let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // Добавляем первую страницу
        if (startPage > 1) {
            pages.push(1);
            if (startPage > 2) {
                pages.push('ellipsis');
            }
        }

        // Добавляем страницы в диапазоне
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        // Добавляем последнюю страницу
        if (endPage < this.totalPages) {
            if (endPage < this.totalPages - 1) {
                pages.push('ellipsis');
            }
            pages.push(this.totalPages);
        }

        return pages;
    }

    generatePaginationHTML(pages) {
        return `
            <button class="pagination-button prev-page" 
                    data-page="${this.currentPage - 1}"
                    ${this.currentPage === 1 ? 'disabled' : ''}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M15 18l-6-6 6-6"/>
                </svg>
            </button>
            ${pages.map(page => {
                if (page === 'ellipsis') {
                    return '<span class="pagination-ellipsis">...</span>';
                }
                return `
                    <button class="pagination-button ${page === this.currentPage ? 'active' : ''}"
                            data-page="${page}">
                        ${page}
                    </button>
                `;
            }).join('')}
            <button class="pagination-button next-page"
                    data-page="${this.currentPage + 1}"
                    ${this.currentPage === this.totalPages ? 'disabled' : ''}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 18l6-6-6-6"/>
                </svg>
            </button>
        `;
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    handlePaginationUpdate(data) {
        const { currentPage, totalPages, itemsPerPage } = data;
        
        this.currentPage = currentPage;
        this.totalPages = totalPages;
        this.itemsPerPage = itemsPerPage;

        this.renderPagination();
    }

    // Метод для обновления общего количества страниц
    updateTotalPages(totalItems) {
        this.totalPages = Math.ceil(totalItems / this.itemsPerPage);
        this.renderPagination();
    }

    // Метод для изменения количества элементов на странице
    setItemsPerPage(itemsPerPage) {
        this.itemsPerPage = itemsPerPage;
        this.currentPage = 1;
        this.updatePagination();
    }

    // Метод для получения текущих параметров пагинации
    getPaginationParams() {
        return {
            page: this.currentPage,
            itemsPerPage: this.itemsPerPage,
            totalPages: this.totalPages
        };
    }
}

// Создаем глобальный экземпляр
window.paginationManager = new PaginationManager(); 