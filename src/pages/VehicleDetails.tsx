import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import type { Vehicle } from '../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Fuel, 
  Settings, 
  Shield, 
  Zap, 
  MapPin, 
  Share2, 
  Heart,
  ArrowLeft,
  MessageCircle,
  CheckCircle2,
  Car,
  X,
  Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SELLERS = [
  { name: 'Garrafinha', phone: '5579999885599', role: 'Consultor de Vendas' },
  { name: 'NexusCar - Loja', phone: '5579999885599', role: 'Atendimento Geral' }
];

const formatPrice = (value: number) =>
  'R$ ' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const VehicleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showSellerModal, setShowSellerModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVehicle();
  }, [id]);

  const fetchVehicle = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (data) setVehicle(data);
    setLoading(false);
  };

  if (loading) return <div className="loading-fullscreen">Acelerando informações...</div>;
  if (!vehicle) return <div className="error-message">Veículo não encontrado.</div>;

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % vehicle.images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + vehicle.images.length) % vehicle.images.length);

  return (
    <div className="details-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} /> Voltar ao Catálogo
      </button>

      <div className="details-grid">
        {/* Gallery Section */}
        <div className="gallery-section">
          <div className="main-image-wrapper">
            <AnimatePresence mode="wait">
              <motion.img 
                key={currentImageIndex}
                src={vehicle.images[currentImageIndex]} 
                alt={`${vehicle.make} ${vehicle.model}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              />
            </AnimatePresence>
            
            {vehicle.images.length > 1 && (
              <div className="gallery-controls">
                <button onClick={prevImage}><ChevronLeft size={24} /></button>
                <button onClick={nextImage}><ChevronRight size={24} /></button>
              </div>
            )}

            <button className="share-btn"><Share2 size={20} /></button>
          </div>

          <div className="thumbnails-grid">
            {vehicle.images.map((img, i) => (
              <div 
                key={i} 
                className={`thumbnail ${i === currentImageIndex ? 'active' : ''}`}
                onClick={() => setCurrentImageIndex(i)}
              >
                <img src={img} alt="" />
              </div>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="info-section">
          <div className="info-header">
            <div className="info-top">
              <span className="info-make">{vehicle.make}</span>
              <button 
                className={`fav-btn-round ${isFavorite ? 'active' : ''}`}
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Heart size={24} fill={isFavorite ? 'var(--color-gold)' : 'none'} />
              </button>
            </div>
            <h1>{vehicle.model}</h1>
            <div className="info-badges">
              <span className="badge year">{vehicle.year}</span>
              <span className="badge mileage">{vehicle.mileage?.toLocaleString('pt-BR')} km</span>
              <span className={`badge status ${vehicle.status}`}>{vehicle.status}</span>
            </div>
          </div>

          <div className="price-card glass-card">
            <div className="price-main">
              {vehicle.is_promotion && vehicle.discount_price ? (
                <>
                  <span className="old-price">{formatPrice(vehicle.price)}</span>
                  <span className="current-price promo">{formatPrice(vehicle.discount_price)}</span>
                </>
              ) : (
                <span className="current-price">{formatPrice(vehicle.price)}</span>
              )}
            </div>
            <p className="price-subtext">Consulte condições especiais de pagamento com nossos vendedores</p>
          </div>

          <div className="cta-group">
            <button className="premium-button contact-btn" onClick={() => setShowSellerModal(true)}>
              <MessageCircle size={20} /> Falar com Vendedor
            </button>
          </div>

          {/* Seller Modal */}
          <AnimatePresence>
            {showSellerModal && (
              <motion.div
                className="vd-seller-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowSellerModal(false)}
              >
                <motion.div
                  className="vd-seller-modal"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="vd-seller-header">
                    <h3>Escolha o vendedor</h3>
                    <button onClick={() => setShowSellerModal(false)}><X size={20} /></button>
                  </div>
                  <p className="vd-seller-vehicle">{vehicle.make} {vehicle.model} {vehicle.year}</p>
                  <div className="vd-seller-list">
                    {SELLERS.map((seller) => {
                      const msg = encodeURIComponent(`Olá ${seller.name}! Vim pelo site e tenho interesse no ${vehicle.make} ${vehicle.model} ${vehicle.year}. Poderia me dar mais informações?`);
                      return (
                        <a
                          key={seller.name}
                          href={`https://wa.me/${seller.phone}?text=${msg}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="vd-seller-item"
                          onClick={() => setShowSellerModal(false)}
                        >
                          <div className="vd-seller-avatar">{seller.name[0]}</div>
                          <div className="vd-seller-info">
                            <strong>{seller.name}</strong>
                            <span>{seller.role}</span>
                            <span className="vd-seller-phone"><Phone size={12} /> {seller.phone.replace('55','')}</span>
                          </div>
                          <div className="vd-wpp-icon">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="quick-specs">
            <div className="q-spec">
              <Settings size={20} />
              <div>
                <label>Câmbio</label>
                <span>{vehicle.transmission || 'Automático'}</span>
              </div>
            </div>
            <div className="q-spec">
              <Fuel size={20} />
              <div>
                <label>Combustível</label>
                <span>{vehicle.fuel_type || 'Flex'}</span>
              </div>
            </div>
            <div className="q-spec">
              <Shield size={20} />
              <div>
                <label>Garantia</label>
                <span>12 meses</span>
              </div>
            </div>
            <div className="q-spec">
              <MapPin size={20} />
              <div>
                <label>Localização</label>
                <span>São Paulo, SP</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications Details */}
      <section className="full-specs">
        <div className="section-title">
          <h2>Especificações Completas</h2>
          <p>Tudo o que você precisa saber sobre este {vehicle.make}</p>
        </div>

        <div className="specs-container glass-card">
          <div className="specs-category">
            <h3><Car size={20} /> Geral</h3>
            <ul>
              <li><strong>Marca</strong> {vehicle.make}</li>
              <li><strong>Modelo</strong> {vehicle.model}</li>
              <li><strong>Ano</strong> {vehicle.year}</li>
              <li><strong>Cor</strong> {vehicle.color || 'Não informada'}</li>
              <li><strong>KM</strong> {vehicle.mileage?.toLocaleString('pt-BR')}</li>
            </ul>
          </div>

          <div className="specs-category">
            <h3><Zap size={20} /> Performance</h3>
            <ul>
              <li><strong>Motorização</strong> {vehicle.engine || 'Não informada'}</li>
              <li><strong>Potência</strong> {vehicle.power || 'Não informada'}</li>
              <li><strong>Câmbio</strong> {vehicle.transmission || 'Automático'}</li>
              <li><strong>Tração</strong> {vehicle.drivetrain || 'Não informada'}</li>
            </ul>
          </div>

          <div className="specs-category">
            <h3><Shield size={20} /> Segurança e Tecnologia</h3>
            <ul>
              {(vehicle.features && vehicle.features.length > 0) ? (
                vehicle.features.map(feature => (
                  <li key={feature}><CheckCircle2 size={16} /> {feature}</li>
                ))
              ) : (
                <>
                  <li><CheckCircle2 size={16} /> Airbags Frontais e Laterais</li>
                  <li><CheckCircle2 size={16} /> Controle de Estabilidade</li>
                  <li><CheckCircle2 size={16} /> Central Multimídia</li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="description-section">
          <h3>Descrição do Veículo</h3>
          <p>{vehicle.description || 'Nenhuma descrição detalhada disponível.'}</p>
        </div>
      </section>

      <style>{`
        .details-container {
          max-width: 1300px;
          margin: 2rem auto 6rem;
          padding: 0 1.5rem;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--color-gray-600);
          font-weight: 600;
          margin-bottom: 2rem;
        }
        .back-btn:hover { color: var(--color-gold); }

        .details-grid {
          display: grid;
          grid-template-columns: 1.25fr 1fr;
          gap: 4rem;
          margin-bottom: 6rem;
        }

        .main-image-wrapper {
          position: relative;
          height: 500px;
          background: var(--color-gray-900);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: var(--shadow-lg);
        }

        .main-image-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .gallery-controls {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          transform: translateY(-50%);
          display: flex;
          justify-content: space-between;
          padding: 0 1rem;
        }

        .gallery-controls button {
          background: rgba(0,0,0,0.4);
          backdrop-filter: blur(8px);
          color: white;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .share-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          background: white;
          padding: 10px;
          border-radius: 50%;
          color: var(--color-black);
        }

        .thumbnails-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .thumbnail {
          height: 80px;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          opacity: 0.6;
          transition: var(--transition-fast);
          border: 2px solid transparent;
        }
        .thumbnail.active { opacity: 1; border-color: var(--color-gold); }
        .thumbnail img { width: 100%; height: 100%; object-fit: cover; }

        .info-header { margin-bottom: 2rem; }
        .info-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
        .info-make { color: var(--color-gold); font-weight: 800; letter-spacing: 2px; text-transform: uppercase; font-size: 0.9rem; }
        .info-header h1 { font-size: 3rem; text-transform: none; margin-bottom: 1rem; color: var(--color-black); }
        
        .info-badges { display: flex; gap: 1rem; }
        .badge { padding: 4px 12px; border-radius: 4px; font-weight: 700; font-size: 0.8rem; background: var(--color-gray-100); }
        .badge.status.available { background: #dcfce7; color: #166534; }

        .price-card {
          padding: 2.5rem;
          margin-bottom: 2.5rem;
        }
        .old-price { display: block; text-decoration: line-through; color: var(--color-gray-400); margin-bottom: 0.25rem; }
        .current-price { font-size: 2.5rem; font-weight: 900; color: var(--color-black); }
        .current-price.promo { color: #dc2626; }
        .price-subtext { margin-top: 1rem; color: var(--color-gray-500); font-weight: 600; }

        .cta-group { display: flex; gap: 1rem; margin-bottom: 3rem; }
        .contact-btn, .finance-btn { flex: 1; padding: 1.25rem; font-size: 0.9rem; }

        .quick-specs {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
        }
        .q-spec { display: flex; align-items: center; gap: 1rem; }
        .q-spec label { display: block; font-size: 0.75rem; color: var(--color-gray-500); text-transform: uppercase; font-weight: 700; }
        .q-spec span { font-weight: 700; font-size: 1rem; }

        .full-specs { margin-top: 8rem; }
        .full-specs .section-title { text-align: left; margin-bottom: 3rem; }
        .full-specs h2 { font-size: 2.5rem; margin-bottom: 0.5rem; }

        .specs-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 4rem;
          padding: 3rem;
          margin-bottom: 4rem;
        }

        .specs-category h3 { 
          display: flex; 
          align-items: center; 
          gap: 0.75rem; 
          font-size: 1.1rem; 
          margin-bottom: 2rem;
          color: var(--color-gold);
        }

        .specs-category ul { list-style: none; }
        .specs-category li { 
          display: flex; 
          justify-content: space-between; 
          padding: 0.75rem 0; 
          border-bottom: 1px solid var(--color-gray-100); 
          font-size: 0.95rem;
        }
        .specs-category li svg { color: #28a745; margin-right: 0.5rem; }

        .description-section {
          max-width: 800px;
        }
        .description-section h3 { margin-bottom: 1.5rem; font-size: 1.5rem; }
        .description-section p { line-height: 1.8; color: var(--color-gray-700); font-size: 1.1rem; }

        .loading-fullscreen {
          height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: var(--color-gold);
          font-weight: 800;
        }

        /* Seller Modal */
        .vd-seller-overlay {
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
        .vd-seller-modal {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          width: 100%;
          max-width: 380px;
          box-shadow: 0 25px 50px rgba(0,0,0,0.3);
        }
        .vd-seller-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .vd-seller-header h3 { font-size: 1.1rem; margin: 0; text-transform: none; }
        .vd-seller-header button { color: #aaa; padding: 4px; }
        .vd-seller-vehicle {
          font-size: 0.8rem;
          color: #888;
          margin: 0 0 1.25rem;
          font-style: italic;
        }
        .vd-seller-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .vd-seller-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.875rem 1rem;
          border: 1.5px solid #eee;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.2s;
        }
        .vd-seller-item:hover { border-color: #25D366; background: #f0fdf4; }
        .vd-seller-avatar {
          width: 44px; height: 44px;
          border-radius: 50%;
          background: var(--color-gold);
          color: white;
          font-weight: 800;
          font-size: 1.2rem;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .vd-seller-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .vd-seller-info strong { font-size: 0.95rem; color: #111; }
        .vd-seller-info span { font-size: 0.75rem; color: #888; }
        .vd-seller-phone {
          display: flex; align-items: center; gap: 4px;
          color: #555 !important;
          font-weight: 600 !important;
        }
        .vd-wpp-icon { color: #25D366; flex-shrink: 0; }

        @media (max-width: 1024px) {
          .details-grid { grid-template-columns: 1fr; gap: 3rem; }
          .specs-container { grid-template-columns: 1fr; gap: 2rem; }
        }
      `}</style>
    </div>
  );
};

export default VehicleDetails;
