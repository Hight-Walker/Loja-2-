import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User as UserIcon, Mail, Lock, MapPin, ArrowRight, CreditCard, Calendar, Phone, Search, Loader2, Hash, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getUsers, saveUser, setCurrentUser } from './lib/storage';
import { User } from './types';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    cpf: '',
    birthDate: ''
  });
  const [addressData, setAddressData] = useState({
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: ''
  });
  const [loadingCep, setLoadingCep] = useState(false);
  const [showAddressFields, setShowAddressFields] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 8);
    setAddressData(prev => ({ ...prev, cep: value }));

    if (value.length === 8) {
      setLoadingCep(true);
      setError('');
      try {
        const response = await fetch(`https://viacep.com.br/ws/${value}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setAddressData(prev => ({
            ...prev,
            street: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf
          }));
          setShowAddressFields(true);
        } else {
          setError('CEP não encontrado.');
          setShowAddressFields(false);
        }
      } catch (err) {
        setError('Erro ao buscar CEP. Tente novamente.');
        setShowAddressFields(false);
      } finally {
        setLoadingCep(false);
      }
    } else {
      setShowAddressFields(false);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAddressFields) {
      setError('Por favor, informe um CEP válido para continuar.');
      return;
    }
    const users = getUsers();
    
    if (users.find(u => u.email === formData.email)) {
      setError('Este e-mail já está em uso.');
      return;
    }

    const fullAddress = `${addressData.street}, ${addressData.number}${addressData.complement ? ` (${addressData.complement})` : ''} - ${addressData.neighborhood}, ${addressData.city}/${addressData.state} (CEP: ${addressData.cep})`;

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      address: fullAddress,
      role: 'user'
    };

    saveUser(newUser);
    setCurrentUser(newUser);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 py-12 relative overflow-hidden w-full">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&q=80&w=1920" 
          alt="Background" 
          className="w-full h-full object-cover opacity-20"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-white rounded-[2rem] p-6 sm:p-10 shadow-2xl relative z-10"
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
          <h1 className="text-2xl font-bold mb-2">Criar Conta</h1>
          <p className="text-gray-500 text-sm">Para sua segurança e do vendedor, solicitamos dados completos.</p>
        </div>
        
        <form onSubmit={handleRegister} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-500 text-xs p-3 rounded-lg font-medium">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Nome Completo</label>
              <div className="flex items-center bg-gray-50 border border-gray-100 rounded-[2rem] focus-within:ring-2 focus-within:ring-gold transition-all overflow-hidden">
                <div className="pl-3 pr-2 text-gray-300">
                  <UserIcon size={18} />
                </div>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="flex-1 bg-transparent border-none py-3 pr-3 outline-none text-sm" placeholder="Seu Nome" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">E-mail</label>
              <div className="flex items-center bg-gray-50 border border-gray-100 rounded-[2rem] focus-within:ring-2 focus-within:ring-gold transition-all overflow-hidden">
                <div className="pl-3 pr-2 text-gray-300">
                  <Mail size={18} />
                </div>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="flex-1 bg-transparent border-none py-3 pr-3 outline-none text-sm" placeholder="seu@email.com" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">CPF</label>
              <div className="flex items-center bg-gray-50 border border-gray-100 rounded-[2rem] focus-within:ring-2 focus-within:ring-gold transition-all overflow-hidden">
                <div className="pl-3 pr-2 text-gray-300">
                  <CreditCard size={18} />
                </div>
                <input required type="text" value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} className="flex-1 bg-transparent border-none py-3 pr-3 outline-none text-sm" placeholder="000.000.000-00" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Senha</label>
              <div className="flex items-center bg-gray-50 border border-gray-100 rounded-[2rem] focus-within:ring-2 focus-within:ring-gold transition-all overflow-hidden">
                <div className="pl-3 pr-2 text-gray-300">
                  <Lock size={18} />
                </div>
                <input required type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="flex-1 bg-transparent border-none py-3 pr-3 outline-none text-sm" placeholder="Sua senha" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Telefone</label>
              <div className="flex items-center bg-gray-50 border border-gray-100 rounded-[2rem] focus-within:ring-2 focus-within:ring-gold transition-all overflow-hidden">
                <div className="pl-3 pr-2 text-gray-300">
                  <Phone size={18} />
                </div>
                <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="flex-1 bg-transparent border-none py-3 pr-3 outline-none text-sm" placeholder="(00) 00000-0000" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Data de Nascimento</label>
              <div className="flex items-center bg-gray-50 border border-gray-100 rounded-[2rem] focus-within:ring-2 focus-within:ring-gold transition-all overflow-hidden">
                <div className="pl-3 pr-2 text-gray-300">
                  <Calendar size={18} />
                </div>
                <input required type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} className="flex-1 bg-transparent border-none py-3 pr-2 outline-none text-sm h-[44px]" />
              </div>
            </div>

            <div className="md:col-span-2 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-2">Endereço de Entrega</h3>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">Digite seu CEP para começar</p>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">CEP</label>
              <div className="flex items-center bg-gray-50 border border-gray-100 rounded-[2rem] focus-within:ring-2 focus-within:ring-gold transition-all overflow-hidden">
                <div className="pl-3 pr-2 text-gray-300">
                  {loadingCep ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                </div>
                <input 
                  required 
                  type="text" 
                  value={addressData.cep} 
                  onChange={handleCepChange} 
                  className="flex-1 bg-transparent border-none py-3 pr-3 outline-none text-sm" 
                  placeholder="00000000" 
                />
              </div>
            </div>

            {showAddressFields && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Rua / Logradouro</label>
                  <div className="flex items-center bg-gray-50 border border-gray-100 rounded-[2rem] focus-within:ring-2 focus-within:ring-gold transition-all overflow-hidden">
                    <div className="pl-3 pr-2 text-gray-300">
                      <MapPin size={18} />
                    </div>
                    <input 
                      required 
                      type="text" 
                      value={addressData.street} 
                      onChange={e => setAddressData({...addressData, street: e.target.value})} 
                      className="flex-1 bg-transparent border-none py-3 pr-3 outline-none text-sm" 
                      placeholder="Nome da Rua" 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Número</label>
                  <div className="flex items-center bg-gray-50 border border-gray-100 rounded-[2rem] focus-within:ring-2 focus-within:ring-gold transition-all overflow-hidden">
                    <div className="pl-3 pr-2 text-gray-300">
                      <Hash size={18} />
                    </div>
                    <input 
                      required 
                      type="text" 
                      value={addressData.number} 
                      onChange={e => setAddressData({...addressData, number: e.target.value})} 
                      className="flex-1 bg-transparent border-none py-3 pr-3 outline-none text-sm" 
                      placeholder="123" 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Complemento</label>
                  <div className="flex items-center bg-gray-50 border border-gray-100 rounded-[2rem] focus-within:ring-2 focus-within:ring-gold transition-all overflow-hidden">
                    <div className="pl-3 pr-2 text-gray-300">
                      <MapPin size={18} />
                    </div>
                    <input 
                      type="text" 
                      value={addressData.complement} 
                      onChange={e => setAddressData({...addressData, complement: e.target.value})} 
                      className="flex-1 bg-transparent border-none py-3 pr-3 outline-none text-sm" 
                      placeholder="Apto, Bloco, etc." 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Bairro</label>
                  <div className="flex items-center bg-gray-50 border border-gray-100 rounded-[2rem] focus-within:ring-2 focus-within:ring-gold transition-all overflow-hidden">
                    <div className="pl-3 pr-2 text-gray-300">
                      <MapPin size={18} />
                    </div>
                    <input 
                      required 
                      type="text" 
                      value={addressData.neighborhood} 
                      onChange={e => setAddressData({...addressData, neighborhood: e.target.value})} 
                      className="flex-1 bg-transparent border-none py-3 pr-3 outline-none text-sm" 
                      placeholder="Bairro" 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Cidade</label>
                  <div className="flex items-center bg-gray-50 border border-gray-100 rounded-[2rem] focus-within:ring-2 focus-within:ring-gold transition-all overflow-hidden">
                    <div className="pl-3 pr-2 text-gray-300">
                      <MapPin size={18} />
                    </div>
                    <input 
                      required 
                      type="text" 
                      value={addressData.city} 
                      onChange={e => setAddressData({...addressData, city: e.target.value})} 
                      className="flex-1 bg-transparent border-none py-3 pr-3 outline-none text-sm" 
                      placeholder="Cidade" 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Estado (UF)</label>
                  <div className="flex items-center bg-gray-50 border border-gray-100 rounded-[2rem] focus-within:ring-2 focus-within:ring-gold transition-all overflow-hidden">
                    <div className="pl-3 pr-2 text-gray-300">
                      <MapPin size={18} />
                    </div>
                    <input 
                      required 
                      type="text" 
                      value={addressData.state} 
                      onChange={e => setAddressData({...addressData, state: e.target.value})} 
                      className="flex-1 bg-transparent border-none py-3 pr-3 outline-none text-sm" 
                      placeholder="UF" 
                      maxLength={2}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
          
          <button type="submit" className="w-full bg-gray-900 text-white py-4 rounded-[2rem] font-bold uppercase tracking-widest hover:bg-gold transition-all duration-300 flex items-center justify-center gap-2">
            Finalizar Cadastro
            <ArrowRight size={18} />
          </button>
        </form>
        
        <p className="mt-8 text-center text-sm text-gray-400">
          Já tem uma conta? <Link to="/login" className="text-gold font-bold hover:underline">Entre aqui</Link>
        </p>
      </motion.div>
    </div>
  );
};
