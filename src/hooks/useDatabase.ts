import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useDepartments = () => {
  const [departments, setDepartments] = useState<Array<{id: string, name: string, code: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const { data, error } = await supabase.rpc('get_departments');
        if (error) throw error;
        setDepartments(data || []);
      } catch (err) {
        console.error('Error fetching departments:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch departments');
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  return { departments, loading, error };
};

export const useTeachers = (departmentName?: string) => {
  const [teachers, setTeachers] = useState<Array<{id: string, name: string, email: string, department: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const { data, error } = await supabase.rpc('get_teachers_by_department', { dept_name: departmentName || null });
        if (error) throw error;
        setTeachers(data || []);
      } catch (err) {
        console.error('Error fetching teachers:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch teachers');
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, [departmentName]);

  return { teachers, loading, error };
};

export const useSubjects = (departmentId?: string) => {
  const [subjects, setSubjects] = useState<Array<{
    id: string, 
    name: string, 
    code: string, 
    department_name: string, 
    semester_name: string, 
    credits: number
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const { data, error } = await supabase.rpc('get_subjects_by_department', { dept_id: departmentId || null });
        if (error) throw error;
        setSubjects(data || []);
      } catch (err) {
        console.error('Error fetching subjects:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch subjects');
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [departmentId]);

  return { subjects, loading, error };
};

export const useExams = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const { data, error } = await supabase
          .from('exams')
          .select(`
            *,
            subject:subjects(name, code, department:departments(name)),
            exam_teacher_assignments(
              teacher:profiles!exam_teacher_assignments_teacher_id_fkey(id, name),
              assigned_questions,
              marks_per_question
            )
          `);
        if (error) throw error;
        setExams(data || []);
      } catch (err) {
        console.error('Error fetching exams:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch exams');
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  return { exams, loading, error, refetch: () => window.location.reload() };
};

export const useAnswerSheets = (currentUserId?: string, role?: string) => {
  const [answerSheets, setAnswerSheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnswerSheets = async () => {
      if (!currentUserId) return;
      
      try {
        let query = supabase
          .from('answer_sheets')
          .select(`
            *,
            exam:exams(
              name,
              subject:subjects(name, department:departments(name))
            ),
            student:profiles!answer_sheets_student_id_fkey(name, email),
            grader:profiles!answer_sheets_graded_by_fkey(name)
          `);

        // Filter based on role
        if (role === 'student') {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', currentUserId)
            .single();
          
          if (profileData) {
            query = query.eq('student_id', profileData.id);
          }
        } else if (role === 'teacher') {
          // Teachers only see sheets assigned to them
          const { data: assignedExams } = await supabase
            .from('exam_teacher_assignments')
            .select('exam_id')
            .eq('teacher_id', currentUserId);
          
          const examIds = assignedExams?.map(a => a.exam_id) || [];
          if (examIds.length > 0) {
            query = query.in('exam_id', examIds);
          }
        }

        const { data, error } = await query;
        if (error) throw error;
        setAnswerSheets(data || []);
      } catch (err) {
        console.error('Error fetching answer sheets:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch answer sheets');
      } finally {
        setLoading(false);
      }
    };

    fetchAnswerSheets();
  }, [currentUserId, role]);

  return { answerSheets, loading, error };
};

export const useGrievances = (currentUserId?: string, role?: string) => {
  const [grievances, setGrievances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGrievances = async () => {
      if (!currentUserId) return;
      
      try {
        let query = supabase
          .from('grievances')
          .select(`
            *,
            answer_sheet:answer_sheets(
              exam:exams(
                name,
                subject:subjects(name)
              ),
              student:profiles!answer_sheets_student_id_fkey(name)
            ),
            student:profiles!grievances_student_id_fkey(name),
            reviewer:profiles!grievances_reviewed_by_fkey(name)
          `);

        // Filter based on role
        if (role === 'student') {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', currentUserId)
            .single();
          
          if (profileData) {
            query = query.eq('student_id', profileData.id);
          }
        } else if (role === 'teacher') {
          // Teachers see grievances for papers they grade
          const { data: assignedSheets } = await supabase
            .from('exam_teacher_assignments')
            .select('exam_id')
            .eq('teacher_id', currentUserId);
          
          if (assignedSheets && assignedSheets.length > 0) {
            const { data: answerSheets } = await supabase
              .from('answer_sheets')
              .select('id')
              .in('exam_id', assignedSheets.map(a => a.exam_id));
            
            const sheetIds = answerSheets?.map(s => s.id) || [];
            if (sheetIds.length > 0) {
              query = query.in('answer_sheet_id', sheetIds);
            }
          }
        }

        const { data, error } = await query;
        if (error) throw error;
        setGrievances(data || []);
      } catch (err) {
        console.error('Error fetching grievances:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch grievances');
      } finally {
        setLoading(false);
      }
    };

    fetchGrievances();
  }, [currentUserId, role]);

  const updateGrievanceStatus = async (grievanceId: string, status: string, response?: string, updatedMarks?: number) => {
    try {
      const updates: any = { status };
      if (response) updates.teacher_response = response;
      if (updatedMarks !== undefined) updates.updated_marks = updatedMarks;
      updates.reviewed_at = new Date().toISOString();
      updates.reviewed_by = currentUserId;

      const { error } = await supabase
        .from('grievances')
        .update(updates)
        .eq('id', grievanceId);

      if (error) throw error;

      // Update local state
      setGrievances(prev => prev.map(g => 
        g.id === grievanceId ? { ...g, ...updates } : g
      ));

      toast.success(`Grievance ${status} successfully!`);
    } catch (err) {
      console.error('Error updating grievance:', err);
      toast.error('Failed to update grievance');
    }
  };

  return { grievances, loading, error, updateGrievanceStatus };
};