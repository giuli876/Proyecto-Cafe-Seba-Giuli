document.addEventListener('DOMContentLoaded', () => {
    // 1. Obtener referencias a los elementos del DOM
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage');

    // ======================================================================
    // 2. SIMULACIÓN DE USUARIOS (En un sistema real, esto sería una API)
    // ======================================================================
    const USERS = [
        { 
            email: 'cliente@caxambu.com', 
            password: '123', 
            userType: 'Cliente', 
            name: 'Sr. Gómez' 
        },
        { 
            email: 'vendedor@caxambu.com', 
            password: '123', 
            userType: 'Vendedor', 
            name: 'Seba Vidal (Vendedor)' 
        }
    ];

    // ======================================================================
    // 3. FUNCIÓN PRINCIPAL DE INICIO DE SESIÓN
    // ======================================================================
    const handleLogin = (event) => {
        event.preventDefault(); // Detiene el envío del formulario tradicional

        // Limpiar mensajes de error previos
        errorMessage.style.display = 'none';
        errorMessage.textContent = '';

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (email === '' || password === '') {
            showError('Por favor, ingresa el correo y la contraseña.');
            return;
        }

        // Buscar el usuario en la lista de simulación
        const user = USERS.find(u => u.email === email && u.password === password);

        if (user) {
            // ÉXITO: Autenticación correcta

            // 1. Guardar la sesión en localStorage
            localStorage.setItem('userType', user.userType);
            localStorage.setItem('userName', user.name);
            
            // 2. Redirigir según el tipo de usuario
            if (user.userType === 'Cliente') {
                alert(`¡Bienvenido, ${user.name}! Serás redirigido a la tienda.`);
                window.location.href = 'cliente.html';
            } else if (user.userType === 'Vendedor') {
                alert(`¡Bienvenido, ${user.name}! Accediendo al panel de administración.`);
                window.location.href = 'vendedor.html';
            }
        } else {
            // ERROR: Credenciales incorrectas
            showError('Correo o contraseña incorrectos. Inténtalo de nuevo.');
        }
    };

    // Función de utilidad para mostrar errores
    const showError = (message) => {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    };

    // 4. Adjuntar el manejador al evento submit del formulario
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});
import { supabase } from './supabase.js';

async function probarConexion() {
    console.log("1. Llamando a la bodega de Supabase...");
    
    // Le pedimos a Supabase el estado de la sesión
    const { data, error } = await supabase.auth.getSession();

    if (error) {
        console.error("❌ Hubo un error al conectar:", error.message);
    } else {
        console.log("✅ ¡Conexión súper exitosa! Supabase respondió:", data);
    }
}

// Ejecutamos la prueba
probarConexion();