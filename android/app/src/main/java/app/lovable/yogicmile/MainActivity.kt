package app.lovable.yogicmile

import android.os.Bundle
import com.getcapacitor.BridgeActivity
import app.lovable.yogicmile.steps.BackgroundStepTrackingPlugin

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Register custom plugins
        registerPlugin(BackgroundStepTrackingPlugin::class.java)
    }
}
