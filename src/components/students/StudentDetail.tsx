import React, { useState } from 'react';
import {
  Student,
  Session,
  Objective,
  NotionStatus,
  ResourceDocument,
  NotionAssessmentStatus,
  User,
} from '../../types';
import { REFERENCE_CURRICULUM } from '../../data/mockData';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Award,
  BookOpen,
  FileText,
  Plus,
  TrendingUp,
  AlertCircle,
  Phone,
  Mail,
  Edit,
  Trash2,
  HelpCircle,
  Printer,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { StudentUnderstandingD3Chart } from './StudentUnderstandingD3Chart';

interface StudentDetailProps {
  student: Student;
  teacher?: User;
  sessions: Session[];
  objectives: Objective[];
  notionStatuses: NotionStatus[];
  resources: ResourceDocument[];
  onBack: () => void;
  onOpenNewSession: () => void;
  onOpenNewObjective: () => void;
  onOpenUploadPdf: () => void;
  onEditStudent: (student: Student) => void;
  onUpdateNotionStatus: (notion: NotionStatus, newStatus: NotionAssessmentStatus) => void;
  onAddCustomNotion: (chapter: string, notionName: string) => void;
  onEditSession: (session: Session) => void;
  onDeleteSession: (session: Session) => void;
  onEditObjective: (objective: Objective) => void;
  onDeleteObjective: (objective: Objective) => void;
  onDeleteResource: (resource: ResourceDocument) => void;
  isAdmin?: boolean;
}

export const StudentDetail: React.FC<StudentDetailProps> = ({
  student,
  teacher,
  sessions,
  objectives,
  notionStatuses,
  resources,
  onBack,
  onOpenNewSession,
  onOpenNewObjective,
  onOpenUploadPdf,
  onEditStudent,
  onUpdateNotionStatus,
  onAddCustomNotion,
  onEditSession,
  onDeleteSession,
  onEditObjective,
  onDeleteObjective,
  onDeleteResource,
  isAdmin = false,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'notions' | 'sessions' | 'objectives' | 'resources' | 'evolution'>('notions');
  const [newChapterInput, setNewChapterInput] = useState('');
  const [newNotionInput, setNewNotionInput] = useState('');
  const [isAddingNotion, setIsAddingNotion] = useState(false);

  // Student specific data
  const studentSessions = sessions.filter((s) => s.studentId === student.id);
  const studentObjectives = objectives.filter((o) => o.studentId === student.id);
  const studentNotions = notionStatuses.filter((n) => n.studentId === student.id);
  const studentResources = resources.filter((r) => r.studentId === student.id || !r.studentId);

  // Notion counts
  const assimilatedCount = studentNotions.filter((n) => n.status === 'assimilated').length;
  const studiedCount = studentNotions.filter((n) => n.status === 'studied').length;
  const toReinforceCount = studentNotions.filter((n) => n.status === 'to_reinforce').length;
  const totalNotions = studentNotions.length;
  const assimilationRate = totalNotions > 0 ? Math.round((assimilatedCount / totalNotions) * 100) : 0;

  // Average session score
  const avgScore =
    studentSessions.length > 0
      ? Math.round(
          studentSessions.reduce((sum, s) => sum + s.rating.calculatedScore, 0) / studentSessions.length
        )
      : 0;

  // Evolution data for charts
  const sessionChartData = studentSessions
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((s, index) => ({
      seance: `Séance ${index + 1}`,
      date: new Date(s.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      score: s.rating.calculatedScore,
      subject: s.subject,
    }));

  const handleAddNotionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotionInput.trim()) return;
    onAddCustomNotion(newChapterInput.trim() || 'Chapitre Général', newNotionInput.trim());
    setNewNotionInput('');
    setIsAddingNotion(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* En-tête pour impression (Conseil de classe) */}
      <div className="print-header hidden print:block">
        <div className="flex justify-between items-center border-b-2 border-slate-900 pb-3 mb-4">
          <div>
            <h1 className="text-xl font-black text-slate-900">Synapse Coach — Établissement d'Enseignement et de Suivi</h1>
            <p className="text-sm font-bold text-indigo-700">Fiche de Synthèse Pédagogique — Conseil de Classe</p>
          </div>
          <div className="text-right text-xs text-slate-600">
            <p className="font-semibold">{student.firstName} {student.lastName}</p>
            <p>{student.classLevel} {student.stream !== 'Général' ? `• ${student.stream}` : ''}</p>
            <p>Édition du {new Date().toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
      </div>

      {/* Navigation retour */}
      <div className="flex items-center justify-between print:hidden">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à la liste des élèves</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer la Fiche (Conseil)</span>
          </button>
          <button
            onClick={() => onEditStudent(student)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Modifier la fiche</span>
          </button>
        </div>
      </div>

      {/* Carte d'identité de l'élève */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {student.firstName} {student.lastName}
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold border border-indigo-200/60">
                {student.classLevel} {student.stream !== 'Général' ? `• Filière ${student.stream}` : ''}
              </span>
            </div>

            <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
              {student.parentPhone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {student.parentPhone}
                </span>
              )}
              {student.parentEmail && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {student.parentEmail}
                </span>
              )}
              {teacher && (
                <span className="text-indigo-700 font-medium">
                  Enseignant référent : {teacher.name} ({teacher.subject})
                </span>
              )}
            </div>

            {student.notes && (
              <p className="text-xs text-slate-600 pt-2 italic">
                Remarques : « {student.notes} »
              </p>
            )}
          </div>

          {/* Boutons d'actions rapides */}
          <div className="flex flex-wrap items-center gap-2 self-start">
            <button
              onClick={onOpenNewSession}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> + Séance
            </button>
            <button
              onClick={onOpenNewObjective}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <TrendingUp className="w-3.5 h-3.5" /> + Objectif
            </button>
            <button
              onClick={onOpenUploadPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" /> + PDF
            </button>
          </div>
        </div>

        {/* Indicateurs de progression de l'élève */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[11px] text-slate-500 font-medium">Séances totales</span>
            <div className="text-lg font-black text-slate-900">{studentSessions.length}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[11px] text-slate-500 font-medium">Moy. Cotation</span>
            <div className="text-lg font-black text-indigo-700 font-mono">
              {avgScore ? `${avgScore}/100` : '—'}
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[11px] text-slate-500 font-medium">Assimilation Notions</span>
            <div className="text-lg font-black text-emerald-600">{assimilationRate}%</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[11px] text-slate-500 font-medium">Objectifs Actifs</span>
            <div className="text-lg font-black text-slate-900">{studentObjectives.length}</div>
          </div>
        </div>
      </div>

      {/* Onglets secondaires encapsulés */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveSubTab('notions')}
            className={`pb-3 text-xs font-bold transition-all relative ${
              activeSubTab === 'notions'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Notions & Assimilation ({studentNotions.length})
          </button>
          <button
            onClick={() => setActiveSubTab('sessions')}
            className={`pb-3 text-xs font-bold transition-all relative ${
              activeSubTab === 'sessions'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Séances & Cotations ({studentSessions.length})
          </button>
          <button
            onClick={() => setActiveSubTab('objectives')}
            className={`pb-3 text-xs font-bold transition-all relative ${
              activeSubTab === 'objectives'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Objectifs ({studentObjectives.length})
          </button>
          <button
            onClick={() => setActiveSubTab('resources')}
            className={`pb-3 text-xs font-bold transition-all relative ${
              activeSubTab === 'resources'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Ressources PDF ({studentResources.length})
          </button>
          <button
            onClick={() => setActiveSubTab('evolution')}
            className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
              activeSubTab === 'evolution'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Graphiques d'Évolution</span>
          </button>
        </nav>
      </div>

      {/* CONTENU DE L'ONGLET SÉLECTIONNÉ */}

      {/* 1. NOTIONS & ASSIMILATION */}
      {activeSubTab === 'notions' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Cartographie des Notions & Statuts
                </h2>
                <p className="text-xs text-slate-500">
                  Cliquez sur un statut pour le modifier instantanément : Étudiée, Assimilée ou À renforcer.
                </p>
              </div>

              <button
                onClick={() => setIsAddingNotion(!isAddingNotion)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors self-start sm:self-center"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Ajouter une notion</span>
              </button>
            </div>

            {/* Formulaire ajout rapide de notion */}
            {isAddingNotion && (
              <form
                onSubmit={handleAddNotionSubmit}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
              >
                <h4 className="text-xs font-bold text-slate-800">Ajouter une notion personnalisée</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Chapitre</label>
                    <input
                      type="text"
                      value={newChapterInput}
                      onChange={(e) => setNewChapterInput(e.target.value)}
                      placeholder="Ex: Analyse combinatoire"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Intitulé de la notion</label>
                    <input
                      type="text"
                      value={newNotionInput}
                      onChange={(e) => setNewNotionInput(e.target.value)}
                      placeholder="Ex: Permutations et arrangements"
                      required
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingNotion(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 rounded-lg hover:bg-slate-200"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                  >
                    Enregistrer la notion
                  </button>
                </div>
              </form>
            )}

            {/* Liste des notions groupées par chapitre */}
            <div className="space-y-3">
              {studentNotions.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Aucune notion enregistrée pour cet élève. Enregistrez une séance ou ajoutez des notions.
                </div>
              ) : (
                studentNotions.map((n) => (
                  <div
                    key={n.id}
                    className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{n.notion}</div>
                      <div className="text-[11px] text-slate-500">
                        {n.subject} • Chapitre : <strong>{n.chapter}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onUpdateNotionStatus(n, 'studied')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                          n.status === 'studied'
                            ? 'bg-blue-600 text-white shadow-2xs font-bold'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Étudiée
                      </button>
                      <button
                        onClick={() => onUpdateNotionStatus(n, 'assimilated')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                          n.status === 'assimilated'
                            ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Assimilée
                      </button>
                      <button
                        onClick={() => onUpdateNotionStatus(n, 'to_reinforce')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                          n.status === 'to_reinforce'
                            ? 'bg-amber-600 text-white shadow-2xs font-bold'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        À renforcer
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. SÉANCES & COTATIONS */}
      {activeSubTab === 'sessions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Historique des Séances ({studentSessions.length})
            </h3>
            <button
              onClick={onOpenNewSession}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> + Nouvelle séance
            </button>
          </div>

          <div className="space-y-3">
            {studentSessions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-400 text-xs">
                Aucune séance n'a encore été enregistrée pour cet élève.
              </div>
            ) : (
              studentSessions.map((sess) => (
                <div
                  key={sess.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {sess.chapter} — {sess.notion}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          ({sess.durationMinutes} min)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Objectif : {sess.objective}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Cotation</span>
                        <span className="text-sm font-mono font-bold text-indigo-700">
                          {sess.rating.calculatedScore} / 100
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEditSession(sess)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
                          title="Modifier la séance"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteSession(sess)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                          title="Supprimer la séance"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 5 Critères de cotation */}
                  <div className="grid grid-cols-5 gap-2 text-center text-[10px] bg-slate-50 p-2.5 rounded-xl">
                    <div>
                      <span className="text-slate-400 block">Compréhension</span>
                      <strong className="text-slate-800">{sess.rating.understanding}/20</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Autonomie</span>
                      <strong className="text-slate-800">{sess.rating.autonomy}/20</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Méthode</span>
                      <strong className="text-slate-800">{sess.rating.methodology}/20</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Implication</span>
                      <strong className="text-slate-800">{sess.rating.engagement}/20</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Progression</span>
                      <strong className="text-slate-800">{sess.rating.progression}/20</strong>
                    </div>
                  </div>

                  {sess.appreciation && (
                    <div className="text-xs text-indigo-900 bg-indigo-50/50 p-3 rounded-xl italic">
                      Appréciation de l'enseignant : « {sess.appreciation} »
                    </div>
                  )}

                  <div className="text-[11px] text-slate-400 text-right">
                    Séance du {sess.date}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 3. OBJECTIFS */}
      {activeSubTab === 'objectives' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Objectifs Pédagogiques ({studentObjectives.length})
            </h3>
            <button
              onClick={onOpenNewObjective}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> + Nouvel objectif
            </button>
          </div>

          <div className="space-y-3">
            {studentObjectives.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-400 text-xs">
                Aucun objectif défini pour le moment.
              </div>
            ) : (
              studentObjectives.map((obj) => (
                <div
                  key={obj.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{obj.title}</h4>
                      {obj.description && (
                        <p className="text-xs text-slate-500 mt-1">{obj.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                          obj.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {obj.status === 'completed' ? 'Atteint' : 'En cours'}
                      </span>
                      <button
                        onClick={() => onEditObjective(obj)}
                        className="p-1 text-slate-400 hover:text-indigo-600"
                        title="Modifier l'objectif"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteObjective(obj)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                        title="Supprimer l'objectif"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Progression</span>
                      <span className="font-bold text-indigo-700">{obj.progressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${obj.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                    <span>Échéance visée : {obj.targetDate}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 4. RESSOURCES PDF */}
      {activeSubTab === 'resources' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Documents PDF Associés ({studentResources.length})
            </h3>
            <button
              onClick={onOpenUploadPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> + Téléverser un PDF
            </button>
          </div>

          <div className="space-y-3">
            {studentResources.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-400 text-xs">
                Aucun PDF disponible pour cet élève.
              </div>
            ) : (
              studentResources.map((res) => (
                <div
                  key={res.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0 ring-1 ring-rose-200/50">
                      PDF
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{res.title}</h4>
                      <p className="text-[11px] text-slate-500">
                        {res.chapter} • {(res.fileSize / 1024).toFixed(0)} Ko
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={res.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      Consulter
                    </a>
                    <button
                      onClick={() => onDeleteResource(res)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      title="Supprimer la ressource"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 5. ÉVOLUTION & STATISTIQUES GRAPHIQUES */}
      {activeSubTab === 'evolution' && (
        <div className="space-y-6">
          {/* Graphique D3.js dynamique de progression de compréhension */}
          <StudentUnderstandingD3Chart sessions={studentSessions} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Graphique 1: Évolution des notes / scores */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  <span>Évolution des Notes & Scores par Séance</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Suivi chronologique des performances et notes obtenues lors des séances pédagogiques.
                </p>
              </div>

              <div className="h-72 w-full pt-4">
                {sessionChartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                    Aucune séance enregistrée pour cet élève.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sessionChartData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderRadius: '12px',
                          border: 'none',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        name="Score / 100"
                        stroke="#4f46e5"
                        strokeWidth={3}
                        dot={{ fill: '#4f46e5', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Graphique 2: Répartition des notions */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>Synthèse de l'Assimilation des Notions</span>
                </h3>
                <p className="text-xs text-slate-500">
                  État actuel de maîtrise des notions du programme officiel.
                </p>
              </div>

              <div className="h-72 w-full pt-4 flex flex-col justify-center">
                {studentNotions.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                    Aucune notion évaluée.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Assimilées', count: assimilatedCount, fill: '#10b981' },
                        { name: 'Étudiées', count: studiedCount, fill: '#6366f1' },
                        { name: 'À renforcer', count: toReinforceCount, fill: '#f59e0b' },
                      ]}
                      margin={{ top: 10, right: 20, bottom: 10, left: -20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderRadius: '12px',
                          border: 'none',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="count" name="Nombre de notions" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
