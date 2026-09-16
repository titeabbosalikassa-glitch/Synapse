import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, ShieldCheck, KeyRound, Settings, User, Mail, Phone, BookOpen, Check, Lock, AlertCircle } from 'lucide-react';

export const AccountProfilePage: React.FC = () => {
  const { currentUser, isAdmin, changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!currentUser) return null;

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage('Veuillez remplir tous les champs du formulaire.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }

    if (newPassword.length < 4) {
      setErrorMessage('Le nouveau mot de passe doit comporter au moins 4 caractères.');
      return;
    }

    const result = changePassword(currentUser.id, newPassword, currentPassword);
    if (result.success) {
      setSuccessMessage('Votre mot de passe a été modifié avec succès !');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setErrorMessage(result.error || 'Impossible de modifier le mot de passe.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black ${
              isAdmin ? 'bg-slate-900 text-white shadow-md' : 'bg-indigo-600 text-white shadow-md'
            }`}
          >
            {isAdmin ? <ShieldCheck className="w-7 h-7" /> : currentUser.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <span>{currentUser.name}</span>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                  isAdmin ? 'bg-slate-100 text-slate-800 border border-slate-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                }`}
              >
                {isAdmin ? 'Direction Pédagogique' : `Enseignant • ${currentUser.subject}`}
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {currentUser.email}
              </span>
              {currentUser.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {currentUser.phone}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informations du Compte */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-4 h-4 text-indigo-600" />
            <span>Détails du Compte Connecté</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-400">Nom complet :</span>
              <span className="font-bold text-slate-800">{currentUser.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-400">Adresse e-mail :</span>
              <span className="font-mono text-slate-700 font-medium">{currentUser.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-400">Rôle principal :</span>
              <span className="font-bold text-slate-800">
                {isAdmin ? 'Administrateur / Direction' : 'Enseignant titulaire'}
              </span>
            </div>
            {!isAdmin && currentUser.subject && (
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-400">Matière / Discipline :</span>
                <span className="font-bold text-indigo-600">{currentUser.subject}</span>
              </div>
            )}
            {currentUser.phone && (
              <div className="flex justify-between py-2">
                <span className="text-slate-400">Téléphone de contact :</span>
                <span className="font-medium text-slate-700">{currentUser.phone}</span>
              </div>
            )}
          </div>

          {isAdmin && (
            <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-amber-700" />
                <span>Privilèges Direction & Administration HPG</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                En tant qu'administrateur principal, vous disposez des droits complets sur la gestion des enseignants, le suivi consolidé des élèves, le journal des activités et le studio d'exercices IA.
              </p>
            </div>
          )}
        </div>

        {/* Changer le mot de passe */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <KeyRound className="w-4 h-4 text-indigo-600" />
            <span>Sécurité & Changement de Mot de Passe</span>
          </h2>

          <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700">Mot de passe actuel</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700">Nouveau mot de passe</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700">Confirmer le nouveau mot de passe</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors shadow-xs flex items-center justify-center gap-2 mt-2"
            >
              <Lock className="w-4 h-4" />
              <span>Mettre à jour le mot de passe</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
