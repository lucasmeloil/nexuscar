import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './services/supabase';
import type { Profile } from './types';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout.tsx';

// Pages
import Home from './pages/Home.tsx';
import VehicleDetails from './pages/VehicleDetails.tsx';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';
import ProfilePage from './pages/Profile.tsx';
import Favorites from './pages/Favorites.tsx';
import Catalog from './pages/Catalog.tsx';

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

    // Uma única verificação inicial - rápida e sem conflito
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (mounted && data) setProfile(data);
      }
      if (mounted) setLoading(false);
    });

    // Listener para mudanças de estado (login/logout em tempo real)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (event === 'SIGNED_IN' && session?.user) {
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

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#000', color: '#B8860B' }}>
      <h1>Carregando...</h1>
    </div>;
  }

  return (
    <Routes>
      {/* Public & Client Routes */}
      <Route element={<MainLayout profile={profile} />}>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/vehicle/:id" element={<VehicleDetails />} />
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
    </Routes>
  );
}

export default App;
