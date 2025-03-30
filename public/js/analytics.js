class AnalyticsManager {
    constructor() {
        this.currentUser = null;
        this.marketStats = null;
        this.userStats = null;
        this.init();
    }

    async init() {
        try {
            // Получаем данные пользователя из Telegram Web App
            const tg = window.Telegram.WebApp;
            if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
                this.currentUser = tg.initDataUnsafe.user;
                await this.loadAnalytics();
            }

            // Подписываемся на WebSocket события
            window.wsClient.on('marketStatsUpdate', this.handleMarketStatsUpdate.bind(this));
            window.wsClient.on('userStatsUpdate', this.handleUserStatsUpdate.bind(this));
        } catch (error) {
            console.error('Ошибка инициализации AnalyticsManager:', error);
            window.notificationManager.error('Ошибка инициализации аналитики');
        }
    }

    async loadAnalytics() {
        try {
            const loadingNotification = window.notificationManager.showLoading('Загрузка аналитики...');
            
            // Загружаем статистику маркета
            this.marketStats = await window.api.getMarketStats();
            
            // Загружаем статистику пользователя
            this.userStats = await window.api.getUserStats(this.currentUser.id);
            
            this.renderAnalytics();
            window.notificationManager.removeLoading(loadingNotification);
        } catch (error) {
            console.error('Ошибка загрузки аналитики:', error);
            window.notificationManager.error('Ошибка загрузки аналитики');
        }
    }

    renderAnalytics() {
        this.renderMarketStats();
        this.renderUserStats();
        this.renderCharts();
    }

    renderMarketStats() {
        const marketStatsContainer = document.getElementById('marketStats');
        if (!marketStatsContainer || !this.marketStats) return;

        marketStatsContainer.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 12v10H4V12"/>
                            <path d="M2 7h20v5H2z"/>
                            <path d="M12 22V7"/>
                            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                        </svg>
                    </div>
                    <div class="stat-info">
                        <h3>Всего подарков</h3>
                        <p>${this.marketStats.totalGifts}</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                        </svg>
                    </div>
                    <div class="stat-info">
                        <h3>Объем торгов</h3>
                        <p>${this.formatNumber(this.marketStats.totalVolume)} TON</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                    </div>
                    <div class="stat-info">
                        <h3>Активных пользователей</h3>
                        <p>${this.marketStats.activeUsers}</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                    <div class="stat-info">
                        <h3>Среднее время продажи</h3>
                        <p>${this.formatTime(this.marketStats.averageSaleTime)}</p>
                    </div>
                </div>
            </div>
        `;

        // Добавляем анимации для карточек статистики
        marketStatsContainer.querySelectorAll('.stat-card').forEach(card => {
            window.animationManager.animateStatCardEnter(card);
        });
    }

    renderUserStats() {
        const userStatsContainer = document.getElementById('userStats');
        if (!userStatsContainer || !this.userStats) return;

        userStatsContainer.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 12v10H4V12"/>
                            <path d="M2 7h20v5H2z"/>
                            <path d="M12 22V7"/>
                            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                        </svg>
                    </div>
                    <div class="stat-info">
                        <h3>Мои подарки</h3>
                        <p>${this.userStats.totalGifts}</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                        </svg>
                    </div>
                    <div class="stat-info">
                        <h3>Объем продаж</h3>
                        <p>${this.formatNumber(this.userStats.totalSales)} TON</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                    </div>
                    <div class="stat-info">
                        <h3>Избранное</h3>
                        <p>${this.userStats.favorites}</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                    <div class="stat-info">
                        <h3>Рейтинг</h3>
                        <p>${this.userStats.rating.toFixed(1)}</p>
                    </div>
                </div>
            </div>
        `;

        // Добавляем анимации для карточек статистики
        userStatsContainer.querySelectorAll('.stat-card').forEach(card => {
            window.animationManager.animateStatCardEnter(card);
        });
    }

    renderCharts() {
        this.renderMarketTrendsChart();
        this.renderUserActivityChart();
        this.renderCategoryDistributionChart();
    }

    renderMarketTrendsChart() {
        const chartContainer = document.getElementById('marketTrendsChart');
        if (!chartContainer || !this.marketStats?.trends) return;

        // Создаем график трендов рынка
        const ctx = chartContainer.getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.marketStats.trends.map(t => t.date),
                datasets: [{
                    label: 'Объем торгов',
                    data: this.marketStats.trends.map(t => t.volume),
                    borderColor: 'var(--primary-color)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Тренды рынка'
                    }
                }
            }
        });
    }

    renderUserActivityChart() {
        const chartContainer = document.getElementById('userActivityChart');
        if (!chartContainer || !this.userStats?.activity) return;

        // Создаем график активности пользователя
        const ctx = chartContainer.getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: this.userStats.activity.map(a => a.date),
                datasets: [{
                    label: 'Активность',
                    data: this.userStats.activity.map(a => a.count),
                    backgroundColor: 'var(--primary-color)',
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Ваша активность'
                    }
                }
            }
        });
    }

    renderCategoryDistributionChart() {
        const chartContainer = document.getElementById('categoryDistributionChart');
        if (!chartContainer || !this.marketStats?.categories) return;

        // Создаем график распределения категорий
        const ctx = chartContainer.getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: this.marketStats.categories.map(c => c.name),
                datasets: [{
                    data: this.marketStats.categories.map(c => c.count),
                    backgroundColor: [
                        'var(--primary-color)',
                        'var(--success-color)',
                        'var(--warning-color)',
                        'var(--error-color)',
                        'var(--info-color)'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right',
                    },
                    title: {
                        display: true,
                        text: 'Распределение категорий'
                    }
                }
            }
        });
    }

    formatNumber(number) {
        return new Intl.NumberFormat('ru-RU').format(number);
    }

    formatTime(minutes) {
        if (minutes < 60) {
            return `${minutes} мин`;
        }
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours} ч ${remainingMinutes} мин`;
    }

    handleMarketStatsUpdate(stats) {
        this.marketStats = stats;
        this.renderMarketStats();
        this.renderMarketTrendsChart();
        this.renderCategoryDistributionChart();
    }

    handleUserStatsUpdate(stats) {
        this.userStats = stats;
        this.renderUserStats();
        this.renderUserActivityChart();
    }
}

// Создаем глобальный экземпляр
window.analyticsManager = new AnalyticsManager(); 