import { AnswerSheet, Grievance } from '@/types';

export const mockAnswerSheets: AnswerSheet[] = [
  {
    id: 'as1',
    studentId: 'student1',
    studentName: 'Mahir Shah',
    subject: 'Operating Systems',
    examName: 'End Semester Examination',
    totalMarks: 100,
    obtainedMarks: 85,
    teacherId: 'teacher1',
    teacherName: 'Dr. Kailas Devadkar',
    uploadDate: new Date('2024-01-15'),
    fileUrl: '/mock-answer-sheet-1.pdf',
    semester: 'Semester 3 - AY 2024-25',
    department: 'Computer Engineering'
  },
  {
    id: 'as2',
    studentId: 'student1',
    studentName: 'Mahir Shah',
    subject: 'Database Management Systems',
    examName: 'University Examination',
    totalMarks: 100,
    obtainedMarks: 78,
    teacherId: 'teacher1',
    teacherName: 'Dr. Kailas Devadkar',
    uploadDate: new Date('2024-01-20'),
    fileUrl: '/mock-answer-sheet-2.pdf',
    semester: 'Semester 3 - AY 2024-25',
    department: 'Computer Engineering'
  },
  {
    id: 'as3',
    studentId: 'student2',
    studentName: 'Kavya Shah',
    subject: 'Computer Networks',
    examName: 'Internal Assessment 2',
    totalMarks: 100,
    obtainedMarks: 92,
    teacherId: 'teacher2',
    teacherName: 'Prof. Rajesh Patel',
    uploadDate: new Date('2024-01-18'),
    fileUrl: '/mock-answer-sheet-3.pdf',
    semester: 'Semester 5 - AY 2024-25',
    department: 'Information Technology'
  }
];

export const mockGrievances: Grievance[] = [
  {
    id: 'g1',
    studentId: 'student1',
    studentName: 'Mahir Shah',
    answerSheetId: 'as1',
    subject: 'Operating Systems',
    examName: 'End Semester Examination',
    questionNumber: 3,
    subQuestionNumber: 'a',
    grievanceText: 'I believe my solution for the process scheduling question deserves more marks. I have implemented all scheduling algorithms (FCFS, SJF, Round Robin) correctly with proper time complexity analysis.',
    status: 'pending',
    teacherId: 'teacher1',
    teacherName: 'Dr. Kailas Devadkar',
    submissionDate: new Date('2024-01-16')
  },
  {
    id: 'g2',
    studentId: 'student1',
    studentName: 'Mahir Shah',
    answerSheetId: 'as2',
    subject: 'Database Management Systems',
    examName: 'University Examination',
    questionNumber: 5,
    subQuestionNumber: 'b',
    grievanceText: 'The SQL query I wrote for the normalization problem should produce the correct result. I have properly applied 3NF rules and the query syntax is correct as per MySQL standards.',
    status: 'under_review',
    teacherId: 'teacher1',
    teacherName: 'Dr. Kailas Devadkar',
    submissionDate: new Date('2024-01-21')
  },
  {
    id: 'g3',
    studentId: 'student2',
    studentName: 'Kavya Shah',
    answerSheetId: 'as3',
    subject: 'Computer Networks',
    examName: 'Internal Assessment 2',
    questionNumber: 2,
    subQuestionNumber: 'a',
    grievanceText: 'I believe my OSI model explanation and TCP/IP protocol analysis is correct and should receive full marks. I have covered all layers with proper examples.',
    status: 'resolved',
    teacherId: 'teacher2',
    teacherName: 'Prof. Rajesh Patel',
    submissionDate: new Date('2024-01-19'),
    teacherResponse: 'After reviewing your answer, I agree that your explanation of the OSI model and protocol analysis is comprehensive. Your marks have been updated to reflect the correct score.',
    responseDate: new Date('2024-01-22')
  }
];