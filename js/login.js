import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage');

    const showError = (message) => {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    };

    const handleLogin = async (event) => {
        event.preventDefault();
        errorMessage.style.display = 'none';

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // 1. Iniciar sesión en la autenticación
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            showError('Correo o contraseña incorrectos.');
            return;
        }

        // 2. ¡LO NUEVO! Buscar el rol en la tabla 'perfiles'
        const { data: perfilData, error: perfilError } = await supabase
            .from('perfiles')
            .select('rol, nombre_completo')
            .eq('id', authData.user.id)
            .single(); // Traemos solo una fila

        if (perfilError) {
            console.error("Error al obtener perfil:", perfilError.message);
            showError('Hubo un problema al leer tu perfil.');
            return;
        }
        

       // 3. Redirigir según el rol (limpiando espacios, mayúsculas Y comillas accidentales)
        const rolLimpio = perfilData.rol.trim().toLowerCase().replace(/['"]+/g, '');
        
        console.log("Rol detectado y limpio:", rolLimpio);
        
        localStorage.setItem('userName', perfilData.nombre_completo);
        localStorage.setItem('userRol', rolLimpio);

        if (rolLimpio === 'vendedor') {
            alert(`¡Hola ${perfilData.nombre_completo}! Entrando al panel de vendedor.`);
            window.location.href = 'vendedor.html';
        } else {
            alert(`¡Hola ${perfilData.nombre_completo}! Entrando a la tienda.`);
            window.location.href = 'cliente.html';
        }
    };

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});