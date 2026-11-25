import { CATEGORY_NAMES, createElement, createProjectCover, fetchProjects } from "./project-data.js?v=1c1584543030a885";

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
  visual.append(createProjectCover(project));

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
    const updated = createElement("time", "project-date", `更新於 ${project.lastUpdated}`);
    updated.dateTime = project.lastUpdated;
    meta.append(updated);
  }

  const actions = createElement("div", "project-actions");
  appendExternalLink(actions, "GitHub", project.github);
  appendExternalLink(actions, "正式產品入口", project.production);
  appendExternalLink(actions, "線上 Demo", project.demo);
  if (!project.github && !project.demo && !project.production) {
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
  const controls = [search, statusFilter, sort];
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

  function renderCategoryButtons() {
    const categoryCounts = new Map();
    projects.forEach((project) => categoryCounts.set(project.category, (categoryCounts.get(project.category) || 0) + 1));
    categoryFilters.append(createCategoryButton("all", projects.length, "全部"));
    [...categoryCounts.keys()].sort((a, b) => a.localeCompare(b)).forEach((category) => {
      categoryFilters.append(createCategoryButton(category, categoryCounts.get(category), CATEGORY_NAMES[category]));
    });
  }

  function renderProjects() {
    const query = search.value.trim().toLocaleLowerCase();
    const status = statusFilter.value;
    const matchingProjects = projects.filter((project) => {
      const searchableText = [
        project.name,
        project.description,
        project.longDescription,
        project.category,
        project.domain,
        project.type,
        ...project.features,
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

  controls.forEach((control) => {
    control.disabled = true;
    control.addEventListener(control === search ? "input" : "change", renderProjects);
  });

  fetchProjects().then((loadedProjects) => {
    projects = loadedProjects;
    controls.forEach((control) => { control.disabled = projects.length === 0; });
    renderOverview(projects);
    const featuredProjects = projects.filter((project) => project.featured);
    document.querySelector("#project-total").textContent = String(projects.length);
    document.querySelector("#featured-total").textContent = String(featuredProjects.length);
    featuredSection.hidden = featuredProjects.length === 0;
    featuredGrid.replaceChildren(...featuredProjects.map(createProjectCard));
    loadState.textContent = projects.length ? "" : "目前沒有專案資料。";
    renderCategoryButtons();
    renderProjects();
  }).catch((error) => {
    console.error("KU HUB 專案資料載入失敗：", error);
    for (const id of ["live", "ecosystem", "labs", "updates"]) {
      document.querySelector(`#${id}-state`).textContent = "無法載入專案資料。";
    }
    loadState.textContent = "無法載入專案資料，請確認網路連線或稍後重試。";
    resultCount.textContent = "";
    grid.replaceChildren();
    featuredSection.hidden = true;
  });
}

function renderOverview(projects) {
  const live = projects.filter((project) => project.developmentStage === "production" && project.production);
  document.querySelector("#live-total").textContent = String(live.length);
  document.querySelector("#live-grid").replaceChildren(...live.map(createProjectCard));
  document.querySelector("#live-state").textContent = live.length ? "" : "目前沒有已確認的正式產品。";

  const domains = new Map();
  for (const project of projects) {
    if (!domains.has(project.domain)) domains.set(project.domain, []);
    domains.get(project.domain).push(project);
  }
  document.querySelector("#domain-total").textContent = String(domains.size);
  const domainCards = [...domains].sort(([a], [b]) => a.localeCompare(b, "zh-Hant")).map(([domain, entries]) => {
    const card = createElement("article", "ecosystem-card");
    const links = createElement("ul", "ecosystem-projects");
    for (const project of entries) {
      const item = createElement("li");
      const link = createElement("a", "text-link", project.name);
      link.href = `./project.html?id=${encodeURIComponent(project.id)}`;
      item.append(link);
      links.append(item);
    }
    card.append(createElement("h3", "", domain), links);
    return card;
  });
  document.querySelector("#ecosystem-grid").replaceChildren(...domainCards);
  document.querySelector("#ecosystem-state").textContent = domainCards.length ? "" : "目前沒有技術領域資料。";

  const labs = projects.filter((project) => project.labs);
  document.querySelector("#labs-grid").replaceChildren(...labs.map((project) => {
    const card = createElement("article", "bento-card");
    const content = createElement("div", "bento-content");
    const link = createElement("a", "text-link", "查看實驗項目");
    link.setAttribute("aria-label", `查看 ${project.name} 實驗項目`);
    link.href = `./project.html?id=${encodeURIComponent(project.id)}`;
    content.append(createElement("h3", "", project.name));
    if (project.description) content.append(createElement("p", "", project.description));
    content.append(link);
    card.append(content);
    return card;
  }));
  document.querySelector("#labs-state").textContent = labs.length ? "" : "目前沒有公開的實驗項目。";

  const updates = projects.flatMap((project) => {
    const releases = project.changelog.filter((entry) => entry.date).map((entry) => ({
      ...entry,
      label: entry.version || "更新紀錄",
      project,
    }));
    if (project.lastUpdated && !releases.some(({ date }) => date === project.lastUpdated)) {
      releases.push({ date: project.lastUpdated, label: "專案資料更新", project });
    }
    return releases;
  }).sort((a, b) => b.date.localeCompare(a.date));
  document.querySelector("#updates-list").replaceChildren(...updates.slice(0, 6).map(({ date, label, project, description }) => {
    const item = createElement("li", "update-item");
    const time = createElement("time", "", date);
    time.dateTime = date;
    const link = createElement("a", "", project.name);
    link.href = `./project.html?id=${encodeURIComponent(project.id)}`;
    const body = createElement("div");
    body.append(link, createElement("p", "", description ? `${label} · ${description}` : label));
    item.append(time, body);
    return item;
  }));
  document.querySelector("#updates-state").textContent = updates.length ? "" : "目前沒有附日期的更新紀錄。";
}

initProjectList();
