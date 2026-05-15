# Versión 2.0 - Barra de Progreso y Sistema de Finalización

**Fecha**: 15 de Mayo, 2026

## 🎯 Objetivo
Mejorar la experiencia de usuario (UX) del coachee al completar el formulario y proporcionar al coach un control sobre el estado de las respuestas (Finalizado / En progreso).

## 🚀 Nuevas Funcionalidades

### 1. Barra Sticky de Progreso
- Una barra flotante en la parte inferior de la pantalla que sigue al usuario mientras hace scroll.
- Muestra el porcentaje de avance en tiempo real.
- Incluye un botón de **Guardar Recorrido** accesible en todo momento.

### 2. Sistema de Finalización (Modo Lectura)
- El botón **Finalizar y enviar respuestas** solo se activa cuando el formulario está al 100%.
- Se añade un modal de confirmación antes de finalizar.
- Al finalizar, el formulario pasa a **Modo Lectura**:
    - Todos los campos quedan deshabilitados.
    - Se muestra un banner en la parte superior indicando que el formulario está finalizado y la fecha de finalización.
    - El estado en la base de datos cambia a `'finalizado'`.

### 3. Panel de Administración (Coach)
- **Badge de Estado**: La tabla de respuestas ahora muestra si el formulario está `✏️ En progreso` o `🔒 Finalizado`.
- **Botón Reabrir**: En el detalle de la respuesta, si está finalizada, el coach puede hacer clic en **Reabrir Formulario**. Esto vuelve el estado a `'en_progreso'` y permite al coachee volver a editar sus respuestas.

## 🛠️ Detalles Técnicos
- Se agregaron los campos `estado` (TEXT), `finalizado_at` (TIMESTAMPTZ) y `finalizado_por` (UUID) en la tabla `respuestas` de Supabase.
- Se implementó la lógica de cálculo de progreso en `FormContext.jsx`.
- Se crearon componentes como `ProgressBarSticky` y se actualizaron `FormularioPage` y `AdminPage`.

---
*CONSCIENCIA · Coaching de Transformación*
