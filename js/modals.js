class ModalManager {
    constructor() {
        this.modals = new Map();
        this.activeModal = null;
        this.init();
    }

    init() {
        try {
            // Добавляем обработчики событий
            this.addEventListeners();

            // Инициализируем все модальные окна
            this.initializeModals();
        } catch (error) {
            console.error('Ошибка инициализации ModalManager:', error);
            window.notificationManager.error('Ошибка инициализации модальных окон');
        }
    }

    addEventListeners() {
        // Обработка клика по оверлею
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeActiveModal();
            }
        });

        // Обработка нажатия клавиши Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModal) {
                this.closeActiveModal();
            }
        });
    }

    initializeModals() {
        // Находим все модальные окна на странице
        const modalElements = document.querySelectorAll('.modal');
        modalElements.forEach(modal => {
            this.registerModal(modal);
        });
    }

    registerModal(modalElement) {
        const modalId = modalElement.id;
        if (!modalId) {
            console.warn('Модальное окно не имеет ID');
            return;
        }

        // Создаем объект модального окна
        const modal = {
            element: modalElement,
            overlay: this.createOverlay(),
            isOpen: false,
            onOpen: null,
            onClose: null
        };

        // Добавляем оверлей в DOM
        document.body.appendChild(modal.overlay);

        // Добавляем обработчики для кнопок закрытия
        const closeButtons = modalElement.querySelectorAll('.modal-close');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.closeModal(modalId);
            });
        });

        // Сохраняем модальное окно
        this.modals.set(modalId, modal);
    }

    createOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        return overlay;
    }

    openModal(modalId, options = {}) {
        const modal = this.modals.get(modalId);
        if (!modal) {
            console.error(`Модальное окно с ID ${modalId} не найдено`);
            return;
        }

        if (modal.isOpen) {
            return;
        }

        // Закрываем активное модальное окно, если оно есть
        if (this.activeModal) {
            this.closeModal(this.activeModal);
        }

        // Применяем опции
        if (options.onOpen) {
            modal.onOpen = options.onOpen;
        }
        if (options.onClose) {
            modal.onClose = options.onClose;
        }

        // Показываем модальное окно
        modal.element.classList.add('active');
        modal.overlay.classList.add('active');
        modal.isOpen = true;
        this.activeModal = modalId;

        // Блокируем прокрутку страницы
        document.body.style.overflow = 'hidden';

        // Вызываем callback при открытии
        if (modal.onOpen) {
            modal.onOpen();
        }

        // Добавляем анимацию
        window.animationManager.animateModalEnter(modal.element);
    }

    closeModal(modalId) {
        const modal = this.modals.get(modalId);
        if (!modal || !modal.isOpen) {
            return;
        }

        // Скрываем модальное окно
        modal.element.classList.remove('active');
        modal.overlay.classList.remove('active');
        modal.isOpen = false;

        // Разблокируем прокрутку страницы
        if (!this.hasOpenModals()) {
            document.body.style.overflow = '';
        }

        // Вызываем callback при закрытии
        if (modal.onClose) {
            modal.onClose();
        }

        // Сбрасываем активное модальное окно
        if (this.activeModal === modalId) {
            this.activeModal = null;
        }
    }

    closeActiveModal() {
        if (this.activeModal) {
            this.closeModal(this.activeModal);
        }
    }

    hasOpenModals() {
        return Array.from(this.modals.values()).some(modal => modal.isOpen);
    }

    // Метод для обновления содержимого модального окна
    updateModalContent(modalId, content) {
        const modal = this.modals.get(modalId);
        if (!modal) {
            console.error(`Модальное окно с ID ${modalId} не найдено`);
            return;
        }

        const contentContainer = modal.element.querySelector('.modal-content');
        if (!contentContainer) {
            console.error('Контейнер содержимого не найден');
            return;
        }

        contentContainer.innerHTML = content;
    }

    // Метод для добавления нового модального окна динамически
    addModal(modalId, content, options = {}) {
        // Создаем элемент модального окна
        const modalElement = document.createElement('div');
        modalElement.id = modalId;
        modalElement.className = 'modal';
        modalElement.innerHTML = `
            <div class="modal-content">
                <button class="modal-close">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
                ${content}
            </div>
        `;

        // Добавляем модальное окно в DOM
        document.body.appendChild(modalElement);

        // Регистрируем модальное окно
        this.registerModal(modalElement);

        // Открываем модальное окно, если указано в опциях
        if (options.open) {
            this.openModal(modalId, options);
        }

        return modalId;
    }

    // Метод для удаления модального окна
    removeModal(modalId) {
        const modal = this.modals.get(modalId);
        if (!modal) {
            return;
        }

        // Закрываем модальное окно, если оно открыто
        if (modal.isOpen) {
            this.closeModal(modalId);
        }

        // Удаляем элементы из DOM
        modal.element.remove();
        modal.overlay.remove();

        // Удаляем модальное окно из Map
        this.modals.delete(modalId);
    }

    // Метод для проверки, открыто ли модальное окно
    isModalOpen(modalId) {
        const modal = this.modals.get(modalId);
        return modal ? modal.isOpen : false;
    }

    // Метод для получения активного модального окна
    getActiveModal() {
        return this.activeModal;
    }
}

// Создаем глобальный экземпляр
window.modalManager = new ModalManager(); 