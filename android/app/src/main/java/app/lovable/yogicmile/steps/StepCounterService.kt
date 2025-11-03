package app.lovable.yogicmile.steps

import android.app.*
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import androidx.core.app.NotificationCompat
import androidx.localbroadcastmanager.content.LocalBroadcastManager
import app.lovable.yogicmile.MainActivity
import app.lovable.yogicmile.R
import java.text.SimpleDateFormat
import java.util.*

class StepCounterService : Service(), SensorEventListener {
    
    private lateinit var sensorManager: SensorManager
    private var stepSensor: Sensor? = null
    private var wakeLock: PowerManager.WakeLock? = null
    private var baselineSteps: Int = 0
    private var sessionStartSteps: Int = 0
    private var lastSensorValue: Int = 0
    private var notificationTitle: String = "Yogic Mile"
    private var notificationText: String = "Tracking steps in background"
    
    companion object {
        const val NOTIFICATION_ID = 1001
        const val CHANNEL_ID = "steps"
        const val ACTION_STEPS_UPDATED = "app.lovable.yogicmile.STEPS_UPDATED"
        const val EXTRA_STEPS = "steps"
        const val EXTRA_SESSION_STEPS = "sessionSteps"
        const val EXTRA_TIMESTAMP = "timestamp"
        
        private const val PREFS_NAME = "StepTracking"
        private const val KEY_BASELINE = "baseline_steps"
        private const val KEY_LAST_RESET = "last_reset_date"
        private const val KEY_SERVICE_ACTIVE = "service_active"
        private const val KEY_TODAY_STEPS = "today_steps"
    }
    
    override fun onCreate() {
        super.onCreate()
        sensorManager = getSystemService(Context.SENSOR_SERVICE) as SensorManager
        stepSensor = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER)
        
        // Acquire wake lock
        val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
        wakeLock = powerManager.newWakeLock(
            PowerManager.PARTIAL_WAKE_LOCK,
            "YogicMile::StepCounterWakeLock"
        )
        wakeLock?.acquire(10*60*1000L) // 10 minutes
        
        createNotificationChannel()
        loadPersistedData()
        checkMidnightRollover()
    }
    
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        notificationTitle = intent?.getStringExtra("notificationTitle") ?: "Yogic Mile"
        notificationText = intent?.getStringExtra("notificationText") ?: "Tracking steps in background"
        
        // Start as foreground service
        val notification = buildNotification(0)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(
                NOTIFICATION_ID,
                notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_HEALTH
            )
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }
        
        // Register sensor listener
        stepSensor?.let {
            sensorManager.registerListener(
                this,
                it,
                SensorManager.SENSOR_DELAY_UI
            )
        }
        
        // Mark service as active
        getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .edit()
            .putBoolean(KEY_SERVICE_ACTIVE, true)
            .apply()
        
        return START_STICKY
    }
    
    override fun onBind(intent: Intent?): IBinder? = null
    
    override fun onDestroy() {
        sensorManager.unregisterListener(this)
        wakeLock?.release()
        
        getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .edit()
            .putBoolean(KEY_SERVICE_ACTIVE, false)
            .apply()
        
        super.onDestroy()
    }
    
    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Step Tracking",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Shows your step count while tracking in background"
                setShowBadge(false)
                lockscreenVisibility = Notification.VISIBILITY_PUBLIC
            }
            
            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager.createNotificationChannel(channel)
        }
    }
    
    private fun buildNotification(steps: Int): Notification {
        val notificationIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, notificationIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )
        
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(notificationTitle)
            .setContentText("$steps steps today • $notificationText")
            .setSmallIcon(R.drawable.ic_notification)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setShowWhen(false)
            .build()
    }
    
    private fun updateNotification(steps: Int) {
        val notification = buildNotification(steps)
        val notificationManager = getSystemService(NotificationManager::class.java)
        notificationManager.notify(NOTIFICATION_ID, notification)
    }
    
    private fun loadPersistedData() {
        val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        baselineSteps = prefs.getInt(KEY_BASELINE, -1)
        sessionStartSteps = prefs.getInt(KEY_BASELINE, -1)
        lastSensorValue = prefs.getInt(KEY_BASELINE, -1)
    }
    
    private fun checkMidnightRollover() {
        val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val lastReset = prefs.getString(KEY_LAST_RESET, "")
        val today = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date())
        
        if (lastReset != today) {
            // New day - reset baseline
            baselineSteps = lastSensorValue
            sessionStartSteps = lastSensorValue
            prefs.edit()
                .putInt(KEY_BASELINE, baselineSteps)
                .putString(KEY_LAST_RESET, today)
                .apply()
        }
    }
    
    override fun onSensorChanged(event: SensorEvent?) {
        event?.let {
            if (it.sensor.type == Sensor.TYPE_STEP_COUNTER) {
                val currentSensorValue = it.values[0].toInt()
                
                // First run: initialize baseline to current sensor value
                if (baselineSteps == -1) {
                    baselineSteps = currentSensorValue
                    sessionStartSteps = currentSensorValue
                    lastSensorValue = currentSensorValue
                    
                    // Save initial baseline
                    val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                    prefs.edit()
                        .putInt(KEY_BASELINE, baselineSteps)
                        .putString(KEY_LAST_RESET, SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date()))
                        .apply()
                    
                    // Start with 0 steps
                    saveCurrentState(0)
                    updateNotification(0)
                    
                    val intent = Intent(ACTION_STEPS_UPDATED).apply {
                        putExtra(EXTRA_STEPS, 0)
                        putExtra(EXTRA_SESSION_STEPS, 0)
                        putExtra(EXTRA_TIMESTAMP, System.currentTimeMillis())
                    }
                    LocalBroadcastManager.getInstance(this).sendBroadcast(intent)
                    return
                }
                
                lastSensorValue = currentSensorValue
                val todaySteps = maxOf(0, lastSensorValue - baselineSteps)
                val sessionSteps = maxOf(0, lastSensorValue - sessionStartSteps)
                
                // Save to preferences
                saveCurrentState(todaySteps)
                
                // Broadcast update
                val intent = Intent(ACTION_STEPS_UPDATED).apply {
                    putExtra(EXTRA_STEPS, todaySteps)
                    putExtra(EXTRA_SESSION_STEPS, sessionSteps)
                    putExtra(EXTRA_TIMESTAMP, System.currentTimeMillis())
                }
                LocalBroadcastManager.getInstance(this).sendBroadcast(intent)
                
                // Update notification
                updateNotification(todaySteps)
            }
        }
    }
    
    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {
        // No action needed
    }
    
    private fun saveCurrentState(todaySteps: Int) {
        getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .edit()
            .putInt(KEY_TODAY_STEPS, todaySteps)
            .apply()
    }
}
