document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('withdrawal-form');
    const submitButton = document.getElementById('submit-button');
    const formErrors = document.getElementById('form-errors');
    const walletAddress = document.getElementById('wallet-address');
    const amount = document.getElementById('amount');
    const commissionAmount = document.getElementById('commission-amount');
    const finalAmount = document.getElementById('final-amount');
    const connectButton = document.getElementById('connect-wallet');
    const walletStatus = document.getElementById('wallet-status');
    const walletInfo = document.getElementById('wallet-info');
    const connectedAddress = document.getElementById('connected-address');
    const disconnectButton = document.getElementById('disconnect-wallet');

    let tonConnect = null;
    let connectedWallet = null;

    // Инициализация TonConnect
    async function initTonConnect() {
        try {
            tonConnect = new TonConnect({
                manifestUrl: 'https://your-app.com/tonconnect-manifest.json',
                buttonRootId: 'connect-wallet'
            });

            // Проверяем, есть ли уже подключенный кошелек
            const wallet = await tonConnect.getWallet();
            if (wallet) {
                handleWalletConnection(wallet);
            }
        } catch (error) {
            console.error('Ошибка инициализации TonConnect:', error);
        }
    }

    // Обработка подключения кошелька
    function handleWalletConnection(wallet) {
        connectedWallet = wallet;
        walletStatus.textContent = 'Кошелек подключен';
        walletInfo.style.display = 'block';
        connectedAddress.textContent = wallet.address;
        walletAddress.value = wallet.address;
        walletAddress.disabled = true;
        connectButton.style.display = 'none';
    }

    // Обработка отключения кошелька
    function handleWalletDisconnection() {
        connectedWallet = null;
        walletStatus.textContent = 'Подключить кошелек';
        walletInfo.style.display = 'none';
        walletAddress.value = '';
        walletAddress.disabled = false;
        connectButton.style.display = 'block';
    }

    // Обработчик подключения кошелька
    connectButton.addEventListener('click', async () => {
        try {
            if (!tonConnect) {
                await initTonConnect();
            }
            
            const wallet = await tonConnect.connect();
            handleWalletConnection(wallet);
        } catch (error) {
            console.error('Ошибка подключения кошелька:', error);
            formErrors.textContent = 'Ошибка подключения кошелька. Попробуйте еще раз.';
        }
    });

    // Обработчик отключения кошелька
    disconnectButton.addEventListener('click', async () => {
        try {
            if (tonConnect) {
                await tonConnect.disconnect();
            }
            handleWalletDisconnection();
        } catch (error) {
            console.error('Ошибка отключения кошелька:', error);
            formErrors.textContent = 'Ошибка отключения кошелька. Попробуйте еще раз.';
        }
    });

    // Расчет комиссии
    function calculateCommission(value) {
        const commission = value * 0.025; // 2.5%
        const final = value - commission;
        commissionAmount.textContent = commission.toFixed(2) + ' TON';
        finalAmount.textContent = final.toFixed(2) + ' TON';
    }

    // Обновление комиссии при изменении суммы
    amount.addEventListener('input', function(e) {
        const value = parseFloat(e.target.value);
        if (value < 1) {
            e.target.value = 1;
            calculateCommission(1);
        } else {
            calculateCommission(value);
        }
    });

    // Форматирование адреса кошелька
    walletAddress.addEventListener('input', function(e) {
        let value = e.target.value.replace(/[^0-9a-zA-Z]/g, '');
        e.target.value = value;
    });

    // Обработка отправки формы
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        submitButton.disabled = true;
        submitButton.querySelector('#button-text').textContent = 'Обработка...';
        formErrors.textContent = '';

        try {
            const formData = {
                amount: parseFloat(amount.value),
                walletAddress: walletAddress.value,
                memo: document.getElementById('memo').value
            };

            // Если кошелек подключен, подписываем транзакцию
            if (connectedWallet) {
                try {
                    const transaction = {
                        validUntil: Date.now() + 5 * 60 * 1000, // 5 минут
                        messages: [
                            {
                                address: formData.walletAddress,
                                amount: formData.amount * 1000000000 // Конвертируем в нано TON
                            }
                        ]
                    };

                    const result = await tonConnect.sendTransaction(transaction);
                    console.log('Транзакция подписана:', result);
                } catch (error) {
                    throw new Error('Ошибка подписания транзакции: ' + error.message);
                }
            }

            const response = await fetch('/api/withdrawal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Ошибка при создании транзакции');
            }

            // Показываем статус транзакции
            showTransactionStatus(data.transactionId);
            
        } catch (error) {
            formErrors.textContent = error.message;
        } finally {
            submitButton.disabled = false;
            submitButton.querySelector('#button-text').textContent = 'Отправить TON';
        }
    });

    // Функция отображения статуса транзакции
    async function showTransactionStatus(transactionId) {
        const statusDiv = document.createElement('div');
        statusDiv.className = 'transaction-status pending';
        statusDiv.innerHTML = `
            <h3>Статус транзакции</h3>
            <p>ID транзакции: ${transactionId}</p>
            <p>Статус: Обработка...</p>
            <p>Пожалуйста, подождите...</p>
        `;
        form.appendChild(statusDiv);

        // Проверяем статус каждые 5 секунд
        const checkStatus = setInterval(async () => {
            try {
                const response = await fetch(`/api/withdrawal/${transactionId}`);
            const data = await response.json();
            
                if (data.status === 'completed') {
                    statusDiv.className = 'transaction-status success';
                    statusDiv.innerHTML = `
                        <h3>Транзакция успешно выполнена</h3>
                        <p>ID транзакции: ${transactionId}</p>
                        <p>Исходная сумма: ${data.originalAmount} TON</p>
                        <p>Комиссия (2.5%): ${data.commission} TON</p>
                        <p>Комиссия сети: ${data.networkFee} TON</p>
                        <p>К получению: ${data.amount} TON</p>
                        <p>Время выполнения: ${new Date(data.createdAt).toLocaleString()}</p>
                    `;
                    clearInterval(checkStatus);
            } else if (data.status === 'failed') {
                    statusDiv.className = 'transaction-status error';
                    statusDiv.innerHTML = `
                        <h3>Ошибка транзакции</h3>
                        <p>ID транзакции: ${transactionId}</p>
                        <p>Произошла ошибка при выполнении транзакции</p>
                        <p>Пожалуйста, попробуйте позже или обратитесь в поддержку</p>
                    `;
                    clearInterval(checkStatus);
                } else {
                    statusDiv.innerHTML = `
                        <h3>Статус транзакции</h3>
                        <p>ID транзакции: ${transactionId}</p>
                        <p>Статус: Обработка...</p>
                        <p>Пожалуйста, подождите...</p>
                    `;
            }
        } catch (error) {
            console.error('Ошибка при проверке статуса:', error);
                clearInterval(checkStatus);
            }
        }, 5000);
    }

    // Инициализация комиссии при загрузке страницы
    calculateCommission(parseFloat(amount.value));

    // Инициализация TonConnect
    initTonConnect();
}); 