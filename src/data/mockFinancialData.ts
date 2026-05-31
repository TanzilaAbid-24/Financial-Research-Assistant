import { CompanyData, SECOption } from '../types';

export const COMPANYS_DATA: CompanyData[] = [
  {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    sector: 'Technology',
    industry: 'Consumer Electronics',
    ceo: 'Tim Cook',
    employees: 161000,
    marketCap: '3.42T',
    description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories, and sells a variety of related services worldwide.',
    competitors: ['MSFT', 'GOOGL', 'AMZN', 'NVDA'],
    financials: [
      { year: 2023, revenue: 383285, netIncome: 96995, eps: 6.13, grossMargin: 44.1, operatingMargin: 29.8, debt: 111000, rdSpending: 29915, marketShare: 21.0 },
      { year: 2024, revenue: 391035, netIncome: 100910, eps: 6.64, grossMargin: 46.2, operatingMargin: 31.2, debt: 108000, rdSpending: 31500, marketShare: 21.5 },
      { year: 2025, revenue: 405800, netIncome: 104500, eps: 7.02, grossMargin: 47.1, operatingMargin: 32.4, debt: 104500, rdSpending: 33400, marketShare: 22.1 }
    ]
  },
  {
    ticker: 'MSFT',
    name: 'Microsoft Corporation',
    sector: 'Technology',
    industry: 'Software - Infrastructure',
    ceo: 'Satya Nadella',
    employees: 221000,
    marketCap: '3.15T',
    description: 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide, with heavy investments in Azure Cloud and OpenAI integrations.',
    competitors: ['AAPL', 'GOOGL', 'AMZN'],
    financials: [
      { year: 2023, revenue: 211915, netIncome: 72361, eps: 9.68, grossMargin: 68.9, operatingMargin: 41.8, debt: 79400, rdSpending: 27195, marketShare: 44.0 },
      { year: 2024, revenue: 245120, netIncome: 88135, eps: 11.80, grossMargin: 69.8, operatingMargin: 44.6, debt: 75200, rdSpending: 29850, marketShare: 45.2 },
      { year: 2025, revenue: 279400, netIncome: 102400, eps: 13.55, grossMargin: 70.2, operatingMargin: 45.8, debt: 71000, rdSpending: 32600, marketShare: 46.5 }
    ]
  },
  {
    ticker: 'NVDA',
    name: 'NVIDIA Corporation',
    sector: 'Technology',
    industry: 'Semiconductors',
    ceo: 'Jensen Huang',
    employees: 296000,
    marketCap: '3.25T',
    description: 'NVIDIA Corporation focuses on personal computer graphics, graphics processing units, and also on artificial intelligence solutions, server chips, and robotic systems.',
    competitors: ['AMD', 'INTC', 'MSFT', 'GOOGL'],
    financials: [
      { year: 2023, revenue: 26974, netIncome: 4368, eps: 1.76, grossMargin: 56.9, operatingMargin: 20.8, debt: 12000, rdSpending: 7339, marketShare: 78.0 },
      { year: 2024, revenue: 60922, netIncome: 29760, eps: 11.93, grossMargin: 72.7, operatingMargin: 54.1, debt: 11000, rdSpending: 8675, marketShare: 82.5 },
      { year: 2025, revenue: 112800, netIncome: 61400, eps: 24.60, grossMargin: 75.1, operatingMargin: 60.2, debt: 9800, rdSpending: 10200, marketShare: 85.0 }
    ]
  },
  {
    ticker: 'TSLA',
    name: 'Tesla, Inc.',
    sector: 'Consumer Cyclical',
    industry: 'Auto Manufacturers',
    ceo: 'Elon Musk',
    employees: 140000,
    marketCap: '820B',
    description: 'Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems in the United States, China, and internationally.',
    competitors: ['BYD', 'F', 'GM', 'TM'],
    financials: [
      { year: 2023, revenue: 96773, netIncome: 14974, eps: 4.30, grossMargin: 18.2, operatingMargin: 9.2, debt: 9500, rdSpending: 3969, marketShare: 52.0 },
      { year: 2024, revenue: 104500, netIncome: 13400, eps: 3.85, grossMargin: 17.1, operatingMargin: 8.5, debt: 8200, rdSpending: 4120, marketShare: 49.5 },
      { year: 2025, revenue: 121000, netIncome: 16200, eps: 4.65, grossMargin: 18.8, operatingMargin: 9.6, debt: 7100, rdSpending: 4450, marketShare: 48.0 }
    ]
  },
  {
    ticker: 'AMZN',
    name: 'Amazon.com, Inc.',
    sector: 'Consumer Cyclical',
    industry: 'Internet Retail',
    ceo: 'Andy Jassy',
    employees: 1540000,
    marketCap: '1.95T',
    description: 'Amazon.com, Inc. engages in the retail sale of consumer products and subscriptions in North America and internationally. Services include cloud computing (AWS), advertising, and streaming.',
    competitors: ['WMT', 'MSFT', 'GOOGL', 'BABA'],
    financials: [
      { year: 2023, revenue: 574785, netIncome: 30425, eps: 2.90, grossMargin: 46.3, operatingMargin: 6.4, debt: 134000, rdSpending: 85600, marketShare: 38.0 },
      { year: 2024, revenue: 620400, netIncome: 41200, eps: 3.96, grossMargin: 47.5, operatingMargin: 8.2, debt: 122000, rdSpending: 91200, marketShare: 38.5 },
      { year: 2025, revenue: 681500, netIncome: 54600, eps: 5.20, grossMargin: 48.6, operatingMargin: 9.4, debt: 110000, rdSpending: 97800, marketShare: 39.0 }
    ]
  }
];

export const MOCK_FILINGS_OPTIONS: { [ticker: string]: SECOption[] } = {
  AAPL: [
    { accessionNumber: '0000320193-25-000108', filingType: '10-K', filingDate: '2025-10-31', periodOfReport: '2025-09-30', year: 2025 },
    { accessionNumber: '0000320193-25-000042', filingType: '10-Q', filingDate: '2025-05-02', periodOfReport: '2025-03-31', year: 2025 },
    { accessionNumber: '0000320193-24-000123', filingType: '10-K', filingDate: '2024-10-27', periodOfReport: '2024-09-28', year: 2024 }
  ],
  MSFT: [
    { accessionNumber: '0001564590-25-015890', filingType: '10-K', filingDate: '2025-07-28', periodOfReport: '2025-06-30', year: 2025 },
    { accessionNumber: '0001564590-25-004523', filingType: '10-Q', filingDate: '2025-01-26', periodOfReport: '2024-12-31', year: 2025 }
  ],
  NVDA: [
    { accessionNumber: '0001045810-25-000015', filingType: '10-K', filingDate: '2025-02-21', periodOfReport: '2025-01-26', year: 2025 },
    { accessionNumber: '0001045810-25-000062', filingType: '10-Q', filingDate: '2025-05-18', periodOfReport: '2025-04-27', year: 2025 }
  ],
  TSLA: [
    { accessionNumber: '0001628280-25-001254', filingType: '10-K', filingDate: '2025-01-28', periodOfReport: '2024-12-31', year: 2025 },
    { accessionNumber: '0001628280-25-005698', filingType: '10-Q', filingDate: '2025-04-23', periodOfReport: '2025-03-31', year: 2025 }
  ],
  AMZN: [
    { accessionNumber: '0001018724-25-000011', filingType: '10-K', filingDate: '2025-02-01', periodOfReport: '2024-12-31', year: 2025 }
  ]
};

// Initial Earnings transcripts available to parse
export const MOCK_TRANSCRIPTS: { [key: string]: string } = {
  AAPL_2025: `
Tim Cook (CEO) -- Welcome everyone. We had an outstanding fiscal year 2025, capped by record revenues in Services. Services grew 14% year over year, reaching an all time high of $98 billion. Our iPhone 16 series with Apple Intelligence has been met with critical acclaim. Our generative AI suite is rolling out globally, bringing helpful custom automation to hundreds of millions. 

Luca Maestri (CFO) -- Operational performance was exceptional. Gross margin hit a near-record 47.1% due to services mix and high capacity device pricing. We returned $24 billion to shareholders this quarter. Operating cash flows were $28.5 billion. We are raising our next quarter services growth outlook but notice slightly higher component costs on raw memory and DRAM, which might exert minor headwind pressure.

Toni Sacconaghi (Analyst) -- Can you elaborate on the capital expenditure for Apple Intelligence datasets cluster centers? Are we constructing our own custom chip silicon pipelines for storage or outsourcing to Google/NVIDIA?

Tim Cook -- We run a hybrid modeling infrastructure. We leverage our own Apple Silicon in Private Cloud Compute, ensuring maximum privacy. For training of giant foundation systems, we use key third party partnerships, including Google Cloud TPUs and industrial GPU clusters. CAPEX is well balanced and highly efficient.
`,
  NVDA_2025: `
Jensen Huang (CEO) -- The state of generative AI training and inference has crossed the rubicon. Demand for Blackwell GPUs has drastically outstripped supply. Generative AI is the single greatest computing paradigm change since personal computers. Companies are constructing AI factories to process token workloads at unprecedented cycles. Hopper revenues continue to show persistent strengths, while Blackwell is now shipping in volume.

Colette Kress (CFO) -- Q4 revenue of $38.2 billion represents a 120% jump year-over-year. Operating margins were pristine at 60.2%, guided by data center deployments and higher software enterprise software stack licenses. Sovereign AI workloads grew substantially in Europe and Asia. Liquid cooling ramp is on-schedule, with partners building hundreds of gigawatt data designs.

Stacy Rasgon (Analyst) -- Let's address the supply side. Are TSMC CoWoS packaging capabilities holding you back on Blackwell? What are the gross margins for Blackwell next year as yields stabilize?

Jensen Huang -- We face some engineering yield issues typical of brand new multi-mesh packaging node introductions, but CoWoS and HBM3e supply chains have scaled wonderfully. Colette pointed out gross margins will briefly compress to 71% before climbing back towards our standard mid-70s range once mass yields reach absolute runtime calibration.
`,
  TSLA_2025: `
Elon Musk (CEO) -- 2025 is the year of Autonomous driving deployment. Full Self-Driving Version 12 has achieved super-human intervention statistics. Our cheap Next-Gen EV is planned for volume launch in late 2026, which is critical to re-accelerating volume metrics. Optimus humanoids are performing real warehouse tasks in Giga Texas today, and we expect external commercial shipments by late 2026.

Vaibhav Taneja (CFO) -- Revenue is solid at $121 billion but our automotive gross margin, excluding regulatory credits, was 15.1% due to ongoing price competition and higher marketing incentives. Raw battery material costs fell, providing some relief. Our cash position sits at a comfortable $28 billion.

Adam Jonas (Analyst) -- On autonomous hardware 4 versus 5, do we require retrofitting of existing customer models? And does the current high cost of computing present a liquidity strain?

Elon Musk -- Hardware 4 is fully capable of unsupervised autonomy. Hardware 5 was taped out last month and will offer 10x the performance, but is not a prerequisite for standard robotaxi operations. Computing CapEx is high but completely financed out of operating cash flows. We do not need external debt markets.
`
};
