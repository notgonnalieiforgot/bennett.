import SwiftUI

/// Greedy bin-packer for the Bento Grid. Tiles consume `(cols, rows)` cells
/// where each cell is a square in a `columns`-wide grid. Wide tiles never
/// overflow the column count — they get clamped via `BentoTileSize.columns(in:)`.
struct BentoLayout: Layout {
    var columns: Int
    var spacing: CGFloat = 12

    struct Cache {
        var placements: [Placement] = []
        var totalRows: Int = 0
        var cellSize: CGSize = .zero
        var lastWidth: CGFloat = 0
    }

    struct Placement {
        let row: Int
        let col: Int
        let cols: Int
        let rows: Int
    }

    func makeCache(subviews: Subviews) -> Cache { Cache() }

    func updateCache(_ cache: inout Cache, subviews: Subviews) {
        cache.placements = []
        cache.totalRows = 0
    }

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout Cache) -> CGSize {
        let width = proposal.replacingUnspecifiedDimensions().width
        recompute(in: width, subviews: subviews, cache: &cache)
        let h = CGFloat(cache.totalRows) * cache.cellSize.height
              + CGFloat(max(0, cache.totalRows - 1)) * spacing
        return CGSize(width: width, height: h)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout Cache) {
        if cache.lastWidth != bounds.width || cache.placements.count != subviews.count {
            recompute(in: bounds.width, subviews: subviews, cache: &cache)
        }
        for (i, p) in cache.placements.enumerated() {
            let x = bounds.minX + CGFloat(p.col) * (cache.cellSize.width + spacing)
            let y = bounds.minY + CGFloat(p.row) * (cache.cellSize.height + spacing)
            let w = CGFloat(p.cols) * cache.cellSize.width + CGFloat(p.cols - 1) * spacing
            let h = CGFloat(p.rows) * cache.cellSize.height + CGFloat(p.rows - 1) * spacing
            subviews[i].place(
                at: CGPoint(x: x, y: y),
                anchor: .topLeading,
                proposal: ProposedViewSize(width: w, height: h)
            )
        }
    }

    private func recompute(in width: CGFloat, subviews: Subviews, cache: inout Cache) {
        guard columns > 0 else { return }
        let totalSpacing = CGFloat(columns - 1) * spacing
        let cellWidth = max(0, (width - totalSpacing) / CGFloat(columns))
        cache.cellSize = CGSize(width: cellWidth, height: cellWidth)
        cache.lastWidth = width

        var grid: [[Bool]] = []
        var placements: [Placement] = []
        placements.reserveCapacity(subviews.count)

        for sub in subviews {
            let size = sub.bentoSize
            let needCols = max(1, min(columns, size.columns(in: columns)))
            let needRows = max(1, size.rows)
            let placement = firstFit(grid: &grid, columns: columns, w: needCols, h: needRows)
            placements.append(placement)
        }

        cache.placements = placements
        cache.totalRows = grid.count
    }

    private func firstFit(grid: inout [[Bool]], columns: Int, w: Int, h: Int) -> Placement {
        var row = 0
        while true {
            for col in 0...(columns - w) {
                if fits(grid: grid, columns: columns, row: row, col: col, w: w, h: h) {
                    while grid.count < row + h {
                        grid.append(Array(repeating: false, count: columns))
                    }
                    for r in row..<(row + h) {
                        for c in col..<(col + w) {
                            grid[r][c] = true
                        }
                    }
                    return Placement(row: row, col: col, cols: w, rows: h)
                }
            }
            row += 1
        }
    }

    private func fits(grid: [[Bool]], columns: Int, row: Int, col: Int, w: Int, h: Int) -> Bool {
        for r in row..<(row + h) {
            if r >= grid.count { return true }
            let rowArr = grid[r]
            for c in col..<(col + w) {
                if rowArr[c] { return false }
            }
        }
        return true
    }
}
