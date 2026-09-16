import React, { useState, useEffect } from 'react';
import { Student, ClassLevel, Stream, User } from '../../types';
import { ALL_CLASSES, CLASS_TO_STREAM, SUBJECTS } from '../../data/mockData';
import { X, UserPlus, Check } from 'lucide-react';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (studentData: Partial<Student>) => void;
  editingStudent?: Student | null;
  teacherId: string;
  teachers?: User[];
  isAdmin?: boolean;
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingStudent,
  teacherId,
  teachers = [],
  isAdmin = false,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [classLevel, setClassLevel] = useState<ClassLevel>('Terminale C');
  const [stream, setStream] = useState<Stream>('C');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['Mathématiques']);
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [assignedTeacherId, setAssignedTeacherId] = useState(teacherId);

  useEffect(() => {
    if (editingStudent) {
      setFirstName(editingStudent.firstName);
      setLastName(editingStudent.lastName);
      setClassLevel(editingStudent.classLevel);
      setStream(editingStudent.stream);
      setSelectedSubjects(editingStudent.subjects || ['Mathématiques']);
      setParentPhone(editingStudent.parentPhone || '');
      setParentEmail(editingStudent.parentEmail || '');
      setNotes(editingStudent.notes || '');
      setAssignedTeacherId(editingStudent.teacherId);
    } else {
      setFirstName('');
      setLastName('');
      setClassLevel('Terminale C');
      setStream('C');
      setSelectedSubjects(['Mathématiques']);
      setParentPhone('');
      setParentEmail('');
      setNotes('');
      setAssignedTeacherId(teacherId);
    }
  }, [editingStudent, isOpen, teacherId]);

  if (!isOpen) return null;

  const handleClassChange = (selectedClass: ClassLevel) => {
    setClassLevel(selectedClass);
    const autoStream = CLASS_TO_STREAM[selectedClass] || 'Général';
    setStream(autoStream);
  };

  const handleToggleSubject = (subjName: string) => {
    if (selectedSubjects.includes(subjName)) {
      if (selectedSubjects.length > 1) {
        setSelectedSubjects(selectedSubjects.filter((s) => s !== subjName));
      }
    } else {
      setSelectedSubjects([...selectedSubjects, subjName]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;

    onSave({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      classLevel,
      stream,
      subjects: selectedSubjects,
      parentPhone: parentPhone.trim(),
      parentEmail: parentEmail.trim(),
      notes: notes.trim(),
      teacherId: assignedTeacherId || teacherId,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
              <UserPlus className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">
              {editingStudent ? "Modifier la fiche de l'élève" : "Ajouter un nouvel élève"}
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Prénom *
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                placeholder="Ex: Kenza"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nom *
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                placeholder="Ex: Mansouri"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Classe scolaire *
              </label>
              <select
                value={classLevel}
                onChange={(e) => handleClassChange(e.target.value as ClassLevel)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
                {ALL_CLASSES.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Filière
              </label>
              <input
                type="text"
                value={stream}
                onChange={(e) => setStream(e.target.value as Stream)}
                placeholder="Ex: C, D, S, LE..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
              />
            </div>
          </div>

          {isAdmin && teachers.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Enseignant assigné
              </label>
              <select
                value={assignedTeacherId}
                onChange={(e) => setAssignedTeacherId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.subject})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Matières suivies *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {SUBJECTS.map((sub) => {
                const isSelected = selectedSubjects.includes(sub.name);
                return (
                  <button
                    type="button"
                    key={sub.id}
                    onClick={() => handleToggleSubject(sub.name)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold text-left flex items-center justify-between border transition-all ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-900'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{sub.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Téléphone Parents
              </label>
              <input
                type="tel"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                placeholder="+33 6 00 00 00 00"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Parents
              </label>
              <input
                type="email"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                placeholder="parent@email.com"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notes pédagogiques / Profil
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Objectifs d'orientation, points d'attention..."
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
              {editingStudent ? 'Enregistrer les modifications' : 'Créer la fiche élève'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
