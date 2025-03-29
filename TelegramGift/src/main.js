// TelegramGift Mini App
import React from 'react';

// Gift data structure
const giftData = {
  popular: [
    { 
      id: 'p1', 
      name: 'Plush Pepe', 
      price: 4200, 
      model: 'plush-pepe.glb',
      description: 'Rare collectible Plush Pepe NFT',
      category: 'Collectibles'
    },
    {
      id: 'durov-cap',
      name: 'Кепка Дурова',
      price: '49 TON',
      model: 'durov-cap.glb',
      description: 'Эксклюзивная кепка с логотипом Telegram - идеальный подарок для фанатов платформы',
      category: 'popular'
    },
    { 
      id: 'p3', 
      name: 'Signet Ring', 
      price: 888, 
      model: 'signet-ring.glb',
      description: 'Elegant Signet Ring NFT',
      category: 'Jewelry'
    },
    { 
      id: 'p4', 
      name: 'Eternal Rose', 
      price: 510, 
      model: 'eternal-rose.glb',
      description: 'Beautiful Eternal Rose NFT',
      category: 'Flowers'
    },
    {
      id: 'p5',
      name: 'B-Day Candles',
      price: 795,
      model: 'bday-candles.glb',
      description: 'Birthday celebration candles NFT',
      category: 'Celebration'
    },
    {
      id: 'p6',
      name: 'Berry Boxes',
      price: 3367,
      model: 'berry-boxes.glb',
      description: 'Sweet berry boxes NFT collection',
      category: 'Food'
    }
  ],
  new: [
    { 
      id: 'n1', 
      name: 'Bunny Muffin', 
      price: 500, 
      model: 'bunny-muffin.glb',
      description: 'Cute Bunny Muffin NFT',
      category: 'Food'
    },
    { 
      id: 'n2', 
      name: 'Vintage Cigar', 
      price: 500, 
      model: 'vintage-cigar.glb',
      description: 'Classic Vintage Cigar NFT',
      category: 'Collectibles'
    },
    { 
      id: 'n3', 
      name: 'Crystal Ball', 
      price: 3816, 
      model: 'crystal-ball.glb',
      description: 'Mystical Crystal Ball NFT',
      category: 'Magic'
    },
    {
      id: 'n4',
      name: 'Desk Calendars',
      price: 6041,
      model: 'desk-calendars.glb',
      description: 'Digital desk calendars NFT',
      category: 'Office'
    },
    {
      id: 'n5',
      name: 'Cookie Hearts',
      price: 2397,
      model: 'cookie-hearts.glb',
      description: 'Sweet cookie hearts NFT',
      category: 'Food'
    },
    {
      id: 'n6',
      name: 'Flying Brooms',
      price: 2555,
      model: 'flying-brooms.glb',
      description: 'Magical flying brooms NFT',
      category: 'Magic'
    }
  ],
  special: [
    { 
      id: 's1', 
      name: 'Diamond Ring', 
      price: 2257, 
      model: 'diamond-ring.glb',
      description: 'Luxurious Diamond Ring NFT',
      category: 'Jewelry'
    },
    { 
      id: 's2', 
      name: 'Electric Skull', 
      price: 1, 
      model: 'electric-skull.glb',
      description: 'Rare Electric Skull NFT',
      category: 'Premium'
    },
    { 
      id: 's3', 
      name: 'Eternal Candle', 
      price: 4706, 
      model: 'eternal-candle.glb',
      description: 'Magical Eternal Candle NFT',
      category: 'Magic'
    },
    {
      id: 's4',
      name: 'Genie Lamps',
      price: 815,
      model: 'genie-lamps.glb',
      description: 'Magical genie lamps NFT',
      category: 'Magic'
    },
    {
      id: 's5',
      name: 'Ginger Cookies',
      price: 4811,
      model: 'ginger-cookies.glb',
      description: 'Festive ginger cookies NFT',
      category: 'Food'
    },
    {
      id: 's6',
      name: 'Hanging Stars',
      price: 1258,
      model: 'hanging-stars.glb',
      description: 'Beautiful hanging stars NFT',
      category: 'Decor'
    }
  ]
};

// Добавляем конфигурацию для моделей
const modelConfigs = {
  'plush-pepe': { scale: 1.0, rotation: [0, 0, 0] },
  'durov-cap': { 
    scale: 1.5, 
    rotation: [0, Math.PI / 4, -Math.PI / 12],  // Слегка наклоняем кепку для лучшего обзора
    position: [0, 0.1, 0]  // Приподнимаем немного вверх
  },
  'signet-ring': { scale: 0.8, rotation: [0, Math.PI / 4, 0] },
  'eternal-rose': { scale: 1.5, rotation: [0, 0, 0] },
  'bday-candles': { scale: 1.3, rotation: [0, 0, 0] },
  'berry-boxes': { scale: 1.1, rotation: [0, Math.PI / 6, 0] },
  'bunny-muffin': { scale: 1.4, rotation: [0, 0, 0] },
  'vintage-cigar': { scale: 0.9, rotation: [0, Math.PI / 3, 0] },
  'crystal-ball': { scale: 1.6, rotation: [0, 0, 0] },
  'desk-calendars': { scale: 1.2, rotation: [0, Math.PI / 4, 0] },
  'cookie-hearts': { scale: 1.3, rotation: [0, 0, 0] },
  'flying-brooms': { scale: 1.5, rotation: [0, Math.PI / 2, 0] },
  'diamond-ring': { scale: 0.7, rotation: [0, Math.PI / 4, 0] },
  'electric-skull': { scale: 1.4, rotation: [0, 0, 0] },
  'eternal-candle': { scale: 1.2, rotation: [0, 0, 0] },
  'genie-lamps': { scale: 1.3, rotation: [0, Math.PI / 3, 0] },
  'ginger-cookies': { scale: 1.1, rotation: [0, 0, 0] },
  'hanging-stars': { scale: 1.4, rotation: [0, Math.PI / 6, 0] },
  'test-cube': { scale: 1.0, rotation: [0, 0, 0] }
};

// Main App Component
function TelegramGift() {
  const [currentTab, setCurrentTab] = React.useState('popular');
  const [selectedGift, setSelectedGift] = React.useState(null);
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isCheckingOut, setIsCheckingOut] = React.useState(false);
  const [deliveryOption, setDeliveryOption] = React.useState('standard');
  const [giftOptions, setGiftOptions] = React.useState({
    giftWrap: false,
    giftCard: false
  });
  
  // Handle tab switching with loading animation
  const handleTabChange = (tab) => {
    if (tab !== currentTab) {
      setIsLoading(true);
      
      // Apply slide out animation before changing tab
      const giftContainer = document.querySelector('.gift-grid');
      if (giftContainer) {
        giftContainer.style.animation = 'slideOut 0.2s ease-out forwards';
      }
      
      setTimeout(() => {
        setCurrentTab(tab);
        setIsLoading(false);
        
        // Reset animation to slide in after content changes
        if (giftContainer) {
          giftContainer.style.animation = 'slideIn 0.3s ease-out forwards';
        }
      }, 300);
    }
  };
  
  // Calculate total price including options
  const calculateTotal = () => {
    if (!selectedGift) return 0;
    
    let total = selectedGift.price;
    if (deliveryOption === 'express') total += 4.99;
    if (giftOptions.giftWrap) total += 2.99;
    
    return total.toFixed(2);
  };
  
  // Handle checkout process
  const handleCheckout = () => {
    setIsCheckingOut(true);
    
    // Add a confetti effect for successful purchase
    const createConfetti = () => {
      const confettiCount = 100;
      const colors = ['#2481cc', '#5a9fdc', '#a0d1ff', '#e6f0fa'];
      
      for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.opacity = Math.random();
        confetti.style.width = Math.random() * 10 + 5 + 'px';
        confetti.style.height = Math.random() * 6 + 3 + 'px';
        confetti.style.animation = `confetti-fall ${Math.random() * 2 + 2}s linear forwards`;
        document.querySelector('.telegram-gift-app').appendChild(confetti);
        
        setTimeout(() => {
          confetti.remove();
        }, 3000);
      }
    };
    
    // Simulate API call with timeout
    setTimeout(() => {
      setIsCheckingOut(false);
      createConfetti();
      alert(`Thank you for your purchase of ${selectedGift.name}!\nTotal: $${calculateTotal()}`);
      
      // Reset cart after successful checkout with delay for confetti to show
      setTimeout(() => {
        setSelectedGift(null);
        setIsCartOpen(false);
        setDeliveryOption('standard');
        setGiftOptions({ giftWrap: false, giftCard: false });
      }, 1000);
    }, 1500);
  };

  return (
    <div className="telegram-gift-app">
      <header className="app-header">
        <div className="logo-container">
          <div className="logo">
            <span className="logo-icon">🎁</span>
          </div>
          <h1>TelegramGift</h1>
        </div>
        <p className="tagline">Perfect gifts for your friends</p>
      </header>
      
      <nav className="gift-categories">
        <button 
          className={`category-tab ${currentTab === 'popular' ? 'active' : ''}`}
          onClick={() => handleTabChange('popular')}
        >
          Popular
        </button>
        <button 
          className={`category-tab ${currentTab === 'new' ? 'active' : ''}`}
          onClick={() => handleTabChange('new')}
        >
          New
        </button>
        <button 
          className={`category-tab ${currentTab === 'special' ? 'active' : ''}`}
          onClick={() => handleTabChange('special')}
        >
          Special
        </button>
      </nav>
      
      <main className="gift-container">
        <div className="app-content" style={{ position: 'relative' }}>
          {isLoading && (
            <div className="loading-overlay">
              <div className="spinner"></div>
              <p>Loading gifts...</p>
            </div>
          )}
          
          {isCartOpen ? (
            <div className="cart-view">
              <div className="cart-header">
                <h2>Your Selected Gift</h2>
                <button className="back-button" onClick={() => setIsCartOpen(false)}>
                  ← Back
                </button>
              </div>
              
              {selectedGift ? (
                <div className="selected-gift">
                  <div className="selected-gift-model">
                    <model-viewer
                      src={`/models/${selectedGift.model}`}
                      alt={selectedGift.name}
                      camera-controls
                      auto-rotate
                      camera-orbit="45deg 55deg 2.5m"
                      environment-image="neutral"
                      shadow-intensity="1"
                      exposure="1"
                      scale="1 1 1"
                      rotation="0deg 0deg 0deg"
                      min-camera-orbit="auto auto 2.5m"
                      max-camera-orbit="auto auto 4m"
                    >
                      <div className="progress-bar hide" slot="progress-bar">
                        <div className="update-bar"></div>
                      </div>
                      <button slot="ar-button" className="ar-button">
                        View in AR
                      </button>
                    </model-viewer>
                  </div>
                  <h3>{selectedGift.name}</h3>
                  <p className="gift-category">{selectedGift.category}</p>
                  <p className="gift-description">{selectedGift.description}</p>
                  <p className="selected-gift-price">${selectedGift.price}</p>
                  
                  <div className="price-summary">
                    <div className="price-row">
                      <span>Base price:</span>
                      <span>${selectedGift.price}</span>
                    </div>
                    
                    {deliveryOption === 'express' && (
                      <div className="price-row">
                        <span>Express delivery:</span>
                        <span>$4.99</span>
                      </div>
                    )}
                    
                    {giftOptions.giftWrap && (
                      <div className="price-row">
                        <span>Gift wrap:</span>
                        <span>$2.99</span>
                      </div>
                    )}
                    
                    <div className="price-row total">
                      <span>Total:</span>
                      <span>${calculateTotal()}</span>
                    </div>
                  </div>
                  
                  <div className="delivery-options">
                    <h3>Delivery Options</h3>
                    <div className="option-group">
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="delivery"
                          value="standard"
                          checked={deliveryOption === 'standard'}
                          onChange={(e) => setDeliveryOption(e.target.value)}
                        />
                        Standard Delivery (Free)
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="delivery"
                          value="express"
                          checked={deliveryOption === 'express'}
                          onChange={(e) => setDeliveryOption(e.target.value)}
                        />
                        Express Delivery ($4.99)
                      </label>
                    </div>
                  </div>
                  
                  <div className="gift-options">
                    <h3>Additional Options</h3>
                    <div className="option-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={giftOptions.giftWrap}
                          onChange={(e) => setGiftOptions(prev => ({
                            ...prev,
                            giftWrap: e.target.checked
                          }))}
                        />
                        Gift Wrap (+$2.99)
                      </label>
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={giftOptions.giftCard}
                          onChange={(e) => setGiftOptions(prev => ({
                            ...prev,
                            giftCard: e.target.checked
                          }))}
                        />
                        Add Gift Card (Free)
                      </label>
                    </div>
                  </div>
                  
                  <button 
                    className="checkout-button"
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                  >
                    {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
                  </button>
                </div>
              ) : (
                <div className="no-gift-selected">
                  <p>Please select a gift first</p>
                </div>
              )}
            </div>
          ) : (
            <div className="gift-grid">
              {giftData[currentTab].map(gift => (
                <div 
                  key={gift.id}
                  className={`gift-card ${selectedGift?.id === gift.id ? 'selected' : ''}`}
                  onClick={() => setSelectedGift(gift)}
                >
                  <div className="gift-model">
                    <model-viewer
                      src={`/models/${gift.model}`}
                      alt={gift.name}
                      camera-controls
                      auto-rotate
                      camera-orbit="45deg 65deg 2.5m"
                      environment-image="neutral"
                      shadow-intensity="1.5"
                      exposure="1.2"
                      shadow-softness="0.7"
                      camera-target="0 0 0"
                      field-of-view="30deg"
                      min-camera-orbit="-180deg 0deg 1.5m"
                      max-camera-orbit="180deg 180deg 3m"
                      auto-rotate-delay="0"
                      rotation-per-second="30deg"
                      interaction-prompt="none"
                    >
                      <div className="progress-bar hide" slot="progress-bar">
                        <div className="update-bar"></div>
                      </div>
                    </model-viewer>
                  </div>
                  <div className="gift-info">
                    <h3>{gift.name}</h3>
                    <p className="gift-category">{gift.category}</p>
                    <p className="gift-price">${gift.price}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default TelegramGift; 