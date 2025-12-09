-- Create profiles storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'profiles',
  'profiles',
  true, -- Make it public so photos can be accessed via URL
  false,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  birthday DATE,
  location TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create loved_ones_profiles table for tracking other people
CREATE TABLE IF NOT EXISTS public.loved_ones_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Who created this profile
  name TEXT NOT NULL,
  relationship TEXT,
  birthday DATE,
  interests TEXT[],
  favorite_food TEXT,
  favorite_artist TEXT,
  splurge_on TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_loved_ones_profiles_user_id ON public.loved_ones_profiles(user_id);

-- Set up Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loved_ones_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
-- Users can only view and edit their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON public.user_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for loved_ones_profiles
-- Users can only view and manage profiles they created
CREATE POLICY "Users can view own loved ones" ON public.loved_ones_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert loved ones" ON public.loved_ones_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own loved ones" ON public.loved_ones_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own loved ones" ON public.loved_ones_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Storage policies for profiles bucket
-- Allow authenticated users to upload their own profile photos
CREATE POLICY "Users can upload profile photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profiles' AND 
    auth.uid() IS NOT NULL
  );

-- Allow public read access to profile photos
CREATE POLICY "Public can view profile photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'profiles');

-- Allow users to update their own photos
CREATE POLICY "Users can update own photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profiles' AND 
    auth.uid() IS NOT NULL
  );

-- Allow users to delete their own photos
CREATE POLICY "Users can delete own photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profiles' AND 
    auth.uid() IS NOT NULL
  );