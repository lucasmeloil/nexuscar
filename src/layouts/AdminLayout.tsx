import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Car, 
  Users, 
  BarChart3, 
  LogOut,
  Home,
  Menu,
  X
} from 'lucide-react';
import { supabase } from '../services/supabase';
import type { Profile } from '../types';

interface AdminLayoutProps {
  profile: Profile | null;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ profile }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/admin/inventory', icon: <Car size={20} />, label: 'Estoque' },
    { path: '/admin/employees', icon: <Users size={20} />, label: 'Funcionários', restricted: true },
    { path: '/admin/reports', icon: <BarChart3 size={20} />, label: 'Relatórios' },
  ];

  const filteredMenu = profile?.role === 'admin'
    ? menuItems
    : menuItems.filter(item => !item.restricted);

  const currentPageLabel = filteredMenu.find(item => location.pathname === item.path)?.label || 'Painel Admin';

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <div className="admin-container">
      {/* ─── Sidebar (Desktop) ─── */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <Link to="/admin" className="admin-logo">
            <img src="/logo.png" alt="NexusCar" className="admin-logo-img" />
          </Link>
        </div>

        <nav className="sidebar-nav">
          <Link to="/" className="sidebar-item">
            <Home size={20} />
            <span>Voltar ao Site</span>
          </Link>
          <div className="nav-divider"></div>
          {filteredMenu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="admin-profile">
            <div className="admin-avatar">
              {profile?.full_name?.charAt(0) || 'A'}
            </div>
            <div className="admin-user-info">
              <span className="admin-name">{profile?.full_name || 'Admin'}</span>
              <span className="admin-role">{profile?.role}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="sidebar-item logout-item">
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main className="admin-main">
        {/* Top bar with hamburger for mobile */}
        <header className="admin-topbar">
          <button 
            className="hamburger-btn" 
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu size={24} />
          </button>
          <h2>{currentPageLabel}</h2>
          <div className="topbar-right">
            <div className="topbar-avatar">{profile?.full_name?.charAt(0) || 'A'}</div>
          </div>
        </header>

        <div className="admin-content">
          <Outlet />
        </div>
      </main>

      {/* ─── Mobile Drawer Menu ─── */}
      {mobileMenuOpen && (
        <div className="mobile-overlay" onClick={closeMenu}>
          <aside 
            className="mobile-drawer" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawer-header">
              <img src="/logo.png" alt="NexusCar" className="admin-logo-img" />
              <button className="drawer-close" onClick={closeMenu}>
                <X size={24} />
              </button>
            </div>

            <div className="drawer-profile">
              <div className="drawer-avatar">{profile?.full_name?.charAt(0) || 'A'}</div>
              <div>
                <strong>{profile?.full_name || 'Admin'}</strong>
                <span className="drawer-role">{profile?.role}</span>
              </div>
            </div>

            <nav className="drawer-nav">
              <Link to="/" className="drawer-item" onClick={closeMenu}>
                <Home size={20} /> Voltar ao Site
              </Link>
              <div className="nav-divider"></div>
              {filteredMenu.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`drawer-item ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="drawer-footer">
              <button 
                onClick={() => { handleLogout(); closeMenu(); }} 
                className="drawer-item logout-item"
              >
                <LogOut size={20} /> Sair
              </button>
            </div>
          </aside>
        </div>
      )}

      <style>{`
        .admin-container {
          display: flex;
          min-height: 100vh;
          background-color: var(--color-gray-100);
        }

        /* ── Desktop Sidebar ── */
        .admin-sidebar {
          width: var(--sidebar-width, 240px);
          background-color: var(--color-black);
          color: var(--color-white);
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
          z-index: 100;
          flex-shrink: 0;
        }

        .sidebar-header {
          padding: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 1px solid var(--color-gray-800);
        }

        .admin-logo-img {
          height: 35px;
          width: auto;
          object-fit: contain;
        }

        .sidebar-nav {
          padding: 1rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          color: var(--color-gray-400);
          white-space: nowrap;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.15s;
          text-decoration: none;
          background: none;
          border: none;
          cursor: pointer;
          width: 100%;
          text-align: left;
        }

        .sidebar-item:hover {
          color: var(--color-white);
          background-color: var(--color-gray-900);
        }

        .sidebar-item.active {
          color: var(--color-gold);
          background-color: rgba(184, 134, 11, 0.12);
          font-weight: 700;
        }

        .nav-divider {
          height: 1px;
          background: var(--color-gray-800);
          margin: 0.5rem 0;
        }

        .sidebar-footer {
          padding: 1rem;
          border-top: 1px solid var(--color-gray-800);
        }

        .admin-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .admin-avatar {
          width: 36px; height: 36px;
          background: var(--color-gold);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-weight: bold;
          color: var(--color-white);
          flex-shrink: 0;
        }

        .admin-user-info {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .admin-name {
          font-weight: 600;
          font-size: 0.9rem;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
          color: white;
        }

        .admin-role {
          font-size: 0.7rem;
          color: var(--color-gray-500);
          text-transform: capitalize;
        }

        .logout-item {
          color: #ff4444 !important;
        }
        .logout-item:hover { background-color: rgba(255, 68, 68, 0.1) !important; }

        /* ── Main ── */
        .admin-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .admin-topbar {
          background: var(--color-white);
          padding: 0 1.5rem;
          border-bottom: 1px solid var(--color-gray-200);
          display: flex;
          align-items: center;
          gap: 1rem;
          height: 60px;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .hamburger-btn {
          display: none;
          color: var(--color-black);
          padding: 6px;
          border-radius: 6px;
          background: none;
          border: none;
          cursor: pointer;
          flex-shrink: 0;
        }
        .hamburger-btn:hover { background: var(--color-gray-100); }

        .admin-topbar h2 {
          font-size: 1.15rem;
          color: var(--color-black);
          flex: 1;
        }

        .topbar-right {
          display: flex;
          align-items: center;
        }

        .topbar-avatar {
          width: 34px; height: 34px;
          border-radius: 50%;
          background: var(--color-gold);
          color: white;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .admin-content {
          padding: 2rem;
          flex: 1;
          overflow-y: auto;
        }

        /* ── Mobile Drawer ── */
        .mobile-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          z-index: 2000;
          backdrop-filter: blur(2px);
        }

        .mobile-drawer {
          position: absolute;
          top: 0; left: 0; bottom: 0;
          width: 280px;
          background: var(--color-black);
          display: flex;
          flex-direction: column;
          animation: slideIn 0.25s ease;
        }

        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }

        .drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 1rem;
          border-bottom: 1px solid var(--color-gray-800);
        }

        .drawer-close {
          color: var(--color-gray-400);
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
        }
        .drawer-close:hover { background: var(--color-gray-800); color: white; }

        .drawer-profile {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          padding: 1.25rem;
          border-bottom: 1px solid var(--color-gray-800);
        }

        .drawer-avatar {
          width: 44px; height: 44px;
          border-radius: 50%;
          background: var(--color-gold);
          color: white;
          display: flex; align-items: center; justify-content: center;
          font-weight: 800;
          font-size: 1.1rem;
          flex-shrink: 0;
        }

        .drawer-profile strong {
          display: block;
          font-size: 0.95rem;
          color: white;
        }

        .drawer-role {
          font-size: 0.75rem;
          color: var(--color-gray-500);
          text-transform: capitalize;
        }

        .drawer-nav {
          padding: 1rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          overflow-y: auto;
        }

        .drawer-item {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          padding: 0.875rem 1rem;
          border-radius: 8px;
          color: var(--color-gray-400);
          font-size: 0.95rem;
          font-weight: 500;
          text-decoration: none;
          background: none;
          border: none;
          cursor: pointer;
          width: 100%;
          text-align: left;
          transition: all 0.15s;
        }

        .drawer-item:hover {
          color: white;
          background: var(--color-gray-900);
        }

        .drawer-item.active {
          color: var(--color-gold);
          background: rgba(184,134,11,0.12);
          font-weight: 700;
        }

        .drawer-footer {
          padding: 1rem;
          border-top: 1px solid var(--color-gray-800);
        }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .admin-sidebar { display: none; }
          .hamburger-btn { display: flex; }
          .mobile-overlay { display: block; }
        }

        @media (max-width: 768px) {
          .admin-content { padding: 1rem; }
          .admin-topbar { padding: 0 1rem; }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
