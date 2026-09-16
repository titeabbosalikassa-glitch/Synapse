import React, { useState, useEffect } from 'react';
import { Objective, Student, ObjectiveStatus } from '../../types';
import { X, TrendingUp } from 'lucide-react';

interface ObjectiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (objData: Partial<Objective>) => void;
  students: Student[];
  teacherId: string;
  defaultStudentId?: string;
  editingObjective?: Objective | null;
}

export const ObjectiveModal: React.FC<ObjectiveModalProps> = ({
  isOpen,
  onClose,
  onSave,
  students,
  teacherId,
  defaultStudentId,
  editingObjective,
}) => {
  const [studentId, setStudentId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [status, setStatus] = useState<ObjectiveStatus>('in_progress');
  const [progressPercent, setProgressPercent] = useState(50);

  useEffect(() => {
    if (editingObjective) {
      setStudentId(editingObjective.studentId);
      setTitle(editingObjective.title);
      setDescription(editingObjective.description);
      setTargetDate(editingObjective.targetDate);
      setStatus(editingObjective.status);
      setProgressPercent(editingObjective.progressPercent);
    } else {
      setStudentId(defaultStudentId || (students[0]?.id || ''));
      setTitle('');
      setDescription('');
      const inOneMonth = new Date();
      inOneMonth.setMonth(inOneMonth.getMonth() + 1);
      setTargetDate(inOneMonth.toISOString().split('T')[0]);
      setStatus('in_progress');
      setProgressPercent(25);
    }
  }, [editingObjective, isOpen, defaultStudentId, students]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !title.trim()) return;

    onSave({
      studentId,
      teacherId,
      title: title.trim(),
      description: description.trim(),
      targetDate,
      status,
      progressPercent,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">
              {editingObjective ? "Modifier l'objectif" : "Définir un nouvel objectif"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
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
              Intitulé de l'objectif *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Maîtriser le calcul de limites et asymptotes"
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description / Critères de validation
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Détail des exigences méthodologiques..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date cible
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Statut
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ObjectiveStatus)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
                <option value="in_progress">En cours</option>
                <option value="completed">Atteint / Validé</option>
                <option value="not_started">Non démarré</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700">Progression :</span>
              <span className="font-mono font-bold text-indigo-700">{progressPercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={progressPercent}
              onChange={(e) => {
                const val = Number(e.target.value);
                setProgressPercent(val);
                if (val === 100) setStatus('completed');
              }}
              className="w-full accent-indigo-600 cursor-pointer"
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
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
