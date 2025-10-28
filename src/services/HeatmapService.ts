import { supabase } from '@/integrations/supabase/client';

interface Coordinate {
  lat: number;
  lng: number;
}

interface HeatmapPoint {
  coordinates: Coordinate;
  intensity: number;
}

export class HeatmapService {
  /**
   * Save GPS route
   */
  static async saveRoute(data: {
    coordinates: Coordinate[];
    distance: number;
    duration: number;
    steps: number;
    route_name?: string;
  }) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data: route, error } = await supabase
        .from('gps_routes')
        .insert({
          user_id: user.user.id,
          route_data: data.coordinates,
          distance_km: data.distance,
          duration_minutes: data.duration,
          steps_count: data.steps,
          route_name: data.route_name || `Route ${new Date().toLocaleDateString()}`,
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, route };
    } catch (error) {
      console.error('Failed to save route:', error);
      return { success: false, error };
    }
  }

  /**
   * Get user's routes
   */
  static async getUserRoutes(userId: string, limit = 20) {
    try {
      const { data: routes, error } = await supabase
        .from('gps_routes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { success: true, routes };
    } catch (error) {
      console.error('Failed to get user routes:', error);
      return { success: false, error };
    }
  }

  /**
   * Generate heatmap data from routes
   */
  static async generateHeatmapData(userId: string, period?: { start: string; end: string }) {
    try {
      let query = supabase
        .from('gps_routes')
        .select('route_data')
        .eq('user_id', userId);

      if (period) {
        query = query.gte('created_at', period.start).lte('created_at', period.end);
      }

      const { data: routes, error } = await query;

      if (error) throw error;

      // Aggregate all coordinates with intensity
      const heatmapPoints: HeatmapPoint[] = [];
      const coordinateMap = new Map<string, number>();

      routes?.forEach(route => {
        route.route_data.forEach((coord: Coordinate) => {
          const key = `${coord.lat.toFixed(4)},${coord.lng.toFixed(4)}`;
          coordinateMap.set(key, (coordinateMap.get(key) || 0) + 1);
        });
      });

      // Convert to heatmap format
      coordinateMap.forEach((count, key) => {
        const [lat, lng] = key.split(',').map(Number);
        heatmapPoints.push({
          coordinates: { lat, lng },
          intensity: Math.min(count / 10, 1), // Normalize intensity
        });
      });

      return { success: true, heatmapPoints };
    } catch (error) {
      console.error('Failed to generate heatmap data:', error);
      return { success: false, error };
    }
  }

  /**
   * Get popular routes in area
   */
  static async getPopularRoutes(bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) {
    try {
      // This would require PostGIS or similar for efficient geographic queries
      // For now, fetch recent public routes and filter client-side
      const { data: routes, error } = await supabase
        .from('gps_routes')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Filter routes within bounds
      const filteredRoutes = routes?.filter(route => {
        return route.route_data.some((coord: Coordinate) => {
          return coord.lat >= bounds.south &&
                 coord.lat <= bounds.north &&
                 coord.lng >= bounds.west &&
                 coord.lng <= bounds.east;
        });
      });

      return { success: true, routes: filteredRoutes };
    } catch (error) {
      console.error('Failed to get popular routes:', error);
      return { success: false, error };
    }
  }

  /**
   * Calculate route statistics
   */
  static calculateRouteStats(coordinates: Coordinate[]) {
    if (coordinates.length < 2) return null;

    let totalDistance = 0;
    let elevationGain = 0;

    for (let i = 1; i < coordinates.length; i++) {
      const prev = coordinates[i - 1];
      const curr = coordinates[i];

      // Calculate distance using Haversine formula
      const distance = this.haversineDistance(prev, curr);
      totalDistance += distance;
    }

    return {
      totalDistance: parseFloat(totalDistance.toFixed(2)),
      pointCount: coordinates.length,
      startPoint: coordinates[0],
      endPoint: coordinates[coordinates.length - 1],
    };
  }

  /**
   * Haversine distance between two coordinates (in km)
   */
  private static haversineDistance(coord1: Coordinate, coord2: Coordinate): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(coord2.lat - coord1.lat);
    const dLng = this.toRadians(coord2.lng - coord1.lng);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(coord1.lat)) *
              Math.cos(this.toRadians(coord2.lat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Simplify route coordinates (reduce points while maintaining shape)
   */
  static simplifyRoute(coordinates: Coordinate[], tolerance = 0.0001): Coordinate[] {
    if (coordinates.length <= 2) return coordinates;

    // Douglas-Peucker algorithm
    const simplified: Coordinate[] = [];
    this.douglasPeucker(coordinates, 0, coordinates.length - 1, tolerance, simplified);
    return simplified;
  }

  /**
   * Douglas-Peucker algorithm for route simplification
   */
  private static douglasPeucker(
    coords: Coordinate[],
    start: number,
    end: number,
    tolerance: number,
    result: Coordinate[]
  ) {
    if (end <= start + 1) {
      result.push(coords[start]);
      return;
    }

    let maxDist = 0;
    let index = start;

    for (let i = start + 1; i < end; i++) {
      const dist = this.perpendicularDistance(coords[i], coords[start], coords[end]);
      if (dist > maxDist) {
        maxDist = dist;
        index = i;
      }
    }

    if (maxDist > tolerance) {
      this.douglasPeucker(coords, start, index, tolerance, result);
      this.douglasPeucker(coords, index, end, tolerance, result);
    } else {
      result.push(coords[start]);
    }
  }

  /**
   * Calculate perpendicular distance from point to line
   */
  private static perpendicularDistance(point: Coordinate, lineStart: Coordinate, lineEnd: Coordinate): number {
    const dx = lineEnd.lng - lineStart.lng;
    const dy = lineEnd.lat - lineStart.lat;
    const mag = Math.sqrt(dx * dx + dy * dy);

    if (mag === 0) return 0;

    const u = ((point.lng - lineStart.lng) * dx + (point.lat - lineStart.lat) * dy) / (mag * mag);

    const intersectX = lineStart.lng + u * dx;
    const intersectY = lineStart.lat + u * dy;

    const distX = point.lng - intersectX;
    const distY = point.lat - intersectY;

    return Math.sqrt(distX * distX + distY * distY);
  }
}
