async function boot() {
  const response = await fetch("/api/profile.json", { cache: "no-store" });
  const data = await response.json();

  const setText = (id, value) => {
    const node = document.getElementById(id);
    if (node) node.textContent = value;
  };

  setText("headline", data.name);
  setText("summary", data.summary);
  setText("role", data.title);
  setText("location", data.location);
  setText("education-tag", data.education_tag);
  setText("email", data.contact.email);

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

  const skillsGrid = document.getElementById("skills-grid");
  skillsGrid.innerHTML = Object.entries(data.skills).map(([group, values]) => `
    <div class="skill-group">
      <h4>${group}</h4>
      <div class="skill-tags">
        ${values.map((value) => `<span class="skill-tag">${value}</span>`).join("")}
      </div>
    </div>
  `).join("");

  const achievementsRow = document.getElementById("achievements-row");
  achievementsRow.innerHTML = data.achievements.map((item) => `<span class="badge">${item}</span>`).join("");

  const openingScreen = document.getElementById("opening-screen");
  const enterButton = document.getElementById("enter-button");
  const dismissOpening = () => openingScreen?.classList.add("hide");
  window.setTimeout(dismissOpening, 4200);
  enterButton?.addEventListener("click", dismissOpening);

  const revealTargets = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
      }
    });
  }, { threshold: 0.18 });

  revealTargets.forEach((node) => observer.observe(node));

  const hero = document.getElementById("hero");
  window.addEventListener("mousemove", (event) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 10;
    const y = (event.clientY / window.innerHeight - 0.5) * 10;
    hero?.style.setProperty("--parallax-x", `${x}px`);
    hero?.style.setProperty("--parallax-y", `${y}px`);
  });
}

boot().catch((error) => {
  console.error("Portfolio failed to load", error);
});
