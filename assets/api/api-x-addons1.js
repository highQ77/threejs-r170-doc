/* API 參考（補充）：附加模組 — 控制器、幾何體、輔助物件、光源、線條、物件 */
(function () {
var code = String.raw;
function add(name, items) {
  var g = window.DOCS.find(function (x) { return x.group === name; });
  if (!g) { g = { group: name, section: 'api', items: [] }; window.DOCS.push(g); }
  g.items.push.apply(g.items, items);
}
function imp(names, path) { return "import { " + names + " } from 'three/addons/" + path + "';"; }
var CTRL = ['EventDispatcher', 'Controls'];

/* 控制器範例共用的城市場景 */
var CITY = code`
// 共用展示場景：一片隨機的城市方塊
scene.add(new THREE.GridHelper(60, 60, 0x555555, 0x333333));
for (let i = 0; i < 200; i++) {
  const h = 0.5 + Math.random() * 5;
  const b = new THREE.Mesh(new THREE.BoxGeometry(1, h, 1), new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(0.55 + Math.random() * 0.1, 0.35, 0.35 + Math.random() * 0.3) }));
  b.position.set(Math.round((Math.random() - 0.5) * 40), h / 2, Math.round((Math.random() - 0.5) * 40));
  scene.add(b);
}
`;
var HINT = function (text) { return "const tip = document.createElement('div');\ntip.textContent = '" + text + "';\ntip.style.cssText = 'position:absolute;left:10px;bottom:10px;color:#ddd;font-size:13px;background:rgba(0,0,0,.5);padding:4px 8px;border-radius:6px';\ndocument.body.appendChild(tip);"; };

/* ================= 控制器 ================= */
add('附加：控制器 Controls', [
{
  id: 'api-mapcontrols', title: 'MapControls', api: true, inherits: CTRL.concat('OrbitControls'), src: 'examples/jsm/controls/MapControls.js',
  module: imp('MapControls', 'controls/MapControls.js'),
  desc: '<p>類似地圖應用的相機控制：<b>左鍵平移、右鍵旋轉</b>、滾輪縮放，平移在地面平面上進行。繼承自 <a href="#/api-orbitcontrols">OrbitControls</a>，所有屬性相同。適合俯瞰的地圖、城市、策略遊戲。</p>',
  ctor: { sig: 'new MapControls( object : Camera, domElement : HTMLElement )' },
  examples: [{ title: '俯瞰城市', code: code`
import * as THREE from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { createStage } from 'doc-stage';
const { scene, camera, renderer, onFrame } = createStage({ controls: false, cameraPosition: [0, 25, 20] });
` + CITY + code`
const controls = new MapControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.screenSpacePanning = false;   // 在地面上平移
controls.minDistance = 5;
controls.maxDistance = 60;
controls.maxPolarAngle = Math.PI / 2.2;
` + HINT('左鍵拖曳平移・右鍵旋轉・滾輪縮放') + code`
onFrame(() => controls.update());
` }],
  props: [['.screenSpacePanning : Boolean', '預設 false：平移時沿地面（XZ 平面）移動。'], ['.mouseButtons : Object', '<code>{ LEFT: PAN, MIDDLE: DOLLY, RIGHT: ROTATE }</code>。'], ['.touches : Object', '<code>{ ONE: PAN, TWO: DOLLY_ROTATE }</code>。']],
},
{
  id: 'api-trackballcontrols', title: 'TrackballControls', api: true, inherits: CTRL, src: 'examples/jsm/controls/TrackballControls.js',
  module: imp('TrackballControls', 'controls/TrackballControls.js'),
  desc: '<p>軌跡球式控制：與 OrbitControls 類似，但<b>不保持相機的「上」方向</b>，可以任意翻滾、越過頭頂。適合觀察沒有固定上下方向的物體（分子、太空場景）。每幀必須呼叫 <code>update()</code>，且畫布尺寸改變時要呼叫 <code>handleResize()</code>。</p>',
  ctor: { sig: 'new TrackballControls( camera : Camera, domElement : HTMLElement )' },
  examples: [{ title: '自由翻滾觀察分子', code: code`
import * as THREE from 'three';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const stage = createStage({ controls: false, cameraPosition: [0, 0, 10] });
const { scene, camera, renderer } = stage;
const mol = new THREE.Group();
for (let i = 0; i < 40; i++) {
  const a = new THREE.Mesh(new THREE.SphereGeometry(0.3 + Math.random() * 0.3, 24, 12), new THREE.MeshStandardMaterial({ color: [0xef5350, 0xeceff1, 0x42a5f5, 0x424242][i % 4] }));
  a.position.randomDirection().multiplyScalar(1 + Math.random() * 2.5);
  mol.add(a);
}
scene.add(mol);
const controls = new TrackballControls(camera, renderer.domElement);
controls.rotateSpeed = 3;
const gui = new GUI();
gui.add(controls, 'rotateSpeed', 0.5, 10, 0.1);
gui.add(controls, 'zoomSpeed', 0.1, 5, 0.1);
gui.add(controls, 'panSpeed', 0.1, 2, 0.1);
gui.add(controls, 'staticMoving').name('staticMoving（無慣性）');
stage.onFrame(() => controls.update());
stage.onResize(() => controls.handleResize());
` }],
  props: [
    ['.rotateSpeed / .zoomSpeed / .panSpeed : Number', '速度（預設 1.0 / 1.2 / 0.3）。'], ['.noRotate / .noZoom / .noPan : Boolean', '停用特定操作。'],
    ['.staticMoving : Boolean', 'true 時停止拖曳立即停止（無慣性）。'], ['.dynamicDampingFactor : Number', '慣性阻尼，預設 0.2。'],
    ['.minDistance / .maxDistance', '距離限制。'], ['.target : Vector3', '旋轉中心。'], ['.keys : Array', '切換 旋轉 / 縮放 / 平移 的按鍵，預設 [KeyA, KeyS, KeyD]。'],
  ],
  methods: [['.update() : undefined', '每幀呼叫。'], ['.handleResize() : undefined', '畫布尺寸改變時呼叫。'], ['.reset() : undefined', '重設。'], ['.dispose() : undefined', '移除事件。']],
},
{
  id: 'api-arcballcontrols', title: 'ArcballControls', api: true, inherits: CTRL, src: 'examples/jsm/controls/ArcballControls.js',
  module: imp('ArcballControls', 'controls/ArcballControls.js'),
  desc: '<p>以虛擬軌跡球（Arcball）操作相機，可選擇顯示輔助 gizmo。支援旋轉、平移、縮放、FOV 調整（Shift + 滾輪）、雙擊聚焦、儲存 / 載入視角狀態（複製到剪貼簿）等進階功能。</p>',
  ctor: { sig: 'new ArcballControls( camera : Camera, domElement : HTMLElement, scene : Scene )', params: [['scene', 'Scene', '（選填）提供時會顯示 gizmo，並可雙擊聚焦物件。']] },
  examples: [{ title: '帶 gizmo 的 Arcball', code: code`
import * as THREE from 'three';
import { ArcballControls } from 'three/addons/controls/ArcballControls.js';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const { scene, camera, renderer } = createStage({ controls: false, cameraPosition: [0, 2, 8] });
const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(1, 0.35, 160, 24), new THREE.MeshNormalMaterial());
scene.add(knot);
const controls = new ArcballControls(camera, renderer.domElement, scene);
controls.setGizmosVisible(true);
controls.addEventListener('change', () => {});   // 每次變化時發出（renderer 迴圈已在執行）
const gui = new GUI();
gui.add(controls, 'enableAnimations').name('慣性動畫');
gui.add(controls, 'cursorZoom').name('朝游標縮放');
gui.add(controls, 'enableGrid').name('平移時顯示格線');
gui.add({ g: true }, 'g').name('顯示 gizmo').onChange((v) => controls.setGizmosVisible(v));
gui.add({ reset: () => controls.reset() }, 'reset');
` + HINT('左鍵旋轉・右鍵平移・滾輪縮放・Shift+滾輪 調整 FOV・雙擊聚焦') + code`
console.log('ArcballControls 已啟用');
` }],
  props: [['.enableAnimations : Boolean', '旋轉後的慣性與雙擊聚焦動畫。'], ['.cursorZoom : Boolean', '朝游標方向縮放。'], ['.enableGrid : Boolean', '平移時顯示格線。'], ['.focusAnimationTime : Number', '聚焦動畫時間（毫秒）。'], ['.dampingFactor / .wMax', '慣性設定。'], ['.minDistance / .maxDistance / .minFov / .maxFov', '限制。']],
  methods: [['.setGizmosVisible( value ) : undefined', '顯示 / 隱藏 gizmo。'], ['.setTbRadius( value ) : undefined', '軌跡球半徑比例。'], ['.reset() : undefined', '重設。'], ['.copyState() / .pasteState() : undefined', '把視角狀態複製到 / 從剪貼簿貼上。'], ['.saveState() : undefined', '儲存狀態供 reset 使用。'], ['.setMouseAction( operation, mouse, key ) : Boolean', '自訂滑鼠操作對應。'], ['.update() / .dispose()', '更新 / 釋放。']],
},
{
  id: 'api-flycontrols', title: 'FlyControls', api: true, inherits: CTRL, src: 'examples/jsm/controls/FlyControls.js',
  module: imp('FlyControls', 'controls/FlyControls.js'),
  desc: '<p>飛行模擬式控制：以鍵盤在 3D 空間中任意移動與翻滾。<b>WASD</b> 移動、<b>R / F</b> 上下、<b>Q / E</b> 翻滾、方向鍵俯仰與偏航，滑鼠拖曳轉向。<code>update(delta)</code> 需傳入秒數。</p>',
  ctor: { sig: 'new FlyControls( object : Camera, domElement : HTMLElement )' },
  examples: [{ title: '在城市上空飛行', code: code`
import * as THREE from 'three';
import { FlyControls } from 'three/addons/controls/FlyControls.js';
import { createStage } from 'doc-stage';
const { scene, camera, renderer, onFrame } = createStage({ controls: false, cameraPosition: [0, 8, 25], fov: 60 });
scene.fog = new THREE.Fog(0x1e2027, 10, 50);
` + CITY + code`
const controls = new FlyControls(camera, renderer.domElement);
controls.movementSpeed = 8;
controls.rollSpeed = Math.PI / 6;
controls.dragToLook = true;
` + HINT('先點擊畫面・WASD 移動・R/F 上下・Q/E 翻滾・拖曳轉向') + code`
onFrame((t, dt) => controls.update(dt));
` }],
  props: [['.movementSpeed : Number', '移動速度（單位 / 秒），預設 1。'], ['.rollSpeed : Number', '旋轉速度（弧度 / 秒），預設 0.005。'], ['.dragToLook : Boolean', 'true 時需按住滑鼠才轉向。'], ['.autoForward : Boolean', '自動前進。']],
  methods: [['.update( delta ) : undefined', '每幀呼叫，delta 為秒數。'], ['.dispose() : undefined', '移除事件。']],
},
{
  id: 'api-firstpersoncontrols', title: 'FirstPersonControls', api: true, inherits: CTRL, src: 'examples/jsm/controls/FirstPersonControls.js',
  module: imp('FirstPersonControls', 'controls/FirstPersonControls.js'),
  desc: '<p>第一人稱控制的簡易版本：<b>WASD / 方向鍵</b> 移動，滑鼠<b>位置</b>（不需點擊）決定視線轉動方向。若需要遊戲般的滑鼠鎖定視角，請使用 <a href="#/api-pointerlockcontrols">PointerLockControls</a>。</p>',
  ctor: { sig: 'new FirstPersonControls( object : Camera, domElement : HTMLElement )' },
  examples: [{ title: '漫步城市', code: code`
import * as THREE from 'three';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { createStage } from 'doc-stage';
const stage = createStage({ controls: false, cameraPosition: [0, 1.7, 22], fov: 70 });
const { scene, camera, renderer } = stage;
` + CITY + code`
const controls = new FirstPersonControls(camera, renderer.domElement);
controls.movementSpeed = 6;
controls.lookSpeed = 0.08;
controls.lookVertical = false;   // 只左右轉
controls.activeLook = true;
` + HINT('WASD 移動・滑鼠移到畫面左右側轉向') + code`
stage.onFrame((t, dt) => { controls.update(dt); camera.position.y = 1.7; });
stage.onResize(() => controls.handleResize());
` }],
  props: [['.movementSpeed / .lookSpeed : Number', '移動 / 轉向速度。'], ['.lookVertical : Boolean', '是否可上下看。'], ['.constrainVertical / .verticalMin / .verticalMax', '垂直角度限制。'], ['.activeLook : Boolean', '是否啟用滑鼠轉向。'], ['.autoForward : Boolean', '自動前進。'], ['.heightSpeed / .heightCoef / .heightMin / .heightMax', '依高度調整速度。']],
  methods: [['.update( delta ) : undefined', '每幀呼叫。'], ['.lookAt( vector ) : this', '看向某點。'], ['.handleResize() : undefined', '尺寸改變時呼叫。'], ['.dispose() : undefined', '移除事件。']],
},
{
  id: 'api-pointerlockcontrols', title: 'PointerLockControls', api: true, inherits: CTRL, src: 'examples/jsm/controls/PointerLockControls.js',
  module: imp('PointerLockControls', 'controls/PointerLockControls.js'),
  desc: '<p>FPS 遊戲式控制：使用瀏覽器的 Pointer Lock API 鎖定並隱藏游標，滑鼠移動直接轉動視角。它只負責「視角」，移動需搭配鍵盤自行實作（範例中示範）。按 <b>Esc</b> 解除鎖定。</p>',
  ctor: { sig: 'new PointerLockControls( camera : Camera, domElement : HTMLElement )' },
  examples: [{ title: 'FPS 視角與 WASD 移動', code: code`
import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { createStage } from 'doc-stage';
const { scene, camera, renderer, onFrame } = createStage({ controls: false, cameraPosition: [0, 1.7, 22], fov: 70 });
` + CITY + code`
const controls = new PointerLockControls(camera, renderer.domElement);
const overlay = document.createElement('div');
overlay.textContent = '點擊開始（WASD 移動・滑鼠轉向・Esc 離開）';
overlay.style.cssText = 'position:absolute;inset:0;display:grid;place-items:center;background:rgba(0,0,0,.5);color:#fff;font-size:16px;cursor:pointer';
document.body.appendChild(overlay);
overlay.onclick = () => controls.lock();
controls.addEventListener('lock', () => { overlay.style.display = 'none'; console.log('lock'); });
controls.addEventListener('unlock', () => { overlay.style.display = 'grid'; console.log('unlock'); });

const keys = {};
addEventListener('keydown', (e) => (keys[e.code] = true));
addEventListener('keyup', (e) => (keys[e.code] = false));
onFrame((t, dt) => {
  if (!controls.isLocked) return;
  const speed = 8 * dt;
  if (keys.KeyW) controls.moveForward(speed);
  if (keys.KeyS) controls.moveForward(-speed);
  if (keys.KeyD) controls.moveRight(speed);
  if (keys.KeyA) controls.moveRight(-speed);
});
` }],
  props: [['.isLocked : Boolean', '是否已鎖定。'], ['.minPolarAngle / .maxPolarAngle : Number', '上下視角限制（預設 0 ~ π）。'], ['.pointerSpeed : Number', '轉向靈敏度，預設 1。']],
  methods: [['.lock( unadjustedMovement ) : undefined', '請求鎖定游標（必須由使用者互動觸發）。'], ['.unlock() : undefined', '解除鎖定。'], ['.moveForward( distance ) : undefined', '沿水平視線方向前進。'], ['.moveRight( distance ) : undefined', '水平向右移動。'], ['.getDirection( target ) : Vector3', '視線方向。'], ['.addEventListener( type, fn )', '事件：change、lock、unlock。']],
},
{
  id: 'api-dragcontrols', title: 'DragControls', api: true, inherits: CTRL, src: 'examples/jsm/controls/DragControls.js',
  module: imp('DragControls', 'controls/DragControls.js'),
  desc: '<p>直接用滑鼠拖曳場景中的物件（在與相機平行的平面上移動）。r169 起也支援以 <code>mode = "rotate"</code> 旋轉物件。</p>',
  ctor: { sig: 'new DragControls( objects : Array, camera : Camera, domElement : HTMLElement )' },
  examples: [{ title: '拖曳方塊', code: code`
import * as THREE from 'three';
import { DragControls } from 'three/addons/controls/DragControls.js';
import { createStage } from 'doc-stage';
const { scene, camera, renderer } = createStage({ controls: false, grid: true, cameraPosition: [0, 6, 9] });
const objects = [];
for (let i = 0; i < 8; i++) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(i / 8, 0.7, 0.55) }));
  m.position.set((i % 4 - 1.5) * 1.6, 0.5, (Math.floor(i / 4) - 0.5) * 2);
  scene.add(m);
  objects.push(m);
}
const controls = new DragControls(objects, camera, renderer.domElement);
controls.addEventListener('hoveron', (e) => e.object.material.emissive.set(0x333333));
controls.addEventListener('hoveroff', (e) => e.object.material.emissive.set(0x000000));
controls.addEventListener('dragstart', (e) => e.object.scale.setScalar(1.15));
controls.addEventListener('drag', (e) => { e.object.position.y = Math.max(0.5, e.object.position.y); });
controls.addEventListener('dragend', (e) => { e.object.scale.setScalar(1); console.log('放下位置', e.object.position); });
` + HINT('拖曳方塊移動（右鍵拖曳可旋轉）') }],
  props: [['.objects : Array', '可拖曳的物件。'], ['.recursive : Boolean', '是否檢測子物件，預設 true。'], ['.transformGroup : Boolean', 'true 時拖曳整個群組。'], ['.mode : String', '"translate"（預設）或 "rotate"。'], ['.rotateSpeed : Number', '旋轉速度。']],
  methods: [['.addEventListener( type, fn )', '事件：hoveron、hoveroff、dragstart、drag、dragend。'], ['.dispose() : undefined', '移除事件。']],
},
]);

/* ================= 幾何體 ================= */
add('附加：幾何體 Geometries', [
{
  id: 'api-textgeometry', title: 'TextGeometry', api: true, inherits: ['EventDispatcher', 'BufferGeometry', 'ExtrudeGeometry'], src: 'examples/jsm/geometries/TextGeometry.js',
  module: imp('TextGeometry', 'geometries/TextGeometry.js') + '\n' + imp('FontLoader', 'loaders/FontLoader.js'),
  desc: '<p>3D 文字幾何體：把字型輪廓擠出成立體。字型需為 typeface.json 格式（以 <code>FontLoader</code> 載入，可用 facetype.js 從 TTF 轉換）。內建字型只包含英文字元；中文字型檔案很大，通常改用 Canvas 貼圖或 troika-three-text。</p>',
  ctor: { sig: 'new TextGeometry( text : String, parameters : Object )', params: [
    ['font', 'Font', '字型。'], ['size', 'Float', '字高，預設 100。'], ['depth', 'Float', '擠出厚度，預設 50。'], ['curveSegments', 'Integer', '曲線分段，預設 12。'],
    ['bevelEnabled / bevelThickness / bevelSize / bevelOffset / bevelSegments', '—', '斜角設定，同 ExtrudeGeometry。'],
  ]},
  examples: [{ title: '可編輯的 3D 文字', code: code`
import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const { scene } = createStage({ cameraPosition: [0, 1, 9] });
const fonts = {};
const loader = new FontLoader().setPath('https://unpkg.com/three@0.170.0/examples/fonts/');
for (const f of ['helvetiker_bold', 'optimer_regular', 'gentilis_bold', 'droid/droid_serif_regular']) fonts[f] = await loader.loadAsync(f + '.typeface.json');
const p = { text: 'Hello 3D', font: 'helvetiker_bold', size: 1, depth: 0.3, bevel: true };
const mesh = new THREE.Mesh(new THREE.BufferGeometry(), [
  new THREE.MeshStandardMaterial({ color: 0xffffff }),      // 正面
  new THREE.MeshStandardMaterial({ color: 0xff7043 }),      // 側面
]);
scene.add(mesh);
function rebuild() {
  mesh.geometry.dispose();
  mesh.geometry = new TextGeometry(p.text, { font: fonts[p.font], size: p.size, depth: p.depth, curveSegments: 8,
    bevelEnabled: p.bevel, bevelThickness: 0.04, bevelSize: 0.03, bevelSegments: 3 });
  mesh.geometry.center();
}
rebuild();
const gui = new GUI();
gui.add(p, 'text').onFinishChange(rebuild);
gui.add(p, 'font', Object.keys(fonts)).onChange(rebuild);
gui.add(p, 'size', 0.2, 2, 0.01).onChange(rebuild);
gui.add(p, 'depth', 0, 1, 0.01).onChange(rebuild);
gui.add(p, 'bevel').onChange(rebuild);
` }],
  props: [['.parameters : Object', '建構參數。']],
},
{
  id: 'api-parametricgeometry', title: 'ParametricGeometry', api: true, inherits: ['EventDispatcher', 'BufferGeometry'], src: 'examples/jsm/geometries/ParametricGeometry.js',
  module: imp('ParametricGeometry', 'geometries/ParametricGeometry.js'),
  desc: '<p>由參數方程式 <code>func(u, v, target)</code>（u、v ∈ [0, 1]）產生的曲面。可以建立任何數學曲面：莫比烏斯帶、克萊因瓶、波浪面……附加模組 <code>ParametricGeometries</code> 提供了幾個現成的函式。</p>',
  ctor: { sig: 'new ParametricGeometry( func : Function, slices : Integer, stacks : Integer )', params: [['func', 'Function', '<code>(u, v, target: Vector3) =&gt; void</code>，把結果寫入 target。'], ['slices / stacks', 'Integer', 'u / v 方向的分段數，預設 8。']] },
  examples: [{ title: '莫比烏斯帶與克萊因瓶', code: code`
import * as THREE from 'three';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';
import { ParametricGeometries } from 'three/addons/geometries/ParametricGeometries.js';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 3, 9] });
function mobius(u, v, target) {
  u = u * Math.PI * 2;
  v = (v - 0.5) * 1.5;
  const r = 1.6 + v * Math.cos(u / 2);
  target.set(r * Math.cos(u), v * Math.sin(u / 2), r * Math.sin(u));
}
const a = new THREE.Mesh(new ParametricGeometry(mobius, 80, 10), new THREE.MeshStandardMaterial({ color: 0x26c6da, side: THREE.DoubleSide, flatShading: true }));
a.position.x = -2.3;
const b = new THREE.Mesh(new ParametricGeometry(ParametricGeometries.klein, 60, 40), new THREE.MeshNormalMaterial({ side: THREE.DoubleSide }));
b.scale.setScalar(0.15);
b.position.x = 2.3;
scene.add(a, b);
console.log('ParametricGeometries 內建函式：', Object.keys(ParametricGeometries).join(', '));
onFrame((t) => { a.rotation.y = b.rotation.y = t * 0.4; });
` }],
  props: [['.parameters : Object', '建構參數。']],
},
{
  id: 'api-convexgeometry', title: 'ConvexGeometry', api: true, inherits: ['EventDispatcher', 'BufferGeometry'], src: 'examples/jsm/geometries/ConvexGeometry.js',
  module: imp('ConvexGeometry', 'geometries/ConvexGeometry.js'),
  desc: '<p>計算一組點的凸包（包住所有點的最小凸多面體）並建立幾何體。內部使用 <a href="#/api-convexhull">ConvexHull</a>。常用於碰撞體、寶石、岩石造型。</p>',
  ctor: { sig: 'new ConvexGeometry( points : Array )' },
  examples: [{ title: '隨機點的凸包', code: code`
import * as THREE from 'three';
import { ConvexGeometry } from 'three/addons/geometries/ConvexGeometry.js';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 1, 6] });
const group = new THREE.Group();
scene.add(group);
function build() {
  group.clear();
  const pts = Array.from({ length: 30 }, () => new THREE.Vector3().randomDirection().multiplyScalar(0.8 + Math.random() * 1.2).multiply(new THREE.Vector3(1, 1.4, 1)));
  pts.forEach((p) => { const d = new THREE.Mesh(new THREE.SphereGeometry(0.05), new THREE.MeshBasicMaterial({ color: 0xffeb3b })); d.position.copy(p); group.add(d); });
  const geo = new ConvexGeometry(pts);
  group.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x7c4dff, transparent: true, opacity: 0.6, flatShading: true })));
  console.log('30 個點 → 凸包三角形數', geo.attributes.position.count / 3);
}
build();
const btn = document.createElement('button');
btn.textContent = '重新產生';
btn.style.cssText = 'position:absolute;top:10px;left:10px';
btn.onclick = build;
document.body.appendChild(btn);
onFrame((t) => { group.rotation.y = t * 0.4; });
` }],
},
{
  id: 'api-decalgeometry', title: 'DecalGeometry', api: true, inherits: ['EventDispatcher', 'BufferGeometry'], src: 'examples/jsm/geometries/DecalGeometry.js',
  module: imp('DecalGeometry', 'geometries/DecalGeometry.js'),
  desc: '<p>貼花（Decal）：把一個投影盒範圍內的網格表面「裁切」出來產生新幾何體，用來在曲面上貼彈孔、塗鴉、標誌。新幾何體貼合表面，使用 <code>polygonOffset</code> 避免與原表面 Z-fighting。</p>',
  ctor: { sig: 'new DecalGeometry( mesh : Mesh, position : Vector3, orientation : Euler, size : Vector3 )', params: [['mesh', 'Mesh', '目標網格。'], ['position', 'Vector3', '投影中心（世界座標）。'], ['orientation', 'Euler', '投影方向。'], ['size', 'Vector3', '投影盒大小。']] },
  examples: [{ title: '點擊在模型上貼花', code: code`
import * as THREE from 'three';
import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js';
import { createStage } from 'doc-stage';
const { scene, camera, renderer } = createStage({ cameraPosition: [0, 1, 4] });
const target = new THREE.Mesh(new THREE.TorusKnotGeometry(0.8, 0.35, 200, 32), new THREE.MeshStandardMaterial({ color: 0xcfd8dc }));
scene.add(target);
const decalTex = await new THREE.TextureLoader().loadAsync('https://threejs.org/examples/textures/decal/decal-diffuse.png');
decalTex.colorSpace = THREE.SRGBColorSpace;
const decalMat = new THREE.MeshStandardMaterial({ map: decalTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 });

const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2(), helper = new THREE.Object3D();
renderer.domElement.addEventListener('dblclick', (e) => {
  pointer.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObject(target)[0];
  if (!hit) return;
  helper.position.copy(hit.point);
  helper.lookAt(hit.point.clone().add(hit.face.normal));      // 沿表面法線投影
  helper.rotation.z = Math.random() * Math.PI * 2;
  const s = 0.3 + Math.random() * 0.3;
  const m = new THREE.Mesh(new DecalGeometry(target, hit.point, helper.rotation, new THREE.Vector3(s, s, s)), decalMat.clone());
  m.material.color.setHSL(Math.random(), 0.8, 0.6);
  scene.add(m);
  console.log('貼花頂點數', m.geometry.attributes.position.count);
});
` + HINT('雙擊模型表面貼上貼花（拖曳旋轉視角）') }],
},
{
  id: 'api-teapotgeometry', title: 'TeapotGeometry', api: true, inherits: ['EventDispatcher', 'BufferGeometry'], src: 'examples/jsm/geometries/TeapotGeometry.js',
  module: imp('TeapotGeometry', 'geometries/TeapotGeometry.js'),
  desc: '<p>電腦圖學經典的「猶他茶壺」，以貝茲曲面細分產生。常用於測試材質與光照。</p>',
  ctor: { sig: 'new TeapotGeometry( size, segments, bottom, lid, body, fitLid, blinn )', params: [
    ['size', 'Number', '大小，預設 50。'], ['segments', 'Integer', '每個貝茲曲面的細分數，預設 10。'], ['bottom / lid / body', 'Boolean', '是否包含底部 / 蓋子 / 壺身。'], ['fitLid', 'Boolean', '蓋子是否稍微縮小以貼合。'], ['blinn', 'Boolean', '是否使用 Blinn 的比例（較扁）。'],
  ]},
  examples: [{ title: '茶壺參數', code: code`
import * as THREE from 'three';
import { TeapotGeometry } from 'three/addons/geometries/TeapotGeometry.js';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 2, 5] });
const p = { segments: 10, bottom: true, lid: true, body: true, fitLid: true, blinn: true, wireframe: false };
const mat = new THREE.MeshPhongMaterial({ color: 0xd4af37, shininess: 100, side: THREE.DoubleSide });
const mesh = new THREE.Mesh(new THREE.BufferGeometry(), mat);
scene.add(mesh);
function rebuild() {
  mesh.geometry.dispose();
  mesh.geometry = new TeapotGeometry(1, p.segments, p.bottom, p.lid, p.body, p.fitLid, p.blinn);
  mat.wireframe = p.wireframe;
}
rebuild();
const gui = new GUI();
gui.add(p, 'segments', 1, 30, 1).onChange(rebuild);
['bottom', 'lid', 'body', 'fitLid', 'blinn', 'wireframe'].forEach((k) => gui.add(p, k).onChange(rebuild));
onFrame((t) => { mesh.rotation.y = t * 0.4; });
` }],
},
]);

/* ================= 輔助物件 ================= */
add('附加：輔助物件 Helpers', [
{
  id: 'api-vertexnormalshelper', title: 'VertexNormalsHelper', api: true, inherits: ['EventDispatcher', 'Object3D', 'Line', 'LineSegments'], src: 'examples/jsm/helpers/VertexNormalsHelper.js',
  module: imp('VertexNormalsHelper', 'helpers/VertexNormalsHelper.js'),
  desc: '<p>以線段顯示每個頂點的法線方向，用於檢查法線是否正確（例如平滑 / 平面著色的差異、匯入模型法線錯誤）。物件變形後呼叫 <code>update()</code>。</p>',
  ctor: { sig: 'new VertexNormalsHelper( object : Object3D, size : Number, color : Color )' },
  examples: [{ title: '平滑法線 vs. 平面法線', code: code`
import * as THREE from 'three';
import { VertexNormalsHelper } from 'three/addons/helpers/VertexNormalsHelper.js';
import { createStage } from 'doc-stage';
const { scene } = createStage({ cameraPosition: [0, 1.5, 5] });
const smooth = new THREE.Mesh(new THREE.SphereGeometry(0.9, 12, 8), new THREE.MeshStandardMaterial({ color: 0x546e7a }));
smooth.position.x = -1.3;
const flat = new THREE.Mesh(new THREE.SphereGeometry(0.9, 12, 8).toNonIndexed(), new THREE.MeshStandardMaterial({ color: 0x546e7a, flatShading: true }));
flat.geometry.computeVertexNormals();   // 非索引幾何體 → 每個面獨立法線
flat.position.x = 1.3;
scene.add(smooth, flat, new VertexNormalsHelper(smooth, 0.3, 0x00e5ff), new VertexNormalsHelper(flat, 0.3, 0xff4081));
console.log('左：共用頂點（平滑法線）｜右：非索引（每面法線）');
` }],
  props: [['.object : Object3D', '目標物件。'], ['.size : Number', '線長。']],
  methods: [['.update() : undefined', '更新。'], ['.dispose() : undefined', '釋放。']],
},
{
  id: 'api-vertextangentshelper', title: 'VertexTangentsHelper', api: true, inherits: ['EventDispatcher', 'Object3D', 'Line', 'LineSegments'], src: 'examples/jsm/helpers/VertexTangentsHelper.js',
  module: imp('VertexTangentsHelper', 'helpers/VertexTangentsHelper.js'),
  desc: '<p>以線段顯示每個頂點的切線（tangent attribute），用於檢查法線貼圖所需的切線空間。幾何體需先呼叫 <code>computeTangents()</code>。</p>',
  ctor: { sig: 'new VertexTangentsHelper( object : Object3D, size : Number, color : Color )' },
  examples: [{ title: '顯示切線', code: code`
import * as THREE from 'three';
import { VertexTangentsHelper } from 'three/addons/helpers/VertexTangentsHelper.js';
import { VertexNormalsHelper } from 'three/addons/helpers/VertexNormalsHelper.js';
import { createStage } from 'doc-stage';
const { scene } = createStage({ cameraPosition: [0, 1.5, 4] });
const geo = new THREE.SphereGeometry(1, 16, 12);
geo.computeTangents();
const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x37474f }));
scene.add(mesh, new VertexTangentsHelper(mesh, 0.2, 0xffeb3b), new VertexNormalsHelper(mesh, 0.2, 0x00e5ff));
console.log('黃：切線｜藍：法線｜tangent itemSize =', geo.attributes.tangent.itemSize);
` }],
  methods: [['.update() : undefined', '更新。'], ['.dispose() : undefined', '釋放。']],
},
{
  id: 'api-rectarealighthelper', title: 'RectAreaLightHelper', api: true, inherits: ['EventDispatcher', 'Object3D', 'Line'], src: 'examples/jsm/helpers/RectAreaLightHelper.js',
  module: imp('RectAreaLightHelper', 'helpers/RectAreaLightHelper.js'),
  desc: '<p>顯示 <a href="#/api-rectarealight">RectAreaLight</a> 的發光矩形。通常以 <code>light.add(helper)</code> 加為光源的子物件。範例見 RectAreaLight。</p>',
  ctor: { sig: 'new RectAreaLightHelper( light : RectAreaLight, color : Color )' },
  methods: [['.dispose() : undefined', '釋放。']],
},
{
  id: 'api-lightprobehelper', title: 'LightProbeHelper', api: true, inherits: ['EventDispatcher', 'Object3D', 'Mesh'], src: 'examples/jsm/helpers/LightProbeHelper.js',
  module: imp('LightProbeHelper', 'helpers/LightProbeHelper.js'),
  desc: '<p>以一顆球體顯示 <a href="#/api-lightprobe">LightProbe</a> 在各方向的光照顏色。範例見 LightProbe。</p>',
  ctor: { sig: 'new LightProbeHelper( lightProbe : LightProbe, size : Number )' },
  methods: [['.dispose() : undefined', '釋放。']],
},
{
  id: 'api-positionalaudiohelper', title: 'PositionalAudioHelper', api: true, inherits: ['EventDispatcher', 'Object3D', 'Line'], src: 'examples/jsm/helpers/PositionalAudioHelper.js',
  module: imp('PositionalAudioHelper', 'helpers/PositionalAudioHelper.js'),
  desc: '<p>顯示 <a href="#/api-positionalaudio">PositionalAudio</a> 的指向錐（setDirectionalCone 設定的內外角）。範例見 PositionalAudio。</p>',
  ctor: { sig: 'new PositionalAudioHelper( audio : PositionalAudio, range : Number, divisionsInnerAngle : Number, divisionsOuterAngle : Number )' },
  methods: [['.update() : undefined', '指向錐參數改變後更新。'], ['.dispose() : undefined', '釋放。']],
},
]);

/* ================= 光源 / 物件 ================= */
add('附加：物件與光源 Objects', [
{
  id: 'api-lightprobegenerator', title: 'LightProbeGenerator', api: true, src: 'examples/jsm/lights/LightProbeGenerator.js',
  module: imp('LightProbeGenerator', 'lights/LightProbeGenerator.js'),
  desc: '<p>從環境資料產生 <a href="#/api-lightprobe">LightProbe</a>（計算球諧係數）。範例見 LightProbe。</p>',
  statics: [
    ['.fromCubeTexture( cubeTexture : CubeTexture ) : LightProbe', '從立方體貼圖（6 張影像）產生。'],
    ['.fromCubeRenderTarget( renderer, cubeRenderTarget ) : Promise&lt;LightProbe&gt;', '從 CubeCamera 的渲染結果產生，可做動態環境光。'],
  ],
},
{
  id: 'api-sky', title: 'Sky', api: true, inherits: ['EventDispatcher', 'Object3D', 'Mesh'], src: 'examples/jsm/objects/Sky.js',
  module: imp('Sky', 'objects/Sky.js'),
  desc: '<p>以物理大氣散射模型（Preetham）繪製的天空盒，可依太陽位置呈現白天、黃昏、日落的天色。通常搭配 <code>toneMapping</code> 與一個與太陽同方向的 DirectionalLight。</p>',
  ctor: { sig: 'new Sky()' },
  examples: [{ title: '一天中的天色變化', code: code`
import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const { scene, renderer } = createStage({ lights: false, cameraPosition: [0, 1, 6], target: [0, 2, 0], far: 2000000 });
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.5;
const sky = new Sky();
sky.scale.setScalar(450000);
scene.add(sky);
const sunLight = new THREE.DirectionalLight(0xffffff, 3);
scene.add(sunLight, new THREE.HemisphereLight(0xffffff, 0x444444, 0.5));
const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: 0x556b2f }));
ground.rotation.x = -Math.PI / 2;
scene.add(ground);
scene.add(Object.assign(new THREE.Mesh(new THREE.TorusKnotGeometry(0.8, 0.3, 128, 16), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })), { position: new THREE.Vector3(0, 1.5, 0) }));

const u = sky.material.uniforms;
const p = { turbidity: 10, rayleigh: 3, mieCoefficient: 0.005, mieDirectionalG: 0.7, elevation: 2, azimuth: 180 };
const sun = new THREE.Vector3();
function update() {
  u.turbidity.value = p.turbidity; u.rayleigh.value = p.rayleigh;
  u.mieCoefficient.value = p.mieCoefficient; u.mieDirectionalG.value = p.mieDirectionalG;
  sun.setFromSphericalCoords(1, THREE.MathUtils.degToRad(90 - p.elevation), THREE.MathUtils.degToRad(p.azimuth));
  u.sunPosition.value.copy(sun);
  sunLight.position.copy(sun).multiplyScalar(10);
  sunLight.intensity = Math.max(0, p.elevation) / 10 + 0.2;
}
update();
const gui = new GUI();
gui.add(p, 'elevation', -5, 90, 0.1).name('太陽仰角').onChange(update);
gui.add(p, 'azimuth', -180, 180, 0.1).name('太陽方位').onChange(update);
gui.add(p, 'turbidity', 0, 20, 0.1).onChange(update);
gui.add(p, 'rayleigh', 0, 4, 0.001).onChange(update);
gui.add(p, 'mieCoefficient', 0, 0.1, 0.001).onChange(update);
gui.add(p, 'mieDirectionalG', 0, 1, 0.001).onChange(update);
gui.add(renderer, 'toneMappingExposure', 0, 1, 0.0001).name('曝光');
` }],
  props: [['.material.uniforms', '<code>turbidity</code>（混濁度）、<code>rayleigh</code>（瑞利散射）、<code>mieCoefficient</code> / <code>mieDirectionalG</code>（米氏散射）、<code>sunPosition</code>（太陽方向）、<code>up</code>。']],
  statics: [['SkyShader : Object', '天空著色器定義。']],
},
{
  id: 'api-lensflare', title: 'Lensflare', api: true, inherits: ['EventDispatcher', 'Object3D', 'Mesh'], src: 'examples/jsm/objects/Lensflare.js',
  module: imp('Lensflare, LensflareElement', 'objects/Lensflare.js'),
  desc: '<p>鏡頭光暈效果：加到光源上，當光源在畫面中且未被遮擋時，沿著「光源 → 畫面中心」的直線繪製多個光斑（LensflareElement）。</p>',
  ctor: { sig: 'new Lensflare()' },
  examples: [{ title: '太陽的鏡頭光暈', desc: '拖曳視角讓光源進出畫面，或被方塊擋住時光暈會消失。', code: code`
import * as THREE from 'three';
import { Lensflare, LensflareElement } from 'three/addons/objects/Lensflare.js';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 0, 10], background: 0x05060a });
const tl = new THREE.TextureLoader().setPath('https://threejs.org/examples/textures/lensflare/');
const tex0 = tl.load('lensflare0.png'), tex3 = tl.load('lensflare3.png');
const light = new THREE.PointLight(0xffffff, 50, 0, 1);
light.position.set(0, 0, -20);
const flare = new Lensflare();
flare.addElement(new LensflareElement(tex0, 600, 0, light.color));         // 主光斑
flare.addElement(new LensflareElement(tex3, 60, 0.6));
flare.addElement(new LensflareElement(tex3, 70, 0.7));
flare.addElement(new LensflareElement(tex3, 120, 0.9));
flare.addElement(new LensflareElement(tex3, 70, 1.0));
light.add(flare);
scene.add(light);
for (let i = 0; i < 25; i++) {
  const b = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0x455a64 }));
  b.position.set((Math.random() - 0.5) * 16, (Math.random() - 0.5) * 8, -Math.random() * 10);
  scene.add(b);
}
console.log('光斑數', flare.elements ? flare.elements.length : 5);
onFrame((t) => light.position.set(Math.sin(t * 0.3) * 8, Math.cos(t * 0.2) * 3, -20));
` }],
  methods: [['.addElement( element : LensflareElement ) : undefined', '加入光斑。'], ['.dispose() : undefined', '釋放。']],
  statics: [['LensflareElement( texture, size, distance, color )', '光斑：size 為像素大小、distance 為沿直線的位置（0 = 光源處，1 = 畫面中心的對稱點）。']],
},
]);

/* ================= 線條 ================= */
var LINE_EX = code`
import * as THREE from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const stage = createStage({ cameraPosition: [0, 0, 8], lights: false });
const { scene } = stage;

const positions = [], colors = [];
const curve = new THREE.CatmullRomCurve3(Array.from({ length: 12 }, (_, i) => new THREE.Vector3(Math.cos(i) * 3, Math.sin(i * 1.7) * 2, Math.sin(i) * 2)), true);
const c = new THREE.Color();
curve.getPoints(300).forEach((p, i) => { positions.push(p.x, p.y, p.z); c.setHSL(i / 300, 1, 0.5); colors.push(c.r, c.g, c.b); });

const geometry = new LineGeometry();
geometry.setPositions(positions);
geometry.setColors(colors);
const material = new LineMaterial({ linewidth: 6, vertexColors: true, dashed: false, dashSize: 0.3, gapSize: 0.15, worldUnits: false });
const line = new Line2(geometry, material);
line.computeLineDistances();
scene.add(line);
stage.onResize((w, h) => material.resolution.set(w, h));
material.resolution.set(innerWidth, innerHeight);

const gui = new GUI();
gui.add(material, 'linewidth', 1, 30, 0.5).name('linewidth（像素）');
gui.add(material, 'worldUnits').name('worldUnits（世界單位）').onChange((v) => (material.linewidth = v ? 0.1 : 6));
gui.add(material, 'dashed').onChange(() => (material.needsUpdate = true));
gui.add(material, 'dashSize', 0.05, 1, 0.01);
gui.add(material, 'gapSize', 0.05, 1, 0.01);
gui.add(material, 'alphaToCoverage');
console.log('Line2：粗線以實例化四邊形繪製｜線段數', geometry.instanceCount);
stage.onFrame((t) => { line.rotation.y = t * 0.2; });
`;
var LINE_MOD = 'three/addons/lines/';
add('附加：線條 Lines', [
{
  id: 'api-line2', title: 'Line2', api: true, inherits: ['EventDispatcher', 'Object3D', 'Mesh', 'LineSegments2'], src: 'examples/jsm/lines/Line2.js',
  module: imp('Line2', 'lines/Line2.js'),
  desc: '<p>可以設定<b>粗細</b>的連續線條。WebGL 原生線條（Line + LineBasicMaterial）的 linewidth 幾乎總是 1，Line2 則以實例化的四邊形繪製每段線，支援任意寬度、虛線、頂點顏色，以及以像素或世界單位指定寬度。需搭配 <a href="#/api-linegeometry">LineGeometry</a> 與 <a href="#/api-linematerial">LineMaterial</a>。</p>',
  ctor: { sig: 'new Line2( geometry : LineGeometry, material : LineMaterial )' },
  examples: [{ title: '粗線、漸層色與虛線', code: LINE_EX }],
  methods: [['.computeLineDistances() : this', '計算虛線需要的距離資料。']],
},
{
  id: 'api-linegeometry', title: 'LineGeometry', api: true, inherits: ['EventDispatcher', 'BufferGeometry', 'InstancedBufferGeometry', 'LineSegmentsGeometry'], src: 'examples/jsm/lines/LineGeometry.js',
  module: imp('LineGeometry', 'lines/LineGeometry.js'),
  desc: '<p><a href="#/api-line2">Line2</a> 使用的幾何體：以連續的點定義一條線（每兩個相鄰點組成一段）。範例見 Line2。</p>',
  ctor: { sig: 'new LineGeometry()' },
  methods: [['.setPositions( array : Array ) : this', '設定點座標 [x, y, z, …]。'], ['.setColors( array : Array ) : this', '設定每個點的顏色 [r, g, b, …]。'], ['.setFromPoints( points : Array ) : this', '由 Vector3 陣列設定。'], ['.fromLine( line : Line ) : this', '從一般 Line 轉換。']],
},
{
  id: 'api-linematerial', title: 'LineMaterial', api: true, inherits: ['EventDispatcher', 'Material', 'ShaderMaterial'], src: 'examples/jsm/lines/LineMaterial.js',
  module: imp('LineMaterial', 'lines/LineMaterial.js'),
  desc: '<p><a href="#/api-line2">Line2</a> / <a href="#/api-linesegments2">LineSegments2</a> 使用的材質。<code>resolution</code> 需設為畫布尺寸（像素寬度的計算依據）。範例見 Line2。</p>',
  ctor: { sig: 'new LineMaterial( parameters : Object )' },
  props: [
    ['.linewidth : Number', '線寬，預設 1（像素，或 worldUnits 時為世界單位）。'], ['.worldUnits : Boolean', '線寬是否以世界單位計算（會隨距離變細）。'], ['.color : Color', '顏色。'], ['.vertexColors : Boolean', '使用頂點顏色。'],
    ['.dashed : Boolean', '是否為虛線（需 computeLineDistances）。'], ['.dashSize / .gapSize / .dashScale / .dashOffset : Number', '虛線設定。'], ['.resolution : Vector2', '畫布尺寸（像素）。'], ['.alphaToCoverage : Boolean', 'MSAA 邊緣平滑。'],
  ],
},
{
  id: 'api-linesegments2', title: 'LineSegments2', api: true, inherits: ['EventDispatcher', 'Object3D', 'Mesh'], src: 'examples/jsm/lines/LineSegments2.js',
  module: imp('LineSegments2', 'lines/LineSegments2.js'),
  desc: '<p>粗線版本的 LineSegments：每兩個點組成一條獨立線段。搭配 <a href="#/api-linesegmentsgeometry">LineSegmentsGeometry</a> 與 LineMaterial。可用 <code>fromEdgesGeometry()</code> 做粗描邊。</p>',
  ctor: { sig: 'new LineSegments2( geometry : LineSegmentsGeometry, material : LineMaterial )' },
  examples: [{ title: '粗描邊', code: code`
import * as THREE from 'three';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { createStage } from 'doc-stage';
const stage = createStage({ cameraPosition: [3, 2, 4] });
const geo = new THREE.DodecahedronGeometry(1);
const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x5c6bc0, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }));
const edges = new LineSegments2(new LineSegmentsGeometry().fromEdgesGeometry(new THREE.EdgesGeometry(geo)), new LineMaterial({ color: 0xffffff, linewidth: 5 }));
edges.material.resolution.set(innerWidth, innerHeight);
mesh.add(edges);
stage.scene.add(mesh);
stage.onResize((w, h) => edges.material.resolution.set(w, h));
stage.onFrame((t) => mesh.rotation.set(t * 0.3, t * 0.5, 0));
console.log('描邊線段數', edges.geometry.instanceCount);
` }],
  methods: [['.computeLineDistances() : this', '計算虛線距離。']],
},
{
  id: 'api-linesegmentsgeometry', title: 'LineSegmentsGeometry', api: true, inherits: ['EventDispatcher', 'BufferGeometry', 'InstancedBufferGeometry'], src: 'examples/jsm/lines/LineSegmentsGeometry.js',
  module: imp('LineSegmentsGeometry', 'lines/LineSegmentsGeometry.js'),
  desc: '<p><a href="#/api-linesegments2">LineSegments2</a> 使用的幾何體：以實例化方式儲存線段（每個實例一段）。範例見 LineSegments2。</p>',
  ctor: { sig: 'new LineSegmentsGeometry()' },
  methods: [
    ['.setPositions( array ) / .setColors( array ) : this', '每 6 個數值一段線（起點 xyz + 終點 xyz）。'], ['.fromWireframeGeometry( geometry ) : this', '由 WireframeGeometry 建立。'],
    ['.fromEdgesGeometry( geometry ) : this', '由 EdgesGeometry 建立。'], ['.fromMesh( mesh ) : this', '由網格的線框建立。'], ['.fromLineSegments( lineSegments ) : this', '由一般 LineSegments 轉換。'], ['.applyMatrix4( m ) : this', '變換。'],
  ],
},
]);
})();
