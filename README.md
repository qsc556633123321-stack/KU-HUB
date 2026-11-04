# KU HUB V1.1

KU HUB 是以原生 HTML、CSS 與 Vanilla JavaScript 製作的動態專案入口。專案資料放在 `data/projects.json`，不需建置流程、後端、資料庫或 API Key，可部署於 GitHub Pages。

## 本機預覽

首頁和專案詳細頁使用 Fetch API 載入 JSON。由於瀏覽器通常會限制 `file://` 頁面讀取本機 JSON，請透過本機 HTTP Server 預覽，而不要直接雙擊開啟 HTML：

```bash
python3 -m http.server 8000
```

接著在瀏覽器開啟 <http://localhost:8000/>。若已安裝 Node.js，也可執行 `npx serve .`。

## 專案資料維護

編輯 `data/projects.json` 陣列即可新增或更新專案。每筆資料包含 `id`、`name`、`category`、`description`、`longDescription`、`version`、`status`、`technologies`、`image`、`github`、`demo`、`featured` 與 `lastUpdated`。未知資料請留空或使用「資料待補」／「版本未提供」，不要填入未確認的連結。

- `category` 使用 `Web App`、`AI Tools`、`Game Development`、`Automation`、`Bot` 或 `Other`。
- `status` 使用「開發中」、「測試中」、「已完成」、「暫停開發」或「資料待補」。
- 外部連結及圖片只接受 HTTPS；圖片缺失或無法載入時會使用預設視覺。
- 專案詳細頁使用靜態 `project.html?id=<專案 id>`，可直接分享，並可由瀏覽器上一頁返回。
- 卡片、分類數量、搜尋結果與首頁統計均依 JSON 動態產生。

## 部署到 GitHub Pages

1. 將網站檔案提交至 Repository。
2. 在 GitHub 開啟 **Settings → Pages**。
3. 選擇 **Deploy from a branch**，指定分支與 `/(root)` 資料夾。
4. 儲存並等待部署完成。網站內部資源使用相對路徑，可部署於 Repository 子路徑。

## 檔案

- `index.html`：首頁與 SEO／分享資訊。
- `project.html`：靜態專案詳細頁。
- `style.css`：溫馨鄉村風格、響應式版面與支援減少動態偏好的動畫。
- `script.js`：行動版導覽選單。
- `js/projects.js`：資料載入、分類、搜尋、排序及卡片產生。
- `js/project-detail.js`：詳細頁資料呈現。
- `data/projects.json`：專案資料來源。
- `assets/icons/favicon.svg`：網站圖示。