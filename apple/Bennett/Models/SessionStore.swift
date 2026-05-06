import Foundation
import Combine

@MainActor
final class SessionStore: ObservableObject {
    @Published var user: UserRecord?
    @Published var isAuthenticated: Bool = false
    @Published var energyPulseToday: Int?

    func setUser(_ user: UserRecord?) {
        self.user = user
        self.isAuthenticated = user != nil
    }
}
