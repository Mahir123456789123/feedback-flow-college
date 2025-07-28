import { AnswerSheet, Grievance } from '@/types';

export const mockAnswerSheets: AnswerSheet[] = [
  {
    id: 'as1',
    studentId: 'student1',
    studentName: 'Alex Kumar',
    subject: 'Data Structures',
    examName: 'Mid-term Examination',
    totalMarks: 100,
    obtainedMarks: 85,
    teacherId: 'teacher1',
    teacherName: 'Dr. Sarah Johnson',
    uploadDate: new Date('2024-01-15'),
    fileUrl: '/mock-answer-sheet-1.pdf',
    semester: 'Fall 2024',
    department: 'Computer Science'
  },
  {
    id: 'as2',
    studentId: 'student1',
    studentName: 'Alex Kumar',
    subject: 'Database Systems',
    examName: 'Final Examination',
    totalMarks: 100,
    obtainedMarks: 78,
    teacherId: 'teacher1',
    teacherName: 'Dr. Sarah Johnson',
    uploadDate: new Date('2024-01-20'),
    fileUrl: '/mock-answer-sheet-2.pdf',
    semester: 'Fall 2024',
    department: 'Computer Science'
  },
  {
    id: 'as3',
    studentId: 'student2',
    studentName: 'Emma Rodriguez',
    subject: 'Calculus II',
    examName: 'Mid-term Examination',
    totalMarks: 100,
    obtainedMarks: 92,
    teacherId: 'teacher2',
    teacherName: 'Prof. Michael Chen',
    uploadDate: new Date('2024-01-18'),
    fileUrl: '/mock-answer-sheet-3.pdf',
    semester: 'Fall 2024',
    department: 'Mathematics'
  }
];

export const mockGrievances: Grievance[] = [
  {
    id: 'g1',
    studentId: 'student1',
    studentName: 'Alex Kumar',
    answerSheetId: 'as1',
    subject: 'Data Structures',
    examName: 'Mid-term Examination',
    questionNumber: 3,
    grievanceText: 'I believe my solution for the binary tree traversal question deserves more marks. I have implemented all three traversal methods correctly.',
    status: 'pending',
    teacherId: 'teacher1',
    teacherName: 'Dr. Sarah Johnson',
    submissionDate: new Date('2024-01-16')
  },
  {
    id: 'g2',
    studentId: 'student1',
    studentName: 'Alex Kumar',
    answerSheetId: 'as2',
    subject: 'Database Systems',
    examName: 'Final Examination',
    questionNumber: 5,
    grievanceText: 'The SQL query I wrote should produce the correct result. I think there might be an error in evaluation.',
    status: 'under_review',
    teacherId: 'teacher1',
    teacherName: 'Dr. Sarah Johnson',
    submissionDate: new Date('2024-01-21')
  },
  {
    id: 'g3',
    studentId: 'student2',
    studentName: 'Emma Rodriguez',
    answerSheetId: 'as3',
    subject: 'Calculus II',
    examName: 'Mid-term Examination',
    questionNumber: 2,
    grievanceText: 'I believe my integration by parts solution is correct and should receive full marks.',
    status: 'resolved',
    teacherId: 'teacher2',
    teacherName: 'Prof. Michael Chen',
    submissionDate: new Date('2024-01-19'),
    teacherResponse: 'After review, I agree with your solution. Your marks have been updated to reflect the correct score.',
    responseDate: new Date('2024-01-22')
  }
];