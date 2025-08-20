import { useState, useEffect, useRef } from 'react';
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
  Clock,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  FileText,
  Type
} from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import { mockExams, mockAnswerSheets, mockUsers } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

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
  type: 'mark' | 'draw' | 'text';
}

interface Annotation {
  id: string;
  type: string;
  x: number;
  y: number;
  questionId: number;
  content?: string;
}

const annotationTools: AnnotationTool[] = [
  { id: 'check', name: 'Checkmark', icon: <Check className="w-4 h-4" />, color: 'text-success', type: 'mark' },
  { id: 'cross', name: 'Cross', icon: <X className="w-4 h-4" />, color: 'text-destructive', type: 'mark' },
  { id: 'circle', name: 'Circle', icon: <Circle className="w-4 h-4" />, color: 'text-primary', type: 'mark' },
  { id: 'highlight', name: 'Highlight', icon: <Highlighter className="w-4 h-4" />, color: 'text-warning', type: 'draw' },
  { id: 'pen', name: 'Pen', icon: <Pen className="w-4 h-4" />, color: 'text-muted-foreground', type: 'draw' },
  { id: 'text', name: 'Text Comment', icon: <Type className="w-4 h-4" />, color: 'text-info', type: 'text' },
  { id: 'eraser', name: 'Eraser', icon: <Eraser className="w-4 h-4" />, color: 'text-destructive', type: 'draw' },
];

const PaperCheckingInterface = () => {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const [selectedTool, setSelectedTool] = useState<string>('check');
  const [showAnnotationDialog, setShowAnnotationDialog] = useState(false);
  const [annotationPosition, setAnnotationPosition] = useState({ x: 0, y: 0 });
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [pdfScale, setPdfScale] = useState(1.0);
  const [pdfRotation, setPdfRotation] = useState(0);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [textComment, setTextComment] = useState('');
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);

  // Mock PDF file URL - in real app this would come from the answer sheet data
  const pdfFile = '/sample-answer-sheet.pdf'; // Sample PDF

  // Dynamic marks generation based on max marks
  const generateMarksOptions = (maxMarks: number) => {
    const options = [];
    for (let i = 0; i <= maxMarks; i += 0.5) {
      options.push(i);
    }
    return options;
  };

  // Mock questions with dynamic marks
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

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

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

  const handlePdfClick = (event: React.MouseEvent) => {
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

    const tool = annotationTools.find(t => t.id === toolId);
    if (!tool) return;

    if (tool.type === 'text') {
      // For text annotations, create with comment
      const newAnnotation: Annotation = {
        id: Math.random().toString(36).substring(7),
        type: toolId,
        x: annotationPosition.x,
        y: annotationPosition.y,
        questionId: selectedQuestion,
        content: textComment
      };
      setAnnotations(prev => [...prev, newAnnotation]);
      setTextComment('');
    } else {
      // For other annotations
      const newAnnotation: Annotation = {
        id: Math.random().toString(36).substring(7),
        type: toolId,
        x: annotationPosition.x,
        y: annotationPosition.y,
        questionId: selectedQuestion
      };
      setAnnotations(prev => [...prev, newAnnotation]);
    }

    // Mark question as visited
    setQuestions(prev => prev.map(q => 
      q.id === selectedQuestion 
        ? { ...q, visited: true }
        : q
    ));

    toast.success(`Annotation added with ${tool.name}`);
    setShowAnnotationDialog(false);

    // Check if all questions are completed
    const updatedQuestions = questions.map(q => 
      q.id === selectedQuestion ? { ...q, visited: true } : q
    );
    
    if (updatedQuestions.every(q => q.visited && q.givenMarks !== null)) {
      setTimeout(() => setShowCompletionDialog(true), 500);
    }
  };

  const handleSubmitPaper = () => {
    const totalMarks = questions.reduce((sum, q) => sum + (q.givenMarks || 0), 0);
    const maxTotalMarks = questions.reduce((sum, q) => sum + q.maxMarks, 0);
    
    toast.success(
      <div className="space-y-2">
        <p className="font-semibold">Paper graded successfully!</p>
        <p>Total: {totalMarks}/{maxTotalMarks} marks</p>
      </div>
    );
    setShowCompletionDialog(false);
    
    // Reset to student selection
    setSelectedStudent('');
    setQuestions(prev => prev.map(q => ({ ...q, givenMarks: null, visited: false })));
    setAnnotations([]);
  };

  const goBackToStudents = () => {
    setSelectedStudent('');
    setSelectedQuestion(null);
    setQuestions(prev => prev.map(q => ({ ...q, givenMarks: null, visited: false })));
    setAnnotations([]);
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setPdfScale(prev => {
      const newScale = direction === 'in' ? prev * 1.2 : prev / 1.2;
      return Math.max(0.5, Math.min(3.0, newScale));
    });
  };

  const handleRotate = () => {
    setPdfRotation(prev => (prev + 90) % 360);
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
                      <FileText className="w-3 h-3 mr-1" />
                      PDF Ready
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
                  {selectedExam} • {selectedStudentData?.subject} • PDF Annotation Mode
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* PDF Controls */}
              <div className="flex items-center gap-2 border rounded-lg p-2">
                <Button variant="ghost" size="sm" onClick={() => handleZoom('out')} title="Zoom Out">
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm font-mono min-w-[3rem] text-center">
                  {Math.round(pdfScale * 100)}%
                </span>
                <Button variant="ghost" size="sm" onClick={() => handleZoom('in')} title="Zoom In">
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <Button variant="ghost" size="sm" onClick={handleRotate} title="Rotate">
                  <RotateCw className="w-4 h-4" />
                </Button>
              </div>

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
              
              <Button 
                onClick={handleSubmitPaper} 
                disabled={!questions.every(q => q.visited && q.givenMarks !== null)}
                className="animate-pulse"
              >
                <Save className="w-4 h-4 mr-2" />
                Submit Paper
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Annotation Tools */}
          <div className="w-20 border-r bg-card p-2 space-y-2">
            <div className="text-xs text-center text-muted-foreground mb-2 font-medium">Tools</div>
            {annotationTools.map((tool) => (
              <Button
                key={tool.id}
                variant={selectedTool === tool.id ? "default" : "ghost"}
                size="icon"
                className="w-16 h-16 flex flex-col gap-1"
                onClick={() => setSelectedTool(tool.id)}
                title={tool.name}
              >
                <div className={tool.color}>{tool.icon}</div>
                <span className="text-xs">{tool.name.split(' ')[0]}</span>
              </Button>
            ))}
          </div>

          {/* Center Panel - PDF Viewer */}
          <div className="flex-1 p-6 overflow-auto bg-muted/30">
            <div className="max-w-4xl mx-auto">
              <Card className="relative overflow-hidden">
                <CardHeader className="text-center">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-primary border-primary/20 bg-primary/10">
                      <FileText className="w-4 h-4 mr-2" />
                      PDF Mode
                    </Badge>
                    {selectedQuestion && (
                      <Badge variant="outline" className="text-success border-success/20 bg-success/10">
                        Question {questions.find(q => q.id === selectedQuestion)?.questionNumber} Selected
                      </Badge>
                    )}
                    <div className="text-sm text-muted-foreground">
                      Page {pageNumber} of {numPages || 1}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div 
                    className="relative cursor-crosshair bg-white border"
                    onClick={handlePdfClick}
                  >
                    {/* PDF Viewer */}
                    <div className="pdf-viewer-container">
                      <Document
                        file={pdfFile}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={
                          <div className="flex items-center justify-center h-[800px] bg-gradient-to-b from-slate-50 to-slate-100">
                            <div className="text-center space-y-4">
                              <FileText className="w-16 h-16 mx-auto text-muted-foreground animate-pulse" />
                              <div className="space-y-2">
                                <h3 className="text-lg font-semibold">Loading PDF...</h3>
                                <p className="text-muted-foreground">Please wait while the answer sheet loads</p>
                              </div>
                            </div>
                          </div>
                        }
                        error={
                          <div className="flex items-center justify-center h-[800px] bg-gradient-to-b from-red-50 to-red-100">
                            <div className="text-center space-y-4">
                              <FileText className="w-16 h-16 mx-auto text-destructive" />
                              <div className="space-y-2">
                                <h3 className="text-lg font-semibold">Error Loading PDF</h3>
                                <p className="text-muted-foreground">Unable to load the answer sheet</p>
                              </div>
                            </div>
                          </div>
                        }
                      >
                        <Page
                          pageNumber={pageNumber}
                          scale={pdfScale}
                          rotate={pdfRotation}
                          className="mx-auto"
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                        />
                      </Document>
                    </div>
                    
                    {/* Render annotations */}
                    {annotations.map((annotation) => (
                      <div
                        key={annotation.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ 
                          left: annotation.x, 
                          top: annotation.y 
                        }}
                      >
                        {annotation.type === 'check' && <Check className="w-6 h-6 text-success" />}
                        {annotation.type === 'cross' && <X className="w-6 h-6 text-destructive" />}
                        {annotation.type === 'circle' && <Circle className="w-6 h-6 text-primary" />}
                        {annotation.type === 'text' && (
                          <div className="bg-yellow-100 border border-yellow-300 p-2 rounded text-xs max-w-32">
                            {annotation.content}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Panel - Questions List */}
          <div className="w-80 border-l bg-card">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Questions & Marking</h3>
              <p className="text-sm text-muted-foreground">Select question, assign marks, then annotate PDF</p>
            </div>
            
            <div className="p-4 space-y-3 overflow-auto max-h-screen">
              {questions.map((question) => {
                const marksOptions = generateMarksOptions(question.maxMarks);
                return (
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
                          <span className="font-semibold text-lg">{question.questionNumber}</span>
                          {question.visited && (
                            <CheckCircle className="w-4 h-4 text-success animate-pulse" />
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground font-medium">
                          Out of {question.maxMarks}.0
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium block mb-1">Given Marks</label>
                          <Select 
                            value={question.givenMarks?.toString() || ""} 
                            onValueChange={(value) => handleMarksUpdate(question.id, parseFloat(value))}
                          >
                            <SelectTrigger className="h-10 text-lg font-semibold">
                              <SelectValue placeholder="Select marks" />
                            </SelectTrigger>
                            <SelectContent className="max-h-48">
                              {marksOptions.map((mark) => (
                                <SelectItem key={mark} value={mark.toString()}>
                                  <span className="font-medium">{mark}</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Status</span>
                          <div className="flex items-center gap-2">
                            {question.visited ? (
                              <div className="flex items-center gap-1 text-success">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-sm font-medium">Visited</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Circle className="w-4 h-4" />
                                <span className="text-sm">Pending</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {question.givenMarks !== null && (
                          <div className="mt-2 p-2 bg-success/10 rounded border border-success/20">
                            <div className="text-center">
                              <span className="text-lg font-bold text-success">
                                {question.givenMarks}/{question.maxMarks}
                              </span>
                              <p className="text-xs text-success">
                                {Math.round((question.givenMarks / question.maxMarks) * 100)}% scored
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              {/* Total Score Summary */}
              <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="p-4">
                  <div className="text-center space-y-2">
                    <h4 className="font-semibold text-primary">Total Score</h4>
                    <div className="text-2xl font-bold">
                      {questions.reduce((sum, q) => sum + (q.givenMarks || 0), 0)} / {questions.reduce((sum, q) => sum + q.maxMarks, 0)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {questions.filter(q => q.givenMarks !== null).length} of {questions.length} questions graded
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Annotation Dialog */}
      <Dialog open={showAnnotationDialog} onOpenChange={setShowAnnotationDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pen className="w-5 h-5" />
              Add Annotation
            </DialogTitle>
          </DialogHeader>
          
          {annotationTools.find(t => t.id === selectedTool)?.type === 'text' && (
            <div className="space-y-3 mb-4">
              <label className="text-sm font-medium">Comment Text</label>
              <textarea
                className="w-full p-2 border rounded-md min-h-20 resize-none"
                placeholder="Enter your comment..."
                value={textComment}
                onChange={(e) => setTextComment(e.target.value)}
              />
            </div>
          )}
          
          <div className="grid grid-cols-3 gap-3 p-4">
            {annotationTools.map((tool) => (
              <Button
                key={tool.id}
                variant="outline"
                className="h-16 flex flex-col gap-2 hover:shadow-md transition-all"
                onClick={() => handleAnnotation(tool.id)}
                disabled={tool.type === 'text' && !textComment.trim()}
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-success">
              <Trophy className="w-6 h-6" />
              Paper Checking Complete!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-center">
            <div className="text-6xl">🎉</div>
            <div>
              <h3 className="text-lg font-semibold">Great job!</h3>
              <p className="text-muted-foreground">
                You have successfully graded all questions for {selectedStudentData?.studentName}'s paper.
              </p>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="text-2xl font-bold">
                {questions.reduce((sum, q) => sum + (q.givenMarks || 0), 0)} / {questions.reduce((sum, q) => sum + q.maxMarks, 0)}
              </div>
              <p className="text-sm text-muted-foreground">Final Score</p>
            </div>
            <Button onClick={handleSubmitPaper} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Submit Final Grade
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PaperCheckingInterface;