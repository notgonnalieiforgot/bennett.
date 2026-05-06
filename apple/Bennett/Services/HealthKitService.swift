#if os(iOS)
import Foundation
import HealthKit

/// Per Critical Rule #13: HealthKit is iOS-only. This whole file is wrapped
/// in `#if os(iOS)`. macOS imports `RedemptionTrial.swift` and gets a
/// "switch to iphone" framing for Bio-Shock.
@MainActor
final class HealthKitService {
    static let shared = HealthKitService()
    private let store = HKHealthStore()

    private init() {}

    var isAvailable: Bool { HKHealthStore.isHealthDataAvailable() }

    func requestAuthorization() async throws {
        guard isAvailable else { throw NSError(domain: "bn.health", code: 1) }
        let read: Set<HKObjectType> = [
            HKObjectType.quantityType(forIdentifier: .heartRate)!,
            HKObjectType.quantityType(forIdentifier: .stepCount)!,
            HKObjectType.workoutType(),
        ]
        try await store.requestAuthorization(toShare: [], read: read)
    }

    /// Bio-Shock pass condition (per spec §8b option 1):
    /// a walking/running workout, OR sustained HR > 130 for 5+ minutes,
    /// in the last `withinHours` hours.
    func bioShockPassed(withinHours: Double = 6) async throws -> Bool {
        let now = Date()
        let from = now.addingTimeInterval(-withinHours * 3600)
        if try await hasRecentWorkout(from: from, to: now) { return true }
        if try await hasSustainedHighHR(from: from, to: now) { return true }
        return false
    }

    private func hasRecentWorkout(from: Date, to: Date) async throws -> Bool {
        let workoutType = HKObjectType.workoutType()
        let predicate = HKQuery.predicateForSamples(withStart: from, end: to)
        let workouts: [HKWorkout] = try await withCheckedThrowingContinuation { cont in
            let q = HKSampleQuery(
                sampleType: workoutType,
                predicate: predicate,
                limit: HKObjectQueryNoLimit,
                sortDescriptors: nil
            ) { _, samples, error in
                if let error { cont.resume(throwing: error); return }
                cont.resume(returning: (samples as? [HKWorkout]) ?? [])
            }
            store.execute(q)
        }
        // Count any 5+ minute walk/run as qualifying.
        for w in workouts {
            let okType = w.workoutActivityType == .walking
                       || w.workoutActivityType == .running
                       || w.workoutActivityType == .hiking
            if okType && w.duration >= 5 * 60 { return true }
        }
        return false
    }

    private func hasSustainedHighHR(from: Date, to: Date, threshold: Double = 130) async throws -> Bool {
        guard let hrType = HKObjectType.quantityType(forIdentifier: .heartRate) else { return false }
        let predicate = HKQuery.predicateForSamples(withStart: from, end: to)
        let samples: [HKQuantitySample] = try await withCheckedThrowingContinuation { cont in
            let q = HKSampleQuery(
                sampleType: hrType,
                predicate: predicate,
                limit: HKObjectQueryNoLimit,
                sortDescriptors: [NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: true)]
            ) { _, samples, error in
                if let error { cont.resume(throwing: error); return }
                cont.resume(returning: (samples as? [HKQuantitySample]) ?? [])
            }
            store.execute(q)
        }
        // Find any 5+ minute window where every sample is >= threshold.
        let unit = HKUnit.count().unitDivided(by: .minute())
        var windowStart: Date?
        for s in samples {
            let bpm = s.quantity.doubleValue(for: unit)
            if bpm >= threshold {
                if windowStart == nil { windowStart = s.startDate }
                if let ws = windowStart, s.endDate.timeIntervalSince(ws) >= 5 * 60 {
                    return true
                }
            } else {
                windowStart = nil
            }
        }
        return false
    }
}
#endif
