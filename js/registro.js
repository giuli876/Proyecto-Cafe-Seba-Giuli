import { supabase } from './supabase.js';

const formRegistro = document.getElementById('form-registro');
const inputNombre = document.getElementById('name'); 
const inputEmail = document.getElementById('email');
const inputPassword = document.getElementById('password');
const inputConfirmPassword = document.getElementById('confirm-password');
const errorMessage = document.getElementById('errorMessage');

const showError = (message) => {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    errorMessage.style.backgroundColor = '#f8d7da'; 
    errorMessage.style.color = '#721c24';
};

const showSuccess = (message) => {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    errorMessage.style.backgroundColor = 'var(--success-color, #28a745)'; 
    errorMessage.style.color = 'white';
};

formRegistro.addEventListener('submit', async function(evento) {
    evento.preventDefault(); 
    errorMessage.style.display = 'none';

    const nombreValor = inputNombre.value.trim();
    const emailValor = inputEmail.value.trim();
    const passwordValor = inputPassword.value.trim();
    const confirmPasswordValor = inputConfirmPassword.value.trim();
    // ==========================================
    // 🛡️ SÚPER VALIDACIONES FRONTEND (Para el 10)
    // ==========================================

    // 1. Verificamos que no haya dejado campos vacíos
    if (!nombreValor || !emailValor || !passwordValor || !confirmPasswordValor) {
        showError("Por favor, completá todos los campos para registrarte.");
        return; 
    }

    // 2. Verificamos que el email tenga un formato real (texto @ texto . texto)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValor)) {
        showError("El correo electrónico no es válido. Asegurate de incluir el '@' y un dominio.");
        return;
    }

    // 3. Verificamos que la contraseña sea segura (Mínimo 6 caracteres)
    if (passwordValor.length < 6) {
        showError("La contraseña es muy corta. Debe tener al menos 6 caracteres.");
        return;
    }

    if (passwordValor !== confirmPasswordValor) {
        showError("Las contraseñas no coinciden. Por favor, verificalo.");
        return; 
    }

    console.log("Intentando registrar a:", emailValor);

    // Cambiamos el texto del botón mientras carga
    const btnSubmit = formRegistro.querySelector('button[type="submit"]');
    const textoOriginal = btnSubmit.textContent;
    btnSubmit.textContent = 'Registrando...';
    btnSubmit.disabled = true;

    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: emailValor,
        password: passwordValor,
    });

    if (authError) {
        console.error("Error al registrar correo:", authError.message);
        alert("Hubo un error al registrar: " + authError.message);
        btnSubmit.textContent = textoOriginal;
        btnSubmit.disabled = false;
        return; 
    }

    console.log("Usuario de autenticación creado. Guardando perfil...");

    const { error: perfilError } = await supabase
        .from('perfiles')
        .insert([
            { 
                id: authData.user.id, 
                nombre_completo: nombreValor,
                rol: 'cliente'
            }
        ]);

    if (perfilError) {
        console.error("Error al guardar el perfil:", perfilError.message);
        showError("Se creó la cuenta, pero hubo un problema guardando tu nombre.");
        btnSubmit.textContent = textoOriginal;
        btnSubmit.disabled = false;
    } else {
        console.log("¡Perfil guardado con éxito!");
        showSuccess("¡Registro exitoso! Redirigiendo al login...");

        setTimeout(() => {
            formRegistro.reset();
            window.location.href = "login.html";
        }, 1500);
    }
});