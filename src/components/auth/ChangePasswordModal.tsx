import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  X,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { User } from '../../types';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser?: User | null; // If provided, change this user's password. Otherwise changes currentUser's password.
  requireCurrentPassword?: boolean;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  targetUser,
  requireCurrentPassword = true,
}) => {
  const { currentUser, changePassword, isAdmin } = useAuth();
  const user = targetUser || currentUser;

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !user) return null;

  const isSelf = currentUser?.id === user.id;
  // If admin is resetting a teacher's password, current password is not strictly required
  const mustRequireCurrent = requireCurrentPassword && isSelf;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mustRequireCurrent && !currentPassword) {
      setError('Veuillez saisir votre mot de passe actuel.');
      return;
    }
    if (!newPassword || newPassword.length < 4) {
      setError('Le nouveau mot de passe doit comporter au moins 4 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('La confirmation ne correspond pas au nouveau mot de passe.');
      return;
    }

    const result = changePassword(
      user.id,
      newPassword,
      mustRequireCurrent ? currentPassword : undefined
    );

    if (!result.success) {
      setError(result.error || 'Impossible de modifier le mot de passe.');
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    }, 1300);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-md w-full max-h-[92vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Modifier le mot de passe
            </h2>
            <p className="text-xs text-slate-500">
              {isSelf
                ? `Mettre à jour le mot de passe de ${user.name}`
                : `Réinitialisation pour ${user.name} (${user.subject || 'Enseignant'})`}
            </p>
          </div>
        </div>

        {success ? (
          <div className="py-6 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Mot de passe mis à jour avec succès !
            </h3>
            <p className="text-xs text-slate-500">
              Le nouveau mot de passe est immédiatement actif et sauvegardé.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!isSelf && (
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Mot de passe actuel enregistré
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-800 mt-0.5">
                    {showCurrent ? (user.password || 'prof123') : '••••••••••••'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  {showCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showCurrent ? 'Masquer' : 'Afficher'}</span>
                </button>
              </div>
            )}

            {mustRequireCurrent && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mot de passe actuel *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Saisissez votre mot de passe actuel"
                    className={`w-full h-11 pl-10 pr-12 bg-white border-2 border-slate-300 hover:border-slate-400 rounded-xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-600 transition-all text-slate-900 shadow-2xs ${
                      !showCurrent ? 'tracking-wider font-mono' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    <span className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </span>
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nouveau mot de passe *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 4 caractères"
                  className={`w-full h-11 pl-10 pr-12 bg-white border-2 border-slate-300 hover:border-slate-400 rounded-xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-600 transition-all text-slate-900 shadow-2xs ${
                    !showNew ? 'tracking-wider font-mono' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  <span className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Confirmez le nouveau mot de passe *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Retapez le nouveau mot de passe"
                  className={`w-full h-11 pl-10 pr-12 bg-white border-2 border-slate-300 hover:border-slate-400 rounded-xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-600 transition-all text-slate-900 shadow-2xs ${
                    !showConfirm ? 'tracking-wider font-mono' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  <span className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </span>
                </button>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Enregistrer le mot de passe</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
