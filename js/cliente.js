document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------------------------
    // 1. INICIALIZACIÓN Y VARIABLES
    // ----------------------------------------------------------------------
    let cart = []; 
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
        return '$' + price.toLocaleString('es-AR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    // ----------------------------------------------------------------------
    // 3. LÓGICA DEL CARRITO
    // ----------------------------------------------------------------------

    const loadCart = () => {
        const storedCart = localStorage.getItem('clientCart');
        if (storedCart) {
            cart = JSON.parse(storedCart).map(item => ({
                ...item,
                price: Number(item.price),
                quantity: Number(item.quantity)
            }));
        }
        renderCart();
    };

    const saveCart = () => {
        localStorage.setItem('clientCart', JSON.stringify(cart));
    };

    const renderCart = () => {
        remitoBody.innerHTML = ''; 

        if (cart.length === 0) {
            const row = remitoBody.insertRow();
            row.innerHTML = `<td colspan="6" style="text-align: center; padding: 2rem;">El carrito está vacío. ¡Añade productos!</td>`;
            updateSummary(0, 0); 
            return;
        }

        cart.forEach((item, index) => {
            const row = remitoBody.insertRow();
            row.setAttribute('data-product-id', item.id);

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

        document.querySelectorAll('.remito-qty-input').forEach(input => {
            input.addEventListener('change', updateCartQuantity);
            input.addEventListener('input', updateCartQuantity);
        });
        
        document.querySelectorAll('.btn-remove-item').forEach(button => {
            button.addEventListener('click', removeFromCart);
        });

        calculateCartTotals();
    };

    const addToCart = (productId, productName, productPrice, quantity) => {
        const itemIndex = cart.findIndex(item => item.id === productId);

        if (itemIndex > -1) {
            cart[itemIndex].quantity += quantity;
        } else {
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

    const removeFromCart = (event) => {
        // Buscamos el botón, incluso si el click fue en el ícono <i>
        const button = event.currentTarget; 
        const productId = button.dataset.productId;
        
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        renderCart();
    };

    const updateCartQuantity = (event) => {
        const input = event.currentTarget;
        const productId = input.dataset.productId;
        let newQuantity = parseInt(input.value);

        if (isNaN(newQuantity) || newQuantity < 1) {
            newQuantity = 1;
            input.value = 1; 
        }

        const itemIndex = cart.findIndex(item => item.id === productId);

        if (itemIndex > -1) {
            cart[itemIndex].quantity = newQuantity;
            
            const item = cart[itemIndex];
            const newSubtotal = item.price * newQuantity;
            const subtotalCell = input.closest('tr').querySelector('.subtotal-display');
            if(subtotalCell) subtotalCell.textContent = formatPrice(newSubtotal);

            saveCart();
            calculateCartTotals();
        }
    };

    const calculateCartTotals = () => {
        let total = 0;
        let totalItems = 0;

        cart.forEach(item => {
            total += item.price * item.quantity;
            totalItems += item.quantity;
        });
        
        updateSummary(total, totalItems);
    };
    
    const updateSummary = (total, totalItems) => {
        finalTotalDisplay.textContent = formatPrice(total);
        totalItemsDisplay.textContent = totalItems.toString();
        btnFinalize.disabled = cart.length === 0;
    };

    // ----------------------------------------------------------------------
    // 4. LISTENERS DE EVENTOS
    // ----------------------------------------------------------------------
    
    ADD_TO_CART_BUTTONS.forEach(button => {
        button.addEventListener('click', (event) => {
            // Animación visual simple en el botón en lugar de alerta
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fa-solid fa-check"></i> Listo';
            button.style.backgroundColor = 'var(--success-color)';
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.style.backgroundColor = '';
            }, 1000);

            const productId = event.currentTarget.dataset.productId;
            const productName = event.currentTarget.dataset.productName;
            const cardProduct = event.currentTarget.closest('.card-product');
            const quantityInput = cardProduct.querySelector('.catalogo-qty-input');
            
            let quantity = parseInt(quantityInput.value);
            if (isNaN(quantity) || quantity < 1) {
                quantity = 1;
                quantityInput.value = 1;
            }
            
            const productPrice = parseFloat(cardProduct.dataset.price);

            if (productPrice && productId && productName && quantity) {
                addToCart(productId, productName, productPrice, quantity);
                // ALERTA ELIMINADA AQUÍ
            }
        });
    });

    btnFinalize.addEventListener('click', () => {
        if (cart.length === 0) {
            // ALERTA ELIMINADA: Simplemente no hace nada
            return;
        }

        let ultimoId = parseInt(localStorage.getItem('ultimoIdPedido')) || 12344;
        const nuevoId = ultimoId + 1;

        const totalVenta = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const gananciaEstimada = totalVenta * 0.30; 

        const nuevoPedido = {
            id: nuevoId,
            cliente: document.getElementById('clientName')?.textContent || "Cliente Web",
            fecha: new Date().toLocaleDateString('es-AR'),
            items: cart, 
            total: totalVenta,
            ganancia: gananciaEstimada,
            estado: 'Pendiente' 
        };

        const dbPedidos = JSON.parse(localStorage.getItem('db_pedidos')) || [];
        dbPedidos.push(nuevoPedido);
        
        localStorage.setItem('db_pedidos', JSON.stringify(dbPedidos));
        localStorage.setItem('ultimoIdPedido', nuevoId);

        // Limpieza
        cart = [];
        saveCart();
        renderCart();
        cargarHistorial(); 
        
        // ALERTA ELIMINADA: Feedback visual opcional
        // Hacemos scroll hacia el historial para que vea que se agregó
        const historialSection = document.querySelector('.orders-list');
        if(historialSection) historialSection.scrollIntoView({ behavior: 'smooth' });
    });


    // ----------------------------------------------------------------------
    // 5. INICIO DE LA APLICACIÓN
    // ----------------------------------------------------------------------
    loadCart();

    // ----------------------------------------------------------------------
    // 6. FUNCIONES DE HISTORIAL Y UI (CON MODAL)
    // ----------------------------------------------------------------------
    
    const cargarHistorial = () => {
        const historialContainer = document.querySelector('.orders-list'); 
        if (!historialContainer) return;

        const dbPedidos = JSON.parse(localStorage.getItem('db_pedidos')) || [];
        // Filtramos para mostrar los más nuevos primero
        const misPedidos = dbPedidos.sort((a, b) => b.id - a.id);

        historialContainer.innerHTML = ''; 

        if (misPedidos.length === 0) {
            document.getElementById('noOrdersMessage').style.display = 'block';
        } else {
            document.getElementById('noOrdersMessage').style.display = 'none';
            
            misPedidos.forEach(p => {
                let colorEstado = 'orange'; 
                if (p.estado === 'Aprobado') colorEstado = 'var(--success-color)';
                if (p.estado === 'Rechazado') colorEstado = 'var(--danger-color)';
                
                const li = document.createElement('li');
                li.style.display = 'flex';
                li.style.justifyContent = 'space-between';
                li.style.alignItems = 'center';

                li.innerHTML = `
                    <div>
                        <strong>Pedido #${p.id}</strong> - Fecha: ${p.fecha} <br>
                        <small>Estado: <span style="color: ${colorEstado}; font-weight: bold;">${p.estado}</span></small>
                    </div>
                    <div style="text-align: right;">
                        <span style="display:block; font-weight:bold; margin-bottom: 5px;">$${p.total.toLocaleString('es-AR')}</span>
                        <button class="btn-ver-detalle" onclick="abrirModalDetalle(${p.id})">
                            <i class="fa-solid fa-eye"></i> Ver
                        </button>
                    </div>
                `;
                historialContainer.appendChild(li);
            });
        }
    };

    cargarHistorial();

}); 

// ======================================================================
// 7. LÓGICA DE LA VENTANA MODAL (GLOBAL)
// ======================================================================

const modal = document.getElementById('modalDetallePedido');
const spanClose = document.querySelector('.close-modal');
const btnClose = document.querySelector('.btn-close-modal');

window.abrirModalDetalle = (idPedido) => {
    const dbPedidos = JSON.parse(localStorage.getItem('db_pedidos')) || [];
    const pedido = dbPedidos.find(p => p.id === idPedido);

    if (pedido && modal) {
        document.getElementById('modalTitulo').innerText = `Detalle del Pedido #${pedido.id}`;

        let filasHTML = '';
        pedido.items.forEach(item => {
            filasHTML += `
                <tr>
                    <td>${item.name}</td>
                    <td class="text-right">x${item.quantity}</td>
                    <td class="text-right">$${item.price.toLocaleString('es-AR')}</td>
                    <td class="text-right"><strong>$${(item.price * item.quantity).toLocaleString('es-AR')}</strong></td>
                </tr>
            `;
        });

        const contenidoHTML = `
            <p style="margin-bottom: 1rem; font-size: 1.4rem;"><strong>Fecha:</strong> ${pedido.fecha}</p>
            <table class="modal-table">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th class="text-right">Cant.</th>
                        <th class="text-right">Precio</th>
                        <th class="text-right">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${filasHTML}
                </tbody>
            </table>
            <div style="text-align: right; font-size: 1.6rem; margin-top: 1rem; padding-top: 1rem; border-top: 2px solid #eee;">
                Total Pagado: <strong style="color: var(--success-color);">$${pedido.total.toLocaleString('es-AR')}</strong>
            </div>
        `;

        document.getElementById('modalCuerpo').innerHTML = contenidoHTML;
        modal.style.display = "flex"; 
    }
};

const cerrarModal = () => {
    if(modal) modal.style.display = "none";
};

if(spanClose) spanClose.addEventListener('click', cerrarModal);
if(btnClose) btnClose.addEventListener('click', cerrarModal);

window.addEventListener('click', (event) => {
    if (event.target == modal) {
        cerrarModal();
    }
});