import React, { useState } from 'react';
import {
  Session,
  User,
  Student,
} from '../../types';
import {
  BarChart3,
  Calendar,
  Users,
  BookOpen,
  Clock,
  TrendingUp,
  Award,
  Filter,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

interface AnalyticsViewProps {
  sessions: Session[];
  teachers: User[];
  students: Student[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  sessions,
  teachers,
  students,
}) => {
  const [timeRange, setTimeRange] = useState<'30days' | '90days' | 'all'>('30days');

  // Filtrer les séances selon la période (dernier mois = 30 jours, 90 jours, ou tout)
  const now = new Date();
  const cutoffDate = new Date();
  if (timeRange === '30days') {
    cutoffDate.setDate(now.getDate() - 30);
  } else if (timeRange === '90days') {
    cutoffDate.setDate(now.getDate() - 90);
  } else {
    cutoffDate.setFullYear(2000); // tout
  }

  const filteredSessions = sessions.filter((s) => new Date(s.date) >= cutoffDate);

  // 1. Volume par matière
  const subjectCounts: { [subject: string]: number } = {};
  filteredSessions.forEach((s) => {
    const subj = s.subjectId || 'Mathématiques';
    subjectCounts[subj] = (subjectCounts[subj] || 0) + 1;
  });

  const subjectChartData = Object.keys(subjectCounts).map((subj) => ({
    name: subj,
    count: subjectCounts[subj],
  })).sort((a, b) => b.count - a.count);

  // 2. Volume par enseignant
  const teacherCounts: { [teacherId: string]: { name: string; count: number; subject: string; hours: number } } = {};
  teachers.forEach((t) => {
    teacherCounts[t.id] = {
      name: t.name,
      count: 0,
      subject: t.subject || 'Général',
      hours: 0,
    };
  });

  filteredSessions.forEach((s) => {
    if (teacherCounts[s.teacherId]) {
      teacherCounts[s.teacherId].count += 1;
      teacherCounts[s.teacherId].hours += (s.durationMinutes || 60) / 60;
    } else {
      // Si l'enseignant n'est pas dans la liste des profs officiels
      teacherCounts[s.teacherId] = {
        name: `Enseignant (${s.teacherId})`,
        count: 1,
        subject: 'Divers',
        hours: (s.durationMinutes || 60) / 60,
      };
    }
  });

  const teacherChartData = Object.values(teacherCounts).sort((a, b) => b.count - a.count);

  // Métriques globales
  const totalSessionsCount = filteredSessions.length;
  const totalHours = Math.round(filteredSessions.reduce((acc, s) => acc + (s.durationMinutes || 60), 0) / 60);
  const activeTeachersCount = Object.values(teacherCounts).filter((t) => t.count > 0).length;
  const topSubject = subjectChartData.length > 0 ? subjectChartData[0].name : 'N/A';

  const COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#f43f5e'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* En-tête */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">Analyses et Volume d'Activité</h1>
              <p className="text-xs text-slate-500">
                Suivi quantitatif des séances pédagogiques par matière et par enseignant.
              </p>
            </div>
          </div>
        </div>

        {/* Sélecteur de période */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl self-stretch sm:self-auto justify-center">
          <button
            type="button"
            onClick={() => setTimeRange('30days')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              timeRange === '30days'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dernier mois (30j)
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('90days')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              timeRange === '90days'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3 Mois
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              timeRange === 'all'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tout l'historique
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Séances (Période)</p>
            <p className="text-2xl font-extrabold text-slate-900">{totalSessionsCount}</p>
            <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Enregistrées et validées
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Volume Horaire</p>
            <p className="text-2xl font-extrabold text-slate-900">{totalHours}h</p>
            <div className="text-[11px] text-slate-500">
              Enseignement dispensé
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Professeurs Actifs</p>
            <p className="text-2xl font-extrabold text-slate-900">{activeTeachersCount} / {teachers.length}</p>
            <div className="text-[11px] text-slate-500">
              Ayant dispensé des cours
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Matière Phare</p>
            <p className="text-lg font-extrabold text-slate-900 truncate max-w-[140px]">{topSubject}</p>
            <div className="text-[11px] text-indigo-600 font-semibold">
              Forte demande pédagogique
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grille des graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique 1: Volume par Matière */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <span>Volume de Séances par Matière</span>
              </h2>
              <p className="text-xs text-slate-500">
                Répartition des cours dispensés par discipline sur la période sélectionnée.
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              {subjectChartData.length} Matières
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            {subjectChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                Aucune donnée de séance sur cette période.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectChartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none' }}
                    formatter={(val: any) => [`${val} séance(s)`, 'Volume']}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {subjectChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Graphique 2: Volume par Enseignant */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <span>Volume d'Activité par Enseignant</span>
              </h2>
              <p className="text-xs text-slate-500">
                Nombre de séances réalisées par chaque professeur de l'établissement.
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              {teachers.length} Professeurs
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            {teacherChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                Aucun enseignant actif trouvé.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teacherChartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none' }}
                    formatter={(val: any, name: any, item: any) => [`${val} séance(s) (${item.payload.hours}h)`, 'Activité']}
                  />
                  <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]}>
                    {teacherChartData.map((entry, index) => (
                      <Cell key={`cell-teacher-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Tableau récapitulatif détaillé par enseignant */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>Détail par Enseignant & Matières</span>
            </h2>
            <p className="text-xs text-slate-500">
              Tableau comparatif des volumes horaires et de séances enregistrées par professeur.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Enseignant</th>
                <th className="py-3 px-4">Matière principale</th>
                <th className="py-3 px-4 text-center">Séances (Période)</th>
                <th className="py-3 px-4 text-center">Volume Horaire</th>
                <th className="py-3 px-4 text-right">Part d'activité</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {teacherChartData.map((t) => {
                const percentage = totalSessionsCount > 0 ? Math.round((t.count / totalSessionsCount) * 100) : 0;
                return (
                  <tr key={t.name} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs">
                        {t.name.charAt(0)}
                      </div>
                      <span>{t.name}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold">
                        {t.subject}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-extrabold text-indigo-600">
                      {t.count}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold">
                      {t.hours}h
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <span className="font-bold text-slate-900">{percentage}%</span>
                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 rounded-full"
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
