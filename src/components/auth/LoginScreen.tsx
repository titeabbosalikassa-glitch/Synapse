import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SUBJECTS } from '../../data/mockData';
import { InitAdminModal } from './InitAdminModal';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  Settings,
  UserPlus,
  User,
  BookOpen,
  Phone,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Shield,
  X,
} from 'lucide-react';
import { Logo } from '../common/Logo';

export const LoginScreen: React.FC = () => {
  const { login, requestAccount, teachers, adminUser } = useAuth();

  // Mode: 'login' or 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdminSecret, setShowAdminSecret] = useState(false);
  const [isInitAdminOpen, setIsInitAdminOpen] = useState(false);

  // Registration form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regSubject, setRegSubject] = useState<string>(SUBJECTS[0].name);
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [registerSuccessMsg, setRegisterSuccessMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Veuillez saisir votre adresse e-mail professionnelle.');
      return;
    }
    if (!password) {
      setErrorMessage('Veuillez saisir votre mot de passe.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const result = login(email, password);
      setIsLoading(false);
      if (!result.success) {
        setErrorMessage(result.error || 'Identifiants invalides.');
      }
    }, 200);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regName.trim()) {
      setErrorMessage('Veuillez renseigner votre nom et prénom.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setErrorMessage('Veuillez saisir une adresse e-mail valide.');
      return;
    }
    if (!regPassword || regPassword.length < 4) {
      setErrorMessage('Le mot de passe doit comporter au moins 4 caractères.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const result = requestAccount({
        name: regName,
        email: regEmail,
        subject: regSubject,
        phone: regPhone,
        password: regPassword,
      });

      setIsLoading(false);
      if (!result.success) {
        setErrorMessage(result.error || 'Erreur lors de la demande.');
      } else {
        setRegisterSuccess(true);
        setRegisterSuccessMsg(
          result.message ||
            'Votre demande a été soumise avec succès. L\'administrateur a été notifié pour valider votre compte.'
        );
        setEmail(regEmail);
      }
    }, 300);
  };

  const handleSelectUser = (selectedEmail: string, selectedPass: string, autoLogin: boolean = true) => {
    setEmail(selectedEmail);
    setPassword(selectedPass);
    setErrorMessage(null);

    if (autoLogin) {
      setIsLoading(true);
      setTimeout(() => {
        login(selectedEmail, selectedPass);
        setIsLoading(false);
      }, 150);
    }
  };

  const resetRegistrationForm = () => {
    setRegName('');
    setRegEmail('');
    setRegSubject(SUBJECTS[0].name);
    setRegPhone('');
    setRegPassword('');
    setRegConfirmPassword('');
    setRegisterSuccess(false);
    setRegisterSuccessMsg('');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-start sm:justify-center py-6 sm:py-8 px-4 sm:px-6 lg:px-8 text-slate-900 antialiased font-sans overflow-y-auto">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Logo and Brand Header - Clicking subtly toggles Direction access */}
        <button
          type="button"
          onClick={() => setShowAdminSecret((prev) => !prev)}
          title="SYNAPSE COACH"
          className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-white shadow-md shadow-slate-200/50 mb-3 ring-4 ring-indigo-50 hover:bg-slate-50 transition-colors cursor-pointer border border-slate-200/60"
        >
          <Logo size="lg" />
        </button>
        <div className="flex items-center justify-center gap-2 mb-1">
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            SYNAPSE COACH
          </h1>
          <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 border border-indigo-200/80">
            Sciences & Langues
          </span>
        </div>
        <p className="text-sm text-slate-500 font-medium">
          Plateforme de suivi pédagogique & cotation continue
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          Espace réservé aux enseignants et à la direction
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Mode Selector Tab Bar */}
        <div className="mb-4 bg-slate-200/80 p-1 rounded-2xl flex items-center shadow-2xs">
          <button
            type="button"
            id="tab-login-mode"
            onClick={() => {
              setAuthMode('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              authMode === 'login'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Se connecter</span>
          </button>
          <button
            type="button"
            id="tab-register-mode"
            onClick={() => {
              setAuthMode('register');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              authMode === 'register'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Créer un compte</span>
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-white py-6 px-6 sm:px-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-5">
          {/* Header */}
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {authMode === 'login' ? 'Connexion' : 'Créer un compte Enseignant'}
              </h2>
              <p className="text-xs text-slate-500">
                {authMode === 'login'
                  ? 'Accédez à votre espace pédagogique'
                  : 'Soumettez votre demande à la Direction'}
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div
              id="auth-error-alert"
              className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in duration-150"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* ===================== LOGIN FORM ===================== */}
          {authMode === 'login' ? (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="login-email"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Adresse E-mail
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="login-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nom@hpg-education.com"
                      autoComplete="username"
                      className="w-full h-11 pl-10 pr-3.5 bg-white border-2 border-slate-300 hover:border-slate-400 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-500/15 rounded-xl text-sm font-semibold transition-all text-slate-900 placeholder:text-slate-400 shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="login-password"
                      className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                    >
                      Mot de passe
                    </label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className={`w-full h-11 pl-10 pr-12 bg-white border-2 border-slate-300 hover:border-slate-400 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-500/15 rounded-xl text-sm font-semibold transition-all text-slate-900 placeholder:text-slate-400 shadow-2xs ${
                        !showPassword ? 'tracking-wider font-mono' : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-indigo-600 transition-colors"
                      aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      title={showPassword ? 'Masquer' : 'Afficher'}
                    >
                      <span className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </span>
                    </button>
                  </div>
                </div>

                <button
                  id="login-submit-btn"
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50 mt-2"
                >
                  {isLoading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Se connecter</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Call to Action for registration */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setErrorMessage(null);
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1 hover:underline"
                >
                  <span>Pas encore de compte ?</span>
                  <strong className="font-bold">Créer un compte enseignant</strong>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

            </>
          ) : (
            /* ===================== REGISTRATION FORM ===================== */
            <div className="space-y-4">
              {registerSuccess ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-emerald-900">
                      Demande transmise à l'administrateur
                    </h3>
                    <p className="text-xs text-emerald-800 mt-1">
                      {registerSuccessMsg}
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-emerald-200 text-left text-xs space-y-1 text-slate-700">
                    <div><strong>Nom :</strong> {regName}</div>
                    <div><strong>Discipline :</strong> {regSubject}</div>
                    <div><strong>E-mail :</strong> {regEmail}</div>
                    <div className="text-[11px] text-slate-600 font-semibold pt-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Statut : En attente de validation par la Direction</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 italic">
                    Dès que la Direction aura validé votre demande, vous pourrez vous connecter avec votre mot de passe.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      resetRegistrationForm();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    Retour à l'écran de connexion
                  </button>
                </div>
              ) : (
                <>
                  {/* Security Notice */}
                  <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 text-xs flex items-start gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold text-slate-900">Validation requise par la Direction</strong>
                      <span className="text-[11px] text-slate-600">
                        La Direction examinera votre demande d'ouverture de compte. Une fois approuvée, vous pourrez accéder directement à votre espace pédagogique.
                      </span>
                    </div>
                  </div>

                  <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                    {/* Nom et Prénom */}
                    <div>
                      <label
                        htmlFor="reg-name"
                        className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
                      >
                        Nom complet & Titre
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          id="reg-name"
                          type="text"
                          required
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="Dr. Sarah Mensah ou M. Traoré"
                          className="w-full h-10 pl-10 pr-3.5 bg-white border border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/15 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    {/* Discipline / Matière */}
                    <div>
                      <label
                        htmlFor="reg-subject"
                        className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
                      >
                        Discipline / Matière enseignée
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <select
                          id="reg-subject"
                          value={regSubject}
                          onChange={(e) => setRegSubject(e.target.value)}
                          className="w-full h-10 pl-10 pr-8 bg-white border border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/15 rounded-xl text-xs font-semibold text-slate-900"
                        >
                          {SUBJECTS.map((sub) => (
                            <option key={sub.id} value={sub.name}>
                              {sub.name} ({sub.category})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Adresse Email */}
                    <div>
                      <label
                        htmlFor="reg-email"
                        className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
                      >
                        Adresse E-mail académique
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          id="reg-email"
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="prenom.nom@hpg-education.com"
                          className="w-full h-10 pl-10 pr-3.5 bg-white border border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/15 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    {/* Numéro de téléphone (optionnel) */}
                    <div>
                      <label
                        htmlFor="reg-phone"
                        className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
                      >
                        Téléphone professionnel (optionnel)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Phone className="w-4 h-4" />
                        </div>
                        <input
                          id="reg-phone"
                          type="tel"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="+221 77 000 00 00"
                          className="w-full h-10 pl-10 pr-3.5 bg-white border border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/15 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    {/* Mot de passe */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="reg-password"
                          className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
                        >
                          Mot de passe *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Lock className="w-4 h-4" />
                          </div>
                          <input
                            id="reg-password"
                            type={showRegPassword ? 'text' : 'password'}
                            required
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder="min. 4 car."
                            className="w-full h-11 pl-10 pr-10 bg-white border-2 border-slate-300 hover:border-slate-400 focus:border-indigo-600 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 shadow-2xs transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-indigo-600"
                            aria-label={showRegPassword ? 'Masquer' : 'Afficher'}
                          >
                            <span className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center">
                              {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </span>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="reg-confirm-password"
                          className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
                        >
                          Confirmer *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Lock className="w-4 h-4" />
                          </div>
                          <input
                            id="reg-confirm-password"
                            type={showRegPassword ? 'text' : 'password'}
                            required
                            value={regConfirmPassword}
                            onChange={(e) => setRegConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full h-11 pl-10 pr-3.5 bg-white border-2 border-slate-300 hover:border-slate-400 focus:border-indigo-600 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 shadow-2xs transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      id="register-submit-btn"
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-11 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50 mt-4"
                    >
                      {isLoading ? (
                        <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          <span>Envoyer la demande à l'Administrateur</span>
                        </>
                      )}
                    </button>
                  </form>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setErrorMessage(null);
                      }}
                      className="text-xs text-slate-500 hover:text-indigo-600 font-semibold inline-flex items-center gap-1"
                    >
                      <span>Déjà inscrit ?</span>
                      <strong className="text-indigo-600 font-bold">Se connecter</strong>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer info with discreet access */}
        <div className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <span>HPG • Structure d'Excellence Pédagogique (Sciences & Langues)</span>
          <button
            type="button"
            onClick={() => setShowAdminSecret((prev) => !prev)}
            className="p-1 text-slate-300 hover:text-slate-500 transition-colors rounded"
            title="Espace réservé"
            aria-label="Espace réservé"
          >
            <Shield className="w-3 h-3" />
          </button>
        </div>
      </div>



      {/* Admin Customization & Password Modal */}
      <InitAdminModal
        isOpen={isInitAdminOpen}
        onClose={() => setIsInitAdminOpen(false)}
      />
    </div>
  );
};

