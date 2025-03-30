class CreateCollectionManager {
    constructor() {
        this.form = document.getElementById('createCollectionForm');
        this.currentUser = null;
        this.init();
    }

    async init() {
        try {
            // Получаем данные пользователя из Telegram Web App
            const tg = window.Telegram.WebApp;
            if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
                this.currentUser = tg.initDataUnsafe.user;
            }

            // Инициализируем форму
            this.initForm();
        } catch (error) {
            console.error('Ошибка инициализации CreateCollectionManager:', error);
            window.notificationManager.error('Ошибка инициализации страницы');
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

    async handleSubmit() {
        try {
            // Получаем данные формы
            const formData = new FormData(this.form);
            const data = {
                name: formData.get('name'),
                description: formData.get('description'),
                category: formData.get('category'),
                creator: this.currentUser.id
            };

            // Валидация
            if (!data.name) {
                window.notificationManager.error('Пожалуйста, введите название коллекции');
                return;
            }

            if (!data.description) {
                window.notificationManager.error('Пожалуйста, введите описание коллекции');
                return;
            }

            if (!data.category) {
                window.notificationManager.error('Пожалуйста, выберите категорию');
                return;
            }

            // Показываем загрузку
            const loadingNotification = window.notificationManager.showLoading('Создание коллекции...');

            // Загружаем изображение
            const imageFile = formData.get('image');
            if (imageFile && imageFile.size > 0) {
                const imageUrl = await window.api.uploadImage(imageFile);
                data.coverImage = imageUrl;
            }

            // Создаем коллекцию
            const collection = await window.api.createCollection(data);

            // Отправляем уведомление через WebSocket
            window.wsClient.send({
                type: 'NEW_COLLECTION',
                collection
            });

            window.notificationManager.removeLoading(loadingNotification);
            window.notificationManager.success('Коллекция успешно создана');

            // Перенаправляем на страницу коллекции
            window.location.href = `/collection/${collection._id}`;
        } catch (error) {
            console.error('Ошибка создания коллекции:', error);
            window.notificationManager.error('Ошибка создания коллекции');
        }
    }
}

// Создаем глобальный экземпляр
window.createCollectionManager = new CreateCollectionManager(); 