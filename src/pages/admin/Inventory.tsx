import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import type { Vehicle } from '../../types';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';

const Inventory: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price: 0,
    description: '',
    status: 'available',
    images: [] as string[],
    mileage: 0,
    fuel_type: 'Flex',
    transmission: 'Automático',
    color: '',
    engine: '',
    power: '',
    drivetrain: '',
    features: [] as string[],
    is_featured: false,
    is_promotion: false,
    discount_price: 0
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setVehicles(data);
    } catch (err: any) {
      console.error('Error fetching vehicles:', err);
      alert('Erro ao carregar veículos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) throw new Error('Sessão expirada. Por favor, faça login novamente.');

      const dataToSave = {
        ...formData,
        year: Number(formData.year) || new Date().getFullYear(),
        price: Number(formData.price) || 0,
        mileage: Number(formData.mileage) || 0,
        discount_price: Number(formData.discount_price) || 0,
        updated_at: new Date().toISOString()
      };

      let error;
      if (editingVehicle) {
        const { error: updateError } = await supabase
          .from('vehicles')
          .update(dataToSave)
          .eq('id', editingVehicle.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('vehicles')
          .insert([{ ...dataToSave, created_by: user.id }]);
        error = insertError;
      }

      if (error) throw error;

      alert('Veículo salvo com sucesso!');
      setShowModal(false);
      setEditingVehicle(null);
      fetchVehicles();
    } catch (err: any) {
      console.error('Erro ao salvar veículo:', err);
      alert(`Falha ao salvar: ${err.message || 'Erro desconhecido'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este veículo?')) {
      await supabase.from('vehicles').delete().eq('id', id);
      fetchVehicles();
    }
  };

  const openEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      price: vehicle.price,
      description: vehicle.description,
      status: vehicle.status,
      images: vehicle.images || [],
      mileage: vehicle.mileage || 0,
      fuel_type: vehicle.fuel_type || 'Flex',
      transmission: vehicle.transmission || 'Automático',
      color: vehicle.color || '',
      engine: vehicle.engine || '',
      power: vehicle.power || '',
      drivetrain: vehicle.drivetrain || '',
      features: vehicle.features || [],
      is_featured: vehicle.is_featured || false,
      is_promotion: vehicle.is_promotion || false,
      discount_price: vehicle.discount_price || 0
    });
    setShowModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data, error } = await supabase.storage
          .from('vehicles')
          .upload(filePath, file);

        if (error) throw error;

        if (data) {
          const { data: { publicUrl } } = supabase.storage
            .from('vehicles')
            .getPublicUrl(data.path);
          return publicUrl;
        }
        return null;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter((url): url is string => url !== null);
      
      setFormData(prev => ({ 
        ...prev, 
        images: [...prev.images, ...validUrls] 
      }));
    } catch (err: any) {
      console.error('Error uploading images:', err);
      alert('Erro ao enviar imagens: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const addImageUrl = () => {
    let url = prompt('Cole a URL da imagem:');
    if (url) {
      // Basic sanitization if user pastes HTML snippet from IBB or similar
      if (url.includes('<img') || url.includes('src=')) {
        const match = url.match(/src=["']([^"']+)["']/);
        if (match && match[1]) {
          url = match[1];
        }
      }
      setFormData({ ...formData, images: [...formData.images, url] });
    }
  };

  if (loading) return <div className="loading">Carregando estoque...</div>;

  return (
    <div className="inventory-page">
      <div className="inventory-controls">
        <div className="search-box">
          <Search size={20} />
          <input type="text" placeholder="Buscar no estoque..." />
        </div>
        <button 
          className="premium-button add-btn" 
          disabled={loading || saving}
          onClick={() => { setEditingVehicle(null); setShowModal(true); }}
        >
          {saving ? 'Salvando...' : (
            <>
              <Plus size={20} /> <span className="btn-text">Adicionar Veículo</span>
            </>
          )}
        </button>
      </div>

      <div className="inventory-table-container">
        {/* Desktop View Table */}
        <table className="inventory-table desktop-only-table">
          <thead>
            <tr>
              <th>Veículo</th>
              <th>Ano</th>
              <th>Preço</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map(v => (
              <tr key={v.id}>
                <td>
                  <div className="vehicle-cell">
                    <img src={v.images[0] || 'https://via.placeholder.com/50'} alt="" />
                    <div>
                      <strong>{v.make} {v.model}</strong>
                      <span>{v.mileage?.toLocaleString('pt-BR')} km</span>
                    </div>
                  </div>
                </td>
                <td>{v.year}</td>
                <td>R$ {v.price.toLocaleString('pt-BR')}</td>
                <td>
                  <span className={`status-pill ${v.status}`}>{v.status}</span>
                </td>
                <td>
                  <div className="action-btns">
                    <button onClick={() => openEdit(v)} title="Editar" className="edit-btn-action"><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(v.id)} title="Excluir" className="delete-btn-action"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile View Cards */}
        <div className="mobile-inventory-cards">
          {vehicles.map(v => (
            <div key={v.id} className="inventory-card glass-card">
              <div className="card-top">
                <img src={v.images[0] || 'https://via.placeholder.com/100'} alt="" />
                <div className="card-header-info">
                  <strong>{v.make} {v.model}</strong>
                  <span className="card-year">{v.year} • {v.mileage?.toLocaleString('pt-BR')} km</span>
                </div>
                <span className={`status-pill ${v.status}`}>{v.status}</span>
              </div>
              <div className="card-body">
                <div className="card-price">R$ {v.price.toLocaleString('pt-BR')}</div>
                <div className="card-actions">
                  <button onClick={() => openEdit(v)} className="mobile-action-btn edit">
                    <Edit2 size={16} /> Editar
                  </button>
                  <button onClick={() => handleDelete(v.id)} className="mobile-action-btn delete">
                    <Trash2 size={16} /> Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card">
            <div className="modal-header">
              <h3>{editingVehicle ? 'Editar Veículo' : 'Novo Veículo'}</h3>
              <button onClick={() => setShowModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSave} className="vehicle-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Marca</label>
                  <input type="text" value={formData.make} onChange={e => setFormData({...formData, make: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Modelo</label>
                  <input type="text" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Ano</label>
                  <input type="number" value={formData.year || ''} onChange={e => setFormData({...formData, year: parseInt(e.target.value) || 0})} required />
                </div>
                <div className="form-group">
                  <label>Preço</label>
                  <input type="number" value={formData.price || ''} onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})} required />
                </div>
                <div className="form-group">
                  <label>Quilometragem</label>
                  <input type="number" value={formData.mileage || ''} onChange={e => setFormData({...formData, mileage: parseInt(e.target.value) || 0})} />
                </div>
                <div className="form-group">
                  <label>Cor</label>
                  <input type="text" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} placeholder="Ex: Preto Perolizado" />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="available">Disponível</option>
                    <option value="reserved">Reservado</option>
                    <option value="sold">Vendido</option>
                  </select>
                </div>
              </div>

              <div className="form-section-header">
                <span className="section-dot"></span>
                <h4>Desempenho</h4>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Motorização</label>
                  <input type="text" value={formData.engine} onChange={e => setFormData({...formData, engine: e.target.value})} placeholder="Ex: 3.0 Turbo" />
                </div>
                <div className="form-group">
                  <label>Potência</label>
                  <input type="text" value={formData.power} onChange={e => setFormData({...formData, power: e.target.value})} placeholder="Ex: 450 CV" />
                </div>
                <div className="form-group">
                  <label>Câmbio</label>
                  <input type="text" value={formData.transmission} onChange={e => setFormData({...formData, transmission: e.target.value})} placeholder="Ex: Automático 8 marchas" />
                </div>
                <div className="form-group">
                  <label>Tração</label>
                  <input type="text" value={formData.drivetrain} onChange={e => setFormData({...formData, drivetrain: e.target.value})} placeholder="Ex: Integral" />
                </div>
              </div>

              <div className="form-section-header">
                <span className="section-dot"></span>
                <h4>Segurança e Tecnologia</h4>
              </div>
              <div className="form-group checkbox-list-group">
                <label>Recursos e Opcionais</label>
                <div className="features-grid">
                  {[
                    'Airbags Frontais e Laterais',
                    'Controle de Estabilidade',
                    'Central Multimídia 12"',
                    'Sensor de Ponto Cego',
                    'Teto Solar Panorâmico',
                    'Frenagem de Emergência',
                    'Chave Presencial',
                    'Faróis em LED/Matrix'
                  ].map(feature => (
                    <label key={feature} className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={formData.features.includes(feature)} 
                        onChange={(e) => {
                          const newFeatures = e.target.checked 
                            ? [...formData.features, feature]
                            : formData.features.filter(f => f !== feature);
                          setFormData({...formData, features: newFeatures});
                        }} 
                      />
                      {feature}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-section-header">
                <span className="section-dot"></span>
                <h4>Destaque e Promoção</h4>
              </div>
              <div className="form-grid">
                <div className="form-group checkbox-group">
                  <label>Opções de Exibição</label>
                  <div className="checkboxes">
                    <label className="checkbox-label">
                      <input type="checkbox" checked={formData.is_featured} onChange={e => setFormData({...formData, is_featured: e.target.checked})} />
                      Destaque na Home
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" checked={formData.is_promotion} onChange={e => setFormData({...formData, is_promotion: e.target.checked})} />
                      Em Promoção
                    </label>
                  </div>
                </div>
                {formData.is_promotion && (
                  <div className="form-group">
                    <label>Preço Promocional</label>
                    <input type="number" value={formData.discount_price || ''} onChange={e => setFormData({...formData, discount_price: parseFloat(e.target.value) || 0})} required={formData.is_promotion} />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Descrição</label>
                <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              <div className="form-group">
                <label>Imagens do Veículo</label>
                <div className="image-manager">
                  {formData.images.map((url, i) => (
                    <div key={i} className="image-preview-mini">
                      <img src={url} alt="" />
                      <button type="button" onClick={() => setFormData({...formData, images: formData.images.filter((_, idx) => idx !== i)})}><X size={12} /></button>
                    </div>
                  ))}
                  <label className={`add-image-btn upload-btn ${uploading ? 'uploading' : ''}`}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      disabled={uploading}
                      onChange={handleFileUpload} 
                      style={{ display: 'none' }} 
                    />
                    {uploading ? (
                      <div className="spinner-mini"></div>
                    ) : (
                      <>
                        <Plus size={20} />
                        <span>Upload</span>
                      </>
                    )}
                  </label>
                  <button type="button" className="add-image-btn url-btn" onClick={addImageUrl}>
                    <Search size={20} />
                    <span>URL</span>
                  </button>
                </div>
              </div>

              <div className="form-footer">
                <button type="button" className="cancel-btn" disabled={saving || uploading} onClick={() => { if(!saving && !uploading) setShowModal(false)}}>Cancelar</button>
                <button type="submit" className="premium-button" disabled={saving || uploading}>
                  {saving ? 'Processando...' : 'Salvar Veículo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .inventory-page {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: var(--shadow-sm);
        }

        .inventory-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: var(--color-gray-100);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          width: 300px;
        }

        .search-box input {
          background: transparent;
          border: none;
          outline: none;
          flex: 1;
        }

        .inventory-table-container {
          overflow-x: auto;
        }

        .inventory-table {
          width: 100%;
          border-collapse: collapse;
        }

        .inventory-table th {
          text-align: left;
          padding: 1rem;
          background: var(--color-gray-100);
          color: var(--color-gray-600);
          font-size: 0.8rem;
          text-transform: uppercase;
        }

        .inventory-table td {
          padding: 1rem;
          border-bottom: 1px solid var(--color-gray-100);
        }

        .vehicle-cell {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .vehicle-cell img {
          width: 50px;
          height: 50px;
          object-fit: cover;
          border-radius: 4px;
        }

        .vehicle-cell strong { display: block; }
        .vehicle-cell span { font-size: 0.8rem; color: var(--color-gray-500); }

        .status-pill {
          padding: 4px 8px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .status-pill.available { background: #dcfce7; color: #166534; }
        .status-pill.reserved { background: #fef9c3; color: #854d0e; }
        .status-pill.sold { background: #fee2e2; color: #991b1b; }

        .action-btns {
          display: flex;
          gap: 1rem;
        }
        .action-btns button { color: var(--color-gray-500); }
        .action-btns button:hover { color: var(--color-black); }
        .action-btns .delete:hover { color: #dc2626; }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 3000;
          padding: 2rem;
        }

        .modal-content {
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
          background: white;
          padding: 2rem;
          position: relative;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--color-gray-200);
        }

        .form-section-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin: 2.5rem 0 1.5rem;
          padding-left: 0.5rem;
        }

        .section-dot {
          width: 8px;
          height: 8px;
          background: var(--color-gold);
          border-radius: 50%;
        }

        .form-section-header h4 {
          font-size: 0.9rem;
          color: var(--color-black);
          margin: 0;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--color-gray-700);
        }

        .form-group input, .form-group select, .form-group textarea {
          padding: 0.75rem;
          border: 1px solid var(--color-gray-300);
          border-radius: 4px;
        }

        .checkbox-group .checkboxes {
          display: flex;
          gap: 1.5rem;
          margin-top: 0.5rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          font-weight: 500;
          text-transform: none !important;
          color: var(--color-black) !important;
          cursor: pointer;
        }

        .checkbox-label input {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .checkbox-list-group {
          background: var(--color-gray-100);
          padding: 1.5rem;
          border-radius: 8px;
          margin-top: 1rem;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-top: 1rem;
        }

        .image-manager {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          padding: 1rem;
          background: var(--color-gray-100);
          border-radius: 8px;
        }

        .image-preview-mini {
          position: relative;
          width: 80px;
          height: 80px;
        }

        .image-preview-mini img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 4px;
        }

        .image-preview-mini button {
          position: absolute;
          top: -5px;
          right: -5px;
          background: var(--color-black);
          color: white;
          border-radius: 50%;
          padding: 2px;
        }

        .add-image-btn {
          width: 80px;
          height: 80px;
          border: 2px dashed var(--color-gray-300);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--color-gray-400);
          cursor: pointer;
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          gap: 4px;
        }

        .add-image-btn:hover {
          border-color: var(--color-gold);
          color: var(--color-gold);
        }

        .upload-btn { background: rgba(184, 134, 11, 0.05); }

        .form-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid var(--color-gray-200);
        }

        .cancel-btn {
          padding: 0.75rem 1.5rem;
          color: var(--color-gray-600);
          font-weight: 600;
        }

        .mobile-inventory-cards { display: none; }
        
        @media (max-width: 768px) {
          .inventory-page { padding: 1rem; margin-bottom: 80px; }
          .inventory-controls { flex-direction: column; gap: 1rem; align-items: stretch; }
          .search-box { width: 100%; height: 50px; }
          .desktop-only-table { display: none; }
          .mobile-inventory-cards { display: flex; flex-direction: column; gap: 1rem; }
          
          .inventory-card {
            padding: 1rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
          
          .card-top {
            display: flex;
            align-items: center;
            gap: 1rem;
            position: relative;
          }
          
          .card-top img {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: 8px;
          }
          
          .card-header-info {
            flex: 1;
            display: flex;
            flex-direction: column;
          }
          
          .card-year {
            font-size: 0.8rem;
            color: var(--color-gray-500);
          }
          
          .card-top .status-pill {
            position: absolute;
            top: 0;
            right: 0;
            font-size: 0.6rem;
          }
          
          .card-body {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 0.5rem;
            border-top: 1px solid var(--color-gray-100);
          }
          
          .card-price {
            font-weight: 800;
            color: var(--color-gold);
            font-size: 1.1rem;
          }
          
          .card-actions {
            display: flex;
            gap: 0.5rem;
          }
          
          .mobile-action-btn {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 0.8rem;
            font-weight: 600;
          }
          
          .mobile-action-btn.edit { background: var(--color-gray-100); color: var(--color-black); }
          .mobile-action-btn.delete { background: #fee2e2; color: #dc2626; }

          .modal-overlay { padding: 0; }
          .modal-content { 
            max-height: 100vh; 
            border-radius: 0; 
            padding: 1.5rem;
          }
          .form-grid { grid-template-columns: 1fr; }
          
          .btn-text { display: inline; }
          .add-btn { height: 55px; font-size: 1rem; }
          .features-grid { grid-template-columns: 1fr; }
          .checkboxes { flex-direction: column; gap: 0.8rem; }
        }
        
        .edit-btn-action:hover { color: var(--color-gold) !important; }
        .delete-btn-action:hover { color: #dc2626 !important; }

        .upload-btn.uploading {
          opacity: 0.7;
          cursor: not-allowed;
          border-color: var(--color-gold);
        }

        .spinner-mini {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(184, 134, 11, 0.2);
          border-top-color: var(--color-gold);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        
        select {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          background-size: 1em;
          padding-right: 2.5rem !important;
        }
      `}</style>
    </div>
  );
};

export default Inventory;
