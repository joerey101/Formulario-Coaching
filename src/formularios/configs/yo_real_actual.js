import { DOMAIN_NAMES, slug } from '../../context/FormContext';
import Seccion1 from '../../components/form/Seccion1';
import Seccion2 from '../../components/form/Seccion2';
import Seccion3 from '../../components/form/Seccion3';
import Seccion4 from '../../components/form/Seccion4';
import Seccion5 from '../../components/form/Seccion5';
import Seccion6 from '../../components/form/Seccion6';
import Seccion7 from '../../components/form/Seccion7';
import DatosIniciales from '../../components/form/DatosIniciales';

export const yoRealActualConfig = {
  codigo: 'yo_real_actual',
  pageTitulo: 'Autoobservación',
  subtitulo: 'Explora tu "Yo Real" y diseña tu "Yo Ideal"',
  textoBotonFinalizar: 'Finalizar y enviar respuestas',
  footerNote: 'Todo lo expresado aquí es confidencial y forma parte de tu proceso personal de transformación.',

  // Datos iniciales (metadata)
  datosIniciales: {
    componente: DatosIniciales,
    esMeta: true
  },

  // Panel de introducción
  introduccion: {
    titulo: 'Sentido de esta etapa',
    parrafos: [
      'Este formulario organiza la primera etapa del proceso: observar el Yo Real-Actual. La finalidad no es juzgar, sino reconocer con precisión conductas, patrones, emociones, vínculos, hábitos y decisiones pendientes.',
      'El Yo Ideal no se trabaja todavía como fantasía o aspiración genérica. Se construirá después, a partir de la brecha real que aparezca en este diagnóstico.'
    ],
    principios: [
      { numero: 1, titulo: 'Ver', texto: 'Nombrar lo que hoy ocurre, sin adornarlo ni dramatizarlo.' },
      { numero: 2, titulo: 'Reconocer patrones', texto: 'Identificar repeticiones, automatismos, límites y costos.' },
      { numero: 3, titulo: 'Abrir dirección', texto: 'Detectar la distancia entre la realidad actual y la vida deseada.' }
    ]
  },

  // Secciones del formulario
  secciones: [
    {
      id: 1,
      titulo: 'Pulso Actual',
      subtitulo: 'Cómo calificarías tu Satisfacción con tu vida en General?',
      componente: Seccion1,
      defaultOpen: true,
      fieldNames: [
        'satisfaccion_general_score',
        'pulso_datos',
        'pulso_estado',
        'pulso_felicidad',
        'pulso_atencion'
      ]
    },
    {
      id: 2,
      titulo: 'Los 5 Dominios de Vida',
      subtitulo: 'Mapeo detallado de las áreas fundamentales.',
      componente: Seccion2,
      get fieldNames() {
        return DOMAIN_NAMES.flatMap(d => {
          const s = slug(d);
          return [`${s}_score`, `${s}_estado`, `${s}_patron`, `${s}_necesita`];
        });
      }
    },
    {
      id: 3,
      titulo: 'Vínculos y Maternidad/Paternidad',
      subtitulo: 'La profundidad de tus relaciones primarias.',
      componente: Seccion3,
      fieldNames: [
        'hijo_1_nombre',
        'hijo_1_score',
        'hijo_1_necesita',
        'hijo_1_patron',
        'hijo_1_gesto'
      ]
    },
    {
      id: 4,
      titulo: 'Bienestar Interior y Mentalidad',
      subtitulo: 'Observando el mundo interno: pensamientos y emociones.',
      componente: Seccion4,
      fieldNames: [
        'bienestar_interior_score',
        'emociones_conciencia',
        'dialogo_interno',
        'mente_creativa',
        'miedos',
        'apegos',
        'limita',
        'centro',
        'criticas'
      ]
    },
    {
      id: 5,
      titulo: 'Límites y Relación con Uno Mismo',
      subtitulo: 'Capacidad de decir NO y de cuidarse.',
      componente: Seccion5,
      fieldNames: [
        'limites_personales_score',
        'limites_donde',
        'limites_costo',
        'autocompasion_score',
        'amor_propio',
        'perdon_propio',
        'perdon_otros',
        'expresion_sentimientos'
      ]
    },
    {
      id: 6,
      titulo: 'Patrones, Decisiones y Automatismos',
      subtitulo: 'Identificando lo que se repite y lo que está pendiente.',
      componente: Seccion6,
      fieldNames: [
        'patrones_repetidos',
        'automaticos',
        'conversacion_pendiente',
        'decision_pendiente',
        'beneficio_oculto',
        'versiones'
      ]
    },
    {
      id: 7,
      titulo: 'Síntesis y Compromiso con el Cambio',
      subtitulo: 'Cerrando el diagnóstico y abriendo la brecha.',
      componente: Seccion7,
      fieldNames: [
        'descubrimiento',
        'brecha',
        'prioridades',
        'tres_temas',
        'compromiso'
      ]
    }
  ]
};

// Helper para obtener todos los fieldNames
export const getFieldNames = (config) =>
  config.secciones.flatMap((s) => s.fieldNames);
