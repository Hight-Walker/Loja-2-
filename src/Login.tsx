import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, ArrowRight, ShieldCheck, User as UserIcon, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getUsers, setCurrentUser } from './lib/storage';
import { cn } from './lib/utils';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      setCurrentUser(user, rememberMe);
      if (user.role === 'admin') {
        localStorage.setItem('chronos_admin_auth', 'true');
        navigate('/manager');
      } else {
        navigate('/');
      }
    } else {
      setError('E-mail ou senha incorretos.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=1920" 
          alt="Background" 
          className="w-full h-full object-cover opacity-20"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[2rem] p-8 sm:p-10 shadow-2xl relative z-10"
      >
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-gold transition-colors mb-6 group"
        >
          <motion.div
            whileHover={{ x: -4 }}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Voltar ao Início</span>
          </motion.div>
        </Link>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gold/10 text-gold rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon size={32} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Acesso Chronos</h1>
          <p className="text-gray-500 text-sm">Entre com suas credenciais</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-500 text-xs p-3 rounded-lg font-medium">
              {error}
            </div>
          )}
          
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input 
                required
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] p-3 pl-12 outline-none focus:ring-2 focus:ring-gold transition-all"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input 
                required
                type="text" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] p-3 pl-12 outline-none focus:ring-2 focus:ring-gold transition-all"
                placeholder="Sua senha"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="remember" 
              checked={rememberMe} 
              onChange={e => setRememberMe(e.target.checked)}
              className="w-4 h-4 accent-gold"
            />
            <label htmlFor="remember" className="text-xs font-medium text-gray-500 cursor-pointer">Salvar login para a próxima vez</label>
          </div>
          
          <button type="submit" className="w-full bg-gray-900 text-white py-4 rounded-[2rem] font-bold uppercase tracking-widest hover:bg-gold transition-all duration-300 flex items-center justify-center gap-2">
            Entrar
            <ArrowRight size={18} />
          </button>
        </form>
        
        <div className="mt-8 pt-8 border-t border-gray-100 text-center space-y-4">
          <p className="text-sm text-gray-400">
            Não tem uma conta? <Link to="/register" className="text-gold font-bold hover:underline">Cadastre-se</Link>
          </p>
          <div className="flex items-center justify-center gap-2 text-[10px] text-gray-300 uppercase tracking-widest">
            <ShieldCheck size={12} />
            <span>Acesso Seguro & Criptografado</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
