import { useToast } from '@/hooks/useToast';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { Button } from './button';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => {
        const Icon = {
          success: CheckCircle,
          error: XCircle,
          warning: AlertTriangle,
          info: Info,
        }[toast.type];

        const bgColor = {
          success: 'bg-green-50 border-green-200',
          error: 'bg-red-50 border-red-200',
          warning: 'bg-yellow-50 border-yellow-200',
          info: 'bg-blue-50 border-blue-200',
        }[toast.type];

        const iconColor = {
          success: 'text-green-600',
          error: 'text-red-600',
          warning: 'text-yellow-600',
          info: 'text-blue-600',
        }[toast.type];

        const textColor = {
          success: 'text-green-800',
          error: 'text-red-800',
          warning: 'text-yellow-800',
          info: 'text-blue-800',
        }[toast.type];

        return (
          <div
            key={toast.id}
            className={`
              ${bgColor} ${textColor} 
              border rounded-lg p-4 shadow-lg 
              animate-in slide-in-from-right duration-300
              min-w-0 flex items-start gap-3
            `}
          >
            <Icon className={`h-5 w-5 ${iconColor} flex-shrink-0 mt-0.5`} />
            <div className="flex-1 min-w-0">
              {toast.title && (
                <div className="font-medium text-sm mb-1">
                  {toast.title}
                </div>
              )}
              {toast.description && (
                <div className="text-sm opacity-90">
                  {toast.description}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-gray-400 hover:text-gray-600 flex-shrink-0"
              onClick={() => dismiss(toast.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}