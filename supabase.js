import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const supabaseUrl = "https://qvoirizbcvlpryckknbr.supabase.co";
const supabaseKey = "sb_publishable_0WIuedwxH9UnF-_aFrOWvQ_FtWzIzv1";

export const supabase = createClient(supabaseUrl, supabaseKey);
