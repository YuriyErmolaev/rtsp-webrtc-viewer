# Примеры настроек

## Ваша камера (из запроса)

### RTSP URL:
```
rtsp://Vu5RqXpP:5K5mjQfVt4HUDsrK@192.168.0.138:554/live/ch0
```

### Разбор URL:
- **Логин**: `Vu5RqXpP`
- **Пароль**: `5K5mjQfVt4HUDsrK`
- **IP камеры**: `192.168.0.138`
- **Порт**: `554` (стандартный RTSP)
- **Путь**: `/live/ch0`

## Настройки TURN сервера

### Для локальной сети (вы и брат в одной WiFi):
- **TURN сервер**: `localhost:3480` (на вашем компьютере)
- **TURN сервер**: `192.168.0.X:3480` (для брата, где X - ваш локальный IP)
- **Логин**: `turnuser`
- **Пароль**: `turnpassword`

### Для интернета (брат далеко):
- **TURN сервер**: `YOUR_PUBLIC_IP:3480`
- **Логин**: `turnuser`
- **Пароль**: `turnpassword`
- **Требуется**: проброс портов на роутере

## Быстрый старт

1. Запустите проект:
```bash
./deploy.sh
```

2. Откройте http://localhost:8080

3. Заполните форму:
```
RTSP URL камеры:  rtsp://Vu5RqXpP:5K5mjQfVt4HUDsrK@192.168.0.138:554/live/ch0
TURN сервер:      localhost:3480
TURN Логин:       turnuser
TURN Пароль:      turnpassword
```

4. Нажмите "Подключить"

## Для брата

Брат должен открыть: `http://ВАШ_IP:8080` (узнайте ваш IP: `ip addr show`)

И ввести:
```
RTSP URL камеры:  rtsp://Vu5RqXpP:5K5mjQfVt4HUDsrK@192.168.0.138:554/live/ch0
TURN сервер:      ВАШ_IP:3480
TURN Логин:       turnuser
TURN Пароль:      turnpassword
```

## Типичные пути RTSP для разных камер

Если `/live/ch0` не работает, попробуйте:

### Hikvision:
- `/Streaming/Channels/101` (main stream)
- `/Streaming/Channels/102` (sub stream)

### Dahua:
- `/cam/realmonitor?channel=1&subtype=0` (main)
- `/cam/realmonitor?channel=1&subtype=1` (sub)

### TP-Link:
- `/stream1` (main)
- `/stream2` (sub)

### Xiaomi:
- `/live/ch00_0` (main)
- `/live/ch00_1` (sub)

### Общие варианты:
- `/live/main`
- `/live/sub`
- `/stream1`
- `/stream2`
- `/h264`
- `/video.mp4`

Формат всегда: `rtsp://логин:пароль@IP:554/путь`
