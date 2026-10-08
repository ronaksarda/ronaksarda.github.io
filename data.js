// All site content lives here. Edit this file to update projects, wins and certificates.
window.SITE = {
    discord: 'samronnie_05',

    projects: [
        {
            id: 'gitspace', name: 'GitSpace', kicker: 'developer universe', cat: ['web', 'systems'], wide: true, live: 'https://gitspace.me',
            repo: 'https://github.com/ronaksarda/GitSpace', viz: 'gif',
            hook: 'Your GitHub universe as a galaxy you can fly through.',
            desc: 'Every developer is an island. Every repo is a building. Fly a ship with WASD, warp to other devs, unlock achievements.',
            tags: ['JavaScript', 'Node / Express', 'PostgreSQL', 'C++17', 'HTML5 Canvas', 'Render'],
            points: [
                'Full-stack app that renders any GitHub account as an interactive 2D world on HTML5 Canvas.',
                'C++17 spatial layout engine with a JS fallback that keeps 60 FPS without WebGL.',
                'Fixed core layout bottlenecks: tested capacity went from 2,500 to 80,000+ repos (~10,000 simulated users).',
                'Live in production on Render with 30+ active users.'
            ]
        },
        {
            id: 'ranker', name: 'Candidate Ranker', kicker: 'offline AI hiring pipeline', cat: ['ai'],
            repo: 'https://github.com/ronaksarda/candidate-ranker', viz: 'funnel', badge: 'Hack2Skill × Redrob',
            hook: '100,000 candidates ranked in under 5 minutes. CPU only.',
            desc: 'Solo build. Semantic embeddings plus deterministic scoring and honeypot detection. No cloud, no LLM calls.',
            tags: ['Python', 'Sentence-Transformers', 'Hugging Face', 'MiniLM'],
            points: [
                'Scores 100,000 synthetic applicants against a job description in under 5 minutes on one CPU with 16 GB RAM.',
                'Three-stage funnel: keyword pre-filter to the top 3,000, local MiniLM semantic match, then a composite score.',
                'Composite score: semantic match 50%, explicit skills 30%, behavioral signals 20%.',
                'Plausibility check flags fabricated candidate histories. Streaming JSONL parser keeps RAM bounded.'
            ]
        },
        {
            id: 'grantanchor', name: 'GrantAnchor', kicker: 'grant compliance with memory', cat: ['ai', 'web'], team: true,
            repo: 'https://github.com/ronaksarda/microsoft-hindsight', viz: 'budget',
            hook: 'Checks every expense against the grant rules before the money goes out.',
            desc: 'And it learns. Stopped payments, funder approvals and surprise invoices go into Hindsight memory, so month nine is sharper than day one.',
            tags: ['Python', 'Hindsight memory', 'LLM agents', 'Rules engine'],
            points: [
                'Checks each expense against grant rules and against everything the team already spent.',
                'Memory changes the answer: "Maya\'s last two invoices came in ~50% higher, this takes travel to 84%."',
                'Recalls past funder approvals and offers the reference in one click.',
                'Memory can warn or help, never approve or block. The grant rules always decide.'
            ]
        },
        {
            id: 'labelsure', name: 'LabelSure AI', kicker: 'legal metrology compliance', cat: ['ai', 'web'], team: true,
            repo: 'https://github.com/ronaksarda/SIH-Project', viz: 'label', badge: 'Smart India Hackathon',
            hook: 'Audits product labels against Indian law. Without the LLM making stuff up.',
            desc: 'Checks packaged goods and e-commerce listings against the Legal Metrology (Packaged Commodities) Rules, 2011.',
            tags: ['Python', 'FastAPI', 'Groq Vision LLM', 'Tesseract OCR'],
            points: [
                'Audits labels from photos or live listings (Amazon, Flipkart, Blinkit, Zepto…) against 14+ statutory rules.',
                'Anti-hallucination pipeline: vision LLM and local OCR run in parallel and cross-check MRP, batch number and net quantity.',
                'Deterministic rules engine codified from the actual Gazette notification G.S.R. 629(E).',
                'Human-in-the-loop officer review plus automated PDF/DOCX reports.'
            ]
        },
        {
            id: 'reader', name: 'Screen Reader Agent', kicker: 'local AI voice layer', cat: ['ai'], wip: true,
            repo: 'https://github.com/ronaksarda/side-project', viz: 'wave',
            hook: 'Highlight any text. Press F8. It reads it to you.',
            desc: 'Offline-first screen reader with neural voices and a local LLM that explains text before reading it. Zero paid APIs.',
            tags: ['Python', 'Ollama', 'qwen2.5', 'Neural TTS'],
            points: [
                'Works in PowerPoint, Word, PDFs, browsers, IDEs, Discord. Anywhere you can highlight text.',
                'F8 reads verbatim. F9 has a local LLM explain or summarize first. Esc stops it.',
                '100% local and private: no API keys, no cloud.',
                'Still building, new modes landing soon.'
            ]
        },
        {
            id: 'docask', name: 'doc_ask', kicker: 'local RAG document QA', cat: ['ai', 'web'],
            repo: 'https://github.com/ronaksarda/doc-ask', viz: 'chat',
            hook: 'Upload a PDF. Ask it anything. Nothing leaves your laptop.',
            desc: 'Retrieval-augmented QA over PDF, DOCX and TXT, running fully local on Ollama.',
            tags: ['Python', 'RAG', 'Ollama', 'pypdf', 'python-docx'],
            points: [
                'Full-context RAG: parsed documents are injected into the prompt of a local qwen2.5:1.5b model.',
                'Handles PDF, DOCX and TXT with multi-encoding fallback.',
                'Low temperature (0.2) keeps answers grounded in the document.',
                'Matte black + green Xbox-style UI.'
            ]
        },
        {
            id: 'soulflow', name: 'SoulFlow', kicker: 'real-time computer vision', cat: ['ai', 'systems'],
            repo: 'https://github.com/ronaksarda/SoulFlow', viz: 'trail',
            hook: 'Draw neon in the air. The UI changes color with your mood.',
            desc: 'Hand tracking, gesture drawing and facial emotion classification at 45-60 FPS.',
            tags: ['Python', 'OpenCV', 'MediaPipe', 'ONNX Runtime'],
            points: [
                'MediaPipe hand tracking with OneEuro filtering, so strokes feel like ink with no jitter.',
                'Quantized ONNX model classifies facial emotion and recolors the whole HUD.',
                'Split inference and rendering into separate processes: 25-30 FPS became 45-60 FPS.'
            ]
        },
        {
            id: 'vault', name: 'Vault', kicker: 'filesystem file locker', cat: ['systems'], wide: true,
            repo: 'https://github.com/ronaksarda/Vault', viz: 'vault',
            hook: 'Lock whole folders with one password. Pure C, zero dependencies.',
            desc: 'Interactive CLI that groups files into encrypted vaults and treats the filesystem as the source of truth.',
            tags: ['C', 'Systems programming', 'File I/O', 'gcc'],
            points: [
                'Create, open, merge and delete vaults. Lock or unlock every file in one go.',
                'XOR stream cipher derived from the vault password.',
                'Metadata mirrors the real filesystem, so no ghost files and no corrupt state.'
            ]
        }
    ],

    hangar: [
        { name: 'Pink Verse', desc: 'Cross-platform desktop app in C++ and SFML.', tags: 'C++ · SFML', progress: 45 },
        { name: 'Low-Key Connect', desc: 'Connect through LinkedIn and GitHub, but way more fun.', tags: 'full-stack', progress: 30, repo: 'https://github.com/ronaksarda/Low-Key-Connect' }
    ],

    lab: [
        { name: 'AutoSort', note: 'C++ DLL scanner + Python file organiser', repo: 'https://github.com/ronaksarda/AutoSort' },
        { name: 'PotatoLang', note: 'toy language + web playground', repo: 'https://github.com/ronaksarda/potatoLang' },
        { name: 'Vector Canvas', note: 'realtime collab whiteboard, Socket.IO', repo: 'https://github.com/ronaksarda/vector-canvas' },
        { name: 'Pet Math Academy', note: 'K-5 math game with 3D pets', repo: 'https://github.com/ronaksarda/pet-learn-math' },
        { name: 'Time-Locked Files', note: 'C CLI, lock files until a date', repo: 'https://github.com/ronaksarda/time-locked-files' },
        { name: 'Color Detection', note: 'OpenCV, 865 named colors', repo: 'https://github.com/ronaksarda/ColorDetection_OpenCV' }
    ],

    trophies: [
        { big: '#329', title: 'HackerRank Orchestrate', text: 'Ranked #329 of 1,773 globally for an AI agent (June 2026).', cert: 'hackerrank' },
        { big: 'Top 7', title: 'CBIT COSC HackWeek', text: 'Top 7 of 800+ participants.' },
        { big: 'Top 10', title: 'AB Talks ViCoDathon 2026', text: "India's AI vibe-coding hackathon.", cert: 'abtalks' },
        { big: 'Top 500', title: "ECSoC '26", text: 'Top 500 of 13,000+ in Elite Coders Summer of Code.', cert: 'ecsoc-appreciation' },
        { big: 'R2', title: 'Citadel Securities', text: 'Reached the 2nd interview round (DSA) as a first-year.' },
        { big: 'R2', title: 'Adobe University Hackathon', text: 'Qualified for Round 2.' },
        { big: 'R2', title: 'COOL Reverse Hackathon', text: 'Qualified for Round 2.', cert: 'reverse-hackathon' },
        { big: '2026', title: 'Google Solution Challenge', text: 'Build with AI prototype submission (Hack2Skill).', cert: 'solution-challenge' },
        { big: 'OSS', title: '7Blocks · Kepler', text: 'Contribution certificate for the open-source Kepler platform.', cert: '7B' },
        { big: '34', title: 'Google Cloud Facilitator', text: '2026 facilitator · 34 Google Cloud skill badges.' },
        { big: '3007', title: 'TS EAPCET 2025', text: 'State rank 3007.' }
    ],

    certs: [
        { id: 'hackerrank', title: 'HackerRank Orchestrate · #329', by: 'HackerRank · Jun 2026' },
        { id: 'microsoft-learn', title: 'Applied Skills: Agents in Microsoft Foundry', by: 'Microsoft · Jun 2026' },
        { id: 'ecsoc-appreciation', title: "ECSoC '26 · Top 500", by: 'Elite Coders · 2026' },
        { id: '7B', title: 'Open-source contribution · Kepler', by: '7Blocks · Sep 2026' },
        { id: 'reverse-hackathon', title: 'Reverse Hackathon · Round 2', by: 'COOL · 2026' },
        { id: 'abtalks', title: 'ViCoDathon 2026', by: 'AB Talks · Aug 2026' },
        { id: 'solution-challenge', title: 'Solution Challenge 2026', by: 'Google for Developers × H2S' },
        { id: 'bootcamp-hyd', title: 'Build with AI Bootcamp, Hyderabad', by: 'Google for Developers · Jul 2026' },
        { id: 'agents-course', title: 'Fundamentals of Agents', by: 'Hugging Face · Jul 2026' },
        { id: 'gemini', title: 'Gemini Certified Student', by: 'Google for Education' },
        { id: 'kaggle-python', title: 'Python', by: 'Kaggle · Jun 2026' },
        { id: 'git-github-merit', title: 'Git & GitHub · Certificate of Merit', by: 'COSC CBIT · Apr 2026' }
    ],

    stack: [
        ['TypeScript', 'JavaScript', 'C++', 'C', 'Python', 'SQL', 'HTML', 'CSS', 'C++17', 'Bash'],
        ['RAG pipelines', 'Sentence-Transformers', 'Hugging Face', 'Llama 3.1', 'Groq / Qwen Vision', 'Gemini', 'Ollama', 'MCP', 'AI agents'],
        ['React', 'Node.js', 'Express', 'FastAPI', 'Flask', 'PostgreSQL', 'Supabase', 'Firebase', 'GitHub OAuth', 'Socket.IO'],
        ['OpenCV', 'MediaPipe', 'ONNX Runtime', 'Tesseract OCR', 'NumPy', 'Pandas', 'Git', 'Linux', 'GCC']
    ],

    roles: ['AI agents', 'C++ layout engines', 'offline ML pipelines', 'vision-LLM systems', 'RAG pipelines']
};
