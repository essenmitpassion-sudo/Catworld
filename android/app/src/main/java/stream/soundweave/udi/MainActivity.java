package stream.soundweave.udi;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle state) {
        registerPlugin(NativeSpeechPlugin.class);
        super.onCreate(state);
    }
}
