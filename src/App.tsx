import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Storefront } from './Storefront';
import { AdminDashboard } from './Admin';
import { Login } from './Login';
import { Register } from './Register';
import { ProductPage } from './ProductPage';
import { UserProfile } from './UserProfile';
import { CheckoutPage } from './CheckoutPage';
import { CartPage } from './CartPage';
import { Developer } from './Developer';
import { Maintenance } from './Maintenance';
import { getCurrentUser, getDeveloperConfig } from './lib/storage';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const user = getCurrentUser();
  const config = getDeveloperConfig();
  if (config.systemStatus === 'maintenance' && user?.role !== 'dev') {
    return <Navigate to="/maintenance" />;
  }
  const isAuthorized = user?.role === 'admin' || user?.role === 'dev';
  return isAuthorized ? <>{children}</> : <Navigate to="/login" />;
};

const UserRoute = ({ children }: { children: React.ReactNode }) => {
  const user = getCurrentUser();
  const config = getDeveloperConfig();
  if (config.systemStatus === 'maintenance' && user?.role !== 'dev') {
    return <Navigate to="/maintenance" />;
  }
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'dev') return <Navigate to="/dev" />;
  return <>{children}</>;
};

const DevRoute = ({ children }: { children: React.ReactNode }) => {
  const user = getCurrentUser();
  const isDev = user?.role === 'dev';
  return isDev ? <>{children}</> : <Navigate to="/login" />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const user = getCurrentUser();
  const config = getDeveloperConfig();
  if (config.systemStatus === 'maintenance' && user?.role !== 'dev') {
    return <Navigate to="/maintenance" />;
  }
  return <>{children}</>;
};

export default function App() {
  React.useEffect(() => {
    const config = getDeveloperConfig();
    if (config.googleFontsUrl) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = config.googleFontsUrl + '/css2?family=Inter:wght@300;400;500;600;700;800&display=swap';
      document.head.appendChild(link);
      return () => {
        document.head.removeChild(link);
      };
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicRoute><Storefront /></PublicRoute>} />
        <Route path="/product/:id" element={<PublicRoute><ProductPage /></PublicRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/cart" element={<PublicRoute><CartPage /></PublicRoute>} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route 
          path="/profile" 
          element={
            <UserRoute>
              <UserProfile />
            </UserRoute>
          } 
        />
        <Route 
          path="/checkout" 
          element={
            <UserRoute>
              <CheckoutPage />
            </UserRoute>
          } 
        />
        <Route 
          path="/manager" 
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/dev" 
          element={
            <DevRoute>
              <Developer />
            </DevRoute>
          } 
        />
      </Routes>
    </Router>
  );
}
