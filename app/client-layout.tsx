'use client';
import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { darkMode, loadAll, error, clearError } = useStore();

  useEffect(() => {
    const timer = setTimeout(() => { loadAll(); }, 150);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar — slides in on mobile, always visible on desktop */}
      <Sidebar />

      {/* Main content */}
      <main
        className="sidebar-desktop-push"
        style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}
      >
        {/* Error banner */}
        {error && (
          <div style={{
            background: '#FEE2E2', color: '#991B1B',
            padding: '10px 16px', fontSize: 13, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 12, zIndex: 100,
          }}>
            <span>⚠️ {error}</span>
            <button onClick={clearError} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 800, color: '#991B1B', fontSize: 18, lineHeight: 1 }}>×</button>
          </div>
        )}

        {children}

        {/* Bottom nav for mobile */}
        <BottomNav />
      </main>
    </div>
  );
}
