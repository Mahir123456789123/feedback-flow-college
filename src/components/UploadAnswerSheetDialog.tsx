
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface UploadAnswerSheetDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock students data - in real app this would come from your database
const mockStudents = [
  { id: 'student1', name: 'Mahir Shah', email: 'mahir.shah@student.spit.ac.in', department: 'Computer Engineering' },
  { id: 'student2', name: 'Kavya Shah', email: 'kavya.shah@student.spit.ac.in', department: 'Information Technology' },
  { id: 'student3', name: 'Rahul Patel', email: 'rahul.patel@student.spit.ac.in', department: 'Computer Engineering' },
  { id: 'student4', name: 'Priya Singh', email: 'priya.singh@student.spit.ac.in', department: 'Electronics Engineering' },
];

const mockTeachers = [
  { id: 'teacher1', name: 'Dr. Kailas Devadkar', department: 'Computer Engineering' },
  { id: 'teacher2', name: 'Prof. Rajesh Patel', department: 'Information Technology' },
  { id: 'teacher3', name: 'Dr. Sharma', department: 'Computer Engineering' },
];

const UploadAnswerSheetDialog = ({ isOpen, onOpenChange }: UploadAnswerSheetDialogProps) => {
  const [formData, setFormData] = useState({
    studentId: '',
    subject: '',
    examName: '',
    totalMarks: '',
    obtainedMarks: '',
    teacherId: '',
    semester: '',
    department: '',
    file: null as File | null
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }
      setFormData(prev => ({ ...prev, file }));
    }
  };

  const handleStudentChange = (studentId: string) => {
    const student = mockStudents.find(s => s.id === studentId);
    if (student) {
      setFormData(prev => ({
        ...prev,
        studentId,
        department: student.department
      }));
    }
  };

  const handleSubmit = () => {
    if (!formData.studentId || !formData.subject || !formData.examName || 
        !formData.totalMarks || !formData.obtainedMarks || !formData.teacherId || 
        !formData.semester || !formData.file) {
      toast.error('Please fill in all fields and select a file');
      return;
    }

    if (parseInt(formData.obtainedMarks) > parseInt(formData.totalMarks)) {
      toast.error('Obtained marks cannot be greater than total marks');
      return;
    }

    // In a real app, you would upload the file and save the data to your database
    console.log('Uploading answer sheet:', formData);
    
    toast.success('Answer sheet uploaded successfully');
    setFormData({
      studentId: '',
      subject: '',
      examName: '',
      totalMarks: '',
      obtainedMarks: '',
      teacherId: '',
      semester: '',
      department: '',
      file: null
    });
    onOpenChange(false);
  };

  const selectedStudent = mockStudents.find(s => s.id === formData.studentId);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Answer Sheet</DialogTitle>
          <DialogDescription>
            Select a student and upload their answer sheet with evaluation details
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="student">Select Student</Label>
              <Select value={formData.studentId} onValueChange={handleStudentChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a student" />
                </SelectTrigger>
                <SelectContent>
                  {mockStudents.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} - {student.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedStudent && (
                <p className="text-sm text-muted-foreground">
                  Email: {selectedStudent.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                readOnly
                className="bg-muted"
                placeholder="Auto-filled based on student"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="e.g., Operating Systems"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="examName">Exam Name</Label>
              <Input
                id="examName"
                value={formData.examName}
                onChange={(e) => setFormData(prev => ({ ...prev, examName: e.target.value }))}
                placeholder="e.g., End Semester Examination"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="semester">Semester</Label>
              <Select value={formData.semester} onValueChange={(value) => setFormData(prev => ({ ...prev, semester: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Semester 1</SelectItem>
                  <SelectItem value="2">Semester 2</SelectItem>
                  <SelectItem value="3">Semester 3</SelectItem>
                  <SelectItem value="4">Semester 4</SelectItem>
                  <SelectItem value="5">Semester 5</SelectItem>
                  <SelectItem value="6">Semester 6</SelectItem>
                  <SelectItem value="7">Semester 7</SelectItem>
                  <SelectItem value="8">Semester 8</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalMarks">Total Marks</Label>
              <Input
                id="totalMarks"
                type="number"
                value={formData.totalMarks}
                onChange={(e) => setFormData(prev => ({ ...prev, totalMarks: e.target.value }))}
                placeholder="e.g., 100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="obtainedMarks">Obtained Marks</Label>
              <Input
                id="obtainedMarks"
                type="number"
                value={formData.obtainedMarks}
                onChange={(e) => setFormData(prev => ({ ...prev, obtainedMarks: e.target.value }))}
                placeholder="e.g., 85"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="teacher">Evaluating Teacher</Label>
            <Select value={formData.teacherId} onValueChange={(value) => setFormData(prev => ({ ...prev, teacherId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select evaluating teacher" />
              </SelectTrigger>
              <SelectContent>
                {mockTeachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.name} - {teacher.department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Answer Sheet (PDF)</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="file"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            {formData.file && (
              <p className="text-sm text-muted-foreground">
                Selected: {formData.file.name}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Answer Sheet
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadAnswerSheetDialog;
