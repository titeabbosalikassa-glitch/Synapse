import React, { useState } from 'react';
import { User, Student, Session } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { ChangePasswordModal } from '../auth/ChangePasswordModal';
import {
  Users,
  Mail,
  Phone,
  ArrowRight,
  Trash2,
  UserPlus,
  KeyRound,
  Eye,
  EyeOff,
  Search,
  Key,
  ShieldAlert,
  Check,
  X,
  Clock,
  GraduationCap,
} from 'lucide-react';

interface TeacherSelectorProps {
  teachers: User[];
  selectedTeacher: User | null;
  onSelectTeacher: (teacher: User) => void;
  onDeleteTeacher: (teacher: User) => void;
  onAddTeacher?: () => void;
  students: Student[];
  sessions?: Session[];
}

export const TeacherSelector: React.FC<TeacherSelectorProps> = ({
  teachers,
  selectedTeacher,
  onSelectTeacher,
  onDeleteTeacher,
  onAddTeacher,
  students,
  sessions = [],
}) => {
  const { accountRequests, approveAccountRequest, rejectAccountRequest } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [editingPasswordUser, setEditingPasswordUser] = useState<User | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const pendingRequests = accountRequests.filter((r) => r.status === 'pending');

  const handleApprove = (reqId: string, name: string) => {
    const res = approveAccountRequest(reqId);
    if (res.success) {
      setActionFeedback(`Le compte de ${name} a été validé et intégré au corps professoral.`);
      setTimeout(() => setActionFeedback(null), 4000);
    }
  };

  const handleReject = (reqId: string, name: string) => {
    const res = rejectAccountRequest(reqId);
    if (res.success) {
      setActionFeedback(`La demande de ${name} a été refusée.`);
      setTimeout(() => setActionFeedback(null), 4000);
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredTeachers = teachers.filter((t) => {
    const q = searchTerm.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      (t.subject && t.subject.toLowerCase().includes(q)) ||
      t.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header with stats and actions */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold shadow-xs">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Gestion du Corps Professoral HPG
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  {teachers.length} actif{teachers.length > 1 ? 's' : ''}
                </span>
                {pendingRequests.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {pendingRequests.length} demande{pendingRequests.length > 1 ? 's' : ''} en attente
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Chaque enseignant dispose de son propre mot de passe et d'un espace isolé. Vous pouvez inspecter leurs séances ou supprimer des comptes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onAddTeacher && (
              <button
                id="add-teacher-btn"
                onClick={onAddTeacher}
                className="py-2 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Ajouter un Enseignant</span>
              </button>
            )}
          </div>
        </div>

        {/* Action feedback message */}
        {actionFeedback && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* Search bar */}
        {teachers.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par nom, matière ou e-mail..."
                className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all text-slate-900"
              />
            </div>
            {selectedTeacher && (
              <div className="ml-auto text-xs text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-200/60 font-semibold flex items-center gap-1.5">
                <span>Espace inspecté : <strong>{selectedTeacher.name}</strong></span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pending Account Requests Section */}
      {pendingRequests.length > 0 && (
        <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <ShieldAlert className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Demandes de création de compte à valider ({pendingRequests.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Une personne a demandé à créer un compte. Conformément aux règles de sécurité, vous devez valider pour activer l'accès, sinon le compte est refusé.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{req.name}</h3>
                      <div className="text-[11px] font-semibold text-indigo-600">
                        Discipline : {req.subject}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>À valider</span>
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{req.email}</span>
                  </div>
                  {req.phone && (
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{req.phone}</span>
                    </div>
                  )}
                  <div className="text-[10px] text-slate-400 pt-1">
                    Demande soumise le {req.requestedAt}
                  </div>
                </div>

                {/* Validation & Refusal buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleApprove(req.id, req.name)}
                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Check className="w-4 h-4" />
                    <span>Valider le compte</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(req.id, req.name)}
                    className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Refuser</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Teachers Grid */}
      {filteredTeachers.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            {teachers.length === 0 ? 'Aucun enseignant actif' : 'Aucun enseignant ne correspond à la recherche'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {teachers.length === 0
              ? 'Aucun enseignant actif. Vous pouvez créer un nouveau compte enseignant.'
              : 'Essayez un autre mot-clé ou réinitialisez la recherche.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeachers.map((teacher) => {
            const teacherStudents = students.filter((s) => s.teacherId === teacher.id);
            const teacherSessions = sessions.filter((s) => s.teacherId === teacher.id);
            const isSelected = selectedTeacher?.id === teacher.id;
            const isPwVisible = visiblePasswords[teacher.id];
            const teacherPassword = teacher.password || 'prof123';

            return (
              <div
                key={teacher.id}
                id={`teacher-card-${teacher.id}`}
                className={`bg-white rounded-3xl border transition-all p-5 shadow-2xs flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-slate-900 truncate">
                        {teacher.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
                          {teacher.subject}
                        </span>
                      </div>
                    </div>

                    <div className="w-9 h-9 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {teacher.name.charAt(0)}
                    </div>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{teacher.email}</span>
                    </div>
                    {teacher.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{teacher.phone}</span>
                      </div>
                    )}
                    {/* Clean Access & Password action button */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingPasswordUser(teacher)}
                        className="w-full py-1.5 px-3 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-indigo-50/70 hover:border-indigo-200 text-slate-600 hover:text-indigo-700 text-xs font-semibold flex items-center justify-between transition-colors group"
                        title="Consulter ou réinitialiser le mot de passe"
                      >
                        <span className="flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                          <span>Identifiants & Accès</span>
                        </span>
                        <span className="text-[11px] text-indigo-600 font-bold group-hover:underline">
                          Modifier
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
                    <div className="p-2 bg-slate-50 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                        Élèves
                      </span>
                      <strong className="text-sm text-slate-900 font-mono">
                        {teacherStudents.length}
                      </strong>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                        Séances
                      </span>
                      <strong className="text-sm text-indigo-700 font-mono">
                        {teacherSessions.length}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Actions: Inspect or Delete */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => onSelectTeacher(teacher)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{isSelected ? 'Espace sélectionné' : "Consulter l'espace"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    id={`delete-teacher-${teacher.id}`}
                    onClick={() => onDeleteTeacher(teacher)}
                    title={`Supprimer le compte de ${teacher.name}`}
                    className="p-2 rounded-xl border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                    aria-label={`Supprimer l'enseignant ${teacher.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Change Password Modal for teachers (administered by Admin) */}
      <ChangePasswordModal
        isOpen={Boolean(editingPasswordUser)}
        targetUser={editingPasswordUser}
        requireCurrentPassword={false}
        onClose={() => setEditingPasswordUser(null)}
      />
    </div>
  );
};
