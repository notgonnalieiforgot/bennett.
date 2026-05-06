import Foundation
import CoreGraphics

/// Tiny 2D physics for the Marble Jar — pure Swift, no SpriteKit.
/// Drives a SwiftUI Canvas via TimelineView at ~60Hz.
///
/// Marbles are circles. The jar is a U: vertical walls on left/right and a
/// flat floor (rounded corners are handled by clamping in the floor band).
/// Collisions are resolved with positional correction + impulse exchange.
@MainActor
final class MarbleJarPhysics: ObservableObject {
    struct Body: Identifiable, Equatable {
        let id: String
        let kind: MarbleKind
        let date: String
        let moduleCompleted: String?
        var pos: CGPoint
        var vel: CGVector
        var radius: CGFloat
    }

    @Published private(set) var bodies: [Body] = []
    @Published var jarSize: CGSize = CGSize(width: 320, height: 480)

    private let gravity: CGFloat = 1400         // pt/s²
    private let restitution: CGFloat = 0.35     // bounce damping
    private let floorFriction: CGFloat = 0.92   // tangential damping on floor contact
    private let airDamping: CGFloat = 0.998

    private var lastTick: CFTimeInterval = CACurrentMediaTime()

    /// Drop a marble in from a random horizontal slot at the top of the jar.
    func drop(_ marble: Marble) {
        let inset = Marble.radius + 6
        let x = CGFloat.random(in: inset...(jarSize.width - inset))
        let body = Body(
            id: marble.id,
            kind: marble.kind,
            date: marble.date,
            moduleCompleted: marble.moduleCompleted,
            pos: CGPoint(x: x, y: -Marble.radius),
            vel: CGVector(dx: 0, dy: 0),
            radius: Marble.radius
        )
        bodies.append(body)
    }

    func loadInitial(_ marbles: [Marble]) {
        bodies.removeAll(keepingCapacity: true)
        for m in marbles { drop(m) }
    }

    /// Tap a position — returns the topmost marble under it (for popover).
    func hitTest(_ point: CGPoint) -> Body? {
        bodies.reversed().first { hypot($0.pos.x - point.x, $0.pos.y - point.y) <= $0.radius + 4 }
    }

    /// Advance the simulation. Called from TimelineView each frame.
    func step(now: CFTimeInterval) {
        let raw = max(0, min(1.0 / 30.0, now - lastTick))   // clamp dt to avoid tunneling
        lastTick = now
        let dt = CGFloat(raw)
        guard dt > 0 else { return }

        for i in bodies.indices {
            // Integrate
            bodies[i].vel.dy += gravity * dt
            bodies[i].vel.dx *= airDamping
            bodies[i].vel.dy *= airDamping
            bodies[i].pos.x += bodies[i].vel.dx * dt
            bodies[i].pos.y += bodies[i].vel.dy * dt
        }

        resolveJarCollisions()
        resolveMarbleCollisions()
    }

    private func resolveJarCollisions() {
        for i in bodies.indices {
            let r = bodies[i].radius
            // Left wall
            if bodies[i].pos.x < r {
                bodies[i].pos.x = r
                if bodies[i].vel.dx < 0 { bodies[i].vel.dx = -bodies[i].vel.dx * restitution }
            }
            // Right wall
            if bodies[i].pos.x > jarSize.width - r {
                bodies[i].pos.x = jarSize.width - r
                if bodies[i].vel.dx > 0 { bodies[i].vel.dx = -bodies[i].vel.dx * restitution }
            }
            // Floor
            if bodies[i].pos.y > jarSize.height - r {
                bodies[i].pos.y = jarSize.height - r
                if bodies[i].vel.dy > 0 {
                    bodies[i].vel.dy = -bodies[i].vel.dy * restitution
                    bodies[i].vel.dx *= floorFriction
                }
            }
        }
    }

    private func resolveMarbleCollisions() {
        let n = bodies.count
        guard n > 1 else { return }
        for i in 0..<(n - 1) {
            for j in (i + 1)..<n {
                let dx = bodies[j].pos.x - bodies[i].pos.x
                let dy = bodies[j].pos.y - bodies[i].pos.y
                let dist = sqrt(dx * dx + dy * dy)
                let minDist = bodies[i].radius + bodies[j].radius
                guard dist > 0, dist < minDist else { continue }

                let nx = dx / dist
                let ny = dy / dist
                let overlap = (minDist - dist) / 2
                bodies[i].pos.x -= nx * overlap
                bodies[i].pos.y -= ny * overlap
                bodies[j].pos.x += nx * overlap
                bodies[j].pos.y += ny * overlap

                // Equal mass impulse exchange along the contact normal.
                let rvx = bodies[j].vel.dx - bodies[i].vel.dx
                let rvy = bodies[j].vel.dy - bodies[i].vel.dy
                let velAlongNormal = rvx * nx + rvy * ny
                guard velAlongNormal < 0 else { continue }
                let jImpulse = -(1 + restitution) * velAlongNormal / 2
                bodies[i].vel.dx -= jImpulse * nx
                bodies[i].vel.dy -= jImpulse * ny
                bodies[j].vel.dx += jImpulse * nx
                bodies[j].vel.dy += jImpulse * ny
            }
        }
    }
}
