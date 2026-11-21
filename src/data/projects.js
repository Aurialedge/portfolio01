// Curated metadata layered on top of the live GitHub repo list.
//
// How the Projects section is built:
//   1. Every public, non-fork repo on GitHub is shown automatically (new repos appear on their own).
//   2. If a repo has an entry in `curated`, that entry's title/description/tags/links win.
//   3. Otherwise the GitHub description is used, then a summary of the repo's README.
//
// To feature a project or add a demo video, add/edit an entry here — keyed by the exact repo name.

import cookiepediaImg from '../image/Cookiepedia.jpg';
import stockieImg from '../image/Stock.jpg';
import carImg from '../image/Garage.jpg';
import walkitalkiImg from '../image/WalkiTalki.png';

export const CATEGORIES = ['Backend & Systems', 'AI / ML', 'Full-Stack', 'Mobile', 'Learning'];

// Repos that are never shown (profile README, this site, superseded versions).
export const hiddenRepos = ['Aurialedge', 'Portfolio', 'portfolio01', 'NetGenX'];

// Order here = order of the large "Featured" cards.
export const featured = ['Net-GenX', 'TaskFlow', 'Incentra'];

export const curated = {
  'Net-GenX': {
    title: 'NetGenX',
    tagline: 'Cyber Incident Response & Evidence Management Platform',
    description:
      'AI-assisted cyber incident portal for the defence ecosystem: threats are triaged in under two seconds and evidence is sealed on IPFS with an Ethereum chain-of-custody ledger.',
    highlights: [
      'Decoupled Node.js + Flask microservices automate threat triage and forensic logging with sub-2-second end-to-end latency.',
      'Tamper-proof evidence vault: files stored on IPFS, SHA-256 hashes recorded by Solidity smart contracts as an immutable audit trail.',
      'Production-grade REST APIs with JWT role-based access control, rate limiting, and strict input validation.',
    ],
    metrics: [
      { value: '<2s', label: 'threat triage' },
      { value: 'SHA-256', label: 'on-chain custody' },
    ],
    tags: ['React', 'Node.js', 'Express', 'MongoDB', 'Flask', 'Docker', 'Solidity', 'IPFS'],
    category: ['Full-Stack', 'AI / ML'],
    video: 'Q9UzPYigs1U',
    live: 'https://net-gen-x.vercel.app',
  },
  TaskFlow: {
    title: 'TaskFlow',
    tagline: 'Distributed Background Job Queue in Go',
    description:
      'A production-style job queue on PostgreSQL with at-least-once delivery, crash recovery, idempotency, and first-class observability.',
    highlights: [
      'Atomic job claiming with PostgreSQL SKIP LOCKED, plus fencing tokens and heartbeat leases so no job is processed twice.',
      'At-least-once engine with exponential-backoff retries, dead-letter queues, and a sweeper that recovers jobs from crashed workers.',
      'Tenant-scoped idempotency keys, timing-safe API-key auth, graceful shutdown, Prometheus /metrics and structured slog telemetry.',
    ],
    metrics: [
      { value: 'SKIP LOCKED', label: 'atomic claims' },
      { value: 'DLQ', label: 'fault recovery' },
    ],
    tags: ['Go', 'PostgreSQL', 'pgx', 'Chi', 'Docker', 'Prometheus', 'slog'],
    category: ['Backend & Systems'],
    live: 'https://taskflow-bu6t.onrender.com/',
  },
  Incentra: {
    title: 'Incentra',
    tagline: 'Alternative Credit Scoring & Behavioral Rewards',
    description:
      'Credit scoring for gig workers without a credit history, built on behavioral data, with a separate ML scoring tier so API traffic stays fast.',
    highlights: [
      '3-tier architecture (React 19, Node.js/Express, Python/FastAPI) isolates credit-scoring workloads from API traffic, holding P95 latency under 25 ms.',
      'MongoDB schemas and compound indexes for 10,000+ gig-worker profiles cut score-recalculation query latency by 65%.',
      'JWT auth with HTTP-only cookies and RBAC protects financial profiles and credit-evaluation APIs.',
    ],
    metrics: [
      { value: '<25ms', label: 'P95 latency' },
      { value: '−65%', label: 'query latency' },
    ],
    tags: ['React 19', 'Node.js', 'Express', 'FastAPI', 'Python', 'MongoDB', 'Docker'],
    category: ['Full-Stack', 'AI / ML'],
    video: 'jF7RlG8O148',
  },
  'Linux-RPC-RabbitMQ': {
    title: 'Distributed File System over RPC',
    description:
      'Multi-client shared file storage that evolves a Sun/ONC RPC baseline in C into RabbitMQ-based RPC with competing workers, distributed locking, and 5-step chunked transfer for large files.',
    tags: ['C', 'Sun RPC', 'RabbitMQ', 'AMQP', 'Linux'],
    category: ['Backend & Systems'],
  },
  Jobie: {
    title: 'Jobie',
    description:
      'Priority task queue and job orchestrator: Node.js API, Redis for priority queues and heartbeats, PostgreSQL job history, and C++ thread-pool workers with retries and dead-letter queues.',
    tags: ['C++', 'Node.js', 'Redis', 'PostgreSQL'],
    category: ['Backend & Systems'],
    status: 'In progress',
  },
  IntentFlow: {
    title: 'IntentFlow',
    description:
      'Natural-language campaign orchestrator for e-commerce: an LLM copilot turns plain English or Hinglish goals into customer segments, then dispatches campaigns with live funnel tracking and ROI math.',
    tags: ['Next.js', 'FastAPI', 'PostgreSQL', 'Gemini', 'Docker'],
    category: ['AI / ML', 'Full-Stack'],
  },
  LunaPulse: {
    title: 'LunaPulse',
    description:
      'Daily-insights agent for wearable data. Deterministic code picks insights from robust personal baselines (median, MAD, z-scores); Gemini only explains them, with claim checking and tool calls.',
    tags: ['Python', 'FastAPI', 'React', 'SQLite', 'Gemini'],
    category: ['AI / ML', 'Full-Stack'],
  },
  AlphaSight: {
    title: 'AlphaSight',
    description:
      'Hybrid Vision Transformer that classifies short-term stock trends from candlestick images plus RSI/MACD (73% test accuracy), with Grad-CAM explainability, backtesting, and a Streamlit dashboard.',
    tags: ['Python', 'PyTorch', 'ViT', 'Streamlit'],
    category: ['AI / ML'],
  },
  PdfEditor: {
    title: 'PDF Review & Extraction',
    description:
      'Upload and view PDFs in the browser, extract invoice data with Gemini or Groq, then edit and manage records through a CRUD dashboard.',
    tags: ['React', 'TypeScript', 'Express', 'MongoDB', 'Gemini'],
    category: ['Full-Stack', 'AI / ML'],
  },
  outmart: {
    title: 'OutMart',
    description: 'E-commerce platform with password and OTP sign-in over email and phone, built on React, Express and MongoDB.',
    tags: ['React', 'Node.js', 'Express', 'MongoDB', 'JWT'],
    category: ['Full-Stack'],
  },
  'cookiepedia-vite': {
    title: 'Cookiepedia',
    description:
      'AI-personalized recipe-sharing app with a meal-suggestion chatbot, follow/save social features, and search by ingredients.',
    tags: ['React', 'Node.js', 'Express', 'MongoDB', 'OpenAI API'],
    category: ['Full-Stack', 'AI / ML'],
    image: cookiepediaImg,
  },
  Car_price_predictor: {
    title: 'Car Price Predictor',
    description:
      'Estimates used-car prices from make, model, year, fuel type and mileage. Data scraped from Quikr and cleaned; a linear regression model reaches R² = 0.92, served through Flask.',
    tags: ['Python', 'scikit-learn', 'pandas', 'Flask'],
    category: ['AI / ML'],
    image: carImg,
  },
  Stockie: {
    title: 'Stockie',
    description: 'Stock price prediction with LSTM and ARIMA models and a web dashboard to visualize trends.',
    tags: ['Python', 'LSTM', 'ARIMA'],
    category: ['AI / ML'],
    image: stockieImg,
  },
  WalkiTalki: {
    title: 'WalkiTalki',
    description: 'Real-time chat app built with Flutter and Firebase.',
    tags: ['Flutter', 'Dart', 'Firebase'],
    category: ['Mobile'],
    image: walkitalkiImg,
  },
  Clawvy: {
    title: 'Clawvy',
    description: 'Voice-activated virtual assistant built with React and Vite.',
    tags: ['JavaScript', 'React', 'Vite'],
    category: ['Full-Stack', 'AI / ML'],
  },
  Snake_ladder_python: {
    title: 'Rock · Paper · Scissors',
    description: 'Interactive game with a React frontend and a Python Flask backend that runs the game logic.',
    tags: ['React', 'Flask', 'Python'],
    category: ['Full-Stack'],
  },
  DSA: { title: 'DSA', description: 'Data structures and algorithms, basic to advanced, in C++.', category: ['Learning'] },
  DSA_core: { title: 'DSA Core', description: 'Core C++ fundamentals and array problems.', category: ['Learning'] },
  python_learn: { category: ['Learning'] },
  'js-trial': { category: ['Learning'] },
  'Full-Stack-DEV': { category: ['Learning'] },
};

// Fallback when a repo has no curated category.
export function categoryFromLanguage(language) {
  switch (language) {
    case 'Go':
    case 'C':
    case 'C++':
    case 'Rust':
      return 'Backend & Systems';
    case 'Python':
    case 'Jupyter Notebook':
      return 'AI / ML';
    case 'Dart':
    case 'Kotlin':
    case 'Swift':
      return 'Mobile';
    default:
      return 'Full-Stack';
  }
}
