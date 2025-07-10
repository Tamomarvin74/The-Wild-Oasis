 // src/app/_lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  // This error will be thrown if the environment variables are not loaded
  throw new Error('Supabase URL and Key are required environment variables. Please check your .env.local file and its location.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
