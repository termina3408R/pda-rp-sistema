import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Shield, 
  HeartPulse, 
  Trophy, 
  Eye, 
  LogOut, 
  Clock, 
  Radio, 
  Bell, 
  Search, 
  FileText, 
  AlertTriangle, 
  User as UserIcon, 
  Car, 
  Lock,
  Menu,
  X,
  Send,
  Wifi,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { Branch, User, Notification, RadioChannel, DatabaseRecord } from './types';
import { RADIO_CHANNELS, BRANCH_CONFIG } from './constants';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState('inicio');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isSecretAuthorized, setSecretAuthorized] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  const handleLogout = () => {
    setUser(null);
    setSecretAuthorized(false);
    setCurrentTab('inicio');
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a0c] text-zinc-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="w-64 border-r border-zinc-800/50 bg-[#0d0d10] flex flex-col z-50 overflow-y-auto"
          >
            <div className="p-6 border-b border-zinc-800/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-600/10 rounded-lg">
                  <Shield className="w-6 h-6 text-blue-500" />
                </div>
                <h1 className="font-bold text-xl tracking-tight">SENTINEL<span className="text-blue-500 font-light">PDA</span></h1>
              </div>
              
              <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/50">
                <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">Operativo</p>
                <p className="font-medium text-sm truncate">{user.name}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase",
                    user.branch === Branch.POLICE ? "bg-blue-600/20 text-blue-400" :
                    user.branch === Branch.EMS ? "bg-red-600/20 text-red-400" :
                    user.branch === Branch.ARMY ? "bg-emerald-600/20 text-emerald-400" :
                    "bg-zinc-500/20 text-zinc-300"
                  )}>
                    {user.branch}
                  </span>
                  <span className="text-zinc-600 text-[10px]">{user.badgeNumber}</span>
                </div>
              </div>
            </div>

            <nav className="flex-1 p-4 space-y-1">
              <NavItem icon={Clock} label="Inicio" active={currentTab === 'inicio'} onClick={() => setCurrentTab('inicio')} />
              
              {/* Conditional Nav Items based on Role */}
              {(user.branch === Branch.POLICE || user.branch === Branch.SECRET_UNIT) && (
                <>
                  <div className="pt-4 pb-2 px-3">
                    <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest">Policía</p>
                  </div>
                  <NavItem icon={FileText} label="Informes" active={currentTab === 'informes'} onClick={() => setCurrentTab('informes')} />
                  <NavItem icon={AlertTriangle} label="Denuncias" active={currentTab === 'denuncias'} onClick={() => setCurrentTab('denuncias')} />
                  <NavItem icon={UserIcon} label="Busca y Captura" active={currentTab === 'busqueda'} onClick={() => setCurrentTab('busqueda')} />
                </>
              )}

              {user.branch === Branch.EMS && (
                <>
                  <div className="pt-4 pb-2 px-3">
                    <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest">Servicios EMS</p>
                  </div>
                  <NavItem icon={HeartPulse} label="Historial Médico" active={currentTab === 'medica'} onClick={() => setCurrentTab('medica')} />
                  <NavItem icon={AlertTriangle} label="Despachos" active={currentTab === 'despachos'} onClick={() => setCurrentTab('despachos')} />
                </>
              )}

              {user.branch === Branch.ARMY && (
                <>
                  <div className="pt-4 pb-2 px-3">
                    <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest">Ejército</p>
                  </div>
                  <NavItem icon={Trophy} label="Misiones" active={currentTab === 'misiones'} onClick={() => setCurrentTab('misiones')} />
                  <NavItem icon={Shield} label="Inventario" active={currentTab === 'armamento'} onClick={() => setCurrentTab('armamento')} />
                </>
              )}

              <div className="pt-4 pb-2 px-3">
                <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest">Base de Datos</p>
              </div>
              <NavItem icon={UserIcon} label="Personas" active={currentTab === 'registro_personas'} onClick={() => setCurrentTab('registro_personas')} />
              <NavItem icon={Car} label="Vehículos" active={currentTab === 'registro_vehiculos'} onClick={() => setCurrentTab('registro_vehiculos')} />
              
              <div className="pt-4 pb-2 px-3">
                <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest">Comunicaciones</p>
              </div>
              <NavItem icon={Radio} label="Radio Interna" active={currentTab === 'radio'} onClick={() => setCurrentTab('radio')} />
              <NavItem icon={Bell} label="Avisos / Canal DI" active={currentTab === 'avisos'} onClick={() => setCurrentTab('avisos')} />

              {/* Special Secret Unit Section */}
              {user.branch === Branch.SECRET_UNIT && (
                <>
                  <div className="pt-4 pb-2 px-3">
                    <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest">Restringido</p>
                  </div>
                  <NavItem 
                    icon={Lock} 
                    label="Unidad Secreta" 
                    className="text-amber-500 hover:bg-amber-500/10"
                    active={currentTab === 'secreto_gate'} 
                    onClick={() => setCurrentTab('secreto_gate')} 
                  />
                </>
              )}
            </nav>

            <div className="p-4 border-t border-zinc-800/50">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-400/10 transition-all duration-300"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Cerrar Sesión</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-grid-zinc-900/[0.05]">
        {/* Header */}
        <header className="h-20 border-b border-zinc-800/50 flex items-center justify-between px-8 bg-[#0a0a0c]/80 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-zinc-800/50 rounded-lg text-zinc-400"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-zinc-100 font-bold text-lg capitalize">{currentTab.replace('_', ' ')}</h2>
              <p className="text-zinc-500 text-xs">Sistema conectado | V.4.2.0</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <p className="text-lg font-mono font-bold text-zinc-100 tracking-wider">
                {format(currentTime, 'HH:mm:ss')}
              </p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
                {format(currentTime, 'EEEE, d MMMM', { locale: es })}
              </p>
            </div>
            <div className="h-10 w-px bg-zinc-800" />
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Link Estable</p>
            </div>
          </div>
        </header>

        {/* View Port */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="max-w-6xl mx-auto w-full"
            >
              {currentTab === 'inicio' && <Dashboard user={user} />}
              {currentTab === 'informes' && <MockList title="Informes de Policía" items={MOCK_REPORTS} />}
              {currentTab === 'denuncias' && <MockList title="Bandeja de Denuncias" items={MOCK_COMPLAINTS} />}
              {currentTab === 'busqueda' && <WarrantsView />}
              {currentTab === 'registro_personas' && <DatabaseView type="personas" />}
              {currentTab === 'registro_vehiculos' && <DatabaseView type="vehiculos" />}
              {currentTab === 'radio' && <RadioView />}
              {currentTab === 'avisos' && <AlertsView />}
              {currentTab === 'secreto_gate' && (
                !isSecretAuthorized ? (
                  <SecretPassGate onAuthorized={() => {
                    setSecretAuthorized(true);
                    setCurrentTab('secreto_content');
                  }} />
                ) : (
                  <SecretContent />
                )
              )}
              {currentTab === 'secreto_content' && <SecretContent />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Agency Restricted Visual Overlay */}
      <div className="absolute bottom-6 right-6 bg-black/80 backdrop-blur-md border border-white/10 px-5 py-2 rounded-full flex items-center gap-4 shadow-2xl z-[60] pointer-events-none sm:pointer-events-auto">
        <div className="flex items-center gap-2">
          <div className={cn("w-2.5 h-2.5 rounded-full shadow-[0_0_8px]", user.branch === Branch.POLICE ? "bg-blue-500 shadow-blue-500/50" : "bg-blue-500/20")}></div>
          <span className={cn("text-[9px] font-black uppercase tracking-widest", user.branch === Branch.POLICE ? "text-blue-400" : "text-slate-700")}>Police View</span>
        </div>
        <div className="w-[1px] h-4 bg-white/10"></div>
        <div className="flex items-center gap-2">
          <div className={cn("w-2.5 h-2.5 rounded-full shadow-[0_0_8px]", user.branch === Branch.EMS ? "bg-red-500 shadow-red-500/50" : "bg-red-500/20")}></div>
          <span className={cn("text-[9px] font-black uppercase tracking-widest", user.branch === Branch.EMS ? "text-red-400" : "text-slate-700")}>EMS View</span>
        </div>
        <div className="w-[1px] h-4 bg-white/10"></div>
        <div className="flex items-center gap-2">
          <div className={cn("w-2.5 h-2.5 rounded-full shadow-[0_0_8px]", user.branch === Branch.ARMY ? "bg-emerald-500 shadow-emerald-500/50" : "bg-emerald-500/20")}></div>
          <span className={cn("text-[9px] font-black uppercase tracking-widest", user.branch === Branch.ARMY ? "text-emerald-400" : "text-slate-700")}>Army Command</span>
        </div>
        {user.branch === Branch.SECRET_UNIT && (
          <>
            <div className="w-[1px] h-4 bg-white/10"></div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>
              <span className="text-[9px] font-black uppercase tracking-widest text-purple-400">Restricted Mode</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// --- Sub-Components ---

function Login({ onLogin }: { onLogin: (user: User) => void }) {
  const [name, setName] = useState('');
  const [branch, setBranch] = useState<Branch>(Branch.POLICE);
  const [badge, setBadge] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && badge) {
      onLogin({ name, branch, badgeNumber: badge });
    }
  };

  return (
    <div className="min-h-screen bg-[#050608] flex items-center justify-center p-6 font-mono relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#111827_0%,_#050608_100%)]" />
      <div className="absolute inset-0 bg-grid-white/[0.02]" />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-[#0c0e14] border-2 border-blue-500/30 p-8 rounded-xl shadow-[0_0_50px_rgba(59,130,246,0.1)] relative z-10"
      >
        <div className="mb-10 text-center border-b border-white/5 pb-8">
          <div className="inline-flex p-4 bg-blue-600/10 rounded-lg mb-6 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
            <Shield className="w-10 h-10 text-blue-500" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white mb-2 uppercase">System Authentication</h1>
          <p className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.3em]">Encrypted Connection Established</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Officer Name</label>
            <div className="relative group">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
              <input 
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="FIRST_NAME LAST_NAME"
                className="w-full bg-black/60 border border-white/10 rounded-lg py-3 pl-12 pr-4 text-white text-xs focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-800 uppercase"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Identifier (Badge #)</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
              <input 
                required
                value={badge}
                onChange={e => setBadge(e.target.value)}
                placeholder="ID: ####-X"
                className="w-full bg-black/60 border border-white/10 rounded-lg py-3 pl-12 pr-4 text-white text-xs focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-800 uppercase"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Organization Branch</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(Branch).map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBranch(b)}
                  className={cn(
                    "p-3 rounded-lg border text-[10px] font-black uppercase tracking-tighter transition-all flex items-center gap-2 justify-center",
                    branch === b 
                      ? "bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]" 
                      : "bg-black/40 border-white/5 text-slate-600 hover:border-white/10"
                  )}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 text-white font-black py-4 rounded-lg hover:bg-blue-500 transition-all flex items-center justify-center gap-2 group mt-4 active:scale-[0.98] uppercase text-xs tracking-[0.2em]"
          >
            Authorize Terminal
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-white/5 flex justify-between items-center text-[8px] text-slate-700 uppercase font-black tracking-widest">
          <span>AES-256</span>
          <span className="text-emerald-900">Link Secure</span>
          <span>v4.2.0</span>
        </div>
      </motion.div>
    </div>
  );
}

function NavItem({ icon: Icon, label, active, onClick, className }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 transition-colors rounded-r-md group relative",
        active 
          ? "bg-blue-600/10 text-blue-400 border-l-2 border-blue-500" 
          : "text-slate-400 hover:bg-white/5",
        className
      )}
    >
      <Icon className={cn("w-4 h-4", active ? "text-blue-500" : "group-hover:text-blue-400 transition-colors")} />
      <span className="text-xs font-semibold uppercase tracking-tighter">{label}</span>
    </button>
  );
}

function Dashboard({ user }: { user: User }) {
  return (
    <div className="space-y-6 pb-10">
      {/* Search Header Pattern from Design */}
      <div className="bg-[#0f1117] border border-white/10 rounded-xl p-4 flex gap-4 items-center shadow-inner">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input 
              type="text" 
              placeholder="SEARCH CITIZEN NAME / PLATE / ID..." 
              className="w-full bg-black/40 border border-white/5 rounded px-4 py-2 pl-10 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all font-mono"
            />
          </div>
          <button className="bg-blue-600 text-white px-6 py-2 rounded text-[10px] font-bold hover:bg-blue-500 uppercase tracking-widest transition-all active:scale-[0.98]">EXECUTE QUERY</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          label="Network Status" 
          value="ENCRYPTED" 
          sub="7 NODES ONLINE" 
          icon={Wifi} 
          color="emerald" 
        />
        <StatCard 
          label="Dispatch Alerts" 
          value="04" 
          sub="3 PRIORITY ASSIGNMENTS" 
          icon={Bell} 
          color="blue" 
        />
        <StatCard 
          label="Identity Pool" 
          value="1.2k" 
          sub="ACTIVE REGISTRATIONS" 
          icon={UserIcon} 
          color="slate" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-[#0f1117]/80 border border-white/5 rounded-xl flex flex-col overflow-hidden shadow-2xl">
          <div className="bg-slate-800/50 p-3 border-b border-white/5 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest">Recent Dispatch Alerts</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
          </div>
          <div className="p-4 space-y-3">
            <ActivityItem 
              time="22:42" 
              type="10-71 SHOTS FIRED" 
              msg="Mission Row: Automatic weapon fire reported near Legion Square. SUSPECT: White Buffalo." 
              urgent 
            />
            <ActivityItem 
              time="22:38" 
              type="10-11 TRAFFIC STOP" 
              msg="Power St: Black Sultan RS. License: 44JBK882. No backup required." 
            />
            <ActivityItem 
              time="22:30" 
              type="DISCORD FEED" 
              msg="Command: 'All units maintain high alert near high-value asset storage today.'" 
              isQuote
            />
          </div>
        </section>

        <section className="bg-[#0f1117] border border-white/10 rounded-xl p-6 shadow-2xl">
          <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-6 border-b border-white/5 pb-2">Operational Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <QuickAction icon={AlertTriangle} label="Panic Signal" color="red" />
            <QuickAction icon={Search} label="Lookup Person" color="blue" />
            <QuickAction icon={FileText} label="File Report" color="slate" />
            <QuickAction icon={Send} label="Broadcast GPS" color="slate" />
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, color }: any) {
  const colors: any = {
    emerald: "text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]",
    blue: "text-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.2)]",
    slate: "text-slate-400 shadow-[0_0_10px_rgba(148,163,184,0.1)]"
  };

  return (
    <div className="bg-[#0f1117] border border-white/10 p-5 rounded-xl group hover:border-blue-500/30 transition-all shadow-xl">
      <div className="flex justify-between items-start mb-3">
        <label className="text-slate-500 text-[9px] uppercase font-bold tracking-[0.2em]">{label}</label>
        <Icon className={cn("w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity", colors[color] || colors.blue)} />
      </div>
      <h4 className="text-xl font-bold text-white mb-1 tracking-tight">{value}</h4>
      <p className="text-slate-600 text-[10px] uppercase font-medium">{sub}</p>
    </div>
  );
}

function ActivityItem({ time, msg, type, urgent, isQuote }: any) {
  return (
    <div className={cn(
      "p-3 rounded-lg border transition-all text-xs",
      urgent ? "bg-red-950/20 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.05)]" : "bg-[#161b22]/40 border-white/5"
    )}>
      <div className="flex items-center justify-between mb-1.5 font-bold">
        <span className={cn(
          "text-[9px] uppercase tracking-wider",
          urgent ? "text-red-400" : isQuote ? "text-slate-500" : "text-blue-400"
        )}>{type}</span>
        <span className="text-[9px] text-slate-500 font-mono tracking-tighter">{time}</span>
      </div>
      <p className={cn(
        "text-slate-300 leading-snug",
        isQuote ? "font-serif italic text-slate-400" : ""
      )}>{msg}</p>
    </div>
  );
}

function QuickAction({ icon: Icon, label, color }: any) {
  const colorStyles: any = {
    red: "bg-red-950/40 border-red-500/30 text-red-500 hover:bg-red-900/60",
    blue: "bg-blue-900/10 border-blue-500/30 text-blue-500 hover:bg-blue-900/30",
    slate: "bg-slate-800/20 border-white/10 text-slate-400 hover:bg-slate-800/40"
  };

  return (
    <button className={cn(
      "w-full p-4 rounded-xl flex flex-col items-center justify-center gap-2 border transition-all hover:scale-[1.02] active:scale-[0.98]",
      colorStyles[color] || colorStyles.slate
    )}>
      <Icon className="w-5 h-5" />
      <span className="text-[9px] font-black uppercase tracking-tight">{label}</span>
    </button>
  );
}

function RadioView() {
  const [activeChannel, setActiveChannel] = useState('1');
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-[#0f1117] border border-white/10 rounded-xl p-8 overflow-hidden relative shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Radio className="w-32 h-32 text-blue-500 -rotate-12" />
          </div>
          <div className="relative z-10">
            <h3 className="text-lg font-black uppercase text-white mb-2">Radio Frequency Management</h3>
            <p className="text-slate-500 text-xs mb-8 max-w-md">Authorized encrypted channels for tactical coordination.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {RADIO_CHANNELS.map(ch => (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannel(ch.id)}
                  className={cn(
                    "p-4 rounded-lg border transition-all text-left flex items-center justify-between group",
                    activeChannel === ch.id 
                      ? "bg-blue-900/40 border-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.1)] ring-1 ring-blue-500/20" 
                      : "bg-black/40 border-white/5 hover:border-white/10"
                  )}
                >
                  <div className="overflow-hidden">
                    <h4 className={cn("font-bold text-xs uppercase", activeChannel === ch.id ? "text-white" : "text-slate-400")}>{ch.name}</h4>
                    <p className={cn("text-[9px] font-mono mt-0.5", activeChannel === ch.id ? "text-blue-400" : "text-slate-600")}>FREQ: {ch.frequency} MHz</p>
                  </div>
                  <div className={cn(
                    "p-1.5 rounded bg-black/40 border border-white/5",
                    activeChannel === ch.id ? "text-blue-400" : "text-slate-700"
                  )}>
                    <Wifi className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#0f1117] border border-white/10 rounded-xl p-5 flex flex-col shadow-2xl">
        <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-6 border-b border-white/5 pb-2">Active Transmissions</h3>
        <div className="space-y-2 flex-1 overflow-y-auto">
          {['Z-22 (Johnson)', 'AM-01 (Ruiz)', 'T-04 (Smith)', 'Z-15 (Stark)'].map((unit, i) => (
            <div key={i} className="flex items-center gap-3 p-2 bg-black/40 border border-white/5 rounded">
              <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-300 uppercase">{unit}</span>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <button className="w-full bg-blue-600/20 border border-blue-500/30 text-blue-400 py-4 rounded-lg font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600/30 transition-all active:scale-[0.98] shadow-lg shadow-blue-500/5">
            Hold to Transmit (PTT)
          </button>
        </div>
      </div>
    </div>
  );
}

function DatabaseView({ type }: { type: 'personas' | 'vehiculos' }) {
  return (
    <div className="space-y-6">
      <div className="bg-[#0f1117] border border-white/10 rounded-xl p-4 flex gap-4 items-center shadow-inner">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input 
              type="text" 
              placeholder={`QUERY ${type.toUpperCase()} DATABASE...`}
              className="w-full bg-black/40 border border-white/5 rounded px-4 py-2 pl-10 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all font-mono uppercase"
            />
          </div>
          <button className="bg-blue-600 text-white px-6 py-2 rounded text-[10px] font-bold hover:bg-blue-500 uppercase tracking-widest transition-all">SEARCH</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-[#0f1117] border border-white/10 p-5 rounded-xl flex items-center gap-5 hover:border-blue-500/30 transition-all cursor-pointer group shadow-xl">
            <div className="w-14 h-14 bg-black/60 rounded-lg flex items-center justify-center shrink-0 border border-white/5 relative overflow-hidden group-hover:border-blue-500/20">
              {type === 'personas' ? <UserIcon className="w-6 h-6 text-slate-700" /> : <Car className="w-6 h-6 text-slate-700" />}
              <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="overflow-hidden">
              <h4 className="font-bold text-sm text-white mb-0.5 truncate uppercase tracking-tighter">
                {type === 'personas' ? 'John Doe Robinson' : 'Declasse Buffalo STX'}
              </h4>
              <p className="text-slate-500 text-[9px] font-mono uppercase tracking-widest">
                {type === 'personas' ? 'ID: 45A-881J' : 'PLACA: 88XYA22'}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[8px] bg-red-900/40 text-red-500 px-1.5 rounded font-black border border-red-500/20 uppercase tracking-tighter">Wanted</span>
                <span className="text-[8px] text-slate-600 uppercase font-bold tracking-tighter">Sync: 1m ago</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WarrantsView() {
  return (
    <div className="space-y-6">
      <div className="bg-red-950/20 border border-red-500/30 p-8 rounded-xl text-center mb-10 shadow-[0_0_30px_rgba(239,68,68,0.05)]">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-black text-red-500 uppercase tracking-widest">Active Warrants Hub</h3>
        <p className="text-red-400/40 text-[10px] uppercase font-bold tracking-tight max-w-sm mx-auto mt-2">Extreme danger alert. Authorize force protocol if necessary.</p>
      </div>

      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-[#0f1117] border border-white/5 p-4 rounded-xl flex flex-wrap items-center justify-between gap-6 hover:bg-[#161b22] transition-all border-l-4 border-l-red-600 shadow-xl">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-black/60 rounded overflow-hidden grayscale contrast-125 border border-white/5">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=wanted${i}`} alt="Wanted person" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white uppercase">Marcos "Lince" Valdés</h4>
                <p className="text-slate-500 text-[10px] uppercase font-medium">Armed Robbery, Aggravated Assault</p>
                <div className="flex items-center gap-4 mt-1.5">
                  <span className="text-[8px] font-mono text-slate-600 uppercase">CRIM-ID: #WW-77{i}</span>
                  <span className="text-[8px] text-slate-500 uppercase tracking-tighter">Last Seen: Vespucci</span>
                </div>
              </div>
            </div>
            <button className="bg-red-600 hover:bg-red-700 text-white font-black px-5 py-2.5 rounded text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-red-600/10 active:scale-[0.98]">Access File</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AlertsView() {
  return (
    <div className="space-y-6">
       <div className="bg-[#0f1117] border border-white/10 rounded-xl p-6 flex items-center justify-between shadow-2xl">
         <div>
           <h3 className="text-lg font-black uppercase text-white mb-1">Global Alert Bridge</h3>
           <p className="text-slate-500 text-xs">Direct encrypted uplink to Central Dispatch & Discord.</p>
         </div>
         <div className="p-3 bg-white/5 rounded-xl border border-white/10">
           <Bell className="w-6 h-6 text-slate-400" />
         </div>
       </div>

       <div className="space-y-3 max-w-2xl">
         <div className="bg-[#0f1117]/80 border-l-2 border-l-blue-500 p-4 rounded bg-grid-white/[0.01]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-black text-blue-500 uppercase text-[9px] tracking-widest">General Broadcast</span>
              <span className="text-slate-600 text-[9px] font-mono uppercase tracking-tighter">14:22:05</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">Operation "Neon Dusk" confirmed successful. All participating units report to Mission Row for debrief.</p>
         </div>

         <div className="bg-[#0f1117]/80 border-l-2 border-l-red-500 p-4 rounded bg-grid-white/[0.01]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-black text-red-500 uppercase text-[9px] tracking-widest">CRITICAL DISPATCH</span>
              <span className="text-slate-600 text-[9px] font-mono uppercase tracking-tighter">15:10:22</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">SHOTS FIRED: Mission Row Medical Center. Unknown number of hostiles. CODE 3 RESPONSE REQUIRED.</p>
         </div>
       </div>
    </div>
  );
}

function SecretPassGate({ onAuthorized }: { onAuthorized: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'DELTA-77') {
      onAuthorized();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <motion.div 
        animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
        className="bg-[#0c0e14] border border-purple-500/30 p-8 rounded-xl text-center shadow-[0_0_50px_rgba(168,85,247,0.1)] relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-grid-white/[0.02]" />
        <div className="relative z-10 font-mono">
          <div className="w-14 h-14 bg-purple-900/20 border border-purple-500/30 rounded-lg flex items-center justify-center mx-auto mb-6 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
            <Lock className="w-6 h-6 text-purple-500" />
          </div>
          <h3 className="text-sm font-black text-white mb-2 uppercase tracking-[0.2em]">Restricted Terminal Access</h3>
          <p className="text-slate-500 text-[10px] mb-8 uppercase font-bold tracking-tighter leading-relaxed">Enter S-1 Level encryption key to proceed. Access is strictly logged.</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
              type="password"
              autoFocus
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-lg py-4 px-6 text-center text-xl tracking-[0.5em] focus:outline-none focus:border-purple-500/50 transition-all text-purple-400 font-mono placeholder:text-slate-900"
              placeholder="••••••••"
            />
            <button className="w-full bg-purple-600/20 border border-purple-500/50 text-purple-400 font-black py-4 rounded-lg tracking-[0.2em] uppercase text-xs hover:bg-purple-600/30 transition-all active:scale-[0.98]">
              Decipher Key
            </button>
          </form>
          {error && <p className="text-red-500 text-[10px] font-black mt-4 uppercase animate-pulse">Auth Failure - Node Rejected</p>}
        </div>
      </motion.div>
    </div>
  );
}

function SecretContent() {
  return (
    <div className="space-y-8 pb-10">
      <div className="bg-purple-900/10 border border-purple-500/20 p-8 rounded-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Eye className="w-32 h-32 text-purple-500" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-3">
            <Eye className="w-6 h-6 text-purple-400" />
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Black-Site Intelligence</h3>
          </div>
          <p className="text-slate-500 text-[10px] uppercase font-bold max-w-2xl leading-relaxed tracking-tighter">Operational data under Title 4-A. Secure channel 99X established. No manual logging required.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-[#0f1117] border border-white/5 rounded-xl p-5 shadow-inner">
          <h4 className="text-[10px] font-black text-purple-500 uppercase tracking-[0.2em] mb-6 border-b border-white/5 pb-2">Active Surveillance</h4>
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="p-4 bg-black/40 rounded border border-white/5 border-l-2 border-l-purple-500">
                <p className="font-bold text-white text-xs uppercase tracking-tighter">Sujeto: 'EL MAESTRO'</p>
                <p className="text-slate-500 text-[10px] mt-1 uppercase tracking-tighter italic font-serif leading-relaxed">Meeting confirmed at Terminal 4. Possible arms transfer at 0300h.</p>
                <div className="mt-3 flex gap-2">
                  <span className="text-[8px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter border border-purple-500/20">Classified</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[#0f1117] border border-white/5 rounded-xl p-5 shadow-inner">
          <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-6 border-b border-white/5 pb-2">Mission Logs</h4>
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="p-4 bg-black/40 rounded border border-white/5 border-l-2 border-l-emerald-500">
                <p className="font-bold text-white text-xs uppercase tracking-tighter">Op: 'RAINBOW DUSK'</p>
                <p className="text-slate-500 text-[10px] mt-1 uppercase tracking-tighter leading-relaxed">Asset tracking device planted on target vehicle. Extraction point selected.</p>
                <p className="text-[8px] text-slate-700 mt-2 font-mono uppercase">REF: #SHDW-9922x</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function MockList({ title, items }: { title: string, items: any[] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <h3 className="text-lg font-black uppercase text-white tracking-widest">{title}</h3>
        <button className="bg-blue-600/10 border border-blue-500/30 text-blue-400 px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest hover:bg-blue-600/20 transition-all active:scale-[0.98]">Author New</button>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="bg-[#0f1117] border border-white/5 p-4 rounded-lg flex items-center justify-between group hover:bg-[#161b22] transition-all shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-black/40 rounded border border-white/5 group-hover:border-blue-500/20">
                <FileText className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <h5 className="font-bold text-xs text-white uppercase tracking-tighter">{item.title}</h5>
                <p className="text-[9px] text-slate-600 mt-0.5 uppercase tracking-tighter font-bold">{item.date} • Auth: {item.author}</p>
              </div>
            </div>
            <button className="p-1.5 text-slate-700 group-hover:text-blue-400 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Mock Data ---

const MOCK_REPORTS = [
  { title: "Hurto en Joyería Vangelico", date: "Hoy, 10:45", author: "Of. Johnson" },
  { title: "Detención por Posesión ilícita", date: "Ayer, 23:12", author: "Sgt. Miller" },
  { title: "Accidente de Tráfico Grave", date: "14 Mayo, 15:30", author: "Of. Stark" },
  { title: "Altercado en el Bahama Mamas", date: "12 Mayo, 02:00", author: "Of. Johnson" },
];

const MOCK_COMPLAINTS = [
  { title: "Denuncia por ruidos molestos", date: "Hoy, 16:20", author: "Anónimo" },
  { title: "Robo de vehículo (Sultan RS)", date: "Hoy, 14:05", author: "M. Trevor" },
  { title: "Acoso en vía pública", date: "Ayer, 18:45", author: "S. Jackson" },
];
