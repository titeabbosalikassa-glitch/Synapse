import React, { useEffect } from 'react';
import { AdminNotification } from '../../types';
import { Bell, Clock, Calendar, X, CheckCircle2 } from 'lucide-react';

interface NotificationToastProps {
  notification: AdminNotification | null;
  onClose: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose,
}) => {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onClose();
    }, 6000);
    return () => clearTimeout(timer);
  }, [notification, onClose]);

  if (!notification) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-md w-full animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-800 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
          <Bell className="w-5 h-5 animate-bounce" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Notification Administrateur
            </span>
            <span className="text-[10px] text-slate-400">À l'instant</span>
          </div>

          <p className="text-xs font-bold text-white mt-1.5 leading-relaxed">
            {notification.message}
          </p>

          {notification.studentName && (
            <p className="text-[11px] text-slate-300 mt-0.5">
              Élève inscrit : <strong>{notification.studentName}</strong>
            </p>
          )}

          <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-300 font-medium">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              {notification.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <strong className="text-white">{notification.time}</strong>
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
