-- Create app crashes table for crash reporting
CREATE TABLE public.app_crashes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  device_info JSONB NOT NULL DEFAULT '{}',
  os_version TEXT,
  app_version TEXT NOT NULL DEFAULT '1.0.0',
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  error_context JSONB DEFAULT '{}',
  user_agent TEXT,
  url TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  resolved_status TEXT NOT NULL DEFAULT 'open',
  severity TEXT NOT NULL DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create sync queue table for background sync management
CREATE TABLE public.sync_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  data_payload JSONB NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 5,
  sync_status TEXT NOT NULL DEFAULT 'pending',
  priority INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  next_retry_at TIMESTAMP WITH TIME ZONE
);

-- Create cache status table for local caching management
CREATE TABLE public.cache_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  cache_key TEXT NOT NULL,
  cache_type TEXT NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expiry_time TIMESTAMP WITH TIME ZONE NOT NULL,
  size_bytes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create crash analytics aggregation table
CREATE TABLE public.crash_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  crash_count INTEGER NOT NULL DEFAULT 0,
  affected_users INTEGER NOT NULL DEFAULT 0,
  top_errors JSONB NOT NULL DEFAULT '[]',
  device_breakdown JSONB NOT NULL DEFAULT '{}',
  os_breakdown JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create load time analytics table
CREATE TABLE public.load_time_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  page_name TEXT NOT NULL,
  load_time_ms INTEGER NOT NULL,
  device_type TEXT,
  connection_type TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create battery usage logs table
CREATE TABLE public.battery_usage_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  battery_level INTEGER,
  charging_status BOOLEAN,
  background_activity_level TEXT NOT NULL DEFAULT 'normal',
  sync_interval_seconds INTEGER NOT NULL DEFAULT 300,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on all new tables
ALTER TABLE public.app_crashes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cache_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crash_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.load_time_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battery_usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for app_crashes
CREATE POLICY "Users can view their own crashes" ON public.app_crashes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert crash reports" ON public.app_crashes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin users can view all crashes" ON public.app_crashes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- RLS policies for sync_queue
CREATE POLICY "Users can manage their own sync queue" ON public.sync_queue
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS policies for cache_status
CREATE POLICY "Users can manage their own cache status" ON public.cache_status
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS policies for crash_analytics
CREATE POLICY "Admin users can view crash analytics" ON public.crash_analytics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- RLS policies for load_time_analytics
CREATE POLICY "Users can insert their own load time data" ON public.load_time_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own load time data" ON public.load_time_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin users can view all load time analytics" ON public.load_time_analytics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- RLS policies for battery_usage_logs
CREATE POLICY "Users can manage their own battery logs" ON public.battery_usage_logs
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_app_crashes_user_id ON public.app_crashes(user_id);
CREATE INDEX idx_app_crashes_timestamp ON public.app_crashes(timestamp);
CREATE INDEX idx_app_crashes_resolved_status ON public.app_crashes(resolved_status);

CREATE INDEX idx_sync_queue_user_id ON public.sync_queue(user_id);
CREATE INDEX idx_sync_queue_status ON public.sync_queue(sync_status);
CREATE INDEX idx_sync_queue_priority ON public.sync_queue(priority);
CREATE INDEX idx_sync_queue_next_retry ON public.sync_queue(next_retry_at);

CREATE INDEX idx_cache_status_user_id ON public.cache_status(user_id);
CREATE INDEX idx_cache_status_expiry ON public.cache_status(expiry_time);
CREATE INDEX idx_cache_status_type ON public.cache_status(cache_type);

CREATE INDEX idx_load_time_page ON public.load_time_analytics(page_name);
CREATE INDEX idx_load_time_timestamp ON public.load_time_analytics(timestamp);

CREATE INDEX idx_battery_usage_user_id ON public.battery_usage_logs(user_id);
CREATE INDEX idx_battery_usage_timestamp ON public.battery_usage_logs(timestamp);

-- Create triggers for updated_at columns
CREATE TRIGGER update_sync_queue_updated_at
  BEFORE UPDATE ON public.sync_queue
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for testing
INSERT INTO public.crash_analytics (date, crash_count, affected_users, top_errors, device_breakdown, os_breakdown)
VALUES 
  (CURRENT_DATE, 5, 3, 
   '[{"error": "TypeError: Cannot read property", "count": 3}, {"error": "Network error", "count": 2}]',
   '{"iPhone": 3, "Android": 2}',
   '{"iOS 17": 2, "iOS 16": 1, "Android 13": 2}'),
  (CURRENT_DATE - 1, 8, 5,
   '[{"error": "Permission denied", "count": 4}, {"error": "Timeout error", "count": 4}]',
   '{"iPhone": 4, "Android": 4}',
   '{"iOS 17": 3, "iOS 16": 1, "Android 13": 3, "Android 12": 1}');