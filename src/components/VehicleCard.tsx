import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Fuel, Gauge, Calendar, Heart, ArrowRight, Settings, MessageCircle, X, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Vehicle } from '../types';

interface VehicleCardProps {
  vehicle: Vehicle;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

const SELLERS = [
  { name: 'Garrafinha', phone: '5579999885599', role: 'Consultor de Vendas' },
  { name: 'NexusCar - Loja', phone: '5579999885599', role: 'Atendimento Geral' }
];

const formatPrice = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 });

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, isFavorite, onToggleFavorite }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showSellerModal, setShowSellerModal] = useState(false);
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

  const openWhatsApp = (e: React.MouseEvent, seller: typeof SELLERS[0]) => {
    e.stopPropagation();
    const msg = encodeURIComponent(`Olá ${seller.name}! Vim pelo site e tenho interesse no ${vehicle.make} ${vehicle.model} ${vehicle.year}. Poderia me dar mais informações?`);
    window.open(`https://wa.me/${seller.phone}?text=${msg}`, '_blank');
    setShowSellerModal(false);
  };

  return (
    <>
      <motion.div
        className="vehicle-card"
        whileHover={{ y: -8 }}
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
              <div className="no-image">Sem Foto</div>
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
                  <span className="old-price">{formatPrice(vehicle.price)}</span>
                  <span className="price promo">{formatPrice(discountedPrice)}</span>
                </>
              ) : (
                <span className="price">{formatPrice(vehicle.price)}</span>
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

          <div className="card-actions">
            <button
              className="contact-seller-btn"
              onClick={(e) => { e.stopPropagation(); setShowSellerModal(true); }}
            >
              <MessageCircle size={16} />
              Falar com Vendedor
            </button>
            <button className="view-details-btn">
              Ver Detalhes <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Seller Modal */}
      <AnimatePresence>
        {showSellerModal && (
          <motion.div
            className="seller-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSellerModal(false)}
          >
            <motion.div
              className="seller-modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="seller-modal-header">
                <h3>Escolha o vendedor</h3>
                <button onClick={() => setShowSellerModal(false)}><X size={20} /></button>
              </div>
              <p className="seller-modal-vehicle">{vehicle.make} {vehicle.model} {vehicle.year}</p>
              <div className="seller-list">
                {SELLERS.map((seller) => (
                  <button
                    key={seller.phone + seller.name}
                    className="seller-item"
                    onClick={(e) => openWhatsApp(e, seller)}
                  >
                    <div className="seller-avatar">{seller.name[0]}</div>
                    <div className="seller-info">
                      <strong>{seller.name}</strong>
                      <span>{seller.role}</span>
                      <span className="seller-phone"><Phone size={12} /> {seller.phone.replace('55', '')}</span>
                    </div>
                    <div className="whatsapp-icon">
                      <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
          top: 0; left: 0;
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
          top: 50%; left: 0; right: 0;
          transform: translateY(-50%);
          display: flex;
          justify-content: space-between;
          padding: 0 0.5rem;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .vehicle-card:hover .image-controls { opacity: 1; }

        .nav-btn {
          background: rgba(0,0,0,0.4);
          backdrop-filter: blur(4px);
          color: white;
          width: 32px; height: 32px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
        }
        .nav-btn:hover { background: var(--color-gold); }

        .image-dots {
          position: absolute;
          bottom: 12px; left: 50%;
          transform: translateX(-50%);
          display: flex; gap: 6px;
        }
        .dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: rgba(255,255,255,0.4);
        }
        .dot.active {
          background: var(--color-gold);
          width: 12px; border-radius: 3px;
        }

        .status-badge {
          position: absolute;
          top: 10px; right: 45px;
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
          top: 10px; right: 10px;
          background: rgba(255,255,255,0.9);
          padding: 6px; border-radius: 50%;
          box-shadow: var(--shadow-sm);
          color: var(--color-gray-400);
        }
        .favorite-btn.active { color: var(--color-gold); background: white; }

        .card-content {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .make-tag {
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--color-gold);
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }
        .card-header h3 {
          font-size: 1.15rem;
          margin: 0.25rem 0 0;
          color: var(--color-black);
          text-transform: none;
        }

        .price-container {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          flex-shrink: 0;
        }
        .old-price {
          font-size: 0.75rem;
          text-decoration: line-through;
          color: var(--color-gray-400);
        }
        .price {
          color: var(--color-black);
          font-weight: 800;
          font-size: 1.15rem;
          white-space: nowrap;
        }
        .price.promo { color: #dc2626; }

        .specs-grid {
          display: grid;
          grid-template-columns: repeat(4,1fr);
          gap: 0.5rem;
          border-top: 1px solid var(--color-gray-100);
          padding-top: 0.75rem;
        }
        .spec-item {
          display: flex; flex-direction: column;
          align-items: center; gap: 4px;
          font-size: 0.7rem;
          color: var(--color-gray-600);
        }
        .spec-item span { font-weight: 700; color: var(--color-black); }

        .card-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }

        .contact-seller-btn {
          display: flex; align-items: center; justify-content: center;
          gap: 6px;
          padding: 0.75rem 0.5rem;
          background: #25D366;
          color: white;
          font-weight: 700;
          border-radius: 8px;
          font-size: 0.75rem;
          transition: all 0.2s;
        }
        .contact-seller-btn:hover { background: #1ebe5d; }

        .view-details-btn {
          display: flex; align-items: center; justify-content: center;
          gap: 6px;
          padding: 0.75rem 0.5rem;
          background: var(--color-gray-100);
          color: var(--color-black);
          font-weight: 700;
          border-radius: 8px;
          font-size: 0.75rem;
          transition: all 0.2s;
        }
        .vehicle-card:hover .view-details-btn {
          background: var(--color-black);
          color: var(--color-white);
        }

        /* Seller Modal */
        .seller-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .seller-modal {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          width: 100%;
          max-width: 360px;
          box-shadow: 0 25px 50px rgba(0,0,0,0.3);
        }
        .seller-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .seller-modal-header h3 {
          font-size: 1.1rem;
          margin: 0;
          text-transform: none;
        }
        .seller-modal-header button {
          color: #aaa;
          padding: 4px;
        }
        .seller-modal-vehicle {
          font-size: 0.8rem;
          color: #888;
          margin: 0 0 1.25rem;
          font-style: italic;
        }
        .seller-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .seller-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.875rem 1rem;
          border: 1.5px solid #eee;
          border-radius: 12px;
          text-align: left;
          transition: all 0.2s;
          cursor: pointer;
          width: 100%;
        }
        .seller-item:hover {
          border-color: #25D366;
          background: #f0fdf4;
        }
        .seller-avatar {
          width: 44px; height: 44px;
          border-radius: 50%;
          background: var(--color-gold);
          color: white;
          font-weight: 800;
          font-size: 1.2rem;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .seller-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .seller-info strong {
          font-size: 0.95rem;
          color: #111;
        }
        .seller-info span {
          font-size: 0.75rem;
          color: #888;
        }
        .seller-phone {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #555 !important;
          font-weight: 600 !important;
        }
        .whatsapp-icon {
          color: #25D366;
          flex-shrink: 0;
        }

        .no-image {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          color: #666; font-size: 0.85rem;
        }
      `}</style>
    </>
  );
};

export default VehicleCard;
