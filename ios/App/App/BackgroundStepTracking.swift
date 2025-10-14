import Foundation
import Capacitor
import CoreMotion

@objc(BackgroundStepTracking)
public class BackgroundStepTracking: CAPPlugin {
    
    private let pedometer = CMPedometer()
    private var isTracking = false
    private var todaySteps: Int = 0
    
    @objc func requestPermissions(_ call: CAPPluginCall) {
        guard CMPedometer.isStepCountingAvailable() else {
            call.reject("Motion tracking not available on this device")
            return
        }
        
        // Check authorization status
        let authStatus = CMPedometer.authorizationStatus()
        
        switch authStatus {
        case .notDetermined:
            // Will trigger Info.plist prompt on first query
            let now = Date()
            
            pedometer.queryPedometerData(from: now, to: now) { data, error in
                if error == nil {
                    let result: [String: Any] = [
                        "activityRecognition": true,
                        "notifications": true,
                        "allGranted": true
                    ]
                    call.resolve(result)
                } else {
                    let result: [String: Any] = [
                        "activityRecognition": false,
                        "notifications": true,
                        "allGranted": false
                    ]
                    call.resolve(result)
                }
            }
            
        case .restricted, .denied:
            let result: [String: Any] = [
                "activityRecognition": false,
                "notifications": true,
                "allGranted": false
            ]
            call.resolve(result)
            
        case .authorized:
            let result: [String: Any] = [
                "activityRecognition": true,
                "notifications": true,
                "allGranted": true
            ]
            call.resolve(result)
            
        @unknown default:
            let result: [String: Any] = [
                "activityRecognition": false,
                "notifications": true,
                "allGranted": false
            ]
            call.resolve(result)
        }
    }
    
    @objc func requestAllPermissions(_ call: CAPPluginCall) {
        // iOS uses the same method for permissions
        requestPermissions(call)
    }
    
    @objc func start(_ call: CAPPluginCall) {
        guard CMPedometer.isStepCountingAvailable() else {
            call.reject("Step counting not available")
            return
        }
        
        let calendar = Calendar.current
        let now = Date()
        guard let midnight = calendar.startOfDay(for: now) as Date? else {
            call.reject("Failed to get midnight time")
            return
        }
        
        isTracking = true
        
        // Start live updates
        pedometer.startUpdates(from: midnight) { [weak self] data, error in
            guard let self = self, let data = data else { return }
            
            self.todaySteps = data.numberOfSteps.intValue
            
            self.notifyListeners("step", data: [
                "steps": self.todaySteps,
                "sessionSteps": self.todaySteps,
                "timestamp": Date().timeIntervalSince1970 * 1000
            ])
        }
        
        call.resolve(["success": true, "message": "Step tracking started"])
    }
    
    @objc func startForegroundService(_ call: CAPPluginCall) {
        // iOS doesn't have foreground services, just start tracking
        start(call)
    }
    
    @objc func stop(_ call: CAPPluginCall) {
        pedometer.stopUpdates()
        isTracking = false
        call.resolve(["success": true])
    }
    
    @objc func stopForegroundService(_ call: CAPPluginCall) {
        // iOS doesn't have foreground services
        stop(call)
    }
    
    @objc func getTodaySteps(_ call: CAPPluginCall) {
        call.resolve([
            "steps": todaySteps,
            "timestamp": Date().timeIntervalSince1970 * 1000
        ])
    }
    
    @objc func getSessionSteps(_ call: CAPPluginCall) {
        call.resolve([
            "steps": todaySteps,
            "sessionSteps": todaySteps,
            "timestamp": Date().timeIntervalSince1970 * 1000
        ])
    }
    
    @objc func getStepCount(_ call: CAPPluginCall) {
        getTodaySteps(call)
    }
    
    @objc func isServiceRunning(_ call: CAPPluginCall) {
        call.resolve(["running": isTracking])
    }
    
    @objc func addStepListener(_ call: CAPPluginCall) {
        // Listeners are handled via notifyListeners
        call.resolve()
    }
    
    @objc func removeStepListener(_ call: CAPPluginCall) {
        // Listeners are handled via notifyListeners
        call.resolve()
    }
    
    @objc func openSettings(_ call: CAPPluginCall) {
        if let url = URL(string: UIApplication.openSettingsURLString) {
            DispatchQueue.main.async {
                UIApplication.shared.open(url, options: [:], completionHandler: nil)
            }
        }
        call.resolve()
    }
    
    // Stub methods for compatibility
    @objc func requestBatteryOptimizationExemption(_ call: CAPPluginCall) {
        call.resolve(["granted": true, "message": "Not required on iOS"])
    }
    
    @objc func isBatteryOptimizationDisabled(_ call: CAPPluginCall) {
        call.resolve(["disabled": true])
    }
    
    @objc func openManufacturerBatterySettings(_ call: CAPPluginCall) {
        openSettings(call)
    }
    
    @objc func getDeviceInfo(_ call: CAPPluginCall) {
        call.resolve([
            "manufacturer": "Apple",
            "model": UIDevice.current.model,
            "androidVersion": "N/A",
            "apiLevel": 0
        ])
    }
    
    @objc func hasAggressiveBatteryOptimization(_ call: CAPPluginCall) {
        call.resolve([
            "aggressive": false,
            "manufacturer": "Apple",
            "recommendations": ""
        ])
    }
    
    @objc func isGoogleFitAvailable(_ call: CAPPluginCall) {
        call.resolve(["available": false])
    }
    
    @objc func requestGoogleFitPermission(_ call: CAPPluginCall) {
        call.resolve(["granted": false])
    }
    
    @objc func syncWithGoogleFit(_ call: CAPPluginCall) {
        call.resolve(["success": false, "steps": 0])
    }
}
