export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  category: string;
  isBestSeller?: boolean;
  inStock?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  address?: string;
  phone?: string;
  cpf?: string;
  birthDate?: string;
  role: 'admin' | 'user' | 'dev';
}

export type OrderStatus = 'Pendente' | 'Processando' | 'Processado' | 'Enviado' | 'Entregue' | 'Cancelado';
export type PaymentMethod = 'Cartão de Crédito' | 'Boleto' | 'Pix';

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  customer: {
    name: string;
    email: string;
    address: string;
    cpf?: string;
    phone?: string;
  };
  date: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  trackingNumber?: string;
}

export interface StoreConfig {
  name: string;
  logo: string;
  homepageBackground?: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  instagram?: string;
  freeShippingEnabled?: boolean;
  freeShippingMinAmount?: number;
  collections?: string[];
}

export interface DeveloperConfig {
  geminiApiKey: string;
  unsplashApiUrl: string;
  googleFontsUrl: string;
  analyticsId: string;
  mockExternalApi: string;
  viacepApiUrl: string;
  devName: string;
  devRole: string;
  devLink: string;
  companyName: string;
  companyLink: string;
  appVersion: string;
  systemStatus: 'stable' | 'beta' | 'maintenance';
}

export interface AnalyticsData {
  totalSales: number;
  totalRevenue: number;
  productSales: Record<string, number>;
}
