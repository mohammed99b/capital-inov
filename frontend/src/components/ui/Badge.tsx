import React from 'react';
import clsx from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'gray' | 'danger';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'gray' }) => {
  const styles = {
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    gray: "bg-gray-100 text-gray-800",
    danger: "bg-red-100 text-red-800"
  };

  return (
    <span className={clsx("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", styles[variant])}>
      {children}
    </span>
  );
};
