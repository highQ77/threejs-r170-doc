/* Three.js 繁中文件內容（第一部分：入門與核心）
 * 範例程式碼使用 String.raw，內容中請勿使用反引號（`）與 ${ 。
 */
window.THREE_VERSION = '0.170.0';
var code = String.raw;

window.DOCS = [
  /* ===================================================== */
  {
    group: '入門', items: [

      {
        id: 'intro', title: '簡介', en: 'Introduction',
        html: `
<p><b>Three.js</b> 是一個建立在 WebGL（以及新的 WebGPU）之上的 JavaScript 3D 函式庫。它把繁瑣的著色器、緩衝區與矩陣運算包裝成「場景、相機、物件、材質、光源」等直覺的概念，讓你只用幾十行程式就能在瀏覽器中繪製互動式 3D 畫面。</p>
<p>本文件參考 <a href="https://threejs.org/docs/" target="_blank" rel="noopener">threejs.org/docs</a> 的架構，以繁體中文整理最常用的 API，並為每個主題提供<b>可直接編輯、即時執行</b>的範例。修改左側程式碼後按 <code>▶ 執行</code>（或 <code>⌘/Ctrl + Enter</code>）即可在右側看到結果，下方黑色區塊會顯示 <code>console.log</code> 輸出與錯誤訊息。你的修改會自動保存在瀏覽器中，按 <code>↺ 重設</code> 可還原。</p>

<h2>核心概念一覽</h2>
<table>
<tr><th>概念</th><th>類別</th><th>說明</th></tr>
<tr><td>場景</td><td><code>Scene</code></td><td>容納所有物件、光源的容器，是一棵樹狀結構的根節點。</td></tr>
<tr><td>相機</td><td><code>PerspectiveCamera</code>、<code>OrthographicCamera</code></td><td>決定從哪個位置、什麼角度觀看場景。</td></tr>
<tr><td>渲染器</td><td><code>WebGLRenderer</code></td><td>把場景透過相機畫到 <code>&lt;canvas&gt;</code> 上。</td></tr>
<tr><td>網格</td><td><code>Mesh</code></td><td>由「幾何體（形狀）」加上「材質（外觀）」組成的可見物件。</td></tr>
<tr><td>幾何體</td><td><code>BufferGeometry</code> 及其子類</td><td>頂點位置、法線、UV 等資料。</td></tr>
<tr><td>材質</td><td><code>MeshStandardMaterial</code> 等</td><td>描述表面如何與光互動：顏色、粗糙度、金屬度……</td></tr>
<tr><td>光源</td><td><code>DirectionalLight</code> 等</td><td>照亮場景；部分材質需要光源才看得見。</td></tr>
</table>

<h2>目錄</h2>
<div class="home-grid">
  <a href="#/install"><b>安裝與引入</b><span>CDN、importmap、npm</span></a>
  <a href="#/first-scene"><b>建立第一個場景</b><span>Scene + Camera + Renderer</span></a>
  <a href="#/geometry"><b>幾何體</b><span>內建形狀與自訂 BufferGeometry</span></a>
  <a href="#/materials"><b>材質</b><span>Basic / Lambert / Standard …</span></a>
  <a href="#/lights"><b>光源</b><span>環境光、平行光、點光、聚光</span></a>
  <a href="#/raycaster"><b>滑鼠互動</b><span>Raycaster 物件拾取</span></a>
  <a href="#/loaders"><b>載入 3D 模型</b><span>GLTFLoader 與動畫</span></a>
  <a href="#/shader"><b>自訂著色器</b><span>ShaderMaterial / GLSL</span></a>
  <a href="#/api"><b>📘 API 參考</b><span>上百個類別的屬性與方法，附可執行範例</span></a>
</div>

<div class="tip"><b>提示：</b>本文件的範例透過 CDN（unpkg）載入 three.js r170，需要網路連線。範例中的 <code>innerWidth</code>、<code>innerHeight</code> 指的是右側預覽框的大小；拖曳預覽框右下角可以調整高度。</div>
`
      },

      {
        id: 'install', title: '安裝與引入', en: 'Installation',
        html: `
<p>Three.js 以 ES Module 形式發佈。最常見的兩種使用方式是：<b>透過 npm 搭配打包工具</b>，或是<b>直接在 HTML 中用 importmap 從 CDN 載入</b>。</p>

<h2>方式一：npm + 建置工具（推薦用於正式專案）</h2>
<pre class="code" data-lang="bash"><code>
# 建立 Vite 專案並安裝 three
npm create vite@latest my-three-app -- --template vanilla
cd my-three-app
npm install three
npm run dev
</code></pre>
<pre class="code"><code>
// main.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
</code></pre>

<h2>方式二：importmap + CDN（零設定）</h2>
<p>不需要任何建置工具，建立一個 HTML 檔即可。<code>importmap</code> 讓瀏覽器知道 <code>'three'</code> 這個名稱要對應到哪個網址。</p>
<pre class="code" data-lang="html"><code>
&lt;script type="importmap"&gt;
{
  "imports": {
    "three": "https://unpkg.com/three@0.170.0/build/three.module.js",
    "three/addons/": "https://unpkg.com/three@0.170.0/examples/jsm/"
  }
}
&lt;/script&gt;

&lt;script type="module"&gt;
  import * as THREE from 'three';
  import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
  // ……你的程式
&lt;/script&gt;
</code></pre>

<div class="note"><b>注意：</b>ES Module 無法透過 <code>file://</code> 載入本機的 .js 檔案。開發時請使用本機伺服器，例如 <code>npx serve</code> 或 <code>python3 -m http.server</code>。</div>

<h2>附加模組（Addons）</h2>
<p>核心套件 <code>three</code> 只包含基本功能。控制器、載入器、後期處理等放在 <code>three/addons/</code>（實際路徑為 <code>examples/jsm/</code>）：</p>
<table>
<tr><th>模組</th><th>引入路徑</th></tr>
<tr><td>OrbitControls</td><td><code>three/addons/controls/OrbitControls.js</code></td></tr>
<tr><td>GLTFLoader</td><td><code>three/addons/loaders/GLTFLoader.js</code></td></tr>
<tr><td>EffectComposer</td><td><code>three/addons/postprocessing/EffectComposer.js</code></td></tr>
<tr><td>lil-gui（參數面板）</td><td><code>three/addons/libs/lil-gui.module.min.js</code></td></tr>
<tr><td>Stats（效能監看）</td><td><code>three/addons/libs/stats.module.js</code></td></tr>
</table>
`,
        examples: [{
          title: '確認 three.js 已載入',
          desc: '印出版本號與幾個常數，確認 import 正常運作。',
          consoleOnly: true,
          code: code`
import * as THREE from 'three';

console.log('three.js 版本：r' + THREE.REVISION);
console.log('可用的幾何體數量：',
  Object.keys(THREE).filter(k => k.endsWith('Geometry')).length);
console.log('MathUtils.degToRad(180) =', THREE.MathUtils.degToRad(180));
`
        }]
      },

      {
        id: 'first-scene', title: '建立第一個場景', en: 'Creating a scene',
        html: `
<p>要用 three.js 顯示任何東西，需要三樣東西：<b>場景（Scene）</b>、<b>相機（Camera）</b>與<b>渲染器（Renderer）</b>，然後用相機把場景「拍」下來。</p>

<h2>步驟</h2>
<ol>
<li><b>建立場景</b>：<code>const scene = new THREE.Scene()</code></li>
<li><b>建立相機</b>：<code>new THREE.PerspectiveCamera(fov, aspect, near, far)</code>
  <ul>
  <li><code>fov</code>：垂直視野角度（度）。</li>
  <li><code>aspect</code>：長寬比，通常是畫布寬 / 高。</li>
  <li><code>near</code>、<code>far</code>：近、遠裁切面，超出此範圍的物件不會被繪製。</li>
  </ul></li>
<li><b>建立渲染器</b>並把它的 <code>domElement</code>（一個 canvas）加入網頁。</li>
<li><b>加入物件</b>：<code>Mesh = 幾何體 + 材質</code>，用 <code>scene.add()</code> 放入場景。</li>
<li><b>渲染迴圈</b>：使用 <code>renderer.setAnimationLoop()</code> 每一幀更新並重新繪製。</li>
</ol>

<div class="tip">相機預設位於原點 <code>(0,0,0)</code> 並朝 <code>-Z</code> 方向看。如果物件也在原點，相機會在物件「裡面」而看不到，所以要把相機往後移（<code>camera.position.z = 3</code>）。</div>
`,
        examples: [{
          title: '旋轉的立方體',
          desc: '最小可運作的 three.js 程式。試著把 BoxGeometry 換成 TorusKnotGeometry(0.6, 0.2, 128, 16)。',
          code: code`
import * as THREE from 'three';

// 1. 場景
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x20232a);

// 2. 相機
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
camera.position.z = 3;

// 3. 渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

// 4. 物件：幾何體 + 材質 = 網格
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshNormalMaterial(); // 以法線方向上色，不需要光源
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// 5. 渲染迴圈
renderer.setAnimationLoop((time) => {
  cube.rotation.x = time / 2000;
  cube.rotation.y = time / 1000;
  renderer.render(scene, camera);
});

// 視窗大小改變時更新相機與畫布
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
`
        }, {
          title: '加入光源與標準材質',
          desc: 'MeshStandardMaterial 是基於物理的材質（PBR），需要光源才看得到。',
          code: code`
import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1b1e24);
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 1.2, 4);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

// 光源
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const sun = new THREE.DirectionalLight(0xffffff, 2.5);
sun.position.set(3, 4, 5);
scene.add(sun);

// 三個不同顏色的物件
const colors = [0xff6b6b, 0x4dabf7, 0x51cf66];
const meshes = colors.map((color, i) => {
  const mesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.6, 0),
    new THREE.MeshStandardMaterial({ color, roughness: 0.4, flatShading: true })
  );
  mesh.position.x = (i - 1) * 1.6;
  scene.add(mesh);
  return mesh;
});

renderer.setAnimationLoop((t) => {
  meshes.forEach((m, i) => {
    m.rotation.y = t / 1000 + i;
    m.position.y = Math.sin(t / 500 + i) * 0.2;
  });
  renderer.render(scene, camera);
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
`
        }]
      }
    ]
  },

  /* ===================================================== */
  {
    group: '核心', items: [

      {
        id: 'scene', title: '場景、背景與霧', en: 'Scene / Fog',
        html: `
<p><code>Scene</code> 繼承自 <code>Object3D</code>，是所有物件的根節點。除了 <code>add()</code>、<code>remove()</code> 之外，還有幾個重要屬性：</p>
<table>
<tr><th>屬性</th><th>型別</th><th>說明</th></tr>
<tr><td><code>background</code></td><td>Color / Texture / CubeTexture</td><td>背景。可以是純色、圖片或天空盒。</td></tr>
<tr><td><code>environment</code></td><td>Texture</td><td>環境貼圖，會作用在所有 PBR 材質的反射上。</td></tr>
<tr><td><code>fog</code></td><td>Fog / FogExp2</td><td>霧效果，讓遠處物件逐漸融入霧色。</td></tr>
<tr><td><code>backgroundBlurriness</code></td><td>number</td><td>背景貼圖模糊程度（0–1）。</td></tr>
</table>

<h2>Fog 與 FogExp2</h2>
<ul>
<li><code>new THREE.Fog(color, near, far)</code>：線性霧，在 near 到 far 之間逐漸變濃。</li>
<li><code>new THREE.FogExp2(color, density)</code>：指數霧，更接近真實大氣效果。</li>
</ul>
<div class="tip">霧色通常會和 <code>scene.background</code> 設定成相同顏色，看起來才自然。</div>

<h2>常用方法</h2>
<table>
<tr><th>方法</th><th>說明</th></tr>
<tr><td><code>scene.add(obj, ...)</code></td><td>加入一個或多個物件。</td></tr>
<tr><td><code>scene.remove(obj)</code></td><td>移除物件（不會自動釋放 GPU 資源）。</td></tr>
<tr><td><code>scene.getObjectByName(name)</code></td><td>依名稱搜尋子物件。</td></tr>
<tr><td><code>scene.traverse(fn)</code></td><td>走訪所有子孫物件。</td></tr>
</table>
`,
        examples: [{
          title: '霧中的柱子森林',
          desc: '修改 Fog 的 near / far，或換成 new THREE.FogExp2(0x9fb4c7, 0.08) 比較差異。',
          code: code`
import * as THREE from 'three';

const fogColor = 0x9fb4c7;
const scene = new THREE.Scene();
scene.background = new THREE.Color(fogColor);
scene.fog = new THREE.Fog(fogColor, 4, 22);

const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 2, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff, 0x445566, 2));

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  new THREE.MeshLambertMaterial({ color: 0x6b8e6b })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

const pillarGeo = new THREE.CylinderGeometry(0.2, 0.3, 3, 8);
const pillarMat = new THREE.MeshLambertMaterial({ color: 0x8d6e63 });
for (let i = 0; i < 200; i++) {
  const p = new THREE.Mesh(pillarGeo, pillarMat);
  p.position.set((Math.random() - 0.5) * 40, 1.5, (Math.random() - 0.5) * 40);
  p.scale.y = 0.5 + Math.random();
  scene.add(p);
}

renderer.setAnimationLoop((t) => {
  const a = t / 6000;
  camera.position.set(Math.sin(a) * 8, 2, Math.cos(a) * 8);
  camera.lookAt(0, 1, 0);
  renderer.render(scene, camera);
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
`
        }]
      },

      {
        id: 'cameras', title: '相機', en: 'Cameras',
        html: `
<p>相機決定了場景如何投影到 2D 畫面上。three.js 最常用的是透視相機與正交相機。</p>

<h2>PerspectiveCamera 透視相機</h2>
<p>模擬人眼：近大遠小。建構子：<code>new PerspectiveCamera(fov, aspect, near, far)</code></p>
<table>
<tr><th>參數</th><th>預設值</th><th>說明</th></tr>
<tr><td><code>fov</code></td><td>50</td><td>垂直視野（度）。數值越大越廣角。</td></tr>
<tr><td><code>aspect</code></td><td>1</td><td>寬高比。</td></tr>
<tr><td><code>near</code></td><td>0.1</td><td>近裁切面。</td></tr>
<tr><td><code>far</code></td><td>2000</td><td>遠裁切面。</td></tr>
</table>

<h2>OrthographicCamera 正交相機</h2>
<p>沒有透視效果，物件大小與距離無關。適合 2D 遊戲、等角視圖、CAD。建構子：<code>new OrthographicCamera(left, right, top, bottom, near, far)</code></p>

<h2>共通方法</h2>
<table>
<tr><th>方法</th><th>說明</th></tr>
<tr><td><code>camera.lookAt(x, y, z)</code></td><td>讓相機朝向某個點。</td></tr>
<tr><td><code>camera.updateProjectionMatrix()</code></td><td>修改 fov、aspect、near、far、zoom 等參數後<b>必須呼叫</b>。</td></tr>
<tr><td><code>camera.zoom</code></td><td>縮放倍率。</td></tr>
</table>
<div class="note">near 設得太小（例如 0.00001）而 far 很大時，會造成深度精度不足，出現 Z-fighting（表面閃爍）。</div>
`,
        examples: [{
          title: '透視 vs. 正交',
          desc: '按右上角按鈕切換相機，觀察同一排方塊在兩種投影下的差異。',
          code: code`
import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222831);

const aspect = innerWidth / innerHeight;
const perspective = new THREE.PerspectiveCamera(50, aspect, 0.1, 100);
const size = 5;
const ortho = new THREE.OrthographicCamera(-size * aspect, size * aspect, size, -size, 0.1, 100);
for (const cam of [perspective, ortho]) {
  cam.position.set(8, 6, 10);
  cam.lookAt(0, 0, -4);
}
let camera = perspective;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(5, 10, 7);
scene.add(light);
scene.add(new THREE.GridHelper(30, 30, 0x555555, 0x333333));

for (let i = 0; i < 8; i++) {
  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 1.2, 1.2),
    new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(i / 8, 0.7, 0.55) })
  );
  cube.position.set(0, 0.6, 3 - i * 2.2);
  scene.add(cube);
}

const btn = document.createElement('button');
btn.textContent = '目前：透視相機（點擊切換）';
btn.style.cssText = 'position:absolute;top:10px;right:10px;padding:8px 12px;font-size:14px;cursor:pointer';
btn.onclick = () => {
  camera = camera === perspective ? ortho : perspective;
  btn.textContent = '目前：' + (camera === perspective ? '透視' : '正交') + '相機（點擊切換）';
};
document.body.appendChild(btn);

renderer.setAnimationLoop(() => renderer.render(scene, camera));

addEventListener('resize', () => {
  const a = innerWidth / innerHeight;
  perspective.aspect = a;
  perspective.updateProjectionMatrix();
  ortho.left = -size * a; ortho.right = size * a;
  ortho.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
`
        }, {
          title: '調整 FOV',
          desc: '用 lil-gui 面板即時調整 fov、zoom 與相機位置，記得修改後呼叫 updateProjectionMatrix()。',
          code: code`
import * as THREE from 'three';
import GUI from 'three/addons/libs/lil-gui.module.min.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x15171c);
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 0, 6);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

const knot = new THREE.Mesh(
  new THREE.TorusKnotGeometry(1, 0.35, 160, 24),
  new THREE.MeshNormalMaterial()
);
scene.add(knot);

const gui = new GUI();
gui.add(camera, 'fov', 10, 150, 1).name('視野 fov').onChange(() => camera.updateProjectionMatrix());
gui.add(camera, 'zoom', 0.2, 4, 0.01).name('縮放 zoom').onChange(() => camera.updateProjectionMatrix());
gui.add(camera.position, 'z', 2, 20, 0.1).name('相機距離 z');

renderer.setAnimationLoop((t) => {
  knot.rotation.y = t / 2000;
  renderer.render(scene, camera);
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
`
        }]
      },

      {
        id: 'renderer', title: '渲染器', en: 'WebGLRenderer',
        html: `
<p><code>WebGLRenderer</code> 負責把場景繪製到 canvas。建構時可傳入參數物件：</p>
<table>
<tr><th>參數</th><th>預設</th><th>說明</th></tr>
<tr><td><code>canvas</code></td><td>—</td><td>指定既有的 canvas 元素；未指定則自動建立。</td></tr>
<tr><td><code>antialias</code></td><td>false</td><td>是否開啟反鋸齒。</td></tr>
<tr><td><code>alpha</code></td><td>false</td><td>畫布是否透明（可看見後方 HTML）。</td></tr>
<tr><td><code>powerPreference</code></td><td>"default"</td><td>"high-performance" / "low-power"。</td></tr>
<tr><td><code>preserveDrawingBuffer</code></td><td>false</td><td>需要截圖（toDataURL）時設為 true。</td></tr>
</table>

<h2>常用屬性與方法</h2>
<table>
<tr><th>名稱</th><th>說明</th></tr>
<tr><td><code>setSize(w, h)</code></td><td>設定畫布尺寸。</td></tr>
<tr><td><code>setPixelRatio(ratio)</code></td><td>設為 <code>devicePixelRatio</code> 讓高解析螢幕更清晰（建議上限 2）。</td></tr>
<tr><td><code>setAnimationLoop(fn)</code></td><td>設定每幀呼叫的函式；傳入 null 停止。WebXR 必須用它。</td></tr>
<tr><td><code>render(scene, camera)</code></td><td>繪製一幀。</td></tr>
<tr><td><code>setClearColor(color, alpha)</code></td><td>清除畫面的顏色。</td></tr>
<tr><td><code>shadowMap.enabled</code></td><td>開啟陰影。</td></tr>
<tr><td><code>toneMapping</code></td><td>色調映射，例如 <code>ACESFilmicToneMapping</code>。</td></tr>
<tr><td><code>toneMappingExposure</code></td><td>曝光值。</td></tr>
<tr><td><code>outputColorSpace</code></td><td>輸出色彩空間，預設 <code>SRGBColorSpace</code>。</td></tr>
<tr><td><code>info</code></td><td>繪製統計：draw calls、三角形數、記憶體中的幾何體與貼圖數。</td></tr>
<tr><td><code>dispose()</code></td><td>釋放渲染器資源。</td></tr>
</table>
`,
        examples: [{
          title: '色調映射與曝光',
          desc: '切換不同 toneMapping，觀察高亮度區域的差異；console 會印出 renderer.info。',
          code: code`
import * as THREE from 'three';
import GUI from 'three/addons/libs/lil-gui.module.min.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101014);
const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 0, 7);

const light = new THREE.PointLight(0xffffff, 120);
light.position.set(2, 3, 4);
scene.add(light, new THREE.AmbientLight(0xffffff, 0.2));

for (let i = 0; i < 5; i++) {
  const s = new THREE.Mesh(
    new THREE.SphereGeometry(0.6, 48, 24),
    new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(i / 5, 0.8, 0.5), roughness: 0.25, metalness: 0.2 })
  );
  s.position.x = (i - 2) * 1.4;
  scene.add(s);
}

const modes = {
  NoToneMapping: THREE.NoToneMapping,
  Linear: THREE.LinearToneMapping,
  Reinhard: THREE.ReinhardToneMapping,
  Cineon: THREE.CineonToneMapping,
  ACESFilmic: THREE.ACESFilmicToneMapping,
  AgX: THREE.AgXToneMapping,
  Neutral: THREE.NeutralToneMapping,
};
const params = { toneMapping: 'ACESFilmic' };
const gui = new GUI();
gui.add(params, 'toneMapping', Object.keys(modes)).onChange((v) => {
  renderer.toneMapping = modes[v];
});
gui.add(renderer, 'toneMappingExposure', 0.1, 3, 0.01).name('曝光');

let logged = false;
renderer.setAnimationLoop(() => {
  renderer.render(scene, camera);
  if (!logged) {   // 第一幀繪製完成後印出統計
    logged = true;
    const { calls, triangles } = renderer.info.render;
    console.log('draw calls =', calls, '，三角形數 =', triangles);
  }
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
`
        }]
      },

      {
        id: 'object3d', title: 'Object3D 與群組', en: 'Object3D / Group',
        html: `
<p><code>Object3D</code> 是場景中幾乎所有物件（Mesh、Light、Camera、Group……）的基底類別，提供位置、旋轉、縮放與父子階層。</p>

<h2>變換屬性</h2>
<table>
<tr><th>屬性</th><th>型別</th><th>說明</th></tr>
<tr><td><code>position</code></td><td>Vector3</td><td>相對於父物件的位置。</td></tr>
<tr><td><code>rotation</code></td><td>Euler</td><td>以弧度表示的旋轉（x, y, z），順序預設 'XYZ'。</td></tr>
<tr><td><code>quaternion</code></td><td>Quaternion</td><td>四元數旋轉，與 rotation 自動同步。</td></tr>
<tr><td><code>scale</code></td><td>Vector3</td><td>縮放。</td></tr>
<tr><td><code>visible</code></td><td>boolean</td><td>是否顯示。</td></tr>
<tr><td><code>name</code></td><td>string</td><td>名稱，可用 <code>getObjectByName</code> 查找。</td></tr>
<tr><td><code>children</code> / <code>parent</code></td><td>—</td><td>子物件陣列 / 父物件。</td></tr>
<tr><td><code>userData</code></td><td>object</td><td>存放自訂資料。</td></tr>
</table>

<h2>常用方法</h2>
<table>
<tr><th>方法</th><th>說明</th></tr>
<tr><td><code>add(obj)</code> / <code>remove(obj)</code></td><td>加入或移除子物件；子物件會跟著父物件一起移動、旋轉、縮放。</td></tr>
<tr><td><code>lookAt(v)</code></td><td>讓物件的 +Z 軸朝向某點（相機是 -Z）。</td></tr>
<tr><td><code>getWorldPosition(target)</code></td><td>取得世界座標。</td></tr>
<tr><td><code>translateX/Y/Z(d)</code></td><td>沿自身座標軸移動。</td></tr>
<tr><td><code>rotateX/Y/Z(rad)</code></td><td>沿自身座標軸旋轉。</td></tr>
<tr><td><code>traverse(fn)</code></td><td>遞迴走訪自己與所有子孫。</td></tr>
<tr><td><code>clone()</code></td><td>複製物件（幾何體與材質為共用參照）。</td></tr>
</table>
<p><code>Group</code> 是一個「空的」Object3D，用來把多個物件組成一組統一操作。</p>
`,
        examples: [{
          title: '太陽系：父子階層',
          desc: '地球是太陽系統的子物件、月球是地球系統的子物件。只需要旋轉每個「軌道群組」，就能自然得到公轉效果。',
          code: code`
import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 200);
camera.position.set(0, 22, 28);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.PointLight(0xffffff, 600, 0, 1.5));
scene.add(new THREE.AmbientLight(0xffffff, 0.08));

const sphere = new THREE.SphereGeometry(1, 32, 16);

// 太陽系統
const solarSystem = new THREE.Group();
scene.add(solarSystem);
const sun = new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0xffcc33 }));
sun.scale.setScalar(4);
solarSystem.add(sun);

// 地球軌道
const earthOrbit = new THREE.Group();
earthOrbit.position.x = 13;
solarSystem.add(earthOrbit);
const earth = new THREE.Mesh(sphere, new THREE.MeshStandardMaterial({ color: 0x2f7bff }));
earthOrbit.add(earth);

// 月球軌道（地球軌道的子物件）
const moonOrbit = new THREE.Group();
moonOrbit.position.x = 2.4;
earthOrbit.add(moonOrbit);
const moon = new THREE.Mesh(sphere, new THREE.MeshStandardMaterial({ color: 0xaaaaaa }));
moon.scale.setScalar(0.4);
moonOrbit.add(moon);

// 顯示座標軸，幫助理解每個節點的區域座標
[solarSystem, earthOrbit, moonOrbit].forEach((o) => {
  const axes = new THREE.AxesHelper(o === solarSystem ? 7 : 2);
  axes.material.depthTest = false;
  axes.renderOrder = 1;
  o.add(axes);
});

const worldPos = new THREE.Vector3();
let last = 0;
renderer.setAnimationLoop((t) => {
  const s = t / 1000;
  solarSystem.rotation.y = s * 0.3;
  earthOrbit.rotation.y = s * 1.5;
  earth.rotation.y = s * 2;
  renderer.render(scene, camera);

  if (t - last > 1000) {
    last = t;
    moon.getWorldPosition(worldPos);
    console.log('月球世界座標：', worldPos);
  }
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
`
        }]
      }
    ]
  },

  /* ===================================================== */
  {
    group: '幾何體與材質', items: [

      {
        id: 'geometry', title: '幾何體', en: 'Geometries',
        html: `
<p>幾何體描述物件的「形狀」。所有幾何體都是 <code>BufferGeometry</code>，資料以 <code>BufferAttribute</code>（型別化陣列）形式儲存在 GPU 上。</p>

<h2>內建幾何體</h2>
<table>
<tr><th>類別</th><th>主要參數</th></tr>
<tr><td><code>BoxGeometry</code></td><td>width, height, depth, widthSegments, heightSegments, depthSegments</td></tr>
<tr><td><code>SphereGeometry</code></td><td>radius, widthSegments, heightSegments</td></tr>
<tr><td><code>PlaneGeometry</code></td><td>width, height, widthSegments, heightSegments</td></tr>
<tr><td><code>CylinderGeometry</code></td><td>radiusTop, radiusBottom, height, radialSegments</td></tr>
<tr><td><code>ConeGeometry</code></td><td>radius, height, radialSegments</td></tr>
<tr><td><code>TorusGeometry</code></td><td>radius, tube, radialSegments, tubularSegments</td></tr>
<tr><td><code>TorusKnotGeometry</code></td><td>radius, tube, tubularSegments, radialSegments, p, q</td></tr>
<tr><td><code>CircleGeometry</code> / <code>RingGeometry</code></td><td>radius, segments / innerRadius, outerRadius</td></tr>
<tr><td><code>IcosahedronGeometry</code> 等多面體</td><td>radius, detail</td></tr>
<tr><td><code>CapsuleGeometry</code></td><td>radius, length, capSegments, radialSegments</td></tr>
<tr><td><code>LatheGeometry</code></td><td>points（Vector2 陣列，繞 Y 軸旋轉成形）</td></tr>
<tr><td><code>ExtrudeGeometry</code></td><td>shape（2D Shape）, options（depth、bevel…）</td></tr>
<tr><td><code>TubeGeometry</code></td><td>path（Curve）, tubularSegments, radius</td></tr>
</table>

<h2>BufferGeometry 常用屬性</h2>
<table>
<tr><th>attribute</th><th>itemSize</th><th>用途</th></tr>
<tr><td><code>position</code></td><td>3</td><td>頂點位置</td></tr>
<tr><td><code>normal</code></td><td>3</td><td>頂點法線（光照計算）</td></tr>
<tr><td><code>uv</code></td><td>2</td><td>貼圖座標</td></tr>
<tr><td><code>color</code></td><td>3</td><td>頂點顏色（材質需設 <code>vertexColors: true</code>）</td></tr>
</table>
<p>常用方法：<code>setAttribute()</code>、<code>setIndex()</code>、<code>computeVertexNormals()</code>、<code>computeBoundingBox()</code>、<code>center()</code>、<code>translate()</code>、<code>rotateX()</code>、<code>dispose()</code>。</p>
`,
        examples: [{
          title: '內建幾何體一覽',
          desc: '每個形狀都同時顯示實體與線框。試著調整分段數（segments）觀察線框變化。',
          code: code`
import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1e1f26);
const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 0, 14);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dir = new THREE.DirectionalLight(0xffffff, 2);
dir.position.set(3, 5, 8);
scene.add(dir);

const geometries = [
  new THREE.BoxGeometry(1.4, 1.4, 1.4),
  new THREE.SphereGeometry(0.9, 24, 12),
  new THREE.CylinderGeometry(0.6, 0.8, 1.6, 16),
  new THREE.ConeGeometry(0.9, 1.6, 16),
  new THREE.TorusGeometry(0.7, 0.28, 12, 32),
  new THREE.TorusKnotGeometry(0.6, 0.2, 80, 10),
  new THREE.IcosahedronGeometry(0.9, 0),
  new THREE.DodecahedronGeometry(0.9, 0),
  new THREE.CapsuleGeometry(0.5, 0.8, 4, 12),
  new THREE.RingGeometry(0.4, 0.9, 24),
  new THREE.LatheGeometry(
    Array.from({ length: 10 }, (_, i) => new THREE.Vector2(Math.sin(i * 0.3) * 0.6 + 0.2, (i - 5) * 0.18)), 20),
  new THREE.OctahedronGeometry(0.9, 0),
];

const cols = 4;
const items = geometries.map((geo, i) => {
  const group = new THREE.Group();
  group.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(i / geometries.length, 0.6, 0.55),
    side: THREE.DoubleSide, flatShading: true,
  })));
  group.add(new THREE.LineSegments(
    new THREE.WireframeGeometry(geo),
    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 })
  ));
  group.position.set((i % cols - (cols - 1) / 2) * 3, (1 - Math.floor(i / cols)) * 3, 0);
  scene.add(group);
  return group;
});
console.log('共', geometries.length, '種幾何體：',
  geometries.map((g) => g.type.replace('Geometry', '')).join(', '));

renderer.setAnimationLoop((t) => {
  items.forEach((g, i) => { g.rotation.x = t / 3000 + i; g.rotation.y = t / 2000; });
  renderer.render(scene, camera);
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
`
        }, {
          title: '自訂 BufferGeometry：彩色金字塔',
          desc: '手動指定頂點位置、索引與頂點顏色。computeVertexNormals() 會自動計算光照用的法線。',
          code: code`
import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111318);
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 1.5, 4);
camera.lookAt(0, 0.3, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

// 5 個頂點：4 個底部角落 + 1 個頂點
const positions = new Float32Array([
  -1, 0, -1,   // 0
   1, 0, -1,   // 1
   1, 0,  1,   // 2
  -1, 0,  1,   // 3
   0, 1.6, 0,  // 4 頂點
]);
const colors = new Float32Array([
  1, 0, 0,
  0, 1, 0,
  0, 0, 1,
  1, 1, 0,
  1, 1, 1,
]);
// 每 3 個索引組成一個三角形（逆時針為正面）
const indices = [
  0, 1, 2,  0, 2, 3,   // 底部
  3, 2, 4,  2, 1, 4,  1, 0, 4,  0, 3, 4, // 四個側面
];

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
geometry.setIndex(indices);
geometry.computeVertexNormals();

const pyramid = new THREE.Mesh(
  geometry,
  new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide })
);
scene.add(pyramid);

console.log('頂點數：', geometry.attributes.position.count);
console.log('三角形數：', geometry.index.count / 3);

renderer.setAnimationLoop((t) => {
  pyramid.rotation.y = t / 1500;
  renderer.render(scene, camera);
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
`
        }, {
          title: '動態修改頂點：波浪平面',
          desc: '每一幀更新 position 屬性後，必須設定 needsUpdate = true 才會上傳到 GPU。',
          code: code`
import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d1b2a);
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 6, 9);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff, 2.5);
light.position.set(2, 5, 3);
scene.add(light, new THREE.AmbientLight(0x88aaff, 0.4));

const geometry = new THREE.PlaneGeometry(12, 12, 80, 80);
geometry.rotateX(-Math.PI / 2);
const plane = new THREE.Mesh(
  geometry,
  new THREE.MeshStandardMaterial({ color: 0x1e88e5, roughness: 0.3, metalness: 0.1, flatShading: true })
);
scene.add(plane);

const pos = geometry.attributes.position;
renderer.setAnimationLoop((t) => {
  const s = t / 1000;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const y = Math.sin(x * 0.8 + s * 2) * 0.35 + Math.cos(z * 0.6 + s * 1.5) * 0.35;
    pos.setY(i, y);
  }
  pos.needsUpdate = true;
  geometry.computeVertexNormals();
  renderer.render(scene, camera);
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
`
        }]
      },

      {
        id: 'materials', title: '材質', en: 'Materials',
        html: `
<p>材質決定物件表面的外觀。不同材質在<b>畫面品質</b>與<b>效能</b>之間有不同的取捨。</p>
<table>
<tr><th>材質</th><th>需光源</th><th>特色</th></tr>
<tr><td><code>MeshBasicMaterial</code></td><td>否</td><td>純色，不受光照影響，最快。</td></tr>
<tr><td><code>MeshNormalMaterial</code></td><td>否</td><td>以法線方向上色，適合除錯。</td></tr>
<tr><td><code>MeshLambertMaterial</code></td><td>是</td><td>無高光的霧面，效能佳。</td></tr>
<tr><td><code>MeshPhongMaterial</code></td><td>是</td><td>有鏡面高光（<code>shininess</code>）。</td></tr>
<tr><td><code>MeshToonMaterial</code></td><td>是</td><td>卡通著色。</td></tr>
<tr><td><code>MeshStandardMaterial</code></td><td>是</td><td>PBR：<code>roughness</code>、<code>metalness</code>，最常用。</td></tr>
<tr><td><code>MeshPhysicalMaterial</code></td><td>是</td><td>Standard 的進階版：清漆 clearcoat、透射 transmission、光澤 sheen、彩虹色 iridescence。</td></tr>
<tr><td><code>MeshMatcapMaterial</code></td><td>否</td><td>用 matcap 貼圖模擬光照。</td></tr>
<tr><td><code>LineBasicMaterial</code> / <code>PointsMaterial</code></td><td>否</td><td>用於線條 / 點雲。</td></tr>
<tr><td><code>ShaderMaterial</code></td><td>自訂</td><td>自己撰寫 GLSL 著色器。</td></tr>
</table>

<h2>共通屬性（Material）</h2>
<table>
<tr><th>屬性</th><th>說明</th></tr>
<tr><td><code>color</code></td><td>基本色。</td></tr>
<tr><td><code>map</code></td><td>顏色貼圖。</td></tr>
<tr><td><code>transparent</code> / <code>opacity</code></td><td>透明度（需 transparent: true 才生效）。</td></tr>
<tr><td><code>side</code></td><td><code>FrontSide</code>、<code>BackSide</code>、<code>DoubleSide</code>。</td></tr>
<tr><td><code>wireframe</code></td><td>以線框顯示。</td></tr>
<tr><td><code>flatShading</code></td><td>平面著色（多邊形感）。</td></tr>
<tr><td><code>depthTest</code> / <code>depthWrite</code></td><td>深度測試 / 寫入。</td></tr>
<tr><td><code>needsUpdate</code></td><td>變更某些設定（如 flatShading）後需設為 true 重新編譯。</td></tr>
</table>
`,
        examples: [{
          title: '材質比較',
          desc: '同樣的球體與光源，套用 6 種不同材質。上方面板可即時調整 Standard / Physical 的參數。',
          code: code`
import * as THREE from 'three';
import GUI from 'three/addons/libs/lil-gui.module.min.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x2a2d34);
const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 0, 12);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 0.3));
const key = new THREE.DirectionalLight(0xffffff, 3);
key.position.set(4, 5, 6);
scene.add(key);
const rim = new THREE.PointLight(0x66aaff, 40);
rim.position.set(-5, -2, 2);
scene.add(rim);

const color = 0xe8734a;
const materials = {
  Basic: new THREE.MeshBasicMaterial({ color }),
  Lambert: new THREE.MeshLambertMaterial({ color }),
  Phong: new THREE.MeshPhongMaterial({ color, shininess: 80 }),
  Toon: new THREE.MeshToonMaterial({ color }),
  Standard: new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.3 }),
  Physical: new THREE.MeshPhysicalMaterial({ color, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.05, sheen: 0.5 }),
};

const geo = new THREE.SphereGeometry(1, 64, 32);
const label = document.createElement('div');
label.style.cssText = 'position:absolute;left:0;right:0;bottom:12px;display:flex;justify-content:space-around;color:#ddd;font:13px sans-serif;pointer-events:none';
document.body.appendChild(label);

Object.entries(materials).forEach(([name, mat], i) => {
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set((i % 3 - 1) * 2.8, i < 3 ? 1.4 : -1.4, 0);
  scene.add(mesh);
  const s = document.createElement('span');
  s.textContent = (i + 1) + '. ' + name;
  label.appendChild(s);
});

const gui = new GUI({ title: 'Standard / Physical' });
const p = { color: '#e8734a', roughness: 0.35, metalness: 0.3, wireframe: false };
gui.addColor(p, 'color').onChange((v) => Object.values(materials).forEach((m) => m.color.set(v)));
gui.add(p, 'roughness', 0, 1, 0.01).onChange((v) => { materials.Standard.roughness = v; materials.Physical.roughness = v; });
gui.add(p, 'metalness', 0, 1, 0.01).onChange((v) => { materials.Standard.metalness = v; materials.Physical.metalness = v; });
gui.add(materials.Physical, 'clearcoat', 0, 1, 0.01);
gui.add(p, 'wireframe').onChange((v) => Object.values(materials).forEach((m) => (m.wireframe = v)));

renderer.setAnimationLoop((t) => {
  key.position.x = Math.sin(t / 1500) * 6;
  renderer.render(scene, camera);
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
`
        }, {
          title: '透明與雙面',
          desc: 'transparent + opacity 製作玻璃感；MeshPhysicalMaterial 的 transmission 能模擬折射。',
          code: code`
import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdfe6ee);
const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 1, 7);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff, 0x8899aa, 2));
const dl = new THREE.DirectionalLight(0xffffff, 2);
dl.position.set(3, 4, 5);
scene.add(dl);

// 後方的彩色條紋，用來觀察透明效果
for (let i = 0; i < 6; i++) {
  const bar = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 4, 0.4),
    new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(i / 6, 0.8, 0.5) })
  );
  bar.position.set((i - 2.5) * 1.1, 0, -2);
  scene.add(bar);
}

const left = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.7, 0.25, 128, 16),
  new THREE.MeshStandardMaterial({ color: 0x3399ff, transparent: true, opacity: 0.45 })
);
left.position.x = -1.8;

const right = new THREE.Mesh(
  new THREE.SphereGeometry(1, 64, 32),
  new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 1, roughness: 0.05, thickness: 1.2, ior: 1.5 })
);
right.position.x = 1.8;
scene.add(left, right);

renderer.setAnimationLoop((t) => {
  left.rotation.y = t / 1500;
  right.position.y = Math.sin(t / 800) * 0.3;
  renderer.render(scene, camera);
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
`
        }]
      },

      {
        id: 'textures', title: '貼圖', en: 'Textures',
        html: `
<p>貼圖（Texture）把 2D 影像包覆到 3D 物件表面。來源可以是圖片檔、Canvas、影片或程式產生的資料。</p>

<h2>建立貼圖</h2>
<table>
<tr><th>方式</th><th>說明</th></tr>
<tr><td><code>new TextureLoader().load(url)</code></td><td>載入圖片（jpg、png、webp…）。</td></tr>
<tr><td><code>new CanvasTexture(canvas)</code></td><td>使用 2D Canvas 繪製的內容。</td></tr>
<tr><td><code>new VideoTexture(video)</code></td><td>使用 &lt;video&gt; 元素。</td></tr>
<tr><td><code>new DataTexture(data, w, h)</code></td><td>直接提供像素陣列。</td></tr>
<tr><td><code>new CubeTextureLoader().load([...6 張])</code></td><td>天空盒 / 環境貼圖。</td></tr>
</table>

<h2>Texture 重要屬性</h2>
<table>
<tr><th>屬性</th><th>說明</th></tr>
<tr><td><code>colorSpace</code></td><td>顏色貼圖應設為 <code>THREE.SRGBColorSpace</code>；法線、粗糙度等資料貼圖保持預設。</td></tr>
<tr><td><code>wrapS</code> / <code>wrapT</code></td><td>超出 0–1 範圍時的處理：<code>ClampToEdgeWrapping</code>、<code>RepeatWrapping</code>、<code>MirroredRepeatWrapping</code>。</td></tr>
<tr><td><code>repeat</code></td><td>重複次數（Vector2）。</td></tr>
<tr><td><code>offset</code> / <code>rotation</code> / <code>center</code></td><td>UV 平移 / 旋轉 / 旋轉中心。</td></tr>
<tr><td><code>magFilter</code> / <code>minFilter</code></td><td>放大 / 縮小取樣方式，像素風可用 <code>NearestFilter</code>。</td></tr>
<tr><td><code>anisotropy</code></td><td>非等向過濾，斜角觀看時更清晰。</td></tr>
<tr><td><code>needsUpdate</code></td><td>內容變更（如 Canvas 重繪）後設為 true。</td></tr>
</table>

<h2>材質上的貼圖通道</h2>
<p><code>map</code>（顏色）、<code>normalMap</code>（法線）、<code>roughnessMap</code>、<code>metalnessMap</code>、<code>aoMap</code>（環境遮蔽）、<code>emissiveMap</code>（自發光）、<code>alphaMap</code>（透明度）、<code>displacementMap</code>（位移）、<code>envMap</code>（環境反射）。</p>
<div class="note">從其他網域載入圖片時，該伺服器必須允許 CORS，否則 WebGL 無法使用該圖片。</div>
`,
        examples: [{
          title: 'CanvasTexture 與重複貼圖',
          desc: '用 Canvas 畫出棋盤格作為貼圖，透過面板調整 repeat、wrap 與過濾方式。',
          code: code`
import * as THREE from 'three';
import GUI from 'three/addons/libs/lil-gui.module.min.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 2.5, 5);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

// 用 2D canvas 畫一張 64x64 的貼圖
const canvas = document.createElement('canvas');
canvas.width = canvas.height = 64;
const ctx = canvas.getContext('2d');
for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
  ctx.fillStyle = (x + y) % 2 ? '#f4f4f4' : '#e85d4a';
  ctx.fillRect(x * 8, y * 8, 8, 8);
}
ctx.fillStyle = '#1a1a1a';
ctx.font = 'bold 22px sans-serif';
ctx.textAlign = 'center';
ctx.fillText('3D', 32, 40);

const texture = new THREE.CanvasTexture(canvas);
texture.colorSpace = THREE.SRGBColorSpace;
texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
texture.magFilter = THREE.NearestFilter;

const material = new THREE.MeshBasicMaterial({ map: texture });
const box = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), material);
scene.add(box);

const wraps = { Repeat: THREE.RepeatWrapping, Mirrored: THREE.MirroredRepeatWrapping, Clamp: THREE.ClampToEdgeWrapping };
const params = { wrap: 'Repeat', nearest: true };
const gui = new GUI();
gui.add(texture.repeat, 'x', 0.25, 5, 0.25).name('repeat.x');
gui.add(texture.repeat, 'y', 0.25, 5, 0.25).name('repeat.y');
gui.add(texture, 'rotation', 0, Math.PI * 2, 0.01);
gui.add(params, 'wrap', Object.keys(wraps)).onChange((v) => {
  texture.wrapS = texture.wrapT = wraps[v];
  texture.needsUpdate = true;
});
gui.add(params, 'nearest').name('像素風 NearestFilter').onChange((v) => {
  texture.magFilter = v ? THREE.NearestFilter : THREE.LinearFilter;
  texture.needsUpdate = true;
});

renderer.setAnimationLoop((t) => {
  box.rotation.y = t / 3000;
  box.rotation.x = t / 5000;
  texture.offset.x = t / 8000; // 讓貼圖緩慢平移
  renderer.render(scene, camera);
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
`
        }, {
          title: 'TextureLoader 載入圖片',
          desc: '從 threejs.org 載入木箱貼圖（該網站允許 CORS）。load() 的第二個參數是載入完成的回呼。',
          code: code`
import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x303845);
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 100);
camera.position.z = 4;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

const loader = new THREE.TextureLoader();
const texture = loader.load(
  'https://threejs.org/examples/textures/crate.gif',
  (tex) => console.log('貼圖載入完成：', tex.image.width + 'x' + tex.image.height),
  undefined,
  (err) => console.error('貼圖載入失敗', err)
);
texture.colorSpace = THREE.SRGBColorSpace;
texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

const crate = new THREE.Mesh(
  new THREE.BoxGeometry(1.6, 1.6, 1.6),
  new THREE.MeshStandardMaterial({ map: texture })
);
scene.add(crate);
scene.add(new THREE.AmbientLight(0xffffff, 0.8));
const l = new THREE.DirectionalLight(0xffffff, 2);
l.position.set(2, 3, 4);
scene.add(l);

renderer.setAnimationLoop((t) => {
  crate.rotation.set(t / 3000, t / 2000, 0);
  renderer.render(scene, camera);
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
`
        }]
      }
    ]
  },

  /* ===================================================== */
  {
    group: '光源與陰影', items: [

      {
        id: 'lights', title: '光源', en: 'Lights',
        html: `
<p>Lambert、Phong、Standard、Physical 等材質需要光源才會顯示亮暗。three.js 提供以下光源：</p>
<table>
<tr><th>光源</th><th>建構參數</th><th>說明</th><th>可投射陰影</th></tr>
<tr><td><code>AmbientLight</code></td><td>color, intensity</td><td>均勻照亮所有物件，沒有方向。</td><td>否</td></tr>
<tr><td><code>HemisphereLight</code></td><td>skyColor, groundColor, intensity</td><td>天空與地面兩色漸層的環境光，適合戶外。</td><td>否</td></tr>
<tr><td><code>DirectionalLight</code></td><td>color, intensity</td><td>平行光，如太陽。從 position 照向 target。</td><td>是</td></tr>
<tr><td><code>PointLight</code></td><td>color, intensity, distance, decay</td><td>點光源，如燈泡，向四面八方發光。</td><td>是</td></tr>
<tr><td><code>SpotLight</code></td><td>color, intensity, distance, angle, penumbra, decay</td><td>聚光燈，圓錐形光束。</td><td>是</td></tr>
<tr><td><code>RectAreaLight</code></td><td>color, intensity, width, height</td><td>矩形面光源，如窗戶、柔光箱（僅支援 Standard / Physical）。</td><td>否</td></tr>
</table>

<div class="tip">自 r155 起預設採用物理正確的光照單位：PointLight / SpotLight 的 intensity 單位是燭光（cd），且 <code>decay</code> 預設為 2。所以點光源常需要較大的 intensity（例如 50～500）才夠亮。</div>

<h2>輔助物件</h2>
<p><code>DirectionalLightHelper</code>、<code>PointLightHelper</code>、<code>SpotLightHelper</code>、<code>HemisphereLightHelper</code> 可以視覺化光源的位置與方向。</p>
`,
        examples: [{
          title: '光源實驗室',
          desc: '勾選或取消各種光源、調整強度與顏色，觀察對場景的影響。',
          code: code`
import * as THREE from 'three';
import GUI from 'three/addons/libs/lil-gui.module.min.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0e0f12);
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 100);
camera.position.set(6, 6, 10);
camera.lookAt(0, 0.5, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

// 場景物件
const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshStandardMaterial({ color: 0x888888 }));
floor.rotation.x = -Math.PI / 2;
scene.add(floor);
const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
const objs = [
  new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), mat),
  new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 1.6), mat),
  new THREE.Mesh(new THREE.TorusKnotGeometry(0.6, 0.22, 100, 16), mat),
];
objs.forEach((o, i) => { o.position.set((i - 1) * 3, 1, 0); scene.add(o); });

// 光源
const ambient = new THREE.AmbientLight(0xffffff, 0.15);
const hemi = new THREE.HemisphereLight(0x87ceeb, 0x5c3d1e, 1);
hemi.visible = false;
const dir = new THREE.DirectionalLight(0xffffff, 1.5);
dir.position.set(-5, 6, 4);
const point = new THREE.PointLight(0xff4466, 30);
point.position.set(0, 2.5, 2.5);
const spot = new THREE.SpotLight(0x44aaff, 120, 0, Math.PI / 8, 0.3);
spot.position.set(4, 7, 3);
spot.target = objs[2];
scene.add(ambient, hemi, dir, point, spot);

const helpers = [
  new THREE.DirectionalLightHelper(dir, 1),
  new THREE.PointLightHelper(point, 0.3),
  new THREE.SpotLightHelper(spot),
];
helpers.forEach((h) => scene.add(h));

const gui = new GUI();
const add = (name, light, max) => {
  const f = gui.addFolder(name);
  f.add(light, 'visible').name('開啟');
  f.add(light, 'intensity', 0, max, 0.01).name('強度');
  f.addColor(light, 'color').name('顏色');
  return f;
};
add('AmbientLight 環境光', ambient, 2);
add('HemisphereLight 半球光', hemi, 3);
add('DirectionalLight 平行光', dir, 5);
add('PointLight 點光源', point, 100);
const sf = add('SpotLight 聚光燈', spot, 400);
sf.add(spot, 'angle', 0.05, Math.PI / 3, 0.01).name('角度');
sf.add(spot, 'penumbra', 0, 1, 0.01).name('邊緣柔化');
gui.add({ helpers: true }, 'helpers').name('顯示輔助線').onChange((v) => helpers.forEach((h) => (h.visible = v)));

renderer.setAnimationLoop((t) => {
  point.position.x = Math.sin(t / 1000) * 4;
  helpers.forEach((h) => h.update && h.update());
  renderer.render(scene, camera);
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
`
        }]
      },

      {
        id: 'shadows', title: '陰影', en: 'Shadows',
        html: `
<p>陰影需要在<b>三個地方</b>開啟：</p>
<ol>
<li>渲染器：<code>renderer.shadowMap.enabled = true</code></li>
<li>光源：<code>light.castShadow = true</code></li>
<li>物件：投射陰影的 <code>mesh.castShadow = true</code>、接收陰影的 <code>mesh.receiveShadow = true</code></li>
</ol>

<h2>陰影品質設定</h2>
<table>
<tr><th>設定</th><th>說明</th></tr>
<tr><td><code>renderer.shadowMap.type</code></td><td><code>BasicShadowMap</code>（最快、有鋸齒）、<code>PCFShadowMap</code>（預設）、<code>PCFSoftShadowMap</code>（較柔和）、<code>VSMShadowMap</code>。</td></tr>
<tr><td><code>light.shadow.mapSize</code></td><td>陰影貼圖解析度，例如 <code>set(2048, 2048)</code>。越大越清晰但越耗效能。</td></tr>
<tr><td><code>light.shadow.camera</code></td><td>平行光陰影使用正交相機，left / right / top / bottom / near / far 決定陰影覆蓋範圍。範圍越小，精度越高。</td></tr>
<tr><td><code>light.shadow.bias</code></td><td>修正「陰影痤瘡」（表面出現條紋），常用 -0.0001 ~ -0.001。</td></tr>
<tr><td><code>light.shadow.radius</code></td><td>PCF 模糊半徑（PCFSoftShadowMap 下無效）。</td></tr>
</table>
<div class="tip">用 <code>new THREE.CameraHelper(light.shadow.camera)</code> 可以看到陰影相機的範圍，是除錯陰影被「切掉」的好幫手。</div>
`,
        examples: [{
          title: '平行光陰影',
          desc: '跳動的物件會在地面投下陰影。打開 CameraHelper 看陰影相機的範圍，試著調整 mapSize 比較清晰度。',
          code: code`
import * as THREE from 'three';
import GUI from 'three/addons/libs/lil-gui.module.min.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;                 // ① 渲染器
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfd1e5);
const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100);
camera.position.set(8, 7, 10);
camera.lookAt(0, 0, 0);

scene.add(new THREE.HemisphereLight(0xffffff, 0x666666, 1.2));
const sun = new THREE.DirectionalLight(0xffffff, 2.5);
sun.position.set(5, 10, 4);
sun.castShadow = true;                             // ② 光源
sun.shadow.mapSize.set(1024, 1024);
Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 30 });
sun.shadow.bias = -0.0005;
scene.add(sun);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshStandardMaterial({ color: 0xeeeeee }));
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;                       // ③ 接收陰影
scene.add(ground);

const shapes = [];
const geos = [new THREE.BoxGeometry(1, 1, 1), new THREE.SphereGeometry(0.6, 32, 16), new THREE.TorusGeometry(0.5, 0.2, 16, 32)];
for (let i = 0; i < 9; i++) {
  const m = new THREE.Mesh(geos[i % 3], new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(i / 9, 0.6, 0.55) }));
  m.castShadow = true;                             // ③ 投射陰影
  m.receiveShadow = true;
  m.position.set((i % 3 - 1) * 3, 1, (Math.floor(i / 3) - 1) * 3);
  m.userData.phase = Math.random() * Math.PI * 2;
  scene.add(m);
  shapes.push(m);
}

const helper = new THREE.CameraHelper(sun.shadow.camera);
helper.visible = false;
scene.add(helper);

const gui = new GUI();
gui.add(helper, 'visible').name('CameraHelper');
gui.add({ size: 1024 }, 'size', [256, 512, 1024, 2048, 4096]).name('mapSize').onChange((v) => {
  sun.shadow.mapSize.set(v, v);
  if (sun.shadow.map) {
    sun.shadow.map.dispose();
    sun.shadow.map = null;                         // 讓 three.js 以新尺寸重建
  }
});
gui.add(sun.position, 'x', -10, 10, 0.1).name('光源 x');

renderer.setAnimationLoop((t) => {
  shapes.forEach((m) => {
    m.position.y = 0.7 + Math.abs(Math.sin(t / 500 + m.userData.phase)) * 2;
    m.rotation.y = t / 1000;
  });
  helper.update();
  renderer.render(scene, camera);
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
`
        }]
      }
    ]
  }
];
