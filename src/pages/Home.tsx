import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
import type { Vehicle } from '../types';
import VehicleCard from '../components/VehicleCard';
import { ChevronRight, Award, Zap, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Home: React.FC = () => {
  const [featuredVehicles, setFeaturedVehicles] = useState<Vehicle[]>([]);
  const [latestVehicles, setLatestVehicles] = useState<Vehicle[]>([]);
  const [promoVehicles, setPromoVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showWppChat, setShowWppChat] = useState(false);
  const navigate = useNavigate();

  const slides = [
    {
      title: "Desperte sua Paixão",
      subtitle: "Performance e Elegância em Cada Detalhe",
      image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=2000",
      cta: "Ver Coleção"
    },
    {
      title: "Luxo Sustentável",
      subtitle: "A Nova Era da Mobilidade Elétrica Chegou",
      image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=2000",
      cta: "Conhecer Modelos"
    }
  ];

  useEffect(() => {
    fetchData();
    fetchFavorites();

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [featuredRes, latestRes, promoRes] = await Promise.all([
        supabase.from('vehicles').select('*').eq('is_featured', true).eq('status', 'available').limit(6),
        supabase.from('vehicles').select('*').eq('status', 'available').order('created_at', { ascending: false }).limit(3),
        supabase.from('vehicles').select('*').eq('is_promotion', true).eq('status', 'available').limit(3)
      ]);

      if (featuredRes.error) console.error('Featured error:', featuredRes.error);
      if (latestRes.error) console.error('Latest error:', latestRes.error);
      if (promoRes.error) console.error('Promos error:', promoRes.error);

      if (featuredRes.data && featuredRes.data.length > 0) {
        setFeaturedVehicles(featuredRes.data);
      } else {
        const { data: fallback } = await supabase.from('vehicles').select('*').eq('status', 'available').limit(3);
        if (fallback) setFeaturedVehicles(fallback);
      }

      if (latestRes.data) setLatestVehicles(latestRes.data);
      if (promoRes.data) setPromoVehicles(promoRes.data);
    } catch (err) {
      console.error('Error fetching home data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data } = await supabase
        .from('favorites')
        .select('vehicle_id')
        .eq('user_id', session.user.id);
      if (data) setFavorites(data.map(f => f.vehicle_id));
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



  return (
    <div className="home-container">
      {/* Hero Slider */}
      <section className="hero-slider">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentSlide}
            className="slide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${slides[currentSlide].image})` }}
          >
            <div className="hero-content">
              <motion.h1 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {slides[currentSlide].title}
              </motion.h1>
              <motion.p
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {slides[currentSlide].subtitle}
              </motion.p>
              


              <motion.div
                className="hero-actions"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <button className="premium-button" onClick={() => navigate('/catalog')}>
                  {slides[currentSlide].cta} <ChevronRight size={20} />
                </button>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
        
        <div className="slider-nav">
          {slides.map((_, i) => (
            <button 
              key={i} 
              className={`slide-indicator ${i === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(i)}
            />
          ))}
        </div>
      </section>

      {/* Featured Section */}
      <section className="highlights-section">
        <div className="section-title-wrapper">
          <div className="section-badge"><Award size={16} /> Destaques</div>
          <h2>Veículos em Destaque</h2>
          <p>A melhor seleção de carros premium para você</p>
        </div>

        {loading ? (
          <div className="loading-grid">
            {[1,2,3,4,5,6].map(n => <div key={n} className="skeleton-card" />)}
          </div>
        ) : featuredVehicles.length > 0 ? (
          <div className="vehicles-grid">
            <AnimatePresence>
              {featuredVehicles.map((v) => (
                <VehicleCard key={v.id} vehicle={v} isFavorite={favorites.includes(v.id)} onToggleFavorite={toggleFavorite} />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="empty-state-card glass-card">
            <h3>Ops! Não encontramos destaques.</h3>
            <p>Tente atualizar a página ou confira nosso estoque completo.</p>
            <button className="premium-button" onClick={() => fetchData()}>Atualizar Dados</button>
          </div>
        )}

        <div className="view-all-container">
          <button className="premium-button-outline" onClick={() => navigate('/catalog')}>
            Ver Estoque Completo <ChevronRight size={18} />
          </button>
        </div>
      </section>

      {/* Latest Arrivals Section */}
      <section className="highlights-section gray-bg">
        <div className="section-title-wrapper">
          <div className="section-badge"><Zap size={16} /> Novidades</div>
          <h2>Recém Chegados</h2>
          <p>As últimas adições ao nosso estoque exclusivo</p>
        </div>

        {loading ? (
          <div className="loading-grid">
            {[1,2,3].map(n => <div key={n} className="skeleton-card" />)}
          </div>
        ) : latestVehicles.length > 0 ? (
          <div className="vehicles-grid">
            <AnimatePresence>
              {latestVehicles.map((v) => (
                <VehicleCard key={v.id} vehicle={v} isFavorite={favorites.includes(v.id)} onToggleFavorite={toggleFavorite} />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="empty-state-card glass-card">
            <h3>Nenhum veículo novo no momento.</h3>
            <p>Volte em breve para conferir as últimas novidades!</p>
            <button className="premium-button" onClick={() => fetchData()}>Atualizar Dados</button>
          </div>
        )}
      </section>

      {/* Promotions Section */}
      <section className="promo-section dark-section">
        <div className="promo-container">
          <div className="section-title-wrapper text-white">
            <div className="section-badge promo"><Zap size={16} /> Ofertas</div>
            <h2 className="text-white">Promoções Imperdíveis</h2>
            <p className="text-gray">Oportunidades únicas com preços reduzidos</p>
          </div>

          <div className="promo-grid">
            {loading ? (
              [1,2,3].map(n => <div key={n} className="skeleton-card" />)
            ) : promoVehicles.length > 0 ? (
              <AnimatePresence>
                {promoVehicles.map((v) => (
                  <VehicleCard key={v.id} vehicle={v} isFavorite={favorites.includes(v.id)} onToggleFavorite={toggleFavorite} />
                ))}
              </AnimatePresence>
            ) : (
              <div className="empty-state-card glass-card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem' }}>
                <h3>Nenhuma promoção ativa no momento.</h3>
                <p>Fique de olho, novas ofertas surgem a todo momento!</p>
                <button className="premium-button" onClick={() => fetchData()}>Atualizar Dados</button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="benefits-container">
        <motion.div 
          className="benefits-grid"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="benefit-item glass-card hover-lift"
            whileHover={{ y: -10 }}
          >
            <div className="benefit-icon-wrapper">
              <Shield size={40} className="text-gold" />
            </div>
            <h3>Garantia Total</h3>
            <p>Procedência verificada e garantia de 1 ano em todos os veículos.</p>
          </motion.div>
          
          <motion.div 
            className="benefit-item glass-card hover-lift"
            whileHover={{ y: -10 }}
          >
            <div className="benefit-icon-wrapper">
              <Award size={40} className="text-gold" />
            </div>
            <h3>Melhor Avaliação</h3>
            <p>Sua base de troca mais valorizada do mercado.</p>
          </motion.div>
          
          <motion.div 
            className="benefit-item glass-card hover-lift"
            whileHover={{ y: -10 }}
          >
            <div className="benefit-icon-wrapper">
              <Zap size={40} className="text-gold" />
            </div>
            <h3>Financiamento Rápido</h3>
            <p>Aprovação de crédito em até 30 minutos com as melhores taxas.</p>
          </motion.div>
        </motion.div>
      </section>



      <style>{`
        .home-container {
          overflow-x: hidden;
        }

        .hero-slider {
          height: 600px;
          position: relative;
          background: #000;
          margin-bottom: 4rem;
        }

        .slide {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: white;
          padding: 2rem;
        }

        .hero-content h1 {
          font-size: clamp(2.5rem, 8vw, 4.5rem);
          margin-bottom: 1.5rem;
          color: var(--color-white);
        }

        .hero-content p {
          font-size: 1.25rem;
          margin-bottom: 2.5rem;
          color: var(--color-gray-200);
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .slider-nav {
          position: absolute;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 15px;
          z-index: 10;
        }

        .slide-indicator {
          width: 40px;
          height: 4px;
          background: rgba(255,255,255,0.3);
          border-radius: 2px;
          transition: var(--transition-normal);
        }

        .slide-indicator.active {
          background: var(--color-gold);
          width: 60px;
        }

        .highlights-section, .promo-section, .catalog-section, .benefits {
          max-width: 1300px;
          margin: 0 auto 6rem;
          padding: 0 1.5rem;
        }

        .section-title-wrapper {
          text-align: center;
          margin-bottom: 4rem;
        }

        .section-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--color-gray-100);
          color: var(--color-gold);
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 800;
          text-transform: uppercase;
          margin-bottom: 1rem;
        }
        .section-badge.promo { background: rgba(220, 38, 38, 0.1); color: #dc2626; }

        .highlights-section h2, .promo-section h2, .catalog-section h2 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .vehicles-grid, .promo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 2.5rem;
        }

        .promo-section {
          background: var(--color-black);
          margin-left: 0;
          margin-right: 0;
          max-width: none;
          padding: 6rem 0;
        }

        .promo-container {
          max-width: 1300px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        .text-white { color: white; }
        .text-gray { color: var(--color-gray-400); }

        .benefits-container {
          max-width: 1300px;
          margin: 0 auto;
          padding: 6rem 1.5rem;
        }

        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .benefit-item {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          padding: 3rem 2rem;
          transition: var(--transition-normal);
        }

        .benefit-icon-wrapper {
          width: 80px;
          height: 80px;
          background: rgba(184, 134, 11, 0.05);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.5rem;
        }

        .benefit-item h3 { font-size: 1.25rem; font-weight: 800; }
        .benefit-item p { color: var(--color-gray-600); line-height: 1.6; }

        .catalog-search-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3rem;
          flex-wrap: wrap;
          gap: 2rem;
        }

        .search-bar {
          background: var(--color-gray-100);
          padding: 0.75rem 1.5rem;
          border-radius: 50px;
          display: flex;
          align-items: center;
          gap: 1rem;
          width: 400px;
          border: 1px solid var(--color-gray-200);
        }

        .search-bar input {
          border: none;
          outline: none;
          background: transparent;
          width: 100%;
          font-size: 1rem;
        }

        .skeleton-card {
          height: 400px;
          background: var(--color-gray-100);
          border-radius: 12px;
          animation: pulse 1.5s infinite;
        }

        .highlights-section.gray-bg {
          background-color: var(--color-gray-100);
        }

        .view-all-container {
          display: flex;
          justify-content: center;
          margin-top: 4rem;
        }

        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 0.3; }
          100% { opacity: 0.6; }
        }

        @media (max-width: 768px) {
          .hero-slider { height: 500px; }
          .benefits-grid { grid-template-columns: 1fr; gap: 4rem; }
          .search-bar { width: 100%; }
          .catalog-search-header { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      {/* Floating WhatsApp Button */}
      <div className="wpp-float-wrapper">
        <AnimatePresence>
          {showWppChat && (
            <motion.div
              className="wpp-chat-box"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
            >
              <div className="wpp-chat-header">
                <div className="wpp-chat-avatar">N</div>
                <div>
                  <strong>NexusCar</strong>
                  <span>Geralmente responde em minutos</span>
                </div>
                <button className="wpp-chat-close" onClick={() => setShowWppChat(false)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="wpp-chat-body">
                <div className="wpp-bubble">
                  <p>👋 Olá! Bem-vindo à <strong>NexusCar</strong>!</p>
                  <p>Estamos prontos para te ajudar a encontrar o carro ideal. Clique abaixo para iniciar uma conversa no WhatsApp com nossa equipe!</p>
                  <span className="wpp-time">Agora</span>
                </div>
              </div>
              <a
                href={`https://wa.me/5579999885599?text=${encodeURIComponent('Olá! Vim pelo site da NexusCar e gostaria de saber mais sobre os veículos disponíveis.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="wpp-chat-cta"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Iniciar conversa no WhatsApp
              </a>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          className="wpp-float-btn"
          onClick={() => setShowWppChat(!showWppChat)}
          animate={{ scale: showWppChat ? 0.9 : [1, 1.1, 1] }}
          transition={{ repeat: showWppChat ? 0 : Infinity, duration: 2, repeatDelay: 3 }}
          title="Falar conosco no WhatsApp"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="30" height="30">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          {!showWppChat && <span className="wpp-pulse"></span>}
        </motion.button>
      </div>

      <style>{`
        /* WhatsApp Float */
        .wpp-float-wrapper {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 1rem;
        }
        .wpp-float-btn {
          width: 60px; height: 60px;
          border-radius: 50%;
          background: #25D366;
          color: white;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 20px rgba(37,211,102,0.5);
          position: relative;
          cursor: pointer;
          border: none;
        }
        .wpp-pulse {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: #25D366;
          animation: wpp-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          z-index: -1;
        }
        @keyframes wpp-ping {
          75%, 100% { transform: scale(1.7); opacity: 0; }
        }
        .wpp-chat-box {
          background: white;
          border-radius: 16px;
          width: 300px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          overflow: hidden;
        }
        .wpp-chat-header {
          background: #075E54;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: white;
        }
        .wpp-chat-avatar {
          width: 40px; height: 40px;
          border-radius: 50%;
          background: #25D366;
          display: flex; align-items: center; justify-content: center;
          font-weight: 800;
          font-size: 1.1rem;
          flex-shrink: 0;
        }
        .wpp-chat-header div { flex: 1; }
        .wpp-chat-header strong { display: block; font-size: 0.95rem; }
        .wpp-chat-header span { font-size: 0.75rem; opacity: 0.8; }
        .wpp-chat-close {
          background: none;
          color: rgba(255,255,255,0.7);
          padding: 4px;
          cursor: pointer;
          border: none;
        }
        .wpp-chat-body {
          padding: 1rem;
          background: #ECE5DD;
        }
        .wpp-bubble {
          background: white;
          border-radius: 0 12px 12px 12px;
          padding: 0.875rem 1rem;
          max-width: 90%;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          position: relative;
        }
        .wpp-bubble p { font-size: 0.875rem; color: #333; line-height: 1.5; margin: 0 0 0.25rem; }
        .wpp-bubble p:last-of-type { margin-bottom: 0.5rem; }
        .wpp-time { font-size: 0.7rem; color: #999; float: right; margin-top: 4px; }
        .wpp-chat-cta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1rem;
          background: #25D366;
          color: white;
          font-weight: 700;
          font-size: 0.85rem;
          text-decoration: none;
          transition: background 0.2s;
        }
        .wpp-chat-cta:hover { background: #1ebe5d; }
      `}</style>
    </div>
  );
};

export default Home;
