import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Solo aceptamos POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const data = req.body;
    
    // Validar que vengan los datos básicos
    if (!data.coachee_nombre || !data.coachee_apellido) {
      return res.status(400).json({ error: 'Faltan datos del coachee (Nombre y Apellido)' });
    }

    // Insertar en Supabase
    // La tabla 'respuestas' debe tener las columnas: coachee_nombre, coachee_apellido, coach, fecha, etapa, respuestas (jsonb)
    const { data: inserted, error } = await supabase
      .from('respuestas')
      .insert([
        {
          coachee_nombre: data.coachee_nombre,
          coachee_apellido: data.coachee_apellido,
          coach: data.coach,
          fecha: data.fecha || new Date().toISOString(),
          etapa: data.etapa || 'Yo Real-Actual',
          respuestas: data.respuestas || {}
        }
      ])
      .select();

    if (error) throw error;

    return res.status(200).json({ success: true, data: inserted });

  } catch (error) {
    console.error('Error en API:', error);
    return res.status(500).json({ error: error.message });
  }
}
