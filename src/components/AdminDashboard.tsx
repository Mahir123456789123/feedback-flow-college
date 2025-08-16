
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
import { mockAnswerSheets, mockGrievances } from '@/data/mockData';
import AddExamDialog from './AddExamDialog';
import UploadAnswerSheetDialog from './UploadAnswerSheetDialog';
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
  Users2
} from 'lucide-react';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isAddExamDialogOpen, setIsAddExamDialogOpen] = useState(false);
  const [isUploadAnswerSheetDialogOpen, setIsUploadAnswerSheetDialogOpen] = useState(false);
  const [isExamEnrollmentDialogOpen, setIsExamEnrollmentDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'student' as 'student' | 'teacher',
    department: ''
  });

  // Statistics
  const totalAnswerSheets = mockAnswerSheets.length;
  const totalGrievances = mockGrievances.length;
  const pendingGrievances = mockGrievances.filter(g => g.status === 'pending').length;
  const resolvedGrievances = mockGrievances.filter(g => g.status === 'resolved').length;

  // Department statistics
  const departmentStats = mockAnswerSheets.reduce((acc, sheet) => {
    acc[sheet.department] = (acc[sheet.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{user?.role === 'controller' ? 'Controller Dashboard' : 'Admin Dashboard'}</h1>
          <p className="text-muted-foreground">Welcome, {user?.name}</p>
        </div>
        <div className="flex space-x-2">
          <AddExamDialog
            isOpen={isAddExamDialogOpen}
            onOpenChange={setIsAddExamDialogOpen}
          />
          <ExamEnrollmentDialog
            isOpen={isExamEnrollmentDialogOpen}
            onOpenChange={setIsExamEnrollmentDialogOpen}
          />
          <Button onClick={() => setIsExamEnrollmentDialogOpen(true)}>
            <Users2 className="h-4 w-4 mr-2" />
            Manage Enrollment
          </Button>
          <Button onClick={() => setIsAddExamDialogOpen(true)}>
            <BookOpen className="h-4 w-4 mr-2" />
            Add Exam
          </Button>
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
                      <SelectItem value="Computer Engineering">Computer Engineering</SelectItem>
                      <SelectItem value="Information Technology">Information Technology</SelectItem>
                      <SelectItem value="Electronics Engineering">Electronics Engineering</SelectItem>
                      <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
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
          <TabsTrigger value="answer-sheets">Answer Sheets</TabsTrigger>
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
                  {mockGrievances.slice(0, 5).map((grievance) => (
                    <div key={grievance.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{grievance.studentName}</p>
                        <p className="text-xs text-muted-foreground">{grievance.subject}</p>
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
              <CardTitle>Exam Management</CardTitle>
              <CardDescription>Manage exams, teacher assignments, and question papers</CardDescription>
            </CardHeader>
            <CardContent>
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
                        <TableHead>Duration</TableHead>
                        <TableHead>Assigned Teachers</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">End Semester Examination</TableCell>
                        <TableCell>Operating Systems</TableCell>
                        <TableCell>Computer Engineering</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>2024-02-15</span>
                          </div>
                        </TableCell>
                        <TableCell>3 hours</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">Dr. Devadkar (Q1-3)</Badge>
                            <Badge variant="secondary" className="text-xs">Prof. Patel (Q4-6)</Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Internal Assessment 2</TableCell>
                        <TableCell>Database Management</TableCell>
                        <TableCell>Computer Engineering</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>2024-02-20</span>
                          </div>
                        </TableCell>
                        <TableCell>2 hours</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">Dr. Sharma (Q1-4)</Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="answer-sheets" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Answer Sheets</CardTitle>
                  <CardDescription>Complete list of uploaded answer sheets</CardDescription>
                </div>
                <UploadAnswerSheetDialog
                  isOpen={isUploadAnswerSheetDialogOpen}
                  onOpenChange={setIsUploadAnswerSheetDialogOpen}
                />
                <Button onClick={() => setIsUploadAnswerSheetDialogOpen(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Answer Sheet
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Exam</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Upload Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAnswerSheets.map((sheet) => (
                    <TableRow key={sheet.id}>
                      <TableCell className="font-medium">{sheet.studentName}</TableCell>
                      <TableCell>{sheet.subject}</TableCell>
                      <TableCell>{sheet.examName}</TableCell>
                      <TableCell>{sheet.department}</TableCell>
                      <TableCell>{sheet.teacherName}</TableCell>
                      <TableCell>
                        <Badge variant={sheet.obtainedMarks >= sheet.totalMarks * 0.6 ? "default" : "destructive"}>
                          {sheet.obtainedMarks}/{sheet.totalMarks}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(sheet.uploadDate).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                <TableBody>
                  {mockGrievances.map((grievance) => (
                    <TableRow key={grievance.id}>
                      <TableCell className="font-medium">{grievance.studentName}</TableCell>
                      <TableCell>{grievance.subject}</TableCell>
                      <TableCell>Q{grievance.questionNumber}</TableCell>
                      <TableCell>{grievance.teacherName}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(grievance.status)}>
                          {getStatusIcon(grievance.status)}
                          <span className="ml-1 capitalize">{grievance.status.replace('_', ' ')}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(grievance.submissionDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
