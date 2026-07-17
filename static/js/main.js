async function boot() {
  const response = await fetch("/api/profile.json", { cache: "no-store" });
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
  setText("role", data.title);
  setText("location", data.location);
  setText("education-tag", data.education_tag);
  setText("email", data.contact.email);
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
  heroChips.innerHTML = data.hero.chips.map((item) => `<span class="hero-chip">${item}</span>`).join("");

  const heroMetrics = document.getElementById("hero-metrics");
  heroMetrics.innerHTML = data.metrics.map((metric) => `
    <article class="metric-card">
      <span class="metric-value">${metric.value}</span>
      <span class="metric-label">${metric.label}</span>
    </article>
  `).join("");

  const projectsGrid = document.getElementById("projects-grid");
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

  const skillsGrid = document.getElementById("skills-grid");
  skillsGrid.innerHTML = Object.entries(data.skills).map(([group, values]) => `
    <div class="skill-group">
      <h4>${group}</h4>
      <div class="skill-tags">
        ${values.map((value) => `<span class="skill-tag">${value}</span>`).join("")}
      </div>
    </div>
  `).join("");

  const domainBoard = document.getElementById("domain-mastery");
  domainBoard.innerHTML = data.domain_mastery.map((group) => `
    <section class="domain-group">
      <div class="domain-title">
        <span class="domain-icon">${group.icon}</span>
        <h4>${group.name}</h4>
      </div>
      <div class="domain-tags">
        ${group.items.map((item) => `<span class="domain-tag">${item}</span>`).join("")}
      </div>
    </section>
  `).join("");

  const achievementsRow = document.getElementById("achievements-row");
  achievementsRow.innerHTML = data.achievements.map((item) => `<span class="badge">${item}</span>`).join("");

  const openingScreen = document.getElementById("opening-screen");
  const enterButton = document.getElementById("enter-button");
  const dismissOpening = () => {
    if (!openingScreen || openingScreen.classList.contains("hide")) return;
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
    document.body.classList.add("resume-open");
  };
  const closeResume = () => {
    modal?.classList.remove("open");
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
});
