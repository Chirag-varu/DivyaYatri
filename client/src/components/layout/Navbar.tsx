import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu, User, LogOut, Settings, Shield } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

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

  const handleMobileNavClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
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
            <Link 
              to="/" 
              className={`font-medium px-4 py-2 rounded-4xl transition-colors ${
                isActiveRoute('/') 
                  ? 'text-[hsl(27,83%,28%)] bg-amber-100' 
                  : 'text-primary hover:text-secondary'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/temples" 
              className={`font-medium px-4 py-2 rounded-4xl transition-colors ${
                isActiveRoute('/temples') 
                  ? 'text-[hsl(27,83%,28%)] bg-amber-100' 
                  : 'text-primary hover:text-secondary'
              }`}
            >
              Temples
            </Link>
            <Link 
              to="/about" 
              className={`font-medium px-4 py-2 rounded-4xl transition-colors ${
                isActiveRoute('/about') 
                  ? 'text-[hsl(27,83%,28%)] bg-amber-100' 
                  : 'text-primary hover:text-secondary'
              }`}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className={`font-medium px-4 py-2 rounded-4xl transition-colors ${
                isActiveRoute('/contact') 
                  ? 'text-[hsl(27,83%,28%)] bg-amber-100' 
                  : 'text-primary hover:text-secondary'
              }`}
            >
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
                      {user.name && typeof user.name === "string"
                        ? user.name.charAt(0).toUpperCase()
                        : "U"}
                    </div>

                    {/* User Name (hidden on small screens) */}
                    <span className="hidden md:block text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {user.name && typeof user.name === "string"
                        ? user.name
                        : "User"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  className="w-64 p-2 rounded-xl shadow-lg border border-border/50 bg-card bg-amber-50"
                  align="end"
                  forceMount
                >
                  {/* User Info */}
                  <DropdownMenuLabel className="font-normal p-3 bg-muted/30 rounded-lg mb-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none text-foreground">
                        {user.name}
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
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-primary hover:text-secondary hover:bg-secondary/10">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-amber-100/90">
                <SheetHeader>
                  <SheetTitle className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center shadow-md">
                      <span className="text-primary font-bold text-lg">🕉</span>
                    </div>
                    <span className="text-xl font-bold text-primary">DivyaYatri</span>
                  </SheetTitle>
                  <SheetDescription>
                    Navigate through our spiritual journey
                  </SheetDescription>
                </SheetHeader>
                
                <div className="grid gap-4 py-6">
                  {/* Mobile Navigation Links */}
                  <div className="grid gap-2">
                    <Button
                      variant="ghost"
                      className={`justify-start text-left h-12 px-4 ${
                        isActiveRoute('/') 
                          ? 'text-[hsl(27,83%,28%)] bg-amber-200/60 rounded-4xl' 
                          : 'text-foreground hover:text-secondary hover:bg-accent/10'
                      }`}
                      onClick={() => handleMobileNavClick('/')}
                    >
                      Home
                    </Button>
                    
                    <Button
                      variant="ghost"
                      className={`justify-start text-left h-12 px-4 ${
                        isActiveRoute('/temples') 
                          ? 'text-[hsl(27,83%,28%)] bg-amber-200/60 rounded-4xl' 
                          : 'text-foreground hover:text-secondary hover:bg-accent/10'
                      }`}
                      onClick={() => handleMobileNavClick('/temples')}
                    >
                      Temples
                    </Button>
                    
                    <Button
                      variant="ghost"
                      className={`justify-start text-left h-12 px-4 ${
                        isActiveRoute('/about') 
                          ? 'text-[hsl(27,83%,28%)] bg-amber-200/60 rounded-4xl' 
                          : 'text-foreground hover:text-secondary hover:bg-accent/10'
                      }`}
                      onClick={() => handleMobileNavClick('/about')}
                    >
                      About
                    </Button>
                    
                    <Button
                      variant="ghost"
                      className={`justify-start text-left h-12 px-4 ${
                        isActiveRoute('/contact') 
                          ? 'text-[hsl(27,83%,28%)] bg-amber-200/60 rounded-4xl' 
                          : 'text-foreground hover:text-secondary hover:bg-accent/10'
                      }`}
                      onClick={() => handleMobileNavClick('/contact')}
                    >
                      Contact
                    </Button>
                  </div>
                  
                  {/* Separator */}
                  <div className="border-t border-border/20 my-4"></div>
                  
                  {/* Mobile Auth Section */}
                  {isAuthenticated && user ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3 px-4 py-3 bg-muted/30 rounded-lg">
                        <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary text-background rounded-full flex items-center justify-center text-sm font-semibold">
                          {user.firstName && typeof user.firstName === "string"
                            ? user.firstName.charAt(0).toUpperCase()
                            : "U"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-12 px-4"
                        onClick={() => handleMobileNavClick('/profile')}
                      >
                        <Settings className="mr-3 h-4 w-4" />
                        Profile Settings
                      </Button>
                      
                      {(user.role === "admin" || user.role === "temple_admin") && (
                        <Button
                          variant="ghost"
                          className="w-full justify-start h-12 px-4"
                          onClick={() => handleMobileNavClick('/admin')}
                        >
                          <Shield className="mr-3 h-4 w-4" />
                          Admin Dashboard
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-12 px-4 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full h-12 justify-center"
                        onClick={() => handleMobileNavClick('/login')}
                      >
                        <User className="mr-2 h-4 w-4" />
                        Login
                      </Button>
                      
                      <Button
                        className="w-full h-12 from-primary to-secondary text-background hover:opacity-90"
                        onClick={() => handleMobileNavClick('/register')}
                      >
                        Sign Up
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}