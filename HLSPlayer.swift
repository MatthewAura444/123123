import Foundation
import AVFoundation
import Network
import os.log

// MARK: - Models

enum HLSPlayerState {
    case idle
    case loading
    case ready
    case playing
    case paused
    case buffering
    case error
    case destroyed
}

enum HLSError: Error {
    case invalidURL
    case networkError(String)
    case parseError(String)
    case bufferError(String)
    case playbackError(String)
    case keyError(String)
    case segmentError(String)
    case unknown(String)
    
    var localizedDescription: String {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .networkError(let message):
            return "Network Error: \(message)"
        case .parseError(let message):
            return "Parse Error: \(message)"
        case .bufferError(let message):
            return "Buffer Error: \(message)"
        case .playbackError(let message):
            return "Playback Error: \(message)"
        case .keyError(let message):
            return "Key Error: \(message)"
        case .segmentError(let message):
            return "Segment Error: \(message)"
        case .unknown(let message):
            return "Unknown Error: \(message)"
        }
    }
}

struct HLSStream {
    let url: URL
    let bandwidth: Int
    let resolution: CGSize?
    let codecs: String?
    let audio: String?
    let subtitles: String?
}

struct HLSSegment {
    let url: URL
    let duration: Double
    let sequence: Int
    let discontinuity: Bool
    let key: HLSKey?
    let map: HLSMap?
}

struct HLSKey {
    let method: String
    let uri: URL
    let iv: Data?
    let keyFormat: String?
    let keyFormatVersions: String?
}

struct HLSMap {
    let uri: URL
    let byteRange: String?
}

struct HLSTrack {
    let url: URL
    let language: String
    let name: String
    let isDefault: Bool
    let isForced: Bool
}

// MARK: - Logger

class Logger {
    private let log: OSLog
    private let isEnabled: Bool
    
    init(subsystem: String = "com.hls.player", category: String = "HLSPlayer", isEnabled: Bool = true) {
        self.log = OSLog(subsystem: subsystem, category: category)
        self.isEnabled = isEnabled
    }
    
    func debug(_ message: String, file: String = #file, function: String = #function, line: Int = #line) {
        log(message, level: .debug, file: file, function: function, line: line)
    }
    
    func info(_ message: String, file: String = #file, function: String = #function, line: Int = #line) {
        log(message, level: .info, file: file, function: function, line: line)
    }
    
    func warning(_ message: String, file: String = #file, function: String = #function, line: Int = #line) {
        log(message, level: .warning, file: file, function: function, line: line)
    }
    
    func error(_ message: String, file: String = #file, function: String = #function, line: Int = #line) {
        log(message, level: .error, file: file, function: function, line: line)
    }
    
    private func log(_ message: String, level: OSLogType, file: String, function: String, line: Int) {
        guard isEnabled else { return }
        let fileName = (file as NSString).lastPathComponent
        let logMessage = "[\(fileName):\(line)] \(function): \(message)"
        os_log("%{public}@", log: log, type: level, logMessage)
    }
}

// MARK: - HLSParser

class HLSParser {
    private let logger: Logger
    private var masterPlaylist: String?
    private var mediaPlaylist: String?
    
    init(logger: Logger) {
        self.logger = logger
    }
    
    func parseMasterPlaylist(_ data: Data) throws -> [HLSStream] {
        guard let content = String(data: data, encoding: .utf8) else {
            throw HLSError.parseError("Invalid master playlist data")
        }
        
        masterPlaylist = content
        var streams: [HLSStream] = []
        let lines = content.components(separatedBy: .newlines)
        
        var currentStream: (url: URL?, bandwidth: Int?, resolution: CGSize?, codecs: String?, audio: String?, subtitles: String?)? = nil
        
        for line in lines {
            if line.hasPrefix("#EXT-X-STREAM-INF:") {
                if let stream = currentStream, let url = stream.url {
                    streams.append(HLSStream(
                        url: url,
                        bandwidth: stream.bandwidth ?? 0,
                        resolution: stream.resolution,
                        codecs: stream.codecs,
                        audio: stream.audio,
                        subtitles: stream.subtitles
                    ))
                }
                
                currentStream = parseStreamInfo(line)
            } else if line.hasPrefix("http") {
                currentStream?.url = URL(string: line)
            }
        }
        
        if let stream = currentStream, let url = stream.url {
            streams.append(HLSStream(
                url: url,
                bandwidth: stream.bandwidth ?? 0,
                resolution: stream.resolution,
                codecs: stream.codecs,
                audio: stream.audio,
                subtitles: stream.subtitles
            ))
        }
        
        return streams
    }
    
    func parseMediaPlaylist(_ data: Data) throws -> [HLSSegment] {
        guard let content = String(data: data, encoding: .utf8) else {
            throw HLSError.parseError("Invalid media playlist data")
        }
        
        mediaPlaylist = content
        var segments: [HLSSegment] = []
        let lines = content.components(separatedBy: .newlines)
        
        var currentSegment: (url: URL?, duration: Double?, sequence: Int?, discontinuity: Bool, key: HLSKey?, map: HLSMap?)? = nil
        var sequence = 0
        
        for line in lines {
            if line.hasPrefix("#EXTINF:") {
                let duration = parseDuration(line)
                currentSegment = (nil, duration, sequence, false, nil, nil)
            } else if line.hasPrefix("#EXT-X-KEY:") {
                currentSegment?.key = parseKey(line)
            } else if line.hasPrefix("#EXT-X-MAP:") {
                currentSegment?.map = parseMap(line)
            } else if line.hasPrefix("#EXT-X-DISCONTINUITY") {
                currentSegment?.discontinuity = true
            } else if line.hasPrefix("http") {
                if let segment = currentSegment, let url = URL(string: line) {
                    segments.append(HLSSegment(
                        url: url,
                        duration: segment.duration ?? 0,
                        sequence: segment.sequence ?? sequence,
                        discontinuity: segment.discontinuity,
                        key: segment.key,
                        map: segment.map
                    ))
                    sequence += 1
                }
            }
        }
        
        return segments
    }
    
    private func parseStreamInfo(_ line: String) -> (url: URL?, bandwidth: Int?, resolution: CGSize?, codecs: String?, audio: String?, subtitles: String?) {
        var bandwidth: Int?
        var resolution: CGSize?
        var codecs: String?
        var audio: String?
        var subtitles: String?
        
        let attributes = line.replacingOccurrences(of: "#EXT-X-STREAM-INF:", with: "")
            .components(separatedBy: ",")
        
        for attribute in attributes {
            let parts = attribute.components(separatedBy: "=")
            guard parts.count == 2 else { continue }
            
            let key = parts[0].trimmingCharacters(in: .whitespaces)
            let value = parts[1].trimmingCharacters(in: .whitespaces)
            
            switch key {
            case "BANDWIDTH":
                bandwidth = Int(value)
            case "RESOLUTION":
                let dimensions = value.components(separatedBy: "x")
                if dimensions.count == 2,
                   let width = Int(dimensions[0]),
                   let height = Int(dimensions[1]) {
                    resolution = CGSize(width: width, height: height)
                }
            case "CODECS":
                codecs = value
            case "AUDIO":
                audio = value
            case "SUBTITLES":
                subtitles = value
            default:
                break
            }
        }
        
        return (nil, bandwidth, resolution, codecs, audio, subtitles)
    }
    
    private func parseDuration(_ line: String) -> Double? {
        let duration = line.replacingOccurrences(of: "#EXTINF:", with: "")
            .components(separatedBy: ",")[0]
        return Double(duration)
    }
    
    private func parseKey(_ line: String) -> HLSKey? {
        var method: String?
        var uri: URL?
        var iv: Data?
        var keyFormat: String?
        var keyFormatVersions: String?
        
        let attributes = line.replacingOccurrences(of: "#EXT-X-KEY:", with: "")
            .components(separatedBy: ",")
        
        for attribute in attributes {
            let parts = attribute.components(separatedBy: "=")
            guard parts.count == 2 else { continue }
            
            let key = parts[0].trimmingCharacters(in: .whitespaces)
            let value = parts[1].trimmingCharacters(in: .whitespaces)
            
            switch key {
            case "METHOD":
                method = value
            case "URI":
                uri = URL(string: value)
            case "IV":
                iv = Data(hex: value)
            case "KEYFORMAT":
                keyFormat = value
            case "KEYFORMATVERSIONS":
                keyFormatVersions = value
            default:
                break
            }
        }
        
        guard let method = method, let uri = uri else { return nil }
        return HLSKey(method: method, uri: uri, iv: iv, keyFormat: keyFormat, keyFormatVersions: keyFormatVersions)
    }
    
    private func parseMap(_ line: String) -> HLSMap? {
        var uri: URL?
        var byteRange: String?
        
        let attributes = line.replacingOccurrences(of: "#EXT-X-MAP:", with: "")
            .components(separatedBy: ",")
        
        for attribute in attributes {
            let parts = attribute.components(separatedBy: "=")
            guard parts.count == 2 else { continue }
            
            let key = parts[0].trimmingCharacters(in: .whitespaces)
            let value = parts[1].trimmingCharacters(in: .whitespaces)
            
            switch key {
            case "URI":
                uri = URL(string: value)
            case "BYTERANGE":
                byteRange = value
            default:
                break
            }
        }
        
        guard let uri = uri else { return nil }
        return HLSMap(uri: uri, byteRange: byteRange)
    }
}

// MARK: - NetworkController

class NetworkController {
    private let queue = DispatchQueue(label: "com.hls.networkController")
    private let monitor: NWPathMonitor
    private var currentPath: NWPath?
    private var isDestroyed = false
    
    private let logger: Logger
    
    init(logger: Logger) {
        self.logger = logger
        if #available(iOS 12.0, *) {
            self.monitor = NWPathMonitor()
            setupNetworkMonitoring()
        } else {
            // Для iOS 11 и ниже используем Reachability
            self.monitor = NWPathMonitor()
            setupLegacyNetworkMonitoring()
        }
    }
    
    func startMonitoring() {
        queue.async { [weak self] in
            guard let self = self else { return }
            if #available(iOS 12.0, *) {
                self.monitor.start(queue: self.queue)
            } else {
                self.startLegacyMonitoring()
            }
        }
    }
    
    func stopMonitoring() {
        queue.async { [weak self] in
            guard let self = self else { return }
            if #available(iOS 12.0, *) {
                self.monitor.cancel()
            } else {
                self.stopLegacyMonitoring()
            }
        }
    }
    
    func destroy() {
        queue.async { [weak self] in
            guard let self = self else { return }
            self.isDestroyed = true
            self.stopMonitoring()
        }
    }
    
    private func setupNetworkMonitoring() {
        if #available(iOS 12.0, *) {
            monitor.pathUpdateHandler = { [weak self] path in
                guard let self = self else { return }
                
                guard !self.isDestroyed else { return }
                
                self.currentPath = path
                self.logNetworkStatus()
            }
        }
    }
    
    private func setupLegacyNetworkMonitoring() {
        // Для iOS 11 и ниже используем Reachability
        // Здесь можно добавить код для работы с Reachability
    }
    
    private func startLegacyMonitoring() {
        // Запуск мониторинга для iOS 11 и ниже
    }
    
    private func stopLegacyMonitoring() {
        // Остановка мониторинга для iOS 11 и ниже
    }
    
    private func logNetworkStatus() {
        guard let path = currentPath else { return }
        
        let status = """
        Network Status:
        - Available: \(path.status == .satisfied)
        - Type: \(path.type)
        - Interface: \(path.availableInterfaces.map { $0.type.description }.joined(separator: ", "))
        - Timestamp: \(Date())
        """
        
        logger.debug(status)
    }
}

// MARK: - BufferController

class BufferController {
    private let queue = DispatchQueue(label: "com.hls.bufferController")
    private var buffer: [Data] = []
    private var currentSize: Int = 0
    private let maxSize: Int
    private var isDestroyed = false
    
    private let logger: Logger
    
    init(maxSize: Int = 30 * 1024 * 1024, logger: Logger) {
        self.maxSize = maxSize
        self.logger = logger
    }
    
    func append(_ data: Data) {
        queue.async { [weak self] in
            guard let self = self else { return }
            
            guard !self.isDestroyed else { return }
            
            self.buffer.append(data)
            self.currentSize += data.count
            
            if self.currentSize > self.maxSize {
                self.removeOldestData()
            }
            
            self.logBufferStatus()
        }
    }
    
    func read(length: Int) -> Data? {
        var result: Data?
        
        queue.sync { [weak self] in
            guard let self = self else { return }
            
            guard !self.isDestroyed else { return }
            
            var remainingLength = length
            var resultData = Data()
            
            while remainingLength > 0, !self.buffer.isEmpty {
                let chunk = self.buffer[0]
                if chunk.count <= remainingLength {
                    resultData.append(chunk)
                    self.currentSize -= chunk.count
                    self.buffer.removeFirst()
                    remainingLength -= chunk.count
                } else {
                    let slice = chunk.prefix(remainingLength)
                    resultData.append(slice)
                    self.buffer[0] = chunk.dropFirst(remainingLength)
                    self.currentSize -= remainingLength
                    remainingLength = 0
                }
            }
            
            if !resultData.isEmpty {
                result = resultData
            }
        }
        
        return result
    }
    
    func clear() {
        queue.async { [weak self] in
            guard let self = self else { return }
            self.buffer.removeAll()
            self.currentSize = 0
            self.logger.debug("Buffer cleared")
        }
    }
    
    func destroy() {
        queue.async { [weak self] in
            guard let self = self else { return }
            self.isDestroyed = true
            self.clear()
        }
    }
    
    private func removeOldestData() {
        while currentSize > maxSize && !buffer.isEmpty {
            let removed = buffer.removeFirst()
            currentSize -= removed.count
        }
    }
    
    private func logBufferStatus() {
        logger.debug("""
        Buffer Status:
        - Size: \(currentSize) bytes
        - Segments: \(buffer.count)
        - Max Size: \(maxSize) bytes
        - Timestamp: \(Date())
        """)
    }
}

// MARK: - SegmentController

class SegmentController {
    private let queue = DispatchQueue(label: "com.hls.segmentController")
    private var segments: [HLSSegment] = []
    private var currentIndex: Int = 0
    private var loadingSegments: Set<Int> = []
    private var loadedSegments: Set<Int> = []
    private var failedSegments: Set<Int> = []
    private var isDestroyed = false
    
    private let logger: Logger
    
    init(logger: Logger) {
        self.logger = logger
    }
    
    func addSegments(_ newSegments: [HLSSegment]) {
        queue.async { [weak self] in
            guard let self = self else { return }
            
            guard !self.isDestroyed else { return }
            
            self.segments.append(contentsOf: newSegments)
            self.logSegmentStatus()
        }
    }
    
    func loadSegment(at index: Int) async throws -> Data {
        guard index >= 0 && index < segments.count else {
            throw HLSError.segmentError("Invalid segment index")
        }
        
        return try await withCheckedThrowingContinuation { continuation in
            queue.async { [weak self] in
                guard let self = self else {
                    continuation.resume(throwing: HLSError.segmentError("Controller destroyed"))
                    return
                }
                
                guard !self.isDestroyed else {
                    continuation.resume(throwing: HLSError.segmentError("Controller destroyed"))
                    return
                }
                
                self.loadingSegments.insert(index)
                
                let segment = self.segments[index]
                let task = URLSession.shared.dataTask(with: segment.url) { data, response, error in
                    self.queue.async {
                        self.loadingSegments.remove(index)
                        
                        if let error = error {
                            self.failedSegments.insert(index)
                            continuation.resume(throwing: HLSError.segmentError(error.localizedDescription))
                            return
                        }
                        
                        guard let data = data else {
                            self.failedSegments.insert(index)
                            continuation.resume(throwing: HLSError.segmentError("No data received"))
                            return
                        }
                        
                        self.loadedSegments.insert(index)
                        continuation.resume(returning: data)
                    }
                }
                
                task.resume()
            }
        }
    }
    
    func moveToSegment(at index: Int) {
        queue.async { [weak self] in
            guard let self = self else { return }
            
            guard !self.isDestroyed else { return }
            
            guard index >= 0 && index < self.segments.count else {
                self.logger.error("Invalid segment index: \(index)")
                return
            }
            
            self.currentIndex = index
            self.logSegmentStatus()
        }
    }
    
    func clear() {
        queue.async { [weak self] in
            guard let self = self else { return }
            self.segments.removeAll()
            self.currentIndex = 0
            self.loadingSegments.removeAll()
            self.loadedSegments.removeAll()
            self.failedSegments.removeAll()
            self.logger.debug("Segments cleared")
        }
    }
    
    func destroy() {
        queue.async { [weak self] in
            guard let self = self else { return }
            self.isDestroyed = true
            self.clear()
        }
    }
    
    private func logSegmentStatus() {
        logger.debug("""
        Segment Status:
        - Total: \(segments.count)
        - Current: \(currentIndex)
        - Loading: \(loadingSegments.count)
        - Loaded: \(loadedSegments.count)
        - Failed: \(failedSegments.count)
        - Timestamp: \(Date())
        """)
    }
}

// MARK: - KeyController

class KeyController {
    private let queue = DispatchQueue(label: "com.hls.keyController")
    private var keys: [URL: HLSKey] = [:]
    private var keyData: [URL: Data] = [:]
    private var isDestroyed = false
    
    private let logger: Logger
    
    init(logger: Logger) {
        self.logger = logger
    }
    
    func loadKey(_ key: HLSKey) async throws -> Data {
        if let existingData = keyData[key.uri] {
            return existingData
        }
        
        return try await withCheckedThrowingContinuation { continuation in
            queue.async { [weak self] in
                guard let self = self else {
                    continuation.resume(throwing: HLSError.keyError("Controller destroyed"))
                    return
                }
                
                guard !self.isDestroyed else {
                    continuation.resume(throwing: HLSError.keyError("Controller destroyed"))
                    return
                }
                
                let task = URLSession.shared.dataTask(with: key.uri) { data, response, error in
                    self.queue.async {
                        if let error = error {
                            continuation.resume(throwing: HLSError.keyError(error.localizedDescription))
                            return
                        }
                        
                        guard let data = data else {
                            continuation.resume(throwing: HLSError.keyError("No data received"))
                            return
                        }
                        
                        self.keys[key.uri] = key
                        self.keyData[key.uri] = data
                        continuation.resume(returning: data)
                    }
                }
                
                task.resume()
            }
        }
    }
    
    func getKey(for uri: URL) -> HLSKey? {
        return keys[uri]
    }
    
    func getKeyData(for uri: URL) -> Data? {
        return keyData[uri]
    }
    
    func clear() {
        queue.async { [weak self] in
            guard let self = self else { return }
            self.keys.removeAll()
            self.keyData.removeAll()
            self.logger.debug("Keys cleared")
        }
    }
    
    func destroy() {
        queue.async { [weak self] in
            guard let self = self else { return }
            self.isDestroyed = true
            self.clear()
        }
    }
}

// MARK: - AudioTrackController

class AudioTrackController {
    private let queue = DispatchQueue(label: "com.hls.audioTrackController")
    private var tracks: [HLSTrack] = []
    private var currentIndex: Int = 0
    private var isDestroyed = false
    
    private let logger: Logger
    
    init(logger: Logger) {
        self.logger = logger
    }
    
    func setTracks(_ newTracks: [HLSTrack]) {
        queue.async { [weak self] in
            guard let self = self else { return }
            
            guard !self.isDestroyed else { return }
            
            self.tracks = newTracks
            
            if self.currentIndex >= newTracks.count {
                self.currentIndex = 0
            }
            
            self.logTrackStatus()
        }
    }
    
    func setCurrentTrack(_ index: Int) {
        queue.async { [weak self] in
            guard let self = self else { return }
            
            guard !self.isDestroyed else { return }
            
            guard index >= 0 && index < self.tracks.count else {
                self.logger.error("Invalid track index: \(index)")
                return
            }
            
            self.currentIndex = index
            self.logTrackStatus()
        }
    }
    
    func clear() {
        queue.async { [weak self] in
            guard let self = self else { return }
            self.tracks.removeAll()
            self.currentIndex = 0
            self.logger.debug("Audio tracks cleared")
        }
    }
    
    func destroy() {
        queue.async { [weak self] in
            guard let self = self else { return }
            self.isDestroyed = true
            self.clear()
        }
    }
    
    private func logTrackStatus() {
        logger.debug("""
        Audio Track Status:
        - Total: \(tracks.count)
        - Current: \(currentIndex)
        - Language: \(tracks[currentIndex].language)
        - Name: \(tracks[currentIndex].name)
        - Default: \(tracks[currentIndex].isDefault)
        - Forced: \(tracks[currentIndex].isForced)
        - Timestamp: \(Date())
        """)
    }
}

// MARK: - SubtitleController

class SubtitleController {
    private let queue = DispatchQueue(label: "com.hls.subtitleController")
    private var tracks: [HLSTrack] = []
    private var currentIndex: Int = 0
    private var isDestroyed = false
    
    private let logger: Logger
    
    init(logger: Logger) {
        self.logger = logger
    }
    
    func setTracks(_ newTracks: [HLSTrack]) {
        queue.async { [weak self] in
            guard let self = self else { return }
            
            guard !self.isDestroyed else { return }
            
            self.tracks = newTracks
            
            if self.currentIndex >= newTracks.count {
                self.currentIndex = 0
            }
            
            self.logTrackStatus()
        }
    }
    
    func setCurrentTrack(_ index: Int) {
        queue.async { [weak self] in
            guard let self = self else { return }
            
            guard !self.isDestroyed else { return }
            
            guard index >= 0 && index < self.tracks.count else {
                self.logger.error("Invalid track index: \(index)")
                return
            }
            
            self.currentIndex = index
            self.logTrackStatus()
        }
    }
    
    func clear() {
        queue.async { [weak self] in
            guard let self = self else { return }
            self.tracks.removeAll()
            self.currentIndex = 0
            self.logger.debug("Subtitle tracks cleared")
        }
    }
    
    func destroy() {
        queue.async { [weak self] in
            guard let self = self else { return }
            self.isDestroyed = true
            self.clear()
        }
    }
    
    private func logTrackStatus() {
        logger.debug("""
        Subtitle Track Status:
        - Total: \(tracks.count)
        - Current: \(currentIndex)
        - Language: \(tracks[currentIndex].language)
        - Name: \(tracks[currentIndex].name)
        - Default: \(tracks[currentIndex].isDefault)
        - Forced: \(tracks[currentIndex].isForced)
        - Timestamp: \(Date())
        """)
    }
}

// MARK: - ErrorController

class ErrorController {
    private let queue = DispatchQueue(label: "com.hls.errorController")
    private var errors: [HLSError] = []
    private let maxErrors: Int
    private var isDestroyed = false
    
    private let logger: Logger
    
    init(maxErrors: Int = 100, logger: Logger) {
        self.maxErrors = maxErrors
        self.logger = logger
    }
    
    func addError(_ error: HLSError) {
        queue.async { [weak self] in
            guard let self = self else { return }
            
            guard !self.isDestroyed else { return }
            
            self.errors.append(error)
            
            if self.errors.count > self.maxErrors {
                self.errors.removeFirst(self.errors.count - self.maxErrors)
            }
            
            self.logger.error("HLS Error: \(error.localizedDescription)")
            self.logErrorStatus()
        }
    }
    
    func clear() {
        queue.async { [weak self] in
            guard let self = self else { return }
            self.errors.removeAll()
            self.logger.debug("Errors cleared")
        }
    }
    
    func destroy() {
        queue.async { [weak self] in
            guard let self = self else { return }
            self.isDestroyed = true
            self.clear()
        }
    }
    
    private func logErrorStatus() {
        logger.debug("""
        Error Status:
        - Total Errors: \(errors.count)
        - Latest Error: \(errors.last?.localizedDescription ?? "none")
        - Timestamp: \(Date())
        """)
    }
}

// MARK: - PlayerStateController

class PlayerStateController {
    private let queue = DispatchQueue(label: "com.hls.playerStateController")
    private var state: HLSPlayerState = .idle
    private var isDestroyed = false
    
    private let logger: Logger
    
    init(logger: Logger) {
        self.logger = logger
    }
    
    func setState(_ newState: HLSPlayerState) {
        queue.async { [weak self] in
            guard let self = self else { return }
            
            guard !self.isDestroyed else { return }
            
            let oldState = self.state
            self.state = newState
            
            self.logger.debug("Player state changed: \(oldState) -> \(newState)")
            self.logStateChange(from: oldState, to: newState)
        }
    }
    
    func destroy() {
        queue.async { [weak self] in
            guard let self = self else { return }
            self.isDestroyed = true
            self.state = .destroyed
            self.logger.debug("Player state controller destroyed")
        }
    }
    
    private func logStateChange(from oldState: HLSPlayerState, to newState: HLSPlayerState) {
        logger.debug("""
        Player State Change:
        - From: \(oldState)
        - To: \(newState)
        - Timestamp: \(Date())
        """)
    }
}

// MARK: - HLSPlayer

class HLSPlayer {
    // MARK: - Properties
    
    private let parser: HLSParser
    private let networkController: NetworkController
    private let bufferController: BufferController
    private let segmentController: SegmentController
    private let keyController: KeyController
    private let audioTrackController: AudioTrackController
    private let subtitleController: SubtitleController
    private let errorController: ErrorController
    private let playerStateController: PlayerStateController
    
    private let logger: Logger
    
    private var video: AVPlayerItem?
    private var player: AVPlayer?
    private var masterPlaylist: [HLSStream] = []
    private var mediaPlaylist: [HLSSegment] = []
    private var currentLevel: Int = 0
    private var currentSegment: Int = 0
    private var isPlaying: Bool = false
    
    // MARK: - Public Properties
    
    var currentTime: Double {
        if #available(iOS 13.0, *) {
            return player?.currentTime().seconds ?? 0
        } else {
            return CMTimeGetSeconds(player?.currentTime() ?? .zero)
        }
    }
    
    var duration: Double {
        if #available(iOS 13.0, *) {
            return player?.currentItem?.duration.seconds ?? 0
        } else {
            return CMTimeGetSeconds(player?.currentItem?.duration ?? .zero)
        }
    }
    
    var volume: Float {
        get {
            return player?.volume ?? 0
        }
        set {
            player?.volume = newValue
        }
    }
    
    // MARK: - Initialization
    
    init(logger: Logger = Logger()) {
        self.logger = logger
        self.parser = HLSParser(logger: logger)
        self.networkController = NetworkController(logger: logger)
        self.bufferController = BufferController(logger: logger)
        self.segmentController = SegmentController(logger: logger)
        self.keyController = KeyController(logger: logger)
        self.audioTrackController = AudioTrackController(logger: logger)
        self.subtitleController = SubtitleController(logger: logger)
        self.errorController = ErrorController(logger: logger)
        self.playerStateController = PlayerStateController(logger: logger)
        
        setupPlayer()
    }
    
    // MARK: - Public Methods
    
    func loadSource(_ url: URL) {
        playerStateController.setState(.loading)
        
        if #available(iOS 13.0, *) {
            Task {
                do {
                    let data = try await URLSession.shared.data(from: url).0
                    masterPlaylist = try parser.parseMasterPlaylist(data)
                    
                    if let mediaUrl = masterPlaylist[currentLevel].url {
                        let mediaData = try await URLSession.shared.data(from: mediaUrl).0
                        mediaPlaylist = try parser.parseMediaPlaylist(mediaData)
                        segmentController.addSegments(mediaPlaylist)
                        
                        playerStateController.setState(.ready)
                    }
                } catch {
                    errorController.addError(.parseError(error.localizedDescription))
                    playerStateController.setState(.error)
                }
            }
        } else {
            let task = URLSession.shared.dataTask(with: url) { [weak self] data, response, error in
                guard let self = self else { return }
                
                if let error = error {
                    self.errorController.addError(.networkError(error.localizedDescription))
                    self.playerStateController.setState(.error)
                    return
                }
                
                guard let data = data else {
                    self.errorController.addError(.networkError("No data received"))
                    self.playerStateController.setState(.error)
                    return
                }
                
                do {
                    self.masterPlaylist = try self.parser.parseMasterPlaylist(data)
                    
                    if let mediaUrl = self.masterPlaylist[self.currentLevel].url {
                        let mediaTask = URLSession.shared.dataTask(with: mediaUrl) { [weak self] mediaData, mediaResponse, mediaError in
                            guard let self = self else { return }
                            
                            if let mediaError = mediaError {
                                self.errorController.addError(.networkError(mediaError.localizedDescription))
                                self.playerStateController.setState(.error)
                                return
                            }
                            
                            guard let mediaData = mediaData else {
                                self.errorController.addError(.networkError("No media data received"))
                                self.playerStateController.setState(.error)
                                return
                            }
                            
                            do {
                                self.mediaPlaylist = try self.parser.parseMediaPlaylist(mediaData)
                                self.segmentController.addSegments(self.mediaPlaylist)
                                self.playerStateController.setState(.ready)
                            } catch {
                                self.errorController.addError(.parseError(error.localizedDescription))
                                self.playerStateController.setState(.error)
                            }
                        }
                        mediaTask.resume()
                    }
                } catch {
                    self.errorController.addError(.parseError(error.localizedDescription))
                    self.playerStateController.setState(.error)
                }
            }
            task.resume()
        }
    }
    
    func play() {
        guard playerStateController.currentState == .ready else { return }
        
        player?.play()
        isPlaying = true
        playerStateController.setState(.playing)
    }
    
    func pause() {
        player?.pause()
        isPlaying = false
        playerStateController.setState(.paused)
    }
    
    func seek(to time: Double) {
        if #available(iOS 13.0, *) {
            player?.seek(to: CMTime(seconds: time, preferredTimescale: 600))
        } else {
            player?.seek(to: CMTime(seconds: time, preferredTimescale: 600), toleranceBefore: .zero, toleranceAfter: .zero)
        }
    }
    
    func setQuality(_ level: Int) {
        guard level >= 0 && level < masterPlaylist.count else { return }
        
        currentLevel = level
        
        if #available(iOS 13.0, *) {
            Task {
                do {
                    if let mediaUrl = masterPlaylist[currentLevel].url {
                        let mediaData = try await URLSession.shared.data(from: mediaUrl).0
                        mediaPlaylist = try parser.parseMediaPlaylist(mediaData)
                        segmentController.addSegments(mediaPlaylist)
                    }
                } catch {
                    errorController.addError(.parseError(error.localizedDescription))
                }
            }
        } else {
            let task = URLSession.shared.dataTask(with: masterPlaylist[currentLevel].url) { [weak self] data, response, error in
                guard let self = self else { return }
                
                if let error = error {
                    self.errorController.addError(.networkError(error.localizedDescription))
                    return
                }
                
                guard let data = data else {
                    self.errorController.addError(.networkError("No data received"))
                    return
                }
                
                do {
                    self.mediaPlaylist = try self.parser.parseMediaPlaylist(data)
                    self.segmentController.addSegments(self.mediaPlaylist)
                } catch {
                    self.errorController.addError(.parseError(error.localizedDescription))
                }
            }
            task.resume()
        }
    }
    
    // MARK: - Private Methods
    
    private func setupPlayer() {
        video = AVPlayerItem(asset: AVAsset())
        player = AVPlayer(playerItem: video)
        
        setupNotifications()
    }
    
    private func setupNotifications() {
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(playerItemDidFinishPlaying),
            name: .AVPlayerItemDidPlayToEndTime,
            object: video
        )
        
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(playerItemFailedToPlay),
            name: .AVPlayerItemFailedToPlayToEndTime,
            object: video
        )
    }
    
    @objc private func playerItemDidFinishPlaying() {
        isPlaying = false
        playerStateController.setState(.idle)
    }
    
    @objc private func playerItemFailedToPlay() {
        errorController.addError(.playbackError("Failed to play to end"))
        playerStateController.setState(.error)
    }
}

// MARK: - HLSVideoContent

class HLSVideoContent: VideoContent {
    // MARK: - Properties
    
    private let player: HLSPlayer
    private let videoNode: ASVideoNode
    
    // MARK: - Public Properties
    
    var duration: Double {
        return player.duration
    }
    
    var dimensions: CGSize {
        return videoNode.frame.size
    }
    
    var aspectRatio: CGFloat {
        return dimensions.width / dimensions.height
    }
    
    // MARK: - Initialization
    
    init(url: URL) {
        self.player = HLSPlayer()
        self.videoNode = ASVideoNode()
        
        setupVideoNode()
        player.loadSource(url)
    }
    
    // MARK: - Public Methods
    
    func attach(_ videoNode: ASVideoNode) {
        self.videoNode = videoNode
        setupVideoNode()
    }
    
    func detach() {
        videoNode.player = nil
    }
    
    func play() {
        player.play()
    }
    
    func pause() {
        player.pause()
    }
    
    func seek(to time: Double) {
        player.seek(to: time)
    }
    
    func setVolume(_ volume: Float) {
        player.volume = volume
    }
    
    // MARK: - Private Methods
    
    private func setupVideoNode() {
        videoNode.gravity = .resizeAspect
        videoNode.shouldAutoplay = true
        videoNode.shouldAutorepeat = true
        videoNode.player = player.player
    }
}

// MARK: - Extensions

extension Data {
    init?(hex: String) {
        let len = hex.count / 2
        var data = Data(capacity: len)
        var index = hex.startIndex
        
        for _ in 0..<len {
            let nextIndex = hex.index(index, offsetBy: 2)
            let bytes = hex[index..<nextIndex]
            var num: UInt8 = 0
            Scanner(string: String(bytes)).scanHexInt32(&num)
            data.append(num)
            index = nextIndex
        }
        
        self = data
    }
}

extension NWInterface.InterfaceType {
    var description: String {
        switch self {
        case .wifi:
            return "WiFi"
        case .cellular:
            return "Cellular"
        case .wiredEthernet:
            return "Wired Ethernet"
        case .loopback:
            return "Loopback"
        case .other:
            return "Other"
        @unknown default:
            return "Unknown"
        }
    }
} 