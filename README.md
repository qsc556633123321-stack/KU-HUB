# KU HUB

KU HUB 是使用純 HTML、CSS 與 JavaScript 製作的個人專案入口網站，不需要伺服器、資料庫、建置流程或 API 金鑰。所有網站內容均可由 GitHub Pages 靜態託管。

## 本機預覽

直接在瀏覽器開啟 `index.html` 即可預覽；也可以將此資料夾部署到任何靜態網站託管服務。

## 部署到 GitHub Pages

1. 將 `index.html`、`style.css`、`script.js` 與 `README.md` 放在 GitHub 儲存庫根目錄，提交並推送到 GitHub。
2. 在儲存庫開啟 **Settings → Pages**。
3. 在 **Build and deployment** 選擇 **Deploy from a branch**。
4. 選擇網站所在的分支（例如 `main`）及資料夾 `/(root)`，按下 **Save**。
5. 等待部署完成，GitHub Pages 會在 Pages 設定頁顯示網站網址。

若使用 `username.github.io` 命名的儲存庫，網站會部署在網域根目錄；一般儲存庫則會部署在 `https://username.github.io/repository-name/`。網站內部資源已使用相對路徑，兩種網址都能正常載入。

## 個人化內容

- 將 `index.html` 內的 `your-username` 替換成自己的 GitHub 使用者名稱。
- 在 `index.html` 更新自我介紹、技能、專案簡介及技術標籤。
- 專案卡片目前指向 `./projects/<專案資料夾>/`。將自己的專案頁放入對應資料夾，或依實際位置調整卡片連結；所有站內連結都應維持相對路徑。
- 字型使用 Google Fonts 的 Space Grotesk 與 DM Mono；若希望完全離線運作，可移除 `index.html` 中的 Google Fonts 載入標籤，頁面會使用後備字型。

## 檔案

- `index.html`：網站內容與結構。
- `style.css`：深色科技風格、響應式版面與動畫。
- `script.js`：手機導覽選單與專案分類篩選。