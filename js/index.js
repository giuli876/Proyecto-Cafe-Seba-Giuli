import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
    // ======================================================================
    // 1. CARGAR PRODUCTOS DESTACADOS DESDE SUPABASE
    // ======================================================================
    const catalogoIndex = document.getElementById('catalogo-index');

    // Función auxiliar para formatear los precios
    const formatPrice = (price) => {
        return '$' + parseFloat(price).toLocaleString('es-AR', {
            minimumFractionDigits: 0, 
            maximumFractionDigits: 0 
        });
    };

    async function cargarDestacados() {
        if (!catalogoIndex) return;

        // Traemos productos de Supabase que tengan stock
        const { data: productos, error } = await supabase
            .from('productos')
            .select('*')
            .gt('stock', 0)
            .limit(6); // Limitamos a 6 para no saturar el inicio

        if (error || !productos) {
            console.error("Error al traer productos:", error);
            catalogoIndex.innerHTML = '<p style="text-align:center; width:100%; grid-column: 1/-1;">Error al cargar productos.</p>';
            return;
        }

        catalogoIndex.innerHTML = ''; // Limpiamos el mensaje de carga

        productos.forEach(producto => {
            // Lógica de imágenes (manteniendo las tuyas del diseño original)
            let imgPorDefecto = 'img/cafe-1.png';
            let nombreLower = producto.nombre.toLowerCase();
            if (nombreLower.includes('brasil')) imgPorDefecto = 'img/cafe-2.png';
            if (nombreLower.includes('blend')) imgPorDefecto = 'img/Cafe-Blend.png';
            if (nombreLower.includes('moka')) imgPorDefecto = 'img/Cafe-moka-Brasil.png';
            if (nombreLower.includes('azúcar') || nombreLower.includes('azucar')) imgPorDefecto = 'img/Caja-Azucar.png';
            if (nombreLower.includes('edulco')) imgPorDefecto = 'img/Caja-Edulco.png';

            const urlImagen = producto.imagen_url || imgPorDefecto;

            // Simulamos un precio "viejo" sumándole un porcentaje aleatorio entre 10% y 30% para el diseño tachado
            const descuentoRandom = Math.floor(Math.random() * (30 - 10 + 1)) + 10;
            const precioViejo = producto.precio * (1 + (descuentoRandom / 100));

            const div = document.createElement('div');
            div.className = 'card-product';
            
            div.innerHTML = `
                <div class="container-img">
                    <img src="${urlImagen}" alt="${producto.nombre}" />
                    <span class="discount">-${descuentoRandom}%</span>
                </div>
                <div class="content-card-product">
                    <h3>${producto.nombre}</h3>
                    <span class="add-cart" onclick="window.location.href='cliente.html'">
                        <i class="fa-solid fa-basket-shopping"></i>
                    </span>
                    <p class="price">${formatPrice(producto.precio)} <span>${formatPrice(precioViejo)}</span></p>
                </div>
            `;
            
            catalogoIndex.appendChild(div);
        });
    }

    // Ejecutar la carga
    cargarDestacados();

    // ======================================================================
    // 2. LÓGICA PARA LOS BLOGS
    // ======================================================================
    const readMoreBtns = document.querySelectorAll('.btn-read-more');
    readMoreBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            alert('¡Próximamente! Estamos preparando los mejores artículos para vos.');
        });
    });
});