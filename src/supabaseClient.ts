import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl === "tu_url_de_supabase" ||
  supabaseAnonKey === "tu_clave_anonima_de_supabase"
) {
  throw new Error(
    "Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY con tus valores reales en .env.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
