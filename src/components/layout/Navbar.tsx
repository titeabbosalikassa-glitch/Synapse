import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AdminNotification } from '../../types';
import { NotificationsDropdown } from './NotificationsDropdown';
import {
  UserCheck,
  ShieldCheck,
  Menu,
  X,
  LogOut,
  Moon,
  Sun,
} from 'lucide-react';
import { Logo } from '../common/Logo';

interface NavbarProps {
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
  notifications?: AdminNotification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onDeleteNotification?: (id: string) => void;
  onClearAllNotifications?: () => void;
  onOpenProfile: () => void;
  onNavigateHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileMenu,
  isMobileMenuOpen,
  notifications = [],
  onMarkAsRead = () => {},
  onMarkAllAsRead = () => {},
  onDeleteNotification = () => {},
  onClearAllNotifications = () => {},
  onOpenProfile,
  onNavigateHome,
}) => {
  const { currentUser, isAdmin, logout } = useAuth();

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('synapse_hpg_dark_mode') === 'true';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('synapse_hpg_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('synapse_hpg_dark_mode', 'false');
    }
  }, [isDarkMode]);

  if (!currentUser) return null;

  return (
    <header
      className={`sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-all ${
        isMobileMenuOpen ? 'hidden lg:block' : 'block'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Mobile toggle & Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Basculer le menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div
            onClick={onNavigateHome}
            className="cursor-pointer flex items-center gap-2 hover:opacity-90 transition-opacity"
            title="Retour à l'accueil"
          >
            <Logo />
          </div>
        </div>

        {/* User selector & Logout actions */}
        <div className="flex items-center gap-2">
          {isAdmin && (
            <NotificationsDropdown
              notifications={notifications}
              onMarkAsRead={onMarkAsRead}
              onMarkAllAsRead={onMarkAllAsRead}
              onDeleteNotification={onDeleteNotification}
              onClearAll={onClearAllNotifications}
            />
          )}

          <div className="relative">
            <button
              id="user-profile-menu-button"
              onClick={onOpenProfile}
              title="Accéder à la page de gestion de mon compte"
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600 bg-white dark:bg-slate-900 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left group"
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-semibold text-xs ${
                  isAdmin ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-2xs' : 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                }`}
              >
                {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
              </div>

              <div className="hidden sm:block">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {isAdmin ? 'Admin principale • Mon Compte' : `${currentUser.subject} • Mon Compte`}
                </div>
              </div>
            </button>
          </div>

          {/* Dark Mode Toggle Button */}
          <button
            type="button"
            onClick={() => setIsDarkMode(!isDarkMode)}
            title={isDarkMode ? 'Passer en mode clair' : 'Passer en mode sombre (confort visuel nuit)'}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
            aria-label="Basculer le mode sombre"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* Quick Logout Button */}
          <button
            id="quick-logout-btn"
            onClick={logout}
            title="Se déconnecter"
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
            aria-label="Se déconnecter"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
