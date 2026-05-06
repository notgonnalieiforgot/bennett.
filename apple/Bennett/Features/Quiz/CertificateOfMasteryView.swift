import SwiftUI

/// Full-screen "Founder Vetted. Mastery Certified." per spec §2.
/// Chrome / Bennett Orange treatment regardless of active theme — this
/// is a moment, not a panel.
struct CertificateOfMasteryView: View {
    let sector: MasterySector
    let score: Double
    var onClose: () -> Void

    private let chrome = LinearGradient(
        colors: [
            Color(white: 0.92),
            Color(white: 0.72),
            Color(white: 0.96),
            Color(white: 0.78),
        ],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
    private let orange = Color(red: 1.0, green: 0.42, blue: 0.0)

    var body: some View {
        ZStack {
            chrome.ignoresSafeArea()
            VStack(spacing: 18) {
                Text("CERTIFICATE OF MASTERY")
                    .font(.system(size: 14, weight: .bold))
                    .tracking(4)
                    .foregroundStyle(.black.opacity(0.7))
                Image(systemName: "checkmark.seal.fill")
                    .font(.system(size: 96, weight: .bold))
                    .foregroundStyle(orange)
                    .shadow(color: orange.opacity(0.4), radius: 18)
                Text(sector.label)
                    .font(.system(size: 36, weight: .heavy))
                    .foregroundStyle(.black)
                Text("score · \(Int(score * 100))%")
                    .font(.system(size: 14, weight: .semibold, design: .monospaced))
                    .foregroundStyle(.black.opacity(0.7))
                VStack(spacing: 4) {
                    Text("Founder Vetted.")
                    Text("Mastery Certified.")
                }
                .font(.system(size: 22, weight: .bold))
                .foregroundStyle(.black)
                .multilineTextAlignment(.center)
                .padding(.top, 8)

                Button {
                    onClose()
                } label: {
                    Text("continue")
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundStyle(.white)
                        .frame(maxWidth: 240, minHeight: 48)
                        .background {
                            RoundedRectangle(cornerRadius: 14).fill(orange)
                        }
                }
                .buttonStyle(.plain)
                .padding(.top, 12)
            }
            .padding(28)
            .frame(maxWidth: 480)
        }
    }
}

#Preview {
    CertificateOfMasteryView(sector: .finance, score: 0.92, onClose: {})
}
