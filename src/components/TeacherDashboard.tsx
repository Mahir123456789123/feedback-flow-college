
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useAnswerSheets, useGrievances } from '@/hooks/useDatabase';
import { toast } from 'sonner';
import { MessageSquare, Eye, CheckCircle, XCircle, Clock, AlertTriangle, TrendingUp, BarChart3, FileText } from 'lucide-react';
import PaperCheckingInterface from './PaperCheckingInterface';
import { supabase } from '@/integrations/supabase/client';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [responseText, setResponseText] = useState('');
  const [updatedMarks, setUpdatedMarks] = useState('');
  
  // Get current user profile ID
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Fetch real data from database
  const { grievances, updateGrievanceStatus } = useGrievances(currentUserId || undefined, user?.user_metadata?.role);
  const { answerSheets } = useAnswerSheets(currentUserId || undefined, user?.user_metadata?.role);

  // Get current user profile ID
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (user?.id) {
        const { data } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        if (data) {
          setCurrentUserId(data.id);
        }
      }
    };
    fetchCurrentUser();
  }, [user?.id]);

  // Statistics
  const totalAnswerSheets = answerSheets.length;
  const totalGrievances = grievances.length;
  const pendingGrievances = grievances.filter(g => g.status === 'pending').length;
  const resolvedGrievances = grievances.filter(g => g.status === 'resolved').length;
  const departmentStats = answerSheets.reduce((acc, sheet) => {
    const deptName = sheet.exam?.subject?.department?.name || 'Unknown';
    acc[deptName] = (acc[deptName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleGrievanceResponse = (grievanceId: string, action: 'approve' | 'reject') => {
    if (!responseText.trim()) {
      toast.error('Please provide a response');
      return;
    }

    if (action === 'approve' && !updatedMarks.trim()) {
      toast.error('Please provide updated marks');
      return;
    }

    const status = action === 'approve' ? 'resolved' : 'rejected';
    const marks = action === 'approve' ? parseInt(updatedMarks) : undefined;
    
    updateGrievanceStatus(grievanceId, status, responseText, marks);
    setResponseText('');
    setUpdatedMarks('');
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

  // Data for pie chart
  const chartData = Object.entries(departmentStats).map(([name, value]) => ({ name, value }));
  const chartConfig = {
    Computer: { label: "Computer Engineering", color: "hsl(var(--chart-1))" },
    Civil: { label: "Civil Engineering", color: "hsl(var(--chart-2))" }, 
    Mechanical: { label: "Mechanical Engineering", color: "hsl(var(--chart-3))" },
    Electrical: { label: "Electrical Engineering", color: "hsl(var(--chart-4))" },
    Electronics: { label: "Electronics Engineering", color: "hsl(var(--chart-5))" }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Teacher Dashboard</h1>
          <p className="text-muted-foreground">Manage answer sheets and review grievances</p>
        </div>
      </div>

      <Tabs defaultValue="paper-checking" className="space-y-4">
        <TabsList>
          <TabsTrigger value="paper-checking" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Paper Checking
          </TabsTrigger>
          <TabsTrigger value="grievances" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Grievances ({grievances.filter(g => g.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Statistics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="paper-checking" className="space-y-4">
          <PaperCheckingInterface />
        </TabsContent>

        <TabsContent value="grievances" className="space-y-4">
          <h2 className="text-xl font-semibold">Student Grievances</h2>
          
          <div className="space-y-4">
            {grievances.map((grievance) => (
              <Card key={grievance.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{grievance.answer_sheet?.exam?.subject?.name}</CardTitle>
                       <CardDescription>
                         {grievance.answer_sheet?.exam?.name} - Question {grievance.question_number}{grievance.sub_question && `(${grievance.sub_question})`} - {grievance.student?.name}
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
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground">Current Marks</p>
                      <p className="text-lg font-bold text-primary">{grievance.current_marks}</p>
                    </div>
                    {grievance.updated_marks && (
                      <div className="bg-success/10 p-3 rounded-lg border border-success/20">
                        <p className="text-sm font-medium text-success">Updated Marks</p>
                        <p className="text-lg font-bold text-success">{grievance.updated_marks}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Student's Grievance:</p>
                    <p className="text-sm mt-1 bg-muted/50 p-3 rounded-lg">{grievance.grievance_text}</p>
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
                        <div className="space-y-2">
                          <Label>Updated Marks (if approving)</Label>
                          <input
                            type="number"
                            className="w-full p-2 border border-input rounded-md bg-background"
                            placeholder="Enter new marks"
                            value={updatedMarks}
                            onChange={(e) => setUpdatedMarks(e.target.value)}
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
                  
                  {grievance.teacher_response && (
                    <div className="bg-primary/5 p-3 rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground">Your Response:</p>
                      <p className="text-sm mt-1">{grievance.teacher_response}</p>
                      {grievance.status === 'resolved' && grievance.updated_marks && (
                        <p className="text-sm mt-2 text-success font-medium">
                          Marks updated from {grievance.current_marks} to {grievance.updated_marks}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Responded on: {new Date(grievance.reviewed_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Submitted: {new Date(grievance.submitted_at).toLocaleDateString()}</span>
                    <span>Student: {grievance.student?.name}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Answer Sheets</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalAnswerSheets}</div>
                <p className="text-xs text-muted-foreground">Across all departments</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Grievances</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalGrievances}</div>
                <p className="text-xs text-muted-foreground">{pendingGrievances} pending review</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolved Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalGrievances > 0 ? Math.round((resolvedGrievances / totalGrievances) * 100) : 0}%</div>
                <p className="text-xs text-muted-foreground">{resolvedGrievances} of {totalGrievances} resolved</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Departments</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Object.keys(departmentStats).length}</div>
                <p className="text-xs text-muted-foreground">Currently active</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Department Statistics</CardTitle>
                <CardDescription>Answer sheets by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(departmentStats).map(([dept, count]) => (
                    <div key={dept} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{dept}</span>
                      <Badge variant="secondary">{count} sheets</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Department Distribution</CardTitle>
                <CardDescription>Answer sheets by department (pie chart)</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={chartConfig[entry.name as keyof typeof chartConfig]?.color || "#8884d8"}
                          />
                        ))}
                      </Pie>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherDashboard;
