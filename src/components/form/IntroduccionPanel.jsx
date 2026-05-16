import React from 'react';

export default function IntroduccionPanel({ introduccion }) {
  if (!introduccion) return null;

  return (
    <section className="card panel panel-intro">
      <h2>{introduccion.titulo}</h2>
      {introduccion.parrafos.map((parrafo, index) => (
        <p key={index}>{parrafo}</p>
      ))}
      <div className="principles">
        {introduccion.principios.map((principio, index) => (
          <div className="principle" key={index}>
            <strong>{principio.numero}. {principio.titulo}</strong>
            <span>{principio.texto}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
