import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://crfobwckcwpifueripig.supabase.co';
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_W3V9FUaH81utgVOhCTzGig_XjRcT4mz';

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
