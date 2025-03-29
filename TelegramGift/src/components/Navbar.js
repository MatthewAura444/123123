import React from 'react';
import { Link } from 'react-router-dom';
import { TonConnectButton } from '@tonconnect/ui-react';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

function Navbar() {
  const { user } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="logo">
          TelegramGift
        </Link>
      </div>
      
      <div className="navbar-menu">
        <Link to="/marketplace" className="nav-link">
          Marketplace
        </Link>
        {user && (
          <>
            <Link to="/create-gift" className="nav-link">
              Create Gift
            </Link>
            <Link to="/balance" className="nav-link">
              Balance
            </Link>
          </>
        )}
      </div>

      <div className="navbar-end">
        <TonConnectButton />
        {user ? (
          <Link to="/profile" className="profile-button">
            <img 
              src={user.photoUrl || '/default-avatar.png'} 
              alt={user.username} 
              className="profile-avatar"
            />
            <span className="profile-name">{user.username}</span>
          </Link>
        ) : (
          <button 
            className="login-button"
            onClick={() => window.Telegram.WebApp.expand()}
          >
            Login with Telegram
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar; 