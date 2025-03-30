const { TonConnect } = require('ton-connect');

const tonConnect = new TonConnect({
  manifestUrl: process.env.TON_CONNECT_MANIFEST_URL,
  buttonRootId: 'ton-connect-button',
  apiKey: process.env.TON_CONNECT_API_KEY
});

module.exports = tonConnect; 