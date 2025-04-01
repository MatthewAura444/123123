class CreateGiftManager {
    constructor() {
        this.form = document.getElementById('createGiftForm');
        this.currentUser = null;
        this.collectionId = null;
        this.init();
    }

    async init() {
        try {
            // Получаем данные пользователя из Telegram Web App
            const tg = window.Telegram.WebApp;
            if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
                this.currentUser = tg.initDataUnsafe.user;
            }

            // Получаем ID коллекции из URL
            const params = new URLSearchParams(window.location.search);
            this.collectionId = params.get('collection');

            if (!this.collectionId) {
                window.notificationManager.error('Коллекция не указана');
                window.location.href = '/collections';
                return;
            }

            // Проверяем права доступа
            await this.checkAccess();

            // Инициализируем форму
            this.initForm();
        } catch (error) {
            console.error('Ошибка инициализации CreateGiftManager:', error);
            window.notificationManager.error('Ошибка инициализации страницы');
        }
    }

    async checkAccess() {
        try {
            const collection = await window.api.getCollection(this.collectionId);
            
            if (collection.userId !== this.currentUser.id) {
                window.notificationManager.error('У вас нет прав для создания подарков в этой коллекции');
                window.location.href = `/collection/${this.collectionId}`;
                return;
            }
        } catch (error) {
            console.error('Ошибка проверки доступа:', error);
            window.notificationManager.error('Ошибка проверки доступа');
            window.location.href = '/collections';
        }
    }

    initForm() {
        if (!this.form) return;

        // Добавляем обработчик отправки формы
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSubmit();
        });

        // Инициализируем загрузку изображения
        const imageInput = this.form.querySelector('input[type="file"]');
        if (imageInput) {
            imageInput.addEventListener('change', (e) => {
                this.handleImageSelect(e);
            });
        }

        // Инициализируем предпросмотр изображения
        const imagePreview = this.form.querySelector('.image-preview');
        if (imagePreview) {
            imagePreview.addEventListener('click', () => {
                imageInput.click();
            });
        }

        // Инициализируем загрузку 3D модели
        const modelInput = this.form.querySelector('input[type="file"][accept=".glb,.gltf"]');
        if (modelInput) {
            modelInput.addEventListener('change', (e) => {
                this.handleModelSelect(e);
            });
        }

        // Инициализируем предпросмотр 3D модели
        const modelPreview = this.form.querySelector('.model-preview');
        if (modelPreview) {
            modelPreview.addEventListener('click', () => {
                modelInput.click();
            });
        }
    }

    async handleImageSelect(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Проверяем тип файла
        if (!file.type.startsWith('image/')) {
            window.notificationManager.error('Пожалуйста, выберите изображение');
            return;
        }

        // Проверяем размер файла (максимум 5MB)
        if (file.size > 5 * 1024 * 1024) {
            window.notificationManager.error('Размер изображения не должен превышать 5MB');
            return;
        }

        // Показываем предпросмотр
        const reader = new FileReader();
        reader.onload = (e) => {
            const imagePreview = this.form.querySelector('.image-preview');
            if (imagePreview) {
                imagePreview.style.backgroundImage = `url(${e.target.result})`;
                imagePreview.classList.add('has-image');
            }
        };
        reader.readAsDataURL(file);
    }

    async handleModelSelect(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Проверяем тип файла
        if (!file.name.match(/\.(glb|gltf)$/i)) {
            window.notificationManager.error('Пожалуйста, выберите 3D модель в формате GLB или GLTF');
            return;
        }

        // Проверяем размер файла (максимум 50MB)
        if (file.size > 50 * 1024 * 1024) {
            window.notificationManager.error('Размер 3D модели не должен превышать 50MB');
            return;
        }

        // Показываем предпросмотр
        const modelPreview = this.form.querySelector('.model-preview');
        if (modelPreview) {
            modelPreview.classList.add('has-model');
            modelPreview.querySelector('.model-name').textContent = file.name;
        }
    }

    async handleSubmit() {
        try {
            // Получаем данные формы
            const formData = new FormData(this.form);
            const data = {
                name: formData.get('name'),
                description: formData.get('description'),
                price: parseFloat(formData.get('price')),
                currency: formData.get('currency'),
                category: formData.get('category'),
                collectionId: this.collectionId,
                creator: this.currentUser.id
            };

            // Валидация
            if (!data.name) {
                window.notificationManager.error('Пожалуйста, введите название подарка');
                return;
            }

            if (!data.description) {
                window.notificationManager.error('Пожалуйста, введите описание подарка');
                return;
            }

            if (!data.price || data.price <= 0) {
                window.notificationManager.error('Пожалуйста, введите корректную цену');
                return;
            }

            if (!data.currency) {
                window.notificationManager.error('Пожалуйста, выберите валюту');
                return;
            }

            if (!data.category) {
                window.notificationManager.error('Пожалуйста, выберите категорию');
                return;
            }

            // Показываем загрузку
            const loadingNotification = window.notificationManager.showLoading('Создание подарка...');

            // Загружаем изображение
            const imageFile = formData.get('image');
            if (imageFile && imageFile.size > 0) {
                const imageUrl = await window.api.uploadImage(imageFile);
                data.image = imageUrl;
            }

            // Загружаем 3D модель
            const modelFile = formData.get('model');
            if (modelFile && modelFile.size > 0) {
                const modelUrl = await window.api.uploadModel(modelFile);
                data.model = modelUrl;
            }

            // Создаем подарок
            const gift = await window.api.createGift(data);

            // Отправляем уведомление через WebSocket
            window.wsClient.send({
                type: 'NEW_GIFT',
                gift
            });

            window.notificationManager.removeLoading(loadingNotification);
            window.notificationManager.success('Подарок успешно создан');

            // Перенаправляем на страницу коллекции
            window.location.href = `/collection/${this.collectionId}`;
        } catch (error) {
            console.error('Ошибка создания подарка:', error);
            window.notificationManager.error('Ошибка создания подарка');
        }
    }
}

// Создаем глобальный экземпляр
window.createGiftManager = new CreateGiftManager(); 