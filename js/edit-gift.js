class EditGiftManager {
    constructor() {
        this.form = document.querySelector('.edit-gift-form');
        this.currentUser = null;
        this.giftId = null;
        this.giftData = null;
        this.init();
    }

    async init() {
        try {
            // Получаем данные пользователя из Telegram Web App
            this.currentUser = window.Telegram.WebApp.initDataUnsafe.user;
            
            // Получаем ID подарка из URL
            const urlParams = new URLSearchParams(window.location.search);
            this.giftId = urlParams.get('id');
            
            if (!this.giftId) {
                window.location.href = '/market';
                return;
            }

            // Загружаем данные подарка
            await this.loadGift();
            
            // Инициализируем форму
            this.initForm();
        } catch (error) {
            console.error('Error initializing edit gift page:', error);
            window.location.href = '/market';
        }
    }

    async loadGift() {
        try {
            const response = await fetch(`/api/gifts/${this.giftId}`);
            if (!response.ok) {
                throw new Error('Failed to load gift');
            }
            
            this.giftData = await response.json();
            
            // Проверяем доступ
            await this.checkAccess();
            
            // Заполняем форму данными
            this.fillForm();
        } catch (error) {
            console.error('Error loading gift:', error);
            window.location.href = '/market';
        }
    }

    async checkAccess() {
        try {
            const response = await fetch(`/api/collections/${this.giftData.collectionId}/access`);
            if (!response.ok) {
                throw new Error('Failed to check access');
            }
            
            const { hasAccess } = await response.json();
            
            if (!hasAccess) {
                window.location.href = '/market';
                return;
            }
        } catch (error) {
            console.error('Error checking access:', error);
            window.location.href = '/market';
        }
    }

    fillForm() {
        // Заполняем основные поля
        this.form.querySelector('[name="name"]').value = this.giftData.name;
        this.form.querySelector('[name="description"]').value = this.giftData.description;
        this.form.querySelector('[name="price"]').value = this.giftData.price;
        this.form.querySelector('[name="category"]').value = this.giftData.category;
        
        // Устанавливаем изображение
        if (this.giftData.image) {
            const imagePreview = this.form.querySelector('.image-preview');
            imagePreview.style.backgroundImage = `url(${this.giftData.image})`;
            imagePreview.classList.add('has-image');
        }
        
        // Устанавливаем 3D модель
        if (this.giftData.model) {
            const modelPreview = this.form.querySelector('.model-preview');
            const modelName = this.form.querySelector('.model-name');
            modelName.textContent = this.giftData.model.split('/').pop();
            modelPreview.classList.add('has-model');
        }
    }

    initForm() {
        // Обработчик отправки формы
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        
        // Обработчики загрузки изображения
        const imageInput = this.form.querySelector('input[type="file"][accept="image/*"]');
        const imagePreview = this.form.querySelector('.image-preview');
        
        imagePreview.addEventListener('click', () => {
            imageInput.click();
        });
        
        imageInput.addEventListener('change', this.handleImageSelect.bind(this));
        
        // Обработчики загрузки 3D модели
        const modelInput = this.form.querySelector('input[type="file"][accept=".glb,.gltf"]');
        const modelPreview = this.form.querySelector('.model-preview');
        
        modelPreview.addEventListener('click', () => {
            modelInput.click();
        });
        
        modelInput.addEventListener('change', this.handleModelSelect.bind(this));
    }

    async handleImageSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Проверяем тип файла
        if (!file.type.startsWith('image/')) {
            window.Telegram.WebApp.showAlert('Пожалуйста, выберите изображение');
            return;
        }
        
        // Проверяем размер файла (максимум 5MB)
        if (file.size > 5 * 1024 * 1024) {
            window.Telegram.WebApp.showAlert('Размер изображения не должен превышать 5MB');
            return;
        }
        
        // Показываем превью
        const imagePreview = this.form.querySelector('.image-preview');
        const reader = new FileReader();
        
        reader.onload = (e) => {
            imagePreview.style.backgroundImage = `url(${e.target.result})`;
            imagePreview.classList.add('has-image');
        };
        
        reader.readAsDataURL(file);
    }

    async handleModelSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Проверяем тип файла
        if (!file.type.includes('model/gltf-binary') && !file.type.includes('model/gltf+json')) {
            window.Telegram.WebApp.showAlert('Пожалуйста, выберите 3D модель в формате GLB или GLTF');
            return;
        }
        
        // Проверяем размер файла (максимум 50MB)
        if (file.size > 50 * 1024 * 1024) {
            window.Telegram.WebApp.showAlert('Размер 3D модели не должен превышать 50MB');
            return;
        }
        
        // Показываем имя файла
        const modelName = this.form.querySelector('.model-name');
        modelName.textContent = file.name;
        
        const modelPreview = this.form.querySelector('.model-preview');
        modelPreview.classList.add('has-model');
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        // Собираем данные формы
        const formData = new FormData(this.form);
        const data = {
            name: formData.get('name'),
            description: formData.get('description'),
            price: parseFloat(formData.get('price')),
            category: formData.get('category')
        };
        
        // Валидация
        if (!data.name || !data.description || !data.price || !data.category) {
            window.Telegram.WebApp.showAlert('Пожалуйста, заполните все обязательные поля');
            return;
        }
        
        if (data.price <= 0) {
            window.Telegram.WebApp.showAlert('Цена должна быть больше 0');
            return;
        }
        
        try {
            // Показываем уведомление о загрузке
            window.Telegram.WebApp.showPopup({
                title: 'Обновление подарка',
                message: 'Пожалуйста, подождите...',
                buttons: []
            });
            
            // Загружаем изображение, если оно было изменено
            const imageFile = this.form.querySelector('input[type="file"][accept="image/*"]').files[0];
            if (imageFile) {
                const imageFormData = new FormData();
                imageFormData.append('image', imageFile);
                
                const imageResponse = await fetch('/api/upload/image', {
                    method: 'POST',
                    body: imageFormData
                });
                
                if (!imageResponse.ok) {
                    throw new Error('Failed to upload image');
                }
                
                const { url: imageUrl } = await imageResponse.json();
                data.image = imageUrl;
            }
            
            // Загружаем 3D модель, если она была изменена
            const modelFile = this.form.querySelector('input[type="file"][accept=".glb,.gltf"]').files[0];
            if (modelFile) {
                const modelFormData = new FormData();
                modelFormData.append('model', modelFile);
                
                const modelResponse = await fetch('/api/upload/model', {
                    method: 'POST',
                    body: modelFormData
                });
                
                if (!modelResponse.ok) {
                    throw new Error('Failed to upload model');
                }
                
                const { url: modelUrl } = await modelResponse.json();
                data.model = modelUrl;
            }
            
            // Обновляем подарок
            const response = await fetch(`/api/gifts/${this.giftId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error('Failed to update gift');
            }
            
            // Отправляем уведомление через WebSocket
            window.socket.emit('giftUpdate', {
                giftId: this.giftId,
                data: data
            });
            
            // Закрываем уведомление
            window.Telegram.WebApp.closePopup();
            
            // Перенаправляем на страницу коллекции
            window.location.href = `/collection?id=${this.giftData.collectionId}`;
        } catch (error) {
            console.error('Error updating gift:', error);
            window.Telegram.WebApp.showAlert('Произошла ошибка при обновлении подарка');
        }
    }
}

// Создаем глобальный экземпляр
window.editGiftManager = new EditGiftManager(); 