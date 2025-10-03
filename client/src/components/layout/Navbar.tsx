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
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-3 px-2 py-1 hover:bg-accent/10 rounded-full transition-all duration-200 group"
                  >
                    {/* Avatar */}
                    <div className="w-9 h-9   from-primary to-secondary text-background rounded-full flex items-center justify-center text-sm font-semibold shadow-sm group-hover:shadow-md group-hover:scale-105 transition-transform">
                      {user.firstName && typeof user.firstName === "string"
                        ? user.firstName.charAt(0).toUpperCase()
                        : "U"}
                    </div>

                    {/* User Name (hidden on small screens) */}
                    <span className="hidden md:block text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {user.firstName && typeof user.firstName === "string"
                        ? user.firstName
                        : "User"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  className="w-64 p-2 rounded-xl shadow-lg border border-border/50 bg-card"
                  align="end"
                  forceMount
                >
                  {/* User Info */}
                  <DropdownMenuLabel className="font-normal p-3 bg-muted/30 rounded-lg mb-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none text-foreground">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  {/* Profile Settings */}
                  <DropdownMenuItem
                    onClick={handleProfileClick}
                    className="cursor-pointer rounded-md hover:bg-accent/10 transition-colors"
                  >
                    <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Profile Settings</span>
                  </DropdownMenuItem>

                  {/* Admin Dashboard (Conditional) */}
                  {(user.role === "admin" || user.role === "temple_admin") && (
                    <DropdownMenuItem
                      onClick={handleAdminClick}
                      className="cursor-pointer rounded-md hover:bg-accent/10 transition-colors"
                    >
                      <Shield className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Admin Dashboard</span>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />

                  {/* Logout */}
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 rounded-full px-4"
                  >
                    <User className="h-4 w-4" />
                    Login
                  </Button>
                </Link>

                <Link to="/register">
                  <Button className="rounded-full px-5 from-primary to-secondary shadow hover:opacity-90 transition-all">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}


            {/* Mobile menu button */}
            {/* <Button variant="ghost" size="icon" className="md:hidden text-primary hover:text-secondary hover:bg-secondary/10">
              <Menu className="h-5 w-5" />
            </Button> */}
          </div>
        </div>
      </div>
    </nav>
  );
}