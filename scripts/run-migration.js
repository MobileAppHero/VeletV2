const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xsdhkhuzlfduriqcvzxt.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzZGhraHV6bGZkdXJpcWN2enh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNjQ5ODQsImV4cCI6MjA4MDg0MDk4NH0.t_DA_ZdqkxcbM-o2tsNf4TPRr6TzHCkMjdYB3f-BX78';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    // Run the migration
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add additional fields to user_profiles table
        ALTER TABLE user_profiles
        ADD COLUMN IF NOT EXISTS interests text[] DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS places jsonb DEFAULT '[]',
        ADD COLUMN IF NOT EXISTS notes jsonb DEFAULT '[]',
        ADD COLUMN IF NOT EXISTS dates jsonb DEFAULT '[]',
        ADD COLUMN IF NOT EXISTS sizes jsonb DEFAULT '{}';
      `
    });

    if (error) {
      console.error('Migration error:', error);
      
      // If RPC doesn't exist, we'll need to execute these manually
      console.log('\nPlease run the following SQL in your Supabase SQL editor:');
      console.log(`
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS interests text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS places jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS notes jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS dates jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS sizes jsonb DEFAULT '{}';
      `);
    } else {
      console.log('Migration completed successfully!');
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

runMigration();