import React, { useState } from 'react';
import { ResourceDocument, Student } from '../../types';
import { ALL_CLASSES, SUBJECTS } from '../../data/mockData';
import {
  FileText,
  UploadCloud,
  Search,
  Download,
  Trash2,
  Filter,
  Eye,
} from 'lucide-react';

interface ResourceListProps {
  resources: ResourceDocument[];
  students: Student[];
  onOpenUploadPdf: () => void;
  isAdmin?: boolean;
}

export const ResourceList: React.FC<ResourceListProps> = ({
  resources,
  students,
  onOpenUploadPdf,
  isAdmin = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');

  const filteredResources = resources.filter((res) => {
    const matchesSearch =
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.chapter.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject = selectedSubjectId === 'all' || res.subjectId === selectedSubjectId;
    const matchesClass = selectedClass === 'all' || res.classLevel === selectedClass;

    return matchesSearch && matchesSubject && matchesClass;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
                <FileText className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Ressources Pédagogiques & Fichiers PDF
              </h1>
            </div>
            <p className="text-xs text-slate-500">
              Espace documentaire : téléversement de cours, synthèses et fiches d'exercices.
            </p>
          </div>

          <button
            onClick={onOpenUploadPdf}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors self-start sm:self-center cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Téléverser un PDF</span>
          </button>
        </div>

        {/* Filtres */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-100">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une fiche, un chapitre..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
            >
              <option value="all">Toutes les matières</option>
              {SUBJECTS.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
            >
              <option value="all">Toutes les classes</option>
              {ALL_CLASSES.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grille des ressources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 space-y-2 shadow-2xs">
            <FileText className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs font-semibold text-slate-600">Aucune ressource disponible</p>
            <p className="text-[11px] text-slate-400">
              Téléversez un document PDF pour débuter la bibliothèque de cours.
            </p>
          </div>
        ) : (
          filteredResources.map((res) => {
            const student = students.find((s) => s.id === res.studentId);
            const subject = SUBJECTS.find((s) => s.id === res.subjectId)?.name || 'Sciences';

            return (
              <div
                key={res.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0 ring-1 ring-rose-200/60">
                        PDF
                      </div>
                      <div>
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-slate-100 text-slate-700">
                          {subject}
                        </span>
                        <h3 className="text-xs font-bold text-slate-900 line-clamp-1 mt-1">
                          {res.title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 space-y-1">
                    <p>
                      <strong>Chapitre :</strong> {res.chapter}
                    </p>
                    <p>
                      <strong>Niveau :</strong> {res.classLevel} ({res.stream})
                    </p>
                    {student && (
                      <p className="text-indigo-600 font-medium">
                        Assigné à : {student.firstName} {student.lastName}
                      </p>
                    )}
                    {res.description && (
                      <p className="text-slate-600 italic line-clamp-2 pt-1">
                        « {res.description} »
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">
                    {(res.fileSize / 1024).toFixed(0)} Ko • {res.uploadedAt.split('T')[0]}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={res.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Consulter</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
