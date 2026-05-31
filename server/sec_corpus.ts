import { SECChunk } from '../src/types';

export const SEC_CORPUS: SECChunk[] = [
  // --- AAPL 10-K 2025 Chunks ---
  {
    id: 'aapl-2025-bus-1',
    ticker: 'AAPL',
    filingType: '10-K',
    year: 2025,
    section: 'Item 1. Business Overview',
    content: `Apple Inc. designs, manufactures and markets smartphones, personal computers, tablets, wearables and accessories, and sells a variety of related services. Services business encompasses Apple Intelligence, App Store, Apple Music, Apple Pay, iCloud, Apple Arcade, Apple TV+, and advertising. Apple Intelligence represents a highly secured generative AI computing paradigm designed for on-device and private cloud processing. Apple is committed to achieving net-carbon neutrality across its entire product lifecycle and supply chains by 2030, through investments in low-carbon materials, clean energy, and environmental restoration programs.`
  },
  {
    id: 'aapl-2025-bus-2',
    ticker: 'AAPL',
    filingType: '10-K',
    year: 2025,
    section: 'Item 1. Apple Intelligence Infrastructure',
    content: `Our artificial intelligence architecture (Apple Intelligence) is powered by a hybrid computational strategy. Where small form-factor, high-concurrency tasks are executed, local models on individual Apple Silicon neural engines are used. For complex foundation reasoning, computations are securely routed to Private Cloud Compute (PCC) nodes. PCC instances run custom hardened OS packages on custom Apple Silicon server chipsets. Under this infrastructure, user datasets are never persisted in storage media and are inaccessible to system administrators. This architecture sets a state-of-the-art benchmark for generative AI consumer security.`
  },
  {
    id: 'aapl-2025-risk-1',
    ticker: 'AAPL',
    filingType: '10-K',
    year: 2025,
    section: 'Item 1A. Risk Factors - Supply Chain & Component Risks',
    content: `Our manufacturing activities are highly centralized in geographic zones including China, India, and Southeast Asia. Political tensions, trade disputes, tariffs, or sanitary lockdowns in these areas could severely disrupt finished device distributions. Furthermore, we rely heavily on single-sourced component providers for essential silicon fabrication (principally TSMC in Taiwan) and memory subsystems (such as DRAM and NAND components). Price spikes or raw material supply bottlenecks in high-capacity DRAM particles could exert major downward pressure on consumer electronics gross margins.`
  },
  {
    id: 'aapl-2025-risk-2',
    ticker: 'AAPL',
    filingType: '10-K',
    year: 2025,
    section: 'Item 1A. Risk Factors - Regulatory Pressure & App Store',
    content: `Our Services business, particularly the App Store, faces ongoing regulatory scrutiny across multiple jurisdictions, including the European Union's Digital Markets Act (DMA) and US antitrust civil litigations. Regulatory actions requiring us to support alternate application marketplaces, external payment processing pipelines, or third-party web rendering integrations have forced fee structure reductions. If addition requirements are imposed, our highly lucrative App Store commissions could experience significant declines, eroding consolidated services profitability.`
  },
  {
    id: 'aapl-2025-mda-1',
    ticker: 'AAPL',
    filingType: '10-K',
    year: 2025,
    section: 'Item 7. MD&A - Revenue Dynamics and Services Mix',
    content: `Net sales in fiscal 2025 rose to $405.8 billion, representing a 3.8% increase over fiscal 2024. Services net sales were $98 billion, representing 24.1% of consolidated net sales, up from $85.1 billion in 2024. This growth was driven by transactional growth in App Store subscriptions and elevated iCloud capacity tiers. Gross margin climbed to 47.1% due to Services carrying structurally higher margins (approximately 74.2%) compared to individual physical hardware margins (averaging 36.5%). Research and Development (R&D) expenditures increased to $33.4 billion, reflecting extensive team deployments towards generative AI architectures and proprietary silicon cores.`
  },
  {
    id: 'aapl-2025-legal-1',
    ticker: 'AAPL',
    filingType: '10-K',
    year: 2025,
    section: 'Item 3. Legal Proceedings',
    content: `The Company is subject to numerous litigations and investigations worldwide. App Store antitrust cases brought by Epic Games and consumer class representations continue through post-trial appellate review. In March 2024, the United States Department of Justice (DOJ), along with attorney generals from multiple states, filed a civil antitrust lawsuit alleging Apple monopolized or attempted to monopolize the smartphone operating ecosystem. We intend to defend ourselves vigorously against these allegations and do not believe a material loss contingency is probable at the current disclosure stage.`
  },

  // --- NVDA 10-K 2025 Chunks ---
  {
    id: 'nvda-2025-bus-1',
    ticker: 'NVDA',
    filingType: '10-K',
    year: 2025,
    section: 'Item 1. Business - AI Factory Revolution',
    content: `NVIDIA Corporation invented the GPU to accelerate computing cycles. Today, we focus on graphics and compute processors used in cloud computing, scientific calculation, deep learning, autonomous vehicles, and corporate robotics. The core of our accelerated compute ecosystem lies in the AI Factory model, which operates under our comprehensive silicon-to-software architecture (comprised of GPUs, InfiniBand high-speed systems, BlueField DPUs, and the CUDA software ecosystem). Under this platform, compute nodes act as real factories processing data inputs to synthesize token output products.`
  },
  {
    id: 'nvda-2025-bus-2',
    ticker: 'NVDA',
    filingType: '10-K',
    year: 2025,
    section: 'Item 1. Product Segment Roadmap (Blackwell & Hopper)',
    content: `Our hardware platform features our Hopper GPU architecture alongside our next-generation Blackwell GPU architecture. The Blackwell platform utilizes ultra-low-latency high-speed packaging, bringing together two distinct silicon dies into a unified mesh representing 208 billion transistors. Compute clusters constructed with Blackwell processors deliver 30x the LLM performance at 25x less power compared to legacy installations. Sovereign nations, global hyperscalers, and private enterprisey AI initiatives are scaling AI factory compute footprints by deploying custom liquid cooling infrastructure architectures.`
  },
  {
    id: 'nvda-2025-risk-1',
    ticker: 'NVDA',
    filingType: '10-K',
    year: 2025,
    section: 'Item 1A. Risk Factors - Semiconductor Packaging Scarcity',
    content: `Our semiconductor fabrication model is fully fabless. We rely exclusively on third-party silicon foundries, mainly Taiwan Semiconductor Manufacturing Company (TSMC), to manufacture all wafer components. Additionally, advanced packaging architectures (principally Chip-on-Wafer-on-Substrate or CoWoS) and High-Bandwidth Memory (such as HBM3e and HBM4) are heavily single-sourced. Any structural yield disruption, transport interferences, or packaging allocation constraints at TSMC or HBM key suppliers will severely limit the mass shipments of Blackwell graphics clusters, causing revenue delays.`
  },
  {
    id: 'nvda-2025-risk-2',
    ticker: 'NVDA',
    filingType: '10-K',
    year: 2025,
    section: 'Item 1A. Risk Factors - Export Controls and Regulatory Ceilings',
    content: `Our graphics and server accelerators are subject to strict national security export regulations overseen by the US Department of Commerce. Regulations restrict shipping of our high-end chips (including A100, H100, H800, H200, and Blackwell chips) to China, Russia, and key Middle Eastern regions. Any expansion of these export limits, or delays in procuring custom regional export license clearances, will permanently exclude our solutions from high-growth international geographies and create material market inventory gluts.`
  },
  {
    id: 'nvda-2025-mda-1',
    ticker: 'NVDA',
    filingType: '10-K',
    year: 2025,
    section: 'Item 7. MD&A - Hyper-growth in Data Centers',
    content: `Fiscal 2025 revenue surged to an unprecedented $112.8 billion, a massive 85.1% rise over fiscal 2024 revenue of $60.9 billion, primarily propelled by explosive cloud scaling workloads. Net income climbed to $61.4 billion. Data Center segment revenue drove 88.4% of total sales, backed by LLM scaling. Gross profit margin expansion reached 75.1%, driven by favorable product mix, premium enterprise software licensing configurations (including NVIDIA AI Enterprise), and robust cluster integration sales. R&D spending climbed to $10.2 billion to accelerate standard deep silicon tape-outs and system cooling solutions.`
  },

  // --- TSLA 10-K 2025 Chunks ---
  {
    id: 'tsla-2025-bus-1',
    ticker: 'TSLA',
    filingType: '10-K',
    year: 2025,
    section: 'Item 1. Business - Autonomous Mobility & Energy Storage',
    content: `Tesla, Inc. designs, integrates, and builds high-performance electric vehicles, solar electricity generators, utility-scale battery energy installations (Megapack), and humanoid robotics (Optimus). Our core vehicle strategy is focused on achieving unsupervised autonomous driving capabilities using our Full Self-Driving (FSD) camera-only neural network technology (Hardware 4 and Hardware 5 architectures). In addition, Tesla is scaling its utility Megapack battery manufacturing in Lathrop, California and Shanghai, China, targeting high-margin power storage grids.`
  },
  {
    id: 'tsla-2025-risk-1',
    ticker: 'TSLA',
    filingType: '10-K',
    year: 2025,
    section: 'Item 1A. Risk Factors - Automotive Margin Scarcity & Competition',
    content: `The global electric vehicle sector is experiencing severe pricing compression and aggressive promotional discount strategies, notably from lower-cost Chinese original equipment manufacturers. Our automotive gross margin, excluding statutory regulatory greenhouse credits, dropped to 15.1% in late 2024. If competitive price cuts continue, or consumer demand for battery electric cars stagnates in favor of hybrid or fossil alternatives, our consolidated cash generation may be impacted, restricting capital deployment for robotaxi gigafactories.`
  },
  {
    id: 'tsla-2025-mda-1',
    ticker: 'TSLA',
    filingType: '10-K',
    year: 2025,
    section: 'Item 7. MD&A - Capital Spending and Autonomy R&D',
    content: `In fiscal 2025, consolidated revenue grew to $121.0 billion, a 15.7% increase compared to the prior fiscal cycle. However, operating margin compression remained a headwind, declining slightly to 9.6%. Price concessions on Model 3 and Model Y vehicles were partially offset by growth in battery energy sales (growing 120% to $14 billion). Research and Development (R&D) investments grew to $4.45 billion to expand custom Dojo supercomputing nodes, tape out FSD Hardware 5 chips, and train advanced physics-based navigation neural networks.`
  },

  // --- MSFT 10-K 2025 Chunks ---
  {
    id: 'msft-2025-bus-1',
    ticker: 'MSFT',
    filingType: '10-K',
    year: 2025,
    section: 'Item 1. Business - Commercial Cloud & AI Copilot',
    content: `Microsoft Corporation develops, integrates, and supports software, services, devices, and enterprise technology. Our Intelligent Cloud segment is anchored by Azure Cloud services, enabling organizations to deploy scalable generative AI models via Azure OpenAI Service. Our productivity segment integrates AI Copilot helper agents directly into the Microsoft 365, Teams, and Dynamics enterprise software suites, driving high-margin monthly premium seat subscription models.`
  },
  {
    id: 'msft-2025-risk-1',
    ticker: 'MSFT',
    filingType: '10-K',
    year: 2025,
    section: 'Item 1A. Risk Factors - Cyber-security Intrusion Vulnerabilities',
    content: `Microsoft's operating platforms, databases, and Azure Cloud solutions are principal targets for sophisticated state-sponsored cyber-security threat actors and cyber-extortion operations. Multiple security incidents involving unauthorized access to executive email accounts and internal active directories have attracted regulatory audits and brand reputational damage. Failure to defend or mitigate widespread code vulnerabilities could result in extensive liability claims, operating disruption, or massive enterprise customer churn to competing cloud hosts.`
  },
  {
    id: 'msft-2025-mda-1',
    ticker: 'MSFT',
    filingType: '10-K',
    year: 2025,
    section: 'Item 7. MD&A - Hyper-scale Azure Revenue Expansion',
    content: `Fiscal 2025 net sales hit $279.4 billion, growing 13.9% year-over-year. Operating income grew to $127.9 billion, supported by an operating margin of 45.8%. Operating expenses were safely managed, with consolidated gross margins ticking upwards to 70.2%. Capital Expenditures (CapEx) surged to a record $52.5 billion, primarily representing data center real estate, GPU cluster acquisition arrays, and high-capacity fiber routing networks, keeping pace with OpenAI workloads.`
  },

  // --- AMZN 10-K 2025 Chunks ---
  {
    id: 'amzn-2025-bus-1',
    ticker: 'AMZN',
    filingType: '10-K',
    year: 2025,
    section: 'Item 1. Business - Retail Efficiency & AWS Cloud compute',
    content: `Amazon.com, Inc. is the world\'s largest online retailer and cloud infrastructure provider (Amazon Web Services). Through AWS, we provide compute, storage, database, and machine learning systems (including customized Trainium and Inferentia silicon accelerators). In our retail operations, we have optimized delivery times and operations cost structures by reorganizing logistics into segmented regional hubs, utilizing robotics sorting, and leveraging predictive inventory dispatching AI.`
  },
  {
    id: 'amzn-2025-risk-1',
    ticker: 'AMZN',
    filingType: '10-K',
    year: 2025,
    section: 'Item 1A. Risk Factors - FTC Antitrust Scrutiny & Gig Labor Risk',
    content: `Amazon faces multiple Federal Trade Commission (FTC) antitrust lawsuits claiming monopolistic behavior, buy-box manipulation, and anti-competitive practices on third-party pricing metrics. Additionally, our fulfillment and shipping logistics networks are subject to changing labor policies, unionization efforts, and gig-economy worker reclassifications. If labor regulations force full-employee classification or collective-bargaining compensation formulas, consolidated operating expenses could rise substantially.`
  },
  {
    id: 'amzn-2025-mda-1',
    ticker: 'AMZN',
    filingType: '10-K',
    year: 2025,
    section: 'Item 7. MD&A - Operating Cash Flow & AWS Resiliency',
    content: `Consolidated net sales in fiscal 2025 grew to $681.5 billion, a 9.8% increase compare to fiscal 2024 net sales of $620.4 billion. Operating margins expanded to 9.4%, showing massive operational leverage gains from logistics optimization and AWS database expansions. Operating cash flows reached a record $94.2 billion. Capital spending was $64.8 billion, focusing primarily on AWS server capacity pipelines, satellite connectivity initiatives (Project Kuiper), and fulfillment automation.`
  }
];
