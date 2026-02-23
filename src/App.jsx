import React, { useState, useEffect, useMemo } from "react";
import { db } from "./lib/db";
import { supabase } from "./lib/supabase";
import Login from "./components/Login";
import DashboardLayout from "./components/DashboardLayout";
import PurchasesHistory from "./components/PurchasesHistory";
import Analytics from "./components/Analytics";
import Settings from "./components/Settings";
import FixedBills from "./components/FixedBills";
import {
  Plus,
  Trash2,
  ShoppingCart,
  User,
  Users,
  Calculator,
  ArrowRight,
  Loader2,
  Database,
  History,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  Receipt,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const CURRENT_DATE = new Date();
const MONTH_LABEL = CURRENT_DATE.toLocaleDateString("pt-BR", {
  month: "long",
  year: "numeric",
});
const CURRENT_MONTH_INDEX = CURRENT_DATE.getMonth();
const CURRENT_YEAR = CURRENT_DATE.getFullYear();

export default function App() {
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbMissing, setDbMissing] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [isPersonal, setIsPersonal] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState("");
  const [newSessionSplitCount, setNewSessionSplitCount] = useState("2");
  const [activeView, setActiveView] = useState("resumo");
  const [fixedBills, setFixedBills] = useState([]);

  useEffect(() => {
    const initAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (!session?.user) setLoading(false); // If no user, stop loading immediately

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) setLoading(false);
      });

      return () => subscription.unsubscribe();
    };

    initAuth();
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        await fetchSessions();
        await fetchFixedBills();
      } catch (error) {
        console.error("Erro no carregamento inicial:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [user]);

  useEffect(() => {
    if (currentSession) {
      fetchItems(currentSession.id);
    }
  }, [currentSession]);

  const fetchSessions = async () => {
    try {
      const data = await db.sessions.list();
      setSessions(data);
      // Recalcula e persiste totais caso estejam zerados (corrige sumiço após reload)
      try {
        const toFix = (data || []).filter(
          (s) =>
            (Number(s.total_shared_cost) || 0) === 0 &&
            (Number(s.total_personal_cost) || 0) === 0,
        );
        if (toFix.length > 0) {
          await Promise.all(
            toFix.map(async (s) => {
              try {
                const items = await db.items.list(s.id);
                const shared = (items || [])
                  .filter((i) => !i.is_personal)
                  .reduce(
                    (acc, i) =>
                      acc + Number(i.price) * (Number(i.quantity) || 1),
                    0,
                  );
                const personal = (items || [])
                  .filter((i) => i.is_personal)
                  .reduce(
                    (acc, i) =>
                      acc + Number(i.price) * (Number(i.quantity) || 1),
                    0,
                  );
                await db.sessions
                  .updateTotals(s.id, shared, personal)
                  .catch(() => {});
                setSessions((prev) =>
                  prev.map((ps) =>
                    ps.id === s.id
                      ? {
                          ...ps,
                          total_shared_cost: shared,
                          total_personal_cost: personal,
                        }
                      : ps,
                  ),
                );
              } catch (err) {
                console.error(
                  "Erro ao recalcular totais para sessão",
                  s.id,
                  err,
                );
              }
            }),
          );
        }
      } catch (err) {
        console.error("Erro durante verificação de totais pós-fetch:", err);
      }
      return data;
    } catch (error) {
      if (error.code === "PGRST205" || error.message?.includes("not found")) {
        setDbMissing(true);
      }
      throw error;
    }
  };

  const fetchItems = async (sessionId) => {
    try {
      const data = await db.items.list(sessionId);
      setItems(data);
      return data;
    } catch (error) {
      console.error("Erro ao criar sessão:", error);
      const msg =
        (error && error.message) ||
        (error && error.error && error.error.message) ||
        JSON.stringify(error);
      alert("Não foi possível criar a sessão: " + msg);
    }
  };

  const fetchFixedBills = async () => {
    const now = new Date();
    const monthYear = `${now.getMonth() + 1}/${now.getFullYear()}`;
    const data = await db.fixedBills.list(monthYear);
    setFixedBills(data);
    return data;
  };

  const handleCreateFixedBill = async (billData) => {
    try {
      const bill = await db.fixedBills.create(billData);
      setFixedBills([bill, ...fixedBills]);
    } catch (error) {
      console.error("Erro ao criar conta:", error);
      alert("Erro ao criar conta: " + error.message);
    }
  };

  const handleUpdateFixedBill = async (id, updates) => {
    try {
      const updated = await db.fixedBills.update(id, updates);
      setFixedBills(fixedBills.map((b) => (b.id === id ? updated : b)));
    } catch (error) {
      console.error("Erro ao atualizar conta:", error);
      alert("Erro ao atualizar conta: " + error.message);
    }
  };

  const handleDeleteFixedBill = async (id) => {
    if (!confirm("Excluir esta conta?")) return;
    try {
      await db.fixedBills.delete(id);
      setFixedBills((prev) => prev.filter((b) => b.id !== id));
    } catch (error) {
      console.error("Erro ao excluir conta:", error);
      alert("Erro ao excluir conta: " + error.message);
    }
  };

  const handleLogin = async (userData) => {
    setUser(userData);
    setLoading(true);
    try {
      const sess = await fetchSessions();
      await fetchFixedBills();
      if (sess && sess.length > 0) {
        // Não abrir a sessão: apenas calcular os totais da primeira sessão e atualizar localmente
        const first = sess[0];
        const itemsData = await db.items.list(first.id);
        const shared = (itemsData || [])
          .filter((i) => !i.is_personal)
          .reduce(
            (acc, i) => acc + Number(i.price) * (Number(i.quantity) || 1),
            0,
          );
        const personal = (itemsData || [])
          .filter((i) => i.is_personal)
          .reduce(
            (acc, i) => acc + Number(i.price) * (Number(i.quantity) || 1),
            0,
          );
        setSessions((prev) =>
          prev.map((s) =>
            s.id === first.id
              ? {
                  ...s,
                  total_shared_cost: shared,
                  total_personal_cost: personal,
                }
              : s,
          ),
        );
      }
    } catch (err) {
      console.error("Erro ao buscar dados após login:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (id) => {
    if (
      !confirm(
        "Deseja realmente excluir esta sessão? Todos os itens serão perdidos.",
      )
    )
      return;
    try {
      await db.sessions.delete(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Erro ao excluir sessão:", err);
      alert("Erro ao excluir sessão. Tente novamente.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSessions([]);
    setCurrentSession(null);
    setItems([]);
    setFixedBills([]);
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    console.log("handleCreateSession called", {
      title: newSessionTitle,
      split: newSessionSplitCount,
    });
    if (!newSessionTitle.trim()) {
      alert("Digite um título para a sessão antes de criar.");
      return;
    }
    try {
      const splitCount = parseInt(newSessionSplitCount) || 2;
      const session = await db.sessions.create(newSessionTitle, splitCount);
      setSessions([session, ...sessions]);
      setCurrentSession(session);
      setNewSessionTitle("");
      setNewSessionSplitCount("2");
    } catch (error) {
      console.error("Erro ao criar sessão:", error);
      const msg =
        (error && error.message) ||
        (error && error.error && error.error.message) ||
        JSON.stringify(error);
      alert("Não foi possível criar a sessão: " + msg);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!name.trim() || !price || !currentSession) return;
    try {
      const item = await db.items.add({
        session_id: currentSession.id,
        name,
        price: parseFloat(price.replace(",", ".")),
        quantity: parseInt(quantity) || 1,
        is_personal: isPersonal,
      });
      setItems([...items, item]);
      setName("");
      setPrice("");
      setQuantity("1");
      setIsPersonal(false);
    } catch (error) {
      console.error("Erro ao adicionar item:", error);
      alert("Erro ao adicionar item. Tente novamente.");
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await db.items.delete(id);
      setItems(items.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Erro ao excluir item:", error);
      alert("Erro ao excluir item. Tente novamente.");
    }
  };

  const handleFinalizeSession = async (id) => {
    if (
      !confirm(
        "Finalizar sessão? Isso marcará a sessão como encerrada (não abrirá mais como ativa).",
      )
    )
      return;
    try {
      // atualizar localmente
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, is_finalized: true } : s)),
      );
      if (currentSession?.id === id) setCurrentSession(null);
      // tentar persistir no banco (se a coluna existir)
      try {
        await db.sessions.update(id, { is_finalized: true });
      } catch (err) {
        // falhar silenciosamente se DB não suportar a coluna
        console.warn(
          "Não foi possível persistir is_finalized no DB:",
          err.message || err,
        );
      }
    } catch (err) {
      console.error("Erro ao finalizar sessão:", err);
      alert("Erro ao finalizar sessão. Veja o console.");
    }
  };

  const handleExportPdf = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const calculateTotals = () => {
    const shared = items
      .filter((i) => !i.is_personal)
      .reduce((acc, i) => acc + Number(i.price) * (Number(i.quantity) || 1), 0);
    const personal = items
      .filter((i) => i.is_personal)
      .reduce((acc, i) => acc + Number(i.price) * (Number(i.quantity) || 1), 0);
    const splitCount = currentSession?.split_count || 2;
    return {
      shared,
      personal,
      friendShare: shared / splitCount,
      userTotal: shared / splitCount + personal,
      splitCount,
    };
  };

  const totals = calculateTotals();

  // Real-time Global Stats
  const globalStats = useMemo(() => {
    // Only consider open (not finalized) sessions for global stats
    const openSessions = (sessions || []).filter((s) => !s.is_finalized);
    const shopping = openSessions.reduce(
      (acc, s) => {
        const isCurrent =
          currentSession &&
          !currentSession.is_finalized &&
          s.id === currentSession.id;
        const shared = isCurrent
          ? totals.shared
          : Number(s.total_shared_cost) || 0;
        const personal = isCurrent
          ? totals.personal
          : Number(s.total_personal_cost) || 0;
        const split = s.split_count || 2;

        acc.totalShared += shared;
        acc.totalPersonal += personal;
        acc.totalGained += shared - shared / split;
        return acc;
      },
      { totalShared: 0, totalPersonal: 0, totalGained: 0 },
    );

    const bills = fixedBills.reduce(
      (acc, b) => {
        if (!b.is_paid) {
          acc.unpaidTotal += Number(b.amount) || 0;
          acc.unpaidUserPart += (Number(b.amount) || 0) / (b.split_count || 2);
        }
        return acc;
      },
      { unpaidTotal: 0, unpaidUserPart: 0 },
    );

    return { ...shopping, ...bills };
  }, [sessions, currentSession, totals.shared, totals.personal, fixedBills]);

  // Sync totals to DB
  useEffect(() => {
    if (currentSession && items.length >= 0) {
      const timer = setTimeout(() => {
        db.sessions
          .updateTotals(currentSession.id, totals.shared, totals.personal)
          .then(() => {
            // Update local sessions list so globalStats stays in sync even when currentSession is closed
            setSessions((prev) =>
              prev.map((s) =>
                s.id === currentSession.id
                  ? {
                      ...s,
                      total_shared_cost: totals.shared,
                      total_personal_cost: totals.personal,
                    }
                  : s,
              ),
            );
          })
          .catch(console.error);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [items, currentSession, totals.shared, totals.personal]);

  if (loading)
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );

  if (!user) return <Login onLogin={handleLogin} />;

  if (dbMissing)
    return (
      <div className="min-h-screen bg-bg-dark p-8 flex items-center justify-center">
        <div className="glass-pro p-10 rounded-[2.5rem] max-w-lg text-center border border-red-500/20">
          <Database className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h1 className="text-2xl font-black text-white mb-4">
            Banco de dados não configurado
          </h1>
          <p className="text-white/40 mb-8 font-medium">
            Você precisa configurar o Supabase. Verifique o arquivo{" "}
            <strong className="text-white">walkthrough.md</strong> para as
            instruções SQL.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-white/10 hover:bg-white/20 text-white font-black px-10 py-4 rounded-2xl transition-all">
            Tentar Novamente
          </button>
        </div>
      </div>
    );

  const renderContent = () => {
    if (currentSession) {
      return (
        <motion.div
          key="purchase-detail"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentSession(null)}
              className="text-white/40 hover:text-white flex items-center gap-2 font-bold text-sm tracking-tight group">
              <span className="group-hover:-translate-x-1 transition-transform">
                ←
              </span>{" "}
              Painel de Controle
            </button>
            <div className="bg-primary/10 px-4 py-2 rounded-xl border border-primary/20 flex flex-col items-end">
              <p className="text-[10px] font-black text-primary uppercase tracking-widest">
                Sessão Ativa ({currentSession.split_count} Pessoas)
              </p>
              <p className="text-xs font-bold text-white tracking-tight">
                {currentSession.title}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {!currentSession?.is_finalized && (
                <button
                  onClick={() => handleFinalizeSession(currentSession.id)}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-2xl">
                  Finalizar Sessão
                </button>
              )}
              <button
                type="button"
                onClick={handleExportPdf}
                className="bg-white hover:bg-primary text-black font-bold px-4 py-2 rounded-2xl border border-white/20 transition-all">
                Exportar PDF
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
            <div className="xl:col-span-8 space-y-8">
              {/* Add Item Form */}
              <div className="glass-pro p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <ShoppingCart size={80} />
                </div>
                <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                  <ShoppingCart size={24} className="text-primary" /> Adicionar
                  ao Carrinho
                </h2>
                <form onSubmit={handleAddItem} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2 md:col-span-1">
                      <label className="text-[10px] font-black text-white/30 uppercase ml-4 tracking-[0.2em]">
                        Produto
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Arroz, Feijão..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/30 uppercase ml-4 tracking-[0.2em]">
                        Qtd
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="1"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-bold text-center"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/30 uppercase ml-4 tracking-[0.2em]">
                        Valor Un. (R$)
                      </label>
                      <input
                        type="text"
                        required
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0,00"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-mono text-lg font-bold"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <button
                      type="button"
                      onClick={() => setIsPersonal(!isPersonal)}
                      className={cn(
                        "w-full sm:w-auto h-16 px-8 rounded-2xl transition-all font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4 border select-none",
                        isPersonal
                          ? "bg-personal/10 text-personal border-personal/30 shadow-lg shadow-personal/10"
                          : "bg-shared/10 text-shared border-shared/30 shadow-lg shadow-shared/10",
                      )}>
                      <div
                        className={cn(
                          "w-12 h-7 bg-black/40 rounded-full relative p-1 transition-colors",
                          isPersonal ? "bg-personal/40" : "bg-shared/40",
                        )}>
                        <motion.div
                          animate={{ x: isPersonal ? 20 : 0 }}
                          className="w-5 h-5 bg-white rounded-full shadow-md"
                        />
                      </div>
                      {isPersonal ? "Uso Pessoal" : "Compartilhar"}
                    </button>
                    <button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-black font-black px-12 h-16 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] text-lg">
                      Adicionar
                    </button>
                  </div>
                </form>
              </div>

              {/* Items List */}
              <div className="glass rounded-4xl border border-white/5 overflow-hidden shadow-2xl backdrop-blur-3xl">
                <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/2">
                  <h3 className="font-black text-white flex items-center gap-3 tracking-tight">
                    <span className="w-3 h-3 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    ITENS DA COMPRA
                  </h3>
                  <div className="px-4 py-1 bg-white/5 rounded-full">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                      {items.length} PRODUTOS
                    </span>
                  </div>
                </div>
                <div className="max-h-125 overflow-y-auto custom-scrollbar">
                  <AnimatePresence initial={false}>
                    {items.length === 0 ? (
                      <div className="p-20 text-center space-y-6">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                          <ShoppingCart className="w-10 h-10 text-white/10" />
                        </div>
                        <p className="text-white/20 italic font-bold tracking-tight text-lg">
                          Seu carrinho está aguardando o primeiro item...
                        </p>
                      </div>
                    ) : (
                      items.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="flex items-center justify-between px-8 py-6 border-b border-white/5 last:border-0 hover:bg-white/2 transition-all group">
                          <div className="flex items-center gap-5">
                            <div
                              className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all border",
                                item.is_personal
                                  ? "bg-personal/10 text-personal border-personal/20"
                                  : "bg-shared/10 text-shared border-shared/20",
                              )}>
                              {item.is_personal ? (
                                <User size={20} />
                              ) : (
                                <Users size={20} />
                              )}
                            </div>
                            <div>
                              <p className="font-black text-white text-lg tracking-tight group-hover:text-primary transition-colors">
                                {item.name}
                                {Number(item.quantity) > 1 && (
                                  <span className="text-white/20 ml-2 text-sm font-bold">
                                    x{item.quantity}
                                  </span>
                                )}
                              </p>
                              <p
                                className={cn(
                                  "text-[10px] font-black uppercase tracking-[0.15em]",
                                  item.is_personal
                                    ? "text-personal/60"
                                    : "text-shared/60",
                                )}>
                                {item.is_personal
                                  ? "Item Pessoal"
                                  : "Item do Grupo"}
                                {Number(item.quantity) > 1 &&
                                  ` • R$ ${Number(item.price).toFixed(2).replace(".", ",")} cada`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-8">
                            <span className="font-mono font-black text-xl text-white/90">
                              R${" "}
                              {(
                                Number(item.price) *
                                (Number(item.quantity) || 1)
                              )
                                .toFixed(2)
                                .replace(".", ",")}
                            </span>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-white/10 hover:text-red-500 transition-all p-3 hover:bg-red-500/10 rounded-xl">
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Sidebar Stats */}
            <div className="xl:col-span-4 lg:sticky lg:top-8 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}>
                <div className="glass-pro p-10 rounded-[2.5rem] border border-white/5 relative overflow-hidden shadow-3xl">
                  <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                    <Calculator size={100} />
                  </div>
                  <h2 className="text-2xl font-black mb-10 flex items-center gap-3 text-white">
                    <Calculator size={24} className="text-primary" /> Fechamento
                  </h2>

                  <div className="space-y-8">
                    <div className="flex justify-between items-center group">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-shared rounded-full" />
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                          Compartilhado
                        </span>
                      </div>
                      <span className="font-mono text-xl font-black text-white tracking-tighter">
                        R$ {totals.shared.toFixed(2).replace(".", ",")}
                      </span>
                    </div>

                    <div className="flex justify-between items-center group">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-personal rounded-full" />
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                          Seu Pessoal
                        </span>
                      </div>
                      <span className="font-mono text-xl font-black text-white tracking-tighter">
                        R$ {totals.personal.toFixed(2).replace(".", ",")}
                      </span>
                    </div>

                    <div className="h-px bg-white/5 my-4" />

                    <div className="space-y-6">
                      <div className="bg-primary/10 p-8 rounded-4xl border border-primary/20 relative group overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                          <Users size={60} />
                        </div>
                        <p className="text-[10px] text-primary font-black uppercase tracking-[0.3em] mb-2">
                          Parte de cada Amigo ({totals.splitCount - 1})
                        </p>
                        <p className="text-5xl font-black text-white font-mono tracking-tighter">
                          R$ {totals.friendShare.toFixed(2).replace(".", ",")}
                        </p>
                      </div>

                      <div className="bg-white/5 p-8 rounded-4xl border border-white/5 relative group overflow-hidden">
                        <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em] mb-2">
                          Seu Investimento
                        </p>
                        <p className="text-3xl font-black text-white/80 font-mono tracking-tighter">
                          R$ {totals.userTotal.toFixed(2).replace(".", ",")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="glass p-6 rounded-3xl border border-white/10 text-[11px] font-bold text-white/30 italic leading-relaxed text-center">
                A divisão de mercado profissional garante que cada centavo seja
                contabilizado. Itens pessoais não entram na conta do colega.
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    switch (activeView) {
      case "resumo":
        return (
          <motion.div
            key="dashboard-home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black text-white mb-1">
                  Resumo do Mês
                </h2>
                <p className="text-white/40 text-sm font-medium">
                  {MONTH_LABEL}
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportPdf}
                className="bg-white hover:bg-primary text-black font-bold px-4 py-2 rounded-2xl border border-white/20 transition-all">
                Exportar PDF do mês
              </button>
            </div>

            {/* Real Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  label: "Gasto Compartilhado",
                  value: `R$ ${globalStats.totalShared.toFixed(2).replace(".", ",")}`,
                  icon: Users,
                  color: "text-shared",
                  bg: "bg-shared/10",
                  desc: "Total acumulado em todas as sessões",
                },
                {
                  label: "Minha Parte Total",
                  value: `R$ ${(globalStats.totalPersonal + (globalStats.totalShared - globalStats.totalGained)).toFixed(2).replace(".", ",")}`,
                  icon: Wallet,
                  color: "text-primary",
                  bg: "bg-primary/10",
                  desc: "Pessoal + minha parte no compartilhado",
                },
                {
                  label: "A Receber / Outros",
                  value: `R$ ${globalStats.totalGained.toFixed(2).replace(".", ",")}`,
                  icon: TrendingUp,
                  color: "text-personal",
                  bg: "bg-personal/10",
                  desc: "Total que os outros participantes devem",
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="glass p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
                  <div
                    className={cn(
                      "absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity",
                      stat.color,
                    )}>
                    <stat.icon size={48} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">
                    {stat.label}
                  </p>
                  <h3 className="text-2xl font-black text-white">
                    {stat.value}
                  </h3>
                  <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-white/20 italic">
                    {stat.desc}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Action & Recent Purchases */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-10">
                <div className="glass-pro p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Plus size={120} />
                  </div>
                  <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                    <Plus className="text-primary bg-primary/10 p-1 rounded-lg" />{" "}
                    Iniciar Compra
                  </h2>
                  <form onSubmit={handleCreateSession} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="sm:col-span-3">
                        <input
                          type="text"
                          value={newSessionTitle}
                          onChange={(e) => setNewSessionTitle(e.target.value)}
                          placeholder="Ex: Mercado Atacadão - Setor Sul"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white/10 transition-all text-lg font-medium"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          min="1"
                          value={newSessionSplitCount}
                          onChange={(e) =>
                            setNewSessionSplitCount(e.target.value)
                          }
                          placeholder="Pessoas"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white/10 transition-all text-lg font-bold text-center"
                          title="Quantidade de pessoas para dividir"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-black font-black py-5 rounded-2xl shadow-xl shadow-primary/10 transition-all flex items-center justify-center gap-3 text-lg">
                      Criar Sessão <ArrowRight size={20} strokeWidth={3} />
                    </button>
                  </form>
                </div>

                {/* Fixed Bills Summary for Dashboard */}
                <div className="glass-pro p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
                      <Receipt size={14} /> Contas Pendentes
                    </h3>
                    <button
                      onClick={() => setActiveView("bills")}
                      className="text-[10px] font-black text-primary uppercase hover:underline">
                      Ver Tudo
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-black text-white/20 uppercase mb-1">
                        Total Casa
                      </p>
                      <p className="text-xl font-black text-white">
                        R${" "}
                        {(globalStats.unpaidTotal || 0)
                          .toFixed(2)
                          .replace(".", ",")}
                      </p>
                    </div>
                    <div className="p-5 bg-primary/10 rounded-2xl border border-primary/20">
                      <p className="text-[10px] font-black text-primary uppercase mb-1">
                        Minha Parte
                      </p>
                      <p className="text-xl font-black text-white">
                        R${" "}
                        {(globalStats.unpaidUserPart || 0)
                          .toFixed(2)
                          .replace(".", ",")}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {fixedBills
                      .filter((b) => !b.is_paid)
                      .slice(0, 3)
                      .map((bill) => (
                        <div
                          key={bill.id}
                          className="flex items-center justify-between p-4 glass rounded-xl border border-white/5 text-sm">
                          <span className="font-bold text-white/70">
                            {bill.title}
                          </span>
                          <span className="font-mono font-black text-white/40">
                            Dia {bill.due_day}
                          </span>
                        </div>
                      ))}
                    {fixedBills.filter((b) => !b.is_paid).length === 0 && (
                      <p className="text-center py-4 text-white/10 italic text-xs">
                        Tudo pago por aqui! 🎉
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
                    <History size={14} /> Histórico Recente
                  </h3>
                </div>
                <div className="space-y-4">
                  {sessions.length === 0 ? (
                    <div className="p-12 text-center glass rounded-3xl text-white/20 italic border border-white/5 font-medium">
                      Nenhuma compra registrada.
                    </div>
                  ) : (
                    sessions.slice(0, 4).map((s) => (
                      <div key={s.id} className="relative group/item">
                        <button
                          onClick={() => setCurrentSession(s)}
                          className="w-full glass p-5 rounded-2xl border border-white/5 text-left flex items-center justify-between group hover:border-primary/40 transition-all pr-16">
                          <div>
                            <h4 className="font-bold text-white group-hover:text-primary transition-colors">
                              {s.title}
                            </h4>
                            <p className="text-[10px] font-black uppercase tracking-wider text-white/20">
                              {new Date(s.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="bg-white/5 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
                            <ChevronRight
                              className="text-white/20 group-hover:text-primary"
                              size={18}
                            />
                          </div>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSession(s.id);
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10 hover:text-red-500 transition-all p-3 hover:bg-red-500/10 rounded-xl opacity-0 group-hover/item:opacity-100"
                          title="Excluir Sessão">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );
      case "history":
        return (
          <PurchasesHistory
            sessions={sessions}
            onSelectSession={(s) => setCurrentSession(s)}
            onDeleteSession={handleDeleteSession}
          />
        );
      case "bills":
        return (
          <FixedBills
            bills={fixedBills}
            onCreateBill={handleCreateFixedBill}
            onUpdateBill={handleUpdateFixedBill}
            onDeleteBill={handleDeleteFixedBill}
          />
        );
      case "stats":
        return <Analytics sessions={sessions} fixedBills={fixedBills} />;
      case "settings":
        return <Settings user={user} />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout
      user={user}
      onLogout={handleLogout}
      activeView={activeView}
      onViewChange={(view) => {
        setActiveView(view);
        setCurrentSession(null);
      }}>
      <div className="no-print">
        <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
        <style
          dangerouslySetInnerHTML={{
            __html: `
          .shadow-3xl {
            box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.4);
          }
        `,
          }}
        />
      </div>

      <div className="print-report p-10 text-black text-sm space-y-6">
        <h1 className="text-2xl font-black">
          Relatório de Despesas - {MONTH_LABEL}
        </h1>
        <section>
          <h2 className="text-lg font-bold mb-2">Resumo Geral</h2>
          <table className="w-full border-collapse text-xs">
            <tbody>
              <tr>
                <td className="border px-2 py-1 font-semibold">
                  Gasto Compartilhado
                </td>
                <td className="border px-2 py-1">
                  R$ {globalStats.totalShared.toFixed(2).replace(".", ",")}
                </td>
              </tr>
              <tr>
                <td className="border px-2 py-1 font-semibold">
                  Minha Parte Total (mercado)
                </td>
                <td className="border px-2 py-1">
                  R{"$ "}
                  {(
                    globalStats.totalPersonal +
                    (globalStats.totalShared - globalStats.totalGained)
                  )
                    .toFixed(2)
                    .replace(".", ",")}
                </td>
              </tr>
              <tr>
                <td className="border px-2 py-1 font-semibold">
                  A Receber / Outros
                </td>
                <td className="border px-2 py-1">
                  R$ {globalStats.totalGained.toFixed(2).replace(".", ",")}
                </td>
              </tr>
              <tr>
                <td className="border px-2 py-1 font-semibold">
                  Total Contas da Casa em Aberto
                </td>
                <td className="border px-2 py-1">
                  R${" "}
                  {(globalStats.unpaidTotal || 0).toFixed(2).replace(".", ",")}
                </td>
              </tr>
              <tr>
                <td className="border px-2 py-1 font-semibold">
                  Minha Parte nas Contas
                </td>
                <td className="border px-2 py-1">
                  R${" "}
                  {(globalStats.unpaidUserPart || 0)
                    .toFixed(2)
                    .replace(".", ",")}
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {sessions.filter((s) => {
          const d = new Date(s.created_at);
          return (
            d.getMonth() === CURRENT_MONTH_INDEX &&
            d.getFullYear() === CURRENT_YEAR
          );
        }).length > 0 && (
          <section>
            <h2 className="text-lg font-bold mb-2">Compras do Mês (Sessões)</h2>
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  <th className="border px-2 py-1 text-left">Data</th>
                  <th className="border px-2 py-1 text-left">Título</th>
                  <th className="border px-2 py-1 text-right">Total</th>
                  <th className="border px-2 py-1 text-right">Compartilhado</th>
                  <th className="border px-2 py-1 text-right">Pessoal</th>
                  <th className="border px-2 py-1 text-right">Pessoas</th>
                  <th className="border px-2 py-1 text-right">Minha Parte</th>
                </tr>
              </thead>
              <tbody>
                {sessions
                  .filter((s) => {
                    const d = new Date(s.created_at);
                    return (
                      d.getMonth() === CURRENT_MONTH_INDEX &&
                      d.getFullYear() === CURRENT_YEAR
                    );
                  })
                  .map((s) => {
                    const shared = Number(s.total_shared_cost) || 0;
                    const personal = Number(s.total_personal_cost) || 0;
                    const split = s.split_count || 2;
                    const total = shared + personal;
                    const yourShare = personal + shared / split;
                    return (
                      <tr key={s.id}>
                        <td className="border px-2 py-1">
                          {new Date(s.created_at).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="border px-2 py-1">{s.title}</td>
                        <td className="border px-2 py-1 text-right">
                          R$ {total.toFixed(2).replace(".", ",")}
                        </td>
                        <td className="border px-2 py-1 text-right">
                          R$ {shared.toFixed(2).replace(".", ",")}
                        </td>
                        <td className="border px-2 py-1 text-right">
                          R$ {personal.toFixed(2).replace(".", ",")}
                        </td>
                        <td className="border px-2 py-1 text-right">{split}</td>
                        <td className="border px-2 py-1 text-right">
                          R$ {yourShare.toFixed(2).replace(".", ",")}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </section>
        )}

        {fixedBills.filter((b) => {
          if (!b.month_year) return false;
          const [m, y] = b.month_year.split("/");
          const month = parseInt(m, 10);
          const year = parseInt(y, 10);
          return month === CURRENT_MONTH_INDEX + 1 && year === CURRENT_YEAR;
        }).length > 0 && (
          <section>
            <h2 className="text-lg font-bold mb-2">Contas Fixas do Mês</h2>
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  <th className="border px-2 py-1 text-left">Descrição</th>
                  <th className="border px-2 py-1 text-right">Valor</th>
                  <th className="border px-2 py-1 text-right">Pessoas</th>
                  <th className="border px-2 py-1 text-right">Minha Parte</th>
                  <th className="border px-2 py-1 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {fixedBills
                  .filter((b) => {
                    if (!b.month_year) return false;
                    const [m, y] = b.month_year.split("/");
                    const month = parseInt(m, 10);
                    const year = parseInt(y, 10);
                    return (
                      month === CURRENT_MONTH_INDEX + 1 && year === CURRENT_YEAR
                    );
                  })
                  .map((b) => {
                    const amount = Number(b.amount) || 0;
                    const split = b.split_count || 2;
                    const yourPart = amount / split;
                    return (
                      <tr key={b.id}>
                        <td className="border px-2 py-1">{b.title}</td>
                        <td className="border px-2 py-1 text-right">
                          R$ {amount.toFixed(2).replace(".", ",")}
                        </td>
                        <td className="border px-2 py-1 text-right">{split}</td>
                        <td className="border px-2 py-1 text-right">
                          R$ {yourPart.toFixed(2).replace(".", ",")}
                        </td>
                        <td className="border px-2 py-1">
                          {b.is_paid ? "Paga" : "Em aberto"}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}

function ChevronRight({ size, className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
