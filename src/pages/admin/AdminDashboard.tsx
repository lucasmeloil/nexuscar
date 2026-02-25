import React, { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Car, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { supabase } from '../../services/supabase';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    activeInventory: 0,
    totalEmployees: 0
  });

  const [salesData] = useState([
    { name: 'Jan', sales: 12 },
    { name: 'Fev', sales: 19 },
    { name: 'Mar', sales: 15 },
    { name: 'Abr', sales: 22 },
    { name: 'Mai', sales: 30 },
    { name: 'Jun', sales: 25 },
  ]);

  const [revenueData] = useState([
    { name: 'Semana 1', value: 400000 },
    { name: 'Semana 2', value: 300000 },
    { name: 'Semana 3', value: 600000 },
    { name: 'Semana 4', value: 800000 },
  ]);



  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    // In a real app, these would come from the DB
    const { count: vCount } = await supabase.from('vehicles').select('*', { count: 'exact', head: true }).eq('status', 'available');
    const { count: pCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).in('role', ['admin', 'seller']);
    
    setStats({
      totalSales: 45, // mock
      totalRevenue: 3450000, // mock
      activeInventory: vCount || 0,
      totalEmployees: pCount || 0
    });
  };

  const StatCard = ({ title, value, icon, color, trend }: any) => (
    <div className="stat-card">
      <div className="stat-header">
        <div className="stat-icon" style={{ backgroundColor: `${color}15`, color: color }}>
          {icon}
        </div>
        {trend && (
          <span className={`stat-trend ${trend > 0 ? 'up' : 'down'}`}>
            {trend > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="stat-body">
        <span className="stat-value">{value}</span>
        <h3 className="stat-title">{title}</h3>
      </div>
      <style>{`
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
        .stat-trend {
          display: flex;
          align-items: center;
          gap: 2px;
          font-size: 0.8rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 20px;
        }
        .stat-trend.up { background: #dcfce7; color: #166534; }
        .stat-trend.down { background: #fee2e2; color: #991b1b; }
        .stat-value {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--color-black);
        }
        .stat-title {
          font-size: 0.85rem;
          color: var(--color-gray-500);
          text-transform: none;
          margin: 0;
        }
      `}</style>
    </div>
  );

  return (
    <div className="dashboard-page">
      <div className="stats-grid">
        <StatCard 
          title="Vendas Mensais" 
          value={stats.totalSales} 
          icon={<TrendingUp size={24} />} 
          color="#B8860B" 
          trend={12.5}
        />
        <StatCard 
          title="Receita Total" 
          value={`R$ ${(stats.totalRevenue / 1000000).toFixed(1)}M`} 
          icon={<DollarSign size={24} />} 
          color="#166534" 
          trend={8.2}
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
          </div>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                  cursor={{ fill: 'rgba(184, 134, 11, 0.05)' }}
                />
                <Bar dataKey="sales" fill="var(--color-gold)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-container">
          <div className="chart-header">
            <h3>Receita Semanal</h3>
          </div>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="var(--color-gold)" 
                  strokeWidth={3} 
                  dot={{ r: 6, fill: 'var(--color-gold)' }} 
                />
              </LineChart>
            </ResponsiveContainer>
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
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1.5rem;
        }

        @media (max-width: 1024px) {
          .charts-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 768px) {
          .dashboard-page { gap: 1rem; }
          .chart-container { padding: 1rem; }
          .chart-header { margin-bottom: 1rem; }
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
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
