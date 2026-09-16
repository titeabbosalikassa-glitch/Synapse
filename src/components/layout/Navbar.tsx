import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { AdminNotification } from '../../types';
import { NotificationsDropdown } from './NotificationsDropdown';
import {
  UserCheck,
  ShieldCheck,
  Menu,
  X,
  LogOut,
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
}) => {
  const { currentUser, isAdmin, logout } = useAuth();

  if (!currentUser) return null;

  return (
    <header
      className={`sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all ${
        isMobileMenuOpen ? 'hidden lg:block' : 'block'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Mobile toggle & Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Basculer le menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Logo />
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
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-indigo-300 bg-white shadow-2xs hover:bg-slate-50 transition-all text-left group"
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-semibold text-xs ${
                  isAdmin ? 'bg-slate-800 text-white shadow-2xs' : 'bg-indigo-100 text-indigo-700'
                }`}
              >
                {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
              </div>

              <div className="hidden sm:block">
                <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-500">
                  {isAdmin ? 'Direction HPG • Mon Compte' : `${currentUser.subject} • Mon Compte`}
                </div>
              </div>
            </button>
          </div>

          {/* Quick Logout Button */}
          <button
            id="quick-logout-btn"
            onClick={logout}
            title="Se déconnecter"
            className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
            aria-label="Se déconnecter"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
