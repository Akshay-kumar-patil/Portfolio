async function boot() {
  const response = await fetch("/api/profile.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Profile request failed with ${response.status}`);
  }
  const data = await response.json();

  const setText = (id, value) => {
    const node = document.getElementById(id);
    if (node) node.textContent = value;
  };

  setText("hero-name", data.hero.eyebrow);
  setText("headline", data.hero.headline);
  const summaryList = document.getElementById("summary-list");
  if (summaryList && Array.isArray(data.summary_points)) {
    summaryList.innerHTML = data.summary_points.map((point) => `<li>${point}</li>`).join("");
  } else {
    setText("summary-list", data.summary);
  }
  setText("contact-email", data.contact.email);

  const links = ["github-link", "footer-github"];
  links.forEach((id) => {
    const node = document.getElementById(id);
    if (node) node.href = data.contact.github;
  });

  ["linkedin-link", "footer-linkedin"].forEach((id) => {
    const node = document.getElementById(id);
    if (node) node.href = data.contact.linkedin;
  });

  ["resume-link", "footer-resume"].forEach((id) => {
    const node = document.getElementById(id);
    if (node) node.href = data.contact.resume;
  });

  const heroChips = document.getElementById("hero-chips");
  if (heroChips) {
    heroChips.innerHTML = data.hero.chips.map((item) => `<span class="hero-chip">${item}</span>`).join("");
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
      <article class="card">
        <h4>${item.degree}</h4>
        <p>${item.institution}</p>
        <div class="timeline">
          <div class="timeline-item"><strong>Duration</strong>${item.duration}</div>
          <div class="timeline-item"><strong>Metric</strong>${item.metric}</div>
        </div>
      </article>
    `).join("");
  }

  const skillsGrid = document.getElementById("skills-grid");
  if (skillsGrid) {
    skillsGrid.innerHTML = Object.entries(data.skills).map(([group, values]) => `
      <div class="skill-group">
        <h4>${group}</h4>
        <div class="skill-tags">
          ${values.map((value) => `<span class="skill-tag">${value}</span>`).join("")}
        </div>
      </div>
    `).join("");
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
      ctx.fillText("AI / ML ENGINEER & FULL STACK DEVELOPER", cx, cy + titleFontSize * 0.85);

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

  // ── Neural Activity Visualization Engine ──
  (function initNeuralActivity() {
    const drawCanvas = document.getElementById("neural-draw-canvas");
    const downCanvas = document.getElementById("neural-downsample-canvas");
    const graphCanvas = document.getElementById("neural-graph-canvas");
    if (!drawCanvas || !downCanvas || !graphCanvas) return;

    const drawCtx = drawCanvas.getContext("2d");
    const downCtx = downCanvas.getContext("2d");
    const graphCtx = graphCanvas.getContext("2d");
    const tooltip = document.getElementById("neural-tooltip");

    const predValEl = document.getElementById("neural-pred-val");
    const confBadgeEl = document.getElementById("neural-conf-badge");
    const probListEl = document.getElementById("neural-prob-list");

    const GRID_SIZE = 12;
    let isDrawing = false;
    let hasDrawn = false;
    let lastX = 0, lastY = 0;

    // ── Digit Template Classifier (Cosine Similarity) ──
    const FEATURE_NAMES = [
      "Top Region", "Upper-Mid Region", "Lower-Mid Region", "Bottom Region",
      "Left Edge", "Right Edge", "Center Mass", "Top-Left Quad",
      "Top-Right Quad", "Bottom-Left Quad"
    ];
    const AGGREGATOR_NAMES = [
      "Loop Detector", "Line Detector", "Curve Detector", "Cross Detector",
      "Arc Detector", "Diagonal Detector", "Corner Detector", "Density"
    ];

    // 10 hand-designed 12x12 digit templates (row-major, '1'=ink, each exactly 144 chars)
    const T = [
      "001111110000011000011000110000001100110000001100110000001100110000001100110000001100110000001100110000001100110000001100011000011000001111110000",
      "000011000000000111000000001111000000000011000000000011000000000011000000000011000000000011000000000011000000000011000000001111110000001111110000",
      "001111110000011000011000000000001100000000001100000000011000000000110000000011000000000110000000001100000000011000000000111111111111111111111111",
      "001111110000011000011000000000001100000000001100000011110000000011110000000000001100000000001100000000001100010000001100011000011000001111110000",
      "000000110000000001110000000011110000000110110000001100110000011000110000110000110000111111111111111111111111000000110000000000110000000000110000",
      "111111111100110000000000110000000000110000000000111111110000000000111000000000001100000000001100000000001100010000001100011000011000001111110000",
      "001111110000011000110000110000000000110000000000111111110000110000011000110000001100110000001100110000001100110000001100011000011000001111110000",
      "111111111111111111111111000000000011000000000110000000001100000000011000000000110000000001100000000001100000000011000000000011000000000011000000",
      "001111110000011000011000110000001100110000001100011000011000001111110000011000011000110000001100110000001100110000001100011000011000001111110000",
      "001111110000011000011000110000001100110000001100110000001100011000011000001111111100000000001100000000001100000000011000000000110000001111100000"
    ];

    // Parse templates into Float32Arrays
    const TEMPLATES = T.map(s => {
      const arr = new Float32Array(144);
      for (let i = 0; i < 144 && i < s.length; i++) arr[i] = s[i] === '1' ? 1.0 : 0.0;
      return arr;
    });

    // Multiple shifted/scaled variants per digit for robustness
    function shiftGrid(src, dx, dy) {
      const out = new Float32Array(144);
      for (let r = 0; r < 12; r++) {
        for (let c = 0; c < 12; c++) {
          const sr = r - dy, sc = c - dx;
          if (sr >= 0 && sr < 12 && sc >= 0 && sc < 12) out[r * 12 + c] = src[sr * 12 + sc];
        }
      }
      return out;
    }

    // Downsample drawing to 12x12 using canvas for proper anti-aliased scaling
    function extractInputs() {
      const cw = drawCanvas.width, ch = drawCanvas.height;
      const imgData = drawCtx.getImageData(0, 0, cw, ch);
      const data = imgData.data;

      // Find bounding box of drawn content
      let minX = cw, maxX = 0, minY = ch, maxY = 0;
      let hasContent = false;
      for (let y = 0; y < ch; y++) {
        for (let x = 0; x < cw; x++) {
          if (data[(y * cw + x) * 4] > 30) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
            hasContent = true;
          }
        }
      }

      const grid = new Float32Array(144);
      if (!hasContent) { renderDownsample(grid); return grid; }

      // Pad bounding box
      const pad = 12;
      minX = Math.max(0, minX - pad);
      maxX = Math.min(cw - 1, maxX + pad);
      minY = Math.max(0, minY - pad);
      maxY = Math.min(ch - 1, maxY + pad);

      // Make square crop centered on content
      const bw = maxX - minX + 1, bh = maxY - minY + 1;
      const size = Math.max(bw, bh);
      const cx = minX + bw / 2, cy = minY + bh / 2;
      const srcX = cx - size / 2, srcY = cy - size / 2;

      // Use a temp canvas for proper bilinear downsampling
      const tmp = document.createElement("canvas");
      tmp.width = 12; tmp.height = 12;
      const tc = tmp.getContext("2d");
      tc.fillStyle = "#000";
      tc.fillRect(0, 0, 12, 12);
      tc.imageSmoothingEnabled = true;
      tc.imageSmoothingQuality = "medium";
      tc.drawImage(drawCanvas, srcX, srcY, size, size, 1, 1, 10, 10);

      const outData = tc.getImageData(0, 0, 12, 12).data;
      for (let i = 0; i < 144; i++) grid[i] = Math.min(1.0, outData[i * 4] / 200);

      renderDownsample(grid);
      return grid;
    }

    function renderDownsample(grid) {
      downCtx.fillStyle = "#020409";
      downCtx.fillRect(0, 0, 48, 48);
      const px = 4;
      for (let r = 0; r < 12; r++) {
        for (let c = 0; c < 12; c++) {
          const v = grid[r * 12 + c];
          if (v > 0.03) {
            downCtx.fillStyle = `rgba(112, 232, 255, ${v})`;
            downCtx.fillRect(c * px, r * px, px - 0.5, px - 0.5);
          }
        }
      }
    }

    // Cosine similarity between two vectors
    function cosineSim(a, b) {
      let dot = 0, na = 0, nb = 0;
      for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        na += a[i] * a[i];
        nb += b[i] * b[i];
      }
      return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8);
    }

    // Classify by matching against templates with position tolerance
    function classify(grid) {
      const similarities = new Float32Array(10);

      for (let d = 0; d < 10; d++) {
        let best = -1;
        // Test original + small shifts for position tolerance
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const shifted = (dx === 0 && dy === 0) ? grid : shiftGrid(grid, dx, dy);
            const sim = cosineSim(shifted, TEMPLATES[d]);
            if (sim > best) best = sim;
          }
        }
        similarities[d] = best;
      }
      return similarities;
    }

    // Compute spatial features for visualization (10 features for hidden layer 1)
    function computeFeatures(grid) {
      const feats = new Float32Array(10);
      if (!hasDrawn) return feats;

      let topR = 0, upMid = 0, loMid = 0, botR = 0;
      let leftE = 0, rightE = 0, centerM = 0;
      let tl = 0, tr = 0, bl = 0;

      for (let r = 0; r < 12; r++) {
        for (let c = 0; c < 12; c++) {
          const v = grid[r * 12 + c];
          if (v < 0.05) continue;
          if (r < 3) topR += v;
          if (r >= 3 && r < 6) upMid += v;
          if (r >= 6 && r < 9) loMid += v;
          if (r >= 9) botR += v;
          if (c < 4) leftE += v;
          if (c >= 8) rightE += v;
          if (r >= 3 && r < 9 && c >= 3 && c < 9) centerM += v;
          if (r < 6 && c < 6) tl += v;
          if (r < 6 && c >= 6) tr += v;
          if (r >= 6 && c < 6) bl += v;
        }
      }
      const s = 0.1;
      feats[0] = Math.min(1, topR * s);
      feats[1] = Math.min(1, upMid * s);
      feats[2] = Math.min(1, loMid * s);
      feats[3] = Math.min(1, botR * s);
      feats[4] = Math.min(1, leftE * s);
      feats[5] = Math.min(1, rightE * s);
      feats[6] = Math.min(1, centerM * 0.06);
      feats[7] = Math.min(1, tl * 0.08);
      feats[8] = Math.min(1, tr * 0.08);
      feats[9] = Math.min(1, bl * 0.08);
      return feats;
    }

    // Compute aggregator features for visualization (8 features for hidden layer 2)
    function computeAggregators(feats, sims) {
      const agg = new Float32Array(8);
      if (!hasDrawn) return agg;
      agg[0] = Math.min(1, (feats[4] + feats[5]) * 0.6); // Loop
      agg[1] = Math.min(1, Math.abs(feats[4] - feats[5]) + feats[6] * 0.3); // Line
      agg[2] = Math.min(1, (feats[0] + feats[3]) * 0.5); // Curve
      agg[3] = Math.min(1, feats[6] * 0.8); // Cross
      agg[4] = Math.min(1, (feats[7] + feats[8]) * 0.4); // Arc
      agg[5] = Math.min(1, Math.max(sims[2], sims[7]) * 0.9); // Diagonal
      agg[6] = Math.min(1, (feats[0] * feats[4]) * 2); // Corner
      agg[7] = Math.min(1, (feats[0]+feats[1]+feats[2]+feats[3])*0.2); // Density
      return agg;
    }

    // Full forward pass: extract → classify → derive activations for graph
    function forwardPass(grid) {
      const feats = computeFeatures(grid);
      const sims = hasDrawn ? classify(grid) : new Float32Array(10);
      const agg = computeAggregators(feats, sims);

      // Softmax over similarities to get probabilities
      const probs = new Float32Array(10);
      if (hasDrawn) {
        let maxS = -999;
        for (let d = 0; d < 10; d++) if (sims[d] > maxS) maxS = sims[d];
        let sumExp = 0;
        for (let d = 0; d < 10; d++) {
          probs[d] = Math.exp((sims[d] - maxS) * 12);
          sumExp += probs[d];
        }
        for (let d = 0; d < 10; d++) probs[d] /= sumExp;
      } else {
        for (let d = 0; d < 10; d++) probs[d] = 0.1;
      }

      // Return activations compatible with the graph visualization
      // inputs = first 10 features (used by graph layer 0, indexed as *2 for display)
      const inputs = new Float32Array(20);
      for (let i = 0; i < 10; i++) { inputs[i * 2] = feats[i]; inputs[i * 2 + 1] = feats[i] * 0.5; }

      return { inputs, a1: feats, a2: agg, probs, sims };
    }

    let currentNetworkState = forwardPass(new Float32Array(144));

    function renderOutputUI(probs) {
      if (!probListEl) return;

      let topDigit = 0;
      let maxProb = -1;
      for (let d = 0; d < 10; d++) {
        if (probs[d] > maxProb) {
          maxProb = probs[d];
          topDigit = d;
        }
      }

      const confPct = hasDrawn ? (maxProb * 100).toFixed(1) : "0.0";

      if (predValEl) predValEl.textContent = hasDrawn ? topDigit : "?";
      if (confBadgeEl) confBadgeEl.textContent = `${confPct}%`;

      probListEl.innerHTML = Array.from({ length: 10 }, (_, d) => {
        const pPct = (probs[d] * 100).toFixed(1);
        const isActive = hasDrawn && d === topDigit;
        return `
          <div class="prob-item ${isActive ? 'active' : ''}">
            <span class="prob-digit">${d}</span>
            <div class="prob-bar-track">
              <div class="prob-bar-fill" style="width: ${hasDrawn ? pPct : 0}%"></div>
            </div>
            <span class="prob-val">${pPct}%</span>
          </div>
        `;
      }).join('');
    }

    function processDrawing() {
      const grid = extractInputs();
      currentNetworkState = forwardPass(grid);
      renderOutputUI(currentNetworkState.probs);
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
      const rect = drawCanvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) * (drawCanvas.width / rect.width),
        y: (clientY - rect.top) * (drawCanvas.height / rect.height)
      };
    }

    function startDraw(e) {
      isDrawing = true;
      hasDrawn = true;
      const pos = getPos(e);
      lastX = pos.x;
      lastY = pos.y;
      drawCtx.beginPath();
      drawCtx.arc(lastX, lastY, 7, 0, Math.PI * 2);
      drawCtx.fillStyle = "#70e8ff";
      drawCtx.fill();
      processDrawing();
    }

    function moveDraw(e) {
      if (!isDrawing) return;
      const pos = getPos(e);
      drawCtx.beginPath();
      drawCtx.moveTo(lastX, lastY);
      drawCtx.lineTo(pos.x, pos.y);
      drawCtx.strokeStyle = "#70e8ff";
      drawCtx.lineWidth = 14;
      drawCtx.lineCap = "round";
      drawCtx.lineJoin = "round";
      drawCtx.shadowColor = "rgba(112, 232, 255, 0.8)";
      drawCtx.shadowBlur = 8;
      drawCtx.stroke();
      lastX = pos.x;
      lastY = pos.y;
      processDrawing();
    }

    function stopDraw() {
      if (isDrawing) {
        isDrawing = false;
        drawCtx.shadowBlur = 0;
        processDrawing();
      }
    }

    document.getElementById("neural-clear-btn")?.addEventListener("click", clearDrawing);
    drawCanvas.addEventListener("mousedown", startDraw);
    drawCanvas.addEventListener("mousemove", moveDraw);
    window.addEventListener("mouseup", stopDraw);
    drawCanvas.addEventListener("touchstart", (e) => { e.preventDefault(); startDraw(e); }, { passive: false });
    drawCanvas.addEventListener("touchmove", (e) => { e.preventDefault(); moveDraw(e); }, { passive: false });
    drawCanvas.addEventListener("touchend", stopDraw);

    // ── Real-Time Interactive Network Canvas Renderer & Hover Inspector ──
    let nodePositions = [];
    let connectionLines = [];
    let hoveredObject = null;
    let pulses = [];

    function setupGraphLayout() {
      const wrap = graphCanvas.parentElement;
      const w = wrap.offsetWidth || wrap.getBoundingClientRect().width || 500;
      const h = Math.max(280, wrap.offsetHeight || wrap.getBoundingClientRect().height || 300);

      graphCanvas.width = w;
      graphCanvas.height = h;

      nodePositions = [];
      connectionLines = [];

      const layerCounts = [10, 8, 6, 10]; // Rendered representative nodes per layer
      const layerNames = ["Input Layer", "Hidden Layer 1", "Hidden Layer 2", "Output Layer"];
      const colX = [w * 0.12, w * 0.38, w * 0.64, w * 0.88];

      for (let l = 0; l < 4; l++) {
        const count = layerCounts[l];
        const stepY = h / (count + 1);
        for (let n = 0; n < count; n++) {
          nodePositions.push({
            id: `L${l}_N${n}`,
            layer: l,
            layerName: layerNames[l],
            index: n,
            x: colX[l],
            y: stepY * (n + 1),
            radius: l === 3 ? 9 : 7
          });
        }
      }

      // Build Connections L0->L1, L1->L2, L2->L3
      const layerNodes = [
        nodePositions.filter(n => n.layer === 0),
        nodePositions.filter(n => n.layer === 1),
        nodePositions.filter(n => n.layer === 2),
        nodePositions.filter(n => n.layer === 3)
      ];

      // Generate visual connection weights using seeded pseudo-random
      for (let l = 0; l < 3; l++) {
        const srcGroup = layerNodes[l];
        const dstGroup = layerNodes[l + 1];
        srcGroup.forEach((src, i) => {
          dstGroup.forEach((dst, j) => {
            const seed = (l * 1000 + i * 37 + j * 13) % 100;
            const wVal = Math.sin(seed * 0.7) * 0.8 + Math.cos(seed * 1.3) * 0.3;
            connectionLines.push({
              src, dst, layer: l, srcIdx: i, dstIdx: j, weight: wVal
            });
          });
        });
      }
    }

    function drawGraph(t) {
      const w = graphCanvas.width;
      const h = graphCanvas.height;

      graphCtx.clearRect(0, 0, w, h);

      // Background mesh pattern
      graphCtx.fillStyle = "#02050b";
      graphCtx.fillRect(0, 0, w, h);

      const { inputs, a1, a2, probs } = currentNetworkState;
      const getAct = (l, idx) => {
        if (l === 0) return inputs[idx * 2] || 0;
        if (l === 1) return a1[idx] || 0;
        if (l === 2) return a2[idx] || 0;
        return probs[idx] || 0;
      };

      // 1. Draw Connections
      connectionLines.forEach((conn) => {
        const srcAct = getAct(conn.layer, conn.srcIdx);
        const dstAct = getAct(conn.layer + 1, conn.dstIdx);
        const signal = Math.abs(conn.weight * srcAct);
        const isHovered = hoveredObject && hoveredObject.type === "conn" && hoveredObject.data === conn;

        graphCtx.beginPath();
        graphCtx.moveTo(conn.src.x, conn.src.y);
        graphCtx.lineTo(conn.dst.x, conn.dst.y);

        if (isHovered) {
          graphCtx.strokeStyle = conn.weight > 0 ? "#73ffe1" : "#ff7070";
          graphCtx.lineWidth = 2.8;
        } else if (signal > 0.08 && hasDrawn) {
          const alpha = Math.min(0.8, 0.15 + signal * 0.7);
          graphCtx.strokeStyle = conn.weight > 0 ? `rgba(112, 232, 255, ${alpha})` : `rgba(255, 120, 120, ${alpha})`;
          graphCtx.lineWidth = Math.min(2.5, 0.6 + signal * 2);
        } else {
          graphCtx.strokeStyle = "rgba(255, 255, 255, 0.05)";
          graphCtx.lineWidth = 0.5;
        }

        graphCtx.stroke();
      });

      // 2. Animated Propagation Pulses
      if (hasDrawn && Math.random() < 0.3) {
        const activeConns = connectionLines.filter(c => getAct(c.layer, c.srcIdx) > 0.2);
        if (activeConns.length > 0) {
          const c = activeConns[Math.floor(Math.random() * activeConns.length)];
          pulses.push({
            x: c.src.x, y: c.src.y,
            tx: c.dst.x, ty: c.dst.y,
            progress: 0,
            color: c.weight > 0 ? "#70e8ff" : "#ff9e43"
          });
        }
      }

      pulses.forEach((p, idx) => {
        p.progress += 0.04;
        const curX = p.x + (p.tx - p.x) * p.progress;
        const curY = p.y + (p.ty - p.y) * p.progress;
        graphCtx.beginPath();
        graphCtx.arc(curX, curY, 2.5, 0, Math.PI * 2);
        graphCtx.fillStyle = p.color;
        graphCtx.shadowColor = p.color;
        graphCtx.shadowBlur = 6;
        graphCtx.fill();
        graphCtx.shadowBlur = 0;
      });
      pulses = pulses.filter(p => p.progress < 1.0);

      // 3. Draw Neurons
      nodePositions.forEach((node) => {
        const act = getAct(node.layer, node.index);
        const isHovered = hoveredObject && hoveredObject.type === "node" && hoveredObject.data === node;

        graphCtx.beginPath();
        graphCtx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);

        if (isHovered) {
          graphCtx.fillStyle = "#ffffff";
          graphCtx.shadowColor = "#70e8ff";
          graphCtx.shadowBlur = 14;
          graphCtx.strokeStyle = "#70e8ff";
          graphCtx.lineWidth = 2.5;
        } else if (hasDrawn && act > 0.1) {
          if (node.layer === 3) {
            graphCtx.fillStyle = `rgba(255, 158, 67, ${0.4 + act * 0.6})`;
            graphCtx.shadowColor = "rgba(255, 158, 67, 0.8)";
            graphCtx.strokeStyle = "#ffb86c";
          } else {
            graphCtx.fillStyle = `rgba(112, 232, 255, ${0.3 + act * 0.7})`;
            graphCtx.shadowColor = "rgba(112, 232, 255, 0.8)";
            graphCtx.strokeStyle = "#70e8ff";
          }
          graphCtx.shadowBlur = 8 + act * 8;
          graphCtx.lineWidth = 1.8;
        } else {
          graphCtx.fillStyle = "rgba(20, 35, 55, 0.8)";
          graphCtx.strokeStyle = "rgba(120, 220, 255, 0.2)";
          graphCtx.lineWidth = 1.2;
          graphCtx.shadowBlur = 0;
        }

        graphCtx.fill();
        graphCtx.stroke();
        graphCtx.shadowBlur = 0;

        // Label for Output Layer Neurons
        if (node.layer === 3) {
          graphCtx.fillStyle = act > 0.3 ? "#ffb86c" : "rgba(255, 255, 255, 0.6)";
          graphCtx.font = "bold 11px monospace";
          graphCtx.textAlign = "center";
          graphCtx.textBaseline = "middle";
          graphCtx.fillText(node.index.toString(), node.x, node.y);
        }
      });
    }

    function graphLoop(time) {
      const t = time * 0.001;
      drawGraph(t);
      requestAnimationFrame(graphLoop);
    }

    // Pointer Hover Inspection
    graphCanvas.addEventListener("pointermove", (e) => {
      const r = graphCanvas.getBoundingClientRect();
      const mx = e.clientX - r.left;
      const my = e.clientY - r.top;

      let found = null;

      // Check Nodes
      for (let i = 0; i < nodePositions.length; i++) {
        const n = nodePositions[i];
        if (Math.hypot(n.x - mx, n.y - my) < n.radius + 6) {
          found = { type: "node", data: n };
          break;
        }
      }

      // Check Connections if no node found
      if (!found) {
        for (let i = 0; i < connectionLines.length; i++) {
          const c = connectionLines[i];
          const d = distToSegment({ x: mx, y: my }, c.src, c.dst);
          if (d < 5) {
            found = { type: "conn", data: c };
            break;
          }
        }
      }

      hoveredObject = found;

      if (found && tooltip) {
        tooltip.style.display = "block";
        tooltip.style.left = `${Math.min(r.width - 210, Math.max(10, mx + 12))}px`;
        tooltip.style.top = `${Math.min(r.height - 110, Math.max(10, my - 20))}px`;

        if (found.type === "node") {
          const n = found.data;
          const { inputs, a1, a2, probs } = currentNetworkState;
          const act = n.layer === 0 ? inputs[n.index * 2] || 0
                    : n.layer === 1 ? a1[n.index] || 0
                    : n.layer === 2 ? a2[n.index] || 0
                    : probs[n.index] || 0;
          const bias = 0;
          const desc = n.layer === 0 ? FEATURE_NAMES[n.index] || `Input ${n.index}` : n.layer === 1 ? FEATURE_NAMES[n.index] : n.layer === 2 ? AGGREGATOR_NAMES[n.index] : `Digit Class ${n.index}`;

          tooltip.innerHTML = `
            <div style="font-weight:700; color:#79dcff; margin-bottom:3px;">Neuron ${n.id}</div>
            <div><b>Layer:</b> ${n.layerName}</div>
            <div><b>Activation:</b> <span style="color:#73ffe1;">${act.toFixed(3)}</span></div>
            <div><b>Bias:</b> ${bias.toFixed(2)}</div>
            <div style="margin-top:3px; font-size:0.68rem; color:#ffb86c;"><b>Feature:</b> ${desc}</div>
          `;
        } else {
          const c = found.data;
          const srcAct = c.layer === 0 ? currentNetworkState.inputs[c.srcIdx * 2] || 0 : currentNetworkState.a1[c.srcIdx] || 0;
          const contrib = c.weight * srcAct;

          tooltip.innerHTML = `
            <div style="font-weight:700; color:#ffb86c; margin-bottom:3px;">Synapse Connection</div>
            <div><b>Source:</b> ${c.src.id} &rarr; ${c.dst.id}</div>
            <div><b>Weight:</b> <span style="color:${c.weight > 0 ? '#73ffe1' : '#ff8a8a'}">${c.weight.toFixed(3)}</span></div>
            <div><b>Contribution:</b> ${contrib.toFixed(3)}</div>
            <div><b>Effect:</b> ${c.weight > 0 ? 'Exciting (+)' : 'Inhibiting (-)'}</div>
          `;
        }
      } else if (tooltip) {
        tooltip.style.display = "none";
      }
    });

    graphCanvas.addEventListener("pointerleave", () => {
      hoveredObject = null;
      if (tooltip) tooltip.style.display = "none";
    });

    function distToSegment(p, v, w) {
      const l2 = (w.x - v.x) ** 2 + (w.y - v.y) ** 2;
      if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
      let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
      t = Math.max(0, Math.min(1, t));
      return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
    }

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(setupGraphLayout, 150);
    });

    // Defer until the wrapper has real pixel dimensions
    const graphWrap = graphCanvas.parentElement;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 10 && height > 10) {
          setupGraphLayout();
          ro.disconnect();
          break;
        }
      }
    });
    ro.observe(graphWrap);

    // Also try immediately in case dimensions are already set
    requestAnimationFrame(() => {
      const rect = graphWrap.getBoundingClientRect();
      if (rect.width > 10 && rect.height > 10) {
        setupGraphLayout();
        ro.disconnect();
      }
    });

    requestAnimationFrame(graphLoop);
    clearDrawing();
    renderOutputUI(currentNetworkState.probs);
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
