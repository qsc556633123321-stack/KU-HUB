const PROJECTS_URL = new URL("../data/projects.json", import.meta.url);
const PROJECT_STATUSES = ["開發中", "測試中", "已完成", "暫停開發", "資料待補"];
const CATEGORY_NAMES = {
  "Web App": "Web App",
  "AI Tools": "AI Tools",
  "Game Development": "Game Development",
  Automation: "Automation",
  Bot: "Bot",
  Other: "Other",
};

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeProject(project) {
  if (!project || !isNonEmptyString(project.id) || !isNonEmptyString(project.name)) {
    return null;
  }

  const projectId = project.id.trim();
  const technologies = Array.isArray(project.technologies)
    ? project.technologies.filter(isNonEmptyString).map((technology) => technology.trim())
    : [];
  const parsedDate = isNonEmptyString(project.lastUpdated) && /^\d{4}-\d{2}-\d{2}$/.test(project.lastUpdated)
    ? Date.parse(`${project.lastUpdated}T00:00:00Z`)
    : Number.NaN;
  const date = !Number.isNaN(parsedDate) && new Date(parsedDate).toISOString().slice(0, 10) === project.lastUpdated
    ? project.lastUpdated
    : "";

  function readUrl(value, field) {
    if (!isNonEmptyString(value)) return "";
    const url = safeExternalUrl(value);
    if (!url) console.warn(`Ignoring invalid ${field} URL for project "${projectId}".`);
    return url;
  }

  return {
    id: projectId,
    name: project.name.trim(),
    category: Object.hasOwn(CATEGORY_NAMES, project.category) ? project.category : "Other",
    description: isNonEmptyString(project.description) ? project.description.trim() : "",
    longDescription: isNonEmptyString(project.longDescription) ? project.longDescription.trim() : "",
    version: isNonEmptyString(project.version) ? project.version.trim() : "版本未提供",
    status: PROJECT_STATUSES.includes(project.status) ? project.status : "資料待補",
    technologies,
    image: readUrl(project.image, "image"),
    github: readUrl(project.github, "GitHub"),
    demo: readUrl(project.demo, "demo"),
    featured: project.featured === true,
    lastUpdated: date,
  };
}

export function safeExternalUrl(value) {
  if (!isNonEmptyString(value)) return "";

  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || url.username || url.password) return "";
    return url.href;
  } catch {
    return "";
  }
}

export async function fetchProjects() {
  const response = await fetch(PROJECTS_URL);
  if (!response.ok) {
    throw new Error(`專案資料讀取失敗（HTTP ${response.status}）`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("專案資料格式錯誤：預期為 JSON 陣列。");
  }

  const projects = [];
  let invalidEntries = 0;
  data.forEach((entry) => {
    const project = normalizeProject(entry);
    if (project) projects.push(project);
    else invalidEntries += 1;
  });
  if (invalidEntries) {
    console.warn(`Skipped ${invalidEntries} invalid project entr${invalidEntries === 1 ? "y" : "ies"}.`);
  }
  return projects;
}

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function appendExternalLink(container, label, href) {
  if (!href) return;
  const link = createElement("a", "project-action", label);
  link.href = href;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  container.append(link);
}

function createProjectCard(project) {
  const card = createElement("article", "project-card");
  card.dataset.category = project.category;

  const visual = createElement("a", "project-visual");
  visual.href = `./project.html?id=${encodeURIComponent(project.id)}`;
  visual.setAttribute("aria-label", `查看 ${project.name} 專案介紹`);
  const fallback = createElement("span", "visual-fallback", project.name.slice(0, 2).toUpperCase());
  fallback.setAttribute("aria-hidden", "true");
  visual.append(fallback);

  if (project.image) {
    const image = document.createElement("img");
    image.src = project.image;
    image.alt = project.name;
    image.loading = "lazy";
    image.addEventListener("error", () => image.remove(), { once: true });
    visual.append(image);
  }

  const kicker = createElement("span", "visual-kicker", project.category.toUpperCase());
  const index = createElement("span", "visual-index", project.version);
  visual.append(kicker, index);

  const info = createElement("div", "project-info");
  const titleLine = createElement("div", "project-title-line");
  const titleGroup = document.createElement("div");
  titleGroup.append(
    createElement("p", "project-category", project.category.toUpperCase()),
    createElement("h3", "", project.name),
  );
  const detailLink = createElement("a", "project-arrow", "↗");
  detailLink.href = `./project.html?id=${encodeURIComponent(project.id)}`;
  detailLink.setAttribute("aria-label", `查看 ${project.name} 詳細介紹`);
  titleLine.append(titleGroup, detailLink);

  const description = createElement("p", "project-description", project.description || "專案介紹待補。");
  const tags = createElement("div", "tag-list");
  if (project.technologies.length) {
    project.technologies.forEach((technology) => tags.append(createElement("span", "", technology)));
  } else {
    tags.append(createElement("span", "tag-pending", "技術資料待補"));
  }

  const meta = createElement("div", "project-meta");
  const status = createElement("span", "status-badge", project.status);
  status.dataset.status = project.status;
  meta.append(status, createElement("span", "project-version", project.version));
  if (project.lastUpdated) {
    meta.append(createElement("time", "project-date", `更新於 ${project.lastUpdated}`));
  }

  const actions = createElement("div", "project-actions");
  appendExternalLink(actions, "GitHub ↗", project.github);
  appendExternalLink(actions, "Demo ↗", project.demo);
  if (!project.github && !project.demo) {
    actions.append(createElement("span", "link-pending", "公開連結待確認"));
  }

  info.append(titleLine, description, tags, meta, actions);
  card.append(visual, info);
  return card;
}

function initProjectList() {
  const grid = document.querySelector("#project-grid");
  if (!grid) return;

  const featuredGrid = document.querySelector("#featured-grid");
  const featuredSection = document.querySelector("#featured-section");
  const loadState = document.querySelector("#project-load-state");
  const categoryFilters = document.querySelector("#category-filters");
  const search = document.querySelector("#project-search");
  const statusFilter = document.querySelector("#status-filter");
  const sort = document.querySelector("#project-sort");
  const resultCount = document.querySelector("#project-results-count");
  const emptyMessage = document.querySelector("#filter-empty");
  let projects = [];
  let selectedCategory = "all";

  function createCategoryButton(category, count, label) {
    const button = createElement("button", "filter-button", label);
    button.type = "button";
    button.dataset.filter = category;
    button.setAttribute("aria-pressed", String(selectedCategory === category));
    const countLabel = createElement("span", "", String(count).padStart(2, "0"));
    countLabel.setAttribute("aria-hidden", "true");
    button.append(countLabel);
    button.addEventListener("click", () => {
      selectedCategory = category;
      renderProjects();
    });
    return button;
  }

  function renderProjects() {
    categoryFilters.replaceChildren();
    const categoryCounts = new Map();
    projects.forEach((project) => categoryCounts.set(project.category, (categoryCounts.get(project.category) || 0) + 1));
    categoryFilters.append(createCategoryButton("all", projects.length, "全部"));
    [...categoryCounts.keys()].sort((a, b) => a.localeCompare(b)).forEach((category) => {
      categoryFilters.append(createCategoryButton(category, categoryCounts.get(category), CATEGORY_NAMES[category]));
    });

    const query = search.value.trim().toLocaleLowerCase();
    const status = statusFilter.value;
    const matchingProjects = projects.filter((project) => {
      const searchableText = [
        project.name,
        project.description,
        project.longDescription,
        project.category,
        ...project.technologies,
      ].join(" ").toLocaleLowerCase();
      return (selectedCategory === "all" || project.category === selectedCategory)
        && (status === "all" || project.status === status)
        && (!query || searchableText.includes(query));
    });

    matchingProjects.sort((a, b) => {
      if (!a.lastUpdated || !b.lastUpdated) {
        if (!a.lastUpdated && !b.lastUpdated) return 0;
        return a.lastUpdated ? -1 : 1;
      }

      const dateA = Date.parse(`${a.lastUpdated}T00:00:00Z`);
      const dateB = Date.parse(`${b.lastUpdated}T00:00:00Z`);
      return sort.value === "oldest" ? dateA - dateB : dateB - dateA;
    });

    grid.replaceChildren(...matchingProjects.map(createProjectCard));
    resultCount.textContent = `符合條件的專案：${matchingProjects.length} / ${projects.length}`;
    emptyMessage.hidden = matchingProjects.length > 0 || projects.length === 0;

    categoryFilters.querySelectorAll(".filter-button").forEach((button) => {
      const active = button.dataset.filter === selectedCategory;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  [search, statusFilter, sort].forEach((control) => {
    control.addEventListener(control === search ? "input" : "change", renderProjects);
  });

  fetchProjects().then((loadedProjects) => {
    projects = loadedProjects;
    const featuredProjects = projects.filter((project) => project.featured);
    document.querySelector("#project-total").textContent = String(projects.length);
    document.querySelector("#domain-total").textContent = String(new Set(projects.map((project) => project.category)).size);
    document.querySelector("#featured-total").textContent = String(featuredProjects.length);
    featuredSection.hidden = featuredProjects.length === 0;
    featuredGrid.replaceChildren(...featuredProjects.map(createProjectCard));
    loadState.textContent = projects.length ? "" : "目前沒有專案資料。";
    renderProjects();
  }).catch((error) => {
    console.error("KU HUB 專案資料載入失敗：", error);
    loadState.textContent = "無法載入專案資料，請確認網路連線或稍後重試。";
    resultCount.textContent = "";
    grid.replaceChildren();
    featuredSection.hidden = true;
  });
}

initProjectList();
