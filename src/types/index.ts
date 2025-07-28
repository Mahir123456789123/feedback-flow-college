export interface User {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'student';
  department?: string;
}

export interface AnswerSheet {
  id: string;
  studentId: string;
  studentName: string;
  subject: string;
  examName: string;
  totalMarks: number;
  obtainedMarks: number;
  teacherId: string;
  teacherName: string;
  uploadDate: Date;
  fileUrl: string;
  semester: string;
  department: string;
}

export interface Question {
  id: string;
  questionNumber: number;
  totalMarks: number;
  obtainedMarks: number;
  comments?: string;
}

export interface Grievance {
  id: string;
  studentId: string;
  studentName: string;
  answerSheetId: string;
  subject: string;
  examName: string;
  questionNumber: number;
  grievanceText: string;
  status: 'pending' | 'under_review' | 'resolved' | 'rejected';
  teacherId: string;
  teacherName: string;
  submissionDate: Date;
  teacherResponse?: string;
  responseDate?: Date;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: 'teacher' | 'student') => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}