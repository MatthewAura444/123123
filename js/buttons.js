class ButtonManager {
    constructor() {
        this.buttons = new Map();
        this.init();
    }

    init() {
        try {
            // Добавляем обработчики событий
            this.addEventListeners();

            // Инициализируем все кнопки на странице
            this.initializeButtons();
        } catch (error) {
            console.error('Ошибка инициализации ButtonManager:', error);
            window.notificationManager.error('Ошибка инициализации кнопок');
        }
    }

    addEventListeners() {
        // Обработка наведения
        document.addEventListener('mouseover', (e) => {
            const button = e.target.closest('.btn');
            if (button) {
                this.handleButtonHover(button);
            }
        });

        // Обработка ухода мыши
        document.addEventListener('mouseout', (e) => {
            const button = e.target.closest('.btn');
            if (button) {
                this.handleButtonLeave(button);
            }
        });

        // Обработка нажатия
        document.addEventListener('mousedown', (e) => {
            const button = e.target.closest('.btn');
            if (button) {
                this.handleButtonPress(button);
            }
        });

        // Обработка отпускания
        document.addEventListener('mouseup', (e) => {
            const button = e.target.closest('.btn');
            if (button) {
                this.handleButtonRelease(button);
            }
        });

        // Обработка клика
        document.addEventListener('click', (e) => {
            const button = e.target.closest('.btn');
            if (button) {
                this.handleButtonClick(button);
            }
        });
    }

    initializeButtons() {
        // Находим все кнопки на странице
        const buttonElements = document.querySelectorAll('.btn');
        buttonElements.forEach(button => {
            this.registerButton(button);
        });
    }

    registerButton(buttonElement) {
        const buttonId = buttonElement.id;
        if (!buttonId) {
            console.warn('Кнопка не имеет ID');
            return;
        }

        // Создаем объект кнопки
        const button = {
            element: buttonElement,
            type: this.getButtonType(buttonElement),
            state: 'default',
            onClick: null,
            onHover: null,
            onPress: null,
            onRelease: null,
            loading: false,
            disabled: false
        };

        // Добавляем обработчики для кнопки
        this.addButtonHandlers(button);

        // Сохраняем кнопку
        this.buttons.set(buttonId, button);
    }

    getButtonType(buttonElement) {
        const types = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'link'];
        for (const type of types) {
            if (buttonElement.classList.contains(`btn-${type}`)) {
                return type;
            }
        }
        return 'primary';
    }

    addButtonHandlers(button) {
        const element = button.element;

        // Добавляем обработчик наведения
        element.addEventListener('mouseover', () => {
            this.handleButtonHover(element);
        });

        // Добавляем обработчик ухода мыши
        element.addEventListener('mouseout', () => {
            this.handleButtonLeave(element);
        });

        // Добавляем обработчик нажатия
        element.addEventListener('mousedown', () => {
            this.handleButtonPress(element);
        });

        // Добавляем обработчик отпускания
        element.addEventListener('mouseup', () => {
            this.handleButtonRelease(element);
        });

        // Добавляем обработчик клика
        element.addEventListener('click', () => {
            this.handleButtonClick(element);
        });
    }

    handleButtonHover(buttonElement) {
        const button = this.getButtonData(buttonElement);
        if (!button || button.disabled) return;

        button.state = 'hover';
        this.updateButtonUI(button);

        if (button.onHover) {
            button.onHover();
        }
    }

    handleButtonLeave(buttonElement) {
        const button = this.getButtonData(buttonElement);
        if (!button || button.disabled) return;

        button.state = 'default';
        this.updateButtonUI(button);
    }

    handleButtonPress(buttonElement) {
        const button = this.getButtonData(buttonElement);
        if (!button || button.disabled) return;

        button.state = 'pressed';
        this.updateButtonUI(button);

        if (button.onPress) {
            button.onPress();
        }
    }

    handleButtonRelease(buttonElement) {
        const button = this.getButtonData(buttonElement);
        if (!button || button.disabled) return;

        button.state = 'hover';
        this.updateButtonUI(button);

        if (button.onRelease) {
            button.onRelease();
        }
    }

    handleButtonClick(buttonElement) {
        const button = this.getButtonData(buttonElement);
        if (!button || button.disabled) return;

        if (button.onClick) {
            button.onClick();
        }
    }

    getButtonData(buttonElement) {
        const buttonId = buttonElement.id;
        return this.buttons.get(buttonId);
    }

    updateButtonUI(button) {
        const element = button.element;

        // Обновляем классы состояния
        element.classList.remove('btn-default', 'btn-hover', 'btn-pressed', 'btn-loading', 'btn-disabled');
        element.classList.add(`btn-${button.state}`);

        // Обновляем состояние загрузки
        if (button.loading) {
            element.classList.add('btn-loading');
            this.addLoadingSpinner(element);
        } else {
            this.removeLoadingSpinner(element);
        }

        // Обновляем состояние отключения
        if (button.disabled) {
            element.classList.add('btn-disabled');
            element.disabled = true;
        } else {
            element.classList.remove('btn-disabled');
            element.disabled = false;
        }
    }

    addLoadingSpinner(buttonElement) {
        if (!buttonElement.querySelector('.btn-spinner')) {
            const spinner = document.createElement('span');
            spinner.className = 'btn-spinner';
            buttonElement.appendChild(spinner);
        }
    }

    removeLoadingSpinner(buttonElement) {
        const spinner = buttonElement.querySelector('.btn-spinner');
        if (spinner) {
            spinner.remove();
        }
    }

    // Метод для добавления новой кнопки динамически
    addButton(buttonId, content, options = {}) {
        // Создаем элемент кнопки
        const buttonElement = document.createElement('button');
        buttonElement.id = buttonId;
        buttonElement.className = `btn btn-${options.type || 'primary'}`;
        buttonElement.innerHTML = content;

        // Добавляем кнопку в DOM
        document.body.appendChild(buttonElement);

        // Регистрируем кнопку
        this.registerButton(buttonElement);

        // Применяем опции
        const button = this.buttons.get(buttonId);
        if (button) {
            if (options.onClick) {
                button.onClick = options.onClick;
            }
            if (options.onHover) {
                button.onHover = options.onHover;
            }
            if (options.onPress) {
                button.onPress = options.onPress;
            }
            if (options.onRelease) {
                button.onRelease = options.onRelease;
            }
        }

        return buttonId;
    }

    // Метод для удаления кнопки
    removeButton(buttonId) {
        const button = this.buttons.get(buttonId);
        if (!button) return;

        button.element.remove();
        this.buttons.delete(buttonId);
    }

    // Метод для установки состояния загрузки
    setLoading(buttonId, loading) {
        const button = this.buttons.get(buttonId);
        if (!button) return;

        button.loading = loading;
        this.updateButtonUI(button);
    }

    // Метод для установки состояния отключения
    setDisabled(buttonId, disabled) {
        const button = this.buttons.get(buttonId);
        if (!button) return;

        button.disabled = disabled;
        this.updateButtonUI(button);
    }

    // Метод для установки обработчиков событий
    setHandlers(buttonId, handlers) {
        const button = this.buttons.get(buttonId);
        if (!button) return;

        if (handlers.onClick) {
            button.onClick = handlers.onClick;
        }
        if (handlers.onHover) {
            button.onHover = handlers.onHover;
        }
        if (handlers.onPress) {
            button.onPress = handlers.onPress;
        }
        if (handlers.onRelease) {
            button.onRelease = handlers.onRelease;
        }
    }

    // Метод для получения состояния кнопки
    getButtonState(buttonId) {
        const button = this.buttons.get(buttonId);
        if (!button) return null;

        return {
            loading: button.loading,
            disabled: button.disabled,
            state: button.state
        };
    }
}

// Создаем глобальный экземпляр
window.buttonManager = new ButtonManager(); 