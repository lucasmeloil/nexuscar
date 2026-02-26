import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Instagram, MessageCircle } from 'lucide-react';

const Contact: React.FC = () => {
  return (
    <div className="contact-page">
      <section className="contact-header">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="contact-header-content text-center"
        >
          <div className="section-badge"><MessageCircle size={16} /> Fale Conosco</div>
          <h1>Nossos Contatos</h1>
          <p>Estamos sempre à disposição para oferecer o melhor atendimento e tirar todas as suas dúvidas.</p>
        </motion.div>
      </section>

      <section className="contact-content">
        <div className="contact-grid">
          {/* Informações de Contato */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="contact-info-cards"
          >
            <div className="info-card solid-card">
              <div className="info-icon">
                <MessageCircle size={32} />
              </div>
              <div className="info-details">
                <h3>WhatsApp</h3>
                <p>Atendimento Rápido</p>
                <a href="https://wa.me/5579999885599" target="_blank" rel="noopener noreferrer" className="contact-link">
                  (79) 99988-5599
                </a>
              </div>
            </div>

            <div className="info-card solid-card">
              <div className="info-icon">
                <Phone size={32} />
              </div>
              <div className="info-details">
                <h3>Telefone Fixo</h3>
                <p>Horário Comercial</p>
                <a href="tel:+5579999885599" className="contact-link">
                  (79) 99988-5599
                </a>
              </div>
            </div>

            <div className="info-card solid-card">
              <div className="info-icon">
                <Mail size={32} />
              </div>
              <div className="info-details">
                <h3>E-mail</h3>
                <p>Envie sua proposta ou dúvida</p>
                <a href="mailto:contato@newcar.com" className="contact-link">
                  contato@newcar.com
                </a>
              </div>
            </div>

            <div className="info-card solid-card">
              <div className="info-icon">
                <Instagram size={32} />
              </div>
              <div className="info-details">
                <h3>Instagram</h3>
                <p>Acompanhe as novidades</p>
                <a href="https://instagram.com/newcar" target="_blank" rel="noopener noreferrer" className="contact-link">
                  @newcar
                </a>
              </div>
            </div>
          </motion.div>

          {/* Mapa de Localização */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="map-card solid-card"
          >
            <div className="map-header">
              <MapPin size={24} className="text-gold" />
              <h3>Nossa Localização</h3>
            </div>
            <p className="map-address">BR-235, 52km, Av. Alípio Tavares de Menezes - Oviêdo Teixeira, Itabaiana - SE, 49507-640</p>
            
            <div className="map-container">
              {/* Mapa do Google embutido com iframe fornecido pelo usuário */}
              <iframe
                src="https://www.google.com/maps/embed?pb=!3m2!1spt-BR!2sbr!4v1772107611332!5m2!1spt-BR!2sbr!6m8!1m7!1sF-GygWwOin_V0nvvyWTp6w!2m2!1d-10.70144131364811!2d-37.43046126338215!3f205.42488760995633!4f1.9607888148797343!5f0.7820865974627469"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização da Empresa"
              ></iframe>
            </div>
            <a 
              href="https://maps.app.goo.gl/mPWvzagY9wEQJhR79"
              target="_blank"
              rel="noopener noreferrer"
              className="premium-button map-btn"
            >
              Navegar até a loja
            </a>
          </motion.div>
        </div>
      </section>

      <style>{`
        .contact-page {
          padding-top: 2rem;
          padding-bottom: 6rem;
          min-height: calc(100vh - 84px - 70px);
          overflow-x: hidden;
        }

        .contact-header {
          padding: 4rem 1.5rem 2rem;
          max-width: 800px;
          margin: 0 auto;
        }

        .contact-header-content h1 {
          font-size: clamp(2rem, 5vw, 3rem);
          margin-bottom: 1rem;
        }

        .contact-header-content p {
          color: var(--color-gray-400);
          font-size: 1.1rem;
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

        .contact-content {
          max-width: 1300px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 3rem;
        }

        @media (min-width: 900px) {
          .contact-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .contact-info-cards {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        .solid-card {
          background: #111111;
          border: 1px solid #222;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }

        .info-card {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 2rem;
          transition: var(--transition-normal);
        }

        .info-card:hover {
          transform: scale(1.02);
          border-color: var(--color-gold);
          background: #161616;
        }

        .info-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(184, 134, 11, 0.1);
          color: var(--color-gold);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .info-details h3 {
          font-size: 1.2rem;
          margin-bottom: 0.2rem;
          color: var(--color-white);
        }

        .info-details p {
          color: var(--color-gray-500);
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        .contact-link {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--color-gold);
          text-decoration: none;
          transition: var(--transition-fast);
        }

        .contact-link:hover {
          color: #fff;
        }

        .map-card {
          padding: 2rem;
          display: flex;
          flex-direction: column;
        }

        .map-header {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          margin-bottom: 0.5rem;
        }

        .map-header h3 {
          font-size: 1.5rem;
        }

        .text-gold {
          color: var(--color-gold);
        }

        .map-address {
          color: var(--color-gray-400);
          margin-bottom: 1.5rem;
          font-size: 1rem;
        }

        .map-container {
          flex: 1;
          min-height: 300px;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 1.5rem;
          border: 1px solid var(--color-gray-800);
        }

        .map-btn {
          width: 100%;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default Contact;
