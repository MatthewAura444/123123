import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

// Кэш для хранения загруженных моделей
const modelCache = new Map();
const loadingPromises = new Map();

class ModelManager {
    constructor() {
        this.models = new Map();
        this.textures = new Map();
        this.loadingPromises = new Map();
        this.init();
    }

    async init() {
        try {
            // Проверяем поддержку WebGL
            if (!this.checkWebGLSupport()) {
                console.warn('WebGL не поддерживается');
                return;
            }

            // Инициализируем Three.js
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(window.devicePixelRatio);

            // Добавляем освещение
            this.addLighting();

            // Добавляем обработчики событий
            this.addEventListeners();
        } catch (error) {
            console.error('Ошибка инициализации ModelManager:', error);
        }
    }

    checkWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch (e) {
            return false;
        }
    }

    addLighting() {
        // Основное освещение
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // Направленное освещение
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);

        // Точечное освещение
        const pointLight = new THREE.PointLight(0xffffff, 0.5);
        pointLight.position.set(-5, -5, -5);
        this.scene.add(pointLight);
    }

    addEventListeners() {
        // Обработка изменения размера окна
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Обработка движения мыши
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };

        document.addEventListener('mousedown', (e) => {
            isDragging = true;
            previousMousePosition = {
                x: e.clientX,
                y: e.clientY
            };
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const deltaMove = {
                x: e.clientX - previousMousePosition.x,
                y: e.clientY - previousMousePosition.y
            };

            this.rotateModel(deltaMove);

            previousMousePosition = {
                x: e.clientX,
                y: e.clientY
            };
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Обработка колесика мыши для зума
        document.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.zoomModel(e.deltaY);
        });
    }

    async loadModel(id, modelUrl, textureUrl) {
        try {
            // Проверяем, загружена ли уже модель
            if (this.models.has(id)) {
                return this.models.get(id);
            }

            // Проверяем, есть ли уже загрузка в процессе
            if (this.loadingPromises.has(id)) {
                return this.loadingPromises.get(id);
            }

            // Создаем промис для загрузки
            const loadPromise = new Promise(async (resolve, reject) => {
                try {
                    // Загружаем текстуру
                    const texture = await this.loadTexture(textureUrl);
                    this.textures.set(id, texture);

                    // Загружаем модель
                    const loader = new THREE.GLTFLoader();
                    const gltf = await loader.loadAsync(modelUrl);

                    // Применяем текстуру к модели
                    this.applyTextureToModel(gltf.scene, texture);

                    // Сохраняем модель
                    this.models.set(id, gltf.scene);

                    resolve(gltf.scene);
                } catch (error) {
                    reject(error);
                } finally {
                    this.loadingPromises.delete(id);
                }
            });

            this.loadingPromises.set(id, loadPromise);

            return loadPromise;
        } catch (error) {
            console.error(`Ошибка загрузки модели ${id}:`, error);
            throw error;
        }
    }

    async loadTexture(url) {
        try {
            const textureLoader = new THREE.TextureLoader();
            const texture = await textureLoader.loadAsync(url);
            texture.needsUpdate = true;
            return texture;
        } catch (error) {
            console.error('Ошибка загрузки текстуры:', error);
            throw error;
        }
    }

    applyTextureToModel(model, texture) {
        model.traverse((child) => {
            if (child.isMesh) {
                child.material.map = texture;
                child.material.needsUpdate = true;
            }
        });
    }

    rotateModel(deltaMove) {
        const model = this.getCurrentModel();
        if (!model) return;

        const rotationSpeed = 0.005;
        model.rotation.y += deltaMove.x * rotationSpeed;
        model.rotation.x += deltaMove.y * rotationSpeed;
    }

    zoomModel(delta) {
        const model = this.getCurrentModel();
        if (!model) return;

        const zoomSpeed = 0.001;
        const scale = 1 + delta * zoomSpeed;
        model.scale.multiplyScalar(scale);
    }

    getCurrentModel() {
        // Возвращаем текущую активную модель
        return this.models.values().next().value;
    }

    render() {
        requestAnimationFrame(() => this.render());
        this.renderer.render(this.scene, this.camera);
    }

    setCameraPosition(position) {
        this.camera.position.set(position.x, position.y, position.z);
        this.camera.lookAt(0, 0, 0);
    }

    setModelPosition(id, position) {
        const model = this.models.get(id);
        if (model) {
            model.position.set(position.x, position.y, position.z);
        }
    }

    setModelRotation(id, rotation) {
        const model = this.models.get(id);
        if (model) {
            model.rotation.set(rotation.x, rotation.y, rotation.z);
        }
    }

    setModelScale(id, scale) {
        const model = this.models.get(id);
        if (model) {
            model.scale.set(scale.x, scale.y, scale.z);
        }
    }

    dispose() {
        // Очищаем все ресурсы
        this.models.forEach(model => {
            model.traverse((child) => {
                if (child.isMesh) {
                    child.geometry.dispose();
                    child.material.dispose();
                }
            });
        });

        this.textures.forEach(texture => {
            texture.dispose();
        });

        this.models.clear();
        this.textures.clear();
        this.loadingPromises.clear();

        this.renderer.dispose();
    }
}

// Создаем глобальный экземпляр
window.modelManager = new ModelManager(); 