-- Create Storage Buckets for Photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('challenge-photos', 'challenge-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('community-photos', 'community-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('profile-photos', 'profile-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('route-photos', 'route-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Challenge Photos: RLS Policies
CREATE POLICY "Challenge photos are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'challenge-photos');

CREATE POLICY "Authenticated users can upload challenge photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'challenge-photos' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own challenge photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'challenge-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own challenge photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'challenge-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Community Photos: RLS Policies
CREATE POLICY "Community photos are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'community-photos');

CREATE POLICY "Authenticated users can upload community photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'community-photos' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own community photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'community-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own community photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'community-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Profile Photos: RLS Policies
CREATE POLICY "Profile photos are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-photos');

CREATE POLICY "Authenticated users can upload profile photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-photos' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own profile photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own profile photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Route Photos: RLS Policies
CREATE POLICY "Route photos are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'route-photos');

CREATE POLICY "Authenticated users can upload route photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'route-photos' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own route photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'route-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own route photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'route-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);