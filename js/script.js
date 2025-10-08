document.addEventListener('DOMContentLoaded', () => {

    // ======================================================================
    // 1. UTILIDADES GLOBALES DE SESIÓN
    // ======================================================================

    /**
     * Simula el estado de la sesión.
     * @returns {boolean} True si el usuario 'Cliente' está logeado (simulación con localStorage).
     */
    const isUserLoggedIn = () => {
        // En un proyecto real, esto validaría un token o una cookie.
        return localStorage.getItem('userType') === 'Cliente';
    };

    /**
     * Redirige al usuario si no está logeado y trata de acceder a una página restringida.
     * @param {string} restrictedPage El nombre de la página que está visitando (ej: 'cliente.html').
     * @param {string} loginPage La página a la que debe ir si no está logeado (ej: 'login.html').
     */
    const checkLoginRedirection = (restrictedPage, loginPage = 'login.html') => {
        // Ejecuta la redirección solo si estamos en la página restringida y no está logeado.
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage === restrictedPage && !isUserLoggedIn()) {
            // alert("Debes iniciar sesión para acceder a esta página."); // Opcional
            window.location.replace(loginPage);
        }
    };

    // ======================================================================
    // 2. LÓGICA DE NAVEGACIÓN Y EVENTOS DE MENÚ
    // ======================================================================

    // A) Enlaces principales del menú (Home, Tienda, Mi Cuenta, Soporte)
    const menuLinks = document.querySelectorAll('.menu a');
    
    menuLinks.forEach(link => {
        const linkText = link.textContent.trim();
        
        // 1. Eliminar el comportamiento por defecto para manejar la lógica de login
        if (linkText === 'Tienda' || linkText === 'Mi Cuenta') {
            
            // Asignar el listener para la redirección controlada
            link.addEventListener('click', (event) => {
                event.preventDefault(); 
                
                if (isUserLoggedIn()) {
                    // Logeado: Tienda o Mi Cuenta van al dashboard de cliente
                    window.location.href = 'cliente.html';
                } else {
                    // No Logeado: Va a iniciar sesión
                    window.location.href = 'login.html';
                }
            });
            
            // Reemplazamos el 'href' para que sea más claro que el JS lo maneja
            link.href = '#'; 
        } 
        // 2. Enlaces sin restricción (sólo asegurar su href)
        else if (linkText === 'Inicio') {
            link.href = 'index.html';
        } else if (linkText === 'Soporte') {
            link.href = 'soporte.html';
        }
    });

    // B) Logo Caxambu
    const logoContainer = document.querySelector('.container-logo');
    if (logoContainer) {
        logoContainer.style.cursor = 'pointer'; 
        logoContainer.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    // ======================================================================
    // 3. OTRAS FUNCIONES GLOBALES (Modo Oscuro, Nombre de Cliente)
    // ======================================================================

    // Muestra el nombre del cliente en el dashboard si está logeado
    const clientNameElement = document.getElementById('clientName');
    if (clientNameElement) {
        if (isUserLoggedIn()) {
            // Aquí deberías cargar el nombre real de la sesión, no solo 'Cliente'
            clientNameElement.textContent = localStorage.getItem('userName') || 'Cliente';
        } else {
            // Si el script se carga en una página sin login, mostrar "Invitado"
            clientNameElement.textContent = 'Invitado';
        }
    }
    
    // Función de Modo Oscuro (se implementará cuando lo solicites)
    const toggleDarkMode = () => {
        // Lógica futura para cambiar la clase 'dark-mode' en el body.
    };
    
    // ======================================================================
    // 4. INICIO DE VERIFICACIONES
    // ======================================================================

    // Ejecutar la verificación de login al cargar la página. 
    // Si estás en cliente.html y no estás logeado, te envía a login.html.
    checkLoginRedirection('cliente.html');
});
