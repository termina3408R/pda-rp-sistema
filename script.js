// ==========================================
// CONFIGURACIÓN DE DISCORD (TU APP)
// ==========================================
const CLIENT_ID = '1504647214008500314'; 
const REDIRECT_URI = window.location.origin + window.location.pathname;

// ==========================================
// BASE DE DATOS DE PERSONAL (MANUAL)
// ==========================================
// Aquí es donde das rangos específicos usando el ID de Discord
const USER_PERMISSIONS = {
    "TU_ID_DE_DISCORD_AQUÍ": { rank: "Director General", faccion: "administracion" },
    "ID_DE_OTRO_OFICIAL": { rank: "Comisario", faccion: "policia" },
};

// ==========================================
// LÓGICA DE AUTENTICACIÓN
// ==========================================

// 1. Al cargar la página, verificamos si venimos de Discord
window.onload = () => {
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = fragment.get('access_token');

    if (accessToken) {
        // Limpiamos la URL para que no se vea el token
        window.history.replaceState({}, document.title, window.location.pathname);
        obtenerDatosDiscord(accessToken);
    }
};

// 2. Función que se activa al darle al botón del HTML
function loginWithDiscord() {
    const url = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=identify`;
    window.location.href = url;
}

// 3. Pedir datos a la API de Discord
async function obtenerDatosDiscord(token) {
    try {
        const response = await fetch('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const userData = await response.json();
        
        if (userData.id) {
            iniciarInterfazPDA(userData);
        }
    } catch (error) {
        console.error("Error al obtener datos:", error);
        alert("Error de conexión con Discord");
    }
}

// 4. Cargar la interfaz con los datos del usuario
function iniciarInterfazPDA(data) {
    // Buscamos si tiene rango manual, si no, es Aspirante por defecto
    const info = USER_PERMISSIONS[data.id] || { rank: "Aspirante", faccion: "recluta" };
    
    // Ocultar login y mostrar PDA
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainInterface').style.display = 'flex';
    
    // Inyectar datos en el HTML
    document.getElementById('userName').textContent = data.global_name || data.username;
    document.getElementById('userRank').textContent = info.rank;
    
    // Cargar Avatar (si no tiene, ponemos una imagen por defecto)
    const avatarImg = document.getElementById('userAvatar');
    if (data.avatar) {
        avatarImg.src = `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png`;
    } else {
        avatarImg.src = "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png";
    }

    console.log(`Sesión iniciada como: ${data.username} [${info.rank}]`);
}

// ==========================================
// FUNCIONES EXTRAS (UTILIDADES)
// ==========================================
function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}
