const SUPPORT_EMAIL = "pilots@yourcompany.com";

function $(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element: #${id}`);
  return el;
}

function readSolutions() {
  const node = $("solutionsData");
  try {
    const data = JSON.parse(node.textContent || "[]");
    if (!Array.isArray(data)) return [];
    return data;
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

function cardTemplate(solution) {
  const isOss = Boolean(solution.openSourceFirst);
  const repo = solution.repoUrl || "";
  const tryUrl = solution.tryUrl || repo;
  const features = Array.isArray(solution.features) ? solution.features : [];

  const isMvpReady = solution.mvpReady !== false;
  const isGithubReady = solution.githubReady !== false;
  const isMasterDeckReady = solution.masterDeckReady === true;
  const isPilotRunning = solution.pilotRunning === true;

  const badges = `
    <div style="display: flex; gap: 8px; flex-direction: row; align-items: center; justify-content: flex-end; text-align: left;">
      ${isOss ? `<span class="badge badge--oss" style="background: rgba(0, 102, 204, 0.1); color: var(--accent-blue);" title="OSS-First">OSS-<br>FIRST</span>` : ""}
      ${isMvpReady ? `<span class="badge" style="background: rgba(247, 148, 29, 0.15); color: #c2410c;" title="POC-Ready">POC-<br>READY</span>` : ""}
      ${isPilotRunning ? `<span class="badge" style="background: rgba(52, 199, 89, 0.15); color: #248a3d;" title="Pilot-Running">PILOT-<br>RUNNING</span>` : ""}
      ${isGithubReady ? `<span class="badge" style="background: rgba(29, 29, 31, 0.08); color: #1d1d1f;" title="Github-Ready">GITHUB-<br>READY</span>` : ""}
      ${isMasterDeckReady ? `<span class="badge" style="background: rgba(88, 86, 214, 0.1); color: #5856d6;" title="Solution Blueprint Ready">SOLUTION-<br>BLUEPRINT</span>` : ""}
    </div>
  `;

  return `
    <article class="card" data-solution-id="${escapeHtml(solution.id)}" style="position: relative; overflow: hidden;">
      ${solution.hackathonLabel ? `<div style="position: absolute; top: 0; right: 0; background: linear-gradient(135deg, #5856d6, #7c3aed); color: #fff; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; padding: 5px 14px; border-radius: 0 var(--radius-lg) 0 12px;">${escapeHtml(solution.hackathonLabel)}</div>` : ""}
      <div class="card__top">
        <div>
          <h3 class="card__name">${escapeHtml(solution.name)}</h3>
          <div class="badge" title="Category">${escapeHtml(solution.category || "General")}</div>
        </div>
        ${badges}
      </div>

      ${(() => {
      let activeIndex = 0;
      if (solution.statusIndex !== undefined) activeIndex = solution.statusIndex;
      else if (solution.isOss) activeIndex = 4;
      else if (solution.pilotRunning) activeIndex = 3;
      else if (solution.mvpReady) activeIndex = 2;

      const steps = ['Initiated', 'Contract', 'Implementation', 'Pilot', 'Production'];
      const percentage = (activeIndex / (steps.length - 1)) * 100;

      return `
        <div style="margin: 16px 0 20px; padding: 16px 0 110px 0; border-top: 1px solid var(--border-light); border-bottom: 1px solid var(--border-light); position: relative;">
          <!-- Overall Status Label -->
          <div style="position: absolute; top: 16px; left: 50%; transform: translateX(-50%); font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary);">Overall Status</div>
          <div style="display: flex; justify-content: space-between; position: relative; padding: 0 24px; margin-top: 24px;">
            <!-- Lines Wrapper -->
            <div style="position: absolute; top: 4px; left: 29px; right: 29px; height: 2px; z-index: 1;">
              <!-- Background Line -->
              <div style="width: 100%; height: 100%; background: #e5e5ea;"></div>
              <!-- Animated Fill Line -->
              <div style="position: absolute; top: 0; left: 0; height: 100%; background: var(--accent-blue); width: 0; animation: fillTimeline 1s cubic-bezier(0.22, 1, 0.36, 1) forwards; animation-delay: 0.2s;" data-target-width="${percentage}%">
                <style>
                  @keyframes fillTimeline {
                    to { width: var(--target-width); }
                  }
                </style>
              </div>
            </div>
            
            ${steps.map((step, index) => `
              <div style="display: flex; flex-direction: column; align-items: center; z-index: 3; position: relative;">
                <div style="width: 10px; height: 10px; border-radius: 50%; background: ${index <= activeIndex ? 'var(--accent-blue)' : '#e5e5ea'}; border: 2px solid var(--bg); transition: background 0.3s 1s; box-shadow: ${index === activeIndex ? '0 0 0 3px rgba(0, 102, 204, 0.2)' : 'none'}; animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; animation-delay: ${0.2 + (index * 0.1)}s; opacity: 0; transform: scale(0.5);"></div>
                <div style="position: absolute; top: 16px; left: 50%; width: 0; overflow: visible;">
                  <br><br><br>
                  <span style="display: block; font-size: 10px; font-weight: 600; color: ${index <= activeIndex ? 'var(--text-primary)' : 'var(--text-tertiary)'}; text-transform: uppercase; letter-spacing: 0.06em; animation: fadeIn 0.4s ease forwards; animation-delay: ${0.4 + (index * 0.1)}s; opacity: 0; transform: rotate(-40deg) translate(-10px, 2px); transform-origin: top left; white-space: nowrap;">${step}</span>
                </div>
              </div>
            `).join('')}
            
            <style>
              @keyframes popIn {
                to { opacity: 1; transform: scale(1); }
              }
              @keyframes fadeIn {
                to { opacity: 1; }
              }
            </style>
          </div>
        </div>
        `;
    })()}

      <p class="card__summary">${escapeHtml(solution.summary || "")}</p>

      <div>
        <ul class="card__features">
          ${features.map((f) => `<li>${escapeHtml(f)}</li>`).join("")}
        </ul>
        <p class="card__usecase"><strong>Use case:</strong> ${escapeHtml(solution.useCase || "")}</p>
        
        ${solution.id === 'aavance-ngo' ? `
        <div class="card__partners" style="margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border-light); display: flex; align-items: center; gap: 16px;">
          <span style="font-size: 13px; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.05em;">Partner</span>
          
          <div title="AAvance" style="display: flex; align-items: center; gap: 8px;">
            <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink: 0; transform: translateY(2px);">
              <path d="M15 85C25 55 50 40 85 45" stroke="#2582c1" stroke-width="14" stroke-linecap="round"/>
              <path d="M30 95C45 65 75 50 95 60" stroke="#004b87" stroke-width="14" stroke-linecap="round"/>
              <circle cx="28" cy="78" r="9" fill="#c1272d"/>
            </svg>
            <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-weight: 700; font-size: 26px; color: #0066b3; letter-spacing: -0.02em;">AAvance</span>
          </div>
        </div>
        ` : solution.id === 'kyc-kyb' ? `
        <div class="card__partners" style="margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border-light); display: flex; align-items: center; gap: 16px;">
          <span style="font-size: 13px; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.05em;">Partners</span>
          <div style="display: flex; align-items: center; justify-content: flex-start; gap: 24px;">
            <img src="./assets/images/valid-logo.png" alt="Valid Logo" style="height: 38px; width: auto; object-fit: contain; transform: translateY(-1px);">
            <img src="./assets/images/hst-logo.png" alt="HST Logo" style="height: 26px; width: auto; object-fit: contain;">
          </div>
        </div>
        ` : solution.id === 'dps-prosperidad' ? `
        <div class="card__partners" style="margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border-light); display: flex; align-items: center; gap: 16px;">
          <span style="font-size: 13px; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.05em;">Partner</span>
          <div title="Prosperidad Social – Gobierno de Colombia" style="display: flex; align-items: center; gap: 10px;">
            <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink: 0;">
              <rect width="100" height="33" fill="#FCD116"/>
              <rect y="33" width="100" height="33" fill="#003893"/>
              <rect y="66" width="100" height="34" fill="#CE1126"/>
            </svg>
            <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-weight: 700; font-size: 18px; color: #003893; letter-spacing: -0.02em;">Prosperidad Social</span>
          </div>
        </div>
        ` : ''}
      </div>

      <div class="card__bottom">
        <div class="card__links" style="display: flex; align-items: center; gap: 16px;">
          ${solution.id === 'aavance-ngo' ? `
          <span style="color: var(--text-tertiary); padding: 0; font-weight: 600; font-size: 16px; line-height: 1.2; text-align: left; max-width: 80px; white-space: normal; cursor: not-allowed; opacity: 0.5;">Solution Blueprint</span>
          <span style="color: var(--text-tertiary); border: 2px solid #e5e5ea; border-radius: 9999px; padding: 10px 24px; font-weight: 600; font-size: 16px; cursor: not-allowed; opacity: 0.5; background: #f5f5f7;">MVP</span>
          <div style="width: 1px; height: 28px; background-color: #e5e5ea; margin: 0;"></div>
          <span style="border-radius: 9999px; padding: 10px 24px; background-color: #d2d2d7; color: #fff; font-weight: 600; font-size: 16px; border: none; cursor: not-allowed; opacity: 0.7;">Github</span>
          ` : solution.id === 'kyc-kyb' ? `
          <a class="button button--chip button--ghost" href="${escapeHtml(repo)}" target="_blank" rel="noreferrer" style="border: none; color: var(--accent-blue); padding: 0; font-weight: 600; font-size: 16px; line-height: 1.2; text-align: left; max-width: 80px; white-space: normal;">Solution Blueprint</a>
          <span style="color: var(--text-tertiary); border: 2px solid #e5e5ea; border-radius: 9999px; padding: 10px 24px; font-weight: 600; font-size: 16px; cursor: not-allowed; opacity: 0.5; background: #f5f5f7;">MVP</span>
          <div style="width: 1px; height: 28px; background-color: #e5e5ea; margin: 0;"></div>
          <span style="border-radius: 9999px; padding: 10px 24px; background-color: #d2d2d7; color: #fff; font-weight: 600; font-size: 16px; border: none; cursor: not-allowed; opacity: 0.7;">Github</span>
          ` : solution.id === 'panama-canal-project' ? `
          <span style="color: var(--text-tertiary); padding: 0; font-weight: 600; font-size: 16px; line-height: 1.2; text-align: left; max-width: 80px; white-space: normal; cursor: not-allowed; opacity: 0.5;">Solution Blueprint</span>
          <a
            class="button button--chip button--ghost"
            href="${escapeHtml(tryUrl)}"
            target="_blank"
            rel="noreferrer noopener"
            style="color: var(--text-primary); border: 2px solid #d2d2d7; border-radius: 9999px; padding: 10px 24px; font-weight: 600; font-size: 16px;"
            >MVP</a
          >
          <div style="width: 1px; height: 28px; background-color: #e5e5ea; margin: 0;"></div>
          ${solution.githubUrl ?
        `<a class="button button--primary" href="${escapeHtml(solution.githubUrl)}" target="_blank" rel="noreferrer" style="border-radius: 9999px; padding: 10px 24px; background-color: #1d1d1f; color: #fff; font-weight: 600; font-size: 16px; border: none; text-decoration: none;">Github</a>` :
        `<button class="button button--primary" type="button" data-action="pilot" style="border-radius: 9999px; padding: 10px 24px; background-color: #1d1d1f; color: #fff; font-weight: 600; font-size: 16px; border: none;">Github</button>`
      }
          ` : solution.id === 'underwriting-rules' ? `
          <span style="color: var(--text-tertiary); padding: 0; font-weight: 600; font-size: 16px; line-height: 1.2; text-align: left; max-width: 80px; white-space: normal; cursor: not-allowed; opacity: 0.5;">Solution Blueprint</span>
          <a
            class="button button--chip button--ghost"
            href="${escapeHtml(tryUrl)}"
            target="_blank"
            rel="noreferrer noopener"
            style="color: var(--text-primary); border: 2px solid #d2d2d7; border-radius: 9999px; padding: 10px 24px; font-weight: 600; font-size: 16px;"
            >MVP</a
          >
          <div style="width: 1px; height: 28px; background-color: #e5e5ea; margin: 0;"></div>
          <span style="border-radius: 9999px; padding: 10px 24px; background-color: #d2d2d7; color: #fff; font-weight: 600; font-size: 16px; border: none; cursor: not-allowed; opacity: 0.7;">Github</span>
          ` : solution.id === 'dps-prosperidad' ? `
          <a class="button button--chip button--ghost" href="https://dps-indol.vercel.app/" target="_blank" rel="noreferrer" style="border: none; color: var(--accent-blue); padding: 0; font-weight: 600; font-size: 16px; line-height: 1.2; text-align: left; max-width: 80px; white-space: normal;">Solution Blueprint</a>
          <span style="color: var(--text-tertiary); border: 2px solid #e5e5ea; border-radius: 9999px; padding: 10px 24px; font-weight: 600; font-size: 16px; cursor: not-allowed; opacity: 0.5; background: #f5f5f7;">MVP</span>
          <div style="width: 1px; height: 28px; background-color: #e5e5ea; margin: 0;"></div>
          <span style="border-radius: 9999px; padding: 10px 24px; background-color: #d2d2d7; color: #fff; font-weight: 600; font-size: 16px; border: none; cursor: not-allowed; opacity: 0.7;">Github</span>
          ` : solution.id === 'student-beca-cr' ? `
          <span style="color: var(--text-tertiary); padding: 0; font-weight: 600; font-size: 16px; line-height: 1.2; text-align: left; max-width: 80px; white-space: normal; cursor: not-allowed; opacity: 0.5;">Solution Blueprint</span>
          <a class="button button--chip button--ghost" href="${escapeHtml(tryUrl)}" target="_blank" rel="noreferrer noopener" style="color: var(--text-primary); border: 2px solid #d2d2d7; border-radius: 9999px; padding: 10px 24px; font-weight: 600; font-size: 16px;">MVP</a>
          <div style="width: 1px; height: 28px; background-color: #e5e5ea; margin: 0;"></div>
          <a class="button button--primary" href="${escapeHtml(solution.githubUrl)}" target="_blank" rel="noreferrer" style="border-radius: 9999px; padding: 10px 24px; background-color: #1d1d1f; color: #fff; font-weight: 600; font-size: 16px; border: none; text-decoration: none;">Github</a>
          ` : solution.id === 'mtt-panama' ? `
          <span style="color: var(--text-tertiary); padding: 0; font-weight: 600; font-size: 16px; line-height: 1.2; text-align: left; max-width: 80px; white-space: normal; cursor: not-allowed; opacity: 0.5;">Solution Blueprint</span>
          <a class="button button--chip button--ghost" href="${escapeHtml(tryUrl)}" target="_blank" rel="noreferrer noopener" style="color: var(--text-primary); border: 2px solid #d2d2d7; border-radius: 9999px; padding: 10px 24px; font-weight: 600; font-size: 16px;">MVP</a>
          <div style="width: 1px; height: 28px; background-color: #e5e5ea; margin: 0;"></div>
          <span style="border-radius: 9999px; padding: 10px 24px; background-color: #d2d2d7; color: #fff; font-weight: 600; font-size: 16px; border: none; cursor: not-allowed; opacity: 0.7;">Github</span>
          ` : `
          <a class="button button--chip button--ghost" href="${escapeHtml(repo)}" target="_blank" rel="noreferrer" style="border: none; color: var(--accent-blue); padding: 0; font-weight: 600; font-size: 16px; line-height: 1.2; text-align: left; max-width: 80px; white-space: normal;">Solution Blueprint</a>
          <a
            class="button button--chip button--ghost"
            href="${escapeHtml(tryUrl)}"
            target="_blank"
            rel="noreferrer noopener"
            style="color: var(--text-primary); border: 2px solid #d2d2d7; border-radius: 9999px; padding: 10px 24px; font-weight: 600; font-size: 16px;"
            >MVP</a
          >
          <div style="width: 1px; height: 28px; background-color: #e5e5ea; margin: 0;"></div>
          ${solution.githubUrl ?
      `<a class="button button--primary" href="${escapeHtml(solution.githubUrl)}" target="_blank" rel="noreferrer" style="border-radius: 9999px; padding: 10px 24px; background-color: #1d1d1f; color: #fff; font-weight: 600; font-size: 16px; border: none; text-decoration: none;">Github</a>` :
      `<button class="button button--primary" type="button" data-action="pilot" style="border-radius: 9999px; padding: 10px 24px; background-color: #1d1d1f; color: #fff; font-weight: 600; font-size: 16px; border: none;">Github</button>`
    }
          `}
        </div>
      </div>
    </article>
  `;
}

function buildCategoryOptions(solutions) {
  const select = $("category");
  const categories = uniq(solutions.map((s) => s.category || "General"));
  for (const c of categories) {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    select.appendChild(opt);
  }
}

function normalize(s) {
  return String(s || "").trim().toLowerCase();
}

function matchesSolution(solution, query, category, ossOnly) {
  if (category !== "all" && String(solution.category || "") !== category) return false;
  if (ossOnly && !solution.openSourceFirst) return false;

  if (!query) return true;

  const haystack = [
    solution.name,
    solution.category,
    solution.summary,
    solution.useCase,
    ...(Array.isArray(solution.features) ? solution.features : [])
  ]
    .map(normalize)
    .join(" · ");

  return haystack.includes(query);
}

function render(solutions) {
  const grid = $("solutionsGrid");
  const empty = $("emptyState");

  const query = normalize($("search").value);
  const category = $("category").value;
  const ossOnly = $("opensourceOnly").checked;

  const filtered = solutions.filter((s) => matchesSolution(s, query, category, ossOnly));
  grid.innerHTML = filtered.map(cardTemplate).join("");

  empty.hidden = filtered.length !== 0;
}

function buildMailto(payload) {
  const subject = `Pilot interest: ${payload.solution || "Turnkey solution"}`;
  const body = [
    `Solution: ${payload.solution || ""}`,
    `GitHub: ${payload.repo || ""}`,
    "",
    `Company: ${payload.company || ""}`,
    `Name: ${payload.name || ""}`,
    `Email: ${payload.email || ""}`,
    `Timeline: ${payload.timeline || ""}`,
    `NDA preferred: ${payload.nda ? "Yes" : "No"}`,
    "",
    "Goals / context:",
    payload.notes || ""
  ].join("\n");

  const params = new URLSearchParams({
    subject,
    body
  });

  return `mailto:${encodeURIComponent(SUPPORT_EMAIL)}?${params.toString()}`;
}

function buildDraft(payload) {
  const subject = `Pilot interest: ${payload.solution || "Turnkey solution"}`;
  const body = [
    `Solution: ${payload.solution || ""}`,
    `GitHub: ${payload.repo || ""}`,
    "",
    `Company: ${payload.company || ""}`,
    `Name: ${payload.name || ""}`,
    `Email: ${payload.email || ""}`,
    `Timeline: ${payload.timeline || ""}`,
    `NDA preferred: ${payload.nda ? "Yes" : "No"}`,
    "",
    "Goals / context:",
    payload.notes || ""
  ].join("\n");

  return { to: SUPPORT_EMAIL, subject, body };
}

function payloadFromForm(form) {
  const fd = new FormData(form);
  return {
    solution: String(fd.get("solution") || ""),
    repo: String(fd.get("repo") || ""),
    company: String(fd.get("company") || ""),
    name: String(fd.get("name") || ""),
    email: String(fd.get("email") || ""),
    timeline: String(fd.get("timeline") || ""),
    notes: String(fd.get("notes") || ""),
    nda: Boolean(fd.get("nda"))
  };
}

function copyRequest(payload) {
  const text = [
    `Pilot interest — ${payload.solution}`,
    `Repo: ${payload.repo}`,
    `Company: ${payload.company}`,
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Timeline: ${payload.timeline}`,
    `NDA preferred: ${payload.nda ? "Yes" : "No"}`,
    "",
    payload.notes
  ].join("\n");

  return navigator.clipboard.writeText(text);
}

function openModalForSolution(solution) {
  const modal = $("pilotModal");
  $("solution").value = solution?.name || "General pilot inquiry";
  $("repo").value = solution?.repoUrl || "";
  $("company").value = "";
  $("name").value = "";
  $("email").value = "";
  $("timeline").value = "";
  $("notes").value = "";
  $("nda").checked = false;
  $("draftTo").value = SUPPORT_EMAIL;
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
    const isInDialog =
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width;
    if (!isInDialog) modal.close();
  });

  $("submitPilot").addEventListener("click", () => {
    const payload = payloadFromForm($("pilotForm"));
    const draft = buildDraft(payload);
    $("draftTo").value = draft.to;
    $("draftSubject").value = draft.subject;
    $("draftBody").value = draft.body;

    const mailto = buildMailto(payload);
    $("openEmail").setAttribute("href", mailto);
    $("pilotHint").textContent =
      "Draft generated. Copy/paste the body into your email, or use “Open email app” if your device is configured.";
  });

  $("copyPilot").addEventListener("click", async () => {
    const payload = payloadFromForm($("pilotForm"));
    try {
      await copyRequest(payload);
      $("pilotHint").textContent = "Copied to clipboard.";
    } catch {
      $("pilotHint").textContent = "Copy failed in this browser. You can still submit to open an email draft.";
    }
  });
}

function main() {
  const solutions = readSolutions();
  buildCategoryOptions(solutions);

  const rerender = () => render(solutions);
  $("search").addEventListener("input", rerender);
  $("category").addEventListener("change", rerender);
  $("opensourceOnly").addEventListener("change", rerender);

  $("solutionsGrid").addEventListener("click", (e) => {
    const btn = e.target.closest('[data-action="pilot"]');
    if (!btn) return;
    const card = btn.closest(".card");
    const id = card?.getAttribute("data-solution-id");
    const sol = solutions.find((s) => String(s.id) === String(id));
    openModalForSolution(sol);
  });

  $("openPilot").addEventListener("click", () => openModalForSolution(null));
  $("openPilot2").addEventListener("click", () => openModalForSolution(null));

  setupModalHandlers();
  render(solutions);
}

document.addEventListener("DOMContentLoaded", main);
