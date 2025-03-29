#!/bin/bash

# Установка Docker
sudo apt-get update
sudo apt-get install -y docker.io docker-compose

# Добавление текущего пользователя в группу docker
sudo usermod -aG docker $USER

# Создание директории для проекта
mkdir -p ~/gift-app
cd ~/gift-app

# Копирование файлов проекта
cp -r /path/to/your/project/* .

# Создание .env файла
cat > .env << EOL
TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
STRIPE_PUBLISHABLE_KEY=${STRIPE_PUBLISHABLE_KEY}
EOL

# Создание директории для загрузок
mkdir -p uploads

# Запуск приложения
sudo docker-compose up -d

# Получение IP-адреса сервера
SERVER_IP=$(curl -s ifconfig.me)

# Обновление URL в bot.py
sed -i "s|YOUR_SERVER_IP|$SERVER_IP|g" bot.py

# Перезапуск контейнеров
sudo docker-compose down
sudo docker-compose up -d

echo "Приложение развернуто на IP: $SERVER_IP" 