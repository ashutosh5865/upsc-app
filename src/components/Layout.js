import { NavLink } from "react-router-dom";

function Layout({ children }) {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: '󰕶' },
    { name: 'Today', path: '/today', icon: '󰭻' },
    { name: 'Subjects', path: '/subjects', icon: '󰗚' },
    { name: 'Schedule', path: '/schedule', icon: '󰃭' },
    { name: 'Analytics', path: '/analytics', icon: '󰈐' },
    { name: 'Mocks', path: '/mocks', icon: '󰈐' },
  ];

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200 selection:bg-blue-500/30">

      {/* Modern Sidebar */}
      <aside className="w-72 bg-[#020617] border-r border-slate-800/60 p-8 flex flex-col sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            <span className="text-white font-black text-xl italic">U</span>
          </div>
          <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase">
            UPSC <span className="text-blue-500">OS</span>
          </h1>
        </div>

        <nav className="flex flex-col gap-2 grow">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 px-2">Mission Control</p>
          
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group
                ${isActive 
                  ? 'bg-blue-600/10 text-white border border-blue-500/20 shadow-[0_0_20px_rgba(37,99,235,0.05)]' 
                  : 'hover:bg-slate-800/40 text-slate-400 hover:text-white border border-transparent'}
              `}
            >
              {({ isActive }) => (
                <>
                  <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isActive ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' : 'bg-transparent'}`} />
                  <span className="text-sm font-bold uppercase tracking-widest">{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer info */}
        <div className="mt-auto space-y-4 px-2">
          <div className="bg-slate-900/50 p-5 rounded-3xl border border-slate-800/50">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Target Year</p>
            <p className="text-sm font-bold text-white uppercase tracking-tighter">2027 Attempt</p>
          </div>
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest text-center">Version 2.0.4</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-[#0f172a] relative overflow-y-auto overflow-x-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative z-10 p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

export default Layout;