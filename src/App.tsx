import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from './services/supabase';
import type { Profile } from './types';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout.tsx';

// Components
import ScrollToTop from './components/ScrollToTop.tsx';
import Home from './pages/Home.tsx';
import VehicleDetails from './pages/VehicleDetails.tsx';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';
import ProfilePage from './pages/Profile.tsx';
import Favorites from './pages/Favorites.tsx';
import Catalog from './pages/Catalog.tsx';
import Contact from './pages/Contact.tsx';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard.tsx';
import Inventory from './pages/admin/Inventory.tsx';
import Employees from './pages/admin/Employees.tsx';
import Reports from './pages/admin/Reports.tsx';

function App() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (session?.user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (mounted && data) setProfile(data);
          if (error) console.error("Erro ao carregar perfil inicial:", error);
        }
      } catch (err) {
        console.error("Erro na verificação de sessão:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    checkSession();

    // Listener para mudanças de estado (login/logout em tempo real)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (mounted && data) setProfile(data);
      } else if (event === 'SIGNED_OUT') {
        if (mounted) setProfile(null);
      }
    });

    // Fallback de segurança para garantir que a UI não trave
    const timeout = setTimeout(() => {
      if (mounted && loading) setLoading(false);
    }, 4000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        backgroundColor: '#0a0a0a', 
        color: '#B8860B',
        fontFamily: 'Inter, sans-serif'
      }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
          style={{ marginBottom: '2.5rem' }}
        >
          <img src="/logo.png" alt="NEW CAR" style={{ height: '100px', filter: 'drop-shadow(0 0 15px rgba(184, 134, 11, 0.4))' }} />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center' }}
        >
          <h1 style={{ 
            fontSize: '1.5rem', 
            textTransform: 'uppercase', 
            fontWeight: '900',
            marginBottom: '0.5rem',
            letterSpacing: '10px',
            background: 'linear-gradient(to bottom, #fcfcfc, #B8860B)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            NEW CAR
          </h1>
          <p style={{ opacity: 0.6, fontSize: '0.8rem', letterSpacing: '2px', marginBottom: '2rem' }}>
            A LOJA DOS AMIGOS
          </p>
        </motion.div>

        <div style={{ 
          width: '240px', 
          height: '1px', 
          backgroundColor: 'rgba(184, 134, 11, 0.2)', 
          borderRadius: '4px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <motion.div
            initial={{ left: '-100%' }}
            animate={{ left: '100%' }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ 
              position: 'absolute',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, #B8860B, transparent)'
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />
      <Routes>
      {/* Public & Client Routes */}
      <Route element={<MainLayout profile={profile} />}>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/vehicle/:id" element={<VehicleDetails />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/favorites" element={profile ? <Favorites /> : <Navigate to="/login" />} />
        <Route path="/profile" element={profile ? <ProfilePage profile={profile} /> : <Navigate to="/login" />} />
      </Route>

      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin Routes */}
      <Route path="/admin" element={profile?.role === 'admin' || profile?.role === 'seller' ? <AdminLayout profile={profile} /> : <Navigate to="/" />}>
        <Route index element={<Navigate to="/admin/dashboard" />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="employees" element={profile?.role === 'admin' ? <Employees /> : <Navigate to="/admin/dashboard" />} />
        <Route path="reports" element={<Reports />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}

export default App;
