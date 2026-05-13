document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. VERIFICAR SI ESTÁ LOGEADO (TRUE o FALSE)
    // ==========================================
    const isUserLoggedIn = () => {
        // Revisamos si existe el nombre del usuario guardado en la memoria
        return localStorage.getItem('userName') !== null;
    };

    // ==========================================
    // 2. LÓGICA DE LA BARRA DE NAVEGACIÓN
    // ==========================================
    const navLogin = document.getElementById('nav-login');
    const navUser = document.getElementById('nav-user');
    const navCart = document.getElementById('nav-cart');
    const navUserName = document.getElementById('nav-user-name');
    const dropName = document.getElementById('drop-name');

    if (isUserLoggedIn()) {
        // --- LOGIN = TRUE ---
        if (navLogin) navLogin.style.display = 'none'; // Ocultamos "Acceder"
        
        if (navUser) {
            navUser.style.display = 'block'; // Mostramos el menú desplegable
            
            // Sacamos el primer nombre para que no quede tan largo
            const nombreCompleto = localStorage.getItem('userName');
            const primerNombre = nombreCompleto ? nombreCompleto.split(' ')[0] : 'Usuario';
            
            if (navUserName) navUserName.textContent = primerNombre;
            if (dropName) dropName.textContent = `Hola, ${primerNombre}`;
        }
        
        // El carrito solo se muestra si el rol es 'cliente' (el vendedor no compra)
        if (navCart && localStorage.getItem('userRol') === 'cliente') {
            navCart.style.display = 'block';
        }

    } else {
        // --- LOGIN = FALSE ---
        if (navLogin) navLogin.style.display = 'block'; // Dejamos "Acceder" visible
        if (navUser) navUser.style.display = 'none';    // Ocultamos el perfil
        if (navCart) navCart.style.display = 'none';    // Ocultamos el carrito
    }

    // ==========================================
    // 3. FUNCIONAMIENTO DEL MENÚ DESPLEGABLE
    // ==========================================
    const avatarBtn = document.getElementById('avatar-btn');
    const dropdownMenu = document.getElementById('dropdown-menu');

    if (avatarBtn && dropdownMenu) {
        avatarBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita que se cierre al instante
            dropdownMenu.classList.toggle('active'); // Abre y cierra el menú
        });

        // Cierra el menú si tocás en cualquier otro lado de la pantalla
        document.addEventListener('click', (e) => {
            if (!dropdownMenu.contains(e.target) && !avatarBtn.contains(e.target)) {
                dropdownMenu.classList.remove('active');
            }
        });
    }

    // ==========================================
    // 4. CERRAR SESIÓN (LOGOUT)
    // ==========================================
    const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Borramos los datos de la memoria
            localStorage.removeItem('userName');
            localStorage.removeItem('userRol');
            localStorage.removeItem('userType'); // Por si quedó alguno viejo
            
            // Redirigimos al inicio
            window.location.href = 'index.html';
        });
    }

    // (Opcional) Logo Caxambu lleva al inicio
    const logoContainer = document.querySelector('.container-logo');
    if (logoContainer) {
        logoContainer.style.cursor = 'pointer'; 
        logoContainer.addEventListener('click', () => {
            window.location.href = 'index.html';    
        });
    }

    // Protección de rutas: si no está logeado y quiere entrar a cliente.html, lo manda al login
    const paginaActual = window.location.pathname.split('/').pop();
    if (paginaActual === 'cliente.html' && !isUserLoggedIn()) {
        window.location.replace('login.html');
    }
});