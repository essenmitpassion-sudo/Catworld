package stream.soundweave.udi;

import android.Manifest;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.speech.RecognitionListener;
import android.speech.RecognitionSupport;
import android.speech.RecognitionSupportCallback;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import java.util.ArrayList;

@CapacitorPlugin(name = "NativeSpeech", permissions = {
    @Permission(alias = "microphone", strings = { Manifest.permission.RECORD_AUDIO })
})
public class NativeSpeechPlugin extends Plugin {
    private final Handler main = new Handler(Looper.getMainLooper());
    private final Runnable timeout = () -> finish("timeout", null);
    private final StringBuilder segments = new StringBuilder();
    private SpeechRecognizer recognizer;
    private PluginCall active;
    private Intent intent;
    private boolean started;

    @PluginMethod
    public void recognize(PluginCall call) {
        main.post(() -> begin(call));
    }

    private void begin(PluginCall call) {
        String locale = call.getString("locale");
        if (!"de-DE".equals(locale) && !"en-GB".equals(locale)) {
            reply(call, "unsupported", null);
            return;
        }
        if (active != null) {
            reply(call, "busy", null);
            return;
        }
        // API 33 is the first version that can confirm an installed language.
        if (Build.VERSION.SDK_INT < 33) {
            reply(call, "unsupported", null);
            return;
        }
        active = call;
        main.postDelayed(timeout, 45000);
        try {
            if (!SpeechRecognizer.isOnDeviceRecognitionAvailable(getContext())) {
                finish("unsupported", null);
                return;
            }
            recognizer = SpeechRecognizer.createOnDeviceSpeechRecognizer(getContext());
            recognizer.setRecognitionListener(listenerFor(call));
            intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH)
                .putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                .putExtra(RecognizerIntent.EXTRA_LANGUAGE, locale)
                .putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1);
            recognizer.checkRecognitionSupport(intent, getContext().getMainExecutor(), new RecognitionSupportCallback() {
                @Override public void onSupportResult(RecognitionSupport support) {
                    if (active != call) return;
                    boolean installed = support.getInstalledOnDeviceLanguages().stream()
                        .anyMatch(language -> locale.equalsIgnoreCase(language.replace('_', '-')));
                    if (!installed) finish("unsupported", null);
                    else if (getPermissionState("microphone") == PermissionState.GRANTED) listen();
                    else if (getPermissionState("microphone") == PermissionState.DENIED) finish("denied", null);
                    else requestPermissionForAlias("microphone", call, "microphoneResult");
                }
                @Override public void onError(int error) {
                    if (active == call) finish("unsupported", null);
                }
            });
        } catch (RuntimeException error) {
            finish("error", null);
        }
    }

    @PermissionCallback
    private void microphoneResult(PluginCall call) {
        main.post(() -> {
            if (active != call) return;
            if (getPermissionState("microphone") == PermissionState.GRANTED) listen();
            else finish("denied", null);
        });
    }

    private void listen() {
        try {
            // Local engines may fall back to a single result. Keep both callback paths.
            Intent request = new Intent(intent)
                .putExtra(RecognizerIntent.EXTRA_SEGMENTED_SESSION,
                    RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS)
                .putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, 4000L);
            recognizer.startListening(request);
            started = true;
        } catch (RuntimeException error) {
            finish("error", null);
        }
    }

    @PluginMethod
    public void stop(PluginCall call) {
        main.post(() -> {
            if (matches(call) && started) {
                main.removeCallbacks(timeout);
                main.postDelayed(timeout, 4000);
                try {
                    recognizer.stopListening();
                } catch (RuntimeException error) {
                    finish("error", null);
                }
            }
            call.resolve();
        });
    }

    @PluginMethod
    public void cancel(PluginCall call) {
        main.post(() -> {
            if (matches(call)) finish("cancelled", null);
            call.resolve();
        });
    }

    private boolean matches(PluginCall call) {
        String id = call.getString("id");
        return active != null && id != null && id.equals(active.getString("id"));
    }

    @Override protected void handleOnPause() {
        main.post(() -> {
            if (started) finish("cancelled", null);
        });
    }

    @Override protected void handleOnStop() {
        main.post(() -> finish("cancelled", null));
    }

    @Override protected void handleOnDestroy() {
        main.post(() -> finish("cancelled", null));
    }

    private RecognitionListener listenerFor(PluginCall call) {
        return new RecognitionListener() {
            @Override public void onReadyForSpeech(Bundle params) {
                if (active != call) return;
                JSObject event = new JSObject();
                event.put("id", call.getString("id"));
                event.put("status", "listening");
                notifyListeners("speechState", event);
            }
            @Override public void onEndOfSpeech() {}
            @Override public void onResults(Bundle results) {
                if (active != call) return;
                String text = segments.length() > 0 ? segments.toString() : bestText(results);
                finish(text == null ? "empty" : "transcript", text);
            }
            @Override public void onSegmentResults(Bundle results) {
                if (active != call) return;
                String text = bestText(results);
                if (text == null) return;
                if (segments.length() > 0) segments.append(' ');
                segments.append(text);
            }
            @Override public void onEndOfSegmentedSession() {
                if (active != call) return;
                String text = segments.length() > 0 ? segments.toString() : null;
                finish(text == null ? "empty" : "transcript", text);
            }
            @Override public void onError(int error) {
                if (active != call) return;
                String status;
                switch (error) {
                    case SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS: status = "denied"; break;
                    case SpeechRecognizer.ERROR_LANGUAGE_NOT_SUPPORTED:
                    case SpeechRecognizer.ERROR_LANGUAGE_UNAVAILABLE: status = "unsupported"; break;
                    case SpeechRecognizer.ERROR_SPEECH_TIMEOUT:
                    case SpeechRecognizer.ERROR_NO_MATCH: status = "empty"; break;
                    default: status = "error";
                }
                finish(status, null);
            }
            @Override public void onBeginningOfSpeech() {}
            @Override public void onRmsChanged(float rms) {}
            @Override public void onBufferReceived(byte[] buffer) {}
            @Override public void onPartialResults(Bundle partial) {}
            @Override public void onEvent(int type, Bundle params) {}
        };
    }

    private String bestText(Bundle results) {
        ArrayList<String> candidates = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
        if (candidates == null || candidates.isEmpty() || candidates.get(0) == null) return null;
        String text = candidates.get(0).trim();
        return text.isEmpty() ? null : text;
    }

    private void finish(String status, String text) {
        PluginCall call = active;
        active = null;
        if (segments.length() > 0 && ("timeout".equals(status) || "error".equals(status) || "empty".equals(status))) {
            status = "partial-transcript";
            text = segments.toString();
        }
        segments.setLength(0);
        started = false;
        intent = null;
        main.removeCallbacks(timeout);
        if (recognizer != null) {
            SpeechRecognizer current = recognizer;
            recognizer = null;
            try {
                current.destroy();
            } catch (RuntimeException ignored) {
                // The recognition service may already have disappeared.
            }
        }
        if (call != null) reply(call, status, text);
    }

    private void reply(PluginCall call, String status, String text) {
        JSObject response = new JSObject();
        response.put("status", status);
        if (text != null) response.put("text", text);
        call.resolve(response);
    }
}
