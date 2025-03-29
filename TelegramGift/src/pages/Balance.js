import React, { useState, useEffect } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { loadStripe } from '@stripe/stripe-js';

// Инициализация Stripe
const stripePromise = loadStripe('YOUR_PUBLISHABLE_KEY'); // Замените на ваш публичный ключ Stripe

function Balance() {
  const { connected, account } = useTonConnectUI();
  const [amount, setAmount] = useState('');
  const [operation, setOperation] = useState('deposit');
  const [loading, setLoading] = useState(false);

  const handleStripePayment = async () => {
    if (!amount || !connected) return;

    setLoading(true);
    try {
      // Здесь будет запрос к вашему бэкенду для создания сессии Stripe
      const response = await fetch('/api/create-payment-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          operation: operation,
          walletAddress: account
        })
      });

      const { sessionId } = await response.json();

      // Загрузка Stripe
      const stripe = await stripePromise;
      
      // Перенаправление на страницу оплаты Stripe
      const { error } = await stripe.redirectToCheckout({
        sessionId: sessionId
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Payment Error:', error);
      alert('Error processing payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="balance-page">
      <div className="card">
        <h2>Balance Management</h2>
        
        <div className="operation-tabs">
          <button 
            className={`tab ${operation === 'deposit' ? 'active' : ''}`}
            onClick={() => setOperation('deposit')}
          >
            Deposit
          </button>
          <button 
            className={`tab ${operation === 'withdraw' ? 'active' : ''}`}
            onClick={() => setOperation('withdraw')}
          >
            Withdraw
          </button>
        </div>

        <div className="payment-form">
          <div className="form-group">
            <label>Amount (TON)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              required
              min="1"
              step="0.1"
            />
          </div>

          <button 
            onClick={handleStripePayment}
            className="button"
            disabled={loading || !connected || !amount}
          >
            {loading ? 'Processing...' : `Continue to ${operation === 'deposit' ? 'Deposit' : 'Withdraw'}`}
          </button>

          {!connected && (
            <p className="error-message">
              Please connect your TON wallet first
            </p>
          )}
        </div>
      </div>

      <div className="balance-info">
        <h3>Important Information</h3>
        <ul>
          <li>Minimum deposit/withdrawal: 1 TON</li>
          <li>Processing time: Instant</li>
          <li>Secure payment processing via Stripe</li>
          <li>Your wallet: {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Not connected'}</li>
        </ul>
      </div>
    </div>
  );
}

export default Balance; 