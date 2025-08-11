
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Upload, X, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Exam, ExamTeacherAssignment } from '@/types';

interface AddExamDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const mockTeachers = [
  { id: 'teacher1', name: 'Dr. Kailas Devadkar', department: 'Computer Engineering' },
  { id: 'teacher2', name: 'Prof. Rajesh Patel', department: 'Information Technology' },
  { id: 'teacher3', name: 'Dr. Priya Sharma', department: 'Computer Engineering' },
  { id: 'teacher4', name: 'Prof. Amit Verma', department: 'Electronics Engineering' },
];

const AddExamDialog = ({ isOpen, onOpenChange }: AddExamDialogProps) => {
  const [examData, setExamData] = useState({
    name: '',
    subject: '',
    department: '',
    semester: '',
    date: '',
    duration: '',
    totalMarks: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [teacherAssignments, setTeacherAssignments] = useState<ExamTeacherAssignment[]>([]);
  const [currentTeacher, setCurrentTeacher] = useState('');
  const [currentQuestions, setCurrentQuestions] = useState('');
  const [currentMarks, setCurrentMarks] = useState('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        setSelectedFile(file);
        toast.success('Question paper uploaded successfully');
      } else {
        toast.error('Please upload a PDF file');
      }
    }
  };

  const addTeacherAssignment = () => {
    if (!currentTeacher || !currentQuestions || !currentMarks) {
      toast.error('Please fill in all teacher assignment fields');
      return;
    }

    const teacher = mockTeachers.find(t => t.id === currentTeacher);
    if (!teacher) return;

    const questions = currentQuestions.split(',').map(q => parseInt(q.trim())).filter(q => !isNaN(q));
    const marksPerQuestion: Record<number, number> = {};
    
    const marksArray = currentMarks.split(',').map(m => parseInt(m.trim())).filter(m => !isNaN(m));
    
    if (questions.length !== marksArray.length) {
      toast.error('Number of questions must match number of marks');
      return;
    }

    questions.forEach((q, index) => {
      marksPerQuestion[q] = marksArray[index];
    });

    const newAssignment: ExamTeacherAssignment = {
      teacherId: teacher.id,
      teacherName: teacher.name,
      assignedQuestions: questions,
      marksPerQuestion
    };

    setTeacherAssignments([...teacherAssignments, newAssignment]);
    setCurrentTeacher('');
    setCurrentQuestions('');
    setCurrentMarks('');
    toast.success(`${teacher.name} assigned to questions ${questions.join(', ')}`);
  };

  const removeTeacherAssignment = (index: number) => {
    setTeacherAssignments(teacherAssignments.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!examData.name || !examData.subject || !examData.department || !examData.semester || 
        !examData.date || !examData.duration || !examData.totalMarks) {
      toast.error('Please fill in all exam details');
      return;
    }

    if (teacherAssignments.length === 0) {
      toast.error('Please assign at least one teacher');
      return;
    }

    const newExam: Exam = {
      id: `exam_${Date.now()}`,
      name: examData.name,
      subject: examData.subject,
      department: examData.department,
      semester: examData.semester,
      date: new Date(examData.date),
      duration: parseInt(examData.duration),
      totalMarks: parseInt(examData.totalMarks),
      questionPaperUrl: selectedFile ? URL.createObjectURL(selectedFile) : undefined,
      assignedTeachers: teacherAssignments,
      createdAt: new Date(),
      createdBy: 'admin'
    };

    console.log('New exam created:', newExam);
    toast.success('Exam created successfully');
    
    // Reset form
    setExamData({
      name: '',
      subject: '',
      department: '',
      semester: '',
      date: '',
      duration: '',
      totalMarks: '',
    });
    setSelectedFile(null);
    setTeacherAssignments([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Exam</DialogTitle>
          <DialogDescription>
            Set up a new exam with teacher assignments and question paper
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Exam Details */}
          <Card>
            <CardHeader>
              <CardTitle>Exam Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="examName">Exam Name</Label>
                  <Input
                    id="examName"
                    value={examData.name}
                    onChange={(e) => setExamData({ ...examData, name: e.target.value })}
                    placeholder="End Semester Examination"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={examData.subject}
                    onChange={(e) => setExamData({ ...examData, subject: e.target.value })}
                    placeholder="Operating Systems"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select value={examData.department} onValueChange={(value) => setExamData({ ...examData, department: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Computer Engineering">Computer Engineering</SelectItem>
                      <SelectItem value="Information Technology">Information Technology</SelectItem>
                      <SelectItem value="Electronics Engineering">Electronics Engineering</SelectItem>
                      <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="semester">Semester</Label>
                  <Input
                    id="semester"
                    value={examData.semester}
                    onChange={(e) => setExamData({ ...examData, semester: e.target.value })}
                    placeholder="Semester 3 - AY 2024-25"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="examDate">Exam Date</Label>
                  <Input
                    id="examDate"
                    type="date"
                    value={examData.date}
                    onChange={(e) => setExamData({ ...examData, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={examData.duration}
                    onChange={(e) => setExamData({ ...examData, duration: e.target.value })}
                    placeholder="180"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalMarks">Total Marks</Label>
                  <Input
                    id="totalMarks"
                    type="number"
                    value={examData.totalMarks}
                    onChange={(e) => setExamData({ ...examData, totalMarks: e.target.value })}
                    placeholder="100"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Paper Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Question Paper</CardTitle>
              <CardDescription>Upload the question paper (PDF only)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Label htmlFor="questionPaper" className="cursor-pointer">
                    <div className="flex items-center space-x-2 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-md border border-blue-200">
                      <Upload className="h-4 w-4" />
                      <span>Upload Question Paper</span>
                    </div>
                  </Label>
                  <Input
                    id="questionPaper"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                {selectedFile && (
                  <div className="flex items-center space-x-2 p-2 bg-green-50 border border-green-200 rounded-md">
                    <FileText className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700">{selectedFile.name}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Teacher Assignments */}
          <Card>
            <CardHeader>
              <CardTitle>Teacher Assignments</CardTitle>
              <CardDescription>Assign teachers to specific question numbers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Teacher</Label>
                  <Select value={currentTeacher} onValueChange={setCurrentTeacher}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockTeachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Question Numbers</Label>
                  <Input
                    value={currentQuestions}
                    onChange={(e) => setCurrentQuestions(e.target.value)}
                    placeholder="1,2,3"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Marks per Question</Label>
                  <Input
                    value={currentMarks}
                    onChange={(e) => setCurrentMarks(e.target.value)}
                    placeholder="20,15,25"
                  />
                </div>
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button onClick={addTeacherAssignment} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>

              {/* Current Assignments */}
              {teacherAssignments.length > 0 && (
                <div className="space-y-2">
                  <Label>Current Assignments:</Label>
                  <div className="space-y-2">
                    {teacherAssignments.map((assignment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div>
                          <span className="font-medium">{assignment.teacherName}</span>
                          <div className="text-sm text-gray-600">
                            Questions: {assignment.assignedQuestions.join(', ')} 
                            {' | '}
                            Marks: {assignment.assignedQuestions.map(q => assignment.marksPerQuestion[q]).join(', ')}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeTeacherAssignment(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Create Exam
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddExamDialog;
