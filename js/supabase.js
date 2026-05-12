// Importamos Supabase desde la red (CDN)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Tus credenciales públicas
const supabaseUrl = 'https://thmvsedckwzowjcyihxj.supabase.co'
const supabaseKey = 'sb_publishable_7xhDiRAme7FJfFv7LdUEJg_XdvZKffn'

// Creamos y exportamos la conexión
export const supabase = createClient(supabaseUrl, supabaseKey)