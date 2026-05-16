import React from 'react';
import { useForm } from '../../context/FormContext';
import TextArea from '../ui/TextArea';
import ScaleInput from '../ui/ScaleInput';

export default function Seccion4() {
  const { state, setRespuesta, esReadonly } = useForm();

  const handleChange = (name, value) => {
    setRespuesta(name, value);
  };

  return (
    <>
      <div className="question">
        <div className="question-header">
          <div className="question-title">Nivel de Bienestar Interior</div>
          <span className="tag">Escala 1-10</span>
        </div>
        <ScaleInput 
          name="bienestar_interior_score" 
          value={state.respuestas.bienestar_interior_score || ''} 
          onChange={handleChange} 
          disabled={esReadonly}
        />
      </div>
      <TextArea 
        name="emociones_conciencia" 
        label="¿Qué tan consciente sos de tus emociones diarias?" 
        value={state.respuestas.emociones_conciencia} 
        onChange={handleChange} 
        disabled={esReadonly}
      />
      <TextArea 
        name="dialogo_interno" 
        label="¿Cómo es tu diálogo interno hoy? ¿Qué te decís?" 
        value={state.respuestas.dialogo_interno} 
        onChange={handleChange} 
        disabled={esReadonly}
      />
      <TextArea 
        name="mente_creativa" 
        label="¿En qué medida sentís que tu mente es creativa vs reactiva?" 
        value={state.respuestas.mente_creativa} 
        onChange={handleChange} 
        disabled={esReadonly}
      />
      <div className="meta-grid">
        <TextArea name="miedos" label="Cuáles son tus principales Miedos?" value={state.respuestas.miedos} onChange={handleChange} disabled={esReadonly} />
        <TextArea name="apegos" label="Tenés identificados tus apegos? Cuáles son?" value={state.respuestas.apegos} onChange={handleChange} disabled={esReadonly} />
      </div>
      <TextArea 
        name="limita" 
        label="¿Qué creencia(s) sentís que te limita(n) hoy?" 
        value={state.respuestas.limita} 
        onChange={handleChange} 
        disabled={esReadonly}
      />
      <TextArea 
        name="centro" 
        label="¿Qué te devuelve a tu centro cuando lo perdés?" 
        value={state.respuestas.centro} 
        onChange={handleChange} 
        disabled={esReadonly}
      />
      <TextArea 
        name="criticas" 
        label="¿Cómo manejás la crítica (propia y ajena)? y la mirada de los demás?" 
        value={state.respuestas.criticas} 
        onChange={handleChange} 
        disabled={esReadonly}
      />
    </>
  );
}
