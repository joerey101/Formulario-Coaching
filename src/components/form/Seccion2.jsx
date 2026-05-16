import React from 'react';
import { useForm, DOMAIN_NAMES, slug } from '../../context/FormContext';
import DomainCard from './DomainCard';

export default function Seccion2() {
  const { state, setRespuesta } = useForm();

  const handleChange = (name, value) => {
    setRespuesta(name, value);
  };

  return (
    <>
      {DOMAIN_NAMES.map(domain => (
        <DomainCard 
          key={domain}
          domain={domain}
          slug={slug(domain)}
          values={state.respuestas}
          onChange={handleChange}
        />
      ))}
    </>
  );
}
