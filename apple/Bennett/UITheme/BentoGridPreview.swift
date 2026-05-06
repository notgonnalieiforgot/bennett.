import SwiftUI

/// Smoke-test view for Phase 1 — drop into RootView to eyeball the grid.
/// Demonstrates all 4 tile sizes + reorder.
struct BentoGridPreview: View {
    @State private var tiles: [DemoTile] = [
        DemoTile(id: "1", title: "marble jar",     size: .large),
        DemoTile(id: "2", title: "energy",         size: .small),
        DemoTile(id: "3", title: "shield",         size: .small),
        DemoTile(id: "4", title: "knowledge bar",  size: .wide),
        DemoTile(id: "5", title: "arena",          size: .medium),
        DemoTile(id: "6", title: "modules",        size: .medium),
        DemoTile(id: "7", title: "bulletin",       size: .small),
        DemoTile(id: "8", title: "settings",       size: .small),
    ]

    var body: some View {
        ScrollView {
            BentoGrid(items: $tiles, size: \.size) { tile in
                VStack(alignment: .leading) {
                    Text(tile.title)
                        .font(.system(size: 14, weight: .semibold))
                    Spacer()
                    Text(tile.size.rawValue)
                        .font(.system(size: 11))
                        .opacity(0.6)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                .bnSurface()
            }
            .padding(16)
        }
    }
}

struct DemoTile: Identifiable, Equatable {
    let id: String
    let title: String
    let size: BentoTileSize
}

#Preview {
    BentoGridPreview()
        .environmentObject(ThemeEngine())
}
