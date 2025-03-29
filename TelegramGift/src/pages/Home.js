import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="home-page">
      <div className="hero">
        <h1>Welcome to TelegramGift</h1>
        <p>Share and collect unique 3D gifts using TON</p>
        <div className="cta-buttons">
          <Link to="/marketplace" className="button">
            Browse Marketplace
          </Link>
          <Link to="/create-gift" className="button secondary">
            Create Gift
          </Link>
        </div>
      </div>

      <div className="features">
        <div className="feature-card">
          <h3>Secure Authentication</h3>
          <p>Login seamlessly with your Telegram account</p>
        </div>
        <div className="feature-card">
          <h3>TON Integration</h3>
          <p>Buy and sell gifts using TON cryptocurrency</p>
        </div>
        <div className="feature-card">
          <h3>3D Models</h3>
          <p>Create and view stunning 3D gift models</p>
        </div>
      </div>
    </div>
  );
}

export default Home; 