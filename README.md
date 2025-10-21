# RTSP to WebRTC Viewer

Проект для просмотра RTSP потоков через WebRTC в браузере с поддержкой TURN сервера.

## 🚀 Возможности

- ✅ Конвертация RTSP потоков в WebRTC
- ✅ Встроенный TURN сервер (Coturn) для работы через NAT
- ✅ Современный Angular интерфейс с настройками через веб-форму
- ✅ Динамическая настройка камеры и TURN сервера без редактирования конфигов
- ✅ Docker Compose для простого развертывания
- ✅ Go2RTC для быстрой и эффективной конвертации потоков
- ✅ Поддержка нескольких способов настройки (веб-интерфейс или конфиг файлы)

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

### Быстрая настройка (через веб-интерфейс)

**Ничего настраивать не нужно!** Просто запустите проект и введите параметры в веб-форме.

### Расширенная настройка (опционально)

#### 1. Статическая конфигурация RTSP потока (необязательно)

Если хотите, чтобы поток был настроен заранее, отредактируйте `config/go2rtc/go2rtc.yaml`:

```yaml
streams:
  camera1:
    - rtsp://admin:password@192.168.1.100:554/stream1
```

#### 2. Настройка TURN сервера для публичного доступа (необязательно)

**Для локального тестирования** (вы и брат в одной сети) - **пропустите этот шаг**.

**Для удаленного доступа через интернет:**

Отредактируйте `config/coturn/turnserver.conf`:

```conf
# Измените креденшиалы для безопасности
user=turnuser:turnpassword

# ВАЖНО: Укажите ваш публичный IP адрес
external-ip=YOUR_PUBLIC_IP
```

- Получите статический публичный IP
- Настройте порт-форвардинг на роутере:
  - UDP/TCP 3480 (STUN/TURN)
  - UDP 49152-49200 (TURN relay)
- Замените `YOUR_PUBLIC_IP` на ваш публичный IP

## 🚀 Запуск проекта

### Простой способ (рекомендуется)

```bash
./deploy.sh
```

Скрипт автоматически:
- Установит зависимости
- Соберет Angular приложение
- Запустит все Docker контейнеры

### Ручной способ

#### Шаг 1: Сборка Angular приложения

```bash
cd frontend
npm install
npm run build
cd ..
```

Это создаст продакшн билд в `frontend/dist/rtsp-webrtc-viewer/browser/`

#### Шаг 2: Запуск Docker контейнеров

```bash
docker-compose up -d
```

Или для просмотра логов:

```bash
docker-compose up
```

#### Шаг 3: Проверка статуса

```bash
docker-compose ps
```

Все контейнеры должны быть в состоянии "Up".

## 🌐 Доступ к интерфейсам

- **Angular UI**: http://localhost:8080
- **Go2RTC Web UI**: http://localhost:1984
- **TURN Server**: localhost:3480 (UDP/TCP)

## 📝 Использование

### Вариант 1: Настройка через веб-интерфейс (рекомендуется)

1. Откройте http://localhost:8080 в браузере
2. В форме настроек введите:
   - **RTSP URL камеры**: `rtsp://логин:пароль@IP_камеры:554/путь`
   - **TURN сервер**: `localhost:3480` (или IP вашего сервера)
   - **TURN логин/пароль**: `turnuser` / `turnpassword` (если не меняли)
3. Нажмите кнопку **"Подключить"**
4. Видео поток должен начать воспроизводиться

**Пример RTSP URL:**
```
rtsp://Vu5RqXpP:5K5mjQfVt4HUDsrK@192.168.0.138:554/live/ch0
```

### Вариант 2: Настройка через конфиг файл

Если предпочитаете статическую конфигурацию, отредактируйте `config/go2rtc/go2rtc.yaml`:

```yaml
streams:
  camera1:
    - rtsp://admin:password@192.168.1.100:554/stream1
```

После этого просто откройте http://localhost:8080 и нажмите "Подключить".

### Для просмотра с другого устройства (брат-сабскрайбер):

1. Узнайте ваш локальный IP: `ip addr show` (Linux) или `ipconfig` (Windows)
2. Откройте `http://YOUR_LOCAL_IP:8080` на другом устройстве
3. Введите те же настройки RTSP и TURN
4. Нажмите **"Подключить"**

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
