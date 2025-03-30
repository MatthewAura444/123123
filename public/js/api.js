class API {
    constructor() {
        this.baseUrl = '/api';
        this.headers = {
            'Content-Type': 'application/json'
        };
    }

    async setAuthToken(token) {
        this.headers['Authorization'] = `Bearer ${token}`;
    }

    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                ...options,
                headers: {
                    ...this.headers,
                    ...options.headers
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Gifts
    async getGifts(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/gifts?${queryString}`);
    }

    async getGiftById(id) {
        return this.request(`/gifts/${id}`);
    }

    async createGift(data) {
        return this.request('/gifts', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateGift(id, data) {
        return this.request(`/gifts/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteGift(id) {
        return this.request(`/gifts/${id}`, {
            method: 'DELETE'
        });
    }

    // Collections
    async getCollections(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/collections?${queryString}`);
    }

    async getCollectionById(id) {
        return this.request(`/collections/${id}`);
    }

    async createCollection(data) {
        return this.request('/collections', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateCollection(id, data) {
        return this.request(`/collections/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteCollection(id) {
        return this.request(`/collections/${id}`, {
            method: 'DELETE'
        });
    }

    // Users
    async getUserProfile() {
        return this.request('/users/profile');
    }

    async updateUserProfile(data) {
        return this.request('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async getUserGifts(userId) {
        return this.request(`/users/${userId}/gifts`);
    }

    async getUserCollections(userId) {
        return this.request(`/users/${userId}/collections`);
    }

    // Transactions
    async getTransactions(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/transactions?${queryString}`);
    }

    async createTransaction(data) {
        return this.request('/transactions', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async getTransactionById(id) {
        return this.request(`/transactions/${id}`);
    }

    // Search
    async searchGifts(query, params = {}) {
        return this.request(`/search/gifts?q=${encodeURIComponent(query)}&${new URLSearchParams(params).toString()}`);
    }

    async searchCollections(query, params = {}) {
        return this.request(`/search/collections?q=${encodeURIComponent(query)}&${new URLSearchParams(params).toString()}`);
    }

    // Analytics
    async getMarketStats() {
        return this.request('/analytics/market-stats');
    }

    async getUserStats(userId) {
        return this.request(`/analytics/user-stats/${userId}`);
    }

    // Upload
    async uploadImage(file) {
        const formData = new FormData();
        formData.append('image', file);

        return this.request('/upload/image', {
            method: 'POST',
            headers: {
                // Не устанавливаем Content-Type, браузер сам установит с boundary
            },
            body: formData
        });
    }

    // Favorites
    async addToFavorites(giftId) {
        return this.request(`/favorites/${giftId}`, {
            method: 'POST'
        });
    }

    async removeFromFavorites(giftId) {
        return this.request(`/favorites/${giftId}`, {
            method: 'DELETE'
        });
    }

    async getFavorites() {
        return this.request('/favorites');
    }

    // Follow
    async followUser(userId) {
        return this.request(`/follow/${userId}`, {
            method: 'POST'
        });
    }

    async unfollowUser(userId) {
        return this.request(`/follow/${userId}`, {
            method: 'DELETE'
        });
    }

    async getFollowers() {
        return this.request('/followers');
    }

    async getFollowing() {
        return this.request('/following');
    }
}

// Создаем глобальный экземпляр
window.api = new API(); 