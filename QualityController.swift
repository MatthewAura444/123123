import Foundation

class QualityController {
    // MARK: - Properties
    
    private let queue = DispatchQueue(label: "com.hls.qualityController")
    private var levels: [QualityLevel] = []
    private var currentLevel: Int = 0
    private var autoLevelEnabled: Bool = true
    private var isDestroyed = false
    
    private let logger: Logger
    
    // MARK: - Public Properties
    
    var currentQualityLevel: QualityLevel? {
        return levels[safe: currentLevel]
    }
    
    var availableLevels: [QualityLevel] {
        return levels
    }
    
    var isAutoLevelEnabled: Bool {
        get {
            return autoLevelEnabled
        }
        set {
            queue.async { [weak self] in
                self?.autoLevelEnabled = newValue
            }
        }
    }
    
    // MARK: - Initialization
    
    init(logger: Logger) {
        self.logger = logger
    }
    
    // MARK: - Public Methods
    
    func setLevels(_ newLevels: [QualityLevel]) {
        queue.async { [weak self] in
            guard let self = self else { return }
            
            self.levels = newLevels.sorted { $0.bandwidth < $1.bandwidth }
            
            if self.currentLevel >= self.levels.count {
                self.currentLevel = self.levels.count - 1
            }
            
            self.logger.debug("Available quality levels: \(self.levels.count)")
        }
    }
    
    func setCurrentLevel(_ level: Int) {
        queue.async { [weak self] in
            guard let self = self else { return }
            
            guard level >= 0 && level < self.levels.count else {
                self.logger.error("Invalid quality level: \(level)")
                return
            }
            
            self.currentLevel = level
            self.logger.debug("Switched to quality level: \(level)")
        }
    }
    
    func getOptimalLevel(bandwidth: Double) -> Int {
        var optimalLevel = 0
        
        queue.sync { [weak self] in
            guard let self = self else { return }
            
            guard !self.levels.isEmpty else { return }
            
            // Находим уровень с максимальной пропускной способностью, которая меньше текущей
            for (index, level) in self.levels.enumerated() {
                if level.bandwidth <= bandwidth {
                    optimalLevel = index
                } else {
                    break
                }
            }
        }
        
        return optimalLevel
    }
    
    func clear() {
        queue.async { [weak self] in
            guard let self = self else { return }
            self.levels.removeAll()
            self.currentLevel = 0
        }
    }
    
    func destroy() {
        queue.async { [weak self] in
            guard let self = self else { return }
            self.isDestroyed = true
            self.clear()
        }
    }
    
    // MARK: - Private Methods
    
    private func logLevelInfo() {
        guard let level = currentQualityLevel else { return }
        
        logger.debug("""
        Current quality level:
        - Index: \(currentLevel)
        - Bandwidth: \(level.bandwidth) bps
        - Resolution: \(level.width)x\(level.height)
        - Codecs: \(level.codecs)
        """)
    }
}

// MARK: - Array Extension

private extension Array {
    subscript(safe index: Int) -> Element? {
        return indices.contains(index) ? self[index] : nil
    }
} 