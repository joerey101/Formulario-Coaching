// src/lib/coaches.js
import { supabase } from './supabase';

export async function checkIfUserIsCoach(userId) {
  if (!userId) {
    console.log('[AUTH] checkIfUserIsCoach: userId vacío');
    return { isCoach: false, coachData: null, error: null };
  }

  try {
    console.log('[AUTH] coaches.js: Ejecutando query para userId:', userId);
    const { data, error } = await supabase
      .from('coaches')
      .select('id, user_id, email, nombre, apellido, especialidad, activo')
      .eq('user_id', userId)
      .eq('activo', true)
      .maybeSingle();
    
    console.log('[AUTH] coaches.js: Query terminada. Error:', error ? error.message : 'ninguno');

    if (error) {
      console.error('[AUTH] Error verificando rol de coach:', error);
      return { isCoach: false, coachData: null, error };
    }

    const isCoach = !!data;
    console.log(`[AUTH] checkIfUserIsCoach(${userId}):`, isCoach ? 'ES COACH' : 'NO ES COACH');
    return { isCoach, coachData: data, error: null };
  } catch (err) {
    console.error('[AUTH] Excepción en checkIfUserIsCoach:', err);
    return { isCoach: false, coachData: null, error: err };
  }
}
