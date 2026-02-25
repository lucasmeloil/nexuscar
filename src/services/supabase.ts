import { createClient } from "@supabase/supabase-js";

// Vite requer o prefixo VITE_ para expor variáveis ao cliente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://kxzdmkwsisnrphblfnpx.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_16sK72bo88CN1038NVLcEA_IUIOU6sd";

// Debug para o desenvolvedor (visível no console do navegador)
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    "Nota: Usando chaves de recuperação (fallback). \n" +
    "Certifique-se de configurar as Environment Variables no Netlify para maior segurança."
  );
}

// Inicialização segura
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
