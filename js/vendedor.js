document.addEventListener('DOMContentLoaded', () => {

    // ======================================================================
    // 1. GESTIÓN DE PRODUCTOS (Lógica de la Tabla Estática)
    // ======================================================================

    const productRows = document.querySelectorAll('.product-management-table tbody tr');

    productRows.forEach(row => {
        const stockInput = row.querySelector('.stock');
        const btnPlus = row.querySelector('.add-stock');
        const btnMinus = row.querySelector('.remove-stock');
        const btnConfirm = row.querySelector('.confirm-action');

        const updateStock = (amount) => {
            let currentVal = parseInt(stockInput.value) || 0;
            let newVal = Math.max(0, currentVal + amount);
            stockInput.value = newVal;
        };

        if (btnPlus) btnPlus.addEventListener('click', () => updateStock(1));
        if (btnMinus) btnMinus.addEventListener('click', () => updateStock(-1));
        
        if (btnConfirm) {
            btnConfirm.addEventListener('click', () => {
                // ALERTA ELIMINADA: Feedback visual silencioso
                const icono = btnConfirm.querySelector('i');
                if(icono) icono.style.color = '#28a745'; // Se pone verde
                setTimeout(() => { if(icono) icono.style.color = ''; }, 1000); // Vuelve al color original
            });
        }
    });

    // ======================================================================
    // 2. SISTEMA DE PEDIDOS (Lógica de Tarjetas Dinámicas)
    // ======================================================================

    const renderizarPedidosVendedor = () => {
        const contenedorPedidos = document.querySelector('.order-list'); 
        
        if (!contenedorPedidos) {
            console.error("Error: No se encontró el contenedor .order-list en el HTML");
            return;
        }

        const dbPedidos = JSON.parse(localStorage.getItem('db_pedidos')) || [];
        
        contenedorPedidos.innerHTML = ''; 

        if (dbPedidos.length === 0) {
            contenedorPedidos.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #666; width: 100%; border: 2px dashed #ccc; border-radius: 8px;">
                    <i class="fa-solid fa-basket-shopping" style="font-size: 3rem; margin-bottom: 1rem; color: #ccc;"></i>
                    <p style="font-size: 1.6rem;">No hay pedidos pendientes.</p>
                    <small>Ve a la tienda (Cliente) y realiza una compra para verla aquí.</small>
                </div>`;
            return;
        }

        dbPedidos.sort((a, b) => b.id - a.id).forEach((pedido) => {
            
            let filasProductos = '';
            pedido.items.forEach(item => {
                let subtotal = item.price * item.quantity;
                filasProductos += `
                    <tr>
                        <td>${item.name}</td>
                        <td style="text-align: center;">${item.quantity}</td>
                        <td style="text-align: right;">$${item.price.toLocaleString('es-AR')}</td>
                        <td style="text-align: right;">$${subtotal.toLocaleString('es-AR')}</td>
                    </tr>
                `;
            });

            let claseEstado = ''; 
            let estiloBadge = 'color: orange; font-weight: bold;';
            
            if (pedido.estado === 'Aprobado') {
                claseEstado = 'approved'; 
                estiloBadge = 'color: var(--success-color); font-weight: bold;';
            } else if (pedido.estado === 'Rechazado') {
                claseEstado = 'denied';
                estiloBadge = 'color: var(--danger-color); font-weight: bold;';
            }

            const ganancia = pedido.ganancia || (pedido.total * 0.3);

            const card = document.createElement('div');
            card.className = `order-card ${claseEstado}`;
            card.id = `order-${pedido.id}`;
            
            card.innerHTML = `
                <h4>Pedido #${pedido.id}</h4>
                <p>Cliente: <strong>${pedido.cliente}</strong></p>
                <p>Estado: <span style="${estiloBadge}">${pedido.estado}</span></p>
                
                <div class="order-details-summary">
                    <h5>Detalle del Pedido</h5>
                    <table class="order-summary-table">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Cant.</th>
                                <th>P. Unit.</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>${filasProductos}</tbody>
                    </table>
                    <div class="summary-totals">
                        <p>Total Prod: <strong>$${pedido.total.toLocaleString('es-AR')}</strong></p>
                        <hr class="divider">
                        <p class="ganancia">Ganancia Est: <span style="color: var(--success-color);">$${ganancia.toLocaleString('es-AR')}</span></p>
                    </div>
                </div>
                
                <div class="order-total">
                    <h4>Total a Cobrar: <strong>$${pedido.total.toLocaleString('es-AR')}</strong></h4>
                </div>
                
                <div class="order-actions">
                    ${pedido.estado === 'Pendiente' ? `
                        <button class="btn-approve" onclick="actualizarEstadoPedido(${pedido.id}, 'Aprobado')">
                            <i class="fa-solid fa-check"></i> Aprobar
                        </button>
                        <button class="btn-deny" onclick="actualizarEstadoPedido(${pedido.id}, 'Rechazado')">
                            <i class="fa-solid fa-xmark"></i> Rechazar
                        </button>
                    ` : ''}
                </div>
            `;
            
            contenedorPedidos.appendChild(card);
        });
    };

    renderizarPedidosVendedor();
});

// ======================================================================
// 3. FUNCIONES GLOBALES (Fuera del DOMContentLoaded)
// ======================================================================

window.actualizarEstadoPedido = (id, nuevoEstado) => {
    let dbPedidos = JSON.parse(localStorage.getItem('db_pedidos')) || [];
    const index = dbPedidos.findIndex(p => p.id === id);
    
    if (index !== -1) {
        dbPedidos[index].estado = nuevoEstado;
        localStorage.setItem('db_pedidos', JSON.stringify(dbPedidos));
        location.reload(); 
    } else {
        console.error("Error: No se encontró el pedido.");
    }
};