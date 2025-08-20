import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { mockAnswerSheets, mockGrievances } from '@/data/mockData';
import { toast } from 'sonner';
import { FileText, AlertTriangle, CheckCircle, Clock, Eye, MessageSquare } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [grievanceText, setGrievanceText] = useState('');
  const [selectedAnswerSheet, setSelectedAnswerSheet] = useState<string>('');
  const [questionNumber, setQuestionNumber] = useState('');
  const [subQuestionNumber, setSubQuestionNumber] = useState('');
  const [currentMarks, setCurrentMarks] = useState('');
  const [grievances, setGrievances] = useState(mockGrievances.filter(grievance => grievance.studentId === user?.id));

  const studentAnswerSheets = mockAnswerSheets.filter(sheet => sheet.studentId === user?.id);

  const handleSubmitGrievance = () => {
    if (!selectedAnswerSheet || !questionNumber || !grievanceText.trim() || !currentMarks) {
      toast.error('Please fill in all fields');
      return;
    }

    const selectedSheet = studentAnswerSheets.find(sheet => sheet.id === selectedAnswerSheet);
    if (!selectedSheet) return;

    const newGrievance = {
      id: `g${Date.now()}`,
      studentId: user?.id || '',
      studentName: user?.user_metadata?.name || user?.email?.split('@')[0] || '',
      answerSheetId: selectedAnswerSheet,
      subject: selectedSheet.subject,
      examName: selectedSheet.examName,
      questionNumber: parseInt(questionNumber),
      subQuestionNumber: subQuestionNumber || undefined,
      grievanceText,
      status: 'pending' as const,
      teacherId: selectedSheet.teacherId,
      teacherName: selectedSheet.teacherName,
      submissionDate: new Date(),
      currentMarks: parseInt(currentMarks)
    };

    setGrievances(prev => [newGrievance, ...prev]);
    toast.success('Grievance submitted successfully! Your teacher will review it soon.');
    setGrievanceText('');
    setSelectedAnswerSheet('');
    setQuestionNumber('');
    setSubQuestionNumber('');
    setCurrentMarks('');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'under_review':
        return <Eye className="w-4 h-4" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'under_review':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'resolved':
        return 'bg-success/10 text-success border-success/20';
      case 'rejected':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Student Dashboard</h1>
          <p className="text-muted-foreground">View your answer sheets and submit grievances</p>
        </div>
      </div>

      <Tabs defaultValue="answer-sheets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="answer-sheets" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Answer Sheets
          </TabsTrigger>
          <TabsTrigger value="grievances" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            My Grievances
          </TabsTrigger>
        </TabsList>

        <TabsContent value="answer-sheets" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your Answer Sheets</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Submit Grievance
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Submit a Grievance</DialogTitle>
                  <DialogDescription>
                    Submit a grievance for a specific question on your answer sheet
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Answer Sheet</Label>
                    <select 
                      className="w-full p-2 border border-input rounded-md bg-background"
                      value={selectedAnswerSheet}
                      onChange={(e) => setSelectedAnswerSheet(e.target.value)}
                    >
                      <option value="">Choose an answer sheet...</option>
                      {studentAnswerSheets.map(sheet => (
                        <option key={sheet.id} value={sheet.id}>
                          {sheet.subject} - {sheet.examName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Question Number</Label>
                    <input
                      type="number"
                      className="w-full p-2 border border-input rounded-md bg-background"
                      placeholder="Enter question number"
                      value={questionNumber}
                      onChange={(e) => setQuestionNumber(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sub-question (Optional)</Label>
                    <input
                      type="text"
                      className="w-full p-2 border border-input rounded-md bg-background"
                      placeholder="e.g., a, b, i, ii"
                      value={subQuestionNumber}
                      onChange={(e) => setSubQuestionNumber(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Current Marks Received</Label>
                    <input
                      type="number"
                      className="w-full p-2 border border-input rounded-md bg-background"
                      placeholder="Enter marks you received"
                      value={currentMarks}
                      onChange={(e) => setCurrentMarks(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Grievance Details</Label>
                    <Textarea
                      placeholder="Explain why you believe your answer deserves reconsideration..."
                      value={grievanceText}
                      onChange={(e) => setGrievanceText(e.target.value)}
                      className="min-h-24"
                    />
                  </div>
                  <Button onClick={handleSubmitGrievance} className="w-full">
                    Submit Grievance
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {studentAnswerSheets.map((sheet) => (
              <Card key={sheet.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{sheet.subject}</CardTitle>
                  <CardDescription>{sheet.examName}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Score:</span>
                    <span className="font-semibold">{sheet.obtainedMarks}/{sheet.totalMarks}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Teacher:</span>
                    <span>{sheet.teacherName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date:</span>
                    <span>{sheet.uploadDate.toLocaleDateString()}</span>
                  </div>
                  <Button variant="outline" className="w-full mt-3">
                    <Eye className="w-4 h-4 mr-2" />
                    View Answer Sheet
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="grievances" className="space-y-4">
          <h2 className="text-xl font-semibold">Your Grievances</h2>
          
          <div className="space-y-4">
            {grievances.map((grievance) => (
              <Card key={grievance.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{grievance.subject}</CardTitle>
                      <CardDescription>
                        {grievance.examName} - Question {grievance.questionNumber}
                        {grievance.subQuestionNumber && ` (${grievance.subQuestionNumber})`}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(grievance.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(grievance.status)}
                        {grievance.status.replace('_', ' ')}
                      </div>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Your Grievance:</p>
                    <p className="text-sm mt-1">{grievance.grievanceText}</p>
                  </div>
                  
                  {grievance.teacherResponse && (
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground">Teacher Response:</p>
                      <p className="text-sm mt-1">{grievance.teacherResponse}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Responded on: {grievance.responseDate?.toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Submitted: {grievance.submissionDate.toLocaleDateString()}</span>
                    <span>Teacher: {grievance.teacherName}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentDashboard;