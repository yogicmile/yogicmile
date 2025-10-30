import { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Ruler, Clock, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface RouteData {
  id: string;
  route_name?: string;
  route_data: {
    coordinates: [number, number][];
    timestamps: string[];
  };
  distance_km: number;
  duration_seconds: number;
  average_pace?: number;
  elevation_gain?: number;
  calories_burned?: number;
  route_type: string;
  created_at: string;
  photos: string[];
}

const RouteHistoryMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapboxToken, setMapboxToken] = useState<string>('');

  useEffect(() => {
    loadRoutes();
  }, []);

  useEffect(() => {
    if (mapContainer.current && mapboxToken && !map.current) {
      initializeMap();
    }
  }, [mapboxToken]);

  useEffect(() => {
    if (map.current && selectedRoute) {
      displayRouteOnMap(selectedRoute);
    }
  }, [selectedRoute]);

  const loadRoutes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('gps_routes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setRoutes((data || []).map(route => ({
        ...route,
        route_data: route.route_data as unknown as {
          coordinates: [number, number][];
          timestamps: string[];
        },
        photos: (route.photos as unknown as string[]) || []
      })));
    } catch (error) {
      console.error('Error loading routes:', error);
      toast.error('Failed to load route history');
    } finally {
      setLoading(false);
    }
  };

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [78.9629, 20.5937], // Center of India
      zoom: 5,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );
  };

  const displayRouteOnMap = (route: RouteData) => {
    if (!map.current || !route.route_data.coordinates.length) return;

    // Remove existing route layer if any
    if (map.current.getLayer('route')) {
      map.current.removeLayer('route');
    }
    if (map.current.getSource('route')) {
      map.current.removeSource('route');
    }

    // Add route to map
    map.current.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: route.route_data.coordinates,
        },
      },
    });

    map.current.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#3b82f6',
        'line-width': 4,
        'line-opacity': 0.8,
      },
    });

    // Add start and end markers
    const coordinates = route.route_data.coordinates;
    if (coordinates.length > 0) {
      new mapboxgl.Marker({ color: '#10b981' })
        .setLngLat(coordinates[0])
        .setPopup(new mapboxgl.Popup().setHTML('<p>Start</p>'))
        .addTo(map.current);

      new mapboxgl.Marker({ color: '#ef4444' })
        .setLngLat(coordinates[coordinates.length - 1])
        .setPopup(new mapboxgl.Popup().setHTML('<p>Finish</p>'))
        .addTo(map.current);
    }

    // Fit map to route bounds
    const bounds = new mapboxgl.LngLatBounds();
    coordinates.forEach((coord) => bounds.extend(coord as [number, number]));
    map.current.fitBounds(bounds, { padding: 50 });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatPace = (pace?: number) => {
    if (!pace) return 'N/A';
    return `${pace.toFixed(2)} min/km`;
  };

  return (
    <div className="space-y-6">
      {/* Mapbox Token Input */}
      {!mapboxToken && (
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Enter Mapbox Token</h3>
              <p className="text-sm text-muted-foreground mb-4">
                To view your route history, please enter your Mapbox public token.
                Get one at{' '}
                <a
                  href="https://mapbox.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  mapbox.com
                </a>
              </p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="pk.eyJ1IjoieW91cnVzZXJuYW1lIi..."
                className="flex-1 px-3 py-2 border rounded-md"
                onChange={(e) => setMapboxToken(e.target.value)}
              />
              <Button onClick={() => initializeMap()}>Load Map</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Map Container */}
      {mapboxToken && (
        <Card className="overflow-hidden">
          <div ref={mapContainer} className="h-[500px] w-full" />
        </Card>
      )}

      {/* Route List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Route History
        </h3>

        {loading ? (
          <Card className="p-6 text-center text-muted-foreground">
            Loading routes...
          </Card>
        ) : routes.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">
            No routes recorded yet. Start tracking your walks to see them here!
          </Card>
        ) : (
          <div className="grid gap-4">
            {routes.map((route) => (
              <Card
                key={route.id}
                className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                  selectedRoute?.id === route.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedRoute(route)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">
                      {route.route_name || 'Untitled Route'}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(route.created_at), 'MMM dd, yyyy · HH:mm')}
                    </div>
                  </div>
                  <Badge variant="outline">{route.route_type}</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Distance</p>
                      <p className="font-semibold">{route.distance_km.toFixed(2)} km</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="font-semibold">{formatDuration(route.duration_seconds)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Pace</p>
                      <p className="font-semibold">{formatPace(route.average_pace)}</p>
                    </div>
                  </div>

                  {route.calories_burned && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">🔥</span>
                      <div>
                        <p className="text-xs text-muted-foreground">Calories</p>
                        <p className="font-semibold">{route.calories_burned}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteHistoryMap;
