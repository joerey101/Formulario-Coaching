import React from 'react';
import { useForm } from '../../context/FormContext';
import TextArea from '../ui/TextArea';
import PriorityList from './PriorityList';

export default function Seccion7() {
  const { state, setRespuesta, esReadonly } = useForm();

  const handleChange = (name, value) => {
    setRespuesta(name, value);
  };

  return (
    <>
      <TextArea 
        name="descubrimiento" 
        label="¿Cuál fue tu mayor descubrimiento al completar este mapa?" 
        value={state.respuestas.descubrimiento} 
        onChange={handleChange} 
        disabled={esReadonly}
      />
      <TextArea 
        name="brecha" 
        label="¿Cómo describirías hoy la brecha entre tu Yo Real y tu Yo Ideal?" 
        value={state.respuestas.brecha} 
        onChange={handleChange} 
        disabled={esReadonly}
      />
      <div className="question">
        <div className="question-header">
          <div className="question-title">¿En qué áreas sentís que necesitás trabajar con más urgencia?</div>
          <span className="tag">Multiselección</span>
        </div>
        <PriorityList 
          selected={state.respuestas.prioridades || []} 
          onChange={handleChange} 
          disabled={esReadonly}
        />
      </div>
      <TextArea 
        name="tres_temas" 
        label="Si tuvieras que elegir SOLO 3 temas para tu proceso de coaching, ¿cuáles serían?" 
        value={state.respuestas.tres_temas} 
        onChange={handleChange} 
        disabled={esReadonly}
      />
      <TextArea 
        name="compromiso" 
        label="Nivel de compromiso: ¿Qué estás dispuesto/a a soltar para que lo nuevo aparezca? y qué estás dispuesto/a a poner de Vos?" 
        value={state.respuestas.compromiso} 
        onChange={handleChange} 
        disabled={esReadonly}
      />
    </>
  );
}
