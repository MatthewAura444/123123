// Инициализация Telegram WebApp
let tg = window.Telegram?.WebApp;

// Инициализация Tonkeeper
let tonkeeper = window.tonkeeper;

// Функция для проверки и инициализации Telegram WebApp
function initTelegramWebApp() {
    if (!tg) {
        console.error('Telegram WebApp не найден');
        return false;
    }

    // Инициализация основных параметров
    tg.expand();
    tg.enableClosingConfirmation();
    
    // Установка темы
    document.documentElement.className = tg.colorScheme;
    
    // Инициализация основных цветов
    document.documentElement.style.setProperty('--tg-theme-bg-color', tg.backgroundColor);
    document.documentElement.style.setProperty('--tg-theme-text-color', tg.textColor);
    document.documentElement.style.setProperty('--tg-theme-hint-color', tg.hintColor);
    document.documentElement.style.setProperty('--tg-theme-link-color', tg.linkColor);
    document.documentElement.style.setProperty('--tg-theme-button-color', tg.buttonColor);
    document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.buttonTextColor);
    document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', tg.secondaryBackgroundColor);

    return true;
}

// Функция для проверки и инициализации Tonkeeper
function initTonkeeper() {
    if (!tonkeeper) {
        console.error('Tonkeeper не найден');
        return false;
    }

    // Инициализация Tonkeeper
    tonkeeper.init({
        manifestUrl: 'https://your-app.com/tonkeeper-manifest.json',
        buttonRootId: 'tonkeeper-button'
    });

    return true;
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    const telegramInitialized = initTelegramWebApp();
    const tonkeeperInitialized = initTonkeeper();

    // Обновляем UI в зависимости от доступности кошельков
    updateWalletButtons(telegramInitialized, tonkeeperInitialized);
});

// Функция для обновления кнопок кошельков
function updateWalletButtons(telegramAvailable, tonkeeperAvailable) {
    const walletModal = document.getElementById('walletModal');
    if (!walletModal) return;

    const telegramBtn = walletModal.querySelector('.wallet-btn.telegram');
    const tonkeeperBtn = walletModal.querySelector('.wallet-btn.tonkeeper');

    if (telegramBtn) {
        telegramBtn.disabled = !telegramAvailable;
        telegramBtn.title = telegramAvailable ? 'Подключить Telegram Wallet' : 'Telegram Wallet недоступен';
    }

    if (tonkeeperBtn) {
        tonkeeperBtn.disabled = !tonkeeperAvailable;
        tonkeeperBtn.title = tonkeeperAvailable ? 'Подключить Tonkeeper' : 'Tonkeeper недоступен';
    }
}

// Экспортируем функции для использования в других файлах
window.walletInit = {
    initTelegramWebApp,
    initTonkeeper,
    updateWalletButtons
}; 