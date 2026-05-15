// ==========================================
// 1. CONFIGURACIÓN DISCORD Y RANGOS
// ==========================================
const CLIENT_ID = '1504647214008500314'; 
const REDIRECT_URI = window.location.origin + window.location.pathname;

// Base de datos: Añade aquí los IDs de Discord de tus usuarios
const DB_USUARIOS = {
    "123456789012345678": { nombre: "García", rango: "COMISARIO" },
    // "TU_ID_AQUI": { nombre: "Tu Nombre", rango: "Capitán" }
};

let currentUser = "Oficial";
let serviceStartTime = null;

// ==========================================
// 2. SISTEMA DE LOGIN (OAUTH2)
// ==========================================
function loginWithDiscord() {
    const url = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=identify`;
    window.location.href = url;
}

window.onload = () => {
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = fragment.get('access_token');

    if (accessToken) {
        // Limpiar la URL de la barra de direcciones por seguridad
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Consultar los datos de Discord
        fetch('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${accessToken}` }
        })
        .then(res => res.json())
        .then(data => {
            const user = DB_USUARIOS[data.id] || { 
                nombre: data.global_name || data.username, 
                rango: "OFICIAL" 
            };

            // Cambiar pantallas
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('mainInterface').style.display = 'flex';
            
            // Llenar datos en el HTML
            document.getElementById('uName').textContent = user.nombre;
            document.getElementById('welcomeName').textContent = user.nombre;
            document.getElementById('uRank').textContent = user.rango;
            currentUser = user.nombre;
            
            if (data.avatar) {
                document.getElementById('uAvatar').src = `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png`;
            }

            // Iniciar servicios secundarios
            serviceStartTime = Date.now();
            iniciarReloj();
        })
        .catch(err => {
            console.error(err);
            alert("Error conectando con Discord. Revisa tu consola.");
        });
    }
};

// ==========================================
// 3. CONTROL DE INTERFAZ (MENÚ Y PANTALLAS)
// ==========================================
function toggleMenu() {
    const sb = document.getElementById('sidebar');
    const overlay = document.getElementById('mobileOverlay');
    sb.classList.toggle('open');
    overlay.classList.toggle('active');
}

function switchScreen(screenId, btnElement) {
    // Ocultar todas las pantallas
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    // Mostrar la pantalla seleccionada
    document.getElementById(screenId).classList.add('active');
    
    // Cambiar el color del botón activo en el menú lateral
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    if(btnElement) btnElement.classList.add('active');

    // Cerrar el menú automáticamente si estamos en un teléfono
    if(window.innerWidth <= 768) {
        toggleMenu();
    }
}

// ==========================================
// 4. SISTEMAS SECUNDARIOS (RELOJ Y RADIO)
// ==========================================
function iniciarReloj() {
    setInterval(() => {
        const now = new Date();
        document.getElementById('clockTime').textContent = now.toLocaleTimeString('es-ES', {hour:'2-digit', minute:'2-digit', second:'2-digit'});
        
        if (serviceStartTime) {
            const diff = Math.floor((Date.now() - serviceStartTime) / 1000);
            const hrs = String(Math.floor(diff / 3600)).padStart(2, '0');
            const mins = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
            const secs = String(diff % 60).padStart(2, '0');
            document.getElementById('serviceTime').textContent = `${hrs}:${mins}:${secs}`;
        }
    }, 1000);
}

function sendRadio() {
    const input = document.getElementById('radioInput');
    const text = input.value.trim();
    if(!text) return;

    const log = document.getElementById('radioLog');
    const time = new Date().toLocaleTimeString('es-ES', {hour:'2-digit', minute:'2-digit'});
    
    // Imprimir nuestro mensaje
    log.innerHTML += `<div class="msg me"><div class="msg-author">${currentUser.toUpperCase()} [${time}]</div>${text}</div>`;
    input.value = '';
    log.scrollTop = log.scrollHeight;

    // Simular respuesta del Despacho / Central
    setTimeout(() => {
        const time2 = new Date().toLocaleTimeString('es-ES', {hour:'2-digit', minute:'2-digit'});
        const respuestas = [
            "10-4, copiado.", 
            "Central informada. Unidad en ruta.", 
            "Verificando base de datos, espere.", 
            "Positivo, proceda con precaución."
        ];
        const randomMsg = respuestas[Math.floor(Math.random() * respuestas.length)];
        
        log.innerHTML += `<div class="msg"><div class="msg-author">CENTRAL (DESPACHO) [${time2}]</div>${randomMsg}</div>`;
        log.scrollTop = log.scrollHeight;
    }, 1500);
}

// Permitir enviar mensajes de radio apretando "Enter"
document.addEventListener("DOMContentLoaded", () => {
    const radioInput = document.getElementById('radioInput');
    if (radioInput) {
        radioInput.addEventListener("keydown", function(event) {
            if (event.key === "Enter") {
                sendRadio();
            }
        });
    }
});
