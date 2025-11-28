import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, HardHat, ShoppingCart, Settings, Users, Package, X } from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigation = [
    { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Chantiers', href: '/chantiers', icon: HardHat },
    { name: 'Achats', href: '/achats', icon: ShoppingCart },
    { name: 'Stock', href: '#', icon: Package, current: false }, 
    { name: 'RH', href: '#', icon: Users, current: false },
    { name: 'Paramètres', href: '#', icon: Settings, current: false },
  ];

  const NavContent = () => (
    <div className="flex-1 flex flex-col min-h-0 bg-white h-full border-r border-gray-200">
      <div className="flex items-center h-16 flex-shrink-0 px-4 bg-blue-600">
        <h1 className="text-white text-xl font-bold tracking-tight">BTP Manager</h1>
      </div>
      <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
        <nav className="flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href) && item.href !== '#';
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={onClose} // Close sidebar on mobile when clicking a link
                className={clsx(
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors'
                )}
              >
                <item.icon
                  className={clsx(
                    isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500',
                    'mr-3 flex-shrink-0 h-5 w-5'
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <div className={clsx("fixed inset-0 z-40 flex md:hidden", isOpen ? "pointer-events-auto" : "pointer-events-none")}>
        
        {/* Backdrop */}
        <div 
          className={clsx(
            "fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ease-linear duration-300",
            isOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={onClose}
        />

        {/* Slide-in Sidebar */}
        <div 
          className={clsx(
            "relative flex-1 flex flex-col max-w-xs w-full bg-white transition ease-in-out duration-300 transform",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={onClose}
            >
              <X className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>
          <NavContent />
        </div>
        
        <div className="flex-shrink-0 w-14">
          {/* Force sidebar to shrink to fit close icon */}
        </div>
      </div>

      {/* Desktop Static Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <NavContent />
      </div>
    </>
  );
};