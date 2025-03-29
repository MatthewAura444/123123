import UIKit
import AsyncDisplayKit

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = (scene as? UIWindowScene) else { return }
        
        // Создаем окно
        window = UIWindow(windowScene: windowScene)
        
        // Создаем корневой контроллер
        let viewController = VideoViewController()
        
        // Устанавливаем корневой контроллер
        window?.rootViewController = viewController
        
        // Делаем окно видимым
        window?.makeKeyAndVisible()
    }
}

class VideoViewController: ASDKViewController<ASDisplayNode> {
    private let videoContent: HLSVideoContent
    
    init() {
        // Создаем контент для видео
        videoContent = HLSVideoContent()
        
        // Создаем корневой узел
        let rootNode = ASDisplayNode()
        rootNode.backgroundColor = .black
        
        super.init(node: rootNode)
        
        // Добавляем видео контент
        rootNode.addSubnode(videoContent)
        
        // Настраиваем layout
        videoContent.style.preferredSize = CGSize(width: UIScreen.main.bounds.width, height: UIScreen.main.bounds.height)
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Загружаем тестовый HLS поток
        if let url = URL(string: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8") {
            videoContent.player.loadSource(url)
        }
    }
    
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        
        // Обновляем размер видео при изменении размера view
        videoContent.style.preferredSize = view.bounds.size
    }
} 