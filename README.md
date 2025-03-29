# HLS Player для Telegram-iOS

HLS плеер, реализованный на Swift для интеграции с Telegram iOS. Поддерживает воспроизведение HLS потоков с адаптивным качеством, аудио дорожками и субтитрами.

## О конкурсе

Этот проект создан для участия в конкурсе Telegram iOS 2024:
- Призовой фонд: 50 000 долларов США
- Крайний срок: 23:59 25 октября (по дубайскому времени)
- Результаты: ноябрь 2024 г.

### Требования конкурса
- Замена AVPlayer в Telegram-iOS
- Поддержка HLS для аудио и видео
- Автоматическое и ручное переключение качества
- Запрет на использование веб-представлений
- Использование hls.js как справочного материала
- Поддержка iOS 12 - iOS 18

## Возможности

- Поддержка HLS (HTTP Live Streaming)
- Адаптивное качество видео
- Поддержка аудио дорожек
- Поддержка субтитров
- Управление буфером
- Мониторинг сети
- Шифрование (AES-128)
- Логирование
- Интеграция с AsyncDisplayKit
- Поддержка iOS 12+

## Требования

- iOS 12.0+
- Xcode 12.0+
- Swift 5.0+
- AsyncDisplayKit
- AVFoundation
- Network.framework

## Установка

1. Добавьте файл `HLSPlayer.swift` в ваш проект
2. Убедитесь, что все необходимые зависимости подключены
3. Импортируйте модуль в нужные файлы:

```swift
import Foundation
import AVFoundation
import Network
import AsyncDisplayKit
```

## Интеграция с Telegram-iOS

### 1. Замена существующего HLSVideoContent

```swift
// В файле HLSVideoContent.swift
final class HLSVideoContent: VideoContent {
    private let player: HLSPlayer
    private let videoNode: ASVideoNode
    
    init(url: URL) {
        self.player = HLSPlayer()
        self.videoNode = ASVideoNode()
        
        setupVideoNode()
        player.loadSource(url)
    }
    
    // ... остальной код ...
}
```

### 2. Настройка зависимостей

В `Package.swift` добавьте:

```swift
dependencies: [
    .package(url: "https://github.com/TelegramMessenger/AsyncDisplayKit.git", from: "3.0.0")
]
```

### 3. Тестирование

Для тестирования можно использовать HLS потоки из канала @hls_samples:
- Тестовые потоки с разным качеством
- Потоки с аудио дорожками
- Потоки с субтитрами
- Шифрованные потоки

## Использование

### Базовое использование

```swift
// Создание плеера
let player = HLSPlayer()

// Загрузка источника
let url = URL(string: "https://example.com/stream.m3u8")!
player.loadSource(url)

// Управление воспроизведением
player.play()
player.pause()
player.seek(to: 30.0) // Перемотка на 30 секунд

// Управление качеством
player.setQuality(1) // Переключение на второй уровень качества
```

### Интеграция с AsyncDisplayKit

```swift
// Создание видео контента
let videoContent = HLSVideoContent(url: streamURL)

// Создание видео ноды
let videoNode = ASVideoNode()

// Прикрепление контента к ноде
videoContent.attach(videoNode)

// Управление воспроизведением
videoContent.play()
videoContent.pause()
videoContent.seek(to: 30.0)
videoContent.setVolume(0.5)
```

## Тестовые сценарии

### 1. Переключение качества
```swift
// Автоматическое переключение
player.networkController.startMonitoring()

// Ручное переключение
player.setQuality(2) // Переключение на третий уровень качества
```

### 2. Аудио дорожки
```swift
// Получение доступных дорожек
let tracks = player.audioTrackController.tracks

// Переключение дорожки
player.audioTrackController.setCurrentTrack(1)
```

### 3. Субтитры
```swift
// Получение доступных субтитров
let subtitles = player.subtitleController.tracks

// Переключение субтитров
player.subtitleController.setCurrentTrack(0)
```

### 4. Обработка ошибок
```swift
// Логирование ошибок
player.errorController.addError(.networkError("Connection lost"))

// Очистка ошибок
player.errorController.clear()
```

## Архитектура

Плеер состоит из следующих основных компонентов:

### Контроллеры

- `HLSParser` - парсинг HLS плейлистов
- `NetworkController` - мониторинг сети
- `BufferController` - управление буфером
- `SegmentController` - управление сегментами
- `KeyController` - управление ключами шифрования
- `AudioTrackController` - управление аудио дорожками
- `SubtitleController` - управление субтитрами
- `ErrorController` - обработка ошибок
- `PlayerStateController` - управление состоянием плеера

### Модели

- `HLSStream` - информация о потоке
- `HLSSegment` - информация о сегменте
- `HLSKey` - информация о ключе шифрования
- `HLSMap` - информация о карте сегмента
- `HLSTrack` - информация о дорожке (аудио/субтитры)

## Логирование

Плеер использует системный логгер iOS (`os.log`). Логи можно просматривать в Console.app или через Xcode Console.

## Обработка ошибок

Все ошибки обрабатываются через `ErrorController` и логируются. Основные типы ошибок:

- `invalidURL` - неверный URL
- `networkError` - ошибки сети
- `parseError` - ошибки парсинга
- `bufferError` - ошибки буфера
- `playbackError` - ошибки воспроизведения
- `keyError` - ошибки ключей
- `segmentError` - ошибки сегментов

## Тестирование производительности

Для тестирования производительности рекомендуется:

1. Проверить потребление памяти
2. Измерить время загрузки сегментов
3. Проверить плавность переключения качества
4. Протестировать работу в условиях слабой сети
5. Проверить стабильность воспроизведения

## Лицензия

MIT License 