import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vwuwrvxlcykurihjagcp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3dXdydnhsY3lrdXJpaGphZ2NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1ODcyMDcsImV4cCI6MjA4NzE2MzIwN30._8DVgmpUE7z4Hgs-PtpWsyn272ImzsPQd3ro_TQQV7g';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
