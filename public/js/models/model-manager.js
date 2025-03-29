import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

// Кэш для хранения загруженных моделей
const modelCache = new Map();
const loadingPromises = new Map();

class ModelManager {
    constructor() {
        this.cache = modelCache;
        this.loadingPromises = loadingPromises;
        this.textureLoader = new THREE.TextureLoader();
        this.gltfLoader = new GLTFLoader();
        
        // Настройка DRACO декомпрессора для оптимизации
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('/draco/');
        this.gltfLoader.setDRACOLoader(dracoLoader);
    }

    // Загрузка модели с кэшированием
    async loadModel(giftId, modelUrl, textureUrl) {
        // Проверяем кэш
        if (this.cache.has(giftId)) {
            return this.cache.get(giftId);
        }

        // Проверяем, не загружается ли уже модель
        if (this.loadingPromises.has(giftId)) {
            return this.loadingPromises.get(giftId);
        }

        // Создаем промис для загрузки
        const loadPromise = this._loadModelWithProgress(giftId, modelUrl, textureUrl);
        this.loadingPromises.set(giftId, loadPromise);

        try {
            const model = await loadPromise;
            this.cache.set(giftId, model);
            return model;
        } finally {
            this.loadingPromises.delete(giftId);
        }
    }

    // Загрузка модели с отображением прогресса
    async _loadModelWithProgress(giftId, modelUrl, textureUrl) {
        const loadingIndicator = document.querySelector('.model-loading-indicator');
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        loadingIndicator.appendChild(progressBar);

        try {
            // Загружаем текстуру
            const texture = await this._loadTexture(textureUrl);
            
            // Загружаем модель
            const model = await this._loadModel(modelUrl, (progress) => {
                progressBar.style.width = `${progress * 100}%`;
            });

            // Применяем текстуру к модели
            this._applyTexture(model, texture);

            return model;
        } finally {
            loadingIndicator.removeChild(progressBar);
        }
    }

    // Загрузка текстуры
    async _loadTexture(url) {
        return new Promise((resolve, reject) => {
            this.textureLoader.load(
                url,
                (texture) => {
                    // Оптимизируем текстуру
                    texture.minFilter = THREE.LinearFilter;
                    texture.magFilter = THREE.LinearFilter;
                    texture.generateMipmaps = false;
                    resolve(texture);
                },
                undefined,
                reject
            );
        });
    }

    // Загрузка модели с отслеживанием прогресса
    async _loadModel(url, onProgress) {
        return new Promise((resolve, reject) => {
            this.gltfLoader.load(
                url,
                (gltf) => {
                    resolve(gltf.scene);
                },
                (progress) => {
                    const percent = progress.loaded / progress.total;
                    onProgress(percent);
                },
                reject
            );
        });
    }

    // Применение текстуры к модели
    _applyTexture(model, texture) {
        model.traverse((child) => {
            if (child.isMesh) {
                child.material.map = texture;
                child.material.needsUpdate = true;
            }
        });
    }

    // Получение модели из кэша
    getModel(giftId) {
        return this.cache.get(giftId);
    }

    // Удаление модели из кэша
    disposeModel(giftId) {
        const model = this.cache.get(giftId);
        if (model) {
            // Очищаем геометрию
            model.traverse((child) => {
                if (child.isMesh) {
                    child.geometry.dispose();
                    child.material.dispose();
                }
            });
            
            // Удаляем модель из кэша
            this.cache.delete(giftId);
        }
    }

    // Очистка всего кэша
    disposeAll() {
        for (const [giftId] of this.cache) {
            this.disposeModel(giftId);
        }
    }
}

// Создаем и экспортируем единственный экземпляр менеджера
const modelManager = new ModelManager();
export default modelManager; 