import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Package, ShoppingCart, BarChart3, Plus, Edit2, Trash2, 
  TrendingUp, DollarSign, Users, ArrowUpRight, ArrowDownRight, LogOut, X, Image as ImageIcon,
  Store, Globe, Instagram, Mail, Phone, MapPin, Menu, AlertCircle, Truck, User as ProfileIcon, Hash, Calendar, ArrowLeft, Lock,
  ChevronRight, ChevronDown, Eye, Star, Filter, Search, MoreVertical, ExternalLink, CheckCircle, XCircle, Clock, Save, User as UserIcon, Printer
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Product, Order, AnalyticsData, User, StoreConfig, OrderStatus, PaymentMethod } from './types';
import { 
  getProducts, saveProducts, getOrders, saveOrders, getUsers, saveUsers, 
  setCurrentUser, clearAllSessions, getStoreConfig, saveStoreConfig, 
  updateOrder, deleteOrder, updateUser, getCurrentUser 
} from './lib/storage';
import { formatPrice, cn } from './lib/utils';
import { Toast, Modal, Button, Badge, SectionHeading, ToastType } from './components/UI';
import { ContentDeclaration } from './components/ContentDeclaration';

// --- Admin Components ---

const StatCard = ({ title, value, icon: Icon, trend, trendValue }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden group"
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
    <div className="flex items-center justify-between mb-6 relative z-10">
      <div className="p-4 bg-gray-50 rounded-[1.5rem] text-gold group-hover:bg-gold group-hover:text-white transition-colors">
        <Icon size={24} />
      </div>
      {trend && (
        <div className={cn(
          "flex items-center gap-1 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest",
          trend === 'up' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
        )}>
          {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {trendValue}
        </div>
      )}
    </div>
    <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2 relative z-10">{title}</h3>
    <p className="text-3xl font-sans text-gray-900 relative z-10">{value}</p>
  </motion.div>
);

const ProductModal = ({ product, collections, onClose, onSave, showToast }: { product: Product | null, collections: string[], onClose: () => void, onSave: (p: Product) => void, showToast: (m: string, t?: ToastType) => void }) => {
  const [formData, setFormData] = useState<Product>(product || {
    id: Math.random().toString(36).substr(2, 9),
    name: '',
    price: 0,
    description: '',
    images: [],
    category: collections[0] || 'Luxo',
    isBestSeller: false,
    inStock: true
  });

  const [newImageUrl, setNewImageUrl] = useState('');

  const addImage = (url: string) => {
    if (!url) return;
    setFormData(prev => ({ ...prev, images: [...prev.images, url] }));
    setNewImageUrl('');
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const newImages = [...formData.images];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newImages.length) return;
    [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
    setFormData({ ...formData, images: newImages });
  };

  return (
    <Modal 
      isOpen={true} 
      onClose={onClose} 
      title={product ? "Editar Produto" : "Novo Produto"}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Nome do Produto</label>
            <input 
              required 
              type="text" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-gray-50 border-none rounded-[2rem] p-4 outline-none focus:ring-2 focus:ring-gold transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Preço (R$)</label>
            <input 
              required 
              type="number" 
              step="0.01"
              value={formData.price === 0 ? '' : formData.price} 
              onChange={e => {
                const val = e.target.value;
                setFormData({...formData, price: val === '' ? 0 : Number(val)});
              }} 
              className="w-full bg-gray-50 border-none rounded-[2rem] p-4 outline-none focus:ring-2 focus:ring-gold transition-all"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Imagens do Produto</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="relative">
                  <input 
                    type="file" 
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      files.forEach((file: File) => {
                        if (file.size > 1024 * 1024) {
                          showToast(`A imagem ${file.name} é muito grande (>1MB).`, 'error');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          addImage(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      });
                    }}
                    className="hidden"
                    id="product-image-upload"
                  />
                  <label 
                    htmlFor="product-image-upload"
                    className="flex items-center justify-center gap-3 w-full bg-gray-50 hover:bg-gray-100 text-gray-600 py-4 rounded-[2rem] cursor-pointer transition-all border-2 border-dashed border-gray-200 text-[10px] font-bold uppercase tracking-widest"
                  >
                    <Plus size={18} /> Upload de Fotos
                  </label>
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Ou cole a URL da imagem aqui..."
                    value={newImageUrl} 
                    onChange={e => setNewImageUrl(e.target.value)}
                    className="flex-1 bg-gray-50 border-none rounded-[2rem] p-4 outline-none focus:ring-2 focus:ring-gold transition-all text-xs"
                  />
                  <Button 
                    type="button" 
                    variant="gold" 
                    size="sm" 
                    onClick={() => addImage(newImageUrl)}
                    disabled={!newImageUrl}
                  >
                    Add
                  </Button>
                </div>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {formData.images.length > 0 ? (
                  formData.images.map((img, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-gray-50 p-3 rounded-2xl group border border-transparent hover:border-gold/20 transition-all">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-white shrink-0 border border-gray-100">
                        <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-gray-400 uppercase truncate">Imagem {idx + 1} {idx === 0 && "(Principal)"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          type="button"
                          onClick={() => moveImage(idx, 'up')}
                          disabled={idx === 0}
                          className="p-2 bg-white rounded-xl text-gray-400 hover:text-gold disabled:opacity-20 shadow-sm border border-gray-100 transition-all active:scale-95"
                          title="Mover para cima"
                        >
                          <ChevronDown size={18} className="rotate-180" />
                        </button>
                        <button 
                          type="button"
                          onClick={() => moveImage(idx, 'down')}
                          disabled={idx === formData.images.length - 1}
                          className="p-2 bg-white rounded-xl text-gray-400 hover:text-gold disabled:opacity-20 shadow-sm border border-gray-100 transition-all active:scale-95"
                          title="Mover para baixo"
                        >
                          <ChevronDown size={18} />
                        </button>
                        {idx !== 0 && (
                          <button 
                            type="button"
                            onClick={() => {
                              const newImages = [...formData.images];
                              const [moved] = newImages.splice(idx, 1);
                              newImages.unshift(moved);
                              setFormData({ ...formData, images: newImages });
                            }}
                            className="p-2 bg-white rounded-xl text-gray-400 hover:text-gold shadow-sm border border-gray-100 transition-all active:scale-95"
                            title="Definir como principal"
                          >
                            <Star size={18} />
                          </button>
                        )}
                        <button 
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="p-2 bg-white rounded-xl text-gray-400 hover:text-red-500 shadow-sm border border-gray-100 transition-all active:scale-95"
                          title="Remover"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200 text-gray-300">
                    <ImageIcon size={40} />
                    <p className="text-[10px] font-bold uppercase tracking-widest mt-2">Nenhuma imagem</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Coleção</label>
            <select 
              value={formData.category} 
              onChange={e => setFormData({...formData, category: e.target.value})}
              className="w-full bg-gray-50 border-none rounded-[2rem] p-4 outline-none focus:ring-2 focus:ring-gold transition-all appearance-none"
            >
              <option value="">Selecione uma coleção</option>
              {collections.map((c: string) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-[2rem]">
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1">Em Estoque</p>
              <p className="text-[8px] text-gray-400">Disponível para compra.</p>
            </div>
            <button 
              type="button"
              onClick={() => setFormData({...formData, inStock: !formData.inStock})}
              className={cn(
                "w-10 h-5 rounded-full transition-all relative",
                formData.inStock !== false ? "bg-green-500" : "bg-red-500"
              )}
            >
              <div className={cn(
                "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                formData.inStock !== false ? "right-1" : "left-1"
              )} />
            </button>
          </div>
          <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-[2rem]">
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1">Best Seller</p>
              <p className="text-[8px] text-gray-400">Exibir na seção de mais vendidos.</p>
            </div>
            <button 
              type="button"
              onClick={() => setFormData({...formData, isBestSeller: !formData.isBestSeller})}
              className={cn(
                "w-10 h-5 rounded-full transition-all relative",
                formData.isBestSeller ? "bg-gold" : "bg-gray-300"
              )}
            >
              <div className={cn(
                "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                formData.isBestSeller ? "right-1" : "left-1"
              )} />
            </button>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Descrição</label>
            <textarea 
              rows={4}
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full bg-gray-50 border-none rounded-[2rem] p-4 outline-none focus:ring-2 focus:ring-gold transition-all resize-none"
            />
          </div>
        </div>
        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onSave(formData)}>Salvar Produto</Button>
        </div>
      </div>
    </Modal>
  );
};

const OrderModal = ({ order, onClose, onSave, storeConfig }: { order: Order, onClose: () => void, onSave: (o: Order) => void, storeConfig: StoreConfig }) => {
  const [formData, setFormData] = useState<Order>({ ...order });
  const [showDeclaration, setShowDeclaration] = useState(false);

  // Auto-save logic
  useEffect(() => {
    const normalize = (o: any) => ({
      ...o,
      trackingNumber: o.trackingNumber || '',
      status: o.status || 'Pendente',
      paymentMethod: o.paymentMethod || 'Pix'
    });

    const timer = setTimeout(() => {
      const currentData = JSON.stringify(normalize(formData));
      const originalData = JSON.stringify(normalize(order));
      
      if (currentData !== originalData) {
        onSave(formData);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData, order, onSave]);

  const statuses: OrderStatus[] = ['Pendente', 'Processando', 'Processado', 'Enviado', 'Entregue', 'Cancelado'];
  const paymentMethods: PaymentMethod[] = ['Cartão de Crédito', 'Boleto', 'Pix'];

  const handlePrint = () => {
    setFormData(prev => ({ ...prev, status: 'Processado' }));
    window.print();
  };

  if (showDeclaration) {
    return (
      <Modal 
        isOpen={true} 
        onClose={() => setShowDeclaration(false)} 
        title="Declaração de Conteúdo"
        size="2xl"
      >
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 no-print bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
            <div className="space-y-1">
              <p className="text-sm font-bold text-gray-900">Pronto para Envio</p>
              <p className="text-xs text-gray-400 font-medium italic">A declaração será impressa em duas cópias (A4). Selecione "Salvar como PDF" na tela de impressão se desejar o arquivo digital.</p>
            </div>
            <div className="flex gap-4 w-full sm:w-auto">
              <Button variant="outline" onClick={() => setShowDeclaration(false)} className="flex-1 sm:flex-none">Voltar</Button>
              <Button variant="secondary" onClick={handlePrint} className="flex-1 sm:flex-none">Salvar PDF</Button>
              <Button onClick={handlePrint} icon={Printer} className="flex-1 sm:flex-none shadow-lg shadow-gold/20">Imprimir</Button>
            </div>
          </div>
          <div className="bg-white overflow-auto p-2 sm:p-8 rounded-xl border border-gray-100 shadow-inner">
            <ContentDeclaration order={order} storeConfig={storeConfig} />
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal 
      isOpen={true} 
      onClose={onClose} 
      title={`Pedido #${order.id.slice(0, 8)}`}
      size="2xl"
    >
      <div className="space-y-8 no-print">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Status do Pedido</h4>
            <div className="relative">
              <select 
                value={formData.status} 
                onChange={e => setFormData({...formData, status: e.target.value as OrderStatus})} 
                className="w-full bg-gray-50 border-none rounded-[2rem] p-4 pr-12 outline-none focus:ring-2 focus:ring-gold transition-all appearance-none text-sm font-medium"
              >
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Forma de Pagamento</h4>
            <div className="relative">
              <select 
                value={formData.paymentMethod} 
                onChange={e => setFormData({...formData, paymentMethod: e.target.value as PaymentMethod})} 
                className="w-full bg-gray-50 border-none rounded-[2rem] p-4 pr-12 outline-none focus:ring-2 focus:ring-gold transition-all appearance-none text-sm font-medium"
              >
                {paymentMethods.map(pm => <option key={pm} value={pm}>{pm}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Código de Rastreio</h4>
            {formData.trackingNumber && (
              <span className="text-[9px] font-bold text-green-500 uppercase tracking-widest flex items-center gap-1">
                <CheckCircle size={10} /> Salvo Automaticamente
              </span>
            )}
          </div>
          <div className="relative group">
            <Truck size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold transition-colors" />
            <input 
              type="text" 
              placeholder="Ex: AA123456789BR"
              value={formData.trackingNumber || ''} 
              onChange={e => {
                const val = e.target.value;
                setFormData(prev => ({
                  ...prev,
                  trackingNumber: val,
                  status: val.trim() ? 'Enviado' : prev.status
                }));
              }}
              className="w-full bg-gray-50 border-none rounded-[2rem] pl-14 pr-6 py-4 outline-none focus:ring-2 focus:ring-gold transition-all font-mono uppercase text-sm placeholder:font-sans placeholder:normal-case"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Informações do Cliente</h4>
            <div className="p-6 bg-gray-50 rounded-[2.5rem] space-y-3 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gold shadow-sm">
                  <UserIcon size={14} />
                </div>
                <p className="text-sm font-bold text-gray-900">{formData.customer.name}</p>
              </div>
              <div className="space-y-1 pl-11">
                <p className="text-xs text-gray-500 flex items-center gap-2"><Mail size={10} /> {formData.customer.email}</p>
                <p className="text-xs text-gray-500 flex items-start gap-2"><MapPin size={10} className="mt-0.5 shrink-0" /> {formData.customer.address}</p>
                {formData.customer.cpf && <p className="text-xs text-gray-500 font-mono flex items-center gap-2"><Hash size={10} /> CPF: {formData.customer.cpf}</p>}
              </div>
            </div>
          </div>
          <div className="space-y-4 flex flex-col justify-end">
            <Button 
              variant="outline" 
              className="w-full border-dashed border-2 hover:border-gold hover:bg-gold/5 h-full min-h-[120px] flex flex-col gap-3 rounded-[2.5rem]"
              onClick={() => setShowDeclaration(true)}
            >
              <Printer size={24} className="text-gold" />
              <div className="text-center">
                <span className="block text-sm font-bold text-gray-900">Declaração Correios</span>
                <span className="block text-[10px] text-gray-400 uppercase tracking-widest mt-1">Gerar e Imprimir</span>
              </div>
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Itens do Pedido</h4>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {formData.items.map((item, idx) => (
              <motion.div 
                key={idx} 
                whileHover={{ x: 5 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-[2rem] border border-gray-100 hover:border-gold/20 hover:bg-white hover:shadow-md transition-all duration-300 group"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img src={item.image} alt={item.name} className="w-14 h-14 rounded-[1.5rem] object-cover shadow-sm group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-gold text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                      {item.quantity}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 truncate max-w-[150px] sm:max-w-[250px]">{item.name}</p>
                    <p className="text-[10px] text-gray-400 font-medium">{formatPrice(item.price)} cada</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-gold">{formatPrice(item.price * item.quantity)}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-8 border-t border-gray-100">
          <div className="text-center sm:text-left">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Total do Pedido</p>
            <p className="text-3xl font-sans text-gold">{formatPrice(formData.total)}</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none">Fechar Detalhes</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

const UserModal = ({ user, onClose, onSave }: { user: User | null, onClose: () => void, onSave: (u: User) => void }) => {
  const [formData, setFormData] = useState<User>(user || {
    id: Math.random().toString(36).substr(2, 9),
    name: '',
    email: '',
    password: '',
    role: 'user'
  });

  return (
    <Modal 
      isOpen={true} 
      onClose={onClose} 
      title={user ? "Editar Cliente" : "Novo Cliente"}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Nome</label>
            <input 
              required 
              type="text" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-gray-50 border-none rounded-[2rem] p-4 outline-none focus:ring-2 focus:ring-gold transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Email</label>
            <input 
              required 
              type="email" 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full bg-gray-50 border-none rounded-[2rem] p-4 outline-none focus:ring-2 focus:ring-gold transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Senha</label>
            <div className="relative">
              <input 
                required 
                type="text" 
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full bg-gray-50 border-none rounded-[2rem] p-4 outline-none focus:ring-2 focus:ring-gold transition-all"
              />
              <Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Nível de Acesso</label>
            <select 
              value={formData.role} 
              onChange={e => setFormData({...formData, role: e.target.value as 'admin' | 'user'})}
              className="w-full bg-gray-50 border-none rounded-[2rem] p-4 outline-none focus:ring-2 focus:ring-gold transition-all appearance-none"
            >
              <option value="user">Cliente</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">CPF</label>
            <input 
              type="text" 
              value={formData.cpf || ''} 
              onChange={e => setFormData({...formData, cpf: e.target.value})}
              className="w-full bg-gray-50 border-none rounded-[2rem] p-4 outline-none focus:ring-2 focus:ring-gold transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Telefone</label>
            <input 
              type="text" 
              value={formData.phone || ''} 
              onChange={e => setFormData({...formData, phone: e.target.value})}
              className="w-full bg-gray-50 border-none rounded-[2rem] p-4 outline-none focus:ring-2 focus:ring-gold transition-all"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Endereço</label>
            <textarea 
              rows={2}
              value={formData.address || ''} 
              onChange={e => setFormData({...formData, address: e.target.value})}
              className="w-full bg-gray-50 border-none rounded-[2rem] p-4 outline-none focus:ring-2 focus:ring-gold transition-all resize-none"
            />
          </div>
        </div>
        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onSave(formData)}>Salvar Alterações</Button>
        </div>
      </div>
    </Modal>
  );
};

// --- Main Admin Page ---

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [storeConfig, setStoreConfig] = useState<StoreConfig>(() => {
    const config = getStoreConfig();
    // Ensure default collections are present if none exist
    if (!config.collections || config.collections.length === 0) {
      return {
        ...config,
        collections: ["Luxo", "Minimalista", "Clássico", "Esportivo"]
      };
    }
    return config;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  
  // Profile State
  const [user, setUser] = useState<User | null>(null);
  const [profileFormData, setProfileFormData] = useState<User | null>(null);
  const isInitialMount = React.useRef(true);
  const toastTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  
  // Custom UI State
  const [toast, setToast] = useState<{ message: string, type: ToastType, isVisible: boolean }>({ message: '', type: 'success', isVisible: false });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, type: 'product' | 'order', id: string | null }>({ isOpen: false, type: 'product', id: null });
  
  const navigate = useNavigate();

  useEffect(() => {
    setProducts(getProducts());
    setOrders(getOrders());
    setUsers(getUsers());
    
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setProfileFormData(currentUser);
    }
    
    // Set initial mount to false after a short delay to avoid triggering auto-save toasts on load
    setTimeout(() => {
      isInitialMount.current = false;
    }, 500);
  }, []);

  // Auto-save Store Config
  useEffect(() => {
    if (isInitialMount.current) return;
    saveStoreConfig(storeConfig);
    window.dispatchEvent(new Event('storeConfigUpdated'));
    
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      showToast('Configurações da loja salvas!');
    }, 1000);
  }, [storeConfig]);

  // Auto-save Products
  useEffect(() => {
    if (isInitialMount.current) return;
    if (products.length > 0) {
      saveProducts(products);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => {
        showToast('Produtos atualizados!');
      }, 1000);
    }
  }, [products]);

  // Auto-save Orders
  useEffect(() => {
    if (isInitialMount.current) return;
    if (orders.length > 0) {
      saveOrders(orders);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => {
        showToast('Pedidos atualizados!');
      }, 1000);
    }
  }, [orders]);

  // Auto-save Profile
  useEffect(() => {
    if (isInitialMount.current) return;
    if (profileFormData && user) {
      updateUser(profileFormData);
      const isPersistent = !!localStorage.getItem('chronos_current_user');
      setCurrentUser(profileFormData, isPersistent);
      setUser(profileFormData);
      
      // Also update in users list
      const updatedUsers = users.map(u => u.id === profileFormData.id ? profileFormData : u);
      setUsers(updatedUsers);
      
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => {
        showToast('Perfil atualizado!');
      }, 1000);
    }
  }, [profileFormData]);

  // Auto-save Users List
  useEffect(() => {
    if (isInitialMount.current) return;
    if (users.length > 0) {
      saveUsers(users);
    }
  }, [users]);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type, isVisible: true });
  };

  const handleSaveProduct = useCallback((product: Product) => {
    setProducts(prev => {
      let newProducts;
      if (prev.find(p => p.id === product.id)) {
        newProducts = prev.map(p => p.id === product.id ? product : p);
      } else {
        newProducts = [...prev, product];
      }
      saveProducts(newProducts);
      return newProducts;
    });
    setIsModalOpen(false);
    setEditingProduct(null);
    showToast('Produto salvo com sucesso!');
  }, []);

  const handleAddCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    
    const collections = storeConfig.collections || [];
    if (collections.includes(newCollectionName.trim())) {
      showToast('Esta coleção já existe.', 'error');
      return;
    }
    
    const updatedConfig = {
      ...storeConfig,
      collections: [...collections, newCollectionName.trim()]
    };
    setStoreConfig(updatedConfig);
    setNewCollectionName('');
    showToast('Coleção adicionada com sucesso!');
  };

  const handleDeleteCollection = (collectionName: string) => {
    const productsInCollection = products.filter(p => p.category === collectionName);
    
    if (productsInCollection.length > 0) {
      if (!window.confirm(`Existem ${productsInCollection.length} produtos nesta coleção. Ao excluí-la, esses produtos ficarão sem categoria. Deseja continuar?`)) {
        return;
      }
      
      // Update products to have no category or a default one
      const updatedProducts = products.map(p => 
        p.category === collectionName ? { ...p, category: 'Sem Categoria' } : p
      );
      setProducts(updatedProducts);
    }

    const collections = storeConfig.collections || [];
    const updatedConfig = {
      ...storeConfig,
      collections: collections.filter(c => c !== collectionName)
    };
    setStoreConfig(updatedConfig);
    showToast('Coleção removida com sucesso!');
  };

  const handleSaveOrder = useCallback((order: Order) => {
    setOrders(prev => prev.map(o => o.id === order.id ? order : o));
    // Auto-save handled by useEffect
  }, []);

  const handleSaveUser = useCallback((userToSave: User) => {
    setUsers(prev => {
      const exists = prev.find(u => u.id === userToSave.id);
      let newUsers;
      if (exists) {
        newUsers = prev.map(u => u.id === userToSave.id ? userToSave : u);
      } else {
        newUsers = [...prev, userToSave];
      }
      saveUsers(newUsers);
      return newUsers;
    });
    setIsUserModalOpen(false);
    setEditingUser(null);
    showToast('Cliente salvo com sucesso!');
  }, []);

  const handleDeleteProduct = (id: string) => {
    setDeleteModal({ isOpen: true, type: 'product', id });
  };

  const handleDeleteOrder = (id: string) => {
    setDeleteModal({ isOpen: true, type: 'order', id });
  };

  const confirmDelete = () => {
    if (deleteModal.id) {
      if (deleteModal.type === 'product') {
        const newProducts = products.filter(p => p.id !== deleteModal.id);
        setProducts(newProducts);
        showToast('Produto excluído com sucesso!', 'info');
      } else {
        const newOrders = orders.filter(o => o.id !== deleteModal.id);
        setOrders(newOrders);
        showToast('Pedido excluído com sucesso!', 'info');
      }
      setDeleteModal({ isOpen: false, type: 'product', id: null });
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit for localStorage
        showToast('A imagem é muito grande. Por favor, escolha uma imagem menor que 1MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setStoreConfig(prev => ({ ...prev, logo: reader.result as string }));
        showToast('Logo atualizada com sucesso!', 'success');
      };
      reader.readAsDataURL(file);
      // Reset input value to allow selecting the same file again
      e.target.value = '';
    }
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit for localStorage
        showToast('A imagem é muito grande. Por favor, escolha uma imagem menor que 1MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setStoreConfig(prev => ({ ...prev, homepageBackground: reader.result as string }));
        showToast('Background atualizado com sucesso!', 'success');
      };
      reader.readAsDataURL(file);
      // Reset input value to allow selecting the same file again
      e.target.value = '';
    }
  };

  const handleSaveStoreConfig = () => {
    saveStoreConfig(storeConfig);
    showToast('Configurações da loja salvas com sucesso!');
  };

  const handleSaveProfile = () => {
    if (profileFormData) {
      updateUser(profileFormData);
      setUser(profileFormData);
      showToast('Perfil atualizado com sucesso!');
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalSalesCount = orders.length;

  // Simple Analytics
  const productSalesMap: Record<string, number> = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      productSalesMap[item.name] = (productSalesMap[item.name] || 0) + item.quantity;
    });
  });

  const sortedSales = Object.entries(productSalesMap).sort((a, b) => b[1] - a[1]);
  const bestSellers = sortedSales.slice(0, 5);
  const leastSold = sortedSales.reverse().slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Toast Notification */}
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast({ ...toast, isVisible: false })} 
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, type: 'product', id: null })}
        title="Confirmar Exclusão"
      >
        <div className="flex flex-col items-center text-center gap-6 py-4">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center">
            <AlertCircle size={40} />
          </div>
          <div className="space-y-2">
            <p className="text-gray-600">Tem certeza que deseja excluir este {deleteModal.type === 'product' ? 'produto' : 'pedido'}?</p>
            <p className="text-xs text-gray-400">Esta ação é irreversível e removerá permanentemente os dados do sistema.</p>
          </div>
          <div className="flex gap-4 w-full pt-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setDeleteModal({ isOpen: false, type: 'product', id: null })}
            >
              Cancelar
            </Button>
            <Button 
              className="flex-1 bg-red-600 hover:bg-red-700"
              onClick={confirmDelete}
            >
              Excluir
            </Button>
          </div>
        </div>
      </Modal>

      {/* Mobile Header */}
      <div className="md:hidden bg-gray-900 text-white p-4 flex items-center justify-between sticky top-0 z-[60]">
        <div onClick={() => navigate('/')} className="flex items-center gap-2 cursor-pointer">
          {storeConfig.logo ? (
            <img src={storeConfig.logo} alt={storeConfig.name} className="h-6 w-auto object-contain" referrerPolicy="no-referrer" />
          ) : (
            <span className="text-xl font-sans font-bold tracking-tighter">{storeConfig.name}<span className="text-gold">.</span></span>
          )}
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[50] md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "w-72 bg-gray-900 text-white flex flex-col fixed h-full z-[70] transition-transform duration-500 md:translate-x-0 border-r border-white/5 shadow-2xl",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Mobile Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 md:hidden">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gold rounded-full" />
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Menu</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div 
          onClick={() => navigate('/')}
          className="p-10 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-all group hidden md:block"
        >
          {storeConfig.logo ? (
            <img src={storeConfig.logo} alt={storeConfig.name} className="h-10 w-auto object-contain mb-2" referrerPolicy="no-referrer" />
          ) : (
            <h1 className="text-3xl font-sans font-bold tracking-tighter group-hover:text-gold transition-colors">{storeConfig.name}<span className="text-gold">.</span></h1>
          )}
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 bg-gold rounded-full animate-pulse" />
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em]">Admin Panel</p>
          </div>
        </div>
        
        <nav className="flex-1 p-8 space-y-3 overflow-y-auto custom-scrollbar">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'products', label: 'Produtos', icon: Package },
            { id: 'orders', label: 'Pedidos', icon: ShoppingCart },
            { id: 'customers', label: 'Clientes', icon: Users },
            { id: 'mystore', label: 'Minha Loja', icon: Store },
            { id: 'profile', label: 'Perfil Admin', icon: ProfileIcon },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center justify-between px-5 py-4 rounded-[2rem] transition-all duration-500 group",
                activeTab === item.id 
                  ? "bg-gold text-white shadow-lg shadow-gold/20" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-4">
                <item.icon size={20} className={cn(
                  "transition-transform duration-500",
                  activeTab === item.id ? "scale-110" : "group-hover:scale-110"
                )} />
                <span className="text-sm font-medium tracking-wide">{item.label}</span>
              </div>
              {activeTab === item.id && (
                <motion.div layoutId="activeTab" className="w-1.5 h-1.5 bg-white rounded-full" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-white/5 space-y-6">
          <button 
            onClick={() => {
              setCurrentUser(null);
              navigate('/');
            }}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-[2rem] text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all duration-500 text-sm font-medium group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            Sair do Painel
          </button>
          <div className="flex items-center justify-between px-2">
            <p className="text-[9px] text-gray-600 uppercase tracking-[0.2em]">Chronos v2.0</p>
            <div className="flex gap-2">
              <div className="w-1 h-1 bg-gray-700 rounded-full" />
              <div className="w-1 h-1 bg-gray-700 rounded-full" />
              <div className="w-1 h-1 bg-gray-700 rounded-full" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-72 p-6 sm:p-8 md:p-12 min-h-screen min-w-0 overflow-x-hidden bg-[#FDFDFD] flex flex-col">
        <header className="flex flex-col lg:flex-row items-center justify-between mb-12 gap-6 text-center lg:text-left pt-6 md:pt-0">
          <div className="space-y-1 flex flex-col items-center lg:items-start">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gold uppercase tracking-[0.3em] mb-2">
              {activeTab}
            </div>
            <h2 className="text-3xl sm:text-4xl font-sans text-gray-900 tracking-tight">
              {activeTab === 'profile' ? 'Minhas Informações' : 
               activeTab === 'mystore' ? 'Minha Loja' : 
               activeTab === 'dashboard' ? 'Painel de Controle' :
               activeTab === 'products' ? 'Gerenciar Produtos' :
               activeTab === 'orders' ? 'Gerenciar Pedidos' :
               activeTab === 'customers' ? 'Base de Clientes' :
               activeTab === 'analytics' ? 'Análises de Desempenho' :
               activeTab}
            </h2>
            <p className="text-gray-400 text-sm font-light">
              {activeTab === 'dashboard' ? 'Visão geral do desempenho da sua loja hoje.' : 
               `Gerencie e visualize informações de ${activeTab} com facilidade.`}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            <div className="hidden sm:flex items-center gap-3 bg-white px-5 py-3 rounded-[2rem] border border-gray-100 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                <ProfileIcon size={16} />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-gray-900 leading-none">{user?.name || 'Admin'}</p>
                <p className="text-[10px] text-gray-400">Administrador</p>
              </div>
              <ChevronDown size={14} className="text-gray-300 ml-2" />
            </div>

            {activeTab === 'products' && (
              <Button 
                onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
                className="w-full sm:w-auto shadow-xl shadow-gold/20"
              >
                <Plus size={18} /> Novo Produto
              </Button>
            )}
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'dashboard' && (
              <div className="space-y-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard title="Receita Total" value={formatPrice(totalRevenue)} icon={DollarSign} trend="up" trendValue="12.5%" />
                  <StatCard title="Pedidos" value={totalSalesCount} icon={ShoppingCart} trend="up" trendValue="8.2%" />
                  <StatCard title="Produtos" value={products.length} icon={Package} />
                  <StatCard title="Clientes" value={users.length} icon={Users} trend="up" trendValue="10.4%" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-sans text-gray-900">Vendas Recentes</h3>
                      <Button variant="outline" size="sm" onClick={() => setActiveTab('orders')}>Ver Todos</Button>
                    </div>
                    <div className="space-y-4">
                      {orders.slice(-5).reverse().map(order => (
                        <div key={order.id} className="flex items-center justify-between p-5 bg-gray-50 rounded-[2rem] hover:bg-white hover:shadow-md transition-all duration-500 group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-[2rem] bg-white flex items-center justify-center text-gold shadow-sm group-hover:bg-gold group-hover:text-white transition-colors">
                              <ShoppingCart size={20} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{order.customer.name}</p>
                              <p className="text-[10px] text-gray-400 uppercase tracking-widest">#{order.id.slice(0, 8)} • {new Date(order.date).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gold">{formatPrice(order.total)}</p>
                            <Badge variant={
                              order.status === 'Entregue' ? 'success' : 
                              order.status === 'Enviado' ? 'success' :
                              order.status === 'Processado' ? 'blue' :
                              order.status === 'Processando' ? 'warning' :
                              order.status === 'Cancelado' ? 'error' : 'gray'
                            }>{order.status || 'Pendente'}</Badge>
                          </div>
                        </div>
                      ))}
                      {orders.length === 0 && (
                        <div className="py-12 text-center">
                          <p className="text-gray-400 italic">Nenhum pedido registrado ainda.</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                    <h3 className="text-xl font-sans text-gray-900 mb-8">Top Produtos</h3>
                    <div className="space-y-6">
                      {bestSellers.length > 0 ? bestSellers.map(([name, qty], idx) => (
                        <div key={name} className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-[2rem] bg-gray-50 flex items-center justify-center text-xs font-sans text-gold border border-gray-100">
                            0{idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gold rounded-full" 
                                  style={{ width: `${(qty / (bestSellers[0][1] || 1)) * 100}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-bold text-gray-400">{qty} un.</span>
                            </div>
                          </div>
                        </div>
                      )) : (
                        <p className="text-gray-400 italic text-sm text-center py-8">Sem dados de vendas.</p>
                      )}
                    </div>
                    <div className="mt-10 p-6 bg-gray-900 rounded-[2rem] text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gold/10 rounded-full -mr-12 -mt-12" />
                      <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-1">Ticket Médio</p>
                      <p className="text-2xl font-sans text-gold">{formatPrice(totalSalesCount ? totalRevenue / totalSalesCount : 0)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="space-y-10">
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                    <div>
                      <h3 className="text-xl font-sans text-gray-900">Coleções</h3>
                      <p className="text-sm text-gray-400">Organize seus produtos em categorias exclusivas.</p>
                    </div>
                    <Badge variant="gold">{(storeConfig.collections || []).length} Categorias</Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                    {(storeConfig.collections || []).map(c => (
                      <div key={c} className="group relative bg-gray-50 p-4 sm:p-5 rounded-[2rem] border border-transparent hover:border-gold/20 hover:bg-white hover:shadow-xl transition-all duration-500">
                        <span className="text-sm font-bold text-gray-900 block truncate">{c}</span>
                        <p className="text-[10px] text-gray-400 mt-1">{products.filter(p => p.category === c).length} produtos</p>
                        <button 
                          onClick={() => handleDeleteCollection(c)}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-white text-red-500 rounded-full shadow-lg flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-500 hover:bg-red-50 z-10"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleAddCollection} className="flex flex-col sm:flex-row gap-3 bg-gray-50 p-2 rounded-[2rem] max-w-md mx-auto sm:mx-0">
                    <input 
                      type="text" 
                      value={newCollectionName}
                      onChange={e => setNewCollectionName(e.target.value)}
                      placeholder="Nova coleção..."
                      className="flex-1 bg-transparent border-none px-4 py-3 outline-none text-sm"
                    />
                    <Button type="submit" size="sm" className="w-full sm:w-auto">
                      <Plus size={16} /> Adicionar
                    </Button>
                  </form>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-xl font-sans text-gray-900">Lista de Produtos</h3>
                    <div className="flex items-center gap-4">
                      <div className="relative hidden sm:block">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                          type="text" 
                          placeholder="Buscar produto..." 
                          className="pl-12 pr-6 py-3 bg-gray-50 rounded-[2rem] text-sm outline-none focus:ring-2 focus:ring-gold transition-all w-64"
                        />
                      </div>
                      <Button variant="outline" size="sm">
                        <Filter size={16} className="mr-2" /> Filtros
                      </Button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[900px]">
                      <thead className="bg-gray-50/50 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                        <tr>
                          <th className="px-10 py-6">Produto</th>
                          <th className="px-10 py-6">Categoria</th>
                          <th className="px-10 py-6">Preço</th>
                          <th className="px-10 py-6">Status</th>
                          <th className="px-10 py-6 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {products.map(product => (
                          <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="px-10 py-6">
                              <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-[2rem] overflow-hidden bg-gray-100 shadow-sm group-hover:scale-105 transition-transform duration-500">
                                  <img src={product.images[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800"} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900">{product.name}</p>
                                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">ID: {product.id.slice(0, 8)}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-10 py-6">
                              <Badge variant="outline">{product.category}</Badge>
                            </td>
                            <td className="px-10 py-6">
                              <p className="font-bold text-gray-900">{formatPrice(product.price)}</p>
                            </td>
                            <td className="px-10 py-6">
                              <div className="flex flex-col gap-2">
                                {product.inStock !== false ? (
                                  <Badge variant="success">Em Estoque</Badge>
                                ) : (
                                  <Badge variant="error">Esgotado</Badge>
                                )}
                                {product.isBestSeller && (
                                  <Badge variant="gold">Best Seller</Badge>
                                )}
                              </div>
                            </td>
                            <td className="px-10 py-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button 
                                  onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}
                                  className="p-3 text-gray-400 hover:text-gold hover:bg-gold/5 rounded-[2rem] transition-all"
                                >
                                  <Edit2 size={18} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-[2rem] transition-all"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {products.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-10 py-24 text-center">
                              <div className="flex flex-col items-center gap-4">
                                <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-300">
                                  <Package size={40} />
                                </div>
                                <p className="text-gray-400 italic">Nenhum produto cadastrado.</p>
                                <Button size="sm" onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}>Cadastrar Primeiro Produto</Button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-xl font-sans text-gray-900">Gerenciar Pedidos</h3>
                  <div className="flex items-center gap-4">
                    <div className="relative hidden sm:block">
                      <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Buscar pedido..." 
                        className="pl-12 pr-6 py-3 bg-gray-50 rounded-[2rem] text-sm outline-none focus:ring-2 focus:ring-gold transition-all w-64"
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter size={16} className="mr-2" /> Status
                    </Button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[900px]">
                    <thead className="bg-gray-50/50 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                      <tr>
                        <th className="px-10 py-6">Pedido</th>
                        <th className="px-10 py-6">Cliente</th>
                        <th className="px-10 py-6">Data</th>
                        <th className="px-10 py-6">Total</th>
                        <th className="px-10 py-6">Status</th>
                        <th className="px-10 py-6 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {orders.slice().reverse().map(order => (
                        <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="px-10 py-6">
                            <button 
                              onClick={() => setEditingOrder(order)}
                              className="font-mono text-xs font-bold text-gold hover:underline"
                            >
                              #{order.id.slice(0, 8)}
                            </button>
                          </td>
                          <td className="px-10 py-6">
                            <div>
                              <p className="font-bold text-gray-900">{order.customer.name}</p>
                              <p className="text-[10px] text-gray-400">{order.customer.email}</p>
                            </div>
                          </td>
                          <td className="px-10 py-6">
                            <p className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString()}</p>
                          </td>
                          <td className="px-10 py-6">
                            <p className="font-bold text-gray-900">{formatPrice(order.total)}</p>
                          </td>
                          <td className="px-10 py-6">
                            <Badge variant={
                              order.status === 'Entregue' ? 'success' : 
                              order.status === 'Enviado' ? 'success' :
                              order.status === 'Processado' ? 'blue' :
                              order.status === 'Processando' ? 'warning' :
                              order.status === 'Cancelado' ? 'error' : 'gray'
                            }>
                              {order.status || 'Pendente'}
                            </Badge>
                          </td>
                          <td className="px-10 py-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => setEditingOrder(order)}
                                className="p-3 text-gray-400 hover:text-gold hover:bg-gold/5 rounded-[2rem] transition-all"
                              >
                                <Eye size={18} />
                              </button>
                              <button 
                                onClick={() => handleDeleteOrder(order.id)}
                                className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-[2rem] transition-all"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-10 py-24 text-center">
                            <div className="flex flex-col items-center gap-4">
                              <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-300">
                                <ShoppingCart size={40} />
                              </div>
                              <p className="text-gray-400 italic">Nenhum pedido registrado ainda.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'customers' && (
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-xl font-sans text-gray-900">Base de Clientes</h3>
                  <div className="flex gap-4">
                    <Button size="sm" onClick={() => { setEditingUser(null); setIsUserModalOpen(true); }}>
                      <Plus size={16} /> Novo Cliente
                    </Button>
                    <Badge variant="gold">{users.length} Registrados</Badge>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[1000px]">
                    <thead className="bg-gray-50/50 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                      <tr>
                        <th className="px-10 py-6">Cliente</th>
                        <th className="px-10 py-6">Senha</th>
                        <th className="px-10 py-6">CPF</th>
                        <th className="px-10 py-6">Telefone</th>
                        <th className="px-10 py-6">Nível</th>
                        <th className="px-10 py-6 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="px-10 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold text-sm">
                                {u.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">{u.name}</p>
                                <p className="text-[10px] text-gray-400">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-6 text-sm font-mono text-gray-600">
                            <div className="flex items-center gap-2">
                              <Lock size={12} className="text-gray-300" />
                              {u.password || '******'}
                            </div>
                          </td>
                          <td className="px-10 py-6 text-sm font-mono text-gray-600">{u.cpf || 'N/A'}</td>
                          <td className="px-10 py-6 text-sm text-gray-600">{u.phone || 'N/A'}</td>
                          <td className="px-10 py-6">
                            <Badge variant={u.role === 'admin' ? 'gold' : 'outline'}>
                              {u.role === 'admin' ? 'Administrador' : 'Cliente'}
                            </Badge>
                          </td>
                          <td className="px-10 py-6 text-right">
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => { setEditingUser(u); setIsUserModalOpen(true); }}
                                className="p-2 text-gray-400 hover:text-gold hover:bg-gold/10 rounded-full transition-all"
                                title="Editar Cliente"
                              >
                                <Edit2 size={16} />
                              </button>
                              <Badge variant="success">Ativo</Badge>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-10 py-24 text-center">
                            <p className="text-gray-400 italic">Nenhum cliente registrado.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'mystore' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                  <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <SectionHeading title="Identidade Visual" subtitle="Configure o logo e o tema da sua loja." />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Logo da Loja</label>
                        <div className="relative">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                            id="logo-upload-admin"
                          />
                          <label 
                            htmlFor="logo-upload-admin"
                            className="flex items-center justify-center gap-3 w-full bg-gray-50 hover:bg-gray-100 text-gray-600 py-6 rounded-[2rem] cursor-pointer transition-all border-2 border-dashed border-gray-200 text-[10px] font-bold uppercase tracking-widest"
                          >
                            <Plus size={18} /> Selecionar Logo
                          </label>
                        </div>
                        {storeConfig.logo && (
                          <div className="mt-4 p-6 bg-gray-50 rounded-[2rem] border border-gray-100 flex items-center justify-between">
                            <img src={storeConfig.logo} alt="Preview Logo" className="h-10 w-auto object-contain" referrerPolicy="no-referrer" />
                            <button onClick={() => setStoreConfig({...storeConfig, logo: ''})} className="text-red-500 hover:text-red-700 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fundo da Home</label>
                        <div className="relative">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleBackgroundUpload}
                            className="hidden"
                            id="bg-upload-admin"
                          />
                          <label 
                            htmlFor="bg-upload-admin"
                            className="flex items-center justify-center gap-3 w-full bg-gray-50 hover:bg-gray-100 text-gray-600 py-6 rounded-[2rem] cursor-pointer transition-all border-2 border-dashed border-gray-200 text-[10px] font-bold uppercase tracking-widest"
                          >
                            <Plus size={18} /> Selecionar Background
                          </label>
                        </div>
                        {storeConfig.homepageBackground && (
                          <div className="mt-4 aspect-video bg-gray-50 rounded-[2rem] border border-gray-100 overflow-hidden relative group">
                            <img src={storeConfig.homepageBackground} alt="Preview Hero" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <button 
                              onClick={() => setStoreConfig({...storeConfig, homepageBackground: ''})}
                              className="absolute top-2 right-2 w-8 h-8 bg-white/90 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <SectionHeading title="Informações Gerais" subtitle="Dados básicos de contato e localização." />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nome da Loja</label>
                        <input 
                          type="text" 
                          value={storeConfig.name}
                          onChange={e => setStoreConfig({...storeConfig, name: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] px-6 py-4 text-sm outline-none focus:ring-2 focus:ring-gold transition-all"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email de Contato</label>
                        <input 
                          type="email" 
                          value={storeConfig.email}
                          onChange={e => setStoreConfig({...storeConfig, email: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] px-6 py-4 text-sm outline-none focus:ring-2 focus:ring-gold transition-all"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Telefone / WhatsApp</label>
                        <input 
                          type="text" 
                          value={storeConfig.phone}
                          onChange={e => setStoreConfig({...storeConfig, phone: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] px-6 py-4 text-sm outline-none focus:ring-2 focus:ring-gold transition-all"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Endereço Físico</label>
                        <input 
                          type="text" 
                          value={storeConfig.address}
                          onChange={e => setStoreConfig({...storeConfig, address: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] px-6 py-4 text-sm outline-none focus:ring-2 focus:ring-gold transition-all"
                        />
                      </div>
                    </div>
                    <div className="mt-8 space-y-4">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Descrição da Loja</label>
                      <textarea 
                        rows={3}
                        value={storeConfig.description}
                        onChange={e => setStoreConfig({...storeConfig, description: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] px-6 py-4 text-sm outline-none focus:ring-2 focus:ring-gold transition-all resize-none"
                        placeholder="Uma breve descrição da sua marca..."
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-10">
                  <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <SectionHeading title="Frete" subtitle="Configurações de entrega." />
                    <div className="space-y-8 mt-8">
                      <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[2rem]">
                        <div>
                          <p className="text-sm font-bold text-gray-900">Frete Grátis</p>
                          <p className="text-[10px] text-gray-400">Ativar frete grátis global.</p>
                        </div>
                        <button 
                          onClick={() => setStoreConfig({...storeConfig, freeShippingEnabled: !storeConfig.freeShippingEnabled})}
                          className={cn(
                            "w-12 h-6 rounded-full transition-all duration-500 relative",
                            storeConfig.freeShippingEnabled ? "bg-gold" : "bg-gray-200"
                          )}
                        >
                          <div className={cn(
                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-500",
                            storeConfig.freeShippingEnabled ? "left-7" : "left-1"
                          )} />
                        </button>
                      </div>
                      
                      {storeConfig.freeShippingEnabled && (
                        <div className="space-y-4">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Valor Mínimo para Frete Grátis</label>
                          <div className="relative">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">R$</span>
                            <input 
                              type="number" 
                              value={storeConfig.freeShippingMinAmount}
                              onChange={e => setStoreConfig({...storeConfig, freeShippingMinAmount: Number(e.target.value)})}
                              className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] pl-14 pr-6 py-4 text-sm outline-none focus:ring-2 focus:ring-gold transition-all"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                    <SectionHeading title="Redes Sociais" subtitle="Links para seus perfis." />
                    <div className="space-y-6 mt-8">
                      <div className="relative group">
                        <Instagram className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-gold transition-colors" size={18} />
                        <input 
                          type="text" 
                          value={storeConfig.instagram}
                          onChange={e => setStoreConfig({...storeConfig, instagram: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] pl-14 pr-6 py-4 text-sm outline-none focus:ring-2 focus:ring-gold transition-all"
                          placeholder="Instagram URL"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && user && profileFormData && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-8 border-b border-gray-100 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold text-xl">
                      {profileFormData.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{profileFormData.name}</h3>
                      <p className="text-sm text-gray-400">Administrador do Sistema</p>
                    </div>
                  </div>
                  
                  <div className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                          <UserIcon size={12} /> Nome Completo
                        </label>
                        <input 
                          type="text" 
                          value={profileFormData.name} 
                          onChange={e => setProfileFormData({...profileFormData, name: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] px-6 py-4 text-sm outline-none focus:ring-2 focus:ring-gold transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                          <Mail size={12} /> E-mail
                        </label>
                        <input 
                          type="email" 
                          value={profileFormData.email} 
                          onChange={e => setProfileFormData({...profileFormData, email: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] px-6 py-4 text-sm outline-none focus:ring-2 focus:ring-gold transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                          <Hash size={12} /> CPF
                        </label>
                        <input 
                          disabled
                          type="text" 
                          value={profileFormData.cpf || 'Não informado'} 
                          className="w-full bg-gray-100 border border-gray-100 rounded-[2rem] px-6 py-4 text-sm outline-none opacity-60 cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                          <Phone size={12} /> Telefone
                        </label>
                        <input 
                          type="tel" 
                          value={profileFormData.phone || ''} 
                          onChange={e => setProfileFormData({...profileFormData, phone: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] px-6 py-4 text-sm outline-none focus:ring-2 focus:ring-gold transition-all"
                        />
                      </div>
                    </div>

                    <div className="pt-8 border-t border-gray-100">
                      <SectionHeading title="Segurança" subtitle="Gerencie sua senha de acesso." />
                      <div className="mt-6 max-w-md space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                          <Lock size={12} /> Nova Senha
                        </label>
                        <input 
                          type="text" 
                          value={profileFormData.password || ''} 
                          onChange={e => setProfileFormData({...profileFormData, password: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] px-6 py-4 text-sm outline-none focus:ring-2 focus:ring-gold transition-all"
                          placeholder="Sua senha"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <SectionHeading title="Desempenho de Vendas" subtitle="Volume de vendas nos últimos 7 dias." />
                    <div className="h-64 flex items-end gap-4 mt-10">
                      {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                          <div 
                            className="w-full bg-gray-50 rounded-[2rem] group-hover:bg-gold transition-all duration-500 relative"
                            style={{ height: `${h}%` }}
                          >
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-10 font-bold">
                              {h}%
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">D{i+1}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <SectionHeading title="Ranking de Produtos" subtitle="Os itens mais desejados da sua loja." />
                    <div className="space-y-8 mt-10">
                      {sortedSales.map(([name, qty], idx) => (
                        <div key={name} className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-gray-900 truncate pr-4">{name}</span>
                            <Badge variant="outline">{qty} un.</Badge>
                          </div>
                          <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(qty / sortedSales[0][1]) * 100}%` }}
                              className="h-full bg-gold"
                            />
                          </div>
                        </div>
                      ))}
                      {sortedSales.length === 0 && (
                        <div className="py-10 text-center">
                          <p className="text-gray-400 italic text-sm">Dados insuficientes para gerar ranking.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-900 text-white p-12 rounded-[2rem] flex flex-col lg:flex-row items-center justify-between gap-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                  <div className="relative z-10 text-center lg:text-left">
                    <h3 className="text-3xl font-sans mb-3">Relatório Consolidado</h3>
                    <p className="text-gray-400 font-light">Resumo financeiro do período atual.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-12 sm:gap-20 relative z-10">
                    <div className="text-center lg:text-left">
                      <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] mb-2 font-bold">Faturamento Total</p>
                      <p className="text-4xl font-sans text-gold">{formatPrice(totalRevenue)}</p>
                    </div>
                    <div className="text-center lg:text-left">
                      <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] mb-2 font-bold">Ticket Médio</p>
                      <p className="text-4xl font-sans text-gold">{formatPrice(totalSalesCount ? totalRevenue / totalSalesCount : 0)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {isModalOpen && (
        <ProductModal 
          product={editingProduct} 
          collections={storeConfig.collections || []}
          onClose={() => { setIsModalOpen(false); setEditingProduct(null); }} 
          onSave={handleSaveProduct} 
          showToast={showToast}
        />
      )}

      {isUserModalOpen && (
        <UserModal 
          user={editingUser} 
          onClose={() => { setIsUserModalOpen(false); setEditingUser(null); }} 
          onSave={handleSaveUser} 
        />
      )}

      {editingOrder && (
        <OrderModal 
          order={editingOrder} 
          onClose={() => setEditingOrder(null)} 
          onSave={handleSaveOrder} 
          storeConfig={storeConfig}
        />
      )}
    </div>
  );
};
