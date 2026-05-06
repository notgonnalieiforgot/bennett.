import SwiftUI

/// Theme 2 — high contrast, hard borders, flat 2D, zero gradients.
/// Black, Off-White (#F5F0E8), Grey, bright Orange (#FF4500).
enum NeoBrutalismTheme {
    struct Surface: ViewModifier {
        let palette: ThemePalette
        func body(content: Content) -> some View {
            content
                .padding(18)
                .background {
                    ZStack(alignment: .topLeading) {
                        // Hard offset duplicate — replaces a normal shadow.
                        RoundedRectangle(cornerRadius: palette.cornerRadius)
                            .fill(.black)
                            .offset(x: 4, y: 4)
                        RoundedRectangle(cornerRadius: palette.cornerRadius)
                            .fill(palette.surface)
                            .overlay(
                                RoundedRectangle(cornerRadius: palette.cornerRadius)
                                    .stroke(palette.border, lineWidth: 3)
                            )
                    }
                }
        }
    }

    struct PrimaryButton: ButtonStyle {
        let palette: ThemePalette
        func makeBody(configuration: Configuration) -> some View {
            configuration.label
                .font(.system(size: 16, weight: .heavy))
                .textCase(.uppercase)
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity, minHeight: 52)
                .background {
                    ZStack(alignment: .topLeading) {
                        if !configuration.isPressed {
                            RoundedRectangle(cornerRadius: 2)
                                .fill(.black)
                                .offset(x: 4, y: 4)
                        }
                        RoundedRectangle(cornerRadius: 2)
                            .fill(palette.accent)
                            .overlay(
                                RoundedRectangle(cornerRadius: 2)
                                    .stroke(.black, lineWidth: 3)
                            )
                    }
                }
                .offset(x: configuration.isPressed ? 4 : 0, y: configuration.isPressed ? 4 : 0)
                .animation(.easeOut(duration: 0.08), value: configuration.isPressed)
        }
    }
}
