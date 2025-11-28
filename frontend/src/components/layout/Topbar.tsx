import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LogOut, Menu, User as UserIcon } from 'lucide-react';

interface TopbarProps {
  onMenuClick?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow-sm">
      <div className="flex-1 px-4 flex justify-between">
        <div className="flex-1 flex items-center md:hidden">
            <button
              type="button"
              className="-ml-2 mr-2 p-2 rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              onClick={onMenuClick}
            >
              <Menu className="h-6 w-6" />
            </button>
            <span className="ml-2 font-bold text-gray-700">BTP Manager</span>
        </div>
        <div className="flex-1 flex justify-end items-center">
            <div className="flex items-center space-x-4">
                <div className="flex flex-col text-right hidden sm:block">
                    <span className="text-sm font-medium text-gray-900">
                        {user?.first_name} {user?.last_name || user?.username}
                    </span>
                    <span className="text-xs text-gray-500">{user?.role}</span>
                </div>
                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                    <UserIcon className="h-5 w-5 text-gray-500" />
                </div>
                <button
                    onClick={handleLogout}
                    className="p-2 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 focus:outline-none transition-colors"
                    title="Déconnexion"
                >
                    <LogOut className="h-5 w-5" />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};