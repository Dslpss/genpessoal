import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Receipt, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Calendar,
  Users,
  DollarSign,
  AlertCircle
} from 'lucide-react'

export default function FixedBills({ bills, onCreateBill, onUpdateBill, onDeleteBill }) {
  const [isAdding, setIsAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDay, setDueDay] = useState('10')
  const [splitCount, setSplitCount] = useState('2')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title || !amount) return
    
    const now = new Date()
    const monthYear = `${now.getMonth() + 1}/${now.getFullYear()}`
    
    onCreateBill({
      title,
      amount: parseFloat(amount.replace(',', '.')),
      due_day: parseInt(dueDay),
      split_count: parseInt(splitCount),
      month_year: monthYear,
      is_paid: false
    })
    
    setTitle('')
    setAmount('')
    setIsAdding(false)
  }

  const sortedBills = [...bills].sort((a, b) => a.due_day - b.due_day)
  const totalUnpaid = bills.filter(b => !b.is_paid).reduce((acc, b) => acc + (Number(b.amount) || 0), 0)
  const myPartUnpaid = bills.filter(b => !b.is_paid).reduce((acc, b) => acc + ((Number(b.amount) || 0) / (b.split_count || 2)), 0)

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white mb-2">Contas Fixas</h2>
          <p className="text-white/40 font-medium tracking-tight">Gerencie aluguel, luz, internet e outras despesas mensais.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-primary hover:bg-primary/90 text-black font-black px-8 py-4 rounded-2xl flex items-center gap-3 transition-all shadow-lg shadow-primary/20 active:scale-95"
        >
          {isAdding ? "Cancelar" : <><Plus size={20} /> Nova Conta</>}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="glass-pro p-8 rounded-[2.5rem] border border-white/5 grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/30 uppercase ml-4 tracking-widest">Descrição</label>
                <input 
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Aluguel, Wifi..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/30 uppercase ml-4 tracking-widest">Valor (R$)</label>
                <input 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0,00"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 col-span-1">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase ml-2 tracking-widest">Vencimento</label>
                  <input 
                    type="number"
                    value={dueDay}
                    onChange={(e) => setDueDay(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-center text-white font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase ml-2 tracking-widest">Divisão</label>
                  <input 
                    type="number"
                    value={splitCount}
                    onChange={(e) => setSplitCount(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-center text-white font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-primary transition-all active:scale-95">
                Salvar Conta
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {sortedBills.length === 0 ? (
             <div className="py-20 text-center glass rounded-[2.5rem] border border-white/5">
                <Receipt className="w-16 h-16 text-white/5 mx-auto mb-4" />
                <p className="text-white/20 font-bold">Nenhuma conta fixa cadastrada para este mês.</p>
             </div>
          ) : (
            sortedBills.map((bill) => (
              <motion.div
                layout
                key={bill.id}
                className={`glass p-6 rounded-[2rem] border transition-all flex items-center justify-between group ${
                  bill.is_paid ? 'border-primary/20 bg-primary/5' : 'border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => onUpdateBill(bill.id, { is_paid: !bill.is_paid })}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                      bill.is_paid ? 'bg-primary text-black' : 'bg-white/5 text-white/20 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {bill.is_paid ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                  </button>
                  <div>
                    <h3 className={`font-black text-xl transition-all ${bill.is_paid ? 'text-white/40 line-through' : 'text-white'}`}>
                      {bill.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-[10px] font-black text-white/20 uppercase tracking-widest flex items-center gap-1.5">
                        <Calendar size={12} /> Dia {bill.due_day}
                      </span>
                      <span className="text-[10px] font-black text-white/20 uppercase tracking-widest flex items-center gap-1.5">
                        <Users size={12} /> {bill.split_count} pessoas
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className={`text-2xl font-black font-mono transition-all ${bill.is_paid ? 'text-white/20' : 'text-white'}`}>
                      R$ {Number(bill.amount).toFixed(2).replace('.', ',')}
                    </p>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">
                      Sua parte: R$ {(Number(bill.amount) / (bill.split_count || 2)).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteBill(bill.id);
                    }}
                    className="p-3 text-white/5 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="space-y-6">
          <div className="glass-pro p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-700">
              <AlertCircle size={80} />
            </div>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">Total Pendente (Casa)</p>
            <h4 className="text-5xl font-black text-white tracking-tighter mb-2">
              R$ {totalUnpaid.toFixed(2).replace('.', ',')}
            </h4>
            <div className="flex items-center gap-2 bg-red-500/10 text-red-500 px-3 py-1 rounded-full w-fit">
              <span className="text-[10px] font-black uppercase tracking-widest">Em Aberto</span>
            </div>
          </div>

          <div className="glass-pro p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-700">
              <DollarSign size={80} />
            </div>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">Minha Parte Pendente</p>
            <h4 className="text-5xl font-black text-primary tracking-tighter mb-2">
              R$ {myPartUnpaid.toFixed(2).replace('.', ',')}
            </h4>
            <p className="text-white/20 text-xs font-bold italic">Considerando a divisão de cada conta.</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
