// Инициализация Three.js для 3D превью
let scene, camera, renderer, model;
let walletAddress = null;
let currentPage = 1;
let isLoading = false;
let hasMore = true;

// Инициализация сцены
function initScene() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(300, 300);
    document.getElementById('giftPreview3D').appendChild(renderer.domElement);
    camera.position.z = 5;
}

// Анимация 3D модели
function animate() {
    requestAnimationFrame(animate);
    if (model) {
        model.rotation.y += 0.005;
    }
    renderer.render(scene, camera);
}

// Загрузка 3D модели
function loadModel(file) {
    const loader = new THREE.GLTFLoader();
    loader.load(
        URL.createObjectURL(file),
        (gltf) => {
            if (model) {
                scene.remove(model);
            }
            model = gltf.scene;
            scene.add(model);
            animate();
        },
        undefined,
        (error) => {
            console.error('Ошибка загрузки модели:', error);
            showNotification('Ошибка загрузки 3D модели', 'error');
        }
    );
}

// Подключение кошелька
async function connectWallet() {
    try {
        const tonConnect = new TonConnect();
        const accounts = await tonConnect.send('ton_requestAccounts');
        walletAddress = accounts[0];
        updateWalletUI();
        loadDashboardData();
    } catch (error) {
        console.error('Ошибка подключения кошелька:', error);
        showNotification('Ошибка подключения кошелька', 'error');
    }
}

// Обновление UI кошелька
function updateWalletUI() {
    const button = document.getElementById('connectWalletButton');
    if (walletAddress) {
        button.textContent = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
        button.disabled = true;
    }
}

// Загрузка данных панели управления
async function loadDashboardData() {
    if (!walletAddress) return;

    showLoading('Загрузка данных...');

    try {
        const response = await fetch(`/api/seller/${walletAddress}/dashboard`);
        const data = await response.json();

        // Обновление статистики
        document.getElementById('totalSales').textContent = data.stats.totalSales;
        document.getElementById('totalRevenue').textContent = `${data.stats.totalRevenue} TON`;
        document.getElementById('activeGifts').textContent = data.stats.activeGifts;
        document.getElementById('averageRating').textContent = data.stats.averageRating.toFixed(1);

        // Обновление транзакций
        updateTransactionsList(data.recentTransactions);

        // Обновление популярных подарков
        updatePopularGifts(data.popularGifts);

        // Обновление рейтинга
        updateRating(data.rating);
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        showNotification('Ошибка загрузки данных', 'error');
    } finally {
        hideLoading();
    }
}

// Обновление списка транзакций
function updateTransactionsList(transactions) {
    const container = document.getElementById('transactionsList');
    container.innerHTML = transactions.map(transaction => `
        <div class="transaction-item">
            <div class="transaction-info">
                <span class="transaction-id">${transaction.id.slice(0, 8)}...</span>
                <span class="transaction-amount">${transaction.amount} TON</span>
            </div>
            <div class="transaction-details">
                <span class="transaction-date">${formatDate(transaction.date)}</span>
                <span class="transaction-status ${transaction.status}">${transaction.status}</span>
            </div>
        </div>
    `).join('');
}

// Обновление популярных подарков
function updatePopularGifts(gifts) {
    const container = document.getElementById('popularGifts');
    container.innerHTML = gifts.map(gift => `
        <div class="gift-card">
            <div class="gift-image">
                <img src="${gift.backgroundImage}" alt="${gift.name}">
            </div>
            <div class="gift-info">
                <h3>${gift.name}</h3>
                <p>${gift.price} TON</p>
                <p>Продаж: ${gift.sales}</p>
            </div>
        </div>
    `).join('');
}

// Обновление рейтинга
function updateRating(ratingData) {
    const container = document.getElementById('reviewsList');
    container.innerHTML = ratingData.recentReviews.map(review => `
        <div class="review-item">
            <div class="review-header">
                <span class="review-rating">${displayRating(review.rating)}</span>
                <span class="review-date">${formatDate(review.date)}</span>
            </div>
            <p class="review-text">${review.text}</p>
        </div>
    `).join('');

    document.getElementById('totalReviews').textContent = `${ratingData.totalReviews} отзывов`;
}

// Отображение рейтинга звездами
function displayRating(rating) {
    const stars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let starsHtml = '';
    
    for (let i = 0; i < stars; i++) {
        starsHtml += '<svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.363 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.363-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>';
    }
    if (hasHalfStar) {
        starsHtml += '<svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.363 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.363-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" clip-path="inset(0 50% 0 0)"/></svg>';
    }
    
    return starsHtml;
}

// Форматирование даты
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'только что';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} мин назад`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} ч назад`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} д назад`;
    return date.toLocaleDateString('ru-RU');
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    initScene();
    
    // Обработчики событий
    document.getElementById('connectWalletButton').addEventListener('click', connectWallet);
    document.getElementById('createGiftButton').addEventListener('click', () => openModal('createGiftModal'));
    
    // Обработчик формы создания подарка
    document.getElementById('createGiftForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!walletAddress) {
            showNotification('Пожалуйста, подключите кошелек', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('name', document.getElementById('giftName').value);
        formData.append('description', document.getElementById('giftDescription').value);
        formData.append('category', document.getElementById('giftCategory').value);
        formData.append('price', document.getElementById('giftPrice').value);
        formData.append('sellerId', walletAddress);
        formData.append('background', document.getElementById('backgroundImage').files[0]);
        formData.append('model', document.getElementById('modelFile').files[0]);
        formData.append('pattern', document.getElementById('patternImage').files[0]);

        showLoading('Создание подарка...');

        try {
            const response = await fetch('/api/gifts', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Ошибка создания подарка');
            }

            showNotification('Подарок успешно создан', 'success');
            closeModal('createGiftModal');
            loadDashboardData();
        } catch (error) {
            console.error('Ошибка создания подарка:', error);
            showNotification('Ошибка создания подарка', 'error');
        } finally {
            hideLoading();
        }
    });

    // Обработчики предпросмотра изображений
    document.getElementById('backgroundImage').addEventListener('change', (e) => {
        previewImage(e.target.files[0], 'backgroundPreview');
    });

    document.getElementById('patternImage').addEventListener('change', (e) => {
        previewImage(e.target.files[0], 'patternPreview');
    });

    document.getElementById('modelFile').addEventListener('change', (e) => {
        loadModel(e.target.files[0]);
    });
}); 