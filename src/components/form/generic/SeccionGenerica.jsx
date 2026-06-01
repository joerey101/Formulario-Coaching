import React from 'react';
import CampoTextarea from './CampoTextarea';
import { useForm } from '../../../context/FormContext';
import './SeccionGenerica.css';

/**
 * Renderiza una sección a partir de su config declarativa.
 *
 * La sección puede tener subgrupos (ej: "Reflexión" / "Objetivos") y campos.
 *
 * Props:
 * - seccion: objeto de config con shape:
 *   {
 *     id: number,
 *     titulo: string,
 *     subtitulo?: string,
 *     grupos: [
 *       {
 *         titulo: string,
 *         campos: [{ tipo: 'textarea', name, label, hint?, rows? }]
 *       }
 *     ]
 *   }
 */
const SeccionGenerica = ({ seccion }) => {
  const { esReadonly } = useForm();

  return (
    <div className="seccion-generica">
      {seccion.subtitulo && (
        <p className="seccion-generica-subtitulo">{seccion.subtitulo}</p>
      )}

      {seccion.grupos?.map((grupo, gIdx) => (
        <div key={gIdx} className="seccion-generica-grupo">
          {grupo.titulo && (
            <h3 className="seccion-generica-grupo-titulo">{grupo.titulo}</h3>
          )}

          {grupo.campos.map((campo) => {
            if (campo.tipo === 'textarea') {
              return (
                <CampoTextarea
                  key={campo.name}
                  name={campo.name}
                  label={campo.label}
                  hint={campo.hint}
                  rows={campo.rows}
                  placeholder={campo.placeholder}
                  readOnly={esReadonly}
                />
              );
            }
            // Espacio para extender con otros tipos en el futuro (score, select, etc.)
            return null;
          })}
        </div>
      ))}
    </div>
  );
};

export default SeccionGenerica;
