import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User as UserIcon, ShoppingBag, MapPin, Phone, Mail, 
  Calendar, Hash, ArrowLeft, LogOut, Package, 
  ChevronRight, Lock, Star, ShieldCheck, Clock,
  ArrowRight, Edit3, Save, Trash2, CreditCard
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Order } from './types';
import { getCurrentUser, getOrders, setCurrentUser, updateUser } from './lib/storage';
import { formatPrice, cn } from './lib/utils';
import { Toast, ToastType, Button, Badge, SectionHeading } from './components/UI';

export const UserProfile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
  const [toast, setToast] = useState<{ message: string, type: ToastType, isVisible: boolean }>({ message: '', type: 'success', isVisible: false });
  const toastTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = React.useRef(true);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    setFormData(currentUser);
    
    const allOrders = getOrders();
    const userOrders = allOrders.filter(o => o.userId === currentUser.id);
    setOrders(userOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    
    setTimeout(() => {
      isInitialMount.current = false;
    }, 500);
  }, [navigate]);

  useEffect(() => {
    if (isInitialMount.current) return;
    if (formData && user && JSON.stringify(formData) !== JSON.stringify(user)) {
      updateUser(formData);
      const isPersistent = !!localStorage.getItem('chronos_current_user');
      setCurrentUser(formData, isPersistent);
      setUser(formData);
      
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => {
        setToast({ message: 'Informações atualizadas com sucesso!', type: 'success', isVisible: true });
      }, 1000);
    }
  }, [formData, user]);

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/');
  };

  if (!user || !formData) return null;

  return (
    <div className="min-h-screen bg-white">
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast({ ...toast, isVisible: false })} 
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:text-gold transition-colors group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Voltar à Loja
          </Link>
          
          <Link to="/" className="text-xl font-bold tracking-tight">
            CHRONOS<span className="text-gold">.</span>
          </Link>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-500 hover:text-red-600 transition-colors group"
          >
            Sair da Conta
            <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </nav>

      <main className="pt-32 pb-32">
        <div className="max-w-7xl mx-auto px-6">
          {/* Hero Section */}
          <div className="relative mb-16 rounded-[2rem] overflow-hidden h-[300px] flex items-center justify-center">
            <img 
              src="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=1920" 
              alt="Background" 
              className="absolute inset-0 w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/60" />
            
            <div className="relative z-10 text-center space-y-6 px-6">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-24 h-24 bg-gold/20 rounded-full flex items-center justify-center mx-auto border-2 border-gold/30 backdrop-blur-md shadow-xl relative"
              >
                <UserIcon size={48} className="text-gold" />
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gold rounded-full flex items-center justify-center text-white shadow-lg">
                  <Star size={16} fill="currentColor" />
                </div>
              </motion.div>
              
              <div className="space-y-2">
                <motion.h1 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-4xl md:text-5xl font-bold text-white tracking-tight"
                >
                  {user.name}
                </motion.h1>
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center justify-center gap-4"
                >
                  <Badge variant="gold">
                    {user.role === 'admin' ? 'Administrador' : 'Membro Platinum'}
                  </Badge>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Desde 2024</span>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-8 mb-16">
            <button 
              onClick={() => setActiveTab('profile')}
              className={cn(
                "text-xs font-bold uppercase tracking-wider transition-all relative pb-2",
                activeTab === 'profile' ? "text-gold" : "text-gray-400 hover:text-gray-900"
              )}
            >
              Meu Perfil
              {activeTab === 'profile' && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
              )}
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={cn(
                "text-xs font-bold uppercase tracking-wider transition-all relative pb-2",
                activeTab === 'orders' ? "text-gold" : "text-gray-400 hover:text-gray-900"
              )}
            >
              Meus Pedidos ({orders.length})
              {activeTab === 'orders' && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
              )}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'profile' ? (
              <motion.div 
                key="profile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid lg:grid-cols-12 gap-24"
              >
                <div className="lg:col-span-4 space-y-12">
                  <SectionHeading 
                    title="Dados Cadastrais" 
                    subtitle="Informações de Conta"
                    description="Mantenha seus dados atualizados para uma experiência personalizada."
                    align="left"
                  />
                  
                  <div className="space-y-6 bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-[2rem] flex items-center justify-center text-gold shadow-sm">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">Conta Verificada</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Proteção de Dados Ativa</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-[2rem] flex items-center justify-center text-gold shadow-sm">
                        <Clock size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">Membro Premium</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Acesso Antecipado</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-8">
                  <div className="bg-gray-50 p-8 sm:p-10 rounded-[2rem] border border-gray-100 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                          <UserIcon size={14} /> Nome Completo
                        </label>
                        <input 
                          type="text" 
                          value={formData.name} 
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          className="w-full bg-white border border-gray-100 rounded-[2rem] p-4 outline-none focus:ring-2 focus:ring-gold transition-all text-gray-900 shadow-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                          <Mail size={14} /> E-mail de Acesso
                        </label>
                        <input 
                          type="email" 
                          value={formData.email} 
                          onChange={e => setFormData({...formData, email: e.target.value})}
                          className="w-full bg-white border border-gray-100 rounded-[2rem] p-4 outline-none focus:ring-2 focus:ring-gold transition-all text-gray-900 shadow-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                          <Hash size={14} /> CPF (Identidade)
                        </label>
                        <input 
                          disabled
                          type="text" 
                          value={formData.cpf || 'Não informado'} 
                          className="w-full bg-gray-100/50 border border-gray-100 rounded-[2rem] p-4 outline-none opacity-60 cursor-not-allowed font-mono text-gray-900 shadow-inner"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                          <Phone size={14} /> Telefone Celular
                        </label>
                        <input 
                          type="tel" 
                          value={formData.phone || ''} 
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                          placeholder="(00) 00000-0000"
                          className="w-full bg-white border border-gray-100 rounded-[2rem] p-4 outline-none focus:ring-2 focus:ring-gold transition-all text-gray-900 shadow-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                          <Calendar size={14} /> Data de Nascimento
                        </label>
                        <input 
                          type="date" 
                          value={formData.birthDate || ''} 
                          onChange={e => setFormData({...formData, birthDate: e.target.value})}
                          className="w-full bg-white border border-gray-100 rounded-[2rem] p-4 outline-none focus:ring-2 focus:ring-gold transition-all text-gray-900 shadow-sm h-[60px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                          <MapPin size={14} /> Endereço de Entrega
                        </label>
                        <input 
                          type="text" 
                          value={formData.address || ''} 
                          onChange={e => setFormData({...formData, address: e.target.value})}
                          placeholder="Rua, Número, Bairro, Cidade - UF"
                          className="w-full bg-white border border-gray-100 rounded-[2rem] p-4 outline-none focus:ring-2 focus:ring-gold transition-all text-gray-900 shadow-sm"
                        />
                      </div>
                    </div>

                    {user.role === 'admin' && (
                      <div className="pt-8 border-t border-gray-100">
                        <div className="space-y-2 max-w-md">
                          <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                            <Lock size={14} /> Senha de Administrador
                          </label>
                          <input 
                            type="text" 
                            value={formData.password || ''} 
                            onChange={e => setFormData({...formData, password: e.target.value})}
                            placeholder="Sua senha secreta"
                            className="w-full bg-white border border-gray-100 rounded-[2rem] p-4 outline-none focus:ring-2 focus:ring-gold transition-all font-mono text-gray-900 shadow-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="orders"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                {orders.length === 0 ? (
                  <div className="text-center py-24 space-y-6">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                      <ShoppingBag size={40} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-3xl font-bold tracking-tight">Nenhum pedido encontrado</h3>
                      <p className="text-gray-500 text-lg">Você ainda não realizou nenhuma compra em nossa boutique.</p>
                    </div>
                    <Button onClick={() => navigate('/')} variant="gold" icon={ArrowRight}>
                      Explorar Coleção
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {orders.map((order, idx) => (
                      <motion.div 
                        key={order.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100 flex flex-col md:flex-row gap-8 items-center group hover:shadow-xl transition-all duration-300"
                      >
                        <div className="flex-shrink-0 w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center text-gold shadow-sm group-hover:scale-110 transition-transform duration-500">
                          <Package size={32} />
                        </div>
                        
                        <div className="flex-1 space-y-2 text-center md:text-left">
                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            <span className="text-xl font-bold tracking-tight text-gray-900">#{order.id}</span>
                            <Badge variant={order.status === 'Entregue' ? 'gold' : 'black'}>
                              {order.status}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            <span className="flex items-center gap-2"><Calendar size={12} /> {new Date(order.date).toLocaleDateString('pt-BR')}</span>
                            <span className="flex items-center gap-2"><CreditCard size={12} /> {order.paymentMethod}</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-center md:items-end gap-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Valor Total</p>
                          <p className="text-3xl font-bold tracking-tight text-gray-900">{formatPrice(order.total)}</p>
                        </div>

                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-300 group-hover:text-gold group-hover:bg-gray-900 transition-all duration-300 cursor-pointer">
                          <ChevronRight size={20} />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-gray-100 text-center">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Desenvolvido por Gustavo Walker, CEO da DS Company
        </p>
      </footer>
    </div>
  );
};
