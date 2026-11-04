import { fetchProjects, safeExternalUrl } from "./projects.js";

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function createLink(label, value) {
  const url = safeExternalUrl(value);
  if (!url) return null;
  const link = createElement("a", "button button-primary", label);
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  return link;
}

function renderProject(project, container) {
  const heading = createElement("div", "detail-heading");
  heading.append(
    createElement("p", "eyebrow", `PROJECT / ${project.category.toUpperCase()}`),
    createElement("h1", "detail-title", project.name),
    createElement("p", "detail-summary", project.description || "專案介紹待補。"),
  );

  const visual = createElement("div", "detail-visual");
  visual.setAttribute("role", "img");
  visual.setAttribute("aria-label", `${project.name} 專案圖片`);
  const fallback = createElement("span", "visual-fallback", project.name.slice(0, 2).toUpperCase());
  fallback.setAttribute("aria-hidden", "true");
  visual.append(fallback);
  const imageUrl = safeExternalUrl(project.image);
  if (imageUrl) {
    const image = document.createElement("img");
    image.src = imageUrl;
    image.alt = project.name;
    image.addEventListener("error", () => image.remove(), { once: true });
    visual.append(image);
  }

  const body = createElement("div", "detail-body");
  const description = createElement("section", "detail-description");
  description.append(createElement("h2", "", "專案介紹"), createElement("p", "", project.longDescription || project.description || "詳細說明待補。"));
  const info = createElement("section", "detail-info");
  info.append(createElement("h2", "", "專案資訊"));
  const facts = createElement("dl", "detail-facts");
  [
    ["分類", project.category],
    ["開發狀態", project.status],
    ["目前版本", project.version],
  ].forEach(([label, value]) => facts.append(createElement("dt", "", label), createElement("dd", "", value)));
  if (project.lastUpdated) {
    facts.append(createElement("dt", "", "最後更新"), createElement("dd", "", project.lastUpdated));
  }
  info.append(facts);

  const technologyList = createElement("div", "tag-list");
  if (project.technologies.length) {
    project.technologies.forEach((technology) => technologyList.append(createElement("span", "", technology)));
  } else {
    technologyList.append(createElement("span", "tag-pending", "技術資料待補"));
  }
  info.append(createElement("h2", "detail-subheading", "技術組合"), technologyList);

  const actions = createElement("div", "detail-actions");
  const githubLink = createLink("GitHub Repository ↗", project.github);
  const demoLink = createLink("線上 Demo ↗", project.demo);
  if (githubLink) actions.append(githubLink);
  if (demoLink) actions.append(demoLink);
  if (!githubLink) actions.append(createElement("p", "link-pending", "GitHub Repository 尚待確認。"));
  if (!demoLink) actions.append(createElement("p", "link-pending", "目前沒有已確認的線上 Demo。"));
  info.append(actions);
  body.append(description, info);

  container.append(heading, visual, body);
  document.title = `${project.name} — KU HUB`;
  document.querySelector('meta[name="description"]').content = project.description || "KU HUB 專案詳細介紹。";
  document.querySelector('meta[property="og:title"]').content = `${project.name} — KU HUB`;
  document.querySelector('meta[property="og:description"]').content = project.description || "KU HUB 專案詳細介紹。";
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

  renderProject(project, detail);
  detail.hidden = false;
  loadState.textContent = "";
}).catch((error) => {
  console.error("KU HUB 專案資料載入失敗：", error);
  loadState.textContent = "無法載入專案資料，請確認網路連線或稍後重試。";
});
