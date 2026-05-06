import SwiftUI
#if os(iOS)
import UIKit
#endif

/// Quiz haptics + visual fallback per spec §2 Feedback Loops.
///   Correct: Bennett Orange pulse + tactile "Click"
///   Incorrect: Claymorphic soft shake + "Thud"
enum QuizHaptic {
    case correct, incorrect

    /// Fire the haptic. iOS uses UIImpactFeedbackGenerator; macOS no-ops
    /// (visual fallback is handled by `.quizPulse` and `.quizShake` modifiers).
    static func fire(_ kind: QuizHaptic) {
        #if os(iOS)
        switch kind {
        case .correct:
            let g = UIImpactFeedbackGenerator(style: .light)
            g.prepare()
            g.impactOccurred(intensity: 0.85)
        case .incorrect:
            let g = UIImpactFeedbackGenerator(style: .heavy)
            g.prepare()
            g.impactOccurred(intensity: 1.0)
        }
        #endif
    }
}

/// Bennett-Orange pulse on correct answers.
struct QuizPulseModifier: ViewModifier {
    @Binding var trigger: Int
    var color: Color
    @State private var flash: Double = 0.0
    @State private var scale: CGFloat = 1.0

    func body(content: Content) -> some View {
        content
            .scaleEffect(scale)
            .overlay(
                color.opacity(flash)
                    .blendMode(.screen)
                    .allowsHitTesting(false)
            )
            .onChange(of: trigger) { _, _ in
                Task { @MainActor in
                    withAnimation(.easeOut(duration: 0.18)) {
                        scale = 1.04
                        flash = 0.40
                    }
                    try? await Task.sleep(nanoseconds: 180_000_000)
                    withAnimation(.easeOut(duration: 0.20)) {
                        scale = 1.0
                        flash = 0.0
                    }
                }
            }
    }
}

/// Claymorphic shake on incorrect answers — soft, not aggressive.
struct QuizShakeModifier: ViewModifier {
    @Binding var trigger: Int
    @State private var offset: CGFloat = 0

    func body(content: Content) -> some View {
        content
            .offset(x: offset)
            .onChange(of: trigger) { _, _ in
                Task { @MainActor in
                    let amplitude: CGFloat = 8
                    let pattern: [CGFloat] = [-amplitude, amplitude, -amplitude * 0.6, amplitude * 0.6, 0]
                    for o in pattern {
                        withAnimation(.spring(response: 0.10, dampingFraction: 0.55)) {
                            offset = o
                        }
                        try? await Task.sleep(nanoseconds: 60_000_000)
                    }
                }
            }
    }
}

extension View {
    func quizPulse(trigger: Binding<Int>, color: Color = Color(red: 1.0, green: 0.42, blue: 0.0)) -> some View {
        modifier(QuizPulseModifier(trigger: trigger, color: color))
    }

    func quizShake(trigger: Binding<Int>) -> some View {
        modifier(QuizShakeModifier(trigger: trigger))
    }
}
