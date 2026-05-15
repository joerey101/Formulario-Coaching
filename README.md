# Formulario de Autoobservación - Coaching de Transformación

Plataforma interactiva para el proceso de coaching, permitiendo a los coachees realizar un diagnóstico profundo de su "Yo Real" y permitiendo a los coaches gestionar y visualizar los resultados.

## 🚀 Estado Actual: Migración a Supabase Auth & Resend Finalizada
La plataforma ha sido migrada con éxito a un sistema de autenticación robusto y notificaciones automáticas.

### Últimas Mejoras:
- **Versión 2.0 (15 Mayo 2026)**: Barra de progreso, sistema de finalización (modo lectura) y capacidad de reabrir formularios desde el admin.
- **Versión 1.0 (14 Mayo 2026)**: Autenticación segura con Supabase, roles y notificaciones por mail.

### Documentación Detallada:
- 👉 **[VERSION_2_0.md](./VERSION_2_0.md)**: Detalle de la barra de progreso y sistema de finalización.
- 👉 **[MIGRACION_AUTH_REPORTE_FINAL.md](./MIGRACION_AUTH_REPORTE_FINAL.md)**: Detalle técnico de la migración a Supabase Auth y Resend.

## 🛠️ Tecnologías
- **Frontend**: React + Vite
- **Estilos**: CSS Nativo (Premium Aesthetics)
- **Backend**: Supabase (Auth, DB, Edge Functions)
- **Email**: Resend

## 📦 Instalación y Configuración
1. `npm install`
2. Configurar `.env` local con las claves de Supabase.
3. **Configuración de Backend (Supabase Secrets)**:
    - `RESEND_API_KEY`: Tu clave de Resend.
    - `SITE_URL`: URL base de la app para links dinámicos en mails.
4. `npm run dev`
