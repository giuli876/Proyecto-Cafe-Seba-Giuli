import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificar si hay un usuario logeado
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        window.location.href = 'login.html'; // Lo pateamos si no está logeado
        return;
    }

    // 2. Traer el perfil desde la tabla
    const { data: perfil, error: perfilError } = await supabase
        .from('perfiles')
        .select('nombre_completo')
        .eq('id', user.id)
        .single();

    if (perfil) {
        // Llenamos el HTML con los datos de Supabase
        document.getElementById('display-name').textContent = perfil.nombre_completo;
        document.getElementById('data-name').textContent = perfil.nombre_completo;
        document.getElementById('display-email').textContent = user.email;
        document.getElementById('data-email').textContent = user.email;
    }
});