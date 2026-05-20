document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. VERIFICAR SI ESTÁ LOGEADO (TRUE o FALSE)
    // ==========================================
    const isUserLoggedIn = () => {
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
    const dropEmail = document.getElementById('drop-email');

    if (isUserLoggedIn()) {
        if (navLogin) navLogin.style.display = 'none'; 
        
        if (navUser) {
            navUser.style.display = 'block'; 
            
            const nombreCompleto = localStorage.getItem('userName');
            const primerNombre = nombreCompleto ? nombreCompleto.split(' ')[0] : 'Usuario';
            const userEmail = localStorage.getItem('userEmail');
            
            if (navUserName) navUserName.textContent = primerNombre;
            if (dropName) dropName.textContent = `Hola, ${primerNombre}`;
            if (dropEmail && userEmail) dropEmail.textContent = userEmail;

            const clientNameElement = document.getElementById('clientName');
            if (clientNameElement) clientNameElement.textContent = primerNombre;
        }
        
        if (navCart && localStorage.getItem('userRol') === 'cliente') {
            navCart.style.display = 'block';
        }

    } else {
        // --- LOGIN = FALSE ---
        if (navLogin) navLogin.style.display = 'block'; 
        if (navUser) navUser.style.display = 'none';    
        if (navCart) navCart.style.display = 'none';    
    }

    // ==========================================
    // 3. FUNCIONAMIENTO DEL MENÚ DESPLEGABLE
    // ==========================================
    const avatarBtn = document.getElementById('avatar-btn');
    const dropdownMenu = document.getElementById('dropdown-menu');

    if (avatarBtn && dropdownMenu) {
        avatarBtn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            dropdownMenu.classList.toggle('active'); 
        });

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
            
            localStorage.removeItem('userName');
            localStorage.removeItem('userRol');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userType'); 
            
            window.location.href = 'index.html';
        });
    }

    const logoContainer = document.querySelector('.container-logo');
    if (logoContainer) {
        logoContainer.style.cursor = 'pointer'; 
        logoContainer.addEventListener('click', () => {
            window.location.href = 'index.html';    
        });
    }

    // Protección de rutas: si no está logeado y quiere entrar a cliente.html, lo manda al login
    const paginaActual = window.location.pathname.split('/').pop();
    const userRole = localStorage.getItem('userRol');

    if (['cliente.html', 'perfil.html', 'vendedor.html'].includes(paginaActual) && !isUserLoggedIn()) {
        window.location.replace('login.html');
        return;
    }

    if (paginaActual === 'cliente.html' && userRole === 'vendedor') {
        window.location.replace('vendedor.html');
        return;
    }

    if (paginaActual === 'vendedor.html' && userRole !== 'vendedor') {
        window.location.replace('cliente.html');
        return;
    }
});