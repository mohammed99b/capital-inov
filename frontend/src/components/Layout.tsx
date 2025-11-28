import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LayoutDashboard, HardHat, ShoppingCart, LogOut, Menu } from 'lucide-react';
import clsx from 'clsx';

export const Sidebar = () => {
  const location = useLocation();
  const navigation = [
    { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Chantiers', href: '/chantiers', icon: HardHat },
    { name: 'Achats', href: '/achats', icon: ShoppingCart },
  ];

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-gray-200 bg-white">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center h-16 flex-shrink-0 px-4 bg-primary-600">
          <h1 className="text-white text-xl font-bold tracking-tight">BTP Manager</h1>
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={clsx(
                    isActive
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                  )}
                >
                  <item.icon
                    className={clsx(
                      isActive ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500',
                      'mr-3 flex-shrink-0 h-6 w-6'
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};

export const Topbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow-sm md:pl-64">
      <div className="flex-1 px-4 flex justify-between">
        <div className="flex-1 flex items-center md:hidden">
            <Menu className="h-6 w-6 text-gray-500" />
            <span className="ml-2 font-bold text-gray-700">BTP Manager</span>
        </div>
        <div className="flex-1 flex justify-end items-center">
            <span className="text-sm text-gray-700 mr-4">
                {user?.first_name} {user?.last_name} <span className="text-xs text-gray-500">({user?.role})</span>
            </span>
            <button
                onClick={handleLogout}
                className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none"
                title="Déconnexion"
            >
                <LogOut className="h-6 w-6" />
            </button>
        </div>
      </div>
    </div>
  );
};

export const AppLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="md:pl-64 flex flex-col flex-1">
        <Topbar />
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
