// CONFIGURACIÓN Y DATOS CENTRALIZADOS
const SECRET_CODE = "1984";

// Simulación de Base de Datos de Discord / Servidor
const DISCORD_DATABASE = {
  "P-01": { nombre: "García", rango: "Comisario", tipo: "policia", clasificado: true },
  "P-44": { nombre: "Martínez", rango: "Oficial", tipo: "policia", clasificado: false },
  "S-07": { nombre: "K", rango: "Agente Especial", tipo: "secreto", clasificado: true }
};

let cu = { name:'', rank:'', role:'', placa:'', status:'servicio', secretUnlocked:false, canViewClassified: false };
let serviceStart = null;

// --- REEMPLAZO DE LA FUNCIÓN DE LOGIN ---
function handleLogin() {
  const placaInput = document.getElementById('inputPlaca').value.trim().toUpperCase();
  const errorEl = document.getElementById('loginErr');
  const datos = DISCORD_DATABASE[placaInput];

  if (!datos) {
    errorEl.textContent = "PLACA NO REGISTRADA EN EL SISTEMA";
    return;
  }

  cu = {
    name: datos.nombre,
    rank: datos.rango,
    role: datos.tipo,
    placa: placaInput,
    canViewClassified: datos.clasificado,
    status: 'servicio',
    secretUnlocked: false
  };

  serviceStart = Date.now();
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('mainInterface').style.display = 'flex';
  document.getElementById('mainInterface').classList.add('active');
  
  buildSidebar(); 
  startClock();
  navigateTo('perfil');
}

// --- FUNCIÓN DE NAVEGACIÓN MODIFICADA ---
function buildSidebar() {
  const nav = navConfig[cu.role] || [];
  let html = '<div style="flex:1;">';
  let lastGroup = null;

  nav.forEach(item => {
    // FILTRO DE SEGURIDAD: Si es informe y no tiene permiso, no se muestra
    if (item.id.includes('informes') && !cu.canViewClassified) return;

    if (item.group !== lastGroup) {
      if (lastGroup !== null) html += '</div>';
      html += `<div><div class="sidebar-label">${item.group}</div>`;
      lastGroup = item.group;
    }
    const sc = item.secret ? ' secret-nav' : '';
    const dot = item.dot ? '<span class="nav-dot"></span>' : '';
    html += `<div class="nav-item${sc}" id="nav-${item.id}" onclick="handleNavClick('${item.id}',${item.secret||false})">
                ${item.icon} <span>${item.label}</span>${dot}
             </div>`;
  });
  
  html += '</div></div><div class="sidebar-bottom"><button class="logout-btn" onclick="logout()">⟵ CERRAR SESIÓN</button></div>';
  document.getElementById('sidebar').innerHTML = html;
}

// A continuación el resto de tu lógica original (renderSections, radio, etc.)
const SECRET_CODE="1984";
let cu={name:'',rank:'',role:'',placa:'',status:'servicio',secretUnlocked:false};
let serviceStart=null;
let radioState={};
let radioLogs={};
let recognition=null;
let isListening=false;
let ttsEnabled=true;
let ttsVol=0.9;
let currentNavId='';

const roleLabels={policia:'POLICÍA',ems:'EMS',ejercito:'EJÉRCITO',secreto:'U. SECRETA'};
const roleColors={policia:'police',ems:'ems',ejercito:'army',secreto:'secreto'};

const navConfig={
  policia:[
    {id:'perfil',label:'Mi Perfil',icon:'👤',group:'General'},
    {id:'avisos',label:'Avisos',icon:'📢',group:'General'},
    {id:'radio',label:'Radio',icon:'📻',group:'General',dot:true},
    {id:'informes',label:'Informes',icon:'📋',group:'Gestión'},
    {id:'denuncias',label:'Denuncias',icon:'📝',group:'Gestión'},
    {id:'buscados',label:'Busca y Captura',icon:'🎯',group:'Operativo'},
    {id:'personas',label:'Registro Personas',icon:'👤',group:'Operativo'},
    {id:'vehiculos',label:'Registro Vehículos',icon:'🚗',group:'Operativo'},
  ],
  ems:[
    {id:'perfil',label:'Mi Perfil',icon:'👤',group:'General'},
    {id:'avisos',label:'Avisos',icon:'📢',group:'General'},
    {id:'radio',label:'Radio EMS',icon:'📻',group:'General',dot:true},
    {id:'informes',label:'Informes Médicos',icon:'📋',group:'Gestión'},
    {id:'personas',label:'Registro Pacientes',icon:'👤',group:'Operativo'},
  ],
  ejercito:[
    {id:'perfil',label:'Mi Perfil',icon:'👤',group:'General'},
    {id:'avisos',label:'Avisos',icon:'📢',group:'General'},
    {id:'radio',label:'Radio Ejército',icon:'📻',group:'General',dot:true},
    {id:'informes',label:'Informes Tácticos',icon:'📋',group:'Gestión'},
    {id:'buscados',label:'Objetivos',icon:'🎯',group:'Operativo'},
    {id:'vehiculos',label:'Registro Vehículos',icon:'🚗',group:'Operativo'},
    {id:'personas',label:'Registro Personal',icon:'👤',group:'Operativo'},
  ],
  secreto:[
    {id:'perfil',label:'Mi Perfil',icon:'👤',group:'General'},
    {id:'avisos',label:'Avisos',icon:'📢',group:'General'},
    {id:'radio',label:'Radio Policía',icon:'📻',group:'Acceso Policial',dot:true},
    {id:'informes',label:'Informes',icon:'📋',group:'Acceso Policial'},
    {id:'denuncias',label:'Denuncias',icon:'📝',group:'Acceso Policial'},
    {id:'buscados',label:'Busca y Captura',icon:'🎯',group:'Acceso Policial'},
    {id:'personas',label:'Registro Personas',icon:'👤',group:'Acceso Policial'},
    {id:'vehiculos',label:'Registro Vehículos',icon:'🚗',group:'Acceso Policial'},
    {id:'secreto_ops',label:'⬡ Operaciones',icon:'🔐',group:'Unidad Secreta',secret:true},
    {id:'secreto_misiones',label:'⬡ Misiones',icon:'🗺',group:'Unidad Secreta',secret:true},
    {id:'secreto_radio',label:'⬡ Radio Secreta',icon:'📡',group:'Unidad Secreta',secret:true,dot:true},
    {id:'secreto_informes',label:'⬡ Informes Clasif.',icon:'🗂',group:'Unidad Secreta',secret:true},
  ]
};

const RADIOS_DEF={
  policia:{id:'police',label:'Policía Nacional',cls:'police',freq:'462.550',channels:[
    {id:'p_h50',name:'H-50',sub:'Canal general',users:6},
    {id:'p_a10',name:'ADAM-10',sub:'Patrulla Alpha',users:3},
    {id:'p_a20',name:'ADAM-20',sub:'Patrulla Bravo',users:2},
    {id:'p_a30',name:'ADAM-30',sub:'Patrulla Charlie',users:4},
    {id:'p_a40',name:'ADAM-40',sub:'Patrulla Delta',users:1},
    {id:'p_tac1',name:'TÁCTICO 1',sub:'Operaciones tác.',users:3},
    {id:'p_tac2',name:'TÁCTICO 2',sub:'Operaciones tác.',users:2},
  ]},
  ems:{id:'ems',label:'Emergencias Médicas',cls:'ems',freq:'155.340',channels:[
    {id:'e1',name:'Despacho Central',sub:'Canal principal',users:5},
    {id:'e2',name:'Trauma / UCI',sub:'Urgencias',users:2},
    {id:'e3',name:'Transporte',sub:'Ambulancias',users:1},
  ]},
  ejercito:{id:'army',label:'Ejército',cls:'army',freq:'138.225',channels:[
    {id:'a1',name:'Mando Central',sub:'Alto mando',users:6},
    {id:'a2',name:'Pelotón Alpha',sub:'Unidad de campo',users:3},
    {id:'a3',name:'Logística',sub:'Suministros',users:2},
  ]},
  secreto:{id:'secret',label:'Unidad Secreta [CIFRADA]',cls:'secret',freq:'??? ???',channels:[
    {id:'s1',name:'[CIFRADO] Alfa',sub:'Mando operativo',users:2},
    {id:'s2',name:'[CIFRADO] Ops',sub:'Operaciones',users:1},
    {id:'s3',name:'[CIFRADO] Exfil',sub:'Extracción',users:1},
  ]}
};

const SEED={
  p_h50:[
    {author:'SISTEMA',avatar:'SYS',role:'sys',text:'H-50 activo — Canal general.',time:'14:00',system:true},
    {author:'Control',avatar:'CTL',role:'police',text:'Todas las unidades, confirmar posición.',time:'14:18'},
    {author:'ADAM-10',avatar:'A10',role:'police',text:'ADAM-10 en posición, sector norte.',time:'14:19'},
  ],
  p_a10:[{author:'SISTEMA',avatar:'SYS',role:'sys',text:'ADAM-10 operativo.',time:'14:00',system:true}],
  p_a20:[{author:'SISTEMA',avatar:'SYS',role:'sys',text:'ADAM-20 en espera.',time:'14:00',system:true}],
  p_a30:[{author:'SISTEMA',avatar:'SYS',role:'sys',text:'ADAM-30 en espera.',time:'14:00',system:true},{author:'ADAM-30',avatar:'A30',role:'police',text:'Unidad en ruta al sector este.',time:'14:22'}],
  p_a40:[{author:'SISTEMA',avatar:'SYS',role:'sys',text:'ADAM-40 en espera.',time:'14:00',system:true}],
  p_tac1:[{author:'SISTEMA',avatar:'SYS',role:'sys',text:'TÁCTICO 1 activo.',time:'14:00',system:true},{author:'Control',avatar:'CTL',role:'police',text:'Unidades tácticas, preparen acceso sur.',time:'14:25'}],
  p_tac2:[{author:'SISTEMA',avatar:'SYS',role:'sys',text:'TÁCTICO 2 en standby.',time:'14:00',system:true}],
  e1:[{author:'Despacho',avatar:'DES',role:'ems',text:'Ambulancia 3 en ruta norte.',time:'14:24'}],
  e2:[{author:'SISTEMA',avatar:'SYS',role:'sys',text:'Trauma/UCI en espera.',time:'14:00',system:true}],
  e3:[{author:'SISTEMA',avatar:'SYS',role:'sys',text:'Transporte en espera.',time:'14:00',system:true}],
  a1:[{author:'Coronel-R',avatar:'CR',role:'army',text:'Pelotones en posición.',time:'14:20'}],
  a2:[{author:'SISTEMA',avatar:'SYS',role:'sys',text:'Pelotón Alpha en espera.',time:'13:55',system:true}],
  a3:[{author:'SISTEMA',avatar:'SYS',role:'sys',text:'Logística en espera.',time:'13:55',system:true}],
  s1:[{author:'[REDACTADO]',avatar:'??',role:'secret',text:'Activo confirmado en zona delta.',time:'14:21'}],
  s2:[{author:'SISTEMA',avatar:'SYS',role:'sys',text:'Canal SEC-02 activo.',time:'14:00',system:true}],
  s3:[{author:'SISTEMA',avatar:'SYS',role:'sys',text:'Canal extracción en espera.',time:'14:00',system:true}],
};

function initials(n){return(n||'??').split(' ').slice(0,2).map(w=>w[0]||'').join('').toUpperCase()||'??';}
function getShortTime(){return new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'});}
function roleColor(r){return{police:'#00d4ff',ems:'#ff4466',army:'#4caf50',secret:'#9b30ff',sys:'#4060aa',voice:'#00ff88'}[r]||'#c8d8ff';}

// TTS with radio effect
function speakRadio(text,rdCls){
  if(!ttsEnabled||!window.speechSynthesis)return;
  window.speechSynthesis.cancel();
  const utt=new SpeechSynthesisUtterance(text);
  utt.lang='es-ES';
  utt.rate=1.05;
  utt.pitch=0.85;
  utt.volume=ttsVol;
  // Try to find a Spanish voice
  const voices=speechSynthesis.getVoices();
  const esVoice=voices.find(v=>v.lang.startsWith('es'))||voices[0];
  if(esVoice)utt.voice=esVoice;
  speechSynthesis.speak(utt);
}

// STT setup
function hasSpeechRecognition(){
  return !!(window.SpeechRecognition||window.webkitSpeechRecognition);
}

function startListening(rdId,navId){
  if(!hasSpeechRecognition()){
    alert('Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.');
    return;
  }
  if(isListening){stopListening();return;}
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  recognition=new SR();
  recognition.lang='es-ES';
  recognition.interimResults=true;
  recognition.continuous=false;
  isListening=true;
  updateMicUI(true);

  recognition.onresult=(e)=>{
    const transcript=Array.from(e.results).map(r=>r[0].transcript).join('');
    const inp=document.getElementById('radioInput');
    if(inp)inp.value=transcript;
    if(e.results[e.results.length-1].isFinal){
      stopListening();
      if(transcript.trim()) radioSend(rdId,navId,true);
    }
  };
  recognition.onerror=()=>{stopListening();};
  recognition.onend=()=>{stopListening();};
  recognition.start();
}

function stopListening(){
  isListening=false;
  if(recognition){try{recognition.stop();}catch(e){}}
  recognition=null;
  updateMicUI(false);
}

function updateMicUI(active){
  const btn=document.getElementById('micBtn');
  const status=document.getElementById('micStatus');
  const wave=document.getElementById('waveVis');
  if(btn){btn.className='mic-btn '+(active?'listening':'idle');btn.textContent=active?'🎙':'🎤';}
  if(status){status.className='mic-status'+(active?' listening':'');status.textContent=active?'Escuchando... habla ahora':'Mantén para hablar';}
  if(wave)wave.className='wave-vis'+(active?' active':'');
}

function toggleTTS(){
  ttsEnabled=!ttsEnabled;
  const btn=document.getElementById('ttsToggle');
  if(btn){btn.className='tts-toggle'+(ttsEnabled?' on':'');btn.textContent=ttsEnabled?'VOZ ON':'VOZ OFF';}
}

function handleLogin(){
  const name=document.getElementById('inputName').value.trim();
  const rank=document.getElementById('inputRank').value.trim();
  const role=document.getElementById('inputRole').value;
  const placa=document.getElementById('inputPlaca').value.trim();
  if(!name){document.getElementById('loginErr').textContent='Introduce tu nombre.';return;}
  if(!rank){document.getElementById('loginErr').textContent='Introduce tu rango.';return;}
  if(!role){document.getElementById('loginErr').textContent='Selecciona tu unidad.';return;}
  if(!placa){document.getElementById('loginErr').textContent='Introduce tu placa.';return;}
  cu={name,rank,role,placa,status:'servicio',secretUnlocked:false};
  serviceStart=Date.now();
  document.getElementById('loginScreen').style.display='none';
  document.getElementById('mainInterface').classList.add('active');
  buildSidebar();startClock();navigateTo('perfil');
  // preload voices
  if(window.speechSynthesis)speechSynthesis.getVoices();
}

function logout(){
  stopListening();window.speechSynthesis&&speechSynthesis.cancel();
  cu={name:'',rank:'',role:'',placa:'',status:'servicio',secretUnlocked:false};
  serviceStart=null;radioState={};radioLogs={};
  document.getElementById('mainInterface').classList.remove('active');
  document.getElementById('loginScreen').style.display='flex';
  ['inputName','inputRank','inputPlaca'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('inputRole').value='';
  document.getElementById('loginErr').textContent='';
}

function buildSidebar(){
  const nav=navConfig[cu.role]||[];
  let html='<div style="flex:1;">';let lastGroup=null;
  nav.forEach(item=>{
    if(item.group!==lastGroup){if(lastGroup!==null)html+='</div>';html+=`<div><div class="sidebar-label">${item.group}</div>`;lastGroup=item.group;}
    const sc=item.secret?' secret-nav':'';
    const dot=item.dot?'<span class="nav-dot"></span>':'';
    html+=`<div class="nav-item${sc}" id="nav-${item.id}" onclick="handleNavClick('${item.id}',${item.secret||false})">${item.icon} <span>${item.label}</span>${dot}</div>`;
  });
  if(lastGroup!==null)html+='</div>';
  html+='</div><div class="sidebar-bottom"><button class="logout-btn" onclick="logout()">⟵ CERRAR SESIÓN</button></div>';
  document.getElementById('sidebar').innerHTML=html;
}

function handleNavClick(id,isSecret){
  if(isSecret&&!cu.secretUnlocked){
    document.getElementById('secretOverlay').style.display='flex';
    document.getElementById('secretCodeInput').value='';
    document.getElementById('secretErr').textContent='';
    document.getElementById('secretCodeInput').dataset.target=id;
    return;
  }
  navigateTo(id);
}
function verifySecretCode(){
  if(document.getElementById('secretCodeInput').value===SECRET_CODE){
    cu.secretUnlocked=true;closeSecretOverlay();
    const t=document.getElementById('secretCodeInput').dataset.target;if(t)navigateTo(t);
  }else{document.getElementById('secretErr').textContent='✗ Código incorrecto.';document.getElementById('secretCodeInput').value='';}
}
function closeSecretOverlay(){document.getElementById('secretOverlay').style.display='none';}

function navigateTo(id){
  currentNavId=id;
  stopListening();
  document.querySelectorAll('.nav-item').forEach(el=>el.classList.remove('active'));
  const el=document.getElementById('nav-'+id);if(el)el.classList.add('active');
  document.getElementById('contentArea').innerHTML=renderSection(id);
  document.querySelectorAll('.messages-area').forEach(el=>el.scrollTop=el.scrollHeight);
}

function renderSection(id){
  if(id==='perfil')return renderPerfil();
  if(id==='avisos')return renderAvisos();
  if(id==='informes')return renderInformes();
  if(id==='denuncias')return renderDenuncias();
  if(id==='buscados')return renderBuscados();
  if(id==='personas')return renderPersonas();
  if(id==='vehiculos')return renderVehiculos();
  if(id==='radio'||id==='secreto_radio')return renderRadioPanel(id);
  if(id==='secreto_ops')return renderSecretoOps();
  if(id==='secreto_misiones')return renderSecretoMisiones();
  if(id==='secreto_informes')return renderSecretoInformes();
  return '';
}

function secHdr(title,tag,tc){return`<div class="section-header"><h2>${title}</h2><span class="section-tag ${tc}">${tag}</span></div>`;}
function tCls(r){return{policia:'tag-police',ems:'tag-ems',ejercito:'tag-army',secreto:'tag-secret'}[r]||'tag-police';}

function renderPerfil(){
  const cls=roleColors[cu.role]||'police';
  const statusLabels={disponible:'DISPONIBLE',servicio:'EN SERVICIO',fuera:'FUERA DE SERVICIO'};
  const sc={disponible:'grn',servicio:'acc',fuera:'red'}[cu.status]||'acc';
  return`${secHdr('Mi Perfil','AGENTE',tCls(cu.role))}
  <div class="profile-card-full">
    <div class="pf-top">
      <div class="pf-avatar-big ${cls}">${initials(cu.name)}</div>
      <div><div class="pf-name">${cu.name.toUpperCase()}</div><div class="pf-rank">${cu.rank.toUpperCase()}</div><div class="pf-unit">${roleLabels[cu.role]}</div></div>
    </div>
    <div class="pf-rows">
      <div class="pf-row"><div class="pf-row-label">NÚMERO DE PLACA</div><div class="pf-row-value amb">${cu.placa.toUpperCase()}</div></div>
      <div class="pf-row"><div class="pf-row-label">ESTADO ACTUAL</div><div class="pf-row-value ${sc}">${statusLabels[cu.status]||'—'}</div></div>
      <div class="pf-row"><div class="pf-row-label">HORAS DE SERVICIO</div><div class="pf-row-value grn" id="pfServiceTimer">00:00:00</div></div>
      <div class="pf-row"><div class="pf-row-label">UNIDAD</div><div class="pf-row-value acc">${roleLabels[cu.role]}</div></div>
    </div>
  </div>
  <div class="form-section"><h3>Cambiar estado</h3>
    <div style="display:flex;gap:8px;flex-wrap:wrap;">
      <button class="btn-submit" style="background:#0a3020;color:var(--grn);border:1px solid #1a6040;" onclick="cu.status='disponible';navigateTo('perfil')">● DISPONIBLE</button>
      <button class="btn-submit" style="background:#0a1a30;color:var(--acc2);border:1px solid #1a3060;" onclick="cu.status='servicio';navigateTo('perfil')">● EN SERVICIO</button>
      <button class="btn-submit" style="background:#2a1010;color:var(--red);border:1px solid #4a2020;" onclick="cu.status='fuera';navigateTo('perfil')">● FUERA DE SERVICIO</button>
    </div>
  </div>`;
}

function renderAvisos(){
  let h=secHdr('Tablón de Avisos',roleLabels[cu.role],tCls(cu.role));
  h+=`<div style="font-size:11px;color:var(--txt2);margin-bottom:12px;padding:7px 11px;background:var(--bg2);border-radius:6px;border-left:3px solid var(--acc);">🔗 Discord #avisos-oficiales · Webhook activo</div>`;
  h+=`<div class="notice-list">`;
  [{title:'⚠️ ALERTA OPERATIVA',body:'Protocolo Delta activo en sector Norte.',time:'14:32',author:'JEFATURA CENTRAL',urgent:true},
   {title:'Reunión de briefing',body:'Sesión obligatoria para mandos a las 09:00.',time:'08:15',author:'Comisario García'},
   {title:'Mantenimiento sistema',body:'Servidor en mantenimiento el sábado de 02:00 a 04:00.',time:'Ayer',author:'Soporte TIC'}
  ].forEach(n=>{h+=`<div class="notice-item${n.urgent?' notice-urgent':''}"><div class="n-header"><span class="n-title">${n.title}</span><span class="n-time">${n.time}</span></div><div class="n-body">${n.body}</div><div class="n-author">— ${n.author}</div></div>`;});
  h+=`</div>`;return h;
}
function renderInformes(){
  return`${secHdr('Informes',roleLabels[cu.role],tCls(cu.role))}
  <div class="card-grid">
    <div class="info-card"><div class="card-icon">📋</div><div class="card-title">ABIERTOS</div><div class="card-count" style="color:var(--amb)">7</div></div>
    <div class="info-card"><div class="card-icon">✅</div><div class="card-title">CERRADOS</div><div class="card-count" style="color:var(--grn)">43</div></div>
    <div class="info-card"><div class="card-icon">⏳</div><div class="card-title">PENDIENTES</div><div class="card-count" style="color:var(--red)">3</div></div>
  </div>`;
}
function renderDenuncias(){
  return`${secHdr('Denuncias',roleLabels[cu.role],tCls(cu.role))}
  <div class="form-section"><h3>Registrar Denuncia</h3>
    <div class="form-row"><div class="form-group"><label>DENUNCIANTE</label><input type="text" placeholder="Nombre..." /></div><div class="form-group"><label>DNI</label><input type="text" placeholder="00000000X" /></div></div>
    <div class="form-row"><div class="form-group"><label>TIPO</label><select><option>Robo</option><option>Agresión</option><option>Otro</option></select></div><div class="form-group"><label>LUGAR</label><input type="text" placeholder="Dirección..." /></div></div>
    <div class="form-group" style="margin-bottom:8px;"><label>RELATO</label><textarea placeholder="Descripción..."></textarea></div>
    <button class="btn-submit" onclick="alert('✓ Denuncia registrada')">REGISTRAR</button></div>`;
}
function renderBuscados(){
  let h=secHdr('Busca y Captura',roleLabels[cu.role],tCls(cu.role));
  [{name:'DESCONOCIDO "El Sombra"',crime:'Tráfico de armas, evasión × 3',level:'⚠ PELIGROSO',icon:'😤'},
   {name:'Roberto Suárez Vidal',crime:'Robo a mano armada',level:'⚠ BUSCADO ACTIVO',icon:'👤'},
   {name:'GRUPO "Los Cuervos"',crime:'Crimen organizado',level:'⚠⚠ EXTREMADAMENTE PELIGROSO',icon:'⚫'}
  ].forEach(w=>{h+=`<div class="wanted-card"><div class="wanted-avatar">${w.icon}</div><div class="wanted-info"><div class="w-name">${w.name}</div><div class="w-crime">${w.crime}</div><div class="w-level">${w.level}</div></div></div>`;});
  return h;
}
function renderPersonas(){
  return`${secHdr('Registro de Personas',roleLabels[cu.role],tCls(cu.role))}
  <table class="data-table"><tr><th>NOMBRE</th><th>DNI</th><th>ESTADO</th></tr>
  <tr><td>Ana López Ruiz</td><td>12345678A</td><td><span class="status-badge status-active">LIMPIO</span></td></tr>
  <tr><td>Miguel Vega Santos</td><td>87654321B</td><td><span class="status-badge status-wanted">BUSCADO</span></td></tr>
  <tr><td>Carmen Díaz Ramos</td><td>11223344C</td><td><span class="status-badge status-detained">DETENIDO</span></td></tr></table>`;
}
function renderVehiculos(){
  return`${secHdr('Registro de Vehículos',roleLabels[cu.role],tCls(cu.role))}
  <table class="data-table"><tr><th>MATRÍCULA</th><th>VEHÍCULO</th><th>PROPIETARIO</th><th>ESTADO</th></tr>
  <tr><td style="color:var(--acc2);font-weight:700">ABC 1234</td><td>BMW Serie 3</td><td>Miguel Vega</td><td><span class="status-badge status-wanted">BUSCADO</span></td></tr>
  <tr><td style="color:var(--acc2);font-weight:700">XYZ 9876</td><td>Seat León</td><td>Ana López</td><td><span class="status-badge status-active">LIMPIO</span></td></tr></table>`;
}
function renderSecretoOps(){
  return`<div class="section-header"><h2 style="color:var(--sec)">⬡ Operaciones Clasificadas</h2><span class="section-tag tag-secret">CLASIFICADO</span></div>
  <div class="classified-banner">⬡ ACCESO NIVEL 5 — OJOS AUTORIZADOS ÚNICAMENTE ⬡</div>
  <div class="secret-panel"><div class="sp-header">Operaciones en Curso</div>
    <div class="sp-item"><div class="sp-title">OP. SOMBRA ROJA — En curso</div><div class="sp-text">Vigilancia sobre "Los Cuervos". Fase 3/5.</div></div>
    <div class="sp-item" style="border:1px solid var(--red)"><div class="sp-title" style="color:var(--red)">OP. MERCURIO — CRÍTICO</div><div class="sp-text">Exfiltración activo comprometido. 24h.</div></div>
  </div>`;
}
function renderSecretoMisiones(){
  return`<div class="section-header"><h2 style="color:var(--sec)">⬡ Misiones Activas</h2><span class="section-tag tag-secret">CLASIFICADO</span></div>
  <div class="classified-banner">⬡ CLASIFICADO NIVEL MÁXIMO ⬡</div>
  <div class="secret-panel"><div class="sp-header">Misiones</div>
    <div class="sp-item"><div class="sp-title">[M-044] Neutralizar informante</div><div class="sp-text">En curso · Agente K-7 · ALTO riesgo</div></div>
    <div class="sp-item" style="border:1px solid var(--red)"><div class="sp-title" style="color:var(--red)">[M-038] Recuperar documentación — CRÍTICO</div><div class="sp-text">Urgente · Agente Solo</div></div>
  </div>`;
}
function renderSecretoInformes(){
  return`<div class="section-header"><h2 style="color:var(--sec)">⬡ Informes Clasificados</h2><span class="section-tag tag-secret">CLASIFICADO</span></div>
  <div class="classified-banner">⬡ PROHIBIDA LA DISTRIBUCIÓN ⬡</div>
  <div class="form-section" style="background:#0f0020;border-color:var(--sec)"><h3 style="color:var(--sec)">Nuevo Informe Clasificado</h3>
    <div class="form-group" style="margin-bottom:8px;"><label>CONTENIDO</label><textarea style="min-height:100px;" placeholder="Redactar..."></textarea></div>
    <button class="btn-submit" style="background:var(--sec)" onclick="alert('✓ Cifrado y registrado')">REGISTRAR</button></div>`;
}

function renderMsgs(msgs){
  return(msgs||[]).slice().reverse().map(m=>`
    <div class="msg">
      <div class="msg-avatar ${m.voiceMsg?'voice':m.role}">${m.voiceMsg?'🎙':m.avatar}</div>
      <div class="msg-body">
        <div class="msg-meta"><span class="msg-author" style="color:${m.voiceMsg?'#00ff88':roleColor(m.role)}">${m.author}${m.voiceMsg?' 🎙':''}</span><span class="msg-time">${m.time}</span></div>
        <div class="msg-text${m.system?' system':m.voiceMsg?' voice-msg':''}">${m.text}</div>
      </div>
    </div>`).join('');
}

function renderRadioPanel(navId){
  const roleKey=navId==='secreto_radio'?'secreto':cu.role;
  const rd=RADIOS_DEF[roleKey]||RADIOS_DEF['policia'];
  if(!radioState[rd.id]){radioState[rd.id]={activeChannel:rd.channels[0].id,muted:false};radioLogs[rd.id]=JSON.parse(JSON.stringify(SEED));}
  const rs=radioState[rd.id];
  const activeCh=rd.channels.find(c=>c.id===rs.activeChannel)||rd.channels[0];
  const msgs=radioLogs[rd.id][activeCh.id]||[];

  const sttSupport=hasSpeechRecognition();
  const ttsSupport=!!window.speechSynthesis;

  return`<div class="radio-unit ${rd.cls}">
    <div class="r-unit-header">
      <span class="r-unit-name ${rd.cls}">${rd.label}</span>
      <div style="display:flex;align-items:center;gap:10px;">
        <div class="signal-bar ${rs.muted?'':'active'}" id="radioSig"><span></span><span></span><span></span><span></span><span></span></div>
        <span class="freq-display">${rd.freq} MHz</span>
        <span class="${rs.muted?'muted-badge':'onair-badge'}" id="radioBadge">${rs.muted?'MUTED':'ON AIR'}</span>
      </div>
    </div>
    <div class="r-unit-body">
      <div class="channels-col">
        <div class="channels-label">Canales</div>
        ${rd.channels.map(ch=>`
        <div class="ch-item ${ch.id===rs.activeChannel?'active-ch '+rd.cls:''}" onclick="radioSwitchCh('${rd.id}','${ch.id}','${navId}')">
          <span class="ch-dot"></span>
          <div class="ch-info"><div class="ch-name">${ch.name}</div><div class="ch-sub">${ch.sub}</div></div>
          <span class="ch-users">${ch.users}</span>
        </div>`).join('')}
      </div>
      <div class="chat-col">
        <div class="webhook-notice"><span class="webhook-dot"></span>Discord #${rd.id}-radio · Webhook activo</div>
        <div class="chat-ch-header">
          <div><span class="chat-ch-name">${activeCh.name}</span><span style="font-size:10px;color:var(--txt2);"> · ${activeCh.sub}</span></div>
          <div class="chat-ch-status"><span class="online-dot"></span>${activeCh.users} conectados</div>
        </div>
        <div class="messages-area" id="radioMsgs">${renderMsgs(msgs)}</div>

        <!-- TTS toggle -->
        ${ttsSupport?`<div class="tts-row">
          <span class="tts-label">🔈 AUDIO:</span>
          <button class="tts-toggle on" id="ttsToggle" onclick="toggleTTS()">VOZ ON</button>
          <span class="tts-label" style="margin-left:4px;">VOL</span>
          <input type="range" class="tts-vol" id="ttsVolSlider" min="0" max="1" step="0.1" value="0.9" oninput="ttsVol=parseFloat(this.value)" />
        </div>`:`<div class="no-support">⚠ Tu navegador no soporta síntesis de voz</div>`}

        <div class="voice-controls" style="margin-top:6px;">
          <!-- Mic row -->
          ${sttSupport?`<div class="mic-row">
            <button class="mic-btn idle" id="micBtn" onclick="startListening('${rd.id}','${navId}')">🎤</button>
            <div>
              <div class="mic-status" id="micStatus">Pulsa para hablar por radio</div>
              <div class="wave-vis" id="waveVis"><span></span><span></span><span></span><span></span><span></span></div>
            </div>
          </div>`:`<div class="no-support">⚠ Tu navegador no soporta reconocimiento de voz (usa Chrome)</div>`}
          <!-- Text + send row -->
          <div class="input-row">
            <input type="text" class="r-input" id="radioInput" placeholder="O escribe y pulsa PTT..." onkeydown="if(event.key==='Enter')radioSend('${rd.id}','${navId}',false)" />
            <button class="mute-btn ${rs.muted?'muted':''}" id="radioMuteBtn" onclick="radioToggleMute('${rd.id}')">${rs.muted?'🔇':'🔊'}</button>
            <button class="ptt-btn ${rd.cls}" onclick="radioSend('${rd.id}','${navId}',false)">PTT</button>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function radioSwitchCh(rdId,chId,navId){
  radioState[rdId].activeChannel=chId;
  if(!radioLogs[rdId][chId])radioLogs[rdId][chId]=[];
  document.getElementById('contentArea').innerHTML=renderRadioPanel(navId);
  const el=document.getElementById('radioMsgs');if(el)el.scrollTop=el.scrollHeight;
}

function radioToggleMute(rdId){
  radioState[rdId].muted=!radioState[rdId].muted;
  const muted=radioState[rdId].muted;
  const badge=document.getElementById('radioBadge');
  const sig=document.getElementById('radioSig');
  const btn=document.getElementById('radioMuteBtn');
  if(badge){badge.className=muted?'muted-badge':'onair-badge';badge.textContent=muted?'MUTED':'ON AIR';}
  if(sig)sig.className='signal-bar'+(muted?'':' active');
  if(btn){btn.className='mute-btn'+(muted?' muted':'');btn.textContent=muted?'🔇':'🔊';}
}

function radioSend(rdId,navId,isVoice){
  const inp=document.getElementById('radioInput');
  const text=(inp?.value||'').trim();
  if(!text)return;
  if(radioState[rdId].muted){if(inp)inp.placeholder='! Radio silenciada';return;}
  const chId=radioState[rdId].activeChannel;
  if(!radioLogs[rdId][chId])radioLogs[rdId][chId]=[];
  const rRole={police:'police',ems:'ems',army:'army',secret:'secret'}[rdId]||'police';
  radioLogs[rdId][chId].push({
    author:cu.name||'[TÚ]',
    avatar:initials(cu.name||'YO'),
    role:rRole,text,
    time:getShortTime(),
    voiceMsg:isVoice
  });
  if(inp)inp.value='';
  refreshRadioMsgs(rdId,chId);

  // Auto-reply simulation
  setTimeout(()=>{
    if(Math.random()<0.5)return;
    const names={police:['Control','H-50','ADAM-10','TÁCTICO 1'],ems:['Despacho','Ambulancia-2'],army:['Sargento-R','Coronel-R'],secret:['[REDACTADO]','Agente-K']};
    const avts={police:['CTL','H50','A10','TAC'],ems:['DES','AMB'],army:['SGT','COR'],secret:['??','AK']};
    const replies=['10-4, recibido.','Copiado. En ruta.','Confirmado, unidad en posición.','Entendido, procedemos.'];
    const idx=Math.floor(Math.random()*(names[rdId]||['CTL']).length);
    const replyText=replies[Math.floor(Math.random()*replies.length)];
    const replyAuthor=(names[rdId]||['Control'])[idx];
    radioLogs[rdId][chId].push({author:replyAuthor,avatar:(avts[rdId]||['CTL'])[idx]||'CTL',role:rRole,text:replyText,time:getShortTime()});
    if(radioState[rdId].activeChannel===chId){
      refreshRadioMsgs(rdId,chId);
      // TTS the reply
      speakRadio(`${replyAuthor} dice: ${replyText}`,rdId);
    }
  },800+Math.random()*1200);
}

function refreshRadioMsgs(rdId,chId){
  const el=document.getElementById('radioMsgs');
  if(el&&radioState[rdId].activeChannel===chId){
    el.innerHTML=renderMsgs(radioLogs[rdId][chId]);
    el.scrollTop=el.scrollHeight;
  }
}

function startClock(){
  function tick(){
    const now=new Date();
    const cl=document.getElementById('clockDisplay');
    const dt=document.getElementById('dateDisplay');
    const st=document.getElementById('serviceTimer');
    const pst=document.getElementById('pfServiceTimer');
    if(cl)cl.textContent=now.toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    if(dt)dt.textContent=now.toLocaleDateString('es-ES',{weekday:'short',day:'numeric',month:'short'});
    if(serviceStart){
      const d=Math.floor((Date.now()-serviceStart)/1000);
      const str=`${String(Math.floor(d/3600)).padStart(2,'0')}:${String(Math.floor((d%3600)/60)).padStart(2,'0')}:${String(d%60).padStart(2,'0')}`;
      if(st)st.textContent=str;
      if(pst)pst.textContent=str;
    }
  }
  tick();setInterval(tick,1000);
}