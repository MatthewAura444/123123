class AnimationManager {
    constructor() {
        this.animations = new Map();
        this.intersectionObserver = null;
        this.init();
    }

    init() {
        // Инициализируем Intersection Observer для анимаций при прокрутке
        this.intersectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        const animation = element.dataset.animation;
                        if (animation) {
                            this.playAnimation(element, animation);
                        }
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '50px'
            }
        );

        // Добавляем обработчики для анимаций при наведении
        document.addEventListener('mouseover', this.handleHoverAnimation.bind(this));
    }

    // Анимации появления элементов
    animateElementEnter(element, animation = 'fadeIn') {
        element.dataset.animation = animation;
        this.intersectionObserver.observe(element);
    }

    // Анимации при наведении
    handleHoverAnimation(event) {
        const element = event.target;
        const hoverAnimation = element.dataset.hoverAnimation;
        
        if (hoverAnimation && !this.animations.has(element)) {
            this.playHoverAnimation(element, hoverAnimation);
        }
    }

    // Воспроизведение анимации
    playAnimation(element, animation) {
        const keyframes = this.getKeyframes(animation);
        if (!keyframes) return;

        const animationName = `${animation}_${Date.now()}`;
        const style = document.createElement('style');
        
        style.textContent = `
            @keyframes ${animationName} {
                ${keyframes}
            }
        `;
        
        document.head.appendChild(style);
        
        element.style.animation = `${animationName} 0.6s ease forwards`;
        
        element.addEventListener('animationend', () => {
            style.remove();
            element.style.animation = '';
        }, { once: true });
    }

    // Воспроизведение анимации при наведении
    playHoverAnimation(element, animation) {
        const keyframes = this.getHoverKeyframes(animation);
        if (!keyframes) return;

        const animationName = `hover_${animation}_${Date.now()}`;
        const style = document.createElement('style');
        
        style.textContent = `
            @keyframes ${animationName} {
                ${keyframes}
            }
        `;
        
        document.head.appendChild(style);
        
        element.style.animation = `${animationName} 0.3s ease forwards`;
        
        element.addEventListener('animationend', () => {
            style.remove();
            element.style.animation = '';
        }, { once: true });
    }

    // Получение keyframes для анимации
    getKeyframes(animation) {
        const keyframes = {
            fadeIn: `
                0% { opacity: 0; }
                100% { opacity: 1; }
            `,
            slideUp: `
                0% { transform: translateY(20px); opacity: 0; }
                100% { transform: translateY(0); opacity: 1; }
            `,
            slideDown: `
                0% { transform: translateY(-20px); opacity: 0; }
                100% { transform: translateY(0); opacity: 1; }
            `,
            slideLeft: `
                0% { transform: translateX(20px); opacity: 0; }
                100% { transform: translateX(0); opacity: 1; }
            `,
            slideRight: `
                0% { transform: translateX(-20px); opacity: 0; }
                100% { transform: translateX(0); opacity: 1; }
            `,
            scaleIn: `
                0% { transform: scale(0.9); opacity: 0; }
                100% { transform: scale(1); opacity: 1; }
            `,
            rotateIn: `
                0% { transform: rotate(-180deg) scale(0); opacity: 0; }
                100% { transform: rotate(0) scale(1); opacity: 1; }
            `,
            bounceIn: `
                0% { transform: scale(0.3); opacity: 0; }
                50% { transform: scale(1.05); opacity: 0.8; }
                70% { transform: scale(0.9); opacity: 0.9; }
                100% { transform: scale(1); opacity: 1; }
            `
        };

        return keyframes[animation];
    }

    // Получение keyframes для анимации при наведении
    getHoverKeyframes(animation) {
        const keyframes = {
            scale: `
                0% { transform: scale(1); }
                100% { transform: scale(1.05); }
            `,
            lift: `
                0% { transform: translateY(0); }
                100% { transform: translateY(-5px); }
            `,
            glow: `
                0% { box-shadow: 0 0 0 rgba(var(--primary-color-rgb), 0); }
                100% { box-shadow: 0 0 20px rgba(var(--primary-color-rgb), 0.5); }
            `,
            pulse: `
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            `,
            shake: `
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            `
        };

        return keyframes[animation];
    }

    // Анимация для карточек статистики
    animateStatCardEnter(card) {
        this.animateElementEnter(card, 'slideUp');
    }

    // Анимация для элементов списка
    animateListItemEnter(item, delay = 0) {
        item.style.animationDelay = `${delay}s`;
        this.animateElementEnter(item, 'slideLeft');
    }

    // Анимация для модальных окон
    animateModalEnter(modal) {
        this.animateElementEnter(modal, 'scaleIn');
    }

    // Анимация для уведомлений
    animateNotificationEnter(notification) {
        this.animateElementEnter(notification, 'slideRight');
    }

    // Анимация для кнопок
    animateButtonEnter(button) {
        this.animateElementEnter(button, 'bounceIn');
    }

    // Анимация для изображений
    animateImageEnter(image) {
        this.animateElementEnter(image, 'fadeIn');
    }

    // Анимация для заголовков
    animateHeadingEnter(heading) {
        this.animateElementEnter(heading, 'slideDown');
    }

    // Анимация для форм
    animateFormEnter(form) {
        this.animateElementEnter(form, 'fadeIn');
    }

    // Анимация для навигации
    animateNavEnter(nav) {
        this.animateElementEnter(nav, 'slideDown');
    }

    // Анимация для футера
    animateFooterEnter(footer) {
        this.animateElementEnter(footer, 'fadeIn');
    }

    // Анимация для загрузки
    animateLoading(element) {
        element.style.animation = 'spin 1s linear infinite';
    }

    // Остановка анимации загрузки
    stopLoadingAnimation(element) {
        element.style.animation = '';
    }
}

// Создаем глобальный экземпляр менеджера анимаций
window.animationManager = new AnimationManager();

// Добавляем стили для анимации загрузки
const loadingStyle = document.createElement('style');
loadingStyle.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(loadingStyle); 