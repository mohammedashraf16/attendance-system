'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, ClipboardCheck, BarChart3, Settings } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home', icon: LayoutDashboard },
  { href: '/groups', label: 'Groups', icon: Users },
  { href: '/attendance', label: 'Attendance', icon: ClipboardCheck },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Bottom nav - mobile only */}
      <nav style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        height: 64,
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        zIndex: 35,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
        className="bottom-nav"
      >
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                textDecoration: 'none',
                color: active ? 'var(--primary)' : 'var(--text-muted)',
                fontSize: 10,
                fontWeight: active ? 700 : 500,
                padding: '8px 0',
                transition: 'color 0.15s',
                minHeight: 56,
              }}
            >
              <div style={{
                width: 36, height: 28,
                borderRadius: 8,
                background: active ? 'var(--primary-light)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
              }}>
                <Icon size={20} />
              </div>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Spacer so content doesn't hide behind bottom nav */}
      <div className="bottom-nav-spacer" style={{ height: 64 }} />

      <style>{`
        /* Show bottom nav only on mobile */
        @media (min-width: 1024px) {
          .bottom-nav { display: none !important; }
          .bottom-nav-spacer { display: none !important; }
        }
      `}</style>
    </>
  );
}
