import React from "react";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Trash2,
  Calendar,
  Users,
  Search,
  ShoppingCart,
  CheckCircle,
} from "lucide-react";

export default function PurchasesHistory({
  sessions,
  onSelectSession,
  onDeleteSession,
}) {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white mb-2">
            Minhas Compras
          </h2>
          <p className="text-white/40 font-medium tracking-tight">
            Histórico completo de todas as suas sessões de mercado.
          </p>
        </div>

        <div className="relative group">
          <Search
            size={18}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors"
          />
          <input
            type="text"
            placeholder="Buscar por título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSessions.length === 0 ? (
          <div className="col-span-full py-20 text-center glass rounded-[2.5rem] border border-white/5">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-10 h-10 text-white/10" />
            </div>
            <p className="text-white/20 italic font-bold text-lg">
              Nenhuma compra encontrada.
            </p>
          </div>
        ) : (
          filteredSessions.map((session) => (
            <motion.div
              layout
              key={session.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass p-6 rounded-[2rem] border border-white/5 relative group hover:border-primary/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-primary/10 p-3 rounded-xl">
                    <Calendar className="text-primary" size={20} />
                  </div>
                  <div className="flex items-center gap-3">
                    {session.is_finalized && (
                      <div className="px-3 py-1 bg-red-600/10 text-red-300 rounded-full text-xs font-black flex items-center gap-2">
                        <CheckCircle size={14} />
                        Finalizada
                      </div>
                    )}
                    <button
                      onClick={() => onDeleteSession(session.id)}
                      className="p-2 text-white/10 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-black text-white mb-1 group-hover:text-primary transition-colors">
                  {session.title}
                </h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-6">
                  {new Date(session.created_at).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>

                <div className="space-y-3 mb-8">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/30 font-bold uppercase tracking-wider">
                      Total
                    </span>
                    <span className="text-white font-mono font-black">
                      R${" "}
                      {(
                        (Number(session.total_shared_cost) || 0) +
                        (Number(session.total_personal_cost) || 0)
                      )
                        .toFixed(2)
                        .replace(".", ",")}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/30 font-bold uppercase tracking-wider">
                      Dividores
                    </span>
                    <span className="text-white font-bold flex items-center gap-1">
                      <Users size={12} /> {session.split_count} pessoas
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onSelectSession(session)}
                className="w-full bg-white/5 hover:bg-primary text-white hover:text-black font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 group/btn">
                Ver Detalhes{" "}
                <ChevronRight
                  size={16}
                  className="group-hover/btn:translate-x-1 transition-transform"
                />
              </button>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
