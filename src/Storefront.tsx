import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Menu, X, ChevronRight, Star, Search, Filter, Trash2, Plus, Minus, ArrowRight, CheckCircle2, LayoutDashboard, User as UserIcon, LogOut, Mail, Phone, MapPin, Instagram, Globe, ArrowUpRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Product, CartItem, Order, User, StoreConfig } from './types';
import { getProducts, saveOrder, getCurrentUser, setCurrentUser, clearAllSessions, getStoreConfig } from './lib/storage';
import { cn, formatPrice } from './lib/utils';
import { Toast, ToastType, Button, SectionHeading, Badge } from './components/UI';
import { Footer } from './components/Footer';

// --- Sub-components ---

const Navbar = ({ cartCount, onOpenCart, user, onLogout, storeConfig }: { cartCount: number, onOpenCart: () => void, user: User | null, onLogout: () => void, storeConfig: StoreConfig }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-700 px-6 py-6", 
      isScrolled ? "glass-effect py-4" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex-1 flex items-center gap-8">
          <div className="hidden md:flex items-center space-x-8 text-xs font-bold uppercase tracking-wider">
            <Link to="/" className="hover:text-gold transition-colors">
              Coleções
            </Link>
          </div>
        </div>

        <div className="flex-shrink-0 px-12">
          <Link 
            to="/" 
            className="flex items-center hover:scale-105 transition-transform"
          >
            {storeConfig.logo ? (
              <img src={storeConfig.logo} alt={storeConfig.name} className="h-8 sm:h-10 w-auto object-contain" referrerPolicy="no-referrer" />
            ) : (
              <span className="text-2xl sm:text-3xl font-bold tracking-tight">
                {storeConfig.name.toUpperCase()}
                <span className="text-gold">.</span>
              </span>
            )}
          </Link>
        </div>

        <div className="flex-1 flex justify-end items-center space-x-4">
          {user ? (
            <div className="flex items-center gap-4">
              <Link 
                to={user.role === 'admin' ? "/manager" : "/profile"} 
                className="flex items-center gap-2 group"
              >
                <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center group-hover:bg-gold transition-all">
                  {user.role === 'admin' ? <LayoutDashboard size={16} /> : <UserIcon size={16} />}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-[10px] font-bold uppercase text-gray-900">{user.name.split(' ')[0]}</p>
                </div>
              </Link>
              
              <button 
                onClick={onLogout} 
                className="p-2 hover:text-red-500 transition-colors" 
                title="Sair"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="p-2 hover:text-gold transition-colors" title="Entrar">
              <UserIcon size={24} />
            </Link>
          )}
          <Link to="/cart" className="relative p-2 hover:text-gold transition-colors group">
            <ShoppingBag size={24} />
            {cartCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-gold text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-lg border-2 border-white"
              >
                {cartCount}
              </motion.span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
};

const Hero = ({ storeConfig }: { storeConfig: StoreConfig }) => (
  <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gray-900 text-white">
    <motion.div 
      initial={{ scale: 1.1, opacity: 0 }} 
      animate={{ scale: 1, opacity: 0.6 }} 
      transition={{ duration: 2 }} 
      className="absolute inset-0 z-0"
    >
      <img 
        src={storeConfig.homepageBackground || "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&q=80&w=2000"} 
        alt="Hero" 
        className="w-full h-full object-cover" 
        referrerPolicy="no-referrer" 
      />
      <div className="absolute inset-0 bg-black/40" />
    </motion.div>
    
    <div className="relative z-10 text-center px-6 max-w-4xl">
      <motion.h1 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.5, duration: 0.8 }} 
        className="text-5xl sm:text-7xl font-bold mb-6 tracking-tight"
      >
        {storeConfig.heroTitle || "TIMELESS PRECISION"}
      </motion.h1>

      <motion.p 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 0.8, duration: 1 }} 
        className="text-gray-200 text-lg sm:text-xl mb-10 max-w-2xl mx-auto font-medium"
      >
        {storeConfig.description}
      </motion.p>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 1 }}
        className="flex justify-center"
      >
        <Button 
          onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })} 
          variant="gold"
          size="lg"
          icon={ChevronRight}
        >
          Explorar Coleção
        </Button>
      </motion.div>
    </div>
  </section>
);

const ProductCard = ({ product, onAddToCart }: any) => (
  <motion.div 
    layout 
    initial={{ opacity: 0, y: 20 }} 
    whileInView={{ opacity: 1, y: 0 }} 
    viewport={{ once: true }}
    className="group"
  >
    <div className="relative aspect-[3/4] overflow-hidden bg-gray-50 mb-6 rounded-[2rem] shadow-sm">
      {product.isBestSeller && (
        <div className="absolute top-4 left-4 z-10">
          <Badge variant="gold">
            <Star size={10} fill="currentColor" /> Best Seller
          </Badge>
        </div>
      )}

      {product.inStock === false && (
        <div className="absolute top-4 right-4 z-10">
          <Badge variant="outline" className="bg-white/90 backdrop-blur-sm text-red-600 border-red-200">
            ESGOTADO
          </Badge>
        </div>
      )}
      
      <Link to={`/product/${product.id}`} className="block w-full h-full">
        <img 
          src={product.images[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800"} 
          alt={product.name} 
          className={cn(
            "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105",
            product.inStock === false && "grayscale opacity-60"
          )} 
          referrerPolicy="no-referrer" 
        />
      </Link>
    </div>

    <div className="text-center">
      <p className="text-[10px] text-gold font-bold uppercase tracking-widest mb-1">{product.category}</p>
      <Link to={`/product/${product.id}`}>
        <h3 className="font-bold text-lg mb-1 group-hover:text-gold transition-colors">{product.name}</h3>
      </Link>
      <p className="text-gray-900 font-semibold">{formatPrice(product.price)}</p>
    </div>
  </motion.div>
);

export const Storefront = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('chronos_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [user, setUser] = useState<User | null>(null);
  const [storeConfig, setStoreConfig] = useState<StoreConfig>(getStoreConfig());
  const [filter, setFilter] = useState('Todos');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('default');
  const [toast, setToast] = useState<{ message: string, type: ToastType, isVisible: boolean }>({ message: '', type: 'success', isVisible: false });
  const navigate = useNavigate();

  useEffect(() => {
    setProducts(getProducts());
    setUser(getCurrentUser());

    const handleConfigUpdate = () => {
      setStoreConfig(getStoreConfig());
    };

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

    window.addEventListener('storeConfigUpdated', handleConfigUpdate);
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('storeConfigUpdated', handleConfigUpdate);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  useEffect(() => {
    const currentSaved = localStorage.getItem('chronos_cart');
    const currentCartStr = JSON.stringify(cart);
    if (currentSaved !== currentCartStr) {
      localStorage.setItem('chronos_cart', currentCartStr);
      window.dispatchEvent(new Event('cartUpdated'));
    }
  }, [cart]);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type, isVisible: true });
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    showToast(`${product.name} adicionado ao carrinho!`);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUser(null);
    navigate('/');
  };

  const categories = ['Todos', ...Array.from(new Set(products.map(p => p.category)))];
  const filteredProducts = products
    .filter(p => filter === 'Todos' || p.category === filter)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sort === 'price-asc' ? a.price - b.price : sort === 'price-desc' ? b.price - a.price : 0);

  return (
    <div className="min-h-screen bg-white">
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast({ ...toast, isVisible: false })} 
      />
      
      <Navbar 
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} 
        onOpenCart={() => navigate('/cart')} 
        user={user}
        onLogout={handleLogout}
        storeConfig={storeConfig}
      />

      <Hero storeConfig={storeConfig} />

      <section id="products" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-24 gap-12">
          <SectionHeading 
            subtitle="Nossa Curadoria"
            title={<>Coleções <br /> <span className="italic text-gold">Exclusivas</span></>}
            className="mb-0"
          />
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6"
          >
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Buscar relógio..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                className="bg-gray-50 border-none rounded-full pl-16 pr-10 py-5 focus:bg-white focus:ring-4 focus:ring-gold/5 outline-none text-sm w-full md:w-96 transition-all shadow-inner font-medium" 
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-gold" size={18} />
              <select 
                value={filter} 
                onChange={e => setFilter(e.target.value)} 
                className="bg-gray-50 rounded-full pl-14 pr-12 py-5 border-none focus:bg-white focus:ring-4 focus:ring-gold/5 outline-none text-[10px] font-black uppercase tracking-widest appearance-none cursor-pointer transition-all shadow-inner w-full sm:w-56"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <ChevronRight size={16} className="rotate-90" />
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div 
          layout 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24"
        >
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={addToCart} 
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredProducts.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-32 text-center"
          >
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-300">
              <Search size={40} />
            </div>
            <h3 className="text-2xl font-sans mb-4">Nenhum resultado encontrado</h3>
            <p className="text-gray-500 font-light">Tente ajustar seus filtros ou busca.</p>
            <Button 
              variant="outline" 
              className="mt-10"
              onClick={() => { setSearch(''); setFilter('Todos'); }}
            >
              Limpar Filtros
            </Button>
          </motion.div>
        )}
      </section>

      <Footer storeConfig={storeConfig} />
    </div>
  );
};
