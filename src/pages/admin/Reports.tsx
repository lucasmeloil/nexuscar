import React, { useState } from 'react';
import { FileDown, TrendingUp, Package, Car } from 'lucide-react';

const Reports: React.FC = () => {
  const [reportType, setReportType] = useState('sales');

  const exportCSV = () => {
    // Basic CSV export logic
    const data = [
      ['Data', 'Veículo', 'Vendedor', 'Preço'],
      ['2024-05-10', 'BMW M3', 'Ricardo', '450.000'],
      ['2024-05-12', 'Porsche 911', 'Ana', '1.200.000']
    ];
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + data.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_${reportType}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="reports-page">
      <div className="reports-sidebar">
        <button 
          className={reportType === 'sales' ? 'active' : ''} 
          onClick={() => setReportType('sales')}
        >
          <TrendingUp size={18} /> Vendas e Lucros
        </button>
        <button 
          className={reportType === 'stock' ? 'active' : ''} 
          onClick={() => setReportType('stock')}
        >
          <Package size={18} /> Estoque e Giro
        </button>
        <button 
          className={reportType === 'performance' ? 'active' : ''} 
          onClick={() => setReportType('performance')}
        >
          <Car size={18} /> Desempenho de Vendedores
        </button>
      </div>

      <div className="reports-main">
        <div className="report-header">
          <h2>{reportType === 'sales' ? 'Relatório de Vendas' : reportType === 'stock' ? 'Relatório de Estoque' : 'Desempenho da Equipe'}</h2>
          <button className="premium-button" onClick={exportCSV}>
            <FileDown size={20} /> Exportar Excel/CSV
          </button>
        </div>

        <div className="report-content glass-card">
          <table className="report-table">
            <thead>
              <tr>
                <th>Período</th>
                <th>Vendas</th>
                <th>Receita</th>
                <th>Custo Médio</th>
                <th>Margem</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Maio 2024</td>
                <td>12</td>
                <td>R$ 4.500.000</td>
                <td>R$ 3.800.000</td>
                <td style={{ color: '#28a745' }}>15.5%</td>
              </tr>
              <tr>
                <td>Abril 2024</td>
                <td>10</td>
                <td>R$ 3.200.000</td>
                <td>R$ 2.700.000</td>
                <td style={{ color: '#28a745' }}>15.6%</td>
              </tr>
              <tr>
                <td>Março 2024</td>
                <td>8</td>
                <td>R$ 2.800.000</td>
                <td>R$ 2.400.000</td>
                <td style={{ color: '#28a745' }}>14.2%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .reports-page {
          display: flex;
          gap: 2rem;
        }

        .reports-sidebar {
          width: 250px;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .reports-sidebar button {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-radius: 8px;
          color: var(--color-gray-600);
          font-weight: 600;
          text-align: left;
        }

        .reports-sidebar button:hover { background: var(--color-gray-200); }
        .reports-sidebar button.active { 
          background: var(--color-black); 
          color: var(--color-gold); 
        }

        .reports-main { flex: 1; }

        .report-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .report-content {
          background: white;
          padding: 2rem;
        }

        .report-table {
          width: 100%;
          border-collapse: collapse;
        }

        .report-table th {
          text-align: left;
          padding: 1rem;
          border-bottom: 2px solid var(--color-gray-100);
          color: var(--color-gray-500);
          font-size: 0.8rem;
          text-transform: uppercase;
        }

        .report-table td {
          padding: 1.25rem 1rem;
          border-bottom: 1px solid var(--color-gray-100);
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .reports-page { flex-direction: column; gap: 1rem; }
          .reports-sidebar { 
            width: 100%; 
            flex-direction: row; 
            overflow-x: auto; 
            padding-bottom: 0.5rem;
            scrollbar-width: none;
          }
          .reports-sidebar::-webkit-scrollbar { display: none; }
          .reports-sidebar button { white-space: nowrap; padding: 0.75rem 1rem; font-size: 0.8rem; }
          .report-header { flex-direction: column; gap: 1rem; align-items: flex-start; }
          .report-header h2 { font-size: 1.2rem; }
          .report-header button { width: 100%; justify-content: center; }
          .report-content { padding: 1rem; border-radius: 8px; overflow-x: auto; }
          .report-table { font-size: 0.8rem; }
          .report-table th, .report-table td { padding: 0.75rem 0.5rem; }
        }
      `}</style>
    </div>
  );
};

export default Reports;
