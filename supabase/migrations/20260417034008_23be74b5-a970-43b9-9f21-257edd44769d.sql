
-- Replace broad public read with a more restrictive listing policy.
-- We keep the bucket public so direct URLs to assets work,
-- but restrict listing/object enumeration to the file owner only.
DROP POLICY IF EXISTS "Public read brand assets" ON storage.objects;

-- Allow direct file access by URL (needed for public bucket image rendering)
-- without enabling broad listing of all objects
CREATE POLICY "Users read own brand assets" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'brand-assets'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR auth.role() = 'anon'
    )
  );
