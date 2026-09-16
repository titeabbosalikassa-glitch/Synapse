import React, { useState } from 'react';
import { Session, Student } from '../../types';
import { SUBJECTS } from '../../data/mockData';
import {
  Calendar,
  Plus,
  Search,
  Award,
  Filter,
  ArrowRight,
  Clock,
  BookOpen,
} from 'lucide-react';

interface SessionListProps {
  sessions: Session[];
  students: Student[];
  onOpenNewSession: () => void;
  onSelectStudent: (student: Student) => void;
  isAdmin?: boolean;
}

export const SessionList: React.FC<SessionListProps> = ({
  sessions,
  students,
  onOpenNewSession,
  onSelectStudent,
  isAdmin = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all');

  const filteredSessions = sessions.filter((s) => {
    const student = students.find((st) => st.id === s.studentId);
    const studentName = student ? `${student.firstName} ${student.lastName}`.toLowerCase() : '';

    const matchesSearch =
      s.chapter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.notion.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.objective.toLowerCase().includes(searchQuery.toLowerCase()) ||
      studentName.includes(searchQuery.toLowerCase());

    const matchesSubject = selectedSubjectId === 'all' || s.subjectId === selectedSubjectId;
    const matchesStudent = selectedStudentId === 'all' || s.studentId === selectedStudentId;

    return matchesSearch && matchesSubject && matchesStudent;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm">
                <Calendar className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Historique des Séances & Cotations
              </h1>
            </div>
            <p className="text-xs text-slate-500">
              Suivi détaillé des séances pédagogiques HPG, cotations sur 100 points et appréciations.
            </p>
          </div>

          <button
            onClick={onOpenNewSession}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors self-start sm:self-center cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Enregistrer une séance</span>
          </button>
        </div>

        {/* Filtres & Recherche */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-100">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par élève, chapitre, notion..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
            >
              <option value="all">Tous les élèves</option>
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.firstName} {st.lastName} ({st.classLevel})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Liste des séances */}
      <div className="space-y-3">
        {filteredSessions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 space-y-2 shadow-2xs">
            <Calendar className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs font-semibold text-slate-600">Aucune séance trouvée</p>
            <p className="text-[11px] text-slate-400">
              Modifiez vos filtres ou enregistrez une nouvelle séance.
            </p>
          </div>
        ) : (
          filteredSessions.map((session) => {
            const student = students.find((s) => s.id === session.studentId);
            const subject = SUBJECTS.find((s) => s.id === session.subjectId)?.name || 'Sciences';

            return (
              <div
                key={session.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-xs transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {session.chapter} — {session.notion}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                        {subject}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <span>Élève :</span>
                      {student ? (
                        <button
                          onClick={() => onSelectStudent(student)}
                          className="font-bold text-indigo-600 hover:text-indigo-800 underline underline-offset-2 flex items-center gap-1"
                        >
                          {student.firstName} {student.lastName} ({student.classLevel})
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ) : (
                        <span className="text-slate-400">Élève non renseigné</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-start sm:self-center">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-semibold">Cotation HPG</span>
                      <span className="text-sm font-mono font-bold text-indigo-700">
                        {session.rating.calculatedScore} / 100
                      </span>
                    </div>

                    <div className="text-right text-[11px] text-slate-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{session.durationMinutes} min</span>
                      </div>
                      <div>{session.date}</div>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-700">
                  <strong className="text-slate-900 font-semibold">Objectif : </strong>
                  {session.objective}
                </div>

                {session.contentWorked && (
                  <div className="text-[11px] text-slate-600">
                    <strong className="text-slate-800 font-semibold">Contenu abordé : </strong>
                    {session.contentWorked}
                  </div>
                )}

                {/* 5 critères de cotation */}
                <div className="grid grid-cols-5 gap-2 text-center text-[10px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block">Compréhension</span>
                    <strong className="text-slate-800">{session.rating.understanding}/20</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Autonomie</span>
                    <strong className="text-slate-800">{session.rating.autonomy}/20</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Méthode</span>
                    <strong className="text-slate-800">{session.rating.methodology}/20</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Implication</span>
                    <strong className="text-slate-800">{session.rating.engagement}/20</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Progression</span>
                    <strong className="text-slate-800">{session.rating.progression}/20</strong>
                  </div>
                </div>

                {session.appreciation && (
                  <div className="text-xs text-indigo-950 bg-indigo-50/50 p-3 rounded-xl italic">
                    « {session.appreciation} »
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
