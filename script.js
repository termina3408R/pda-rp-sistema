// --- CONFIGURACIÓN DE DISCORD ---
const CLIENT_ID = 'TU_CLIENT_ID_AQUÍ'; // Debes crear una App en Discord Developer Portal
const REDIRECT_URI = window.location.origin + window.location.pathname;

// --- BASE DE DATOS DE RANGOS AUTOMÁTICOS ---
// Aquí pones los IDs de Discord de tus usuarios y qué rango tienen
const USER_PERMISSIONS = {
    "123456789012345678": { rank: "Comisario", faccion: "policia", access: "high" },
    "876543210987654321": { rank: "Paramédico", faccion: "ems", access: "med" }
};

// 1. FUNCIÓN PARA INICIAR LOGIN
function loginWithDiscord() {
    const url = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=identify`;
    window.location.href = url;
}

// 2. CAPTURAR DATOS AL VOLVER DE DISCORD
window.onload = () => {
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = fragment.get('access_token');

    if (accessToken) {
        fetch('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${accessToken}` }
        })
        .then(res => res.json())
        .then(userData => {
            handleAutoLogin(userData);
        });
    }
};

// 3. LOGUEO AUTOMÁTICO
function handleAutoLogin(data) {
    const permissions = USER_PERMISSIONS[data.id] || { rank: "Civil", faccion: "ninguna" };
    
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainInterface').style.display = 'flex';
    
    // Rellenar datos del usuario de Discord
    document.getElementById('userName').textContent = data.global_name || data.username;
    document.getElementById('userRank').textContent = permissions.rank;
    document.getElementById('userAvatar').src = `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png`;

    console.log("Sistema Automático: Bienvenido " + data.username);
}

// 4. PANTALLA COMPLETA
function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}
