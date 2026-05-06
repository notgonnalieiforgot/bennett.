import SwiftUI

/// The friction-exit modal. Per Critical Rule #5: no dismiss button, no X,
/// no cancel. The user either types the exact phrase or stays. On macOS,
/// Escape MUST NOT close it (handled via `.onKeyPress(.escape)` consuming
/// the event + `.interactiveDismissDisabled(true)` so the sheet itself
/// can't be dismissed by the system).
struct ConfirmshamingModal: View {
    @Binding var isPresented: Bool
    var trigger: ConfirmshamingTrigger
    var onConfirm: () -> Void

    @State private var text: String = ""
    @FocusState private var fieldFocused: Bool
    @EnvironmentObject var theme: ThemeEngine

    private let phrase = ConfirmshamingPhrase.value

    var body: some View {
        VStack(spacing: 18) {
            VStack(spacing: 6) {
                Text("u sure?")
                    .font(.system(size: 22, weight: .bold))
                    .foregroundStyle(theme.palette.text)
                Text(triggerCopy)
                    .font(.system(size: 13))
                    .foregroundStyle(theme.palette.muted)
                    .multilineTextAlignment(.center)
            }

            VStack(alignment: .leading, spacing: 6) {
                Text("type this exactly to leave:")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundStyle(theme.palette.muted)
                Text(phrase)
                    .font(.system(size: 14, weight: .semibold, design: .monospaced))
                    .foregroundStyle(theme.palette.accent)
                    .padding(10)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background {
                        RoundedRectangle(cornerRadius: 8)
                            .fill(theme.palette.surface.opacity(0.4))
                    }
            }

            TextField("", text: $text, axis: .horizontal)
                .focused($fieldFocused)
                .textFieldStyle(.plain)
                .font(.system(size: 15, design: .monospaced))
                .padding(12)
                .background {
                    RoundedRectangle(cornerRadius: 10)
                        .fill(theme.palette.surface)
                        .overlay(
                            RoundedRectangle(cornerRadius: 10)
                                .stroke(matched ? theme.palette.accent : theme.palette.border,
                                        lineWidth: 1)
                        )
                }

            Button {
                guard matched else { return }
                isPresented = false
                onConfirm()
            } label: {
                Text(matched ? "leave" : "type the phrase to leave")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity, minHeight: 48)
                    .background {
                        RoundedRectangle(cornerRadius: 12)
                            .fill(matched ? theme.palette.accent : theme.palette.muted.opacity(0.4))
                    }
            }
            .buttonStyle(.plain)
            .disabled(!matched)
        }
        .padding(28)
        .frame(maxWidth: 460)
        .background {
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .fill(theme.palette.bg)
                .overlay(
                    RoundedRectangle(cornerRadius: 18, style: .continuous)
                        .stroke(theme.palette.border, lineWidth: 1)
                )
        }
        .onAppear { fieldFocused = true }
        .interactiveDismissDisabled(true)
        #if os(macOS)
        // Per Phase 2 instructions: Escape MUST NOT close this modal.
        .onKeyPress(.escape) { .handled }
        #endif
    }

    private var matched: Bool { ConfirmshamingPhrase.matches(text) }

    private var triggerCopy: String {
        switch trigger {
        case .exitFocusSession:    return "leaving the focus session means u didn't finish."
        case .closeDoerTabEarly:   return "ur paying for the war room. closing it early is the leak."
        case .skipDoubleLock:      return "the gate is the gate. there's no skip."
        }
    }
}

enum ConfirmshamingTrigger: Sendable {
    case exitFocusSession
    case closeDoerTabEarly
    case skipDoubleLock
}

/// Mirrors `shared/types/Confirmshaming.ts`.
enum ConfirmshamingPhrase {
    static let value = "I am choosing to stay stagnant today."

    static func matches(_ input: String) -> Bool {
        input.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
            == value.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
    }
}

/// View modifier — present a confirmshaming sheet anywhere with one line.
/// `proceed` fires only when the user successfully typed the phrase.
extension View {
    func confirmshaming(
        isPresented: Binding<Bool>,
        trigger: ConfirmshamingTrigger,
        onConfirm: @escaping () -> Void
    ) -> some View {
        sheet(isPresented: isPresented) {
            ConfirmshamingModal(
                isPresented: isPresented,
                trigger: trigger,
                onConfirm: onConfirm
            )
            #if os(macOS)
            .frame(minWidth: 460, minHeight: 360)
            #endif
        }
    }
}

#Preview {
    @Previewable @State var open = true
    ConfirmshamingModal(
        isPresented: $open,
        trigger: .closeDoerTabEarly,
        onConfirm: {}
    )
    .environmentObject(ThemeEngine())
    .padding()
    .frame(width: 480, height: 480)
}
