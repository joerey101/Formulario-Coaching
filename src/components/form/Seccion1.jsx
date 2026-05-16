import React from 'react';
import { useForm } from '../../context/FormContext';
import TextArea from '../ui/TextArea';
import ScaleInput from '../ui/ScaleInput';

export default function Seccion1() {
  const { state, setRespuesta, esReadonly } = useForm();

  const handleChange = (name, value) => {
    setRespuesta(name, value);
  };

  return (
    <>
      <div className="question">
        <div className="question-header">
          <div className="question-title">Satisfacción General</div>
          <span className="tag">Escala 1-10</span>
        </div>
        <ScaleInput 
          name="satisfaccion_general_score" 
          value={state.respuestas.satisfaccion_general_score || ''} 
          onChange={handleChange} 
          disabled={esReadonly}
        />
      </div>
      <TextArea 
        name="pulso_datos" 
        label="Que elementos (Positivos o Negativos) configuran este número?" 
        value={state.respuestas.pulso_datos} 
        onChange={handleChange} 
        disabled={esReadonly}
      />
      <TextArea 
        name="pulso_estado" 
        label="¿Cómo describirías tu estado predominante hoy?" 
        value={state.respuestas.pulso_estado} 
        onChange={handleChange} 
        disabled={esReadonly}
      />
      <TextArea 
        name="pulso_felicidad" 
        label="¿Qué cosas te están dando felicidad hoy?" 
        value={state.respuestas.pulso_felicidad} 
        onChange={handleChange} 
        disabled={esReadonly}
      />
      <TextArea 
        name="pulso_atencion" 
        label="¿Qué cosas te están robando energía o atención?" 
        value={state.respuestas.pulso_atencion} 
        onChange={handleChange} 
        disabled={esReadonly}
      />
    </>
  );
}
