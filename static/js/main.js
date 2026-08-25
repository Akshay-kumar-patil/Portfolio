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
      const titleFontSize = isMobile ? Math.min(34, w * 0.08) : Math.min(50, w * 0.052);

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
