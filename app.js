const SUPPORT_EMAIL = "pilots@yourcompany.com";

/* ── State ────────────────────────────────────────── */
let activeCategory = "all";

/* ── Helpers ──────────────────────────────────────── */
function $(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element: #${id}`);
  return el;
}

function readSolutions() {
  try {
    const data = JSON.parse($("solutionsData").textContent || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function uniq(values) {
  return Array.from(new Set(values)).filter(Boolean).sort((a, b) => a.localeCompare(b));
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalize(s) {
  return String(s || "").trim().toLowerCase();
}

/* ── Category Color Map ───────────────────────────── */
const CATEGORY_COLORS = {
  "Infrastructure":           { bar: "#1434cb", badge: "#eef0fc", text: "#1434cb" },
  "DISBURSEMENT":             { bar: "#2C6849", badge: "#e8f5ee", text: "#2C6849" },
  "Marketplace":              { bar: "#875903", badge: "#fef3d0", text: "#875903" },
  "PAYOUT INFRASTRUCTURE":    { bar: "#005e8a", badge: "#e0f3fb", text: "#005e8a" },
  "DISBURSEMENT & ISSUANCE":  { bar: "#0088c7", badge: "#dff0f9", text: "#0088c7" },
};

function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || { bar: "#1434cb", badge: "#eef0fc", text: "#1434cb" };
}

/* ── Status ───────────────────────────────────────── */
const STATUS_MAP = {
  0: { label: "Initiated",      fill: "0%"  },
  1: { label: "Under Contract", fill: "25%" },
  2: { label: "POC Ready",      fill: "50%" },
  3: { label: "Pilot Running",  fill: "75%" },
  4: { label: "In Production",  fill: "100%" },
};

function getStatusIndex(solution) {
  if (solution.statusIndex !== undefined) return solution.statusIndex;
  if (solution.isOss)         return 4;
  if (solution.pilotRunning)  return 3;
  if (solution.mvpReady)      return 2;
  return 1;
}

/* ── Blueprint URL ────────────────────────────────── */
function getBlueprintUrl(solution) {
  if (!solution.masterDeckReady) return null;
  if (solution.id === "dps-prosperidad") return "https://dps-indol.vercel.app/";
  if (solution.repoUrl && solution.repoUrl !== "#") return solution.repoUrl;
  return null;
}

/* ── Card Template ────────────────────────────────── */
function cardTemplate(solution) {
  const color       = getCategoryColor(solution.category || "");
  const statusIdx   = getStatusIndex(solution);
  const status      = STATUS_MAP[statusIdx] || STATUS_MAP[1];
  const features    = (Array.isArray(solution.features) ? solution.features : []).slice(0, 3);
  const isDisabled   = Boolean(solution.disabled);
  const disabledLabel = solution.disabledLabel || "Paused";
  const tryUrl      = solution.tryUrl && solution.tryUrl !== "#" ? solution.tryUrl : null;
  const githubUrl   = solution.githubUrl && solution.githubUrl !== "#" ? solution.githubUrl : null;
  const blueprintUrl = getBlueprintUrl(solution);
  const videoUrl    = solution.videoUrl || null;

  /* ── Badges ── */
  const badgesHtml = [
    solution.isOss         && `<span class="badge badge--oss">OSS First</span>`,
    solution.mvpReady      && `<span class="badge badge--poc">POC Ready</span>`,
    solution.pilotRunning  && `<span class="badge badge--pilot">Pilot Running</span>`,
    solution.githubReady   && `<span class="badge badge--github">GitHub</span>`,
    solution.masterDeckReady && `<span class="badge badge--blueprint">Blueprint</span>`,
  ].filter(Boolean).join("");

  /* ── Partners ── */
  let partnersHtml = "";
  if (solution.id === "aavance-ngo") {
    partnersHtml = `
      <div class="card__partners">
        <span class="card__partners-label">Partner</span>
        <svg width="24" height="24" viewBox="0 0 100 100" fill="none" aria-hidden="true">
          <path d="M15 85C25 55 50 40 85 45" stroke="#2582c1" stroke-width="14" stroke-linecap="round"/>
          <path d="M30 95C45 65 75 50 95 60" stroke="#004b87" stroke-width="14" stroke-linecap="round"/>
          <circle cx="28" cy="78" r="9" fill="#c1272d"/>
        </svg>
        <span style="font-weight:800;font-size:20px;color:#0066b3;letter-spacing:-0.02em;font-family:var(--font)">AAvance</span>
      </div>`;
  } else if (solution.id === "kyc-kyb") {
    partnersHtml = `
      <div class="card__partners">
        <span class="card__partners-label">Partners</span>
        <img src="./assets/images/valid-logo.png" alt="Valid" style="height:32px;width:auto;object-fit:contain;">
        <img src="./assets/images/hst-logo.png" alt="HST" style="height:22px;width:auto;object-fit:contain;">
      </div>`;
  } else if (solution.id === "dps-prosperidad") {
    partnersHtml = `
      <div class="card__partners">
        <span class="card__partners-label">Partner</span>
        <svg width="24" height="24" viewBox="0 0 100 100" fill="none" aria-hidden="true">
          <rect width="100" height="33" fill="#FCD116"/>
          <rect y="33" width="100" height="33" fill="#003893"/>
          <rect y="66" width="100" height="34" fill="#CE1126"/>
        </svg>
        <span style="font-weight:800;font-size:15px;color:#003893;font-family:var(--font)">Prosperidad Social</span>
      </div>`;
  }

  /* ── CTA Buttons ── */
  const demoBtn = (tryUrl && !isDisabled)
    ? `<a class="btn btn--primary btn--sm" href="${escapeHtml(tryUrl)}" target="_blank" rel="noreferrer noopener">▶ Try Demo</a>`
    : `<span class="btn btn--muted btn--sm" aria-disabled="true">▶ Try Demo</span>`;

  const blueprintBtn = (blueprintUrl && !isDisabled)
    ? `<a class="btn btn--ghost btn--sm" href="${escapeHtml(blueprintUrl)}" target="_blank" rel="noreferrer">Blueprint</a>`
    : `<span class="btn btn--muted btn--sm" aria-disabled="true">Blueprint</span>`;

  const githubBtn = (githubUrl && !isDisabled)
    ? `<a class="btn btn--dark btn--sm" href="${escapeHtml(githubUrl)}" target="_blank" rel="noreferrer">GitHub</a>`
    : `<span class="btn btn--muted btn--sm" aria-disabled="true">GitHub</span>`;

  const videoBtn = videoUrl
    ? `<button class="btn btn--video btn--sm" type="button"
         data-action="video" data-video-url="${escapeHtml(videoUrl)}">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
        Watch Video
       </button>`
    : "";

  return `
    <article class="card${isDisabled ? " card--disabled" : ""}" data-solution-id="${escapeHtml(solution.id)}">
      <!-- Category color bar -->
      <div class="card__color-bar" style="background:${color.bar}"></div>

      ${isDisabled ? `
      <div class="card__disabled-overlay" aria-hidden="true">
        <span class="card__disabled-badge">${escapeHtml(disabledLabel)}</span>
      </div>` : ""}

      ${solution.hackathonLabel
        ? `<div class="card__ribbon">${escapeHtml(solution.hackathonLabel)}</div>`
        : ""}

      <div class="card__body">
        <!-- Top row: category + badges -->
        <div class="card__top-row">
          <span class="card__category"
            style="background:${color.badge};color:${color.text}">
            ${escapeHtml(solution.category || "General")}
          </span>
          <div class="card__badges-top">${badgesHtml}</div>
        </div>

        <!-- Name -->
        <h3 class="card__name">${escapeHtml(solution.name)}</h3>

        <!-- Summary -->
        <p class="card__summary">${escapeHtml(solution.summary || "")}</p>

        <!-- Features -->
        <ul class="card__features" aria-label="Key features">
          ${features.map(f => `
            <li>
              <span class="card__feature-dot" style="background:${color.bar}" aria-hidden="true"></span>
              <span>${escapeHtml(f)}</span>
            </li>`).join("")}
        </ul>

        <!-- Use case -->
        <p class="card__usecase">
          <strong>Use case:</strong> ${escapeHtml(solution.useCase || "")}
        </p>

        ${partnersHtml}

        <!-- Status bar -->
        <div class="card__status" aria-label="Implementation status: ${status.label}">
          <div class="card__status-track">
            <div class="card__status-fill" data-fill="${status.fill}"
              style="background:${color.bar}"></div>
          </div>
          <span class="card__status-label">${status.label}</span>
        </div>

        <!-- CTA Buttons -->
        <div class="card__footer">
          ${demoBtn}
          ${blueprintBtn}
          ${githubBtn}
          ${videoBtn}
        </div>
      </div>
    </article>
  `;
}

/* ── Filter Tabs ──────────────────────────────────── */
function buildFilterTabs(solutions) {
  const tabsEl   = $("filterTabs");
  const categories = uniq(solutions.map(s => s.category || "General"));

  for (const cat of categories) {
    const btn = document.createElement("button");
    btn.className = "filter-tab";
    btn.dataset.category = cat;
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", "false");
    btn.textContent = cat;
    tabsEl.appendChild(btn);
  }

  tabsEl.addEventListener("click", (e) => {
    const tab = e.target.closest(".filter-tab");
    if (!tab) return;
    tabsEl.querySelectorAll(".filter-tab").forEach(t => {
      t.classList.remove("filter-tab--active");
      t.setAttribute("aria-selected", "false");
    });
    tab.classList.add("filter-tab--active");
    tab.setAttribute("aria-selected", "true");
    activeCategory = tab.dataset.category;
  });
}

/* ── Matching ─────────────────────────────────────── */
function matchesSolution(solution, query, category) {
  if (category !== "all" && String(solution.category || "") !== category) return false;
  if (!query) return true;

  const haystack = [
    solution.name,
    solution.category,
    solution.summary,
    solution.useCase,
    ...(Array.isArray(solution.features) ? solution.features : []),
  ].map(normalize).join(" · ");

  return haystack.includes(query);
}

/* ── Render ───────────────────────────────────────── */
function render(solutions) {
  const grid   = $("solutionsGrid");
  const empty  = $("emptyState");
  const meta   = $("resultsMeta");

  const query    = normalize($("search").value);
  const category = activeCategory;

  const filtered = solutions.filter(s => matchesSolution(s, query, category));
  grid.innerHTML  = filtered.map(cardTemplate).join("");
  empty.hidden    = filtered.length !== 0;

  meta.textContent = filtered.length === solutions.length
    ? `${solutions.length} solutions`
    : `${filtered.length} of ${solutions.length} solutions`;

  /* Animate status fill bars after render */
  requestAnimationFrame(() => {
    grid.querySelectorAll(".card__status-fill").forEach(el => {
      const target = el.dataset.fill || "0%";
      el.style.width = target;
    });
  });
}

/* ── Email Draft ──────────────────────────────────── */
function buildMailto(payload) {
  const subject = `Demo request: ${payload.solution || "Turnkey solution"}`;
  const body = [
    `Solution: ${payload.solution || ""}`,
    `Reference: ${payload.repo || ""}`,
    "",
    `Company: ${payload.company || ""}`,
    `Name: ${payload.name || ""}`,
    `Email: ${payload.email || ""}`,
    `Timeline: ${payload.timeline || ""}`,
    `NDA preferred: ${payload.nda ? "Yes" : "No"}`,
    "",
    "Goals / context:",
    payload.notes || "",
  ].join("\n");

  const params = new URLSearchParams({ subject, body });
  return `mailto:${encodeURIComponent(SUPPORT_EMAIL)}?${params.toString()}`;
}

function buildDraft(payload) {
  const subject = `Demo request: ${payload.solution || "Turnkey solution"}`;
  const body = [
    `Solution: ${payload.solution || ""}`,
    `Reference: ${payload.repo || ""}`,
    "",
    `Company: ${payload.company || ""}`,
    `Name: ${payload.name || ""}`,
    `Email: ${payload.email || ""}`,
    `Timeline: ${payload.timeline || ""}`,
    `NDA preferred: ${payload.nda ? "Yes" : "No"}`,
    "",
    "Goals / context:",
    payload.notes || "",
  ].join("\n");
  return { to: SUPPORT_EMAIL, subject, body };
}

function payloadFromForm(form) {
  const fd = new FormData(form);
  return {
    solution: String(fd.get("solution") || ""),
    repo:     String(fd.get("repo")     || ""),
    company:  String(fd.get("company")  || ""),
    name:     String(fd.get("name")     || ""),
    email:    String(fd.get("email")    || ""),
    timeline: String(fd.get("timeline") || ""),
    notes:    String(fd.get("notes")    || ""),
    nda:      Boolean(fd.get("nda")),
  };
}

function copyRequest(payload) {
  const text = [
    `Demo request — ${payload.solution}`,
    `Ref: ${payload.repo}`,
    `Company: ${payload.company}`,
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Timeline: ${payload.timeline}`,
    `NDA preferred: ${payload.nda ? "Yes" : "No"}`,
    "",
    payload.notes,
  ].join("\n");
  return navigator.clipboard.writeText(text);
}

/* ── Modal ────────────────────────────────────────── */
function openModalForSolution(solution) {
  const modal = $("pilotModal");
  $("solution").value  = solution?.name || "General demo inquiry";
  $("repo").value      = solution?.repoUrl || "";
  $("company").value   = "";
  $("name").value      = "";
  $("email").value     = "";
  $("timeline").value  = "";
  $("notes").value     = "";
  $("nda").checked     = false;
  $("draftTo").value   = SUPPORT_EMAIL;
  $("draftSubject").value = "";
  $("draftBody").value = "";
  $("openEmail").setAttribute("href", "#");
  $("pilotHint").textContent =
    "Generate a draft, then copy/paste into your email client (no data is sent from this page).";
  modal.showModal();
  $("company").focus();
}

function setupModalHandlers() {
  const modal = $("pilotModal");
  $("closeModal").addEventListener("click", () => modal.close());

  modal.addEventListener("click", (e) => {
    const rect = modal.getBoundingClientRect();
    const inside =
      rect.top    <= e.clientY && e.clientY <= rect.top    + rect.height &&
      rect.left   <= e.clientX && e.clientX <= rect.left   + rect.width;
    if (!inside) modal.close();
  });

  $("submitPilot").addEventListener("click", () => {
    const payload = payloadFromForm($("pilotForm"));
    const draft   = buildDraft(payload);
    $("draftTo").value      = draft.to;
    $("draftSubject").value = draft.subject;
    $("draftBody").value    = draft.body;
    $("openEmail").setAttribute("href", buildMailto(payload));
    $("pilotHint").textContent =
      "Draft generated. Copy/paste into your email, or use 'Open email app' if configured.";
  });

  $("copyPilot").addEventListener("click", async () => {
    const payload = payloadFromForm($("pilotForm"));
    try {
      await copyRequest(payload);
      $("pilotHint").textContent = "Copied to clipboard.";
    } catch {
      $("pilotHint").textContent = "Copy failed in this browser. Use 'Open email app' instead.";
    }
  });
}

/* ── Video Lightbox ───────────────────────────────── */
function getYouTubeId(url) {
  try {
    const u = new URL(url);
    return u.searchParams.get("v") || u.pathname.split("/").pop();
  } catch { return null; }
}

function setupLightbox() {
  const lb       = document.getElementById("videoLightbox");
  const content  = document.getElementById("lbContent");
  const closeBtn = document.getElementById("lbClose");
  const backdrop = document.getElementById("lbBackdrop");
  if (!lb) return;

  function open(videoUrl) {
    const ytId = getYouTubeId(videoUrl);
    const thumb = ytId
      ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`
      : null;

    content.innerHTML = `
      <div class="lb-preview">
        ${thumb ? `<img class="lb-preview__thumb" src="${escapeHtml(thumb)}"
          onerror="this.src='https://img.youtube.com/vi/${ytId}/hqdefault.jpg'"
          alt="Video preview" />` : ""}
        <div class="lb-preview__overlay">
          <div class="lb-preview__play" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
          <p class="lb-preview__title">AAvance NGO Disbursement</p>
          <p class="lb-preview__sub">This video cannot be embedded — watch it directly on YouTube.</p>
          <a class="btn btn--video lb-preview__cta"
             href="${escapeHtml(videoUrl)}" target="_blank" rel="noreferrer noopener">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
            </svg>
            Watch on YouTube
          </a>
        </div>
      </div>`;

    lb.hidden = false;
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }

  function close() {
    lb.hidden = true;
    content.innerHTML = "";
    document.body.style.overflow = "";
  }

  closeBtn.addEventListener("click", close);
  backdrop.addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !lb.hidden) close();
  });

  document.getElementById("solutionsGrid").addEventListener("click", (e) => {
    const btn = e.target.closest('[data-action="video"]');
    if (!btn) return;
    open(btn.dataset.videoUrl);
  });
}

/* ── Nav user display ─────────────────────────────── */
function updateNavUser(user) {
  try {
    const el = document.getElementById("navUser");
    const logoutBtn = document.getElementById("logoutBtn");
    if (el && user?.email) {
      el.textContent = user.email;
      el.style.cssText =
        "font-size:12px;font-weight:600;color:var(--text-muted);" +
        "max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
    }
    if (logoutBtn) {
      logoutBtn.style.display = "";
      logoutBtn.addEventListener("click", () => window.__auth.signOut());
    }
  } catch { /* ok */ }
}

/* ── Main ─────────────────────────────────────────── */
function main() {
  const solutions = readSolutions();

  try { $("statTotal").textContent = solutions.length; } catch { /* ok */ }

  buildFilterTabs(solutions);

  const rerender = () => render(solutions);
  $("search").addEventListener("input", rerender);
  $("filterTabs").addEventListener("click", () => render(solutions));

  $("solutionsGrid").addEventListener("click", (e) => {
    const btn = e.target.closest('[data-action="pilot"]');
    if (!btn) return;
    const card = btn.closest(".card");
    const id   = card?.getAttribute("data-solution-id");
    const sol  = solutions.find(s => String(s.id) === String(id));
    openModalForSolution(sol);
  });

  $("openPilot").addEventListener("click",  () => openModalForSolution(null));
  $("openPilot2").addEventListener("click", () => openModalForSolution(null));

  setupModalHandlers();
  setupLightbox();
  render(solutions);
}

document.addEventListener("DOMContentLoaded", async () => {
  const session = await window.__auth.checkAuth();
  if (!session) return;
  updateNavUser(session.user);
  main();
});
