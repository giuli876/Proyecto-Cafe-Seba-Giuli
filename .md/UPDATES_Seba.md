# 🚀 Próximas Actualizaciones y Tareas Pendientes

## 📋 Pendientes Prioritarios

### 1. Gestión de Productos (Panel Vendedor)
- [ ] **Crear tabla `productos` en Supabase:**
    - Columnas: `id`, `nombre`, `descripcion`, `precio`, `stock`, `imagen_url`.
- [ ] **Interfaz de Inventario:**
    - Crear una tabla en `vendedor.html` que muestre los productos.
    - Botón para **Editar** (cambiar precio y stock directamente).
    - Botón para **Eliminar** o pausar el stock.
- [ ] **Lógica de Stock:** 
    - Que el stock baje automáticamente cuando un cliente confirma una compra.

### 2. Mapa del Repartidor (Geolocalización)
- [ ] **Integración de Mapa:**
    - Investigar API de *Leaflet.js* (gratis) o *Google Maps API*.
- [ ] **Seguimiento en tiempo real:**
    - Crear tabla de `pedidos` con columna de `estado` (Pendiente, En camino, Entregado).
    - Mostrar el mapa en la vista del cliente cuando el estado sea "En camino".

### 3. Experiencia de Usuario (UX)
- [ ] **Perfil de Usuario:** Mostrar el nombre del usuario logueado en la Navbar (`localStorage.getItem('userName')`).
- [ ] **Botón de Cerrar Sesión:** Crear función que limpie el `localStorage` y haga `supabase.auth.signOut()`.

## ✅ Tareas Completadas
- [x] Conexión con Supabase.
- [x] Registro de usuarios con guardado en tabla `perfiles`.
- [x] Login con redirección inteligente por rol (Cliente/Vendedor).
- [x] Script de protección de rutas `auth-check.js`.

---
*Última actualización: 12 de Mayo, 2026*