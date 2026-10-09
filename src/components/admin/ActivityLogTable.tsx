import React, { useState } from 'react';
import { Session, Student, User } from '../../types';
import { Activity, Search, Calendar, UserCheck, BookOpen, Filter, ArrowUpDown, Trash2 } from 'lucide-react';

interface ActivityLogTableProps {
  sessions: Session[];
  students: Student[];
  teachers: User[];
  admins: User[];
}

export const ActivityLogTable: React.FC<ActivityLogTableProps> = ({
  sessions,
  students,
  teachers,
  admins,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'sessions' | 'students' | 'teachers'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [clearedIds, setClearedIds] = useState<string[]>([]);

  // Build unified activities array from sessions, students, teachers
  const activities = [
    ...sessions.map((s) => ({
      id: `session-${s.id}`,
      type: 'session' as const,
      title: `Séance pédagogique (${s.subject})`,
      description: `Élève: ${s.studentName} | Score: ${s.rating.calculatedScore}/20 | ${s.appreciation || ''}`,
      date: s.date || new Date().toISOString(),
      author: s.teacherName || 'Enseignant',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    })),
    ...students.map((st) => ({
      id: `student-${st.id}`,
      type: 'student' as const,
      title: `Élève enregistré : ${st.name}`,
      description: `Classe: ${st.classLevel} (${st.stream}) | Téléphone: ${st.phone || 'N/A'}`,
      date: st.createdAt || new Date().toISOString(),
      author: teachers.find((t) => t.id === st.teacherId)?.name || 'Direction / Enseignant',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    })),
    ...teachers.map((t) => ({
      id: `teacher-${t.id}`,
      type: 'teacher' as const,
      title: `Enseignant Actif : ${t.name}`,
      description: `Matières: ${t.subject} | Email: ${t.email}`,
      date: new Date().toISOString(),
      author: 'Direction',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleClearLog = () => {
    if (window.confirm("Êtes-vous sûr de vouloir vider le journal des activités ?")) {
      setClearedIds(activities.map((a) => a.id));
    }
  };

  const filteredActivities = activities.filter((act) => {
    if (clearedIds.includes(act.id)) return false;
    const matchesType = filterType === 'all' || act.type === filterType;
    const matchesSearch =
      act.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.author.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            <span>Journal & Tableau de Toutes les Activités</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Suivi centralisé en temps réel de toutes les actions, séances, élèves et comptes de l'établissement.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher une activité..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-60"
            />
          </div>
          {activities.length > 0 && (
            <button
              type="button"
              onClick={handleClearLog}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> Vider le journal
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setFilterType('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            filterType === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Toutes ({activities.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterType('sessions')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            filterType === 'sessions'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Séances ({activities.filter((a) => a.type === 'session').length})
        </button>
        <button
          type="button"
          onClick={() => setFilterType('students')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            filterType === 'students'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Élèves ({activities.filter((a) => a.type === 'student').length})
        </button>
        <button
          type="button"
          onClick={() => setFilterType('teachers')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            filterType === 'teachers'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Enseignants ({activities.filter((a) => a.type === 'teacher').length})
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Événement & Titre</th>
                <th className="py-3 px-4">Description / Détails</th>
                <th className="py-3 px-4">Auteur / Responsable</th>
                <th className="py-3 px-4">Date / Heure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Aucune activité enregistrée ne correspond à vos critères.
                  </td>
                </tr>
              ) : (
                filteredActivities.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-50/65 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase border ${act.badgeColor}`}
                      >
                        {act.type === 'session' && 'Séance'}
                        {act.type === 'student' && 'Élève'}
                        {act.type === 'teacher' && 'Enseignant'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{act.title}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{act.description}</td>
                    <td className="py-3 px-4 font-medium text-slate-700">{act.author}</td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                      {new Date(act.date).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
