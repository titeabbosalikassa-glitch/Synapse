import React, { useState } from 'react';
import {
  Student,
  Session,
  Objective,
  NotionStatus,
  User,
  Evaluation,
  ResourceDocument,
  ClassLevel,
  Stream,
  AdminNotification,
} from '../../types';
import { useAuth } from '../../context/AuthContext';
import { SUBJECTS, ALL_CLASSES } from '../../data/mockData';
import {
  Users,
  Calendar,
  Sparkles,
  Award,
  CheckCircle2,
  TrendingUp,
  FileText,
  Plus,
  Filter,
  Layers,
  GraduationCap,
  Bell,
  Clock,
  UserPlus,
  KeyRound,
  ShieldCheck,
  Settings,
} from 'lucide-react';

interface SimpleDashboardProps {
  students: Student[];
  sessions: Session[];
  objectives: Objective[];
  notionStatuses: NotionStatus[];
  resources: ResourceDocument[];
  evaluations: Evaluation[];
  teachers: User[];
  notifications?: AdminNotification[];
  onNavigateTab: (tab: string) => void;
  onSelectStudent: (student: Student) => void;
  onOpenNewSession: () => void;
  onOpenNewStudent: () => void;
  onOpenUploadPdf: () => void;
}

export const SimpleDashboard: React.FC<SimpleDashboardProps> = ({
  students,
  sessions,
  objectives,
  notionStatuses,
  resources,
  evaluations,
  teachers,
  notifications = [],
  onNavigateTab,
  onSelectStudent,
  onOpenNewSession,
  onOpenNewStudent,
  onOpenUploadPdf,
}) => {
  const { currentUser, isAdmin } = useAuth();

  if (!currentUser) return null;

  // Admin filter states for global supervision
  const [filterTeacher, setFilterTeacher] = useState<string>('all');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');

  // Calculate metrics
  const totalStudents = students.length;
  const totalSessions = sessions.length;
  const totalObjectives = objectives.length;
  const completedObjectives = objectives.filter((o) => o.status === 'completed').length;
  const assimilatedNotions = notionStatuses.filter((n) => n.status === 'assimilated').length;
  const studiedNotions = notionStatuses.filter((n) => n.status === 'studied').length;
  const toReinforceNotions = notionStatuses.filter((n) => n.status === 'to_reinforce').length;

  // Average session score
  const avgScore =
    sessions.length > 0
      ? Math.round(
          sessions.reduce((acc, s) => acc + s.rating.calculatedScore, 0) / sessions.length
        )
      : 0;

  // Admin filtered data
  const adminFilteredStudents = students.filter((st) => {
    const matchTeacher = filterTeacher === 'all' || st.teacherId === filterTeacher;
    const matchClass = filterClass === 'all' || st.classLevel === filterClass;
    return matchTeacher && matchClass;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {isAdmin ? 'Supervision Globale' : `Bonjour, ${currentUser.name}`}
              </h1>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  isAdmin
                    ? 'bg-amber-100 text-amber-800 border border-amber-200/60'
                    : 'bg-indigo-100 text-indigo-700 border border-indigo-200/60'
                }`}
              >
                {isAdmin ? 'Direction' : currentUser.subject}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {isAdmin
                ? 'Suivi consolidé des enseignants, des élèves et du cycle de cotation.'
                : 'Suivi pédagogique continu, enregistrement des séances et validation des notions.'}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {!isAdmin ? (
              <>
                <button
                  onClick={onOpenNewSession}
                  title="Raccourci: Ctrl + Shift + S"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" /> + Nouvelle séance
                </button>
                <button
                  onClick={onOpenNewStudent}
                  title="Raccourci: Ctrl + N"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  <Users className="w-4 h-4" /> + Nouvel élève
                </button>
                <button
                  onClick={onOpenUploadPdf}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  <FileText className="w-4 h-4" /> + PDF
                </button>
              </>
            ) : (
              <button
                onClick={() => onNavigateTab('ai-exercises')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-xs transition-all"
              >
                <Sparkles className="w-4 h-4" /> Générer un Devoir IA (/20)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Inactivity Reminder Banner (> 5 days without session) */}
      {(() => {
        const now = new Date().getTime();
        const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;
        const inactiveStudents = students.filter((student) => {
          if (!isAdmin && student.teacherId !== currentUser.id) return false;
          const studentSessions = sessions.filter((s) => s.studentId === student.id);
          if (studentSessions.length === 0) {
            const createdTime = new Date(student.createdAt || Date.now()).getTime();
            return now - createdTime > FIVE_DAYS_MS;
          }
          const latestSessionTime = Math.max(...studentSessions.map((s) => new Date(s.date).getTime()));
          return now - latestSessionTime > FIVE_DAYS_MS;
        });

        if (inactiveStudents.length === 0) return null;

        return (
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-amber-900">
                  Rappel Pédagogique : {inactiveStudents.length} élève{inactiveStudents.length > 1 ? 's' : ''} sans séance depuis plus de 5 jours
                </h2>
                <p className="text-xs text-amber-700 mt-0.5">
                  Veuillez planifier une séance de suivi pour assurer la régularité du parcours pédagogique.
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {inactiveStudents.slice(0, 5).map((st) => (
                    <button
                      key={st.id}
                      onClick={() => onSelectStudent(st)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 text-xs font-semibold hover:bg-amber-100 transition-colors shadow-2xs"
                    >
                      <span>{st.firstName} {st.lastName}</span>
                      <span className="text-[10px] text-amber-600">({st.classLevel})</span>
                    </button>
                  ))}
                  {inactiveStudents.length > 5 && (
                    <span className="text-xs text-amber-700 font-semibold self-center">
                      +{inactiveStudents.length - 5} autres...
                    </span>
                  )}
                </div>
              </div>
            </div>
            {!isAdmin && (
              <button
                onClick={onOpenNewSession}
                className="self-stretch sm:self-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs shrink-0 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Planifier une séance
              </button>
            )}
          </div>
        );
      })()}

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {isAdmin ? 'Élèves' : 'Mes Élèves'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{totalStudents}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {isAdmin ? 'Sur les 11 enseignants' : 'Actifs et suivis'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Séances Dispensées</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{totalSessions}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Moy. cotation : <strong className="text-indigo-600">{avgScore}/100</strong>
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Notions Assimilées</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600">{assimilatedNotions}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {studiedNotions} en cours • {toReinforceNotions} à consolider
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {isAdmin ? 'Devoirs IA /20' : 'Objectifs Clés'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              {isAdmin ? <Sparkles className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {isAdmin ? evaluations.length : `${completedObjectives} / ${totalObjectives}`}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {isAdmin ? 'Évaluations enregistrées' : 'Objectifs validés'}
          </p>
        </div>
      </div>

      {/* Notifications Direction : Flux d'ajout des élèves */}
      {isAdmin && notifications.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50/70 via-white to-indigo-50/30 rounded-3xl border border-indigo-100 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Dernières notifications d'inscriptions élèves
                </h2>
                <p className="text-[11px] text-slate-500">
                  Alertes automatiques transmises à la Direction lors de chaque ajout d'élève
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
              {notifications.length} alerte{notifications.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {notifications.slice(0, 3).map((notif) => (
              <div
                key={notif.id}
                className="p-3.5 bg-white rounded-2xl border border-indigo-100/80 shadow-2xs hover:border-indigo-300 transition-all flex flex-col justify-between space-y-2"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                    <UserPlus className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 leading-snug">
                      {notif.message}
                    </p>
                    {notif.studentName && (
                      <p className="text-[11px] text-indigo-700 font-semibold mt-0.5">
                        Élève : {notif.studentName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="flex items-center gap-1 font-medium">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {notif.date}
                  </span>
                  <span className="flex items-center gap-1 font-bold text-indigo-700 font-mono bg-indigo-50 px-1.5 py-0.5 rounded">
                    <Clock className="w-3 h-3 text-indigo-500" />
                    {notif.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin Filter & Cross-Supervision Bar */}
      {isAdmin && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <h2 className="text-sm font-bold text-slate-900">Filtres de Supervision</h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {adminFilteredStudents.length} élève(s) correspondant(s)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Filtrer par Enseignant (11)
              </label>
              <select
                value={filterTeacher}
                onChange={(e) => setFilterTeacher(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="all">Tous les 11 enseignants</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.subject})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Filtrer par Classe
              </label>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="all">Toutes les classes (6e à Tle)</option>
                {ALL_CLASSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilterTeacher('all');
                  setFilterClass('all');
                }}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
              >
                Réinitialiser les filtres
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cycle Pédagogique Central: Élèves & Séances Récentes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Élèves suivis */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {isAdmin ? 'Élèves sous supervision' : 'Mes Élèves'}
              </h2>
              <p className="text-[11px] text-slate-500">
                Sélectionnez un élève pour voir son profil, ses notions et son historique
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('students')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>Voir tous ({students.length})</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {students.slice(0, 6).map((student) => {
              const studentTeacher = teachers.find((t) => t.id === student.teacherId);
              const studentSessions = sessions.filter((s) => s.studentId === student.id);
              const studentNotions = notionStatuses.filter((n) => n.studentId === student.id);
              const assimilatedCount = studentNotions.filter((n) => n.status === 'assimilated').length;

              return (
                <div
                  key={student.id}
                  onClick={() => onSelectStudent(student)}
                  className="group p-4 rounded-xl border border-slate-100 hover:border-indigo-200 bg-slate-50/50 hover:bg-indigo-50/30 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                        {student.firstName} {student.lastName}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700 font-semibold">
                          {student.classLevel}
                        </span>
                        {student.stream !== 'Général' && (
                          <span className="text-[11px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 font-bold">
                            {student.stream}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Séances</span>
                      <span className="text-xs font-bold text-slate-700 font-mono">
                        {studentSessions.length}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {assimilatedCount} notions
                    </span>
                    {isAdmin && studentTeacher && (
                      <span className="text-slate-500 text-[10px]">
                        Prof : {studentTeacher.name.split(' ')[1] || studentTeacher.name}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dernières séances & Cotations */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Dernières Séances</h2>
              <p className="text-[11px] text-slate-500">Cotation continue (/100)</p>
            </div>
            <button
              onClick={() => onNavigateTab('sessions')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Tout voir
            </button>
          </div>

          <div className="space-y-3">
            {sessions.slice(0, 4).map((sess) => {
              const student = students.find((st) => st.id === sess.studentId);
              return (
                <div
                  key={sess.id}
                  className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      {student ? `${student.firstName} ${student.lastName}` : 'Élève'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold font-mono bg-indigo-100 text-indigo-800">
                      {sess.rating.calculatedScore}/100
                    </span>
                  </div>

                  <div className="text-slate-600 text-[11px]">
                    <strong>{sess.chapter}</strong> : {sess.notion}
                  </div>

                  {sess.appreciation && (
                    <p className="text-[11px] text-slate-500 italic line-clamp-1">
                      « {sess.appreciation} »
                    </p>
                  )}

                  <div className="text-[10px] text-slate-400 pt-1 flex items-center justify-between">
                    <span>Date : {sess.date}</span>
                    <span>{sess.durationMinutes} min</span>
                  </div>
                </div>
              );
            })}

            {sessions.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-xs">
                Aucune séance enregistrée pour l'instant.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
