import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineViewGrid, HiOutlineShoppingCart, HiOutlineSwitchHorizontal, HiOutlineClipboardList, HiOutlineLogout, HiOutlineMenu, HiOutlineX } from 'react-icons/hi';
import { useState } from 'react';

const navItems = [
  { to: '/', icon: HiOutlineViewGrid, label: 'Dashboard' },
  { to: '/purchases', icon: HiOutlineShoppingCart, label: 'Purchases' },
  { to: '/transfers', icon: HiOutlineSwitchHorizontal, label: 'Transfers' },
  { to: '/assignments', icon: HiOutlineClipboardList, label: 'Assignments' },
];

const roleLabel = { admin: 'Admin', base_commander: 'Commander', logistics_officer: 'Logistics' };
const roleColors = { admin: '#34d399', base_commander: '#60a5fa', logistics_officer: '#fbbf24' };

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const sidebarStyle = {
    width: '256px',
    background: '#0f1629',
    borderRight: '1px solid #1e293b',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
    zIndex: 40,
    transition: 'transform 0.2s',
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 30 }} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside style={{ ...sidebarStyle, transform: sidebarOpen ? 'translateX(0)' : (window.innerWidth >= 1024 ? 'translateX(0)' : 'translateX(-100%)') }}
        className="lg:!translate-x-0">
        {/* Logo */}
        <div style={{ padding: '20px', borderBottom: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '20px' }}>⚔</span>
            </div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: '700', color: 'white', margin: 0 }}>MilAssets</h1>
              <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Asset Management</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px' }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '500',
                textDecoration: 'none',
                marginBottom: '4px',
                transition: 'all 0.2s',
                background: isActive ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                color: isActive ? '#34d399' : '#94a3b8',
                boxShadow: isActive ? '0 4px 15px rgba(16, 185, 129, 0.08)' : 'none',
              })}
            >
              <Icon style={{ fontSize: '18px' }} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '16px', borderTop: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: 'white' }}>
              {user?.full_name?.charAt(0)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '13px', fontWeight: '500', color: 'white', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.full_name}</p>
              <span style={{ fontSize: '11px', padding: '1px 8px', borderRadius: '9999px', background: `${roleColors[user?.role]}20`, color: roleColors[user?.role] }}>
                {roleLabel[user?.role]}
              </span>
            </div>
          </div>
          {user?.base_name && (
            <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px', paddingLeft: '4px' }}>📍 {user.base_name}</p>
          )}
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 8px', width: '100%', borderRadius: '6px', transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#f87171'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}>
            <HiOutlineLogout /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto', marginLeft: '256px' }} className="max-lg:!ml-0">
        {/* Mobile header */}
        <div style={{ display: 'none', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid #1e293b', background: '#0f1629' }} className="max-lg:!flex">
          <button onClick={() => setSidebarOpen(true)} style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}>
            <HiOutlineMenu style={{ fontSize: '24px' }} />
          </button>
          <h1 style={{ fontSize: '18px', fontWeight: '700', color: 'white' }}>⚔ MilAssets</h1>
          <div style={{ width: '32px' }} />
        </div>
        <div style={{ padding: '24px 32px' }} className="animate-fade-in max-lg:!p-4">
          {children}
        </div>
      </main>
    </div>
  );
}
