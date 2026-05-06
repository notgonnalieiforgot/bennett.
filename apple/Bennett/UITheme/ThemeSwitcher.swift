import SwiftUI

/// Settings + onboarding-step-3 picker. Tapping a card live-applies the
/// theme — verifies the live-switching contract demanded by Phase 1.3.
struct ThemeSwitcher: View {
    @EnvironmentObject var theme: ThemeEngine

    var body: some View {
        VStack(spacing: 12) {
            ForEach(UITheme.allCases, id: \.self) { t in
                Button {
                    theme.setTheme(t)
                } label: {
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(t.displayName)
                                .font(.system(size: 16, weight: .bold))
                                .foregroundStyle(theme.palette.text)
                            Text(t.moodLine)
                                .font(.system(size: 13))
                                .foregroundStyle(theme.palette.muted)
                        }
                        Spacer()
                        if t == theme.theme {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundStyle(theme.palette.accent)
                        }
                    }
                }
                .buttonStyle(.plain)
                .bnSurface()
            }
        }
        .padding(16)
    }
}

#Preview {
    ThemeSwitcher()
        .environmentObject(ThemeEngine())
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.black)
}
