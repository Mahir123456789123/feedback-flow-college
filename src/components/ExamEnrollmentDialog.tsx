import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Upload, X, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface ExamEnrollmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock data for existing exams
const mockExams = [
  {
    id: '1',
    name: 'End Semester Examination',
    subject: 'Operating Systems',
    department: 'Computer Engineering',
    semester: 'Semester 6',
    date: new Date('2024-02-15'),
    totalMarks: 100
  },
  {
    id: '2',
    name: 'Internal Assessment 2',
    subject: 'Database Management',
    department: 'Computer Engineering',
    semester: 'Semester 5',
    date: new Date('2024-02-20'),
    totalMarks: 50
  }
];

// Mock students
const mockStudents = [
  { id: '1', name: 'John Doe', email: 'john@example.com', rollNo: 'CE001' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', rollNo: 'CE002' },
  { id: '3', name: 'Mike Johnson', email: 'mike@example.com', rollNo: 'CE003' },
  { id: '4', name: 'Sarah Wilson', email: 'sarah@example.com', rollNo: 'CE004' }
];

const ExamEnrollmentDialog = ({ isOpen, onOpenChange }: ExamEnrollmentDialogProps) => {
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [enrolledStudents, setEnrolledStudents] = useState<typeof mockStudents>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [answerSheetUploads, setAnswerSheetUploads] = useState<Record<string, File>>({});

  const selectedExam = mockExams.find(exam => exam.id === selectedExamId);
  const availableStudents = mockStudents.filter(
    student => !enrolledStudents.find(enrolled => enrolled.id === student.id)
  );

  const handleAddStudent = () => {
    if (!selectedStudentId) {
      toast.error('Please select a student');
      return;
    }

    const student = mockStudents.find(s => s.id === selectedStudentId);
    if (student) {
      setEnrolledStudents([...enrolledStudents, student]);
      setSelectedStudentId('');
      toast.success(`${student.name} added to exam`);
    }
  };

  const handleRemoveStudent = (studentId: string) => {
    const student = enrolledStudents.find(s => s.id === studentId);
    setEnrolledStudents(enrolledStudents.filter(s => s.id !== studentId));
    
    // Remove answer sheet if uploaded
    if (answerSheetUploads[studentId]) {
      const newUploads = { ...answerSheetUploads };
      delete newUploads[studentId];
      setAnswerSheetUploads(newUploads);
    }
    
    if (student) {
      toast.success(`${student.name} removed from exam`);
    }
  };

  const handleFileUpload = (studentId: string, file: File) => {
    if (file.type !== 'application/pdf') {
      toast.error('Please upload only PDF files');
      return;
    }

    setAnswerSheetUploads({
      ...answerSheetUploads,
      [studentId]: file
    });

    const student = enrolledStudents.find(s => s.id === studentId);
    toast.success(`Answer sheet uploaded for ${student?.name}`);
  };

  const handleSaveEnrollment = () => {
    if (!selectedExamId) {
      toast.error('Please select an exam');
      return;
    }

    if (enrolledStudents.length === 0) {
      toast.error('Please add at least one student');
      return;
    }

    toast.success(`Enrollment saved for ${enrolledStudents.length} students`);
    onOpenChange(false);
  };

  const handleBulkUpload = () => {
    const uploadedCount = Object.keys(answerSheetUploads).length;
    if (uploadedCount === 0) {
      toast.error('No answer sheets uploaded');
      return;
    }

    toast.success(`${uploadedCount} answer sheets uploaded successfully`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Exam Enrollment Management</DialogTitle>
          <DialogDescription>
            Select an exam, enroll students, and upload their answer sheets
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Exam Selection */}
          <div className="space-y-2">
            <Label htmlFor="exam-select">Select Exam</Label>
            <Select value={selectedExamId} onValueChange={setSelectedExamId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an existing exam" />
              </SelectTrigger>
              <SelectContent>
                {mockExams.map((exam) => (
                  <SelectItem key={exam.id} value={exam.id}>
                    {exam.name} - {exam.subject} ({exam.department})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedExam && (
            <Card>
              <CardHeader>
                <CardTitle>Exam Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Subject:</span>
                    <p>{selectedExam.subject}</p>
                  </div>
                  <div>
                    <span className="font-medium">Department:</span>
                    <p>{selectedExam.department}</p>
                  </div>
                  <div>
                    <span className="font-medium">Date:</span>
                    <p>{selectedExam.date.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="font-medium">Total Marks:</span>
                    <p>{selectedExam.totalMarks}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedExamId && (
            <Tabs defaultValue="enrollment" className="space-y-4">
              <TabsList>
                <TabsTrigger value="enrollment">Student Enrollment</TabsTrigger>
                <TabsTrigger value="upload">Answer Sheet Upload</TabsTrigger>
              </TabsList>

              <TabsContent value="enrollment" className="space-y-4">
                {/* Add Students */}
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select student to add" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStudents.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.name} ({student.rollNo}) - {student.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAddStudent}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Student
                  </Button>
                </div>

                {/* Enrolled Students */}
                {enrolledStudents.length > 0 && (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Roll No</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {enrolledStudents.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell>{student.rollNo}</TableCell>
                            <TableCell className="font-medium">{student.name}</TableCell>
                            <TableCell>{student.email}</TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveStudent(student.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                <div className="flex justify-between">
                  <Badge variant="secondary">
                    {enrolledStudents.length} students enrolled
                  </Badge>
                  <Button onClick={handleSaveEnrollment}>
                    Save Enrollment
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="upload" className="space-y-4">
                {enrolledStudents.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Please enroll students first to upload answer sheets
                  </p>
                ) : (
                  <>
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Roll No</TableHead>
                            <TableHead>Student Name</TableHead>
                            <TableHead>Answer Sheet</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {enrolledStudents.map((student) => (
                            <TableRow key={student.id}>
                              <TableCell>{student.rollNo}</TableCell>
                              <TableCell className="font-medium">{student.name}</TableCell>
                              <TableCell>
                                <Input
                                  type="file"
                                  accept=".pdf"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleFileUpload(student.id, file);
                                    }
                                  }}
                                  className="max-w-[200px]"
                                />
                              </TableCell>
                              <TableCell>
                                {answerSheetUploads[student.id] ? (
                                  <Badge className="bg-green-100 text-green-800 border-green-200">
                                    <FileText className="h-3 w-3 mr-1" />
                                    Uploaded
                                  </Badge>
                                ) : (
                                  <Badge variant="outline">Pending</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="flex justify-between items-center">
                      <Badge variant="secondary">
                        {Object.keys(answerSheetUploads).length} of {enrolledStudents.length} uploaded
                      </Badge>
                      <Button onClick={handleBulkUpload}>
                        <Upload className="h-4 w-4 mr-2" />
                        Process All Uploads
                      </Button>
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExamEnrollmentDialog;