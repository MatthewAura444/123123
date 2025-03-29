class HLSPlayer {
    constructor() {
        this.video = document.getElementById('video');
        this.qualitySelect = document.getElementById('quality');
        this.audioSelect = document.getElementById('audio');
        this.subtitleSelect = document.getElementById('subtitle');
        this.networkStatus = document.getElementById('network-status');
        this.bufferStatus = document.getElementById('buffer-status');
        this.errorStatus = document.getElementById('error-status');
        
        this.hls = null;
        this.levels = [];
        this.audioTracks = [];
        this.subtitleTracks = [];
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.qualitySelect.addEventListener('change', () => this.setQuality(this.qualitySelect.value));
        this.audioSelect.addEventListener('change', () => this.setAudioTrack(this.audioSelect.value));
        this.subtitleSelect.addEventListener('change', () => this.setSubtitleTrack(this.subtitleSelect.value));
        
        this.video.addEventListener('error', (e) => this.handleError(e));
        this.video.addEventListener('waiting', () => this.updateBufferStatus('Буферизация...'));
        this.video.addEventListener('playing', () => this.updateBufferStatus('Воспроизведение'));
    }
    
    loadSource(url) {
        if (Hls.isSupported()) {
            this.hls = new Hls({
                debug: false,
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90,
                maxBufferLength: 30,
                maxMaxBufferLength: 600,
                maxBufferSize: 60 * 1000 * 1000,
                maxBufferHole: 0.5,
                lowLatencyMode: true,
                manifestLoadingTimeOut: 10000,
                manifestLoadingMaxRetry: 6,
                manifestLoadingRetryDelay: 500,
                manifestLoadingMaxRetryTimeout: 64000,
                levelLoadingTimeOut: 10000,
                levelLoadingMaxRetry: 6,
                levelLoadingRetryDelay: 500,
                levelLoadingMaxRetryTimeout: 64000,
                fragLoadingTimeOut: 20000,
                fragLoadingMaxRetry: 6,
                fragLoadingRetryDelay: 500,
                fragLoadingMaxRetryTimeout: 64000,
                startFragPrefetch: true,
                testBandwidth: true,
                progressive: true,
                lowLatencyMode: true,
                backBufferLength: 90,
                maxBufferLength: 30,
                maxMaxBufferLength: 600,
                maxBufferSize: 60 * 1000 * 1000,
                maxBufferHole: 0.5,
                highBufferWatchdogPeriod: 2,
                nudgeOffset: 0.1,
                nudgeMaxRetry: 5,
                maxFragLookUpTolerance: 0.5,
                liveSyncDurationCount: 3,
                liveMaxLatencyDurationCount: 10,
                liveDurationInfinity: true,
                liveBackBufferLength: 90,
                maxStarvationDelay: 4,
                maxLoadingDelay: 4,
                manifestLoadPolicy: {
                    default: {
                        maxTimeToFirstByteMs: 10000,
                        maxLoadTimeMs: 20000,
                        timeoutRetry: {
                            maxNumRetry: 6,
                            retryDelayMs: 500,
                            maxRetryDelayMs: 8000,
                        },
                        errorRetry: {
                            maxNumRetry: 6,
                            retryDelayMs: 500,
                            maxRetryDelayMs: 8000,
                        },
                    },
                },
                playlistLoadPolicy: {
                    default: {
                        maxTimeToFirstByteMs: 10000,
                        maxLoadTimeMs: 20000,
                        timeoutRetry: {
                            maxNumRetry: 6,
                            retryDelayMs: 500,
                            maxRetryDelayMs: 8000,
                        },
                        errorRetry: {
                            maxNumRetry: 6,
                            retryDelayMs: 500,
                            maxRetryDelayMs: 8000,
                        },
                    },
                },
                fragLoadPolicy: {
                    default: {
                        maxTimeToFirstByteMs: 10000,
                        maxLoadTimeMs: 20000,
                        timeoutRetry: {
                            maxNumRetry: 6,
                            retryDelayMs: 500,
                            maxRetryDelayMs: 8000,
                        },
                        errorRetry: {
                            maxNumRetry: 6,
                            retryDelayMs: 500,
                            maxRetryDelayMs: 8000,
                        },
                    },
                },
            });
            
            this.hls.loadSource(url);
            this.hls.attachMedia(this.video);
            
            this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
                this.updateLevels();
                this.updateAudioTracks();
                this.updateSubtitleTracks();
            });
            
            this.hls.on(Hls.Events.ERROR, (event, data) => {
                this.handleHlsError(data);
            });
            
            this.hls.on(Hls.Events.FRAG_LOADED, () => {
                this.updateNetworkStatus('Загрузка сегмента...');
            });
            
            this.hls.on(Hls.Events.FRAG_CHANGED, () => {
                this.updateNetworkStatus('Сегмент загружен');
            });
        } else if (this.video.canPlayType('application/vnd.apple.mpegurl')) {
            this.video.src = url;
        }
    }
    
    updateLevels() {
        if (!this.hls) return;
        
        this.levels = this.hls.levels;
        this.qualitySelect.innerHTML = '';
        
        this.levels.forEach((level, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${level.height}p ${Math.round(level.bitrate / 1000)}kbps`;
            this.qualitySelect.appendChild(option);
        });
        
        this.qualitySelect.value = this.hls.currentLevel;
    }
    
    updateAudioTracks() {
        if (!this.hls) return;
        
        this.audioTracks = this.hls.audioTracks;
        this.audioSelect.innerHTML = '';
        
        this.audioTracks.forEach((track, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = track.lang || `Аудио ${index + 1}`;
            this.audioSelect.appendChild(option);
        });
        
        this.audioSelect.value = this.hls.audioTrack;
    }
    
    updateSubtitleTracks() {
        if (!this.hls) return;
        
        this.subtitleTracks = this.hls.subtitleTracks;
        this.subtitleSelect.innerHTML = '';
        
        const offOption = document.createElement('option');
        offOption.value = -1;
        offOption.textContent = 'Выкл';
        this.subtitleSelect.appendChild(offOption);
        
        this.subtitleTracks.forEach((track, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = track.lang || `Субтитры ${index + 1}`;
            this.subtitleSelect.appendChild(option);
        });
        
        this.subtitleSelect.value = this.hls.subtitleTrack;
    }
    
    setQuality(level) {
        if (this.hls) {
            this.hls.currentLevel = parseInt(level);
        }
    }
    
    setAudioTrack(track) {
        if (this.hls) {
            this.hls.audioTrack = parseInt(track);
        }
    }
    
    setSubtitleTrack(track) {
        if (this.hls) {
            this.hls.subtitleTrack = parseInt(track);
        }
    }
    
    updateNetworkStatus(status) {
        this.networkStatus.textContent = status;
    }
    
    updateBufferStatus(status) {
        this.bufferStatus.textContent = status;
    }
    
    handleError(error) {
        this.errorStatus.textContent = `Ошибка: ${error.message}`;
    }
    
    handleHlsError(data) {
        if (data.fatal) {
            switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                    this.hls.startLoad();
                    break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                    this.hls.recoverMediaError();
                    break;
                default:
                    this.hls.destroy();
                    break;
            }
        }
    }
}

// Создаем экземпляр плеера
const player = new HLSPlayer();

// Загружаем тестовый HLS поток
player.loadSource('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'); 