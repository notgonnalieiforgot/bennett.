import SwiftUI

/// Phase 7.3 — 10-step first-launch walkthrough. Per spec §12c every
/// step is interactive (not a slide deck). Once Step 10 lands,
/// `/api/onboarding/complete` sets `isNewUser = false` server-side
/// (Critical Rule #10).
struct OnboardingFlow: View {
    @EnvironmentObject var coordinator: AuthCoordinator
    @EnvironmentObject var theme: ThemeEngine
    @EnvironmentObject var session: SessionStore

    @State private var step: Int = 1
    @State private var energyPulse: Int = 5
    @State private var selectedTheme: UITheme = .glassmorphism
    @State private var selectedModules: Set<KnowledgeModule> = []
    @State private var skipDialog: Bool = false

    var body: some View {
        ZStack {
            theme.palette.bg.ignoresSafeArea()
            VStack(spacing: 0) {
                topBar
                Group {
                    switch step {
                    case 1: WelcomeStep(onNext: { advance() })
                    case 2: EnergyPulseStep(value: $energyPulse, onNext: { advance() })
                    case 3: ThemeStep(selected: $selectedTheme, onNext: {
                                theme.setTheme(selectedTheme)
                                advance()
                            })
                    case 4: DoubleLockPracticeStep(onNext: { advance() })
                    case 5: GoalsStep(selected: $selectedModules, onNext: { advance() })
                    case 6: MarbleIntroStep(onNext: { advance() })
                    case 7: CalendarStep(onNext: { advance() })
                    case 8: ScholarshipIntroStep(onNext: { advance() })
                    case 9: NotificationsStep(onNext: { advance() })
                    default: UnlockStep(onComplete: { Task { await complete() } })
                    }
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .transition(.opacity)
                .animation(.easeInOut(duration: 0.2), value: step)
            }
        }
        .alert("skip setup?", isPresented: $skipDialog) {
            Button("yeah, skip it") {
                Task { await complete() }
            }
            Button("nah, i'll finish", role: .cancel) {}
        } message: {
            Text("u might miss something that matters.")
        }
    }

    private var topBar: some View {
        HStack {
            ProgressView(value: Double(step), total: 10)
                .tint(theme.palette.accent)
            Text("step \(step) of 10")
                .font(.system(size: 11))
                .foregroundStyle(theme.palette.muted)
                .padding(.leading, 8)
            Spacer()
            Button {
                skipDialog = true
            } label: {
                Image(systemName: "gearshape")
                    .foregroundStyle(theme.palette.muted)
            }
            .buttonStyle(.plain)
        }
        .padding(16)
    }

    private func advance() {
        withAnimation { step = min(step + 1, 10) }
    }

    private func complete() async {
        guard let uid = coordinator.firebaseUid else {
            coordinator.onboardingCompleted()
            return
        }
        var req = URLRequest(url: AppConfig.apiBaseURL.appendingPathComponent("api/onboarding/complete"))
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try? JSONSerialization.data(withJSONObject: ["uid": uid])
        _ = try? await URLSession.shared.data(for: req)
        coordinator.onboardingCompleted()
    }
}

// MARK: - Step 1: Welcome (typewriter)

private struct WelcomeStep: View {
    var onNext: () -> Void
    @EnvironmentObject var theme: ThemeEngine
    @State private var lineIndex: Int = 0

    private let lines = [
        "hey. i'm bennett.",
        "ur external prefrontal cortex.",
        "i'm gonna help u actually do the things u already know u should be doing.",
        "let's set u up. takes about 3 minutes.",
    ]

    var body: some View {
        VStack(spacing: 18) {
            Spacer()
            Image(systemName: "circle.hexagonpath.fill")
                .font(.system(size: 56))
                .foregroundStyle(theme.palette.accent)
                .opacity(0.85)
                .padding(.bottom, 16)
            VStack(alignment: .leading, spacing: 14) {
                ForEach(0...lineIndex, id: \.self) { i in
                    if i < lines.count {
                        Text(lines[i])
                            .font(.system(size: 16))
                            .foregroundStyle(theme.palette.text)
                    }
                }
            }
            .padding(.horizontal, 32)
            .frame(maxWidth: 480)
            Spacer()
            if lineIndex >= lines.count - 1 {
                Button("let's go", action: onNext)
                    .buttonStyle(BNPrimaryButtonStyle())
                    .frame(maxWidth: 320)
                    .padding(.bottom, 32)
            }
        }
        .task {
            for i in 0..<lines.count {
                try? await Task.sleep(nanoseconds: i == 0 ? 300_000_000 : 600_000_000)
                lineIndex = i
            }
        }
    }
}

// MARK: - Step 2: Energy Pulse

private struct EnergyPulseStep: View {
    @Binding var value: Int
    var onNext: () -> Void
    @EnvironmentObject var theme: ThemeEngine

    private var responseText: String {
        if value <= 3 { return "respect. being honest about it is the first move." }
        if value <= 6 { return "mid energy. that's actually perfect for getting started." }
        return "ok u got juice rn. let's channel it."
    }

    var body: some View {
        VStack(spacing: 18) {
            Spacer()
            Text("first thing.")
                .font(.system(size: 22, weight: .bold))
                .foregroundStyle(theme.palette.text)
            Text("how's ur energy right now. 1 to 10.")
                .font(.system(size: 14))
                .foregroundStyle(theme.palette.muted)
            HStack(spacing: 6) {
                ForEach(1...10, id: \.self) { n in
                    Button { value = n } label: {
                        Text("\(n)")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundStyle(value == n ? .white : theme.palette.muted)
                            .frame(width: 32, height: 36)
                            .background(value == n ? theme.palette.accent : theme.palette.surface.opacity(0.4))
                            .clipShape(RoundedRectangle(cornerRadius: 8))
                    }
                    .buttonStyle(.plain)
                }
            }
            Text(responseText)
                .font(.system(size: 13))
                .foregroundStyle(theme.palette.muted)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 24)
            Spacer()
            Button("that's my number", action: onNext)
                .buttonStyle(BNPrimaryButtonStyle())
                .frame(maxWidth: 320)
                .padding(.bottom, 32)
        }
    }
}

// MARK: - Step 3: Theme

private struct ThemeStep: View {
    @Binding var selected: UITheme
    var onNext: () -> Void
    @EnvironmentObject var theme: ThemeEngine

    var body: some View {
        VStack(spacing: 12) {
            Spacer()
            Text("pick ur vibe.")
                .font(.system(size: 22, weight: .bold))
                .foregroundStyle(theme.palette.text)
            Text("u can change this later. each one adapts to ur psychology.")
                .font(.system(size: 12))
                .foregroundStyle(theme.palette.muted)
                .multilineTextAlignment(.center)
            ForEach(UITheme.allCases, id: \.self) { t in
                Button {
                    selected = t
                    theme.setTheme(t)
                } label: {
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(t.displayName)
                                .font(.system(size: 15, weight: .bold))
                                .foregroundStyle(theme.palette.text)
                            Text(t.moodLine)
                                .font(.system(size: 12))
                                .foregroundStyle(theme.palette.muted)
                        }
                        Spacer()
                        if selected == t {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundStyle(theme.palette.accent)
                        }
                    }
                    .padding(14)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background {
                        RoundedRectangle(cornerRadius: 12)
                            .fill(theme.palette.surface.opacity(0.4))
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(selected == t ? theme.palette.accent : theme.palette.border, lineWidth: 1)
                            )
                    }
                }
                .buttonStyle(.plain)
            }
            Spacer()
            Button("this is me", action: onNext)
                .buttonStyle(BNPrimaryButtonStyle())
                .frame(maxWidth: 320)
                .padding(.bottom, 32)
        }
        .padding(.horizontal, 24)
    }
}

// MARK: - Step 4: Double-Lock practice

private struct DoubleLockPracticeStep: View {
    var onNext: () -> Void
    @EnvironmentObject var theme: ThemeEngine
    @State private var practiceOpen: Bool = false

    var body: some View {
        VStack(spacing: 18) {
            Spacer()
            Text("every day starts with the double-lock.")
                .font(.system(size: 22, weight: .bold))
                .foregroundStyle(theme.palette.text)
                .multilineTextAlignment(.center)
            Text("60 seconds. 3 steps. let's do a practice run — this one doesn't count.")
                .font(.system(size: 13))
                .foregroundStyle(theme.palette.muted)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
            Spacer()
            Button("start practice", action: { practiceOpen = true })
                .buttonStyle(BNPrimaryButtonStyle())
                .frame(maxWidth: 320)
            Button("skip the practice", action: onNext)
                .buttonStyle(.plain)
                .font(.system(size: 12))
                .foregroundStyle(theme.palette.muted)
                .padding(.bottom, 32)
        }
        .sheet(isPresented: $practiceOpen) {
            DoubleLockView { practiceOpen = false; onNext() }
                #if os(macOS)
                .frame(minWidth: 720, minHeight: 600)
                #endif
        }
    }
}

// MARK: - Step 5: Goals

private struct GoalsStep: View {
    @Binding var selected: Set<KnowledgeModule>
    var onNext: () -> Void
    @EnvironmentObject var theme: ThemeEngine

    private let modules: [(KnowledgeModule, String, String)] = [
        (.fitness, "🏋️", "fitness"),
        (.realEstate, "🏠", "real estate"),
        (.investing, "📈", "investing"),
        (.aiTech, "🤖", "ai & tech"),
        (.cooking, "🍳", "cooking"),
    ]

    var body: some View {
        VStack(spacing: 12) {
            Spacer()
            Text("what do u actually want to get better at.")
                .font(.system(size: 20, weight: .bold))
                .foregroundStyle(theme.palette.text)
                .multilineTextAlignment(.center)
            Text("pick at least one. u can add more later.")
                .font(.system(size: 12))
                .foregroundStyle(theme.palette.muted)
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                ForEach(modules, id: \.0) { module, emoji, label in
                    Button {
                        if selected.contains(module) { selected.remove(module) }
                        else { selected.insert(module) }
                    } label: {
                        VStack(spacing: 4) {
                            Text(emoji).font(.system(size: 28))
                            Text(label)
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundStyle(theme.palette.text)
                        }
                        .frame(maxWidth: .infinity, minHeight: 80)
                        .background {
                            RoundedRectangle(cornerRadius: 12)
                                .fill(theme.palette.surface.opacity(0.4))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(selected.contains(module) ? theme.palette.accent : theme.palette.border, lineWidth: 1)
                                )
                        }
                    }
                    .buttonStyle(.plain)
                }
            }
            Button {
                selected = Set(KnowledgeModule.allCases)
            } label: {
                Text(selected.count == KnowledgeModule.allCases.count
                     ? "polymath mode. respect."
                     : "all of them")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(theme.palette.accent)
            }
            .buttonStyle(.plain)
            Spacer()
            Button("this is my focus", action: onNext)
                .buttonStyle(BNPrimaryButtonStyle())
                .frame(maxWidth: 320)
                .padding(.bottom, 32)
                .disabled(selected.isEmpty)
                .opacity(selected.isEmpty ? 0.5 : 1)
        }
        .padding(.horizontal, 24)
    }
}

// MARK: - Step 6: Marble Jar intro

private struct MarbleIntroStep: View {
    var onNext: () -> Void
    @EnvironmentObject var theme: ThemeEngine

    @State private var lineIndex: Int = 0
    private let lines = [
        "this is ur marble jar.",
        "every day u complete the double-lock, u earn a marble.",
        "7 in a row? gold marble. 30 in a row? diamond.",
        "miss a day? a ghost marble shows up instead. they stay. forever.",
        "they're supposed to bother u.",
    ]

    var body: some View {
        VStack(spacing: 16) {
            Spacer()
            MarbleJarView(marbles: SeedMarbles.demo)
                .frame(maxWidth: 280, maxHeight: 380)
            VStack(spacing: 10) {
                ForEach(0...lineIndex, id: \.self) { i in
                    if i < lines.count {
                        Text(lines[i])
                            .font(.system(size: 14))
                            .foregroundStyle(i == lineIndex ? theme.palette.text : theme.palette.muted)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 24)
                    }
                }
            }
            Spacer()
            if lineIndex >= lines.count - 1 {
                Button("i get it", action: onNext)
                    .buttonStyle(BNPrimaryButtonStyle())
                    .frame(maxWidth: 320)
                    .padding(.bottom, 32)
            }
        }
        .task {
            for i in 0..<lines.count {
                try? await Task.sleep(nanoseconds: 700_000_000)
                lineIndex = i
            }
        }
    }
}

// MARK: - Step 7: Calendar

private struct CalendarStep: View {
    var onNext: () -> Void
    @EnvironmentObject var theme: ThemeEngine
    @EnvironmentObject var session: SessionStore

    var body: some View {
        VStack(spacing: 18) {
            Spacer()
            Text("bennett can protect ur time.")
                .font(.system(size: 22, weight: .bold))
                .foregroundStyle(theme.palette.text)
            Text("connect ur calendar and bennett will block focus time automatically.")
                .font(.system(size: 13))
                .foregroundStyle(theme.palette.muted)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
            Text("ignore 3 of those blocks and i'll say something.")
                .font(.system(size: 11))
                .foregroundStyle(theme.palette.muted)
                .multilineTextAlignment(.center)
            Spacer()
            Button {
                Task {
                    if let uid = session.user?.uid,
                       let url = try? await ShieldService.shared.consentURL(uid: uid) {
                        ShieldService.shared.openConsent(url)
                    }
                    onNext()
                }
            } label: {
                Text("connect google calendar")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(theme.palette.text)
                    .frame(maxWidth: 320, minHeight: 52)
                    .background {
                        RoundedRectangle(cornerRadius: 12)
                            .fill(.white)
                    }
                    .foregroundStyle(.black)
            }
            .buttonStyle(.plain)
            Button("skip for now", action: onNext)
                .buttonStyle(.plain)
                .font(.system(size: 12))
                .foregroundStyle(theme.palette.muted)
                .padding(.bottom, 32)
        }
    }
}

// MARK: - Step 8: Scholarship intro

private struct ScholarshipIntroStep: View {
    var onNext: () -> Void
    @EnvironmentObject var theme: ThemeEngine

    var body: some View {
        VStack(spacing: 18) {
            Spacer()
            Text("here's the deal.")
                .font(.system(size: 22, weight: .bold))
                .foregroundStyle(theme.palette.text)
            Text("$20")
                .font(.system(size: 64, weight: .heavy))
                .foregroundStyle(theme.palette.accent)
            Text("pay $20. hit a perfect 30-day streak. get it all back.")
                .font(.system(size: 14, weight: .semibold))
                .foregroundStyle(theme.palette.text)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
            Text("miss a day? bennett keeps the $20. the money isn't the point.")
                .font(.system(size: 12))
                .foregroundStyle(theme.palette.muted)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
            Spacer()
            Button("start scholarship mode", action: onNext)
                .buttonStyle(BNPrimaryButtonStyle())
                .frame(maxWidth: 320)
            Button("not yet, i'll do it later", action: onNext)
                .buttonStyle(.plain)
                .font(.system(size: 12))
                .foregroundStyle(theme.palette.muted)
                .padding(.bottom, 32)
        }
    }
}

// MARK: - Step 9: Notifications

private struct NotificationsStep: View {
    var onNext: () -> Void
    @EnvironmentObject var theme: ThemeEngine

    var body: some View {
        VStack(spacing: 16) {
            Spacer()
            Text("last thing. can i check in on u?")
                .font(.system(size: 22, weight: .bold))
                .foregroundStyle(theme.palette.text)
                .multilineTextAlignment(.center)
            Text("i won't spam u. just the important stuff — daily check-in, ur bulletin every friday, streak status.")
                .font(.system(size: 12))
                .foregroundStyle(theme.palette.muted)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
            VStack(spacing: 6) {
                fauxNotif("hey. energy check. 1–10?")
                fauxNotif("🛡 blocked off some time for u. protect it.")
                fauxNotif("ur bulletin just dropped. see how ur week went.")
            }
            .padding(.horizontal, 24)
            Spacer()
            Button("yeah, notify me", action: {
                NotificationService.shared.bootstrap()
                onNext()
            })
                .buttonStyle(BNPrimaryButtonStyle())
                .frame(maxWidth: 320)
            Button("not right now", action: onNext)
                .buttonStyle(.plain)
                .font(.system(size: 12))
                .foregroundStyle(theme.palette.muted)
                .padding(.bottom, 32)
        }
    }

    private func fauxNotif(_ text: String) -> some View {
        HStack {
            Image(systemName: "bell.fill")
                .foregroundStyle(theme.palette.accent)
            Text(text)
                .font(.system(size: 12))
                .foregroundStyle(theme.palette.text)
            Spacer()
        }
        .padding(10)
        .background {
            RoundedRectangle(cornerRadius: 10)
                .fill(theme.palette.surface.opacity(0.4))
        }
    }
}

// MARK: - Step 10: Unlock

private struct UnlockStep: View {
    var onComplete: () -> Void
    @EnvironmentObject var theme: ThemeEngine
    @State private var marbleCount: Int = 0

    var body: some View {
        VStack(spacing: 18) {
            Spacer()
            Text("ur set up. let's get it.")
                .font(.system(size: 26, weight: .heavy))
                .foregroundStyle(theme.palette.text)
            HStack(spacing: 12) {
                ForEach(0..<3, id: \.self) { i in
                    Circle()
                        .fill(theme.palette.accent)
                        .frame(width: 28, height: 28)
                        .opacity(i < marbleCount ? 1 : 0)
                        .scaleEffect(i < marbleCount ? 1 : 0.5)
                        .animation(.spring(response: 0.4, dampingFraction: 0.6), value: marbleCount)
                }
            }
            Spacer()
        }
        .task {
            for i in 1...3 {
                try? await Task.sleep(nanoseconds: 250_000_000)
                marbleCount = i
            }
            try? await Task.sleep(nanoseconds: 800_000_000)
            onComplete()
        }
    }
}
