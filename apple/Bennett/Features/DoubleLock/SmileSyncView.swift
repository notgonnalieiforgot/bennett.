import SwiftUI

/// Step 1 of the Double-Lock — Smile Sync.
///
/// Per spec §5a:
/// - Detect a genuine smile via face landmarks (cheek raise + lip corner pull).
/// - 15s timeout — if not detected, gentle Friend prompt: "hey, even a small one counts 😄"
/// - On detection, hold for ~1s before advancing.
struct SmileSyncView: View {
    var onComplete: () -> Void

    @StateObject private var detector = SmileDetector()
    @EnvironmentObject var theme: ThemeEngine

    @State private var smileHoldStart: Date?
    @State private var elapsed: TimeInterval = 0
    @State private var pulseTrigger: Int = 0
    @State private var showFriendPrompt: Bool = false

    private let timeout: TimeInterval = 15.0
    private let holdSeconds: TimeInterval = 1.0
    private let timer = Timer.publish(every: 0.1, on: .main, in: .common).autoconnect()

    var body: some View {
        VStack(spacing: 16) {
            header
            preview
                .frame(maxWidth: 480, maxHeight: 360)
                .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 24, style: .continuous)
                        .stroke(detector.isSmiling ? theme.palette.accent : theme.palette.border,
                                lineWidth: detector.isSmiling ? 3 : 1)
                )
                .visualPulse(trigger: $pulseTrigger, color: theme.palette.accent)
            footer
        }
        .padding(24)
        .task {
            do { try await detector.start() } catch {
                showFriendPrompt = true
            }
        }
        .onDisappear { detector.stop() }
        .onReceive(timer) { _ in
            elapsed += 0.1
            if elapsed > timeout && !detector.isSmiling {
                showFriendPrompt = true
            }
            if detector.isSmiling {
                if smileHoldStart == nil {
                    smileHoldStart = .now
                    pulseTrigger &+= 1
                    StepFeedback.fire(.success)
                } else if Date.now.timeIntervalSince(smileHoldStart!) >= holdSeconds {
                    onComplete()
                }
            } else {
                smileHoldStart = nil
            }
        }
    }

    private var header: some View {
        VStack(spacing: 4) {
            Text("step 1 of 3")
                .font(.system(size: 12, weight: .medium))
                .foregroundStyle(theme.palette.muted)
            Text("smile sync")
                .font(.system(size: 22, weight: .bold))
                .foregroundStyle(theme.palette.text)
            Text(detector.faceFound
                 ? (detector.isSmiling ? "got it. hold for a sec." : "give us a smile")
                 : "looking for u")
                .font(.system(size: 14))
                .foregroundStyle(theme.palette.muted)
        }
    }

    private var preview: some View {
        Group {
            if PermissionsService.shared.cameraStatus() == .authorized {
                CameraPreview(session: detector.session)
            } else {
                ZStack {
                    theme.palette.surface
                    Text("camera blocked. open settings to grant access.")
                        .font(.system(size: 13))
                        .foregroundStyle(theme.palette.muted)
                        .multilineTextAlignment(.center)
                        .padding()
                }
            }
        }
    }

    private var footer: some View {
        VStack(spacing: 8) {
            ProgressView(value: min(elapsed / timeout, 1.0))
                .tint(theme.palette.accent)
                .frame(maxWidth: 360)
            if showFriendPrompt {
                Text("hey, even a small one counts 😄")
                    .font(.system(size: 14))
                    .foregroundStyle(theme.palette.muted)
            }
        }
    }
}
