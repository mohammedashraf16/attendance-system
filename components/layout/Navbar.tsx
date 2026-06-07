'use client';
import { Menu, Moon, Sun } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface NavbarProps {
  title: string;
  subtitle?: string;
}

export function Navbar({ title, subtitle }: NavbarProps) {
  const { setSidebarOpen, darkMode, toggleDarkMode } = useStore();

  return (
    <header style={{
      height: 60,
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: 12,
      position: 'sticky',
      top: 0,
      zIndex: 30,
    }}>
      {/* Hamburger — always visible, opens sidebar */}
      <button
        onClick={() => setSidebarOpen(true)}
        style={{
          width: 40, height: 40, borderRadius: 10,
          border: '1px solid var(--border)',
          background: 'var(--bg-secondary)',
          cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          color: 'var(--text)', flexShrink: 0,
        }}
      >
        <Menu size={20} />
      </button>

      {/* Title */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{
          fontFamily: 'Syne, sans-serif', fontSize: 17,
          fontWeight: 800, color: 'var(--text)',
          margin: 0, whiteSpace: 'nowrap',
          overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{title}</h1>
        {subtitle && (
          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Dark mode toggle */}
      <button
        onClick={toggleDarkMode}
        style={{
          width: 40, height: 40, borderRadius: 10,
          border: '1px solid var(--border)',
          background: 'var(--bg-secondary)',
          cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-muted)', flexShrink: 0,
        }}
      >
        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Avatar */}
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: 'var(--primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 800, color: 'white',
        flexShrink: 0,
      }}>
        I
      </div>
    </header>
  );
}
