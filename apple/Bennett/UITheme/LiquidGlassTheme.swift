import SwiftUI

/// Theme 4 — organic metallic mercury flow, constant idle motion.
/// Reflective silver-mercury, iridescent shifts.
/// The full Metal shader fluid background lands as a SwiftUI Canvas layer
/// in Phase 6; the surface + button styles here are the discrete UI tokens.
enum LiquidGlassTheme {
    struct Surface: ViewModifier {
        let palette: ThemePalette
        func body(content: Content) -> some View {
            content
                .padding(22)
                .background {
                    RoundedRectangle(cornerRadius: palette.cornerRadius, style: .continuous)
                        .fill(.ultraThinMaterial)
                        .overlay(
                            RoundedRectangle(cornerRadius: palette.cornerRadius, style: .continuous)
                                .fill(palette.surface)
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: palette.cornerRadius, style: .continuous)
                                .stroke(
                                    LinearGradient(
                                        colors: [
                                            .white.opacity(0.55),
                                            .white.opacity(0.10),
                                            palette.accentAlt.opacity(0.45),
                                            .white.opacity(0.30),
                                        ],
                                        startPoint: .topLeading,
                                        endPoint: .bottomTrailing
                                    ),
                                    lineWidth: 1.5
                                )
                        )
                }
                .shadow(color: .black.opacity(palette.shadowOpacity),
                        radius: palette.shadowRadius, y: 12)
        }
    }

    struct PrimaryButton: ButtonStyle {
        let palette: ThemePalette
        func makeBody(configuration: Configuration) -> some View {
            configuration.label
                .font(.system(size: 16, weight: .semibold))
                .foregroundStyle(.black)
                .frame(maxWidth: .infinity, minHeight: 52)
                .background {
                    RoundedRectangle(cornerRadius: 18, style: .continuous)
                        .fill(
                            LinearGradient(
                                colors: [.white, Color(white: 0.78), .white, Color(white: 0.72)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: 18, style: .continuous)
                                .stroke(.white.opacity(0.7), lineWidth: 1)
                        )
                        .shadow(color: palette.accentAlt.opacity(0.4),
                                radius: configuration.isPressed ? 4 : 18,
                                y: configuration.isPressed ? 2 : 8)
                }
                .scaleEffect(configuration.isPressed ? 0.97 : 1)
                .animation(.easeOut(duration: 0.20), value: configuration.isPressed)
        }
    }
}
