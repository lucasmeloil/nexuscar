import { createClient } from "@supabase/supabase-js";

// Vite requer o prefixo VITE_ para expor variáveis ao cliente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug para o desenvolvedor (visível no console do navegador)
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Critical Error: Supabase URL or Anon Key is missing. \n" +
    "Check your Netlify Environment Variables or .env file. \n" +
    "Variables must start with VITE_ to be bundled by Vite."
  );
}

// Inicialização segura
export const supabase = createClient(
  supabaseUrl || "https://missing-url.supabase.co", 
  supabaseAnonKey || "missing-key"
);
