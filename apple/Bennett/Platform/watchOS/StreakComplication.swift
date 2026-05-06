#if os(watchOS)
import WidgetKit
import SwiftUI

/// Phase 6.7 — Watch face complication showing the user's streak.
/// Implemented as a WidgetKit widget so it works on both the Smart Stack
/// and as a complication.
///
/// Streak is read from the App Group shared UserDefaults — the watch
/// app writes it on each Firestore listener tick. Phase 7 will replace
/// the App Group with a more robust shared state mechanism.
struct StreakProvider: TimelineProvider {
    func placeholder(in context: Context) -> StreakEntry {
        StreakEntry(date: .now, streak: 0)
    }
    func getSnapshot(in context: Context, completion: @escaping (StreakEntry) -> Void) {
        completion(StreakEntry(date: .now, streak: cachedStreak()))
    }
    func getTimeline(in context: Context, completion: @escaping (Timeline<StreakEntry>) -> Void) {
        let entry = StreakEntry(date: .now, streak: cachedStreak())
        completion(Timeline(entries: [entry], policy: .after(.now.addingTimeInterval(15 * 60))))
    }
    private func cachedStreak() -> Int {
        let defaults = UserDefaults(suiteName: "group.com.bennett.cos") ?? .standard
        return defaults.integer(forKey: "bn.currentStreak")
    }
}

struct StreakEntry: TimelineEntry {
    let date: Date
    let streak: Int
}

struct StreakComplicationView: View {
    let entry: StreakEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {
        case .accessoryCircular:
            ZStack {
                AccessoryWidgetBackground()
                Text("\(entry.streak)")
                    .font(.system(size: 22, weight: .heavy, design: .rounded))
            }
        case .accessoryCorner:
            Text("🔒 \(entry.streak)")
                .font(.system(size: 14, weight: .bold))
        case .accessoryRectangular:
            VStack(alignment: .leading) {
                Text("bennett")
                    .font(.caption2)
                Text("🔒 \(entry.streak)d streak")
                    .font(.headline)
            }
        case .accessoryInline:
            Text("🔒 \(entry.streak)")
        default:
            Text("\(entry.streak)")
        }
    }
}

@main
struct StreakComplication: Widget {
    let kind = "StreakComplication"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: StreakProvider()) { entry in
            StreakComplicationView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("bennett streak")
        .description("ur current double-lock streak.")
        .supportedFamilies([
            .accessoryCircular,
            .accessoryCorner,
            .accessoryInline,
            .accessoryRectangular,
        ])
    }
}
#endif
