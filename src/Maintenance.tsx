import React from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Hammer, Clock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getDeveloperConfig } from './lib/storage';

export const Maintenance = () => {
  const config = getDeveloperConfig();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 font-mono">
      <div className="max-w-md w-full space-y-8 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-3xl text-amber-500 mb-8"
        >
          <Hammer size={40} />
        </motion.div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-white uppercase tracking-tighter">Sistema em Manutenção</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Estamos realizando atualizações críticas para melhorar sua experiência. 
            O sistema Chronos retornará em breve.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
            <span className="text-gray-500 flex items-center gap-2">
              <Clock size={12} /> Previsão
            </span>
            <span className="text-amber-500">~ 45 minutos</span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
            <span className="text-gray-500 flex items-center gap-2">
              <AlertTriangle size={12} /> Status
            </span>
            <span className="text-amber-500">Deploying v{config.appVersion}</span>
          </div>
        </div>

        <div className="pt-8">
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-600 hover:text-gold transition-colors"
          >
            <ArrowLeft size={14} /> Acesso Restrito
          </Link>
        </div>

        <footer className="pt-12">
          <p className="text-[9px] text-gray-800 uppercase tracking-widest">
            &copy; 2026 {config.companyName} • {config.devName}
          </p>
        </footer>
      </div>
    </div>
  );
};
