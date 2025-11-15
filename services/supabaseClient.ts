import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cjbwbguiivkfnwleiqkn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqYndiZ3VpaXZrZm53bGVpcWtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxNTQxNTAsImV4cCI6MjA3ODczMDE1MH0.yHKu5LRwFCvfkfc2Z9WM_vdFk9gvL4sHQBV51PbTWug';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
