-- Harden access: explicitly deny anonymous access on sensitive tables

DO $$ BEGIN
  EXECUTE 'CREATE POLICY "Deny all access to anonymous users" ON public.users FOR ALL TO anon USING (false)';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  EXECUTE 'CREATE POLICY "Deny all access to anonymous users" ON public.support_chats FOR ALL TO anon USING (false)';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  EXECUTE 'CREATE POLICY "Deny all access to anonymous users" ON public.support_tickets FOR ALL TO anon USING (false)';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  EXECUTE 'CREATE POLICY "Deny all access to anonymous users" ON public.transactions FOR ALL TO anon USING (false)';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  EXECUTE 'CREATE POLICY "Deny all access to anonymous users" ON public.wallets FOR ALL TO anon USING (false)';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  EXECUTE 'CREATE POLICY "Deny all access to anonymous users" ON public.wallet_balances FOR ALL TO anon USING (false)';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Optional: deny anon on notifications_inbox and notification_logs as an extra hardening
DO $$ BEGIN
  EXECUTE 'CREATE POLICY "Deny all access to anonymous users" ON public.notifications_inbox FOR ALL TO anon USING (false)';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  EXECUTE 'CREATE POLICY "Deny all access to anonymous users" ON public.notification_logs FOR ALL TO anon USING (false)';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;