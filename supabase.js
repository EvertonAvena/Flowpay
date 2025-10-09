import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uurqmeqxsncptofxqqmv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1cnFtZXF4c25jcHRvZnhxcW12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NTc0NjUsImV4cCI6MjA3MjEzMzQ2NX0.NOnCpaE0tmpoAenZsKyNoGywhz72RU9prQqCYSQ5YNA';

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    }
  }
);