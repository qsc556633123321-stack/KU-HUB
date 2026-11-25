# KU HUB V3.0

KU HUB 是科技品牌與技術生態系平台。首頁展示正式產品、技術領域、完整公開專案庫、實驗室、開發動態、基礎設施、品牌資訊與聯絡入口。

## 本機啟動

在 Repository 根目錄執行：

```sh
python -m http.server 8000 --bind 127.0.0.1
```

開啟 <http://127.0.0.1:8000/>。專案資料和 JavaScript 模組透過 HTTP 載入。

## 公開專案資料

`data/projects.json` 是首頁統計、正式產品、技術生態系、專案庫、開發動態與詳情的資料來源。舊版 `/#projects` 和 `project.html?id=<專案 ID>` 繼續支援。

| 欄位 | 用途 |
| --- | --- |
| `id`、`name`、`category` | 既有 ID、名稱與篩選分類。ID 必須唯一且穩定。 |
| `description`、`longDescription`、`version`、`status`、`technologies` | 既有摘要、詳情、版本、狀態及技術。 |
| `image`、`github`、`demo`、`featured`、`lastUpdated` | 既有封面、連結、精選和更新日期。日期使用 `YYYY-MM-DD`。 |
| `labs` | 設為 `true` 以在 Labs 推薦已公開收錄的實驗項目。 |
| `type`、`domain` | 專案類型及技術生態系分組。舊資料以分類作為分組。 |
| `visibility`、`sourceVisibility` | 公開資料填 `visibility: "public"`，來源可標示 `public` 或 `unconfirmed`。舊版已公開資料可省略兩欄。 |
| `developmentStage`、`links` | 階段與具名連結。已驗證的正式產品填 `production`，並在 `links.production` 指定 HTTPS 入口。`links.github` 與 `links.demo` 支援舊欄位回退。 |
| `highlights`、`features`、`architecture` | 亮點和功能為字串陣列，架構為文字。 |
| `screenshots`、`changelog` | 截圖為 `{url, alt}` 陣列，更新紀錄為 `{version, date, description}` 陣列。 |

缺少的選填欄位可省略。版本、功能、截圖、狀態及正式入口應有公開來源或核准資料可供查核。公開 JSON 會原樣提供給訪客，請勿將私人資訊、內部連結或未核准項目寫入其中。

## 靜態資源版本

修改網頁、CSS、JavaScript、JSON 或本機視覺資產後執行：

```sh
node tools/version-assets.mjs
node tools/version-assets.mjs --check
```

腳本依正規化後的檔案內容產生固定 SHA-256 版本，更新 HTML 的本機資源引用、JavaScript 模組與 JSON 依賴的 `?v=`。將變更後的檔案一併提交。Node.js 僅用於本機產生和核對版本。網站依然可以由 Nginx 直接服務。

## 正式部署前驗收

- 在候選分支確認完整專案庫和首頁統計與核准資料一致。
- 確認 EventFlow 的正式入口為 <https://eventflow.kuhub.net>，版本為 V2.9.0。
- 檢查手機與桌面的導覽、搜尋、分類、排序、詳情、外部入口和減少動態效果設定。
- 執行版本檢查並確認暫存檔、秘密及私人候選資料均未進入變更。
- 待核准後使用現有 GitHub `main` 與 Coolify Webhook 流程。確認正式站首頁、詳情頁及帶版本的 CSS、JavaScript 模組和 JSON 回傳成功。
