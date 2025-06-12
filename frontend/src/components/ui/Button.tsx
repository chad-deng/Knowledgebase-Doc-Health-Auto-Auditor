import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success' | 'warning';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const buttonVariants = {
  primary: [
    'bg-blue-600 hover:bg-blue-700 active:bg-blue-800',
    'text-white',
    'shadow-sm hover:shadow-md',
    'focus:ring-blue-500 dark:focus:ring-blue-400',
    'dark:bg-blue-700 dark:hover:bg-blue-600 dark:active:bg-blue-800'
  ].join(' '),
  
  secondary: [
    'bg-gray-100 hover:bg-gray-200 active:bg-gray-300',
    'text-gray-900',
    'border border-gray-300 hover:border-gray-400',
    'focus:ring-gray-500',
    'dark:bg-gray-700 dark:hover:bg-gray-600 dark:active:bg-gray-800',
    'dark:text-gray-100 dark:border-gray-600 dark:hover:border-gray-500'
  ].join(' '),
  
  outline: [
    'bg-transparent hover:bg-gray-50 active:bg-gray-100',
    'text-gray-700 hover:text-gray-900',
    'border-2 border-gray-300 hover:border-gray-400',
    'focus:ring-gray-500',
    'dark:hover:bg-gray-800 dark:active:bg-gray-700',
    'dark:text-gray-300 dark:hover:text-gray-100',
    'dark:border-gray-600 dark:hover:border-gray-500'
  ].join(' '),
  
  ghost: [
    'bg-transparent hover:bg-gray-100 active:bg-gray-200',
    'text-gray-700 hover:text-gray-900',
    'focus:ring-gray-500',
    'dark:hover:bg-gray-800 dark:active:bg-gray-700',
    'dark:text-gray-300 dark:hover:text-gray-100'
  ].join(' '),
  
  destructive: [
    'bg-red-600 hover:bg-red-700 active:bg-red-800',
    'text-white',
    'shadow-sm hover:shadow-md',
    'focus:ring-red-500 dark:focus:ring-red-400',
    'dark:bg-red-700 dark:hover:bg-red-600 dark:active:bg-red-800'
  ].join(' '),
  
  success: [
    'bg-green-600 hover:bg-green-700 active:bg-green-800',
    'text-white',
    'shadow-sm hover:shadow-md',
    'focus:ring-green-500 dark:focus:ring-green-400',
    'dark:bg-green-700 dark:hover:bg-green-600 dark:active:bg-green-800'
  ].join(' '),
  
  warning: [
    'bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700',
    'text-white',
    'shadow-sm hover:shadow-md',
    'focus:ring-yellow-500 dark:focus:ring-yellow-400',
    'dark:bg-yellow-600 dark:hover:bg-yellow-500 dark:active:bg-yellow-700'
  ].join(' '),
};

const buttonSizes = {
  xs: 'px-2 py-1 text-xs min-h-[24px]',
  sm: 'px-3 py-1.5 text-sm min-h-[32px]',
  md: 'px-4 py-2 text-sm min-h-[36px]',
  lg: 'px-6 py-2.5 text-base min-h-[40px]',
  xl: 'px-8 py-3 text-lg min-h-[48px]',
};

const iconSizes = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
  xl: 'h-6 w-6',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  disabled,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  
  return (
    <button
      type={type}
      className={cn(
        // Base styles
        'inline-flex items-center justify-center font-medium',
        'rounded-lg transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800',
        'transform active:scale-[0.98]',
        
        // Interactive states
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
        'disabled:hover:shadow-none disabled:active:scale-100',
        
        // Variant styles
        buttonVariants[variant],
        
        // Size styles
        buttonSizes[size],
        
        // Width
        fullWidth && 'w-full',
        
        // Loading state
        loading && 'cursor-wait',
        
        className
      )}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      {...props}
    >
      {/* Left Icon */}
      {leftIcon && !loading && (
        <span 
          className={cn(
            'flex-shrink-0',
            iconSizes[size],
            children && 'mr-2'
          )}
          aria-hidden="true"
        >
          {leftIcon}
        </span>
      )}
      
      {/* Loading Spinner */}
      {loading && (
        <span
          className={cn(
            'flex-shrink-0 animate-spin',
            iconSizes[size],
            children && 'mr-2'
          )}
          aria-hidden="true"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="h-full w-full"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              className="opacity-25"
            />
            <path
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              className="opacity-75"
            />
          </svg>
        </span>
      )}
      
      {/* Button Content */}
      {children && (
        <span className="flex-1 truncate">
          {children}
        </span>
      )}
      
      {/* Right Icon */}
      {rightIcon && !loading && (
        <span 
          className={cn(
            'flex-shrink-0',
            iconSizes[size],
            children && 'ml-2'
          )}
          aria-hidden="true"
        >
          {rightIcon}
        </span>
      )}
    </button>
  );
} 
