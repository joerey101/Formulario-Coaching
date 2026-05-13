import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Solo aceptamos GET para seguridad en este endpoint
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Consultar todas las respuestas ordenadas por fecha de creación
    const { data, error } = await supabase
      .from('respuestas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json(data);

  } catch (error) {
    console.error('Error en API Admin:', error);
    return res.status(500).json({ error: error.message });
  }
}
