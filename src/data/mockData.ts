import { AnswerSheet, Grievance, Exam, User } from '@/types';

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
  },
  {
    id: 'as4',
    studentId: 'student3',
    studentName: 'Ravi Sharma',
    subject: 'Operating Systems',
    examName: 'End Semester Examination',
    totalMarks: 100,
    obtainedMarks: 0, // Not graded yet
    teacherId: 'teacher1',
    teacherName: 'Dr. Kailas Devadkar',
    uploadDate: new Date('2024-01-15'),
    fileUrl: '/mock-answer-sheet-4.pdf',
    semester: 'Semester 3 - AY 2024-25',
    department: 'Computer Engineering'
  },
  {
    id: 'as5',
    studentId: 'student4',
    studentName: 'Anita Verma',
    subject: 'Operating Systems',
    examName: 'End Semester Examination',
    totalMarks: 100,
    obtainedMarks: 0, // Not graded yet
    teacherId: 'teacher1',
    teacherName: 'Dr. Kailas Devadkar',
    uploadDate: new Date('2024-01-15'),
    fileUrl: '/mock-answer-sheet-5.pdf',
    semester: 'Semester 3 - AY 2024-25',
    department: 'Computer Engineering'
  },
  {
    id: 'as6',
    studentId: 'student5',
    studentName: 'Priya Patel',
    subject: 'Operating Systems',
    examName: 'End Semester Examination',
    totalMarks: 100,
    obtainedMarks: 0, // Not graded yet
    teacherId: 'teacher1',
    teacherName: 'Dr. Kailas Devadkar',
    uploadDate: new Date('2024-01-15'),
    fileUrl: '/mock-answer-sheet-6.pdf',
    semester: 'Semester 3 - AY 2024-25',
    department: 'Computer Engineering'
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
    submissionDate: new Date('2024-01-16'),
    currentMarks: 6
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
    submissionDate: new Date('2024-01-21'),
    currentMarks: 4
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
    responseDate: new Date('2024-01-22'),
    currentMarks: 7,
    updatedMarks: 10
  },
  {
    id: 'g4',
    studentId: 'student3',
    studentName: 'Ravi Sharma',
    answerSheetId: 'as4',
    subject: 'Operating Systems',
    examName: 'End Semester Examination',
    questionNumber: 4,
    subQuestionNumber: 'c',
    grievanceText: 'My memory management solution covers all aspects including segmentation, paging, and virtual memory. I have provided diagrams and calculations for all parts. I believe this deserves higher marks.',
    status: 'pending',
    teacherId: 'teacher1',
    teacherName: 'Dr. Kailas Devadkar',
    submissionDate: new Date('2024-01-17'),
    currentMarks: 5
  },
  {
    id: 'g5',
    studentId: 'student4',
    studentName: 'Anita Verma',
    answerSheetId: 'as5',
    subject: 'Operating Systems',
    examName: 'End Semester Examination',
    questionNumber: 1,
    subQuestionNumber: 'b',
    grievanceText: 'I have correctly explained the differences between kernel mode and user mode with proper examples. My answer also includes system call mechanisms and privilege levels.',
    status: 'pending',
    teacherId: 'teacher1',
    teacherName: 'Dr. Kailas Devadkar',
    submissionDate: new Date('2024-01-18'),
    currentMarks: 3
  },
  {
    id: 'g6',
    studentId: 'student5',
    studentName: 'Priya Patel',
    answerSheetId: 'as6',
    subject: 'Operating Systems',
    examName: 'End Semester Examination',
    questionNumber: 6,
    subQuestionNumber: 'a',
    grievanceText: 'My deadlock prevention and avoidance algorithms are implemented correctly with proper pseudo-code. I have also explained banker\'s algorithm with a complete example.',
    status: 'pending',
    teacherId: 'teacher1',
    teacherName: 'Dr. Kailas Devadkar',
    submissionDate: new Date('2024-01-19'),
    currentMarks: 4
  },
  {
    id: 'g7',
    studentId: 'student6',
    studentName: 'Amit Kumar',
    answerSheetId: 'as7',
    subject: 'Operating Systems',
    examName: 'End Semester Examination',
    questionNumber: 2,
    subQuestionNumber: 'd',
    grievanceText: 'I have provided a comprehensive solution for file system implementation including inode structure, directory management, and allocation methods. This should receive full marks.',
    status: 'pending',
    teacherId: 'teacher1',
    teacherName: 'Dr. Kailas Devadkar',
    submissionDate: new Date('2024-01-20'),
    currentMarks: 6
  },
  {
    id: 'g8',
    studentId: 'student7',
    studentName: 'Sneha Joshi',
    answerSheetId: 'as8',
    subject: 'Operating Systems',
    examName: 'End Semester Examination',
    questionNumber: 5,
    subQuestionNumber: 'b',
    grievanceText: 'My solution for process synchronization covers all synchronization primitives (semaphores, mutex, monitors) with proper implementation and examples. The critical section problem is solved correctly.',
    status: 'resolved',
    teacherId: 'teacher1',
    teacherName: 'Dr. Kailas Devadkar',
    submissionDate: new Date('2024-01-21'),
    teacherResponse: 'Your solution demonstrates excellent understanding of synchronization concepts. However, the mutex implementation had minor syntax errors which were considered during grading. Marks have been updated accordingly.',
    responseDate: new Date('2024-01-24'),
    currentMarks: 7,
    updatedMarks: 9
  }
];

export const mockExams: Exam[] = [
  {
    id: 'exam1',
    name: 'End Semester Examination',
    subject: 'Operating Systems',
    department: 'Computer Engineering',
    semester: 'Semester 3 - AY 2024-25',
    date: new Date('2024-01-15'),
    duration: 180,
    totalMarks: 100,
    questionPaperUrl: '/mock-question-paper-os.pdf',
    assignedTeachers: [
      {
        teacherId: 'teacher1',
        teacherName: 'Dr. Kailas Devadkar',
        assignedQuestions: [1, 2, 3],
        marksPerQuestion: { 1: 15, 2: 20, 3: 15 }
      }
    ],
    createdAt: new Date('2024-01-01'),
    createdBy: 'admin1'
  },
  {
    id: 'exam2',
    name: 'University Examination',
    subject: 'Database Management Systems',
    department: 'Computer Engineering',
    semester: 'Semester 3 - AY 2024-25',
    date: new Date('2024-01-20'),
    duration: 180,
    totalMarks: 100,
    questionPaperUrl: '/mock-question-paper-dbms.pdf',
    assignedTeachers: [
      {
        teacherId: 'teacher1',
        teacherName: 'Dr. Kailas Devadkar',
        assignedQuestions: [4, 5, 6],
        marksPerQuestion: { 4: 25, 5: 15, 6: 10 }
      }
    ],
    createdAt: new Date('2024-01-02'),
    createdBy: 'admin1'
  },
  {
    id: 'exam3',
    name: 'Internal Assessment 2',
    subject: 'Computer Networks',
    department: 'Information Technology',
    semester: 'Semester 5 - AY 2024-25',
    date: new Date('2024-01-18'),
    duration: 120,
    totalMarks: 100,
    questionPaperUrl: '/mock-question-paper-cn.pdf',
    assignedTeachers: [
      {
        teacherId: 'teacher2',
        teacherName: 'Prof. Rajesh Patel',
        assignedQuestions: [1, 2, 3, 4, 5],
        marksPerQuestion: { 1: 20, 2: 20, 3: 20, 4: 20, 5: 20 }
      }
    ],
    createdAt: new Date('2024-01-03'),
    createdBy: 'admin1'
  }
];

export const mockUsers: User[] = [
  {
    id: 'teacher1',
    name: 'Dr. Kailas Devadkar',
    email: 'kailas.devadkar@example.com',
    role: 'teacher',
    department: 'Computer Engineering'
  },
  {
    id: 'teacher2',
    name: 'Prof. Rajesh Patel',
    email: 'rajesh.patel@example.com',
    role: 'teacher',
    department: 'Information Technology'
  },
  {
    id: 'student1',
    name: 'Mahir Shah',
    email: 'mahir.shah@example.com',
    role: 'student',
    department: 'Computer Engineering'
  },
  {
    id: 'student2',
    name: 'Kavya Shah',
    email: 'kavya.shah@example.com',
    role: 'student',
    department: 'Information Technology'
  },
  {
    id: 'student3',
    name: 'Ravi Sharma',
    email: 'ravi.sharma@example.com',
    role: 'student',
    department: 'Computer Engineering'
  },
  {
    id: 'student4',
    name: 'Anita Verma',
    email: 'anita.verma@example.com',
    role: 'student',
    department: 'Computer Engineering'
  },
  {
    id: 'student5',
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
    role: 'student',
    department: 'Computer Engineering'
  },
  {
    id: 'admin1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin'
  }
];