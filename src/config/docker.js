const dockerConfig = {
  version: '3.8',
  services: {
    api: {
      build: {
        context: '.',
        dockerfile: 'Dockerfile'
      },
      ports: ['3000:3000'],
      environment: {
        NODE_ENV: 'production',
        PORT: 3000,
        WS_PORT: 8080,
        MONGODB_URI: 'mongodb://mongodb:27017/telegram-gifts',
        REDIS_HOST: 'redis',
        REDIS_PORT: 6379,
        ELASTICSEARCH_NODE: 'http://elasticsearch:9200'
      },
      depends_on: ['mongodb', 'redis', 'elasticsearch'],
      volumes: ['/app/node_modules', '/app/logs'],
      restart: 'unless-stopped'
    },
    worker: {
      build: {
        context: '.',
        dockerfile: 'Dockerfile'
      },
      command: 'node src/workers/index.js',
      environment: {
        NODE_ENV: 'production',
        MONGODB_URI: 'mongodb://mongodb:27017/telegram-gifts',
        REDIS_HOST: 'redis',
        REDIS_PORT: 6379
      },
      depends_on: ['mongodb', 'redis'],
      volumes: ['/app/node_modules', '/app/logs'],
      restart: 'unless-stopped'
    },
    mongodb: {
      image: 'mongo:latest',
      ports: ['27017:27017'],
      volumes: ['mongodb_data:/data/db'],
      environment: {
        MONGO_INITDB_ROOT_USERNAME: 'admin',
        MONGO_INITDB_ROOT_PASSWORD: 'password'
      },
      restart: 'unless-stopped'
    },
    redis: {
      image: 'redis:latest',
      ports: ['6379:6379'],
      volumes: ['redis_data:/data'],
      command: 'redis-server --appendonly yes',
      restart: 'unless-stopped'
    },
    elasticsearch: {
      image: 'elasticsearch:7.17.0',
      ports: ['9200:9200'],
      environment: {
        discovery.type: 'single-node',
        'ES_JAVA_OPTS': '-Xms512m -Xmx512m'
      },
      volumes: ['elasticsearch_data:/usr/share/elasticsearch/data'],
      restart: 'unless-stopped'
    },
    nginx: {
      image: 'nginx:latest',
      ports: ['80:80', '443:443'],
      volumes: [
        './nginx/conf.d:/etc/nginx/conf.d',
        './nginx/ssl:/etc/nginx/ssl'
      ],
      depends_on: ['api'],
      restart: 'unless-stopped'
    }
  },
  volumes: {
    mongodb_data: {},
    redis_data: {},
    elasticsearch_data: {}
  }
};

module.exports = dockerConfig; 