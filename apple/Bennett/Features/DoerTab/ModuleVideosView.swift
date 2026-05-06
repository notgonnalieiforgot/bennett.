import SwiftUI
import WebKit

/// Phase 6.6 — Apple-side embedded YouTube player.
///
/// Uses WKWebView pointed at `youtube-nocookie.com/embed/{id}?rel=0&modestbranding=1`.
/// The same anti-recommendation parameters as the web side. Whitelisted
/// IDs only.
struct ModuleVideosView: View {
    let module: KnowledgeModule

    @EnvironmentObject var theme: ThemeEngine
    @State private var videos: [WhitelistedVideoDoc] = []
    @State private var active: WhitelistedVideoDoc?
    @State private var loading: Bool = true

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            if loading {
                Text("loading videos…")
                    .font(.system(size: 12))
                    .foregroundStyle(theme.palette.muted)
            } else if videos.isEmpty {
                Text("no videos in this module yet.")
                    .font(.system(size: 12))
                    .foregroundStyle(theme.palette.muted)
            } else {
                if let active {
                    YouTubePlayerView(videoId: active.id)
                        .frame(height: 220)
                        .clipShape(RoundedRectangle(cornerRadius: 14))
                    if let note = active.founderNote, !note.isEmpty {
                        Text("founder's note: \(note)")
                            .font(.system(size: 11))
                            .foregroundStyle(theme.palette.accent)
                    }
                }
                ForEach(videos) { v in
                    Button {
                        active = v
                    } label: {
                        HStack {
                            Text(v.title)
                                .font(.system(size: 14, weight: active?.id == v.id ? .bold : .regular))
                                .foregroundStyle(active?.id == v.id ? theme.palette.text : theme.palette.muted)
                            Spacer()
                        }
                        .padding(10)
                        .background {
                            RoundedRectangle(cornerRadius: 10)
                                .fill(active?.id == v.id ? theme.palette.accent.opacity(0.15) : theme.palette.surface.opacity(0.3))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 10)
                                        .stroke(active?.id == v.id ? theme.palette.accent.opacity(0.4) : theme.palette.border, lineWidth: 1)
                                )
                        }
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .task { await load() }
    }

    private func load() async {
        loading = true
        defer { loading = false }
        var comps = URLComponents(
            url: AppConfig.apiBaseURL.appendingPathComponent("api/youtube/whitelist"),
            resolvingAgainstBaseURL: false
        )!
        comps.queryItems = [URLQueryItem(name: "module", value: module.rawValue)]
        guard let url = comps.url else { return }
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            struct Wrap: Decodable { let videos: [WhitelistedVideoDoc] }
            let decoded = try JSONDecoder().decode(Wrap.self, from: data)
            videos = decoded.videos
            active = decoded.videos.first
        } catch {
            videos = []
        }
    }
}

struct WhitelistedVideoDoc: Codable, Identifiable, Hashable, Sendable {
    let id: String
    let module: String
    let title: String
    let founderNote: String?
    let durationSec: Int?
    let addedAt: TimeInterval
}

#if os(iOS)
private struct YouTubePlayerView: UIViewRepresentable {
    let videoId: String
    func makeUIView(context: Context) -> WKWebView {
        let cfg = WKWebViewConfiguration()
        cfg.allowsInlineMediaPlayback = true
        cfg.mediaTypesRequiringUserActionForPlayback = []
        let v = WKWebView(frame: .zero, configuration: cfg)
        v.scrollView.isScrollEnabled = false
        v.isOpaque = false
        v.backgroundColor = .black
        return v
    }
    func updateUIView(_ uiView: WKWebView, context: Context) {
        let url = URL(string: "https://www.youtube-nocookie.com/embed/\(videoId)?rel=0&modestbranding=1&playsinline=1&iv_load_policy=3")!
        uiView.load(URLRequest(url: url))
    }
}
#elseif os(macOS)
private struct YouTubePlayerView: NSViewRepresentable {
    let videoId: String
    func makeNSView(context: Context) -> WKWebView {
        let v = WKWebView()
        v.setValue(false, forKey: "drawsBackground")
        return v
    }
    func updateNSView(_ nsView: WKWebView, context: Context) {
        let url = URL(string: "https://www.youtube-nocookie.com/embed/\(videoId)?rel=0&modestbranding=1&iv_load_policy=3")!
        nsView.load(URLRequest(url: url))
    }
}
#endif
