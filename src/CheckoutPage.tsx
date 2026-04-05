import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, CreditCard, Truck, ShieldCheck, CheckCircle2, 
  ShoppingBag, MapPin, Phone, Mail, User as UserIcon, Lock,
  ArrowRight, ChevronRight, Star, Wallet, Info
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Product, CartItem, Order, User, StoreConfig } from './types';
import { getProducts, saveOrder, getCurrentUser, getStoreConfig } from './lib/storage';
import { cn, formatPrice } from './lib/utils';
import { Toast, ToastType, Button, Badge } from './components/UI';

export const CheckoutPage = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [storeConfig] = useState<StoreConfig>(getStoreConfig());
  const [toast, setToast] = useState<{ message: string, type: ToastType, isVisible: boolean }>({ message: '', type: 'success', isVisible: false });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [orderAddress, setOrderAddress] = useState('');
  const [orderShipping, setOrderShipping] = useState(0);
  
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);

    const savedCart = localStorage.getItem('chronos_cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      if (parsedCart.length === 0) {
        navigate('/');
      }
      setCart(parsedCart);
    } else {
      navigate('/');
    }

    const savedAddress = sessionStorage.getItem('chronos_order_address');
    const savedShipping = sessionStorage.getItem('chronos_order_shipping');
    
    if (savedAddress) setOrderAddress(savedAddress);
    if (savedShipping) setOrderShipping(JSON.parse(savedShipping));
  }, [navigate]);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = orderShipping; 
  const total = subtotal + shipping;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));

    const newOrderId = Math.random().toString(36).substr(2, 9).toUpperCase();
    const newOrder: Order = { 
      id: newOrderId, 
      userId: user.id,
      items: cart, 
      total: total, 
      customer: {
        name: user.name,
        email: user.email,
        address: orderAddress || user.address || 'Endereço não informado'
      }, 
      date: new Date().toISOString(),
      status: 'Processando',
      paymentMethod: 'Cartão de Crédito'
    };

    saveOrder(newOrder);
    localStorage.removeItem('chronos_cart');
    setOrderId(newOrderId);
    setIsProcessing(false);
    setIsCompleted(true);
    
    window.dispatchEvent(new Event('cartUpdated'));
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl w-full text-center space-y-12"
        >
          <div className="relative inline-block">
            <div className="w-32 h-32 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-xl relative z-10">
              <CheckCircle2 size={64} />
            </div>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="absolute -top-4 -right-4 w-12 h-12 bg-gold rounded-full flex items-center justify-center text-white shadow-lg z-20"
            >
              <Star size={24} fill="currentColor" />
            </motion.div>
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Pedido Confirmado</h1>
            <p className="text-gray-500 text-lg max-w-md mx-auto leading-relaxed">
              Obrigado pela sua confiança, {user?.name.split(' ')[0]}. <br />
              Seu relógio exclusivo já está sendo preparado por nossos mestres relojoeiros.
            </p>
          </div>

          <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 flex flex-col items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Número do Pedido</span>
            <span className="text-3xl font-bold tracking-tight text-gray-900">#{orderId}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button onClick={() => navigate('/')} variant="gold" size="lg" icon={ArrowRight}>
              Voltar para a Loja
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

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
          <Link to="/cart" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:text-gold transition-colors group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Voltar ao Carrinho
          </Link>
          
          <Link to="/" className="text-xl font-bold tracking-tight">
            CHRONOS<span className="text-gold">.</span>
          </Link>
          
          <div className="flex items-center gap-3 text-gray-400">
            <Lock size={18} className="shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider hidden md:block">Checkout Seguro</span>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-24 items-start">
            {/* Left Column: Form */}
            <div className="lg:col-span-7 space-y-12">
              <div className="flex flex-col sm:flex-row items-baseline sm:items-end justify-between mb-12 gap-4">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Finalizar Pedido</h1>
              </div>

              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 text-gold rounded-[2rem] flex items-center justify-center shadow-sm">
                    <UserIcon size={24} />
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight">Informações Pessoais</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Nome Completo</label>
                    <div className="text-lg font-bold text-gray-900">{user?.name}</div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">E-mail de Contato</label>
                    <div className="text-lg font-bold text-gray-900">{user?.email}</div>
                  </div>
                </div>
              </section>

              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 text-gold rounded-[2rem] flex items-center justify-center shadow-sm">
                    <Truck size={24} />
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight">Endereço de Entrega</h2>
                </div>
                
                  <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Local de Recebimento</label>
                      <div className="text-lg font-bold text-gray-900 leading-relaxed">
                        {orderAddress || user?.address || 'Nenhum endereço cadastrado em seu perfil.'}
                      </div>
                    </div>
                    {!(orderAddress || user?.address) && (
                      <Link to="/profile" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gold hover:text-gray-900 transition-colors group">
                        Atualizar Perfil <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    )}
                  </div>
              </section>

              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 text-gold rounded-[2rem] flex items-center justify-center shadow-sm">
                    <CreditCard size={24} />
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight">Método de Pagamento</h2>
                </div>
                
                <div className="p-8 border-2 border-gold bg-gold/5 rounded-[2rem] flex items-center justify-between shadow-lg shadow-gold/5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white text-[10px] font-bold tracking-widest">VISA</div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">Cartão de Crédito</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Processamento Seguro SSL</p>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center text-white">
                    <CheckCircle2 size={24} />
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-400">
                  <Info size={14} />
                  <p className="text-[10px] font-bold uppercase tracking-wider italic">
                    Ambiente de demonstração: Pagamento simulado.
                  </p>
                </div>
              </section>
            </div>

            {/* Right Column: Summary */}
            <div className="lg:col-span-5">
              <div className="sticky top-32 space-y-6">
                <div className="bg-gray-50 rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm">
                  <div className="p-8 border-b border-gray-100 bg-white">
                    <h3 className="text-3xl font-bold tracking-tight leading-none">Resumo do Pedido</h3>
                  </div>
                  
                  <div className="p-8 space-y-6 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {cart.map(item => (
                      <div key={item.id} className="flex gap-4 group">
                        <div className="w-20 h-20 bg-white rounded-[2rem] overflow-hidden flex-shrink-0 shadow-sm group-hover:shadow-lg transition-all duration-300">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                          <h4 className="text-base font-bold line-clamp-1 group-hover:text-gold transition-colors">{item.name}</h4>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.quantity}x {formatPrice(item.price)}</p>
                        </div>
                        <div className="flex flex-col justify-center text-right">
                          <span className="text-base font-bold text-gray-900">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-8 bg-white space-y-6">
                    <div className="space-y-3">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                        <span className="text-gray-400">Subtotal</span>
                        <span className="text-gray-900">{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                        <span className="text-gray-400">Frete</span>
                        <span className={cn(shipping === 0 ? "text-green-500" : "text-gray-900")}>
                          {shipping === 0 ? 'Grátis' : formatPrice(shipping)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Total a Pagar</p>
                        <p className="text-4xl font-bold tracking-tight text-gray-900">{formatPrice(total)}</p>
                      </div>
                    </div>

                    <Button 
                      onClick={handlePlaceOrder}
                      disabled={isProcessing || !(orderAddress || user?.address)}
                      variant="gold"
                      size="lg"
                      className="w-full py-6"
                      icon={ArrowRight}
                    >
                      {isProcessing ? "Processando..." : "Confirmar Pedido"}
                    </Button>

                    {!(orderAddress || user?.address) && (
                      <p className="text-[9px] text-red-500 text-center font-bold uppercase tracking-wider mt-4 animate-pulse">
                        Cadastre um endereço para continuar
                      </p>
                    )}
                  </div>

                  <div className="p-6 flex items-center justify-center gap-8 bg-gray-50/50">
                    <ShieldCheck size={20} className="text-gold" />
                    <div className="flex gap-3 opacity-30 grayscale">
                      <div className="w-8 h-5 bg-gray-900 rounded" />
                      <div className="w-8 h-5 bg-gray-900 rounded" />
                      <div className="w-8 h-5 bg-gray-900 rounded" />
                    </div>
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
