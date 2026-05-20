import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        window.location.href = 'login.html'; 
        return;
    }

    const { data: perfil, error: perfilError } = await supabase
        .from('perfiles')
        .select('nombre_completo')
        .eq('id', user.id)
        .single();

    if (perfil) {
        document.getElementById('display-name').textContent = perfil.nombre_completo;
        document.getElementById('data-name').textContent = perfil.nombre_completo;
        document.getElementById('display-email').textContent = user.email;
        document.getElementById('data-email').textContent = user.email;

        const inputEditName = document.getElementById('input-edit-name');
        if (inputEditName) inputEditName.value = perfil.nombre_completo;

        const inputEditEmail = document.getElementById('input-edit-email');
        if (inputEditEmail) inputEditEmail.value = user.email;
    }

    // --- 2. LÓGICA DE LA INTERFAZ ---
    
    // Paneles (Izquierda)
    const panelDatos = document.getElementById('panel-datos');
    const panelSeguridad = document.getElementById('panel-seguridad');
    const panelNotificaciones = document.getElementById('panel-notificaciones');
    const panelDirecciones = document.getElementById('panel-direcciones');

    // Menú (Derecha)
    const menuDatos = document.getElementById('menu-datos');
    const menuSeguridad = document.getElementById('menu-seguridad');
    const menuNotificaciones = document.getElementById('menu-notificaciones');
    const menuDirecciones = document.getElementById('menu-direcciones');

    // "Modificar Datos"
    const btnEditPerfil = document.getElementById('btn-edit-perfil');
    const vistaDatosFijos = document.getElementById('vista-datos-fijos');
    const formEdicion = document.getElementById('formulario-edicion');
    const btnCancelarPerfil = document.getElementById('btn-cancelar-perfil');

    // Función para limpiar la pantalla 
    const ocultarTodosLosPaneles = () => {
        if (panelDatos) panelDatos.style.display = 'none';
        if (panelSeguridad) panelSeguridad.style.display = 'none';
        if (panelNotificaciones) panelNotificaciones.style.display = 'none';
        if (panelDirecciones) panelDirecciones.style.display = 'none';
    };

    // Navegación: "Mis datos"
    if (menuDatos) {
        menuDatos.addEventListener('click', (e) => {
            e.preventDefault();
            ocultarTodosLosPaneles();
            panelDatos.style.display = 'block';
        });
    }

    // Navegación: "Seguridad"
    if (menuSeguridad) {
        menuSeguridad.addEventListener('click', (e) => {
            e.preventDefault();
            ocultarTodosLosPaneles();
            panelSeguridad.style.display = 'block';
        });
    }

    // Navegación: Clic en "Notificaciones"
    if (menuNotificaciones) {
        menuNotificaciones.addEventListener('click', (e) => {
            e.preventDefault();
            ocultarTodosLosPaneles();
            panelNotificaciones.style.display = 'block';
        });
    }
    // Navegación: Mis direcciones
    if (menuDirecciones) {
        menuDirecciones.addEventListener('click', (e) => {
            e.preventDefault();
            ocultarTodosLosPaneles();
            panelDirecciones.style.display = 'block';
        });
    }

    // Botón "Modificar Datos" 
    if (btnEditPerfil) {
        btnEditPerfil.addEventListener('click', () => {
            vistaDatosFijos.style.display = 'none';     
            formEdicion.style.display = 'block';        
            btnEditPerfil.style.display = 'none';       
        });
    }

    // Botón "Cancelar" 
    if (btnCancelarPerfil) {
        btnCancelarPerfil.addEventListener('click', (e) => {
            e.preventDefault();
            formEdicion.style.display = 'none';         
            vistaDatosFijos.style.display = 'block';    
            btnEditPerfil.style.display = 'inline-block'; 
        });
    }

    // --- 3. LÓGICA PARA GUARDAR CAMBIOS EN SUPABASE ---
    const btnGuardarPerfil = document.getElementById('btn-guardar-perfil');
    const inputEditName = document.getElementById('input-edit-name');

    if (btnGuardarPerfil) {
        btnGuardarPerfil.addEventListener('click', async (e) => {
            e.preventDefault();

            // Agarramos el texto nuevo y le sacamos los espacios extra
            const nuevoNombre = inputEditName.value.trim(); 
            
            if (!nuevoNombre) {
                alert("El nombre no puede estar vacío");
                return;
            }

            // Cambiamos el texto del botón para que el usuario sepa que está cargando
            btnGuardarPerfil.textContent = 'Guardando...';
            btnGuardarPerfil.disabled = true;

            // 1. Obtenemos el ID del usuario logueado
            const { data: { user } } = await supabase.auth.getUser();

            // 2. Le decimos a Supabase que actualice la tabla
            const { error: updateError } = await supabase
                .from('perfiles')
                .update({ nombre_completo: nuevoNombre })
                .eq('id', user.id); // Solo actualiza la fila de este usuario

            if (updateError) {
                console.error("Error al actualizar perfil:", updateError);
                alert("Hubo un error al guardar los cambios. Intenta de nuevo.");
            } else {
                // ÉXITO: Actualizamos los textos de la pantalla con el nuevo nombre
                document.getElementById('display-name').textContent = nuevoNombre;
                document.getElementById('data-name').textContent = nuevoNombre;
                
                // Actualizamos el localStorage por si lo usan en el carrito
                localStorage.setItem('userName', nuevoNombre);

                // Ocultamos el formulario y volvemos a mostrar la vista normal
                formEdicion.style.display = 'none';         
                vistaDatosFijos.style.display = 'block';    
                btnEditPerfil.style.display = 'inline-block'; 
            }

            // Restauramos el botón a la normalidad
            btnGuardarPerfil.textContent = 'Guardar';
            btnGuardarPerfil.disabled = false;
        });
    }
    // --- 4. LÓGICA PARA CAMBIAR CONTRASEÑA ---
    const btnActualizarPass = document.getElementById('btn-actualizar-pass');
    const inputPassNueva = document.getElementById('input-pass-nueva');
    const inputPassRepetir = document.getElementById('input-pass-repetir');

    if (btnActualizarPass) {
        btnActualizarPass.addEventListener('click', async (e) => {
            e.preventDefault();

            const passNueva = inputPassNueva.value.trim();
            const passRepetir = inputPassRepetir.value.trim();

            // Validaciones de frontend (¡Suma puntos para el examen!)
            if (!passNueva || !passRepetir) {
                alert("Por favor, completá ambos campos de contraseña.");
                return;
            }
            if (passNueva.length < 6) {
                alert("La contraseña debe tener al menos 6 caracteres.");
                return;
            }
            if (passNueva !== passRepetir) {
                alert("Las contraseñas no coinciden. Verificalo y volvé a intentar.");
                return;
            }

            // Efecto visual de carga
            btnActualizarPass.textContent = 'Actualizando...';
            btnActualizarPass.disabled = true;

            // Le pedimos a Supabase que cambie la contraseña del usuario logueado
            const { error } = await supabase.auth.updateUser({
                password: passNueva
            });

            if (error) {
                console.error("Error al cambiar contraseña:", error);
                alert("Hubo un error al actualizar la contraseña. Intentá de nuevo.");
            } else {
                alert("¡Listo! Contraseña actualizada con éxito.");
                // Limpiamos los inputs para que quede prolijo
                inputPassNueva.value = '';
                inputPassRepetir.value = '';
            }

            // Restauramos el botón
            btnActualizarPass.textContent = 'Actualizar contraseña';
            btnActualizarPass.disabled = false;
        });
    }
});