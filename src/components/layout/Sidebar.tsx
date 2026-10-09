import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Sparkles,
  BookOpen,
  Shield,
  LogOut,
  X,
  Activity,
  BarChart3,
} from 'lucide-react';
import { Logo } from '../common/Logo';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const { currentUser, isAdmin, logout } = useAuth();

  if (!currentUser) return null;

  const teacherNavItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'students', label: 'Mes Élèves', icon: Users },
    { id: 'sessions', label: 'Mes Séances', icon: Calendar },
    { id: 'resources', label: 'Mes Fichiers PDF', icon: FileText },
  ];

  const adminNavItems = [
    { id: 'dashboard', label: 'Vue Globale', icon: LayoutDashboard },
    { id: 'teachers', label: 'Gestion Enseignants', icon: Users },
    { id: 'students', label: 'Tous les Élèves', icon: BookOpen },
    { id: 'sessions', label: 'Toutes les Séances', icon: Calendar },
    { id: 'analytics', label: 'Analyses', icon: BarChart3 },
    { id: 'activities', label: 'Journal Activités', icon: Activity },
    { id: 'resources', label: 'Ressources', icon: FileText },
    {
      id: 'ai-exercises',
      label: 'Évaluations IA /20',
      icon: Sparkles,
      highlight: true,
    },
  ];

  const navItems = isAdmin ? adminNavItems : teacherNavItems;

  const handleItemClick = (id: string) => {
    onTabChange(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-50 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`shrink-0 transition-transform duration-200 ${
          isOpenMobile
            ? 'fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white dark:bg-slate-900 p-5 shadow-2xl flex flex-col justify-between overflow-y-auto z-50 border-r border-slate-200 dark:border-slate-800'
            : 'hidden lg:flex lg:flex-col lg:justify-between lg:w-64'
        }`}
      >
        <div className="space-y-5">
          {/* Mobile drawer header with Logo and Close button */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800 lg:hidden">
            <Logo size="sm" showText={true} />
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Fermer la navigation"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User profile card */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                  isAdmin
                    ? 'bg-slate-800 dark:bg-slate-700 text-white'
                    : 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                }`}
              >
                {isAdmin ? <Shield className="w-5 h-5" /> : currentUser.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {currentUser.name}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {isAdmin ? 'Direction' : `Professeur : ${currentUser.subject}`}
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 dark:text-slate-500">Périmètre :</span>
              <span
                className={`font-semibold px-2 py-0.5 rounded-md ${
                  isAdmin
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                }`}
              >
                {isAdmin ? 'Global' : 'Données Isolées'}
              </span>
            </div>
          </div>

          {/* Nav List */}
          <nav className="space-y-1">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {isAdmin ? 'Supervision Globale' : 'Espace Pédagogique'}
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isHighlight = (item as any).highlight;

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? isHighlight
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs'
                        : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold'
                      : isHighlight
                      ? 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/60 bg-indigo-50/30 dark:bg-indigo-950/20'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive
                        ? isHighlight
                          ? 'text-white'
                          : 'text-indigo-600'
                        : isHighlight
                        ? 'text-indigo-600'
                        : 'text-slate-400'
                    }`}
                  />
                  <span className="flex-1 text-left">{item.label}</span>
                  {isHighlight && (
                    <span
                      className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      IA
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick reference curriculum note */}
          {!isAdmin && currentUser.subject && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px] text-slate-500 space-y-1">
              <div className="font-semibold text-slate-700 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                Discipline active
              </div>
              <p>
                Vous gérez uniquement vos séances et les cotations de vos élèves en{' '}
                <strong className="text-slate-800">{currentUser.subject}</strong>.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar Footer with Logout Button */}
        <div className="pt-6 border-t border-slate-200/80 space-y-3">
          <button
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              logout();
            }}
            className="w-full py-2.5 px-3 rounded-xl border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-500" />
            <span>Déconnexion</span>
          </button>
          <div className="text-[11px] text-slate-400 text-center">
            Synapse Coach • Pédagogie
          </div>
        </div>
      </aside>
    </>
  );
};
