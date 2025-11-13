// services/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// ✅ Your project details
const SUPABASE_URL = 'https://zfatfvrwpyifqexvycbi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmYXRmdnJ3cHlpZnFleHZ5Y2JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NTY4MjAsImV4cCI6MjA3ODUzMjgyMH0.cS3WfX_qWSSh19nO1Z-9Nwdl0W8Z0EklR2_ugphXQUk';

// ✅ Initialize Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
