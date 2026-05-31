import React, { useState } from 'react';
import { CompanyData } from '../types';
import { COMPANYS_DATA } from '../data/mockFinancialData';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Activity, ShieldAlert, Sparkles, Loader2, TrendingUp, DollarSign, Award, Grid } from 'lucide-react';
import PlotlyChart from './PlotlyChart';

interface CompetitorTabProps {
  selectedTicker: string;
  onSetAgentActive: (agentName: string, state: 'active' | 'success' | 'warning' | 'info', message: string) => void;
}

export default function CompetitorTab({ selectedTicker, onSetAgentActive }: CompetitorTabProps) {
  const [activeChartEngine, setActiveChartEngine] = useState<'recharts' | 'plotly'>('plotly');
  const primaryCompany = COMPANYS_DATA.find(c => c.ticker === selectedTicker) || COMPANYS_DATA[0];
  const listPeers = COMPANYS_DATA.filter(c => c.ticker !== selectedTicker);

  const [selectedPeers, setSelectedPeers] = useState<string[]>([listPeers[0]?.ticker, listPeers[1]?.ticker].filter(Boolean));
  const [deepAnalysis, setDeepAnalysis] = useState<string>('');
  const [loadingAnalysis, setLoadingAnalysis] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>('');

  const togglePeerSelection = (ticker: string) => {
    if (selectedPeers.includes(ticker)) {
      setSelectedPeers(selectedPeers.filter(t => t !== ticker));
    } else {
      setSelectedPeers([...selectedPeers, ticker]);
    }
  };

  // Compile active data set
  const activeCompanies = [primaryCompany, ...COMPANYS_DATA.filter(c => selectedPeers.includes(c.ticker))];
  const activeChartData = activeCompanies.map(c => {
    const fin = c.financials[c.financials.length - 1]; // latest
    return {
      name: c.ticker,
      fullName: c.name,
      revenueB: (fin.revenue / 1000),
      grossMargin: fin.grossMargin,
      operatingMargin: fin.operatingMargin,
      rdSpendingB: (fin.rdSpending / 1000),
      marketShare: fin.marketShare
    };
  });

  const triggerStrategicBenchmarking = async () => {
    setLoadingAnalysis(true);
    setDeepAnalysis('');
    setErrorText('');

    onSetAgentActive('CompetitorAgent', 'active', `Supervisor prompted Competitor Agent: gathering strategic statistics and initiating comparative diagnostics.`);

    try {
      const res = await fetch('/api/competitor/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mainTicker: selectedTicker,
          industryTickers: selectedPeers
        })
      });

      if (!res.ok) {
        throw new Error('Peer Analysis API returned failure status');
      }

      const data = await res.json();
      setDeepAnalysis(data.analysis);
      
      onSetAgentActive('CompetitorAgent', 'success', `Competitor comparison reporting parsed successfully for peers: ${selectedPeers.join(', ')}`);
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || 'Connecting to Gemini API failed. Please ensure your API Key is set in Settings > Secrets.');
      onSetAgentActive('CompetitorAgent', 'warning', `Competitor Agent failed: ${err.message || 'General Error'}`);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Peer Configuration Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Configure Competitor Peer Basket for Benchmarking</label>
            <p className="text-xs text-slate-500">Core corporation: <strong className="text-slate-900 font-bold">{primaryCompany.name} ({primaryCompany.ticker})</strong>. Choose 1 or more competitors to compare side-by-side.</p>
          </div>
          
          {/* Engineering Toggle: Choose Recharts vs Plotly */}
          <div className="flex bg-[#f1f5f9] p-1 rounded-lg self-start sm:self-center">
            <button
              onClick={() => setActiveChartEngine('plotly')}
              className={`px-3 py-1.5 rounded-md text-xs font-sans font-semibold transition cursor-pointer ${
                activeChartEngine === 'plotly' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Plotly Pro
            </button>
            <button
              onClick={() => setActiveChartEngine('recharts')}
              className={`px-3 py-1.5 rounded-md text-xs font-sans font-semibold transition cursor-pointer ${
                activeChartEngine === 'recharts' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Recharts Standard
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {listPeers.map(peer => {
            const isSelected = selectedPeers.includes(peer.ticker);
            return (
              <button
                id={`btn-peer-${peer.ticker}`}
                key={peer.ticker}
                onClick={() => togglePeerSelection(peer.ticker)}
                className={`px-3 py-2 rounded-lg border text-xs font-sans font-semibold transition cursor-pointer outline-none ${
                  isSelected 
                    ? 'bg-slate-900 border-slate-950 text-white' 
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {peer.ticker} ― {peer.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Side-by-Side Financial Metric Comparison Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left font-sans border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="p-4 text-xs font-bold text-slate-500 uppercase font-mono">Financial Metric Comparison</th>
              {activeChartData.map(c => (
                <th key={c.name} className="p-4 text-xs font-bold text-slate-900 uppercase font-mono">
                  <div className="flex flex-col">
                    <span className="font-bold">{c.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal normal-case leading-tight">{c.fullName}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
            <tr>
              <td className="p-4 font-semibold text-slate-500 uppercase tracking-tight text-[10px] font-mono">Market Valuation Size</td>
              {activeCompanies.map(c => (
                <td key={c.ticker} className="p-4 font-bold text-slate-900">{c.marketCap}</td>
              ))}
            </tr>
            <tr>
              <td className="p-4 font-semibold text-slate-500 uppercase tracking-tight text-[10px] font-mono">Latest Annual Revenue</td>
              {activeChartData.map(c => (
                <td key={c.name} className="p-4 font-medium">${c.revenueB.toFixed(1)}B</td>
              ))}
            </tr>
            <tr>
              <td className="p-4 font-semibold text-slate-500 uppercase tracking-tight text-[10px] font-mono">Gross Margins</td>
              {activeChartData.map(c => (
                <td key={c.name} className="p-4 text-emerald-600 font-medium">{c.grossMargin}%</td>
              ))}
            </tr>
            <tr>
              <td className="p-4 font-semibold text-slate-500 uppercase tracking-tight text-[10px] font-mono">Operating Margins</td>
              {activeChartData.map(c => (
                <td key={c.name} className="p-4 text-indigo-600 font-medium">{c.operatingMargin}%</td>
              ))}
            </tr>
            <tr>
              <td className="p-4 font-semibold text-slate-500 uppercase tracking-tight text-[10px] font-mono">R&D Spend Size</td>
              {activeChartData.map(c => (
                <td key={c.name} className="p-4 font-medium">${c.rdSpendingB.toFixed(2)}B ({((c.rdSpendingB/c.revenueB)*100).toFixed(1)}%)</td>
              ))}
            </tr>
            <tr>
              <td className="p-4 font-semibold text-slate-500 uppercase tracking-tight text-[10px] font-mono">Segment Market Share Size</td>
              {activeChartData.map(c => (
                <td key={c.name} className="p-4 font-medium">{c.marketShare}%</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Competitor Cross Comparisons */}
      {activeChartEngine === 'plotly' ? (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Scale & Margin Diagnostics (Plotly Interactive)</span>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">Dual-axis modeling of Peer performance metrics side-by-side</p>
            </div>
            <span className="bg-[#f0fdf4] border border-emerald-100 text-emerald-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
              <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
              Plotly.js Active
            </span>
          </div>
          <div className="h-[350px]">
            <PlotlyChart
              data={[
                {
                  x: activeChartData.map(c => c.name),
                  y: activeChartData.map(c => c.revenueB),
                  name: 'Revenue ($B)',
                  type: 'bar',
                  marker: { color: '#6366f1' },
                  yaxis: 'y1'
                },
                {
                  x: activeChartData.map(c => c.name),
                  y: activeChartData.map(c => c.rdSpendingB),
                  name: 'R&D Spend ($B)',
                  type: 'bar',
                  marker: { color: '#f59e0b' },
                  yaxis: 'y1'
                },
                {
                  x: activeChartData.map(c => c.name),
                  y: activeChartData.map(c => c.operatingMargin),
                  name: 'Operating Margin (%)',
                  type: 'scatter',
                  mode: 'lines+markers',
                  line: { color: '#10b981', width: 3 },
                  marker: { size: 8 },
                  yaxis: 'y2'
                }
              ]}
              layout={{
                yaxis: {
                  title: 'Financial Scaling (USD Billions)',
                  titlefont: { color: '#6366f1' },
                  tickfont: { color: '#6366f1' },
                  showgrid: true,
                  gridcolor: '#e2e8f0'
                },
                yaxis2: {
                  title: 'Operating Margin (%)',
                  titlefont: { color: '#10b981' },
                  tickfont: { color: '#10b981' },
                  overlaying: 'y',
                  side: 'right',
                  range: [0, 100],
                  showgrid: false
                },
                barmode: 'group',
                margin: { l: 60, r: 60, t: 30, b: 50 },
                hovermode: 'closest',
                plot_bgcolor: 'rgba(0,0,0,0)',
                paper_bgcolor: 'rgba(0,0,0,0)'
              }}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Market Share & Operating Profit Margins (%)</span>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} fontSize={11} />
                  <YAxis stroke="#94a3b8" tickLine={false} fontSize={11} label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="operatingMargin" fill="#6366f1" radius={[4, 4, 0, 0]} name="Operating Margin" />
                  <Bar dataKey="marketShare" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Sectors Market Share" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Relative Annual R&D Budgets ($ Billions)</span>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} fontSize={11} />
                  <YAxis stroke="#94a3b8" tickLine={false} fontSize={11} label={{ value: 'USD Billions', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="rdSpendingB" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Annual R&D Spending ($B)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* AI Deep Peer Moat & Market Pricing Competitor Analyst */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-sans font-medium text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4.5 h-4.5 text-indigo-500" />
              <span>Moat & Core Competence Strategic Intelligence Analysis</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Let the Competitor Analyst agent audit pricing leverage, product barriers, and peer positioning strategies.</p>
          </div>
          <button
            id="btn-deep-comp-intel"
            disabled={loadingAnalysis || selectedPeers.length === 0}
            onClick={triggerStrategicBenchmarking}
            className="px-5 py-2.5 bg-slate-900 border border-slate-950 text-white rounded-lg text-xs font-sans font-medium hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            {loadingAnalysis ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />}
            <span>Generate Strategic Audit</span>
          </button>
        </div>

        {errorText && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-lg text-xs text-rose-700 flex items-start gap-2.5 my-4">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <h4 className="font-semibold mb-1">Competitor Strategy Analyst Interrupted</h4>
              <p className="leading-relaxed">{errorText}</p>
            </div>
          </div>
        )}

        {loadingAnalysis && (
          <div className="border-t border-slate-100 pt-6 flex flex-col items-center justify-center py-10 space-y-2">
            <Loader2 className="w-7 h-7 text-slate-450 animate-spin" />
            <span className="text-xs text-slate-400 font-medium animate-pulse">Wait while Supervisor gathers peer balance stats and triggers diagnostics...</span>
          </div>
        )}

        {deepAnalysis && (
          <div className="border-t border-slate-100 pt-5 space-y-4 font-sans">
            <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">AI Competitor Analyst Grounded Memorandum</h4>
            <div className="text-sm text-slate-800 leading-relaxed bg-slate-50/50 p-5 border border-slate-100 rounded-xl space-y-4 max-w-none pre-wrap whitespace-pre-line">
              {deepAnalysis}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
