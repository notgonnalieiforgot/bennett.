import Foundation
import AVFoundation
import Speech
import Combine

/// SFSpeechRecognizer wrapper. Streams partial transcripts via @Published
/// `transcript` and signals match via `matchScore` (0..1).
@MainActor
final class VocalRecognizer: ObservableObject {
    @Published private(set) var transcript: String = ""
    @Published private(set) var matchScore: Double = 0.0
    @Published private(set) var isRunning: Bool = false
    @Published private(set) var lastError: String?

    private let target: String
    private let recognizer: SFSpeechRecognizer? = SFSpeechRecognizer(locale: .init(identifier: "en-US"))
    private let audioEngine = AVAudioEngine()
    private var request: SFSpeechAudioBufferRecognitionRequest?
    private var task: SFSpeechRecognitionTask?

    init(target: String) {
        self.target = target
    }

    func start() async throws {
        if PermissionsService.shared.speechStatus() == .notDetermined {
            _ = await PermissionsService.shared.requestSpeech()
        }
        guard PermissionsService.shared.speechStatus() == .authorized else {
            throw err("speech recognition not authorized")
        }
        if PermissionsService.shared.microphoneStatus() == .notDetermined {
            _ = await PermissionsService.shared.requestMicrophone()
        }
        guard PermissionsService.shared.microphoneStatus() == .authorized else {
            throw err("microphone access denied")
        }
        guard let recognizer, recognizer.isAvailable else {
            throw err("speech recognizer unavailable")
        }

        #if os(iOS)
        let session = AVAudioSession.sharedInstance()
        try session.setCategory(.record, mode: .measurement, options: .duckOthers)
        try session.setActive(true, options: .notifyOthersOnDeactivation)
        #endif

        let req = SFSpeechAudioBufferRecognitionRequest()
        req.shouldReportPartialResults = true
        request = req

        let inputNode = audioEngine.inputNode
        let format = inputNode.outputFormat(forBus: 0)
        inputNode.removeTap(onBus: 0)
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: format) { [weak req] buffer, _ in
            req?.append(buffer)
        }

        audioEngine.prepare()
        try audioEngine.start()
        isRunning = true

        task = recognizer.recognitionTask(with: req) { [weak self] result, error in
            guard let self else { return }
            Task { @MainActor in
                if let result {
                    self.transcript = result.bestTranscription.formattedString
                    self.matchScore = Self.score(self.transcript, target: self.target)
                }
                if let error {
                    self.lastError = error.localizedDescription
                }
            }
        }
    }

    func stop() {
        if audioEngine.isRunning {
            audioEngine.stop()
            audioEngine.inputNode.removeTap(onBus: 0)
        }
        request?.endAudio()
        task?.cancel()
        task = nil
        request = nil
        isRunning = false
    }

    private func err(_ msg: String) -> NSError {
        NSError(domain: "bn.vocal", code: 1, userInfo: [NSLocalizedDescriptionKey: msg])
    }

    /// Word-level Jaccard similarity. Lowercases, strips punctuation, splits
    /// on whitespace, computes |intersection| / |union|. Robust to extra
    /// filler words.
    static func score(_ heard: String, target: String) -> Double {
        let normalize: (String) -> [String] = { s in
            s.lowercased()
                .components(separatedBy: CharacterSet.alphanumerics.inverted)
                .filter { !$0.isEmpty }
        }
        let h = Set(normalize(heard))
        let t = Set(normalize(target))
        guard !t.isEmpty else { return 0 }
        let inter = h.intersection(t).count
        let union = h.union(t).count
        return union == 0 ? 0 : Double(inter) / Double(union)
    }
}
