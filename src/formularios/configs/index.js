import { yoRealActualConfig } from './yo_real_actual';

const configs = {
  yo_real_actual: yoRealActualConfig,
};

export const getFormularioConfig = (codigo) => {
  const config = configs[codigo];
  if (!config) {
    throw new Error(`[FORM] No existe configuración para el formulario "${codigo}"`);
  }
  return config;
};

export const getCodigosDisponibles = () => Object.keys(configs);
export const getFieldNames = (config) => config.secciones.flatMap(s => s.fieldNames);
