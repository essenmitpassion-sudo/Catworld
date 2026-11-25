import AVFoundation
import Capacitor
import Speech
import UIKit

final class UDIViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(NativeSpeechPlugin())
    }
}

@objc(NativeSpeechPlugin)
public final class NativeSpeechPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "NativeSpeechPlugin"
    public let jsName = "NativeSpeech"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "recognize", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stop", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "cancel", returnType: CAPPluginReturnPromise)
    ]

    private var active: CAPPluginCall?
    private var recognizer: SFSpeechRecognizer?
    private var request: SFSpeechAudioBufferRecognitionRequest?
    private var task: SFSpeechRecognitionTask?
    private var engine: AVAudioEngine?
    private var hasTap = false
    private var audioSessionActive = false
    private var limit: DispatchWorkItem?

    public override func load() {
        NotificationCenter.default.addObserver(self, selector: #selector(enteredBackground),
            name: UIScene.didEnterBackgroundNotification, object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(interrupted),
            name: AVAudioSession.interruptionNotification, object: AVAudioSession.sharedInstance())
    }

    @objc private func enteredBackground(_ notification: Notification) {
        DispatchQueue.main.async { self.finish("cancelled") }
    }

    @objc private func interrupted(_ notification: Notification) {
        guard notification.userInfo?[AVAudioSessionInterruptionTypeKey] as? UInt == AVAudioSession.InterruptionType.began.rawValue else { return }
        DispatchQueue.main.async {
            if self.audioSessionActive { self.finish("cancelled") }
        }
    }

    @objc func recognize(_ call: CAPPluginCall) {
        DispatchQueue.main.async { self.begin(call) }
    }

    private func begin(_ call: CAPPluginCall) {
        guard active == nil else { call.resolve(["status": "busy"]); return }
        guard let language = call.getString("locale"), ["de-DE", "en-GB"].contains(language),
              let candidate = SFSpeechRecognizer(locale: Locale(identifier: language)),
              candidate.locale.identifier.replacingOccurrences(of: "_", with: "-").lowercased() == language.lowercased(),
              candidate.supportsOnDeviceRecognition, candidate.isAvailable else {
            call.resolve(["status": "unsupported"])
            return
        }
        active = call
        recognizer = candidate
        setLimit(45)
        switch SFSpeechRecognizer.authorizationStatus() {
        case .authorized:
            requestMicrophone(call)
        case .notDetermined:
            SFSpeechRecognizer.requestAuthorization { [weak self] authorization in
                DispatchQueue.main.async {
                    guard let self = self, self.active === call else { return }
                    if authorization == .authorized { self.requestMicrophone(call) }
                    else { self.finish("denied") }
                }
            }
        default:
            finish("denied")
        }
    }

    private func requestMicrophone(_ call: CAPPluginCall) {
        let onPermission: (Bool) -> Void = { [weak self] allowed in
            DispatchQueue.main.async {
                guard let self = self, self.active === call else { return }
                if allowed { self.listen(call) }
                else { self.finish("denied") }
            }
        }
        if #available(iOS 17.0, *) {
            AVAudioApplication.requestRecordPermission(completionHandler: onPermission)
        } else {
            AVAudioSession.sharedInstance().requestRecordPermission(onPermission)
        }
    }

    private func listen(_ call: CAPPluginCall) {
        guard UIApplication.shared.applicationState != .background else { finish("cancelled"); return }
        guard let recognizer = recognizer, recognizer.supportsOnDeviceRecognition, recognizer.isAvailable else {
            finish("unsupported")
            return
        }
        do {
            let audio = AVAudioSession.sharedInstance()
            try audio.setCategory(.record, mode: .measurement)
            try audio.setActive(true)
            audioSessionActive = true
            let engine = AVAudioEngine()
            self.engine = engine
            let input = engine.inputNode
            let format = input.outputFormat(forBus: 0)
            guard format.sampleRate > 0, format.channelCount > 0 else { finish("error"); return }

            let request = SFSpeechAudioBufferRecognitionRequest()
            request.requiresOnDeviceRecognition = true
            request.shouldReportPartialResults = false
            self.request = request
            task = recognizer.recognitionTask(with: request) { [weak self] result, error in
                DispatchQueue.main.async {
                    guard let self = self, self.active === call else { return }
                    if let result = result, result.isFinal {
                        let text = result.bestTranscription.formattedString
                        self.finish(text.isEmpty ? "empty" : "transcript", text: text)
                    } else if error != nil {
                        self.finish("empty")
                    }
                }
            }
            input.installTap(onBus: 0, bufferSize: 1024, format: format) { buffer, _ in
                request.append(buffer)
            }
            hasTap = true
            engine.prepare()
            try engine.start()
            notifyListeners("speechState", data: ["id": call.getString("id") ?? "", "status": "listening"])
        } catch {
            finish("error")
        }
    }

    @objc func stop(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if self.matches(call), self.engine != nil {
                self.endCapture()
                self.request?.endAudio()
                self.task?.finish()
                self.setLimit(4)
            }
            call.resolve()
        }
    }

    @objc func cancel(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if self.matches(call) { self.finish("cancelled") }
            call.resolve()
        }
    }

    private func matches(_ call: CAPPluginCall) -> Bool {
        guard let id = call.getString("id") else { return false }
        return active?.getString("id") == id
    }

    private func setLimit(_ seconds: TimeInterval) {
        limit?.cancel()
        let work = DispatchWorkItem { [weak self] in self?.finish("timeout") }
        limit = work
        DispatchQueue.main.asyncAfter(deadline: .now() + seconds, execute: work)
    }

    private func endCapture() {
        if let engine = engine {
            engine.stop()
            if hasTap { engine.inputNode.removeTap(onBus: 0) }
        }
        hasTap = false
        engine = nil
        if audioSessionActive {
            try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
            audioSessionActive = false
        }
    }

    private func finish(_ status: String, text: String? = nil) {
        let call = active
        active = nil
        limit?.cancel()
        limit = nil
        endCapture()
        request?.endAudio()
        task?.cancel()
        request = nil
        task = nil
        recognizer = nil
        var response: [String: Any] = ["status": status]
        if let text = text { response["text"] = text }
        call?.resolve(response)
    }
}
