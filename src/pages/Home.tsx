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
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showWppChat, setShowWppChat] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerMessage, setCustomerMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    fetchFavorites();

    // Configuração do Realtime para sincronização em tempo real
    const channel = supabase
      .channel('vehicles-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vehicles' },
        () => {
          console.log('Dados atualizados no banco, recarregando...');
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fallback timeout para não travar a UI
      const timer = setTimeout(() => {
        setLoading(false);
      }, 5000);

      // Buscas independentes para maior resiliência
      const fetchFeatured = async () => {
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .eq('status', 'available')
          .eq('is_featured', true)
          .limit(6);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setFeaturedVehicles(data);
        } else {
          // Fallback se não houver destaques marcados
          const { data: fallback } = await supabase
            .from('vehicles')
            .select('*')
            .eq('status', 'available')
            .limit(3);
          if (fallback) setFeaturedVehicles(fallback);
        }
      };

      const fetchLatest = async () => {
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .eq('status', 'available')
          .order('created_at', { ascending: false })
          .limit(3);
        if (error) throw error;
        if (data) setLatestVehicles(data);
      };

      const fetchPromo = async () => {
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .eq('status', 'available')
          .eq('is_promotion', true)
          .limit(3);
        if (error) throw error;
        if (data) setPromoVehicles(data);
      };

      await Promise.allSettled([
        fetchFeatured(),
        fetchLatest(),
        fetchPromo()
      ]);

      clearTimeout(timer);
    } catch (err) {
      console.error('Erro na integração Supabase:', err);
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
      {/* Modern Hero Section - 2025 Style */}
      <section className="hero-modern">
        <div 
          className="hero-bg-gradient"
          style={{ 
            backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(184, 134, 11, 0.15) 100%)`
          }}
        />
        <div className="hero-content-container">
          {/* Mascot (Top in Mobile) */}
          <motion.div 
            className="hero-mascot-side"
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="mascot-wrapper">
              <motion.img 
                src="/mascote.png" 
                alt="New Car Mascot" 
                className="mascot-img"
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="mascot-shadow"></div>
            </div>
          </motion.div>

          {/* Text & Actions (Below in Mobile) */}
          <motion.div 
            className="hero-text-side"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          >
            <div className="hero-badge modern">CARRO NOVO 2025</div>
            <motion.h1 
              className="modern-hero-title"
              style={{ 
                color: '#ffffff',
                fontWeight: 900,
                textShadow: '3px 3px 0px #000000, 0 0 40px rgba(184, 134, 11, 0.4)',
              }}
            >
              A LOJA DOS <span className="gold-text">AMIGOS</span>
            </motion.h1>
            <motion.p
              className="modern-hero-p"
              style={{ 
                color: '#ffffff',
                fontWeight: 600,
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              }}
            >
              Onde o negócio é transparente e a parceria é real. <br/>
              O carro dos seus sonhos está aqui.
            </motion.p>
            <div className="hero-modern-actions">
              <button className="premium-button glow large grow" onClick={() => navigate('/catalog')}>
                Explorar Carros <ChevronRight size={22} strokeWidth={3} />
              </button>
              <button className="premium-button-outline white large grow" onClick={() => navigate('/contact')}>
                Falar com Vendedor
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Highlights Section */}
      <motion.section 
        className="highlights-section"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <div className="section-title-wrapper">
          <div className="section-badge"><Award size={16} /> Destaques</div>
          <h2>Veículos em Destaque</h2>
          <div className="title-underline"></div>
          <p>A melhor seleção de carros premium para você</p>
        </div>

        {loading ? (
          <div className="loading-grid">
            {[1,2,3,4,5,6].map(n => <div key={n} className="skeleton-card" />)}
          </div>
        ) : featuredVehicles.length > 0 ? (
          <div className="vehicles-grid">
            <AnimatePresence>
              {featuredVehicles.map((v, idx) => (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                >
                  <VehicleCard vehicle={v} isFavorite={favorites.includes(v.id)} onToggleFavorite={toggleFavorite} />
                </motion.div>
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
      </motion.section>

      {/* Latest Arrivals Section */}
      <motion.section 
        className="highlights-section gray-bg"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="section-title-wrapper">
          <div className="section-badge"><Zap size={16} /> Novidades</div>
          <h2>Recém Chegados</h2>
          <div className="title-underline"></div>
          <p>As últimas adições ao nosso estoque exclusivo</p>
        </div>

        {loading ? (
          <div className="loading-grid">
            {[1,2,3].map(n => <div key={n} className="skeleton-card" />)}
          </div>
        ) : latestVehicles.length > 0 ? (
          <div className="vehicles-grid">
            <AnimatePresence>
              {latestVehicles.map((v, idx) => (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                >
                  <VehicleCard vehicle={v} isFavorite={favorites.includes(v.id)} onToggleFavorite={toggleFavorite} />
                </motion.div>
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
      </motion.section>

      {/* Promotions Section */}
      <motion.section 
        className="promo-section dark-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <div className="promo-container">
          <div className="section-title-wrapper text-white">
            <div className="section-badge promo"><Zap size={16} /> Ofertas</div>
            <h2 className="text-white">Promoções Imperdíveis</h2>
            <div className="title-underline gold"></div>
            <p className="text-gray">Oportunidades únicas com preços reduzidos</p>
          </div>

          <div className="promo-grid">
            {loading ? (
              [1,2,3].map(n => <div key={n} className="skeleton-card" />)
            ) : promoVehicles.length > 0 ? (
              <AnimatePresence>
                {promoVehicles.map((v, idx) => (
                  <motion.div
                    key={v.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <VehicleCard vehicle={v} isFavorite={favorites.includes(v.id)} onToggleFavorite={toggleFavorite} />
                  </motion.div>
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
      </motion.section>

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
            whileHover={{ y: -15, scale: 1.02 }}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="benefit-icon-wrapper">
              <Shield size={40} className="text-gold" />
            </div>
            <h3>Garantia Total</h3>
            <p>Procedência verificada e garantia de 1 ano em todos os veículos.</p>
          </motion.div>
          
          <motion.div 
            className="benefit-item glass-card hover-lift"
            whileHover={{ y: -15, scale: 1.02 }}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <div className="benefit-icon-wrapper">
              <Award size={40} className="text-gold" />
            </div>
            <h3>Melhor Avaliação</h3>
            <p>Sua base de troca mais valorizada do mercado.</p>
          </motion.div>
          
          <motion.div 
            className="benefit-item glass-card hover-lift"
            whileHover={{ y: -15, scale: 1.02 }}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
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
        .hero-badge {
          display: inline-block;
          background: rgba(184, 134, 11, 0.2);
          border: 1px solid var(--color-gold);
          color: var(--color-gold);
          padding: 6px 16px;
          border-radius: 50px;
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 1.5rem;
        }

        .hero-modern {
          min-height: calc(100vh - 84px);
          width: 100%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background-color: #000; /* Pure Black Background */
          padding: 2rem 0;
        }

        .hero-bg-gradient {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(184, 134, 11, 0.05) 0%, rgba(0,0,0,1) 100%);
          z-index: 1;
        }

        .hero-content-container {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 1300px;
          padding: 0 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 4rem;
        }

        .hero-text-side {
          flex: 1.2;
          text-align: left;
        }

        .hero-badge.modern {
          background: rgba(184, 134, 11, 0.2);
          border: 1px solid var(--color-gold);
          color: var(--color-gold);
          padding: 0.5rem 1.5rem;
          border-radius: 50px;
          display: inline-block;
          font-weight: 800;
          font-size: 0.8rem;
          letter-spacing: 2px;
          margin-bottom: 2rem;
        }

        .modern-hero-title {
          font-size: clamp(3rem, 6vw, 5.5rem);
          line-height: 1.1;
          margin-bottom: 1.5rem;
          white-space: pre-line;
        }

        .gold-text {
          color: var(--color-gold);
          text-shadow: 0 0 30px rgba(184, 134, 11, 0.4);
        }

        .modern-hero-p {
          font-size: 1.3rem;
          line-height: 1.6;
          margin-bottom: 3.5rem;
          opacity: 0.95;
        }

        .hero-modern-actions {
          display: flex;
          gap: 1.5rem;
        }

        .hero-mascot-side {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .mascot-wrapper {
          position: relative;
          width: 100%;
          max-width: 550px;
          background: #000; /* Black background for mascot focus */
          border-radius: 50%;
          padding: 20px;
        }

        .mascot-img {
          width: 100%;
          height: auto;
          filter: drop-shadow(0 0 30px rgba(255,255,255,0.1));
          z-index: 2;
          position: relative;
        }

        .mascot-shadow {
          position: absolute;
          bottom: -20px;
          left: 50%;
          transform: translateX(-50%);
          width: 60%;
          height: 30px;
          background: radial-gradient(ellipse at center, rgba(184, 134, 11, 0.2) 0%, transparent 70%);
          z-index: 1;
        }

        @media (max-width: 1024px) {
          .hero-modern {
            height: calc(100vh - 80px);
            padding: 1rem 0;
            display: flex;
            align-items: center;
          }
          .hero-content-container {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
            padding-top: 0;
            justify-content: center;
            height: 100%;
          }
          .hero-mascot-side {
            order: 1;
            width: 100%;
            max-width: 16rem;
            margin-bottom: 0.5rem;
          }
          .hero-text-side {
            order: 2;
            text-align: center;
            width: 100%;
            padding: 0 1rem;
          }
          .modern-hero-title {
            font-size: 2rem;
            margin-bottom: 0.5rem;
          }
          .modern-hero-p {
            display: none;
          }
          .hero-modern-actions {
            flex-direction: column;
            gap: 0.75rem;
            width: 100%;
            align-items: center;
          }
          .hero-badge.modern {
            display: none;
          }
          .premium-button.large, .premium-button-outline.large {
            width: 100%;
            max-width: 320px;
            padding: 1rem;
            font-size: 1rem;
          }
        }

        @media (max-width: 380px) {
          .hero-mascot-side {
            max-width: 12rem;
          }
          .modern-hero-title {
            font-size: 1.7rem;
          }
        }

        .hero-actions {
          display: flex;
          gap: 2rem;
          justify-content: center;
          margin-top: 1rem;
        }

        .premium-button.grow, .premium-button-outline.large {
           transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .premium-button.grow:hover { transform: scale(1.05) translateY(-5px); }

        .premium-button.glow.large {
          padding: 1.25rem 3rem;
          font-size: 1.1rem;
        }

        .premium-button-outline.white.large {
          padding: 1.25rem 3rem;
          font-size: 1.1rem;
          border-color: white;
          color: white;
        }

        .premium-button-outline.white.large:hover {
          background: white;
          color: black;
        }

          .glass-hero {
            padding: 3rem 1.5rem;
            margin: 0 1rem;
            border-radius: 24px;
          }
          .hero-slider h1 {
            font-size: 2.5rem !important;
            line-height: 1.1;
            margin-bottom: 1.5rem;
          }
          .hero-slider p {
            font-size: 1.1rem !important;
            margin-bottom: 2rem !important;
          }
          .hero-actions {
            flex-direction: column;
            gap: 1rem;
            width: 100%;
          }
          .premium-button.large, .premium-button-outline.large {
            width: 100%;
            padding: 1.1rem;
          }
        }

        .title-underline {
          width: 80px;
          height: 3px;
          background: var(--color-gold);
          margin: 1.5rem auto;
          position: relative;
        }

        .title-underline::after {
          content: "";
          position: absolute;
          width: 10px;
          height: 10px;
          background: var(--color-gold);
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 0 0 10px var(--color-gold);
        }

        .title-underline.gold { background: var(--color-gold); }

        .highlights-section, .promo-section, .catalog-section, .benefits {
          max-width: 1300px;
          margin: 0 auto 8rem;
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
              initial={{ opacity: 0, scale: 0.8, y: 20, transformOrigin: 'bottom right' }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
            >
              <div className="wpp-chat-header">
                <div className="wpp-chat-profile">
                  <div className="wpp-chat-avatar">
                    <img src="/logo.png" alt="NEW CAR" />
                    <span className="wpp-online-dot"></span>
                  </div>
                  <div className="wpp-chat-identity">
                    <strong>Suporte NEW CAR</strong>
                    <span>Online agora</span>
                  </div>
                </div>
                <button className="wpp-chat-close" onClick={() => setShowWppChat(false)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20" strokeWidth="2.5"><path d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="wpp-chat-body">
                <div className="wpp-bubble">
                  <p>Olá! 👋</p>
                  <p>Por favor, preencha seus dados para agilizar seu atendimento:</p>
                </div>

                <div className="wpp-form">
                  <div className="wpp-input-group">
                    <input 
                      type="text" 
                      placeholder="Seu nome" 
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="wpp-field"
                    />
                  </div>
                  <div className="wpp-input-group">
                    <input 
                      type="tel" 
                      placeholder="Seu telefone" 
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="wpp-field"
                    />
                  </div>
                  <div className="wpp-input-group">
                    <textarea 
                      placeholder="Qual veículo você tem interesse?" 
                      value={customerMessage}
                      onChange={(e) => setCustomerMessage(e.target.value)}
                      className="wpp-field wpp-textarea"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
              <a
                href={`https://wa.me/5579999885599?text=${encodeURIComponent(`Olá! Meu nome é ${customerName}, telefone ${customerPhone}. Tenho interesse em: ${customerMessage}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`wpp-chat-cta ${(!customerName || !customerPhone) ? 'disabled' : ''}`}
                onClick={(e) => {
                  if (!customerName || !customerPhone) {
                    e.preventDefault();
                    alert('Por favor, preencha seu nome e telefone.');
                  }
                }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Enviar Mensagem
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

        @media (max-width: 1023px) {
          .wpp-float-wrapper {
            bottom: calc(70px + 1rem);
            right: 1.5rem;
          }
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
          background: #ffffff;
          border-radius: 16px;
          width: 300px;
          box-shadow: 0 12px 48px rgba(0,0,0,0.25);
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        @media (max-width: 480px) {
          .wpp-chat-box { width: calc(100vw - 2.5rem); }
        }

        .wpp-chat-header {
          background: #075E54;
          padding: 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: white;
        }

        .wpp-chat-profile { display: flex; align-items: center; gap: 1rem; }

        .wpp-chat-avatar {
          width: 48px; height: 48px;
          border-radius: 50%;
          background: #ffffff;
          padding: 4px;
          display: flex; align-items: center; justify-content: center;
          position: relative;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .wpp-chat-avatar img { width: 100%; height: auto; object-fit: contain; }

        .wpp-online-dot {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 12px;
          height: 12px;
          background: #25D366;
          border: 2px solid #075E54;
          border-radius: 50%;
        }

        .wpp-chat-identity strong { 
          display: block; 
          font-size: 1rem; 
          font-weight: 700;
          line-height: 1.2;
        }

        .wpp-chat-identity span { font-size: 0.8rem; opacity: 0.85; }

        .wpp-chat-close {
          background: rgba(255,255,255,0.1);
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: none;
        }

        .wpp-chat-body {
          padding: 1rem;
          background: #E5DDD5;
          position: relative;
        }

        .wpp-form {
          margin-top: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          position: relative;
          z-index: 2;
        }

        .wpp-input-group {
          width: 100%;
        }

        .wpp-field {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.1);
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s;
          background: white;
        }

        .wpp-field:focus {
          border-color: #25D366;
        }

        .wpp-textarea {
          resize: none;
          font-family: inherit;
        }

        .wpp-bubble {
          background: white;
          border-radius: 0 16px 16px 16px;
          padding: 1rem;
          max-width: 95%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          position: relative;
          z-index: 1;
        }

        .wpp-bubble p { font-size: 0.9rem; color: #303030; line-height: 1.5; margin: 0 0 0.5rem; }
        .wpp-bubble p:last-of-type { margin-bottom: 0px; }

        .wpp-chat-cta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 1.25rem;
          background: #25D366;
          color: white !important;
          font-weight: 700;
          font-size: 1rem;
          text-decoration: none;
          transition: all 0.2s ease;
          border: none;
          width: 100%;
          cursor: pointer;
        }

        .wpp-chat-cta.disabled {
          background: #ccc;
          cursor: not-allowed;
          opacity: 0.8;
        }

        .wpp-chat-cta:not(.disabled):hover { 
          background: #1ebe5d;
          gap: 1rem;
        }
      `}</style>
    </div>
  );
};

export default Home;
