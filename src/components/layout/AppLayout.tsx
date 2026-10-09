import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { AdminNotification } from '../../types';
import { OfflineIndicator } from '../common/OfflineIndicator';

interface AppLayoutProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
  notifications?: AdminNotification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onDeleteNotification?: (id: string) => void;
  onClearAllNotifications?: () => void;
  onOpenProfile: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  activeTab,
  onTabChange,
  children,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearAllNotifications,
  onOpenProfile,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100 antialiased">
      <Navbar
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
        notifications={notifications}
        onMarkAsRead={onMarkAsRead}
        onMarkAllAsRead={onMarkAllAsRead}
        onDeleteNotification={onDeleteNotification}
        onClearAllNotifications={onClearAllNotifications}
        onOpenProfile={onOpenProfile}
        onNavigateHome={() => onTabChange('dashboard')}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Barre latérale de navigation pour Enseignant et Administrateur */}
          <Sidebar
            activeTab={activeTab}
            onTabChange={(tab) => {
              onTabChange(tab);
              setIsMobileMenuOpen(false);
            }}
            isOpenMobile={isMobileMenuOpen}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
          />

          {/* Zone de contenu réactive */}
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </main>
      <OfflineIndicator />
    </div>
  );
};
