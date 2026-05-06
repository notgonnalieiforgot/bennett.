import SwiftUI
#if os(iOS)
import UIKit
#elseif os(macOS)
import AppKit
#endif

/// The safety panel. Voice is calm + clinical, not Bennett lingo.
/// Capital letters allowed. No friction-typing, no Bennett-Orange CTA.
/// The button colors are deliberately neutral.
///
/// IMPORTANT (per Crisis spec):
///  - This is NOT a clinical intervention. Bennett is action-coaching.
///  - The job is to redirect to real help, not provide it.
///  - The dismiss button is "I'm safe right now" — single tap, no
///    typing, because the Confirmshaming friction pattern is wrong here.
struct CrisisInterceptView: View {
    let surface: CrisisSurface
    let matchedPatterns: [String]
    var onDismiss: () -> Void

    @EnvironmentObject var session: SessionStore

    var body: some View {
        ZStack {
            Color(white: 0.97).ignoresSafeArea()
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    header
                    body1
                    hotlines
                    disclaimer
                    dismissButton
                }
                .padding(28)
                .frame(maxWidth: 520)
                .frame(maxWidth: .infinity)
            }
        }
        .task { await logAction("shown") }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("You're not alone.")
                .font(.system(size: 28, weight: .bold))
                .foregroundStyle(.black)
            Text("Real people are available right now.")
                .font(.system(size: 16))
                .foregroundStyle(.black.opacity(0.7))
        }
    }

    private var body1: some View {
        Text("If you're thinking about hurting yourself or ending your life, please reach out. The lines below are free, confidential, and answered by trained humans 24/7.")
            .font(.system(size: 14))
            .foregroundStyle(.black.opacity(0.85))
            .lineSpacing(2)
    }

    private var hotlines: some View {
        VStack(spacing: 10) {
            hotlineButton(
                title: "988 Suicide & Crisis Lifeline",
                detail: "Call or text 988. Free, confidential, 24/7.",
                action: "tel:988",
                resourceId: "988_lifeline"
            )
            hotlineButton(
                title: "Crisis Text Line",
                detail: "Text HOME to 741741.",
                action: "sms:741741&body=HOME",
                resourceId: "crisis_text_line"
            )
            hotlineButton(
                title: "The Trevor Project (LGBTQ+ youth)",
                detail: "Call 1-866-488-7386 or text START to 678-678.",
                action: "tel:18664887386",
                resourceId: "trevor_project"
            )
            hotlineButton(
                title: "International — find a helpline",
                detail: "findahelpline.com locates a free crisis line in your country.",
                action: "https://findahelpline.com",
                resourceId: "findahelpline"
            )
        }
    }

    private func hotlineButton(title: String, detail: String, action: String, resourceId: String) -> some View {
        Button {
            Task { await openResource(action, id: resourceId) }
        } label: {
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(.black)
                Text(detail)
                    .font(.system(size: 13))
                    .foregroundStyle(.black.opacity(0.7))
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(14)
            .background {
                RoundedRectangle(cornerRadius: 10)
                    .fill(.white)
                    .overlay(
                        RoundedRectangle(cornerRadius: 10)
                            .stroke(.black.opacity(0.15), lineWidth: 1)
                    )
            }
        }
        .buttonStyle(.plain)
    }

    private var disclaimer: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Bennett is not a substitute for mental health care.")
                .font(.system(size: 12, weight: .medium))
                .foregroundStyle(.black.opacity(0.6))
            Text("Your message wasn't shared with anyone.")
                .font(.system(size: 12))
                .foregroundStyle(.black.opacity(0.5))
        }
    }

    private var dismissButton: some View {
        Button {
            Task { await logAction("dismissed"); onDismiss() }
        } label: {
            Text("I'm safe right now")
                .font(.system(size: 14, weight: .semibold))
                .foregroundStyle(.black)
                .frame(maxWidth: .infinity, minHeight: 44)
                .background {
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(.black.opacity(0.3), lineWidth: 1)
                }
        }
        .buttonStyle(.plain)
    }

    private func openResource(_ action: String, id: String) async {
        guard let url = URL(string: action) else { return }
        await logAction("opened_resource:\(id)")
        #if os(iOS)
        await UIApplication.shared.open(url)
        #elseif os(macOS)
        NSWorkspace.shared.open(url)
        #endif
    }

    private func logAction(_ action: String) async {
        guard let uid = session.user?.uid else { return }
        await CrisisDetectionService.shared.log(
            uid: uid,
            surface: surface,
            patterns: matchedPatterns,
            action: action
        )
    }
}
