import Foundation
import AVFoundation
import Speech
#if os(macOS)
import AppKit
#endif

/// Centralized permission requests for camera, microphone, and speech
/// recognition. Per Critical Rule #7, on macOS we proactively prompt for
/// camera + microphone on first launch (the iOS pattern is just-in-time).
@MainActor
final class PermissionsService {
    static let shared = PermissionsService()

    private let firstLaunchKey = "bn.permissions.firstLaunchPrompted"

    enum Status: Sendable {
        case authorized, denied, restricted, notDetermined

        init(av: AVAuthorizationStatus) {
            switch av {
            case .authorized: self = .authorized
            case .denied: self = .denied
            case .restricted: self = .restricted
            case .notDetermined: self = .notDetermined
            @unknown default: self = .denied
            }
        }

        init(speech: SFSpeechRecognizerAuthorizationStatus) {
            switch speech {
            case .authorized: self = .authorized
            case .denied: self = .denied
            case .restricted: self = .restricted
            case .notDetermined: self = .notDetermined
            @unknown default: self = .denied
            }
        }
    }

    func cameraStatus() -> Status {
        Status(av: AVCaptureDevice.authorizationStatus(for: .video))
    }

    func microphoneStatus() -> Status {
        Status(av: AVCaptureDevice.authorizationStatus(for: .audio))
    }

    func speechStatus() -> Status {
        Status(speech: SFSpeechRecognizer.authorizationStatus())
    }

    func requestCamera() async -> Status {
        let granted = await AVCaptureDevice.requestAccess(for: .video)
        return granted ? .authorized : .denied
    }

    func requestMicrophone() async -> Status {
        let granted = await AVCaptureDevice.requestAccess(for: .audio)
        return granted ? .authorized : .denied
    }

    func requestSpeech() async -> Status {
        await withCheckedContinuation { cont in
            SFSpeechRecognizer.requestAuthorization { status in
                cont.resume(returning: Status(speech: status))
            }
        }
    }

    /// macOS Critical Rule #7: prompt for camera + mic on first launch.
    /// Idempotent — uses UserDefaults flag.
    func promptOnFirstLaunchIfNeeded() async {
        #if os(macOS)
        let defaults = UserDefaults.standard
        guard !defaults.bool(forKey: firstLaunchKey) else { return }
        defaults.set(true, forKey: firstLaunchKey)
        _ = await requestCamera()
        _ = await requestMicrophone()
        #endif
    }
}
