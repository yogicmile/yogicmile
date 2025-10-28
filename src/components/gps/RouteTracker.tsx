import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getDistance, getPreciseDistance } from "geolib";

interface RouteTrackerProps {
  challengeId?: string;
  onComplete?: (routeId: string) => void;
}

export const RouteTracker = ({ challengeId, onComplete }: RouteTrackerProps) => {
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [routePoints, setRoutePoints] = useState<Array<{lat: number, lng: number, timestamp: string}>>([]);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentPace, setCurrentPace] = useState(0);
  const watchIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const { toast } = useToast();

  const startTracking = () => {
    if (!navigator.geolocation) {
      toast({
        title: "GPS not available",
        description: "Your device doesn't support GPS tracking",
        variant: "destructive"
      });
      return;
    }

    setIsTracking(true);
    setIsPaused(false);
    startTimeRef.current = Date.now();

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newPoint = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: new Date().toISOString()
        };
        
        setRoutePoints(prev => {
          const updated = [...prev, newPoint];
          if (updated.length > 1) {
            const dist = getPreciseDistance(
              { latitude: updated[updated.length - 2].lat, longitude: updated[updated.length - 2].lng },
              { latitude: newPoint.lat, longitude: newPoint.lng }
            );
            setDistance(d => d + dist / 1000); // Convert to km
          }
          return updated;
        });
      },
      (error) => {
        console.error("GPS error:", error);
        toast({
          title: "GPS Error",
          description: "Unable to get your location",
          variant: "destructive"
        });
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    );
  };

  const pauseTracking = () => {
    setIsPaused(true);
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const resumeTracking = () => {
    setIsPaused(false);
    startTracking();
  };

  const stopTracking = async () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    // Save route to database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const avgPace = duration > 0 ? distance / (duration / 60) : 0;
      
      const { data, error } = await supabase
        .from("walking_routes")
        .insert({
          user_id: user.id,
          challenge_id: challengeId,
          route_data: routePoints,
          start_location: `POINT(${routePoints[0].lng} ${routePoints[0].lat})`,
          end_location: `POINT(${routePoints[routePoints.length - 1].lng} ${routePoints[routePoints.length - 1].lat})`,
          distance_km: distance,
          duration_seconds: duration,
          average_pace_min_per_km: avgPace,
          started_at: new Date(startTimeRef.current!).toISOString(),
          completed_at: new Date().toISOString(),
          status: "completed"
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Route saved!",
        description: `${distance.toFixed(2)} km completed`
      });

      onComplete?.(data.id);
    } catch (error) {
      console.error("Error saving route:", error);
      toast({
        title: "Error",
        description: "Failed to save route",
        variant: "destructive"
      });
    }

    setIsTracking(false);
    setIsPaused(false);
    setRoutePoints([]);
    setDistance(0);
    setDuration(0);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking && !isPaused && startTimeRef.current) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current!) / 1000);
        setDuration(elapsed);
        if (elapsed > 0 && distance > 0) {
          setCurrentPace(distance / (elapsed / 60)); // km per minute
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, isPaused, distance]);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-primary">
            <MapPin className="w-5 h-5" />
            <h3 className="font-bold text-lg">GPS Route Tracker</h3>
          </div>

          {/* Stats Display */}
          <div className="grid grid-cols-3 gap-4">
            <motion.div
              className="text-center p-4 rounded-lg bg-primary/5"
              animate={{ scale: isTracking && !isPaused ? [1, 1.02, 1] : 1 }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="text-2xl font-bold text-foreground">{distance.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">km</div>
            </motion.div>

            <div className="text-center p-4 rounded-lg bg-secondary/5">
              <div className="text-2xl font-bold text-foreground">{formatDuration(duration)}</div>
              <div className="text-xs text-muted-foreground">time</div>
            </div>

            <div className="text-center p-4 rounded-lg bg-accent/5">
              <div className="text-2xl font-bold text-foreground">{currentPace > 0 ? currentPace.toFixed(1) : '0.0'}</div>
              <div className="text-xs text-muted-foreground">km/min</div>
            </div>
          </div>

          {/* GPS Points Count */}
          {routePoints.length > 0 && (
            <div className="text-sm text-muted-foreground text-center">
              {routePoints.length} GPS points recorded
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-2">
            {!isTracking ? (
              <Button onClick={startTracking} className="flex-1" size="lg">
                <Play className="w-5 h-5 mr-2" />
                Start Tracking
              </Button>
            ) : (
              <>
                {!isPaused ? (
                  <Button onClick={pauseTracking} variant="outline" className="flex-1" size="lg">
                    <Pause className="w-5 h-5 mr-2" />
                    Pause
                  </Button>
                ) : (
                  <Button onClick={resumeTracking} variant="outline" className="flex-1" size="lg">
                    <Play className="w-5 h-5 mr-2" />
                    Resume
                  </Button>
                )}
                <Button onClick={stopTracking} variant="destructive" className="flex-1" size="lg">
                  <Square className="w-5 h-5 mr-2" />
                  Finish
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
