import { useState, useCallback, useEffect } from 'react';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  toast: (props: Omit<Toast, 'id'>) => void;
  dismiss: (toastId: string) => void;
}

// Simple toast store using a global variable for now
const toastStore: {
  toasts: Toast[];
  listeners: Set<() => void>;
} = {
  toasts: [],
  listeners: new Set(),
};

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function notifyListeners() {
  toastStore.listeners.forEach(listener => listener());
}

export function useToast(): ToastContextType {
  const [, forceUpdate] = useState({});

  const rerender = useCallback(() => {
    forceUpdate({});
  }, []);

  // Subscribe to toast store changes
  useEffect(() => {
    toastStore.listeners.add(rerender);
    return () => {
      toastStore.listeners.delete(rerender);
    };
  }, [rerender]);

  const toast = useCallback((props: Omit<Toast, 'id'>) => {
    const id = generateId();
    const newToast: Toast = {
      id,
      duration: 5000,
      ...props,
    };

    toastStore.toasts.push(newToast);
    notifyListeners();

    // Auto-dismiss after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, newToast.duration);
    }
  }, []);

  const dismiss = useCallback((toastId: string) => {
    toastStore.toasts = toastStore.toasts.filter(t => t.id !== toastId);
    notifyListeners();
  }, []);

  return {
    toasts: toastStore.toasts,
    toast,
    dismiss,
  };
}

// Convenience functions
export const toast = {
  success: (props: Omit<Toast, 'id' | 'type'>) => {
    const newToast: Toast = {
      id: generateId(),
      type: 'success',
      duration: 5000,
      ...props,
    };
    toastStore.toasts.push(newToast);
    notifyListeners();

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        toastStore.toasts = toastStore.toasts.filter(t => t.id !== newToast.id);
        notifyListeners();
      }, newToast.duration);
    }
  },
  error: (props: Omit<Toast, 'id' | 'type'>) => {
    const newToast: Toast = {
      id: generateId(),
      type: 'error',
      duration: 7000,
      ...props,
    };
    toastStore.toasts.push(newToast);
    notifyListeners();

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        toastStore.toasts = toastStore.toasts.filter(t => t.id !== newToast.id);
        notifyListeners();
      }, newToast.duration);
    }
  },
  warning: (props: Omit<Toast, 'id' | 'type'>) => {
    const newToast: Toast = {
      id: generateId(),
      type: 'warning',
      duration: 6000,
      ...props,
    };
    toastStore.toasts.push(newToast);
    notifyListeners();

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        toastStore.toasts = toastStore.toasts.filter(t => t.id !== newToast.id);
        notifyListeners();
      }, newToast.duration);
    }
  },
  info: (props: Omit<Toast, 'id' | 'type'>) => {
    const newToast: Toast = {
      id: generateId(),
      type: 'info',
      duration: 5000,
      ...props,
    };
    toastStore.toasts.push(newToast);
    notifyListeners();

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        toastStore.toasts = toastStore.toasts.filter(t => t.id !== newToast.id);
        notifyListeners();
      }, newToast.duration);
    }
  },
};