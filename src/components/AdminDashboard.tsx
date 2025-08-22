
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useDepartments, useTeachers, useSubjects, useExams } from '@/hooks/useDatabase';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Users, BookOpen, GraduationCap, Settings, Plus, Calendar, MapPin, Clock, User, FileText, TrendingUp, BarChart3, AlertTriangle } from 'lucide-react';
import AddExamDialog from './AddExamDialog';
import ExamEnrollmentDialog from './ExamEnrollmentDialog';
import UploadAnswerSheetDialog from './UploadAnswerSheetDialog';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [teacherAssignments, setTeacherAssignments] = useState<{[examId: string]: string}>({});
  const [selectedExamForEnrollment, setSelectedExamForEnrollment] = useState<string>('');
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [isUploadAnswerSheetOpen, setIsUploadAnswerSheetOpen] = useState(false);
  const [isExamEnrollmentOpen, setIsExamEnrollmentOpen] = useState(false);
  
  // Fetch data from database
  const { departments, loading: deptLoading } = useDepartments();
  const { teachers, loading: teachersLoading } = useTeachers();
  const { subjects, loading: subjectsLoading } = useSubjects();
  const { exams, loading: examsLoading, refetch } = useExams();

  // Statistics
  const totalStudents = 150; // This would come from a students query
  const totalTeachers = teachers.length;
  const totalExams = exams.length;
  const upcomingExams = exams.filter(exam => new Date(exam.exam_date) > new Date()).length;

  const handleAssignTeacher = async (examId: string, teacherId: string) => {
    try {
      const { error } = await supabase
        .from('exam_teacher_assignments')
        .upsert({
          exam_id: examId,
          teacher_id: teacherId,
          assigned_questions: [1, 2, 3, 4, 5, 6], // Default questions
          marks_per_question: { "1": 10, "2": 10, "3": 10, "4": 10, "5": 10, "6": 10 }
        });

      if (error) throw error;

      setTeacherAssignments(prev => ({ ...prev, [examId]: teacherId }));
      toast.success('Teacher assigned successfully!');
    } catch (error) {
      console.error('Error assigning teacher:', error);
      toast.error('Failed to assign teacher');
    }
  };

  const handleExamAdded = () => {
    refetch();
    setIsAddExamOpen(false);
  };

  if (deptLoading || teachersLoading || subjectsLoading || examsLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage exams, teachers, and students</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsAddExamOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Exam
          </Button>
          <Button variant="outline" onClick={() => setIsUploadAnswerSheetOpen(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Upload Answer Sheet
          </Button>
        </div>
      </div>

      <AddExamDialog isOpen={isAddExamOpen} onOpenChange={setIsAddExamOpen} onExamAdded={handleExamAdded} />
      <UploadAnswerSheetDialog isOpen={isUploadAnswerSheetOpen} onOpenChange={setIsUploadAnswerSheetOpen} />
      <ExamEnrollmentDialog isOpen={isExamEnrollmentOpen} onOpenChange={setIsExamEnrollmentOpen} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="exams" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Exams
          </TabsTrigger>
          <TabsTrigger value="teachers" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Teachers
          </TabsTrigger>
          <TabsTrigger value="subjects" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Subjects
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStudents}</div>
                <p className="text-xs text-muted-foreground">Across all departments</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTeachers}</div>
                <p className="text-xs text-muted-foreground">Active faculty members</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalExams}</div>
                <p className="text-xs text-muted-foreground">This semester</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Exams</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{upcomingExams}</div>
                <p className="text-xs text-muted-foreground">Next 30 days</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Exams</CardTitle>
                <CardDescription>Latest scheduled exams</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {exams.slice(0, 5).map((exam) => (
                    <div key={exam.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{exam.name}</p>
                        <p className="text-sm text-muted-foreground">{exam.subject?.name}</p>
                      </div>
                      <Badge variant="secondary">
                        {new Date(exam.exam_date).toLocaleDateString()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Department Statistics</CardTitle>
                <CardDescription>Teachers by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {departments.map((dept) => {
                    const deptTeachers = teachers.filter(t => t.department === dept.name);
                    return (
                      <div key={dept.id} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{dept.name}</span>
                        <Badge variant="secondary">{deptTeachers.length} teachers</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="exams" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Exam Management</h2>
            <Button onClick={() => setIsExamEnrollmentOpen(true)}>
              <Users className="h-4 w-4 mr-2" />
              Manage Enrollments
            </Button>
          </div>
          
          <div className="grid gap-4">
            {exams.map((exam) => (
              <Card key={exam.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{exam.name}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          {exam.subject?.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(exam.exam_date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {exam.start_time} ({exam.duration_minutes} mins)
                        </span>
                      </CardDescription>
                    </div>
                    <Badge variant={new Date(exam.exam_date) > new Date() ? "default" : "secondary"}>
                      {exam.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Marks</p>
                        <p className="font-semibold">{exam.total_marks}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Department</p>
                        <p className="font-semibold">{exam.subject?.department?.name}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Assign Teacher</Label>
                      <div className="flex gap-2">
                        <Select 
                          value={teacherAssignments[exam.id] || ''} 
                          onValueChange={(value) => handleAssignTeacher(exam.id, value)}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select a teacher..." />
                          </SelectTrigger>
                          <SelectContent>
                            {teachers.map((teacher) => (
                              <SelectItem key={teacher.id} value={teacher.id}>
                                {teacher.name} ({teacher.department})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {exam.exam_teacher_assignments?.length > 0 && (
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-muted-foreground mb-2">Assigned Teachers:</p>
                        <div className="space-y-1">
                          {exam.exam_teacher_assignments.map((assignment: any, index: number) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm">{assignment.teacher?.name}</span>
                              <Badge variant="outline" className="text-xs">
                                Questions: {assignment.assigned_questions?.join(', ') || 'N/A'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="teachers" className="space-y-4">
          <h2 className="text-xl font-semibold">Teacher Management</h2>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {teachers.map((teacher) => (
              <Card key={teacher.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{teacher.name}</CardTitle>
                  <CardDescription>{teacher.email}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{teacher.department}</span>
                    </div>
                    <Badge variant="secondary" className="w-fit">
                      Active
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-4">
          <h2 className="text-xl font-semibold">Subject Management</h2>
          
          <div className="grid gap-4">
            {subjects.map((subject) => (
              <Card key={subject.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{subject.name}</CardTitle>
                      <CardDescription>Code: {subject.code}</CardDescription>
                    </div>
                    <Badge variant="outline">{subject.credits} Credits</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Department</p>
                      <p className="font-medium">{subject.department_name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Semester</p>
                      <p className="font-medium">{subject.semester_name}</p>
                    </div>
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

export default AdminDashboard;
