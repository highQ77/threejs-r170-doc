/* API 參考：整理分組順序並產生索引頁（必須最後載入） */
(function () {
var D = window.DOCS;
function group(name) { return D.find(function (g) { return g.group === name; }); }
function ensure(name) {
  var g = group(name);
  if (!g) { g = { group: name, section: 'api', items: [] }; D.push(g); }
  return g;
}
function move(id, toGroup, front) {
  D.forEach(function (g) {
    var i = g.items.findIndex(function (p) { return p.id === id; });
    if (i >= 0 && g.group !== toGroup) {
      var p = g.items.splice(i, 1)[0];
      var t = ensure(toGroup);
      if (front) t.items.unshift(p); else t.items.push(p);
    }
  });
}

/* 附加模組重新分類 */
move('api-transformcontrols', '附加：控制器 Controls', true);
move('api-orbitcontrols', '附加：控制器 Controls', true);
move('api-effectcomposer', '附加：後期處理 Post-processing', true);
move('api-gltfloader', '附加：載入器 Loaders', true);

/* 分組順序 */
var ORDER = [
  'API 總覽', '核心 Core', '常數 Constants', '場景 Scenes', '相機 Cameras', '音訊 Audio', '渲染器 Renderers', '著色器 Shaders', 'WebXR',
  '物件 Objects', '幾何體 Geometries', '材質 Materials', '光源 Lights', '貼圖 Textures', '載入器 Loaders', '動畫 Animation', '動畫軌道 Tracks',
  '數學 Math', '插值器 Interpolants', '曲線 Curves', '工具 Extras', '輔助物件 Helpers',
  '附加：控制器 Controls', '附加：幾何體 Geometries', '附加：物件與光源 Objects', '附加：線條 Lines', '附加：輔助物件 Helpers',
  '附加：載入器 Loaders', '附加：匯出器 Exporters', '附加：渲染器 Renderers', '附加：後期處理 Post-processing',
  '附加：數學 Math', '附加：工具 Utils', '附加：動畫 Animation', '附加：其他 Misc',
];
var guide = D.filter(function (g) { return g.section !== 'api'; });
var api = D.filter(function (g) { return g.section === 'api' && g.items.length; });
api.sort(function (a, b) {
  var ia = ORDER.indexOf(a.group), ib = ORDER.indexOf(b.group);
  return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
});
D.length = 0;
guide.concat(api).forEach(function (g) { D.push(g); });

/* 索引頁 */
var index = D.filter(function (g) { return g.section === 'api' && g.group !== 'API 總覽'; });
var count = index.reduce(function (n, g) { return n + g.items.length; }, 0);
var home = group('API 總覽').items[0];
home.html =
  '<p>three.js r170 的繁體中文 API 參考，涵蓋官方文件的全部核心類別與附加模組，共 <b>' + count + '</b> 個頁面。每個類別頁面包含：繼承鏈、建構子參數、屬性、方法與靜態成員說明，並附有<b>可編輯、可即時執行</b>的範例。</p>' +
  '<ul><li>頁首的「範例」是完整示範；許多屬性與方法下方也有 <code>範例</code> 按鈕，展開即可執行該成員的專屬範例。</li>' +
  '<li>型別名稱若有對應頁面會自動加上連結，例如 <a href="#/api-vector3">Vector3</a>。</li>' +
  '<li>視覺範例使用 <a href="#/api-stage">doc-stage 輔助模組</a> 省略重複的場景建立程式碼。</li>' +
  '<li>按 <code>⌘K</code> / <code>Ctrl K</code> 或 <code>/</code> 搜尋類別、屬性與方法名稱（例如 <code>lerp</code>、<code>castShadow</code>）。</li></ul>' +
  '<h2>類別索引</h2><div class="api-index">' +
  index.map(function (g) {
    return '<section><h3>' + g.group + '</h3>' + g.items.map(function (p) {
      return '<a href="#/' + p.id + '">' + p.title + '</a>';
    }).join('') + '</section>';
  }).join('') + '</div>' +
  '<p class="muted">版本：three.js r170。原始文件：<a href="https://threejs.org/docs/" target="_blank" rel="noopener">threejs.org/docs</a></p>';
})();
