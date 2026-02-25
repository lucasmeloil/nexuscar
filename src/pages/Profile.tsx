import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { uploadFile } from '../services/storage';
import type { Profile } from '../types';
import { User, FileText, Upload, CheckCircle, Loader2 } from 'lucide-react';

interface ProfilePageProps {
  profile: Profile;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ profile }) => {
  const [uploading, setUploading] = useState(false);
  const [docUrl, setDocUrl] = useState(profile.document_url);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Você deve selecionar um arquivo.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${profile.id}/cnh.${fileExt}`;

      const publicUrl = await uploadFile('documents', filePath, file);
      
      // Update profile in DB
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ document_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;
      
      setDocUrl(publicUrl);
      alert('Documento enviado com sucesso!');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Meu Perfil</h1>
        <p>Gerencie seus dados e documentos</p>
      </div>

      <div className="profile-grid">
        <section className="profile-section info-card">
          <div className="section-title">
            <User size={20} />
            <h3>Informações Pessoais</h3>
          </div>
          <div className="info-item">
            <label>Nome Completo</label>
            <p>{profile.full_name}</p>
          </div>
          <div className="info-item">
            <label>Email</label>
            <p>{profile.email}</p>
          </div>
          <div className="info-item">
            <label>Tipo de Conta</label>
            <p className="role-badge">{profile.role}</p>
          </div>
        </section>

        <section className="profile-section docs-card">
          <div className="section-title">
            <FileText size={20} />
            <h3>Documentação (CNH)</h3>
          </div>
          
          {docUrl ? (
            <div className="doc-status success">
              <CheckCircle size={32} />
              <div>
                <h4>Documento Verificado</h4>
                <a href={docUrl} target="_blank" rel="noreferrer">Visualizar Arquivo</a>
              </div>
            </div>
          ) : (
            <div className="doc-upload-zone">
              <p>Para prosseguir com compras ou test-drives, envie uma foto da sua CNH.</p>
              <label className="upload-btn">
                {uploading ? <Loader2 className="animate-spin" /> : <Upload size={20} />}
                {uploading ? 'Enviando...' : 'Fazer Upload da CNH'}
                <input 
                  type="file" 
                  accept="image/*,.pdf" 
                  onChange={handleFileUpload} 
                  disabled={uploading}
                  hidden 
                />
              </label>
            </div>
          )}
        </section>
      </div>

      <style>{`
        .profile-container {
          max-width: 1000px;
          margin: 4rem auto;
          padding: 0 1.5rem;
        }

        .profile-header {
          margin-bottom: 3rem;
        }

        .profile-header h1 { font-size: 2.5rem; }
        .profile-header p { color: var(--color-gray-500); }

        .profile-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .profile-section {
          background: white;
          padding: 2.5rem;
          border-radius: 12px;
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--color-gray-200);
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2rem;
          color: var(--color-gold);
        }

        .section-title h3 { text-transform: none; margin: 0; color: var(--color-black); }

        .info-item {
          margin-bottom: 1.5rem;
        }

        .info-item label {
          display: block;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--color-gray-500);
          margin-bottom: 0.25rem;
        }

        .info-item p { font-weight: 600; font-size: 1.1rem; }
        
        .role-badge {
          display: inline-block;
          background: var(--color-black);
          color: var(--color-gold);
          padding: 4px 12px;
          border-radius: 4px;
          text-transform: uppercase;
          font-size: 0.75rem !important;
        }

        .doc-upload-zone {
          text-align: center;
          padding: 2rem;
          border: 2px dashed var(--color-gray-200);
          border-radius: 8px;
        }

        .doc-upload-zone p { color: var(--color-gray-600); margin-bottom: 1.5rem; }

        .upload-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          background: var(--color-gold);
          color: white;
          padding: 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 700;
        }

        .doc-status.success {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          background: #f0fdf4;
          padding: 1.5rem;
          border-radius: 8px;
          color: #166534;
        }

        .doc-status.success h4 { color: #166534; text-transform: none; margin-bottom: 0.25rem; }
        .doc-status.success a { color: var(--color-gold); font-weight: 700; text-decoration: underline; }

        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default ProfilePage;
