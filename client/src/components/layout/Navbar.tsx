import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, User, Search, LogOut, Settings, Shield } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    
    toast.success({
      title: 'Signed out',
      description: 'You have been successfully signed out.',
    });
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleAdminClick = () => {
    navigate('/admin');
  };

  return (
    <nav className="bg-background/95 backdrop-blur-md shadow-lg border-b border-secondary/20 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center shadow-md">
              <span className="text-primary font-bold text-lg">🕉</span>
            </div>
            <span className="text-xl font-bold text-primary">DivyaYatri</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-primary hover:text-secondary transition-colors font-medium">
              Home
            </Link>
            <Link to="/temples" className="text-primary hover:text-secondary transition-colors font-medium">
              Temples
            </Link>
            <Link to="/about" className="text-primary hover:text-secondary transition-colors font-medium">
              About
            </Link>
            <Link to="/contact" className="text-primary hover:text-secondary transition-colors font-medium">
              Contact
            </Link>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="hidden md:flex text-primary hover:text-secondary hover:bg-secondary/10 hover:scale-110 transition-all duration-200 ease-in-out">
              <Search className="h-5 w-5" />
            </Button>
            
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 group hover:bg-secondary/10 transition-all duration-200"
                  >
                    <div className="w-8 h-8 bg-accent text-background rounded-full flex items-center justify-center text-sm font-medium shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
                      {user.firstName && typeof user.firstName === 'string' ? user.firstName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="hidden md:block text-primary group-hover:text-secondary transition-colors">
                      {user.firstName && typeof user.firstName === 'string' ? user.firstName : 'User'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleProfileClick}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Profile Settings</span>
                  </DropdownMenuItem>
                  {(user.role === 'admin' || user.role === 'temple_admin') && (
                    <DropdownMenuItem onClick={handleAdminClick}>
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline">
                    <User className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </Link>
                
                <Link to="/register">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <Button variant="ghost" size="icon" className="md:hidden text-primary hover:text-secondary hover:bg-secondary/10">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}