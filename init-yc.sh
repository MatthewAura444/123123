#!/bin/bash

# Установка Yandex.Cloud CLI
curl -sSL https://storage.yandexcloud.net/yandexcloud-yc/install.sh | bash

# Инициализация профиля
yc init

# Создание сети
yc vpc network create --name gift-network

# Создание подсети
yc vpc subnet create \
  --name gift-subnet \
  --network-name gift-network \
  --zone ru-central1-a \
  --range 10.1.2.0/24

# Создание группы безопасности
yc vpc security-group create \
  --name gift-security-group \
  --network-name gift-network \
  --rule direction=ingress,port=22,protocol=tcp,v4-cidrs=0.0.0.0/0 \
  --rule direction=ingress,port=3000,protocol=tcp,v4-cidrs=0.0.0.0/0 \
  --rule direction=egress,protocol=any,v4-cidrs=0.0.0.0/0

# Создание виртуальной машины
yc compute instance create \
  --name gift-server \
  --zone ru-central1-a \
  --network-interface subnet-name=gift-subnet,nat-ip-version=ipv4 \
  --security-group-ids gift-security-group \
  --ssh-key ~/.ssh/id_rsa.pub \
  --create-boot-disk image-folder-id=standard-images,image-family=ubuntu-22-04-lts,size=20 \
  --memory 2GB \
  --cores 2 \
  --platform standard-v2 