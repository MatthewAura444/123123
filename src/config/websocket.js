const WebSocket = require('ws');
const logger = require('./logger');

const wsConfig = {
  port: process.env.WS_PORT || 8080,
  path: '/ws',
  clientTracking: true,
  perMessageDeflate: {
    zlibDeflateOptions: {
      chunkSize: 1024,
      memLevel: 7,
      level: 3
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024
    },
    clientNoContextTakeover: true,
    serverNoContextTakeover: true,
    serverMaxWindowBits: 10,
    concurrencyLimit: 10,
    threshold: 1024
  },
  handleProtocols: (protocols, req) => {
    if (protocols.includes('telegram-gifts')) {
      return 'telegram-gifts';
    }
    return false;
  },
  verifyClient: (info) => {
    const token = info.req.url.split('token=')[1];
    if (!token) {
      logger.warn('WebSocket connection attempt without token');
      return false;
    }
    return true;
  }
};

module.exports = wsConfig; 