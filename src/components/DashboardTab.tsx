import React, { useState } from 'react';
import { CompanyData } from '../types';
import { COMPANYS_DATA } from '../data/mockFinancialData';
import { TrendingUp, Users, DollarSign, Award, ArrowUpRight, ArrowDownRight, Briefcase, BarChart2, Activity } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import PlotlyChart from './PlotlyChart';

interface DashboardTabProps {
  selectedTicker: string;
  onSelectTicker: (ticker: string) => void;
}

export default function DashboardTab({ selectedTicker, onSelectTicker }: DashboardTabProps) {
  const [activeChartEngine, setActiveChartEngine] = useState<'recharts' | 'plotly'>('plotly');
  const company = COMPANYS_DATA.find(c => c.ticker === selectedTicker) || COMPANYS_DATA[0];

  const currentYearData = company.financials[company.financials.length - 1];
  const prevYearData = company.financials[company.financials.length - 2];

  const revGrowth = ((currentYearData.revenue - prevYearData.revenue) / prevYearData.revenue) * 100;
  const netIncomeGrowth = ((currentYearData.netIncome - prevYearData.netIncome) / prevYearData.netIncome) * 100;

  // Custom tooltips
  const formatCurrency = (val: number) => `$${val.toLocaleString()}M`;
  const formatEPS = (val: number) => `$${val.toFixed(2)}`;
  const formatPercentage = (val: number) => `${val.toFixed(1)}%`;

  // Plotly Multi-axis Financial Trend Data Setup
  const years = company.financials.map(f => f.year);
  const revenues = company.financials.map(f => f.revenue);
  const netIncomes = company.financials.map(f => f.netIncome);
  const grossMargins = company.financials.map(f => f.grossMargin);
  const operatingMargins = company.financials.map(f => f.operatingMargin);

  const plotlyData = [
    {
      x: years,
      y: revenues,
      name: 'Revenue ($M)',
      type: 'bar',
      marker: { color: '#6366f1', opacity: 0.8 },
      yaxis: 'y1'
    },
    {
      x: years,
      y: netIncomes,
      name: 'Net Income ($M)',
      type: 'bar',
      marker: { color: '#10b981', opacity: 0.8 },
      yaxis: 'y1'
    },
    {
      x: years,
      y: grossMargins,
      name: 'Gross Margin (%)',
      type: 'scatter',
      mode: 'lines+markers',
      line: { color: '#f43f5e', width: 3 },
      marker: { size: 8 },
      yaxis: 'y2'
    },
    {
      x: years,
      y: operatingMargins,
      name: 'Operating Margin (%)',
      type: 'scatter',
      mode: 'lines+markers',
      line: { color: '#06b6d4', width: 3, dash: 'dot' },
      marker: { size: 8 },
      yaxis: 'y2'
    }
  ];

  const plotlyLayout = {
    title: { 
      text: `<b>Interactive Financial Trend Analysis</b> — ${company.name}`, 
      font: { size: 14, color: '#0f172a' } 
    },
    legend: { orientation: 'h', y: -0.15, x: 0.5, xanchor: 'center' },
    yaxis: {
      title: 'Financial Value ($ Millions)',
      titlefont: { color: '#4f46e5' },
      tickfont: { color: '#4f46e5' },
      showgrid: true,
      gridcolor: '#e2e8f0'
    },
    yaxis2: {
      title: 'Margins Percentage (%)',
      titlefont: { color: '#f43f5e' },
      tickfont: { color: '#f43f5e' },
      overlaying: 'y',
      side: 'right',
      range: [0, 100],
      showgrid: false
    },
    xaxis: {
      title: 'Fiscal Year',
      tickmode: 'linear',
      tick0: years[0],
      dtick: 1,
      gridcolor: 'transparent'
    },
    barmode: 'group',
    margin: { l: 60, r: 60, t: 50, b: 60 },
    hovermode: 'closest',
    plot_bgcolor: 'rgba(0,0,0,0)',
    paper_bgcolor: 'rgba(0,0,0,0)'
  };

  return (
    <div className="space-y-6">
      {/* Ticker Selector */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Select Active Corporation for Diagnostics</label>
            <p className="text-xs text-slate-500 font-sans">Switching corporate target updates all active filings, transcripts, competitor scopes, and risk models.</p>
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
          {COMPANYS_DATA.map((c) => (
            <button
              id={`btn-ticker-${c.ticker}`}
              key={c.ticker}
              onClick={() => onSelectTicker(c.ticker)}
              className={`px-4 py-2.5 rounded-lg border text-sm font-sans font-medium transition-all duration-200 outline-none flex items-center gap-1.5 cursor-pointer ${
                selectedTicker === c.ticker
                  ? 'bg-slate-900 border-slate-950 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <span className="font-bold">{c.ticker}</span>
              <span className="text-xs opacity-75">{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Corporate Overview Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Market Capitalization</span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{company.marketCap}</div>
          <span className="text-xs text-slate-500">{company.industry}</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Latest FY Revenue/Growth</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">${(currentYearData.revenue / 1000).toFixed(1)}B</div>
          <div className="flex items-center gap-1 mt-0.5">
            <ArrowUpRight className="w-3 h-3 text-emerald-500" />
            <span className="text-xs font-medium text-emerald-600">+{revGrowth.toFixed(1)}% YoY</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Operating Profit Margin</span>
            <Award className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{currentYearData.operatingMargin}%</div>
          <span className="text-xs text-slate-500">Gross Margin: {currentYearData.grossMargin}%</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Direct General headcount</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{company.employees.toLocaleString()}</div>
          <span className="text-xs text-slate-500">CEO: {company.ceo}</span>
        </div>
      </div>

      {/* Profile Descriptions */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2 font-sans font-medium text-slate-900">
          <Briefcase className="w-4 h-4 text-slate-500" />
          <span>About {company.name} ({company.ticker})</span>
        </div>
        <p className="text-sm font-sans text-slate-600 leading-relaxed">{company.description}</p>
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-100 text-xs">
          <div><strong className="text-slate-500">Sector:</strong> <span className="text-slate-800 font-medium">{company.sector}</span></div>
          <div><strong className="text-slate-500">Industry:</strong> <span className="text-slate-800 font-medium">{company.industry}</span></div>
          <div><strong className="text-slate-500">Competitive Peers:</strong> <span className="text-slate-800 font-medium">{company.competitors.join(', ')}</span></div>
        </div>
      </div>

      {/* Conditional Charts Section: Recharts vs Plotly */}
      {activeChartEngine === 'plotly' ? (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Interactive Financial Modeling Deck</span>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">Traces offer cross-hover zoom, isolations, and secondary percentages mapping</p>
            </div>
            <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
              <Activity className="w-3 h-3 text-indigo-500 animate-pulse" />
              Plotly.js Active Ready
            </span>
          </div>
          <div className="h-[400px]">
            <PlotlyChart data={plotlyData} layout={plotlyLayout} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Revenue and Net Income Trend */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Historical Revenue & Net Income (USD Millions)</span>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={company.financials} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `$${(v/1000)}B`} tickLine={false} />
                  <Tooltip 
                    formatter={(value: any, name: any) => [formatCurrency(Number(value)), name === 'revenue' ? 'Revenue' : 'Net Income']}
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="revenue" fill="#0f172a" radius={[4, 4, 0, 0]} name="revenue" />
                  <Bar dataKey="netIncome" fill="#3b82f6" radius={[4, 4, 0, 0]} name="netIncome" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Operating & Gross Margins Trajectory */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Margin Profiles Trajectory</span>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={company.financials} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${v}%`} tickLine={false} domain={[0, 95]} />
                  <Tooltip 
                    formatter={(value: any, name: any) => [formatPercentage(Number(value)), name === 'grossMargin' ? 'Gross Margin' : 'Operating Margin']}
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="grossMargin" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} name="grossMargin" />
                  <Line type="monotone" dataKey="operatingMargin" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} name="operatingMargin" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* R&D and Financial Leverage Overlays */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">R&D Investments & Market Share</span>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={company.financials} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis yAxisId="left" stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v/1000}B`} />
                <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar yAxisId="left" dataKey="rdSpending" fill="#f59e0b" name="R&D Spend ($M)" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="marketShare" fill="#06b6d4" name="Market Share (%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Long Term Debt Allocation Profile ($ Millions)</span>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={company.financials} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `$${v/1000}B`} tickLine={false} />
                <Tooltip 
                  formatter={(value: any) => [formatCurrency(Number(value)), 'Total Debt Outstanding']}
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="debt" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 5 }} name="Debt Outstanding" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
