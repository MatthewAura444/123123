// Описание 3D моделей подарков
const giftModels = {
    'plush-pepe': {
        name: 'Plush Pepe',
        model: '/models/gifts/plush-pepe.glb',
        texture: '/images/gifts/textures/plush-pepe-texture.png',
        scale: 1.0,
        rotation: { x: 0, y: 0, z: 0 },
        position: { x: 0, y: 0, z: 0 },
        animations: ['idle', 'bounce', 'wave']
    },
    'eternal-rose': {
        name: 'Eternal Rose',
        model: '/models/gifts/eternal-rose.glb',
        texture: '/images/gifts/textures/eternal-rose-texture.png',
        scale: 0.8,
        rotation: { x: 0, y: Math.PI / 4, z: 0 },
        position: { x: 0, y: 0, z: 0 },
        animations: ['idle', 'glow']
    },
    'durovs-cap': {
        name: "Durov's Cap",
        model: '/models/gifts/durovs-cap.glb',
        texture: '/images/gifts/textures/durovs-cap-texture.png',
        scale: 1.2,
        rotation: { x: 0, y: 0, z: 0 },
        position: { x: 0, y: 0, z: 0 },
        animations: ['idle', 'float']
    },
    'signet-ring': {
        name: 'Signet Ring',
        model: '/models/gifts/signet-ring.glb',
        texture: '/images/gifts/textures/signet-ring-texture.png',
        scale: 0.5,
        rotation: { x: 0, y: Math.PI / 2, z: 0 },
        position: { x: 0, y: 0, z: 0 },
        animations: ['idle', 'shine']
    },
    'crystal-ball': {
        name: 'Crystal Ball',
        model: '/models/gifts/crystal-ball.glb',
        texture: '/images/gifts/textures/crystal-ball-texture.png',
        scale: 1.0,
        rotation: { x: 0, y: 0, z: 0 },
        position: { x: 0, y: 0, z: 0 },
        animations: ['idle', 'glow', 'rotate']
    },
    'love-potion': {
        name: 'Love Potion',
        model: '/models/gifts/love-potion.glb',
        texture: '/images/gifts/textures/love-potion-texture.png',
        scale: 0.8,
        rotation: { x: 0, y: 0, z: 0 },
        position: { x: 0, y: 0, z: 0 },
        animations: ['idle', 'bubble', 'glow']
    },
    'astral-shard': {
        name: 'Astral Shard',
        model: '/models/gifts/astral-shard.glb',
        texture: '/images/gifts/textures/astral-shard-texture.png',
        scale: 1.0,
        rotation: { x: 0, y: 0, z: 0 },
        position: { x: 0, y: 0, z: 0 },
        animations: ['idle', 'float', 'glow']
    },
    'b-day-candle': {
        name: 'B-Day Candle',
        model: '/models/gifts/b-day-candle.glb',
        texture: '/images/gifts/textures/b-day-candle-texture.png',
        scale: 0.7,
        rotation: { x: 0, y: 0, z: 0 },
        position: { x: 0, y: 0, z: 0 },
        animations: ['idle', 'flicker']
    },
    'berry-box': {
        name: 'Berry Box',
        model: '/models/gifts/berry-box.glb',
        texture: '/images/gifts/textures/berry-box-texture.png',
        scale: 1.0,
        rotation: { x: 0, y: 0, z: 0 },
        position: { x: 0, y: 0, z: 0 },
        animations: ['idle', 'bounce']
    },
    'bunny-muffin': {
        name: 'Bunny Muffin',
        model: '/models/gifts/bunny-muffin.glb',
        texture: '/images/gifts/textures/bunny-muffin-texture.png',
        scale: 0.8,
        rotation: { x: 0, y: 0, z: 0 },
        position: { x: 0, y: 0, z: 0 },
        animations: ['idle', 'bounce', 'wiggle']
    }
};

// Функция для загрузки модели
async function loadGiftModel(giftId) {
    const modelData = giftModels[giftId];
    if (!modelData) {
        console.error(`Model not found for gift: ${giftId}`);
        return null;
    }

    try {
        const model = await modelManager.loadModel(giftId, modelData.model, modelData.texture);
        if (model) {
            model.scale.set(modelData.scale, modelData.scale, modelData.scale);
            model.rotation.set(modelData.rotation.x, modelData.rotation.y, modelData.rotation.z);
            model.position.set(modelData.position.x, modelData.position.y, modelData.position.z);
            return model;
        }
    } catch (error) {
        console.error(`Error loading model for gift ${giftId}:`, error);
    }
    return null;
}

// Функция для анимации модели
function animateGiftModel(model, animationName) {
    if (!model || !model.animations) return;

    const animation = model.animations.find(a => a.name === animationName);
    if (animation) {
        const mixer = new THREE.AnimationMixer(model);
        const action = mixer.clipAction(animation);
        action.play();
        return mixer;
    }
    return null;
}

export { giftModels, loadGiftModel, animateGiftModel }; 