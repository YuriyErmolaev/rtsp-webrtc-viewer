# RTSP to WebRTC Viewer

Проект для просмотра RTSP потоков через WebRTC в браузере с поддержкой TURN сервера.

## 🚀 Возможности

- ✅ Конвертация RTSP потоков в WebRTC
- ✅ Встроенный TURN сервер (Coturn) для работы через NAT
- ✅ Современный Angular интерфейс
- ✅ Docker Compose для простого развертывания
- ✅ Go2RTC для быстрой и эффективной конвертации потоков

## 📋 Требования

- Docker и Docker Compose
- RTSP камера или источник потока
- Node.js 18+ (для разработки Angular приложения)

## 🏗️ Структура проекта

```
rtsp-webrtc-viewer/
├── config/
│   ├── go2rtc/
│   │   └── go2rtc.yaml          # Конфигурация Go2RTC
│   ├── coturn/
│   │   └── turnserver.conf      # Конфигурация Coturn TURN сервера
│   └── nginx/
│       └── nginx.conf           # Конфигурация Nginx
├── frontend/                    # Angular приложение
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   └── video-player/  # Компонент видеоплеера
│   │   │   └── services/
│   │   │       └── webrtc.ts      # WebRTC сервис
│   │   └── ...
│   └── ...
├── docker-compose.yml
└── README.md
```

## ⚙️ Настройка

### 1. Настройка RTSP источника

Отредактируйте `config/go2rtc/go2rtc.yaml`:

```yaml
streams:
  camera1:
    - rtsp://admin:password@192.168.1.100:554/stream1
```

Замените URL на адрес вашей камеры:
- `admin:password` - логин и пароль камеры
- `192.168.1.100` - IP адрес камеры
- `554` - порт RTSP (обычно 554)
- `/stream1` - путь к потоку (зависит от модели камеры)

### 2. Настройка TURN сервера

Отредактируйте `config/coturn/turnserver.conf`:

```conf
# Измените креденшиалы для безопасности
user=turnuser:turnpassword

# ВАЖНО: Укажите ваш публичный IP адрес
external-ip=YOUR_PUBLIC_IP
```

**Для локального тестирования:**
```conf
external-ip=192.168.1.X  # Ваш локальный IP
allow-loopback-peers
```

**Для продакшена:**
- Получите статический публичный IP
- Настройте порт-форвардинг на роутере:
  - UDP/TCP 3478 (STUN/TURN)
  - UDP 49152-49200 (TURN relay)
- Замените `YOUR_PUBLIC_IP` на ваш публичный IP

### 3. Обновите TURN настройки в Angular

Отредактируйте `frontend/src/app/services/webrtc.ts`:

```typescript
private iceServers: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  {
    urls: [
      'turn:YOUR_PUBLIC_IP:3478?transport=udp',
      'turn:YOUR_PUBLIC_IP:3478?transport=tcp'
    ],
    username: 'turnuser',
    credential: 'turnpassword'
  }
];
```

## 🚀 Запуск проекта

### Шаг 1: Сборка Angular приложения

```bash
cd frontend
npm install
npm run build
```

Это создаст продакшн билд в `frontend/dist/rtsp-webrtc-viewer/browser/`

### Шаг 2: Запуск Docker контейнеров

```bash
# Из корневой директории проекта
docker-compose up -d
```

Или для просмотра логов:

```bash
docker-compose up
```

### Шаг 3: Проверка статуса

```bash
docker-compose ps
```

Все контейнеры должны быть в состоянии "Up".

## 🌐 Доступ к интерфейсам

- **Angular UI**: http://localhost:8080
- **Go2RTC Web UI**: http://localhost:1984
- **TURN Server**: localhost:3478 (UDP/TCP)

## 📝 Использование

1. Откройте http://localhost:8080 в браузере
2. Нажмите кнопку **"Подключить"**
3. Видео поток должен начать воспроизводиться

### Для просмотра с другого устройства (брат-сабскрайбер):

1. Узнайте ваш локальный IP: `ip addr show` (Linux) или `ipconfig` (Windows)
2. Откройте `http://YOUR_LOCAL_IP:8080` на другом устройстве
3. Нажмите **"Подключить"**

## 🔧 Отладка

### Проверка логов Docker контейнеров:

```bash
# Все контейнеры
docker-compose logs

# Конкретный контейнер
docker-compose logs go2rtc
docker-compose logs coturn
docker-compose logs nginx-frontend
```

### Проверка подключения к камере:

Откройте Go2RTC Web UI: http://localhost:1984

Здесь вы увидите статус потоков и сможете протестировать их напрямую.

### Проверка WebRTC подключения:

Откройте Developer Tools (F12) в браузере → Console tab.
Вы должны увидеть логи:
```
Received remote track: video
ICE connection state: connected
Connection state: connected
WebRTC connection established
```

### Типичные проблемы:

**1. Видео не загружается:**
- Проверьте RTSP URL в `config/go2rtc/go2rtc.yaml`
- Проверьте логи Go2RTC: `docker-compose logs go2rtc`
- Убедитесь что камера доступна: `ffprobe rtsp://your-camera-url`

**2. Подключение не работает через NAT:**
- Проверьте настройки TURN сервера
- Убедитесь что `external-ip` указан правильно
- Проверьте порт-форвардинг на роутере

**3. Angular приложение не загружается:**
- Убедитесь что выполнена сборка: `npm run build` в папке frontend
- Проверьте что файлы существуют: `ls frontend/dist/rtsp-webrtc-viewer/browser/`
- Проверьте логи nginx: `docker-compose logs nginx-frontend`

## 📱 Разработка

### Запуск Angular в режиме разработки:

```bash
cd frontend
npm start
```

Приложение будет доступно на http://localhost:4200

Не забудьте обновить `apiUrl` в компоненте для локальной разработки:

```typescript
<app-video-player
  streamName="camera1"
  apiUrl="http://localhost:1984"
></app-video-player>
```

## 🔒 Безопасность

⚠️ **Для продакшена обязательно:**

1. Смените креденшиалы TURN сервера в `turnserver.conf`
2. Используйте HTTPS/TLS для web интерфейса
3. Настройте файрволл для ограничения доступа
4. Используйте authentication secret вместо статичных паролей для TURN

## 📚 Полезные ссылки

- [Go2RTC Documentation](https://github.com/AlexxIT/go2rtc)
- [Coturn Documentation](https://github.com/coturn/coturn)
- [Angular WebRTC](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [TURN Server Guide](https://www.html5rocks.com/en/tutorials/webrtc/infrastructure/)

## 📄 Лицензия

MIT

## 🤝 Поддержка

При возникновении проблем, проверьте:
1. Логи Docker контейнеров
2. Developer Console в браузере
3. Настройки файрволла и роутера

---

**Автор:** Created with Claude Code
**Дата:** 2025
