-- Create gps_routes table for storing user GPS route history
CREATE TABLE public.gps_routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  route_data JSONB NOT NULL DEFAULT '{"coordinates": [], "timestamps": []}'::jsonb,
  distance_km NUMERIC(10, 2) NOT NULL DEFAULT 0,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  average_pace NUMERIC(10, 2),
  elevation_gain NUMERIC(10, 2),
  calories_burned INTEGER,
  route_name TEXT,
  route_type TEXT DEFAULT 'walking',
  photos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable Row Level Security
ALTER TABLE public.gps_routes ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own routes" 
ON public.gps_routes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own routes" 
ON public.gps_routes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own routes" 
ON public.gps_routes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own routes" 
ON public.gps_routes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_gps_routes_user_id ON public.gps_routes(user_id);
CREATE INDEX idx_gps_routes_created_at ON public.gps_routes(created_at DESC);
CREATE INDEX idx_gps_routes_distance ON public.gps_routes(distance_km DESC);