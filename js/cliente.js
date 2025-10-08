document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------------------------
    // 1. INICIALIZACIÓN Y VARIABLES
    // ----------------------------------------------------------------------
    let cart = []; // Array principal para almacenar los ítems del carrito
    const remitoBody = document.getElementById('remitoBody');
    const finalTotalDisplay = document.getElementById('finalTotalDisplay');
    const totalItemsDisplay = document.getElementById('totalItemsDisplay');
    const btnFinalize = document.querySelector('.btn-primary-finalize');
    const ADD_TO_CART_BUTTONS = document.querySelectorAll('.btn-primary-add-catalogo');
    const CATALOG_INPUTS = document.querySelectorAll('.catalogo-qty-input');

    // ----------------------------------------------------------------------
    // 2. FUNCIÓN DE FORMATO DE NÚMEROS
    // ----------------------------------------------------------------------
    const formatPrice = (price) => {
        const valueInPesos = price ;
        return '$' + valueInPesos.toLocaleString('es-AR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    // ----------------------------------------------------------------------
    // 3. LÓGICA DEL CARRITO
    // ----------------------------------------------------------------------

    // Carga el carrito desde localStorage
    const loadCart = () => {
        const storedCart = localStorage.getItem('clientCart');
        if (storedCart) {
            // Asegura que los precios se manejen como números después de cargarlos
            cart = JSON.parse(storedCart).map(item => ({
                ...item,
                price: Number(item.price),
                quantity: Number(item.quantity)
            }));
        }
        renderCart();
    };

    // Guarda el carrito en localStorage
    const saveCart = () => {
        localStorage.setItem('clientCart', JSON.stringify(cart));
    };

    // Renderiza (dibuja) la tabla del carrito en el HTML
    const renderCart = () => {
        remitoBody.innerHTML = ''; // Limpiar la tabla

        if (cart.length === 0) {
            const row = remitoBody.insertRow();
            row.innerHTML = `<td colspan="6" style="text-align: center; padding: 2rem;">El carrito está vacío. ¡Añade productos!</td>`;
            updateSummary(0, 0); // Actualiza los totales a cero
            return;
        }

        cart.forEach((item, index) => {
            const row = remitoBody.insertRow();
            row.setAttribute('data-product-id', item.id);

            // Calcular subtotal
            const subtotal = item.price * item.quantity;

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.name}</td>
                <td>
                    <input 
                        type="number" 
                        value="${item.quantity}" 
                        min="1" 
                        class="remito-qty-input" 
                        data-product-id="${item.id}"
                    >
                </td>
                <td>${formatPrice(item.price)}</td>
                <td class="subtotal-display">${formatPrice(subtotal)}</td>
                <td>
                    <button class="btn-remove-item" data-product-id="${item.id}">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            `;
        });

        // Vuelve a adjuntar los event listeners a los nuevos inputs de cantidad
        document.querySelectorAll('.remito-qty-input').forEach(input => {
            input.addEventListener('change', updateCartQuantity);
            input.addEventListener('input', updateCartQuantity);
        });
        
        // Vuelve a adjuntar los event listeners a los nuevos botones de eliminar
        document.querySelectorAll('.btn-remove-item').forEach(button => {
            button.addEventListener('click', removeFromCart);
        });

        calculateCartTotals();
    };

    // Añade un producto al carrito
    const addToCart = (productId, productName, productPrice, quantity) => {
        const itemIndex = cart.findIndex(item => item.id === productId);

        if (itemIndex > -1) {
            // El producto ya existe, solo suma la cantidad
            cart[itemIndex].quantity += quantity;
        } else {
            // El producto es nuevo, lo agrega al carrito
            cart.push({
                id: productId,
                name: productName,
                price: productPrice, 
                quantity: quantity
            });
        }
        
        saveCart();
        renderCart();
    };

    // Elimina un producto del carrito
    const removeFromCart = (event) => {
        const productId = event.currentTarget.dataset.productId;
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        renderCart();
    };

    // Actualiza la cantidad de un producto en el carrito
    const updateCartQuantity = (event) => {
        const input = event.currentTarget;
        const productId = input.dataset.productId;
        let newQuantity = parseInt(input.value);

        if (isNaN(newQuantity) || newQuantity < 1) {
            newQuantity = 1;
            input.value = 1; // Forzar a 1 si es inválido
        }

        const itemIndex = cart.findIndex(item => item.id === productId);

        if (itemIndex > -1) {
            cart[itemIndex].quantity = newQuantity;
            
            // Recalcular subtotal de la fila inmediatamente
            const item = cart[itemIndex];
            const newSubtotal = item.price * newQuantity;
            const subtotalCell = input.closest('tr').querySelector('.subtotal-display');
            subtotalCell.textContent = formatPrice(newSubtotal);

            saveCart();
            calculateCartTotals();
        }
    };

    // Calcula y muestra el total general
    const calculateCartTotals = () => {
        let total = 0;
        let totalItems = 0;

        cart.forEach(item => {
            total += item.price * item.quantity;
            totalItems += item.quantity;
        });
        
        updateSummary(total, totalItems);
    };
    
    // Actualiza los elementos del resumen (Total y Cantidad de ítems)
    const updateSummary = (total, totalItems) => {
        finalTotalDisplay.textContent = formatPrice(total);
        totalItemsDisplay.textContent = totalItems.toString();
        
        // Habilita/Deshabilita el botón de finalizar
        btnFinalize.disabled = cart.length === 0;
    };

    // ----------------------------------------------------------------------
    // 4. LISTENERS DE EVENTOS
    // ----------------------------------------------------------------------
    
    // Listener para los botones de Añadir Producto del Catálogo
    ADD_TO_CART_BUTTONS.forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = event.currentTarget.dataset.productId;
            const productName = event.currentTarget.dataset.productName;
            
            // Buscar el input de cantidad asociado a esta tarjeta
            const cardProduct = event.currentTarget.closest('.card-product');
            const quantityInput = cardProduct.querySelector('.catalogo-qty-input');
            
            let quantity = parseInt(quantityInput.value);
            
            // Asegurar que la cantidad sea válida
            if (isNaN(quantity) || quantity < 1) {
                quantity = 1;
                quantityInput.value = 1; // Opcional: restablecer el valor del input
            }
            
            // Obtener el precio desde el atributo data-price de la tarjeta
            const productPrice = parseFloat(cardProduct.dataset.price);

            if (productPrice && productId && productName && quantity) {
                addToCart(productId, productName, productPrice, quantity);
                
                // (Opcional) Mostrar una alerta de éxito simple
                alert(`¡${productName} (x${quantity}) añadido al carrito!`);
            } else {
                console.error("Error al obtener datos del producto.");
            }
        });
    });

    // Listener para el botón de Finalizar Pedido
    btnFinalize.addEventListener('click', () => {
        if (cart.length === 0) {
            alert("El carrito está vacío. ¡No hay nada que confirmar!");
            return;
        }

        // 1. Crear el objeto del pedido (simulación de envío al servidor)
        const order = {
            clientId: document.getElementById('clientName').textContent, // Usar el nombre del cliente como ID simulado
            items: cart,
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            date: new Date().toISOString()
        };

        // 2. SIMULACIÓN: Mostrar los datos del pedido en consola para el desarrollador
        console.log("--- PEDIDO ENVIADO ---");
        console.log(JSON.stringify(order, null, 2));
        
        // 3. SIMULACIÓN: Limpiar el carrito después de "enviar"
        cart = [];
        saveCart();
        renderCart();
        
        alert("¡Pedido confirmado con éxito! Pronto será procesado por el vendedor.");
    });


    // ----------------------------------------------------------------------
    // 5. INICIO DE LA APLICACIÓN
    // ----------------------------------------------------------------------
    loadCart();
});