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
    });
    window.addEventListener("blur", () => {
      lastX = null;
      lastY = null;
      fastStartedAt = null;
      lastMoveAt = null;
      fastDistance = 0;
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
