// Types
export interface User {
  id: string;
  username: string;
  password: string;
  role: 'student' | 'admin';
  grade?: string;
  createdAt: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

export interface Exam {
  id: string;
  name: string;
  grade: string;
  questions: Question[];
  createdAt: string;
  createdBy: string;
}

export interface ExamResult {
  id: string;
  examId: string;
  examName: string;
  userId: string;
  username: string;
  grade: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
}

// Storage keys
const USERS_KEY = 'manasetna_users';
const EXAMS_KEY = 'manasetna_exams';
const RESULTS_KEY = 'manasetna_results';
const CURRENT_USER_KEY = 'manasetna_current_user';
const THEME_KEY = 'manasetna_theme';

// Helper functions
const getItem = <T>(key: string, defaultValue: T): T => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
};

const setItem = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// User functions
export const getUsers = (): User[] => getItem<User[]>(USERS_KEY, []);

export const saveUser = (user: User): void => {
  const users = getUsers();
  users.push(user);
  setItem(USERS_KEY, users);
};

export const findUserByUsername = (username: string): User | undefined => {
  return getUsers().find(u => u.username === username);
};

export const getCurrentUser = (): User | null => {
  return getItem<User | null>(CURRENT_USER_KEY, null);
};

export const setCurrentUser = (user: User | null): void => {
  setItem(CURRENT_USER_KEY, user);
};

export const isAdmin = (username: string): boolean => {
  return username === 'Alyserag';
};

// Exam functions
export const getExams = (): Exam[] => getItem<Exam[]>(EXAMS_KEY, []);

export const getExamsByGrade = (grade: string): Exam[] => {
  return getExams()
    .filter(e => e.grade === grade)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
};

export const getExamById = (id: string): Exam | undefined => {
  return getExams().find(e => e.id === id);
};

export const saveExam = (exam: Exam): void => {
  const exams = getExams();
  exams.push(exam);
  setItem(EXAMS_KEY, exams);
};

export const deleteExam = (id: string): void => {
  const exams = getExams().filter(e => e.id !== id);
  setItem(EXAMS_KEY, exams);
};

// Results functions
export const getResults = (): ExamResult[] => getItem<ExamResult[]>(RESULTS_KEY, []);

export const getResultsByUser = (userId: string): ExamResult[] => {
  return getResults().filter(r => r.userId === userId);
};

export const hasCompletedExam = (userId: string, examId: string): boolean => {
  return getResults().some(r => r.userId === userId && r.examId === examId);
};

export const saveResult = (result: ExamResult): void => {
  const results = getResults();
  results.push(result);
  setItem(RESULTS_KEY, results);
};

// Theme functions
export const getTheme = (): 'light' | 'dark' => {
  return getItem<'light' | 'dark'>(THEME_KEY, 'light');
};

export const setTheme = (theme: 'light' | 'dark'): void => {
  setItem(THEME_KEY, theme);
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

// Initialize theme
export const initTheme = (): void => {
  const theme = getTheme();
  setTheme(theme);
};

// Grades
export const GRADES = [
  'الصف الرابع الابتدائي',
  'الصف الخامس الابتدائي',
  'الصف السادس الابتدائي',
  'الصف الأول الإعدادي',
  'الصف الثاني الإعدادي',
  'الصف الثالث الإعدادي',
  'الصف الأول الثانوي',
  'الصف الثاني الثانوي',
  'الصف الثالث الثانوي',
];

// Generate unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Clear all data
export const clearAllData = (): void => {
  localStorage.removeItem(USERS_KEY);
  localStorage.removeItem(EXAMS_KEY);
  localStorage.removeItem(RESULTS_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
};
