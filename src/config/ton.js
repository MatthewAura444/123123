const { TonConnect } = require('ton-connect');

const tonConfig = {
  manifestUrl: process.env.TON_CONNECT_MANIFEST_URL,
  buttonRootId: 'ton-connect-button',
  apiKey: process.env.TON_CONNECT_API_KEY,
  network: process.env.NODE_ENV === 'production' ? 'mainnet' : 'testnet',
  walletConnectionSource: 'telegram-gifts',
  defaultWalletAddress: process.env.DEFAULT_WALLET_ADDRESS,
  defaultAmount: process.env.DEFAULT_AMOUNT || '0.1',
  defaultComment: 'Оплата подарка в Telegram Gifts Marketplace',
  endpoints: {
    mainnet: {
      api: 'https://toncenter.com/api/v2/jsonRPC',
      explorer: 'https://tonscan.org'
    },
    testnet: {
      api: 'https://testnet.toncenter.com/api/v2/jsonRPC',
      explorer: 'https://testnet.tonscan.org'
    }
  }
};

const tonConnect = new TonConnect(tonConfig);

module.exports = {
  tonConfig,
  tonConnect
}; 