import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
    // ----------------------------------------------------------------------
    // 1. INICIALIZACIÓN Y VARIABLES
    // ----------------------------------------------------------------------
    let cart = []; 
    const remitoBody = document.getElementById('remitoBody');
    const finalTotalDisplay = document.getElementById('finalTotalDisplay');
    const totalItemsDisplay = document.getElementById('totalItemsDisplay');
    const btnFinalize = document.querySelector('.btn-primary-finalize');
    const catalogoContainer = document.getElementById('catalogo-productos');

    // ----------------------------------------------------------------------
    // 2. FUNCIÓN DE FORMATO DE NÚMEROS
    // ----------------------------------------------------------------------
    const formatPrice = (price) => {
        return '$' + parseFloat(price).toLocaleString('es-AR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    // ----------------------------------------------------------------------
    // 3. CARGAR PRODUCTOS DESDE SUPABASE
    // ----------------------------------------------------------------------
    async function cargarCatalogo() {
        if (!catalogoContainer) return;

        catalogoContainer.innerHTML = '<p style="text-align:center; width:100%; grid-column: 1 / -1;">Cargando nuestros cafés premium...</p>';

        const { data: productos, error } = await supabase
            .from('productos')
            .select('*')
            .gt('stock', 0)
            .order('id', { ascending: true });

        if (error) {
            console.error("Error al traer productos:", error.message);
            catalogoContainer.innerHTML = '<p style="text-align:center; width:100%; color:red; grid-column: 1 / -1;">Error al cargar la tienda.</p>';
            return;
        }

        if (!productos || productos.length === 0) {
            catalogoContainer.innerHTML = '<p style="text-align:center; width:100%; grid-column: 1 / -1;">¡Pronto tendremos más stock disponible!</p>';
            return;
        }

        catalogoContainer.innerHTML = '';

        productos.forEach(producto => {
            let imgPorDefecto = '/img/cafe-2.png';
            if(producto.nombre.toLowerCase().includes('azucar') || producto.nombre.toLowerCase().includes('azúcar')) imgPorDefecto = '/img/Caja-Azucar.png';
            if(producto.nombre.toLowerCase().includes('edulco')) imgPorDefecto = '/img/Caja-Edulco.png';
            if(producto.nombre.toLowerCase().includes('viena') || producto.nombre.toLowerCase().includes('brasil')) imgPorDefecto = '/img/cafe-viena.jpg';

            const urlImagen = producto.imagen_url || imgPorDefecto;

            const div = document.createElement('div');
            div.className = 'card-product';
            div.setAttribute('data-product-id', producto.id);
            div.setAttribute('data-price', producto.precio);

            div.innerHTML = `
                <div class="container-img">
                    <img src="${urlImagen}" alt="${producto.nombre}" />
                </div>
                <div class="content-card-product">
                    <h3>${producto.nombre}</h3>
                    <p class="price">${formatPrice(producto.precio)}</p>
                    <div class="product-action-group">
                        <div class="quantity-control">
                            <label for="qty-${producto.id}">Cant:</label>
                            <input type="number" value="1" min="1" max="${producto.stock}" class="catalogo-qty-input" id="qty-${producto.id}">
                        </div>
                        <button class="btn-primary-add-catalogo" data-product-id="${producto.id}" data-product-name="${producto.nombre}" data-price="${producto.precio}">
                            <i class="fa-solid fa-cart-plus"></i> Añadir
                        </button>
                    </div>
                </div>
            `;
            catalogoContainer.appendChild(div);
        });

        activarBotonesAñadir();
    }


    // ----------------------------------------------------------------------
    // 4. LÓGICA DEL CARRITO
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
                    <input type="number" value="${item.quantity}" min="1" class="remito-qty-input" data-product-id="${item.id}">
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
            cart.push({ id: productId, name: productName, price: productPrice, quantity: quantity });
        }
        saveCart();
        renderCart();
    };

    const removeFromCart = (event) => {
        const button = event.currentTarget; 
        const productId = button.dataset.productId;
        cart = cart.filter(item => item.id != productId);
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

        const itemIndex = cart.findIndex(item => item.id == productId);

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
    // 5. EVENTOS (Botones añadir y confirmar compra)
    // ----------------------------------------------------------------------
    
    function activarBotonesAñadir() {
        const botonesAdd = document.querySelectorAll('.btn-primary-add-catalogo');
        botonesAdd.forEach(button => {
            button.addEventListener('click', (event) => {
                const originalText = button.innerHTML;
                button.innerHTML = '<i class="fa-solid fa-check"></i> Listo';
                button.style.backgroundColor = 'var(--success-color)';
                
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.style.backgroundColor = '';
                }, 1000);

                const productId = event.currentTarget.dataset.productId;
                const productName = event.currentTarget.dataset.productName;
                const productPrice = parseFloat(event.currentTarget.dataset.price);
                
                const cardProduct = event.currentTarget.closest('.card-product');
                const quantityInput = cardProduct.querySelector('.catalogo-qty-input');
                
                let quantity = parseInt(quantityInput.value);
                if (isNaN(quantity) || quantity < 1) {
                    quantity = 1;
                    quantityInput.value = 1;
                }
                
                if (productPrice && productId && productName && quantity) {
                    addToCart(productId, productName, productPrice, quantity);
                }
            });
        });
    }

    // MANDAR PEDIDO A SUPABASE
    btnFinalize.addEventListener('click', async () => {
        if (cart.length === 0) return;

        // LE PREGUNTAMOS A SUPABASE QUIÉN ESTÁ LOGUEADO AHORA MISMO
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (!user || authError) {
            alert("Debes iniciar sesión para confirmar tu compra.");
            window.location.href = 'login.html';
            return;
        }

        // Animación del botón
        const originalText = btnFinalize.innerHTML;
        btnFinalize.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Procesando...';
        btnFinalize.disabled = true;

        const totalVenta = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Armamos el objeto para Supabase usando el ID real del usuario
        const pedidoData = {
            cliente_id: user.id, 
            productos: cart,
            total: totalVenta,
            estado: 'Pendiente'
        };

        // Insertar en la tabla 'pedidos'
        const { data, error } = await supabase
            .from('pedidos')
            .insert([pedidoData])
            .select();

        if (error) {
            console.error("Error al crear pedido:", error);
            alert("Hubo un problema al procesar tu pedido. Intenta de nuevo.");
            btnFinalize.innerHTML = originalText;
            btnFinalize.disabled = false;
            return;
        }

        // Si sale bien: Limpiar carrito y actualizar vista
        cart = [];
        saveCart();
        renderCart();
        cargarHistorial(); // Recarga el historial desde Supabase
        
        btnFinalize.innerHTML = '<i class="fa-solid fa-check"></i> ¡Pedido Enviado!';
        btnFinalize.style.backgroundColor = 'var(--success-color)';
        
        setTimeout(() => {
            btnFinalize.innerHTML = originalText;
            btnFinalize.style.backgroundColor = '';
        }, 3000);

        const historialSection = document.querySelector('.orders-list');
        if(historialSection) historialSection.scrollIntoView({ behavior: 'smooth' });
    });


    // ----------------------------------------------------------------------
    // 6. HISTORIAL DE PEDIDOS DESDE SUPABASE
    // ----------------------------------------------------------------------
    
    async function cargarHistorial() {
        const historialContainer = document.querySelector('.orders-list'); 
        if (!historialContainer) return;

        // LE PREGUNTAMOS A SUPABASE QUIÉN ESTÁ LOGUEADO
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Traer solo los pedidos de ESTE cliente
        const { data: misPedidos, error } = await supabase
            .from('pedidos')
            .select('*')
            .eq('cliente_id', user.id)
            .order('created_at', { ascending: false }); // Los más nuevos primero

        historialContainer.innerHTML = ''; 

        if (error || !misPedidos || misPedidos.length === 0) {
            document.getElementById('noOrdersMessage').style.display = 'block';
        } else {
            document.getElementById('noOrdersMessage').style.display = 'none';
            
            // Guardamos globalmente para que el Modal los pueda leer después
            window.misPedidosGlobales = misPedidos; 

            misPedidos.forEach(p => {
                let colorEstado = 'orange'; 
                if (p.estado === 'Aprobado') colorEstado = 'var(--success-color)';
                if (p.estado === 'Rechazado') colorEstado = 'var(--danger-color)';
                
                const fechaCorta = new Date(p.created_at).toLocaleDateString('es-AR');

                const li = document.createElement('li');
                li.style.display = 'flex';
                li.style.justifyContent = 'space-between';
                li.style.alignItems = 'center';

                li.innerHTML = `
                    <div>
                        <strong>Pedido #${p.id.substring(0,8)}</strong> - Fecha: ${fechaCorta} <br>
                        <small>Estado: <span style="color: ${colorEstado}; font-weight: bold;">${p.estado}</span></small>
                    </div>
                    <div style="text-align: right;">
                        <span style="display:block; font-weight:bold; margin-bottom: 5px;">$${parseFloat(p.total).toLocaleString('es-AR')}</span>
                        <button class="btn-ver-detalle" onclick="abrirModalDetalle('${p.id}')">
                            <i class="fa-solid fa-eye"></i> Ver
                        </button>
                    </div>
                `;
                historialContainer.appendChild(li);
            });
        }
    };


    // ----------------------------------------------------------------------
    // 7. INICIO DE LA APLICACIÓN
    // ----------------------------------------------------------------------
    loadCart();
    cargarCatalogo(); // Dibuja la tienda
    cargarHistorial(); // Trae compras previas
}); 

// ======================================================================
// 8. LÓGICA DE LA VENTANA MODAL (GLOBAL)
// ======================================================================

const modal = document.getElementById('modalDetallePedido');
const spanClose = document.querySelector('.close-modal');
const btnClose = document.querySelector('.btn-close-modal');

window.abrirModalDetalle = (idPedido) => {
    const misPedidos = window.misPedidosGlobales || [];
    const pedido = misPedidos.find(p => p.id === idPedido);

    if (pedido && modal) {
        document.getElementById('modalTitulo').innerText = `Detalle del Pedido #${pedido.id.substring(0,8)}`;

        let filasHTML = '';
        pedido.productos.forEach(item => {
            filasHTML += `
                <tr>
                    <td>${item.name}</td>
                    <td class="text-right">x${item.quantity}</td>
                    <td class="text-right">$${parseFloat(item.price).toLocaleString('es-AR')}</td>
                    <td class="text-right"><strong>$${(item.price * item.quantity).toLocaleString('es-AR')}</strong></td>
                </tr>
            `;
        });

        const fechaCorta = new Date(pedido.created_at).toLocaleDateString('es-AR');

        const contenidoHTML = `
            <p style="margin-bottom: 1rem; font-size: 1.4rem;"><strong>Fecha:</strong> ${fechaCorta}</p>
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
                Total Pagado: <strong style="color: var(--success-color);">$${parseFloat(pedido.total).toLocaleString('es-AR')}</strong>
            </div>
        `;

        document.getElementById('modalCuerpo').innerHTML = contenidoHTML;
        modal.style.display = "flex"; 
    }
};

const cerrarModal = () => { if(modal) modal.style.display = "none"; };
if(spanClose) spanClose.addEventListener('click', cerrarModal);
if(btnClose) btnClose.addEventListener('click', cerrarModal);

window.addEventListener('click', (event) => {
    if (event.target == modal) cerrarModal();
});