// ==========================================
// CONFIGURACIÓN CENTRAL DE RED (DISCORD BOT)
// ==========================================
const wsUrl = "ws://localhost:8080/pda";
let ws = null;
let wsReconnectTimer = null;

let ttsOn = true;
let ttsVol = 1.0;
let currentUser = { name: '', role: '', placa: '' };
let activeChannelId = '';
let serviceStartTime = null;
let radioLogs = {};

// Canales y Etiquetas configurados según el Rol del Agente
const CONFIG_ROLES = {
  policia: {
    label: 'POLICÍA NACIONAL',
    chs: [
      { id: 'alertas_policia', name: '🚨 Alertas' },
      { id: 'busca_captura', name: '🎯 Buscados' },
      { id: 'reg_personas', name: '👥 Personas' },
      { id: 'reg_vehiculos', name: '🚗 Vehículos' }
    ]
  },
  ems: {
    label: 'EMS · EMERGENCIAS',
    chs: [
      { id: 'alertas_ems', name: '🏥 Emergencias' },
      { id: 'reg_personas', name: '👥 Pacientes' }
    ]
  },
  ejercito: {
    label: 'EJÉRCITO',
    chs: [
      { id: 'alertas_ejercito', name: '⚔️ Operaciones' },
      { id: 'vehiculos', name: '🚗 Despliegues' }
    ]
  },
  secreto: {
    label: 'UNIDAD CLASIFICADA',
    chs: [
      { id: 'radio_secreta', name: '🤫 Operaciones S.' },
      { id: 'avisos', name: '📢 Inteligencia' }
    ]
  }
};

// Datos Semilla locales en caso de desconexión del Bot
const SEED_DATA = {
  alertas_policia: [{author:'CENTRAL', text:'[ALERTA] Código 3 en Progreso - Tienda Central', time:'18:02', style:'alert-msg'}],
  busca_captura: [{author:'DESPACHO', text:'Sujeto de Interés: Marcus Vance | Estado: REQUERIDO', time:'17:45', style:'wanted-msg'}],
  reg_vehiculos: [{author:'TRÁFICO', text:'Patente: FX-991-Z | Estado: REPORTE DE ROBO', time:'16:20', style:'vehicle-msg'}]
};

// ==========================================
// MANEJO DE LOGIN E INTERFAZ
// ==========================================
function doLogin() {
  currentUser.name = document.getElementById('cnName').value.trim() || 'Agente Anónimo';
  currentUser.role = document.getElementById('cnRole').value;
  currentUser.placa = document.getElementById('cnPlaca').value.trim() || '00-00';

  // Seteo visual de Perfil en la PDA
  document.getElementById('pfrName').textContent = currentUser.name.toUpperCase();
  document.getElementById('pfrMeta').textContent = `${CONFIG_ROLES[currentUser.role].label} | ${currentUser.placa}`;

  // Instanciar espacio en memoria para los logs
  CONFIG_ROLES[currentUser.role].chs.forEach(ch => {
    radioLogs[ch.id] = SEED_DATA[ch.id] ? [...SEED_DATA[ch.id]] : [];
  });

  activeChannelId = CONFIG_ROLES[currentUser.role].chs[0].id;

  // Cambiar vistas de logeo a dashboard
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('mainDashboard').classList.remove('hidden');

  renderChannels();
  refreshRadioMsgs();
  startClock();
  
  serviceStartTime = Date.now();
  connectWS();
}

function toggleMenu() {
  if (window.innerWidth <= 768) {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('mobileOverlay').classList.toggle('active');
  }
}

function renderChannels() {
  const container = document.getElementById('radioChannels');
  const chList = CONFIG_ROLES[currentUser.role].chs;
  
  container.innerHTML = chList.map(ch => `
    <div class="ch-item ${ch.id === activeChannelId ? 'active' : ''}" id="chTab-${ch.id}" onclick="switchChannel('${ch.id}')">
      <span>●</span> ${ch.name}
    </div>
  `).join('');
}

function switchChannel(chId) {
  activeChannelId = chId;
  document.querySelectorAll('.ch-item').forEach(el => el.classList.remove('active'));
  
  const activeTab = document.getElementById(`chTab-${chId}`);
  if(activeTab) activeTab.classList.add('active');
  
  refreshRadioMsgs();
  toggleMenu(); // Auto-colapsa el menú al elegir canal en móviles
}

function refreshRadioMsgs() {
  const container = document.getElementById('radioMsgs');
  const logs = radioLogs[activeChannelId] || [];

  if(logs.length === 0) {
    container.innerHTML = `<div class="loading-msg">[Canal vacío - Sin transmisiones]</div>`;
    return;
  }

  container.innerHTML = logs.map(msg => `
    <div class="chat-msg ${msg.isNew ? 'new-msg' : ''}">
      <span class="chat-author">${escapeHtml(msg.author)}:</span>
      <span class="${msg.style || ''}">${escapeHtml(msg.text)}</span>
      <span class="chat-time">${msg.time}</span>
    </div>
  `).join('');

  container.scrollTop = container.scrollHeight;
}

// ==========================================
// CONEXIÓN WEBSOCKET (SINCRO DISCORD)
// ==========================================
function connectWS() {
  if(ws && (ws.readyState === 0 || ws.readyState === 1)) return;
  setWsStatus('connecting', 'CONECTANDO A DISCORD...');

  try {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setWsStatus('connected', 'DISCORD CONECTADO');
      if(wsReconnectTimer) { clearTimeout(wsReconnectTimer); wsReconnectTimer = null; }
    };

    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        if(data.type === 'discord_message') {
          handleIncomingDiscordFeed(data);
        }
      } catch(e) { console.error("Error en datos recibidos:", e); }
    };

    ws.onclose = () => {
      setWsStatus('disconnected', 'DESCONECTADO');
      wsReconnectTimer = setTimeout(connectWS, 5000); // Reintento automático
    };

    ws.onerror = () => setWsStatus('disconnected', 'ERROR CONEXIÓN');

  } catch(e) { setWsStatus('disconnected', 'ERROR SOCKET'); }
}

function setWsStatus(state, label) {
  const el = document.getElementById('wsStatus');
  const dot = document.getElementById('wsDot');
  const lbl = document.getElementById('wsLabel');
  if(el) el.className = 'ws-status ' + state;
  if(dot) dot.className = 'ws-dot ' + state;
  if(lbl) lbl.textContent = label;
}

function handleIncomingDiscordFeed(msg) {
  const targetSection = msg.section;

  const entry = {
    author: msg.author,
    text: msg.content,
    time: msg.time || getShortTime(),
    style: detectContentStyle(msg.content),
    isNew: true
  };

  if(!radioLogs[targetSection]) radioLogs[targetSection] = [];
  radioLogs[targetSection].push(entry);

  if(activeChannelId === targetSection) {
    refreshRadioMsgs();
    speakRadio(`${entry.author} dice: ${entry.text}`);
  }
}

function sendRadioMsg() {
  const input = document.getElementById('radioInput');
  const text = input.value.trim();
  if(!text) return;

  // Si hay socket conectado, despachamos el JSON real hacia Discord
  if(ws && ws.readyState === 1) {
    const payload = {
      type: 'pda_message',
      author: currentUser.name,
      placa: currentUser.placa,
      role: currentUser.role,
      section: activeChannelId,
      content: text,
      time: getShortTime()
    };
    ws.send(JSON.stringify(payload));
  }

  // Reflejar localmente de inmediato
  if(!radioLogs[activeChannelId]) radioLogs[activeChannelId] = [];
  radioLogs[activeChannelId].push({
    author: currentUser.name,
    text: text,
    time: getShortTime(),
    style: '',
    isNew: false
  });

  input.value = '';
  refreshRadioMsgs();
}

// ==========================================
// MOTOR DE VOZ (TTS) Y RELOJES
// ==========================================
function speakRadio(phrase) {
  if(!ttsOn) return;
  window.speechSynthesis.cancel(); // Evita solapamiento en ráfagas de radio

  const utterance = new SpeechSynthesisUtterance(phrase);
  utterance.pitch = 0.90;
  utterance.rate = 1.05;
  utterance.volume = ttsVol;

  const voices = window.speechSynthesis.getVoices();
  const spanishVoice = voices.find(v => v.lang.startsWith('es')) || voices[0];
  if(spanishVoice) utterance.voice = spanishVoice;

  window.speechSynthesis.speak(utterance);
}

function toggleTTS() {
  ttsOn = !ttsOn;
  const btn = document.getElementById('ttsTog');
  if(btn) {
    btn.className = 'tts-tog' + (ttsOn ? ' on' : '');
    btn.textContent = ttsOn ? 'VOZ ON' : 'VOZ OFF';
  }
}

function detectContentStyle(txt) {
  const t = txt.toUpperCase();
  if(t.includes('ALERTA') || t.includes('CÓDIGO 3') || t.includes('URGENTE')) return 'alert-msg';
  if(t.includes('BUSCADO') || t.includes('CAPTURA') || t.includes('REQUERIDO')) return 'wanted-msg';
  if(t.includes('PATENTE') || t.includes('MATRÍCULA') || t.includes('VEHÍCULO')) return 'vehicle-msg';
  if(t.includes('SUJETO') || t.includes('IDENTIDAD') || t.includes('PACIENTE')) return 'person-msg';
  return '';
}

function getShortTime() {
  return new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function startClock() {
  setInterval(() => {
    const now = new Date();
    const cl = document.getElementById('clockDisplay');
    const dt = document.getElementById('dateDisplay');
    const st = document.getElementById('serviceTime');
    
    if(cl) cl.textContent = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if(dt) dt.textContent = now.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
    
    if (serviceStartTime) {
      const diff = Math.floor((Date.now() - serviceStartTime) / 1000);
      const hrs = String(Math.floor(diff / 3600)).padStart(2, '0');
      const mins = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
      const secs = String(diff % 60).padStart(2, '0');
      if(st) st.textContent = `${hrs}:${mins}:${secs}`;
    }
  }, 1000);
}

function escapeHtml(t) {
  return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
