import { supabase } from './supabase.js';

// 1. Buscamos los elementos del HTML
const formRegistro = document.getElementById('form-registro');
// Agregamos el input del nombre que tenías en el HTML
const inputNombre = document.getElementById('name'); 
const inputEmail = document.getElementById('email');
const inputPassword = document.getElementById('password');

formRegistro.addEventListener('submit', async function(evento) {
    evento.preventDefault(); 

    const nombreValor = inputNombre.value;
    const emailValor = inputEmail.value;
    const passwordValor = inputPassword.value;

    console.log("Intentando registrar a:", emailValor);

    // 2. Le pedimos a Supabase que cree la cuenta (correo y contraseña)
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: emailValor,
        password: passwordValor,
    });

    if (authError) {
        console.error("Error al registrar correo:", authError.message);
        alert("Hubo un error al registrar: " + authError.message);
        return; // Detenemos el código si falla
    }

    console.log("Usuario de autenticación creado. Guardando perfil...");

    // 3. ¡LO NUEVO! Guardamos el nombre en la tabla 'perfiles'
    // authData.user.id es el código único que Supabase le acaba de asignar
    const { error: perfilError } = await supabase
        .from('perfiles')
        .insert([
            { 
                id: authData.user.id, 
                nombre_completo: nombreValor 
                // No enviamos 'rol' porque Supabase le pondrá 'cliente' automáticamente
            }
        ]);

    if (perfilError) {
        console.error("Error al guardar el perfil:", perfilError.message);
        alert("Se creó la cuenta, pero hubo un problema guardando tu nombre.");
    } else {
        console.log("¡Perfil guardado con éxito!");
        alert("¡Registro exitoso! Ya puedes iniciar sesión.");
        formRegistro.reset();
        window.location.href = "login.html";
    }
});