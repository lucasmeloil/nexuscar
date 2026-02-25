import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../services/supabase';
import type { Vehicle } from '../types';
import VehicleCard from '../components/VehicleCard';
import { Search, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Catalog: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [filterType, setFilterType] = useState('all');

  const location = useLocation();

  useEffect(() => {
    fetchVehiclesAndFavorites();

    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('q');
    if (query) {
      setSearchTerm(query);
    }
  }, [location.search]);

  const fetchVehiclesAndFavorites = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const promises: any[] = [
        supabase.from('vehicles').select('*').order('created_at', { ascending: false })
      ];
      
      if (session?.user) {
        promises.push(
          supabase.from('favorites').select('vehicle_id').eq('user_id', session.user.id)
        );
      }

      const results = await Promise.all(promises);
      const vehiclesRes = results[0];
      const favoritesRes = results[1];

      if (vehiclesRes.error) throw vehiclesRes.error;
      if (vehiclesRes.data) setVehicles(vehiclesRes.data);
      
      if (favoritesRes && favoritesRes.data) {
        setFavorites(favoritesRes.data.map((f: any) => f.vehicle_id));
      }
    } catch (err) {
      console.error('Error fetching catalog data:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (vehicleId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('Faça login para favoritar veículos');
      return;
    }

    if (favorites.includes(vehicleId)) {
      await supabase.from('favorites').delete().eq('user_id', session.user.id).eq('vehicle_id', vehicleId);
      setFavorites(favorites.filter(id => id !== vehicleId));
    } else {
      await supabase.from('favorites').insert({ user_id: session.user.id, vehicle_id: vehicleId });
      setFavorites([...favorites, vehicleId]);
    }
  };

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = `${v.make} ${v.model}`.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterType === 'all') return matchesSearch;
    return matchesSearch && v.status === filterType;
  });

  return (
    <div className="catalog-page">
      <section className="catalog-hero dark-section">
        <div className="catalog-hero-content">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="gradient-text"
          >
            Nosso Estoque
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Encontre o veículo dos seus sonhos entre as melhores opções do mercado
          </motion.p>
        </div>
      </section>

      <section className="catalog-container">
        <div className="catalog-controls">
          <div className="search-bar-modern glass-card">
            <Search size={20} className="text-gold" />
            <input 
              type="text" 
              placeholder="Marca, modelo ou ano..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <div className="filter-item">
              <SlidersHorizontal size={18} />
              <span>Status:</span>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="all">Todos</option>
                <option value="available">Disponíveis</option>
                <option value="reserved">Reservados</option>
                <option value="sold">Vendidos</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="catalog-loading">
            {[1,2,3,4,5,6,7,8].map(n => <div key={n} className="skeleton-card" />)}
          </div>
        ) : (
          <>
            <div className="result-count">
              Exibindo <strong>{filteredVehicles.length}</strong> veículos
            </div>
            <div className="vehicles-grid">
              <AnimatePresence>
                {filteredVehicles.map((v) => (
                  <VehicleCard 
                    key={v.id} 
                    vehicle={v} 
                    isFavorite={favorites.includes(v.id)} 
                    onToggleFavorite={toggleFavorite} 
                  />
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </section>

      <style>{`
        .catalog-page { min-height: 100vh; padding-bottom: 6rem; }
        
        .catalog-hero {
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          background: linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.9)), url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=2000');
          background-size: cover;
          background-position: center;
          margin-bottom: -50px;
        }

        .catalog-hero-content h1 { font-size: 3.5rem; margin-bottom: 1rem; }
        .catalog-hero-content p { color: var(--color-gray-400); font-size: 1.2rem; }

        .catalog-container {
          max-width: 1300px;
          margin: 0 auto;
          padding: 0 1.5rem;
          position: relative;
          z-index: 10;
        }

        .catalog-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
          margin-bottom: 3rem;
          flex-wrap: wrap;
        }

        .search-bar-modern {
          flex: 1;
          min-width: 300px;
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.5rem;
          border-radius: 50px;
          background: white;
          border: 1px solid var(--color-gray-200);
          box-shadow: var(--shadow-md);
        }

        .search-bar-modern input {
          border: none;
          outline: none;
          flex: 1;
          font-size: 1rem;
          background: transparent;
        }

        .filter-group {
          display: flex;
          gap: 1.5rem;
        }

        .filter-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: white;
          padding: 0.75rem 1.5rem;
          border-radius: 50px;
          border: 1px solid var(--color-gray-200);
          font-weight: 600;
          font-size: 0.9rem;
          box-shadow: var(--shadow-sm);
        }

        .filter-item select {
          border: none;
          outline: none;
          font-weight: 700;
          color: var(--color-gold);
          background: transparent;
          cursor: pointer;
        }

        .result-count {
          margin-bottom: 2rem;
          color: var(--color-gray-600);
          font-size: 0.9rem;
        }

        .catalog-loading {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 2.5rem;
        }

        .vehicles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 2.5rem;
        }

        @media (max-width: 768px) {
          .catalog-hero h1 { font-size: 2.5rem; }
          .catalog-controls { flex-direction: column; align-items: stretch; gap: 1rem; }
          .search-bar-modern { min-width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default Catalog;
