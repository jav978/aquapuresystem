import { ref, computed } from 'vue';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  icon?: string;
}

const toasts = ref<Toast[]>([]);

export function useToast() {
  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const duration = toast.duration ?? 4500;
    
    // Auto-detect default icon if not provided
    let icon = toast.icon;
    if (!icon) {
      switch (toast.type) {
        case 'success':
          icon = 'check_circle';
          break;
        case 'error':
          icon = 'error';
          break;
        case 'warning':
          icon = 'warning';
          break;
        case 'info':
          icon = 'info';
          break;
      }
    }

    const newToast: Toast = {
      ...toast,
      id,
      duration,
      icon,
    };

    toasts.value.push(newToast);

    if (duration > 0 && typeof window !== 'undefined') {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  };

  const removeToast = (id: string) => {
    const index = toasts.value.findIndex(t => t.id === id);
    if (index > -1) {
      toasts.value.splice(index, 1);
    }
  };

  const clearAll = () => {
    toasts.value = [];
  };

  const success = (title: string, message?: string, duration?: number) =>
    addToast({ type: 'success', title, message, duration });

  const error = (title: string, message?: string, duration?: number) =>
    addToast({ type: 'error', title, message, duration });

  const warning = (title: string, message?: string, duration?: number) =>
    addToast({ type: 'warning', title, message, duration });

  const info = (title: string, message?: string, duration?: number) =>
    addToast({ type: 'info', title, message, duration });

  // Semantic CRUD Toast Helpers
  const createSuccess = (entity: string, detail?: string) =>
    success(`¡${entity} creado!`, detail || `${entity} se ha registrado exitosamente.`);

  const updateSuccess = (entity: string, detail?: string) =>
    success(`¡${entity} actualizado!`, detail || `Los cambios en ${entity.toLowerCase()} se han guardado.`);

  const deleteSuccess = (entity: string, detail?: string) =>
    info(`¡${entity} eliminado!`, detail || `${entity} ha sido removido del sistema.`);

  return {
    toasts: computed(() => toasts.value),
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    warning,
    info,
    createSuccess,
    updateSuccess,
    deleteSuccess,
  };
}