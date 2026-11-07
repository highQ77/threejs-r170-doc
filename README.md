# Three.js r170 繁中文件

以繁體中文整理的 [Three.js](https://threejs.org/) **r170（0.170.0）** 文件，架構參考 [threejs.org/docs](https://threejs.org/docs/)。每個主題都有**可直接編輯、即時執行**的範例：改完程式碼後按一下就能看到結果。

整個網站是純靜態頁面，不需要建置（build），也沒有後端。

## 特色

- **教學指南**：24 篇教學，從入門、場景與相機、幾何體與材質、光源與陰影、動畫與互動、模型載入，一路寫到自訂著色器、後期處理、效能最佳化與數學。
- **API 參考**：287 個條目，涵蓋核心類別（Core、Objects、Geometries、Materials、Lights、Textures、Loaders、Animation、Math、Curves、Helpers 等），以及附加模組 Addons（Controls、Loaders、Exporters、Post-processing、CSS2D/CSS3D Renderer 等）。
- **即時範例編輯器**：使用 CodeMirror 編輯器，範例在沙箱化的 `iframe` 中執行，透過 import map 從 unpkg 載入 `three@0.170.0`。
  - `▶ 執行` 或 `⌘/Ctrl + Enter` 執行程式碼
  - `console.log` 的輸出與錯誤會顯示在下方的主控台區塊，Vector3、Matrix4、Color 等物件會被整理成好讀的格式
  - 修改內容會自動存在瀏覽器裡，按 `↺ 重設` 可以還原
  - 範例要捲動到畫面中才會執行（IntersectionObserver），以節省效能
- **全文搜尋**：可搜尋類別、屬性與方法，快捷鍵 `⌘K` / `Ctrl+K` 或 `/`。
- **外觀設定**：可切換深色／淺色模式，並提供 6 種主題配色（海洋藍、靛藍、翡翠綠、珊瑚橘、玫瑰紫、石墨黑白），設定會被記住。
- **閱讀輔助**：側邊目錄、本頁目錄、閱讀進度條、回到頂端按鈕，並支援手機版面。

## 快速開始

範例需要透過網路載入 CDN 資源，而且 ES module 在 `file://` 底下可能受到限制，建議用本機伺服器開啟：

```bash
git clone https://github.com/highQ77/threejs-r170-doc.git
cd threejs-r170-doc

# 擇一即可
python3 -m http.server 8000
# 或
npx serve .
```

接著在瀏覽器開啟 <http://localhost:8000>。

也可以直接部署到 GitHub Pages、Netlify、Vercel 等靜態網站服務。

## 專案結構

```
threejs-r170-doc/
├── index.html              # 入口頁面：版面、頂部列，並依序載入所有腳本
└── assets/
    ├── style.css           # 全站樣式（深淺色、配色主題、RWD）
    ├── app.js              # 路由、導覽、搜尋、頁面渲染、範例執行環境
    ├── content.js          # 教學內容（一）：入門、核心、幾何體與材質、光源與陰影
    ├── content2.js         # 教學內容（二）：動畫與互動、載入器、進階、數學
    └── api/
        ├── api-core.js           # API：總覽、核心、場景、相機、渲染器……
        ├── api-objects.js        # API：物件
        ├── api-geometries.js     # API：幾何體
        ├── api-materials.js      # API：材質
        ├── api-lights.js         # API：光源
        ├── api-textures-anim.js  # API：貼圖、動畫
        ├── api-math.js           # API：數學
        ├── api-addons.js         # API：附加模組
        ├── api-x-*.js            # API：補充條目（核心、物件、幾何/材質/光源、數學、貼圖/載入器、附加模組）
        └── api-index.js          # 分組排序並產生 API 索引頁（必須最後載入）
```

### 運作方式

1. 內容檔把頁面資料推進全域陣列 `window.DOCS`，每個分組長這樣：
   ```js
   { group: '分組名稱', section: 'api', items: [ { id, title, en, html, ... } ] }
   ```
   沒有 `section: 'api'` 的分組屬於「教學指南」。
2. `api-index.js` 負責調整分組順序、重新歸類附加模組，並產生 API 總覽索引。
3. `app.js` 依 hash 路由（例如 `#/intro`、`#/api`）渲染頁面、建立側邊目錄與搜尋索引，並掛上範例編輯器。

## 撰寫／修改內容

- 教學頁面放在 `assets/content.js`、`assets/content2.js`；API 條目放在 `assets/api/` 底下對應的檔案。
- 範例程式碼用 `String.raw` 標記的樣板字串撰寫，所以**內容中不能出現反引號（`` ` ``）與 `${`**。
- API 成員的格式是 `[簽名, 說明(HTML), 範例?]`。如果範例是字串，代表它是「只輸出 console」的程式片段；沒寫 `import` 的話，會自動補上 `import * as THREE from 'three'`。
- 視覺範例可以使用文件內建的輔助模組 `doc-stage`（`createStage()`），它會建好場景、相機、渲染器、OrbitControls、燈光與渲染迴圈。這個模組只屬於本文件，**不是** three.js 的一部分。
- 新增 API 腳本時，請在 `index.html` 中把它加在 `api-index.js` **之前**。

## 外部相依

全部透過 CDN 載入，不需要安裝：

| 資源 | 來源 |
| --- | --- |
| three.js 0.170.0（含 addons） | unpkg |
| CodeMirror 5.65.16 | cdnjs |
| Inter、JetBrains Mono、Noto Sans TC 字型 | Google Fonts |

## 相關連結

- 官方英文文件：<https://threejs.org/docs/>
- three.js 原始碼（r170）：<https://github.com/mrdoob/three.js/tree/r170>

## 授權

文件內容整理自 three.js 官方文件。three.js 本身採用 [MIT License](https://github.com/mrdoob/three.js/blob/dev/LICENSE)。
