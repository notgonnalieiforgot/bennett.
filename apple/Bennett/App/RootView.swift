import SwiftUI

/// Per CLAUDE.md macOS Layout Rules: macOS uses NavigationSplitView
/// (sidebar + detail), iOS uses a Bento Grid scroll view.
struct RootView: View {
    @EnvironmentObject var theme: ThemeEngine
    @State private var doubleLockOpen: Bool = false
    @State private var confirmshamingOpen: Bool = false
    @State private var doerTabOpen: Bool = false
    @State private var arenaOpen: Bool = false
    @State private var redemptionOpen: Bool = false
    @State private var betaFeedbackOpen: Bool = false

    var body: some View {
        Group {
            #if os(macOS)
            NavigationSplitView {
                sidebar
            } detail: {
                home
            }
            .navigationSplitViewStyle(.balanced)
            .background(theme.palette.bg)
            #else
            ZStack {
                theme.palette.bg.ignoresSafeArea()
                home
            }
            #endif
        }
        #if os(iOS)
        .fullScreenCover(isPresented: $doubleLockOpen) {
            DoubleLockView {
                doubleLockOpen = false
                // Per spec §10e — fire beta feedback after Double-Lock complete.
                Task { @MainActor in
                    try? await Task.sleep(nanoseconds: 600_000_000)
                    betaFeedbackOpen = true
                }
            }
        }
        #else
        .sheet(isPresented: $doubleLockOpen) {
            DoubleLockView {
                doubleLockOpen = false
                Task { @MainActor in
                    try? await Task.sleep(nanoseconds: 600_000_000)
                    betaFeedbackOpen = true
                }
            }
            .frame(minWidth: 720, minHeight: 600)
        }
        #endif
        .betaFeedbackPrompt(isPresented: $betaFeedbackOpen, trigger: .doubleLockComplete)
        .onReceive(NotificationCenter.default.publisher(for: .bnOpenDoubleLockNotification)) { _ in
            doubleLockOpen = true
        }
        .confirmshaming(
            isPresented: $confirmshamingOpen,
            trigger: .exitFocusSession
        ) {
            // Phase 3+ wires real exit semantics here.
        }
        #if os(iOS)
        .fullScreenCover(isPresented: $doerTabOpen) {
            NavigationStack {
                DoerTabView()
                    .toolbar {
                        ToolbarItem(placement: .cancellationAction) {
                            Button("close") { doerTabOpen = false }
                        }
                    }
            }
        }
        #else
        .sheet(isPresented: $doerTabOpen) {
            DoerTabView()
                .frame(minWidth: 760, minHeight: 640)
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("close") { doerTabOpen = false }
                    }
                }
        }
        #endif
        .sheet(isPresented: $arenaOpen) {
            ArenaView()
                #if os(macOS)
                .frame(minWidth: 600, minHeight: 600)
                #endif
        }
        .sheet(isPresented: $redemptionOpen) {
            RedemptionQuestView(
                date: ISO8601DateFormatter.dayFormatter.string(from: Date()),
                onSurvived: { redemptionOpen = false },
                onBroken: { redemptionOpen = false }
            )
            #if os(macOS)
            .frame(minWidth: 540, minHeight: 600)
            #endif
        }
    }

    private var home: some View {
        ScrollView {
            VStack(spacing: 24) {
                header
                Button {
                    doubleLockOpen = true
                } label: {
                    Text("run the double-lock")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundStyle(.white)
                        .frame(maxWidth: 320, minHeight: 48)
                        .background {
                            RoundedRectangle(cornerRadius: 14, style: .continuous)
                                .fill(theme.palette.accent)
                        }
                }
                .buttonStyle(.plain)
                Button {
                    doerTabOpen = true
                } label: {
                    Text("open doer tab")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(theme.palette.text)
                        .frame(maxWidth: 320, minHeight: 44)
                        .background {
                            RoundedRectangle(cornerRadius: 14, style: .continuous)
                                .fill(theme.palette.surface.opacity(0.4))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                                        .stroke(theme.palette.border, lineWidth: 1)
                                )
                        }
                }
                .buttonStyle(.plain)
                Button { arenaOpen = true } label: {
                    secondaryButtonLabel("the arena")
                }
                .buttonStyle(.plain)
                Button { redemptionOpen = true } label: {
                    secondaryButtonLabel("redemption quest")
                }
                .buttonStyle(.plain)
                Button { confirmshamingOpen = true } label: {
                    secondaryButtonLabel("test confirmshaming")
                }
                .buttonStyle(.plain)
                ThemeSwitcher()
                marbleJarSection
                ShieldsTodayView()
                    .frame(maxWidth: 360)
                ScholarshipModeView()
                    .frame(maxWidth: 360)
                MasteryBadgesView()
                    .frame(maxWidth: 360)
                BentoGridPreview()
                    .frame(minHeight: 480)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 24)
        }
    }

    private func secondaryButtonLabel(_ label: String) -> some View {
        Text(label)
            .font(.system(size: 14, weight: .semibold))
            .foregroundStyle(theme.palette.text)
            .frame(maxWidth: 320, minHeight: 44)
            .background {
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .fill(theme.palette.surface.opacity(0.4))
                    .overlay(
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .stroke(theme.palette.border, lineWidth: 1)
                    )
            }
    }

    private var marbleJarSection: some View {
        VStack(spacing: 8) {
            Text("marble jar — tap a marble")
                .font(.system(size: 11))
                .foregroundStyle(theme.palette.muted)
            MarbleJarView(marbles: SeedMarbles.demo)
                .frame(maxWidth: 320)
        }
    }

    private var header: some View {
        VStack(spacing: 6) {
            Text("bennett.")
                .font(.system(size: 56, weight: .heavy))
                .foregroundStyle(theme.palette.text)
            Text("ur external prefrontal cortex.")
                .font(.system(size: 14))
                .foregroundStyle(theme.palette.muted)
            Text("ur cognitive operating system.")
                .font(.system(size: 11))
                .foregroundStyle(theme.palette.muted)
                .multilineTextAlignment(.center)
        }
    }

    #if os(macOS)
    private var sidebar: some View {
        List {
            Label("home", systemImage: "house")
            Label("double-lock", systemImage: "lock.shield")
            Label("marble jar", systemImage: "circle.grid.3x3.fill")
            Label("doer tab", systemImage: "bolt.fill")
            Label("arena", systemImage: "trophy.fill")
            Label("bulletin", systemImage: "doc.text.fill")
        }
        .navigationTitle("bennett.")
        .frame(minWidth: 220)
    }
    #endif
}

#Preview {
    RootView()
        .environmentObject(ThemeEngine())
        .environmentObject(SessionStore())
}
