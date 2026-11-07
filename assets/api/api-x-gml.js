/* API 參考（補充）：多面體、材質、光源與陰影 */
(function () {
var code = String.raw;
function add(name, items) {
  var g = window.DOCS.find(function (x) { return x.group === name; });
  if (!g) { g = { group: name, section: 'api', items: [] }; window.DOCS.push(g); }
  g.items.push.apply(g.items, items);
}
var BG = ['EventDispatcher', 'BufferGeometry'];

/* ================= 多面體 ================= */
function poly(name, faces, color) {
  return {
    id: 'api-' + name.toLowerCase(), title: name, api: true, inherits: BG.concat('PolyhedronGeometry'), src: 'geometries/' + name + '.js',
    desc: '<p>正' + faces + '面體。<code>detail</code> 大於 0 時會細分每個面並把頂點推到球面上，逐漸接近球體。同族類別與比較範例見 <a href="#/api-icosahedrongeometry">IcosahedronGeometry</a>。</p>',
    ctor: { sig: 'new ' + name + '( radius : Float, detail : Integer )', params: [['radius', 'Float', '半徑，預設 1。'], ['detail', 'Integer', '細分程度，預設 0。']] },
    examples: [{ title: name + ' 與 detail', code: code`
import * as THREE from 'three';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 1, 4] });
const p = { radius: 1, detail: 0 };
const mesh = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial({ color: COLOR, flatShading: true }));
const wire = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 }));
mesh.add(wire);
scene.add(mesh);
function rebuild() {
  mesh.geometry.dispose(); wire.geometry.dispose();
  mesh.geometry = new THREE.NAME(p.radius, p.detail);
  wire.geometry = new THREE.EdgesGeometry(mesh.geometry);
  console.log('detail', p.detail, '→ 三角形數', mesh.geometry.attributes.position.count / 3);
}
rebuild();
const gui = new GUI();
gui.add(p, 'radius', 0.2, 2, 0.01).onChange(rebuild);
gui.add(p, 'detail', 0, 5, 1).onFinishChange(rebuild);
onFrame((t) => mesh.rotation.set(t * 0.3, t * 0.5, 0));
`.replace('NAME', name).replace('COLOR', color) }],
    props: [['.parameters : Object', '建構參數。']],
  };
}
add('幾何體 Geometries', [
  poly('TetrahedronGeometry', '四', '0xef5350'),
  poly('OctahedronGeometry', '八', '0x66bb6a'),
  poly('DodecahedronGeometry', '十二', '0x42a5f5'),
  {
    id: 'api-polyhedrongeometry', title: 'PolyhedronGeometry', api: true, inherits: BG, src: 'geometries/PolyhedronGeometry.js',
    desc: '<p>由一組頂點與三角形索引定義的凸多面體，頂點會被投影到球面上，可再依 detail 細分。Tetrahedron、Octahedron、Dodecahedron、Icosahedron 都是它的子類別；也可以用它建立自訂的多面體。</p>',
    ctor: { sig: 'new PolyhedronGeometry( vertices : Array, indices : Array, radius : Float, detail : Integer )', params: [
      ['vertices', 'Array', '頂點座標陣列 [x, y, z, …]。'], ['indices', 'Array', '三角形索引陣列。'], ['radius', 'Float', '半徑，預設 1。'], ['detail', 'Integer', '細分程度，預設 0。'],
    ]},
    examples: [{ title: '自訂多面體：三角雙錐', code: code`
import * as THREE from 'three';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 1, 4] });

// 三角雙錐：上下兩個頂點 + 中間三個頂點
const vertices = [0, 1, 0,  0, -1, 0,  1, 0, 0,  -0.5, 0, 0.87,  -0.5, 0, -0.87];
const indices = [0, 2, 4,  0, 4, 3,  0, 3, 2,  1, 4, 2,  1, 3, 4,  1, 2, 3];
const p = { detail: 0 };
const mesh = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshNormalMaterial({ flatShading: true }));
scene.add(mesh);
function rebuild() {
  mesh.geometry.dispose();
  mesh.geometry = new THREE.PolyhedronGeometry(vertices, indices, 1, p.detail);
}
rebuild();
new GUI().add(p, 'detail', 0, 4, 1).onChange(rebuild);
onFrame((t) => mesh.rotation.set(t * 0.3, t * 0.5, 0));
` }],
    props: [['.parameters : Object', '建構參數（vertices、indices、radius、detail）。']],
  },
]);

/* ================= 材質 ================= */
var MB = ['EventDispatcher', 'Material'];
add('材質 Materials', [
{
  id: 'api-shadowmaterial', title: 'ShadowMaterial', api: true, inherits: MB, src: 'materials/ShadowMaterial.js',
  desc: '<p>只接收陰影、其餘部分完全透明的材質。常用於「陰影接收面」：讓物件的影子投射在透明地面上，與網頁背景或 AR 畫面自然融合。</p>',
  ctor: { sig: 'new ShadowMaterial( parameters : Object )' },
  examples: [{ title: '透明地面上的陰影', desc: '背景是 CSS 漸層，地面本身看不見，只有陰影。', code: code`
import * as THREE from 'three';
import GUI from 'three/addons/libs/lil-gui.module.min.js';

document.body.style.background = 'linear-gradient(160deg, #fde68a, #f472b6 60%, #818cf8)';
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });   // 透明畫布
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 3, 7);
camera.lookAt(0, 0.5, 0);

scene.add(new THREE.HemisphereLight(0xffffff, 0x888888, 1.5));
const sun = new THREE.DirectionalLight(0xffffff, 2);
sun.position.set(3, 6, 2);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
scene.add(sun);

const shadowMat = new THREE.ShadowMaterial({ opacity: 0.35 });
const ground = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), shadowMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(0.6, 0.2, 128, 16), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 }));
knot.position.y = 1.3;
knot.castShadow = true;
scene.add(knot);

const gui = new GUI();
gui.add(shadowMat, 'opacity', 0, 1, 0.01);
gui.addColor({ c: '#000000' }, 'c').name('color').onChange((v) => shadowMat.color.set(v));
renderer.setAnimationLoop((t) => { knot.rotation.set(t / 2000, t / 1000, 0); renderer.render(scene, camera); });
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
` }],
  props: [['.color : Color', '陰影顏色，預設黑色。'], ['.transparent : Boolean', '預設 true。'], ['.fog : Boolean', '是否受霧影響。']],
},
{
  id: 'api-meshdistancematerial', title: 'MeshDistanceMaterial', api: true, inherits: MB, src: 'materials/MeshDistanceMaterial.js',
  desc: '<p>內部用於產生 <a href="#/api-pointlight">PointLight</a> 陰影（立方體陰影貼圖）的材質，寫入的是像素到光源的距離。可以透過 <code>mesh.customDistanceMaterial</code> 覆寫，例如讓鏤空貼圖（alphaMap / alphaTest）在點光源下也能投射正確的鏤空陰影。</p><p>（平行光與聚光燈的陰影則使用 <a href="#/api-meshdepthmaterial">MeshDepthMaterial</a>，可用 <code>customDepthMaterial</code> 覆寫。）</p>',
  ctor: { sig: 'new MeshDistanceMaterial( parameters : Object )' },
  examples: [{ title: '點光源下的鏤空陰影', desc: '平面使用 alphaTest 鏤空成格狀。左邊有設定 customDistanceMaterial，陰影也是鏤空的；右邊沒有，陰影是實心方塊。', code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ lights: false, shadows: true, cameraPosition: [0, 5, 8] });

const c = document.createElement('canvas'); c.width = c.height = 64;
const ctx = c.getContext('2d');
ctx.fillStyle = '#fff';
for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) ctx.fillRect(x * 16 + 3, y * 16 + 3, 10, 10);
const alpha = new THREE.CanvasTexture(c);

const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.MeshStandardMaterial({ color: 0x9e9e9e }));
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor, new THREE.AmbientLight(0xffffff, 0.15));
const bulb = new THREE.PointLight(0xffffff, 40);
bulb.position.set(0, 4, 0);
bulb.castShadow = true;
bulb.shadow.mapSize.set(1024, 1024);
scene.add(bulb);

[-1.5, 1.5].forEach((x, i) => {
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshStandardMaterial({ color: 0xff7043, alphaMap: alpha, alphaTest: 0.5, side: THREE.DoubleSide }));
  plate.rotation.x = -Math.PI / 2;
  plate.position.set(x, 2, 0);
  plate.castShadow = true;
  if (i === 0) plate.customDistanceMaterial = new THREE.MeshDistanceMaterial({ alphaMap: alpha, alphaTest: 0.5 });
  scene.add(plate);
});
console.log('左：有 customDistanceMaterial｜右：沒有');
onFrame((t) => { bulb.position.x = Math.sin(t) * 0.8; });
` }],
  props: [['.map / .alphaMap : Texture', '貼圖（alphaMap 配合 alphaTest 做鏤空）。'], ['.displacementMap / .displacementScale / .displacementBias', '位移貼圖（讓陰影跟著頂點位移）。']],
},
{
  id: 'api-rawshadermaterial', title: 'RawShaderMaterial', api: true, inherits: MB.concat('ShaderMaterial'), src: 'materials/RawShaderMaterial.js',
  desc: '<p>與 <a href="#/api-shadermaterial">ShaderMaterial</a> 相同，但 three.js <b>不會</b>自動注入任何 uniform、attribute、精度宣告或巨集。所有東西都要自己宣告，適合移植既有的 GLSL 程式碼或需要完全掌控著色器時。設定 <code>glslVersion: THREE.GLSL3</code> 可撰寫 GLSL ES 3.0（three.js 會加上 <code>#version 300 es</code>）。</p>',
  ctor: { sig: 'new RawShaderMaterial( parameters : Object )' },
  examples: [{ title: '完全自訂的 GLSL 3.0 著色器', code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 0, 4], lights: false });

const material = new THREE.RawShaderMaterial({
  glslVersion: THREE.GLSL3,
  uniforms: { uTime: { value: 0 } },
  vertexShader: [
    'precision highp float;',
    'uniform mat4 modelViewMatrix;',     // 必須自行宣告
    'uniform mat4 projectionMatrix;',
    'uniform float uTime;',
    'in vec3 position;',
    'in vec3 normal;',
    'out vec3 vNormal;',
    'void main() {',
    '  vNormal = normal;',
    '  vec3 p = position + normal * 0.08 * sin(uTime * 3.0 + position.y * 8.0);',
    '  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);',
    '}',
  ].join('\n'),
  fragmentShader: [
    'precision highp float;',
    'in vec3 vNormal;',
    'out vec4 outColor;',
    'void main() { outColor = vec4(normalize(vNormal) * 0.5 + 0.5, 1.0); }',
  ].join('\n'),
});
const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 16), material);
scene.add(mesh);
console.log('isRawShaderMaterial =', material.isRawShaderMaterial);
onFrame((t) => { material.uniforms.uTime.value = t; mesh.rotation.y = t * 0.3; });
` }],
  props: [['.isRawShaderMaterial : Boolean', '型別檢查旗標。']],
},
]);

/* ================= 光源 ================= */
add('光源 Lights', [
{
  id: 'api-lightprobe', title: 'LightProbe', api: true, inherits: ['EventDispatcher', 'Object3D', 'Light'], src: 'lights/LightProbe.js',
  desc: '<p>光照探針：以 <a href="#/api-sphericalharmonics3">球諧函數（SphericalHarmonics3）</a> 儲存來自各方向的環境光照，是一種非常省效能的間接光照（環境光）近似。通常由附加模組 <a href="#/api-lightprobegenerator">LightProbeGenerator</a> 從環境貼圖或 CubeCamera 產生。</p>',
  ctor: { sig: 'new LightProbe( sh : SphericalHarmonics3, intensity : Float )' },
  examples: [{ title: '從立方體貼圖產生光照探針', desc: '用 6 張純色 canvas 組成環境，LightProbeGenerator 計算出球諧係數；白色球體的各面會染上對應方向的顏色。', code: code`
import * as THREE from 'three';
import { LightProbeGenerator } from 'three/addons/lights/LightProbeGenerator.js';
import { LightProbeHelper } from 'three/addons/helpers/LightProbeHelper.js';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const { scene } = createStage({ lights: false, cameraPosition: [0, 1, 5] });

const colors = ['#ff1744', '#00e5ff', '#ffffff', '#3e2723', '#76ff03', '#d500f9'];   // +X -X +Y -Y +Z -Z
const faces = colors.map((c) => { const cv = document.createElement('canvas'); cv.width = cv.height = 16; const x = cv.getContext('2d'); x.fillStyle = c; x.fillRect(0, 0, 16, 16); return cv; });
const cube = new THREE.CubeTexture(faces);
cube.colorSpace = THREE.SRGBColorSpace;
cube.needsUpdate = true;
scene.background = cube;

const probe = LightProbeGenerator.fromCubeTexture(cube);
probe.intensity = 1.5;
scene.add(probe);
const helper = new LightProbeHelper(probe, 0.4);   // 以球體顯示探針光照
helper.position.x = -1.5;
scene.add(helper);

const ball = new THREE.Mesh(new THREE.SphereGeometry(0.9, 64, 32), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 }));
ball.position.x = 1;
scene.add(ball);
console.log('球諧係數（9 組 RGB）：', probe.sh.coefficients.slice(0, 3));
new GUI().add(probe, 'intensity', 0, 4, 0.01);
` }],
  props: [['.sh : SphericalHarmonics3', '光照資料（9 組 RGB 係數）。'], ['.intensity : Float', '強度。']],
  methods: [['.fromJSON( json ) : this', '由 JSON 載入。'], ['.copy( source ) : this', '複製。']],
},
{
  id: 'api-directionallightshadow', title: 'DirectionalLightShadow', api: true, inherits: ['LightShadow'], src: 'lights/DirectionalLightShadow.js',
  desc: '<p>DirectionalLight 的陰影設定（<code>light.shadow</code>）。陰影相機為 <a href="#/api-orthographiccamera">OrthographicCamera</a>，預設範圍 left/bottom -5、right/top 5、near 0.5、far 500。縮小範圍讓它剛好包住需要陰影的區域，可大幅提升陰影解析度。屬性與方法見 <a href="#/api-lightshadow">LightShadow</a>，範例見 <a href="#/api-directionallight">DirectionalLight</a>。</p>',
  ctor: { sig: 'new DirectionalLightShadow()', desc: '由 DirectionalLight 自動建立。' },
  examples: [{ title: '陰影相機範圍', consoleOnly: true, code: code`
import * as THREE from 'three';
const light = new THREE.DirectionalLight();
const cam = light.shadow.camera;
console.log('陰影相機型別：', cam.type);
console.log('預設範圍', { left: cam.left, right: cam.right, top: cam.top, bottom: cam.bottom, near: cam.near, far: cam.far });
Object.assign(cam, { left: -2, right: 2, top: 2, bottom: -2 });
cam.updateProjectionMatrix();
console.log('縮小範圍後（同樣 mapSize 精度提高', (10 / 4) ** 2, '倍）');
` }],
  props: [['.camera : OrthographicCamera', '陰影相機。'], ['.isDirectionalLightShadow : Boolean', '型別檢查旗標。']],
},
{
  id: 'api-spotlightshadow', title: 'SpotLightShadow', api: true, inherits: ['LightShadow'], src: 'lights/SpotLightShadow.js',
  desc: '<p>SpotLight 的陰影設定。陰影相機為 <a href="#/api-perspectivecamera">PerspectiveCamera</a>，其 fov 會依 <code>light.angle</code> 自動計算，far 依 <code>light.distance</code>。屬性與方法見 <a href="#/api-lightshadow">LightShadow</a>，範例見 <a href="#/api-spotlight">SpotLight</a>。</p>',
  ctor: { sig: 'new SpotLightShadow()', desc: '由 SpotLight 自動建立。' },
  examples: [{ title: 'focus 與相機 fov', consoleOnly: true, code: code`
import * as THREE from 'three';
const spot = new THREE.SpotLight(0xffffff, 10, 20, Math.PI / 6);
spot.shadow.updateMatrices(spot);
console.log('angle 30° → 陰影相機 fov =', spot.shadow.camera.fov.toFixed(1), '｜far =', spot.shadow.camera.far);
spot.shadow.focus = 0.5;   // 只使用光錐中央 50% 的範圍
spot.shadow.updateMatrices(spot);
console.log('focus 0.5 → fov =', spot.shadow.camera.fov.toFixed(1));
` }],
  props: [['.camera : PerspectiveCamera', '陰影相機。'], ['.focus : Number', '0–1，縮小陰影相機的視野以集中解析度，預設 1。'], ['.isSpotLightShadow : Boolean', '型別檢查旗標。']],
},
{
  id: 'api-pointlightshadow', title: 'PointLightShadow', api: true, inherits: ['LightShadow'], src: 'lights/PointLightShadow.js',
  desc: '<p>PointLight 的陰影設定。點光源向四面八方發光，因此陰影需要渲染 6 個方向（立方體陰影貼圖），成本約為平行光陰影的 6 倍。陰影相機為 90° 的 PerspectiveCamera。範例見 <a href="#/api-pointlight">PointLight</a>。</p>',
  ctor: { sig: 'new PointLightShadow()', desc: '由 PointLight 自動建立。' },
  examples: [{ title: '陰影相機設定', consoleOnly: true, code: code`
import * as THREE from 'three';
const light = new THREE.PointLight(0xffffff, 10, 15);
const s = light.shadow;
console.log('陰影相機', s.camera.type, 'fov', s.camera.fov, '｜near', s.camera.near, 'far', s.camera.far);
console.log('預設 mapSize', s.mapSize, '（每個方向）');
console.log('isPointLightShadow =', s.isPointLightShadow);
` }],
  props: [['.camera : PerspectiveCamera', '陰影相機（fov 90°）。'], ['.isPointLightShadow : Boolean', '型別檢查旗標。']],
  methods: [['.updateMatrices( light, viewportIndex ) : undefined', '依立方體面索引更新陰影相機。']],
},
]);
})();
