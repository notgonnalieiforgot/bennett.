import SwiftUI

/// Persistent search bar at the top of the Doer Tab. Submitting opens
/// the Focus Mode overlay with a Claude-distilled 20-minute study protocol.
struct KnowledgeBarView: View {
    @EnvironmentObject var theme: ThemeEngine
    @EnvironmentObject var session: SessionStore

    @State private var topic: String = ""
    @State private var loading: Bool = false
    @State private var protocolDoc: KnowledgeBarProtocolDoc?
    @State private var error: String?
    @State private var crisisPatterns: [String]?

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("knowledge bar")
                .font(.system(size: 11, weight: .medium))
                .foregroundStyle(theme.palette.muted)
            HStack(spacing: 8) {
                Image(systemName: "magnifyingglass")
                    .foregroundStyle(theme.palette.muted)
                TextField("any topic — sleep architecture, option greeks, …", text: $topic)
                    .textFieldStyle(.plain)
                    .submitLabel(.go)
                    .onSubmit { Task { await search() } }
                if loading {
                    ProgressView().tint(theme.palette.accent).controlSize(.small)
                } else if !topic.isEmpty {
                    Button("go") { Task { await search() } }
                        .buttonStyle(.plain)
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(theme.palette.accent)
                }
            }
            .padding(12)
            .background {
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .fill(theme.palette.surface.opacity(0.4))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12, style: .continuous)
                            .stroke(theme.palette.border, lineWidth: 1)
                    )
            }
            if let error {
                Text(error)
                    .font(.system(size: 11))
                    .foregroundStyle(theme.palette.muted)
            }
        }
        .fullScreenCoverIfAvailable(item: $protocolDoc) { doc in
            FocusModeOverlay(protocolDoc: doc) { protocolDoc = nil }
        }
        .sheet(isPresented: Binding(
            get: { crisisPatterns != nil },
            set: { if !$0 { crisisPatterns = nil; topic = "" } }
        )) {
            if let patterns = crisisPatterns {
                CrisisInterceptView(
                    surface: .knowledgeBar,
                    matchedPatterns: patterns,
                    onDismiss: {
                        crisisPatterns = nil
                        topic = ""
                    }
                )
            }
        }
    }

    private func search() async {
        let q = topic.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !q.isEmpty, let uid = session.user?.uid else { return }
        // Local crisis check before any network call.
        let result = CrisisDetectionService.shared.detect(q)
        if result.matched {
            crisisPatterns = result.matchedPatterns
            return
        }
        loading = true
        error = nil
        defer { loading = false }
        do {
            protocolDoc = try await DoerTabService.shared.searchKnowledge(topic: q, uid: uid)
            topic = ""
        } catch {
            self.error = error.localizedDescription
        }
    }
}

/// Cross-platform full-screen presentation. iOS uses fullScreenCover;
/// macOS doesn't have it — fall back to .sheet.
private extension View {
    @ViewBuilder
    func fullScreenCoverIfAvailable<Item: Identifiable, Content: View>(
        item: Binding<Item?>,
        @ViewBuilder content: @escaping (Item) -> Content
    ) -> some View {
        #if os(iOS)
        self.fullScreenCover(item: item, content: content)
        #else
        self.sheet(item: item, content: content)
        #endif
    }
}

extension KnowledgeBarProtocolDoc: Identifiable {
    var id: String { topic }
}
