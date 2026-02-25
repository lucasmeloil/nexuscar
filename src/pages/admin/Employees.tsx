import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import type { Profile } from '../../types';
import { Search, UserPlus, Shield, Mail } from 'lucide-react';

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['admin', 'seller'])
      .order('full_name');
    
    if (data) setEmployees(data);
    setLoading(false);
  };

  const updateRole = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);
    
    if (!error) fetchEmployees();
  };

  if (loading) return <div className="loading">Carregando membros...</div>;

  return (
    <div className="employees-page">
      <div className="section-header">
        <div className="search-box">
          <Search size={20} />
          <input type="text" placeholder="Buscar funcionários..." />
        </div>
        <button className="premium-button">
          <UserPlus size={20} /> Adicionar Membro
        </button>
      </div>

      <div className="employees-list">
        {employees.map(emp => (
          <div key={emp.id} className="employee-card">
            <div className="emp-info">
              <div className="emp-avatar">
                {emp.full_name.charAt(0)}
              </div>
              <div className="emp-details">
                <span className="emp-name">{emp.full_name}</span>
                <span className="emp-email"><Mail size={12} /> {emp.email}</span>
              </div>
            </div>

            <div className="emp-role-select">
              <Shield size={16} />
              <select value={emp.role} onChange={(e) => updateRole(emp.id, e.target.value)}>
                <option value="seller">Vendedor</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .employees-page {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: white;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          box-shadow: var(--shadow-sm);
          width: 400px;
        }

        .search-box input { border: none; outline: none; flex: 1; }

        .employees-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .employee-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: var(--shadow-sm);
        }

        .emp-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .emp-avatar {
          width: 48px;
          height: 48px;
          background: var(--color-gray-100);
          color: var(--color-gold);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.2rem;
        }

        .emp-details {
          display: flex;
          flex-direction: column;
        }

        .emp-name { font-weight: 700; }
        .emp-email { 
          font-size: 0.8rem; 
          color: var(--color-gray-500); 
          display: flex; 
          align-items: center; 
          gap: 4px;
        }

        .emp-role-select {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--color-gray-100);
          padding: 0.5rem;
          border-radius: 4px;
        }

        .emp-role-select select {
          border: none;
          background: transparent;
          font-weight: 600;
          outline: none;
        }

        @media (max-width: 768px) {
          .section-header { flex-direction: column; gap: 1rem; align-items: stretch; }
          .search-box { width: 100%; }
          .employees-list { grid-template-columns: 1fr; }
          .employee-card { flex-direction: column; gap: 1rem; align-items: flex-start; }
          .emp-role-select { width: 100%; justify-content: space-between; }
        }
      `}</style>
    </div>
  );
};

export default Employees;
