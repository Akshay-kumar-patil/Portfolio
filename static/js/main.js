async function boot() {
  const response = await fetch("/static/profile.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Profile request failed with ${response.status}`);
  }
  const data = await response.json();

  const setText = (id, value) => {
    const node = document.getElementById(id);
    if (node) node.textContent = value;
  };

  const heroKicker = document.getElementById("hero-kicker");
  if (heroKicker && data.hero?.kicker) {
    heroKicker.textContent = data.hero.kicker;
  }

  const heroNameNode = document.getElementById("hero-name");
  if (heroNameNode) {
    const firstName = data.hero?.name_first || "Akshay";
    const midName = data.hero?.name_mid || "Kumar";
    const lastName = data.hero?.name_last || "Patil";
    heroNameNode.innerHTML = `<span class="name-first">${firstName}</span> <span class="name-mid">${midName}</span> <span class="name-last">${lastName}</span>`;
  }

  const heroBioNode = document.getElementById("hero-bio");
  if (heroBioNode) {
    heroBioNode.textContent = data.hero?.bio || data.hero?.headline || (
      "I build performant RAG applications, ML/DL models, LLM systems, and practical " +
      "machine learning tools with clean demos, robust architectures, and production-ready workflows."
    );
  }

  setText("headline", data.hero?.headline || "");
  const summaryList = document.getElementById("summary-list");
  if (summaryList && Array.isArray(data.summary_points)) {
    summaryList.innerHTML = data.summary_points.map((point) => `<li>${point}</li>`).join("");
  } else if (summaryList) {
    setText("summary-list", data.summary || "");
  }
  setText("contact-email", data.contact?.email ?? "");

  const links = ["github-link", "footer-github"];
  links.forEach((id) => {
    const node = document.getElementById(id);
    if (node && data.contact?.github) node.href = data.contact.github;
  });

  ["linkedin-link", "footer-linkedin"].forEach((id) => {
    const node = document.getElementById(id);
    if (node && data.contact?.linkedin) node.href = data.contact.linkedin;
  });

  ["resume-link", "footer-resume"].forEach((id) => {
    const node = document.getElementById(id);
    if (node && data.contact?.resume) node.href = data.contact.resume;
  });

  const heroChips = document.getElementById("hero-chips");
  if (heroChips && data.hero?.chips) {
    heroChips.innerHTML = data.hero.chips.map((item) => `<span class="tech-chip">${item}</span>`).join("");
  }

  const heroMetrics = document.getElementById("hero-metrics");
  if (heroMetrics) {
    heroMetrics.innerHTML = data.metrics.map((metric) => `
      <article class="metric-card">
        <span class="metric-value">${metric.value}</span>
        <span class="metric-label">${metric.label}</span>
      </article>
    `).join("");
  }

  const projectsGrid = document.getElementById("projects-grid");
  if (projectsGrid) {
    projectsGrid.innerHTML = data.projects.map((item) => `
      <article class="card">
        <h4>${item.name}</h4>
        <p>${item.tagline}</p>
        <a class="repo-link" href="${item.repo}" target="_blank" rel="noreferrer">View Repo</a>
        <ul class="project-list">
          ${item.details.map((detail) => `<li>${detail}</li>`).join("")}
        </ul>
      </article>
    `).join("");
  }

  const specialProject = document.getElementById("special-project");
  if (specialProject && data.special_project) {
    specialProject.innerHTML = `
      <article class="card special-card">
        <div class="special-badge">Special Mention</div>
        <h4>${data.special_project.name}</h4>
        <p>${data.special_project.subtitle}</p>
        <a class="repo-link" href="${data.special_project.repo}" target="_blank" rel="noreferrer">View Repo</a>
        <ul class="project-list">
          ${data.special_project.details.map((detail) => `<li>${detail}</li>`).join("")}
        </ul>
      </article>
    `;
  }

  const educationGrid = document.getElementById("education-grid");
  if (educationGrid) {
    educationGrid.innerHTML = data.education.map((item) => `
      <article class="card education-card">
        <div class="education-card-bg" style="background-image: url('${item.image || ''}')" aria-hidden="true"></div>
        <div class="education-card-content">
          <h4>${item.degree}</h4>
          <p class="education-institution">${item.institution}</p>
          <div class="timeline">
            <div class="timeline-item"><strong>Duration</strong>${item.duration}</div>
            <div class="timeline-item"><strong>Metric</strong>${item.metric}</div>
          </div>
        </div>
      </article>
    `).join("");
  }

  const skillsGrid = document.getElementById("skills-grid");
  if (skillsGrid) {
    skillsGrid.innerHTML = Object.entries(data.skills).map(([group, values]) => {
      // Repeat tags 4× for seamless centered loop (animation shifts -25% per cycle)
      const tagsHTML = values.map((v) => `<span class="skill-tag">${v}</span>`).join("");
      const doubled = tagsHTML + tagsHTML + tagsHTML + tagsHTML; // four copies = always fills viewport
      return `
        <div class="skill-group">
          <h4>${group}</h4>
          <div class="skill-ticker-wrap">
            <div class="skill-ticker-track">${doubled}</div>
          </div>
        </div>`;
    }).join("");
  }

  const domainBoard = document.getElementById("domain-mastery");
  if (domainBoard) {
    domainBoard.innerHTML = data.domain_mastery.map((group) => `
      <section class="domain-group">
        <div class="domain-title">
          <span class="domain-icon" aria-hidden="true">${group.icon}</span>
          <h4>${group.name}</h4>
        </div>
        <div class="domain-tags">
          ${group.items.map((item) => `<span class="domain-tag">${item}</span>`).join("")}
        </div>
      </section>
    `).join("");
  }

  const achievementsRow = document.getElementById("achievements-row");
  if (achievementsRow) {
    achievementsRow.innerHTML = data.achievements.map((item) => `<span class="badge">${item}</span>`).join("");
  }

  const windTrail = document.getElementById("wind-trail");
  const cursorGlow = document.getElementById("cursor-glow");
  const stormLayer = document.getElementById("storm-layer");
  const resetStormButton = document.getElementById("reset-storm");
  const portfolioShell = document.querySelector(".portfolio-shell");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  let stormActive = false;

  const randomBetween = (min, max) => min + Math.random() * (max - min);
  const stormPieces = portfolioShell ? [...portfolioShell.querySelectorAll(".glass, .footer")] : [];
  stormPieces.forEach((piece) => piece.classList.add("storm-piece"));

  const resetStorm = () => {
    if (!stormActive) return;
    stormActive = false;
    document.body.classList.remove("storm-active");
    document.body.classList.add("storm-resetting", "screen-blink");
    stormLayer?.classList.remove("ready");
    stormLayer?.setAttribute("aria-hidden", "true");

    window.setTimeout(() => {
      document.body.classList.remove("storm-resetting");
      stormLayer?.classList.remove("active");
      document.body.classList.remove("screen-blink");
      stormPieces.forEach((piece) => {
        piece.style.removeProperty("--storm-x");
        piece.style.removeProperty("--storm-y");
        piece.style.removeProperty("--storm-rotation");
        piece.style.removeProperty("--storm-scale");
        piece.style.removeProperty("--storm-delay");
        piece.style.removeProperty("--storm-duration");
      });
    }, 720);
  };

  const startStorm = () => {
    if (stormActive || !stormLayer || document.body.classList.contains("resume-open")) return;
    stormActive = true;
    stormPieces.forEach((piece, index) => {
      const direction = index % 2 === 0 ? 1 : -1;
      piece.style.setProperty("--storm-x", `${randomBetween(-180, 180)}px`);
      piece.style.setProperty("--storm-y", `${randomBetween(-140, 140)}px`);
      piece.style.setProperty("--storm-rotation", `${direction * randomBetween(8, 24)}deg`);
      piece.style.setProperty("--storm-scale", `${randomBetween(0.94, 1.04)}`);
      piece.style.setProperty("--storm-delay", `${index * 35}ms`);
      piece.style.setProperty("--storm-duration", `${randomBetween(1500, 2200)}ms`);
    });
    document.body.classList.add("storm-active");
    stormLayer.classList.add("active");
    stormLayer.setAttribute("aria-hidden", "false");
    window.setTimeout(() => {
      if (stormActive) stormLayer.classList.add("ready");
    }, 1450);
  };

  resetStormButton?.addEventListener("click", resetStorm);

  if (windTrail && !reducedMotion && !coarsePointer) {
    const rand = (min, max) => min + Math.random() * (max - min);
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const trailNodes = [];
    let lastX = null;
    let lastY = null;
    let lastSpawn = 0;
    let fastStartedAt = null;
    let lastMoveAt = null;
    let fastDistance = 0;
    let glowHideTimer = null;

    const showCursorGlow = (x, y) => {
      if (!cursorGlow) return;
      cursorGlow.style.left = `${x}px`;
      cursorGlow.style.top = `${y}px`;
      cursorGlow.classList.add("active");
      if (glowHideTimer) {
        window.clearTimeout(glowHideTimer);
      }
      glowHideTimer = window.setTimeout(() => {
        cursorGlow.classList.remove("active");
      }, 180);
    };

    const prune = () => {
      while (trailNodes.length > 36) {
        const node = trailNodes.shift();
        node?.remove();
      }
    };

    const spawn = (className, x, y, styles) => {
      const node = document.createElement("span");
      node.className = className;
      node.style.setProperty("--x", `${x}px`);
      node.style.setProperty("--y", `${y}px`);
      Object.entries(styles).forEach(([key, value]) => {
        node.style.setProperty(key, value);
      });
      windTrail.appendChild(node);
      trailNodes.push(node);
      node.addEventListener("animationend", () => node.remove(), { once: true });
      prune();
    };

    const handleMove = (event) => {
      const x = event.clientX;
      const y = event.clientY;
      showCursorGlow(x, y);
      if (lastX === null || lastY === null) {
        lastX = x;
        lastY = y;
        return;
      }

      const dx = x - lastX;
      const dy = y - lastY;
      const distance = Math.max(Math.hypot(dx, dy), 0.5);
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      const now = performance.now();
      const spacing = now - lastSpawn;
      const elapsed = Math.max(now - (lastMoveAt ?? now), 1);
      const speed = distance / elapsed * 1000;
      const isFast = speed > 350 || distance > 8;
      if (isFast && elapsed < 240) {
        fastStartedAt ??= now;
        fastDistance += distance;
        if (now - fastStartedAt >= 5000 && fastDistance >= 650) startStorm();
      } else {
        fastStartedAt = null;
        fastDistance = 0;
      }
      lastMoveAt = now;
      const flowX = dx / distance;
      const flowY = dy / distance;
      const normalX = -flowY;
      const normalY = flowX;
      const streakCount = distance > 34 || spacing > 55 ? 2 : 1;
      const leafCount = distance > 28 ? 1 : 0;
      const travel = clamp(distance * 0.58 + 16, 18, 82);
      const duration = clamp(820 + distance * 9, 850, 1450);
      const leafTravel = clamp(distance * 0.3 + 10, 10, 34);
      const leafDur = clamp(1000 + distance * 7, 980, 1550);

      for (let i = 0; i < streakCount; i += 1) {
        const behind = rand(4, 12);
        spawn("wind-streak", x - flowX * behind + normalX * rand(-4, 4), y - flowY * behind + normalY * rand(-4, 4), {
          "--len": `${travel + rand(-8, 10)}px`,
          "--angle": `${angle + rand(-5, 5)}deg`,
          "--travel": `${travel}px`,
          "--sway": `${rand(-8, 8)}px`,
          "--dur": `${duration + rand(-150, 150)}ms`,
        });
      }

      for (let i = 0; i < leafCount; i += 1) {
        spawn("wind-leaf", x - flowX * rand(2, 8) + rand(-6, 6), y - flowY * rand(2, 8) + rand(-6, 6), {
          "--leaf-size": `${rand(3.5, 6.5)}px`,
          "--leaf-rot": `${angle + rand(-30, 30)}deg`,
          "--leaf-dx": `${flowX * leafTravel + normalX * rand(-13, 13)}px`,
          "--leaf-dy": `${flowY * leafTravel + normalY * rand(-13, 13)}px`,
          "--dur": `${leafDur + rand(-160, 140)}ms`,
        });
      }

      lastX = x;
      lastY = y;
      lastSpawn = now;
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    window.addEventListener("pointerdown", handleMove, { passive: true });
    window.addEventListener("pointerleave", () => {
      lastX = null;
      lastY = null;
      fastStartedAt = null;
      lastMoveAt = null;
      fastDistance = 0;
      cursorGlow?.classList.remove("active");
    });
    window.addEventListener("blur", () => {
      lastX = null;
      lastY = null;
      fastStartedAt = null;
      lastMoveAt = null;
      fastDistance = 0;
      cursorGlow?.classList.remove("active");
    });
  }

  const openingScreen = document.getElementById("opening-screen");
  const enterButton = document.getElementById("enter-button");
  const dismissOpening = () => {
    if (!openingScreen || openingScreen.classList.contains("hide")) return;
    openingScreen.setAttribute("aria-hidden", "true");
    openingScreen.classList.add("hide");
    window.setTimeout(() => {
      openingScreen.style.display = "none";
    }, 950);
  };
  window.setTimeout(dismissOpening, 4200);
  enterButton?.addEventListener("click", dismissOpening);
  enterButton?.addEventListener("pointerdown", dismissOpening);
  openingScreen?.addEventListener("click", (event) => {
    if (event.target === openingScreen) dismissOpening();
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === "Escape") dismissOpening();
    if (event.key === "Escape") {
      if (document.body.classList.contains("resume-open")) {
        closeResume();
      }
      if (stormActive) {
        resetStorm();
      }
    }
  });

  const revealTargets = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
      }
    });
  }, { threshold: 0.18 });
  revealTargets.forEach((node) => observer.observe(node));

  const skillsBg = document.getElementById("skills-bg");
  const skillsAnchor = document.getElementById("skills-anchor");
  if (skillsBg && skillsAnchor) {
    const bgObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        skillsBg.classList.toggle("visible", entry.isIntersecting);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.05 });
    bgObserver.observe(skillsAnchor);
  }

  const modal = document.getElementById("resume-modal");
  const openResume = () => {
    modal?.classList.add("open");
    modal?.setAttribute("aria-hidden", "false");
    document.body.classList.add("resume-open");
  };
  const closeResume = () => {
    modal?.classList.remove("open");
    modal?.setAttribute("aria-hidden", "true");
    document.body.classList.remove("resume-open");
  };

  const openResumeButtons = ["open-resume", "footer-open-resume"];
  openResumeButtons.forEach((id) => {
    document.getElementById(id)?.addEventListener("click", openResume);
  });
  document.getElementById("close-resume")?.addEventListener("click", closeResume);
  document.getElementById("resume-backdrop")?.addEventListener("click", closeResume);

  document.getElementById("view-projects")?.addEventListener("click", () => {
    document.getElementById("projects-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.getElementById("view-skills")?.addEventListener("click", () => {
    document.getElementById("skills-anchor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.getElementById("contact-me")?.addEventListener("click", () => {
    document.getElementById("contact-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // ── Matrix Fabric Section Full BG Reveal Observer ──
  const matrixSection = document.getElementById("matrix-section");
  if (matrixSection) {
    new IntersectionObserver((entries) => {
      entries.forEach((e) => document.body.classList.toggle("jp-revealed", e.isIntersecting));
    }, { threshold: 0.05 }).observe(matrixSection);
  }

  // ── Neural Matrix Fabric Canvas Simulation (Optimized 60 FPS) ──
  (function initMatrixFabric() {
    const canvas = document.getElementById("matrix-fabric-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const CHARS = [
      "const", "let", "var", "function", "return", "import", "from", "async", "await",
      "0", "1", "x", "y", "z", "{", "}", "[", "]", "(", ")", "=>", ";", ":", "<", ">",
      "=", "+", "-", "*", "/", "&&", "||", "AI", "ML", "code", "fabric", "neural", "node"
    ];

    let cols = 28;
    let rows = 12;
    let grid = [];
    let isDragging = false;
    let mouse = { x: -9999, y: -9999, px: -9999, py: -9999, vx: 0, vy: 0 };
    let isVisible = true;

    // Pause animation when out of view to save battery and CPU
    new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
    }, { threshold: 0.01 }).observe(canvas);

    function initGrid() {
      const rect = canvas.parentElement.getBoundingClientRect();
      const w = rect.width || 800;
      const h = rect.height || 400;

      canvas.width = w;
      canvas.height = h;

      // Optimized node spacing for max performance (approx 250 nodes)
      cols = Math.max(16, Math.floor(w / 42));
      rows = Math.max(8, Math.floor(h / 32));

      grid = [];
      const cellW = w / (cols - 1);
      const cellH = h / (rows - 1);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const bx = c * cellW;
          const by = r * cellH;
          grid.push({
            baseX: bx,
            baseY: by,
            x: bx,
            y: by,
            vx: 0,
            vy: 0,
            char: CHARS[Math.floor(Math.random() * CHARS.length)],
            isBright: Math.random() < 0.12,
            r, c,
            phase: (c * 0.3) + (r * 0.25)
          });
        }
      }
    }

    function updatePhysics(t) {
      const spring = 0.05;
      const damping = 0.85;
      const radiusSq = 140 * 140;

      mouse.vx = mouse.x - mouse.px;
      mouse.vy = mouse.y - mouse.py;
      mouse.px = mouse.x;
      mouse.py = mouse.y;

      const hasMouse = mouse.x > -1000;
      const totalNodes = grid.length;

      for (let i = 0; i < totalNodes; i++) {
        const node = grid[i];

        // Ambient breeze formula
        const breezeX = Math.sin(t * 1.5 + node.r * 0.4 + node.phase) * 5 * (node.r / rows);
        const breezeY = Math.cos(t * 1.2 + node.c * 0.3) * 2.5 * (node.r / rows);

        const targetX = node.baseX + breezeX;
        const targetY = node.baseY + breezeY;

        if (hasMouse) {
          const dx = node.x - mouse.x;
          const dy = node.y - mouse.y;
          const dSq = dx * dx + dy * dy;

          if (dSq < radiusSq && dSq > 0) {
            const dist = Math.sqrt(dSq);
            const force = (1 - dist / 140);
            const push = force * (isDragging ? 32 : 18);

            node.vx += (dx / dist) * push * 0.22;
            node.vy += (dy / dist) * push * 0.22;

            if (mouse.vx !== 0 || mouse.vy !== 0) {
              node.vx += mouse.vx * force * 0.35;
              node.vy += mouse.vy * force * 0.35;
            }
          }
        }

        const ax = (targetX - node.x) * spring;
        const ay = (targetY - node.y) * spring;

        node.vx = (node.vx + ax) * damping;
        node.vy = (node.vy + ay) * damping;

        node.x += node.vx;
        node.y += node.vy;
      }
    }

    function render(t) {
      const w = canvas.width;
      const h = canvas.height;

      // Fast background clear
      ctx.fillStyle = "#050811";
      ctx.fillRect(0, 0, w, h);

      // 1. Single Path Batching for Grid Weave Threads (Silky Smooth)
      ctx.beginPath();
      ctx.strokeStyle = "rgba(60, 130, 210, 0.08)";
      ctx.lineWidth = 0.75;

      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const idx = r * cols + c;
          const node = grid[idx];
          if (r === 0) ctx.moveTo(node.x, node.y);
          else ctx.lineTo(node.x, node.y);
        }
      }
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          const node = grid[idx];
          if (c === 0) ctx.moveTo(node.x, node.y);
          else ctx.lineTo(node.x, node.y);
        }
      }
      ctx.stroke();

      // 2. Optimized Text Rendering (Constant font & no shadow thrashing)
      ctx.font = '12px "Roboto Mono", "Fira Code", monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const totalNodes = grid.length;
      for (let i = 0; i < totalNodes; i++) {
        const node = grid[i];
        if (node.isBright) {
          ctx.fillStyle = "rgba(255, 185, 90, 0.85)";
        } else {
          ctx.fillStyle = "rgba(150, 195, 240, 0.35)";
        }
        ctx.fillText(node.char, node.x, node.y);
      }

      // 3. Center Hero Title & Radial Glow
      const cx = w * 0.5;
      const cy = h * 0.5;

      // Radial warmth glow behind center title
      const glowGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.min(w * 0.35, 240));
      glowGrad.addColorStop(0, "rgba(255, 120, 20, 0.25)");
      glowGrad.addColorStop(0.5, "rgba(255, 70, 0, 0.08)");
      glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, w, h);

      // Title Text
      const isMobile = w < 600;
      const titleText = isMobile ? "AKSHAY PATIL" : "AKSHAY KUMAR PATIL";
      const titleFontSize = isMobile ? Math.min(24, w * 0.06) : Math.min(36, w * 0.038);

      ctx.save();
      ctx.font = `900 ${titleFontSize}px "Orbitron", "Inter", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Enable glow ONLY for the title text
      ctx.shadowColor = "rgba(255, 130, 30, 0.8)";
      ctx.shadowBlur = 20;

      const textGrad = ctx.createLinearGradient(cx - 180, cy, cx + 180, cy);
      textGrad.addColorStop(0, "#ffe0b2");
      textGrad.addColorStop(0.5, "#ff9e43");
      textGrad.addColorStop(1, "#ff6b00");

      ctx.fillStyle = textGrad;
      ctx.fillText(titleText, cx, cy);

      // Subtitle below title
      ctx.shadowBlur = 8;
      ctx.font = `500 ${Math.max(10, titleFontSize * 0.26)}px "Roboto Mono", monospace`;
      ctx.fillStyle = "rgba(255, 215, 160, 0.85)";
      ctx.fillText("AI / ML ENGINEER", cx, cy + titleFontSize * 0.85);

      ctx.restore();
    }

    function loop(time) {
      if (isVisible) {
        const t = time * 0.001;
        updatePhysics(t);
        render(t);
      }
      requestAnimationFrame(loop);
    }

    // Event Listeners with passive performance optimizations
    canvas.addEventListener("pointerdown", (e) => {
      isDragging = true;
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.px = mouse.x;
      mouse.py = mouse.y;
    }, { passive: true });

    window.addEventListener("pointermove", (e) => {
      const r = canvas.getBoundingClientRect();
      if (
        e.clientX >= r.left &&
        e.clientX <= r.right &&
        e.clientY >= r.top &&
        e.clientY <= r.bottom
      ) {
        mouse.x = e.clientX - r.left;
        mouse.y = e.clientY - r.top;
      } else if (!isDragging) {
        mouse.x = -9999;
        mouse.y = -9999;
      }
    }, { passive: true });

    window.addEventListener("pointerup", () => {
      isDragging = false;
    }, { passive: true });

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(initGrid, 150);
    }, { passive: true });

    initGrid();
    requestAnimationFrame(loop);
  })();

  // ── High-Accuracy Real-Time CNN Inference Engine ──
  (function initNeuralActivity() {
    const drawCanvas = document.getElementById("neural-draw-canvas");
    const downCanvas = document.getElementById("neural-downsample-canvas");
    const graphCanvas = document.getElementById("neural-graph-canvas");
    if (!drawCanvas || !downCanvas || !graphCanvas) return;

    const drawCtx  = drawCanvas.getContext("2d", { willReadFrequently: true });
    const downCtx  = downCanvas.getContext("2d");
    const graphCtx = graphCanvas.getContext("2d");
    const tooltip  = document.getElementById("neural-tooltip");
    const predValEl   = document.getElementById("neural-pred-val");
    const confBadgeEl = document.getElementById("neural-conf-badge");
    const probListEl  = document.getElementById("neural-prob-list");

    let isDrawing = false, hasDrawn = false, lastX = 0, lastY = 0;

    // Helper to decode base64 Float32Array
    function decodeF32(b64) {
      const bin = atob(b64);
      const u8 = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      return new Float32Array(u8.buffer);
    }

    // LeNet-5 CNN Model Weights
    let W1 = null, B1 = null, W2 = null, B2 = null, W3 = null, B3 = null;
    function loadWeights() {
      if (window.MNIST_MODEL) {
        W1 = decodeF32(window.MNIST_MODEL.W1); // (8, 1, 5, 5) = 200 floats
        B1 = decodeF32(window.MNIST_MODEL.B1); // 8 floats
        W2 = decodeF32(window.MNIST_MODEL.W2); // (16, 8, 5, 5) = 3200 floats
        B2 = decodeF32(window.MNIST_MODEL.B2); // 16 floats
        W3 = decodeF32(window.MNIST_MODEL.W3); // (256, 10) = 2560 floats
        B3 = decodeF32(window.MNIST_MODEL.B3); // 10 floats
        return true;
      }
      return false;
    }

    loadWeights();

    // ──────────────────────────────────────────────────────────────
    //  FAST CLIENT-SIDE CNN FORWARD PASS (LeNet-5 architecture)
    //  Input: 28x28 Float32Array (784 floats)
    //  Output: class probabilities [0..9] + intermediate activations
    // ──────────────────────────────────────────────────────────────
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

      // 1. Pad 28x28 input with 2 pixels on all sides (SAME_UPPER padding -> 32x32)
      const inPad = new Float32Array(32 * 32);
      for (let r = 0; r < 28; r++) {
        const inRow = r * 28;
        const padRow = (r + 2) * 32 + 2;
        for (let c = 0; c < 28; c++) {
          inPad[padRow + c] = input28[inRow + c];
        }
      }

      // 2. Conv1: 8 filters of 5x5 + ReLU (output 8x28x28)
      const c1 = new Float32Array(8 * 28 * 28);
      const c1Mean = new Float32Array(8);
      for (let f = 0; f < 8; f++) {
        const wBase = f * 25;
        const bias = B1[f];
        const fOffset = f * 784;
        let sumAct = 0;
        for (let r = 0; r < 28; r++) {
          const outRow = fOffset + r * 28;
          for (let c = 0; c < 28; c++) {
            let sum = bias;
            for (let kr = 0; kr < 5; kr++) {
              const rBase = (r + kr) * 32 + c;
              const kBase = wBase + kr * 5;
              sum += inPad[rBase]     * W1[kBase]
                   + inPad[rBase + 1] * W1[kBase + 1]
                   + inPad[rBase + 2] * W1[kBase + 2]
                   + inPad[rBase + 3] * W1[kBase + 3]
                   + inPad[rBase + 4] * W1[kBase + 4];
            }
            const val = sum > 0 ? sum : 0; // ReLU
            c1[outRow + c] = val;
            sumAct += val;
          }
        }
        c1Mean[f] = sumAct / 784;
      }

      // 3. Pool1: 2x2 MaxPool stride 2 (output 8x14x14)
      const p1 = new Float32Array(8 * 14 * 14);
      for (let f = 0; f < 8; f++) {
        const c1Base = f * 784;
        const p1Base = f * 196;
        for (let r = 0; r < 14; r++) {
          const r2 = r * 2;
          for (let c = 0; c < 14; c++) {
            const c2 = c * 2;
            const v0 = c1[c1Base + r2 * 28 + c2];
            const v1 = c1[c1Base + r2 * 28 + c2 + 1];
            const v2 = c1[c1Base + (r2 + 1) * 28 + c2];
            const v3 = c1[c1Base + (r2 + 1) * 28 + c2 + 1];
            p1[p1Base + r * 14 + c] = Math.max(v0, v1, v2, v3);
          }
        }
      }

      // 4. Pad 8x14x14 with 2 on all sides for Conv2 (SAME_UPPER padding -> 8x18x18)
      const p1Pad = new Float32Array(8 * 18 * 18);
      for (let f = 0; f < 8; f++) {
        const srcBase = f * 196;
        const dstBase = f * 324;
        for (let r = 0; r < 14; r++) {
          const srcRow = srcBase + r * 14;
          const dstRow = dstBase + (r + 2) * 18 + 2;
          for (let c = 0; c < 14; c++) {
            p1Pad[dstRow + c] = p1[srcRow + c];
          }
        }
      }

      // 5. Conv2: 16 filters of 8x5x5 + ReLU (output 16x14x14)
      const c2 = new Float32Array(16 * 14 * 14);
      const c2Mean = new Float32Array(16);
      for (let f = 0; f < 16; f++) {
        const wBaseF = f * 200; // 8 * 25
        const bias = B2[f];
        const outBase = f * 196;
        let sumAct = 0;
        for (let r = 0; r < 14; r++) {
          for (let c = 0; c < 14; c++) {
            let sum = bias;
            for (let inF = 0; inF < 8; inF++) {
              const inFBase = inF * 324;
              const wInFBase = wBaseF + inF * 25;
              for (let kr = 0; kr < 5; kr++) {
                const rBase = inFBase + (r + kr) * 18 + c;
                const kBase = wInFBase + kr * 5;
                sum += p1Pad[rBase]     * W2[kBase]
                     + p1Pad[rBase + 1] * W2[kBase + 1]
                     + p1Pad[rBase + 2] * W2[kBase + 2]
                     + p1Pad[rBase + 3] * W2[kBase + 3]
                     + p1Pad[rBase + 4] * W2[kBase + 4];
              }
            }
            const val = sum > 0 ? sum : 0; // ReLU
            c2[outBase + r * 14 + c] = val;
            sumAct += val;
          }
        }
        c2Mean[f] = sumAct / 196;
      }

      // 6. Pool2: 3x3 MaxPool stride 3 on 14x14 -> 16x4x4 = 256 flattened features
      const flat256 = new Float32Array(256);
      for (let f = 0; f < 16; f++) {
        const fBase = f * 196;
        const flatBase = f * 16;
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

      // 7. Dense Classification Layer: 256 -> 10 classes + softmax
      const logits = new Float32Array(10);
      let maxLogit = -Infinity;
      for (let m = 0; m < 10; m++) {
        let s = B3[m];
        for (let k = 0; k < 256; k++) {
          s += flat256[k] * W3[k * 10 + m];
        }
        logits[m] = s;
        if (s > maxLogit) maxLogit = s;
      }

      const probs = new Float32Array(10);
      let sumExp = 0;
      for (let m = 0; m < 10; m++) {
        probs[m] = Math.exp(logits[m] - maxLogit);
        sumExp += probs[m];
      }
      for (let m = 0; m < 10; m++) {
        probs[m] /= sumExp;
      }

      return { input28, c1Mean, c2Mean, flat256, probs };
    }

    let state = forwardCNN(new Float32Array(784));

    // ──────────────────────────────────────────────────────────────
    //  MNIST STANDARD PREPROCESSING: BOUNDING-BOX & CENTER-OF-MASS
    // ──────────────────────────────────────────────────────────────
    function extract28x28() {
      const cw = drawCanvas.width, ch = drawCanvas.height;
      const raw = drawCtx.getImageData(0, 0, cw, ch).data;
      let minX = cw, maxX = -1, minY = ch, maxY = -1;
      let hasInk = false;

      for (let y = 0; y < ch; y++) {
        for (let x = 0; x < cw; x++) {
          const idx = (y * cw + x) * 4;
          const brightness = Math.max(raw[idx], raw[idx + 1], raw[idx + 2]);
          if (brightness > 25) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
            hasInk = true;
          }
        }
      }

      const tensor28 = new Float32Array(28 * 28);
      if (!hasInk) {
        renderDownsamplePreview(tensor28);
        return tensor28;
      }

      const bw = maxX - minX + 1;
      const bh = maxY - minY + 1;

      // Scale so the largest dimension fits inside 20 pixels
      let nw, nh;
      if (bw > bh) {
        nw = 20;
        nh = Math.max(1, Math.round(bh * 20 / bw));
      } else {
        nh = 20;
        nw = Math.max(1, Math.round(bw * 20 / bh));
      }

      const tmp = document.createElement("canvas");
      tmp.width = nw;
      tmp.height = nh;
      const tc = tmp.getContext("2d");
      tc.imageSmoothingEnabled = true;
      tc.imageSmoothingQuality = "high";
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

      // Compute Center of Mass
      const cx = sumX / totalMass;
      const cy = sumY / totalMass;

      // Center around target (13.5, 13.5)
      const targetX = Math.round(13.5 - cx);
      const targetY = Math.round(13.5 - cy);

      for (let y = 0; y < nh; y++) {
        for (let x = 0; x < nw; x++) {
          const tx = targetX + x;
          const ty = targetY + y;
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
      const stepX = downCanvas.width / 28;
      const stepY = downCanvas.height / 28;

      for (let r = 0; r < 28; r++) {
        for (let c = 0; c < 28; c++) {
          const v = tensor28[r * 28 + c];
          if (v > 0.02) {
            downCtx.fillStyle = `rgba(112,232,255,${Math.min(1, v * 1.15)})`;
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
      if (predValEl)   predValEl.textContent   = hasDrawn ? top : "?";
      if (confBadgeEl) confBadgeEl.textContent = hasDrawn ? (probs[top] * 100).toFixed(1) + "%" : "0%";
      if (!probListEl) return;
      probListEl.innerHTML = Array.from({length: 10}, (_, d) => {
        const pct = (probs[d] * 100).toFixed(1);
        return `<div class="prob-item ${hasDrawn && d === top ? 'active' : ''}">
          <span class="prob-digit">${d}</span>
          <div class="prob-bar-track"><div class="prob-bar-fill" style="width:${hasDrawn ? pct : 0}%"></div></div>
          <span class="prob-val">${pct}%</span></div>`;
      }).join('');
    }

    function clearDrawing() {
      drawCtx.fillStyle = "#03060c";
      drawCtx.fillRect(0, 0, drawCanvas.width, drawCanvas.height);
      downCtx.fillStyle = "#020409";
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
        y: (cy - r.top)  * (drawCanvas.height / r.height)
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
      drawCtx.shadowColor = "rgba(112,232,255,0.8)"; drawCtx.shadowBlur = 8;
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
    drawCanvas.addEventListener("touchmove",  e => { e.preventDefault(); moveDraw(e);  }, { passive: false });
    drawCanvas.addEventListener("touchend",   stopDraw);

    // ──────────────────────────────────────────────────────────────
    //  INTERACTIVE REAL-TIME CNN GRAPH VISUALIZER
    // ──────────────────────────────────────────────────────────────
    let nodes = [], conns = [], hovObj = null, pulses = [];

    const LAYER_COUNTS = [10, 8, 16, 10];
    const LAYER_NAMES  = [
      "Input Tensor (28x28)",
      "Conv1 Filters (8 feature maps)",
      "Conv2 Features (16 deep maps)",
      "Output Classes (Digits 0-9)"
    ];

    function setupGraph() {
      const wrap = graphCanvas.parentElement;
      const W = wrap.offsetWidth  || wrap.getBoundingClientRect().width  || 500;
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
      graphCtx.fillStyle = "#02050b"; graphCtx.fillRect(0, 0, W, H);

      // Draw Synapses
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

      // Flowing computation pulses along active circuits
      if (hasDrawn && Math.random() < 0.35) {
        const activeConns = conns.filter(c => getAct(c.layer, c.srcIdx) > 0.15);
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

      // Draw Neurons
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
            graphCtx.shadowColor = "rgba(255,158,67,0.8)"; graphCtx.strokeStyle = "#ffb86c";
          } else {
            graphCtx.fillStyle = `rgba(112,232,255,${0.25 + act * 0.75})`;
            graphCtx.shadowColor = "rgba(112,232,255,0.8)"; graphCtx.strokeStyle = "#70e8ff";
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

    let isGraphVisible = true;
    new IntersectionObserver((entries) => {
      isGraphVisible = entries[0].isIntersecting;
    }, { threshold: 0.01 }).observe(graphCanvas);

    function graphLoop() { if (isGraphVisible) drawGraph(); requestAnimationFrame(graphLoop); }

    function distSeg(p, v, w) {
      const l2 = (w.x - v.x) ** 2 + (w.y - v.y) ** 2;
      if (!l2) return Math.hypot(p.x - v.x, p.y - v.y);
      const t = Math.max(0, Math.min(1, ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2));
      return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
    }

    graphCanvas.addEventListener("pointermove", e => {
      const r  = graphCanvas.getBoundingClientRect();
      const mx = e.clientX - r.left, my = e.clientY - r.top;
      hovObj = null;
      for (const n of nodes) if (Math.hypot(n.x - mx, n.y - my) < n.radius + 6) { hovObj = { type: "node", data: n }; break; }
      if (!hovObj) for (const c of conns) if (distSeg({ x: mx, y: my }, c.src, c.dst) < 5) { hovObj = { type: "conn", data: c }; break; }

      if (hovObj && tooltip) {
        tooltip.style.display = "block";
        tooltip.style.left = Math.min(r.width - 240, Math.max(10, mx + 12)) + "px";
        tooltip.style.top  = Math.min(r.height - 150, Math.max(10, my - 20)) + "px";

        if (hovObj.type === "node") {
          const nd  = hovObj.data;
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
    // Use ResizeObserver only to do an initial setup once the canvas has a real size.
    // After that, rely on the window resize listener so the observer stays connected.
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      if (width > 10 && height > 10) { setupGraph(); }
    });
    ro.observe(graphWrap);
    requestAnimationFrame(() => {
      const r = graphWrap.getBoundingClientRect();
      if (r.width > 10 && r.height > 10) { setupGraph(); }
    });
    window.addEventListener("resize", () => { clearTimeout(window.__nrt); window.__nrt = setTimeout(setupGraph, 150); });

    requestAnimationFrame(graphLoop);
    clearDrawing();
  })();
}

boot().catch((error) => {
  console.error("Portfolio failed to load", error);
  const headline = document.getElementById("headline");
  const summaryList = document.getElementById("summary-list");
  if (headline) {
    headline.textContent = "Portfolio content is loading with a temporary issue.";
  }
  if (summaryList) {
    summaryList.innerHTML = "<li>Please refresh the page once. If the issue continues, restart the local Python server.</li>";
  }
});

(() => {
  const reveal = document.getElementById("hero-identity-reveal");
  if (!reveal || window.matchMedia("(pointer: coarse)").matches) return;

  reveal.addEventListener("pointermove", (event) => {
    const rect = reveal.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    reveal.style.setProperty("--reveal-x", `${x}px`);
    reveal.style.setProperty("--reveal-y", `${y}px`);
    reveal.style.setProperty("--reveal-size", "160px");
    reveal.classList.add("is-revealing");
  });

  reveal.addEventListener("pointerleave", () => {
    reveal.style.setProperty("--reveal-size", "0px");
    reveal.classList.remove("is-revealing");
  });
})();