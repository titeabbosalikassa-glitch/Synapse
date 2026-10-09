import React, { useState } from 'react';
import {
  Student,
  User,
  NotionStatus,
  Session,
  Evaluation,
  EvaluationExercise,
  SubjectName,
  ClassLevel,
  Stream,
} from '../../types';
import { ALL_CLASSES, SUBJECTS, CLASS_TO_STREAM } from '../../data/mockData';
import { LatexRenderer } from '../common/LatexRenderer';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Edit,
  Save,
  Printer,
  Copy,
  Check,
  History,
  BookOpen,
  HelpCircle,
  Layers,
  FileCheck,
  Plus,
  Trash2,
} from 'lucide-react';

interface AiExerciseStudioProps {
  teachers: User[];
  students: Student[];
  notionStatuses: NotionStatus[];
  sessions: Session[];
  savedEvaluations: Evaluation[];
  onSaveEvaluation: (evaluation: Evaluation) => void;
  onClearEvaluations?: () => void;
  onDeleteEvaluation?: (id: string) => void;
}

export const AiExerciseStudio: React.FC<AiExerciseStudioProps> = ({
  teachers,
  students,
  notionStatuses,
  sessions,
  savedEvaluations,
  onSaveEvaluation,
  onClearEvaluations,
  onDeleteEvaluation,
}) => {
  // Step 1: Configuration state
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<SubjectName>('Mathématiques');
  const [classLevel, setClassLevel] = useState<ClassLevel>('Terminale C');
  const [stream, setStream] = useState<Stream>('C');
  const [selectedNotions, setSelectedNotions] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<'standard' | 'approfondi' | 'soutien'>('standard');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedEvaluation, setGeneratedEvaluation] = useState<Evaluation | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'generator' | 'history'>('generator');
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<Evaluation | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Selected student
  const activeStudent = students.find((s) => s.id === selectedStudentId);

  // Filter students if a teacher is selected
  const availableStudents =
    selectedTeacherId === 'all'
      ? students
      : students.filter((s) => s.teacherId === selectedTeacherId);

  // Get notions for the active student in the selected subject
  const studentNotions = notionStatuses.filter((n) => n.studentId === selectedStudentId);

  // When student changes, auto-adapt class, stream, subject
  const handleStudentChange = (id: string) => {
    setSelectedStudentId(id);
    const st = students.find((s) => s.id === id);
    if (st) {
      setClassLevel(st.classLevel);
      setStream(st.stream);
      if (st.subjects && st.subjects.length > 0) {
        setSelectedSubject(st.subjects[0] as SubjectName);
      }
      // Pre-select studied/assimilated notions
      const notions = notionStatuses
        .filter((n) => n.studentId === id)
        .map((n) => n.notion);
      setSelectedNotions(notions.slice(0, 2));
    }
  };

  const handleToggleNotion = (notion: string) => {
    if (selectedNotions.includes(notion)) {
      setSelectedNotions(selectedNotions.filter((n) => n !== notion));
    } else {
      setSelectedNotions([...selectedNotions, notion]);
    }
  };

  // Call server-side API proxy to Gemini
  const handleGenerate = async () => {
    if (selectedNotions.length === 0) {
      setApiError('Veuillez sélectionner au moins une notion à évaluer.');
      return;
    }

    setApiError(null);
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate-evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: activeStudent ? `${activeStudent.firstName} ${activeStudent.lastName}` : 'Élève',
          classLevel,
          stream,
          subject: selectedSubject,
          notionsToEvaluate: selectedNotions,
          difficulty,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Échec lors de la génération de l\'évaluation.');
      }

      const data = await response.json();

      const newEval: Evaluation = {
        id: `eval-${Date.now()}`,
        studentId: selectedStudentId,
        studentName: activeStudent ? `${activeStudent.firstName} ${activeStudent.lastName}` : 'Élève',
        teacherId: activeStudent?.teacherId || 't-1',
        classLevel,
        stream,
        subject: selectedSubject,
        notionsEvaluated: selectedNotions,
        title: data.title || `Évaluation Sommatrice : ${selectedSubject} (${classLevel})`,
        totalScore: 20,
        instructions: data.instructions || 'Durée conseillée : 1h30. Devoir noté sur 20 points.',
        exercises: data.exercises || [],
        createdAt: new Date().toISOString(),
      };

      setGeneratedEvaluation(newEval);
      setIsEditing(false);
    } catch (err: any) {
      console.error('AI Generation error:', err);
      setApiError(err.message || 'Une erreur est survenue lors de la communication avec le moteur IA.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Modify exercise before saving
  const handleExerciseChange = (index: number, field: keyof EvaluationExercise, value: any) => {
    if (!generatedEvaluation) return;
    const updated = [...generatedEvaluation.exercises];
    updated[index] = { ...updated[index], [field]: value };
    setGeneratedEvaluation({ ...generatedEvaluation, exercises: updated });
  };

  // Save to history
  const handleSaveToHistory = () => {
    if (!generatedEvaluation) return;
    onSaveEvaluation(generatedEvaluation);
    alert('Le devoir a été enregistré dans l\'historique des évaluations.');
  };

  // Copy full test to clipboard
  const handleCopyText = () => {
    if (!generatedEvaluation) return;
    let fullText = `${generatedEvaluation.title}\nTotal : ${generatedEvaluation.totalScore} points\n\nConsignes : ${generatedEvaluation.instructions}\n\n`;
    generatedEvaluation.exercises.forEach((ex, i) => {
      fullText += `--- ${ex.title} (${ex.points} points) ---\n${ex.statement}\n\nCORRIGÉ :\n${ex.solution}\n\n`;
    });
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Print view
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-white/10 text-indigo-200">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Générateur d'Évaluations IA (/20)
              </h1>
            </div>
            <p className="text-xs text-indigo-200 max-w-2xl">
              Module réservé à la Direction. Génération de devoirs sommatifs sur 20 points basés
              strictement sur les notions étudiées et assimilées, avec rendu typographique LaTeX des
              formules mathématiques et scientifiques.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('generator')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'generator'
                  ? 'bg-white text-indigo-900 shadow-xs'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Nouveau Devoir
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'history'
                  ? 'bg-white text-indigo-900 shadow-xs'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Historique ({savedEvaluations.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'generator' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Colonne gauche : Paramétrage du devoir */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                1. Sélection de l'Élève & Cadre
              </h2>

              {/* Filtre par enseignant */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Filtrer par Enseignant
                </label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                >
                  <option value="all">Tous les 11 enseignants</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.subject})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sélection élève */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Élève à évaluer *
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => handleStudentChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-900"
                >
                  {availableStudents.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.firstName} {st.lastName} — {st.classLevel}
                    </option>
                  ))}
                </select>
              </div>

              {/* Matière, Classe et Filière */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Matière *
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value as SubjectName)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Classe scolaire *
                  </label>
                  <select
                    value={classLevel}
                    onChange={(e) => {
                      const cl = e.target.value as ClassLevel;
                      setClassLevel(cl);
                      setStream(CLASS_TO_STREAM[cl] || 'Général');
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    {ALL_CLASSES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Série / Filière active :</span>
                  <span className="font-bold text-indigo-700 px-2.5 py-0.5 rounded-lg bg-white border border-indigo-200">
                    {stream}
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Exigence de l'Évaluation
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="standard">Standard (Type Examen)</option>
                    <option value="approfondi">Approfondi (Excellence/Prépa)</option>
                    <option value="soutien">Soutien / Consolidation</option>
                  </select>
                </div>
              </div>

              {/* 2. Enseignements & Cours vus par l'élève (Saisis par l'enseignant) */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    2. Enseignements & Cours vus par l'élève
                  </h3>
                  <span className="text-[11px] font-mono font-bold text-indigo-700">
                    {selectedNotions.length} sélectionnée(s)
                  </span>
                </div>

                <p className="text-[11px] text-slate-500">
                  Voici tous les cours et notions insérés par l'enseignant après chaque séance avec cet élève. Cliquez sur les notions sur lesquelles vous souhaitez le faire composer :
                </p>

                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                  {sessions.filter((s) => s.studentId === selectedStudentId).length === 0 ? (
                    <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-400 text-xs">
                      Aucune séance enregistrée par l'enseignant pour cet élève. L'enseignant doit d'abord insérer le compte rendu de son cours.
                    </div>
                  ) : (
                    sessions
                      .filter((s) => s.studentId === selectedStudentId)
                      .map((sess) => {
                        const isChecked = selectedNotions.includes(sess.notion);
                        return (
                          <div
                            key={sess.id}
                            onClick={() => handleToggleNotion(sess.notion)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                              isChecked
                                ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-semibold'
                                : 'bg-slate-50/70 border-slate-200/80 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="rounded text-indigo-600 focus:ring-0"
                              />
                              <div>
                                <span className="font-bold text-slate-900">{sess.notion}</span>
                                <span className="text-[10px] text-slate-500 block mt-0.5">
                                  Chapitre : {sess.chapter} • <span className="font-mono text-slate-400">{sess.date}</span>
                                  {sess.contentWorked && ` • ${sess.contentWorked}`}
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-indigo-100 text-indigo-800">
                              Cours dispensé
                            </span>
                          </div>
                        );
                      })
                  )}
                </div>

                {/* Ajout manuel d'une notion si besoin */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const custom = prompt('Nom de la notion à évaluer :');
                      if (custom && custom.trim()) {
                        setSelectedNotions([...selectedNotions, custom.trim()]);
                      }
                    }}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> + Ajouter une notion complémentaire
                  </button>
                </div>
              </div>

              {apiError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{apiError}</span>
                </div>
              )}

              {/* Bouton de génération Gemini */}
              <div className="pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating || selectedNotions.length === 0}
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 text-white shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {isGenerating
                      ? 'Génération du devoir par Gemini en cours...'
                      : 'Générer le Devoir Personnalisé (/20)'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Colonne droite : Aperçu du devoir généré, rendu LaTeX et édition */}
          <div className="lg:col-span-7 space-y-4">
            {generatedEvaluation ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
                {/* Actions sur le devoir */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Devoir Sommatif / 20 points
                    </span>
                    <h2 className="text-base font-black text-slate-900 mt-1">
                      {generatedEvaluation.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        isEditing
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>{isEditing ? 'Aperçu LaTeX' : 'Modifier le devoir'}</span>
                    </button>

                    <button
                      onClick={handleCopyText}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors"
                      title="Copier l'énoncé et le corrigé"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copié !' : 'Copier'}</span>
                    </button>

                    <button
                      onClick={handlePrint}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors"
                      title="Imprimer le devoir"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Imprimer</span>
                    </button>

                    <button
                      onClick={handleSaveToHistory}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Enregistrer</span>
                    </button>
                  </div>
                </div>

                {/* Métadonnées du devoir */}
                <div className="bg-slate-50 p-3.5 rounded-xl text-xs text-slate-600 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span>
                      Élève : <strong>{generatedEvaluation.studentName}</strong> •{' '}
                      {generatedEvaluation.classLevel} ({generatedEvaluation.stream})
                    </span>
                    <span className="font-mono font-bold text-indigo-700">
                      Total barème : {generatedEvaluation.totalScore} / 20
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 italic">
                    Instructions : {generatedEvaluation.instructions}
                  </p>
                </div>

                {/* Liste des exercices du devoir */}
                <div className="space-y-6">
                  {generatedEvaluation.exercises.map((ex, idx) => (
                    <div
                      key={ex.id || idx}
                      className="p-5 rounded-2xl border border-slate-200/90 bg-white space-y-4 shadow-2xs"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        {isEditing ? (
                          <input
                            type="text"
                            value={ex.title}
                            onChange={(e) => handleExerciseChange(idx, 'title', e.target.value)}
                            className="text-xs font-bold text-slate-900 border-b border-slate-300 pb-0.5 w-2/3"
                          />
                        ) : (
                          <h3 className="text-xs font-bold text-slate-900">{ex.title}</h3>
                        )}

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-500">Barème :</span>
                          {isEditing ? (
                            <input
                              type="number"
                              min="1"
                              max="20"
                              value={ex.points}
                              onChange={(e) =>
                                handleExerciseChange(idx, 'points', Number(e.target.value))
                              }
                              className="w-14 px-2 py-0.5 text-xs font-mono font-bold border border-slate-200 rounded"
                            />
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 font-mono font-bold text-xs">
                              {ex.points} pts
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Énoncé avec KaTeX */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Énoncé de l'exercice :
                        </span>
                        {isEditing ? (
                          <textarea
                            rows={4}
                            value={ex.statement}
                            onChange={(e) =>
                              handleExerciseChange(idx, 'statement', e.target.value)
                            }
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-mono"
                          />
                        ) : (
                          <div className="text-xs text-slate-800 bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                            <LatexRenderer content={ex.statement} />
                          </div>
                        )}
                      </div>

                      {/* Corrigé détaillé et barème */}
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                          Corrigé & Barème détaillé :
                        </span>
                        {isEditing ? (
                          <textarea
                            rows={4}
                            value={ex.solution}
                            onChange={(e) =>
                              handleExerciseChange(idx, 'solution', e.target.value)
                            }
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-mono"
                          />
                        ) : (
                          <div className="text-xs text-emerald-950 bg-emerald-50/40 p-4 rounded-xl border border-emerald-100/80">
                            <LatexRenderer content={ex.solution} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Aucun devoir généré pour l'instant</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Sélectionnez un élève et ses notions à gauche, puis cliquez sur{' '}
                    <strong>« Générer le Devoir Personnalisé (/20) »</strong>.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ONGLET HISTORIQUE DES ÉVALUATIONS */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Historique des Devoirs et Évaluations ({savedEvaluations.length})
            </h2>
            {savedEvaluations.length > 0 && onClearEvaluations && (
              <button
                onClick={onClearEvaluations}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1.5"
                title="Vider tout l'historique des exercices IA"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Vider l'historique</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedEvaluations.length === 0 ? (
              <div className="col-span-full bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400">
                <History className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">Aucune évaluation archivée.</p>
              </div>
            ) : (
              savedEvaluations.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-xs transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{ev.title}</h3>
                      <p className="text-xs text-slate-500">
                        Élève : <strong>{ev.studentName}</strong> • {ev.classLevel} ({ev.stream})
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-50 text-indigo-700">
                      / 20 pts
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                    <strong>Notions évaluées :</strong> {ev.notionsEvaluated.join(', ')}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">{ev.createdAt.split('T')[0]}</span>
                    <div className="flex items-center gap-3">
                      {onDeleteEvaluation && (
                        <button
                          onClick={() => onDeleteEvaluation(ev.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Supprimer cette évaluation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setGeneratedEvaluation(ev);
                          setActiveTab('generator');
                        }}
                        className="font-semibold text-indigo-600 hover:text-indigo-800 text-xs"
                      >
                        Consulter le devoir
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
