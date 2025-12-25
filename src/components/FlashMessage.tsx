import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlashMessageProps {
  message: string;
  type: 'success' | 'error' | 'warning';
  onClose: () => void;
}

export const FlashMessage = ({ message, type, onClose }: FlashMessageProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
  };

  const styles = {
    success: 'bg-success/10 border-success text-success',
    error: 'bg-destructive/10 border-destructive text-destructive',
    warning: 'bg-warning/10 border-warning text-warning',
  };

  const Icon = icons[type];

  return (
    <div
      className={cn(
        'fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-lg border-2 shadow-lg animate-fade-in',
        styles[type]
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="mr-2 hover:opacity-70 transition-opacity">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
