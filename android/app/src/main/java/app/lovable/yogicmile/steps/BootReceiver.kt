package app.lovable.yogicmile.steps

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build

class BootReceiver : BroadcastReceiver() {
    
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED ||
            intent.action == "android.intent.action.QUICKBOOT_POWERON") {
            
            val prefs = context.getSharedPreferences("StepTracking", Context.MODE_PRIVATE)
            val wasActive = prefs.getBoolean("service_active", false)
            
            if (wasActive) {
                val serviceIntent = Intent(context, StepCounterService::class.java).apply {
                    putExtra("notificationTitle", "Yogic Mile")
                    putExtra("notificationText", "Tracking resumed after reboot")
                }
                
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(serviceIntent)
                } else {
                    context.startService(serviceIntent)
                }
            }
        }
    }
}
