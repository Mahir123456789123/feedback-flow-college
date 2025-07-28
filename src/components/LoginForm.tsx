import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { BookOpen, GraduationCap } from 'lucide-react';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('student');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent, role: 'teacher' | 'student') => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    const success = await login(email, password, role);
    
    if (success) {
      toast.success(`Welcome! Logged in as ${role}`);
    } else {
      toast.error('Invalid credentials. Try the demo credentials below.');
    }
  };

  const fillDemoCredentials = (role: 'teacher' | 'student') => {
    if (role === 'teacher') {
      setEmail('sarah.johnson@college.edu');
      setPassword('demo123');
    } else {
      setEmail('alex.kumar@student.college.edu');
      setPassword('demo123');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-academic-light to-academic-blue/10 p-4">
      <Card className="w-full max-w-md shadow-academic">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-academic rounded-full flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Answer Sheet Portal</CardTitle>
            <CardDescription>Login to access your academic records</CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="student" className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Student
              </TabsTrigger>
              <TabsTrigger value="teacher" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Teacher
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="student" className="space-y-4 mt-6">
              <form onSubmit={(e) => handleSubmit(e, 'student')} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="student-email">Email</Label>
                  <Input
                    id="student-email"
                    type="email"
                    placeholder="student@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-password">Password</Label>
                  <Input
                    id="student-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign in as Student'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => fillDemoCredentials('student')}
                >
                  Use Demo Student Account
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="teacher" className="space-y-4 mt-6">
              <form onSubmit={(e) => handleSubmit(e, 'teacher')} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teacher-email">Email</Label>
                  <Input
                    id="teacher-email"
                    type="email"
                    placeholder="teacher@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teacher-password">Password</Label>
                  <Input
                    id="teacher-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign in as Teacher'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => fillDemoCredentials('teacher')}
                >
                  Use Demo Teacher Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;