import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/LoginForm';
import Header from '@/components/Header';
import StudentDashboard from '@/components/StudentDashboard';
import TeacherDashboard from '@/components/TeacherDashboard';

const Index = () => {
  const { user } = useAuth();

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {user.role === 'student' ? <StudentDashboard /> : <TeacherDashboard />}
      </main>
    </div>
  );
};

export default Index;
