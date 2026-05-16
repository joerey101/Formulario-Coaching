import React from 'react';
import { useForm } from '../../context/FormContext';
import ChildBlock from './ChildBlock';

export default function Seccion3() {
  const { state, setRespuesta } = useForm();

  const handleChange = (name, value) => {
    setRespuesta(name, value);
  };

  return (
    <ChildBlock index={1} values={state.respuestas} onChange={handleChange} />
  );
}
