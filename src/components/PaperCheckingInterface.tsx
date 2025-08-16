import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  ChevronLeft, 
  Check, 
  X, 
  Circle, 
  Highlighter, 
  Pen, 
  Eraser, 
  Save, 
  ArrowRight,
  Trophy,
  CheckCircle,
  Clock
} from 'lucide-react';
import { mockExams, mockAnswerSheets, mockUsers } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';

interface Question {
  id: number;
  questionNumber: string;
  maxMarks: number;
  givenMarks: number | null;
  visited: boolean;
}

interface AnnotationTool {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

const annotationTools: AnnotationTool[] = [
  { id: 'check', name: 'Checkmark', icon: <Check className="w-4 h-4" />, color: 'text-success' },
  { id: 'cross', name: 'Cross', icon: <X className="w-4 h-4" />, color: 'text-destructive' },
  { id: 'circle', name: 'Circle', icon: <Circle className="w-4 h-4" />, color: 'text-primary' },
  { id: 'highlight', name: 'Highlight', icon: <Highlighter className="w-4 h-4" />, color: 'text-warning' },
  { id: 'pen', name: 'Pen', icon: <Pen className="w-4 h-4" />, color: 'text-muted-foreground' },
  { id: 'eraser', name: 'Eraser', icon: <Eraser className="w-4 h-4" />, color: 'text-destructive' },
];

const marksOptions = [0, 2.5, 5, 7.5, 10];

const PaperCheckingInterface = () => {
  const { user } = useAuth();
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const [selectedTool, setSelectedTool] = useState<string>('check');
  const [showAnnotationDialog, setShowAnnotationDialog] = useState(false);
  const [annotationPosition, setAnnotationPosition] = useState({ x: 0, y: 0 });
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);

  // Mock questions for the selected paper
  const [questions, setQuestions] = useState<Question[]>([
    { id: 1, questionNumber: 'Q1', maxMarks: 10, givenMarks: null, visited: false },
    { id: 2, questionNumber: 'Q2', maxMarks: 15, givenMarks: null, visited: false },
    { id: 3, questionNumber: 'Q3', maxMarks: 20, givenMarks: null, visited: false },
    { id: 4, questionNumber: 'Q4', maxMarks: 25, givenMarks: null, visited: false },
    { id: 5, questionNumber: 'Q5', maxMarks: 30, givenMarks: null, visited: false },
  ]);

  const availableExams = mockExams.filter(exam => 
    exam.assignedTeachers.some(teacher => teacher.teacherId === user?.id)
  );

  const studentsForExam = selectedExam ? 
    mockAnswerSheets.filter(sheet => sheet.examName === selectedExam) : [];

  const selectedStudentData = studentsForExam.find(s => s.id === selectedStudent);

  const completedQuestions = questions.filter(q => q.visited).length;
  const totalQuestions = questions.length;
  const progressPercentage = (completedQuestions / totalQuestions) * 100;

  const handleQuestionSelect = (questionId: number) => {
    setSelectedQuestion(questionId);
  };

  const handleMarksUpdate = (questionId: number, marks: number) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? { ...q, givenMarks: marks }
        : q
    ));
    
    // Auto-save simulation
    setIsAutoSaving(true);
    setTimeout(() => {
      setIsAutoSaving(false);
      toast.success("Saved!", { duration: 1000 });
    }, 800);
  };

  const handlePaperClick = (event: React.MouseEvent) => {
    if (!selectedQuestion) {
      toast.error("Please select a question first");
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    setAnnotationPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    });
    setShowAnnotationDialog(true);
  };

  const handleAnnotation = (toolId: string) => {
    if (!selectedQuestion) return;

    // Mark question as visited
    setQuestions(prev => prev.map(q => 
      q.id === selectedQuestion 
        ? { ...q, visited: true }
        : q
    ));

    toast.success(`Annotation added with ${annotationTools.find(t => t.id === toolId)?.name}`);
    setShowAnnotationDialog(false);

    // Check if all questions are completed
    const updatedQuestions = questions.map(q => 
      q.id === selectedQuestion ? { ...q, visited: true } : q
    );
    
    if (updatedQuestions.every(q => q.visited)) {
      setTimeout(() => setShowCompletionDialog(true), 500);
    }
  };

  const handleSubmitPaper = () => {
    toast.success("Paper graded and submitted successfully!");
    setShowCompletionDialog(false);
    // Reset to student selection
    setSelectedStudent('');
    setQuestions(prev => prev.map(q => ({ ...q, givenMarks: null, visited: false })));
  };

  const goBackToStudents = () => {
    setSelectedStudent('');
    setSelectedQuestion(null);
    setQuestions(prev => prev.map(q => ({ ...q, givenMarks: null, visited: false })));
  };

  if (!selectedExam) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Paper Checking</CardTitle>
            <p className="text-muted-foreground">Select an exam session to start checking papers</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Exam Session</label>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Choose an exam session" />
                </SelectTrigger>
                <SelectContent>
                  {availableExams.map(exam => (
                    <SelectItem key={exam.id} value={exam.name}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{exam.name}</span>
                        <span className="text-sm text-muted-foreground">{exam.subject} - {exam.department}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!selectedStudent) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setSelectedExam('')}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Exam Selection
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{selectedExam}</h1>
            <p className="text-muted-foreground">Select a student's paper to check</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {studentsForExam.map((student) => (
            <Card key={student.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
              <CardContent className="p-6" onClick={() => setSelectedStudent(student.id)}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-primary">
                        {student.studentName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {student.studentName}
                      </h3>
                      <p className="text-sm text-muted-foreground">{student.department}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant="outline" className="text-warning border-warning/20 bg-warning/10">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending Review
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Semester:</span>
                    <span className="font-medium">{student.semester}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-screen flex flex-col bg-background">
        {/* Header */}
        <div className="border-b bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={goBackToStudents}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Students
              </Button>
              <div>
                <h1 className="text-xl font-bold">{selectedStudentData?.studentName}</h1>
                <p className="text-sm text-muted-foreground">
                  {selectedExam} • {selectedStudentData?.subject}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Progress Indicator */}
              <div className="flex items-center gap-3">
                <div className="text-sm text-muted-foreground">
                  Question {completedQuestions} of {totalQuestions} completed
                </div>
                <div className="w-32">
                  <Progress value={progressPercentage} className="h-2" />
                </div>
                {isAutoSaving && (
                  <div className="flex items-center gap-2 text-sm text-success">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                    Saving...
                  </div>
                )}
              </div>
              
              <Button onClick={handleSubmitPaper} disabled={completedQuestions < totalQuestions}>
                <Save className="w-4 h-4 mr-2" />
                Submit Paper
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Annotation Tools */}
          <div className="w-16 border-r bg-card p-2 space-y-2">
            {annotationTools.map((tool) => (
              <Button
                key={tool.id}
                variant={selectedTool === tool.id ? "default" : "ghost"}
                size="icon"
                className="w-12 h-12"
                onClick={() => setSelectedTool(tool.id)}
                title={tool.name}
              >
                <div className={tool.color}>{tool.icon}</div>
              </Button>
            ))}
          </div>

          {/* Center Panel - Answer Sheet */}
          <div className="flex-1 p-6 overflow-auto">
            <div className="max-w-4xl mx-auto">
              <Card className="min-h-[800px] cursor-crosshair" onClick={handlePaperClick}>
                <CardHeader>
                  <div className="text-center space-y-2">
                    <h2 className="text-xl font-bold">Answer Sheet</h2>
                    <p className="text-muted-foreground">
                      {selectedStudentData?.studentName} • {selectedStudentData?.subject}
                    </p>
                    {selectedQuestion && (
                      <Badge variant="outline" className="text-primary border-primary/20 bg-primary/10">
                        Question {questions.find(q => q.id === selectedQuestion)?.questionNumber} Selected
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Mock answer sheet content */}
                  {questions.map((question) => (
                    <div key={question.id} className="space-y-4 p-4 border rounded-lg">
                      <h3 className="font-semibold text-lg">{question.questionNumber}</h3>
                      <div className="space-y-3">
                        <p className="text-muted-foreground">
                          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
                          incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis 
                          nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                        </p>
                        <div className="h-32 bg-muted/20 rounded border-dashed border-2 flex items-center justify-center">
                          <p className="text-muted-foreground">Student's handwritten answer</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Panel - Questions List */}
          <div className="w-80 border-l bg-card">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Questions</h3>
              <p className="text-sm text-muted-foreground">Click to select, then click on the paper to annotate</p>
            </div>
            
            <div className="p-4 space-y-3 overflow-auto">
              {questions.map((question) => (
                <Card 
                  key={question.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedQuestion === question.id 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : ''
                  }`}
                  onClick={() => handleQuestionSelect(question.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{question.questionNumber}</span>
                        {question.visited && (
                          <CheckCircle className="w-4 h-4 text-success" />
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Out of {question.maxMarks}.0
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Given Marks</label>
                      <Select 
                        value={question.givenMarks?.toString() || ""} 
                        onValueChange={(value) => handleMarksUpdate(question.id, parseFloat(value))}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select marks" />
                        </SelectTrigger>
                        <SelectContent>
                          {marksOptions.map((mark) => (
                            <SelectItem key={mark} value={mark.toString()}>
                              {mark}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Visited Status</span>
                      <div className="flex items-center gap-2">
                        {question.visited ? (
                          <div className="flex items-center gap-1 text-success">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">Done</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Circle className="w-4 h-4" />
                            <span className="text-sm">Pending</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Annotation Dialog */}
      <Dialog open={showAnnotationDialog} onOpenChange={setShowAnnotationDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Annotation</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3 p-4">
            {annotationTools.map((tool) => (
              <Button
                key={tool.id}
                variant="outline"
                className="h-16 flex flex-col gap-2 hover:bg-primary/5"
                onClick={() => handleAnnotation(tool.id)}
              >
                <div className={tool.color}>{tool.icon}</div>
                <span className="text-xs">{tool.name}</span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Completion Dialog */}
      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
                <Trophy className="w-8 h-8 text-success" />
              </div>
            </div>
            <DialogTitle className="text-xl">Paper Complete!</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              You have successfully checked all questions for {selectedStudentData?.studentName}'s paper.
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => setShowCompletionDialog(false)}>
                Review Again
              </Button>
              <Button onClick={handleSubmitPaper}>
                Submit Paper
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PaperCheckingInterface;