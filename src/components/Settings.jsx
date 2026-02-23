import React from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Shield, 
  Palette, 
  Globe,
  Bell,
  CheckCircle2
} from 'lucide-react'

export default function Settings({ user }) {
  const [activeTab, setActiveTab] = React.useState('profile')

  const tabs = [
    { id: 'profile', label: 'Meu Perfil', icon: User },
    { id: 'app', label: 'Preferências', icon: Palette },
    { id: 'security', label: 'Segurança', icon: Shield },
  ]

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-10"
    >
      <div>
        <h2 className="text-3xl font-black text-white mb-2">Configurações</h2>
        <p className="text-white/40 font-medium tracking-tight">Gerencie sua conta e preferências do sistema.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Settings Navigation */}
        <div className="lg:w-72 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold ${
                activeTab === tab.id 
                  ? 'bg-primary text-black shadow-lg shadow-primary/20' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon size={20} />
              <span className="text-sm tracking-tight">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 glass-pro p-10 rounded-[2.5rem] border border-white/5">
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div className="flex items-center gap-6 pb-8 border-b border-white/5">
                <div className="w-24 h-24 bg-gradient-to-tr from-primary to-shared rounded-3xl flex items-center justify-center shadow-xl shadow-primary/10">
                  <User size={40} className="text-black" />
                </div>
                <div>
                   <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-2xl font-black text-white">Prêmio Usuário</h3>
                    <span className="bg-primary/20 text-primary text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-primary/20">Ativo</span>
                   </div>
                  <p className="text-white/40 font-bold flex items-center gap-2 tracking-tight">
                    <Mail size={14} /> {user?.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase ml-4 tracking-[0.2em]">ID da Conta</label>
                  <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-mono text-xs text-white/60">
                    {user?.id}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase ml-4 tracking-[0.2em]">Data de Cadastro</label>
                  <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-mono text-xs text-white/60">
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : "—"}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'app' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
               <h3 className="text-xl font-black text-white mb-6">Personalização</h3>
               
               <div className="space-y-6">
                 <div className="flex items-center justify-between p-6 glass rounded-2xl border border-white/5">
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-shared/20 rounded-xl flex items-center justify-center"><Globe size={20} className="text-shared" /></div>
                     <div>
                       <p className="font-black text-white text-sm">Idioma do Sistema</p>
                       <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Português (Brasil)</p>
                     </div>
                   </div>
                   <button className="text-white/20 hover:text-white font-black text-xs uppercase underline">Alterar</button>
                 </div>

                 <div className="flex items-center justify-between p-6 glass rounded-2xl border border-white/5">
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center"><Bell size={20} className="text-primary" /></div>
                     <div>
                       <p className="font-black text-white text-sm">Notificações Push</p>
                       <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Habilitado</p>
                     </div>
                   </div>
                   <div className="w-12 h-6 bg-primary/20 rounded-full relative p-1">
                     <div className="w-4 h-4 bg-primary rounded-full shadow-md ml-auto" />
                   </div>
                 </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div className="bg-primary/5 border border-primary/20 p-8 rounded-3xl flex items-center gap-6">
                <CheckCircle2 size={40} className="text-primary" />
                <div>
                  <h4 className="text-lg font-black text-white">Sua conta está protegida</h4>
                  <p className="text-sm text-white/40 font-medium">Todas as suas sessões e itens são isolados por RLS (Row Level Security).</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
