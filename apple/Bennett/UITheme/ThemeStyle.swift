import SwiftUI

/// Top-level dispatchers — every callsite uses these, never the per-theme
/// types directly. Switching themes at runtime swaps the underlying
/// implementation automatically because each modifier reads the live
/// `ThemeEngine` from the environment.

extension View {
    /// Card surface in the active theme's visual language.
    func bnSurface() -> some View {
        modifier(BNSurfaceModifier())
    }
}

private struct BNSurfaceModifier: ViewModifier {
    @EnvironmentObject var theme: ThemeEngine
    func body(content: Content) -> some View {
        switch theme.theme {
        case .glassmorphism: content.modifier(GlassmorphismTheme.Surface(palette: theme.palette))
        case .neoBrutalism:  content.modifier(NeoBrutalismTheme.Surface(palette: theme.palette))
        case .claymorphism:  content.modifier(ClaymorphismTheme.Surface(palette: theme.palette))
        case .liquidGlass:   content.modifier(LiquidGlassTheme.Surface(palette: theme.palette))
        }
    }
}

/// Primary button style picker. Use as `.buttonStyle(BNPrimaryButtonStyle())`.
struct BNPrimaryButtonStyle: PrimitiveButtonStyle {
    @EnvironmentObject var theme: ThemeEngine

    func makeBody(configuration: Configuration) -> some View {
        Group {
            switch theme.theme {
            case .glassmorphism:
                Button(role: configuration.role,
                       action: { configuration.trigger() },
                       label: { configuration.label })
                    .buttonStyle(GlassmorphismTheme.PrimaryButton(palette: theme.palette))
            case .neoBrutalism:
                Button(role: configuration.role,
                       action: { configuration.trigger() },
                       label: { configuration.label })
                    .buttonStyle(NeoBrutalismTheme.PrimaryButton(palette: theme.palette))
            case .claymorphism:
                Button(role: configuration.role,
                       action: { configuration.trigger() },
                       label: { configuration.label })
                    .buttonStyle(ClaymorphismTheme.PrimaryButton(palette: theme.palette))
            case .liquidGlass:
                Button(role: configuration.role,
                       action: { configuration.trigger() },
                       label: { configuration.label })
                    .buttonStyle(LiquidGlassTheme.PrimaryButton(palette: theme.palette))
            }
        }
    }
}
