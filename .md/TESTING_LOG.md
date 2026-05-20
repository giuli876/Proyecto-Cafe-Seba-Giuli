# 🛠 Registro de Pruebas y Control de Errores - Caxambu

Este documento sirve para rastrear la estabilidad del sistema paso a paso.

## 🟢 1. Sistema de Autenticación y Perfiles
- [x] **Registro de usuario y Login:**
    - *Error previo:* Supabase pedía confirmación de email y cuentas no verificadas fallaban.
    - *Solución:* Se desactivó "Confirm Email" en Supabase. [Estado: **CORREGIDO**]
- [x] **Redirección de Roles en Login:**
    - *Error previo:* El vendedor era redirigido a `cliente.html` por sensibilidad a mayúsculas.
    - *Solución:* Limpieza de strings en `login.js`. [Estado: **CORREGIDO**]
- [x] **Actualización de datos del Perfil:**
    - *Prueba:* Modificar el nombre del usuario en `perfil.html` y guardar.
    - *Error encontrado:* Supabase bloqueaba la actualización silenciosamente al hacer el UPDATE.
    - *Causa:* Falta de permiso UPDATE en la tabla `perfiles`.
    - *Solución:* Se agregó política RLS (`auth.uid() = id`) para que cada usuario solo modifique su propio perfil. [Estado: **CORREGIDO**]

## 🟢 2. Gestión de Productos (Catálogo e Index)
- [x] **Actualización de panel Vendedor:**
    - *Prueba:* Modificar precios/stock y guardar. [Estado: **CORREGIDO Y VERIFICADO**]
- [x] **Renderizado Dinámico de Tienda (`cliente.html`):**
    - *Prueba:* Verificar si los cafés cargan desde Supabase. [Estado: **CORREGIDO Y VERIFICADO**]
- [x] **Renderizado de Inicio (`index.html`):**
    - *Prueba:* Cargar los mejores productos en la portada reemplazando el HTML estático.
    - *Solución:* Se limitó la consulta a 6 productos, implementando lógica de descuentos dinámicos para mantener el diseño UI. [Estado: **CORREGIDO Y VERIFICADO**]

## 🟢 3. Sistema de Pedidos y Carrito
- [x] **Confirmar Pedido (Error de ID UUID):**
    - *Error encontrado:* `null value in column "id"`.
    - *Solución:* Cambio del Default Value a `gen_random_uuid()`. [Estado: **CORREGIDO**]
- [x] **Aprobar Pedido (Permisos Vendedor):**
    - *Error encontrado:* Botón "Aprobar" cargaba infinitamente sin respuesta.
    - *Solución:* Se agregó política UPDATE para usuarios autenticados en `pedidos`. [Estado: **CORREGIDO**]
- [x] **Visualización en Historial:**
    - *Error encontrado:* UUIDs largos rompían el diseño del historial.
    - *Solución:* Uso de `.substring(0,8)` para acortar el ID visualmente. [Estado: **CORREGIDO**]

## 🔴 4. Seguridad y Navegación (Pendientes)
- [ ] **Acceso directo por URL:**
    - *Prueba:* Intentar entrar a `vendedor.html` escribiendo la dirección sin loguearse.
    - *Resultado esperado:* `auth-check.js` redirige al login.
    - *Estado:* **EN PRUEBAS**
- [ ] **Redirección de Navbar según Rol (Error detectado):**
    - *Prueba:* Clic en "Tienda" en el menú superior estando logueado como Vendedor.
    - *Error encontrado:* El sistema envía a `cliente.html` en lugar de `vendedor.html`.
    - *Estado:* **PENDIENTE DE SOLUCIÓN**