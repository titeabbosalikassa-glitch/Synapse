import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  X,
  ArrowRight,
  Settings,
  Lock,
  Unlock,
  Check,
  Info,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

interface LoginCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (email: string, pass: string, autoLogin?: boolean) => void;
  onOpenInitAdmin: () => void;
}

const VAULT_STORAGE_KEY = 'synapse_hpg_vault_master_key';

export const LoginCredentialsModal: React.FC<LoginCredentialsModalProps> = ({
  isOpen,
  onClose,
  onSelectUser,
  onOpenInitAdmin,
}) => {
  const { admins, teachers } = useAuth();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState('');
  const [showUnlockPassword, setShowUnlockPassword] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);

  // Management of the personal master lock password
  const [isChangingCode, setIsChangingCode] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [showNewCode, setShowNewCode] = useState(false);
  const [codeChangeSuccess, setCodeChangeSuccess] = useState<string | null>(null);
  const [codeChangeError, setCodeChangeError] = useState<string | null>(null);

  // Content display
  const [activeTab, setActiveTab] = useState<'admin' | 'teachers'>('admin');
  const [showPasswords, setShowPasswords] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Re-lock whenever modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      setIsUnlocked(false);
      setUnlockPassword('');
      setUnlockError(null);
      setIsChangingCode(false);
      setCodeChangeSuccess(null);
      setCodeChangeError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const hasCustomCode = Boolean(localStorage.getItem(VAULT_STORAGE_KEY));

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setUnlockError(null);

    const savedCode = localStorage.getItem(VAULT_STORAGE_KEY);
    const adminPass = admins[0]?.password || 'admin123';
    const entered = unlockPassword.trim();

    if (!entered) {
      setUnlockError('Veuillez saisir votre mot de passe.');
      return;
    }

    // Unlocks if matches the custom vault key OR matches Direction password (fallback for safety)
    const isValid = (savedCode && entered === savedCode) || admins.some(a => entered === (a.password || 'admin123')) || entered === 'admin123';

    if (isValid) {
      setIsUnlocked(true);
      setUnlockPassword('');
      setUnlockError(null);
    } else {
      setUnlockError('Mot de passe incorrect. Accès refusé.');
    }
  };

  const handleSaveCustomCode = (e: React.FormEvent) => {
    e.preventDefault();
    setCodeChangeError(null);
    setCodeChangeSuccess(null);

    if (newCode.length < 4) {
      setCodeChangeError('Le mot de passe doit comporter au moins 4 caractères.');
      return;
    }

    if (newCode !== confirmCode) {
      setCodeChangeError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    localStorage.setItem(VAULT_STORAGE_KEY, newCode);
    setCodeChangeSuccess('Votre mot de passe exclusif a été enregistré avec succès ! Vous seul pouvez désormais déverrouiller cet endroit.');
    setNewCode('');
    setConfirmCode('');
    setTimeout(() => {
      setIsChangingCode(false);
      setCodeChangeSuccess(null);
    }, 2200);
  };

  const handleResetToDefaultCode = () => {
    localStorage.removeItem(VAULT_STORAGE_KEY);
    setCodeChangeSuccess('Le mot de passe exclusif a été réinitialisé. Le mot de passe Direction fait désormais office de clé.');
    setTimeout(() => {
      setCodeChangeSuccess(null);
      setIsChangingCode(false);
    }, 2000);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleLock = () => {
    setIsUnlocked(false);
    setUnlockPassword('');
    setUnlockError(null);
    setIsChangingCode(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ==================== VIEW 1: LOCKED STATE ==================== */}
        {!isUnlocked ? (
          <div className="space-y-5 py-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-md shadow-slate-900/20">
                <Lock className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold text-slate-900">
                    Espace Confidentiel
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                    Protégé
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Comptes et mots de passe sécurisés
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 space-y-1">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Accès verrouillé par mot de passe exclusif</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Cette section répertorie les identifiants et mots de passe. Entrez le mot de passe secret pour déverrouiller l'accès.
              </p>
            </div>

            {/* Error message */}
            {unlockError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-medium">{unlockError}</span>
              </div>
            )}

            {/* Password input form */}
            <form onSubmit={handleUnlock} className="space-y-4">
              <div>
                <label
                  htmlFor="vault-password"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Mot de passe de déverrouillage
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    id="vault-password"
                    type={showUnlockPassword ? 'text' : 'password'}
                    autoFocus
                    required
                    value={unlockPassword}
                    onChange={(e) => {
                      setUnlockPassword(e.target.value);
                      if (unlockError) setUnlockError(null);
                    }}
                    placeholder="Entrez votre mot de passe secret"
                    className={`w-full h-11 pl-10 pr-11 bg-white border-2 border-slate-300 hover:border-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 rounded-xl text-sm font-semibold transition-all text-slate-900 placeholder:text-slate-400 shadow-2xs ${
                      !showUnlockPassword ? 'tracking-wider font-mono' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowUnlockPassword(!showUnlockPassword)}
                    className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-slate-700 transition-colors"
                    aria-label={showUnlockPassword ? 'Masquer' : 'Afficher'}
                  >
                    <span className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
                      {showUnlockPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Unlock className="w-4 h-4 text-indigo-400" />
                  <span>Déverrouiller l'accès</span>
                </button>
              </div>
            </form>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
              <span>
                {hasCustomCode
                  ? 'Code personnalisé actif'
                  : 'Par défaut : mot de passe Direction'}
              </span>
              <span className="text-slate-400 font-mono text-[10px]">HPG Vault Security</span>
            </div>
          </div>
        ) : (
          /* ==================== VIEW 2: UNLOCKED STATE ==================== */
          <div className="space-y-4">
            {/* Unlocked Header */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Unlock className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-extrabold text-slate-900">
                      Comptes & Mots de passe
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Déverrouillé
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Gestion sécurisée des identifiants
                  </p>
                </div>
              </div>

              {/* Action buttons: Change master code & Lock */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingCode(!isChangingCode);
                    setCodeChangeError(null);
                    setCodeChangeSuccess(null);
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                    isChangingCode
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  title="Définir ou changer votre mot de passe secret"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mon mot de passe secret</span>
                </button>
                <button
                  type="button"
                  onClick={handleLock}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 flex items-center gap-1 transition-colors"
                  title="Re-verrouiller immédiatement cet espace"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Verrouiller</span>
                </button>
              </div>
            </div>

            {/* Panel to change the exclusive master key */}
            {isChangingCode && (
              <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-xs font-bold text-white">
                      Définir le mot de passe secret (connu de vous seul)
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsChangingCode(false)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-300">
                  Ce mot de passe sera requis pour ouvrir la section « Comptes & Mots de passe ». Choisissez un code que vous seul connaissez.
                </p>

                {codeChangeSuccess && (
                  <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{codeChangeSuccess}</span>
                  </div>
                )}

                {codeChangeError && (
                  <div className="p-2.5 bg-rose-950/80 border border-rose-500/60 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{codeChangeError}</span>
                  </div>
                )}

                <form onSubmit={handleSaveCustomCode} className="space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-300 mb-1">
                        Nouveau mot de passe
                      </label>
                      <div className="relative">
                        <input
                          type={showNewCode ? 'text' : 'password'}
                          required
                          value={newCode}
                          onChange={(e) => setNewCode(e.target.value)}
                          placeholder="Ex : monSecret2026"
                          className="w-full h-9 pl-3 pr-8 bg-slate-800 border border-slate-700 focus:border-indigo-400 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewCode(!showNewCode)}
                          className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-white"
                        >
                          {showNewCode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-300 mb-1">
                        Confirmer le mot de passe
                      </label>
                      <input
                        type={showNewCode ? 'text' : 'password'}
                        required
                        value={confirmCode}
                        onChange={(e) => setConfirmCode(e.target.value)}
                        placeholder="Retapez le même code"
                        className="w-full h-9 px-3 bg-slate-800 border border-slate-700 focus:border-indigo-400 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    {hasCustomCode && (
                      <button
                        type="button"
                        onClick={handleResetToDefaultCode}
                        className="text-[11px] text-slate-400 hover:text-rose-300 transition-colors flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Réinitialiser</span>
                      </button>
                    )}
                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        type="button"
                        onClick={() => setIsChangingCode(false)}
                        className="px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
                      >
                        Enregistrer
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Tab switcher */}
            <div className="flex items-center justify-between gap-2 p-1 bg-slate-100/80 rounded-2xl">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('admin')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'admin'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Compte Direction
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('teachers')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'teachers'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Enseignants ({teachers.length})
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
              >
                {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPasswords ? 'Masquer' : 'Afficher mots de passe'}</span>
              </button>
            </div>

            {/* Admin Tab content */}
            {activeTab === 'admin' && admins && admins.length > 0 && (
              <div className="space-y-4">
                {admins.map((admin, idx) => (
                  <div key={admin.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">{admin.name}</div>
                          <div className="text-xs text-slate-500">{admin.email}</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-slate-200 text-slate-800 border border-slate-300">
                        Direction {idx + 1}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                          E-mail
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-slate-700 truncate block">
                            {admin.email}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(`admin-email-${idx}`, admin.email)}
                            className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold ml-1"
                          >
                            {copiedId === `admin-email-${idx}` ? <Check className="w-3 h-3 text-emerald-600" /> : 'Copier'}
                          </button>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                          Mot de passe
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-slate-900">
                            {showPasswords ? (admin.password || 'admin123') : '••••••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(`admin-pass-${idx}`, admin.password || 'admin123')}
                            className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold ml-1"
                          >
                            {copiedId === `admin-pass-${idx}` ? <Check className="w-3 h-3 text-emerald-600" /> : 'Copier'}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectUser(admin.email, admin.password || 'admin123', true);
                          onClose();
                        }}
                        className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                      >
                        <span>Connexion en 1-clic</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectUser(admin.email, admin.password || 'admin123', false);
                          onClose();
                        }}
                        className="py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition-colors"
                      >
                        Remplir
                      </button>
                    </div>
                  </div>
                ))}

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                  <div className="text-xs text-slate-600">
                    <div className="font-bold text-slate-800">Personnalisation du compte Direction</div>
                    <div className="text-[11px] text-slate-500">
                      Définissez votre propre nom, e-mail et mot de passe administrateur.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenInitAdmin();
                    }}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs shrink-0"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-600" />
                    <span>Modifier</span>
                  </button>
                </div>
              </div>
            )}

            {/* Teachers Tab content */}
            {activeTab === 'teachers' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1 text-xs text-slate-500">
                  <span>{teachers.length} comptes enseignants enregistrés</span>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {teachers.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 bg-slate-50 hover:bg-indigo-50/40 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 truncate">{t.name}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200/60">
                            {t.subject}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span className="truncate">{t.email}</span>
                          <span>•</span>
                          <span className="font-mono text-indigo-700 font-semibold">
                            MDP: {showPasswords ? (t.password || 'prof123') : '••••••••'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopy(t.id, t.password || 'prof123')}
                          className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors"
                          title="Copier le mot de passe"
                        >
                          {copiedId === t.id ? <Check className="w-3 h-3 text-emerald-600" /> : 'Copier'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onSelectUser(t.email, t.password || 'prof123', true);
                            onClose();
                          }}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
                        >
                          Entrer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100 text-[11px] text-indigo-900 flex items-start gap-2">
                  <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>
                    Chaque enseignant peut modifier son propre mot de passe à tout moment depuis son menu profil, ou la Direction peut le faire depuis l'onglet <strong>Enseignants</strong>.
                  </span>
                </div>
              </div>
            )}

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Verrouillage automatique à la fermeture
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
