import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Globe, Mail, Phone, MapPin } from 'lucide-react';
import { StoreConfig } from '../types';

export const Footer = ({ storeConfig }: { storeConfig: StoreConfig }) => (
  <footer className="bg-gray-900 text-white pt-20 pb-10 px-6">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
      <div className="md:col-span-1">
        <Link to="/" className="inline-block mb-6">
          {storeConfig.logo ? (
            <img src={storeConfig.logo} alt={storeConfig.name} className="h-10 w-auto object-contain" referrerPolicy="no-referrer" />
          ) : (
            <h2 className="text-2xl font-bold tracking-tight">{storeConfig.name.toUpperCase()}<span className="text-gold">.</span></h2>
          )}
        </Link>
        <p className="text-gray-400 text-sm leading-relaxed mb-6">{storeConfig.description}</p>
        <div className="flex space-x-4">
          {storeConfig.instagram && (
            <a 
              href={storeConfig.instagram.startsWith('http') ? storeConfig.instagram : `https://instagram.com/${storeConfig.instagram.replace('@', '')}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-400 hover:text-gold transition-colors"
            >
              <Instagram size={20} />
            </a>
          )}
          <a href="#" className="text-gray-400 hover:text-gold transition-colors"><Globe size={20} /></a>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider mb-6 text-gold">Explorar</h4>
        <ul className="space-y-4 text-gray-400 text-sm">
          <li><Link to="/" onClick={() => window.scrollTo(0, 0)} className="hover:text-gold transition-colors">Coleções</Link></li>
          <li><a href="#" className="hover:text-gold transition-colors">Novidades</a></li>
        </ul>
      </div>

      <div className="md:col-span-2">
        <h4 className="text-xs font-bold uppercase tracking-wider mb-6 text-gold">Atendimento</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <Mail size={18} className="text-gold shrink-0" />
            <div>
              <p className="text-[10px] font-bold uppercase text-gray-500 mb-1">E-mail</p>
              <p className="text-sm">{storeConfig.email}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone size={18} className="text-gold shrink-0" />
            <div>
              <p className="text-[10px] font-bold uppercase text-gray-500 mb-1">Telefone</p>
              <p className="text-sm">{storeConfig.phone}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 sm:col-span-2">
            <MapPin size={18} className="text-gold shrink-0" />
            <div>
              <p className="text-[10px] font-bold uppercase text-gray-500 mb-1">Endereço</p>
              <p className="text-sm leading-relaxed">{storeConfig.address}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="max-w-7xl mx-auto pt-8 border-t border-gray-800 flex flex-col items-center gap-6">
      <div className="text-center">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">© 2024 {storeConfig.name.toUpperCase()} PREMIUM WATCHES.</p>
        <a 
          href="#" 
          className="text-[10px] font-bold uppercase tracking-wider text-gold/60 hover:text-gold transition-colors block"
        >
          DESENVOLVIDO POR GUSTAVO WALKER, CEO DA DS COMPANY
        </a>
      </div>
      <div className="flex space-x-8 text-[10px] font-bold uppercase tracking-wider text-gray-500">
        <a href="#" className="hover:text-white transition-colors">Privacidade</a>
        <a href="#" className="hover:text-white transition-colors">Termos</a>
      </div>
    </div>
  </footer>
);
