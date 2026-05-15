/* ==========================================
   VARIABLES GLOBALES Y RESET
   ========================================== */
:root {
  --bg: #0a0e1a; --bg2: #0f1628; --bg3: #151d35; --bg4: #1a2440;
  --acc: #1a6fff; --acc2: #00d4ff; --grn: #00ff88; --red: #ff3355;
  --amb: #ffaa00; --sec: #9b30ff; --ems-c: #ff4466; --arm: #4caf50;
  --txt: #c8d8ff; --txt2: #7090cc; --txt3: #3d5a80; --brd: #1e3060; --brd2: #2a4080;
  --header-h: 55px;
}

* { 
  box-sizing: border-box; 
  margin: 0; 
  padding: 0; 
  -webkit-tap-highlight-color: transparent; 
}

body { 
  background: #000; 
  font-family: 'Segoe UI', sans-serif; 
  color: var(--txt); 
  overflow: hidden; 
}

#app {
  background: var(--bg);
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

@media (min-width: 1024px) {
  #app {
    max-width: 1200px;
    height: 90vh;
    margin: 5vh auto;
    border-radius: 12px;
    border: 1px solid var(--brd2);
    box-shadow: 0 0 40px rgba(0,0,0,0.8);
  }
}

.hidden { display: none !important; }

/* ==========================================
   PANTALLA DE LOGEO
   ========================================== */
.login-screen {
  padding: 2rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
.login-card {
  background: var(--bg2);
  border: 1px solid var(--brd2);
  border-radius: 16px;
  padding: 2.5rem 2rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 0 40px rgba(0,0,0,.6);
}
.login-title {
  font-size: 24px;
  color: var(--acc2);
  margin-bottom: 25px;
  font-family: 'Rajdhani', sans-serif;
  font-weight: 700;
  letter-spacing: 3px;
}
.field-group {
  margin-bottom: 1.4rem;
  text-align: left;
}
.field-label {
  font-family: 'Share Tech Mono', monospace;
  font-size: 11px;
  color: var(--txt2);
  text-transform: uppercase;
  margin-bottom: 6px;
  display: block;
}
.field-input {
  width: 100%;
  background: var(--bg3);
  border: 1px solid var(--brd);
  border-radius: 8px;
  color: var(--txt);
  padding: 12px;
  outline: none;
  font-size: 14px;
  font-family: sans-serif;
  transition: border 0.2s;
}
.field-input:focus { border-color: var(--acc2); }

.btn-login {
  width: 100%;
  background: linear-gradient(135deg, var(--acc), var(--acc2));
  border: none;
  border-radius: 8px;
  color: #fff;
  padding: 14px;
  font-family: 'Rajdhani', sans-serif;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: transform 0.2s;
}
.btn-login:active { transform: scale(0.98); }

/* ==========================================
   TOPBAR (BARRA SUPERIOR)
   ========================================== */
.topbar {
  background: var(--bg2);
  padding: 0 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--brd);
  height: var(--header-h);
  z-index: 10;
  flex-shrink: 0;
}
.menu-toggle {
  display: none;
  background: transparent;
  border: none;
  color: var(--acc2);
  font-size: 26px;
  cursor: pointer;
}
.topbar-brand {
  font-family: 'Rajdhani', sans-serif;
  font-weight: 700;
  color: var(--acc2);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  letter-spacing: 1px;
}
.brand-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--grn);
}
.topbar-right {
  display: flex;
  align-items: center;
  gap: 15px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 13px;
}
#dateDisplay { color: var(--txt2); }

/* STATUS WEBSOCKET DE DISCORD */
.ws-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 4px;
  border: 1px solid transparent;
}
.ws-status.connecting { color: var(--amb); border-color: rgba(255,179,0,.3); background: rgba(255,179,0,.05); }
.ws-status.connected { color: var(--grn); border-color: rgba(0,255,136,.3); background: rgba(0,255,136,.05); }
.ws-status.disconnected { color: var(--red); border-color: rgba(255,51,85,.3); background: rgba(255,51,85,.05); }

.ws-dot { width: 6px; height: 6px; border-radius: 50%; }
.ws-dot.connecting { background: var(--amb); animation: pulse 1s infinite; }
.ws-dot.connected { background: var(--grn); }
.ws-dot.disconnected { background: var(--red); }

@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:.3 } }

/* ==========================================
   ESTRUCTURA DE CUERPO Y MENÚ COMPACTO
   ========================================== */
.main-wrapper {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
}

.sidebar {
  width: 260px;
  background: var(--bg2);
  border-right: 1px solid var(--brd2);
  display: flex;
  flex-direction: column;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 5;
  flex-shrink: 0;
}

.nav-section { padding: 10px; flex: 1; overflow-y: auto; }
.nav-label {
  font-size: 10px;
  color: var(--txt3);
  letter-spacing: 2px;
  padding: 10px 5px;
  text-transform: uppercase;
  font-family: 'Share Tech Mono', monospace;
}

/* CANALES INYECTADOS */
.ch-col { display: flex; flex-direction: column; gap: 4px; }
.ch-item {
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  color: var(--txt2);
  display: flex;
  align-items: center;
  gap: 8px;
  transition: 0.2s;
}
.ch-item:hover { background: var(--bg3); color: #fff; }
.ch-item.active { background: var(--bg4); color: var(--acc2); font-weight: bold; }

/* PERFIL DE OPERADOR */
.profile-banner {
  background: var(--bg3);
  padding: 15px 12px;
  border-bottom: 1px solid var(--brd);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 5px;
}
.u-name { font-weight: bold; font-size: 14px; color: var(--txt); }
.u-meta { font-size: 10px; color: var(--txt2); font-family: 'Share Tech Mono', monospace; margin-top: 2px; }

.tts-tog {
  padding: 5px 10px;
  background: var(--bg4);
  border: 1px solid var(--brd2);
  color: var(--txt2);
  border-radius: 4px;
  cursor: pointer;
  font-family: 'Share Tech Mono', monospace;
  font-size: 11px;
}
.tts-tog.on { background: rgba(0,255,136,0.12); color: var(--grn); border-color: var(--grn); }

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid var(--brd2);
  background: var(--bg);
}
.service-display {
  font-size: 11px;
  font-family: 'Share Tech Mono', monospace;
  color: var(--txt2);
  text-align: center;
}
#serviceTime { color: var(--amb); font-weight: bold; }

/* ==========================================
   ÁREA DE CHAT / CONTENIDO RESPONSIVE
   ========================================== */
.content-area {
  flex: 1;
  padding: 15px;
  background: var(--bg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.radio-wrap {
  background: var(--bg2);
  border: 1px solid var(--brd);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.radio-header {
  background: var(--bg3);
  padding: 12px 15px;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid var(--brd);
  align-items: center;
}
.radio-title { font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 14px; letter-spacing: 1px; }
.radio-freq { font-family: 'Share Tech Mono', monospace; color: var(--amb); font-size: 11px; }

.chat-col { flex: 1; display: flex; flex-direction: column; background: var(--bg2); overflow: hidden; }
.msgs-area { flex: 1; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; }

/* BURBUJAS DE MENSAJE */
.chat-msg {
  display: flex;
  font-size: 13px;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(255,255,255,0.01);
  border-left: 3px solid var(--brd);
}
.chat-msg.new-msg { animation: flashNew 0.8s ease; }
.chat-author { font-weight: bold; color: var(--acc2); margin-right: 6px; }
.chat-time { font-size: 9px; color: var(--txt3); margin-left: auto; align-self: center; }

.radio-footer-controls {
  padding: 10px;
  background: var(--bg3);
  border-top: 1px solid var(--brd2);
  display: flex;
  gap: 10px;
}
.radio-input { padding: 10px; font-size: 13px; }
.btn-send {
  background: var(--acc);
  border: none;
  color: white;
  padding: 0 20px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  font-family: 'Rajdhani', sans-serif;
  text-transform: uppercase;
}

.loading-msg { color: var(--txt3); text-align: center; padding-top: 40px; font-size: 11px; font-family: 'Share Tech Mono'; }

/* ESTILOS DE TEXTO CRÍTICO */
.alert-msg { color: var(--red); font-weight: bold; }
.wanted-msg { color: var(--amb); font-weight: bold; }
.vehicle-msg { color: var(--acc2); }
.person-msg { color: var(--grn); }

@keyframes flashNew { 0% { background: rgba(0,200,255,.15) } 100% { background: transparent } }

/* ==========================================
   ADAPTACIÓN PARA CELULARES (RESPONSIVE)
   ========================================== */
@media (max-width: 768px) {
  .menu-toggle { display: block; }
  
  .sidebar {
    position: absolute;
    top: 0; left: 0; bottom: 0;
    transform: translateX(-100%);
    box-shadow: 5px 0 25px rgba(0,0,0,0.8);
  }
  .sidebar.open { transform: translateX(0); }
  
  .mobile-overlay {
    display: none; position: absolute; inset: 0; background: rgba(0,0,0,0.6); z-index: 4;
  }
  .mobile-overlay.active { display: block; }
  
  .ws-status span { display: none; }
  .ws-status { padding: 6px; }
  .ws-status .ws-dot { display: block; width: 8px; height: 8px; }
}
