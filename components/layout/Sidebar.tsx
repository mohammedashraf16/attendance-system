'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, ClipboardCheck, BarChart3, Settings, X, GraduationCap } from 'lucide-react';
import { useStore } from '@/store/useStore';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/groups', label: 'Groups', icon: Users },
  { href: '/attendance', label: 'Attendance', icon: ClipboardCheck },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useStore();

  return (
    <>
      {/* Overlay - mobile only */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 40,
          }}
        />
      )}

      {/* Sidebar panel */}
      <aside
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: 240,
          height: '100vh',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          padding: '0 12px 24px',
          background: 'var(--bg-card)',
          borderRight: '1px solid var(--border)',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
          willChange: 'transform',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '20px 4px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={20} color="white" />
            </div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: 'var(--text)' }}>AttendX</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 8, display: 'flex', borderRadius: 8 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px', borderRadius: 10,
                  fontSize: 15, fontWeight: active ? 600 : 500,
                  color: active ? 'var(--primary)' : 'var(--text-muted)',
                  background: active ? 'var(--primary-light)' : 'transparent',
                  textDecoration: 'none', transition: 'all 0.15s',
                  minHeight: 48,
                }}
              >
                <Icon size={20} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px 4px 0', borderTop: '1px solid var(--border)' }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>AttendX v1.0 · Offline · Auto-save</p>
        </div>
      </aside>

      {/* Desktop: always visible via CSS */}
      <style>{`
        @media (min-width: 1024px) {
          aside { transform: translateX(0) !important; }
          .sidebar-desktop-push { margin-left: 240px; }
        }
      `}</style>
    </>
  );
}
