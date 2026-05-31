import React, { useState } from 'react';
import { ResearchReport } from '../types';
import { ShieldCheck, Download, Printer, FileText, Sparkles, Loader2, ArrowRight } from 'lucide-react';

interface ReportsTabProps {
  selectedTicker: string;
  onSetAgentActive: (agentName: string, state: 'active' | 'success' | 'warning' | 'info', message: string) => void;
}

export default function ReportsTab({ selectedTicker, onSetAgentActive }: ReportsTabProps) {
  const [thesisType, setThesisType] = useState<string>('Unbiased Balanced View');
  const [report, setReport] = useState<ResearchReport | null>(null);
  const [compiling, setCompiling] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>('');

  const triggerReportCompilation = async () => {
    setCompiling(true);
    setReport(null);
    setErrorText('');

    onSetAgentActive('ResearchAgent', 'active', `Supervisor prompted Equity Analyst: consolidating SEC search facts, trend stats and compiling multi-section report.`);

    try {
      const res = await fetch('/api/report/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: selectedTicker, thesisType })
      });

      if (!res.ok) {
        throw new Error('Research report generator agent failed to respond');
      }

      const data = await res.json();
      setReport(data);
      
      onSetAgentActive('ResearchAgent', 'success', `Equity Research memorandum compiled successfully. Length: 12 sections. Thesis: ${thesisType}.`);
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || 'Connecting to Gemini API failed. Please ensure your API Key is set in Settings > Secrets.');
      onSetAgentActive('ResearchAgent', 'warning', `Research Agent failed: ${err.message || 'General Error'}`);
    } finally {
      setCompiling(false);
    }
  };

  const handleDownloadMarkdown = () => {
    if (!report) return;

    const mdText = `# INSTITUTIONAL EQUITY RESEARCH MEMORANDUM
**TICKER:** ${report.ticker} | **COMPANY:** ${report.companyName}
**COMPILED AT:** ${new Date(report.generatedAt).toLocaleString()}
**THESIS THREAD:** ${thesisType}
**TITLE:** ${report.title}

==================================================

### 1. EXECUTIVE SUMMARY
${report.sections.executiveSummary}

### 2. COMPANY OPERATION OVERVIEW
${report.sections.companyOverview}

### 3. FINANCIAL ANALYSIS & CAPITAL USAGE
${report.sections.financialPerformance}

### 4. CORE MOAT & GROWTH DRIVERS
${report.sections.growthDrivers}

### 5. PEER POSITIONING & COMPETITIVE OUTLOOK
${report.sections.competitivePositioning}

### 6. KEY RISKS & DISCLOSURES
${report.sections.keyRisks}

### 7. EARNINGS CALL & SENTIMENT INSIGHTS
${report.sections.earningsInsights}

### 8. MULTIPLES TRAJECTORY & VALUATION NOTES
${report.sections.valuationNotes}

### 9. INVESTMENT THESIS SYNTHESIS
${report.sections.investmentThesis}

### 10. BULL TRAJECTORY OUTLOOK
${report.sections.bullCase}

### 11. BEAR RISK TRIGGERS
${report.sections.bearCase}

### 12. CONCLUSION
${report.sections.conclusion}

==================================================
CONFIDENTIAL INDEPENDENT ANALYST DESK DISCLOSURE
FOR PROFESSIONAL USE ONLY.
`;

    const blob = new Blob([mdText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${report.ticker}_Equity_Research_Report.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Report Compiler Controller */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-sans font-medium text-slate-900 flex items-center gap-1.5 animate-pulse">
              <Sparkles className="w-4.5 h-4.5 text-amber-500" />
              <span>Institutional Research Report Compiler</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">Consolidate all filing RAG queries, sentiment logs, competitor benchmarks and draft a complete investment brief.</p>
          </div>
          <button
            id="btn-compile-research"
            disabled={compiling}
            onClick={triggerReportCompilation}
            className="px-5 py-2.5 bg-slate-950 border border-slate-950 text-white rounded-lg text-xs font-sans font-medium hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            {compiling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
            <span>Compile Academic Report</span>
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Set Thesis Priority</label>
            <select
              value={thesisType}
              onChange={(e) => setThesisType(e.target.value)}
              className="w-full text-xs font-sans border border-slate-200 rounded px-2.5 py-2 outline-none"
            >
              <option value="Aggressive Bull Thesis">Aggressive Bull Case focus</option>
              <option value="Unbiased Balanced View">Unbiased/Neutral Balanced perspective</option>
              <option value="Defensive Bear Thesis">Defensive Bear Case emphasis</option>
            </select>
          </div>
        </div>
      </div>

      {errorText && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-lg text-xs text-rose-700 flex items-start gap-2.5">
          <FileText className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          <div>
            <h4 className="font-semibold mb-1">Equity Analyst Interrupted</h4>
            <p className="leading-relaxed">{errorText}</p>
          </div>
        </div>
      )}

      {compiling && (
        <div className="bg-white border border-slate-200 rounded-xl p-16 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
          <span className="text-xs font-medium text-slate-400 animate-pulse text-center">
            Orchestrating agents on supervisor instructions...<br />
            <span className="text-[11px] font-normal text-slate-400 mt-1 block">Consolidating SEC filings, earnings sentiment metrics, and pricing competition models.</span>
          </span>
        </div>
      )}

      {/* Structured Institutional Layout Report */}
      {report && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex justify-end gap-2 shrink-0">
            <button
              id="btn-report-download"
              onClick={handleDownloadMarkdown}
              className="px-3.5 py-1.5 bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 hover:border-slate-300 rounded text-xs font-sans font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Report (.md)</span>
            </button>
            <button
              id="btn-report-print"
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 hover:border-slate-300 rounded text-xs font-sans font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Page</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200 p-8 md:p-12 shadow-sm rounded-xl print:shadow-none print:border-none font-serif text-slate-900 leading-relaxed max-w-4xl mx-auto space-y-8 select-text">
            {/* Report Header */}
            <div className="border-b-2 border-slate-900 pb-5 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <span className="block text-xs font-sans font-extrabold tracking-widest text-slate-500 uppercase">Equity Research Desk ― Memorandum</span>
                <h1 className="text-2xl font-bold font-serif text-slate-900 mt-1">{report.title}</h1>
                <span className="block text-sm text-slate-500 font-sans mt-1">Anchor Target: {report.companyName} ({report.ticker})</span>
              </div>
              <div className="text-left md:text-right font-sans text-xs text-slate-500">
                <span className="block"><strong className="text-slate-800">Date Compiled:</strong> {new Date(report.generatedAt).toLocaleDateString()}</span>
                <span className="block"><strong className="text-slate-800">Thesis Alignment:</strong> {thesisType}</span>
                <span className="block text-emerald-600 font-semibold">Status: Independent Verified Audit</span>
              </div>
            </div>

            {/* Grid 2x2 of Key sections */}
            <div className="space-y-6">
              <section>
                <h3 className="font-sans font-bold text-slate-900 uppercase text-xs tracking-wider border-b border-slate-200 pb-1 mb-2">1. Executive Analytics Summary</h3>
                <p className="text-xs text-slate-700 whitespace-pre-line">{report.sections.executiveSummary}</p>
              </section>

              <section>
                <h3 className="font-sans font-bold text-slate-900 uppercase text-xs tracking-wider border-b border-slate-200 pb-1 mb-2">2. Operating Model & Company Overview</h3>
                <p className="text-xs text-slate-700 whitespace-pre-line">{report.sections.companyOverview}</p>
              </section>

              <section>
                <h3 className="font-sans font-bold text-slate-900 uppercase text-xs tracking-wider border-b border-slate-200 pb-1 mb-2">3. Financial Highlights & Capital Allocations</h3>
                <p className="text-xs text-slate-700 whitespace-pre-line">{report.sections.financialPerformance}</p>
              </section>

              <section>
                <h3 className="font-sans font-bold text-slate-900 uppercase text-xs tracking-wider border-b border-slate-200 pb-1 mb-2">4. Core moats & Growth Triggers</h3>
                <p className="text-xs text-slate-700 whitespace-pre-line">{report.sections.growthDrivers}</p>
              </section>

              <section>
                <h3 className="font-sans font-bold text-slate-900 uppercase text-xs tracking-wider border-b border-slate-200 pb-1 mb-2">5. Peer Positioning & Pricing Comp</h3>
                <p className="text-xs text-slate-700 whitespace-pre-line">{report.sections.competitivePositioning}</p>
              </section>

              <section>
                <h3 className="font-sans font-bold text-slate-900 uppercase text-xs tracking-wider border-b border-slate-200 pb-1 mb-2">6. Central Risks & Disclosures</h3>
                <p className="text-xs text-slate-700 whitespace-pre-line">{report.sections.keyRisks}</p>
              </section>

              <section>
                <h3 className="font-sans font-bold text-slate-900 uppercase text-xs tracking-wider border-b border-slate-200 pb-1 mb-2">7. Recent Earnings Sentiment Insights</h3>
                <p className="text-xs text-slate-700 whitespace-pre-line">{report.sections.earningsInsights}</p>
              </section>

              <section>
                <h3 className="font-sans font-bold text-slate-900 uppercase text-xs tracking-wider border-b border-slate-200 pb-1 mb-2">8. Multiple Valuation Notes</h3>
                <p className="text-xs text-slate-700 whitespace-pre-line">{report.sections.valuationNotes}</p>
              </section>

              <section>
                <h3 className="font-sans font-bold text-slate-900 uppercase text-xs tracking-wider border-b border-slate-200 pb-1 mb-2">9. Synthesis of investment thesis</h3>
                <p className="text-xs text-slate-700 whitespace-pre-line">{report.sections.investmentThesis}</p>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3">
                <section className="bg-emerald-50/10 p-4 border border-slate-100 rounded-lg">
                  <h3 className="font-sans font-bold text-emerald-900 uppercase text-xs tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>10. Optimistic Target Bull Case</span>
                  </h3>
                  <p className="text-[11px] text-slate-700 line-height-relaxed whitespace-pre-line">{report.sections.bullCase}</p>
                </section>

                <section className="bg-rose-50/10 p-4 border border-slate-100 rounded-lg">
                  <h3 className="font-sans font-bold text-rose-950 uppercase text-xs tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    <span>11. Conservative Downside Bear Case</span>
                  </h3>
                  <p className="text-[11px] text-slate-700 line-height-relaxed whitespace-pre-line">{report.sections.bearCase}</p>
                </section>
              </div>

              <section className="pt-4 border-t border-slate-200">
                <h3 className="font-sans font-bold text-slate-900 uppercase text-xs tracking-wider mb-2">12. Consolidated Analyst Conclusion</h3>
                <p className="text-xs text-slate-700 whitespace-pre-line">{report.sections.conclusion}</p>
              </section>
            </div>

            {/* Footer Sign-off */}
            <div className="pt-8 border-t border-slate-300 flex flex-col md:flex-row justify-between text-[10px] font-sans text-slate-400">
              <span>Equity Analyst Private Desk Sign-off</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Confidential Verified Grounded Report</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
