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

        const { data: perfilData, error: perfilError } = await supabase
            .from('perfiles')
            .select('rol, nombre_completo')
            .eq('id', authData.user.id)
            .single(); 

        if (perfilError) {
            console.error("Error al obtener perfil:", perfilError.message);
            showError('Hubo un problema al leer tu perfil.');
            return;
        }
        

        const rolLimpio = perfilData.rol.trim().toLowerCase().replace(/['"]+/g, '');
        
        console.log("Rol detectado y limpio:", rolLimpio);
        
        localStorage.setItem('userName', perfilData.nombre_completo);
        localStorage.setItem('userRol', rolLimpio);
        localStorage.setItem('userEmail', email);

        if (rolLimpio === 'vendedor') {
            window.location.href = 'vendedor.html';
        } else {
            window.location.href = 'cliente.html';
        }
    };

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});