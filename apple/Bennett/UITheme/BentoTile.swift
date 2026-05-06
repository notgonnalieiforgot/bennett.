import SwiftUI

enum BentoTileSize: String, Codable, CaseIterable, Sendable {
    case small  // 1x1
    case medium // 2x1
    case large  // 2x2
    case wide   // 3x1

    func columns(in totalColumns: Int) -> Int {
        switch self {
        case .small:  return 1
        case .medium: return min(2, totalColumns)
        case .large:  return min(2, totalColumns)
        case .wide:   return min(3, totalColumns)
        }
    }

    var rows: Int {
        switch self {
        case .small, .medium, .wide: return 1
        case .large: return 2
        }
    }
}

private struct BentoTileSizeKey: LayoutValueKey {
    static let defaultValue: BentoTileSize = .small
}

extension View {
    /// Tag a tile with the size the BentoLayout should reserve for it.
    func bentoSize(_ size: BentoTileSize) -> some View {
        layoutValue(key: BentoTileSizeKey.self, value: size)
    }
}

extension LayoutSubview {
    var bentoSize: BentoTileSize { self[BentoTileSizeKey.self] }
}
