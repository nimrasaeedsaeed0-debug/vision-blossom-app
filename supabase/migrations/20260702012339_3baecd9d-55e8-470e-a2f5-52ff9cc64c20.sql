
-- 1. Revoke EXECUTE on SECURITY DEFINER function from anon/authenticated/public
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- 2. Fix brand-assets SELECT policy: remove anon bypass clause
DROP POLICY IF EXISTS "Users read own brand assets" ON storage.objects;
CREATE POLICY "Users read own brand assets"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'brand-assets'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- 3. Fix generated-images broad SELECT policy: restrict listing to owner (public URLs still work via storage HTTP for public bucket)
DROP POLICY IF EXISTS "Anyone can view generated images" ON storage.objects;
CREATE POLICY "Users can view their own generated images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'generated-images'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);
