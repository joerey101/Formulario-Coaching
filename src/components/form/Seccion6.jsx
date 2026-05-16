import React from 'react';
import { useForm } from '../../context/FormContext';
import TextArea from '../ui/TextArea';

export default function Seccion6() {
  const { state, setRespuesta, esReadonly } = useForm();

  const handleChange = (name, value) => {
    setRespuesta(name, value);
  };

  return (
    <>
      <TextArea 
        name="patrones_repetidos" 
        label="¿Qué situación o conflicto sentís que se repite en tu vida?" 
        value={state.respuestas.patrones_repetidos} 
        onChange={handleChange} 
        disabled={esReadonly}
      />
      <TextArea 
        name="automaticos" 
        label="¿Cuáles son tus principales 'automáticos' (reacciones inconscientes)?" 
        value={state.respuestas.automaticos} 
        onChange={handleChange} 
        disabled={esReadonly}
      />
      <TextArea 
        name="conversacion_pendiente" 
        label="¿Qué conversación tenés pendiente y con quién?" 
        value={state.respuestas.conversacion_pendiente} 
        onChange={handleChange} 
        disabled={esReadonly}
      />
      <TextArea 
        name="decision_pendiente" 
        label="¿Qué decisión sabés que tenés que tomar pero venís postergando?" 
        value={state.respuestas.decision_pendiente} 
        onChange={handleChange} 
        disabled={esReadonly}
      />
      <TextArea 
        name="beneficio_oculto" 
        label="¿Cuál es el 'beneficio oculto' de no tomar esa decisión?" 
        value={state.respuestas.beneficio_oculto} 
        onChange={handleChange} 
        disabled={esReadonly}
      />
      <TextArea 
        name="versiones" 
        label="¿Qué versión de vos mismo/a sentís que ya caducó?" 
        value={state.respuestas.versiones} 
        onChange={handleChange} 
        disabled={esReadonly}
      />
    </>
  );
}
