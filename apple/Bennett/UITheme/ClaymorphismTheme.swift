import SwiftUI

/// Theme 3 — soft 3D, matte plastic, squishy spring physics.
/// Sage Green (#A8C5A0), Warm Cream (#FFF5E4), Dusty Rose (#E8B4B8).
enum ClaymorphismTheme {
    struct Surface: ViewModifier {
        let palette: ThemePalette
        func body(content: Content) -> some View {
            content
                .padding(22)
                .background {
                    RoundedRectangle(cornerRadius: palette.cornerRadius, style: .continuous)
                        .fill(palette.surface)
                        .shadow(color: .black.opacity(palette.shadowOpacity),
                                radius: palette.shadowRadius, x: 8, y: 8)
                        .shadow(color: .white.opacity(0.6),
                                radius: 6, x: -4, y: -4)
                }
        }
    }

    struct PrimaryButton: ButtonStyle {
        let palette: ThemePalette
        func makeBody(configuration: Configuration) -> some View {
            configuration.label
                .font(.system(size: 16, weight: .semibold))
                .foregroundStyle(palette.text)
                .frame(maxWidth: .infinity, minHeight: 52)
                .background {
                    Capsule(style: .continuous)
                        .fill(palette.accent)
                        .shadow(color: .black.opacity(0.18),
                                radius: configuration.isPressed ? 4 : 12,
                                x: configuration.isPressed ? 2 : 6,
                                y: configuration.isPressed ? 2 : 6)
                }
                .scaleEffect(configuration.isPressed ? 0.95 : 1)
                .animation(.spring(response: 0.32, dampingFraction: 0.55),
                           value: configuration.isPressed)
        }
    }
}
