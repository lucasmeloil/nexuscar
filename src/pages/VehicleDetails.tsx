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
  Car
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VehicleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
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
                  <span className="old-price">R$ {vehicle.price.toLocaleString('pt-BR')}</span>
                  <span className="current-price promo">R$ {vehicle.discount_price.toLocaleString('pt-BR')}</span>
                </>
              ) : (
                <span className="current-price">R$ {vehicle.price.toLocaleString('pt-BR')}</span>
              )}
            </div>
            <p className="price-subtext">Ou parcelas a partir de R$ {(vehicle.price/48).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}/mês</p>
          </div>

          <div className="cta-group">
            <button className="premium-button contact-btn">
              <MessageCircle size={20} /> Falar com Vendedor
            </button>
            <button className="premium-button-outline finance-btn">
              <Zap size={20} /> Simular Financiamento
            </button>
          </div>

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

        @media (max-width: 1024px) {
          .details-grid { grid-template-columns: 1fr; gap: 3rem; }
          .specs-container { grid-template-columns: 1fr; gap: 2rem; }
        }
      `}</style>
    </div>
  );
};

export default VehicleDetails;
