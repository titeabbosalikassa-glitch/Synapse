import React, { useState, useEffect } from 'react';
import { Session, Student, SessionRating } from '../../types';
import { SUBJECTS, REFERENCE_CURRICULUM } from '../../data/mockData';
import { X, Calendar, Award, CheckCircle } from 'lucide-react';

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sessionData: Partial<Session>, notionStatusUpdate?: 'studied' | 'assimilated' | 'to_reinforce') => void;
  students: Student[];
  teacherId: string;
  defaultStudentId?: string;
  editingSession?: Session | null;
}

export const SessionModal: React.FC<SessionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  students,
  teacherId,
  defaultStudentId,
  editingSession,
}) => {
  const [studentId, setStudentId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [subjectId, setSubjectId] = useState('maths');
  const [chapter, setChapter] = useState('');
  const [notion, setNotion] = useState('');
  const [objective, setObjective] = useState('');
  const [contentWorked, setContentWorked] = useState('');
  const [appreciation, setAppreciation] = useState('');
  const [notionStatusUpdate, setNotionStatusUpdate] = useState<'studied' | 'assimilated' | 'to_reinforce'>('assimilated');

  // 5 criteria of HPG continuous rating
  const [understanding, setUnderstanding] = useState(16);
  const [autonomy, setAutonomy] = useState(15);
  const [methodology, setMethodology] = useState(16);
  const [engagement, setEngagement] = useState(17);
  const [progression, setProgression] = useState(16);

  const calculatedTotal = understanding + autonomy + methodology + engagement + progression;

  useEffect(() => {
    if (editingSession) {
      setStudentId(editingSession.studentId);
      setDate(editingSession.date);
      setDurationMinutes(editingSession.durationMinutes);
      setSubjectId(editingSession.subjectId);
      setChapter(editingSession.chapter);
      setNotion(editingSession.notion);
      setObjective(editingSession.objective);
      setContentWorked(editingSession.contentWorked || '');
      setAppreciation(editingSession.appreciation);
      setUnderstanding(editingSession.rating.understanding);
      setAutonomy(editingSession.rating.autonomy);
      setMethodology(editingSession.rating.methodology);
      setEngagement(editingSession.rating.engagement);
      setProgression(editingSession.rating.progression);
    } else {
      setStudentId(defaultStudentId || (students[0]?.id || ''));
      setDate(new Date().toISOString().split('T')[0]);
      setDurationMinutes(90);
      setSubjectId('maths');
      setChapter('');
      setNotion('');
      setObjective('');
      setContentWorked('');
      setAppreciation('');
      setUnderstanding(16);
      setAutonomy(15);
      setMethodology(16);
      setEngagement(17);
      setProgression(16);
      setNotionStatusUpdate('assimilated');
    }
  }, [editingSession, isOpen, defaultStudentId, students]);

  if (!isOpen) return null;

  // Pre-load reference chapters if matching
  const activeSubjectName = SUBJECTS.find((s) => s.id === subjectId)?.name || 'Mathématiques';
  const referenceCurriculum = REFERENCE_CURRICULUM[activeSubjectName] || [];

  const handleSelectReferenceNotion = (chap: string, not: string) => {
    setChapter(chap);
    setNotion(not);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !chapter.trim() || !notion.trim() || !objective.trim()) {
      return;
    }

    const rating: SessionRating = {
      understanding,
      autonomy,
      methodology,
      engagement,
      progression,
      calculatedScore: calculatedTotal,
    };

    onSave(
      {
        studentId,
        teacherId,
        date,
        durationMinutes,
        subjectId,
        chapter: chapter.trim(),
        notion: notion.trim(),
        objective: objective.trim(),
        contentWorked: contentWorked.trim(),
        appreciation: appreciation.trim(),
        rating,
      },
      notionStatusUpdate
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {editingSession ? 'Modifier la séance' : 'Enregistrer une nouvelle séance HPG'}
              </h2>
              <p className="text-[11px] text-slate-500">
                Cotation continue sur 5 critères (score /100) et suivi des notions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Élève concerné *
              </label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.firstName} {st.lastName} ({st.classLevel})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date de la séance *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
              </input>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Durée (minutes) *
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
                <option value={45}>45 min</option>
                <option value={60}>1h (60 min)</option>
                <option value={90}>1h30 (90 min)</option>
                <option value={120}>2h (120 min)</option>
                <option value={180}>3h (180 min)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Matière *
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
                {SUBJECTS.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chapitre du cours *
              </label>
              <input
                type="text"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                placeholder="Ex: Suites numériques"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Notion étudiée *
              </label>
              <input
                type="text"
                value={notion}
                onChange={(e) => setNotion(e.target.value)}
                placeholder="Ex: Raisonnement par récurrence"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              />
            </div>
          </div>

          {/* Suggestions du programme officiel */}
          {referenceCurriculum.length > 0 && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-[11px] font-semibold text-slate-600 block mb-1.5">
                Suggestions du programme officiel ({activeSubjectName}) :
              </span>
              <div className="flex flex-wrap gap-1.5">
                {referenceCurriculum.flatMap((c) =>
                  c.notions.map((n) => (
                    <button
                      type="button"
                      key={n}
                      onClick={() => handleSelectReferenceNotion(c.chapter, n)}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-800 transition-colors"
                    >
                      {n}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Objectif pédagogique fixé *
            </label>
            <input
              type="text"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Ex: Démontrer des inégalités en 3 étapes sans hésiter"
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Travail réalisé durant la séance
            </label>
            <textarea
              rows={2}
              value={contentWorked}
              onChange={(e) => setContentWorked(e.target.value)}
              placeholder="Exercices traités, théorèmes démontrés, difficultés rencontrées..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white resize-none"
            />
          </div>

          {/* COTATION PÉDAGOGIQUE HPG (5 Critères /20) */}
          <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-700" />
                <h3 className="text-xs font-bold text-indigo-950">
                  Grille de Cotation Continue HPG (Total /100)
                </h3>
              </div>
              <div className="px-3 py-1 bg-indigo-600 text-white font-mono font-bold text-xs rounded-lg shadow-2xs">
                Score : {calculatedTotal} / 100
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Compréhension : <strong className="text-indigo-700">{understanding}</strong>/20
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={understanding}
                  onChange={(e) => setUnderstanding(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Autonomie : <strong className="text-indigo-700">{autonomy}</strong>/20
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={autonomy}
                  onChange={(e) => setAutonomy(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Méthodologie : <strong className="text-indigo-700">{methodology}</strong>/20
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={methodology}
                  onChange={(e) => setMethodology(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Implication : <strong className="text-indigo-700">{engagement}</strong>/20
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={engagement}
                  onChange={(e) => setEngagement(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Progression : <strong className="text-indigo-700">{progression}</strong>/20
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={progression}
                  onChange={(e) => setProgression(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Mise à jour immédiate du statut de la notion */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Statut de la notion à l'issue de cette séance :
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setNotionStatusUpdate('studied')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  notionStatusUpdate === 'studied'
                    ? 'bg-blue-50 border-blue-400 text-blue-800'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                🔵 Étudiée (en cours)
              </button>
              <button
                type="button"
                onClick={() => setNotionStatusUpdate('assimilated')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  notionStatusUpdate === 'assimilated'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                🟢 Assimilée (maîtrisée)
              </button>
              <button
                type="button"
                onClick={() => setNotionStatusUpdate('to_reinforce')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  notionStatusUpdate === 'to_reinforce'
                    ? 'bg-amber-50 border-amber-400 text-amber-800'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                🟠 À consolider
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Appréciation de l'enseignant *
            </label>
            <textarea
              rows={2}
              value={appreciation}
              onChange={(e) => setAppreciation(e.target.value)}
              placeholder="Commentaire qualitatif sur le travail fourni et les progrès constatés..."
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white resize-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
            >
              {editingSession ? 'Enregistrer les modifications' : 'Enregistrer la séance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
