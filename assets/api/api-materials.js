/* API 參考：材質 Materials
 * matPage() 依屬性規格自動產生「用面板調整材質屬性」的範例。
 */
(function () {
var code = String.raw;
var MB = ['EventDispatcher', 'Material'];

/* 屬性規格：[名稱, 型別, 說明, GUI 規格, 初始值(程式碼字串，選填)]
 * GUI：'color'、[min,max,step]、'bool'、{ 選項名: 'THREE.常數' }、null（只列文件不放面板） */
function matPage(name, desc, props, opt) {
  opt = opt || {};
  var L = [];
  L.push("import * as THREE from 'three';");
  L.push("import GUI from 'three/addons/libs/lil-gui.module.min.js';");
  if (opt.env) L.push("import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';");
  L.push("import { createStage } from 'doc-stage';");
  L.push("const { scene, renderer, onFrame } = createStage({ cameraPosition: [0, 0.8, 5.5]" + (opt.bg ? ', background: ' + opt.bg : '') + " });");
  if (opt.env) {
    L.push('');
    L.push('// 環境貼圖讓 PBR 材質的反射更真實');
    L.push('scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;');
  }
  if (opt.map) {
    L.push('');
    L.push('// 用 Canvas 產生一張棋盤格貼圖');
    L.push("const canvas = document.createElement('canvas');");
    L.push('canvas.width = canvas.height = 128;');
    L.push("const ctx = canvas.getContext('2d');");
    L.push("for (let i = 0; i < 64; i++) { ctx.fillStyle = (i + (i >> 3)) % 2 ? '#ffffff' : '#888888'; ctx.fillRect((i % 8) * 16, (i >> 3) * 16, 16, 16); }");
    L.push('const checker = new THREE.CanvasTexture(canvas);');
    L.push('checker.colorSpace = THREE.SRGBColorSpace;');
  }
  L.push('');
  var init = props.filter(function (p) { return p[4] !== undefined; }).map(function (p) { return '  ' + p[0] + ': ' + p[4] + ','; });
  L.push('const material = new THREE.' + name + '({');
  L.push(init.join('\n'));
  L.push('});');
  L.push('');
  L.push('const geometries = [');
  L.push('  new THREE.TorusKnotGeometry(0.55, 0.2, 128, 24),');
  L.push('  new THREE.SphereGeometry(0.7, 48, 24),');
  L.push('  new THREE.BoxGeometry(1.1, 1.1, 1.1),');
  L.push('];');
  L.push('const meshes = geometries.map((g, i) => {');
  L.push('  const m = new THREE.Mesh(g, material);   // 三個物件共用同一個材質');
  L.push('  m.position.x = (i - 1) * 2;');
  L.push('  scene.add(m);');
  L.push('  return m;');
  L.push('});');
  L.push("console.log(material.type, '｜需要光源？', " + (opt.lit ? 'true' : 'false') + ");");
  L.push('');
  L.push('const gui = new GUI({ title: ' + JSON.stringify(name) + ' });');
  props.forEach(function (p) {
    var g = p[3], n = p[0];
    if (g == null) return;
    if (g === 'color') {
      L.push("gui.addColor({ " + n + ": '#' + material." + n + ".getHexString() }, '" + n + "').onChange((v) => material." + n + ".set(v));");
    } else if (g === 'bool') {
      L.push("gui.add(material, '" + n + "').onChange(() => (material.needsUpdate = true));");
    } else if (g === 'map') {
      L.push("gui.add({ " + n + ": " + (p[4] ? 'true' : 'false') + " }, '" + n + "').onChange((v) => { material." + n + " = v ? checker : null; material.needsUpdate = true; });");
    } else if (Array.isArray(g)) {
      L.push("gui.add(material, '" + n + "', " + g.join(', ') + ');');
    } else {
      L.push("gui.add(material, '" + n + "', { " + Object.keys(g).map(function (k) { return k + ': ' + g[k]; }).join(', ') + ' }).onChange(() => (material.needsUpdate = true));');
    }
  });
  L.push('');
  L.push('onFrame((t) => meshes.forEach((m, i) => { m.rotation.set(t * 0.3 + i, t * 0.5, 0); }));');

  return {
    id: 'api-' + name.toLowerCase(), title: name, api: true, inherits: MB,
    src: 'materials/' + name + '.js', desc: desc,
    ctor: { sig: 'new ' + name + '( parameters : Object )', desc: 'parameters 可包含下列任何屬性（以及繼承自 Material 的屬性）。例外：color 可以傳入十六進位數字或 CSS 字串。' },
    examples: [{ title: name + ' 屬性調整', desc: '三個物件共用同一個材質；用右上角面板即時調整屬性。', code: L.join('\n') }].concat(opt.examples || []),
    props: props.map(function (p) { return ['.' + p[0] + ' : ' + p[1], p[2]]; }).concat((opt.moreProps || []).filter(function (m) {
      return !props.some(function (p) { return m[0].indexOf('.' + p[0] + ' ') === 0; });
    })),
    methods: opt.methods,
  };
}

var SIDE = { FrontSide: 'THREE.FrontSide', BackSide: 'THREE.BackSide', DoubleSide: 'THREE.DoubleSide' };
var MAPS = [
  ['.map : Texture', '顏色貼圖（色彩空間應為 SRGBColorSpace）。'],
  ['.alphaMap : Texture', '灰階透明度貼圖（使用綠色通道），需 transparent: true 或 alphaTest。'],
  ['.aoMap : Texture', '環境遮蔽貼圖（紅色通道）。'],
  ['.aoMapIntensity : Float', 'AO 強度，預設 1。'],
  ['.lightMap : Texture', '光照貼圖（預先烘焙的光影）。'],
  ['.lightMapIntensity : Float', '光照貼圖強度。'],
  ['.envMap : Texture', '環境貼圖（反射）。'],
  ['.envMapRotation : Euler', '環境貼圖旋轉。'],
];
var LIT_MAPS = [
  ['.emissiveMap : Texture', '自發光貼圖。'],
  ['.bumpMap : Texture', '凹凸貼圖（灰階高度）。'],
  ['.bumpScale : Float', '凹凸強度。'],
  ['.normalMap : Texture', '法線貼圖，產生表面細節而不增加多邊形。'],
  ['.normalMapType : Integer', '<code>TangentSpaceNormalMap</code>（預設）或 <code>ObjectSpaceNormalMap</code>。'],
  ['.normalScale : Vector2', '法線強度，預設 (1, 1)。'],
  ['.displacementMap : Texture', '位移貼圖：真的移動頂點，需要足夠的分段數。'],
  ['.displacementScale : Float', '位移量，預設 1。'],
  ['.displacementBias : Float', '位移偏移，預設 0。'],
];

var items = [];

/* ---------- Material 基底 ---------- */
items.push({
  id: 'api-material', title: 'Material', api: true, inherits: ['EventDispatcher'], src: 'materials/Material.js',
  desc: '<p>所有材質的抽象基底類別，定義與「如何繪製」相關的共通屬性：透明、混合、深度、面向、模板（stencil）等。</p><p>某些屬性（例如 <code>flatShading</code>、<code>vertexColors</code>、新增 / 移除貼圖）在材質編譯後修改，需要設定 <code>material.needsUpdate = true</code> 才會生效。</p>',
  ctor: { sig: 'new Material()', desc: '通常不直接建立，而是使用子類別。' },
  examples: [{
    title: '透明、面向與混合模式',
    desc: '調整 opacity、side、blending、depthWrite、alphaTest，觀察透明物件互相重疊時的差異。',
    code: code`
import * as THREE from 'three';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 1, 5], background: 0x101015 });

// 用 canvas 畫一張有透明區域的貼圖（給 alphaTest 用）
const c = document.createElement('canvas'); c.width = c.height = 64;
const ctx = c.getContext('2d');
const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
grad.addColorStop(0, 'rgba(255,255,255,1)'); grad.addColorStop(1, 'rgba(255,255,255,0)');
ctx.fillStyle = grad; ctx.fillRect(0, 0, 64, 64);
const alphaTex = new THREE.CanvasTexture(c);

const material = new THREE.MeshStandardMaterial({ color: 0x4fc3f7, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
const colors = [0xef5350, 0x66bb6a, 0x42a5f5];
const planes = colors.map((col, i) => {
  const m = material.clone();
  m.color.set(col);
  const p = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), m);
  p.position.set((i - 1) * 0.7, (i - 1) * 0.2, (i - 1) * -0.6);
  scene.add(p);
  return p;
});

const s = { transparent: true, opacity: 0.5, side: THREE.DoubleSide, blending: THREE.NormalBlending, depthWrite: true, depthTest: true, alphaMap: false, alphaTest: 0, wireframe: false };
const apply = () => planes.forEach((p) => {
  Object.assign(p.material, s, { alphaMap: s.alphaMap ? alphaTex : null });
  p.material.needsUpdate = true;
});
apply();
const gui = new GUI();
gui.add(s, 'transparent').onChange(apply);
gui.add(s, 'opacity', 0, 1, 0.01).onChange(apply);
gui.add(s, 'side', { FrontSide: THREE.FrontSide, BackSide: THREE.BackSide, DoubleSide: THREE.DoubleSide }).onChange(apply);
gui.add(s, 'blending', { NoBlending: THREE.NoBlending, NormalBlending: THREE.NormalBlending, AdditiveBlending: THREE.AdditiveBlending, SubtractiveBlending: THREE.SubtractiveBlending, MultiplyBlending: THREE.MultiplyBlending }).onChange(apply);
gui.add(s, 'depthWrite').onChange(apply);
gui.add(s, 'depthTest').onChange(apply);
gui.add(s, 'alphaMap').name('alphaMap（放射漸層）').onChange(apply);
gui.add(s, 'alphaTest', 0, 1, 0.01).onChange(apply);
gui.add(s, 'wireframe').onChange(apply);
onFrame((t) => { scene.rotation.y = Math.sin(t * 0.5) * 0.6; });
`
  }],
  props: [
    ['.id / .uuid / .name / .type', '識別資訊。'],
    ['.transparent : Boolean', '是否透明。為 true 時物件會在不透明物件之後、依距離排序繪製，opacity 才有效果。'],
    ['.opacity : Float', '不透明度 0–1，需 transparent 為 true。'],
    ['.alphaTest : Float', '透明度低於此值的像素直接丟棄（不需排序），適合葉子、柵欄等鏤空貼圖。'],
    ['.alphaHash : Boolean', '以雜湊抖動實現透明，不需排序。'],
    ['.alphaToCoverage : Boolean', '在 MSAA 下以 coverage 實現邊緣平滑的透明。'],
    ['.side : Integer', '繪製哪一面：<code>FrontSide</code>（預設）、<code>BackSide</code>、<code>DoubleSide</code>。'],
    ['.shadowSide : Integer', '投射陰影時使用的面，null 為依 side 自動決定。'],
    ['.blending : Blending', '混合模式：<code>NoBlending</code>、<code>NormalBlending</code>（預設）、<code>AdditiveBlending</code>、<code>SubtractiveBlending</code>、<code>MultiplyBlending</code>、<code>CustomBlending</code>。'],
    ['.blendSrc / .blendDst / .blendEquation', 'CustomBlending 時的混合因子與方程式。'],
    ['.premultipliedAlpha : Boolean', '是否預乘 alpha。'],
    ['.depthTest : Boolean', '是否進行深度測試，預設 true。設為 false 物件會永遠畫在最上層（常配合 renderOrder）。'],
    ['.depthWrite : Boolean', '是否寫入深度緩衝區，預設 true。透明粒子通常設為 false。'],
    ['.depthFunc : Integer', '深度比較函式，預設 <code>LessEqualDepth</code>。'],
    ['.colorWrite : Boolean', '是否寫入顏色，設為 false 可做「只寫深度的遮擋物」。'],
    ['.polygonOffset : Boolean', '是否啟用多邊形偏移，用來解決重疊表面的 Z-fighting（例如描邊線與實體）。'],
    ['.polygonOffsetFactor / .polygonOffsetUnits : Integer', '偏移量。'],
    ['.clippingPlanes : Array', '材質層級的裁切平面（需 renderer.localClippingEnabled = true）。', {
      title: '裁切平面',
      code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, renderer, onFrame } = createStage({ cameraPosition: [3, 2, 4] });
renderer.localClippingEnabled = true;

const plane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
const mat = new THREE.MeshStandardMaterial({ color: 0xffa726, side: THREE.DoubleSide, clippingPlanes: [plane], clipShadows: true });
scene.add(new THREE.Mesh(new THREE.TorusKnotGeometry(0.8, 0.3, 160, 24), mat));
scene.add(new THREE.PlaneHelper(plane, 3, 0x00e5ff));
onFrame((t) => { plane.constant = Math.sin(t) * 1.2; });
`}],
    ['.clipIntersection : Boolean', '為 true 時只裁切所有平面的交集區域。'],
    ['.clipShadows : Boolean', '裁切是否也作用於陰影。'],
    ['.vertexColors : Boolean', '是否使用幾何體的 color attribute。'],
    ['.toneMapped : Boolean', '是否套用渲染器的色調映射，預設 true。'],
    ['.dithering : Boolean', '是否抖動以減少色帶。'],
    ['.fog : Boolean', '是否受場景霧影響（部分材質）。'],
    ['.visible : Boolean', '是否可見。'],
    ['.forceSinglePass : Boolean', '雙面透明物件預設分兩次繪製，設為 true 強制一次。'],
    ['.stencilWrite / .stencilFunc / .stencilRef / .stencilZPass ...', '模板緩衝區相關設定，用於遮罩、傳送門等效果。'],
    ['.precision : String', '覆寫著色器精度。'],
    ['.needsUpdate : Boolean', '設為 true 會重新編譯著色器。'],
    ['.version : Integer', 'needsUpdate 被設為 true 的次數。'],
    ['.userData : Object', '自訂資料。'],
  ],
  methods: [
    ['.clone() : Material', '複製材質（貼圖以參照共用）。'],
    ['.copy( material : Material ) : this', '複製屬性。'],
    ['.dispose() : undefined', '釋放 GPU 資源（著色器程式）。貼圖需另外 dispose。'],
    ['.setValues( values : Object ) : undefined', '一次設定多個屬性。',
      "const m = new THREE.MeshStandardMaterial();\nm.setValues({ color: 'orange', roughness: 0.2, transparent: true, opacity: 0.5 });\nconsole.log(m.color, m.roughness, m.transparent, m.opacity);"],
    ['.onBeforeCompile( shader : Object, renderer : WebGLRenderer ) : undefined', '在著色器編譯前呼叫，可修改 <code>shader.vertexShader</code>、<code>shader.fragmentShader</code>、<code>shader.uniforms</code>，用來擴充內建材質。', {
      title: '擴充 MeshStandardMaterial：扭轉頂點',
      code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 1, 5] });

const uniforms = { uTime: { value: 0 } };
const material = new THREE.MeshStandardMaterial({ color: 0x29b6f6, roughness: 0.4 });
material.onBeforeCompile = (shader) => {
  shader.uniforms.uTime = uniforms.uTime;
  shader.vertexShader = 'uniform float uTime;\n' + shader.vertexShader.replace(
    '#include <begin_vertex>',
    [
      '#include <begin_vertex>',
      'float angle = sin(uTime) * position.y * 1.2;',
      'mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));',
      'transformed.xz = rot * transformed.xz;',
    ].join('\n')
  );
  console.log('已注入自訂頂點程式碼');
};
scene.add(new THREE.Mesh(new THREE.BoxGeometry(1, 2.5, 1, 4, 32, 4), material));
onFrame((t) => { uniforms.uTime.value = t; });
`}],
    ['.customProgramCacheKey() : String', '若 onBeforeCompile 依條件產生不同程式碼，需覆寫此方法回傳不同的快取鍵。'],
    ['.toJSON( meta ) : Object', '轉為 JSON。'],
  ],
});

/* ---------- 各種材質 ---------- */
items.push(matPage('MeshBasicMaterial',
  '<p>不受光照影響的簡單材質，以純色或貼圖繪製。效能最好，適合 UI、天空、線框、或已烘焙光影的物件。</p>', [
    ['color', 'Color', '顏色，預設白色。', 'color', '0xff7043'],
    ['map', 'Texture', '顏色貼圖。', 'map', 'checker'],
    ['wireframe', 'Boolean', '以線框繪製。', 'bool'],
    ['transparent', 'Boolean', '是否透明（繼承自 Material）。', 'bool'],
    ['opacity', 'Float', '不透明度（繼承自 Material）。', [0, 1, 0.01]],
    ['side', 'Integer', '繪製面（繼承自 Material）。', SIDE],
    ['fog', 'Boolean', '是否受霧影響，預設 true。', null],
    ['reflectivity', 'Float', '環境貼圖反射程度。', null],
    ['refractionRatio', 'Float', '使用折射環境貼圖時的折射率。', null],
    ['combine', 'Integer', '環境貼圖與表面顏色的結合方式：<code>MultiplyOperation</code>（預設）、<code>MixOperation</code>、<code>AddOperation</code>。', null],
    ['specularMap', 'Texture', '控制環境貼圖反射強度的貼圖。', null],
  ], { map: true, moreProps: MAPS }));

items.push(matPage('MeshLambertMaterial',
  '<p>非光澤（霧面）表面材質，沒有鏡面高光。使用 Lambert 反射模型逐像素計算光照，效能佳。適合木頭、石頭、未上漆表面。</p>', [
    ['color', 'Color', '顏色。', 'color', '0x8bc34a'],
    ['emissive', 'Color', '自發光顏色（不受光照影響），預設黑色。', 'color', '0x000000'],
    ['emissiveIntensity', 'Float', '自發光強度。', [0, 2, 0.01]],
    ['flatShading', 'Boolean', '平面著色。', 'bool'],
    ['wireframe', 'Boolean', '線框。', 'bool'],
    ['map', 'Texture', '顏色貼圖。', 'map'],
  ], { lit: true, map: true, moreProps: MAPS.concat(LIT_MAPS) }));

items.push(matPage('MeshPhongMaterial',
  '<p>有鏡面高光的光澤材質，使用 Blinn-Phong 模型。適合塑膠、上漆表面。比 Lambert 稍慢，但比 Standard 快。</p>', [
    ['color', 'Color', '顏色。', 'color', '0x1e88e5'],
    ['specular', 'Color', '高光顏色，預設 0x111111。', 'color', '0xffffff'],
    ['shininess', 'Float', '高光銳利度，預設 30。數值越大越集中。', [0, 300, 1], '60'],
    ['emissive', 'Color', '自發光顏色。', 'color', '0x000000'],
    ['flatShading', 'Boolean', '平面著色。', 'bool'],
    ['wireframe', 'Boolean', '線框。', 'bool'],
    ['map', 'Texture', '顏色貼圖。', 'map'],
    ['specularMap', 'Texture', '高光強度貼圖。', null],
    ['reflectivity', 'Float', '環境貼圖反射程度。', null],
  ], { lit: true, map: true, moreProps: MAPS.concat(LIT_MAPS) }));

items.push(matPage('MeshStandardMaterial',
  '<p>基於物理的渲染（PBR）標準材質，使用 metalness / roughness 工作流程，在各種光照下都能呈現一致、真實的效果。是大多數情況下的首選，也是 glTF 模型的預設材質。</p><p>搭配 <code>scene.environment</code> 環境貼圖效果最佳。</p>', [
    ['color', 'Color', '基本色（albedo）。', 'color', '0xd4af37'],
    ['roughness', 'Float', '粗糙度 0–1：0 為鏡面般光滑，1 為完全霧面。預設 1。', [0, 1, 0.01], '0.3'],
    ['metalness', 'Float', '金屬度 0–1。預設 0。通常非 0 即 1。', [0, 1, 0.01], '1'],
    ['emissive', 'Color', '自發光顏色。', 'color', '0x000000'],
    ['emissiveIntensity', 'Float', '自發光強度。', [0, 3, 0.01]],
    ['envMapIntensity', 'Float', '環境貼圖強度。', [0, 3, 0.01]],
    ['flatShading', 'Boolean', '平面著色。', 'bool'],
    ['wireframe', 'Boolean', '線框。', 'bool'],
    ['map', 'Texture', '顏色貼圖。', 'map'],
    ['roughnessMap', 'Texture', '粗糙度貼圖（綠色通道），與 roughness 相乘。', null],
    ['metalnessMap', 'Texture', '金屬度貼圖（藍色通道），與 metalness 相乘。', null],
  ], { lit: true, env: true, map: true, moreProps: MAPS.concat(LIT_MAPS) }));

items.push(matPage('MeshPhysicalMaterial',
  '<p>MeshStandardMaterial 的延伸，提供更進階的物理屬性：清漆（clearcoat）、透射 / 折射（transmission）、光澤（sheen，布料）、彩虹色（iridescence，肥皂泡）、各向異性（anisotropy，拉絲金屬）、色散（dispersion）等。效能成本較高。</p>', [
    ['color', 'Color', '基本色。', 'color', '0xffffff'],
    ['roughness', 'Float', '粗糙度。', [0, 1, 0.01], '0.1'],
    ['metalness', 'Float', '金屬度。', [0, 1, 0.01], '0'],
    ['transmission', 'Float', '透射度 0–1，可做玻璃、水等透光材質（不需要 transparent）。', [0, 1, 0.01], '1'],
    ['thickness', 'Float', '透射物體的厚度，影響折射。', [0, 3, 0.01], '1'],
    ['ior', 'Float', '折射率 1.0–2.333，預設 1.5（玻璃）。', [1, 2.333, 0.001]],
    ['dispersion', 'Float', '色散強度，產生彩虹邊緣。', [0, 10, 0.01]],
    ['clearcoat', 'Float', '清漆層強度 0–1（如車漆）。', [0, 1, 0.01]],
    ['clearcoatRoughness', 'Float', '清漆層粗糙度。', [0, 1, 0.01]],
    ['sheen', 'Float', '光澤層強度（絨布、天鵝絨）。', [0, 1, 0.01]],
    ['sheenRoughness', 'Float', '光澤粗糙度。', [0, 1, 0.01]],
    ['sheenColor', 'Color', '光澤顏色。', 'color'],
    ['iridescence', 'Float', '彩虹色強度（肥皂泡、油膜）。', [0, 1, 0.01]],
    ['iridescenceIOR', 'Float', '彩虹色薄膜折射率。', [1, 2.333, 0.01]],
    ['anisotropy', 'Float', '各向異性強度（拉絲金屬）。', [0, 1, 0.01]],
    ['specularIntensity', 'Float', '非金屬的鏡面反射強度。', [0, 1, 0.01]],
    ['specularColor', 'Color', '非金屬的鏡面反射顏色。', 'color'],
    ['attenuationColor', 'Color', '光線穿過物體後衰減成的顏色（有色玻璃）。', 'color'],
    ['attenuationDistance', 'Float', '衰減距離。', [0.1, 10, 0.01]],
    ['reflectivity', 'Float', '反射率（與 ior 互相換算）。', null],
  ], { lit: true, env: true, moreProps: [
    ['.clearcoatMap / .clearcoatNormalMap / .clearcoatRoughnessMap : Texture', '清漆相關貼圖。'],
    ['.transmissionMap / .thicknessMap : Texture', '透射相關貼圖。'],
    ['.sheenColorMap / .sheenRoughnessMap : Texture', '光澤相關貼圖。'],
    ['.iridescenceMap / .iridescenceThicknessMap / .iridescenceThicknessRange', '彩虹色相關設定。'],
    ['.anisotropyRotation : Float / .anisotropyMap : Texture', '各向異性方向與貼圖。'],
    ['.defines : Object', '依啟用的功能自動設定的著色器巨集。'],
  ] }));

items.push(matPage('MeshNormalMaterial',
  '<p>把法線向量映射成 RGB 顏色（X→紅、Y→綠、Z→藍）的材質，不需要光源。常用於除錯幾何體法線或快速原型。</p>', [
    ['flatShading', 'Boolean', '平面著色（顯示每個面的法線）。', 'bool'],
    ['wireframe', 'Boolean', '線框。', 'bool'],
    ['normalMap', 'Texture', '法線貼圖。', null],
    ['bumpMap', 'Texture', '凹凸貼圖。', null],
    ['displacementMap', 'Texture', '位移貼圖。', null],
  ]));

/* Toon：需要 gradientMap */
items.push({
  id: 'api-meshtoonmaterial', title: 'MeshToonMaterial', api: true, inherits: MB, src: 'materials/MeshToonMaterial.js',
  desc: '<p>卡通著色材質（cel shading）。光照會被量化成數個色階；色階由 <code>gradientMap</code> 決定，該貼圖必須使用 <code>NearestFilter</code>。</p>',
  ctor: { sig: 'new MeshToonMaterial( parameters : Object )' },
  examples: [{
    title: '色階數量',
    desc: '用 DataTexture 產生 N 階灰階漸層作為 gradientMap，調整階數觀察卡通效果。',
    code: code`
import * as THREE from 'three';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 1, 5], background: 0xfaf3e0 });

function makeGradient(steps) {
  const data = new Uint8Array(steps * 4);
  for (let i = 0; i < steps; i++) {
    const v = Math.round((i / (steps - 1)) * 255);
    data.set([v, v, v, 255], i * 4);
  }
  const tex = new THREE.DataTexture(data, steps, 1, THREE.RGBAFormat);
  tex.minFilter = tex.magFilter = THREE.NearestFilter;   // 必須！
  tex.needsUpdate = true;
  return tex;
}
const material = new THREE.MeshToonMaterial({ color: 0xff7043, gradientMap: makeGradient(3) });
const meshes = [new THREE.TorusKnotGeometry(0.55, 0.2, 128, 24), new THREE.SphereGeometry(0.7, 48, 24)].map((g, i) => {
  const m = new THREE.Mesh(g, material);
  m.position.x = i * 2 - 1;
  scene.add(m);
  return m;
});
const p = { steps: 3, color: '#ff7043' };
const gui = new GUI();
gui.add(p, 'steps', 2, 8, 1).onChange((n) => { material.gradientMap.dispose(); material.gradientMap = makeGradient(n); });
gui.addColor(p, 'color').onChange((v) => material.color.set(v));
onFrame((t) => meshes.forEach((m) => { m.rotation.y = t * 0.5; }));
`
  }],
  props: [
    ['.color : Color', '顏色。'],
    ['.gradientMap : Texture', '色階貼圖（需 NearestFilter）。null 時使用預設的兩階（70% / 100%）。'],
    ['.emissive / .emissiveIntensity / .emissiveMap', '自發光。'],
    ['.map / .normalMap / .bumpMap / .aoMap / .lightMap / .alphaMap / .displacementMap', '各種貼圖。'],
    ['.wireframe : Boolean', '線框。'],
  ],
});

/* Matcap */
items.push({
  id: 'api-meshmatcapmaterial', title: 'MeshMatcapMaterial', api: true, inherits: MB, src: 'materials/MeshMatcapMaterial.js',
  desc: '<p>Matcap（Material Capture）材質：用一張「球體的照片」依法線方向取色，模擬光照與材質質感。不需要任何光源、效能極佳，常用於雕塑預覽或風格化渲染。缺點是光照固定、不會投射陰影。</p>',
  ctor: { sig: 'new MeshMatcapMaterial( parameters : Object )' },
  examples: [{
    title: '以 Canvas 繪製 matcap',
    desc: '用放射漸層畫出一顆「發亮的球」作為 matcap 貼圖，場景中沒有任何光源。',
    code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 0.5, 5], lights: false });

function makeMatcap(base, highlight) {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(90, 80, 10, 128, 128, 128);
  g.addColorStop(0, highlight); g.addColorStop(0.4, base); g.addColorStop(1, '#000');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const mats = [makeMatcap('#c0392b', '#ffd1c4'), makeMatcap('#2e86c1', '#e0f3ff'), makeMatcap('#b7950b', '#fff7cf')]
  .map((matcap) => new THREE.MeshMatcapMaterial({ matcap }));
const meshes = mats.map((m, i) => {
  const mesh = new THREE.Mesh(new THREE.TorusKnotGeometry(0.5, 0.18, 128, 24), m);
  mesh.position.x = (i - 1) * 1.9;
  scene.add(mesh);
  return mesh;
});
console.log('場景中的光源數量：', scene.children.filter((o) => o.isLight).length);
onFrame((t) => meshes.forEach((m, i) => { m.rotation.set(t * 0.4, t * 0.6 + i, 0); }));
`
  }],
  props: [
    ['.matcap : Texture', 'matcap 貼圖。'],
    ['.color : Color', '顏色（與 matcap 相乘）。'],
    ['.flatShading : Boolean', '平面著色。'],
    ['.map / .normalMap / .bumpMap / .alphaMap / .displacementMap', '各種貼圖。'],
  ],
});

/* Depth */
items.push({
  id: 'api-meshdepthmaterial', title: 'MeshDepthMaterial', api: true, inherits: MB, src: 'materials/MeshDepthMaterial.js',
  desc: '<p>依深度著色：距離相機越近越白、越遠越黑（以相機 near / far 為範圍）。內部用於陰影貼圖，也可用於深度預覽或特效。</p>',
  ctor: { sig: 'new MeshDepthMaterial( parameters : Object )' },
  examples: [{
    title: '深度預覽（overrideMaterial）',
    desc: '把 scene.overrideMaterial 設為 MeshDepthMaterial，整個場景改以深度繪製。調整相機 far 會改變灰階分布。',
    code: code`
import * as THREE from 'three';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const { scene, camera } = createStage({ cameraPosition: [0, 3, 8], near: 1, far: 20 });

for (let i = 0; i < 40; i++) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), new THREE.MeshStandardMaterial({ color: 0x90caf9 }));
  m.position.set((Math.random() - 0.5) * 8, Math.random() * 2, -Math.random() * 12 + 2);
  m.rotation.set(Math.random(), Math.random(), 0);
  scene.add(m);
}
const depth = new THREE.MeshDepthMaterial();
scene.overrideMaterial = depth;
const gui = new GUI();
gui.add({ on: true }, 'on').name('深度模式').onChange((v) => (scene.overrideMaterial = v ? depth : null));
gui.add(camera, 'far', 5, 40, 0.1).onChange(() => camera.updateProjectionMatrix());
gui.add(camera, 'near', 0.1, 5, 0.1).onChange(() => camera.updateProjectionMatrix());
`
  }],
  props: [
    ['.depthPacking : Integer', '<code>BasicDepthPacking</code>（預設）或 <code>RGBADepthPacking</code>（把深度編碼到 RGBA，精度更高）。'],
    ['.map / .alphaMap / .displacementMap', '貼圖。'],
    ['.wireframe : Boolean', '線框。'],
  ],
});

/* Points */
items.push({
  id: 'api-pointsmaterial', title: 'PointsMaterial', api: true, inherits: MB, src: 'materials/PointsMaterial.js',
  desc: '<p><a href="#/api-points">Points</a> 使用的預設材質。每個點是一個面向螢幕的正方形，可用 map / alphaMap 改變形狀。</p>',
  ctor: { sig: 'new PointsMaterial( parameters : Object )' },
  examples: [{
    title: '粒子大小、貼圖與混合',
    code: code`
import * as THREE from 'three';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 2, 8], lights: false, background: 0x050510 });

const count = 4000;
const pos = new Float32Array(count * 3), col = new Float32Array(count * 3);
const c = new THREE.Color();
for (let i = 0; i < count; i++) {
  pos.set([(Math.random() - 0.5) * 10, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 10], i * 3);
  c.setHSL(0.55 + Math.random() * 0.2, 0.8, 0.6);
  col.set([c.r, c.g, c.b], i * 3);
}
const geo = new THREE.BufferGeometry();
geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

// 圓形柔光貼圖
const cv = document.createElement('canvas'); cv.width = cv.height = 64;
const ctx = cv.getContext('2d');
const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
g.addColorStop(0, '#fff'); g.addColorStop(0.3, 'rgba(255,255,255,0.6)'); g.addColorStop(1, 'rgba(255,255,255,0)');
ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
const sprite = new THREE.CanvasTexture(cv);

const material = new THREE.PointsMaterial({ size: 0.15, vertexColors: true, map: sprite, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
const points = new THREE.Points(geo, material);
scene.add(points);

const gui = new GUI();
gui.add(material, 'size', 0.01, 0.5, 0.01);
gui.add(material, 'sizeAttenuation').onChange(() => (material.needsUpdate = true));
gui.add(material, 'vertexColors').onChange(() => (material.needsUpdate = true));
gui.add({ map: true }, 'map').name('map（圓形貼圖）').onChange((v) => { material.map = v ? sprite : null; material.needsUpdate = true; });
gui.add(material, 'blending', { Normal: THREE.NormalBlending, Additive: THREE.AdditiveBlending });
onFrame((t) => { points.rotation.y = t * 0.05; });
`
  }],
  props: [
    ['.color : Color', '顏色。'],
    ['.size : Float', '點大小（像素，若 sizeAttenuation 為 true 則隨距離縮放），預設 1。'],
    ['.sizeAttenuation : Boolean', '點大小是否隨距離衰減（僅透視相機），預設 true。'],
    ['.map : Texture', '點的貼圖。'],
    ['.alphaMap : Texture', '透明度貼圖。'],
    ['.fog : Boolean', '是否受霧影響。'],
  ],
});

/* Line materials */
items.push({
  id: 'api-linebasicmaterial', title: 'LineBasicMaterial', api: true, inherits: MB, src: 'materials/LineBasicMaterial.js',
  desc: '<p>線條（Line、LineSegments、LineLoop）的基本材質。範例請見 <a href="#/api-line">Line</a> 與 <a href="#/api-linesegments">LineSegments</a>。</p>',
  ctor: { sig: 'new LineBasicMaterial( parameters : Object )' },
  props: [
    ['.color : Color', '顏色。'],
    ['.linewidth : Float', '線寬。受 WebGL 限制，大多數平台上永遠是 1。'],
    ['.linecap / .linejoin : String', '線端 / 連接樣式（僅 SVGRenderer 有效）。'],
    ['.map : Texture', '貼圖。'],
    ['.fog : Boolean', '是否受霧影響。'],
  ],
});
items.push({
  id: 'api-linedashedmaterial', title: 'LineDashedMaterial', api: true, inherits: MB.concat('LineBasicMaterial'), src: 'materials/LineDashedMaterial.js',
  desc: '<p>虛線材質。使用前必須對線條物件呼叫 <code>computeLineDistances()</code>。範例請見 <a href="#/api-line">Line</a>。</p>',
  ctor: { sig: 'new LineDashedMaterial( parameters : Object )' },
  props: [
    ['.dashSize : Float', '實線段長度，預設 3。'],
    ['.gapSize : Float', '間隔長度，預設 1。'],
    ['.scale : Float', '整體縮放，預設 1。'],
  ],
});

/* Sprite material */
items.push({
  id: 'api-spritematerial', title: 'SpriteMaterial', api: true, inherits: MB, src: 'materials/SpriteMaterial.js',
  desc: '<p><a href="#/api-sprite">Sprite</a> 使用的材質，預設為透明（transparent: true）。</p>',
  ctor: { sig: 'new SpriteMaterial( parameters : Object )' },
  examples: [{
    title: 'rotation 與 sizeAttenuation',
    code: code`
import * as THREE from 'three';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ grid: true, cameraPosition: [0, 3, 8] });

const c = document.createElement('canvas'); c.width = c.height = 64;
const ctx = c.getContext('2d');
ctx.fillStyle = '#ffca28'; ctx.beginPath();
for (let i = 0; i < 10; i++) { const r = i % 2 ? 12 : 30, a = i / 10 * Math.PI * 2 - Math.PI / 2; ctx.lineTo(32 + Math.cos(a) * r, 32 + Math.sin(a) * r); }
ctx.fill();
const tex = new THREE.CanvasTexture(c);
tex.colorSpace = THREE.SRGBColorSpace;

const material = new THREE.SpriteMaterial({ map: tex });
for (let i = 0; i < 7; i++) {
  const s = new THREE.Sprite(material);
  s.position.set((i - 3) * 1.4, 1, -i * 1.5 + 3);
  scene.add(s);
}
const p = { spin: true };
const gui = new GUI();
gui.add(p, 'spin').name('旋轉 rotation');
gui.add(material, 'sizeAttenuation').onChange(() => (material.needsUpdate = true));
gui.add(material, 'opacity', 0, 1, 0.01);
onFrame((t) => { if (p.spin) material.rotation = t; });
`
  }],
  props: [
    ['.color : Color', '顏色。'],
    ['.map : Texture', '貼圖。'],
    ['.alphaMap : Texture', '透明度貼圖。'],
    ['.rotation : Radians', '在螢幕平面上的旋轉。'],
    ['.sizeAttenuation : Boolean', '是否隨距離縮放（僅透視相機），預設 true。'],
    ['.fog : Boolean', '是否受霧影響。'],
  ],
});

/* ShaderMaterial */
items.push({
  id: 'api-shadermaterial', title: 'ShaderMaterial', api: true, inherits: MB, src: 'materials/ShaderMaterial.js',
  desc: '<p>以自訂 GLSL 著色器繪製的材質。ShaderMaterial 會自動在著色器前面加入 three.js 內建的 uniform（<code>modelViewMatrix</code>、<code>projectionMatrix</code>、<code>cameraPosition</code>……）與 attribute（<code>position</code>、<code>normal</code>、<code>uv</code>）。若不想要任何自動注入，使用 <code>RawShaderMaterial</code>。</p>',
  ctor: { sig: 'new ShaderMaterial( parameters : Object )' },
  examples: [{
    title: 'uniforms、defines 與 varying',
    desc: '片段著色器依法線與時間產生菲涅耳（Fresnel）邊緣光。defines 可在 JS 中切換著色器分支（修改後需 needsUpdate）。',
    code: code`
import * as THREE from 'three';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 0, 5], lights: false, background: 0x05070d });

const material = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(0x00e5ff) },
    uPower: { value: 2.0 },
  },
  defines: { STRIPES: 1 },
  vertexShader: [
    'varying vec3 vNormal;',
    'varying vec3 vViewDir;',
    'varying vec3 vPos;',
    'void main() {',
    '  vec4 mvPos = modelViewMatrix * vec4(position, 1.0);',
    '  vNormal = normalize(normalMatrix * normal);',
    '  vViewDir = normalize(-mvPos.xyz);',
    '  vPos = position;',
    '  gl_Position = projectionMatrix * mvPos;',
    '}',
  ].join('\n'),
  fragmentShader: [
    'uniform float uTime;',
    'uniform vec3 uColor;',
    'uniform float uPower;',
    'varying vec3 vNormal;',
    'varying vec3 vViewDir;',
    'varying vec3 vPos;',
    'void main() {',
    '  float fresnel = pow(1.0 - abs(dot(vNormal, vViewDir)), uPower);',
    '  vec3 col = uColor * fresnel;',
    '  #if STRIPES == 1',
    '    col += uColor * 0.25 * step(0.5, fract(vPos.y * 6.0 - uTime));',
    '  #endif',
    '  gl_FragColor = vec4(col, 1.0);',
    '}',
  ].join('\n'),
});
const mesh = new THREE.Mesh(new THREE.TorusKnotGeometry(0.9, 0.3, 200, 32), material);
scene.add(mesh);

const gui = new GUI();
gui.add(material.uniforms.uPower, 'value', 0.2, 6, 0.01).name('uPower');
gui.addColor({ c: '#00e5ff' }, 'c').name('uColor').onChange((v) => material.uniforms.uColor.value.set(v));
gui.add({ stripes: true }, 'stripes').name('defines.STRIPES').onChange((v) => {
  material.defines.STRIPES = v ? 1 : 0;
  material.needsUpdate = true;   // defines 改變需要重新編譯
});
onFrame((t) => { material.uniforms.uTime.value = t; mesh.rotation.y = t * 0.3; });
`
  }],
  props: [
    ['.uniforms : Object', '傳給著色器的變數：<code>{ 名稱: { value: 值 } }</code>。值可為 Number、Vector2/3/4、Color、Matrix3/4、Texture、陣列。每幀修改 <code>.value</code> 即可，不需 needsUpdate。'],
    ['.vertexShader : String', '頂點著色器 GLSL 原始碼。'],
    ['.fragmentShader : String', '片段著色器 GLSL 原始碼。'],
    ['.defines : Object', '以 <code>#define</code> 注入的巨集。修改後需 needsUpdate。'],
    ['.glslVersion : String', '設為 <code>THREE.GLSL3</code> 以撰寫 GLSL ES 3.0。'],
    ['.lights : Boolean', '是否傳入場景光源的 uniform，預設 false。'],
    ['.fog : Boolean', '是否傳入霧的 uniform。'],
    ['.clipping : Boolean', '是否支援裁切平面。'],
    ['.wireframe : Boolean', '線框。'],
    ['.extensions : Object', '<code>{ clipCullDistance, multiDraw }</code> 等擴充。'],
    ['.uniformsGroups : Array', 'UBO（uniform buffer object）群組。'],
    ['.index0AttributeName : String', '強制綁定到位置 0 的 attribute 名稱。'],
  ],
  methods: [
    ['.clone() : ShaderMaterial', '複製（uniforms 會被深度複製）。'],
  ],
});

window.DOCS.push({ group: '材質 Materials', section: 'api', items: items });
})();
