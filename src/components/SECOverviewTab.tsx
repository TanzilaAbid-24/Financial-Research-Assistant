import React, { useState } from 'react';
import { SECOption, SECChunk, Citation } from '../types';
import { MOCK_FILINGS_OPTIONS, COMPANYS_DATA } from '../data/mockFinancialData';
import { Search, FileUp, Database, ArrowRight, HelpCircle, Loader2, Quote, AlertCircle } from 'lucide-react';

interface SECOverviewTabProps {
  selectedTicker: string;
  onSetAgentActive: (agentName: string, state: 'active' | 'success' | 'warning' | 'info', message: string) => void;
}

export default function SECOverviewTab({ selectedTicker, onSetAgentActive }: SECOverviewTabProps) {
  const filings = MOCK_FILINGS_OPTIONS[selectedTicker] || [];
  const company = COMPANYS_DATA.find(c => c.ticker === selectedTicker) || COMPANYS_DATA[0];

  const [activeFiling, setActiveFiling] = useState<string>(filings[0]?.accessionNumber || '');
  const [activeSection, setActiveSection] = useState<string>('Item 1A. Risk Factors');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [ragAnswer, setRagAnswer] = useState<string>('');
  const [citations, setCitations] = useState<Citation[]>([]);
  const [errorText, setErrorText] = useState<string>('');

  // Upload/Paste state
  const [uploadText, setUploadText] = useState<string>('');
  const [uploadSectionName, setUploadSectionName] = useState<string>('');
  const [uploadFilingType, setUploadFilingType] = useState<string>('10-K');
  const [uploadYear, setUploadYear] = useState<string>('2025');
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [uploadMessage, setUploadMessage] = useState<string>('');

  const currentFilingObject = filings.find(f => f.accessionNumber === activeFiling) || filings[0];

  const suggestedQuestions = [
    `What are the biggest risks facing ${selectedTicker}?`,
    `What does the latest filing say about ${selectedTicker}'s Services or Cloud mix?`,
    `Detail the core R&D spending priorities and investments.`,
    `What regulatory issues are mentioned for ${selectedTicker}?`
  ];

  const handleSearchSug = (txt: string) => {
    setSearchQuery(txt);
    calculateRAGQuery(txt);
  };

  const calculateRAGQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsSearching(true);
    setRagAnswer('');
    setCitations([]);
    setErrorText('');

    onSetAgentActive('FilingAgent', 'active', `Supervisor targeted Filing Agent: executing keyword RAG chunk index retrieval for query "${queryText}"`);

    try {
      const res = await fetch('/api/sec/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: selectedTicker,
          query: queryText,
          filingType: currentFilingObject?.filingType
        })
      });

      if (!res.ok) {
        const bodyErr = await res.json();
        throw new Error(bodyErr.error || 'Server error during RAG matching');
      }

      const data = await res.json();
      setRagAnswer(data.answer);
      setCitations(data.citations || []);
      
      onSetAgentActive('FilingAgent', 'success', `Filing Agent completed answer generation with ${data.citations?.length || 0} grounding sources.`);
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || 'Connecting to Gemini API failed. Please ensure your API Key is set in Settings > Secrets.');
      onSetAgentActive('FilingAgent', 'warning', `Filing Agent failed: ${err.message || 'General Error'}`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCustomUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadText.trim()) return;

    setUploadLoading(true);
    setUploadMessage('');
    onSetAgentActive('Supervisor', 'active', 'Supervisor starting dynamic document ingestion pipeline...');

    try {
      const res = await fetch('/api/sec/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: selectedTicker,
          filingType: uploadFilingType,
          year: uploadYear,
          section: uploadSectionName || 'Custom Segment',
          content: uploadText
        })
      });

      if (!res.ok) {
        throw new Error('Ingestion pipeline parsed unsuccessfully');
      }

      const data = await res.json();
      setUploadMessage(data.message);
      setUploadText('');
      setUploadSectionName('');
      
      onSetAgentActive('Supervisor', 'success', `Dynamic ingest completed: indexed ${data.chunksAdded} text segments into search pool.`);
    } catch (err: any) {
      setUploadMessage(`Error: ${err.message}`);
      onSetAgentActive('Supervisor', 'warning', `Ingestion failure: ${err.message}`);
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Q&A Panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">SEC In-Memory Vector Search Console (RAG)</span>
        <h2 className="text-lg font-sans font-medium text-slate-900 mb-4">Query SEC Filings for {company.name} ({selectedTicker})</h2>
        
        <div className="flex gap-2">
          <input
            id="sec-qa-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && calculateRAGQuery(searchQuery)}
            placeholder={`Ask about capital structure, core risk parameters, Private Cloud, or segment mix...`}
            className="flex-grow border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-sans placeholder-slate-400 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
          />
          <button
            id="sec-qa-search-btn"
            disabled={isSearching}
            onClick={() => calculateRAGQuery(searchQuery)}
            className="px-5 py-2.5 bg-slate-900 border border-slate-950 text-white rounded-lg text-sm font-sans font-medium hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Analyze</span>
          </button>
        </div>

        {/* Suggestion Bubbles */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {suggestedQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSearchSug(q)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:border-slate-200 text-[11px] font-sans text-slate-600 rounded-md transition-all cursor-pointer outline-none"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Search Results Display */}
        {(ragAnswer || isSearching || errorText) && (
          <div className="mt-6 border-t border-slate-100 pt-5 space-y-4">
            <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">Semantic Synthesis Result</h3>
            
            {isSearching ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-2">
                <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                <span className="text-xs font-medium text-slate-500 animate-pulse">Wait while Supervisor consolidates Filing Analyst...</span>
              </div>
            ) : errorText ? (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-lg text-xs text-rose-700 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Gemini API Connection Required</h4>
                  <p className="leading-relaxed">{errorText}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Answer box */}
                <div className="font-sans text-sm text-slate-800 leading-relaxed bg-slate-50/50 p-4 border border-slate-100 rounded-xl max-w-none whitespace-pre-line">
                  {ragAnswer}
                </div>

                {/* Citations Box */}
                {citations.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Database className="w-3.5 h-3.5 text-slate-400" />
                      <span>Retrieved Document Grounding Sources ({citations.length})</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {citations.map((cit, idx) => (
                        <div key={idx} className="border border-slate-100 bg-white p-3 rounded-lg flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 pb-1 border-b border-slate-50">
                              <span>Source #{idx + 1}</span>
                              <span className="text-slate-900">{cit.ticker} {cit.filingType} ({cit.year})</span>
                            </div>
                            <div className="text-[10px] font-bold text-slate-700 mb-1">{cit.section}</div>
                            <p className="text-[11px] font-sans text-slate-500 italic line-clamp-2">"{cit.snippet}"</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* Available Filings Browser */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">SEC Registry catalog</span>
          <div className="space-y-4">
            {filings.map((filing) => (
              <div
                key={filing.accessionNumber}
                onClick={() => setActiveFiling(filing.accessionNumber)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  activeFiling === filing.accessionNumber
                    ? 'border-slate-900 bg-slate-50 shadow-sm'
                    : 'border-slate-100 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-900 text-white font-mono font-bold flex items-center justify-center text-xs">
                    {filing.filingType}
                  </div>
                  <div>
                    <h3 className="text-sm font-sans font-semibold text-slate-800">{filing.filingType} SEC Annual Filing</h3>
                    <p className="text-xs text-slate-500 font-mono">Acc: {filing.accessionNumber}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-0.5 rounded bg-slate-100 text-[10px] font-semibold font-mono text-slate-700">{filing.year} FY</span>
                  <span className="block text-[10px] text-slate-400 mt-1">Filed: {filing.filingDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live File Upload/Paster Ingest Pipeline */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Document Ingestion Pipeline</span>
            <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase rounded font-mono">RAG Ingestor</span>
          </div>

          <form onSubmit={handleCustomUpload} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Filing Type</label>
                <select
                  value={uploadFilingType}
                  onChange={(e) => setUploadFilingType(e.target.value)}
                  className="w-full text-xs font-sans border border-slate-200 rounded px-2.5 py-2 outline-none"
                >
                  <option value="10-K">Form 10-K (Annual)</option>
                  <option value="10-Q">Form 10-Q (Quarterly)</option>
                  <option value="8-K">Form 8-K (Ad-hoc Event)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Fiscal Year</label>
                <input
                  type="number"
                  value={uploadYear}
                  onChange={(e) => setUploadYear(e.target.value)}
                  placeholder="2025"
                  className="w-full text-xs font-sans border border-slate-200 rounded px-2.5 py-2 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Section Header / Item Name</label>
              <input
                type="text"
                value={uploadSectionName}
                onChange={(e) => setUploadSectionName(e.target.value)}
                placeholder="e.g. Item 1A. Corporate Vulnerability and Moat Profiles"
                className="w-full text-xs font-sans border border-slate-200 rounded px-2.5 py-2 outline-none placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Filing Raw Full Text or Segment Text</label>
              <textarea
                value={uploadText}
                onChange={(e) => setUploadText(e.target.value)}
                placeholder="Paste the raw text of the filing report, competitor analysis data, or earnings transcript and the pipeline will automatically segment, index, and load it into your RAG search workspace..."
                rows={4}
                className="w-full text-xs font-sans border border-slate-200 rounded p-2.5 outline-none placeholder-slate-400 font-mono"
              />
            </div>

            <button
              id="btn-upload-file"
              type="submit"
              disabled={uploadLoading || !uploadText.trim()}
              className="w-full py-2 bg-slate-900 text-white text-xs font-sans font-medium rounded hover:bg-slate-800 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              {uploadLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileUp className="w-3.5 h-3.5" />}
              <span>Ingest and Reindex Vector Store</span>
            </button>

            {uploadMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded text-[11px] font-mono text-emerald-700 leading-relaxed">
                {uploadMessage}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
