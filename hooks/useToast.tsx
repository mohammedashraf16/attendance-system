'use client';
import { useState, useCallback } from 'react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

let toastId = 0;
let globalAdd: ((msg: string, type?: Toast['type']) => void) | null = null;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const add = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  return { toasts, add };
}

export function ToastContainer({ toasts }: { toasts: { id: number; message: string; type: string }[] }) {
  if (toasts.length === 0) return null;
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 100, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            background: t.type === 'error' ? '#EF4444' : t.type === 'success' ? '#22C55E' : '#2563EB',
            color: 'white',
            padding: '10px 20px',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            animation: 'slideUp 0.3s ease',
            maxWidth: 320,
          }}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
