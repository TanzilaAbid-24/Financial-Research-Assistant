/**
 * Types and interfaces for the Financial Research Assistant.
 */

export interface FinancialMetric {
  year: number;
  revenue: number; // in Millions of USD
  netIncome: number; // in Millions of USD
  eps: number; // in USD
  grossMargin: number; // percentage
  operatingMargin: number; // percentage
  debt: number; // in Millions of USD
  rdSpending: number; // in Millions of USD
  marketShare: number; // percentage
}

export interface CompanyData {
  ticker: string;
  name: string;
  sector: string;
  industry: string;
  ceo: string;
  employees: number;
  marketCap: string; // e.g. "3.2T", "2.1T"
  description: string;
  financials: FinancialMetric[];
  competitors: string[]; // tickers
}

export interface SECOption {
  accessionNumber: string;
  filingType: '10-K' | '10-Q' | '8-K';
  filingDate: string;
  periodOfReport: string;
  year: number;
}

export interface SECChunk {
  id: string;
  ticker: string;
  filingType: string;
  year: number;
  section: string;
  content: string;
  score?: number; // similarity score during retrieval
}

export interface Citation {
  chunkId: string;
  ticker: string;
  filingType: string;
  year: number;
  section: string;
  snippet: string;
}

export interface RAGResponse {
  answer: string;
  citations: Citation[];
}

export interface EarningsAnalysis {
  ticker: string;
  period: string; // e.g. "Q1 2026"
  executiveSummary: string;
  positiveSignals: string[];
  negativeSignals: string[];
  guidanceChanges: string;
  managementSentiment: 'Bullish' | 'Slightly Bullish' | 'Neutral' | 'Bearish';
  sentimentScore: number; // 0 to 100
  analystConcerns: string[];
  keyQuotes: { speaker: string; text: string }[];
  actionItems: string[];
  topicClusters: { topic: string; occurrence: number; magnitude: 'High' | 'Medium' | 'Low' }[];
}

export interface RiskProfile {
  risk_score: number; // 0-100
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  explanation: string;
  major_risks: {
    category: 'Liquidity' | 'Debt' | 'Regulatory' | 'Competitive' | 'Operational' | 'Geopolitical' | 'Market';
    score: number; // 0-100
    description: string;
    vulnerability: string;
  }[];
}

export interface ResearchReport {
  ticker: string;
  companyName: string;
  generatedAt: string;
  title: string;
  sections: {
    executiveSummary: string;
    companyOverview: string;
    financialPerformance: string;
    growthDrivers: string;
    competitivePositioning: string;
    keyRisks: string;
    earningsInsights: string;
    valuationNotes: string;
    investmentThesis: string;
    bullCase: string;
    bearCase: string;
    conclusion: string;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  citations?: Citation[];
  agentActive?: string; // which agent handles this
}

export interface AgentState {
  currentAgent: 'Supervisor' | 'FilingAgent' | 'EarningsAgent' | 'CompetitorAgent' | 'RiskAgent' | 'ResearchAgent' | 'Idle';
  logs: { timestamp: string; message: string; type: 'success' | 'info' | 'warning' }[];
}
