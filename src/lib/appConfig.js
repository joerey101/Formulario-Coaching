/**
 * Configuración centralizada de URLs de la app.
 * Cambiar el dominio = cambiar una sola variable de entorno (VITE_APP_URL).
 */

// URL base de la app (sin trailing slash)
export const APP_URL = (import.meta.env.VITE_APP_URL || window.location.origin).replace(/\/$/, '');

// URLs derivadas comúnmente usadas para redirects de Auth
export const AUTH_CALLBACK_URL = `${APP_URL}/`;
export const RESET_PASSWORD_URL = `${APP_URL}/reset-password`;
export const LOGIN_URL = `${APP_URL}/login`;

// Helper para construir URLs absolutas (por ejemplo, en mails)
export const buildAppUrl = (path = '/') => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${APP_URL}${cleanPath}`;
};
