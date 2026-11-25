const PROJECTS_URL = new URL("../data/projects.json?v=1c1584543030a885", import.meta.url);
const PROJECT_STATUSES = ["正式上線", "開發中", "測試中", "已完成", "暫停開發", "資料待補"];
export const CATEGORY_NAMES = {
  "Web App": "Web App",
  "AI Tools": "AI Tools",
  "Game Development": "Game Development",
  Automation: "Automation",
  Bot: "Bot",
  Other: "Other",
};

function readText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function readList(value) {
  return Array.isArray(value) ? value.map(readText).filter(Boolean) : [];
}

function readDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value ? value : "";
}

export function safeExternalUrl(value) {
  try {
    const url = new URL(readText(value));
    return url.protocol === "https:" && !url.username && !url.password ? url.href : "";
  } catch {
    return "";
  }
}

function normalizeProject(project) {
  if (!project || !readText(project.id) || !readText(project.name)) return null;
  if (Object.hasOwn(project, "visibility") && project.visibility !== "public") return null;

  const category = Object.hasOwn(CATEGORY_NAMES, project.category) ? project.category : "Other";
  const status = PROJECT_STATUSES.includes(project.status) ? project.status : "資料待補";
  const sourceVisibility = readText(project.sourceVisibility);
  const github = !sourceVisibility || sourceVisibility === "public"
    ? safeExternalUrl(project.links?.github) || safeExternalUrl(project.github)
    : "";
  const demo = safeExternalUrl(project.links?.demo) || safeExternalUrl(project.demo);
  const production = safeExternalUrl(project.links?.production) || (status === "正式上線" ? demo : "");
  const screenshots = Array.isArray(project.screenshots) ? project.screenshots.flatMap((shot) => {
    const url = safeExternalUrl(shot?.url);
    const alt = readText(shot?.alt);
    return url && alt ? [{ url, alt }] : [];
  }) : [];
  const changelog = Array.isArray(project.changelog) ? project.changelog.flatMap((entry) => {
    const date = readDate(entry?.date);
    const version = readText(entry?.version);
    const description = readText(entry?.description);
    return description ? [{ date, version, description }] : [];
  }) : [];

  return {
    id: readText(project.id),
    name: readText(project.name),
    category,
    type: readText(project.type),
    domain: readText(project.domain) || category,
    description: readText(project.description),
    longDescription: readText(project.longDescription),
    version: readText(project.version) || "版本未提供",
    status,
    sourceVisibility,
    developmentStage: readText(project.developmentStage) || (status === "正式上線" ? "production" : ""),
    technologies: readList(project.technologies),
    highlights: readList(project.highlights),
    features: readList(project.features),
    screenshots,
    architecture: readText(project.architecture),
    changelog,
    image: safeExternalUrl(project.image),
    github,
    demo: demo === production ? "" : demo,
    production,
    featured: project.featured === true,
    labs: project.labs === true,
    lastUpdated: readDate(project.lastUpdated),
  };
}

export async function fetchProjects() {
  const response = await fetch(PROJECTS_URL);
  if (!response.ok) throw new Error(`專案資料讀取失敗（HTTP ${response.status}）`);
  const records = await response.json();
  if (!Array.isArray(records)) throw new Error("專案資料格式錯誤：預期為 JSON 陣列。");
  const projects = new Map();
  for (const record of records) {
    const project = normalizeProject(record);
    if (project && !projects.has(project.id)) projects.set(project.id, project);
  }
  return [...projects.values()];
}

export function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

const svgNamespace = "http://www.w3.org/2000/svg";
const motifs = {
  "eventflow": [250, "M224 74h192v117H224z M224 105h192 M253 65v52m134-52v52 M255 135h34m15 0h34m14 0h34 M255 162h34m15 0h34m14 0h34"],
  "online-rpg": [189, "M208 147l112-76 112 76-112 67z M208 147v27l112 59 112-59v-27 M264 109l112 70m-112 0 112-70"],
  "discord-music-bot": [283, "M209 147h23l11-20 15 44 14-77 18 104 15-74 16 39 20-50 14 76 18-49 13 12h48"],
  "field-dispatch-assistant": [168, "M223 169h48l28-61h40l21 47h43 M223 162v14m-7-7h14 M403 148v14m-7-7h14 M253 190h127l53-78"],
  "multi-llm-router": [266, "M236 82h39v32h-39z M236 164h39v32h-39z M300 122h40v32h-40z M365 82h39v32h-39z M365 164h39v32h-39z M275 98h11v40h14m-25 42h11v-42m54 0h14V98h11m-11 40v42h11"],
  "tw-stock-dashboard": [155, "M217 80v120h212 M230 173l28-34 35 16 42-61 35 32 50-41 M248 192v-15m32 15v-23m32 23v-27m32 27v-48m32 48v-39m32 39v-57"],
  "unity-idle-rpg": [223, "M320 63l95 49v55l-95 53-95-53v-55z M225 112l95 48 95-48 M320 160v60 M272 88l96 49v55"],
  "discord-auto-bot": [206, "M213 77h214v125H213z M213 103h214 M246 125l23 20-23 20m42 0h75"],
  "auto-quest-translate-translations": [302, "M217 80h86v80h-42l-23 25v-25h-21z M337 105h86v80h-21v24l-24-24h-41z M238 108h44m-44 22h33m85 5h47m-47 22h33"],
  "kuhub": [245, "M320 64l86 49v52l-86 49-86-49v-52z M320 64v150m-86-101 172 52m0-52-172 52 M281 113h78v52h-78z"],
};

export function createProjectCover(project) {
  const seed = [...project.id].reduce((sum, character) => (sum * 31 + character.codePointAt(0)) >>> 0, 0);
  const [hue, drawing] = Object.hasOwn(motifs, project.id) ? motifs[project.id] : [
    170 + seed % 140,
    ["M236 104h168v76H236z M271 104v76m49-76v76m49-76v76", "M229 142l91-59 91 59-91 59z M229 142h182m-91-59v118"][seed % 2],
  ];
  const svg = document.createElementNS(svgNamespace, "svg");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("class", "cover-art");
  svg.setAttribute("viewBox", "0 0 640 280");
  svg.style.background = `radial-gradient(ellipse at center, hsl(${hue} 39% 29%), hsl(${hue} 31% 11%) 76%)`;

  const grid = document.createElementNS(svgNamespace, "path");
  const horizontal = Array.from({ length: 7 }, (_, index) => `M0 ${28 + index * 37}H640`);
  const vertical = Array.from({ length: 15 }, (_, index) => `M${26 + index * 42} 0V280`);
  grid.setAttribute("d", [...horizontal, ...vertical].join(" "));
  grid.setAttribute("stroke", `hsl(${hue} 56% 71% / .13)`);
  svg.append(grid);

  const icon = document.createElementNS(svgNamespace, "path");
  icon.setAttribute("d", drawing);
  icon.setAttribute("fill", "none");
  icon.setAttribute("stroke", `hsl(${hue} 75% 84%)`);
  icon.setAttribute("stroke-width", "2.5");
  icon.setAttribute("stroke-linecap", "round");
  icon.setAttribute("stroke-linejoin", "round");
  svg.append(icon);
  return svg;
}
