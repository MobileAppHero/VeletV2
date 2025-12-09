# Supabase Setup Instructions

## Setting up Storage and Database

### 1. Create Storage Bucket

1. Go to your Supabase dashboard: https://app.supabase.com
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Create a bucket with these settings:
   - Name: `profiles`
   - Public bucket: ✅ (check this)
   - File size limit: 5MB
   - Allowed MIME types: `image/*`

### 2. Set up Database Tables

1. Go to **SQL Editor** in your Supabase dashboard
2. Click **New query**
3. Copy and paste the entire contents of `supabase/setup.sql`
4. Click **Run** to execute the SQL

This will create:
- Storage bucket policies
- `user_profiles` table (for user's own profile)
- `loved_ones_profiles` table (for tracking friends/family)
- Row Level Security (RLS) policies
- Proper indexes for performance

### 3. Verify Setup

After running the SQL:

1. **Check Storage**:
   - Go to Storage → You should see a `profiles` bucket
   - It should be marked as "Public"

2. **Check Tables**:
   - Go to Table Editor
   - You should see:
     - `user_profiles` table
     - `loved_ones_profiles` table

3. **Check RLS**:
   - Click on each table
   - Go to the RLS tab
   - RLS should be enabled with policies listed

### 4. Test Photo Upload

1. Open your app
2. Go to Profile (bottom navigation)
3. Tap Edit
4. Tap the camera icon
5. Choose "Take Photo" or "Choose from Gallery"
6. The photo should upload to Supabase

### Troubleshooting

**If photo upload fails:**

1. Check that the `profiles` bucket exists and is public
2. Verify your Supabase URL and API key in `.env.local`
3. Check browser console/logs for specific error messages
4. Ensure RLS policies are correctly set up

**Common Errors:**

- "Bucket not found" → Run the SQL setup script
- "Permission denied" → Check RLS policies
- "Invalid API key" → Verify your `.env.local` file

### Environment Variables

Make sure your `.env.local` file contains:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Storage Structure

Photos are stored with this structure:
```
profiles/
  └── {user_id}/
      ├── user_{user_id}_{timestamp}.jpg
      └── loved_one_{user_id}_{timestamp}.jpg
```

This keeps each user's photos organized in their own folder.