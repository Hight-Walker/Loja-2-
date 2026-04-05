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
import { getCurrentUser } from './lib/storage';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const user = getCurrentUser();
  const isAdmin = user?.role === 'admin';
  return isAdmin ? <>{children}</> : <Navigate to="/login" />;
};

const UserRoute = ({ children }: { children: React.ReactNode }) => {
  const user = getCurrentUser();
  return user ? <>{children}</> : <Navigate to="/login" />;
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Storefront />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={<CartPage />} />
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
      </Routes>
    </Router>
  );
}
