// Тесты для функционала кошельков

class WalletTests {
    static async runTests() {
        console.log('Запуск тестов...');
        
        // Тесты валидации адресов
        await this.testAddressValidation();
        
        // Тесты шифрования
        await this.testEncryption();
        
        // Тесты защиты от дубликатов
        await this.testDuplicateProtection();
        
        // Тесты менеджера кошельков
        await this.testWalletManager();
        
        // Тесты истории транзакций
        await this.testTransactionHistory();
        
        console.log('Тесты завершены');
    }

    static async testAddressValidation() {
        console.log('\nТестирование валидации адресов...');
        
        const testCases = [
            { type: 'telegram', address: 'test_user', expected: true },
            { type: 'telegram', address: 't', expected: false },
            { type: 'tonkeeper', address: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', expected: true },
            { type: 'tonkeeper', address: 'invalid', expected: false },
            { type: 'mytonwallet', address: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', expected: true },
            { type: 'tonhub', address: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', expected: true }
        ];

        for (const test of testCases) {
            const result = SecurityUtils.WalletValidator.validateWalletAddress(test.type, test.address);
            console.log(`${test.type}: ${test.address} - ${result === test.expected ? '✅' : '❌'}`);
        }
    }

    static async testEncryption() {
        console.log('\nТестирование шифрования...');
        
        const testData = {
            wallet: {
                type: 'tonkeeper',
                address: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
                balance: 100
            }
        };

        try {
            const encrypted = await SecurityUtils.Encryption.encrypt(testData, 'test-key');
            const decrypted = await SecurityUtils.Encryption.decrypt(encrypted, 'test-key');
            
            console.log('Шифрование/дешифрование - ' + 
                (JSON.stringify(testData) === JSON.stringify(decrypted) ? '✅' : '❌'));
        } catch (error) {
            console.log('Ошибка шифрования - ❌');
        }
    }

    static async testDuplicateProtection() {
        console.log('\nТестирование защиты от дубликатов...');
        
        const transactionId = 'test-transaction-1';
        
        // Добавляем транзакцию
        SecurityUtils.TransactionProtection.addTransaction(transactionId);
        
        // Проверяем дубликат
        const isDuplicate = await SecurityUtils.TransactionProtection.checkDuplicateTransaction(transactionId);
        
        console.log('Защита от дубликатов - ' + (isDuplicate ? '✅' : '❌'));
    }

    static async testWalletManager() {
        console.log('\nТестирование менеджера кошельков...');
        
        try {
            // Добавляем тестовый кошелек
            const wallet = await walletManager.addWallet('tonkeeper', 
                '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
            
            console.log('Добавление кошелька - ✅');
            
            // Проверяем получение баланса
            await walletManager.updateWalletBalance(wallet.id);
            console.log('Обновление баланса - ✅');
            
            // Удаляем кошелек
            await walletManager.removeWallet(wallet.id);
            console.log('Удаление кошелька - ✅');
        } catch (error) {
            console.log('Ошибка менеджера кошельков - ❌');
        }
    }

    static async testTransactionHistory() {
        console.log('\nТестирование истории транзакций...');
        
        const container = document.createElement('div');
        container.id = 'testTransactionHistory';
        document.body.appendChild(container);
        
        const history = new TransactionHistory('testTransactionHistory');
        
        // Добавляем тестовую транзакцию
        const transaction = {
            id: 'test-transaction-1',
            walletId: 'test-wallet-1',
            amount: 100,
            status: 'completed',
            hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            timestamp: Date.now()
        };
        
        history.handleTransactionUpdate(transaction);
        
        // Проверяем отображение
        const transactionElement = container.querySelector('.transaction-item');
        console.log('Отображение транзакции - ' + (transactionElement ? '✅' : '❌'));
        
        // Очищаем
        document.body.removeChild(container);
    }
}

// Запускаем тесты при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    WalletTests.runTests();
}); 