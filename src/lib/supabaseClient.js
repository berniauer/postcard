import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rxxgvhzgghhqnqcogsgm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4eGd2aHpnZ2hocW5xY29nc2dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTcwMTEsImV4cCI6MjA2MzE3MzAxMX0.G-FHe91mpi_1ssofWKJFqqeYU0bkvOVaW7C7g9Rmu_U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);