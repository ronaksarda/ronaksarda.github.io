// All site content lives here. Every chat answer is built from this file, so edit it to change what the site says.
window.SITE = {
    discord: 'samronnie_05',
    email: 'rockysarda18@gmail.com',
    phone: '+91 93904 17137',
    resume: 'assets/resume/Ronak_Sarda_Resume.pdf',

    links: [
        { k: 'GitHub', v: '@ronaksarda', href: 'https://github.com/ronaksarda' },
        { k: 'LinkedIn', v: '/in/ronak-sarda05', href: 'https://www.linkedin.com/in/ronak-sarda05/' },
        { k: 'LeetCode', v: 'ronnie0524', href: 'https://leetcode.com/u/ronnie0524/' },
        { k: 'HackerRank', v: 'ronnie0524', href: 'https://www.hackerrank.com/profile/ronnie0524' }
    ],

    facts: [
        { big: '8.68', label: 'CGPA, first year' },
        { big: '334+', label: 'LeetCode problems' },
        { big: '13+', label: 'certificates' },
        { big: '34', label: 'Google Cloud badges' }
    ],

    journey: [
        {
            when: 'Sep 2026 to now', title: 'Founding AI Engineering Intern', org: 'FschoolAI', where: 'San Francisco, CA · remote', current: true,
            points: [
                'Lead MVP delivery for an AI study platform, setting priorities for a team of 8 while building its tutor, rooms and courses in TypeScript and React.',
                'Built the tutor reply path: streaming, model-tier routing and failover across providers, so one provider outage no longer breaks a session.',
                'Built study rooms with a live whiteboard the AI draws and writes on, with one validation layer for every AI board action across typed, streamed and voice input.',
                'Shipped a Course Maker that turns a Canvas syllabus into a full course, and an onboarding interview saved to student memory.'
            ]
        },
        {
            when: '2026', title: 'Technical Member', org: 'HICON & AWS Club, CBIT · GDG Hyderabad',
            points: [
                'Coordinator, SIH internal hackathon with HICON. Curated problem statements and hosted ceremonies for 400+ teams, 2,100+ students.',
                'Organizer, HackIndia Spark11: 36-hour hackathon, 2,500+ participants, 550 teams.',
                'Member, GDG Hyderabad. Google Cloud Facilitator 2026 with 34 Google Cloud skill badges.'
            ]
        },
        {
            when: 'Aug 2025 to May 2029', title: 'B.E. Information Technology', org: 'CBIT, Hyderabad', where: 'CGPA 8.68 / 10 (first year) · TS EAPCET 2025 rank 3007',
            points: ['CS50x (Harvard, via edX) · HackerRank Gold in C & C++ · 334+ LeetCode problems.']
        }
    ],

    projects: [
        {
            id: 'couch', tone: 'brick', name: 'Mr. Couch', kicker: 'desktop AI agent with a personality', cat: ['ai', 'systems'],
            repo: 'https://github.com/ronaksarda/couch', img: 'https://raw.githubusercontent.com/ronaksarda/couch/main/screenshots/00-cover.png',
            video: '06nU40L9qhY',
            hook: 'A lazy, slightly rude roommate in the corner of your screen. He does your chores anyway.',
            desc: 'Voice or text agent for Windows. Gemma 4 plans each request; a checklist in code decides what it may actually do.',
            tags: ['TypeScript', 'Electron', 'Gemma 4', 'Mastra', 'ElevenLabs'],
            points: [
                'Opens files, plays YouTube, reads the screen, sets reminders, takes notes and drives lights, plugs and AC.',
                'Every plan passes a tiered policy in code: read-only runs, changes need a tap on Yes, deleting or paying does not exist.',
                'The model never sees real file paths or device addresses. File names and web pages are data, never instructions.',
                'Hand-drawn in code with no image files. Insult him twice and the couch is closed until you say sorry.'
            ]
        },
        {
            id: 'ideator', tone: 'moss', name: 'Ideator', kicker: 'startup idea vs. the real market', cat: ['ai', 'web'],
            repo: 'https://github.com/ronaksarda/ideator', viz: 'graph',
            video: 'BAruAQ9rAyY',
            hook: 'Pitch an idea. An agent walks a knowledge graph of real competitors to find the gap.',
            desc: 'Live searches feed a FalkorDB graph. A Gemma agent works through it with MCP tools and saves its decision, linked to the evidence behind it.',
            tags: ['Python', 'FalkorDB', 'MCP', 'Gemma', 'SerpApi'],
            demo: ['Example idea in: "an app that splits grocery bills"', 'Search: Google results, Google Play apps and prices, Reddit complaints, in parallel', 'Graph: companies, prices, features and complaints written with MERGE, similar features linked SIMILAR_TO', 'Agent loop: lists graph tools over MCP, picks one per step, reads the result, repeats', 'record_decision: writes a Decision node linked to its evidence', '=Opening found, with every claim traceable to the graph'],
            points: [
                'Three live searches at once: competitors, Google Play names, ratings and prices, and Reddit complaints.',
                'Everything lands in a FalkorDB graph, one per user session, using parameterized MERGE queries.',
                'The agent picks one MCP graph tool per step and streams its reasoning to the UI in plain words.',
                'The final decision is stored in the graph, linked to the evidence behind it.'
            ]
        },
        {
            id: 'gitspace', tone: 'night', name: 'GitSpace', kicker: 'developer universe', cat: ['web', 'systems'], wide: true, live: 'https://gitspace.me',
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
            id: 'ranker', tone: 'moss', name: 'Candidate Ranker', kicker: 'offline AI hiring pipeline', cat: ['ai'],
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
            id: 'alreadybuilt', tone: 'plum', name: 'Already Built?', kicker: 'competitor research for ideas', cat: ['ai', 'web'],
            repo: 'https://github.com/ronaksarda/already-built', viz: 'quadrant',
            hook: 'Describe your idea, find out who already built it, and where the gap is.',
            desc: 'Searches GitHub, Hugging Face and Hacker News, ranks results with local embeddings, and maps competitors onto a 2D market quadrant.',
            tags: ['Python', 'Embeddings', 'Gemma', 'Hugging Face'],
            demo: ['Type or speak the product idea', 'Search GitHub, Hugging Face Spaces and Models, and Show HN', 'Rank candidates locally with open-weight embeddings', 'Place every competitor on a 2D market quadrant', '=Grounded breakdown of what exists and which gaps are left open'],
            points: [
                'Seven-stage pipeline from idea to a grounded competitive breakdown.',
                'Local semantic vector ranking, no hosted embedding API.',
                'Offline demo mode with a recorded result for instant playback.',
                'Packaged as a reusable agent skill.'
            ]
        },
        {
            id: 'labelsure', tone: 'brick', name: 'LabelSure AI', kicker: 'legal metrology compliance', cat: ['ai', 'web'], team: true,
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
            id: 'grantanchor', tone: 'ink', name: 'GrantAnchor', kicker: 'grant compliance with memory', cat: ['ai', 'web'], team: true,
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
            id: 'rideradar', tone: 'brick', name: 'Ride Radar', kicker: 'transit risk for cabs and autos', cat: ['web', 'systems'],
            repo: 'https://github.com/ronaksarda/ride-radar', viz: 'map',
            hook: 'One tap: Green, Amber or Red for where you are and what hour it is.',
            desc: 'Mobile web app for women in Hyderabad. It scores a location, a whole route, and works over SMS with no data. It never claims an area is "safe".',
            tags: ['Python', 'OSRM', 'Service worker', 'SMS fallback'],
            demo: ['Tap once: read location and current hour', 'Count reported incidents within 1 km for that hour', 'Rate it Green, Amber or Red, with links to the news reports', 'Route mode: query road geometry from OSRM, score every 500 m', 'No data? SMS parser replies in under 160 characters', '=Green means "no reported incidents nearby", never "safe"'],
            points: [
                'One-tap rating from incident density within 1 km, with a 24-hour risk strip and a lower-risk spot finder.',
                'Route scoring through OSRM geometry, evaluated every 500 m and adjusted for elapsed travel time.',
                'Offline service worker, SMS fallback, and a hold-to-record SOS mode with duress protection.',
                'Authority dashboard for municipal monitoring.'
            ]
        },
        {
            id: 'janitor', tone: 'ink', name: 'Downloads Janitor', kicker: 'reversible file sorter', cat: ['systems'],
            repo: 'https://github.com/ronaksarda/document-janitor', viz: 'robot', img: 'assets/projects/janitor.jpg',
            hook: 'A clay robot sorts your messy Downloads folder in front of you.',
            desc: 'Non-destructive and deterministic. Every move goes in an append-only journal and can be undone byte for byte.',
            tags: ['Python', 'SVG animation', 'File I/O'],
            demo: ['Scan the folder, classify each file by rules in config.yaml', 'Robot picks a file chip off the pile', 'Carries it across the floor to the right bin', 'Duplicate? Pauses with an antenna wiggle and parks it', 'Active or fresh download? Taps a WAIT sign and skips it', '=Every move journaled, 100% reversible'],
            points: [
                'Animated SVG robot rig: pick up, carry, put in, skip and wait, so the animation is the explanation.',
                'Append-only journal.json makes every move reversible byte for byte.',
                'Dry-run mode previews the plan with a dotted path.',
                'Skips files still downloading or saved in the last 10 minutes.'
            ]
        },
        {
            id: 'reader', tone: 'plum', name: 'Screen Reader Agent', kicker: 'local AI voice layer', cat: ['ai'], wip: true,
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
            id: 'soulflow', tone: 'night', name: 'SoulFlow', kicker: 'real-time computer vision', cat: ['ai', 'systems'],
            repo: 'https://github.com/ronaksarda/SoulFlow', viz: 'trail',
            hook: 'Draw neon in the air. The UI changes color with your mood.',
            desc: 'Hand tracking, gesture drawing and facial emotion classification at 45-60 FPS.',
            tags: ['Python', 'OpenCV', 'MediaPipe', 'ONNX Runtime'],
            points: [
                'MediaPipe hand tracking with OneEuro filtering, so strokes feel like ink with no jitter.',
                'Quantized ONNX model classifies facial emotion and recolors the whole HUD.',
                'Split inference and rendering into separate processes: 25-30 FPS became 45-60 FPS.'
            ]
        }
    ],

    hangar: [
        { name: 'Star', desc: 'An AI agent on your watch. Think Baymax, but on your wrist.', tags: 'AI agent · wearable', progress: 15 },
        { name: 'Pink Verse', desc: 'Cross-platform desktop app in C++ and SFML.', tags: 'C++ · SFML', progress: 45 },
        { name: 'Low-Key Connect', desc: 'Connect through LinkedIn and GitHub, but way more fun.', tags: 'full-stack', progress: 30, repo: 'https://github.com/ronaksarda/Low-Key-Connect' }
    ],

    lab: [
        { name: 'Vault', note: 'C CLI, lock whole folders with one password', repo: 'https://github.com/ronaksarda/Vault' },
        { name: 'doc_ask', note: 'local RAG over PDF, DOCX and TXT on Ollama', repo: 'https://github.com/ronaksarda/doc-ask' },
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
        { big: '#138', title: "ECSoC '26", text: 'Ranked 138 of 13,000+ in Elite Coders Summer of Code.', cert: 'ecsoc-appreciation' },
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
        { id: 'ecsoc-appreciation', title: "ECSoC '26 · Rank 138", by: 'Elite Coders · 2026' },
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
        ['Languages', 'TypeScript', 'JavaScript', 'C++', 'C', 'Python', 'SQL', 'HTML', 'CSS', 'C++17', 'Bash'],
        ['AI and ML', 'RAG pipelines', 'Sentence-Transformers', 'Hugging Face', 'Llama 3.1', 'Groq / Qwen Vision', 'Gemini', 'Ollama', 'MCP', 'AI agents'],
        ['Web and backend', 'React', 'Node.js', 'Express', 'FastAPI', 'Flask', 'PostgreSQL', 'Supabase', 'Firebase', 'GitHub OAuth', 'Socket.IO'],
        ['Vision and tooling', 'OpenCV', 'MediaPipe', 'ONNX Runtime', 'Tesseract OCR', 'NumPy', 'Pandas', 'Git', 'Linux', 'GCC']
    ]
};
