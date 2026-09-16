import React, { useState } from 'react';
import { AdminNotification } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  Bell,
  UserPlus,
  CheckCheck,
  Trash2,
  Clock,
  Calendar,
  X,
  Check,
  UserCheck,
  ShieldAlert,
  GraduationCap,
} from 'lucide-react';

interface NotificationsDropdownProps {
  notifications: AdminNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onClearAll: () => void;
  onSelectStudentNotification?: (studentId?: string) => void;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearAll,
  onSelectStudentNotification,
}) => {
  const { accountRequests, approveAccountRequest, rejectAccountRequest } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleApprove = (notif: AdminNotification) => {
    if (!notif.accountRequestId) return;
    const res = approveAccountRequest(notif.accountRequestId);
    if (res.success) {
      onMarkAsRead(notif.id);
      setActionFeedback(`Compte de ${notif.accountRequestData?.name || 'l\'enseignant'} validé avec succès !`);
      setTimeout(() => setActionFeedback(null), 3500);
    }
  };

  const handleReject = (notif: AdminNotification) => {
    if (!notif.accountRequestId) return;
    const res = rejectAccountRequest(notif.accountRequestId);
    if (res.success) {
      onMarkAsRead(notif.id);
      setActionFeedback(`Demande de ${notif.accountRequestData?.name || 'l\'enseignant'} refusée.`);
      setTimeout(() => setActionFeedback(null), 3500);
    }
  };

  return (
    <div className="relative">
      <button
        id="admin-notifications-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition-colors"
        title="Notifications Administrateur"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white rounded-full text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-3 z-50 animate-in fade-in zoom-in-95 duration-100">
            {/* Header */}
            <div className="px-4 pb-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Notifications Direction</h3>
                  <p className="text-[10px] text-slate-400">
                    {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllAsRead}
                    title="Tout marquer comme lu"
                    className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span className="text-[10px] hidden sm:inline">Tout lire</span>
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={onClearAll}
                    title="Effacer tout l'historique"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Action Feedback Banner */}
            {actionFeedback && (
              <div className="mx-3 my-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{actionFeedback}</span>
              </div>
            )}

            {/* List */}
            <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="py-8 px-4 text-center">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 mx-auto flex items-center justify-center mb-2">
                    <Bell className="w-5 h-5 text-slate-300" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">Aucune notification</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Les alertes d'élèves et les demandes de création de compte apparaîtront ici.
                  </p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const isAccountRequest = notif.type === 'account_registration';
                  const reqInContext = notif.accountRequestId
                    ? accountRequests.find((r) => r.id === notif.accountRequestId)
                    : null;
                  const currentStatus = reqInContext?.status || notif.accountRequestData?.status || 'pending';

                  return (
                    <div
                      key={notif.id}
                      className={`p-3.5 transition-colors flex items-start justify-between gap-3 ${
                        isAccountRequest && currentStatus === 'pending'
                          ? 'bg-indigo-50/50 hover:bg-indigo-50/80 border-l-4 border-indigo-500'
                          : !notif.read
                          ? 'bg-indigo-50/40 hover:bg-indigo-50/60'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          isAccountRequest
                            ? currentStatus === 'approved'
                              ? 'bg-emerald-100 text-emerald-700'
                              : currentStatus === 'rejected'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-indigo-100 text-indigo-700'
                            : 'bg-indigo-100 text-indigo-700'
                        }`}
                      >
                        {isAccountRequest ? (
                          currentStatus === 'approved' ? (
                            <UserCheck className="w-4 h-4" />
                          ) : currentStatus === 'rejected' ? (
                            <X className="w-4 h-4" />
                          ) : (
                            <ShieldAlert className="w-4 h-4" />
                          )
                        ) : (
                          <UserPlus className="w-4 h-4" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-slate-900">
                            {notif.title || notif.message}
                          </span>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                          )}
                          {isAccountRequest && (
                            <span
                              className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                                currentStatus === 'approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : currentStatus === 'rejected'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-indigo-100 text-indigo-800'
                              }`}
                            >
                              {currentStatus === 'approved'
                                ? 'Validé'
                                : currentStatus === 'rejected'
                                ? 'Refusé'
                                : 'À Valider'}
                            </span>
                          )}
                        </div>

                        {/* Candidate specific details for account registrations */}
                        {isAccountRequest && notif.accountRequestData ? (
                          <div className="mt-1.5 p-2 bg-white rounded-xl border border-slate-200/70 space-y-1 text-xs">
                            <div className="font-bold text-slate-800 flex items-center gap-1.5">
                              <GraduationCap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                              <span>{notif.accountRequestData.name}</span>
                            </div>
                            <div className="text-[11px] text-slate-600">
                              Discipline : <strong className="text-indigo-700">{notif.accountRequestData.subject}</strong>
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">
                              Email : {notif.accountRequestData.email}
                            </div>
                            {notif.accountRequestData.phone && (
                              <div className="text-[11px] text-slate-500">
                                Tél : {notif.accountRequestData.phone}
                              </div>
                            )}

                            {/* Direct Admin Actions: Validate or Refuse */}
                            {currentStatus === 'pending' ? (
                              <div className="pt-2 mt-1.5 border-t border-slate-100 flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleApprove(notif)}
                                  className="flex-1 py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors shadow-2xs"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Valider le compte</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleReject(notif)}
                                  className="py-1.5 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Refuser</span>
                                </button>
                              </div>
                            ) : currentStatus === 'approved' ? (
                              <div className="pt-1 text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" />
                                <span>Compte validé • Enseignant actif</span>
                              </div>
                            ) : (
                              <div className="pt-1 text-[11px] font-bold text-rose-600 flex items-center gap-1">
                                <X className="w-3.5 h-3.5" />
                                <span>Demande refusée par la Direction</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <>
                            <div className="text-[11px] text-slate-600 mt-0.5">
                              {notif.message}
                            </div>
                            {notif.studentName && (
                              <div className="text-[11px] font-semibold text-slate-700 mt-0.5">
                                Élève : <span className="text-indigo-900">{notif.studentName}</span>
                              </div>
                            )}
                          </>
                        )}

                        {/* Precise Date & Time display */}
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-500 font-medium">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {notif.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-indigo-500" />
                            <span className="font-bold text-indigo-700">{notif.time}</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {!notif.read && (
                          <button
                            onClick={() => onMarkAsRead(notif.id)}
                            title="Marquer comme lu"
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-white rounded transition-colors"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteNotification(notif.id)}
                          title="Supprimer la notification"
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="pt-2 px-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
              <span>HPG • Direction Pédagogique</span>
              <span className="text-indigo-600 font-bold">Sécurisé</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
