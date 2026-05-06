import Foundation

/// Phase 2 demo seed so the Marble Jar can be eyeballed before Firestore
/// is wired up. Mirrors the shape of `SEED_MARBLES` on the web side.
enum SeedMarbles {
    static let demo: [Marble] = (1...14).map { day in
        let kind: MarbleKind = {
            if day == 7 { return .gold }
            if day == 12 { return .ghost }
            return .clear
        }()
        return Marble(
            id: "seed-\(day)",
            kind: kind,
            earnedAt: Date.now.timeIntervalSince1970 * 1000,
            date: String(format: "2026-04-%02d", day),
            moduleCompleted: kind == .ghost ? nil : "fitness"
        )
    }
}
