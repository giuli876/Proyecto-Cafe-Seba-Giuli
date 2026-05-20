# 🚀 Próximas Actualizaciones y Tareas Pendientes

## 📋 Pendientes Prioritarios

### 1. Mapa del Repartidor (Geolocalización)
- [ ] **Integración de Mapa:**
    - Investigar API de *Leaflet.js* (gratis) o *Google Maps API*.
- [ ] **Seguimiento en tiempo real:**
    - Usar la tabla de `pedidos` y su columna `estado` (Pendiente, Aprobado, En camino, Entregado).
    - Mostrar el mapa en la vista del cliente cuando el estado sea "En camino".

### 2. Experiencia de Usuario (UX) y Navegación
- [ ] **Botón de Cerrar Sesión:** Crear función que limpie la sesión actual (`supabase.auth.signOut()`).
- [ ] **Corrección Navbar (Bug detectado):** Hacer que el botón "Tienda" redirija al lugar correcto según el rol (Vendedor -> `vendedor.html`, Cliente -> `cliente.html`).

### 3. Lógica de Stock (Opcional / Mejora)
- [ ] **Reducción automática:** Crear una función (o Trigger en Supabase) para que el stock baje automáticamente cuando se apruebe una compra.

---

## ✅ Tareas Completadas
- [x] Conexión base con Supabase y protección de rutas con `auth-check.js`.
- [x] Registro de usuarios y Login inteligente con redirección por rol (Cliente/Vendedor).
- [x] **Panel Vendedor 100% Funcional:** Lectura en vivo, cálculo de ganancias, y actualización de precios/stock a Supabase.
- [x] **Sistema de Pedidos y Carrito:** Creación de tabla `pedidos`, envío del carrito en formato JSONB y generación de UUID (`gen_random_uuid()`).
- [x] **Aprobación de Pedidos:** El vendedor puede ver los pedidos en vivo y cambiar el estado (Pendiente, Aprobado, Rechazado).
- [x] **Edición de Perfil de Usuario:** Se conectó la vista `perfil.html` con Supabase, permitiendo a los usuarios actualizar su nombre de forma segura en la base de datos.
- [x] **Catálogo Dinámico (Tienda e Index):** `cliente.html` e `index.html` ya no usan HTML fijo. Renderizan los productos y descuentos reales consultando el stock directamente desde la base de datos.
- [x] **Políticas de Seguridad Estrictas (RLS):** Configuración de permisos SELECT, INSERT y UPDATE personalizados para `productos`, `pedidos` y `perfiles` (`auth.uid() = id`).

---
*Última actualización: 20 de Mayo, 2026*