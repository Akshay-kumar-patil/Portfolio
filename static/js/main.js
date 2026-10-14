/* ============================================================
   PUBG MOBILE PORTFOLIO CONTROLLER
   Manages: Lobby, Character Bay, Inventory System, Sound Effects,
   Interactive Modals, and In-Browser LeNet-5 CNN Inference Demo
   ============================================================ */

/* ── Tactical Web Audio Synthesizer ────────────────────────── */
const AudioController = {
  ctx: null,
  muted: false,

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  },

  playClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (_) { }
  },

  playTab() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, this.ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.14, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch (_) { }
  },

  playEquip() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(520, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1040, this.ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch (_) { }
  },

  playStart() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [440, 554, 659, 880].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        gain.gain.setValueAtTime(0.12, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.3);
      });
    } catch (_) { }
  }
};

/* ── Interactive 3D Character Drag-to-Rotate ─────────────── */
function setupCharacterRotator(elementId) {
  const rotator = document.getElementById(elementId);
  if (!rotator) return;

  let isDragging = false;
  let startX = 0;
  let currentRotation = 0;
  let targetRotation = 0;
  let velocity = 0;

  function onPointerDown(e) {
    isDragging = true;
    startX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    velocity = 0;
    rotator.style.transition = "none";
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const deltaX = clientX - startX;
    startX = clientX;
    velocity = deltaX * 0.65;
    targetRotation += velocity;
  }

  function onPointerUp() {
    isDragging = false;
  }

  rotator.addEventListener("mousedown", onPointerDown);
  rotator.addEventListener("touchstart", onPointerDown, { passive: true });
  window.addEventListener("mousemove", onPointerMove);
  window.addEventListener("touchmove", onPointerMove, { passive: true });
  window.addEventListener("mouseup", onPointerUp);
  window.addEventListener("touchend", onPointerUp);

  function animate() {
    if (!isDragging && Math.abs(velocity) > 0.01) {
      velocity *= 0.92;
      targetRotation += velocity;
    }
    currentRotation += (targetRotation - currentRotation) * 0.2;
    rotator.style.transform = `rotateY(${currentRotation}deg)`;
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

/* ── Main Application Bootstrapping ──────────────────────── */
async function boot() {
  let data = null;
  try {
    const response = await fetch("/static/profile.json", { cache: "no-store" });
    if (response.ok) {
      data = await response.json();
    }
  } catch (err) {
    console.warn("Failed fetching profile.json, falling back to static cache", err);
  }

  // Populate Top HUD data
  if (data) {
    const hudName = document.getElementById("hud-player-name");
    if (hudName && data.name) hudName.textContent = data.name.toUpperCase();

    const hudRole = document.getElementById("hud-player-role");
    if (hudRole && data.title) hudRole.textContent = data.title.toUpperCase();

    const chatMsg = document.getElementById("lobby-chat-msg");
    if (chatMsg && data.hero?.bio) chatMsg.textContent = data.hero.bio;

    if (Array.isArray(data.metrics)) {
      data.metrics.forEach(m => {
        if (m.label.toLowerCase().includes("project")) {
          const el = document.getElementById("hud-res-projects");
          if (el) el.textContent = m.value;
        } else if (m.label.toLowerCase().includes("deploy")) {
          const el = document.getElementById("hud-res-deploys");
          if (el) el.textContent = m.value;
        } else if (m.label.toLowerCase().includes("achieve")) {
          const el = document.getElementById("hud-res-wins");
          if (el) el.textContent = m.value;
        }
      });
    }

    if (Array.isArray(data.education) && data.education[0]?.metric) {
      const cgpa = data.education[0].metric.replace(/[^0-9.]/g, "");
      const el = document.getElementById("hud-res-cgpa");
      if (el && cgpa) el.textContent = cgpa;
    }
  }

  // Initialize Character Rotators
  setupCharacterRotator("soldier-rotator-lobby");
  setupCharacterRotator("soldier-rotator-inv");

  // Screen Switching
  const screenLobby = document.getElementById("screen-lobby");
  const screenInventory = document.getElementById("screen-inventory");

  function showLobby() {
    AudioController.playClick();
    if (screenInventory) screenInventory.classList.remove("active");
    if (screenLobby) screenLobby.classList.add("active");
  }

  function showInventory(targetCategory = null) {
    if (screenLobby) screenLobby.classList.remove("active");
    if (screenInventory) screenInventory.classList.add("active");
    if (targetCategory) {
      switchCategory(targetCategory);
    }
  }

  // Lobby Nav buttons
  document.getElementById("nav-btn-inventory")?.addEventListener("click", () => {
    AudioController.playEquip();
    showInventory("weapons");
  });

  document.getElementById("start-inventory-btn")?.addEventListener("click", () => {
    AudioController.playStart();
    setTimeout(() => showInventory("weapons"), 180);
  });

  document.getElementById("inv-back-lobby-btn")?.addEventListener("click", showLobby);

  // Audio Toggle
  const sfxBtn = document.getElementById("sfx-toggle-btn");
  const sfxIcon = document.getElementById("sfx-icon");
  sfxBtn?.addEventListener("click", () => {
    AudioController.muted = !AudioController.muted;
    if (sfxIcon) sfxIcon.textContent = AudioController.muted ? "🔇" : "🔊";
  });

  // Modal Handlers
  const labModal = document.getElementById("lab-modal");
  const resumeModal = document.getElementById("resume-modal");
  const careerModal = document.getElementById("career-modal");
  const commsModal = document.getElementById("comms-modal");
  initNeuralFabric();

  function openModal(modal) {
    AudioController.playClick();
    modal?.classList.add("active");
    modal?.setAttribute("aria-hidden", "false");
    if (modal === labModal) {
      setTimeout(() => window.dispatchEvent(new Event("resize")), 120);
    }
  }

  function closeModal(modal) {
    AudioController.playClick();
    modal?.classList.remove("active");
    modal?.setAttribute("aria-hidden", "true");
  }

  document.getElementById("nav-btn-lab")?.addEventListener("click", () => openModal(labModal));
  document.getElementById("close-lab-btn")?.addEventListener("click", () => closeModal(labModal));
  document.getElementById("lab-backdrop")?.addEventListener("click", () => closeModal(labModal));

  document.getElementById("nav-btn-resume")?.addEventListener("click", () => openModal(resumeModal));
  document.getElementById("close-resume-btn")?.addEventListener("click", () => closeModal(resumeModal));
  document.getElementById("resume-backdrop")?.addEventListener("click", () => closeModal(resumeModal));

  document.getElementById("nav-btn-career")?.addEventListener("click", () => {
    renderCareerModal(data);
    openModal(careerModal);
  });
  document.getElementById("close-career-btn")?.addEventListener("click", () => closeModal(careerModal));
  document.getElementById("career-backdrop")?.addEventListener("click", () => closeModal(careerModal));

  document.getElementById("nav-btn-contact")?.addEventListener("click", () => openModal(commsModal));
  document.getElementById("squad-comms-btn")?.addEventListener("click", () => openModal(commsModal));
  document.getElementById("close-comms-btn")?.addEventListener("click", () => closeModal(commsModal));
  document.getElementById("comms-backdrop")?.addEventListener("click", () => closeModal(commsModal));

  // Keyboard Shortcuts (ESC, I, M)
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (labModal?.classList.contains("active")) closeModal(labModal);
      else if (resumeModal?.classList.contains("active")) closeModal(resumeModal);
      else if (careerModal?.classList.contains("active")) closeModal(careerModal);
      else if (commsModal?.classList.contains("active")) closeModal(commsModal);
      else if (screenInventory?.classList.contains("active")) showLobby();
    } else if (e.key === "i" || e.key === "I") {
      if (!isDrawingActive()) {
        if (screenInventory?.classList.contains("active")) showLobby();
        else showInventory();
      }
    } else if (e.key === "m" || e.key === "M") {
      if (!isDrawingActive()) {
        if (labModal?.classList.contains("active")) closeModal(labModal);
        else openModal(labModal);
      }
    }
  });

  function isDrawingActive() {
    return document.activeElement && (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA");
  }

  // ═══════════════════════════════════════════════════════════
  // INVENTORY CATEGORY & ITEMS LOGIC
  // ═══════════════════════════════════════════════════════════
  const categoryTabs = document.querySelectorAll(".cat-tab");
  const itemGrid = document.getElementById("pubg-item-grid");
  const catTitleEl = document.getElementById("cat-banner-title");
  const catCountEl = document.getElementById("cat-banner-count");

  // Detail drawer elements
  const detailRarityBadge = document.getElementById("details-rarity-pill");
  const detailCatTag = document.getElementById("details-category-tag");
  const detailTitle = document.getElementById("details-item-title");
  const detailTagline = document.getElementById("details-item-tagline");
  const detailDesc = document.getElementById("details-description");
  const detailPoints = document.getElementById("details-specs-list");
  const detailTechChips = document.getElementById("details-tech-grid");
  const detailRepoBtn = document.getElementById("details-repo-btn");
  const detailSecondaryBtn = document.getElementById("details-secondary-btn");
  const detailPreviewIcon = document.getElementById("details-preview-icon");
  const detailEquipped = document.getElementById("details-equipped-indicator");
  const detailEquipBtn = document.getElementById("details-equip-btn");

  let currentCategory = "weapons";
  let activeItemsList = [];

  // Generate Inventory Items from portfolio data
  function buildCategoryItems(catKey) {
    if (!data) return [];

    switch (catKey) {
      case "weapons": // Projects
        return [
          {
            id: "healix",
            name: "HEALIX",
            sub: "RAG Orchestrator",
            rarity: "mythic",
            icon: "🔥",
            tag: "LEVEL 3 RAG",
            category: "AI/ML · RAG SYSTEMS",
            tagline: "Self-healing RAG pipeline with automated query re-write.",
            desc: "A production-grade Retrieval-Augmented Generation system that detects query failures, automatically re-writes searches, and validates answers to eliminate hallucinations.",
            details: [
              "Self-healing fallback mechanism that retries retrieval with rewritten embeddings.",
              "Strict answer hallucination checker with cross-encoder validation.",
              "End-to-end Python microservice with sub-250ms latency."
            ],
            tech: ["Python", "LangChain", "FastAPI", "ChromaDB", "Groq", "LLMs"],
            repo: "https://github.com/Akshay-kumar-patil/healix",
            actions: [
              { label: "VIEW REPOSITORY", url: "https://github.com/Akshay-kumar-patil/healix", primary: true },
              { label: "📁 GITHUB REPO", url: "https://github.com/Akshay-kumar-patil/healix" }
            ]
          },
          {
            id: "articulate",
            name: "ARTICULATE.AI",
            sub: "Mock Interview Bot",
            rarity: "mythic",
            icon: "🎙️",
            tag: "VOICE AI",
            category: "AI/ML · VOICE INTERVIEW",
            tagline: "Verbal mock interview prep engine powered by LLMs.",
            desc: "An AI-powered mock interview platform that conducts verbal voice interviews tailored directly to your uploaded resume and target job role.",
            details: [
              "Real-time voice-to-voice interaction via Whisper & gTTS.",
              "Dynamic question generation based on candidate resume strengths and weaknesses.",
              "Automated scoring rubric measuring technical depth, clarity, and pacing."
            ],
            tech: ["Python", "FastAPI", "Whisper", "gTTS", "Gemini API", "WebSockets"],
            repo: "https://github.com/Akshay-kumar-patil/Articulate.AI",
            actions: [
              { label: "VIEW REPOSITORY", url: "https://github.com/Akshay-kumar-patil/Articulate.AI", primary: true },
              { label: "📁 GITHUB REPO", url: "https://github.com/Akshay-kumar-patil/Articulate.AI" }
            ]
          },
          {
            id: "careerpilot",
            name: "CAREERPILOT",
            sub: "Career OS",
            rarity: "legendary",
            icon: "🎯",
            tag: "AI TOOL",
            category: "AI/ML · CAREER TECH",
            tagline: "Comprehensive career planning & ATS optimization system.",
            desc: "Helps job seekers build stronger application materials, evaluate job fit with automated semantic scoring, and track applications.",
            details: [
              "Automated resume vs. job description semantic alignment engine.",
              "Referral tracking and interview timeline tracker.",
              "Outcome analytics and actionable improvement suggestions."
            ],
            tech: ["Python", "Streamlit", "Scikit-Learn", "FastAPI", "Pandas"],
            repo: "https://github.com/Akshay-kumar-patil/CareerPilot",
            actions: [
              { label: "VIEW REPOSITORY", url: "https://github.com/Akshay-kumar-patil/CareerPilot", primary: true },
              { label: "📁 GITHUB REPO", url: "https://github.com/Akshay-kumar-patil/CareerPilot" }
            ]
          },
          {
            id: "spendly",
            name: "SPENDLY.AI",
            sub: "Voice Expense Tracker",
            rarity: "epic",
            icon: "💳",
            tag: "MULTIMODAL",
            category: "AI/ML · FINTECH OCR",
            tagline: "Voice & receipt multimodal expense intelligence.",
            desc: "Extracts and categorizes financial expenditures seamlessly from voice dictation and camera snapshots of physical paper receipts.",
            details: [
              "Multimodal receipt OCR and semantic extraction via Gemini Vision.",
              "Voice input parser for conversational quick logging.",
              "Interactive monthly burn-rate analytics."
            ],
            tech: ["Python", "Gemini API", "Streamlit", "OCR", "Pillow"],
            repo: "https://github.com/Akshay-kumar-patil/SpendlyAI",
            actions: [
              { label: "VIEW REPOSITORY", url: "https://github.com/Akshay-kumar-patil/SpendlyAI", primary: true },
              { label: "📁 GITHUB REPO", url: "https://github.com/Akshay-kumar-patil/SpendlyAI" }
            ]
          },
          {
            id: "doodling",
            name: "DOODLING",
            sub: "Multiplayer Web Game",
            rarity: "epic",
            icon: "🎨",
            tag: "REAL-TIME",
            category: "WEB DEV · MULTIPLAYER GAME",
            tagline: "Fast-paced multiplayer drawing & guessing game.",
            desc: "Real-time canvas drawing and live guessing room built on FastAPI WebSockets and in-browser WebRTC signaling.",
            details: [
              "Low-latency canvas stroke broadcasting over WebSockets.",
              "Automated word bank and fuzzy chat answer matching.",
              "Built-in voice room channels using WebRTC."
            ],
            tech: ["FastAPI", "WebSockets", "WebRTC", "Vanilla JS", "Canvas API"],
            repo: "https://github.com/Akshay-kumar-patil/Doodling",
            actions: [
              { label: "VIEW REPOSITORY", url: "https://github.com/Akshay-kumar-patil/Doodling", primary: true },
              { label: "📁 GITHUB REPO", url: "https://github.com/Akshay-kumar-patil/Doodling" }
            ]
          },
          {
            id: "weather",
            name: "WEATHER MODEL",
            sub: "Rain Prediction ML",
            rarity: "epic",
            icon: "⛅",
            tag: "99.8% ACC",
            category: "MACHINE LEARNING · PREDICTION",
            tagline: "High-accuracy rainfall classification model.",
            desc: "Predicts the probability of localized rainfall using historic meteorological telemetry and an optimized Random Forest ensemble.",
            details: [
              "99.8% test accuracy via scikit-learn RandomForestClassifier.",
              "Comprehensive feature engineering and hyperparameter tuning.",
              "Clean interactive Streamlit demonstration dashboard."
            ],
            tech: ["Python", "Scikit-Learn", "Streamlit", "Pandas", "Matplotlib"],
            repo: "https://github.com/Akshay-kumar-patil/weather_forecasting_ml_model",
            actions: [
              { label: "VIEW REPOSITORY", url: "https://github.com/Akshay-kumar-patil/weather_forecasting_ml_model", primary: true },
              { label: "📁 GITHUB REPO", url: "https://github.com/Akshay-kumar-patil/weather_forecasting_ml_model" }
            ]
          },
          {
            id: "rps",
            name: "ROCK PAPER C++",
            sub: "Origin Project",
            rarity: "rare",
            icon: "⚡",
            tag: "C++ CORE",
            category: "CORE DEV · C++ FOUNDATION",
            tagline: "First foundational software project written in C++.",
            desc: "Special mention project representing the very beginning of Akshay's programming journey, written in raw C++.",
            details: [
              "Custom game state machine with algorithmic computer opponent.",
              "Memory-safe design and foundational programming patterns.",
              "Kept as a milestone marking the starting point of the developer's journey."
            ],
            tech: ["C++", "STL", "OOP", "Data Structures"],
            repo: "https://github.com/Akshay-kumar-patil/R-P-S",
            actions: [
              { label: "VIEW REPOSITORY", url: "https://github.com/Akshay-kumar-patil/R-P-S", primary: true },
              { label: "📁 GITHUB REPO", url: "https://github.com/Akshay-kumar-patil/R-P-S" }
            ]
          }
        ];

      case "headgear": // Education
        return (data.education || []).map((ed, idx) => ({
          id: `edu-${idx}`,
          name: ed.degree.split(" ")[0].toUpperCase() + " // " + (idx === 0 ? "B.TECH" : idx === 1 ? "12TH PCM" : "10TH"),
          sub: ed.institution,
          rarity: idx === 0 ? "legendary" : "epic",
          icon: idx === 0 ? "🎓" : "🏫",
          tag: ed.duration,
          tagline: ed.degree,
          desc: `${ed.institution} (${ed.duration}). Academic Performance: ${ed.metric}.`,
          details: [
            `Institution: ${ed.institution}`,
            `Timeline: ${ed.duration}`,
            `Verified Metric: ${ed.metric}`
          ],
          tech: ["Artificial Intelligence", "Machine Learning", "Data Structures", "Algorithms", "Mathematics"],
          actions: [
            { label: "📜 SERVICE RECORD", callback: () => openModal(careerModal), primary: true }
          ]
        }));

      case "gear": // Technical Skills
        const skillsObj = data.skills || {};
        return Object.entries(skillsObj).map(([grp, items], idx) => {
          const rarity = idx < 2 ? "mythic" : idx < 4 ? "legendary" : "epic";
          const icon = grp.includes("Lang") ? "💻" : grp.includes("Framework") ? "⚡" : grp.includes("Data") ? "🗄️" : "🛠️";
          return {
            id: `skill-${idx}`,
            name: grp.toUpperCase(),
            sub: `${items.length} Tech Assets`,
            rarity: rarity,
            icon: icon,
            tag: `TIER ${idx + 1}`,
            tagline: `${grp} Mastery & Applied Experience`,
            desc: `Production expertise in ${items.slice(0, 4).join(", ")} and related tooling.`,
            details: items.map(item => `Equipped: ${item}`),
            tech: items,
            actions: [
              { label: "⚡ INSPECT SKILLS", callback: () => switchCategory("weapons"), primary: true }
            ]
          };
        });

      case "collections": // Achievements
        return (data.achievements || []).map((ach, idx) => ({
          id: `ach-${idx}`,
          name: ach.split(" ")[0].toUpperCase() + " // AWARD",
          sub: ach.split("-")[0].trim(),
          rarity: idx < 2 ? "legendary" : "epic",
          icon: "🏆",
          tag: "WINNER",
          tagline: "Verified Distinction & Achievement",
          desc: ach,
          details: [
            `Award Record: ${ach}`,
            "Validated competitive coding & engineering milestone."
          ],
          tech: ["Competitive Programming", "DSA", "Problem Solving", "Cisco Certified"],
          actions: [
            { label: "🏆 VIEW HONORS", callback: () => openModal(careerModal), primary: true }
          ]
        }));

      case "outfit": // About Me
        return [
          {
            id: "dossier",
            name: "OPERATOR DOSSIER",
            sub: "Akshay Kumar Patil",
            rarity: "legendary",
            icon: "🎖️",
            tag: "LEVEL 75",
            tagline: "AI/ML Developer & RAG Architecture Specialist",
            desc: data.hero?.bio || data.hero?.headline,
            details: data.summary_points || [
              "Hands-on experience in Machine Learning, Deep Learning, and LLM-based systems.",
              "Comfortable building robust RAG workflows and multimodal automation.",
              "Focused on practical AI applications with real-world impact."
            ],
            tech: ["Jabalpur, MP", "B.Tech AI & ML 2023-27", "Open to Opportunities"],
            actions: [
              { label: "📦 OPEN RESUME", callback: () => openModal(resumeModal), primary: true },
              { label: "📡 DISPATCH COMMS", callback: () => openModal(commsModal) }
            ]
          },
          {
            id: "radar",
            name: "8D RADAR MATRIX",
            sub: "Competency Mapping",
            rarity: "mythic",
            icon: "📊",
            tag: "CORE METRICS",
            tagline: "Multi-dimensional Technical Competency Distribution",
            desc: "Comprehensive domain mastery across Machine Learning, RAG, Backend Python, C++ DSA, and Distributed Data Stores.",
            details: (data.competency || []).map(c => `${c.label}: ${c.value}% proficiency`),
            tech: ["Python 80%", "AI/ML 84%", "Backend 82%", "DSA in C++ 75%"],
            actions: [
              { label: "🧠 LAUNCH LAB", callback: () => openModal(labModal), primary: true }
            ]
          }
        ];

      case "supply": // Supply Crate & Resume
        return [
          {
            id: "resume-pdf",
            name: "RESUME PDF CRATE",
            sub: "Official Dossier",
            rarity: "legendary",
            icon: "📦",
            tag: "SUPPLY DROP",
            tagline: "Akshay Kumar Patil — Official Resume & Credentials",
            desc: "Detailed technical background, academic records, publications, and production project portfolio formatted for recruitment review.",
            details: [
              "Direct embedded in-browser PDF preview.",
              "One-click high-resolution download option.",
              "Fully up to date with 2026 AI/ML achievements."
            ],
            tech: ["PDF Asset", "173 KB", "Updated 2026"],
            actions: [
              { label: "👁️ VIEW RESUME", callback: () => openModal(resumeModal), primary: true },
              { label: "💾 DOWNLOAD PDF", url: "/static/resume/Akshay_updated_resume_main.pdf" }
            ]
          },
          {
            id: "github-hub",
            name: "GITHUB REPO CRATE",
            sub: "Code Repositories",
            rarity: "epic",
            icon: "🐙",
            tag: "10+ REPOS",
            tagline: "Open Source Codebases & Implementations",
            desc: "Explore public source code, commit history, neural network implementations, and live web apps on GitHub.",
            details: [
              "Active codebases across PyTorch, FastAPI, and Streamlit.",
              "Includes documentation, testing benchmarks, and architecture diagrams."
            ],
            tech: ["GitHub", "Git", "CI/CD", "Open Source"],
            actions: [
              { label: "🚀 OPEN GITHUB", url: data.contact?.github || "https://github.com/Akshay-kumar-patil", primary: true }
            ]
          },
          {
            id: "linkedin-net",
            name: "LINKEDIN DISPATCH",
            sub: "Professional Network",
            rarity: "epic",
            icon: "💼",
            tag: "NETWORK",
            tagline: "Professional Connection & Messaging",
            desc: "Connect directly with Akshay on LinkedIn for AI/ML engineering roles, internships, and collaborative research opportunities.",
            details: [
              "Verified student profile at GGITS.",
              "Direct LinkedIn InMail messaging enabled."
            ],
            tech: ["LinkedIn", "Professional Network"],
            actions: [
              { label: "💼 CONNECT ON LINKEDIN", url: data.contact?.linkedin || "https://linkedin.com/in/akshay-patil-akki12", primary: true }
            ]
          }
        ];

      default:
        return [];
    }
  }

  // Switch Category Tab
  function switchCategory(catKey) {
    if (catKey === "lab") {
      openModal(labModal);
      return;
    }

    AudioController.playTab();
    currentCategory = catKey;

    categoryTabs.forEach(tab => {
      const isMatch = tab.getAttribute("data-cat") === catKey;
      tab.classList.toggle("active", isMatch);
      tab.setAttribute("aria-selected", isMatch ? "true" : "false");
    });

    const bannerTitles = {
      weapons: "WEAPONS // FEATURED PROJECTS",
      headgear: "HEADGEAR // EDUCATION RECORDS",
      gear: "GEAR // TECHNICAL SKILLS",
      collections: "COLLECTIONS // HONORS & CERTIFICATIONS",
      outfit: "OUTFIT // OPERATOR PROFILE",
      supply: "SUPPLY CRATE // RESUME & RESOURCES"
    };

    if (catTitleEl) catTitleEl.textContent = bannerTitles[catKey] || catKey.toUpperCase();

    activeItemsList = buildCategoryItems(catKey);
    if (catCountEl) catCountEl.textContent = `${activeItemsList.length} ITEMS EQUIPPED`;

    renderItemGrid(activeItemsList);
  }

  categoryTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const cat = tab.getAttribute("data-cat");
      switchCategory(cat);
    });
  });

  // Render Grid Items
  function renderItemGrid(items) {
    if (!itemGrid) return;
    itemGrid.innerHTML = "";

    if (items.length === 0) {
      itemGrid.innerHTML = `<p style="grid-column:1/-1; color:var(--pubg-text-dim); padding:20px;">No items equipped in this slot.</p>`;
      return;
    }

    items.forEach((item, idx) => {
      const card = document.createElement("article");
      card.className = `pubg-item-card ${item.rarity || 'common'} ${idx === 0 ? 'selected' : ''}`;
      card.setAttribute("role", "option");
      card.setAttribute("tabindex", "0");
      card.setAttribute("data-id", item.id);

      card.innerHTML = `
        <div class="item-card-top">
          <span class="item-rarity-pill">${item.rarity}</span>
          <span class="item-badge-lvl">${item.tag || 'LVL 1'}</span>
        </div>
        <div class="item-icon-center">${item.icon || '📦'}</div>
        <div class="item-card-footer">
          <span class="item-card-name">${item.name}</span>
          <span class="item-card-sub">${item.sub}</span>
        </div>
      `;

      card.addEventListener("click", () => {
        AudioController.playEquip();
        selectItem(item, card);
      });

      itemGrid.appendChild(card);
    });

    // Select the first item by default
    if (items.length > 0) {
      selectItem(items[0], itemGrid.firstElementChild);
    }
  }

  // Select Item and Populate Detail Drawer
  function selectItem(item, cardEl) {
    document.querySelectorAll(".pubg-item-card").forEach(c => c.classList.remove("selected"));
    cardEl?.classList.add("selected");

    if (detailRarityBadge) {
      detailRarityBadge.textContent = item.rarity?.toUpperCase() || "COMMON";
      detailRarityBadge.className = `details-rarity-pill ${item.rarity || "rare"}`;
    }
    if (detailCatTag) detailCatTag.textContent = item.category || item.tag || currentCategory.toUpperCase();
    if (detailTitle) detailTitle.textContent = item.name;
    if (detailTagline) detailTagline.textContent = item.tagline || item.sub;
    if (detailDesc) detailDesc.textContent = item.desc || "";
    if (detailPreviewIcon) detailPreviewIcon.textContent = item.icon || "📦";
    if (detailEquipped) detailEquipped.classList.toggle("visible", cardEl?.classList.contains("selected"));

    if (detailPoints) {
      detailPoints.innerHTML = (item.details || []).map(pt => `<li>${pt}</li>`).join("");
    }

    if (detailTechChips) {
      detailTechChips.innerHTML = (item.tech || []).map(t => `<span class="details-tech-chip">${t}</span>`).join("");
    }

    const primaryAction = (item.actions || []).find(action => action.primary) || (item.actions || [])[0];
    if (detailRepoBtn) {
      const repoUrl = item.repo || (primaryAction && primaryAction.url);
      detailRepoBtn.href = repoUrl || "#";
      detailRepoBtn.style.display = repoUrl ? "inline-flex" : "none";
    }
    if (detailSecondaryBtn) {
      const secondaryAction = (item.actions || []).find(action => !action.primary && action.url);
      detailSecondaryBtn.href = secondaryAction?.url || "#";
      detailSecondaryBtn.textContent = secondaryAction?.label || "LIVE DEMO ➔";
      detailSecondaryBtn.style.display = secondaryAction?.url ? "inline-flex" : "none";
    }
    if (detailEquipBtn) {
      detailEquipBtn.textContent = primaryAction?.label || "⚡ EQUIP ITEM";
      detailEquipBtn.classList.remove("is-equipped");
      detailEquipBtn.onclick = primaryAction?.callback || null;
    }
  }

  // Initial category render
  switchCategory("weapons");

  // Render Career Modal Timeline
  function renderCareerModal(pData) {
    const container = document.getElementById("career-timeline-content");
    if (!container || !pData) return;
    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:12px;">
        <h4 style="font-family:var(--font-display); font-size:1.2rem; color:var(--pubg-amber);">ACADEMIC DEGREE &amp; INSTITUTIONS</h4>
        ${(pData.education || []).map(ed => `
          <div class="career-card-item">
            <img class="career-img-thumb" src="${ed.image || '/static/img/education-btech.jpg'}" alt="${ed.institution}" />
            <div class="career-item-info">
              <span class="career-item-title">${ed.degree}</span>
              <span class="career-item-inst">${ed.institution}</span>
              <div class="career-item-meta">
                <span>⏱️ ${ed.duration}</span>
                <span>📊 ${ed.metric}</span>
              </div>
            </div>
          </div>
        `).join("")}
        <h4 style="font-family:var(--font-display); font-size:1.2rem; color:var(--pubg-amber); margin-top:14px;">KEY ACHIEVEMENTS</h4>
        <div style="display:flex; flex-direction:column; gap:6px;">
          ${(pData.achievements || []).map(ach => `
            <div style="background:rgba(25,30,36,0.8); border:1px solid var(--pubg-border-dim); padding:8px 12px; font-family:var(--font-mono); font-size:0.75rem; color:var(--pubg-text-cream);">
              🏆 ${ach}
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  // ═══════════════════════════════════════════════════════════
  // PUBG CINEMATIC LOADING CONTROLLER
  // ═══════════════════════════════════════════════════════════
  (function initLoadingScreen() {
    const overlay = document.getElementById("pubg-loading-overlay");
    const pctEl = document.getElementById("pubg-loading-pct");
    const fillEl = document.getElementById("pubg-loading-fill");
    const buggyEl = document.getElementById("pubg-buggy");
    const enterBtn = document.getElementById("enter-button");
    const toast = document.getElementById("winner-toast");

    let start = null;
    const DURATION = 3200;
    const targets = [0, 24, 62, 80, 94, 100];

    function animatePct(ts) {
      if (!start) start = ts;
      const elapsed = ts - start;
      const prog = Math.min(elapsed / DURATION, 1);
      const segments = targets.length - 1;
      const seg = Math.min(Math.floor(prog * segments), segments - 1);
      const segProg = (prog * segments) - seg;
      const val = Math.round(targets[seg] + (targets[seg + 1] - targets[seg]) * segProg);

      if (pctEl) pctEl.textContent = val + "%";
      if (fillEl) fillEl.style.width = val + "%";
      if (buggyEl) {
        buggyEl.style.left = "calc(" + val + "% - " + (val * 0.68) + "px)";
        if (val >= 100) buggyEl.classList.add("parked");
      }

      if (prog < 1) {
        requestAnimationFrame(animatePct);
      } else {
        if (pctEl) pctEl.textContent = "100%";
        if (fillEl) fillEl.style.width = "100%";
        if (buggyEl) {
          buggyEl.style.left = "calc(100% - 68px)";
          buggyEl.classList.add("parked");
        }
      }
    }
    requestAnimationFrame(animatePct);

    function enterLobby() {
      AudioController.playStart();
      if (overlay) {
        overlay.classList.add("hide");
        setTimeout(() => { overlay.style.display = "none"; }, 800);
      }
      setTimeout(() => {
        if (toast) {
          toast.classList.add("show");
          setTimeout(() => toast.classList.remove("show"), 3500);
        }
      }, 2000);
    }

    if (enterBtn) {
      enterBtn.addEventListener("click", enterLobby);
      setTimeout(() => {
        document.addEventListener("keydown", function skip(e) {
          document.removeEventListener("keydown", skip);
          enterLobby();
        }, { once: true });
      }, 3400);
    }
  })();

  // ═══════════════════════════════════════════════════════════
  // HIGH-ACCURACY REAL-TIME CNN INFERENCE ENGINE
  // (LeNet-5 in-browser forward pass + interactive graph)
  // ═══════════════════════════════════════════════════════════
  (function initNeuralActivity() {
    const drawCanvas = document.getElementById("neural-draw-canvas");
    const downCanvas = document.getElementById("neural-downsample-canvas");
    const graphCanvas = document.getElementById("neural-graph-canvas");
    if (!drawCanvas || !downCanvas || !graphCanvas) return;

    const drawCtx = drawCanvas.getContext("2d", { willReadFrequently: true });
    const downCtx = downCanvas.getContext("2d");
    const graphCtx = graphCanvas.getContext("2d");
    const tooltip = document.getElementById("neural-tooltip");
    const predValEl = document.getElementById("neural-pred-val");
    const confBadgeEl = document.getElementById("neural-conf-badge");
    const probListEl = document.getElementById("neural-prob-list");

    let isDrawing = false, hasDrawn = false, lastX = 0, lastY = 0;

    function decodeF32(b64) {
      const bin = atob(b64);
      const u8 = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      return new Float32Array(u8.buffer);
    }

    let W1 = null, B1 = null, W2 = null, B2 = null, W3 = null, B3 = null;
    function loadWeights() {
      if (window.MNIST_MODEL) {
        W1 = decodeF32(window.MNIST_MODEL.W1);
        B1 = decodeF32(window.MNIST_MODEL.B1);
        W2 = decodeF32(window.MNIST_MODEL.W2);
        B2 = decodeF32(window.MNIST_MODEL.B2);
        W3 = decodeF32(window.MNIST_MODEL.W3);
        B3 = decodeF32(window.MNIST_MODEL.B3);
        return true;
      }
      return false;
    }
    loadWeights();

    function forwardCNN(input28) {
      if (!W1) loadWeights();
      if (!W1) {
        return {
          input28,
          c1Mean: new Float32Array(8),
          c2Mean: new Float32Array(16),
          probs: new Float32Array(10).fill(0.1)
        };
      }

      // Pad 28x28 -> 32x32
      const inPad = new Float32Array(32 * 32);
      for (let r = 0; r < 28; r++) {
        const inRow = r * 28;
        const padRow = (r + 2) * 32 + 2;
        for (let c = 0; c < 28; c++) inPad[padRow + c] = input28[inRow + c];
      }

      // Conv1: 8 filters 5x5 + ReLU
      const c1 = new Float32Array(8 * 28 * 28);
      const c1Mean = new Float32Array(8);
      for (let f = 0; f < 8; f++) {
        const wBase = f * 25, bias = B1[f], fOffset = f * 784;
        let sumAct = 0;
        for (let r = 0; r < 28; r++) {
          const outRow = fOffset + r * 28;
          for (let c = 0; c < 28; c++) {
            let sum = bias;
            for (let kr = 0; kr < 5; kr++) {
              const rBase = (r + kr) * 32 + c;
              const kBase = wBase + kr * 5;
              sum += inPad[rBase] * W1[kBase]
                + inPad[rBase + 1] * W1[kBase + 1]
                + inPad[rBase + 2] * W1[kBase + 2]
                + inPad[rBase + 3] * W1[kBase + 3]
                + inPad[rBase + 4] * W1[kBase + 4];
            }
            const val = sum > 0 ? sum : 0;
            c1[outRow + c] = val;
            sumAct += val;
          }
        }
        c1Mean[f] = sumAct / 784;
      }

      // Pool1: 2x2 MaxPool (output 8x14x14)
      const p1 = new Float32Array(8 * 14 * 14);
      for (let f = 0; f < 8; f++) {
        const c1Base = f * 784, p1Base = f * 196;
        for (let r = 0; r < 14; r++) {
          const r2 = r * 2;
          for (let c = 0; c < 14; c++) {
            const c2 = c * 2;
            p1[p1Base + r * 14 + c] = Math.max(
              c1[c1Base + r2 * 28 + c2],
              c1[c1Base + r2 * 28 + c2 + 1],
              c1[c1Base + (r2 + 1) * 28 + c2],
              c1[c1Base + (r2 + 1) * 28 + c2 + 1]
            );
          }
        }
      }

      // Pad 8x14x14 -> 8x18x18 for Conv2
      const p1Pad = new Float32Array(8 * 18 * 18);
      for (let f = 0; f < 8; f++) {
        const srcBase = f * 196, dstBase = f * 324;
        for (let r = 0; r < 14; r++) {
          const srcRow = srcBase + r * 14;
          const dstRow = dstBase + (r + 2) * 18 + 2;
          for (let c = 0; c < 14; c++) p1Pad[dstRow + c] = p1[srcRow + c];
        }
      }

      // Conv2: 16 filters 8x5x5 + ReLU
      const c2 = new Float32Array(16 * 14 * 14);
      const c2Mean = new Float32Array(16);
      for (let f = 0; f < 16; f++) {
        const wBaseF = f * 200, bias = B2[f], outBase = f * 196;
        let sumAct = 0;
        for (let r = 0; r < 14; r++) {
          for (let c = 0; c < 14; c++) {
            let sum = bias;
            for (let inF = 0; inF < 8; inF++) {
              const inFBase = inF * 324, wInFBase = wBaseF + inF * 25;
              for (let kr = 0; kr < 5; kr++) {
                const rBase = inFBase + (r + kr) * 18 + c;
                const kBase = wInFBase + kr * 5;
                sum += p1Pad[rBase] * W2[kBase]
                  + p1Pad[rBase + 1] * W2[kBase + 1]
                  + p1Pad[rBase + 2] * W2[kBase + 2]
                  + p1Pad[rBase + 3] * W2[kBase + 3]
                  + p1Pad[rBase + 4] * W2[kBase + 4];
              }
            }
            const val = sum > 0 ? sum : 0;
            c2[outBase + r * 14 + c] = val;
            sumAct += val;
          }
        }
        c2Mean[f] = sumAct / 196;
      }

      // Pool2: 3x3 MaxPool stride 3 -> 16x4x4 = 256
      const flat256 = new Float32Array(256);
      for (let f = 0; f < 16; f++) {
        const fBase = f * 196, flatBase = f * 16;
        for (let r = 0; r < 4; r++) {
          const r3 = r * 3;
          for (let c = 0; c < 4; c++) {
            const c3 = c * 3;
            let maxV = -Infinity;
            for (let kr = 0; kr < 3; kr++) {
              for (let kc = 0; kc < 3; kc++) {
                const v = c2[fBase + (r3 + kr) * 14 + (c3 + kc)];
                if (v > maxV) maxV = v;
              }
            }
            flat256[flatBase + r * 4 + c] = maxV;
          }
        }
      }

      // Dense 256 -> 10 + Softmax
      const logits = new Float32Array(10);
      let maxLogit = -Infinity;
      for (let m = 0; m < 10; m++) {
        let s = B3[m];
        for (let k = 0; k < 256; k++) s += flat256[k] * W3[k * 10 + m];
        logits[m] = s;
        if (s > maxLogit) maxLogit = s;
      }

      const probs = new Float32Array(10);
      let sumExp = 0;
      for (let m = 0; m < 10; m++) {
        probs[m] = Math.exp(logits[m] - maxLogit);
        sumExp += probs[m];
      }
      for (let m = 0; m < 10; m++) probs[m] /= sumExp;

      return { input28, c1Mean, c2Mean, flat256, probs };
    }

    let state = forwardCNN(new Float32Array(784));

    function extract28x28() {
      const cw = drawCanvas.width, ch = drawCanvas.height;
      const raw = drawCtx.getImageData(0, 0, cw, ch).data;
      let minX = cw, maxX = -1, minY = ch, maxY = -1, hasInk = false;

      for (let y = 0; y < ch; y++) {
        for (let x = 0; x < cw; x++) {
          const idx = (y * cw + x) * 4;
          const br = Math.max(raw[idx], raw[idx + 1], raw[idx + 2]);
          if (br > 25) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
            hasInk = true;
          }
        }
      }

      const tensor28 = new Float32Array(784);
      if (!hasInk) {
        renderDownsamplePreview(tensor28);
        return tensor28;
      }

      const bw = maxX - minX + 1, bh = maxY - minY + 1;
      let nw, nh;
      if (bw > bh) {
        nw = 20;
        nh = Math.max(1, Math.round(bh * 20 / bw));
      } else {
        nh = 20;
        nw = Math.max(1, Math.round(bw * 20 / bh));
      }

      const tmp = document.createElement("canvas");
      tmp.width = nw; tmp.height = nh;
      const tc = tmp.getContext("2d");
      tc.imageSmoothingEnabled = true;
      tc.drawImage(drawCanvas, minX, minY, bw, bh, 0, 0, nw, nh);

      const px = tc.getImageData(0, 0, nw, nh).data;
      const gray = new Float32Array(nw * nh);
      let totalMass = 0, sumX = 0, sumY = 0;

      for (let y = 0; y < nh; y++) {
        for (let x = 0; x < nw; x++) {
          const i = (y * nw + x) * 4;
          const br = Math.max(px[i], px[i + 1], px[i + 2]);
          const norm = br > 20 ? (br - 20) / 235 : 0;
          gray[y * nw + x] = norm;
          if (norm > 0) {
            totalMass += norm;
            sumX += x * norm;
            sumY += y * norm;
          }
        }
      }

      if (totalMass === 0) {
        renderDownsamplePreview(tensor28);
        return tensor28;
      }

      const cx = sumX / totalMass, cy = sumY / totalMass;
      const targetX = Math.round(13.5 - cx), targetY = Math.round(13.5 - cy);

      for (let y = 0; y < nh; y++) {
        for (let x = 0; x < nw; x++) {
          const tx = targetX + x, ty = targetY + y;
          if (tx >= 0 && tx < 28 && ty >= 0 && ty < 28) {
            tensor28[ty * 28 + tx] = Math.min(1, Math.max(0, gray[y * nw + x]));
          }
        }
      }

      renderDownsamplePreview(tensor28);
      return tensor28;
    }

    function renderDownsamplePreview(tensor28) {
      downCtx.fillStyle = "#020409";
      downCtx.fillRect(0, 0, downCanvas.width, downCanvas.height);
      const stepX = downCanvas.width / 28, stepY = downCanvas.height / 28;

      for (let r = 0; r < 28; r++) {
        for (let c = 0; c < 28; c++) {
          const v = tensor28[r * 28 + c];
          if (v > 0.02) {
            downCtx.fillStyle = `rgba(112,232,255,${Math.min(1, v * 1.25)})`;
            downCtx.fillRect(c * stepX, r * stepY, Math.max(1, stepX - 0.4), Math.max(1, stepY - 0.4));
          }
        }
      }
    }

    function processDrawing() {
      const tensor28 = extract28x28();
      state = forwardCNN(tensor28);
      renderOutput(state.probs);
    }

    function renderOutput(probs) {
      let top = 0;
      for (let d = 1; d < 10; d++) if (probs[d] > probs[top]) top = d;
      if (predValEl) predValEl.textContent = hasDrawn ? top : "?";
      if (confBadgeEl) confBadgeEl.textContent = hasDrawn ? (probs[top] * 100).toFixed(1) + "%" : "0%";
      if (!probListEl) return;
      probListEl.innerHTML = Array.from({ length: 10 }, (_, d) => {
        const pct = (probs[d] * 100).toFixed(1);
        return `
          <div class="prob-row">
            <span class="prob-digit">${d}</span>
            <div class="prob-bar"><div class="prob-bar-fill" style="width:${hasDrawn ? pct : 0}%"></div></div>
            <span class="prob-pct">${pct}%</span>
          </div>`;
      }).join("");
    }

    function clearDrawing() {
      drawCtx.fillStyle = "#000";
      drawCtx.fillRect(0, 0, drawCanvas.width, drawCanvas.height);
      downCtx.fillStyle = "#000";
      downCtx.fillRect(0, 0, downCanvas.width, downCanvas.height);
      hasDrawn = false;
      processDrawing();
    }

    function getPos(e) {
      const r = drawCanvas.getBoundingClientRect();
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (cx - r.left) * (drawCanvas.width / r.width),
        y: (cy - r.top) * (drawCanvas.height / r.height)
      };
    }

    function startDraw(e) {
      isDrawing = true; hasDrawn = true;
      const p = getPos(e); lastX = p.x; lastY = p.y;
      drawCtx.beginPath(); drawCtx.arc(lastX, lastY, 7, 0, Math.PI * 2);
      drawCtx.fillStyle = "#70e8ff"; drawCtx.fill();
      processDrawing();
    }

    function moveDraw(e) {
      if (!isDrawing) return;
      const p = getPos(e);
      drawCtx.beginPath(); drawCtx.moveTo(lastX, lastY); drawCtx.lineTo(p.x, p.y);
      drawCtx.strokeStyle = "#70e8ff"; drawCtx.lineWidth = 14;
      drawCtx.lineCap = "round"; drawCtx.lineJoin = "round";
      drawCtx.shadowColor = "rgba(112,232,255,0.85)"; drawCtx.shadowBlur = 9;
      drawCtx.stroke(); drawCtx.shadowBlur = 0;
      lastX = p.x; lastY = p.y;
      processDrawing();
    }

    function stopDraw() { if (isDrawing) { isDrawing = false; processDrawing(); } }

    document.getElementById("neural-clear-btn")?.addEventListener("click", clearDrawing);
    drawCanvas.addEventListener("mousedown", startDraw);
    drawCanvas.addEventListener("mousemove", moveDraw);
    window.addEventListener("mouseup", stopDraw);
    drawCanvas.addEventListener("touchstart", e => { e.preventDefault(); startDraw(e); }, { passive: false });
    drawCanvas.addEventListener("touchmove", e => { e.preventDefault(); moveDraw(e); }, { passive: false });
    drawCanvas.addEventListener("touchend", stopDraw);

    // ──────────────────────────────────────────────────────────────
    //  INTERACTIVE REAL-TIME CNN GRAPH VISUALIZER
    // ──────────────────────────────────────────────────────────────
    let nodes = [], conns = [], hovObj = null, pulses = [];

    const LAYER_COUNTS = [10, 8, 16, 10];
    const LAYER_NAMES = [
      "Input Tensor (28x28)",
      "Conv1 Filters (8 feature maps)",
      "Conv2 Features (16 deep maps)",
      "Output Classes (Digits 0-9)"
    ];

    function setupGraph() {
      const wrap = graphCanvas.parentElement;
      if (!wrap) return;
      const W = wrap.offsetWidth || wrap.getBoundingClientRect().width || 500;
      const H = Math.max(280, wrap.offsetHeight || wrap.getBoundingClientRect().height || 300);
      graphCanvas.width = W; graphCanvas.height = H;
      nodes = []; conns = [];

      const colX = [W * 0.1, W * 0.36, W * 0.64, W * 0.9];
      LAYER_COUNTS.forEach((cnt, l) => {
        const stepY = H / (cnt + 1);
        for (let n = 0; n < cnt; n++) {
          nodes.push({
            id: l === 0 ? `In_Region_${n}`
              : l === 1 ? `Conv1_F${n}`
                : l === 2 ? `Conv2_F${n}`
                  : `Class_Digit_${n}`,
            layer: l, index: n,
            x: colX[l], y: stepY * (n + 1),
            radius: l === 3 ? 9 : (l === 2 ? 6.5 : 7),
            layerName: LAYER_NAMES[l]
          });
        }
      });

      const byLayer = [0, 1, 2, 3].map(l => nodes.filter(n => n.layer === l));
      for (let l = 0; l < 3; l++) {
        byLayer[l].forEach((src, i) => {
          byLayer[l + 1].forEach((dst, j) => {
            const wVal = (!W1) ? 0.2 : (
              l === 0 ? W1[j * 25 + ((i * 2 + 1) % 25)] :
                l === 1 ? W2[j * 200 + (i % 8) * 25 + 12] :
                  W3[((i * 16 + 8) % 256) * 10 + j]
            );
            conns.push({ src, dst, layer: l, srcIdx: i, dstIdx: j, w: wVal });
          });
        });
      }
    }

    function getAct(l, idx) {
      if (!state) return 0;
      if (l === 0) {
        // Sample 10 receptive field centers in 28x28 grid
        const sampleCoords = [
          [6, 14], [8, 8], [8, 20], [14, 8], [14, 14],
          [14, 20], [20, 8], [20, 14], [20, 20], [24, 14]
        ];
        const [r, c] = sampleCoords[idx % sampleCoords.length];
        return state.input28 ? state.input28[r * 28 + c] || 0 : 0;
      }
      if (l === 1) return state.c1Mean ? state.c1Mean[idx % 8] || 0 : 0;
      if (l === 2) return state.c2Mean ? state.c2Mean[idx % 16] || 0 : 0;
      return state.probs ? state.probs[idx] || 0 : 0;
    }

    function drawGraph() {
      const W = graphCanvas.width, H = graphCanvas.height;
      if (W === 0 || H === 0) return;
      graphCtx.fillStyle = "#02050b"; graphCtx.fillRect(0, 0, W, H);

      // Draw Synapses (Glowing Cyan for excitatory, Glowing Red/Orange for inhibitory)
      conns.forEach(c => {
        const srcAct = getAct(c.layer, c.srcIdx);
        const signal = Math.abs(c.w * srcAct);
        const hovered = hovObj?.type === "conn" && hovObj.data === c;
        graphCtx.beginPath();
        graphCtx.moveTo(c.src.x, c.src.y);
        graphCtx.lineTo(c.dst.x, c.dst.y);
        if (hovered) {
          graphCtx.strokeStyle = c.w > 0 ? "#73ffe1" : "#ff7070";
          graphCtx.lineWidth = 2.8;
        } else if (signal > 0.04 && hasDrawn) {
          const a = Math.min(0.85, 0.15 + signal * 1.2);
          graphCtx.strokeStyle = c.w > 0 ? `rgba(112,232,255,${a})` : `rgba(255,120,120,${a})`;
          graphCtx.lineWidth = Math.min(2.4, 0.5 + signal * 2.5);
        } else {
          graphCtx.strokeStyle = "rgba(255,255,255,0.04)";
          graphCtx.lineWidth = 0.4;
        }
        graphCtx.stroke();
      });

      // Flowing computation pulses (signals traveling forward along active circuits)
      if (hasDrawn && Math.random() < 0.45) {
        const activeConns = conns.filter(c => getAct(c.layer, c.srcIdx) > 0.12);
        if (activeConns.length) {
          const c = activeConns[Math.floor(Math.random() * activeConns.length)];
          pulses.push({
            x: c.src.x, y: c.src.y, tx: c.dst.x, ty: c.dst.y, t: 0,
            color: c.w > 0 ? "#70e8ff" : "#ff9e43"
          });
        }
      }
      pulses.forEach(p => {
        p.t += 0.045;
        graphCtx.beginPath();
        graphCtx.arc(p.x + (p.tx - p.x) * p.t, p.y + (p.ty - p.y) * p.t, 2.5, 0, Math.PI * 2);
        graphCtx.fillStyle = p.color;
        graphCtx.shadowColor = p.color; graphCtx.shadowBlur = 6;
        graphCtx.fill(); graphCtx.shadowBlur = 0;
      });
      pulses = pulses.filter(p => p.t < 1);

      // Draw Neurons with halos
      nodes.forEach(nd => {
        const act = getAct(nd.layer, nd.index);
        const hov = hovObj?.type === "node" && hovObj.data === nd;
        graphCtx.beginPath();
        graphCtx.arc(nd.x, nd.y, nd.radius, 0, Math.PI * 2);

        if (hov) {
          graphCtx.fillStyle = "#fff"; graphCtx.shadowColor = "#70e8ff";
          graphCtx.shadowBlur = 14; graphCtx.strokeStyle = "#70e8ff"; graphCtx.lineWidth = 2.5;
        } else if (hasDrawn && act > 0.05) {
          if (nd.layer === 3) {
            graphCtx.fillStyle = `rgba(255,158,67,${0.35 + act * 0.65})`;
            graphCtx.shadowColor = "rgba(255,158,67,0.85)"; graphCtx.strokeStyle = "#ffb86c";
          } else {
            graphCtx.fillStyle = `rgba(112,232,255,${0.25 + act * 0.75})`;
            graphCtx.shadowColor = "rgba(112,232,255,0.85)"; graphCtx.strokeStyle = "#70e8ff";
          }
          graphCtx.shadowBlur = 6 + act * 10; graphCtx.lineWidth = 1.8;
        } else {
          graphCtx.fillStyle = "rgba(20,35,55,0.8)";
          graphCtx.strokeStyle = "rgba(120,220,255,0.18)";
          graphCtx.lineWidth = 1.1; graphCtx.shadowBlur = 0;
        }
        graphCtx.fill(); graphCtx.stroke(); graphCtx.shadowBlur = 0;

        if (nd.layer === 3) {
          graphCtx.fillStyle = act > 0.3 ? "#ffb86c" : "rgba(255,255,255,0.6)";
          graphCtx.font = "bold 11px monospace";
          graphCtx.textAlign = "center"; graphCtx.textBaseline = "middle";
          graphCtx.fillText(nd.index, nd.x, nd.y);
        }
      });
    }

    function distSeg(p, v, w) {
      const l2 = (w.x - v.x) ** 2 + (w.y - v.y) ** 2;
      if (!l2) return Math.hypot(p.x - v.x, p.y - v.y);
      const t = Math.max(0, Math.min(1, ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2));
      return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
    }

    graphCanvas.addEventListener("pointermove", e => {
      const r = graphCanvas.getBoundingClientRect();
      const mx = e.clientX - r.left, my = e.clientY - r.top;
      hovObj = null;
      for (const n of nodes) if (Math.hypot(n.x - mx, n.y - my) < n.radius + 6) { hovObj = { type: "node", data: n }; break; }
      if (!hovObj) for (const c of conns) if (distSeg({ x: mx, y: my }, c.src, c.dst) < 5) { hovObj = { type: "conn", data: c }; break; }

      if (hovObj && tooltip) {
        tooltip.style.display = "block";
        tooltip.style.left = Math.min(r.width - 240, Math.max(10, mx + 12)) + "px";
        tooltip.style.top = Math.min(r.height - 150, Math.max(10, my - 20)) + "px";

        if (hovObj.type === "node") {
          const nd = hovObj.data;
          const act = getAct(nd.layer, nd.index);
          const bias = (nd.layer === 1 && B1) ? B1[nd.index]
            : (nd.layer === 2 && B2) ? B2[nd.index]
              : (nd.layer === 3 && B3) ? B3[nd.index]
                : 0;
          const role = nd.layer === 0 ? `Tensor receptive field region ${nd.index}`
            : nd.layer === 1 ? `5x5 spatial feature detector (filter ${nd.index})`
              : nd.layer === 2 ? `Deep composite representation (map ${nd.index})`
                : `Class probability for digit ${nd.index}`;
          tooltip.innerHTML = `
            <div style="font-weight:700;color:#79dcff;margin-bottom:4px;">${nd.id}</div>
            <div><b>Layer:</b> ${nd.layerName}</div>
            <div><b>Activation:</b> <span style="color:#73ffe1;font-weight:bold;">${act.toFixed(4)}</span></div>
            <div><b>Bias:</b> <span style="color:#ffb86c;">${bias >= 0 ? '+' : ''}${bias.toFixed(4)}</span></div>
            <div style="margin-top:4px;font-size:0.68rem;color:#ffb86c;"><b>Role:</b> ${role}</div>`;
        } else {
          const c = hovObj.data;
          const srcAct = getAct(c.layer, c.srcIdx);
          const contrib = c.w * srcAct;
          tooltip.innerHTML = `
            <div style="font-weight:700;color:#ffb86c;margin-bottom:4px;">Synapse</div>
            <div><b>Path:</b> ${c.src.id} → ${c.dst.id}</div>
            <div><b>Weight:</b> <span style="color:${c.w > 0 ? '#73ffe1' : '#ff8a8a'}">${c.w >= 0 ? '+' : ''}${c.w.toFixed(4)}</span></div>
            <div><b>Input:</b> ${srcAct.toFixed(4)}</div>
            <div><b>Contribution:</b> <span style="color:#73ffe1;">${contrib >= 0 ? '+' : ''}${contrib.toFixed(4)}</span></div>
            <div><b>Type:</b> ${c.w > 0 ? 'Excitatory' : 'Inhibitory'}</div>`;
        }
      } else if (tooltip) tooltip.style.display = "none";
    });
    graphCanvas.addEventListener("pointerleave", () => { hovObj = null; if (tooltip) tooltip.style.display = "none"; });

    const graphWrap = graphCanvas.parentElement;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      if (width > 10 && height > 10) { setupGraph(); }
    });
    if (graphWrap) ro.observe(graphWrap);
    window.addEventListener("resize", () => { clearTimeout(window.__nrt); window.__nrt = setTimeout(setupGraph, 150); });

    function graphLoop() {
      drawGraph();
      requestAnimationFrame(graphLoop);
    }
    requestAnimationFrame(graphLoop);
    setupGraph();
  })();
}

function initNeuralFabric() {
  const canvas = document.getElementById("neural-fabric-canvas");
  if (!canvas || canvas.dataset.ready) return;
  canvas.dataset.ready = "true";

  const ctx = canvas.getContext("2d");
  const nodes = Array.from({ length: 42 }, (_, index) => ({
    x: (index % 14) / 13,
    y: Math.floor(index / 14) / 2,
    phase: Math.random() * Math.PI * 2,
    size: 1.5 + Math.random() * 1.8
  }));

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * scale));
    canvas.height = Math.max(1, Math.round(rect.height * scale));
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
  }

  function render(time) {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return requestAnimationFrame(render);
    ctx.clearRect(0, 0, width, height);
    const drift = time * 0.001;

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 13; col++) {
        const a = nodes[row * 14 + col];
        const b = nodes[row * 14 + col + 1];
        if (!a || !b) continue;
        const ax = a.x * width, ay = a.y * height + Math.sin(drift + a.phase) * 7;
        const bx = b.x * width, by = b.y * height + Math.sin(drift + b.phase) * 7;
        const glow = 0.11 + (Math.sin(drift * 2 + col * 0.8 + row) + 1) * 0.08;
        ctx.strokeStyle = `rgba(89, 225, 255, ${glow})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
      }
    }

    nodes.forEach((node, index) => {
      const x = node.x * width;
      const y = node.y * height + Math.sin(drift + node.phase) * 7;
      const energy = (Math.sin(drift * 2.4 + node.phase) + 1) / 2;
      ctx.beginPath(); ctx.arc(x, y, node.size + energy * 1.2, 0, Math.PI * 2);
      ctx.fillStyle = index % 7 === 0 ? "#f2a900" : "#70e8ff";
      ctx.globalAlpha = 0.35 + energy * 0.65;
      ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 10;
      ctx.fill(); ctx.shadowBlur = 0;
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(render);
  }

  resize();
  new ResizeObserver(resize).observe(canvas);
  requestAnimationFrame(render);
}

// Boot application when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
