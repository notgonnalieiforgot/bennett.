#if os(iOS)
import SwiftUI
import FamilyControls
import ManagedSettings

/// Phase 6.4 — Screen Time picker UI for the Sacrifice trial.
///
/// Per spec §8b option 3: 24-hour Stealth Mode locks all entertainment
/// apps. Whitelist: Bennett, Calendar, Messages, Phone, Mail. Unlock
/// auto at 24-hour mark.
///
/// FamilyActivityPicker is the system-provided UI for selecting apps +
/// categories — we never see app identifiers, only opaque tokens (Apple
/// privacy guarantee). The selection is stored locally so the lockout
/// can be cleared at the 24h mark.
@available(iOS 16.0, *)
struct SacrificePickerView: View {
    @Binding var isPresented: Bool
    var onStarted: () -> Void

    @State private var selection = FamilyActivitySelection()
    @State private var pickerOpen: Bool = false
    @EnvironmentObject var theme: ThemeEngine

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            header
            VStack(alignment: .leading, spacing: 8) {
                Text("the sacrifice — 24-hour stealth mode")
                    .font(.system(size: 18, weight: .bold))
                    .foregroundStyle(theme.palette.text)
                Text("pick the categories u want bennett to block. whitelist (always allowed): bennett, calendar, messages, phone, mail.")
                    .font(.system(size: 13))
                    .foregroundStyle(theme.palette.muted)
            }
            Button("choose apps + categories") {
                pickerOpen = true
            }
            .buttonStyle(.plain)
            .font(.system(size: 14, weight: .semibold))
            .foregroundStyle(theme.palette.text)
            .padding(.horizontal, 14)
            .padding(.vertical, 10)
            .background {
                RoundedRectangle(cornerRadius: 10)
                    .fill(theme.palette.surface.opacity(0.4))
                    .overlay(
                        RoundedRectangle(cornerRadius: 10)
                            .stroke(theme.palette.border, lineWidth: 1)
                    )
            }
            summary
            Spacer()
            Button {
                Task { await start() }
            } label: {
                Text("start 24h stealth mode")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity, minHeight: 52)
                    .background {
                        RoundedRectangle(cornerRadius: 14)
                            .fill(canStart ? theme.palette.accent : theme.palette.muted.opacity(0.5))
                    }
            }
            .buttonStyle(.plain)
            .disabled(!canStart)
        }
        .padding(20)
        .familyActivityPicker(isPresented: $pickerOpen, selection: $selection)
    }

    private var canStart: Bool {
        !selection.applicationTokens.isEmpty || !selection.categoryTokens.isEmpty
    }

    private var summary: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("\(selection.applicationTokens.count) apps · \(selection.categoryTokens.count) categories selected")
                .font(.system(size: 12))
                .foregroundStyle(theme.palette.muted)
            if !selection.applicationTokens.isEmpty || !selection.categoryTokens.isEmpty {
                Text("auto-unlocks at the 24-hour mark.")
                    .font(.system(size: 11))
                    .foregroundStyle(theme.palette.accent)
            }
        }
    }

    private var header: some View {
        Button {
            isPresented = false
        } label: {
            HStack {
                Image(systemName: "chevron.left")
                Text("back")
            }
            .font(.system(size: 13, weight: .medium))
            .foregroundStyle(theme.palette.muted)
        }
        .buttonStyle(.plain)
    }

    private func start() async {
        do {
            try await ScreenTimeService.shared.requestAuthorization()
            ScreenTimeService.shared.startStealthMode(selection: selection)
            isPresented = false
            onStarted()
        } catch {
            // The ManagedSettings framework only blocks when the user has
            // approved FamilyControls. Failure here means the user denied —
            // fall back to manual confirmation in the parent view.
            isPresented = false
        }
    }
}
#endif
