import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, ArrowLeft, Trash2, Plus, Minus, 
  ArrowRight, Truck, ShieldCheck, CreditCard, 
  ChevronRight, Star, MapPin, Package, Info,
  Search, Loader2, Hash, Edit3
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { CartItem, StoreConfig, User } from './types';
import { getStoreConfig, getCurrentUser, updateUser, setCurrentUser, getDeveloperConfig } from './lib/storage';
import { cn, formatPrice } from './lib/utils';
import { Toast, ToastType, Button, Badge } from './components/UI';
import { Footer } from './components/Footer';

export const CartPage = () => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('chronos_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [storeConfig] = useState<StoreConfig>(getStoreConfig());
  const [user, setUser] = useState<User | null>(getCurrentUser());
  const [toast, setToast] = useState<{ message: string, type: ToastType, isVisible: boolean }>({ message: '', type: 'success', isVisible: false });
  
  // Shipping & Address State
  const [cep, setCep] = useState('');
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  
  const [useCustomAddress, setUseCustomAddress] = useState(false);
  const [addressData, setAddressData] = useState({
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: ''
  });
  const [showAddressFields, setShowAddressFields] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // If user has a CEP in their saved address, try to pre-fill
    if (user?.address) {
      const cepMatch = user.address.match(/CEP: (\d{8})/);
      if (cepMatch) {
        setCep(cepMatch[1]);
      }
    }
  }, [user]);

  useEffect(() => {
    const handleCartUpdate = () => {
      const saved = localStorage.getItem('chronos_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        setCart(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(parsed)) {
            return parsed;
          }
          return prev;
        });
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  useEffect(() => {
    const currentSaved = localStorage.getItem('chronos_cart');
    const currentCartStr = JSON.stringify(cart);
    if (currentSaved !== currentCartStr) {
      localStorage.setItem('chronos_cart', currentCartStr);
      window.dispatchEvent(new Event('cartUpdated'));
    }
  }, [cart]);

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
    setToast({ message: 'Item removido do carrinho', type: 'info', isVisible: true });
  };

  const calculateShipping = async (targetCep: string = cep, silent: boolean = false) => {
    if (targetCep.length < 8) {
      if (!silent) setToast({ message: 'Por favor, insira um CEP válido', type: 'error', isVisible: true });
      return;
    }

    setIsCalculating(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const firstDigit = parseInt(targetCep[0]);
      let cost = 0;
      if (firstDigit === 0 || firstDigit === 1) cost = 25; // R$ 25,00
      else if (firstDigit >= 2 && firstDigit <= 4) cost = 45; // R$ 45,00
      else cost = 85; // R$ 85,00

      setShippingCost(cost);
      if (!silent) setToast({ message: 'Frete calculado com sucesso!', type: 'success', isVisible: true });
    } catch (error) {
      if (!silent) setToast({ message: 'Erro ao calcular frete', type: 'error', isVisible: true });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleCepLookup = async (value: string) => {
    const cleanValue = value.replace(/\D/g, '').slice(0, 8);
    setAddressData(prev => ({ ...prev, cep: cleanValue }));

    if (cleanValue.length === 8) {
      setLoadingCep(true);
      try {
        const config = getDeveloperConfig();
        const response = await fetch(`${config.viacepApiUrl}/${cleanValue}/json/`);
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
          calculateShipping(cleanValue, true);
        } else {
          setShowAddressFields(false);
        }
      } catch (err) {
        setShowAddressFields(false);
      } finally {
        setLoadingCep(false);
      }
    } else {
      setShowAddressFields(false);
    }
  };

  const handleSaveAddress = () => {
    if (!addressData.cep || !addressData.street || !addressData.number || !addressData.neighborhood || !addressData.city || !addressData.state) {
      setToast({ message: 'Por favor, preencha todos os campos obrigatórios.', type: 'error', isVisible: true });
      return;
    }

    const finalAddress = `${addressData.street}, ${addressData.number}${addressData.complement ? ` (${addressData.complement})` : ''} - ${addressData.neighborhood}, ${addressData.city}/${addressData.state} (CEP: ${addressData.cep})`;
    
    if (user) {
      const updatedUser = { ...user, address: finalAddress };
      updateUser(updatedUser);
      setCurrentUser(updatedUser, true);
      setUser(updatedUser);
      setUseCustomAddress(false);
      setToast({ message: 'Endereço salvo e frete atualizado!', type: 'success', isVisible: true });
      calculateShipping(addressData.cep, true);
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const freeShippingThreshold = storeConfig.freeShippingMinAmount || 20000;
  const isFreeShipping = storeConfig.freeShippingEnabled && subtotal >= freeShippingThreshold;
  
  const shipping = isFreeShipping ? 0 : (shippingCost !== null ? shippingCost : 0);
  const total = subtotal + shipping;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    let finalAddress = user?.address || '';
    if (useCustomAddress && showAddressFields) {
      finalAddress = `${addressData.street}, ${addressData.number}${addressData.complement ? ` (${addressData.complement})` : ''} - ${addressData.neighborhood}, ${addressData.city}/${addressData.state} (CEP: ${addressData.cep})`;
    }
    
    if (!finalAddress && !isFreeShipping && shippingCost === null) {
      setToast({ message: 'Por favor, informe um endereço e calcule o frete.', type: 'error', isVisible: true });
      return;
    }

    sessionStorage.setItem('chronos_order_address', finalAddress);
    sessionStorage.setItem('chronos_order_shipping', JSON.stringify(shipping));
    
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-white">
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast({ ...toast, isVisible: false })} 
      />

      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:text-gold transition-colors group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Continuar Comprando
          </Link>
          
          <Link to="/" className="text-xl font-bold tracking-tight">
            CHRONOS<span className="text-gold">.</span>
          </Link>
          
          <div className="flex items-center gap-3 text-gray-400">
            <ShieldCheck size={18} className="shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider hidden md:block">Pagamento Seguro</span>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-20 md:pt-32 md:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="space-y-10 md:space-y-16">
            {/* Cart Items */}
            <div className="max-w-4xl mx-auto w-full">
              <div className="flex items-center justify-between mb-8 md:mb-12 gap-4">
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900">Sua Sacola</h1>
                <Badge variant="gray" className="px-3 py-1">
                  {cart.length} {cart.length === 1 ? 'item' : 'itens'}
                </Badge>
              </div>

              <AnimatePresence mode="popLayout">
                {cart.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-24 flex flex-col items-center justify-center text-center bg-gray-50 rounded-[2rem]"
                  >
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-gray-200 mb-6 shadow-lg">
                      <ShoppingBag size={48} />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Seu carrinho está vazio</h2>
                    <p className="text-gray-500 max-w-md mx-auto mb-10">
                      Parece que você ainda não escolheu seu próximo Chronos. 
                      Explore nossas coleções e descubra a peça perfeita.
                    </p>
                    <Button onClick={() => navigate('/')} variant="gold" size="lg">Ver Coleções</Button>
                  </motion.div>
                ) : (
                  <div className="space-y-6">
                    {cart.map((item) => (
                      <motion.div 
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.3 } }}
                        className="group bg-white hover:bg-gray-50 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] transition-all duration-500 border border-gray-100 hover:border-gold/20 hover:shadow-2xl hover:shadow-gold/5"
                      >
                        <div className="flex gap-4 md:gap-10">
                          {/* Image Container */}
                          <div className="w-24 h-32 sm:w-40 md:w-48 sm:h-auto aspect-[4/5] bg-gray-50 rounded-2xl md:rounded-[2rem] overflow-hidden relative shadow-inner shrink-0">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                              referrerPolicy="no-referrer" 
                            />
                            {item.isBestSeller && (
                              <div className="absolute top-2 left-2 md:top-4 md:left-4">
                                <Badge variant="gold" className="backdrop-blur-md bg-gold/80 text-[8px] md:text-[10px] px-1.5 py-0.5">
                                  <Star size={8} className="md:size-[10px]" fill="currentColor" /> Best
                                </Badge>
                              </div>
                            )}
                          </div>

                          {/* Details Container */}
                          <div className="flex-1 flex flex-col justify-between py-1">
                            <div className="space-y-2 md:space-y-4">
                              <div className="flex justify-between items-start gap-2">
                                <div>
                                  <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1">
                                    <span className="text-gold text-[8px] md:text-[10px] font-bold uppercase tracking-widest">{item.category}</span>
                                    <div className="w-1 h-1 rounded-full bg-gray-200" />
                                    <span className="text-gray-400 text-[8px] md:text-[10px] font-bold uppercase tracking-widest hidden xs:inline">Ref: {item.id.slice(0, 8)}</span>
                                  </div>
                                  <h3 className="text-lg md:text-3xl font-bold group-hover:text-gold transition-colors duration-300 tracking-tight leading-tight line-clamp-1 md:line-clamp-none">{item.name}</h3>
                                </div>
                                <button 
                                  onClick={() => removeFromCart(item.id)}
                                  className="w-8 h-8 md:w-12 md:h-12 flex items-center justify-center text-gray-300 hover:text-white hover:bg-red-500 rounded-full transition-all duration-300 shadow-sm shrink-0 group/delete"
                                >
                                  <Trash2 size={16} className="md:size-5 group-hover/delete:scale-110 transition-transform" />
                                </button>
                              </div>
                              <p className="text-gray-500 text-xs md:text-sm leading-relaxed line-clamp-2 max-w-xl hidden sm:block">
                                {item.description}
                              </p>
                            </div>

                            <div className="flex flex-row items-end justify-between gap-2 mt-4">
                              <div className="space-y-1.5 md:space-y-3">
                                <p className="text-[8px] md:text-[10px] text-gray-400 uppercase tracking-widest font-bold">Qtd</p>
                                <div className="flex items-center bg-gray-50 border border-gray-100 rounded-full p-0.5 md:p-1 w-fit shadow-inner">
                                  <button 
                                    onClick={() => updateQty(item.id, -1)}
                                    className="w-7 h-7 md:w-10 md:h-10 flex items-center justify-center hover:bg-white hover:text-gold rounded-full transition-all active:scale-90 disabled:opacity-30"
                                    disabled={item.quantity <= 1}
                                  >
                                    <Minus size={12} className="md:size-4" />
                                  </button>
                                  <span className="w-8 md:w-12 text-center font-bold text-sm md:text-lg tabular-nums">{item.quantity}</span>
                                  <button 
                                    onClick={() => updateQty(item.id, 1)}
                                    className="w-7 h-7 md:w-10 md:h-10 flex items-center justify-center hover:bg-white hover:text-gold rounded-full transition-all active:scale-90"
                                  >
                                    <Plus size={12} className="md:size-4" />
                                  </button>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <p className="text-[8px] md:text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-0.5 md:mb-1">Subtotal</p>
                                <div className="flex items-baseline gap-1.5 md:gap-2 justify-end">
                                  <span className="text-[10px] md:text-sm text-gray-400 font-medium hidden xs:inline">{item.quantity}x</span>
                                  <p className="text-xl md:text-4xl font-bold tracking-tighter text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Horizontal Summary Section */}
            {cart.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-6xl mx-auto w-full"
              >
                <div className="bg-gray-50 rounded-[2rem] md:rounded-[3rem] p-5 sm:p-8 md:p-12 border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-start">
                    {/* Left: Address & Shipping */}
                    <div className="space-y-6 md:space-y-8">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gold/10 rounded-xl md:rounded-2xl flex items-center justify-center text-gold">
                          <MapPin size={20} className="md:size-6" />
                        </div>
                        <div>
                          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900">Endereço de Entrega</h2>
                          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Onde seu Chronos será entregue</p>
                        </div>
                      </div>

                      <div className="bg-white p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 shadow-lg shadow-gray-200/50 space-y-5 md:space-y-6">
                        {user ? (
                          <div className="space-y-4">
                            <AnimatePresence mode="wait">
                              {!useCustomAddress ? (
                                <motion.div 
                                  key="saved-address"
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: 10 }}
                                  className="space-y-4"
                                >
                                  <div className="p-4 md:p-6 bg-gray-50 rounded-xl md:rounded-2xl border border-gray-100 space-y-2">
                                    <p className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Endereço Salvo</p>
                                    <p className="text-sm md:text-base text-gray-900 font-medium leading-relaxed">{user.address || 'Nenhum endereço cadastrado'}</p>
                                  </div>
                                  <button 
                                    onClick={() => setUseCustomAddress(true)}
                                    className="text-[10px] font-bold text-gold uppercase tracking-widest hover:underline flex items-center gap-2"
                                  >
                                    <Edit3 size={14} /> Usar outro endereço
                                  </button>
                                  
                                  {shippingCost === null && !isFreeShipping && (
                                    <Button 
                                      onClick={() => calculateShipping()} 
                                      variant="outline" 
                                      size="lg" 
                                      className="w-full mt-2 md:mt-4 h-12 md:h-14"
                                      disabled={isCalculating}
                                    >
                                      {isCalculating ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                                      {isCalculating ? "Calculando..." : "Calcular Frete"}
                                    </Button>
                                  )}
                                </motion.div>
                              ) : (
                                <motion.div 
                                  key="new-address"
                                  initial={{ opacity: 0, x: 10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: -10 }}
                                  className="space-y-5 md:space-y-6"
                                >
                                  <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-bold text-gold uppercase tracking-[0.2em]">Novo Endereço</p>
                                    <button 
                                      onClick={() => setUseCustomAddress(false)}
                                      className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600"
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                  
                                  <div className="space-y-3 md:space-y-4">
                                    <div className="relative group/input">
                                      <Search size={16} className={cn("absolute left-4 top-1/2 -translate-y-1/2 text-gray-400", loadingCep && "animate-spin")} />
                                      <input 
                                        type="text" 
                                        placeholder="Digite o CEP"
                                        value={addressData.cep}
                                        onChange={(e) => handleCepLookup(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl md:rounded-2xl pl-12 pr-4 py-4 md:py-5 text-sm focus:bg-white focus:ring-4 focus:ring-gold/5 focus:border-gold/20 transition-all font-mono"
                                      />
                                    </div>

                                    <AnimatePresence>
                                      {showAddressFields && (
                                        <motion.div 
                                          initial={{ opacity: 0, height: 0 }}
                                          animate={{ opacity: 1, height: 'auto' }}
                                          exit={{ opacity: 0, height: 0 }}
                                          className="space-y-3 md:space-y-4 overflow-hidden"
                                        >
                                          <div className="grid grid-cols-3 gap-2 md:gap-3">
                                            <input 
                                              type="text" 
                                              placeholder="Rua" 
                                              value={addressData.street} 
                                              onChange={e => setAddressData({...addressData, street: e.target.value})}
                                              className="col-span-2 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 md:py-4 text-sm outline-none focus:border-gold/30"
                                            />
                                            <input 
                                              type="text" 
                                              placeholder="Nº" 
                                              value={addressData.number} 
                                              onChange={e => setAddressData({...addressData, number: e.target.value})}
                                              className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 md:py-4 text-sm outline-none focus:border-gold/30"
                                            />
                                          </div>
                                          <div className="grid grid-cols-2 gap-2 md:gap-3">
                                            <input 
                                              type="text" 
                                              placeholder="Bairro" 
                                              value={addressData.neighborhood} 
                                              className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 md:py-4 text-sm outline-none text-gray-400"
                                              readOnly
                                            />
                                            <input 
                                              type="text" 
                                              placeholder="Cidade/UF" 
                                              value={`${addressData.city}/${addressData.state}`} 
                                              className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 md:py-4 text-sm outline-none text-gray-400"
                                              readOnly
                                            />
                                          </div>
                                          <input 
                                            type="text" 
                                            placeholder="Complemento (Opcional)" 
                                            value={addressData.complement} 
                                            onChange={e => setAddressData({...addressData, complement: e.target.value})}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 md:py-4 text-sm outline-none focus:border-gold/30"
                                          />
                                          
                                          <Button 
                                            onClick={handleSaveAddress} 
                                            variant="gold" 
                                            size="lg"
                                            className="w-full mt-1 md:mt-2 shadow-xl shadow-gold/20 h-12 md:h-14"
                                          >
                                            Salvar e Usar
                                          </Button>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ) : (
                          <div className="text-center space-y-5 md:space-y-6">
                            <p className="text-xs md:text-sm text-gray-500">Faça login para usar seu endereço salvo.</p>
                            <Button onClick={() => navigate('/login')} variant="outline" className="w-full rounded-xl md:rounded-2xl h-12 md:h-14">Entrar na Conta</Button>
                            
                            <div className="relative">
                              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                              <div className="relative flex justify-center text-[8px] md:text-[10px] uppercase font-bold text-gray-300 bg-white px-3 md:px-4">Ou calcule manualmente</div>
                            </div>

                            <div className="flex gap-2 md:gap-3">
                              <input 
                                type="text" 
                                placeholder="CEP"
                                value={cep}
                                onChange={(e) => setCep(e.target.value.replace(/\D/g, '').slice(0, 8))}
                                className="flex-1 bg-gray-50 border border-gray-100 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-sm outline-none focus:border-gold/30"
                              />
                              <Button onClick={() => calculateShipping()} disabled={isCalculating || cep.length < 8} variant="gold" className="rounded-xl md:rounded-2xl px-6 md:px-8 h-12 md:h-14">Ok</Button>
                            </div>
                          </div>
                        )}

                        {shippingCost !== null && !isFreeShipping && (
                          <div className="pt-4 md:pt-6 border-t border-gray-50 animate-in fade-in slide-in-from-top-4 duration-700">
                            <div className="flex items-center justify-between p-4 md:p-6 bg-gray-50 rounded-2xl md:rounded-3xl border border-gray-100 group/shipping hover:bg-white hover:shadow-xl transition-all duration-500">
                              <div className="flex items-center gap-3 md:gap-5">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-gold/10 rounded-xl md:rounded-2xl flex items-center justify-center text-gold group-hover/shipping:bg-gold group-hover/shipping:text-white transition-all duration-500">
                                  <Truck size={20} className="md:size-6" />
                                </div>
                                <div>
                                  <p className="text-xs md:text-sm font-bold text-gray-900 uppercase tracking-widest">SEDEX Express</p>
                                  <p className="text-[8px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest">3 a 5 dias úteis</p>
                                </div>
                              </div>
                              <span className="text-lg md:text-2xl font-bold text-gold">{formatPrice(shippingCost)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Totals & Checkout */}
                    <div className="space-y-6 md:space-y-8">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gold/10 rounded-xl md:rounded-2xl flex items-center justify-center text-gold">
                          <CreditCard size={20} className="md:size-6" />
                        </div>
                        <div>
                          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900">Resumo de Valores</h2>
                          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Confira os detalhes do seu pedido</p>
                        </div>
                      </div>

                      <div className="bg-white p-5 sm:p-8 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 shadow-lg shadow-gray-200/50 space-y-6 md:space-y-8">
                        <div className="space-y-3 md:space-y-4">
                          <div className="flex justify-between text-[10px] md:text-sm font-bold uppercase tracking-widest">
                            <span className="text-gray-400">Subtotal</span>
                            <span className="text-gray-900 tabular-nums">{formatPrice(subtotal)}</span>
                          </div>
                          <div className="flex justify-between text-[10px] md:text-sm font-bold uppercase tracking-widest">
                            <span className="text-gray-400">Frete</span>
                            <span className={cn("tabular-nums", isFreeShipping ? "text-green-500" : "text-gray-900")}>
                              {isFreeShipping ? 'Grátis' : (shippingCost !== null ? formatPrice(shippingCost) : 'A calcular')}
                            </span>
                          </div>
                          
                          {storeConfig.freeShippingEnabled && subtotal < freeShippingThreshold && (
                            <div className="bg-gray-50 p-4 md:p-6 rounded-2xl md:rounded-3xl space-y-3 md:space-y-4 border border-gray-100">
                              <div className="flex justify-between items-center">
                                <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-gray-400">Frete Grátis</span>
                                <span className="text-[8px] md:text-[10px] font-bold text-gold">{Math.round((subtotal / freeShippingThreshold) * 100)}%</span>
                              </div>
                              <div className="h-1.5 md:h-2 w-full bg-white rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(subtotal / freeShippingThreshold) * 100}%` }}
                                  className="h-full bg-gold shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                                />
                              </div>
                              <p className="text-[8px] md:text-[10px] text-gray-400 text-center font-bold uppercase tracking-widest">
                                Faltam {formatPrice(freeShippingThreshold - subtotal)}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="pt-6 md:pt-8 border-t border-gray-100">
                          <div className="flex justify-between items-end mb-6 md:mb-8">
                            <div>
                              <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1 md:mb-2">Total Final</p>
                              <p className="text-3xl md:text-5xl font-bold tracking-tighter text-gray-900 tabular-nums">{formatPrice(total)}</p>
                            </div>
                            <div className="text-right hidden xs:block">
                              <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-green-500 mb-0.5 md:mb-1">Parcelamento</p>
                              <p className="text-[10px] md:text-sm font-bold text-gray-900">Até 12x de {formatPrice(total / 12)}</p>
                            </div>
                          </div>

                          <Button 
                            onClick={handleCheckout}
                            variant="gold" 
                            size="lg" 
                            className="w-full h-14 md:h-20 text-lg md:text-xl font-bold shadow-2xl shadow-gold/20 group rounded-xl md:rounded-[1.5rem]"
                            disabled={cart.length === 0}
                          >
                            Finalizar Compra
                            <ArrowRight size={20} className="md:size-6 ml-2 md:ml-3 group-hover:translate-x-2 transition-transform" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-center gap-6 md:gap-8 pt-2 md:pt-4 text-gray-300">
                          <div className="flex flex-col items-center gap-1.5 md:gap-2">
                            <ShieldCheck size={18} className="md:size-6" />
                            <span className="text-[6px] md:text-[8px] font-bold uppercase tracking-[0.2em]">Seguro</span>
                          </div>
                          <div className="flex flex-col items-center gap-1.5 md:gap-2">
                            <Truck size={18} className="md:size-6" />
                            <span className="text-[6px] md:text-[8px] font-bold uppercase tracking-[0.2em]">Entrega</span>
                          </div>
                          <div className="flex flex-col items-center gap-1.5 md:gap-2">
                            <CreditCard size={18} className="md:size-6" />
                            <span className="text-[6px] md:text-[8px] font-bold uppercase tracking-[0.2em]">Cartão</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trust Badges Footer */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-12">
                  <div className="p-5 md:p-8 bg-white border border-gray-100 rounded-2xl md:rounded-[2.5rem] flex items-center gap-4 md:gap-6 hover:shadow-xl transition-all duration-500 group">
                    <div className="w-10 h-10 md:w-14 md:h-14 bg-gold/10 rounded-xl md:rounded-2xl flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-all duration-500 shrink-0">
                      <ShieldCheck size={24} className="md:size-8" />
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-bold text-gray-900 uppercase tracking-widest">Garantia Chronos</p>
                      <p className="text-[8px] md:text-[10px] text-gray-400 font-medium uppercase tracking-widest">2 anos de cobertura</p>
                    </div>
                  </div>
                  <div className="p-5 md:p-8 bg-white border border-gray-100 rounded-2xl md:rounded-[2.5rem] flex items-center gap-4 md:gap-6 hover:shadow-xl transition-all duration-500 group">
                    <div className="w-10 h-10 md:w-14 md:h-14 bg-gold/10 rounded-xl md:rounded-2xl flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-all duration-500 shrink-0">
                      <Truck size={24} className="md:size-8" />
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-bold text-gray-900 uppercase tracking-widest">Entrega Segurada</p>
                      <p className="text-[8px] md:text-[10px] text-gray-400 font-medium uppercase tracking-widest">Rastreio em tempo real</p>
                    </div>
                  </div>
                  <div className="p-5 md:p-8 bg-white border border-gray-100 rounded-2xl md:rounded-[2.5rem] flex items-center gap-4 md:gap-6 hover:shadow-xl transition-all duration-500 group sm:col-span-2 md:col-span-1">
                    <div className="w-10 h-10 md:w-14 md:h-14 bg-gold/10 rounded-xl md:rounded-2xl flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-all duration-500 shrink-0">
                      <CreditCard size={24} className="md:size-8" />
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-bold text-gray-900 uppercase tracking-widest">Compra Segura</p>
                      <p className="text-[8px] md:text-[10px] text-gray-400 font-medium uppercase tracking-widest">Criptografia de ponta</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <Footer storeConfig={storeConfig} />
    </div>
  );
};
