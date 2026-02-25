import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Fuel, Gauge, Calendar, Heart, ArrowRight, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Vehicle } from '../types';

interface VehicleCardProps {
  vehicle: Vehicle;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, isFavorite, onToggleFavorite }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!vehicle.images || vehicle.images.length === 0) return;
    setCurrentImageIndex((prev) => (prev + 1) % vehicle.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!vehicle.images || vehicle.images.length === 0) return;
    setCurrentImageIndex((prev) => (prev - 1 + vehicle.images.length) % vehicle.images.length);
  };

  const discountedPrice = vehicle.is_promotion && vehicle.discount_price 
    ? vehicle.discount_price 
    : null;

  return (
    <motion.div 
      className="vehicle-card"
      whileHover={{ y: -10 }}
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      onClick={() => navigate(`/vehicle/${vehicle.id}`)}
    >
      <div className="card-image-container">
        <AnimatePresence mode="wait">
          {vehicle.images && vehicle.images.length > 0 ? (
            <motion.img 
              key={currentImageIndex}
              src={vehicle.images[currentImageIndex]} 
              alt={`${vehicle.make} ${vehicle.model}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          ) : (
            <div className="no-image">No Image</div>
          )}
        </AnimatePresence>

        {vehicle.images && vehicle.images.length > 1 && (
          <div className="image-controls">
            <button onClick={prevImage} className="nav-btn"><ChevronLeft size={18} /></button>
            <button onClick={nextImage} className="nav-btn"><ChevronRight size={18} /></button>
          </div>
        )}

        <div className="image-dots">
          {vehicle.images && vehicle.images.map((_, i) => (
            <span key={i} className={`dot ${i === currentImageIndex ? 'active' : ''}`} />
          ))}
        </div>

        {vehicle.is_promotion && (
          <div className="promotion-ribbon">Oferta Especial</div>
        )}

        <div className={`status-badge ${vehicle.status}`}>
          {vehicle.status === 'available' ? 'Disponível' : vehicle.status === 'sold' ? 'Vendido' : 'Reservado'}
        </div>

        <button 
          className={`favorite-btn ${isFavorite ? 'active' : ''}`} 
          onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(vehicle.id); }}
        >
          <Heart size={20} fill={isFavorite ? 'var(--color-gold)' : 'none'} />
        </button>
      </div>

      <div className="card-content">
        <div className="card-header">
          <div>
            <span className="make-tag">{vehicle.make}</span>
            <h3>{vehicle.model}</h3>
          </div>
          <div className="price-container">
            {discountedPrice ? (
              <>
                <span className="old-price">R$ {vehicle.price.toLocaleString('pt-BR')}</span>
                <span className="price promo">R$ {discountedPrice.toLocaleString('pt-BR')}</span>
              </>
            ) : (
              <span className="price">R$ {vehicle.price.toLocaleString('pt-BR')}</span>
            )}
          </div>
        </div>
        
        <div className="specs-grid">
          <div className="spec-item">
            <Calendar size={14} />
            <span>{vehicle.year}</span>
          </div>
          <div className="spec-item">
            <Gauge size={14} />
            <span>{vehicle.mileage?.toLocaleString('pt-BR')} km</span>
          </div>
          <div className="spec-item">
             <Fuel size={14} />
             <span>{vehicle.fuel_type || 'Flex'}</span>
          </div>
          <div className="spec-item">
            <Settings size={14} />
            <span>{vehicle.transmission?.split(' ')[0] || 'Aut'}</span>
          </div>
        </div>

        <button className="view-details-btn">
          Ver Especificações <ArrowRight size={16} />
        </button>
      </div>

      <style>{`
        .vehicle-card {
          background: var(--color-white);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: var(--shadow-md);
          cursor: pointer;
          border: 1px solid var(--color-gray-200);
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .card-image-container {
          position: relative;
          height: 220px;
          background: var(--color-gray-900);
        }

        .card-image-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .promotion-ribbon {
          position: absolute;
          top: 0;
          left: 0;
          background: #dc2626;
          color: white;
          padding: 4px 12px;
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          z-index: 10;
          border-bottom-right-radius: 12px;
          box-shadow: 2px 2px 10px rgba(0,0,0,0.3);
        }

        .image-controls {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          transform: translateY(-50%);
          display: flex;
          justify-content: space-between;
          padding: 0 0.5rem;
          opacity: 0;
          transition: opacity var(--transition-fast);
        }

        .vehicle-card:hover .image-controls {
          opacity: 1;
        }

        .nav-btn {
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .nav-btn:hover { background: var(--color-gold); }

        .image-dots {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 6px;
        }

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.4);
        }

        .dot.active {
          background: var(--color-gold);
          width: 12px;
          border-radius: 3px;
        }

        .status-badge {
          position: absolute;
          top: 10px;
          right: 45px;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          backdrop-filter: blur(4px);
          background: rgba(0,0,0,0.6);
          color: white;
        }
        .status-badge.available { border-left: 3px solid #28a745; }
        .status-badge.reserved { border-left: 3px solid #ffc107; }
        .status-badge.sold { border-left: 3px solid #dc3545; }

        .favorite-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(255, 255, 255, 0.9);
          padding: 6px;
          border-radius: 50%;
          box-shadow: var(--shadow-sm);
          color: var(--color-gray-400);
        }
        .favorite-btn.active { color: var(--color-gold); background: white; }

        .card-content {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .make-tag {
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--color-gold);
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }

        .card-header h3 {
          font-size: 1.25rem;
          margin: 0.25rem 0 0;
          color: var(--color-black);
          text-transform: none;
        }

        .price-container {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .old-price {
          font-size: 0.8rem;
          text-decoration: line-through;
          color: var(--color-gray-400);
        }

        .price {
          color: var(--color-black);
          font-weight: 800;
          font-size: 1.3rem;
          white-space: nowrap;
        }
        .price.promo { color: #dc2626; }

        .specs-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.5rem;
          border-top: 1px solid var(--color-gray-100);
          padding-top: 1rem;
        }

        .spec-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          font-size: 0.7rem;
          color: var(--color-gray-600);
        }
        .spec-item span { font-weight: 700; color: var(--color-black); }

        .view-details-btn {
          margin-top: 0.5rem;
          width: 100%;
          padding: 1rem;
          background: var(--color-gray-100);
          color: var(--color-black);
          font-weight: 700;
          border-radius: 8px;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 1px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .vehicle-card:hover .view-details-btn {
          background: var(--color-black);
          color: var(--color-white);
        }
      `}</style>
    </motion.div>
  );
};

export default VehicleCard;
