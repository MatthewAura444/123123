# Этап сборки
FROM node:16-alpine AS builder

WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Этап выполнения
FROM node:16-alpine

WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем только production зависимости
RUN npm ci --only=production

# Копируем собранное приложение
COPY --from=builder /app/dist ./dist

# Копируем конфигурационные файлы
COPY --from=builder /app/src/config ./src/config

# Создаем пользователя для безопасности
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Открываем порты
EXPOSE 3000
EXPOSE 8080

# Запускаем приложение
CMD ["node", "dist/index.js"] 