import SwiftUI

/// SwiftUI Canvas-rendered Marble Jar. Per spec §5b: fills bottom to top,
/// tap a marble to see its date + module, lid glows at 30. Per Critical
/// Rule #6 ghost marbles are permanent — they're rendered alongside real
/// ones and never removed.
struct MarbleJarView: View {
    var marbles: [Marble]
    var onMarbleTap: ((Marble) -> Void)? = nil

    @StateObject private var physics = MarbleJarPhysics()
    @EnvironmentObject var theme: ThemeEngine
    @State private var selected: Marble?
    @State private var jarSize: CGSize = .zero

    var body: some View {
        GeometryReader { geo in
            ZStack {
                jarShell(in: geo.size)
                TimelineView(.animation) { ctx in
                    Canvas { context, size in
                        physics.step(now: ctx.date.timeIntervalSinceReferenceDate)
                        for body in physics.bodies {
                            drawMarble(body, in: &context)
                        }
                    } symbols: {
                        // No reusable symbols; we draw paths inline.
                    }
                    .frame(width: size(geo).width, height: size(geo).height)
                }
                .frame(width: size(geo).width, height: size(geo).height)
                .contentShape(Rectangle())
                .gesture(tapGesture(in: geo.size))
                lidGlowIfFull
            }
            .frame(width: geo.size.width, height: geo.size.height)
            .onAppear {
                physics.jarSize = size(geo)
                physics.loadInitial(marbles)
            }
            .onChange(of: marbles) { _, new in
                let known = Set(physics.bodies.map { $0.id })
                for m in new where !known.contains(m.id) { physics.drop(m) }
            }
        }
        .aspectRatio(2.0 / 3.0, contentMode: .fit)
        .sheet(item: $selected) { marble in
            MarbleDetailView(marble: marble) { selected = nil }
                #if os(macOS)
                .frame(minWidth: 320, minHeight: 220)
                #endif
        }
    }

    private func size(_ geo: GeometryProxy) -> CGSize { geo.size }

    private func jarShell(in size: CGSize) -> some View {
        ZStack {
            RoundedRectangle(cornerRadius: 28, style: .continuous)
                .fill(theme.palette.surface.opacity(0.4))
                .overlay(
                    RoundedRectangle(cornerRadius: 28, style: .continuous)
                        .stroke(theme.palette.border, lineWidth: 2)
                )
            // Lid line
            Rectangle()
                .fill(theme.palette.border)
                .frame(height: 1)
                .offset(y: -size.height / 2 + 28)
        }
    }

    @ViewBuilder
    private var lidGlowIfFull: some View {
        if physics.bodies.count >= Marble.jarTargetFill {
            RoundedRectangle(cornerRadius: 28, style: .continuous)
                .stroke(theme.palette.accent, lineWidth: 2)
                .shadow(color: theme.palette.accent.opacity(0.7), radius: 16)
                .allowsHitTesting(false)
        }
    }

    private func tapGesture(in size: CGSize) -> some Gesture {
        DragGesture(minimumDistance: 0)
            .onEnded { value in
                if let body = physics.hitTest(value.location) {
                    if let m = marbles.first(where: { $0.id == body.id }) {
                        selected = m
                        onMarbleTap?(m)
                    }
                }
            }
    }

    private func drawMarble(_ body: MarbleJarPhysics.Body, in context: inout GraphicsContext) {
        let rect = CGRect(
            x: body.pos.x - body.radius,
            y: body.pos.y - body.radius,
            width: body.radius * 2,
            height: body.radius * 2
        )
        let baseColor: Color
        switch body.kind {
        case .clear:   baseColor = theme.palette.text.opacity(0.85)
        case .gold:    baseColor = Color(red: 1.0, green: 0.81, blue: 0.13)
        case .diamond: baseColor = Color(red: 0.62, green: 0.92, blue: 1.0)
        case .ghost:   baseColor = theme.palette.text.opacity(0.20)
        }
        let path = Path(ellipseIn: rect)
        if body.kind == .ghost {
            // Translucent outline-only — ghost marbles read as faded.
            context.stroke(path, with: .color(baseColor), lineWidth: 1.5)
        } else {
            context.fill(path, with: .color(baseColor))
            // Highlight glint, top-left.
            let glint = CGRect(
                x: body.pos.x - body.radius * 0.4,
                y: body.pos.y - body.radius * 0.5,
                width: body.radius * 0.5,
                height: body.radius * 0.4
            )
            context.fill(Path(ellipseIn: glint), with: .color(.white.opacity(0.45)))
        }
    }
}

#Preview {
    let demo: [Marble] = (0..<14).map { i in
        Marble(
            id: "\(i)",
            kind: i == 6 ? .gold : (i == 12 ? .ghost : .clear),
            earnedAt: 0,
            date: "2026-04-\(String(format: "%02d", i + 1))",
            moduleCompleted: i == 12 ? nil : "fitness"
        )
    }
    return MarbleJarView(marbles: demo)
        .environmentObject(ThemeEngine())
        .padding()
        .frame(width: 320, height: 480)
}
