import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ModeToggle } from '@/components/mode-toggle';
import { LogOut, User } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-4">
            <img 
              src="/lovable-uploads/0f31024b-b89b-49e8-b740-2ea425995c4e.png" 
              alt="SPIT Logo" 
              className="w-14 h-14 object-contain"
            />
            <div>
              <h1 className="text-xl font-bold text-foreground">SPIT Answer Sheet Portal</h1>
              <p className="text-sm text-muted-foreground">Sardar Patel Institute of Technology</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <ModeToggle />
            {user && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-academic rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-foreground">{user.name}</p>
                    <p className="text-muted-foreground capitalize">{user.role} • {user.department}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={logout}>
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