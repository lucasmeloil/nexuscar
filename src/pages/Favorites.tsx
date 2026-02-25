import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import type { Vehicle } from '../types';
import VehicleCard from '../components/VehicleCard';
import { Heart } from 'lucide-react';

const Favorites: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      const { data } = await supabase
        .from('favorites')
        .select(`
          vehicle_id,
          vehicles (*)
        `)
        .eq('user_id', session.user.id);
      
      if (data) {
        setVehicles(data.map((f: any) => f.vehicles));
      }
    }
    setLoading(false);
  };

  const removeFavorite = async (vehicleId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase.from('favorites').delete().eq('user_id', session.user.id).eq('vehicle_id', vehicleId);
      setVehicles(vehicles.filter(v => v.id !== vehicleId));
    }
  };

  return (
    <div className="favorites-page">
      <div className="favorites-header">
        <Heart size={32} fill="var(--color-gold)" color="var(--color-gold)" />
        <h1>Meus Favoritos</h1>
        <p>Veículos que você demonstrou interesse</p>
      </div>

      {loading ? (
        <div className="loading">Carregando seus favoritos...</div>
      ) : vehicles.length > 0 ? (
        <div className="vehicles-grid">
          {vehicles.map(v => (
            <VehicleCard 
              key={v.id} 
              vehicle={v} 
              isFavorite={true} 
              onToggleFavorite={() => removeFavorite(v.id)} 
            />
          ))}
        </div>
      ) : (
        <div className="empty-favorites">
          <p>Você ainda não favoritou nenhum veículo.</p>
          <a href="/" className="premium-button">Explorar Catálogo</a>
        </div>
      )}

      <style>{`
        .favorites-page {
          max-width: 1200px;
          margin: 4rem auto;
          padding: 0 1.5rem;
        }

        .favorites-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .favorites-header h1 { font-size: 2.5rem; margin: 1rem 0 0.5rem; }
        .favorites-header p { color: var(--color-gray-500); }

        .vehicles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
        }

        .empty-favorites {
          text-align: center;
          padding: 4rem;
          background: var(--color-gray-100);
          border-radius: 12px;
        }

        .empty-favorites p { margin-bottom: 2rem; font-size: 1.2rem; color: var(--color-gray-600); }
      `}</style>
    </div>
  );
};

export default Favorites;
