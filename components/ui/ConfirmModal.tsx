'use client';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  danger?: boolean;
}

export function ConfirmModal({ title, message, onConfirm, onCancel, confirmLabel = 'Delete', danger = true }: ConfirmModalProps) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
        zIndex: 9999, display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: 16,
      }}
      onTouchStart={e => e.stopPropagation()}
    >
      <div
        style={{
          background: 'var(--bg-card)', borderRadius: 16,
          width: '100%', maxWidth: 440,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          border: '1px solid var(--border)',
        }}
        onTouchStart={e => e.stopPropagation()}
      >
        <div style={{ padding: '20px 20px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            {danger && (
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertTriangle size={20} color="#EF4444" />
              </div>
            )}
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{title}</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{message}</p>
        </div>
        <div style={{ padding: '0 20px 20px', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            className="btn-secondary"
            style={{ minHeight: 44 }}
            onTouchEnd={(e) => { e.preventDefault(); onCancel(); }}
            onClick={onCancel}
          >Cancel</button>
          <button
            className={danger ? 'btn-danger' : 'btn-primary'}
            style={{ minHeight: 44 }}
            onTouchEnd={(e) => { e.preventDefault(); onConfirm(); }}
            onClick={onConfirm}
          >{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
