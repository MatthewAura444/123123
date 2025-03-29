import React, { useContext, useState, useEffect } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { AuthContext } from '../contexts/AuthContext';

function Profile() {
  const { user } = useContext(AuthContext);
  const { connected, account } = useTonConnectUI();
  const [balance, setBalance] = useState('0');
  const [userGifts, setUserGifts] = useState([]);

  // Fetch TON balance
  useEffect(() => {
    if (connected && account) {
      // Here you would typically fetch the balance from TON
      // This is a placeholder
      setBalance('10.5');
    }
  }, [connected, account]);

  // Fetch user's gifts
  useEffect(() => {
    if (user) {
      // Here you would typically fetch user's gifts from your backend
      // This is a placeholder
      setUserGifts([
        {
          id: 1,
          name: 'Premium Cap',
          price: '5.0',
          status: 'on_sale'
        },
        // Add more gifts here
      ]);
    }
  }, [user]);

  return (
    <div className="profile-page">
      <div className="card profile-header">
        <img 
          src={user.photoUrl || '/default-avatar.png'} 
          alt={user.username}
          className="profile-large-avatar"
        />
        <div className="profile-info">
          <h1>{user.firstName} {user.lastName}</h1>
          <p>@{user.username}</p>
        </div>
      </div>

      <div className="card wallet-section">
        <h2>Wallet</h2>
        {connected ? (
          <>
            <p className="balance">Balance: {balance} TON</p>
            <p className="wallet-address">
              Wallet: {account?.slice(0, 6)}...{account?.slice(-4)}
            </p>
          </>
        ) : (
          <p>Connect your TON wallet to manage balance</p>
        )}
      </div>

      <div className="card gifts-section">
        <h2>My Gifts</h2>
        <div className="gifts-grid">
          {userGifts.map(gift => (
            <div key={gift.id} className="gift-card">
              <model-viewer
                src={`/models/${gift.name.toLowerCase().replace(' ', '-')}.glb`}
                alt={gift.name}
                auto-rotate
                camera-controls
                shadow-intensity="1"
                environment-image="neutral">
              </model-viewer>
              <div className="gift-info">
                <h3>{gift.name}</h3>
                <p>{gift.price} TON</p>
                <p className="status">{gift.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Profile; 