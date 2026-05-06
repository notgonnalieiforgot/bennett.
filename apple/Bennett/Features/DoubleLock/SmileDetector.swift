import Foundation
import AVFoundation
import Vision
import Combine
import CoreImage

/// Owns an AVCaptureSession + Vision face-landmark request. Publishes
/// `faceFound` and `smileRatio`. Smile is heuristically defined as
/// mouth_width / mouth_height ≥ a threshold (per spec §5a step 1: "cheek
/// raise + lip corner pull"). Pure-Swift, multi-platform — works on iOS
/// (front camera) and macOS (built-in webcam).
@MainActor
final class SmileDetector: NSObject, ObservableObject {
    @Published private(set) var faceFound: Bool = false
    @Published private(set) var smileRatio: Double = 0.0
    @Published private(set) var isSmiling: Bool = false
    @Published private(set) var lastError: String?

    /// Caller observes this to drive UI preview.
    let session = AVCaptureSession()

    /// Threshold for mouth_width / mouth_height. ~3.0 reads as a relaxed
    /// closed mouth; ~4.0+ is a clear smile. Tuned on calibration data.
    private let smileThreshold: Double = 3.6

    private let queue = DispatchQueue(label: "bn.smile.detector")
    private let videoOutput = AVCaptureVideoDataOutput()
    private let landmarksRequest = VNDetectFaceLandmarksRequest()

    func start() async throws {
        let camStatus = PermissionsService.shared.cameraStatus()
        if camStatus == .notDetermined {
            _ = await PermissionsService.shared.requestCamera()
        }
        guard PermissionsService.shared.cameraStatus() == .authorized else {
            throw NSError(domain: "bn.smile", code: 1,
                          userInfo: [NSLocalizedDescriptionKey: "camera access denied"])
        }
        try await Task.detached { [weak self] in
            try await self?.configureSessionOffMain()
        }.value
        Task.detached { [session] in
            session.startRunning()
        }
    }

    func stop() {
        Task.detached { [session] in
            if session.isRunning { session.stopRunning() }
        }
    }

    nonisolated private func configureSessionOffMain() async throws {
        let session = await self.session
        session.beginConfiguration()
        session.sessionPreset = .vga640x480

        #if os(iOS)
        let device = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .front)
        #else
        let device = AVCaptureDevice.default(for: .video)
        #endif
        guard let device else {
            throw NSError(domain: "bn.smile", code: 2,
                          userInfo: [NSLocalizedDescriptionKey: "no camera found"])
        }
        let input = try AVCaptureDeviceInput(device: device)
        if session.canAddInput(input) { session.addInput(input) }

        let output = await self.videoOutput
        output.alwaysDiscardsLateVideoFrames = true
        output.videoSettings = [
            kCVPixelBufferPixelFormatTypeKey as String: Int(kCVPixelFormatType_32BGRA)
        ]
        output.setSampleBufferDelegate(self, queue: await self.queue)
        if session.canAddOutput(output) { session.addOutput(output) }

        session.commitConfiguration()
    }
}

extension SmileDetector: AVCaptureVideoDataOutputSampleBufferDelegate {
    nonisolated func captureOutput(
        _ output: AVCaptureOutput,
        didOutput sampleBuffer: CMSampleBuffer,
        from connection: AVCaptureConnection
    ) {
        guard let pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else { return }
        let handler = VNImageRequestHandler(
            cvPixelBuffer: pixelBuffer,
            orientation: .leftMirrored,
            options: [:]
        )
        let request = VNDetectFaceLandmarksRequest()
        do {
            try handler.perform([request])
        } catch {
            Task { @MainActor in self.lastError = error.localizedDescription }
            return
        }
        let face = (request.results ?? []).first
        guard let face,
              let lips = face.landmarks?.outerLips,
              lips.normalizedPoints.count >= 6
        else {
            Task { @MainActor in
                self.faceFound = false
                self.isSmiling = false
            }
            return
        }
        let pts = lips.normalizedPoints
        let xs = pts.map { $0.x }
        let ys = pts.map { $0.y }
        guard
            let minX = xs.min(), let maxX = xs.max(),
            let minY = ys.min(), let maxY = ys.max(),
            maxY > minY
        else { return }
        let width = Double(maxX - minX)
        let height = Double(maxY - minY)
        let ratio = height > 0 ? width / height : 0
        let smiling = ratio >= self.smileThreshold
        Task { @MainActor in
            self.faceFound = true
            self.smileRatio = ratio
            self.isSmiling = smiling
        }
    }
}
