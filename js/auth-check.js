import { supabase } from './supabase.js';

async function checkAccess() {
    // 1. Ver si hay una sesión activa en Supabase
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        // Si no hay sesión, mandarlo al login
        alert("Debes iniciar sesión para ver esta página.");
        window.location.href = "login.html";
        return;
    }

    // 2. Si hay sesión, ver qué rol tiene en la tabla perfiles
    const { data: perfil } = await supabase
        .from('perfiles')
        .select('rol')
        .eq('id', session.user.id)
        .single();

    const path = window.location.pathname;
    const rol = perfil.rol.trim().toLowerCase().replace(/['"]+/g, '');

    // 3. REGLA DE ORO: Si intenta entrar a vendedor y no lo es, afuera.
    if (path.includes("vendedor.html") && rol !== "vendedor") {
        alert("Acceso denegado. No eres vendedor.");
        window.location.href = "cliente.html";
    }
}

// Ejecutar la revisión apenas cargue el script
checkAccess();