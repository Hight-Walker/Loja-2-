import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, ArrowLeft, CheckCircle2, Star, Shield, Truck, ArrowRight, Share2, Heart, ChevronRight, ChevronLeft } from 'lucide-react';
import { Product, CartItem, StoreConfig } from './types';
import { getProducts, getStoreConfig } from './lib/storage';
import { formatPrice, cn } from './lib/utils';
import { Toast, ToastType, Button, Badge } from './components/UI';
import { Footer } from './components/Footer';

export const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string, type: ToastType, isVisible: boolean }>({ message: '', type: 'success', isVisible: false });
  const [cartCount, setCartCount] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [storeConfig, setStoreConfig] = useState<StoreConfig | null>(null);

  useEffect(() => {
    setStoreConfig(getStoreConfig());
  }, []);

  useEffect(() => {
    const updateCartCount = () => {
      const saved = localStorage.getItem('chronos_cart');
      if (saved) {
        const cart: CartItem[] = JSON.parse(saved);
        setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
      } else {
        setCartCount(0);
      }
    };

    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);
    return () => window.removeEventListener('cartUpdated', updateCartCount);
  }, []);

  useEffect(() => {
    const products = getProducts();
    const found = products.find(p => p.id === id);
    if (found) {
      setProduct(found);
      setRelatedProducts(products.filter(p => p.category === found.category && p.id !== found.id).slice(0, 4));
    }
    setLoading(false);
    window.scrollTo(0, 0);
  }, [id]);

  const addToCart = () => {
    if (!product) return;
    const savedCart = localStorage.getItem('chronos_cart');
    let cart: CartItem[] = savedCart ? JSON.parse(savedCart) : [];
    
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      cart = cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('chronos_cart', JSON.stringify(cart));
    setToast({ message: 'Produto adicionado ao carrinho!', type: 'success', isVisible: true });
    window.dispatchEvent(new Event('cartUpdated'));
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="h-screen flex flex-col items-center justify-center gap-8 bg-white px-6 text-center">
      <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
        <ShoppingBag size={48} />
      </div>
      <div>
        <h2 className="text-3xl font-bold mb-4">Produto não encontrado</h2>
        <p className="text-gray-500 mb-8">O item que você procura pode ter sido removido ou não existe.</p>
        <Button onClick={() => navigate('/')} variant="primary">Voltar para a loja</Button>
      </div>
    </div>
  );

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
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:text-gold transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Voltar
          </button>
          
          <Link to="/" className="text-xl font-bold tracking-tight">
            CHRONOS<span className="text-gold">.</span>
          </Link>
          
          <Link to="/cart" className="relative p-2 hover:text-gold transition-colors group">
            <ShoppingBag size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gold text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-lg border-2 border-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </nav>

      <main className="pt-32 pb-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-24 items-start">
            {/* Image Section */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-gray-50 shadow-xl group">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={activeImageIndex}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5 }}
                    src={product.images[activeImageIndex] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800"} 
                    alt={product.name} 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer" 
                  />
                </AnimatePresence>
                
                <div className="absolute top-6 right-6 flex flex-col gap-3 z-10">
                  <button 
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg backdrop-blur-md border border-white/20",
                      isFavorite ? "bg-red-500 text-white border-red-500" : "bg-white/80 text-gray-900 hover:bg-white"
                    )}
                  >
                    <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-gray-900 hover:bg-white transition-all shadow-lg">
                    <Share2 size={18} />
                  </button>
                </div>

                {product.images.length > 1 && (
                  <>
                    <button 
                      onClick={() => setActiveImageIndex(prev => (prev - 1 + product.images.length) % product.images.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-gray-900 hover:bg-white transition-all shadow-lg z-10"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button 
                      onClick={() => setActiveImageIndex(prev => (prev + 1) % product.images.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-gray-900 hover:bg-white transition-all shadow-lg z-10"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>

              {product.images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={cn(
                        "relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all",
                        activeImageIndex === idx ? "border-gold scale-105 shadow-md" : "border-transparent opacity-60 hover:opacity-100"
                      )}
                    >
                      <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Content Section */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col"
            >
              <div className="flex items-center gap-3 mb-6">
                <Badge variant="gray">{product.category}</Badge>
                {product.isBestSeller && (
                  <Badge variant="gold">
                    <Star size={10} fill="currentColor" /> Best Seller
                  </Badge>
                )}
                {product.inStock === false && (
                  <Badge variant="error">ESGOTADO</Badge>
                )}
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="text-3xl font-bold text-gold">{formatPrice(product.price)}</div>
                <div className="h-8 w-[1px] bg-gray-100" />
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Pronta Entrega <br /> 
                  {product.inStock !== false ? (
                    <span className="text-green-500">Em Estoque</span>
                  ) : (
                    <span className="text-red-500">Esgotado</span>
                  )}
                </div>
              </div>
              
              <div className="mb-10">
                <p className="text-gray-500 leading-relaxed text-lg border-l-4 border-gold/20 pl-6 py-1">
                  {product.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                <div className="p-6 bg-gray-50 rounded-[2rem] flex flex-col items-center text-center group hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gold/10">
                  <Truck size={28} className="text-gold mb-3 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 group-hover:text-gray-900">Frete Grátis</span>
                </div>
                <div className="p-6 bg-gray-50 rounded-[2rem] flex flex-col items-center text-center group hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gold/10">
                  <Shield size={28} className="text-gold mb-3 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 group-hover:text-gray-900">2 Anos Garantia</span>
                </div>
                <div className="p-6 bg-gray-50 rounded-[2rem] flex flex-col items-center text-center group hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gold/10">
                  <CheckCircle2 size={28} className="text-gold mb-3 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 group-hover:text-gray-900">Original</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                <Button 
                  onClick={addToCart}
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  disabled={product.inStock === false}
                >
                  {product.inStock === false ? "Produto Esgotado" : "Adicionar ao Carrinho"}
                </Button>
                <Button 
                  onClick={() => {
                    addToCart();
                    navigate('/cart');
                  }}
                  variant="gold"
                  size="lg"
                  className="flex-1"
                  icon={ArrowRight}
                  disabled={product.inStock === false}
                >
                  {product.inStock === false ? "Esgotado" : "Comprar Agora"}
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <section className="mt-32">
              <div className="flex items-end justify-between mb-12">
                <div>
                  <span className="text-gold uppercase tracking-wider text-xs font-bold mb-2 block">Você também pode gostar</span>
                  <h2 className="text-3xl md:text-4xl font-bold">Produtos Relacionados</h2>
                </div>
                <Link to="/" className="text-xs font-bold uppercase tracking-wider hover:text-gold transition-colors flex items-center gap-2 group">
                  Ver Todos <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {relatedProducts.map((p) => (
                  <motion.div 
                    key={p.id}
                    whileHover={{ y: -5 }}
                    className="group"
                  >
                    <Link to={`/product/${p.id}`}>
                      <div className="aspect-[3/4] rounded-[2rem] overflow-hidden bg-gray-50 mb-4 shadow-sm group-hover:shadow-lg transition-all duration-300">
                        <img 
                          src={p.images[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800"} 
                          alt={p.name} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                          referrerPolicy="no-referrer" 
                        />
                      </div>
                      <h3 className="font-bold text-lg mb-1 group-hover:text-gold transition-colors">{p.name}</h3>
                      <p className="text-gold font-bold text-sm">{formatPrice(p.price)}</p>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      {storeConfig && <Footer storeConfig={storeConfig} />}
    </div>
  );
};
