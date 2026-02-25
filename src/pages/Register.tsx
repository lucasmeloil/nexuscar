import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Mail, Lock, User, Loader2, ArrowLeft } from 'lucide-react';

const Register: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (authError) {
        setError(authError.message);
      } else {
        alert('Cadastro realizado com sucesso! Favor verificar seu email.');
        navigate('/login');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="back-link"><ArrowLeft size={16} /> Voltar ao site</Link>
        <div className="auth-header">
          <h1>NEW CARS</h1>
          <p>Crie sua conta na melhor concessionária</p>
        </div>

        <form onSubmit={handleRegister}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label>Nome Completo</label>
            <div className="input-wrapper">
              <User size={18} />
              <input 
                type="text" 
                placeholder="Seu Nome" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <div className="input-wrapper">
              <Mail size={18} />
              <input 
                type="email" 
                placeholder="seu@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Senha</label>
            <div className="input-wrapper">
              <Lock size={18} />
              <input 
                type="password" 
                placeholder="Mínimo 6 caracteres" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          <button type="submit" className="premium-button auth-submit" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : 'Criar Conta'}
          </button>
        </form>

        <div className="auth-footer">
          Já tem uma conta? <Link to="/login">Entre agora</Link>
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--color-black);
          background-image: linear-gradient(45deg, rgba(184, 134, 11, 0.1) 0%, rgba(0,0,0,1) 100%);
          padding: 2rem;
        }

        .auth-card {
          background: var(--color-white);
          width: 100%;
          max-width: 450px;
          padding: 3rem;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
          position: relative;
        }

        .back-link {
          position: absolute;
          top: 1.5rem;
          left: 1.5rem;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--color-gray-500);
        }
        .back-link:hover { color: var(--color-gold); }

        .auth-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .auth-header h1 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          color: var(--color-black);
        }

        .auth-header p {
          color: var(--color-gray-600);
          font-size: 0.9rem;
        }

        .error-message {
          background: #fee2e2;
          color: #dc2626;
          padding: 0.75rem;
          border-radius: 4px;
          margin-bottom: 1.5rem;
          font-size: 0.85rem;
          text-align: center;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 0.5rem;
          color: var(--color-gray-700);
        }

        .input-wrapper {
          display: flex;
          align-items: center;
          gap: 1rem;
          border-bottom: 2px solid var(--color-gray-200);
          padding: 0.5rem 0;
          transition: border-color var(--transition-fast);
        }

        .input-wrapper:focus-within {
          border-color: var(--color-gold);
        }

        .input-wrapper input {
          border: none;
          outline: none;
          flex: 1;
          font-size: 1rem;
        }

        .auth-submit {
          width: 100%;
          justify-content: center;
          margin-top: 1rem;
          height: 50px;
          font-size: 1rem;
        }

        .auth-footer {
          text-align: center;
          margin-top: 2rem;
          font-size: 0.9rem;
          color: var(--color-gray-600);
        }

        .auth-footer a {
          color: var(--color-gold);
          font-weight: 700;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Register;
