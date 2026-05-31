import React, { useState } from 'react';
import { EarningsAnalysis } from '../types';
import { MOCK_TRANSCRIPTS } from '../data/mockFinancialData';
import { MessageSquare, AlertTriangle, ArrowRight, Smile, Play, Loader2, ThumbsUp, ThumbsDown, Megaphone, CheckSquare, Sparkles } from 'lucide-react';

interface EarningsTabProps {
  selectedTicker: string;
  onSetAgentActive: (agentName: string, state: 'active' | 'success' | 'warning' | 'info', message: string) => void;
}

export default function EarningsTab({ selectedTicker, onSetAgentActive }: EarningsTabProps) {
  const [analysisResult, setAnalysisResult] = useState<EarningsAnalysis | null>(null);
  const [customTranscript, setCustomTranscript] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [useCustom, setUseCustom] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>('');

  const hasPreset = !!MOCK_TRANSCRIPTS[`${selectedTicker}_2025`];

  const triggerEarningsAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setErrorText('');
    
    onSetAgentActive('EarningsAgent', 'active', `Supervisor triggered Earnings Analyst: compiling corporate disclosures and calculating call transcripts.`);

    try {
      const bodyPayload = {
        ticker: selectedTicker,
        period: 'Q4 2025/2026 Call',
        customTranscript: useCustom ? customTranscript : undefined
      };

      const res = await fetch('/api/earnings/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });

      if (!res.ok) {
        throw new Error('Earnings API agent failed to respond');
      }

      const result = await res.json();
      setAnalysisResult(result);
      
      onSetAgentActive('EarningsAgent', 'success', `Earnings call sentiment analysis parsed completely. Score: ${result.sentimentScore || 0}% (${result.managementSentiment})`);
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || 'Connecting to Gemini API failed. Please ensure your API Key is set in Settings > Secrets.');
      onSetAgentActive('EarningsAgent', 'warning', `Earnings Agent failed: ${err.message || 'General Error'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const sentimentColors = {
    'Bullish': 'text-emerald-600 bg-emerald-50 border-emerald-100',
    'Slightly Bullish': 'text-teal-600 bg-teal-50 border-teal-100',
    'Neutral': 'text-slate-600 bg-slate-50 border-slate-100',
    'Bearish': 'text-rose-600 bg-rose-50 border-rose-100'
  };

  return (
    <div className="space-y-6">
      {/* Transcript Input Selection */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Earnings Transcription Diagnostics</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setUseCustom(false); setCustomTranscript(''); }}
              className={`px-3 py-1 text-xs font-sans font-medium rounded-md ${!useCustom ? 'bg-slate-900 text-white' : 'bg-slate-50 border border-slate-100 text-slate-600 hover:bg-slate-100'}`}
            >
              Use Registry Preset
            </button>
            <button
              id="btn-use-custom-transcript"
              onClick={() => setUseCustom(true)}
              className={`px-3 py-1 text-xs font-sans font-medium rounded-md ${useCustom ? 'bg-slate-900 text-white' : 'bg-slate-50 border border-slate-100 text-slate-600 hover:bg-slate-100'}`}
            >
              Paste Custom Transcript
            </button>
          </div>
        </div>

        {useCustom ? (
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-500 uppercase">Paste Corporate Transcript</label>
            <textarea
              id="raw-transcript-textarea"
              value={customTranscript}
              onChange={(e) => setCustomTranscript(e.target.value)}
              placeholder="Paste raw earnings call transcript strings including executive names, and questions to parse..."
              rows={5}
              className="w-full text-xs font-sans border border-slate-200 rounded p-2.5 outline-none font-mono placeholder-slate-400"
            />
          </div>
        ) : (
          <div className="py-2 flex items-center justify-between">
            <div>
              <p className="text-sm font-sans font-medium text-slate-800">
                {hasPreset 
                  ? `FY 2025 Earnings Transcript available for ${selectedTicker}.`
                  : `No pre-loaded transcript available for ${selectedTicker}. Preset fallback will be generated.`}
              </p>
              <p className="text-xs text-slate-500">Includes CEO overview, CFO financials, and Q&A and analysts questions.</p>
            </div>
          </div>
        )}

        <button
          id="btn-trigger-earnings"
          disabled={isAnalyzing || (useCustom && !customTranscript.trim())}
          onClick={triggerEarningsAnalysis}
          className="mt-4 px-5 py-2 bg-slate-950 border border-slate-950 text-white font-sans font-medium text-xs rounded hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
        >
          {isAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
          <span>Run Transcript Diagnostics</span>
        </button>
      </div>

      {/* Analysis Output Results */}
      {isAnalyzing && (
        <div className="bg-white border border-slate-200 rounded-xl p-10 flex flex-col items-center justify-center space-y-3 shadow-sm">
          <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
          <span className="text-xs font-medium text-slate-400 animate-pulse">Running semantic parsing and sentiment scoring layers...</span>
        </div>
      )}

      {errorText && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-lg text-xs text-rose-700 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          <div>
            <h4 className="font-semibold mb-1">Earnings Analyst System Interrupted</h4>
            <p className="leading-relaxed">{errorText}</p>
          </div>
        </div>
      )}

      {analysisResult && (
        <div className="space-y-6">
          {/* Executive Summary & Sentiment Header */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Completed Earnings Talk Analysis</span>
                <h2 className="text-lg font-sans font-medium text-slate-900">Executive Sentiment Verdict: {analysisResult.ticker} ({analysisResult.period})</h2>
              </div>
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1.5 rounded-lg border text-xs font-sans font-bold flex items-center gap-1.5 ${sentimentColors[analysisResult.managementSentiment] || sentimentColors.Neutral}`}>
                  <Smile className="w-4 h-4" />
                  <span>{analysisResult.managementSentiment}</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1 text-center">
                  <span className="block text-[8px] font-bold text-slate-500 uppercase">Sentiment Score</span>
                  <span className="text-sm font-bold text-slate-900">{analysisResult.sentimentScore}/100</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider mb-2">Executive Summary</h3>
              <p className="text-sm font-sans text-slate-700 leading-relaxed">{analysisResult.executiveSummary}</p>
            </div>
            
            {analysisResult.guidanceChanges && (
              <div className="mt-4 bg-amber-50/50 border border-amber-50 rounded-lg p-3.5">
                <h4 className="text-[11px] font-bold text-amber-800 uppercase flex items-center gap-1.5 mb-1">
                  <Megaphone className="w-3.5 h-3.5 text-amber-600" />
                  <span>Guidance Changes & Management Outlook Shifts</span>
                </h4>
                <p className="text-xs font-sans text-amber-900 leading-relaxed">{analysisResult.guidanceChanges}</p>
              </div>
            )}
          </div>

          {/* Positives vs Negatives Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-bold font-mono text-emerald-600 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                <ThumbsUp className="w-4 h-4 text-emerald-500" />
                <span>Positive Corporate Signals</span>
              </h3>
              <ul className="space-y-2">
                {analysisResult.positiveSignals.map((sig, idx) => (
                  <li key={idx} className="text-xs font-sans text-slate-700 leading-relaxed flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0 mt-1.5"></span>
                    <span>{sig}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-bold font-mono text-rose-600 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                <ThumbsDown className="w-4 h-4 text-rose-500" />
                <span>Risk & Negative Signals</span>
              </h3>
              <ul className="space-y-2">
                {analysisResult.negativeSignals.map((sig, idx) => (
                  <li key={idx} className="text-xs font-sans text-slate-700 leading-relaxed flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0 mt-1.5"></span>
                    <span>{sig}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Direct Key Quotes Block */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Exact Grounded Quotes</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysisResult.keyQuotes.slice(0, 4).map((q, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-col justify-between">
                  <p className="text-xs font-sans text-slate-600 italic leading-relaxed mb-3">"{q.text}"</p>
                  <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider font-mono">― {q.speaker}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Concerns & Actions List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-sans">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-bold font-mono text-slate-500 uppercase mb-3 tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" />
                <span>Analyst Queries & Internal Worries</span>
              </h3>
              <ul className="space-y-2">
                {analysisResult.analystConcerns.map((con, idx) => (
                  <li key={idx} className="text-xs text-slate-600 leading-relaxed flex items-start gap-2">
                    <span className="text-amber-500 shrink-0 mt-0.5">?</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-bold font-mono text-slate-500 uppercase mb-3 tracking-wider flex items-center gap-1">
                <CheckSquare className="w-4 h-4 text-emerald-500" />
                <span>Recommended Operational Action Items</span>
              </h3>
              <ul className="space-y-2">
                {analysisResult.actionItems.map((act, idx) => (
                  <li key={idx} className="text-xs text-slate-600 leading-relaxed flex items-start gap-2.5">
                    <span className="text-emerald-500 shrink-0">✓</span>
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Topic Clustering */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Management Speech Topic Clustering</span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {analysisResult.topicClusters.map((cluster, idx) => {
                const magnitudeColors = {
                  'High': 'bg-emerald-50 text-emerald-700 border-emerald-100',
                  'Medium': 'bg-blue-50 text-blue-700 border-blue-100',
                  'Low': 'bg-slate-50 text-slate-700 border-slate-100'
                };
                return (
                  <div key={idx} className="bg-white border border-slate-100 p-3.5 rounded-lg flex flex-col justify-between">
                    <div>
                      <span className="block text-xs font-bold text-slate-800 mb-1">{cluster.topic}</span>
                      <span className="text-[10px] text-slate-400">Occurrence: {cluster.occurrence} periods</span>
                    </div>
                    <span className={`inline-block mt-2 px-2 py-0.5 text-[9px] font-bold border rounded uppercase w-fit ${magnitudeColors[cluster.magnitude] || magnitudeColors.Low}`}>
                      {cluster.magnitude} Impact
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
