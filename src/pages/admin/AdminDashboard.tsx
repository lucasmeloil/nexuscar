import React, { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Car, 
  DollarSign
} from 'lucide-react';
import { supabase } from '../../services/supabase';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    activeInventory: 0,
    totalEmployees: 0
  });

  // Gráficos exibem aviso enquanto não há dados reais
  const emptyMonthlyData = [
    { name: 'Jan', vendas: 0 },
    { name: 'Fev', vendas: 0 },
    { name: 'Mar', vendas: 0 },
    { name: 'Abr', vendas: 0 },
    { name: 'Mai', vendas: 0 },
    { name: 'Jun', vendas: 0 },
  ];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [vehiclesRes, profilesRes, salesRes] = await Promise.all([
        supabase.from('vehicles').select('*', { count: 'exact', head: true }).eq('status', 'available'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).in('role', ['admin', 'seller']),
        supabase.from('sales').select('sale_price')
      ]);

      const soldVehicles = salesRes.data || [];
      const totalRevenue = soldVehicles.reduce((sum: number, s: any) => sum + (Number(s.sale_price) || 0), 0);

      setStats({
        totalSales: soldVehicles.length,
        totalRevenue,
        activeInventory: vehiclesRes.count || 0,
        totalEmployees: profilesRes.count || 0
      });
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle }: any) => (
    <div className="stat-card">
      <div className="stat-header">
        <div className="stat-icon" style={{ backgroundColor: `${color}15`, color: color }}>
          {icon}
        </div>
      </div>
      <div className="stat-body">
        <span className="stat-value">{value}</span>
        <h3 className="stat-title">{title}</h3>
        {subtitle && <span className="stat-subtitle">{subtitle}</span>}
      </div>
    </div>
  );

  return (
    <div className="dashboard-page">
      <div className="stats-grid">
        <StatCard 
          title="Vendas Realizadas" 
          value={stats.totalSales === 0 ? '—' : stats.totalSales} 
          icon={<TrendingUp size={24} />} 
          color="#B8860B" 
          subtitle={stats.totalSales === 0 ? 'Nenhuma venda registrada' : undefined}
        />
        <StatCard 
          title="Receita Total" 
          value={stats.totalRevenue === 0 ? '—' : `R$ ${(stats.totalRevenue / 1000000).toFixed(2)}M`} 
          icon={<DollarSign size={24} />} 
          color="#166534" 
          subtitle={stats.totalRevenue === 0 ? 'Aguardando primeiras vendas' : undefined}
        />
        <StatCard 
          title="Veículos em Estoque" 
          value={stats.activeInventory} 
          icon={<Car size={24} />} 
          color="#000000" 
        />
        <StatCard 
          title="Funcionários Ativos" 
          value={stats.totalEmployees} 
          icon={<Users size={24} />} 
          color="#6366f1" 
        />
      </div>

      <div className="charts-grid">
        <div className="chart-container main-chart">
          <div className="chart-header">
            <h3>Vendas por Mês</h3>
            {stats.totalSales === 0 && (
              <span className="chart-empty-badge">Sem dados ainda</span>
            )}
          </div>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={emptyMonthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                  cursor={{ fill: 'rgba(184, 134, 11, 0.05)' }}
                />
                <Bar dataKey="vendas" fill="var(--color-gold)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-container">
          <div className="chart-header">
            <h3>Desempenho de Vendedores</h3>
          </div>
          <div className="empty-state-chart">
            <Users size={40} strokeWidth={1.5} />
            <p>Comissões e rankings aparecerão<br />após as primeiras vendas.</p>
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-page {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
        }

        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stat-icon {
          width: 45px;
          height: 45px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--color-black);
          display: block;
        }

        .stat-title {
          font-size: 0.85rem;
          color: var(--color-gray-500);
          text-transform: none;
          margin: 0;
        }

        .stat-subtitle {
          font-size: 0.75rem;
          color: #aaa;
          font-style: italic;
          margin-top: 2px;
          display: block;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1.5rem;
        }

        .chart-container {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: var(--shadow-sm);
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .chart-header h3 {
          font-size: 1rem;
          color: var(--color-black);
          text-transform: none;
          margin: 0;
        }

        .chart-empty-badge {
          font-size: 0.75rem;
          background: #f3f4f6;
          color: #6b7280;
          padding: 2px 10px;
          border-radius: 20px;
        }

        .empty-state-chart {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 260px;
          color: #ccc;
          gap: 1rem;
          text-align: center;
        }

        .empty-state-chart p {
          font-size: 0.85rem;
          color: #aaa;
          line-height: 1.6;
        }

        @media (max-width: 1024px) {
          .charts-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 768px) {
          .dashboard-page { gap: 1rem; }
          .chart-container { padding: 1rem; }
          .chart-header { margin-bottom: 1rem; }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
