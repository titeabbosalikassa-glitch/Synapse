import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AccountRequest, AdminNotification } from '../types';
import { ADMIN_USERS, TEACHERS } from '../data/mockData';

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isAdmin: boolean;
  isTeacher: boolean;
  teachers: User[];
  admins: User[];
  allUsers: User[];
  adminUser: User;
  accountRequests: AccountRequest[];
  pendingAccountRequestsCount: number;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  requestAccount: (data: {
    name: string;
    email: string;
    subject?: string;
    subjects?: string[];
    phone?: string;
    password: string;
  }) => { success: boolean; message?: string; error?: string };
  approveAccountRequest: (requestId: string) => { success: boolean; teacher?: User; error?: string };
  rejectAccountRequest: (requestId: string) => { success: boolean; error?: string };
  deleteTeacher: (teacherId: string) => boolean;
  addTeacher: (teacherData: {
    name: string;
    email: string;
    subject?: string;
    subjects?: string[];
    phone?: string;
    password?: string;
  }) => User;
  updateTeacherSubjects: (teacherId: string, subjects: string[]) => boolean;
  resetDefaultTeachers: () => void;
  switchUser: (userId: string) => void;
  initAdminAccount: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => User;
  changePassword: (
    userId: string,
    newPassword: string,
    currentPassword?: string
  ) => { success: boolean; error?: string };
  updateProfile: (
    userId: string,
    data: { name: string; phone?: string }
  ) => { success: boolean; error?: string };
  promoteToAdmin: (teacherId: string) => boolean;
  revokeAdmin: (adminId: string) => boolean;
  isCustomAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Persistent Administrators accounts
  const [admins, setAdmins] = useState<User[]>(() => {
    const saved = localStorage.getItem('synapse_hpg_admins');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Ensure admin-1 is up to date with titeabbosalikassa@gmail.com and Clarisse&Jedidja
          return parsed.map((a: User) => {
            if (a.id === 'admin-1') {
              return {
                ...a,
                email: 'titeabbosalikassa@gmail.com',
                password: 'Clarisse&Jedidja',
                name: 'Tite Abbosa Kassa',
                phone: a.phone || '065451963',
              };
            }
            return a;
          });
        }
      } catch (e) {
        console.error('Failed to parse saved admins', e);
      }
    }
    return ADMIN_USERS;
  });

  useEffect(() => {
    localStorage.setItem('synapse_hpg_admins', JSON.stringify(admins));
  }, [admins]);

  const adminUser = admins[0];

  // Dynamic persistent teachers list
  const [teachers, setTeachers] = useState<User[]>(() => {
    const saved = localStorage.getItem('synapse_hpg_teachers');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved teachers', e);
      }
    }
    return TEACHERS;
  });

  // Keep teachers updated in localStorage
  useEffect(() => {
    localStorage.setItem('synapse_hpg_teachers', JSON.stringify(teachers));
  }, [teachers]);

  // Persistent account registration requests
  const [accountRequests, setAccountRequests] = useState<AccountRequest[]>(() => {
    const saved = localStorage.getItem('synapse_hpg_account_requests');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse account requests', e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('synapse_hpg_account_requests', JSON.stringify(accountRequests));
  }, [accountRequests]);

  const allUsers: User[] = [...admins, ...teachers];

  // Active user session state - persists across page refresh
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedId = localStorage.getItem('synapse_hpg_active_user_id');
    if (savedId) {
      const all = [...admins, ...teachers];
      const found = all.find((u) => u.id === savedId);
      if (found) return found;
    }
    return null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('synapse_hpg_active_user_id', currentUser.id);
    } else {
      localStorage.removeItem('synapse_hpg_active_user_id');
    }
  }, [currentUser]);

  const isCustomAdmin = Boolean(localStorage.getItem('synapse_hpg_admin_is_customized'));

  const pendingAccountRequestsCount = accountRequests.filter((r) => r.status === 'pending').length;

  const login = (email: string, password: string): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Check if the user is in pending registration
    const pendingReq = accountRequests.find(
      (r) => r.email.toLowerCase() === cleanEmail && r.status === 'pending'
    );
    if (pendingReq) {
      return {
        success: false,
        error: `Votre compte (${pendingReq.name}) est actuellement en attente de validation par l'administrateur. Veuillez patienter jusqu'à son approbation.`,
      };
    }

    // 2. Check if the user's registration was rejected
    const rejectedReq = accountRequests.find(
      (r) => r.email.toLowerCase() === cleanEmail && r.status === 'rejected'
    );
    if (rejectedReq) {
      return {
        success: false,
        error: `Votre demande de création de compte a été refusée par l'administrateur. Veuillez contacter la direction de l'établissement.`,
      };
    }

    const user = allUsers.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return {
        success: false,
        error: 'Aucun compte associé à cette adresse e-mail. Vérifiez votre saisie ou créez un compte.',
      };
    }

    const expectedPassword = user.password || (user.role === 'admin' ? 'admin123' : 'prof123');

    if (expectedPassword !== password) {
      return {
        success: false,
        error: 'Mot de passe incorrect. Veuillez vérifier votre saisie.',
      };
    }

    setCurrentUser(user);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('synapse_hpg_active_user_id');
  };

  const requestAccount = (data: {
    name: string;
    email: string;
    subject: string;
    phone?: string;
    password: string;
  }): { success: boolean; message?: string; error?: string } => {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanName = data.name.trim();

    if (!cleanName) {
      return { success: false, error: 'Veuillez renseigner votre nom et prénom.' };
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Veuillez saisir une adresse e-mail valide.' };
    }
    if (!data.subject) {
      return { success: false, error: 'Veuillez sélectionner votre matière d’enseignement.' };
    }
    if (!data.password || data.password.trim().length < 4) {
      return { success: false, error: 'Le mot de passe doit comporter au moins 4 caractères.' };
    }

    // Check if email is already used in existing users
    if (allUsers.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return {
        success: false,
        error: 'Un compte actif est déjà associé à cette adresse e-mail. Veuillez vous connecter.',
      };
    }

    // Check if email already has a pending request
    if (accountRequests.some((r) => r.email.toLowerCase() === cleanEmail && r.status === 'pending')) {
      return {
        success: false,
        error: 'Une demande de création de compte avec cette adresse e-mail est déjà en attente de validation.',
      };
    }

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

    const newRequest: AccountRequest = {
      id: `req-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      subject: data.subject,
      phone: data.phone?.trim() || undefined,
      password: data.password.trim(),
      status: 'pending',
      requestedAt: `${dateStr} à ${timeStr}`,
    };

    setAccountRequests((prev) => [newRequest, ...prev]);

    // Create and dispatch notification for Administrator
    const notif: AdminNotification = {
      id: `notif-reg-${Date.now()}`,
      type: 'account_registration',
      title: 'Demande de création de compte',
      message: `${newRequest.name} (${newRequest.subject}) souhaite créer un compte enseignant.`,
      accountRequestId: newRequest.id,
      accountRequestData: {
        name: newRequest.name,
        email: newRequest.email,
        subject: newRequest.subject,
        phone: newRequest.phone,
        status: 'pending',
      },
      date: dateStr,
      time: timeStr,
      timestamp: now.toISOString(),
      read: false,
    };

    try {
      const savedNotifs = localStorage.getItem('synapse_hpg_admin_notifications');
      const notifsList: AdminNotification[] = savedNotifs ? JSON.parse(savedNotifs) : [];
      const updatedNotifs = [notif, ...notifsList];
      localStorage.setItem('synapse_hpg_admin_notifications', JSON.stringify(updatedNotifs));
      window.dispatchEvent(new CustomEvent('synapse_notifications_updated', { detail: updatedNotifs }));
    } catch (e) {
      console.error('Failed to save admin notification', e);
    }

    return {
      success: true,
      message:
        'Votre demande a été soumise avec succès. L\'administrateur a été notifié pour valider votre compte.',
    };
  };

  const approveAccountRequest = (
    requestId: string
  ): { success: boolean; teacher?: User; error?: string } => {
    const target = accountRequests.find((r) => r.id === requestId);
    if (!target) {
      return { success: false, error: 'Demande de compte introuvable.' };
    }

    // Add teacher to active teachers
    const newTeacher = addTeacher({
      name: target.name,
      email: target.email,
      subject: target.subject,
      phone: target.phone,
      password: target.password || 'prof123',
    });

    const updatedRequests = accountRequests.map((r) =>
      r.id === requestId
        ? { ...r, status: 'approved' as const, reviewedAt: new Date().toISOString() }
        : r
    );
    setAccountRequests(updatedRequests);

    // Update notification in localStorage
    try {
      const savedNotifs = localStorage.getItem('synapse_hpg_admin_notifications');
      if (savedNotifs) {
        const notifsList: AdminNotification[] = JSON.parse(savedNotifs);
        const updatedNotifs = notifsList.map((n) =>
          n.accountRequestId === requestId
            ? {
                ...n,
                read: true,
                accountRequestData: n.accountRequestData
                  ? { ...n.accountRequestData, status: 'approved' as const }
                  : undefined,
              }
            : n
        );
        localStorage.setItem('synapse_hpg_admin_notifications', JSON.stringify(updatedNotifs));
        window.dispatchEvent(new CustomEvent('synapse_notifications_updated', { detail: updatedNotifs }));
      }
    } catch (e) {
      console.error('Failed to sync notification on approve', e);
    }

    return { success: true, teacher: newTeacher };
  };

  const rejectAccountRequest = (requestId: string): { success: boolean; error?: string } => {
    const target = accountRequests.find((r) => r.id === requestId);
    if (!target) {
      return { success: false, error: 'Demande de compte introuvable.' };
    }

    const updatedRequests = accountRequests.map((r) =>
      r.id === requestId
        ? { ...r, status: 'rejected' as const, reviewedAt: new Date().toISOString() }
        : r
    );
    setAccountRequests(updatedRequests);

    // Update notification in localStorage
    try {
      const savedNotifs = localStorage.getItem('synapse_hpg_admin_notifications');
      if (savedNotifs) {
        const notifsList: AdminNotification[] = JSON.parse(savedNotifs);
        const updatedNotifs = notifsList.map((n) =>
          n.accountRequestId === requestId
            ? {
                ...n,
                read: true,
                accountRequestData: n.accountRequestData
                  ? { ...n.accountRequestData, status: 'rejected' as const }
                  : undefined,
              }
            : n
        );
        localStorage.setItem('synapse_hpg_admin_notifications', JSON.stringify(updatedNotifs));
        window.dispatchEvent(new CustomEvent('synapse_notifications_updated', { detail: updatedNotifs }));
      }
    } catch (e) {
      console.error('Failed to sync notification on reject', e);
    }

    return { success: true };
  };

  const initAdminAccount = (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }): User => {
    const updatedAdmin: User = {
      id: 'admin-1',
      name: data.name.trim() || 'Admin principale',
      email: data.email.trim().toLowerCase(),
      role: 'admin',
      phone: data.phone?.trim() || undefined,
      password: data.password.trim(),
    };

    const updatedAdmins = admins.map((a) => (a.id === 'admin-1' ? updatedAdmin : a));
    setAdmins(updatedAdmins);
    localStorage.setItem('synapse_hpg_admins', JSON.stringify(updatedAdmins));
    localStorage.setItem('synapse_hpg_admin_is_customized', 'true');
    setCurrentUser(updatedAdmin);
    return updatedAdmin;
  };

  const changePassword = (
    userId: string,
    newPassword: string,
    currentPassword?: string
  ): { success: boolean; error?: string } => {
    const trimmedNew = newPassword.trim();
    if (!trimmedNew || trimmedNew.length < 4) {
      return {
        success: false,
        error: 'Le nouveau mot de passe doit comporter au moins 4 caractères.',
      };
    }

    // 1. Updating Administrator password
    const targetAdmin = admins.find((a) => a.id === userId);
    if (targetAdmin) {
      if (currentPassword !== undefined && targetAdmin.password && targetAdmin.password !== currentPassword) {
        return {
          success: false,
          error: 'Le mot de passe actuel saisi est incorrect.',
        };
      }
      const updatedAdmins = admins.map((a) =>
        a.id === userId ? { ...a, password: trimmedNew } : a
      );
      setAdmins(updatedAdmins);
      localStorage.setItem('synapse_hpg_admins', JSON.stringify(updatedAdmins));
      if (currentUser?.id === userId) {
        const updatedCurrent = { ...targetAdmin, password: trimmedNew };
        setCurrentUser(updatedCurrent);
      }
      return { success: true };
    }

    // 2. Updating Teacher password
    const targetTeacher = teachers.find((t) => t.id === userId);
    if (!targetTeacher) {
      return {
        success: false,
        error: 'Compte enseignant introuvable.',
      };
    }

    const expectedCurrent = targetTeacher.password || 'prof123';
    if (currentPassword !== undefined && expectedCurrent !== currentPassword) {
      return {
        success: false,
        error: 'Le mot de passe actuel saisi est incorrect.',
      };
    }

    const updatedTeachers = teachers.map((t) =>
      t.id === userId ? { ...t, password: trimmedNew } : t
    );
    setTeachers(updatedTeachers);
    localStorage.setItem('synapse_hpg_teachers', JSON.stringify(updatedTeachers));

    if (currentUser?.id === userId) {
      const updatedCurrent = { ...targetTeacher, password: trimmedNew };
      setCurrentUser(updatedCurrent);
    }

    return { success: true };
  };

  const deleteTeacher = (teacherId: string): boolean => {
    setTeachers((prev) => prev.filter((t) => t.id !== teacherId));
    if (currentUser?.id === teacherId) {
      logout();
    }
    return true;
  };

  const addTeacher = (teacherData: {
    name: string;
    email: string;
    subject: string;
    phone?: string;
    password?: string;
  }): User => {
    const newTeacher: User = {
      id: `t-${Date.now()}`,
      name: teacherData.name.trim(),
      email: teacherData.email.trim().toLowerCase(),
      role: 'teacher',
      subject: teacherData.subject,
      phone: teacherData.phone?.trim() || undefined,
      password: teacherData.password?.trim() || 'prof123',
    };

    setTeachers((prev) => [...prev, newTeacher]);
    return newTeacher;
  };

  const resetDefaultTeachers = () => {
    setTeachers(TEACHERS);
    localStorage.setItem('synapse_hpg_teachers', JSON.stringify(TEACHERS));
  };

  const switchUser = (userId: string) => {
    const found = allUsers.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
    }
  };

  const promoteToAdmin = (teacherId: string): boolean => {
    const t = teachers.find((item) => item.id === teacherId);
    if (!t) return false;
    const promoted: User = { ...t, role: 'admin' };
    const newTeachers = teachers.filter((item) => item.id !== teacherId);
    const newAdmins = [...admins, promoted];
    setTeachers(newTeachers);
    setAdmins(newAdmins);
    localStorage.setItem('synapse_hpg_teachers', JSON.stringify(newTeachers));
    localStorage.setItem('synapse_hpg_admins', JSON.stringify(newAdmins));
    return true;
  };

  const revokeAdmin = (adminId: string): boolean => {
    if (adminId === 'admin-1') return false; // Cannot revoke primary admin
    const a = admins.find((item) => item.id === adminId);
    if (!a) return false;
    const demoted: User = { ...a, role: 'teacher', subject: a.subject || 'Mathématiques' };
    const newAdmins = admins.filter((item) => item.id !== adminId);
    const newTeachers = [...teachers, demoted];
    setAdmins(newAdmins);
    setTeachers(newTeachers);
    localStorage.setItem('synapse_hpg_admins', JSON.stringify(newAdmins));
    localStorage.setItem('synapse_hpg_teachers', JSON.stringify(newTeachers));
    if (currentUser?.id === adminId) {
      setCurrentUser(demoted);
    }
    return true;
  };

  const updateProfile = (
    userId: string,
    data: { name: string; phone?: string }
  ): { success: boolean; error?: string } => {
    const trimmedName = data.name.trim();
    if (!trimmedName) {
      return { success: false, error: 'Le nom complet ne peut pas être vide.' };
    }

    const targetAdmin = admins.find((a) => a.id === userId);
    if (targetAdmin) {
      const updatedAdmins = admins.map((a) =>
        a.id === userId
          ? { ...a, name: trimmedName, phone: data.phone !== undefined ? data.phone.trim() : a.phone }
          : a
      );
      setAdmins(updatedAdmins);
      localStorage.setItem('synapse_hpg_admins', JSON.stringify(updatedAdmins));
      if (currentUser?.id === userId) {
        setCurrentUser({
          ...targetAdmin,
          name: trimmedName,
          phone: data.phone !== undefined ? data.phone.trim() : targetAdmin.phone,
        });
      }
      return { success: true };
    }

    const targetTeacher = teachers.find((t) => t.id === userId);
    if (targetTeacher) {
      const updatedTeachers = teachers.map((t) =>
        t.id === userId
          ? { ...t, name: trimmedName, phone: data.phone !== undefined ? data.phone.trim() : t.phone }
          : t
      );
      setTeachers(updatedTeachers);
      localStorage.setItem('synapse_hpg_teachers', JSON.stringify(updatedTeachers));
      if (currentUser?.id === userId) {
        setCurrentUser({
          ...targetTeacher,
          name: trimmedName,
          phone: data.phone !== undefined ? data.phone.trim() : targetTeacher.phone,
        });
      }
      return { success: true };
    }

    return { success: false, error: 'Utilisateur introuvable.' };
  };

  const isAdmin = currentUser?.role === 'admin';
  const isTeacher = currentUser?.role === 'teacher';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isAdmin,
        isTeacher,
        teachers,
        admins,
        allUsers,
        adminUser,
        accountRequests,
        pendingAccountRequestsCount,
        login,
        logout,
        requestAccount,
        approveAccountRequest,
        rejectAccountRequest,
        deleteTeacher,
        addTeacher,
        resetDefaultTeachers,
        switchUser,
        initAdminAccount,
        changePassword,
        promoteToAdmin,
        revokeAdmin,
        updateProfile,
        isCustomAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
