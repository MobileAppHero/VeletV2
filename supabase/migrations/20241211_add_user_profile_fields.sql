-- Add additional fields to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS interests text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS places jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS notes jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS dates jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS sizes jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS gift_ideas jsonb DEFAULT '[]';

-- Add gift_ideas to loved_ones_profiles table
ALTER TABLE loved_ones_profiles
ADD COLUMN IF NOT EXISTS gift_ideas jsonb DEFAULT '[]';

-- Update the RLS policy if needed to include these new fields
-- The existing policies should already allow users to manage their own profiles