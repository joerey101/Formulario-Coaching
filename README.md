# Formulario de Autoobservación - Coaching de Transformación

Plataforma interactiva para el proceso de coaching, permitiendo a los coachees realizar un diagnóstico profundo de su "Yo Real" y permitiendo a los coaches gestionar y visualizar los resultados.

## 🚀 Estado Actual: Migración a Supabase Auth & Resend Finalizada
La plataforma ha sido migrada con éxito a un sistema de autenticación robusto y notificaciones automáticas.

### Últimas Mejoras (14 Mayo 2026):
- **Autenticación Segura**: Integración total con Supabase Auth.
- **Roles Dinámicos**: Diferenciación automática entre Coach (Admin) y Coachee (Cliente).
- **Notificaciones**: Sistema de aviso por mail al Coach (vía Resend) al recibir nuevas respuestas.
- **Recuperación de Clave**: Flujo completo de "Olvidé mi contraseña".

### Documentación Detallada:
Para ver el detalle técnico de la migración y cómo mantener el sistema, revisá el archivo:
👉 **[MIGRACION_AUTH_REPORTE_FINAL.md](./MIGRACION_AUTH_REPORTE_FINAL.md)**

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
