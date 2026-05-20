import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
    
    const tbodyProductos = document.querySelector('.product-management-table tbody');

    // ======================================================================
    // 1. CARGAR PRODUCTOS DESDE SUPABASE
    // ======================================================================
    async function cargarProductos() {
        if (!tbodyProductos) return;

        tbodyProductos.innerHTML = '<tr><td colspan="6" style="text-align:center;">Cargando inventario desde la base de datos...</td></tr>';

        const { data: productos, error } = await supabase
            .from('productos')
            .select('*')
            .order('id', { ascending: true }); 

        if (error) {
            console.error("Error al cargar productos:", error.message);
            tbodyProductos.innerHTML = '<tr><td colspan="6" style="text-align:center; color:red;">Error al cargar el inventario.</td></tr>';
            return;
        }

        if (!productos || productos.length === 0) {
            tbodyProductos.innerHTML = '<tr><td colspan="6" style="text-align:center;">No hay productos registrados. Ve a Supabase a crear el primero.</td></tr>';
            return;
        }

        tbodyProductos.innerHTML = ''; 
        
        productos.forEach(producto => {
            // Leemos el costo desde Supabase (o ponemos 0 si está vacío)
            const precioCosto = producto.precio_costo || 0;
            const ganancia = producto.precio - precioCosto;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${producto.nombre}</td>
                <td><input type="number" class="stock" id="stock-${producto.id}" value="${producto.stock}" min="0"></td>
                <td><input type="number" class="price" id="precio-${producto.id}" value="${producto.precio}" min="0"></td>
                <td><input type="number" class="cost-price" id="costo-${producto.id}" value="${precioCosto}" min="0"></td>
                <td><input type="number" class="profit" id="ganancia-${producto.id}" value="${ganancia}" min="0" disabled></td>
                <td>
                    <button class="btn-sm btn-save" data-id="${producto.id}" title="Guardar Cambios">
                        <i class="fa-solid fa-cloud-arrow-up"></i>
                    </button>
                </td>
            `;
            tbodyProductos.appendChild(tr);

            // =================================================================
            // MAGIA EN VIVO: Calcular ganancia mientras el usuario escribe
            // =================================================================
            const inputPrecio = document.getElementById(`precio-${producto.id}`);
            const inputCosto = document.getElementById(`costo-${producto.id}`);
            const inputGanancia = document.getElementById(`ganancia-${producto.id}`);

            const recalcularGanancia = () => {
                const venta = parseFloat(inputPrecio.value) || 0;
                const costo = parseFloat(inputCosto.value) || 0;
                inputGanancia.value = venta - costo;
            };

            // Escuchar cada vez que se teclea un número en Precio o Costo
            inputPrecio.addEventListener('input', recalcularGanancia);
            inputCosto.addEventListener('input', recalcularGanancia);
        });

        activarBotonesGuardar();
    }

    // ======================================================================
    // 2. GUARDAR CAMBIOS EN SUPABASE
    // ======================================================================
    function activarBotonesGuardar() {
        const botonesGuardar = document.querySelectorAll('.btn-save');

        botonesGuardar.forEach(boton => {
            boton.addEventListener('click', async (e) => {
                const btn = e.target.closest('button');
                const productId = btn.getAttribute('data-id');
                
                const nuevoStock = document.getElementById(`stock-${productId}`).value;
                const nuevoPrecio = document.getElementById(`precio-${productId}`).value;
                const nuevoCosto = document.getElementById(`costo-${productId}`).value;

                btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
                btn.style.backgroundColor = '#ccc';

                // Guardamos los 3 datos en Supabase
                const { error } = await supabase
                    .from('productos')
                    .update({ 
                        stock: parseInt(nuevoStock), 
                        precio: parseFloat(nuevoPrecio),
                        precio_costo: parseFloat(nuevoCosto)
                    })
                    .eq('id', productId);

                if (error) {
                    alert("Error al guardar: " + error.message);
                    btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i>';
                    btn.style.backgroundColor = '';
                } else {
                    btn.innerHTML = '<i class="fa-solid fa-check"></i>';
                    btn.style.backgroundColor = '#28a745';
                    btn.style.color = 'white';
                    
                    setTimeout(() => {
                        btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i>';
                        btn.style.backgroundColor = '';
                    }, 2000);
                }
            });
        });
    }
    // ======================================================================
    // 3. CARGAR PEDIDOS DE LOS CLIENTES DESDE SUPABASE
    // ======================================================================
    const contenedorPedidos = document.querySelector('.order-list');

    async function cargarPedidos() {
        if (!contenedorPedidos) return;

        contenedorPedidos.innerHTML = '<p style="text-align:center;">Buscando pedidos nuevos...</p>';

        // Traemos todos los pedidos ordenados por fecha (los más nuevos primero)
        const { data: pedidos, error } = await supabase
            .from('pedidos')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error al cargar pedidos:", error.message);
            contenedorPedidos.innerHTML = '<p style="color:red; text-align:center;">Error al cargar los pedidos.</p>';
            return;
        }

        if (!pedidos || pedidos.length === 0) {
            contenedorPedidos.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #666; width: 100%; border: 2px dashed #ccc; border-radius: 8px;">
                    <i class="fa-solid fa-basket-shopping" style="font-size: 3rem; margin-bottom: 1rem; color: #ccc;"></i>
                    <p style="font-size: 1.6rem;">No hay pedidos pendientes.</p>
                </div>`;
            return;
        }

        contenedorPedidos.innerHTML = '';

        pedidos.forEach(pedido => {
            let filasProductos = '';
            
            // Recorremos el JSON de productos que guardó el cliente
            pedido.productos.forEach(item => {
                let subtotal = item.price * item.quantity;
                filasProductos += `
                    <tr>
                        <td>${item.name}</td>
                        <td style="text-align: center;">${item.quantity}</td>
                        <td style="text-align: right;">$${parseFloat(item.price).toLocaleString('es-AR')}</td>
                        <td style="text-align: right;">$${subtotal.toLocaleString('es-AR')}</td>
                    </tr>
                `;
            });

            // Colores según el estado
            let claseEstado = ''; 
            let estiloBadge = 'color: orange; font-weight: bold;';
            
            if (pedido.estado === 'Aprobado') {
                claseEstado = 'approved'; 
                estiloBadge = 'color: var(--success-color); font-weight: bold;';
            } else if (pedido.estado === 'Rechazado') {
                claseEstado = 'denied';
                estiloBadge = 'color: var(--danger-color); font-weight: bold;';
            }

            // Formatear la fecha para que se vea linda
            const fechaCorta = new Date(pedido.created_at).toLocaleDateString('es-AR') + ' ' + new Date(pedido.created_at).toLocaleTimeString('es-AR', {hour: '2-digit', minute:'2-digit'});

            const card = document.createElement('div');
            card.className = `order-card ${claseEstado}`;
            
            // Armamos la tarjeta
            card.innerHTML = `
                <h4>Pedido (ID: ${pedido.id.substring(0,6)}...)</h4>
                <p>Fecha: <strong>${fechaCorta}</strong></p>
                <p>Estado: <span style="${estiloBadge}">${pedido.estado}</span></p>
                
                <div class="order-details-summary">
                    <h5>Detalle de la Compra</h5>
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
                        <p>Total a Cobrar: <strong style="color: var(--success-color); font-size: 1.2em;">$${parseFloat(pedido.total).toLocaleString('es-AR')}</strong></p>
                    </div>
                </div>
                
                <div class="order-actions">
                    ${pedido.estado === 'Pendiente' ? `
                        <button class="btn-approve btn-estado" data-id="${pedido.id}" data-estado="Aprobado">
                            <i class="fa-solid fa-check"></i> Aprobar
                        </button>
                        <button class="btn-deny btn-estado" data-id="${pedido.id}" data-estado="Rechazado">
                            <i class="fa-solid fa-xmark"></i> Rechazar
                        </button>
                    ` : ''}
                </div>
            `;
            
            contenedorPedidos.appendChild(card);
        });

        // Activamos los botones de Aprobar/Rechazar
        activarBotonesEstado();
    }

    // ======================================================================
    // 4. CAMBIAR EL ESTADO DEL PEDIDO EN SUPABASE
    // ======================================================================
    function activarBotonesEstado() {
        const botones = document.querySelectorAll('.btn-estado');
        botones.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const boton = e.target.closest('button');
                const pedidoId = boton.getAttribute('data-id');
                const nuevoEstado = boton.getAttribute('data-estado');

                // Ponemos un loader mientras guarda
                boton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
                
                // Actualizamos la tabla pedidos
                const { error } = await supabase
                    .from('pedidos')
                    .update({ estado: nuevoEstado })
                    .eq('id', pedidoId);

                if (error) {
                    alert('Error al actualizar pedido: ' + error.message);
                } else {
                    cargarPedidos(); // Recargamos la lista para que se pinte de verde/rojo
                }
            });
        });
    }

    // Ejecutamos la función apenas carga la página
    cargarPedidos();
});