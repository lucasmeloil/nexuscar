import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Home, Search, User, LayoutDashboard, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../services/supabase';
import type { Profile } from '../types';

interface MainLayoutProps {
  profile: Profile | null;
}

const MainLayout: React.FC<MainLayoutProps> = ({ profile }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const menuItems = [
    { path: '/', icon: <Home size={24} />, label: 'Início' },
    { path: '/catalog', icon: <Search size={24} />, label: 'Estoque' },
    { path: '/contact', icon: <MessageCircle size={24} />, label: 'Contato' },
    { 
      path: profile ? ((profile.role === 'admin' || profile.role === 'seller') ? '/admin' : '/profile') : '/login', 
      icon: (profile?.role === 'admin' || profile?.role === 'seller') ? <LayoutDashboard size={24} /> : <User size={24} />, 
      label: profile ? 'Conta' : 'Entrar' 
    },
  ];

  return (
    <div className="main-layout">
      {/* Fixed Top Navbar */}
      <header className="navbar">
        <div className="navbar-container">
          <Link to="/" className="logo">
            <img src="/logo.png" alt="NEW CAR" className="logo-img" />
          </Link>

          {/* Desktop Nav */}
          <nav className="desktop-nav">
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Início</Link>
            <Link to="/catalog" className={`nav-link ${location.pathname === '/catalog' ? 'active' : ''}`}>Estoque</Link>
            <Link to="/contact" className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}>Contato</Link>
            {profile && (
              <>
                <Link to="/favorites" className={`nav-link ${location.pathname === '/favorites' ? 'active' : ''}`}>Favoritos</Link>
                {(profile.role === 'admin' || profile.role === 'seller') && (
                  <Link to="/admin" className="nav-link admin-link">Painel Admin</Link>
                )}
              </>
            )}
          </nav>

          <div className="auth-buttons desktop-only-flex">
            {profile ? (
              <div className="user-menu">
                <Link to="/profile" className="profile-icon">
                  <div className="avatar-mini">
                    {profile.full_name?.charAt(0) || 'U'}
                  </div>
                  <span>{profile.full_name?.split(' ')[0] || 'Usuário'}</span>
                </Link>
                <button onClick={handleLogout} className="logout-btn" title="Sair">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="guest-menu">
                <Link to="/login" className="login-link">Entrar</Link>
                <Link to="/register" className="premium-button">Registrar</Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="content">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Mobile Fixed Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        {menuItems.map((item, index) => (
          <Link 
            key={index} 
            to={item.path} 
            className={`bottom-nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <div className="nav-icon-wrapper">
              {item.icon}
            </div>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-info">
            <div className="logo white-logo">
              <img src="/logo.png" alt="NEW CAR" className="logo-img footer-logo-img" />
            </div>
            <p>Sua concessionária premium de veículos modernos e selecionados desde 2010.</p>
          </div>
          <div className="footer-links">
            <h4>Navegação</h4>
            <Link to="/">Início</Link>
            <Link to="/contact">Contato</Link>
            <Link to="/favorites">Favoritos</Link>
            <Link to="/profile">Minha Conta</Link>
          </div>
          <div className="footer-contact">
            <h4>Contato</h4>
            <p>contato@newcar.com</p>
            <p>(79) 99988-5599</p>
            <p>BR-235, 52km, Av. Alípio Tavares de Menezes</p>
            <p>Oviêdo Teixeira, Itabaiana - SE, 49507-640</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 NEW CAR. Desenvolvido com luxo e tecnologia.</p>
        </div>
      </footer>

      <style>{`
        .navbar {
          background-color: var(--color-black);
          color: var(--color-white);
          padding: 1rem 0;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 2000;
          border-bottom: 2px solid var(--color-gold);
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
          backdrop-filter: blur(10px);
        }
        .navbar-container {
          max-width: 1300px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 1.5rem;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
        }
        .logo-icon {
          color: var(--color-gold);
          display: flex;
          align-items: center;
        }
        .logo-text {
          font-family: var(--font-premium);
          font-size: 1.5rem;
          font-weight: 900;
          display: flex;
          gap: 0.2rem;
        }
        .logo-img {
          height: 45px;
          width: auto;
          object-fit: contain;
        }
        .footer-logo-img {
          height: 50px;
        }
        
        @media (max-width: 768px) {
          .logo-img { height: 35px; }
        }
        
        .desktop-nav {
          display: none;
          gap: 2.5rem;
        }
        @media (min-width: 1024px) {
          .desktop-nav { display: flex; }
        }
        .nav-link {
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.85rem;
          letter-spacing: 1px;
          transition: var(--transition-fast);
          color: var(--color-gray-400);
        }
        .nav-link:hover, .nav-link.active { color: var(--color-gold); }
        .admin-link { color: var(--color-gold); border: 1px solid var(--color-gold); padding: 5px 15px; border-radius: 20px; }

        .auth-buttons {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .desktop-only-flex { display: none; }
        @media (min-width: 1024px) {
          .desktop-only-flex { display: flex; }
        }

        .user-menu {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .avatar-mini {
          width: 32px;
          height: 32px;
          background: var(--color-gold);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.9rem;
        }

        .profile-icon {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 700;
          font-size: 0.9rem;
          color: white;
        }

        .logout-btn {
          color: var(--color-gray-500);
          display: flex;
          align-items: center;
        }
        .logout-btn:hover { color: #dc2626; }

        .guest-menu {
          display: flex;
          align-items: center;
          gap: 2rem;
        }
        .login-link { font-weight: 700; color: white; }

        .content {
          margin-top: 84px; /* Fixed navbar height */
          min-height: calc(100vh - 84px);
        }

        /* Mobile Bottom Nav */
        .mobile-bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: var(--color-black);
          height: 70px;
          z-index: 2000;
          border-top: 2px solid var(--color-gold);
          justify-content: space-around;
          align-items: center;
          padding-bottom: env(safe-area-inset-bottom);
          box-shadow: 0 -4px 20px rgba(0,0,0,0.5);
        }

        @media (max-width: 1023px) {
          .mobile-bottom-nav { display: flex; }
          .footer { padding-bottom: 100px; } /* Space for bottom nav */
        }

        .bottom-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          color: var(--color-gray-500);
          text-decoration: none;
          transition: var(--transition-fast);
          flex: 1;
        }

        .bottom-nav-item.active {
          color: var(--color-gold);
        }

        .nav-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease;
        }

        .bottom-nav-item.active .nav-icon-wrapper {
          transform: translateY(-5px);
        }

        .nav-label {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .footer {
          background-color: var(--color-black);
          color: var(--color-white);
          padding: 6rem 1.5rem 3rem;
          border-top: 4px solid var(--color-gold);
        }
        .footer-container {
          max-width: 1300px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 4rem;
        }
        .white-logo .logo-new { color: white; }
        .footer h4 { 
          margin-bottom: 2rem; 
          font-size: 1.1rem; 
          position: relative;
          padding-bottom: 10px;
        }
        .footer h4::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 40px;
          height: 2px;
          background: var(--color-gold);
        }
        .footer p, .footer a { 
          color: var(--color-gray-500); 
          margin-bottom: 1rem; 
          display: block;
          font-size: 0.95rem;
        }
        .footer a:hover { color: var(--color-gold); padding-left: 5px; }
        
        .footer-bottom {
          max-width: 1300px;
          margin: 4rem auto 0;
          padding-top: 3rem;
          border-top: 1px solid var(--color-gray-900);
          text-align: center;
          color: var(--color-gray-600);
          font-size: 0.85rem;
        }
      `}</style>
    </div>
  );
};

export default MainLayout;
