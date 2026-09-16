import { User, SubjectConfig } from '../types';
import { SUBJECTS } from '../data/mockData';

/**
 * Returns the subjects taught by a teacher (at most 3).
 * Falls back to user.subject if user.subjects is not defined.
 */
export function getTeacherSubjects(user?: User | null): string[] {
  if (!user) return [];
  if (user.subjects && Array.isArray(user.subjects) && user.subjects.length > 0) {
    return user.subjects.slice(0, 3);
  }
  if (user.subject) {
    return [user.subject];
  }
  return [];
}

/**
 * Returns SubjectConfig items for the teacher's subjects.
 * For admin, returns all school subjects.
 */
export function getTeacherSubjectConfigs(user?: User | null): SubjectConfig[] {
  if (!user) return SUBJECTS;
  if (user.role === 'admin') return SUBJECTS;

  const teacherSubjectNames = getTeacherSubjects(user);
  const configs = SUBJECTS.filter((s) => teacherSubjectNames.includes(s.name));
  return configs.length > 0 ? configs : SUBJECTS.slice(0, 1);
}

/**
 * Returns the subject IDs (e.g. 'maths', 'physique') corresponding to the teacher's subjects.
 * For admin, returns all subject IDs.
 */
export function getTeacherSubjectIds(user?: User | null): string[] {
  return getTeacherSubjectConfigs(user).map((s) => s.id);
}

/**
 * Checks if a subject is taught by a teacher.
 * For admin, returns true for all subjects.
 */
export function isSubjectTaughtByTeacher(
  subjectNameOrId: string,
  user?: User | null
): boolean {
  if (!user || user.role === 'admin') return true;
  const configs = getTeacherSubjectConfigs(user);
  return configs.some(
    (c) => c.id === subjectNameOrId || c.name === subjectNameOrId
  );
}
