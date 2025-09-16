-- Add role column to users table for admin access control
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- Create admin audit logs table
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id uuid NOT NULL,
  action text NOT NULL,
  table_name text,
  record_id text,
  old_values jsonb DEFAULT '{}',
  new_values jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create system alerts table
CREATE TABLE IF NOT EXISTS public.system_alerts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type text NOT NULL,
  severity text NOT NULL DEFAULT 'medium', -- low, medium, high, critical
  title text NOT NULL,
  description text,
  resolved boolean DEFAULT false,
  resolved_by uuid,
  resolved_at timestamp with time zone,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create marketing campaigns table
CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL, -- push, email, in_app, sms
  title text NOT NULL,
  message text NOT NULL,
  target_audience jsonb DEFAULT '{}', -- criteria for targeting
  scheduled_at timestamp with time zone,
  status text NOT NULL DEFAULT 'draft', -- draft, scheduled, active, completed, cancelled
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  -- Analytics fields
  sent_count integer DEFAULT 0,
  delivered_count integer DEFAULT 0,
  opened_count integer DEFAULT 0,
  clicked_count integer DEFAULT 0,
  conversion_count integer DEFAULT 0
);

-- Create support tickets table
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  category text NOT NULL, -- technical, payment, account, fraud, general
  priority text NOT NULL DEFAULT 'medium', -- low, medium, high, urgent
  status text NOT NULL DEFAULT 'open', -- open, in_progress, resolved, closed
  title text NOT NULL,
  description text NOT NULL,
  attachments jsonb DEFAULT '[]',
  admin_notes text,
  assigned_to uuid,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create ticket responses table
CREATE TABLE IF NOT EXISTS public.ticket_responses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  responder_id uuid NOT NULL,
  responder_type text NOT NULL, -- user, admin
  message text NOT NULL,
  attachments jsonb DEFAULT '[]',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all admin tables
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin tables (only admins can access)
CREATE POLICY "Admin users can view audit logs" ON public.admin_audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admin users can insert audit logs" ON public.admin_audit_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admin users can view system alerts" ON public.system_alerts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admin users can manage campaigns" ON public.marketing_campaigns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'content_admin')
    )
  );

CREATE POLICY "Users can view their own tickets" ON public.support_tickets
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Users can create tickets" ON public.support_tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin users can manage tickets" ON public.support_tickets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Users and admins can view ticket responses" ON public.ticket_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets st
      WHERE st.id = ticket_id AND (
        st.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.users 
          WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
      )
    )
  );

CREATE POLICY "Users and admins can create ticket responses" ON public.ticket_responses
  FOR INSERT WITH CHECK (
    responder_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.support_tickets st
      WHERE st.id = ticket_id AND (
        st.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.users 
          WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
      )
    )
  );

-- Create updated_at triggers for campaigns and tickets
CREATE TRIGGER update_marketing_campaigns_updated_at
  BEFORE UPDATE ON public.marketing_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action text,
  p_table_name text DEFAULT NULL,
  p_record_id text DEFAULT NULL,
  p_old_values jsonb DEFAULT '{}',
  p_new_values jsonb DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_audit_logs (
    admin_user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values
  ) VALUES (
    auth.uid(),
    p_action,
    p_table_name,
    p_record_id,
    p_old_values,
    p_new_values
  );
END;
$$;