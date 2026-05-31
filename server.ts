import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { SEC_CORPUS } from './server/sec_corpus';
import { COMPANYS_DATA, MOCK_TRANSCRIPTS } from './src/data/mockFinancialData';
import { SECChunk, RAGResponse, EarningsAnalysis, RiskProfile, ResearchReport } from './src/types';

const app = express();
const PORT = 3000;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});
app.use(express.json({ limit: '50mb' }));

// Lazy initializer for Google GenAI to avoid startup crashes if API Key is missing.
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === 'MY_GEMINI_API_KEY') {
      console.warn('--- WARNING: GEMINI_API_KEY is not configured in Secrets ---');
      throw new Error('GEMINI_API_KEY environment variable is required to run the Gemini AI assistant. Please configure it in the Secrets panel.');
    }
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

// Global mutable corpus to support live document upload and multi-document retrieval analysis.
let ACTIVE_CORPUS: SECChunk[] = [...SEC_CORPUS];

// Pure RAG Similarity & Keyword Matcher
function queryRAGIndex(ticker: string, queryText: string, filingType?: string): { chunks: SECChunk[]; citations: any[] } {
  const queryWords = queryText.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(w => w.length > 2);
  
  const matches = ACTIVE_CORPUS.map(chunk => {
    // Basic filter
    if (chunk.ticker.toUpperCase() !== ticker.toUpperCase()) {
      return { chunk, score: 0 };
    }
    if (filingType && chunk.filingType.toUpperCase() !== filingType.toUpperCase()) {
      return { chunk, score: 0 };
    }
    
    let score = 0;
    const contentLower = chunk.content.toLowerCase();
    const sectionLower = chunk.section.toLowerCase();
    
    // Exact matches or partial word occurrences
    queryWords.forEach(word => {
      if (contentLower.includes(word)) {
        score += 10;
        // Frequency multiplier
        const count = contentLower.split(word).length - 1;
        score += count * 2;
      }
      if (sectionLower.includes(word)) {
        score += 25; // boost matches in titles
      }
    });
    
    return { chunk, score };
  });

  // Filter and sort
  const scored = matches
    .filter(m => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  // If no term score was generated but a ticker is loaded, grab default sections so RAG has facts
  if (scored.length === 0) {
    const defaultChunks = ACTIVE_CORPUS.filter(c => c.ticker.toUpperCase() === ticker.toUpperCase()).slice(0, 2);
    return {
      chunks: defaultChunks,
      citations: defaultChunks.map(c => ({
        chunkId: c.id,
        ticker: c.ticker,
        filingType: c.filingType,
        year: c.year,
        section: c.section,
        snippet: c.content.substring(0, 140) + '...'
      }))
    };
  }

  return {
    chunks: scored.map(s => s.chunk),
    citations: scored.map(s => ({
      chunkId: s.chunk.id,
      ticker: s.chunk.ticker,
      filingType: s.chunk.filingType,
      year: s.chunk.year,
      section: s.chunk.section,
      snippet: s.chunk.content.substring(0, 140) + '...'
    }))
  };
}

// API Routes

// Helper to check key health
app.get('/api/health', (req, res) => {
  const keyStatus = (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') ? 'configured' : 'missing';
  res.json({
    status: 'ok',
    geminiKey: keyStatus,
    corpusSize: ACTIVE_CORPUS.length
  });
});

// App Upload SEC Filing or Earnings Transcript Live Parser
app.post('/api/sec/upload', (req, res) => {
  const { ticker, filingType, year, section, content } = req.body;
  if (!ticker || !content) {
    return res.status(400).json({ error: 'Ticker and content are required' });
  }

  const chunksCount = Math.ceil(content.length / 1000);
  const newChunks: SECChunk[] = [];

  for (let i = 0; i < chunksCount; i++) {
    const chunkId = `${ticker.toLowerCase()}-${filingType.toLowerCase()}-${year}-upload-${Date.now()}-${i}`;
    const start = i * 1000;
    const end = Math.min(start + 1200, content.length); // slightly overlapping
    
    newChunks.push({
      id: chunkId,
      ticker: ticker.toUpperCase(),
      filingType: filingType || '10-K',
      year: parseInt(year) || 2025,
      section: section ? `${section} (Part ${i + 1})` : `Uploaded Section (Part ${i + 1})`,
      content: content.substring(start, end).trim()
    });
  }

  ACTIVE_CORPUS.unshift(...newChunks);
  res.json({
    message: `Successfully uploaded and segmented filing for ${ticker}. Generated ${newChunks.length} RAG search chunks.`,
    chunksAdded: newChunks.length
  });
});

// 1. SEC Filing Q&A & RAG Search Route
app.post('/api/sec/query', async (req, res) => {
  const { ticker, query, filingType } = req.body;
  if (!ticker || !query) {
    return res.status(400).json({ error: 'Ticker and Query is required.' });
  }

  try {
    // 1. Perform custom text retreival
    const { chunks, citations } = queryRAGIndex(ticker, query, filingType);
    
    // 2. Format grounding text
    const textContext = chunks.map(c => `[Source: ${c.ticker} ${c.filingType} ${c.year} - ${c.section}]\n${c.content}`).join('\n\n');
    
    // 3. System Prompt for SEC Filing Agent
    const systemPrompt = `You are a Senior SEC Filing Analyst Agent. Your task is to answer user financial questions strictly using the provided SEC retrieval chunks.
Rules:
- NEVER guess or hallucinate statistics that are not present in the provided chunks.
- Format your response clearly in structured professional paragraphs with financial terms.
- For every major claim or numerical metric mentioned, you must cite the section and source metadata (e.g. [Item 7, AAPL 10-K 2025]).
- If the retrieved context does not contain sufficient facts to answer, explicitly state what is missing, and restrict your answer to only verified retrieved statements.`;

    const userPrompt = `Retrieved Context Chunks:
${textContext}

User Question: ${query}

Provide a production-ready financial analysis and detailed answers matching the user's focus.`;

    const ai = getGeminiClient();
    const result = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.1,
      }
    });

    res.json({
      answer: result.text || 'Could not synthesize answer.',
      citations
    });
  } catch (error: any) {
    console.error('Gemini call failed:', error);
    res.status(500).json({ error: error.message || 'Gemini processing failed.' });
  }
});

// 2. Earnings Call Analysis Route
app.post('/api/earnings/analyze', async (req, res) => {
  const { ticker, period, customTranscript } = req.body;
  if (!ticker) {
    return res.status(400).json({ error: 'Ticker is required' });
  }

  // Load preset or custom
  const transcriptToUse = customTranscript || MOCK_TRANSCRIPTS[`${ticker.toUpperCase()}_2025`] || `
Speaker (Management) -- This is the default transcript for ${ticker}. Corporate demand continues to stabilize. We expect gross margins to perform within historic bounds. Operating expenses are being evaluated for cost reduction. No major changes in guidance.
`;

  try {
    const systemInstruction = `You are an expert Earnings Call Sentiment Analyst Agent.
Your process is to read the provided earnings transcripts, extract central management guidance changes, calculate a granular sentiment score, list crucial key quotes, and identify analyst worries, strategic action items, and topic clusters.
You MUST output your response strictly as a JSON object matching this schema:
{
  "ticker": "string",
  "period": "string",
  "executiveSummary": "detailed summary of the call",
  "positiveSignals": ["string", "string"],
  "negativeSignals": ["string", "string"],
  "guidanceChanges": "metrics or outlook elements raised/lowered",
  "managementSentiment": "Bullish" | "Slightly Bullish" | "Neutral" | "Bearish",
  "sentimentScore": 75, // 0 to 100
  "analystConcerns": ["string"],
  "keyQuotes": [{"speaker": "string", "text": "string"}],
  "actionItems": ["string"],
  "topicClusters": [{"topic": "string", "occurrence": 5, "magnitude": "High" | "Medium" | "Low"}]
}`;

    const userPrompt = `Earnings Transcript for ${ticker} (${period || 'FY 2025'}):
${transcriptToUse}

Analyze and generate the complete structured JSON response representing the earnings insights. Ensure all quotes are direct and accurate.`;

    const ai = getGeminiClient();
    const result = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ticker: { type: Type.STRING },
            period: { type: Type.STRING },
            executiveSummary: { type: Type.STRING },
            positiveSignals: { type: Type.ARRAY, items: { type: Type.STRING } },
            negativeSignals: { type: Type.ARRAY, items: { type: Type.STRING } },
            guidanceChanges: { type: Type.STRING },
            managementSentiment: { type: Type.STRING },
            sentimentScore: { type: Type.INTEGER },
            analystConcerns: { type: Type.ARRAY, items: { type: Type.STRING } },
            keyQuotes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  speaker: { type: Type.STRING },
                  text: { type: Type.STRING }
                }
              }
            },
            actionItems: { type: Type.ARRAY, items: { type: Type.STRING } },
            topicClusters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  topic: { type: Type.STRING },
                  occurrence: { type: Type.INTEGER },
                  magnitude: { type: Type.STRING }
                }
              }
            }
          },
          required: ['ticker', 'period', 'executiveSummary', 'positiveSignals', 'negativeSignals', 'guidanceChanges', 'managementSentiment', 'sentimentScore', 'analystConcerns', 'keyQuotes', 'actionItems', 'topicClusters']
        }
      }
    });

    const parsed = JSON.parse(result.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Earnings analysis failed:', error);
    res.status(500).json({ error: error.message || 'Earnings agent analysis failed' });
  }
});

// 3. Competitor Analysis Side-by-Side Router
app.post('/api/competitor/analyze', async (req, res) => {
  const { mainTicker, industryTickers } = req.body;
  if (!mainTicker || !industryTickers || !Array.isArray(industryTickers)) {
    return res.status(400).json({ error: 'Main Ticker and an array of Peer Tickers are required.' });
  }

  try {
    // Gather statistics
    const allTickers = [mainTicker, ...industryTickers];
    const statsContext = allTickers.map(t => {
      const company = COMPANYS_DATA.find(c => c.ticker.toUpperCase() === t.toUpperCase());
      if (!company) return `Ticker: ${t} - No formal baseline statistics loaded.`;
      return `Ticker: ${t}, Company: ${company.name}, Market Cap: ${company.marketCap}, Industry: ${company.industry}, Sector: ${company.sector}
Description: ${company.description}
Financial History: ${JSON.stringify(company.financials)}`;
    }).join('\n\n');

    const systemInstruction = `You are a Competitive Intelligence and Equity Research Competitor Agent.
Your goal is to perform side-by-side comparative diagnostics comparing a client firm against key peers.
Contrast their revenue growth, gross margins, valuation/market sizes, proprietary resources, R&D spending priorities, and strategic positioning.
Present a highly critical assessment of where the main company is vulnerable or excels compared to these players.
Make sure you refer to metrics in the metrics payload of each company. Keep the return robust and formatted in rich Markdown.`;

    const userPrompt = `Compare: ${mainTicker} against Peers: ${industryTickers.join(', ')}

Company Performance Profiles:
${statsContext}

Generate:
1. Executive Competitive Analysis
2. Benchmark Table Summarizing Key Comparative Wins/Losses
3. Deep analysis of R&D Spending and Core Moat Strengths
4. Specific Areas where the Main Company is highly vulnerable.`;

    const ai = getGeminiClient();
    const result = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: userPrompt,
      config: { systemInstruction }
    });

    res.json({
      analysis: result.text || 'Competitive benchmarking analysis failed.'
    });
  } catch (error: any) {
    console.error('Competitor comparison failed:', error);
    res.status(500).json({ error: error.message || 'Competitor evaluation failed' });
  }
});

// 4. Critical Risk Assessment Engine Route
app.post('/api/risk/assess', async (req, res) => {
  const { ticker } = req.body;
  if (!ticker) {
    return res.status(400).json({ error: 'Ticker is required' });
  }

  const company = COMPANYS_DATA.find(c => c.ticker.toUpperCase() === ticker.toUpperCase());
  const companyRiskChunks = ACTIVE_CORPUS.filter(c => c.ticker.toUpperCase() === ticker.toUpperCase() && c.section.toLowerCase().includes('risk'));

  const dataString = company 
    ? `Company: ${company.name}, Description: ${company.description}, Financials: ${JSON.stringify(company.financials)}`
    : `Ticker: ${ticker} - custom loaded upload profile.`;
  const risksText = companyRiskChunks.map(c => `${c.section}:\n${c.content}`).join('\n\n');

  try {
    const systemInstruction = `You are a Chief Risk Officer (CRO) Agent. Analyzes overall corporate risk profile across seven vectors: Liquidity, Debt, Regulatory, Competitive, Operational, Geopolitical, and Market Risks.
You will evaluate the corporation history and explicit risk statements, calculate individual severity indexes, explain reasonings, and aggregate an overall Risk Score (0-100).
Your response MUST be formatted strictly as a JSON object of this schema:
{
  "risk_score": 72,
  "severity": "Low" | "Medium" | "High" | "Critical",
  "explanation": "concise aggregated risk rationale summarizing exposure",
  "major_risks": [
    {
      "category": "Liquidity" | "Debt" | "Regulatory" | "Competitive" | "Operational" | "Geopolitical" | "Market",
      "score": 68,
      "description": "highly specific risk explanation from files",
      "vulnerability": "exact company vulnerability mapped to financial state"
    }
  ]
}`;

    const userPrompt = `Company Baseline Metrics:
${dataString}

SEC Explicit Filed Risks:
${risksText}

Perform a high-precision critical risk scoring process and return the formatted JSON.`;

    const ai = getGeminiClient();
    const result = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            risk_score: { type: Type.INTEGER },
            severity: { type: Type.STRING },
            explanation: { type: Type.STRING },
            major_risks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  score: { type: Type.INTEGER },
                  description: { type: Type.STRING },
                  vulnerability: { type: Type.STRING }
                }
              }
            }
          },
          required: ['risk_score', 'severity', 'explanation', 'major_risks']
        }
      }
    });

    const parsedRisk = JSON.parse(result.text || '{}');
    res.json(parsedRisk);
  } catch (error: any) {
    console.error('Risk evaluation failed:', error);
    res.status(500).json({ error: error.message || 'Risk agent calculation failed' });
  }
});

// 5. Research Report Generator Route
app.post('/api/report/generate', async (req, res) => {
  const { ticker, thesisType } = req.body; // e.g. "Bullish", "Bearish", "Unbiased"
  if (!ticker) {
    return res.status(400).json({ error: 'Ticker is required' });
  }

  const company = COMPANYS_DATA.find(c => c.ticker.toUpperCase() === ticker.toUpperCase());
  const companyFilingContext = ACTIVE_CORPUS.filter(c => c.ticker.toUpperCase() === ticker.toUpperCase()).slice(0, 4);

  const statsContext = company 
    ? `Company Profile: ${company.name}, Sector: ${company.sector}, Industry: ${company.industry}
Key Stats: Market Cap ${company.marketCap}, Employees: ${company.employees}, Financials: ${JSON.stringify(company.financials)}`
    : `Custom ticker stats: ${ticker}`;
  
  const chunksText = companyFilingContext.map(c => `${c.section}:\n${c.content}`).join('\n\n');

  try {
    const systemInstruction = `You are an institutional Lead Equity Research Analyst.
Your core feature is to compile comprehensive, investment-grade, multi-section equity research reports on target listed companies.
Write a deep, multi-page layout. Apply extensive financial vocabulary, exclude filler text, ensure numerical metrics are consistently woven in, and support claims with industry rationale.
Your output MUST act as a raw JSON structure mapping out the research sections accurately so the UI can form an elegant printable paper format.
Expected JSON schema:
{
  "ticker": "string",
  "companyName": "string",
  "generatedAt": "string",
  "title": "string",
  "sections": {
    "executiveSummary": "deep writeup on current thesis...",
    "companyOverview": "operations, business models, client segments",
    "financialPerformance": "detailed analysis of revenues, margin changes, cash allocations, cost of capital",
    "growthDrivers": "central strategic triggers, secular market lifts, product escalations",
    "competitivePositioning": "moats, peer pricing comparisons, technology margins",
    "keyRisks": "central operational, macro, geo, cyber, regulatory risks",
    "earningsInsights": "recent earning tone, management signals, pricing headwind adjustments",
    "valuationNotes": "implied multiples, premium sizing, margins trajectories",
    "investmentThesis": "ultimate synthesis of the recommendation",
    "bullCase": "highly optimistic trajectory",
    "bearCase": "vulnerable downside risk triggers",
    "conclusion": "final summary digest"
  }
}`;

    const userPrompt = `Ticker: ${ticker}
Thesis Angle Priority: ${thesisType || 'Balanced Strategic View'}

Baseline Stats:
${statsContext}

SEC Corpus Highlights:
${chunksText}

Synthesize a detailed, academic institutional research report in JSON format. Ensure all sections are deeply fleshed out (150-300 words each).`;

    const ai = getGeminiClient();
    const result = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ticker: { type: Type.STRING },
            companyName: { type: Type.STRING },
            generatedAt: { type: Type.STRING },
            title: { type: Type.STRING },
            sections: {
              type: Type.OBJECT,
              properties: {
                executiveSummary: { type: Type.STRING },
                companyOverview: { type: Type.STRING },
                financialPerformance: { type: Type.STRING },
                growthDrivers: { type: Type.STRING },
                competitivePositioning: { type: Type.STRING },
                keyRisks: { type: Type.STRING },
                earningsInsights: { type: Type.STRING },
                valuationNotes: { type: Type.STRING },
                investmentThesis: { type: Type.STRING },
                bullCase: { type: Type.STRING },
                bearCase: { type: Type.STRING },
                conclusion: { type: Type.STRING }
              },
              required: ['executiveSummary', 'companyOverview', 'financialPerformance', 'growthDrivers', 'competitivePositioning', 'keyRisks', 'earningsInsights', 'valuationNotes', 'investmentThesis', 'bullCase', 'bearCase', 'conclusion']
            }
          },
          required: ['ticker', 'companyName', 'generatedAt', 'title', 'sections']
        }
      }
    });

    const parsedReport = JSON.parse(result.text || '{}');
    res.json(parsedReport);
  } catch (error: any) {
    console.error('Research report compilation failed:', error);
    res.status(500).json({ error: error.message || 'Report agent compilation failed' });
  }
});


// 6. Google Grounded Real-Time News Feed Route
app.post('/api/news', async (req, res) => {
  const { ticker } = req.body;
  if (!ticker) {
    return res.status(400).json({ error: 'Ticker is required' });
  }

  const company = COMPANYS_DATA.find(c => c.ticker.toUpperCase() === ticker.toUpperCase());
  const query = company ? `${company.name} (${company.ticker}) latest financial news stock earnings and ${company.industry} trends` : `${ticker} stock latest news`;

  try {
    const ai = getGeminiClient();
    const systemInstruction = `You are a professional real-time news aggregation agent specializing in equity markets and financial intelligence.
Your task is to fetch, compile, and summarize 5 highly recent real-world news articles or industry-shaping events related to the company or ticker query.
Provide high-quality URLs that point to real financial platforms (e.g., Bloomberg, Reuters, CNBC, Yahoo Finance, or similar).
Assign a clear sentiment tone: "Bullish", "Bearish", or "Neutral" based on impact analysis.`;

    const userPrompt = `Query: ${query}
Find 5 of the most recent and relevant news articles or industry trend items covering this target. Format the output strictly as a JSON object matching this spec:
{
  "articles": [
    {
      "headline": "Full news headline or title",
      "source": "E.g., CNBC, Bloomberg, Financial Times",
      "snippet": "A concise, informative 2-sentence summary illustrating the market impact of this news item.",
      "date": "E.g., May 2026, or 2 hours ago",
      "sentiment": "Bullish" | "Bearish" | "Neutral",
      "url": "A highly descriptive realistic URL linking to Yahoo Finance or Bloomberg for this type of news"
    }
  ]
}`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            articles: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  headline: { type: Type.STRING },
                  source: { type: Type.STRING },
                  snippet: { type: Type.STRING },
                  date: { type: Type.STRING },
                  sentiment: { type: Type.STRING },
                  url: { type: Type.STRING }
                },
                required: ['headline', 'source', 'snippet', 'date', 'sentiment', 'url']
              }
            }
          },
          required: ['articles']
        }
      }
    });

    const parsedNews = JSON.parse(result.text || '{"articles": []}');
    res.json(parsedNews);
  } catch (error: any) {
    console.error('Real-time news retrieval failed:', error);
    res.status(500).json({ error: error.message || 'News agent tracking failed' });
  }
});


// 7. General Quant Advisor Chatbot Route
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages history is required' });
  }

  try {
    const ai = getGeminiClient();
    const systemInstruction = `You are the Senior Quantitative Analyst and Portfolio Strategist at the Financial Research Assistant platform.
You assist analysts and portfolio managers directory in exploring equities, interpreting financial reports, computing ratios, and interpreting risk heatmaps.
Always maintain a direct, professional, expert quantitative investor/research tone.
Ground your responses in standard equity valuation (multiples, DCF), margin profiles, credit scores, and SEC disclosure structures.`;

    // Map roles to Gemini expected structure (user and model)
    const contents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction,
      }
    });

    res.json({ answer: result.text || '' });
  } catch (error: any) {
    console.error('Chat endpoint failed:', error);
    res.status(500).json({ error: error.message || 'Chat agent failed' });
  }
});


// Start Express app setup representing dev or production configurations
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running securely on http://localhost:${PORT}`);
  });
}

startServer();
