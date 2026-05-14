import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'placeholder-key';

if (!import.meta.env.VITE_SUPABASE_URL) {
  console.warn('Supabase URL no encontrada en variables de entorno. Usando placeholder para evitar crash.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
