# Полезные команды

## Быстрый запуск

```bash
# Полный деплой (сборка + запуск)
./deploy.sh

# Или вручную:
cd frontend && npm install && npm run build && cd ..
docker-compose up -d
```

## Управление контейнерами

```bash
# Запустить все контейнеры
docker-compose up -d

# Остановить все контейнеры
docker-compose down

# Перезапустить контейнеры
docker-compose restart

# Просмотр логов
docker-compose logs -f

# Просмотр логов конкретного контейнера
docker-compose logs -f go2rtc
docker-compose logs -f coturn
docker-compose logs -f nginx-frontend

# Статус контейнеров
docker-compose ps
```

## Разработка Angular

```bash
cd frontend

# Установка зависимостей
npm install

# Запуск dev сервера
npm start
# Приложение будет доступно на http://localhost:4200

# Сборка для продакшена
npm run build

# Запуск тестов
npm test

# Линтинг
npm run lint
```

## Тестирование RTSP подключения

```bash
# Проверка RTSP потока с помощью ffprobe
ffprobe rtsp://admin:password@192.168.1.100:554/stream1

# Проверка RTSP потока с помощью ffplay
ffplay rtsp://admin:password@192.168.1.100:554/stream1

# Проверка RTSP потока с помощью VLC (из командной строки)
vlc rtsp://admin:password@192.168.1.100:554/stream1
```

## Отладка

```bash
# Зайти внутрь контейнера
docker exec -it go2rtc sh
docker exec -it coturn sh
docker exec -it nginx-frontend sh

# Проверка сети Docker
docker network ls
docker network inspect rtsp-webrtc-viewer_webrtc-network

# Проверка портов
netstat -tuln | grep -E '(1984|3478|8080|8555)'

# Очистка всех Docker ресурсов (осторожно!)
docker-compose down -v
docker system prune -a
```

## Узнать свой IP адрес

```bash
# Linux
ip addr show
hostname -I

# Или через Docker
docker run --rm alpine ip addr show
```

## Мониторинг

```bash
# Использование ресурсов контейнерами
docker stats

# Проверка использования дискового пространства
docker system df
```

## Обновление

```bash
# Обновить Docker образы
docker-compose pull

# Пересобрать контейнеры
docker-compose up -d --build

# Обновить Angular зависимости
cd frontend
npm update
```

## Бэкап конфигурации

```bash
# Создать бэкап конфигурации
tar -czf backup-$(date +%Y%m%d).tar.gz config/ docker-compose.yml

# Восстановить из бэкапа
tar -xzf backup-20250101.tar.gz
```

## Проверка WebRTC подключения

Откройте в браузере:
- Chrome: `chrome://webrtc-internals/`
- Firefox: `about:webrtc`

Здесь можно увидеть детальную информацию о WebRTC подключениях, ICE кандидатах и статистику.

## Тестирование TURN сервера

```bash
# С помощью turnutils (если установлен)
turnutils_uclient -v -u turnuser -w turnpassword YOUR_IP 3478

# Или онлайн тестер:
# https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/
```

## Производительность

```bash
# Посмотреть использование ресурсов
docker stats --no-stream

# Проверить задержку потока
ffprobe -show_packets rtsp://your-camera-url 2>&1 | grep pts_time
```
