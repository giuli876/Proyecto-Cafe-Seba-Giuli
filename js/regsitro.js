// 1. Traemos nuestra conexión a Supabase
import { supabase } from './supabase.js';

// 2. Buscamos los elementos del HTML que preparamos en el Paso 1
const formRegistro = document.getElementById('form-registro');
const inputEmail = document.getElementById('email');
const inputPassword = document.getElementById('password');

// 3. Le decimos qué hacer cuando se presione el botón "Registrarse"
formRegistro.addEventListener('submit', async function(evento) {
    // Esto evita que la página se recargue de golpe al enviar el formulario
    evento.preventDefault(); 

    // Obtenemos el texto que escribió el usuario
    const emailValor = inputEmail.value;
    const passwordValor = inputPassword.value;

    console.log("Intentando registrar a:", emailValor);

    // 4. Le pedimos a Supabase que cree la cuenta
    const { data, error } = await supabase.auth.signUp({
        email: emailValor,
        password: passwordValor,
    });

    // 5. Comprobamos si salió bien o si hubo un error
    if (error) {
        console.error("Error de Supabase:", error.message);
        alert("Hubo un error al registrar: " + error.message);
    } else {
        console.log("¡Usuario creado!", data);
        alert("¡Registro exitoso! Ya puedes iniciar sesión.");
        
        // Limpiamos los campos del formulario
        formRegistro.reset();
        
        // Opcional: Redirigimos al usuario a la página de login
        window.location.href = "login.html";
    }
});