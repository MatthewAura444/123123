document.addEventListener('DOMContentLoaded', function() {
    // Инициализация Three.js для 3D превью
    let scene, camera, renderer, giftModel;
    const giftsGrid = document.getElementById('gifts-grid');
    const createGiftModal = document.getElementById('create-gift-modal');
    const viewGiftModal = document.getElementById('view-gift-modal');
    const createGiftForm = document.getElementById('create-gift-form');
    const buyGiftButton = document.getElementById('buy-gift');
    const createGiftButton = document.getElementById('create-gift-button');
    
    // Инициализация TonConnect
    let tonConnect = null;
    let connectedWallet = null;
    
    // Массив для хранения всех подарков
    let allGifts = [];
    
    // Константы для валидации файлов
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    const ALLOWED_MODEL_TYPES = ['model/gltf-binary', 'model/gltf+json'];
    
    // Обработка модальных окон
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    // Закрытие модальных окон при клике вне их области
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target.id);
        }
    }
    
    // Открытие модального окна создания подарка
    createGiftButton.addEventListener('click', function() {
        if (!connectedWallet) {
            showError('Пожалуйста, подключите кошелек');
            return;
        }
        openModal('create-gift-modal');
    });
    
    // Инициализация 3D сцены
    function initScene() {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf8fafc);
        
        camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true
        });
        
        const container = document.getElementById('gift-preview');
        const size = Math.min(container.clientWidth, container.clientHeight);
        renderer.setSize(size, size);
        container.appendChild(renderer.domElement);
        
        // Добавляем освещение
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);
        
        camera.position.z = 5;
    }
    
    // Анимация 3D модели
    function animate() {
        requestAnimationFrame(animate);
        if (giftModel) {
            giftModel.rotation.y += 0.005;
        }
        renderer.render(scene, camera);
    }
    
    // Загрузка 3D модели
    function loadModel(url) {
        const loader = new THREE.GLTFLoader();
        loader.load(url, 
            function(gltf) {
                if (giftModel) {
                    scene.remove(giftModel);
                }
                giftModel = gltf.scene;
                scene.add(giftModel);
                
                // Центрируем модель
                const box = new THREE.Box3().setFromObject(giftModel);
                const center = box.getCenter(new THREE.Vector3());
                giftModel.position.sub(center);
                
                // Масштабируем модель
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 2 / maxDim;
                giftModel.scale.multiplyScalar(scale);
            },
            function(xhr) {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            function(error) {
                console.error('Ошибка загрузки модели:', error);
                showError('Ошибка загрузки 3D модели');
            }
        );
    }
    
    // Инициализация TonConnect
    async function initTonConnect() {
        try {
            tonConnect = new TonConnect({
                manifestUrl: 'http://localhost:3000/tonconnect-manifest.json',
                buttonRootId: 'connect-wallet'
            });

            // Добавляем обработчик подключения
            tonConnect.onStatusChange(wallet => {
                if (wallet) {
                    handleWalletConnection(wallet);
                } else {
                    handleWalletDisconnection();
                }
            });

            // Проверяем текущее состояние подключения
            const wallet = await tonConnect.getWallet();
            if (wallet) {
                handleWalletConnection(wallet);
            }
        } catch (error) {
            console.error('Ошибка инициализации TonConnect:', error);
            showError('Ошибка подключения к кошельку. Убедитесь, что у вас установлен TON кошелек.');
        }
    }
    
    // Обработка подключения кошелька
    function handleWalletConnection(wallet) {
        connectedWallet = wallet;
        document.getElementById('wallet-status').textContent = 'Кошелек подключен';
        document.getElementById('wallet-info').style.display = 'flex';
        document.getElementById('connected-address').textContent = wallet.account.address;
        document.getElementById('connect-wallet').style.display = 'none';
        showSuccess('Кошелек успешно подключен');
    }
    
    // Обработка отключения кошелька
    document.getElementById('disconnect-wallet').addEventListener('click', function() {
        handleWalletDisconnection();
    });
    
    function handleWalletDisconnection() {
        connectedWallet = null;
        document.getElementById('wallet-status').textContent = 'Подключить кошелек';
        document.getElementById('wallet-info').style.display = 'none';
        document.getElementById('connect-wallet').style.display = 'block';
    }
    
    // Создание карточки подарка
    function createGiftCard(gift) {
        const card = document.createElement('div');
        card.className = 'gift-card';
        card.innerHTML = `
            <div class="gift-preview">
                <img src="${gift.backgroundUrl}" alt="${gift.name}" class="gift-background">
                <div class="gift-overlay">
                    <span class="gift-price">${gift.price} TON</span>
                </div>
            </div>
            <div class="gift-info">
                <h3>${gift.name}</h3>
                <p>${gift.description}</p>
            </div>
        `;
        
        card.addEventListener('click', () => showGiftDetails(gift));
        return card;
    }
    
    // Отображение деталей подарка
    function showGiftDetails(gift) {
        document.getElementById('gift-title').textContent = gift.name;
        document.getElementById('gift-description').textContent = gift.description;
        document.getElementById('gift-price').textContent = gift.price;
        
        viewGiftModal.dataset.giftId = gift.id;
        viewGiftModal.dataset.sellerAddress = gift.sellerAddress;
        
        // Загружаем 3D модель
        loadModel(gift.modelUrl);
        
        openModal('view-gift-modal');
    }
    
    // Функция валидации файла
    function validateFile(file, type) {
        if (file.size > MAX_FILE_SIZE) {
            throw new Error(`Файл слишком большой. Максимальный размер: ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
        }

        if (type === 'image' && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
            throw new Error('Неподдерживаемый формат изображения. Используйте JPEG, PNG или WebP');
        }

        if (type === 'model' && !ALLOWED_MODEL_TYPES.includes(file.type)) {
            throw new Error('Неподдерживаемый формат 3D модели. Используйте GLB или GLTF');
        }

        return true;
    }

    // Функция предпросмотра изображения
    function previewImage(file, previewElement) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewElement.src = e.target.result;
            previewElement.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    // Функция показа индикатора загрузки
    function showLoading(element) {
        const loading = document.createElement('div');
        loading.className = 'loading-spinner';
        loading.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
        `;
        element.appendChild(loading);
        return loading;
    }

    // Функция подтверждения действия
    function confirmAction(message, callback) {
        const modal = document.createElement('div');
        modal.className = 'confirm-modal';
        modal.innerHTML = `
            <div class="confirm-content">
                <h3>Подтверждение действия</h3>
                <p>${message}</p>
                <div class="confirm-actions">
                    <button class="confirm-yes">Да</button>
                    <button class="confirm-no">Нет</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        return new Promise((resolve) => {
            modal.querySelector('.confirm-yes').addEventListener('click', () => {
                modal.remove();
                resolve(true);
            });
            
            modal.querySelector('.confirm-no').addEventListener('click', () => {
                modal.remove();
                resolve(false);
            });
        });
    }

    // Обновляем обработчик загрузки файлов
    document.querySelectorAll('input[type="file"]').forEach(input => {
        input.addEventListener('change', async function(e) {
            const file = e.target.files[0];
            if (!file) return;

            const label = this.nextElementSibling;
            const fileName = label.querySelector('.file-name');
            const preview = label.querySelector('.preview-image');

            try {
                // Показываем индикатор загрузки
                const loading = showLoading(label);
                
                // Валидация файла
                validateFile(file, this.id.includes('model') ? 'model' : 'image');
                
                // Обновляем имя файла
                fileName.textContent = file.name;
                
                // Предпросмотр для изображений
                if (this.id !== 'gift-model') {
                    previewImage(file, preview);
                }

                // Удаляем индикатор загрузки
                loading.remove();
            } catch (error) {
                showError(error.message);
                this.value = '';
                fileName.textContent = '';
                if (preview) preview.style.display = 'none';
            }
        });
    });

    // Обновляем обработчик создания подарка
    createGiftForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!connectedWallet) {
            showError('Пожалуйста, подключите кошелек');
            return;
        }

        // Подтверждение создания подарка
        const confirmed = await confirmAction('Вы уверены, что хотите создать этот подарок?', async (result) => {
            if (!result) return;

            const formData = new FormData(this);
            formData.append('sellerAddress', connectedWallet.address);
            
            try {
                // Показываем индикатор загрузки
                const loading = showLoading(this);
                
                const response = await fetch('/api/gifts', {
                    method: 'POST',
                    body: formData
                });
                
                if (!response.ok) {
                    throw new Error('Ошибка при создании подарка');
                }
                
                const gift = await response.json();
                allGifts.push(gift);
                updateGiftsDisplay(allGifts);
                
                // Удаляем индикатор загрузки
                loading.remove();
                
                closeModal('create-gift-modal');
                this.reset();
                showSuccess('Подарок успешно создан');
            } catch (error) {
                console.error('Ошибка:', error);
                showError(error.message);
                loading.remove();
            }
        });
    });

    // Обновляем обработчик покупки подарка
    buyGiftButton.addEventListener('click', async function() {
        if (!connectedWallet) {
            showError('Пожалуйста, подключите кошелек');
            return;
        }
        
        const giftId = viewGiftModal.dataset.giftId;
        const giftPrice = parseFloat(document.getElementById('gift-price').textContent);
        
        // Подтверждение покупки
        const confirmed = await confirmAction(`Вы уверены, что хотите купить этот подарок за ${giftPrice} TON?`, async (result) => {
            if (!result) return;
            
            try {
                // Показываем индикатор загрузки
                const loading = showLoading(this);
                
                const transaction = {
                    validUntil: Date.now() + 5 * 60 * 1000,
                    messages: [
                        {
                            address: viewGiftModal.dataset.sellerAddress,
                            amount: giftPrice * 1000000000
                        }
                    ]
                };
                
                const result = await tonConnect.sendTransaction(transaction);
                
                const response = await fetch('/api/deals', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        giftId,
                        buyerAddress: connectedWallet.address,
                        sellerAddress: viewGiftModal.dataset.sellerAddress,
                        amount: giftPrice,
                        transactionHash: result.hash
                    })
                });
                
                if (!response.ok) {
                    throw new Error('Ошибка при создании сделки');
                }
                
                const deal = await response.json();
                
                // Удаляем индикатор загрузки
                loading.remove();
                
                showDealStatus(deal);
                closeModal('view-gift-modal');
                showSuccess('Сделка создана успешно');
            } catch (error) {
                console.error('Ошибка:', error);
                showError(error.message);
                loading.remove();
            }
        });
    });
    
    // Отображение статуса сделки
    function showDealStatus(deal) {
        const statusDiv = document.createElement('div');
        statusDiv.className = `deal-status ${deal.status}`;
        
        let statusContent = `
            <h3>Статус сделки</h3>
            <p>ID сделки: ${deal.id}</p>
            <p>Сумма: ${deal.amount} TON</p>
            <p>Хеш транзакции: ${deal.transactionHash}</p>
        `;
        
        switch (deal.status) {
            case 'pending':
                statusContent += `
                    <div class="status-message">
                        <div class="spinner"></div>
                        <p>Ожидайте, продавец готовит подарок...</p>
                    </div>
                    <div class="deal-actions">
                        <button class="dispute-button" onclick="disputeDeal('${deal.id}')">Открыть спор</button>
                    </div>
                `;
                break;
                
            case 'waiting_delivery':
                const timeLeft = getTimeLeft(deal.createdAt);
                statusContent += `
                    <div class="status-message">
                        <div class="delivery-status">
                            <div class="icon">📦</div>
                            <p>Подарок готов к передаче!</p>
                            <p class="time-left">Осталось времени: ${timeLeft}</p>
                        </div>
                    </div>
                    <div class="deal-actions">
                        <button class="confirm-button" onclick="confirmDeal('${deal.id}')">Подтвердить получение</button>
                        <button class="dispute-button" onclick="disputeDeal('${deal.id}')">Открыть спор</button>
                    </div>
                `;
                break;
                
            case 'completed':
                statusContent += `
                    <div class="status-message success">
                        <div class="icon">✅</div>
                        <p>Сделка успешно завершена!</p>
                        <p class="completion-time">Завершено: ${new Date(deal.completedAt).toLocaleString()}</p>
                    </div>
                `;
                break;
                
            case 'refunded':
                statusContent += `
                    <div class="status-message refunded">
                        <div class="icon">💸</div>
                        <p>Сделка автоматически отменена</p>
                        <p>Средства возвращены на ваш кошелек</p>
                        <p class="refund-time">Возврат: ${new Date(deal.refundedAt).toLocaleString()}</p>
                    </div>
                `;
                break;
                
            case 'disputed':
                statusContent += `
                    <div class="status-message disputed">
                        <div class="icon">⚠️</div>
                        <p>Спор открыт</p>
                        <p>Администратор рассмотрит вашу жалобу</p>
                    </div>
                `;
                break;
        }
        
        statusDiv.innerHTML = statusContent;
        document.body.appendChild(statusDiv);
        
        // Обновляем таймер каждую минуту
        if (deal.status === 'waiting_delivery') {
            setInterval(() => {
                const timeLeftElement = statusDiv.querySelector('.time-left');
                if (timeLeftElement) {
                    timeLeftElement.textContent = `Осталось времени: ${getTimeLeft(deal.createdAt)}`;
                }
            }, 60000);
        }
    }
    
    // Получение оставшегося времени
    function getTimeLeft(createdAt) {
        const now = Date.now();
        const created = new Date(createdAt).getTime();
        const timeLeft = 24 * 60 * 60 * 1000 - (now - created);
        
        if (timeLeft <= 0) {
            return 'Время истекло';
        }
        
        const hours = Math.floor(timeLeft / (60 * 60 * 1000));
        const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
        return `${hours}ч ${minutes}м`;
    }
    
    // Функции уведомлений
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        let icon = '';
        switch (type) {
            case 'success':
                icon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>`;
                break;
            case 'error':
                icon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>`;
                break;
            case 'warning':
                icon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>`;
                break;
        }
        
        notification.innerHTML = `${icon}<span>${message}</span>`;
        document.body.appendChild(notification);
        
        // Анимация появления
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease forwards';
        }, 10);
        
        // Удаление через 3 секунды
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Заменяем старые функции на новые
    function showError(message) {
        showNotification(message, 'error');
    }

    function showSuccess(message) {
        showNotification(message, 'success');
    }

    function showWarning(message) {
        showNotification(message, 'warning');
    }
    
    // Загрузка подарков при загрузке страницы
    async function loadGifts() {
        try {
            const response = await fetch('/api/gifts');
            if (!response.ok) {
                throw new Error('Ошибка при загрузке подарков');
            }
            
            const gifts = await response.json();
            gifts.forEach(gift => {
                giftsGrid.appendChild(createGiftCard(gift));
            });
        } catch (error) {
            console.error('Ошибка:', error);
        }
    }
    
    // Функция фильтрации подарков
    function filterGifts() {
        const searchQuery = document.getElementById('search-input').value.toLowerCase();
        const priceFilter = document.getElementById('price-filter').value;
        const sortFilter = document.getElementById('sort-filter').value;
        const statusFilter = document.getElementById('status-filter').value;

        let filteredGifts = allGifts.filter(gift => {
            // Поиск по названию
            const matchesSearch = gift.name.toLowerCase().includes(searchQuery);
            
            // Фильтр по цене
            let matchesPrice = true;
            if (priceFilter !== 'all') {
                const price = parseFloat(gift.price);
                switch (priceFilter) {
                    case '0-1':
                        matchesPrice = price <= 1;
                        break;
                    case '1-5':
                        matchesPrice = price > 1 && price <= 5;
                        break;
                    case '5-10':
                        matchesPrice = price > 5 && price <= 10;
                        break;
                    case '10+':
                        matchesPrice = price > 10;
                        break;
                }
            }

            // Фильтр по статусу
            let matchesStatus = true;
            if (statusFilter !== 'all') {
                const deal = deals.find(d => d.giftId === gift.id);
                switch (statusFilter) {
                    case 'available':
                        matchesStatus = !deal || deal.status === 'refunded';
                        break;
                    case 'sold':
                        matchesStatus = deal && deal.status === 'completed';
                        break;
                    case 'pending':
                        matchesStatus = deal && ['pending', 'waiting_delivery'].includes(deal.status);
                        break;
                }
            }

            return matchesSearch && matchesPrice && matchesStatus;
        });

        // Сортировка
        filteredGifts.sort((a, b) => {
            switch (sortFilter) {
                case 'newest':
                    return b.timestamp - a.timestamp;
                case 'price-asc':
                    return parseFloat(a.price) - parseFloat(b.price);
                case 'price-desc':
                    return parseFloat(b.price) - parseFloat(a.price);
                case 'popular':
                    const aDeals = deals.filter(d => d.giftId === a.id).length;
                    const bDeals = deals.filter(d => d.giftId === b.id).length;
                    return bDeals - aDeals;
                default:
                    return 0;
            }
        });

        // Обновляем отображение
        updateGiftsDisplay(filteredGifts);
    }

    // Функция обновления отображения подарков
    function updateGiftsDisplay(gifts) {
        const giftsGrid = document.getElementById('gifts-grid');
        giftsGrid.innerHTML = '';

        if (gifts.length === 0) {
            giftsGrid.innerHTML = `
                <div class="no-results">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <h3>Подарки не найдены</h3>
                    <p>Попробуйте изменить параметры поиска</p>
                </div>
            `;
            return;
        }

        gifts.forEach(gift => {
            const card = createGiftCard(gift);
            giftsGrid.appendChild(card);
        });
    }

    // Добавляем обработчики событий для фильтров
    document.addEventListener('DOMContentLoaded', () => {
        // Обработчики для фильтров
        document.getElementById('search-input').addEventListener('input', filterGifts);
        document.getElementById('price-filter').addEventListener('change', filterGifts);
        document.getElementById('sort-filter').addEventListener('change', filterGifts);
        document.getElementById('status-filter').addEventListener('change', filterGifts);

        // Инициализация начального отображения
        filterGifts();
    });

    // Инициализация
    initScene();
    animate();
    initTonConnect();
    loadGifts();

    // Инициализация Service Worker для офлайн-режима
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('ServiceWorker зарегистрирован:', registration);
                })
                .catch(error => {
                    console.error('Ошибка регистрации ServiceWorker:', error);
                });
        });
    }

    // Проверка онлайн-статуса
    window.addEventListener('online', () => {
        hideOfflineBanner();
        syncOfflineData();
    });

    window.addEventListener('offline', () => {
        showOfflineBanner();
    });

    function showOfflineBanner() {
        const banner = document.createElement('div');
        banner.className = 'offline-banner';
        banner.textContent = 'Вы работаете в офлайн-режиме. Некоторые функции могут быть недоступны.';
        document.body.appendChild(banner);
    }

    function hideOfflineBanner() {
        const banner = document.querySelector('.offline-banner');
        if (banner) {
            banner.remove();
        }
    }

    // Предзагрузка данных
    function preloadData() {
        showLoading('Загрузка данных...');
        
        Promise.all([
            fetch('/api/gifts').then(r => r.json()),
            fetch('/api/categories').then(r => r.json()),
            fetch('/api/transactions').then(r => r.json())
        ])
        .then(([gifts, categories, transactions]) => {
            // Сохраняем данные в IndexedDB
            saveToIndexedDB('gifts', gifts);
            saveToIndexedDB('categories', categories);
            saveToIndexedDB('transactions', transactions);
            
            // Обновляем UI
            updateGiftsDisplay(gifts);
            updateCategories(categories);
            updateTransactionsList(transactions);
        })
        .catch(error => {
            console.error('Ошибка предзагрузки данных:', error);
            showNotification('Ошибка загрузки данных', 'error');
        })
        .finally(() => {
            hideLoading();
        });
    }

    // Сохранение данных в IndexedDB
    function saveToIndexedDB(storeName, data) {
        const dbName = 'giftsDB';
        const dbVersion = 1;
        
        const request = indexedDB.open(dbName, dbVersion);
        
        request.onerror = (event) => {
            console.error('Ошибка открытия базы данных:', event.target.error);
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, { keyPath: 'id' });
            }
        };
        
        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            
            // Очищаем старые данные
            store.clear();
            
            // Сохраняем новые данные
            data.forEach(item => {
                store.put(item);
            });
        };
    }

    // Синхронизация офлайн-данных
    async function syncOfflineData() {
        const dbName = 'giftsDB';
        const dbVersion = 1;
        
        const request = indexedDB.open(dbName, dbVersion);
        
        request.onsuccess = async (event) => {
            const db = event.target.result;
            
            // Синхронизируем каждое хранилище
            await syncStore(db, 'gifts');
            await syncStore(db, 'categories');
            await syncStore(db, 'transactions');
        };
    }

    async function syncStore(db, storeName) {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const items = await new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
        
        // Отправляем данные на сервер
        try {
            await fetch(`/api/${storeName}/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify(items)
            });
        } catch (error) {
            console.error(`Ошибка синхронизации ${storeName}:`, error);
        }
    }

    // Добавляем CSRF-токен для всех запросов
    const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
    fetch = new Proxy(fetch, {
        apply: (target, thisArg, argumentsList) => {
            const [url, config] = argumentsList;
            if (config && config.headers) {
                config.headers['X-CSRF-Token'] = csrfToken;
            }
            return target.apply(thisArg, argumentsList);
        }
    });

    // Ленивая загрузка изображений
    const lazyLoadImages = () => {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    };

    // Улучшенная система рейтинга
    class RatingSystem {
        constructor() {
            this.ratings = new Map();
        }

        async loadRatings(sellerId) {
            try {
                const response = await fetch(`/api/seller/${sellerId}/rating`);
                const data = await response.json();
                this.ratings.set(sellerId, data);
                return data;
            } catch (error) {
                console.error('Ошибка загрузки рейтинга:', error);
                return null;
            }
        }

        async submitRating(sellerId, rating, comment) {
            try {
                const response = await fetch(`/api/seller/${sellerId}/rating`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
                    },
                    body: JSON.stringify({ rating, comment })
                });

                if (!response.ok) {
                    throw new Error('Ошибка отправки рейтинга');
                }

                const data = await response.json();
                this.ratings.set(sellerId, data);
                return data;
            } catch (error) {
                console.error('Ошибка отправки рейтинга:', error);
                throw error;
            }
        }

        renderRating(sellerId) {
            const rating = this.ratings.get(sellerId);
            if (!rating) return '';

            return `
                <div class="rating-summary">
                    <div class="rating-number">${rating.rating.toFixed(1)}</div>
                    <div class="rating-stars">
                        ${this.generateStars(rating.rating)}
                    </div>
                    <div class="rating-count">${rating.totalReviews} отзывов</div>
                </div>
                <div class="reviews-list">
                    ${this.renderReviews(rating.recentReviews)}
                </div>
            `;
        }

        generateStars(rating) {
            const fullStars = Math.floor(rating);
            const hasHalfStar = rating % 1 >= 0.5;
            let stars = '';

            for (let i = 0; i < 5; i++) {
                if (i < fullStars) {
                    stars += '<svg class="rating-star" viewBox="0 0 24 24"><path fill="currentColor" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>';
                } else if (i === fullStars && hasHalfStar) {
                    stars += '<svg class="rating-star" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27V2z"/></svg>';
                } else {
                    stars += '<svg class="rating-star" viewBox="0 0 24 24"><path fill="currentColor" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>';
                }
            }

            return stars;
        }

        renderReviews(reviews) {
            return reviews.map(review => `
                <div class="review-item">
                    <div class="review-header">
                        <div class="rating-stars">
                            ${this.generateStars(review.rating)}
                        </div>
                        <div class="review-date">
                            ${new Date(review.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                    <div class="review-text">${review.comment}</div>
                </div>
            `).join('');
        }
    }

    // Инициализация системы рейтинга
    const ratingSystem = new RatingSystem();

    // Обновление отображения рейтинга
    async function updateRatingDisplay(sellerId) {
        const ratingContainer = document.querySelector(`[data-seller-id="${sellerId}"] .rating-container`);
        if (!ratingContainer) return;

        await ratingSystem.loadRatings(sellerId);
        ratingContainer.innerHTML = ratingSystem.renderRating(sellerId);
    }

    // Обработчик отправки рейтинга
    document.addEventListener('submit', async (e) => {
        if (e.target.matches('.rating-form')) {
            e.preventDefault();
            
            const form = e.target;
            const sellerId = form.dataset.sellerId;
            const rating = parseInt(form.querySelector('input[name="rating"]:checked').value);
            const comment = form.querySelector('textarea[name="comment"]').value;

            try {
                await ratingSystem.submitRating(sellerId, rating, comment);
                await updateRatingDisplay(sellerId);
                showNotification('Спасибо за ваш отзыв!', 'success');
                form.reset();
            } catch (error) {
                showNotification('Ошибка отправки отзыва', 'error');
            }
        }
    });

    // Инициализация при загрузке страницы
    document.addEventListener('DOMContentLoaded', () => {
        // ... existing initialization code ...
        
        // Инициализация ленивой загрузки
        lazyLoadImages();
        
        // Загрузка рейтингов для всех продавцов на странице
        document.querySelectorAll('[data-seller-id]').forEach(element => {
            const sellerId = element.dataset.sellerId;
            updateRatingDisplay(sellerId);
        });
    });
}); 