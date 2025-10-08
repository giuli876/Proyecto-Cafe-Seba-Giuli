document.addEventListener('DOMContentLoaded', () => {

    // ======================================================================
    // 1. UTILIDADES GLOBALES DE SESIÓN (Requeridas para el Vendedor)
    // ======================================================================

    /**
     * Verifica que el usuario sea Vendedor y lo redirige si no lo es.
     */
    const checkVendedorAccess = () => {
        const userType = localStorage.getItem('userType');
        const userName = localStorage.getItem('userName');

        // Si no está logeado o no es un Vendedor, lo manda al login
        if (userType !== 'Vendedor' || !userName) {
            alert("Acceso denegado. Debes iniciar sesión como Vendedor.");
            window.location.replace('login.html');
            return false;
        }
        
        // Muestra el nombre del Vendedor
        const vendorNameElement = document.getElementById('vendorName');
        if (vendorNameElement) {
            vendorNameElement.textContent = userName;
        }

        return true;
    };

    if (!checkVendedorAccess()) {
        return; // Detiene la ejecución si el acceso está denegado
    }

    // ------------------------------------------------------------
    // 2. Lógica de la tabla de Gestión de Productos
    // ------------------------------------------------------------

    const productRows = document.querySelectorAll('.product-management tbody tr');

    productRows.forEach(row => {
        const productId = row.id;
        const stockDisplay = row.querySelector('.stock-display');
        const stockPlusBtn = row.querySelector('.btn-stock-plus');
        const stockMinusBtn = row.querySelector('.btn-stock-minus');
        const priceInput = row.querySelector('.price-input');
        const changePriceBtn = row.querySelector('.btn-change-price');

        // Función para actualizar el stock
        const updateStock = (change) => {
            let currentStock = parseInt(stockDisplay.textContent);
            currentStock = Math.max(0, currentStock + change); // Asegura que el stock no sea negativo
            stockDisplay.textContent = currentStock;
            
            // SIMULACIÓN: Mensaje de confirmación
            console.log(`[STOCK] Producto ${productId} actualizado a: ${currentStock}`);
            // En un proyecto real, aquí iría una llamada a una API para guardar el dato.
        };

        // Listener para el botón de aumentar stock
        if (stockPlusBtn) {
            stockPlusBtn.addEventListener('click', () => {
                updateStock(1);
            });
        }
        
        // Listener para el botón de disminuir stock
        if (stockMinusBtn) {
            stockMinusBtn.addEventListener('click', () => {
                updateStock(-1);
            });
        }
        
        // Listener para el cambio de precio (simulación)
        if (priceInput) {
            priceInput.addEventListener('change', () => {
                console.log(`[PRECIO] Producto ${productId} precio cambiado a: $${priceInput.value}`);
                // En un proyecto real, aquí iría una llamada a una API
            });
        }

        // Listener para el botón "Cambiar Precio" (si existe en tu HTML)
        if (changePriceBtn) {
            changePriceBtn.addEventListener('click', () => {
                // El precio ya se actualiza con el evento 'change' del input, 
                // esto es solo una confirmación adicional.
                alert(`El nuevo precio ($${priceInput.value}) del Producto ${productId} ha sido registrado.`);
            });
        }
    });


    // ------------------------------------------------------------
    // 3. Lógica de la sección de Pedidos de Clientes
    // ------------------------------------------------------------

    const ordersContainer = document.getElementById('ordersListContainer'); // Asume que tienes este ID
    const orderCards = document.querySelectorAll('.order-card');

    orderCards.forEach(card => {
        const approveBtn = card.querySelector('.btn-approve');
        const denyBtn = card.querySelector('.btn-deny');
        const orderId = card.dataset.orderId || 'Desconocido'; // Usar un atributo de datos (data-order-id)

        // Botón de Aprobar
        if (approveBtn) {
            approveBtn.addEventListener('click', () => {
                // SIMULACIÓN: Marcar como aprobado y eliminar
                alert(`✅ Pedido ${orderId} APROBADO. El cliente será notificado.`);
                card.classList.add('approved'); // Cambia el estilo (si tienes CSS)
                setTimeout(() => card.remove(), 500); // Elimina la tarjeta con un pequeño retraso
            });
        }

        // Botón de Denegar
        if (denyBtn) {
            denyBtn.addEventListener('click', () => {
                // SIMULACIÓN: Marcar como denegado y eliminar
                alert(`❌ Pedido ${orderId} DENEGADO. El cliente será notificado.`);
                card.classList.add('denied'); // Cambia el estilo (si tienes CSS)
                setTimeout(() => card.remove(), 500); // Elimina la tarjeta con un pequeño retraso
            });
        }
    });
});