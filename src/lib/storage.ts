import { Product, Order, User, StoreConfig } from "../types";

const PRODUCTS_KEY = "chronos_products";
const ORDERS_KEY = "chronos_orders";
const USERS_KEY = "chronos_users";
const CURRENT_USER_KEY = "chronos_current_user";
const STORE_CONFIG_KEY = "chronos_store_config";

const DEFAULT_STORE_CONFIG: StoreConfig = {
  name: "CHRONOS",
  logo: "", // Empty means use default text logo
  homepageBackground: "https://images.unsplash.com/photo-1508685096489-7aac29145fe0?auto=format&fit=crop&q=80&w=1920",
  description: "Excelência em cada segundo. Descubra nossa coleção exclusiva de relógios que transcendem o tempo.",
  phone: "(11) 99999-9999",
  email: "contato@chronos.com.br",
  address: "Av. Paulista, 1000 - São Paulo, SP",
  instagram: "@chronos.premium",
  freeShippingEnabled: true,
  freeShippingMinAmount: 20000,
  collections: ["Luxo", "Minimalista", "Clássico", "Esportivo"]
};

export const getStoreConfig = (): StoreConfig => {
  const stored = localStorage.getItem(STORE_CONFIG_KEY);
  if (!stored) {
    localStorage.setItem(STORE_CONFIG_KEY, JSON.stringify(DEFAULT_STORE_CONFIG));
    return DEFAULT_STORE_CONFIG;
  }
  return JSON.parse(stored);
};

export const saveStoreConfig = (config: StoreConfig) => {
  localStorage.setItem(STORE_CONFIG_KEY, JSON.stringify(config));
};

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Chronos Royal Oak",
    price: 12500,
    description: "Um ícone da relojoaria moderna, com acabamento em aço inoxidável e movimento automático de alta precisão.",
    images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800"],
    category: "Luxo",
    isBestSeller: true,
    inStock: true,
  },
  {
    id: "2",
    name: "Midnight Stealth",
    price: 8900,
    description: "Design minimalista em preto fosco, perfeito para ocasiões formais e uso diário sofisticado.",
    images: ["https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=800"],
    category: "Minimalista",
    inStock: true,
  },
  {
    id: "3",
    name: "Golden Heritage",
    price: 15700,
    description: "Ouro 18k e pulseira de couro legítimo. Uma herança para gerações.",
    images: ["https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&q=80&w=800"],
    category: "Clássico",
    isBestSeller: true,
    inStock: true,
  },
  {
    id: "4",
    name: "Ocean Master",
    price: 6400,
    description: "Resistente a 300m, ideal para mergulho profissional sem perder a elegância.",
    images: ["https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format&fit=crop&q=80&w=800"],
    category: "Esportivo",
    inStock: true,
  },
];

export const getProducts = (): Product[] => {
  const stored = localStorage.getItem(PRODUCTS_KEY);
  if (!stored) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(DEFAULT_PRODUCTS));
    return DEFAULT_PRODUCTS;
  }
  const products = JSON.parse(stored);
  // Migration: Ensure all products have images array
  return products.map((p: any) => {
    if (p.image && !p.images) {
      const { image, ...rest } = p;
      return { ...rest, images: [image] };
    }
    if (!p.images) return { ...p, images: [] };
    if (p.inStock === undefined) return { ...p, inStock: true };
    return p;
  });
};

export const saveProducts = (products: Product[]) => {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
};

export const getOrders = (): Order[] => {
  const stored = localStorage.getItem(ORDERS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveOrders = (orders: Order[]) => {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
};

export const saveOrder = (order: Order) => {
  const orders = getOrders();
  orders.push(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
};

export const updateOrder = (updatedOrder: Order) => {
  const orders = getOrders();
  const newOrders = orders.map(o => o.id === updatedOrder.id ? updatedOrder : o);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(newOrders));
};

export const deleteOrder = (id: string) => {
  const orders = getOrders();
  const newOrders = orders.filter(o => o.id !== id);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(newOrders));
};

export const getUsers = (): User[] => {
  const stored = localStorage.getItem(USERS_KEY);
  const users: User[] = stored ? JSON.parse(stored) : [];
  
  // Ensure default admin exists
  const adminEmail = 'admin@chronos.com';
  const existingAdmin = users.find(u => u.email === adminEmail);
  
  if (!existingAdmin) {
    const admin: User = {
      id: 'admin-1',
      name: 'Administrador Chronos',
      email: adminEmail,
      password: 'admin123',
      role: 'admin'
    };
    users.push(admin);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
  
  return users;
};

export const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const saveUser = (user: User) => {
  const users = getUsers();
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const updateUser = (updatedUser: User) => {
  const users = getUsers();
  const newUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
  localStorage.setItem(USERS_KEY, JSON.stringify(newUsers));
};

export const getCurrentUser = (): User | null => {
  const persistent = localStorage.getItem(CURRENT_USER_KEY);
  if (persistent) return JSON.parse(persistent);
  
  const session = sessionStorage.getItem(CURRENT_USER_KEY);
  if (session) return JSON.parse(session);
  
  return null;
};

export const setCurrentUser = (user: User | null, rememberMe: boolean = false) => {
  if (user) {
    if (rememberMe) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    }
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
    sessionStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem('chronos_admin_auth');
  }
};

export const clearAllSessions = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
  sessionStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem('chronos_admin_auth');
  // In a real app, this would invalidate tokens on the server
};
