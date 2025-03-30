module.exports = {
  apps: [
    {
      name: 'telegram-gifts-api',
      script: 'src/index.js',
      instances: process.env.NODE_ENV === 'production' ? 'max' : 1,
      exec_mode: process.env.NODE_ENV === 'production' ? 'cluster' : 'fork',
      watch: process.env.NODE_ENV !== 'production',
      ignore_watch: ['node_modules', 'logs', 'coverage'],
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        WS_PORT: 8080
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        WS_PORT: 8080,
        max_memory_restart: '2G'
      },
      error_file: 'logs/err.log',
      out_file: 'logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      time: true
    },
    {
      name: 'telegram-gifts-worker',
      script: 'src/workers/index.js',
      instances: process.env.NODE_ENV === 'production' ? 2 : 1,
      exec_mode: process.env.NODE_ENV === 'production' ? 'cluster' : 'fork',
      watch: process.env.NODE_ENV !== 'production',
      ignore_watch: ['node_modules', 'logs'],
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production',
        max_memory_restart: '2G'
      },
      error_file: 'logs/worker-err.log',
      out_file: 'logs/worker-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      time: true
    }
  ]
}; 