import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, className, ...props }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background px-4 py-2";

  const variantClasses = {
    primary: "bg-[#5A67D8] text-white hover:bg-[#4C5ADF]",
    secondary: "bg-[#232533] text-text-primary hover:bg-[#303348]",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "hover:bg-accent hover:text-accent-foreground",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export { Button };