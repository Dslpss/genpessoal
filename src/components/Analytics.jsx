import React from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  Wallet, 
  Users,
  Calendar,
  ArrowUpRight,
  TrendingDown,
  ShoppingCart,
  Receipt
} from 'lucide-react'

export default function Analytics({ sessions, fixedBills = [] }) {
  const shopTotals = sessions.reduce((acc, s) => {
    acc.shared += Number(s.total_shared_cost) || 0
    acc.personal += Number(s.total_personal_cost) || 0
    return acc
  }, { shared: 0, personal: 0 })

  const billTotals = fixedBills.reduce((acc, b) => {
    acc.total += Number(b.amount) || 0
    acc.myPart += (Number(b.amount) || 0) / (b.split_count || 2)
    return acc
  }, { total: 0, myPart: 0 })

  const totalMarket = shopTotals.shared + shopTotals.personal
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-10"
    >
      <div>
        <h2 className="text-3xl font-black text-white mb-2 text-glow">Estatísticas</h2>
        <p className="text-white/40 font-medium tracking-tight">Análise visual da sua saúde financeira em grupo.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Market Spending Card */}
        <div className="glass-pro p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden h-full">
          <div className="absolute top-0 right-0 p-8 opacity-5"><ShoppingCart size={100} /></div>
          <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
            <ShoppingCart className="text-primary" /> Gastos de Mercado
          </h3>

          <div className="space-y-8">
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Total Acumulado</span>
                <span className="text-2xl font-black text-white font-mono">R$ {totalMarket.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  className="h-full bg-primary"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] font-black text-white/20 uppercase mb-1">Compartilhado</p>
                <p className="text-xl font-black text-white">R$ {shopTotals.shared.toFixed(2).replace('.', ',')}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] font-black text-white/20 uppercase mb-1">Pessoal</p>
                <p className="text-xl font-black text-white">R$ {shopTotals.personal.toFixed(2).replace('.', ',')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Bills Card */}
        <div className="glass-pro p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden h-full">
          <div className="absolute top-0 right-0 p-8 opacity-5"><Receipt size={100} /></div>
          <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
            <Receipt className="text-shared" /> Contas da Casa
          </h3>

          <div className="space-y-8">
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Comprometimento Mensal</span>
                <span className="text-2xl font-black text-white font-mono">R$ {billTotals.total.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  className="h-full bg-shared"
                />
              </div>
            </div>

            <div className="p-4 bg-shared/10 rounded-2xl border border-shared/20">
              <p className="text-[10px] font-black text-shared uppercase mb-1 tracking-widest">Sua Cota Total nas Contas</p>
              <p className="text-3xl font-black text-white">R$ {billTotals.myPart.toFixed(2).replace('.', ',')}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
