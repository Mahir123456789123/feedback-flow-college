import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDepartments, useTeachers, useExams, useAnswerSheets, useGrievances } from '@/hooks/useDatabase';
import AddExamDialog from './AddExamDialog';
import ExamEnrollmentDialog from './ExamEnrollmentDialog';
import { 
  Users, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  TrendingUp,
  UserPlus,
  Settings,
  BarChart3,
  BookOpen,
  Calendar,
  Upload,
  Users2,
  ArrowLeft,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isAddExamDialogOpen, setIsAddExamDialogOpen] = useState(false);
  const [isExamEnrollmentDialogOpen, setIsExamEnrollmentDialogOpen] = useState(false);
  const [selectedExamForView, setSelectedExamForView] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'student' as 'student' | 'teacher',
    department: ''
  });

  // Fetch real data from database
  const { departments } = useDepartments();
  const { exams } = useExams();
  const { answerSheets } = useAnswerSheets();
  const { grievances } = useGrievances();

  // Statistics
  const totalAnswerSheets = answerSheets.length;
  const totalGrievances = grievances.length;
  const pendingGrievances = grievances.filter(g => g.status === 'pending').length;
  const resolvedGrievances = grievances.filter(g => g.status === 'resolved').length;

  // Department statistics
  const departmentStats = answerSheets.reduce((acc, sheet) => {
    const deptName = sheet.exam?.subject?.department?.name || 'Unknown';
    acc[deptName] = (acc[deptName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Pie chart data for analytics
  const pieChartData = Object.entries(departmentStats).map(([dept, count]) => ({
    name: dept.replace(' Engineering', ''),
    value: count,
    fullName: dept
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.department) {
      toast.error('Please fill in all fields');
      return;
    }
    
    toast.success(`${newUser.role} ${newUser.name} added successfully`);
    setNewUser({ name: '', email: '', role: 'student', department: '' });
    setIsAddUserDialogOpen(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'under_review':
        return <AlertTriangle className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'under_review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleViewExam = (examId: string) => {
    setSelectedExamForView(examId);
  };

  const handleBackToExamsList = () => {
    setSelectedExamForView(null);
  };

  const selectedExam = exams.find(exam => exam.id === selectedExamForView);

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{user?.user_metadata?.role === 'controller' ? 'Controller Dashboard' : 'Admin Dashboard'}</h1>
          <p className="text-muted-foreground">Welcome, {user?.user_metadata?.name || user?.email?.split('@')[0]}</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Add a new student or teacher to the system
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={newUser.role} onValueChange={(value: 'student' | 'teacher') => setNewUser({ ...newUser, role: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select value={newUser.department} onValueChange={(value) => setNewUser({ ...newUser, department: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddUser} className="w-full">
                  Add User
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Answer Sheets</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAnswerSheets}</div>
            <p className="text-xs text-muted-foreground">
              Across all departments
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Grievances</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGrievances}</div>
            <p className="text-xs text-muted-foreground">
              {pendingGrievances} pending review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalGrievances > 0 ? Math.round((resolvedGrievances / totalGrievances) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {resolvedGrievances} of {totalGrievances} resolved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Departments</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(departmentStats).length}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="exams">Exams</TabsTrigger>
          <TabsTrigger value="grievances">Grievances</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
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
                <CardTitle>Recent Grievances</CardTitle>
                <CardDescription>Latest grievance submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {grievances.slice(0, 5).map((grievance) => (
                    <div key={grievance.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{grievance.student?.name}</p>
                        <p className="text-xs text-muted-foreground">{grievance.answer_sheet?.exam?.subject?.name}</p>
                      </div>
                      <Badge className={getStatusColor(grievance.status)}>
                        {getStatusIcon(grievance.status)}
                        <span className="ml-1 capitalize">{grievance.status.replace('_', ' ')}</span>
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="exams" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {selectedExamForView ? (
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleBackToExamsList}
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <span>{selectedExam?.name}</span>
                      </div>
                    ) : (
                      'Exam Management'
                    )}
                  </CardTitle>
                  <CardDescription>
                    {selectedExamForView 
                      ? 'Manage student enrollment and answer sheets' 
                      : 'Manage exams, teacher assignments, and question papers'
                    }
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  {selectedExamForView ? (
                    <>
                      <ExamEnrollmentDialog
                        isOpen={isExamEnrollmentDialogOpen}
                        onOpenChange={setIsExamEnrollmentDialogOpen}
                        preselectedExamId={selectedExamForView}
                      />
                      <Button onClick={() => setIsExamEnrollmentDialogOpen(true)}>
                        <Users2 className="h-4 w-4 mr-2" />
                        Manage Enrollment
                      </Button>
                    </>
                  ) : (
                    <>
                      <AddExamDialog
                        isOpen={isAddExamDialogOpen}
                        onOpenChange={setIsAddExamDialogOpen}
                      />
                      <Button onClick={() => setIsAddExamDialogOpen(true)}>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Add Exam
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {selectedExamForView && selectedExam ? (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Exam Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Subject:</span>
                          <p>{selectedExam.subject?.name}</p>
                        </div>
                        <div>
                          <span className="font-medium">Department:</span>
                          <p>{selectedExam.subject?.department?.name}</p>
                        </div>
                        <div>
                          <span className="font-medium">Date:</span>
                          <p>{new Date(selectedExam.exam_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="font-medium">Duration:</span>
                          <p>{selectedExam.duration_minutes} minutes</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Assigned Teachers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedExam.exam_teacher_assignments?.map((assignment: any, index: number) => (
                          <Badge key={index} variant="secondary">
                            {assignment.teacher?.name} (Q{assignment.assigned_questions.join(',')})
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Upcoming Exams</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">5</div>
                        <p className="text-sm text-muted-foreground">Next 30 days</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Active Exams</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-sm text-muted-foreground">Currently ongoing</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Completed Exams</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">28</div>
                        <p className="text-sm text-muted-foreground">This semester</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Exam Name</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {exams.map((exam) => (
                        <TableRow key={exam.id}>
                          <TableCell className="font-medium">{exam.name}</TableCell>
                          <TableCell>{exam.subject?.name}</TableCell>
                          <TableCell>{exam.subject?.department?.name}</TableCell>
                          <TableCell>{new Date(exam.exam_date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{exam.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewExam(exam.id)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View Details
                              </Button>
                              <Button variant="outline" size="sm">
                                <Settings className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grievances" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Grievances</CardTitle>
              <CardDescription>Complete list of student grievances</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Question</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submission Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
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
                      {getStatusIcon(grievance.status)}
                      <span className="ml-1 capitalize">{grievance.status.replace('_', ' ')}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Current Marks</p>
                        <p className="text-lg font-bold">{grievance.current_marks}</p>
                      </div>
                      {grievance.updated_marks && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Updated Marks</p>
                          <p className="text-lg font-bold text-green-600">{grievance.updated_marks}</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Grievance:</p>
                      <p className="text-sm mt-1">{grievance.grievance_text}</p>
                    </div>
                    {grievance.teacher_response && (
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm font-medium text-muted-foreground">Teacher Response:</p>
                        <p className="text-sm mt-1">{grievance.teacher_response}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Responded on: {new Date(grievance.reviewed_at).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Submitted: {new Date(grievance.submitted_at).toLocaleDateString()}</span>
                      <span>Reviewer: {grievance.reviewer?.name}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Department Distribution</CardTitle>
                <CardDescription>Answer sheets by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name, props) => [
                          `${value} sheets`, 
                          props.payload.fullName
                        ]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>System performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Resolution Time</span>
                    <Badge>2.3 days</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Teacher Response Rate</span>
                    <Badge>87%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Student Satisfaction</span>
                    <Badge>4.2/5</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">System Uptime</span>
                    <Badge variant="outline">99.9%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Statistics</CardTitle>
                <CardDescription>Platform usage insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Daily Active Users</span>
                    <Badge>156</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Monthly Answer Sheets</span>
                    <Badge>342</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Peak Usage Hours</span>
                    <Badge variant="outline">2-4 PM</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Mobile Usage</span>
                    <Badge variant="outline">23%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Grievance Analytics</CardTitle>
                <CardDescription>Grievance resolution insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pending Grievances</span>
                    <Badge variant="secondary">{pendingGrievances}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Resolved This Month</span>
                    <Badge className="bg-green-100 text-green-800 border-green-200">{resolvedGrievances}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Response Time</span>
                    <Badge variant="outline">1.8 days</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Most Common Issues</span>
                    <Badge variant="outline">Marking disputes</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
