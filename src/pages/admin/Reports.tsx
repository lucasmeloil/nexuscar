import React, { useState } from 'react';
import { FileDown, TrendingUp, Package, Users } from 'lucide-react';

const Reports: React.FC = () => {
  const [reportType, setReportType] = useState('sales');

  const exportCSV = () => {
    const headers = 
      reportType === 'sales' ? ['Data', 'Veículo', 'Vendedor', 'Preço', 'Comissão'] :
      reportType === 'stock' ? ['Veículo', 'Ano', 'Status', 'Preço', 'Dias em Estoque'] :
      ['Vendedor', 'Vendas', 'Receita', 'Comissão'];

    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_${reportType}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const EmptyState = ({ message }: { message: string }) => (
    <div className="report-empty-state">
      <div className="empty-icon">
        {reportType === 'sales' ? <TrendingUp size={48} strokeWidth={1} /> :
         reportType === 'stock' ? <Package size={48} strokeWidth={1} /> :
         <Users size={48} strokeWidth={1} />}
      </div>
      <h3>Nenhum dado disponível</h3>
      <p>{message}</p>
    </div>
  );

  return (
    <div className="reports-page">
      <div className="reports-sidebar">
        <button 
          className={reportType === 'sales' ? 'active' : ''} 
          onClick={() => setReportType('sales')}
        >
          <TrendingUp size={18} /> Vendas e Receita
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
          <Users size={18} /> Desempenho de Vendedores
        </button>
      </div>

      <div className="reports-main">
        <div className="report-header">
          <div>
            <h2>
              {reportType === 'sales' ? 'Relatório de Vendas e Receita' : 
               reportType === 'stock' ? 'Relatório de Estoque' : 
               'Desempenho da Equipe de Vendas'}
            </h2>
            <p className="report-subtitle">Os dados serão exibidos conforme as vendas forem registradas no sistema.</p>
          </div>
          <button className="premium-button" onClick={exportCSV}>
            <FileDown size={20} /> Exportar CSV
          </button>
        </div>

        <div className="report-content glass-card">
          {reportType === 'sales' && (
            <EmptyState message="Nenhuma venda foi registrada ainda. Assim que uma venda for concluída, as receitas, margens e comissões aparecerão aqui automaticamente." />
          )}

          {reportType === 'stock' && (
            <EmptyState message="Adicione veículos ao inventário para visualizar o relatório de estoque, giro de produtos e dias em carteira." />
          )}

          {reportType === 'performance' && (
            <EmptyState message="As métricas de desempenho, comissões e ranking de vendedores serão exibidas após as primeiras vendas serem registradas." />
          )}
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
          flex-shrink: 0;
        }

        .reports-sidebar button {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          border-radius: 8px;
          color: var(--color-gray-600);
          font-weight: 600;
          text-align: left;
          transition: all 0.2s;
        }

        .reports-sidebar button:hover { background: var(--color-gray-200); }
        .reports-sidebar button.active { 
          background: var(--color-black); 
          color: var(--color-gold); 
        }

        .reports-main { flex: 1; min-width: 0; }

        .report-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          gap: 1rem;
        }

        .report-header h2 {
          font-size: 1.3rem;
          margin: 0 0 0.25rem;
          color: var(--color-black);
        }

        .report-subtitle {
          font-size: 0.85rem;
          color: #888;
          margin: 0;
        }

        .report-content {
          background: white;
          padding: 3rem 2rem;
          border-radius: 12px;
          min-height: 350px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .report-empty-state {
          text-align: center;
          max-width: 380px;
          color: #aaa;
        }

        .report-empty-state .empty-icon {
          margin: 0 auto 1.5rem;
          width: 80px;
          height: 80px;
          background: #f9f9f9;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ddd;
        }

        .report-empty-state h3 {
          font-size: 1.1rem;
          color: #555;
          margin: 0 0 0.75rem;
          text-transform: none;
        }

        .report-empty-state p {
          font-size: 0.875rem;
          color: #aaa;
          line-height: 1.7;
          margin: 0;
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
          .report-header h2 { font-size: 1.1rem; }
          .report-header button { width: 100%; justify-content: center; }
          .report-content { padding: 2rem 1rem; border-radius: 8px; }
        }
      `}</style>
    </div>
  );
};

export default Reports;
