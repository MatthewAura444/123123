// Утилиты для безопасности и валидации

// Класс для шифрования данных
class Encryption {
    static async encrypt(data, key) {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(JSON.stringify(data));
        const keyBuffer = await crypto.subtle.importKey(
            'raw',
            encoder.encode(key),
            'AES-GCM',
            false,
            ['encrypt']
        );
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encryptedData = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            keyBuffer,
            dataBuffer
        );
        return {
            data: Array.from(new Uint8Array(encryptedData)),
            iv: Array.from(iv)
        };
    }

    static async decrypt(encryptedData, key) {
        const decoder = new TextDecoder();
        const keyBuffer = await crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(key),
            'AES-GCM',
            false,
            ['decrypt']
        );
        const decryptedData = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: new Uint8Array(encryptedData.iv) },
            keyBuffer,
            new Uint8Array(encryptedData.data)
        );
        return JSON.parse(decoder.decode(decryptedData));
    }
}

// Класс для валидации адресов кошельков
class WalletValidator {
    static validateTonAddress(address) {
        const tonAddressRegex = /^[0-9a-zA-Z]{48}$/;
        return tonAddressRegex.test(address);
    }

    static validateTelegramAddress(address) {
        const telegramAddressRegex = /^[a-zA-Z0-9_]{5,32}$/;
        return telegramAddressRegex.test(address);
    }

    static validateTonkeeperAddress(address) {
        return this.validateTonAddress(address);
    }

    static validateMyTonWalletAddress(address) {
        return this.validateTonAddress(address);
    }

    static validateTonHubAddress(address) {
        return this.validateTonAddress(address);
    }
}

// Класс для защиты от двойных транзакций
class TransactionProtection {
    static transactionCache = new Map();

    static async checkDuplicateTransaction(transactionId) {
        if (this.transactionCache.has(transactionId)) {
            const transaction = this.transactionCache.get(transactionId);
            const timeDiff = Date.now() - transaction.timestamp;
            if (timeDiff < 60000) { // 1 минута
                return true;
            }
        }
        return false;
    }

    static addTransaction(transactionId) {
        this.transactionCache.set(transactionId, {
            timestamp: Date.now()
        });
    }

    static removeTransaction(transactionId) {
        this.transactionCache.delete(transactionId);
    }
}

// Класс для логирования
class Logger {
    static levels = {
        ERROR: 'ERROR',
        WARN: 'WARN',
        INFO: 'INFO',
        DEBUG: 'DEBUG'
    };

    static log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            data
        };

        // Сохраняем лог в localStorage
        const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');
        logs.push(logEntry);
        localStorage.setItem('app_logs', JSON.stringify(logs.slice(-100))); // Храним последние 100 логов

        // Отправляем лог на сервер
        this.sendToServer(logEntry);

        // Выводим в консоль
        console.log(`[${timestamp}] ${level}: ${message}`, data || '');
    }

    static async sendToServer(logEntry) {
        try {
            await fetch('/api/logs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(logEntry)
            });
        } catch (error) {
            console.error('Error sending log to server:', error);
        }
    }
}

// Экспортируем классы
window.SecurityUtils = {
    Encryption,
    WalletValidator,
    TransactionProtection,
    Logger
}; 