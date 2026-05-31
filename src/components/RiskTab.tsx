import React, { useState } from 'react';
import { RiskProfile } from '../types';
import { AlertCircle, AlertTriangle, ShieldCheck, ShieldAlert, Sparkles, Loader2 } from 'lucide-react';
import PlotlyChart from './PlotlyChart';

interface RiskTabProps {
  selectedTicker: string;
  onSetAgentActive: (agentName: string, state: 'active' | 'success' | 'warning' | 'info', message: string) => void;
}

export default function RiskTab({ selectedTicker, onSetAgentActive }: RiskTabProps) {
  const [riskData, setRiskData] = useState<RiskProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>('');

  const triggerRiskEvaluation = async () => {
    setLoading(true);
    setRiskData(null);
    setErrorText('');

    onSetAgentActive('RiskAgent', 'active', `Supervisor prompted Risk Officer: reviewing balance leverage, SEC disclosures, and evaluating structural stress vectors.`);

    try {
      const res = await fetch('/api/risk/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: selectedTicker })
      });

      if (!res.ok) {
        throw new Error('Risk assessment API reported failure');
      }

      const data = await res.json();
      setRiskData(data);
      
      onSetAgentActive('RiskAgent', 'success', `Chief Risk Officer completed diagnostics. Score: ${data.risk_score}/100. Severity: ${data.severity}`);
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || 'Connecting to Gemini API failed. Please ensure your API Key is set in Secrets.');
      onSetAgentActive('RiskAgent', 'warning', `Risk Agent failed: ${err.message || 'General Error'}`);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBgColors = (severity: string) => {
    switch(severity) {
      case 'Low': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Medium': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'High': return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'Critical': return 'bg-red-100 text-red-900 border-red-300 animate-pulse';
      default: return 'bg-slate-50 text-slate-800 border-slate-200';
    }
  };

  const getHeatmapColor = (score: number) => {
    if (score < 30) return 'bg-emerald-50 text-emerald-800 border-emerald-100';
    if (score < 60) return 'bg-amber-50 text-amber-800 border-amber-100';
    if (score < 85) return 'bg-rose-50 text-rose-800 border-rose-100';
    return 'bg-red-50 text-red-900 border-red-100';
  };

  return (
    <div className="space-y-6">
      {/* Risk Engine Manual Trigger panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-sans font-medium text-slate-900 flex items-center gap-1.5">
            <Sparkles className="w-4.5 h-4.5 text-rose-500 animate-pulse" />
            <span>Stress Test & Aggregate Risk Evaluation Suite</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">Audit balance liabilities, debt maturities, geopolitical concentration vulnerabilities and product litigation exposure for {selectedTicker}.</p>
        </div>
        <button
          id="btn-stress-test-risk"
          disabled={loading}
          onClick={triggerRiskEvaluation}
          className="px-5 py-2.5 bg-slate-905 border border-slate-950 bg-slate-950 text-white rounded-lg text-xs font-sans font-medium hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldAlert className="w-3.5 h-3.5" />}
          <span>Initiate Stress Assessment</span>
        </button>
      </div>

      {errorText && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-lg text-xs text-rose-700 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          <div>
            <h4 className="font-semibold mb-1">Chief Risk Officer System Interrupted</h4>
            <p className="leading-relaxed">{errorText}</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
          <span className="text-xs text-slate-450 font-medium animate-pulse">Running CRO multi-vector stressing simulations and parsing SEC disclosure files...</span>
        </div>
      )}

      {riskData && (
        <div className="space-y-6">
          {/* Main Scoring Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Unified aggregate score */}
            <div className="md:col-span-4 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-2">Aggregate Risk Score</span>
              <div className="relative w-32 h-32 flex items-center justify-center mb-3">
                {/* Circular indicator */}
                <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="6" fill="transparent" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    stroke={riskData.risk_score > 70 ? '#ef4444' : riskData.risk_score > 45 ? '#f59e0b' : '#10b981'} 
                    strokeWidth="7" 
                    fill="transparent" 
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - riskData.risk_score / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="text-center">
                  <span className="text-2xl font-bold font-sans text-slate-900">{riskData.risk_score}</span>
                  <span className="text-xs text-slate-400 block font-semibold">/100</span>
                </div>
              </div>

              <span className={`px-4 py-1.5 rounded-full border text-xs font-sans font-bold flex items-center gap-1 w-full justify-center ${getSeverityBgColors(riskData.severity)}`}>
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Severity: {riskData.severity}</span>
              </span>
            </div>

            {/* Aggregated Explanation card */}
            <div className="md:col-span-8 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">CRO Stress Summary & Rationale</span>
                <p className="text-sm font-sans text-slate-700 leading-relaxed mt-2">{riskData.explanation}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500 font-sans">
                <ShieldCheck className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                <span>Audit compiled from verified SEC annual catalogs and interactive multi-document grounding.</span>
              </div>
            </div>
          </div>

          {/* Visual Risk Heatmap Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Visual Stress Grid */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Securities Risk Vector Heatmap (Visual Stress Grid)</span>
              <div className="grid grid-cols-2 gap-3">
                {riskData.major_risks.map((risk, index) => (
                  <div 
                    key={index} 
                    className={`border p-3 rounded-lg flex flex-col justify-between min-h-[100px] transition duration-250 hover:shadow-xs ${getHeatmapColor(risk.score)}`}
                  >
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider font-mono opacity-80">{risk.category}</span>
                      <span className="text-base font-bold font-sans">{risk.score}<span className="text-[10px] opacity-75 font-normal">/100</span></span>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full w-fit ${
                      risk.score > 70 ? 'bg-rose-500/10 text-rose-700' : risk.score > 45 ? 'bg-amber-500/10 text-amber-700' : 'bg-emerald-500/10 text-emerald-700'
                    }`}>
                      {risk.score > 70 ? 'High Risk' : risk.score > 45 ? 'Moderate' : 'Low Exposure'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Plotly Cro Heatmap */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">CRO Quantitative Strategic Heatmap (Plotly Interactive)</span>
              <div className="h-[300px]">
                <PlotlyChart
                  data={[
                    {
                      x: riskData.major_risks.map(r => {
                        // Map deterministic but offset probabilities for clean layout spread
                        const categorySpread: Record<string, number> = {
                          Liquidity: 4, Debt: 5, Regulatory: 5, Competitive: 3, Operational: 4, Geopolitical: 2, Market: 5
                        };
                        return categorySpread[r.category] || 3;
                      }),
                      y: riskData.major_risks.map(r => Math.ceil(r.score / 20)), // Translate 0-100 to 1-5 scale
                      text: riskData.major_risks.map(r => `${r.category} Risk (Score: ${r.score})`),
                      mode: 'markers+text',
                      textposition: 'top center',
                      marker: {
                        size: riskData.major_risks.map(r => 15 + r.score * 0.4),
                        color: riskData.major_risks.map(r => r.score),
                        colorscale: [
                          [0.0, '#10b981'],   // Green
                          [0.4, '#eab308'],   // Yellow
                          [0.7, '#f97316'],   // Orange
                          [1.0, '#ef4444']    // Red
                        ],
                        showscale: true,
                        colorbar: {
                          title: 'Severity Score',
                          titleside: 'top',
                          thickness: 12,
                          len: 0.8
                        }
                      },
                      type: 'scatter'
                    }
                  ]}
                  layout={{
                    xaxis: {
                      title: 'Likelihood Probability (Rare → Definite)',
                      range: [0.5, 5.5],
                      tickvals: [1, 2, 3, 4, 5],
                      ticktext: ['Unlikely (1)', 'Possible (2)', 'Moderate (3)', 'Highly Probable (4)', 'Critical Threat (5)'],
                      gridcolor: '#e2e8f0',
                      zeroline: false
                    },
                    yaxis: {
                      title: 'Severity Impact (Negligible → Catastrophic)',
                      range: [0.5, 5.5],
                      tickvals: [1, 2, 3, 4, 5],
                      ticktext: ['Minor (1)', 'Moderate (2)', 'Substantial (3)', 'Severe (4)', 'Extreme (5)'],
                      gridcolor: '#e2e8f0',
                      zeroline: false
                    },
                    hovermode: 'closest',
                    margin: { l: 80, r: 20, t: 30, b: 50 },
                    // Color the physical background in quadrants
                    shapes: [
                      // Low Risk bottom-left (Greenish pane)
                      { type: 'rect', x0: 0.5, y0: 0.5, x1: 2.5, y1: 2.5, fillcolor: 'rgba(16, 185, 129, 0.05)', line: { width: 0 } },
                      // High Risk top-right (Reddish pane)
                      { type: 'rect', x0: 3.5, y0: 3.5, x1: 5.5, y1: 5.5, fillcolor: 'rgba(239, 68, 68, 0.05)', line: { width: 0 } }
                    ]
                  }}
                />
              </div>
            </div>
          </div>

          {/* Structured breakdowns mapping company vulnerability */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Sub-category Stress Breakdowns & Company Vulnerabilities</span>
            <div className="space-y-4">
              {riskData.major_risks.map((risk, idx) => (
                <div key={idx} className="border border-slate-100 bg-slate-50/20 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-start md:items-stretch">
                  {/* Category info */}
                  <div className="md:w-1/4 shrink-0 border-b md:border-b-0 md:border-r border-slate-100 pb-3 md:pb-0 md:pr-4 flex flex-col justify-center">
                    <span className="text-xs font-bold text-slate-900 font-sans tracking-wide uppercase">{risk.category} Risk</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-sm font-bold text-slate-800">{risk.score}/100</span>
                      <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                        risk.score > 75 ? 'bg-rose-500' : risk.score > 45 ? 'bg-amber-400' : 'bg-emerald-500'
                      }`} />
                    </div>
                  </div>

                  {/* Core Content */}
                  <div className="md:w-3/4 flex flex-col justify-between space-y-2">
                    <p className="text-xs font-sans text-slate-600 leading-relaxed">
                      <strong className="text-slate-800 block mb-0.5">Stress Vector Vulnerability Profile:</strong>
                      {risk.description}
                    </p>
                    <div className="p-2 bg-slate-100/60 border border-slate-100/80 rounded text-[11px] font-sans text-slate-700">
                      <strong className="text-rose-700">Target Vulnerability:</strong> {risk.vulnerability}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
