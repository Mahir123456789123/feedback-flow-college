import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { mockAnswerSheets, mockGrievances } from '@/data/mockData';
import { toast } from 'sonner';
import { Upload, FileText, MessageSquare, Eye, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [responseText, setResponseText] = useState('');
  const [uploadForm, setUploadForm] = useState({
    studentName: '',
    subject: '',
    examName: '',
    totalMarks: '',
    obtainedMarks: '',
    semester: ''
  });

  const teacherAnswerSheets = mockAnswerSheets.filter(sheet => sheet.teacherId === user?.id);
  const teacherGrievances = mockGrievances.filter(grievance => grievance.teacherId === user?.id);

  const handleUploadAnswerSheet = () => {
    if (!uploadForm.studentName || !uploadForm.subject || !uploadForm.examName || !uploadForm.totalMarks || !uploadForm.obtainedMarks) {
      toast.error('Please fill in all required fields');
      return;
    }

    // In a real app, this would upload to a backend
    toast.success('Answer sheet uploaded successfully!');
    setUploadForm({
      studentName: '',
      subject: '',
      examName: '',
      totalMarks: '',
      obtainedMarks: '',
      semester: ''
    });
  };

  const handleGrievanceResponse = (grievanceId: string, action: 'approve' | 'reject') => {
    if (!responseText.trim()) {
      toast.error('Please provide a response');
      return;
    }

    // In a real app, this would update the grievance status
    toast.success(`Grievance ${action}ed successfully!`);
    setResponseText('');
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
        return <XCircle className="w-4 h-4" />;
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
          <h1 className="text-3xl font-bold text-foreground">Teacher Dashboard</h1>
          <p className="text-muted-foreground">Manage answer sheets and review grievances</p>
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
            Grievances ({teacherGrievances.filter(g => g.status === 'pending').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="answer-sheets" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Uploaded Answer Sheets</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Answer Sheet
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Upload Answer Sheet</DialogTitle>
                  <DialogDescription>
                    Upload a corrected answer sheet for a student
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Student Name</Label>
                    <Input
                      placeholder="Enter student name"
                      value={uploadForm.studentName}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, studentName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Input
                      placeholder="Enter subject"
                      value={uploadForm.subject}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, subject: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Exam Name</Label>
                    <Input
                      placeholder="Enter exam name"
                      value={uploadForm.examName}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, examName: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Total Marks</Label>
                      <Input
                        type="number"
                        placeholder="100"
                        value={uploadForm.totalMarks}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, totalMarks: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Obtained Marks</Label>
                      <Input
                        type="number"
                        placeholder="85"
                        value={uploadForm.obtainedMarks}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, obtainedMarks: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Semester</Label>
                    <Input
                      placeholder="Fall 2024"
                      value={uploadForm.semester}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, semester: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Answer Sheet File</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground">PDF, JPEG, PNG up to 10MB</p>
                    </div>
                  </div>
                  <Button onClick={handleUploadAnswerSheet} className="w-full">
                    Upload Answer Sheet
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {teacherAnswerSheets.map((sheet) => (
              <Card key={sheet.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{sheet.subject}</CardTitle>
                  <CardDescription>{sheet.examName}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Student:</span>
                    <span className="font-semibold">{sheet.studentName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Score:</span>
                    <span>{sheet.obtainedMarks}/{sheet.totalMarks}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date:</span>
                    <span>{sheet.uploadDate.toLocaleDateString()}</span>
                  </div>
                  <Button variant="outline" className="w-full mt-3">
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="grievances" className="space-y-4">
          <h2 className="text-xl font-semibold">Student Grievances</h2>
          
          <div className="space-y-4">
            {teacherGrievances.map((grievance) => (
              <Card key={grievance.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{grievance.subject}</CardTitle>
                      <CardDescription>
                        {grievance.examName} - Question {grievance.questionNumber} - {grievance.studentName}
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
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Student's Grievance:</p>
                    <p className="text-sm mt-1 bg-muted/50 p-3 rounded-lg">{grievance.grievanceText}</p>
                  </div>
                  
                  {grievance.status === 'pending' && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Your Response</Label>
                        <Textarea
                          placeholder="Provide your response to this grievance..."
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          className="min-h-20"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleGrievanceResponse(grievance.id, 'approve')}
                          className="flex-1 bg-success hover:bg-success/90"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve & Update Marks
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={() => handleGrievanceResponse(grievance.id, 'reject')}
                          className="flex-1"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {grievance.teacherResponse && (
                    <div className="bg-primary/5 p-3 rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground">Your Response:</p>
                      <p className="text-sm mt-1">{grievance.teacherResponse}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Responded on: {grievance.responseDate?.toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Submitted: {grievance.submissionDate.toLocaleDateString()}</span>
                    <span>Student: {grievance.studentName}</span>
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

export default TeacherDashboard;