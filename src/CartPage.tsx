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
import { getStoreConfig, getCurrentUser } from './lib/storage';
import { cn, formatPrice } from './lib/utils';
import { Toast, ToastType, Button, Badge } from './components/UI';

export const CartPage = () => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('chronos_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [storeConfig] = useState<StoreConfig>(getStoreConfig());
  const [user] = useState<User | null>(getCurrentUser());
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

  const calculateShipping = async (targetCep: string = cep) => {
    if (targetCep.length < 8) {
      setToast({ message: 'Por favor, insira um CEP válido', type: 'error', isVisible: true });
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
      setToast({ message: 'Frete calculado com sucesso!', type: 'success', isVisible: true });
    } catch (error) {
      setToast({ message: 'Erro ao calcular frete', type: 'error', isVisible: true });
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
        const response = await fetch(`https://viacep.com.br/ws/${cleanValue}/json/`);
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
          calculateShipping(cleanValue);
        } else {
          setToast({ message: 'CEP não encontrado', type: 'error', isVisible: true });
          setShowAddressFields(false);
        }
      } catch (err) {
        setToast({ message: 'Erro ao buscar CEP', type: 'error', isVisible: true });
        setShowAddressFields(false);
      } finally {
        setLoadingCep(false);
      }
    } else {
      setShowAddressFields(false);
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

      <main className="pt-32 pb-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-24 items-start">
            {/* Left: Cart Items */}
            <div className="lg:col-span-8">
              <div className="flex flex-col sm:flex-row items-baseline sm:items-end justify-between mb-12 gap-4">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Sua Sacola</h1>
                <Badge variant="gray">
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
                  <div className="space-y-8">
                    {cart.map((item) => (
                      <motion.div 
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.3 } }}
                        className="flex flex-col sm:flex-row gap-8 group bg-white hover:bg-gray-50 p-6 rounded-[2rem] transition-all duration-300 border border-transparent hover:border-gray-100 hover:shadow-xl"
                      >
                        <div className="w-full sm:w-48 aspect-[3/4] bg-gray-50 rounded-[2rem] overflow-hidden relative shadow-sm">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                            referrerPolicy="no-referrer" 
                          />
                          {item.isBestSeller && (
                            <div className="absolute top-4 left-4">
                              <Badge variant="gold">
                                <Star size={10} fill="currentColor" /> Best Seller
                              </Badge>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 flex flex-col justify-between py-1">
                          <div className="space-y-4">
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <span className="text-gold text-[10px] font-bold uppercase tracking-wider mb-1 block">{item.category}</span>
                                <h3 className="text-2xl md:text-3xl font-bold group-hover:text-gold transition-colors duration-300 tracking-tight">{item.name}</h3>
                              </div>
                              <button 
                                onClick={() => removeFromCart(item.id)}
                                className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-red-500 rounded-[2rem] transition-all duration-300 shadow-sm shrink-0"
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>
                            <p className="text-gray-500 text-sm line-clamp-2 border-l-4 border-gold/10 pl-4 py-1">
                              {item.description}
                            </p>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mt-8">
                            <div className="flex items-center bg-white border border-gray-100 rounded-[2rem] p-1.5 w-fit shadow-sm">
                              <button 
                                onClick={() => updateQty(item.id, -1)}
                                className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 hover:text-gold rounded-lg transition-all active:scale-95"
                              >
                                <Minus size={16} />
                              </button>
                              <span className="w-12 text-center font-bold text-lg">{item.quantity}</span>
                              <button 
                                onClick={() => updateQty(item.id, 1)}
                                className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 hover:text-gold rounded-lg transition-all active:scale-95"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">Valor Total</p>
                              <p className="text-3xl font-bold tracking-tight text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Right: Summary */}
            <div className="lg:col-span-4">
              <div className="sticky top-32 space-y-6">
                <div className="bg-gray-50 rounded-[2rem] p-8 sm:p-10 space-y-8 border border-gray-100 shadow-sm">
                  <h2 className="text-3xl font-bold tracking-tight">Resumo do Pedido</h2>
                  
                  <div className="space-y-6">
                    {/* Address & Shipping Section */}
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-lg space-y-6 relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1 h-full bg-gold/20 group-hover:bg-gold transition-colors" />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-gray-900">
                          <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center text-gold">
                            <MapPin size={20} />
                          </div>
                          <span>Endereço de Entrega</span>
                        </div>
                      </div>

                      {user ? (
                        <div className="space-y-4">
                          {!useCustomAddress ? (
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                              <p className="text-xs font-bold text-gray-900 uppercase tracking-wider">Endereço Cadastrado</p>
                              <p className="text-sm text-gray-500 leading-relaxed">{user.address}</p>
                              <button 
                                onClick={() => setUseCustomAddress(true)}
                                className="text-[10px] font-bold text-gold uppercase tracking-widest hover:underline flex items-center gap-1 mt-2"
                              >
                                <Edit3 size={12} /> Usar outro endereço
                              </button>
                              
                              {shippingCost === null && !isFreeShipping && (
                                <Button 
                                  onClick={() => calculateShipping()} 
                                  variant="outline" 
                                  size="sm" 
                                  className="w-full mt-4"
                                  disabled={isCalculating}
                                >
                                  {isCalculating ? "Calculando..." : "Calcular Frete para este endereço"}
                                </Button>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-bold text-gray-900 uppercase tracking-wider">Novo Endereço</p>
                                <button 
                                  onClick={() => setUseCustomAddress(false)}
                                  className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600"
                                >
                                  Cancelar
                                </button>
                              </div>
                              
                              <div className="space-y-3">
                                <div className="relative group/input">
                                  <Search size={16} className={cn("absolute left-4 top-1/2 -translate-y-1/2 text-gray-400", loadingCep && "animate-spin")} />
                                  <input 
                                    type="text" 
                                    placeholder="CEP (00000-000)"
                                    value={addressData.cep}
                                    onChange={(e) => handleCepLookup(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] pl-12 pr-4 py-4 text-sm focus:bg-white focus:ring-2 focus:ring-gold/10 focus:border-gold/20 transition-all font-mono"
                                  />
                                </div>

                                <AnimatePresence>
                                  {showAddressFields && (
                                    <motion.div 
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="space-y-3 overflow-hidden pt-2"
                                    >
                                      <div className="grid grid-cols-3 gap-2">
                                        <input 
                                          type="text" 
                                          placeholder="Rua" 
                                          value={addressData.street} 
                                          onChange={e => setAddressData({...addressData, street: e.target.value})}
                                          className="col-span-2 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs outline-none focus:border-gold/30"
                                        />
                                        <input 
                                          type="text" 
                                          placeholder="Nº" 
                                          value={addressData.number} 
                                          onChange={e => setAddressData({...addressData, number: e.target.value})}
                                          className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs outline-none focus:border-gold/30"
                                        />
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        <input 
                                          type="text" 
                                          placeholder="Bairro" 
                                          value={addressData.neighborhood} 
                                          className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs outline-none"
                                          readOnly
                                        />
                                        <input 
                                          type="text" 
                                          placeholder="Cidade/UF" 
                                          value={`${addressData.city}/${addressData.state}`} 
                                          className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs outline-none"
                                          readOnly
                                        />
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center space-y-3">
                          <p className="text-xs text-gray-500">Faça login para usar seu endereço salvo</p>
                          <Button onClick={() => navigate('/login')} variant="outline" size="sm" className="w-full">Entrar</Button>
                          
                          <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                            <div className="relative flex justify-center text-[10px] uppercase font-bold text-gray-300 bg-gray-50 px-2">Ou calcule manualmente</div>
                          </div>

                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="CEP"
                              value={cep}
                              onChange={(e) => setCep(e.target.value.replace(/\D/g, '').slice(0, 8))}
                              className="flex-1 bg-white border border-gray-100 rounded-xl px-4 py-2 text-xs outline-none focus:border-gold/30"
                            />
                            <Button onClick={() => calculateShipping()} disabled={isCalculating || cep.length < 8} variant="gold" size="sm">Ok</Button>
                          </div>
                        </div>
                      )}

                      {shippingCost !== null && !isFreeShipping && (
                        <div className="space-y-3 pt-3 animate-in fade-in slide-in-from-top-2 duration-500">
                          <div className="flex items-center gap-3">
                            <div className="h-[1px] flex-1 bg-gray-100" />
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider whitespace-nowrap">
                              Frete Estimado
                            </p>
                            <div className="h-[1px] flex-1 bg-gray-100" />
                          </div>
                          
                          <div className="group/option relative flex items-center justify-between p-4 bg-gray-50 rounded-[2rem] border border-gray-100 hover:bg-white hover:shadow-lg transition-all duration-300 cursor-default">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center text-gold group-hover/option:bg-gold group-hover/option:text-white transition-all duration-300">
                                <Truck size={20} />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-gray-900 uppercase tracking-wider">SEDEX Express</p>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest">3 dias úteis</p>
                              </div>
                            </div>
                            <span className="text-lg font-bold text-gold">{formatPrice(shippingCost)}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 px-2">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                        <span className="text-gray-400">Subtotal</span>
                        <span className="text-gray-900">{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                        <span className="text-gray-400">Frete</span>
                        <span className={cn(isFreeShipping ? "text-green-500" : "text-gray-900")}>
                          {isFreeShipping ? 'Grátis' : formatPrice(shipping)}
                        </span>
                      </div>
                      
                      {storeConfig.freeShippingEnabled && subtotal < freeShippingThreshold && (
                        <div className="bg-white p-4 rounded-[2rem] space-y-3 border border-gray-100 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Progresso Frete Grátis</span>
                            <span className="text-[10px] font-bold text-gold">{Math.round((subtotal / freeShippingThreshold) * 100)}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(subtotal / freeShippingThreshold) * 100}%` }}
                              className="h-full bg-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]"
                            />
                          </div>
                          <p className="text-[10px] text-gray-400 text-center font-medium uppercase tracking-wider">
                            Faltam {formatPrice(freeShippingThreshold - subtotal)} para frete grátis
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-8 border-t border-gray-200 flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Total do Pedido</p>
                      <p className="text-4xl font-bold tracking-tight text-gray-900">{formatPrice(total)}</p>
                    </div>
                  </div>

                  <Button 
                    onClick={handleCheckout}
                    disabled={cart.length === 0}
                    variant="gold"
                    size="lg"
                    className="w-full py-6"
                    icon={ArrowRight}
                  >
                    Finalizar Pedido
                  </Button>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-white border border-gray-100 rounded-[2rem] flex flex-col items-center text-center gap-3 hover:shadow-lg transition-all duration-300">
                    <ShieldCheck size={28} className="text-gold" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 leading-tight">Autenticidade Garantida</span>
                  </div>
                  <div className="p-6 bg-white border border-gray-100 rounded-[2rem] flex flex-col items-center text-center gap-3 hover:shadow-lg transition-all duration-300">
                    <Truck size={28} className="text-gold" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 leading-tight">Entrega Segurada</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
