FROM python:3.11-slim

# Установка Node.js
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Копирование файлов зависимостей
COPY package*.json ./
COPY requirements.txt ./

# Установка зависимостей
RUN npm install
RUN pip install --no-cache-dir -r requirements.txt

# Копирование исходного кода
COPY . .

# Создание директории для загрузок
RUN mkdir -p uploads

EXPOSE 3000

# Запуск приложения
CMD ["node", "server.js"] 