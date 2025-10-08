// js/index.js
// Lógica para la página principal (index.html)
document.addEventListener('DOMContentLoaded', () => {
    // ======================================================================
    // 1. NAVEGACIÓN Y REDIRECCIONES
    // ======================================================================
    // -------------------------------------------------------------
    // Lógica para los blogs
    // -------------------------------------------------------------
    const readMoreBtns = document.querySelectorAll('.btn-read-more');

    readMoreBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            alert('Esta funcionalidad aún no está implementada.');
        });
    });

    // -------------------------------------------------------------
    // Lógica para los botones de las tarjetas de producto (futura implementación)
    // -------------------------------------------------------------
    const addCartBtns = document.querySelectorAll('.add-cart');

    addCartBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Aquí iría la lógica para agregar el producto al carrito.
            // Por ahora, solo mostramos una alerta.
            alert('¡Producto agregado al carrito!');
        });
    });

});