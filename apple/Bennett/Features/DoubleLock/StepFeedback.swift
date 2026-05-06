import SwiftUI
#if os(iOS)
import UIKit
#endif

/// Cross-platform feedback abstraction. iOS gets haptics; macOS gets the
/// visual scale-pulse + color-flash per Critical Rule #14. Web has its own
/// equivalent in web/src/features/DoubleLock/feedback.ts.
enum StepFeedback {
    case success
    case failure

    static func fire(_ kind: StepFeedback) {
        #if os(iOS)
        switch kind {
        case .success:
            UINotificationFeedbackGenerator().notificationOccurred(.success)
        case .failure:
            UINotificationFeedbackGenerator().notificationOccurred(.error)
        }
        #endif
        // macOS: caller animates VisualPulse instead. macOS-only haptics
        // would require a special Force Touch trackpad and aren't part of
        // the spec.
    }
}

/// A short scale-pulse + color flash. Drop in next to anything that
/// previously triggered a haptic.
struct VisualPulse: ViewModifier {
    @Binding var trigger: Int
    var color: Color = .green
    var duration: Double = 0.35

    @State private var scale: CGFloat = 1.0
    @State private var flash: Double = 0.0

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
                    withAnimation(.easeOut(duration: duration / 2)) {
                        scale = 1.06
                        flash = 0.35
                    }
                    try? await Task.sleep(nanoseconds: UInt64(duration / 2 * 1_000_000_000))
                    withAnimation(.easeOut(duration: duration / 2)) {
                        scale = 1.0
                        flash = 0.0
                    }
                }
            }
    }
}

extension View {
    /// Fire a visual pulse whenever `trigger` changes. Use the same trigger
    /// counter the success/failure callbacks bump.
    func visualPulse(trigger: Binding<Int>, color: Color = .green) -> some View {
        modifier(VisualPulse(trigger: trigger, color: color))
    }
}
