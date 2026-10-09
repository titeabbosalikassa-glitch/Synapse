import React, { useState, useRef } from 'react';
import { ResourceDocument, Student, ClassLevel, Stream } from '../../types';
import { ALL_CLASSES, SUBJECTS, CLASS_TO_STREAM } from '../../data/mockData';
import { X, UploadCloud, FileText, Check, AlertCircle } from 'lucide-react';

interface UploadPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (docData: Partial<ResourceDocument>) => void;
  teacherId: string;
  students: Student[];
}

export const UploadPdfModal: React.FC<UploadPdfModalProps> = ({
  isOpen,
  onClose,
  onSave,
  teacherId,
  students,
}) => {
  const [title, setTitle] = useState('');
  const [chapter, setChapter] = useState('');
  const [subjectId, setSubjectId] = useState('maths');
  const [classLevel, setClassLevel] = useState<ClassLevel>('Terminale C');
  const [studentId, setStudentId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: number;
    url: string;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    // Generate an object URL or local blob URL for viewing
    const blobUrl = URL.createObjectURL(file);
    setSelectedFile({
      name: file.name,
      size: file.size,
      url: blobUrl,
    });
    if (!title) {
      // Auto-populate title without extension
      setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !chapter.trim()) return;

    onSave({
      teacherId,
      studentId: studentId || undefined,
      title: title.trim(),
      chapter: chapter.trim(),
      subjectId,
      classLevel,
      stream: CLASS_TO_STREAM[classLevel] || 'Général',
      fileName: selectedFile?.name || `${title.replace(/\s+/g, '_')}.pdf`,
      fileSize: selectedFile?.size || 350000,
      fileUrl: selectedFile?.url || 'https://example.com/document.pdf',
      description: description.trim(),
      uploadedAt: new Date().toISOString(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Téléverser une ressource PDF
              </h2>
              <p className="text-[11px] text-slate-500">
                Fiches d'exercices, cours et devoirs
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
          {/* Zone de glisser-déposer / sélection tactile mobile */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-emerald-500 bg-emerald-50/50'
                : selectedFile
                ? 'border-emerald-300 bg-emerald-50/20'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,application/pdf"
              className="hidden"
            />

            {selectedFile ? (
              <div className="flex items-center justify-center gap-3 text-emerald-800">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-emerald-700" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold truncate max-w-xs">{selectedFile.name}</p>
                  <p className="text-[11px] text-emerald-600">
                    {(selectedFile.size / 1024).toFixed(0)} Ko • Fichier prêt
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800">
                    Cliquez pour choisir un PDF
                  </span>
                  <span className="text-xs text-slate-500 block">
                    ou glissez-déposez le fichier ici (mobile et ordinateur)
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Format PDF accepté</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Titre du document *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Fiche méthode — Dérivation et extremums"
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Matière *
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
                {SUBJECTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Classe ciblée *
              </label>
              <select
                value={classLevel}
                onChange={(e) => setClassLevel(e.target.value as ClassLevel)}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chapitre *
              </label>
              <input
                type="text"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                placeholder="Ex: Électromagnétisme"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Associer à un élève (Optionnel)
              </label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
                <option value="">Ressource générale (Tous les élèves)</option>
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.firstName} {st.lastName} ({st.classLevel})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description ou consignes d'utilisation
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Indications pédagogiques pour l'élève..."
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
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
            >
              Enregistrer le document
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
