
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useDepartments, useTeachers, useSubjects, useExams } from '@/hooks/useDatabase';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Users, BookOpen, GraduationCap, FileText, Calendar, Star, Edit, Upload } from 'lucide-react';
import AddExamDialog from './AddExamDialog';
import EditExamDialog from './EditExamDialog';
import ExamEnrollmentDialog from './ExamEnrollmentDialog';
import ExamStudentAssignmentDialog from './ExamStudentAssignmentDialog';
import FileUploadManager from './FileUploadManager';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [teacherAssignments, setTeacherAssignments] = useState<{[examId: string]: string}>({});
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [isEditExamOpen, setIsEditExamOpen] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [isStudentAssignmentOpen, setIsStudentAssignmentOpen] = useState(false);
  const [selectedExamForStudents, setSelectedExamForStudents] = useState<any>(null);
  const [isEnrollmentDialogOpen, setIsEnrollmentDialogOpen] = useState(false);
  
  // Fetch data from database
  const { departments, loading: deptLoading } = useDepartments();
  const { teachers, loading: teachersLoading } = useTeachers();
  const { subjects, loading: subjectsLoading } = useSubjects();
  const { exams, loading: examsLoading, refetch } = useExams();

  const assignTeacher = async (examId: string, teacherId: string) => {
    try {
      // Check if assignment already exists
      const { data: existingAssignment } = await supabase
        .from('exam_teacher_assignments')
        .select('id')
        .eq('exam_id', examId)
        .eq('teacher_id', teacherId)
        .single();

      if (existingAssignment) {
        toast.info('Teacher is already assigned to this exam');
        return;
      }

      const { error } = await supabase
        .from('exam_teacher_assignments')
        .insert({
          exam_id: examId,
          teacher_id: teacherId,
          assigned_questions: [1, 2, 3, 4, 5], // Default questions
          marks_per_question: { "1": 20, "2": 20, "3": 20, "4": 20, "5": 20 } // Default marks
        });

      if (error) throw error;

      setTeacherAssignments(prev => ({
        ...prev,
        [examId]: teacherId
      }));

      // Refresh exams to show updated assignments
      refetch();

      toast.success('Teacher assigned successfully! They will see this exam in their dashboard.');
    } catch (error) {
      console.error('Error assigning teacher:', error);
      toast.error('Failed to assign teacher');
    }
  };

  const handleExamAdded = () => {
    refetch();
    setIsAddExamOpen(false);
  };

  const handleEditExam = (examId: string) => {
    setSelectedExamId(examId);
    setIsEditExamOpen(true);
  };

  const handleExamUpdated = () => {
    refetch();
    setIsEditExamOpen(false);
    setSelectedExamId(null);
  };

  const handleManageStudents = (exam: any) => {
    setSelectedExamForStudents(exam);
    setIsStudentAssignmentOpen(true);
  };

  if (deptLoading || teachersLoading || subjectsLoading || examsLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gradient tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage exams, teachers, and students</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsAddExamOpen(true)} className="bg-gradient-to-r from-primary to-purple-500 border-0 shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.7)]">
            <Plus className="h-4 w-4 mr-2" />
            Add Exam
          </Button>
          <Button onClick={() => setIsEnrollmentDialogOpen(true)} variant="outline" className="border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10">
            <Users className="h-4 w-4 mr-2" />
            Enroll Students
          </Button>
          <Button onClick={() => setActiveTab('files')} variant="outline" className="border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10">
            <Upload className="h-4 w-4 mr-2" />
            Manage Files
          </Button>
        </div>
      </div>

      <AddExamDialog isOpen={isAddExamOpen} onOpenChange={setIsAddExamOpen} onExamAdded={handleExamAdded} />
      <EditExamDialog 
        isOpen={isEditExamOpen} 
        onOpenChange={setIsEditExamOpen} 
        examId={selectedExamId}
        onExamUpdated={handleExamUpdated}
      />
      <ExamStudentAssignmentDialog 
        isOpen={isStudentAssignmentOpen}
        onOpenChange={setIsStudentAssignmentOpen}
        examId={selectedExamForStudents?.id || ''}
        examDetails={selectedExamForStudents}
      />
      <ExamEnrollmentDialog 
        isOpen={isEnrollmentDialogOpen}
        onOpenChange={setIsEnrollmentDialogOpen}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
          <TabsTrigger value="exams">Exams</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Bento Grid Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-6">
            <Card className="md:col-span-2 lg:col-span-2 stagger-item">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
                <BookOpen className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gradient">{departments.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active departments
                </p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 lg:col-span-2 stagger-item">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
                <GraduationCap className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gradient">{teachers.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Registered teachers
                </p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 lg:col-span-1 stagger-item">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Subjects</CardTitle>
                <BookOpen className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gradient">{subjects.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Available
                </p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 lg:col-span-1 stagger-item">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Exams</CardTitle>
                <Calendar className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gradient">{exams.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Scheduled
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Bento Grid Recent Activity */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="md:col-span-2 lg:col-span-2 stagger-item">
              <CardHeader>
                <CardTitle className="text-lg">Recent Exams</CardTitle>
                <CardDescription>Latest scheduled examinations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                {exams.slice(0, 5).map((exam) => (
                  <div key={exam.id} className="flex items-center justify-between p-3 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                    <div>
                      <p className="font-medium">{exam.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {exam.subject?.name} - {exam.subject?.department?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(exam.exam_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={exam.status === 'scheduled' ? 'default' : 'secondary'} className="animate-pulse-glow">
                      {exam.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="stagger-item">
              <CardHeader>
                <CardTitle className="text-lg">Teacher Assignments</CardTitle>
                <CardDescription>Recent assignments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                {exams.slice(0, 5).map((exam) => (
                  <div key={exam.id} className="flex items-center justify-between p-3 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                    <div>
                      <p className="font-medium text-sm">{exam.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Teachers: {exam.exam_teacher_assignments?.length || 0}
                      </p>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {exam.exam_teacher_assignments?.slice(0, 2).map((assignment, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {assignment.teacher?.name.split(' ')[0]}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Department Management</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Department
            </Button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {departments.map((dept) => (
              <Card key={dept.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{dept.name}</CardTitle>
                  <CardDescription>Code: {dept.code}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Teachers: {teachers.filter(t => t.department === dept.name).length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Subjects: {subjects.filter(s => s.department_name === dept.name).length}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="teachers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Teacher Management</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Teacher
            </Button>
          </div>
          
          <div className="grid gap-4">
            {teachers.map((teacher) => (
              <Card key={teacher.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{teacher.name}</CardTitle>
                  <CardDescription>{teacher.email}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <Badge variant="outline">{teacher.department}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">View Assignments</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="exams" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Exam Management</h2>
          </div>
          
          <div className="grid gap-4">
            {exams.map((exam) => (
              <Card key={exam.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{exam.name}</CardTitle>
                  <CardDescription>
                    {exam.subject?.name} - {exam.subject?.department?.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Date</p>
                      <p className="font-medium">{new Date(exam.exam_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-medium">{exam.duration_minutes} minutes</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Marks</p>
                      <p className="font-medium">{exam.total_marks}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <Badge variant={exam.status === 'scheduled' ? 'default' : 'secondary'}>
                        {exam.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Assigned Teachers:</p>
                    <div className="flex flex-wrap gap-2">
                      {exam.exam_teacher_assignments?.map((assignment, index) => (
                        <Badge key={index} variant="outline">
                          {assignment.teacher?.name}
                          <span className="ml-1 text-xs">
                            (Q: {assignment.assigned_questions?.join(', ')})
                          </span>
                        </Badge>
                      ))}
                      {(!exam.exam_teacher_assignments || exam.exam_teacher_assignments.length === 0) && (
                        <p className="text-sm text-muted-foreground">No teachers assigned</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={() => handleEditExam(exam.id)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleManageStudents(exam)}>
                      <Users className="h-4 w-4 mr-1" />
                      Manage Students
                    </Button>
                    <Select 
                      value={teacherAssignments[exam.id] || ''} 
                      onValueChange={(value) => assignTeacher(exam.id, value)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Assign Teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="files" className="space-y-4">
          <FileUploadManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
