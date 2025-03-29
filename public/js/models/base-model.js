class BaseModel {
    constructor() {
        this.model = null;
        this.texture = null;
        this.material = null;
    }

    async loadModel(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load model: ${response.statusText}`);
            }
            const blob = await response.blob();
            return URL.createObjectURL(blob);
        } catch (error) {
            console.error('Error loading model:', error);
            return null;
        }
    }

    async loadTexture(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load texture: ${response.statusText}`);
            }
            const blob = await response.blob();
            return URL.createObjectURL(blob);
        } catch (error) {
            console.error('Error loading texture:', error);
            return null;
        }
    }

    createMaterial(color = 0xffffff, metalness = 0.5, roughness = 0.5) {
        return {
            color: color,
            metalness: metalness,
            roughness: roughness,
            envMapIntensity: 1.0
        };
    }

    dispose() {
        if (this.model) {
            URL.revokeObjectURL(this.model);
        }
        if (this.texture) {
            URL.revokeObjectURL(this.texture);
        }
    }
}

export default BaseModel; 