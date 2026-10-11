import React, { type ReactElement } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  startIcon?: ReactElement;
  endIcon?: ReactElement;
  fullwidth?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
}

const variantClasses = {
  primary:
    'bg-zinc-900 hover:bg-black text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 font-semibold shadow-sm focus-visible:ring-emerald-500',
  secondary:
    'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 font-medium border border-slate-200 dark:border-zinc-700',
  outline:
    'bg-transparent hover:bg-slate-100 text-slate-700 dark:text-zinc-300 dark:hover:bg-zinc-900 border border-slate-200 dark:border-zinc-800 font-medium',
  ghost:
    'bg-transparent hover:bg-slate-100 text-slate-700 dark:text-zinc-300 dark:hover:bg-zinc-900 font-medium',
  danger:
    'bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-sm focus-visible:ring-rose-500',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2 text-xs sm:text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-sm sm:text-base rounded-xl gap-2.5',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  text,
  startIcon,
  endIcon,
  fullwidth = false,
  loading = false,
  disabled,
  children,
  className = '',
  type = 'button',
  ...props
}) => {
  const content = children || text;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`inline-flex items-center justify-center transition-all cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950 ${
        variantClasses[variant]
      } ${sizeClasses[size]} ${fullwidth ? 'w-full' : ''} ${
        disabled || loading ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'active:scale-[0.98]'
      } ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        startIcon && <span className="shrink-0">{startIcon}</span>
      )}
      {content && <span>{content}</span>}
      {!loading && endIcon && <span className="shrink-0">{endIcon}</span>}
    </button>
  );
};

export default Button;
