import React, { useState, useEffect } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';

function Marketplace() {
  const { connected } = useTonConnectUI();
  const [gifts, setGifts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch available gifts
  useEffect(() => {
    // Here you would typically fetch gifts from your backend
    // This is a placeholder
    setGifts([
      {
        id: 1,
        name: 'Premium Cap',
        price: '5.0',
        seller: '@johndoe',
        description: 'Exclusive Telegram branded cap'
      },
      {
        id: 2,
        name: 'Crystal Ball',
        price: '3.5',
        seller: '@alice',
        description: 'Mystical crystal ball decoration'
      },
      // Add more gifts here
    ]);
  }, []);

  const filteredGifts = gifts.filter(gift => {
    if (searchQuery) {
      return gift.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             gift.description.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const handlePurchase = (gift) => {
    if (!connected) {
      alert('Please connect your TON wallet first');
      return;
    }
    // Here you would typically handle the purchase through TON
    console.log('Purchasing gift:', gift);
  };

  return (
    <div className="marketplace-page">
      <div className="marketplace-header">
        <h1>Gift Marketplace</h1>
        <div className="marketplace-controls">
          <input
            type="text"
            placeholder="Search gifts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Gifts</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="gifts-grid">
        {filteredGifts.map(gift => (
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
              <p className="gift-description">{gift.description}</p>
              <p className="gift-seller">Seller: {gift.seller}</p>
              <div className="gift-footer">
                <p className="gift-price">{gift.price} TON</p>
                <button 
                  className="button"
                  onClick={() => handlePurchase(gift)}
                  disabled={!connected}
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Marketplace; 