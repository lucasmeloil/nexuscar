import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "ATENÇÃO: As credenciais do Supabase não foram encontradas no ambiente (Netlify/Local). O site não conseguirá carregar os dados.",
  );
}

// Usamos um fallback de string vazia para evitar erro de sintaxe, 
// mas mostramos erro claro no console se faltar.
export const supabase = createClient(
  supabaseUrl || "https://placeholder-url.supabase.co", 
  supabaseAnonKey || "placeholder-key"
);
