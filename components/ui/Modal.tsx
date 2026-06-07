'use client';
import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: number;
}

export function Modal({ title, onClose, children, maxWidth = 460 }: ModalProps) {
  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(3px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
      onTouchStart={e => e.stopPropagation()}
    >
      <div
        style={{
          background: 'var(--bg-card)',
          borderRadius: 20,
          width: '100%',
          maxWidth,
          boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
          border: '1px solid var(--border)',
          animation: 'modalIn 0.2s cubic-bezier(0.34,1.56,0.64,1)',
        }}
        onClick={e => e.stopPropagation()}
        onTouchStart={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 20px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h3 style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: 18, fontWeight: 700,
            margin: 0, color: 'var(--text)',
          }}>{title}</h3>
          <button
            onClick={onClose}
            onTouchEnd={(e) => { e.preventDefault(); onClose(); }}
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)',
            }}
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);   }
        }
      `}</style>
    </div>
  );
}
