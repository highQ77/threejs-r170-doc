/* API 參考：光源 Lights */
(function () {
var code = String.raw;
var LB = ['EventDispatcher', 'Object3D', 'Light'];

/* 光源範例共用的展示場景 */
var SHOWROOM = code`
// 展示用場景：地板 + 幾個物件（全部可投射 / 接收陰影）
const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.MeshStandardMaterial({ color: 0x9e9e9e }));
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);
const props = [
  new THREE.Mesh(new THREE.SphereGeometry(0.7, 48, 24), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })),
  new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 })),
  new THREE.Mesh(new THREE.TorusKnotGeometry(0.45, 0.16, 100, 16), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.3 })),
];
props.forEach((m, i) => { m.position.set((i - 1) * 2.4, 0.75, 0); m.castShadow = m.receiveShadow = true; scene.add(m); });
`;

window.DOCS.push({ group: '光源 Lights', section: 'api', items: [
{
  id: 'api-light', title: 'Light', api: true, inherits: ['EventDispatcher', 'Object3D'], src: 'lights/Light.js',
  desc: '<p>所有光源的抽象基底類別。光源也是 Object3D，可以加到其他物件底下跟著移動（例如手電筒跟著相機）。</p><p>注意：使用 Lambert、Phong、Standard、Physical、Toon 等材質時才需要光源；Basic、Normal、Matcap 不受光照影響。</p>',
  ctor: { sig: 'new Light( color : Color, intensity : Float )', params: [
    ['color', 'Color', '（選填）光的顏色，預設 0xffffff。'], ['intensity', 'Float', '（選填）強度，預設 1。'],
  ]},
  props: [
    ['.color : Color', '光的顏色。'],
    ['.intensity : Float', '強度。物理正確模式下，不同光源的單位不同（見各光源說明）。'],
    ['.isLight : Boolean', '型別檢查旗標。'],
  ],
  methods: [
    ['.dispose() : undefined', '釋放資源（例如陰影貼圖）。'],
    ['.copy( source : Light ) : this', '複製。'],
  ],
},
{
  id: 'api-ambientlight', title: 'AmbientLight', api: true, inherits: LB, src: 'lights/AmbientLight.js',
  desc: '<p>環境光：從所有方向均勻照亮所有物件，沒有方向性，因此<b>不會產生陰影與立體感</b>。通常以較低強度搭配其他光源，避免暗部全黑。</p>',
  ctor: { sig: 'new AmbientLight( color : Integer, intensity : Float )', params: [
    ['color', 'Integer', '（選填）顏色，預設 0xffffff。'], ['intensity', 'Float', '（選填）強度，預設 1。'],
  ]},
  examples: [{
    title: '只有環境光 vs. 加上平行光',
    desc: '只有環境光時，物件沒有明暗、看起來是平的。打開平行光就有立體感。',
    code: code`
import * as THREE from 'three';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const { scene } = createStage({ lights: false, cameraPosition: [0, 3, 7] });
` + SHOWROOM + code`
const ambient = new THREE.AmbientLight(0xffffff, 1);
const dir = new THREE.DirectionalLight(0xffffff, 2);
dir.position.set(3, 5, 2);
dir.visible = false;
scene.add(ambient, dir);

const gui = new GUI();
gui.add(ambient, 'intensity', 0, 3, 0.01).name('Ambient 強度');
gui.addColor({ c: '#ffffff' }, 'c').name('Ambient 顏色').onChange((v) => ambient.color.set(v));
gui.add(dir, 'visible').name('加上 DirectionalLight');
`
  }],
  props: [['.isAmbientLight : Boolean', '型別檢查旗標。']],
},
{
  id: 'api-hemispherelight', title: 'HemisphereLight', api: true, inherits: LB, src: 'lights/HemisphereLight.js',
  desc: '<p>半球光：位於場景正上方，從天空色漸變到地面色。朝上的面接收天空色、朝下的面接收地面色，是模擬戶外自然光的低成本方法。不會產生陰影。</p>',
  ctor: { sig: 'new HemisphereLight( skyColor : Integer, groundColor : Integer, intensity : Float )', params: [
    ['skyColor', 'Integer', '天空色，預設 0xffffff。'], ['groundColor', 'Integer', '地面色，預設 0xffffff。'], ['intensity', 'Float', '強度，預設 1。'],
  ]},
  examples: [{
    title: '天空色與地面色',
    code: code`
import * as THREE from 'three';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const { scene } = createStage({ lights: false, cameraPosition: [0, 1, 7], background: 0x202020 });
` + SHOWROOM + code`
floor.visible = false;
props.forEach((m) => (m.position.y = 0));
const hemi = new THREE.HemisphereLight(0x87ceeb, 0x8b4513, 2.5);
scene.add(hemi, new THREE.HemisphereLightHelper(hemi, 0.5));

const p = { sky: '#87ceeb', ground: '#8b4513' };
const gui = new GUI();
gui.addColor(p, 'sky').name('skyColor').onChange((v) => hemi.color.set(v));
gui.addColor(p, 'ground').name('groundColor').onChange((v) => hemi.groundColor.set(v));
gui.add(hemi, 'intensity', 0, 5, 0.01);
`
  }],
  props: [
    ['.color : Color', '天空色。'],
    ['.groundColor : Color', '地面色。'],
    ['.position : Vector3', '決定「上方」方向，預設 Object3D.DEFAULT_UP (0, 1, 0)。'],
  ],
},
{
  id: 'api-directionallight', title: 'DirectionalLight', api: true, inherits: LB, src: 'lights/DirectionalLight.js',
  desc: '<p>平行光：所有光線方向相同，像是無限遠處的太陽。光的方向是<b>從 position 指向 target.position</b>。可以投射陰影，陰影使用正交相機（<code>shadow.camera</code>）計算。</p><p>若要修改 target 的位置，target 必須加入場景（或手動 <code>target.updateMatrixWorld()</code>）。</p>',
  ctor: { sig: 'new DirectionalLight( color : Integer, intensity : Float )', params: [
    ['color', 'Integer', '（選填）顏色，預設 0xffffff。'], ['intensity', 'Float', '（選填）強度，預設 1。'],
  ]},
  examples: [{
    title: '光源方向、target 與陰影',
    desc: '黃色線為 DirectionalLightHelper；打開 CameraHelper 可看到陰影相機的範圍。',
    code: code`
import * as THREE from 'three';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ lights: false, shadows: true, cameraPosition: [6, 6, 9] });
` + SHOWROOM + code`
scene.add(new THREE.AmbientLight(0xffffff, 0.2));
const sun = new THREE.DirectionalLight(0xffffff, 3);
sun.position.set(4, 6, 3);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5 });
scene.add(sun, sun.target);           // target 也要加入場景
const helper = new THREE.DirectionalLightHelper(sun, 0.8, 0xffeb3b);
const camHelper = new THREE.CameraHelper(sun.shadow.camera);
camHelper.visible = false;
scene.add(helper, camHelper);

const p = { orbit: true, targetX: 0 };
const gui = new GUI();
gui.add(sun, 'intensity', 0, 6, 0.01);
gui.add(p, 'orbit').name('光源繞行');
gui.add(p, 'targetX', -3, 3, 0.01).name('target.position.x').onChange((v) => (sun.target.position.x = v));
gui.add(camHelper, 'visible').name('shadow CameraHelper');
gui.add(sun.shadow, 'bias', -0.01, 0.01, 0.0001);
gui.add(sun.shadow, 'normalBias', 0, 0.1, 0.001);

onFrame((t) => {
  if (p.orbit) sun.position.set(Math.cos(t * 0.5) * 5, 6, Math.sin(t * 0.5) * 5);
  helper.update();
  camHelper.update();
});
`
  }],
  props: [
    ['.target : Object3D', '光照射的目標，預設位於 (0, 0, 0)。也可以設成場景中的任意物件，讓光跟著它。'],
    ['.castShadow : Boolean', '是否投射陰影（需 renderer.shadowMap.enabled），預設 false。'],
    ['.shadow : DirectionalLightShadow', '陰影設定，見 <a href="#/api-lightshadow">LightShadow</a>。陰影相機為 OrthographicCamera，預設範圍 -5 ~ 5。'],
    ['.position : Vector3', '光源位置，預設 Object3D.DEFAULT_UP (0, 1, 0)。'],
  ],
  methods: [
    ['.dispose() : undefined', '釋放陰影貼圖等資源。'],
    ['.copy( source ) : this', '複製（包含 target）。'],
  ],
},
{
  id: 'api-pointlight', title: 'PointLight', api: true, inherits: LB, src: 'lights/PointLight.js',
  desc: '<p>點光源：從一個點向所有方向發光，例如燈泡。強度單位為燭光（cd），亮度隨距離以 <code>decay</code> 衰減。投射陰影時使用 6 個方向的透視相機（立方體陰影貼圖），成本較高。</p>',
  ctor: { sig: 'new PointLight( color : Integer, intensity : Float, distance : Number, decay : Float )', params: [
    ['color', 'Integer', '（選填）顏色，預設 0xffffff。'],
    ['intensity', 'Float', '（選填）強度（燭光），預設 1。'],
    ['distance', 'Number', '最大照射距離，0（預設）表示無限遠。'],
    ['decay', 'Float', '衰減指數，預設 2（物理正確的平方反比）。'],
  ]},
  examples: [{
    title: '移動的燈泡與衰減',
    code: code`
import * as THREE from 'three';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ lights: false, shadows: true, cameraPosition: [0, 5, 9] });
` + SHOWROOM + code`
scene.add(new THREE.AmbientLight(0xffffff, 0.05));
const bulb = new THREE.PointLight(0xffaa55, 20, 0, 2);
bulb.castShadow = true;
// 一顆會發光的小球代表燈泡（PointLight 本身不可見）
bulb.add(new THREE.Mesh(new THREE.SphereGeometry(0.08), new THREE.MeshBasicMaterial({ color: 0xffaa55 })));
scene.add(bulb);

const gui = new GUI();
gui.add(bulb, 'intensity', 0, 100, 0.1);
gui.add(bulb, 'distance', 0, 15, 0.1);
gui.add(bulb, 'decay', 0, 4, 0.01);
gui.addColor({ c: '#ffaa55' }, 'c').name('color').onChange((v) => { bulb.color.set(v); bulb.children[0].material.color.set(v); });
onFrame((t) => bulb.position.set(Math.sin(t * 0.7) * 3.5, 1.6 + Math.sin(t * 1.3) * 0.6, Math.cos(t * 0.5) * 1.8));
`
  }],
  props: [
    ['.intensity : Float', '強度（燭光）。'],
    ['.power : Float', '以流明（lm）表示的功率，與 intensity 互相換算（power = intensity × 4π）。'],
    ['.distance : Float', '照射距離，0 為無限。'],
    ['.decay : Float', '衰減指數，預設 2。'],
    ['.castShadow : Boolean', '是否投射陰影。'],
    ['.shadow : PointLightShadow', '陰影設定。陰影相機為 90° 的透視相機。'],
  ],
  methods: [['.dispose() : undefined', '釋放資源。'], ['.copy( source ) : this', '複製。']],
},
{
  id: 'api-spotlight', title: 'SpotLight', api: true, inherits: LB, src: 'lights/SpotLight.js',
  desc: '<p>聚光燈：從一個點朝一個方向發出圓錐形光束，例如舞台燈、手電筒。方向由 <code>target</code> 決定。可以用 <code>map</code> 投射圖案（Gobo）。</p>',
  ctor: { sig: 'new SpotLight( color : Integer, intensity : Float, distance : Float, angle : Radians, penumbra : Float, decay : Float )', params: [
    ['color', 'Integer', '顏色，預設 0xffffff。'],
    ['intensity', 'Float', '強度（燭光），預設 1。'],
    ['distance', 'Float', '最大距離，0 為無限。'],
    ['angle', 'Radians', '光錐半角，最大 π/2，預設 π/3。'],
    ['penumbra', 'Float', '邊緣柔化程度 0–1，預設 0。'],
    ['decay', 'Float', '衰減，預設 2。'],
  ]},
  examples: [{
    title: '聚光燈參數與圖案投射',
    desc: '開啟 map 會透過 Canvas 貼圖投射出條紋圖案（需要 castShadow）。',
    code: code`
import * as THREE from 'three';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ lights: false, shadows: true, cameraPosition: [5, 6, 9], background: 0x0c0c0c });
` + SHOWROOM + code`
scene.add(new THREE.AmbientLight(0xffffff, 0.03));
const spot = new THREE.SpotLight(0xffffff, 120, 0, Math.PI / 7, 0.3, 2);
spot.position.set(0, 7, 2);
spot.castShadow = true;
spot.shadow.mapSize.set(1024, 1024);
scene.add(spot, spot.target);
const helper = new THREE.SpotLightHelper(spot);
scene.add(helper);

// 投射圖案用的貼圖
const c = document.createElement('canvas'); c.width = c.height = 128;
const ctx = c.getContext('2d');
for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? '#ff4081' : '#40c4ff'; ctx.fillRect(i * 16, 0, 16, 128); }
const gobo = new THREE.CanvasTexture(c);
gobo.colorSpace = THREE.SRGBColorSpace;

const p = { follow: true, map: false };
const gui = new GUI();
gui.add(spot, 'intensity', 0, 400, 1);
gui.add(spot, 'angle', 0.05, Math.PI / 2, 0.01);
gui.add(spot, 'penumbra', 0, 1, 0.01);
gui.add(spot, 'decay', 0, 3, 0.01);
gui.add(p, 'follow').name('target 追蹤物件');
gui.add(p, 'map').name('map 投射圖案').onChange((v) => (spot.map = v ? gobo : null));

onFrame((t) => {
  if (p.follow) spot.target.position.set(Math.sin(t * 0.8) * 2.4, 0, 0);
  helper.update();
});
`
  }],
  props: [
    ['.target : Object3D', '照射目標，需加入場景才能移動。'],
    ['.angle : Float', '光錐半角（弧度）。'],
    ['.penumbra : Float', '邊緣柔化 0–1。'],
    ['.distance : Float', '照射距離。'],
    ['.decay : Float', '衰減指數。'],
    ['.power : Float', '功率（流明），power = intensity × π。'],
    ['.map : Texture', '投射的圖案貼圖（需 castShadow 為 true）。'],
    ['.castShadow : Boolean', '是否投射陰影。'],
    ['.shadow : SpotLightShadow', '陰影設定，陰影相機為透視相機，其 fov 依 angle 自動設定；<code>shadow.focus</code>（0–1）可縮小陰影相機以提升精度。'],
  ],
  methods: [['.dispose() : undefined', '釋放資源。'], ['.copy( source ) : this', '複製。']],
},
{
  id: 'api-rectarealight', title: 'RectAreaLight', api: true, inherits: LB, src: 'lights/RectAreaLight.js',
  desc: '<p>矩形面光源：從一個矩形平面均勻發光，例如明亮的窗戶、柔光箱、LED 面板。限制：只支援 MeshStandardMaterial 與 MeshPhysicalMaterial、不支援陰影，且必須先呼叫 <code>RectAreaLightUniformsLib.init()</code>。</p>',
  ctor: { sig: 'new RectAreaLight( color : Color, intensity : Float, width : Float, height : Float )', params: [
    ['color', 'Color', '顏色。'], ['intensity', 'Float', '強度（nits），預設 1。'], ['width', 'Float', '寬度，預設 10。'], ['height', 'Float', '高度，預設 10。'],
  ]},
  examples: [{
    title: '三色面光源',
    code: code`
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ lights: false, cameraPosition: [0, 4, 10], target: [0, 1.5, 0], background: 0x000000 });
RectAreaLightUniformsLib.init();   // 必須先初始化

const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.1, metalness: 0 }));
floor.rotation.x = -Math.PI / 2;
scene.add(floor);
const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(0.9, 0.3, 160, 24), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0, metalness: 0 }));
knot.position.y = 1.5;
scene.add(knot);

const lights = [0xff0000, 0x00ff00, 0x0000ff].map((col, i) => {
  const l = new THREE.RectAreaLight(col, 5, 2, 5);
  l.position.set((i - 1) * 3, 2.5, -4);
  l.lookAt((i - 1) * 3, 2.5, 0);
  l.add(new RectAreaLightHelper(l));
  scene.add(l);
  return l;
});
const gui = new GUI();
const p = { intensity: 5, width: 2, height: 5 };
gui.add(p, 'intensity', 0, 20, 0.1).onChange((v) => lights.forEach((l) => (l.intensity = v)));
gui.add(p, 'width', 0.5, 4, 0.01).onChange((v) => lights.forEach((l) => (l.width = v)));
gui.add(p, 'height', 0.5, 8, 0.01).onChange((v) => lights.forEach((l) => (l.height = v)));
onFrame((t) => { knot.rotation.y = t * 0.5; });
`
  }],
  props: [
    ['.width / .height : Float', '尺寸。'],
    ['.intensity : Float', '亮度（nits）。'],
    ['.power : Float', '功率（流明）。'],
  ],
},
{
  id: 'api-lightshadow', title: 'LightShadow', api: true, src: 'lights/LightShadow.js',
  desc: '<p>光源陰影的設定物件，可透過 <code>light.shadow</code> 存取。子類別：<code>DirectionalLightShadow</code>（正交相機）、<code>SpotLightShadow</code>（透視相機）、<code>PointLightShadow</code>（立方體貼圖）。</p><p>開啟陰影的三個步驟：<code>renderer.shadowMap.enabled = true</code>、<code>light.castShadow = true</code>、物件設定 <code>castShadow</code> / <code>receiveShadow</code>。</p>',
  ctor: { sig: 'new LightShadow( camera : Camera )', desc: '通常不需要自行建立。' },
  examples: [{
    title: 'mapSize、radius 與 shadowMap.type',
    desc: '比較不同陰影貼圖類型與解析度；PCFShadowMap 下 radius 可以模糊陰影邊緣。',
    code: code`
import * as THREE from 'three';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const { scene, renderer, onFrame } = createStage({ lights: false, shadows: true, cameraPosition: [3, 4, 6] });
` + SHOWROOM + code`
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.6));
const sun = new THREE.DirectionalLight(0xffffff, 2.5);
sun.position.set(3, 6, 2);
sun.castShadow = true;
Object.assign(sun.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 0.5, far: 20 });
scene.add(sun);

const types = { Basic: THREE.BasicShadowMap, PCF: THREE.PCFShadowMap, PCFSoft: THREE.PCFSoftShadowMap, VSM: THREE.VSMShadowMap };
const p = { type: 'PCF', mapSize: 512 };
renderer.shadowMap.type = THREE.PCFShadowMap;
sun.shadow.mapSize.set(512, 512);
function resetMap() { if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; } }

const gui = new GUI();
gui.add(p, 'type', Object.keys(types)).name('shadowMap.type').onChange((v) => {
  renderer.shadowMap.type = types[v];
  resetMap();
  scene.traverse((o) => { if (o.material) o.material.needsUpdate = true; });
});
gui.add(p, 'mapSize', [128, 256, 512, 1024, 2048]).onChange((v) => { sun.shadow.mapSize.set(v, v); resetMap(); });
gui.add(sun.shadow, 'radius', 0, 10, 0.1);
gui.add(sun.shadow, 'blurSamples', 1, 25, 1).name('blurSamples（VSM）');
gui.add(sun.shadow, 'bias', -0.005, 0.005, 0.0001);
gui.add(sun.shadow, 'intensity', 0, 1, 0.01).name('intensity（陰影濃度）');
onFrame((t) => { sun.position.x = Math.sin(t * 0.4) * 4; });
`
  }],
  props: [
    ['.camera : Camera', '用於產生陰影貼圖的相機。調整其範圍（正交的 left/right/top/bottom 或 near/far）能大幅影響品質。'],
    ['.mapSize : Vector2', '陰影貼圖解析度，預設 (512, 512)。'],
    ['.map : WebGLRenderTarget', '陰影貼圖（內部使用）。修改 mapSize 後可 dispose 並設為 null 讓它重建。'],
    ['.bias : Float', '深度偏移，用於消除陰影痤瘡（表面條紋）。常見值 -0.0001 ~ -0.001。'],
    ['.normalBias : Float', '沿法線方向的偏移，對曲面上的痤瘡更有效。'],
    ['.radius : Float', '模糊半徑（PCFShadowMap 與 VSMShadowMap 有效）。'],
    ['.blurSamples : Integer', 'VSM 的模糊取樣數。'],
    ['.intensity : Float', '陰影濃度 0–1，預設 1（r163+）。'],
    ['.autoUpdate : Boolean', '是否每幀更新陰影，預設 true。靜態場景可設為 false 並在需要時設 needsUpdate。'],
    ['.needsUpdate : Boolean', '設為 true 會在下一幀更新陰影。'],
  ],
  methods: [
    ['.getFrustum() : Frustum', '取得陰影相機的視錐。'],
    ['.updateMatrices( light : Light ) : undefined', '更新陰影相機與矩陣（內部使用）。'],
    ['.dispose() : undefined', '釋放陰影貼圖。'],
  ],
},
]});
})();
