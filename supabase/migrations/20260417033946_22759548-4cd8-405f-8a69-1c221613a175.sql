
-- Projects table (real user projects)
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'design',
  thumbnail_url TEXT,
  template_id TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  starred BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_projects_user_updated ON public.projects(user_id, updated_at DESC);

-- Favorites table
CREATE TABLE public.favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_id UUID NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('generation', 'project')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_id, item_type)
);
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own favorites" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own favorites" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- User settings
CREATE TABLE public.user_settings (
  user_id UUID NOT NULL PRIMARY KEY,
  theme TEXT NOT NULL DEFAULT 'dark',
  default_size TEXT NOT NULL DEFAULT '1:1',
  default_style TEXT NOT NULL DEFAULT 'Realistic',
  language TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own settings" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own settings" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own settings" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Brand kits
CREATE TABLE public.brand_kits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  brand_name TEXT NOT NULL DEFAULT 'My Brand',
  colors JSONB NOT NULL DEFAULT '["#7C3AED","#06B6D4","#10B981","#F59E0B"]'::jsonb,
  fonts JSONB NOT NULL DEFAULT '{}'::jsonb,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.brand_kits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own brand kit" ON public.brand_kits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own brand kit" ON public.brand_kits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own brand kit" ON public.brand_kits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own brand kit" ON public.brand_kits FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_brand_kits_updated_at BEFORE UPDATE ON public.brand_kits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Activity log
CREATE TABLE public.activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own activity" ON public.activity_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own activity" ON public.activity_log FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_activity_user_created ON public.activity_log(user_id, created_at DESC);

-- Add columns to generations for richer history
ALTER TABLE public.generations
  ADD COLUMN IF NOT EXISTS tool TEXT DEFAULT 'text-to-image',
  ADD COLUMN IF NOT EXISTS output_type TEXT DEFAULT 'image',
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Brand assets storage bucket (for logos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-assets', 'brand-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read brand assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'brand-assets');
CREATE POLICY "Users upload own brand assets" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'brand-assets'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
CREATE POLICY "Users update own brand assets" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'brand-assets'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
CREATE POLICY "Users delete own brand assets" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'brand-assets'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
