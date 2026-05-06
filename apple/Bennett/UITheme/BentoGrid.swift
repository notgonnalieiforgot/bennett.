import SwiftUI
import UniformTypeIdentifiers

/// Bennett's home Bento Grid. Drives the home screen, the Doer Tab, and the
/// onboarding moment. Tiles can be reordered via long-press → drag.
///
/// Responsive column count: 2 in horizontal-size-class .compact (iPhone),
/// 4 in .regular (iPad / Mac Catalyst / landscape large iPhones).
struct BentoGrid<Item: Identifiable & Equatable, Content: View>: View {
    @Binding var items: [Item]
    let size: (Item) -> BentoTileSize
    let content: (Item) -> Content

    #if os(iOS)
    @Environment(\.horizontalSizeClass) private var sizeClass
    #endif
    @State private var draggingId: Item.ID?

    private var columns: Int {
        #if os(macOS)
        return 4
        #else
        return sizeClass == .regular ? 4 : 2
        #endif
    }

    var body: some View {
        BentoLayout(columns: columns) {
            ForEach(items) { item in
                content(item)
                    .bentoSize(size(item))
                    .opacity(draggingId == item.id ? 0.3 : 1.0)
                    .onDrag {
                        draggingId = item.id
                        return NSItemProvider(object: "\(item.id)" as NSString)
                    }
                    .onDrop(
                        of: [UTType.text],
                        delegate: BentoDropDelegate(
                            target: item,
                            items: $items,
                            draggingId: $draggingId
                        )
                    )
            }
        }
        .animation(.spring(response: 0.32, dampingFraction: 0.8), value: items)
    }
}

private struct BentoDropDelegate<Item: Identifiable & Equatable>: DropDelegate {
    let target: Item
    @Binding var items: [Item]
    @Binding var draggingId: Item.ID?

    func dropEntered(info: DropInfo) {
        guard
            let id = draggingId,
            id != target.id,
            let from = items.firstIndex(where: { $0.id == id }),
            let to = items.firstIndex(of: target)
        else { return }
        if from != to {
            withAnimation(.spring(response: 0.32, dampingFraction: 0.8)) {
                items.move(fromOffsets: IndexSet(integer: from),
                           toOffset: to > from ? to + 1 : to)
            }
        }
    }

    func dropUpdated(info: DropInfo) -> DropProposal? {
        DropProposal(operation: .move)
    }

    func performDrop(info: DropInfo) -> Bool {
        draggingId = nil
        return true
    }
}
