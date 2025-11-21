import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ModeToggle } from '@/components/mode-toggle';
import { LogOut, User } from 'lucide-react';

const Header = () => {
  const { user, signOut } = useAuth();

  const getUserName = () => {
    return user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  };

  const getUserRole = () => {
    if (user?.user_metadata?.role) {
      return user.user_metadata.role;
    }
    // Fallback logic based on email patterns
    if (user?.email?.includes('admin')) return 'admin';
    if (user?.email?.includes('controller')) return 'controller';
    if (user?.email?.includes('teacher') || user?.email?.includes('prof')) return 'teacher';
    return 'student';
  };

  const getUserDepartment = () => {
    return user?.user_metadata?.department || 'Department';
  };

  const handleLogout = () => {
    signOut();
  };

  return (
    <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl shadow-2xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-4">
            <img 
              src="/lovable-uploads/0f31024b-b89b-49e8-b740-2ea425995c4e.png" 
              alt="SPIT Logo" 
              className="w-14 h-14 object-contain animate-float"
            />
            <div>
              <h1 className="text-xl font-bold text-gradient tracking-tight">SPIT Answer Sheet Portal</h1>
              <p className="text-sm text-muted-foreground">Sardar Patel Institute of Technology</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <ModeToggle />
            {user && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-foreground">{getUserName()}</p>
                    <p className="text-muted-foreground capitalize">{getUserRole()} • {getUserDepartment()}</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/30"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;