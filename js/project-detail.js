import {
  createElement,
  createProjectCover,
  fetchProjects,
  safeExternalUrl,
} from "./project-data.js?v=1c1584543030a885";

function createActions(project) {
  const actions = createElement("div", "detail-actions");
  const targets = [
    ["進入正式系統", project.production],
    ["線上 Demo", project.demo],
    ["GitHub Repository", project.github],
  ];
  const seen = new Set();
  for (const [label, value] of targets) {
    const url = safeExternalUrl(value);
    if (!url || seen.has(url)) continue;
    const link = createElement("a", seen.size ? "button" : "button button-primary", label);
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    actions.append(link);
    seen.add(url);
  }
  return actions;
}

function createCover(project, className) {
  const visual = createElement("div", className);
  visual.append(createProjectCover(project));

  const url = safeExternalUrl(project.image);
  if (url) {
    const image = createElement("img");
    image.alt = `${project.name} 專案封面`;
    image.addEventListener("error", () => image.remove(), { once: true });
    image.src = url;
    visual.append(image);
  }
  return visual;
}

function createSection(title, content) {
  const section = createElement("section", "detail-section");
  section.append(createElement("h2", "", title), content);
  return section;
}

function createTextList(items) {
  const list = createElement("ul", "detail-section-list");
  for (const item of items) list.append(createElement("li", "", item));
  return list;
}

function createScreenshots(project) {
  const gallery = createElement("div", "screenshot-grid");
  const section = createSection("操作截圖", gallery);
  for (const screenshot of project.screenshots) {
    const figure = createElement("figure", "screenshot-item");
    const image = createElement("img");
    image.alt = screenshot.alt || `${project.name} 操作截圖`;
    image.loading = "lazy";
    image.decoding = "async";
    image.addEventListener("error", () => {
      figure.remove();
      if (!gallery.childElementCount) section.remove();
    }, { once: true });
    image.src = screenshot.url;
    figure.append(image);
    if (screenshot.alt) figure.append(createElement("figcaption", "", screenshot.alt));
    gallery.append(figure);
  }
  return section;
}

function createChangelog(entries) {
  const list = createElement("ul", "detail-changelog");
  for (const entry of entries) {
    const item = createElement("li");
    if (entry.version) item.append(createElement("h3", "", entry.version));
    if (entry.date) {
      const date = createElement("time", "", entry.date);
      date.dateTime = entry.date;
      item.append(date);
    }
    if (entry.description) item.append(createElement("p", "", entry.description));
    list.append(item);
  }
  return list;
}

function findRelated(project, projects) {
  const technologies = new Set(project.technologies.map((tech) => tech.toLowerCase()));
  return projects
    .filter((candidate) => project.id !== candidate.id)
    .map((candidate) => {
      const sameDomain = project.domain && project.domain === candidate.domain;
      const sameCategory = project.category !== "Other" && project.category === candidate.category;
      const sharedTech = new Set(candidate.technologies.map((tech) => tech.toLowerCase()).filter((tech) => technologies.has(tech)));
      return { candidate, score: 3 * Number(Boolean(sameDomain)) + 2 * Number(sameCategory) + sharedTech.size };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.candidate.lastUpdated.localeCompare(a.candidate.lastUpdated))
    .slice(0, 3)
    .map(({ candidate }) => candidate);
}

function createRelated(projects) {
  const grid = createElement("div", "related-grid");
  for (const project of projects) {
    const card = createElement("a", "related-card");
    card.href = `./project.html?id=${encodeURIComponent(project.id)}`;
    const cover = createCover(project, "related-visual");
    cover.setAttribute("aria-hidden", "true");
    const title = createElement("h3", "", project.name);
    const context = createElement("p", "", project.domain || project.category);
    card.append(cover, title, context);
    grid.append(card);
  }
  return grid;
}

function createProjectInfo(project, actions) {
  const info = createElement("section", "detail-info");
  info.append(createElement("h2", "", "專案資訊"));
  const facts = createElement("dl", "detail-facts");
  for (const [label, value] of [
    ["分類", project.category],
    ["類型", project.type],
    ["技術領域", project.domain],
    ["開發狀態", project.status],
    ["目前版本", project.version],
    ["最後更新", project.lastUpdated],
  ]) {
    if (!value) continue;
    facts.append(createElement("dt", "", label), createElement("dd", "", value));
  }
  info.append(facts);
  if (project.technologies.length) {
    const technologies = createElement("div", "tag-list");
    for (const technology of project.technologies) {
      technologies.append(createElement("span", "", technology));
    }
    info.append(createElement("h2", "detail-subheading", "技術組合"), technologies);
  }
  if (actions.childElementCount) info.append(actions);
  return info;
}

function updateMetadata(project) {
  const canonical = document.querySelector('link[rel="canonical"]');
  const projectUrl = new URL(canonical.href);
  projectUrl.searchParams.set("id", project.id);
  const title = `${project.name} — KU HUB`;
  const description = project.description || project.longDescription || "KU HUB 專案詳細介紹。";

  canonical.href = projectUrl.href;
  document.title = title;
  document.querySelector('meta[name="description"]').content = description;
  document.querySelector('meta[property="og:title"]').content = title;
  document.querySelector('meta[property="og:description"]').content = description;
  document.querySelector('meta[property="og:url"]').content = projectUrl.href;
}

function renderProject(project, projects, container) {
  const heading = createElement("div", "detail-heading");
  const status = createElement("span", "status-badge", project.status);
  status.dataset.status = project.status;
  heading.append(
    createElement("p", "eyebrow", `PROJECT / ${project.category.toUpperCase()}`),
    createElement("h1", "detail-title", project.name),
    status,
  );
  if (project.description) heading.append(createElement("p", "detail-summary", project.description));

  const body = createElement("div", "detail-body");
  const description = createElement("div", "detail-description");
  if (project.longDescription && project.longDescription !== project.description) {
    description.append(createSection("專案介紹", createElement("p", "", project.longDescription)));
  }
  if (project.highlights.length) {
    description.append(createSection("專案亮點", createTextList(project.highlights)));
  }
  if (project.features.length) {
    description.append(createSection("核心功能", createTextList(project.features)));
  }
  if (project.architecture) {
    description.append(createSection("系統架構", createElement("p", "", project.architecture)));
  }
  if (description.childElementCount) body.append(description);
  body.append(createProjectInfo(project, createActions(project)));

  container.append(heading, createCover(project, "detail-visual"), body);
  if (project.screenshots.length) container.append(createScreenshots(project));
  if (project.changelog.length) {
    container.append(createSection("更新紀錄", createChangelog(project.changelog)));
  }
  const related = findRelated(project, projects);
  if (related.length) container.append(createSection("相關專案", createRelated(related)));
  updateMetadata(project);
}

const loadState = document.querySelector("#detail-load-state");
const detail = document.querySelector("#project-detail");
const projectId = new URLSearchParams(window.location.search).get("id");

fetchProjects().then((projects) => {
  const project = projects.find((item) => item.id === projectId);
  if (!project) {
    loadState.textContent = "找不到這個專案，請返回專案列表瀏覽。";
    return;
  }

  renderProject(project, projects, detail);
  detail.hidden = false;
  loadState.textContent = "";
}).catch(() => {
  loadState.textContent = "無法載入專案資料，請確認網路連線或稍後重試。";
});
