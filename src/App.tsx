import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { SimpleDashboard } from './components/dashboard/SimpleDashboard';
import { StudentList } from './components/students/StudentList';
import { StudentDetail } from './components/students/StudentDetail';
import { StudentModal } from './components/students/StudentModal';
import { SessionModal } from './components/sessions/SessionModal';
import { ObjectiveModal } from './components/objectives/ObjectiveModal';
import { UploadPdfModal } from './components/resources/UploadPdfModal';
import { SessionList } from './components/sessions/SessionList';
import { ResourceList } from './components/resources/ResourceList';
import { TeacherSelector } from './components/admin/TeacherSelector';
import { AddTeacherModal } from './components/admin/AddTeacherModal';
import { AiExerciseStudio } from './components/admin/AiExerciseStudio';
import { ActivityLogTable } from './components/admin/ActivityLogTable';
import { AnalyticsView } from './components/admin/AnalyticsView';
import { AccountProfilePage } from './components/admin/AccountProfilePage';
import { ConfirmDialog } from './components/common/ConfirmDialog';
import { LoginScreen } from './components/auth/LoginScreen';
import { NotificationToast } from './components/common/NotificationToast';
import {
  Student,
  Session,
  Objective,
  NotionStatus,
  ResourceDocument,
  Evaluation,
  User,
  NotionAssessmentStatus,
  SubjectName,
  AdminNotification,
} from './types';
import {
  INITIAL_STUDENTS,
  INITIAL_SESSIONS,
  INITIAL_OBJECTIVES,
  INITIAL_NOTION_STATUSES,
  INITIAL_RESOURCES,
  INITIAL_EVALUATIONS,
  INITIAL_ADMIN_NOTIFICATIONS,
} from './data/mockData';

function AppContent() {
  const {
    currentUser,
    isAdmin,
    isTeacher,
    teachers,
    admins,
    deleteTeacher,
    addTeacher,
    resetDefaultTeachers,
  } = useAuth();

  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Persistent Domain State
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('synapse_hpg_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [sessions, setSessions] = useState<Session[]>(() => {
    const saved = localStorage.getItem('synapse_hpg_sessions');
    return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
  });

  const [objectives, setObjectives] = useState<Objective[]>(() => {
    const saved = localStorage.getItem('synapse_hpg_objectives');
    return saved ? JSON.parse(saved) : INITIAL_OBJECTIVES;
  });

  const [notionStatuses, setNotionStatuses] = useState<NotionStatus[]>(() => {
    const saved = localStorage.getItem('synapse_hpg_notions');
    return saved ? JSON.parse(saved) : INITIAL_NOTION_STATUSES;
  });

  const [resources, setResources] = useState<ResourceDocument[]>(() => {
    const saved = localStorage.getItem('synapse_hpg_resources');
    return saved ? JSON.parse(saved) : INITIAL_RESOURCES;
  });

  const [evaluations, setEvaluations] = useState<Evaluation[]>(() => {
    const saved = localStorage.getItem('synapse_hpg_evaluations');
    return saved ? JSON.parse(saved) : INITIAL_EVALUATIONS;
  });

  const [notifications, setNotifications] = useState<AdminNotification[]>(() => {
    const saved = localStorage.getItem('synapse_hpg_admin_notifications');
    return saved ? JSON.parse(saved) : INITIAL_ADMIN_NOTIFICATIONS;
  });

  const [activeToast, setActiveToast] = useState<AdminNotification | null>(null);

  // Synchronization with localStorage
  useEffect(() => {
    localStorage.setItem('synapse_hpg_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('synapse_hpg_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('synapse_hpg_objectives', JSON.stringify(objectives));
  }, [objectives]);

  useEffect(() => {
    localStorage.setItem('synapse_hpg_notions', JSON.stringify(notionStatuses));
  }, [notionStatuses]);

  useEffect(() => {
    localStorage.setItem('synapse_hpg_resources', JSON.stringify(resources));
  }, [resources]);

  useEffect(() => {
    localStorage.setItem('synapse_hpg_evaluations', JSON.stringify(evaluations));
  }, [evaluations]);

  useEffect(() => {
    localStorage.setItem('synapse_hpg_admin_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    const handleNotifUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<AdminNotification[]>;
      if (customEvent.detail) {
        setNotifications(customEvent.detail);
      } else {
        const saved = localStorage.getItem('synapse_hpg_admin_notifications');
        if (saved) {
          try {
            setNotifications(JSON.parse(saved));
          } catch (err) {
            console.error(err);
          }
        }
      }
    };
    window.addEventListener('synapse_notifications_updated', handleNotifUpdate);
    return () => window.removeEventListener('synapse_notifications_updated', handleNotifUpdate);
  }, []);

  // Modals state
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);

  const [isObjectiveModalOpen, setIsObjectiveModalOpen] = useState(false);
  const [editingObjective, setEditingObjective] = useState<Objective | null>(null);

  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isAddTeacherModalOpen, setIsAddTeacherModalOpen] = useState(false);

  // Admin selected teacher to inspect
  const [selectedTeacherForAdmin, setSelectedTeacherForAdmin] = useState<User | null>(null);

  // Confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    action: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirmer',
    action: () => {},
  });

  // Global keyboard shortcuts for power users
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not trigger shortcuts if user is typing inside an input/textarea/select
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
        // Allow Escape even in inputs to blur or close
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setEditingStudent(null);
        setIsStudentModalOpen(true);
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setEditingSession(null);
        setIsSessionModalOpen(true);
      } else if (e.key === 'Escape') {
        if (isStudentModalOpen) setIsStudentModalOpen(false);
        else if (isSessionModalOpen) setIsSessionModalOpen(false);
        else if (isObjectiveModalOpen) setIsObjectiveModalOpen(false);
        else if (isPdfModalOpen) setIsPdfModalOpen(false);
        else if (isAddTeacherModalOpen) setIsAddTeacherModalOpen(false);
        else if (selectedStudent) setSelectedStudent(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStudentModalOpen, isSessionModalOpen, isObjectiveModalOpen, isPdfModalOpen, isAddTeacherModalOpen, selectedStudent]);

  // Strict Password Authentication: Show Login Screen if not authenticated
  if (!currentUser) {
    return <LoginScreen />;
  }

  // Strict isolation of data:
  // If teacher -> ONLY their own students & sessions & resources
  // If admin -> all data, or filtered by selected teacher in inspection mode
  const effectiveTeacherId = selectedTeacherForAdmin && isAdmin
    ? selectedTeacherForAdmin.id
    : currentUser.id;

  const filteredStudents = isAdmin && !selectedTeacherForAdmin
    ? students
    : students.filter((s) => s.teacherId === effectiveTeacherId);

  const filteredSessions = isAdmin && !selectedTeacherForAdmin
    ? sessions
    : sessions.filter((s) => s.teacherId === effectiveTeacherId);

  const filteredObjectives = isAdmin && !selectedTeacherForAdmin
    ? objectives
    : objectives.filter((o) => o.teacherId === effectiveTeacherId);

  const filteredResources = isAdmin && !selectedTeacherForAdmin
    ? resources
    : resources.filter((r) => r.teacherId === effectiveTeacherId);

  // CRUD Handlers for Students
  const handleSaveStudent = (studentData: Partial<Student>) => {
    if (editingStudent) {
      setStudents((prev) =>
        prev.map((st) => (st.id === editingStudent.id ? { ...st, ...studentData } : st))
      );
      if (selectedStudent?.id === editingStudent.id) {
        setSelectedStudent((prev) => (prev ? { ...prev, ...studentData } : null));
      }
    } else {
      const newStudent: Student = {
        id: `st-${Date.now()}`,
        teacherId: studentData.teacherId || effectiveTeacherId,
        firstName: studentData.firstName || '',
        lastName: studentData.lastName || '',
        classLevel: studentData.classLevel || 'Terminale C',
        stream: studentData.stream || 'C',
        subjects: studentData.subjects || ['Mathématiques'],
        parentPhone: studentData.parentPhone,
        parentEmail: studentData.parentEmail,
        notes: studentData.notes,
        createdAt: new Date().toISOString(),
      };
      setStudents((prev) => [newStudent, ...prev]);

      // Notification automatique pour l'Administrateur avec date et heure
      const now = new Date();
      const dateStr = now.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      const timeStr = now.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const assignedTeacherId = studentData.teacherId || effectiveTeacherId;
      const teacher = teachers.find((t) => t.id === assignedTeacherId);
      const teacherName = teacher?.name || 'un enseignant';

      const newNotification: AdminNotification = {
        id: `notif-${Date.now()}`,
        type: 'student_added',
        title: 'Nouvel élève inscrit',
        message: `Un élève a été ajouté par ${teacherName}`,
        teacherId: assignedTeacherId,
        teacherName: teacherName,
        studentId: newStudent.id,
        studentName: `${newStudent.firstName} ${newStudent.lastName} (${newStudent.classLevel})`,
        date: dateStr,
        time: timeStr,
        timestamp: now.toISOString(),
        read: false,
      };

      setNotifications((prev) => [newNotification, ...prev]);
      setActiveToast(newNotification);
    }
    setIsStudentModalOpen(false);
    setEditingStudent(null);
  };

  // Notification management handlers
  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  const handleDeleteStudent = (student: Student) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Supprimer cet élève ?',
      message: `Êtes-vous certain de vouloir supprimer ${student.firstName} ${student.lastName} ? Toutes ses séances et notions seront archivées.`,
      confirmLabel: 'Supprimer',
      action: () => {
        setStudents((prev) => prev.filter((s) => s.id !== student.id));
        setSessions((prev) => prev.filter((s) => s.studentId !== student.id));
        setNotionStatuses((prev) => prev.filter((n) => n.studentId !== student.id));
        setObjectives((prev) => prev.filter((o) => o.studentId !== student.id));
        if (selectedStudent?.id === student.id) {
          setSelectedStudent(null);
        }
      },
    });
  };

  // CRUD Handlers for Sessions
  const handleSaveSession = (
    sessionData: Partial<Session>,
    notionStatusUpdate?: 'studied' | 'assimilated' | 'to_reinforce'
  ) => {
    if (editingSession) {
      setSessions((prev) =>
        prev.map((sess) => (sess.id === editingSession.id ? { ...sess, ...sessionData } : sess))
      );
    } else {
      const newSession: Session = {
        id: `sess-${Date.now()}`,
        studentId: sessionData.studentId || '',
        teacherId: sessionData.teacherId || effectiveTeacherId,
        date: sessionData.date || new Date().toISOString().split('T')[0],
        durationMinutes: sessionData.durationMinutes || 90,
        subjectId: sessionData.subjectId || 'maths',
        chapter: sessionData.chapter || '',
        notion: sessionData.notion || '',
        objective: sessionData.objective || '',
        contentWorked: sessionData.contentWorked,
        appreciation: sessionData.appreciation || '',
        rating: sessionData.rating || {
          understanding: 16,
          autonomy: 15,
          methodology: 16,
          engagement: 17,
          progression: 16,
          calculatedScore: 80,
        },
        createdAt: new Date().toISOString(),
      };
      setSessions((prev) => [newSession, ...prev]);

      // Automatically update or insert Notion status in the student's pedagogical cycle
      if (sessionData.studentId && sessionData.notion) {
        const subjectName = (currentUser.subject || 'Mathématiques') as SubjectName;

        setNotionStatuses((prev) => {
          const existing = prev.find(
            (n) => n.studentId === sessionData.studentId && n.notion.toLowerCase() === sessionData.notion?.toLowerCase()
          );
          if (existing) {
            return prev.map((n) =>
              n.id === existing.id
                ? {
                    ...n,
                    status: notionStatusUpdate || 'assimilated',
                    updatedAt: new Date().toISOString(),
                    sessionCount: n.sessionCount + 1,
                  }
                : n
            );
          } else {
            const newNotion: NotionStatus = {
              id: `not-${Date.now()}`,
              studentId: sessionData.studentId!,
              teacherId: sessionData.teacherId || effectiveTeacherId,
              subject: subjectName,
              chapter: sessionData.chapter || 'Chapitre en cours',
              notion: sessionData.notion!,
              status: notionStatusUpdate || 'assimilated',
              updatedAt: new Date().toISOString(),
              sessionCount: 1,
            };
            return [...prev, newNotion];
          }
        });
      }
    }
    setIsSessionModalOpen(false);
    setEditingSession(null);
  };

  const handleDeleteSession = (session: Session) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Supprimer cette séance ?',
      message: 'Cette action supprimera définitivement cette fiche de séance et sa cotation.',
      confirmLabel: 'Supprimer',
      action: () => {
        setSessions((prev) => prev.filter((s) => s.id !== session.id));
      },
    });
  };

  // Notion status toggle
  const handleUpdateNotionStatus = (notion: NotionStatus, newStatus: NotionAssessmentStatus) => {
    setNotionStatuses((prev) =>
      prev.map((n) => (n.id === notion.id ? { ...n, status: newStatus, updatedAt: new Date().toISOString() } : n))
    );
  };

  const handleAddCustomNotion = (chapter: string, notionName: string) => {
    if (!selectedStudent) return;
    const newNotion: NotionStatus = {
      id: `not-${Date.now()}`,
      studentId: selectedStudent.id,
      teacherId: selectedStudent.teacherId,
      subject: (currentUser.subject || 'Mathématiques') as SubjectName,
      chapter,
      notion: notionName,
      status: 'studied',
      updatedAt: new Date().toISOString(),
      sessionCount: 0,
    };
    setNotionStatuses((prev) => [...prev, newNotion]);
  };

  // Objectives handlers
  const handleSaveObjective = (objData: Partial<Objective>) => {
    if (editingObjective) {
      setObjectives((prev) =>
        prev.map((o) => (o.id === editingObjective.id ? { ...o, ...objData } : o))
      );
    } else {
      const newObj: Objective = {
        id: `obj-${Date.now()}`,
        studentId: objData.studentId || '',
        teacherId: objData.teacherId || effectiveTeacherId,
        title: objData.title || '',
        description: objData.description || '',
        targetDate: objData.targetDate || '',
        status: objData.status || 'in_progress',
        progressPercent: objData.progressPercent || 0,
        createdAt: new Date().toISOString(),
      };
      setObjectives((prev) => [newObj, ...prev]);
    }
    setIsObjectiveModalOpen(false);
    setEditingObjective(null);
  };

  const handleDeleteObjective = (obj: Objective) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Supprimer cet objectif ?',
      message: 'Voulez-vous supprimer cet objectif pédagogique ?',
      confirmLabel: 'Supprimer',
      action: () => {
        setObjectives((prev) => prev.filter((o) => o.id !== obj.id));
      },
    });
  };

  // Resources handlers
  const handleSavePdf = (resData: Partial<ResourceDocument>) => {
    const newRes: ResourceDocument = {
      id: `res-${Date.now()}`,
      teacherId: resData.teacherId || effectiveTeacherId,
      studentId: resData.studentId,
      title: resData.title || '',
      chapter: resData.chapter || '',
      subjectId: resData.subjectId || 'maths',
      classLevel: resData.classLevel || 'Terminale C',
      stream: resData.stream || 'C',
      fileUrl: resData.fileUrl || '',
      fileName: resData.fileName || 'document.pdf',
      fileSize: resData.fileSize || 250000,
      uploadedAt: new Date().toISOString(),
      description: resData.description,
    };
    setResources((prev) => [newRes, ...prev]);
    setIsPdfModalOpen(false);
  };

  const handleDeleteResource = (resource: ResourceDocument) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Supprimer ce fichier PDF ?',
      message: `Êtes-vous certain de vouloir supprimer le document « ${resource.title} » ?`,
      confirmLabel: 'Supprimer',
      action: () => {
        setResources((prev) => prev.filter((r) => r.id !== resource.id));
      },
    });
  };

  // Admin: Delete teacher handler
  const handleDeleteTeacher = (teacher: User) => {
    const teacherStudentsCount = students.filter((s) => s.teacherId === teacher.id).length;
    const teacherSessionsCount = sessions.filter((s) => s.teacherId === teacher.id).length;

    setConfirmDialog({
      isOpen: true,
      title: `Supprimer le compte de ${teacher.name} ?`,
      message: `Êtes-vous certain de vouloir supprimer définitivement le compte enseignant de ${teacher.name} (${teacher.subject}) ? Il ne pourra plus se connecter. Ses ${teacherStudentsCount} élève(s) et ${teacherSessionsCount} séance(s) associées seront également nettoyés.`,
      confirmLabel: 'Confirmer la suppression',
      action: () => {
        deleteTeacher(teacher.id);
        // Clean up teacher's students, sessions, objectives, notions, resources
        setStudents((prev) => prev.filter((s) => s.teacherId !== teacher.id));
        setSessions((prev) => prev.filter((s) => s.teacherId !== teacher.id));
        setObjectives((prev) => prev.filter((o) => o.teacherId !== teacher.id));
        setNotionStatuses((prev) => prev.filter((n) => n.teacherId !== teacher.id));
        setResources((prev) => prev.filter((r) => r.teacherId !== teacher.id));

        if (selectedTeacherForAdmin?.id === teacher.id) {
          setSelectedTeacherForAdmin(null);
        }
        if (selectedStudent && selectedStudent.teacherId === teacher.id) {
          setSelectedStudent(null);
        }
      },
    });
  };



  return (
    <>
      <AppLayout
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSelectedStudent(null);
        }}
        notifications={notifications}
        onMarkAsRead={handleMarkNotificationAsRead}
        onMarkAllAsRead={handleMarkAllNotificationsAsRead}
        onDeleteNotification={handleDeleteNotification}
        onClearAllNotifications={handleClearAllNotifications}
        onOpenProfile={() => {
          setActiveTab('profile');
          setSelectedStudent(null);
        }}
      >
        {/* Si un élève spécifique est consulté */}
        {selectedStudent ? (
          <StudentDetail
            student={selectedStudent}
            teacher={teachers.find((t) => t.id === selectedStudent.teacherId)}
            sessions={sessions}
            objectives={objectives}
            notionStatuses={notionStatuses}
            resources={resources}
            onBack={() => setSelectedStudent(null)}
            onOpenNewSession={() => {
              setEditingSession(null);
              setIsSessionModalOpen(true);
            }}
            onOpenNewObjective={() => {
              setEditingObjective(null);
              setIsObjectiveModalOpen(true);
            }}
            onOpenUploadPdf={() => setIsPdfModalOpen(true)}
            onEditStudent={(st) => {
              setEditingStudent(st);
              setIsStudentModalOpen(true);
            }}
            onUpdateNotionStatus={handleUpdateNotionStatus}
            onAddCustomNotion={handleAddCustomNotion}
            onEditSession={(sess) => {
              setEditingSession(sess);
              setIsSessionModalOpen(true);
            }}
            onDeleteSession={handleDeleteSession}
            onEditObjective={(obj) => {
              setEditingObjective(obj);
              setIsObjectiveModalOpen(true);
            }}
            onDeleteObjective={handleDeleteObjective}
            onDeleteResource={handleDeleteResource}
            isAdmin={isAdmin}
          />
        ) : activeTab === 'profile' ? (
          <AccountProfilePage />
        ) : activeTab === 'dashboard' ? (
          <SimpleDashboard
            students={filteredStudents}
            sessions={filteredSessions}
            objectives={filteredObjectives}
            notionStatuses={notionStatuses}
            resources={filteredResources}
            evaluations={evaluations}
            teachers={teachers}
            notifications={notifications}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onSelectStudent={(st) => setSelectedStudent(st)}
            onOpenNewSession={() => {
              setEditingSession(null);
              setIsSessionModalOpen(true);
            }}
            onOpenNewStudent={() => {
              setEditingStudent(null);
              setIsStudentModalOpen(true);
            }}
            onOpenUploadPdf={() => setIsPdfModalOpen(true)}
          />
        ) : activeTab === 'students' ? (
          <StudentList
            students={filteredStudents}
            teachers={teachers}
            onSelectStudent={(st) => setSelectedStudent(st)}
            onOpenNewStudent={() => {
              setEditingStudent(null);
              setIsStudentModalOpen(true);
            }}
            onEditStudent={(st) => {
              setEditingStudent(st);
              setIsStudentModalOpen(true);
            }}
            onDeleteStudent={handleDeleteStudent}
            isAdmin={isAdmin}
          />
        ) : activeTab === 'sessions' ? (
          <SessionList
            sessions={filteredSessions}
            students={filteredStudents}
            onOpenNewSession={() => {
              setEditingSession(null);
              setIsSessionModalOpen(true);
            }}
            onSelectStudent={(st) => setSelectedStudent(st)}
            isAdmin={isAdmin}
          />
        ) : activeTab === 'resources' ? (
          <ResourceList
            resources={filteredResources}
            students={filteredStudents}
            onOpenUploadPdf={() => setIsPdfModalOpen(true)}
            isAdmin={isAdmin}
          />
        ) : activeTab === 'teachers' && isAdmin ? (
          <TeacherSelector
            teachers={teachers}
            selectedTeacher={selectedTeacherForAdmin}
            onSelectTeacher={(t) => {
              setSelectedTeacherForAdmin(selectedTeacherForAdmin?.id === t.id ? null : t);
            }}
            onDeleteTeacher={handleDeleteTeacher}
            onAddTeacher={() => setIsAddTeacherModalOpen(true)}
            students={students}
            sessions={sessions}
          />
        ) : activeTab === 'analytics' && isAdmin ? (
          <AnalyticsView
            sessions={sessions}
            teachers={teachers}
            students={students}
          />
        ) : activeTab === 'activities' && isAdmin ? (
          <ActivityLogTable
            sessions={sessions}
            students={students}
            teachers={teachers}
            admins={admins}
          />
        ) : activeTab === 'ai-exercises' && isAdmin ? (
          <AiExerciseStudio
            teachers={teachers}
            students={students}
            notionStatuses={notionStatuses}
            sessions={sessions}
            savedEvaluations={evaluations}
            onSaveEvaluation={(ev) => setEvaluations([ev, ...evaluations])}
            onClearEvaluations={() => {
              setConfirmDialog({
                isOpen: true,
                title: 'Vider tout l\'historique des exercices IA ?',
                message: 'Cette action supprimera définitivement toutes les évaluations et devoirs générés et enregistrés.',
                confirmLabel: 'Tout supprimer',
                action: () => setEvaluations([]),
              });
            }}
            onDeleteEvaluation={(id) => {
              setConfirmDialog({
                isOpen: true,
                title: 'Supprimer cette évaluation ?',
                message: 'Voulez-vous supprimer définitivement ce devoir de l\'historique ?',
                confirmLabel: 'Supprimer',
                action: () => setEvaluations((prev) => prev.filter((e) => e.id !== id)),
              });
            }}
          />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-500 shadow-xs">
            Section en cours de consultation pour l'utilisateur actif.
          </div>
        )}
      </AppLayout>

      {/* Modals & Dialogs */}
      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => {
          setIsStudentModalOpen(false);
          setEditingStudent(null);
        }}
        onSave={handleSaveStudent}
        editingStudent={editingStudent}
        teacherId={effectiveTeacherId}
        teachers={teachers}
        isAdmin={isAdmin}
      />

      <SessionModal
        isOpen={isSessionModalOpen}
        onClose={() => {
          setIsSessionModalOpen(false);
          setEditingSession(null);
        }}
        onSave={handleSaveSession}
        students={filteredStudents}
        teacherId={effectiveTeacherId}
        defaultStudentId={selectedStudent?.id}
        editingSession={editingSession}
      />

      <ObjectiveModal
        isOpen={isObjectiveModalOpen}
        onClose={() => {
          setIsObjectiveModalOpen(false);
          setEditingObjective(null);
        }}
        onSave={handleSaveObjective}
        students={filteredStudents}
        teacherId={effectiveTeacherId}
        defaultStudentId={selectedStudent?.id}
        editingObjective={editingObjective}
      />

      <UploadPdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        onSave={handleSavePdf}
        teacherId={effectiveTeacherId}
        students={filteredStudents}
      />

      <AddTeacherModal
        isOpen={isAddTeacherModalOpen}
        onClose={() => setIsAddTeacherModalOpen(false)}
        onSave={(data) => {
          addTeacher(data);
          setIsAddTeacherModalOpen(false);
        }}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        onConfirm={confirmDialog.action}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />

      <NotificationToast
        notification={activeToast}
        onClose={() => setActiveToast(null)}
      />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
