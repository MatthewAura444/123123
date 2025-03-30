class AnimationManager {
    constructor() {
        this.animations = new Map();
        this.init();
    }

    init() {
        // Инициализируем анимации при загрузке страницы
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeAnimations();
            this.observeElements();
        });
    }

    initializeAnimations() {
        // Добавляем анимации для карточек подарков
        this.addAnimation('.gift-card', {
            enter: 'fadeInUp',
            hover: 'scaleUp',
            exit: 'fadeOutDown'
        });

        // Добавляем анимации для карточек коллекций
        this.addAnimation('.collection-card', {
            enter: 'fadeInUp',
            hover: 'scaleUp',
            exit: 'fadeOutDown'
        });

        // Добавляем анимации для статистики
        this.addAnimation('.stat-card', {
            enter: 'fadeInLeft',
            hover: 'scaleUp'
        });

        // Добавляем анимации для кнопок
        this.addAnimation('.btn', {
            hover: 'scaleUp',
            click: 'scaleDown'
        });

        // Добавляем анимации для модальных окон
        this.addAnimation('.modal', {
            enter: 'fadeIn',
            exit: 'fadeOut'
        });

        // Добавляем анимации для форм
        this.addAnimation('.form-group', {
            enter: 'slideInRight'
        });
    }

    addAnimation(selector, animations) {
        this.animations.set(selector, animations);
    }

    observeElements() {
        // Создаем Intersection Observer для анимаций при появлении элементов
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const animations = this.animations.get(element.className);
                    if (animations && animations.enter) {
                        this.animate(element, animations.enter);
                    }
                }
            });
        }, {
            threshold: 0.1
        });

        // Наблюдаем за всеми элементами с анимациями
        this.animations.forEach((animations, selector) => {
            document.querySelectorAll(selector).forEach(element => {
                observer.observe(element);
            });
        });
    }

    animate(element, animation, duration = 300) {
        // Добавляем класс анимации
        element.classList.add(`animate-${animation}`);

        // Удаляем класс анимации после завершения
        setTimeout(() => {
            element.classList.remove(`animate-${animation}`);
        }, duration);
    }

    // Анимации для карточек
    animateCardEnter(card) {
        this.animate(card, 'fadeInUp');
    }

    animateCardHover(card) {
        this.animate(card, 'scaleUp');
    }

    animateCardExit(card) {
        this.animate(card, 'fadeOutDown');
    }

    // Анимации для кнопок
    animateButtonHover(button) {
        this.animate(button, 'scaleUp');
    }

    animateButtonClick(button) {
        this.animate(button, 'scaleDown');
    }

    // Анимации для модальных окон
    animateModalEnter(modal) {
        this.animate(modal, 'fadeIn');
    }

    animateModalExit(modal) {
        this.animate(modal, 'fadeOut');
    }

    // Анимации для форм
    animateFormGroupEnter(formGroup) {
        this.animate(formGroup, 'slideInRight');
    }

    // Анимации для статистики
    animateStatCardEnter(statCard) {
        this.animate(statCard, 'fadeInLeft');
    }

    animateStatCardHover(statCard) {
        this.animate(statCard, 'scaleUp');
    }

    // Анимации для уведомлений
    animateNotification(notification) {
        // Добавляем класс для анимации появления
        notification.classList.add('notification-enter');
    }

    // Анимации для загрузки
    animateLoading(element) {
        element.classList.add('animate-pulse');
    }

    stopLoading(element) {
        element.classList.remove('animate-pulse');
    }

    // Анимации для переходов между страницами
    animatePageTransition(fromPage, toPage) {
        this.animate(fromPage, 'fadeOut');
        setTimeout(() => {
            this.animate(toPage, 'fadeIn');
        }, 300);
    }

    // Анимации для ошибок
    animateError(element) {
        this.animate(element, 'shake');
    }

    // Анимации для успешных действий
    animateSuccess(element) {
        this.animate(element, 'bounce');
    }
}

// Создаем глобальный экземпляр
window.animationManager = new AnimationManager(); 