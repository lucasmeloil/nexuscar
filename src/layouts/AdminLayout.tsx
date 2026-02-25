import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Car, 
  Users, 
  BarChart3, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  Home
} from 'lucide-react';
import { supabase } from '../services/supabase';
import type { Profile } from '../types';

interface AdminLayoutProps {
  profile: Profile | null;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ profile }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
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

  return (
    <div className="admin-container">
      <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          {!isCollapsed && (
            <Link to="/admin" className="admin-logo">
              <img src="/logo.png" alt="NEW CAR" className="admin-logo-img" />
            </Link>
          )}
          <button className="collapse-toggle" onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <Link to="/" className="sidebar-item">
            <Home size={20} />
            {!isCollapsed && <span>Voltar ao Site</span>}
          </Link>
          <div className="nav-divider"></div>
          {filteredMenu.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.icon}
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="admin-profile">
            <div className="admin-avatar">
              {profile?.full_name?.charAt(0) || 'A'}
            </div>
            {!isCollapsed && (
              <div className="admin-user-info">
                <span className="admin-name">{profile?.full_name || 'Admin'}</span>
                <span className="admin-role">{profile?.role}</span>
              </div>
            )}
          </div>
          <button onClick={handleLogout} className="sidebar-item logout-item">
            <LogOut size={20} />
            {!isCollapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <h2>{menuItems.find(item => location.pathname === item.path)?.label || 'Painel Admin'}</h2>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </main>

      <style>{`
        .admin-container {
          display: flex;
          min-height: 100vh;
          background-color: var(--color-gray-100);
        }

        .admin-sidebar {
          width: var(--sidebar-width);
          background-color: var(--color-black);
          color: var(--color-white);
          display: flex;
          flex-direction: column;
          transition: width var(--transition-normal);
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
          z-index: 100;
        }

        .admin-sidebar.collapsed {
          width: var(--sidebar-collapsed-width);
        }

        .sidebar-header {
          padding: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--color-gray-800);
        }

        .admin-logo-img {
          height: 35px;
          width: auto;
          object-fit: contain;
        }

        .collapse-toggle {
          color: var(--color-gold);
          padding: 0.5rem;
          border-radius: 4px;
        }
        .collapse-toggle:hover { background: var(--color-gray-900); }

        .sidebar-nav {
          padding: 1rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          color: var(--color-gray-400);
          white-space: nowrap;
        }

        .sidebar-item:hover, .sidebar-item.active {
          color: var(--color-white);
          background-color: var(--color-gray-900);
        }

        .sidebar-item.active {
          color: var(--color-gold);
          background-color: rgba(184, 134, 11, 0.1);
        }

        .nav-divider {
          height: 1px;
          background: var(--color-gray-800);
          margin: 1rem 0;
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
          width: 32px;
          height: 32px;
          background: var(--color-gold);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: var(--color-white);
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
        }

        .admin-role {
          font-size: 0.75rem;
          color: var(--color-gray-500);
          text-transform: capitalize;
        }

        .logout-item {
          margin-top: 0.5rem;
          color: #ff4444 !important;
        }
        .logout-item:hover { background-color: rgba(255, 68, 68, 0.1); }

        .admin-main {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .admin-topbar {
          background: var(--color-white);
          padding: 1rem 2rem;
          border-bottom: 1px solid var(--color-gray-200);
        }

        .admin-topbar h2 {
          font-size: 1.25rem;
          color: var(--color-black);
        }

        .admin-content {
          padding: 2rem;
          flex: 1;
          overflow-y: auto;
        }

        @media (max-width: 768px) {
          .admin-sidebar {
            position: fixed;
            left: 0;
            bottom: 0;
            top: auto;
            width: 100% !important;
            height: 70px;
            flex-direction: row;
            background: var(--color-black);
            border-top: 2px solid var(--color-gold);
            padding: 0;
            border-radius: 0;
            box-shadow: 0 -4px 20px rgba(0,0,0,0.5);
            z-index: 1000;
          }
          .sidebar-header, .sidebar-footer, .nav-divider { display: none; }
          .sidebar-nav {
            flex-direction: row;
            justify-content: space-around;
            padding: 0;
            width: 100%;
          }
          .sidebar-item {
            flex-direction: column;
            gap: 4px;
            padding: 10px 0;
            flex: 1;
            border-radius: 0;
            font-size: 0.7rem;
            text-transform: uppercase;
            font-weight: 700;
          }
          .sidebar-item span { display: block; }
          .admin-main { margin-bottom: 70px; }
          .admin-topbar { padding: 1rem; position: sticky; top: 0; z-index: 50; }
          .admin-content { padding: 1rem; }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
