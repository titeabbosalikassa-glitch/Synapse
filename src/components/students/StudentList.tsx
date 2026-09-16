import React, { useState } from 'react';
import { Student, User } from '../../types';
import { ALL_CLASSES } from '../../data/mockData';
import { Search, Plus, Filter, Users, ArrowRight, Edit, Trash2, BookOpen } from 'lucide-react';

interface StudentListProps {
  students: Student[];
  teachers: User[];
  onSelectStudent: (student: Student) => void;
  onOpenNewStudent: () => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (student: Student) => void;
  isAdmin?: boolean;
}

export const StudentList: React.FC<StudentListProps> = ({
  students,
  teachers,
  onSelectStudent,
  onOpenNewStudent,
  onEditStudent,
  onDeleteStudent,
  isAdmin = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [filterTeacher, setFilterTeacher] = useState('all');

  const filteredStudents = students.filter((st) => {
    const fullName = `${st.firstName} ${st.lastName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      (st.notes && st.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesClass = filterClass === 'all' || st.classLevel === filterClass;
    const matchesTeacher = filterTeacher === 'all' || st.teacherId === filterTeacher;

    return matchesSearch && matchesClass && matchesTeacher;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {isAdmin ? 'Tous les Élèves HPG' : 'Mes Élèves'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {filteredStudents.length} élève(s) répertorié(s)
          </p>
        </div>

        {!isAdmin && (
          <button
            onClick={onOpenNewStudent}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" /> + Ajouter un élève
          </button>
        )}
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom, prénom ou note..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <select
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700"
        >
          <option value="all">Toutes les classes</option>
          {ALL_CLASSES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {isAdmin && (
          <select
            value={filterTeacher}
            onChange={(e) => setFilterTeacher(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700"
          >
            <option value="all">Tous les 11 enseignants</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.subject})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Grille des élèves */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400">
            <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">Aucun élève trouvé.</p>
          </div>
        ) : (
          filteredStudents.map((st) => {
            const teacher = teachers.find((t) => t.id === st.teacherId);

            return (
              <div
                key={st.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {st.firstName} {st.lastName}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
                          {st.classLevel}
                        </span>
                        {st.stream !== 'Général' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-bold">
                            Filière {st.stream}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditStudent(st);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                        title="Modifier l'élève"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteStudent(st);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Supprimer l'élève"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {st.subjects && st.subjects.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {st.subjects.map((sub, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  )}

                  {st.notes && (
                    <p className="mt-2 text-xs text-slate-500 line-clamp-2 italic">
                      « {st.notes} »
                    </p>
                  )}

                  {isAdmin && teacher && (
                    <div className="mt-3 text-[11px] text-slate-500 font-medium">
                      Enseignant assigné : <strong className="text-slate-800">{teacher.name}</strong>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {st.parentPhone || 'Tél non renseigné'}
                  </span>
                  <button
                    onClick={() => onSelectStudent(st)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"
                  >
                    <span>Fiche & Notions</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
