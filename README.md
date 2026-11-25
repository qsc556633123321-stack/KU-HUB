# KU HUB V2.0

KU HUB 是獨立科技品牌與數位平台，涵蓋產品、數位工具、AI 應用與實驗室。原生 HTML、CSS 與 JavaScript 可由靜態 HTTP 伺服器直接提供。

## 本機預覽

在 Repository 根目錄執行：

```sh
python -m http.server 8000
```

開啟 <http://localhost:8000/>。專案檔案庫和詳情頁透過 Fetch API 載入 JSON，需使用 HTTP 預覽。

## 專案資料

`data/projects.json` 管理檔案庫與專案詳情。每筆包含 `id`、`name`、`category`、`description`、`longDescription`、`version`、`status`、`technologies`、`image`、`github`、`demo`、`featured` 與 `lastUpdated`。

- 分類包含 `Web App`、`AI Tools`、`Game Development`、`Automation`、`Bot`、`Other`。
- 狀態包含「開發中」、「測試中」、「已完成」、「暫停開發」、「資料待補」。日期採用 `YYYY-MM-DD`。
- 外部連結及圖片使用 HTTPS。缺少圖片或載入失敗時會顯示預設視覺。
- 檔案庫入口為 `/#projects`，詳情可從 `project.html?id=<專案 id>` 直接開啟。

## 部署

正式網站為 <https://kuhub.net/>。Coolify 從 GitHub 的 `main` 分支部署 Repository 根目錄的靜態檔案，由 GitHub Webhook 觸發更新。
