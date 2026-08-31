//
//  ShareViewController.swift
//  ShareExtension
//
//  Sends shared URLs and text links to the Senin.me app.
//

import MobileCoreServices
import UIKit

extension NSItemProvider {
    var isText: Bool { hasItemConformingToTypeIdentifier(String(kUTTypeText)) }
    var isUrl: Bool { hasItemConformingToTypeIdentifier(String(kUTTypeURL)) }

    func processText(completion: CompletionHandler?) {
        loadItem(
            forTypeIdentifier: String(kUTTypeText),
            options: nil,
            completionHandler: completion
        )
    }

    func processUrl(completion: CompletionHandler?) {
        loadItem(
            forTypeIdentifier: String(kUTTypeURL),
            options: nil,
            completionHandler: completion
        )
    }
}

class ShareViewController: UIViewController {
    override func viewDidLoad() {
        super.viewDidLoad()

        guard let extensionContext,
              let inputItems = extensionContext.inputItems as? [NSExtensionItem] else {
            return
        }

        for inputItem in inputItems {
            guard let attachments = inputItem.attachments else { continue }

            for attachment in attachments {
                if attachment.isUrl {
                    attachment.processUrl { [weak self] object, error in
                        guard error == nil, let url = object as? URL else { return }
                        self?.openInSeninMe(url)
                    }
                } else if attachment.isText {
                    attachment.processText { [weak self] object, error in
                        guard error == nil,
                              let text = object as? String,
                              let url = URL(string: text) else {
                            return
                        }
                        self?.openInSeninMe(url)
                    }
                }
            }
        }

        UIView.animate(
            withDuration: 0.2,
            delay: 0,
            options: [],
            animations: {
                self.view.alpha = 0
            },
            completion: { _ in
                self.extensionContext?.completeRequest(
                    returningItems: [],
                    completionHandler: nil
                )
            }
        )
    }

    private func openInSeninMe(_ sharedUrl: URL) {
        var components = URLComponents()
        components.scheme = "seninme"
        components.host = "share"
        components.queryItems = [
            URLQueryItem(name: "sharedUrl", value: sharedUrl.absoluteString)
        ]

        guard let appUrl = components.url else { return }

        DispatchQueue.main.async {
            guard let application = UIApplication.value(
                forKeyPath: #keyPath(UIApplication.shared)
            ) as? UIApplication else {
                return
            }

            application.open(appUrl, options: [:], completionHandler: nil)
        }
    }
}
