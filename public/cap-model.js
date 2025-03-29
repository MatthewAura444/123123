let scene, camera, renderer, model;

function init() {
    // Создаем сцену
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222); // Меняем цвет фона для соответствия теме

    // Настраиваем камеру
    const container = document.getElementById('cap-model-container');
    const aspect = container.clientWidth / container.clientHeight;
    camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    camera.position.z = 5;

    // Создаем рендерер
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Добавляем освещение
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Загружаем модель
    const loader = new THREE.GLTFLoader();
    
    // Добавляем индикатор загрузки
    const loadingDiv = document.createElement('div');
    loadingDiv.style.position = 'absolute';
    loadingDiv.style.top = '50%';
    loadingDiv.style.left = '50%';
    loadingDiv.style.transform = 'translate(-50%, -50%)';
    loadingDiv.style.color = '#fff';
    loadingDiv.textContent = 'Загрузка модели...';
    container.appendChild(loadingDiv);

    loader.load(
        'models/durov-cap.glb', // Исправленный путь к модели
        function(gltf) {
            model = gltf.scene;
            scene.add(model);
            
            // Центрируем модель
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center);

            // Удаляем индикатор загрузки
            container.removeChild(loadingDiv);
        },
        function(xhr) {
            loadingDiv.textContent = `Загрузка: ${Math.floor((xhr.loaded / xhr.total) * 100)}%`;
        },
        function(error) {
            console.error('Ошибка загрузки модели:', error);
            loadingDiv.textContent = 'Ошибка загрузки модели';
            loadingDiv.style.color = '#ff4444';
        }
    );

    // Запускаем анимацию
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    
    if (model) {
        model.rotation.y += 0.01;
    }
    
    renderer.render(scene, camera);
}

// Обработка изменения размера окна
window.addEventListener('resize', function() {
    const container = document.getElementById('cap-model-container');
    const aspect = container.clientWidth / container.clientHeight;
    
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

// Инициализация при загрузке страницы
window.addEventListener('load', init); 