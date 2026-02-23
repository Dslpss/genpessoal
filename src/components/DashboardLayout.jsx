import React from 'react'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  LogOut, 
  Bell, 
  Search,
  ChevronRight,
  TrendingUp,
  Receipt,
  User
} from 'lucide-react'

export default function DashboardLayout({ children, user, onLogout, activeView = 'resumo', onViewChange }) {
  const menuItems = [
    { id: 'resumo', label: 'Resumo', icon: LayoutDashboard },
    { id: 'history', label: 'Minhas Compras', icon: ShoppingCart },
    { id: 'bills', label: 'Contas Fixas', icon: Receipt },
    { id: 'stats', label: 'Estatísticas', icon: BarChart3 },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ]

  return (
    <div className="flex min-h-screen bg-[#020617] font-['Inter']">
      {/* Sidebar */}
      <aside className="w-72 border-r border-white/5 bg-[#020617] flex flex-col fixed h-full z-20">
        <div className="p-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-gradient-to-tr from-primary to-shared rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <TrendingUp className="text-black w-6 h-6" strokeWidth={3} />
            </div>
            <span className="text-xl font-black text-white tracking-tighter uppercase">CashFlow</span>
          </motion.div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange?.(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group relative overflow-hidden ${
                activeView === item.id 
                  ? "bg-primary text-black font-black shadow-lg shadow-primary/10" 
                  : "text-white/40 hover:text-white hover:bg-white/5 font-bold"
              }`}
            >
              <item.icon size={22} strokeWidth={activeView === item.id ? 2.5 : 2} />
              <span className="text-sm tracking-tight">{item.label}</span>
              {activeView === item.id && (
                <motion.div 
                  layoutId="activeGlow"
                  className="absolute inset-0 bg-white/20 blur-xl rounded-full"
                />
              )}
            </button>
          ))}
        </nav>

        <div className="p-8">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-red-400/60 hover:text-red-400 hover:bg-red-400/5 transition-all font-bold group"
          >
            <LogOut size={22} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm tracking-tight uppercase tracking-widest text-[10px]">Sair da Conta</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72">
        <header className="h-24 border-b border-white/5 flex items-center justify-between px-10 bg-[#020617]/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl w-96 group focus-within:border-primary/40 transition-all">
            <Search size={18} className="text-white/20 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Pesquisar compras ou relatórios..." 
              className="bg-transparent border-none text-sm text-white placeholder:text-white/20 focus:outline-none w-full font-medium"
            />
          </div>

          <div className="flex items-center gap-8">
            <button className="relative text-white/40 hover:text-white transition-colors">
              <Bell size={22} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full border-2 border-[#020617]" />
            </button>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-white leading-none mb-1">{user?.email}</p>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Premium Plan</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-shared/20 border border-white/10 rounded-xl flex items-center justify-center">
                <User size={20} className="text-white/40" />
              </div>
            </div>
          </div>
        </header>

        <div className="p-10">
          {children}
        </div>
      </main>
    </div>
  )
}
