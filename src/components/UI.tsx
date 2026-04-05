import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, AlertCircle, X, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
}

export const Toast = ({ message, type, isVisible, onClose }: ToastProps) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: '-50%', scale: 0.9 }}
          animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
          exit={{ opacity: 0, y: 20, x: '-50%', scale: 0.9 }}
          className={cn(
            "fixed bottom-8 left-1/2 z-[200] flex items-center gap-4 px-6 py-4 rounded-[2rem] shadow-lg min-w-[320px] backdrop-blur-md border border-gray-200",
            type === 'success' ? "bg-green-600 text-white" : 
            type === 'error' ? "bg-red-600 text-white" : 
            "bg-gray-900 text-white"
          )}
        >
          <div className="flex-shrink-0">
            {type === 'success' && <CheckCircle2 size={24} className="text-white" />}
            {type === 'error' && <XCircle size={24} className="text-white" />}
            {type === 'info' && <AlertCircle size={24} className="text-white" />}
          </div>
          <span className="text-sm font-medium flex-1">{message}</span>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal = ({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) => {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center p-6 z-[160] pointer-events-none"
          >
            <div className={cn("bg-white w-full rounded-[2rem] shadow-xl overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]", sizes[size])}>
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold">{title}</h2>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                {children}
              </div>
              {footer && (
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                  {footer}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  icon: Icon,
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ElementType;
}) => {
  const variants = {
    primary: "bg-gray-900 text-white hover:bg-black shadow-md",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    outline: "bg-transparent border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white",
    ghost: "bg-transparent text-gray-900 hover:bg-gray-100",
    gold: "bg-gold text-white hover:bg-gold-dark shadow-md"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base"
  };

  return (
    <button 
      className={cn(
        "rounded-[2rem] font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
      {Icon && <Icon size={18} className="transition-transform group-hover:translate-x-1" />}
    </button>
  );
};

export const SectionHeading = ({ 
  subtitle, 
  title, 
  description, 
  align = 'left',
  className 
}: { 
  subtitle?: string; 
  title: string | React.ReactNode; 
  description?: string;
  align?: 'left' | 'center';
  className?: string;
}) => (
  <div className={cn(
    "mb-16",
    align === 'center' ? "text-center mx-auto max-w-3xl" : "text-left",
    className
  )}>
    {subtitle && (
      <motion.span 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-gold font-bold text-xs mb-2 block uppercase tracking-wider"
      >
        {subtitle}
      </motion.span>
    )}
    <motion.h2 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 }}
      className="text-3xl md:text-4xl font-bold mb-4"
    >
      {title}
    </motion.h2>
    {description && (
      <motion.p 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="text-gray-600"
      >
        {description}
      </motion.p>
    )}
  </div>
);

export const Badge = ({ children, variant = 'gold', className }: { children: React.ReactNode, variant?: 'gold' | 'black' | 'gray' | 'success' | 'error' | 'warning' | 'outline', className?: string }) => {
  const variants = {
    gold: "bg-gold text-white",
    black: "bg-gray-900 text-white",
    gray: "bg-gray-100 text-gray-600",
    success: "bg-green-100 text-green-700",
    error: "bg-red-100 text-red-700",
    warning: "bg-amber-100 text-amber-700",
    outline: "bg-transparent border border-gray-200 text-gray-500"
  };

  return (
    <span className={cn(
      "text-[10px] font-bold px-3 py-1.5 rounded-[2rem] flex items-center gap-1",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
};
