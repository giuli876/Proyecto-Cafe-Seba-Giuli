# 🛠 Registro de Pruebas y Control de Errores - Caxambu

Este documento sirve para rastrear la estabilidad del sistema paso a paso.

## 🟢 1. Sistema de Autenticación (Supabase Auth)
- [x] **Registro de usuario nuevo:**
    - *Prueba:* Intentar registrar con correo inventado.
    - *Error encontrado:* Supabase pedía confirmación de email por defecto.
    - *Solución:* Se desactivó "Confirm Email" en el panel de Supabase. [Estado: **CORREGIDO**]
- [x] **Login de usuario:**
    - *Prueba:* Ingresar con credenciales válidas.
    - *Error encontrado:* El sistema no reconocía la contraseña aunque fuera correcta.
    - *Causa:* La cuenta no estaba verificada (resuelto en el paso anterior). [Estado: **CORREGIDO**]

## 🟡 2. Base de Datos de Perfiles y Roles
- [x] **Creación de tabla `perfiles`:**
    - *Paso:* Crear tabla con `id (uuid)`, `nombre_completo` y `rol`.
    - *Error:* El registro no guardaba los datos en la tabla.
    - *Causa:* Falta de políticas RLS (Row Level Security). [Estado: **CORREGIDO**]
- [x] **Lectura de Roles en Login:**
    - *Error:* El vendedor era redirigido a `cliente.html`.
    - *Causa 1:* El rol en la base de datos tenía comillas accidentales (`'vendedor'`).
    - *Causa 2:* Sensibilidad a mayúsculas/minúsculas.
    - *Solución:* Limpieza de strings en `login.js` usando `.trim().toLowerCase().replace()`. [Estado: **CORREGIDO**]

## 🔴 3. Seguridad y Acceso (Pendiente de Test)
- [ ] **Acceso directo por URL:**
    - *Prueba:* Intentar entrar a `vendedor.html` escribiendo la dirección sin loguearse.
    - *Resultado esperado:* El script `auth-check.js` debe redirigir al login.
    - *Estado:* **EN PRUEBAS**
- [ ] **Clics innecesarios / Romper el sistema:**
    - *Prueba:* Dar clic muchas veces al botón "Entrar" mientras carga.
    - *Prueba:* Dejar campos vacíos y dar enter (el `required` de HTML debería frenarlo).
    - *Estado:* **PENDIENTE**

---
*Notas: Si encuentras un error nuevo, agrégalo aquí con el formato: [ERROR] -> [SOLUCIÓN].*