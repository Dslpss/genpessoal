import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogIn, User, Lock, Eye, EyeOff, Loader2, UserPlus, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Login({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        })
        if (signUpError) throw signUpError
        if (data?.user) {
          // Supabase might require email confirmation, but we'll try to log in or inform user
          setError('Conta criada! Verifique seu e-mail ou faça login.')
          setIsSignUp(false)
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) throw signInError
        if (data?.user) {
          onLogin(data.user)
        }
      }
    } catch (err) {
      console.error('Auth error:', err)
      setError(err.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#020617]">
      {/* Background Layers */}
      <div className="backgroundPattern" />
      <div className="overlay">
        <div className="orb w-[500px] h-[500px] bg-primary/20 top-[-10%] left-[-10%]" />
        <div className="orb w-[400px] h-[400px] bg-shared/20 bottom-[-10%] right-[-10%]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        <div className="glass-pro p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-white/10">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
              className="w-20 h-20 bg-gradient-to-tr from-primary to-shared rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-primary/20"
            >
              {isSignUp ? <UserPlus className="text-black w-10 h-10" strokeWidth={2.5} /> : <LogIn className="text-black w-10 h-10" strokeWidth={2.5} />}
            </motion.div>
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
              {isSignUp ? 'Criar Conta' : 'Bem-vindo de volta'}
            </h1>
            <p className="text-white/40 text-sm font-medium">
              {isSignUp ? 'Comece a organizar suas finanças hoje' : 'Acesse seu painel de gerenciamento financeiro'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm font-bold"
              >
                <AlertCircle size={18} /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-4">E-mail</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white/[0.08] transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-4">Senha</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white/[0.08] transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-shared hover:opacity-90 disabled:opacity-50 text-black font-black py-4 rounded-2xl shadow-xl shadow-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <Loader2 className="animate-spin" /> : (isSignUp ? 'Cadastrar' : 'Entrar no Sistema')}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-white/40 hover:text-primary transition-colors font-bold uppercase tracking-widest text-[10px]"
            >
              {isSignUp ? 'Já tem uma conta? Faça Login' : 'Não tem conta? Crie uma agora'}
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">
          Powered by Supabase & Antigravity
        </p>
      </motion.div>
    </div>
  )
}
