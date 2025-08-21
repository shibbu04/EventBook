import React from 'react';
import { motion } from 'framer-motion';
import { X, LogIn, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LoginModal = ({ isOpen, onClose, eventTitle }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    navigate('/login');
  };

  const handleRegister = () => {
    onClose();
    navigate('/register');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-dark-800 rounded-xl p-6 w-full max-w-md"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Login Required
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Ready to attend this event?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            To book tickets for "<span className="font-medium">{eventTitle}</span>", you need to login first.
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
            Demo Credentials:
          </h4>
          <div className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
            <p><strong>Test User:</strong> test@example.com / testuser123</p>
            <p><strong>Admin:</strong> demo@admin.com / Demo@admin</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleLogin}
            className="w-full btn-primary flex items-center justify-center space-x-2"
          >
            <LogIn className="w-5 h-5" />
            <span>Login to Continue</span>
          </button>
          
          <button
            onClick={handleRegister}
            className="w-full btn-secondary flex items-center justify-center space-x-2"
          >
            <UserPlus className="w-5 h-5" />
            <span>Create New Account</span>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Secure booking system with instant ticket delivery
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginModal;
