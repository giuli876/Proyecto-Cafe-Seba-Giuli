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
};

const showSuccess = (message) => {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    errorMessage.style.backgroundColor = 'var(--success-color)'; 
    errorMessage.style.color = 'white';
};

formRegistro.addEventListener('submit', async function(evento) {
    evento.preventDefault(); 
    errorMessage.style.display = 'none';

    const nombreValor = inputNombre.value;
    const emailValor = inputEmail.value;
    const passwordValor = inputPassword.value;
    const confirmPasswordValor = inputConfirmPassword.value;

    if (passwordValor !== confirmPasswordValor) {
        showError("Las contraseñas no coinciden. Por favor, verificalo.");
        return; 
    }

    console.log("Intentando registrar a:", emailValor);

    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: emailValor,
        password: passwordValor,
    });

    if (authError) {
        console.error("Error al registrar correo:", authError.message);
        alert("Hubo un error al registrar: " + authError.message);
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
        alert("Se creó la cuenta, pero hubo un problema guardando tu nombre.");
    } else {
        console.log("¡Perfil guardado con éxito!");
        showSuccess("¡Registro exitoso! Redirigiendo al login...");

        setTimeout(() => {
            formRegistro.reset();
            window.location.href = "login.html";
        }, 1500);
    }
});