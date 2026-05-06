import Foundation

extension ISO8601DateFormatter {
    /// Shared `YYYY-MM-DD` formatter for day keys (marble dates, redemption
    /// attempt ids, double-lock completion records).
    static let dayFormatter: DateFormatter = {
        let f = DateFormatter()
        f.calendar = Calendar(identifier: .iso8601)
        f.timeZone = .current
        f.dateFormat = "yyyy-MM-dd"
        return f
    }()
}
