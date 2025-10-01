import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Menu, User, Search, LogOut, Settings, Shield } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
    
    toast.success({
      title: 'Signed out',
      description: 'You have been successfully signed out.',
    });
  };

  const handleProfileClick = () => {
    setShowUserMenu(false);
    navigate('/profile');
  };

  const handleAdminClick = () => {
    setShowUserMenu(false);
    navigate('/admin');
  };

  return (
    <nav className="bg-[#F8F9FA] shadow-lg border-b border-[#FFD700] sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#FFD700] rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">🕉</span>
            </div>
            <span className="text-xl font-bold text-[#FFD700]">DivyaYatri</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-[#FFD700] hover:text-[#FFF8E7] transition-colors">
              Home
            </Link>
            <Link to="/temples" className="text-[#FFD700] hover:text-[#FFF8E7] transition-colors">
              Temples
            </Link>
            <Link to="/about" className="text-[#FFD700] hover:text-[#FFF8E7] transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-[#FFD700] hover:text-[#FFF8E7] transition-colors">
              Contact
            </Link>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="hidden md:flex text-[#FFD700] hover:text-[#FFF8E7] hover:bg-[#FFD700]/10 hover:scale-110 transition-all duration-200 ease-in-out">
              <Search className="h-5 w-5" />
            </Button>
            
            {isAuthenticated && user ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 group hover:bg-[#FFD700]/10 transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-[#FF6F3C] text-white rounded-full flex items-center justify-center text-sm font-medium shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
                    {user.firstName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:block text-[#FFD700] group-hover:text-[#FFF8E7] transition-colors">{user.firstName}</span>
                </Button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                      <div className="font-medium">{user.firstName} {user.lastName}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                    
                    <button
                      onClick={handleProfileClick}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Profile Settings</span>
                    </button>

                    {(user.role === 'admin' || user.role === 'temple_manager') && (
                      <button
                        onClick={handleAdminClick}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <Shield className="h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </button>
                    )}

                    <div className="border-t border-gray-100 mt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </nav>
  );
}