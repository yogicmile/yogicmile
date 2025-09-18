-- Create comprehensive security and privacy tables for Yogic Mile

-- User consent management for GDPR compliance
CREATE TABLE IF NOT EXISTS user_consent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  consent_type TEXT NOT NULL CHECK (consent_type IN ('terms_conditions', 'data_processing', 'marketing', 'analytics')),
  granted BOOLEAN NOT NULL DEFAULT false,
  consent_version TEXT NOT NULL DEFAULT '1.0',
  ip_address INET,
  user_agent TEXT,
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  withdrawn_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, consent_type)
);

-- Account deletion requests with grace period
CREATE TABLE IF NOT EXISTS account_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  request_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  reason TEXT,
  grace_period_end TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  completion_date TIMESTAMP WITH TIME ZONE,
  admin_approval BOOLEAN DEFAULT false,
  admin_user_id UUID,
  deletion_type TEXT NOT NULL DEFAULT 'user_requested' CHECK (deletion_type IN ('user_requested', 'admin_action', 'compliance')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Fraud detection and monitoring
CREATE TABLE IF NOT EXISTS fraud_detection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  fraud_type TEXT NOT NULL CHECK (fraud_type IN ('gps_spoofing', 'unrealistic_steps', 'device_manipulation', 'multiple_accounts', 'speed_violation', 'pattern_anomaly')),
  detection_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  severity_level TEXT NOT NULL DEFAULT 'medium' CHECK (severity_level IN ('low', 'medium', 'high', 'critical')),
  detection_data JSONB NOT NULL DEFAULT '{}',
  auto_action_taken TEXT CHECK (auto_action_taken IN ('warning', 'suspension', 'flag_review', 'none')),
  admin_reviewed BOOLEAN DEFAULT false,
  admin_user_id UUID,
  resolution_status TEXT DEFAULT 'open' CHECK (resolution_status IN ('open', 'investigating', 'resolved', 'false_positive')),
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Security audit logging for compliance
CREATE TABLE IF NOT EXISTS security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL,
  user_id UUID,
  admin_id UUID,
  event_type TEXT NOT NULL CHECK (event_type IN ('login_attempt', 'password_change', 'privacy_update', 'data_export', 'account_deletion', 'admin_action', 'fraud_detection', 'consent_change')),
  event_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  device_info JSONB DEFAULT '{}',
  action_taken TEXT,
  result_status TEXT CHECK (result_status IN ('success', 'failure', 'pending', 'blocked')),
  additional_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Privacy settings for user control
CREATE TABLE IF NOT EXISTS privacy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  profile_visibility TEXT NOT NULL DEFAULT 'public' CHECK (profile_visibility IN ('public', 'friends_only', 'private')),
  analytics_tracking BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT true,
  location_tracking BOOLEAN DEFAULT true,
  data_collection BOOLEAN DEFAULT true,
  login_notifications BOOLEAN DEFAULT true,
  security_alerts BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Data export requests for GDPR compliance
CREATE TABLE IF NOT EXISTS data_export_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  request_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  export_type TEXT NOT NULL DEFAULT 'full' CHECK (export_type IN ('full', 'basic', 'transactions', 'steps')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'ready', 'downloaded', 'expired')),
  file_path TEXT,
  download_token TEXT UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  downloaded_at TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- User device trust scoring
CREATE TABLE IF NOT EXISTS device_trust_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  device_fingerprint TEXT NOT NULL,
  device_info JSONB NOT NULL DEFAULT '{}',
  trust_score INTEGER DEFAULT 50 CHECK (trust_score >= 0 AND trust_score <= 100),
  is_trusted BOOLEAN DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  risk_factors JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, device_fingerprint)
);

-- Enable RLS on all security tables
ALTER TABLE user_consent ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_detection ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_export_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_trust_scores ENABLE ROW LEVEL SECURITY;

-- User consent policies
CREATE POLICY "Users can view their own consent records" ON user_consent
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own consent" ON user_consent
  FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all consent" ON user_consent
  FOR ALL TO service_role USING (true);

-- Account deletion policies
CREATE POLICY "Users can view their own deletion requests" ON account_deletion_requests
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create deletion requests" ON account_deletion_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all deletion requests" ON account_deletion_requests
  FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = ANY(ARRAY['admin', 'super_admin'])));

-- Privacy settings policies
CREATE POLICY "Users can manage their own privacy settings" ON privacy_settings
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Data export policies
CREATE POLICY "Users can view their own export requests" ON data_export_requests
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create export requests" ON data_export_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Device trust policies
CREATE POLICY "Users can view their own device trust scores" ON device_trust_scores
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "System can manage device trust scores" ON device_trust_scores
  FOR ALL TO service_role USING (true);

-- Security audit and fraud detection - admin only
CREATE POLICY "Admins can view security audit logs" ON security_audit_log
  FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = ANY(ARRAY['admin', 'super_admin'])));

CREATE POLICY "System can insert security audit logs" ON security_audit_log
  FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Admins can view fraud detection records" ON fraud_detection
  FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = ANY(ARRAY['admin', 'super_admin'])));

CREATE POLICY "System can manage fraud detection" ON fraud_detection
  FOR ALL TO service_role USING (true);