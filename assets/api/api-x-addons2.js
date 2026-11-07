/* API 參考（補充）：附加模組 — 載入器、匯出器、數學、工具、渲染器、動畫、WebXR */
(function () {
var code = String.raw;
function add(name, items) {
  var g = window.DOCS.find(function (x) { return x.group === name; });
  if (!g) { g = { group: name, section: 'api', items: [] }; window.DOCS.push(g); }
  g.items.push.apply(g.items, items);
}
function imp(names, path) { return "import { " + names + " } from 'three/addons/" + path + "';"; }
var LD = ['Loader'];
var DEPRECATED = '<div class="note"><b>注意：</b>MMD 相關附加模組（MMDLoader、MMDAnimationHelper、MMDPhysics）在 r170 已標記為棄用，未來版本會移除，官方建議改用社群維護的 <a href="https://github.com/takahirox/three-mmd-loader" target="_blank" rel="noopener">three-mmd-loader</a>。因此這裡只提供程式碼說明，不提供可執行範例。</div>';

/* ================= 載入器 ================= */
add('附加：載入器 Loaders', [
{
  id: 'api-dracoloader', title: 'DRACOLoader', api: true, inherits: LD, src: 'examples/jsm/loaders/DRACOLoader.js',
  module: imp('DRACOLoader', 'loaders/DRACOLoader.js'),
  desc: '<p>解碼 Google Draco 壓縮的網格（.drc），通常網格大小可縮小 90% 以上。解碼器（WASM / JS）需透過 <code>setDecoderPath()</code> 指定位置，並在 Web Worker 中執行。最常見的用法是交給 GLTFLoader：<code>gltfLoader.setDRACOLoader(dracoLoader)</code>，即可載入 Draco 壓縮的 glTF。</p>',
  ctor: { sig: 'new DRACOLoader( manager : LoadingManager )' },
  examples: [{ title: '載入 .drc 檔', code: code`
import * as THREE from 'three';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 0.15, 0.35], target: [0, 0.1, 0], near: 0.01 });
const draco = new DRACOLoader();
draco.setDecoderPath('https://unpkg.com/three@0.170.0/examples/jsm/libs/draco/gltf/');
draco.setDecoderConfig({ type: 'js' });   // 'wasm'（預設，較快）或 'js'
const t0 = performance.now();
const geometry = await draco.loadAsync('https://threejs.org/examples/models/draco/bunny.drc');
geometry.computeVertexNormals();
console.log('解碼耗時', (performance.now() - t0).toFixed(0), 'ms｜頂點數', geometry.attributes.position.count);
const bunny = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0xc8e6c9 }));
scene.add(bunny);
draco.dispose();   // 釋放 worker
onFrame((t) => { bunny.rotation.y = t * 0.5; });
` }],
  methods: [
    ['.setDecoderPath( path ) : this', '解碼器檔案所在目錄。'], ['.setDecoderConfig( config ) : this', '<code>{ type: "js" | "wasm" }</code>。'],
    ['.setWorkerLimit( n ) : this', '最大 worker 數，預設 4。'], ['.preload() : this', '預先載入解碼器。'], ['.load / .loadAsync / .parse', '載入，回傳 BufferGeometry。'], ['.dispose() : this', '終止 worker。'],
  ],
},
{
  id: 'api-ktx2loader', title: 'KTX2Loader', api: true, inherits: LD, src: 'examples/jsm/loaders/KTX2Loader.js',
  module: imp('KTX2Loader', 'loaders/KTX2Loader.js'),
  desc: '<p>載入 KTX2 容器格式的 GPU 壓縮貼圖（Basis Universal ETC1S / UASTC），並在執行時轉碼成目前裝置支援的格式（ASTC、BC7、ETC2、DXT…，都不支援時轉為未壓縮 RGBA）。這是 Web 上最推薦的壓縮貼圖方案。使用前必須 <code>setTranscoderPath()</code> 並 <code>detectSupport(renderer)</code>。</p>',
  ctor: { sig: 'new KTX2Loader( manager : LoadingManager )' },
  examples: [{ title: '載入 KTX2 貼圖', code: code`
import * as THREE from 'three';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { createStage } from 'doc-stage';
const { scene, renderer, onFrame } = createStage({ cameraPosition: [0, 0, 3], lights: false });
const ktx2 = new KTX2Loader()
  .setTranscoderPath('https://unpkg.com/three@0.170.0/examples/jsm/libs/basis/')
  .detectSupport(renderer);
const tex = await ktx2.loadAsync('https://raw.githubusercontent.com/mrdoob/three.js/r170/examples/textures/compressed/sample_uastc_zstd.ktx2');
console.log(tex.constructor.name, tex.image.width + 'x' + tex.image.height, '｜轉碼後 format =', tex.format, '｜mipmaps', tex.mipmaps.length);
const plane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
scene.add(plane);
onFrame((t) => { plane.rotation.y = Math.sin(t) * 0.4; });
` }],
  methods: [
    ['.setTranscoderPath( path ) : this', 'basis_transcoder.js / .wasm 所在目錄。'], ['.detectSupport( renderer ) : this', '偵測 GPU 支援的壓縮格式（必須呼叫）。'],
    ['.setWorkerLimit( n ) : this', 'worker 數量。'], ['.load / .loadAsync', '載入，回傳 CompressedTexture（或 DataTexture）。'], ['.dispose() : this', '終止 worker。'],
  ],
},
{
  id: 'api-fontloader', title: 'FontLoader', api: true, inherits: LD, src: 'examples/jsm/loaders/FontLoader.js',
  module: imp('FontLoader, Font', 'loaders/FontLoader.js'),
  desc: '<p>載入 typeface.json 格式的字型，回傳 <code>Font</code> 物件。Font 可以給 <a href="#/api-textgeometry">TextGeometry</a> 產生立體文字，也可以用 <code>font.generateShapes(text, size)</code> 取得平面 Shape。</p>',
  ctor: { sig: 'new FontLoader( manager : LoadingManager )' },
  examples: [{ title: '平面文字與輪廓線', code: code`
import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { createStage } from 'doc-stage';
const { scene } = createStage({ cameraPosition: [0, 0, 8], lights: false });
const font = await new FontLoader().loadAsync('https://unpkg.com/three@0.170.0/examples/fonts/helvetiker_regular.typeface.json');
console.log('字型名稱', font.data.familyName, '｜字元數', Object.keys(font.data.glyphs).length);
const shapes = font.generateShapes('three.js', 1);
const fill = new THREE.Mesh(new THREE.ShapeGeometry(shapes), new THREE.MeshBasicMaterial({ color: 0x29b6f6 }));
fill.geometry.center();
fill.position.y = 0.8;
scene.add(fill);
// 輪廓線
const outline = new THREE.Group();
shapes.forEach((s) => [s, ...s.holes].forEach((path) => {
  outline.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(path.getPoints()), new THREE.LineBasicMaterial({ color: 0xffca28 })));
}));
new THREE.Box3().setFromObject(outline).getCenter(outline.position).negate();
outline.position.y -= 0.8;
scene.add(outline);
` }],
  methods: [['.load / .loadAsync( url ) : Font', '載入。'], ['.parse( json ) : Font', '解析 JSON。']],
  statics: [['Font.generateShapes( text, size ) : Array', '（Font 的方法）產生文字的 Shape 陣列。']],
},
{
  id: 'api-objloader', title: 'OBJLoader', api: true, inherits: LD, src: 'examples/jsm/loaders/OBJLoader.js',
  module: imp('OBJLoader', 'loaders/OBJLoader.js'),
  desc: '<p>載入 Wavefront .obj 格式（純文字的網格格式，幾乎所有 3D 軟體都支援）。材質定義在另一個 .mtl 檔中，需搭配 <a href="#/api-mtlloader">MTLLoader</a> 並 <code>setMaterials()</code>。OBJ 不支援動畫與 PBR 材質，新專案建議改用 glTF。</p>',
  ctor: { sig: 'new OBJLoader( manager : LoadingManager )' },
  examples: [{ title: 'OBJ + MTL', code: code`
import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 100, 250], target: [0, 90, 0], far: 2000, grid: 400 });
const base = 'https://threejs.org/examples/models/obj/male02/';
const materials = await new MTLLoader().setPath(base).loadAsync('male02.mtl');
materials.preload();
const obj = await new OBJLoader().setMaterials(materials).setPath(base).loadAsync('male02.obj');
scene.add(obj);
let meshes = 0, verts = 0;
obj.traverse((o) => { if (o.isMesh) { meshes++; verts += o.geometry.attributes.position.count; } });
console.log('Mesh', meshes, '｜頂點', verts, '｜材質', Object.keys(materials.materials).join(', '));
onFrame((t) => { obj.rotation.y = t * 0.4; });
` }],
  methods: [['.load / .loadAsync( url ) : Group', '載入，回傳 Group。'], ['.parse( text ) : Group', '解析 OBJ 文字。'], ['.setMaterials( materialCreator ) : this', '套用 MTLLoader 的結果。']],
},
{
  id: 'api-mtlloader', title: 'MTLLoader', api: true, inherits: LD, src: 'examples/jsm/loaders/MTLLoader.js',
  module: imp('MTLLoader', 'loaders/MTLLoader.js'),
  desc: '<p>載入 Wavefront .mtl 材質檔，回傳 <code>MaterialCreator</code>，交給 <a href="#/api-objloader">OBJLoader.setMaterials()</a> 使用。產生的材質為 MeshPhongMaterial。範例見 OBJLoader。</p>',
  ctor: { sig: 'new MTLLoader( manager : LoadingManager )' },
  methods: [['.load / .loadAsync( url ) : MaterialCreator', '載入。'], ['.parse( text, path ) : MaterialCreator', '解析。'], ['.setMaterialOptions( options ) : this', '<code>{ side, wrap, normalizeRGB, ignoreZeroRGBs, invertTrProperty }</code>。']],
  statics: [['MaterialCreator.preload()', '預先建立所有材質。'], ['MaterialCreator.materials', '以名稱為鍵的材質表。']],
},
{
  id: 'api-pcdloader', title: 'PCDLoader', api: true, inherits: LD, src: 'examples/jsm/loaders/PCDLoader.js',
  module: imp('PCDLoader', 'loaders/PCDLoader.js'),
  desc: '<p>載入 Point Cloud Library 的 .pcd 點雲檔（ASCII、binary、binary_compressed），回傳 <a href="#/api-points">Points</a>，常用於 3D 掃描、光達（LiDAR）資料。</p>',
  ctor: { sig: 'new PCDLoader( manager : LoadingManager )' },
  examples: [{ title: '3D 掃描點雲', code: code`
import * as THREE from 'three';
import { PCDLoader } from 'three/addons/loaders/PCDLoader.js';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const { scene } = createStage({ cameraPosition: [0, 0, 0.5], near: 0.01, lights: false, background: 0x000000 });
const points = await new PCDLoader().loadAsync('https://threejs.org/examples/models/pcd/binary/Zaghetto.pcd');
points.geometry.center();
points.geometry.rotateX(Math.PI);
points.material.size = 0.002;
points.material.color.set(0x80deea);
scene.add(points);
console.log('點數', points.geometry.attributes.position.count, '｜attributes', Object.keys(points.geometry.attributes).join(', '));
const gui = new GUI();
gui.add(points.material, 'size', 0.0005, 0.01, 0.0001);
gui.addColor({ c: '#80deea' }, 'c').name('color').onChange((v) => points.material.color.set(v));
` }],
  props: [['.littleEndian : Boolean', '二進位資料的位元組順序，預設 true。']],
  methods: [['.load / .loadAsync( url ) : Points', '載入。'], ['.parse( data ) : Points', '解析 ArrayBuffer。']],
},
{
  id: 'api-pdbloader', title: 'PDBLoader', api: true, inherits: LD, src: 'examples/jsm/loaders/PDBLoader.js',
  module: imp('PDBLoader', 'loaders/PDBLoader.js'),
  desc: '<p>載入蛋白質資料庫（Protein Data Bank）.pdb 分子結構檔，回傳 <code>{ geometryAtoms, geometryBonds, json }</code>：原子位置與顏色、鍵結線段、以及原子元素資料。</p>',
  ctor: { sig: 'new PDBLoader( manager : LoadingManager )' },
  examples: [{ title: '咖啡因分子', code: code`
import * as THREE from 'three';
import { PDBLoader } from 'three/addons/loaders/PDBLoader.js';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 0, 18] });
const pdb = await new PDBLoader().loadAsync('https://threejs.org/examples/models/pdb/caffeine.pdb');
const { geometryAtoms, geometryBonds, json } = pdb;
geometryAtoms.computeBoundingBox();
const offset = geometryAtoms.boundingBox.getCenter(new THREE.Vector3()).negate();
const mol = new THREE.Group();
const pos = geometryAtoms.attributes.position, col = geometryAtoms.attributes.color;
const sphere = new THREE.IcosahedronGeometry(0.5, 3);
for (let i = 0; i < pos.count; i++) {
  const atom = new THREE.Mesh(sphere, new THREE.MeshStandardMaterial({ color: new THREE.Color().fromBufferAttribute(col, i) }));
  atom.position.fromBufferAttribute(pos, i).add(offset).multiplyScalar(1.4);
  mol.add(atom);
}
const bp = geometryBonds.attributes.position;
for (let i = 0; i < bp.count; i += 2) {
  const a = new THREE.Vector3().fromBufferAttribute(bp, i).add(offset).multiplyScalar(1.4);
  const b = new THREE.Vector3().fromBufferAttribute(bp, i + 1).add(offset).multiplyScalar(1.4);
  const bond = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, a.distanceTo(b), 8), new THREE.MeshStandardMaterial({ color: 0xbbbbbb }));
  bond.position.copy(a).lerp(b, 0.5);
  bond.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  mol.add(bond);
}
scene.add(mol);
const elements = {};
json.atoms.forEach((a) => (elements[a[4]] = (elements[a[4]] || 0) + 1));
console.log('原子', pos.count, '｜鍵結', bp.count / 2, '｜元素組成', elements);
onFrame((t) => mol.rotation.set(t * 0.2, t * 0.3, 0));
` }],
  methods: [['.load / .loadAsync( url ) : Object', '載入。'], ['.parse( text ) : Object', '解析 PDB 文字。']],
},
{
  id: 'api-svgloader', title: 'SVGLoader', api: true, inherits: LD, src: 'examples/jsm/loaders/SVGLoader.js',
  module: imp('SVGLoader', 'loaders/SVGLoader.js'),
  desc: '<p>載入 SVG 向量圖，回傳 <code>{ paths, xml }</code>，每個 path 是一個 <a href="#/api-shapepath">ShapePath</a>（含 fill / stroke 樣式於 <code>path.userData.style</code>）。用 <code>SVGLoader.createShapes(path)</code> 取得填色形狀，<code>SVGLoader.pointsToStroke()</code> 產生筆畫幾何體。可再用 ExtrudeGeometry 擠出成 3D Logo。</p>',
  ctor: { sig: 'new SVGLoader( manager : LoadingManager )' },
  examples: [{ title: '老虎 SVG', code: code`
import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { createStage } from 'doc-stage';
const { scene } = createStage({ cameraPosition: [0, 0, 600], far: 5000, lights: false, background: 0xb0bec5 });
const data = await new SVGLoader().loadAsync('https://threejs.org/examples/models/svg/tiger.svg');
const group = new THREE.Group();
group.scale.y = -1;   // SVG 的 Y 軸向下
let fills = 0;
data.paths.forEach((path) => {
  const style = path.userData.style;
  if (style.fill && style.fill !== 'none') {
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color().setStyle(style.fill), opacity: style.fillOpacity, transparent: true, side: THREE.DoubleSide, depthWrite: false });
    SVGLoader.createShapes(path).forEach((shape) => { group.add(new THREE.Mesh(new THREE.ShapeGeometry(shape), mat)); fills++; });
  }
  if (style.stroke && style.stroke !== 'none') {
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color().setStyle(style.stroke), side: THREE.DoubleSide, depthWrite: false });
    path.subPaths.forEach((sub) => {
      const geo = SVGLoader.pointsToStroke(sub.getPoints(), style);
      if (geo) group.add(new THREE.Mesh(geo, mat));
    });
  }
});
const box = new THREE.Box3().setFromObject(group);
group.position.sub(box.getCenter(new THREE.Vector3()));   // 置中
scene.add(group);
console.log('SVG paths', data.paths.length, '｜填色形狀', fills);
` }],
  methods: [['.load / .loadAsync( url ) : Object', '載入，回傳 { paths, xml }。'], ['.parse( text ) : Object', '解析 SVG 文字。']],
  statics: [['.createShapes( shapePath ) : Array', '由 ShapePath 產生 Shape（依 fill-rule 處理孔洞）。'], ['.pointsToStroke( points, style, arcDivisions, minDistance ) : BufferGeometry', '產生筆畫幾何體。'], ['.getStrokeStyle( width, color, lineJoin, lineCap, miterLimit ) : Object', '建立筆畫樣式。']],
},
{
  id: 'api-tgaloader', title: 'TGALoader', api: true, inherits: ['Loader', 'DataTextureLoader'], src: 'examples/jsm/loaders/TGALoader.js',
  module: imp('TGALoader', 'loaders/TGALoader.js'),
  desc: '<p>載入 Truevision .tga 影像（遊戲業常用的無損貼圖格式）為 DataTexture。</p>',
  ctor: { sig: 'new TGALoader( manager : LoadingManager )' },
  examples: [{ title: '灰階與彩色 TGA', code: code`
import * as THREE from 'three';
import { TGALoader } from 'three/addons/loaders/TGALoader.js';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 0.5, 4] });
const loader = new TGALoader().setPath('https://threejs.org/examples/textures/');
const boxes = [];
for (const [file, x] of [['crate_grey8.tga', -1], ['crate_color8.tga', 1]]) {
  const tex = await loader.loadAsync(file);
  tex.colorSpace = THREE.SRGBColorSpace;
  console.log(file, tex.image.width + 'x' + tex.image.height, tex.constructor.name);
  const b = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), new THREE.MeshStandardMaterial({ map: tex }));
  b.position.x = x;
  scene.add(b);
  boxes.push(b);
}
onFrame((t) => boxes.forEach((b) => b.rotation.set(t * 0.3, t * 0.5, 0)));
` }],
  methods: [['.load / .loadAsync( url ) : DataTexture', '載入。'], ['.parse( buffer ) : Object', '解析。']],
},
{
  id: 'api-lutcubeloader', title: 'LUTCubeLoader', api: true, inherits: LD, src: 'examples/jsm/loaders/LUTCubeLoader.js',
  module: imp('LUTCubeLoader', 'loaders/LUTCubeLoader.js'),
  desc: '<p>載入 .cube 格式的 3D 色彩查找表（LUT，常見於 Premiere、DaVinci Resolve 的調色預設），結果的 <code>texture3D</code>（Data3DTexture）可交給後期處理的 <code>LUTPass</code> 對整個畫面調色。</p>',
  ctor: { sig: 'new LUTCubeLoader( manager : LoadingManager )' },
  examples: [{ title: '電影調色 LUT', code: code`
import * as THREE from 'three';
import { LUTCubeLoader } from 'three/addons/loaders/LUTCubeLoader.js';
import { LUT3dlLoader } from 'three/addons/loaders/LUT3dlLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { LUTPass } from 'three/addons/postprocessing/LUTPass.js';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const stage = createStage({ cameraPosition: [0, 1, 6] });
const { scene, camera, renderer } = stage;
['#ef5350', '#66bb6a', '#42a5f5', '#ffee58', '#ab47bc'].forEach((c, i) => {
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.6, 48, 24), new THREE.MeshStandardMaterial({ color: c }));
  m.position.x = (i - 2) * 1.4;
  scene.add(m);
});
const base = 'https://threejs.org/examples/luts/';
const luts = {
  'Bourbon 64': (await new LUTCubeLoader().loadAsync(base + 'Bourbon%2064.CUBE')).texture3D,
  'Chemical 168': (await new LUTCubeLoader().loadAsync(base + 'Chemical%20168.CUBE')).texture3D,
  'Cinematic (.3dl)': (await new LUT3dlLoader().loadAsync(base + 'Presetpro-Cinematic.3dl')).texture3D,
};
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new OutputPass());
const lutPass = new LUTPass({ lut: luts['Bourbon 64'], intensity: 1 });
composer.addPass(lutPass);
stage.render = () => composer.render();
stage.onResize((w, h) => composer.setSize(w, h));
const p = { lut: 'Bourbon 64' };
const gui = new GUI();
gui.add(p, 'lut', Object.keys(luts)).onChange((v) => (lutPass.lut = luts[v]));
gui.add(lutPass, 'intensity', 0, 1, 0.01);
gui.add(lutPass, 'enabled');
console.log('LUT 尺寸', luts['Bourbon 64'].image.width + '³');
` }],
  methods: [['.load / .loadAsync( url ) : Object', '載入，回傳 <code>{ title, size, domainMin, domainMax, texture3D }</code>。'], ['.parse( text ) : Object', '解析。'], ['.setType( type ) : this', '貼圖資料型別：UnsignedByteType（預設）或 FloatType。']],
},
{
  id: 'api-lut3dlloader', title: 'LUT3dlLoader', api: true, inherits: LD, src: 'examples/jsm/loaders/LUT3dlLoader.js',
  module: imp('LUT3dlLoader', 'loaders/LUT3dlLoader.js'),
  desc: '<p>載入 .3dl 格式（Autodesk Lustre / Nuke）的 3D LUT。用法與 <a href="#/api-lutcubeloader">LUTCubeLoader</a> 相同（範例中也示範了 .3dl）。</p>',
  ctor: { sig: 'new LUT3dlLoader( manager : LoadingManager )' },
  methods: [['.load / .loadAsync( url ) : Object', '載入，回傳 <code>{ size, texture3D }</code>。'], ['.parse( text ) : Object', '解析。'], ['.setType( type ) : this', '資料型別。']],
},
{
  id: 'api-ldrawloader', title: 'LDrawLoader', api: true, inherits: LD, src: 'examples/jsm/loaders/LDrawLoader.js',
  module: imp('LDrawLoader', 'loaders/LDrawLoader.js'),
  desc: '<p>載入 LDraw 格式（.ldr、.mpd、.dat）的樂高積木模型。需要零件庫：可用 <code>setPartsLibraryPath()</code> 指向 LDraw 零件庫，或使用已打包所有零件的「packed」.mpd 檔（如範例）。LDraw 座標為 Y 軸向下，載入後需 <code>rotation.x = Math.PI</code>。</p>',
  ctor: { sig: 'new LDrawLoader( manager : LoadingManager )' },
  examples: [{ title: '樂高汽車', code: code`
import * as THREE from 'three';
import { LDrawLoader } from 'three/addons/loaders/LDrawLoader.js';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [3, 2.5, 4], far: 100 });
const loader = new LDrawLoader();
loader.smoothNormals = true;
const model = await loader.loadAsync('https://threejs.org/examples/models/ldraw/officialLibrary/models/car.ldr_Packed.mpd');
model.rotation.x = Math.PI;
model.scale.setScalar(0.01);
new THREE.Box3().setFromObject(model).getCenter(model.position).negate();
const holder = new THREE.Group();
holder.add(model);
scene.add(holder);
let parts = 0;
model.traverse((o) => { if (o.isMesh) parts++; });
console.log('Mesh 數', parts);
onFrame((t) => { holder.rotation.y = t * 0.4; });
` }],
  methods: [['.setPartsLibraryPath( path ) : this', '零件庫路徑。'], ['.preloadMaterials( url ) : Promise', '預先載入 LDConfig.ldr 色彩定義。'], ['.setMaterials( materials ) : this', '自訂材質。'], ['.load / .loadAsync / .parse', '載入，回傳 Group。']],
  props: [['.smoothNormals : Boolean', '是否平滑法線。'], ['.fileMap : Object', '零件檔名對照表。']],
},
{
  id: 'api-rhino3dmloader', title: 'Rhino3dmLoader', en: '3DMLoader', official: '3DMLoader', api: true, inherits: LD, src: 'examples/jsm/loaders/3DMLoader.js',
  module: imp('Rhino3dmLoader', 'loaders/3DMLoader.js'),
  desc: '<p>載入 Rhinoceros 3D 的 .3dm 檔案（NURBS、網格、點雲、曲線、文字、光源…）。需要 rhino3dm 函式庫（WASM），以 <code>setLibraryPath()</code> 指定。</p><pre class="code"><code>const loader = new Rhino3dmLoader();\nloader.setLibraryPath(\'https://cdn.jsdelivr.net/npm/rhino3dm@8.4.0/\');\nconst object = await loader.loadAsync(\'models/3dm/Rhino_Logo.3dm\');\nscene.add(object);\nconsole.log(object.userData.warnings);   // 無法轉換的物件類型</code></pre>',
  ctor: { sig: 'new Rhino3dmLoader( manager : LoadingManager )' },
  methods: [['.setLibraryPath( path ) : this', 'rhino3dm.js / .wasm 所在目錄。'], ['.setWorkerLimit( n ) : this', 'worker 數。'], ['.load / .loadAsync / .parse', '載入，回傳 Object3D（userData 中含 layers、warnings 等資訊）。'], ['.dispose() : this', '終止 worker。']],
},
{
  id: 'api-mmdloader', title: 'MMDLoader', api: true, inherits: LD, src: 'examples/jsm/loaders/MMDLoader.js',
  module: imp('MMDLoader', 'loaders/MMDLoader.js'),
  desc: '<p>載入 MikuMikuDance 的模型（.pmd、.pmx）、動作（.vmd）與相機動畫，建立 SkinnedMesh 與 AnimationClip。</p>' + DEPRECATED + '<pre class="code"><code>const loader = new MMDLoader();\nloader.loadWithAnimation(\'miku.pmd\', \'dance.vmd\', ({ mesh, animation }) =&gt; {\n  helper.add(mesh, { animation, physics: true });\n  scene.add(mesh);\n});</code></pre>',
  ctor: { sig: 'new MMDLoader( manager : LoadingManager )' },
  methods: [['.load( url, onLoad ) : undefined', '載入模型（SkinnedMesh）。'], ['.loadAnimation( url, object, onLoad )', '載入 .vmd 動作。'], ['.loadWithAnimation( modelUrl, vmdUrl, onLoad )', '同時載入模型與動作。'], ['.loadPMD / .loadPMX / .loadVMD / .loadVPD', '載入原始資料。']],
},
]);

/* ================= 匯出器 ================= */
var EXPORT_SCENE = code`
import * as THREE from 'three';
const scene = new THREE.Scene();
const box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0xff7043, name: 'orange' }));
box.name = 'box';
const ball = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 8), new THREE.MeshStandardMaterial({ color: 0x42a5f5, name: 'blue' }));
ball.name = 'ball';
ball.position.x = 2;
scene.add(box, ball);
`;
add('附加：匯出器 Exporters', [
{
  id: 'api-gltfexporter', title: 'GLTFExporter', api: true, src: 'examples/jsm/exporters/GLTFExporter.js',
  module: imp('GLTFExporter', 'exporters/GLTFExporter.js'),
  desc: '<p>把場景或物件匯出為 glTF 2.0（.gltf JSON 或 .glb 二進位），包含網格、材質、貼圖、動畫、相機、光源。常用於線上編輯器的「下載模型」功能。</p>',
  ctor: { sig: 'new GLTFExporter()' },
  examples: [{ title: '匯出並重新載入驗證', desc: '把場景匯出為 .glb，再用 GLTFLoader 解析回來顯示在右側。', code: code`
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 2, 7] });
const src = new THREE.Group();
const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(0.6, 0.2, 100, 16), new THREE.MeshStandardMaterial({ color: 0xff7043, roughness: 0.3 }));
knot.name = 'knot';
src.add(knot);
src.animations = [new THREE.AnimationClip('spin', 2, [new THREE.NumberKeyframeTrack('knot.rotation[y]', [0, 2], [0, Math.PI * 2])])];
src.position.x = -1.5;
scene.add(src);

const exporter = new GLTFExporter();
const glb = await exporter.parseAsync(src, { binary: true, animations: src.animations });
console.log('GLB 大小', glb.byteLength, 'bytes');
const json = await exporter.parseAsync(src, { binary: false, animations: src.animations });
console.log('glTF JSON：meshes', json.meshes.length, '｜materials', json.materials.length, '｜animations', json.animations.length);

const gltf = await new GLTFLoader().parseAsync(glb, '');
gltf.scene.position.x = 1.5;
scene.add(gltf.scene);
const mixer = new THREE.AnimationMixer(gltf.scene);
mixer.clipAction(gltf.animations[0]).play();
console.log('重新載入成功：', gltf.scene.getObjectByName('knot').type, '｜動畫', gltf.animations[0].name);
onFrame((t, dt) => { mixer.update(dt); knot.rotation.y = t * Math.PI; });

// 實際專案中下載檔案：
// const blob = new Blob([glb], { type: 'model/gltf-binary' });
// Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'scene.glb' }).click();
` }],
  methods: [['.parse( input, onDone, onError, options ) : undefined', '匯出（callback 版本）。'], ['.parseAsync( input, options ) : Promise', '匯出（Promise 版本）：binary 時為 ArrayBuffer，否則為 JSON 物件。'], ['.register( callback ) / .unregister( callback )', '註冊自訂擴充。']],
  props: [['options', '<code>{ binary, trs, onlyVisible, maxTextureSize, animations, includeCustomExtensions }</code>。']],
},
{
  id: 'api-objexporter', title: 'OBJExporter', api: true, src: 'examples/jsm/exporters/OBJExporter.js',
  module: imp('OBJExporter', 'exporters/OBJExporter.js'),
  desc: '<p>把物件匯出為 Wavefront .obj 文字格式（只包含幾何：頂點、法線、UV、面；不含材質細節）。</p>',
  ctor: { sig: 'new OBJExporter()' },
  examples: [{ title: '匯出 OBJ 文字', consoleOnly: true, code: EXPORT_SCENE + code`
import { OBJExporter } from 'three/addons/exporters/OBJExporter.js';
const text = new OBJExporter().parse(scene);
const lines = text.split('\n');
console.log('總行數', lines.length, '｜字元數', text.length);
console.log(lines.slice(0, 12).join('\n') + '\n…');
console.log('o（物件）行：', lines.filter((l) => l.startsWith('o ')).join(' | '));
` }],
  methods: [['.parse( object : Object3D ) : String', '匯出，回傳 OBJ 文字。']],
},
{
  id: 'api-stlexporter', title: 'STLExporter', api: true, src: 'examples/jsm/exporters/STLExporter.js',
  module: imp('STLExporter', 'exporters/STLExporter.js'),
  desc: '<p>匯出 .stl 格式（三角形網格，3D 列印的標準格式），支援 ASCII 與二進位。</p>',
  ctor: { sig: 'new STLExporter()' },
  examples: [{ title: 'ASCII 與 Binary STL', consoleOnly: true, code: code`
import * as THREE from 'three';
import { STLExporter } from 'three/addons/exporters/STLExporter.js';
const mesh = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10));
const exporter = new STLExporter();
const ascii = exporter.parse(mesh);
console.log('ASCII STL', ascii.length, '字元');
console.log(ascii.split('\n').slice(0, 9).join('\n') + '\n…');
const binary = exporter.parse(mesh, { binary: true });
console.log('Binary STL', binary.byteLength, 'bytes（80 位元組檔頭 + 4 位元組三角形數 + 每個三角形 50 位元組）');
console.log('三角形數 =', new DataView(binary.buffer).getUint32(80, true));
` }],
  methods: [['.parse( scene, options ) : String | DataView', '<code>options.binary</code> 為 true 時回傳 DataView。']],
},
{
  id: 'api-plyexporter', title: 'PLYExporter', api: true, src: 'examples/jsm/exporters/PLYExporter.js',
  module: imp('PLYExporter', 'exporters/PLYExporter.js'),
  desc: '<p>匯出 .ply（Polygon File Format），支援頂點顏色、法線、UV，常用於點雲與掃描資料。</p>',
  ctor: { sig: 'new PLYExporter()' },
  examples: [{ title: '含頂點顏色的 PLY', consoleOnly: true, code: code`
import * as THREE from 'three';
import { PLYExporter } from 'three/addons/exporters/PLYExporter.js';
const geo = new THREE.PlaneGeometry(1, 1);
geo.setAttribute('color', new THREE.Float32BufferAttribute([1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0], 3));
const mesh = new THREE.Mesh(geo);
new PLYExporter().parse(mesh, (text) => {
  console.log(text.split('\n').slice(0, 20).join('\n'));
}, { binary: false, excludeAttributes: ['uv'] });
` }],
  methods: [['.parse( object, onDone, options ) : Object', '<code>options</code>：<code>{ binary, excludeAttributes, littleEndian }</code>。']],
},
{
  id: 'api-exrexporter', title: 'EXRExporter', api: true, src: 'examples/jsm/exporters/EXRExporter.js',
  module: imp('EXRExporter', 'exporters/EXRExporter.js'),
  desc: '<p>把 HDR 資料（浮點 render target 或 DataTexture）匯出為 OpenEXR（.exr）檔，保留超過 1.0 的亮度資訊，例如匯出產生的環境貼圖。</p>',
  ctor: { sig: 'new EXRExporter()' },
  examples: [{ title: '匯出 HalfFloat DataTexture', consoleOnly: true, code: code`
import * as THREE from 'three';
import { EXRExporter, ZIP_COMPRESSION } from 'three/addons/exporters/EXRExporter.js';
const w = 16, h = 16;
const data = new Float32Array(w * h * 4);
for (let i = 0; i < w * h; i++) data.set([i / (w * h) * 4, 1, 0.5, 1], i * 4);   // 亮度超過 1.0
const tex = new THREE.DataTexture(data, w, h, THREE.RGBAFormat, THREE.FloatType);
tex.needsUpdate = true;
const exr = await new EXRExporter().parse(tex, { type: THREE.HalfFloatType, compression: ZIP_COMPRESSION });
console.log('EXR 大小', exr.byteLength, 'bytes｜magic number', new DataView(exr.buffer).getUint32(0, true).toString(16), '（應為 762f3101）');
` }],
  methods: [['.parse( renderer, renderTarget, options ) : Uint8Array', '匯出 render target。'], ['.parse( dataTexture, options ) : Uint8Array', '匯出 DataTexture。options：<code>{ type: HalfFloatType | FloatType, compression: NO_COMPRESSION | ZIP_COMPRESSION | ZIPS_COMPRESSION }</code>。']],
},
{
  id: 'api-dracoexporter', title: 'DRACOExporter', api: true, src: 'examples/jsm/exporters/DRACOExporter.js',
  module: imp('DRACOExporter', 'exporters/DRACOExporter.js'),
  desc: '<p>以 Google Draco 壓縮網格或點雲並匯出為 .drc。需要先載入 Draco 編碼器（<code>draco_encoder.js</code>，提供全域 <code>DracoEncoderModule</code>）。</p>',
  ctor: { sig: 'new DRACOExporter()' },
  examples: [{ title: '壓縮比較', consoleOnly: true, code: code`
import * as THREE from 'three';
import { DRACOExporter } from 'three/addons/exporters/DRACOExporter.js';
// 載入編碼器（非模組腳本，會建立全域 DracoEncoderModule）
await new Promise((resolve, reject) => {
  const s = document.createElement('script');
  s.src = 'https://unpkg.com/three@0.170.0/examples/jsm/libs/draco/draco_encoder.js';
  s.onload = resolve; s.onerror = reject;
  document.head.appendChild(s);
});
const mesh = new THREE.Mesh(new THREE.TorusKnotGeometry(1, 0.3, 200, 32));
const raw = Object.values(mesh.geometry.attributes).reduce((n, a) => n + a.array.byteLength, 0) + mesh.geometry.index.array.byteLength;
const drc = new DRACOExporter().parse(mesh, { decodeSpeed: 5, encodeSpeed: 5, quantization: [16, 8, 8, 8, 8] });
console.log('原始資料', raw, 'bytes → Draco', drc.byteLength, 'bytes｜壓縮為', (drc.byteLength / raw * 100).toFixed(1) + '%');
` }],
  methods: [['.parse( object : Mesh | Points, options ) : Int8Array', 'options：<code>{ decodeSpeed, encodeSpeed, encoderMethod, quantization, exportUvs, exportNormals, exportColor }</code>。']],
},
]);

/* ================= 渲染器 ================= */
add('附加：渲染器 Renderers', [
{
  id: 'api-css2drenderer', title: 'CSS2DRenderer', api: true, src: 'examples/jsm/renderers/CSS2DRenderer.js',
  module: imp('CSS2DRenderer, CSS2DObject', 'renderers/CSS2DRenderer.js'),
  desc: '<p>把 HTML 元素（<code>CSS2DObject</code>）依 3D 位置疊加在 WebGL 畫面上，元素永遠面向螢幕、大小固定。非常適合標籤、提示框、HUD。元素是真正的 DOM，可以使用 CSS、點擊、選取文字。需另外建立一個疊在 canvas 上方的 CSS2DRenderer，並在每幀以同一台相機渲染。</p>',
  ctor: { sig: 'new CSS2DRenderer( parameters : Object )', params: [['element', 'HTMLElement', '（選填）指定容器元素。']] },
  examples: [{ title: '行星標籤', code: code`
import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createStage } from 'doc-stage';
const stage = createStage({ controls: false, cameraPosition: [0, 6, 12], background: 0x05060a });
const { scene, camera } = stage;
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(innerWidth, innerHeight);
labelRenderer.domElement.style.cssText = 'position:absolute;top:0;left:0';
document.body.appendChild(labelRenderer.domElement);
new OrbitControls(camera, labelRenderer.domElement);   // 事件由最上層的 label 層接收

const planets = [['水星', 0.3, 2, 0xb0bec5], ['金星', 0.5, 3.2, 0xffcc80], ['地球', 0.55, 4.6, 0x4fc3f7], ['火星', 0.4, 6, 0xff7043]].map(([name, r, d, c], i) => {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 16), new THREE.MeshStandardMaterial({ color: c }));
  const div = document.createElement('div');
  div.textContent = name;
  div.style.cssText = 'color:#fff;font:13px sans-serif;padding:2px 8px;border-radius:99px;background:rgba(0,0,0,.6);border:1px solid rgba(255,255,255,.3)';
  const label = new CSS2DObject(div);
  label.position.set(0, r + 0.3, 0);
  label.center.set(0.5, 1);   // 錨點：底部中央
  m.add(label);
  scene.add(m);
  return { m, d, speed: 1 / (i + 1) };
});
scene.add(new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), new THREE.MeshBasicMaterial({ color: 0xffd54f })));
scene.add(new THREE.PointLight(0xffffff, 80, 0, 1.5));

stage.onFrame((t) => planets.forEach((p) => p.m.position.set(Math.cos(t * p.speed) * p.d, 0, Math.sin(t * p.speed) * p.d)));
const render = stage.render;
stage.render = () => { render(); labelRenderer.render(scene, camera); };
stage.onResize((w, h) => labelRenderer.setSize(w, h));
` }],
  props: [['.domElement : HTMLElement', '標籤容器，需放在 canvas 上方。']],
  methods: [['.render( scene, camera ) : undefined', '更新所有 CSS2DObject 的位置。'], ['.setSize( width, height ) : undefined', '設定尺寸。'], ['.getSize() : Object', '取得尺寸。']],
  statics: [['CSS2DObject( element )', '包裝 HTML 元素的 Object3D；<code>center</code>（Vector2）設定錨點。']],
},
{
  id: 'api-css3drenderer', title: 'CSS3DRenderer', api: true, src: 'examples/jsm/renderers/CSS3DRenderer.js',
  module: imp('CSS3DRenderer, CSS3DObject, CSS3DSprite', 'renderers/CSS3DRenderer.js'),
  desc: '<p>以 CSS 3D transform 把 HTML 元素放進 3D 空間（會透視變形、可旋轉），例如在 3D 場景中嵌入網頁、影片、表單。<code>CSS3DObject</code> 會隨物件旋轉，<code>CSS3DSprite</code> 永遠面向相機。注意 CSS3D 元素與 WebGL 物件之間無法正確互相遮擋。</p>',
  ctor: { sig: 'new CSS3DRenderer( parameters : Object )' },
  examples: [{ title: 'HTML 卡片牆', code: code`
import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
document.body.style.background = '#0d1117';
const renderer = new CSS3DRenderer();
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 1, 5000);
camera.position.set(0, 0, 1400);
const controls = new OrbitControls(camera, renderer.domElement);
controls.autoRotate = true;
controls.autoRotateSpeed = 1;
const names = ['Scene', 'Camera', 'Mesh', 'Light', 'Material', 'Texture', 'Geometry', 'Raycaster', 'Clock', 'Vector3', 'Matrix4', 'Color'];
names.forEach((name, i) => {
  const el = document.createElement('div');
  el.innerHTML = '<b style="font-size:28px">' + name + '</b><br><span style="opacity:.6">THREE.' + name + '</span>';
  el.style.cssText = 'width:220px;height:140px;padding:18px;box-sizing:border-box;border-radius:14px;color:#fff;font-family:sans-serif;background:hsla(' + (i * 30) + ',70%,45%,.85);border:1px solid rgba(255,255,255,.4)';
  const obj = new CSS3DObject(el);
  const a = (i / names.length) * Math.PI * 2;
  obj.position.set(Math.sin(a) * 600, (i % 3 - 1) * 180, Math.cos(a) * 600);
  obj.lookAt(0, obj.position.y, 0);
  obj.rotateY(Math.PI);
  scene.add(obj);
});
console.log('CSS3DObject 數', scene.children.length, '（每張卡片都是真正的 HTML 元素）');
(function loop() { requestAnimationFrame(loop); controls.update(); renderer.render(scene, camera); })();
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
` }],
  props: [['.domElement : HTMLElement', '容器元素。']],
  methods: [['.render( scene, camera ) : undefined', '更新所有 CSS3D 元素的 transform。'], ['.setSize( width, height ) / .getSize()', '尺寸。']],
  statics: [['CSS3DObject( element )', '隨物件旋轉的 3D HTML 元素。'], ['CSS3DSprite( element )', '永遠面向相機的 HTML 元素。']],
},
{
  id: 'api-svgrenderer', title: 'SVGRenderer', api: true, src: 'examples/jsm/renderers/SVGRenderer.js',
  module: imp('SVGRenderer, SVGObject', 'renderers/SVGRenderer.js'),
  desc: '<p>把場景渲染成 SVG 向量圖（支援 Mesh、Line、Points 的基本材質與簡易光照，不支援貼圖與陰影）。適合產生可無限放大的技術圖、向量插畫或列印輸出。</p>',
  ctor: { sig: 'new SVGRenderer()' },
  examples: [{ title: '向量輸出', code: code`
import * as THREE from 'three';
import { SVGRenderer } from 'three/addons/renderers/SVGRenderer.js';
const renderer = new SVGRenderer();
renderer.setSize(innerWidth, innerHeight);
renderer.setClearColor(0xfafafa);
renderer.setQuality('high');
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 1, 100);
camera.position.set(0, 2, 7);
camera.lookAt(0, 0, 0);
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(2, 3, 4);
scene.add(light);
const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(1, 0.3, 64, 8), new THREE.MeshLambertMaterial({ color: 0x5c6bc0 }));
const ring = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(new THREE.EllipseCurve(0, 0, 2.2, 2.2).getPoints(64).map((p) => new THREE.Vector3(p.x, -1.6, p.y))), new THREE.LineBasicMaterial({ color: 0xff7043 }));
scene.add(knot, ring);
let n = 0;
(function loop() {
  requestAnimationFrame(loop);
  knot.rotation.y += 0.01;
  renderer.render(scene, camera);
  if (++n === 10) console.log('SVG 元素數', renderer.domElement.querySelectorAll('path').length, '｜可直接存成 .svg 檔');
})();
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
` }],
  props: [['.domElement : SVGElement', '輸出的 SVG 元素。'], ['.overdraw : Number', '多邊形外擴量，消除接縫，預設 0.5。'], ['.outputColorSpace : String', '輸出色彩空間。']],
  methods: [['.render( scene, camera ) : undefined', '渲染。'], ['.setSize( w, h ) / .setClearColor( color ) / .setQuality( "high" | "low" ) / .setPrecision( n )', '設定。']],
  statics: [['SVGObject( node : SVGElement )', '把任意 SVG 元素放入 3D 場景。']],
},
]);

/* ================= 後期處理（補充說明頁已存在 EffectComposer） ================= */

/* ================= 數學 ================= */
add('附加：數學 Math', [
{
  id: 'api-lut', title: 'Lut', en: 'LookupTable', official: 'LookupTable', api: true, src: 'examples/jsm/math/Lut.js',
  module: imp('Lut', 'math/Lut.js'),
  desc: '<p>色彩查找表（科學視覺化用）：把數值對應到色階（rainbow、cooltowarm、blackbody、grayscale），例如依溫度、壓力、高度為網格上色，並可產生圖例 canvas。</p>',
  ctor: { sig: 'new Lut( colormap : String, count : Number )', params: [['colormap', 'String', '"rainbow"（預設）、"cooltowarm"、"blackbody"、"grayscale"。'], ['count', 'Number', '色階數，預設 32。']] },
  examples: [{ title: '依高度著色的地形與圖例', code: code`
import * as THREE from 'three';
import { Lut } from 'three/addons/math/Lut.js';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const { scene } = createStage({ cameraPosition: [0, 6, 8], lights: false });
const geo = new THREE.PlaneGeometry(8, 8, 100, 100).rotateX(-Math.PI / 2);
const pos = geo.attributes.position;
for (let i = 0; i < pos.count; i++) {
  const x = pos.getX(i), z = pos.getZ(i);
  pos.setY(i, Math.sin(x * 0.8) * Math.cos(z * 0.6) * 1.2 + Math.sin(x * z * 0.1));
}
geo.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(pos.count * 3), 3));
scene.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true })));
const lut = new Lut('rainbow', 512);
const legend = document.createElement('img');
legend.style.cssText = 'position:absolute;right:12px;top:50px;height:200px;width:20px;border:1px solid #fff';
document.body.appendChild(legend);
function paint(map) {
  lut.setColorMap(map);
  lut.setMin(-2.2); lut.setMax(2.2);
  const col = geo.attributes.color;
  for (let i = 0; i < pos.count; i++) col.setXYZ(i, ...lut.getColor(pos.getY(i)).toArray());
  col.needsUpdate = true;
  legend.src = lut.createCanvas().toDataURL();
}
paint('rainbow');
new GUI().add({ colormap: 'rainbow' }, 'colormap', ['rainbow', 'cooltowarm', 'blackbody', 'grayscale']).onChange(paint);
console.log('getColor(0) =', lut.getColor(0));
` }],
  props: [['.lut : Array', '色階（Color 陣列）。'], ['.map : Array', '目前的色彩對照定義。'], ['.minV / .maxV : Number', '數值範圍。'], ['.n : Number', '色階數。']],
  methods: [['.getColor( alpha ) : Color', '數值對應的顏色（超出範圍時截斷）。'], ['.setColorMap( name, count ) : this', '切換色階。'], ['.setMin( v ) / .setMax( v ) : this', '設定範圍。'], ['.createCanvas() : HTMLCanvasElement', '產生圖例 canvas。'], ['.updateCanvas( canvas ) : HTMLCanvasElement', '更新圖例。'], ['.addColorMap( name, arrayOfColors ) : this', '加入自訂色階。']],
},
{
  id: 'api-meshsurfacesampler', title: 'MeshSurfaceSampler', api: true, src: 'examples/jsm/math/MeshSurfaceSampler.js',
  module: imp('MeshSurfaceSampler', 'math/MeshSurfaceSampler.js'),
  desc: '<p>在網格表面隨機取樣點（依三角形面積加權，分布均勻），同時取得該點的法線、顏色、UV。常用於在模型表面散布草、毛髮、粒子特效。</p>',
  ctor: { sig: 'new MeshSurfaceSampler( mesh : Mesh )' },
  examples: [{ title: '在表面長出尖刺', code: code`
import * as THREE from 'three';
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 1, 5] });
const surface = new THREE.Mesh(new THREE.TorusKnotGeometry(1, 0.35, 160, 24), new THREE.MeshStandardMaterial({ color: 0x37474f }));
scene.add(surface);
const sampler = new MeshSurfaceSampler(surface).build();
const count = 3000;
const spikes = new THREE.InstancedMesh(new THREE.ConeGeometry(0.02, 0.15, 5).translate(0, 0.075, 0), new THREE.MeshStandardMaterial({ color: 0x69f0ae }), count);
const p = new THREE.Vector3(), n = new THREE.Vector3(), m = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), s = new THREE.Vector3();
const color = new THREE.Color();
for (let i = 0; i < count; i++) {
  sampler.sample(p, n);
  q.setFromUnitVectors(up, n);
  s.setScalar(0.5 + Math.random());
  spikes.setMatrixAt(i, m.compose(p, q, s));
  spikes.setColorAt(i, color.setHSL(0.3 + Math.random() * 0.15, 0.8, 0.5));
}
surface.add(spikes);
console.log('在表面取樣', count, '個點（依面積加權）');
onFrame((t) => { surface.rotation.y = t * 0.3; });
` }],
  methods: [['.build() : this', '建立取樣用的面積分布表（修改幾何體後需重新呼叫）。'], ['.sample( targetPosition, targetNormal, targetColor, targetUV ) : this', '取樣一個點。'], ['.setWeightAttribute( name ) : this', '以某個 attribute 作為額外權重（例如只在某些區域長草）。'], ['.setRandomGenerator( fn ) : this', '自訂亂數產生器（可重現的結果）。']],
},
{
  id: 'api-obb', title: 'OBB', api: true, src: 'examples/jsm/math/OBB.js',
  module: imp('OBB', 'math/OBB.js'),
  desc: '<p>有向包圍盒（Oriented Bounding Box）：與 Box3（軸對齊）不同，OBB 可以跟著物件旋轉，因此對旋轉物體的碰撞偵測更準確。以中心、半尺寸與旋轉矩陣定義。</p>',
  ctor: { sig: 'new OBB( center : Vector3, halfSize : Vector3, rotation : Matrix3 )' },
  examples: [{ title: 'OBB vs. AABB 碰撞', desc: '兩個旋轉中的長方體：黃框為 AABB（Box3），常常誤判碰撞；方塊變紅表示 OBB 真正相交。', code: code`
import * as THREE from 'three';
import { OBB } from 'three/addons/math/OBB.js';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 6, 6] });
const geo = new THREE.BoxGeometry(2.4, 0.4, 0.4);
geo.userData.obb = new OBB().fromBox3(new THREE.Box3().setFromBufferAttribute(geo.attributes.position));
const make = (x) => { const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x78909c })); m.position.x = x; m.userData.obb = new OBB(); scene.add(m); return m; };
const a = make(-1), b = make(1);
const aabbA = new THREE.Box3(), aabbB = new THREE.Box3();
scene.add(new THREE.Box3Helper(aabbA, 0xffeb3b), new THREE.Box3Helper(aabbB, 0xffeb3b));
let last = '';
onFrame((t) => {
  a.rotation.y = t * 0.8; b.rotation.y = -t * 0.6;
  b.position.x = 1.2 + Math.sin(t * 0.5) * 0.8;
  for (const m of [a, b]) { m.updateMatrixWorld(); m.userData.obb.copy(geo.userData.obb).applyMatrix4(m.matrixWorld); }
  aabbA.setFromObject(a); aabbB.setFromObject(b);
  const hitOBB = a.userData.obb.intersectsOBB(b.userData.obb), hitAABB = aabbA.intersectsBox(aabbB);
  [a, b].forEach((m) => m.material.color.set(hitOBB ? 0xef5350 : 0x78909c));
  const state = 'AABB：' + (hitAABB ? '相交' : '分開') + '｜OBB：' + (hitOBB ? '相交' : '分開');
  if (state !== last) { last = state; console.log(state); }
});
` }],
  props: [['.center : Vector3', '中心。'], ['.halfSize : Vector3', '半尺寸。'], ['.rotation : Matrix3', '旋轉。']],
  methods: [
    ['.fromBox3( box3 ) : this', '由 Box3 建立。'], ['.applyMatrix4( matrix ) : this', '套用物件的世界矩陣。'], ['.intersectsOBB( obb, epsilon ) : Boolean', 'OBB 相交（分離軸定理）。'],
    ['.intersectsBox3 / .intersectsSphere / .intersectsPlane / .intersectsRay', '其他相交測試。'], ['.containsPoint( point ) : Boolean', '是否包含點。'], ['.clampPoint( point, result ) : Vector3', '最近點。'], ['.getSize( result ) : Vector3', '尺寸。'],
  ],
},
]);

/* ================= ConvexHull ================= */
var CH = 'three/addons/math/ConvexHull.js';
add('附加：數學 Math', [
{
  id: 'api-convexhull', title: 'ConvexHull', api: true, src: 'examples/jsm/math/ConvexHull.js',
  module: imp('ConvexHull', 'math/ConvexHull.js'),
  desc: '<p>以 Quickhull 演算法計算 3D 點集的凸包。結果以半邊（half-edge）資料結構表示：<a href="#/api-face">Face</a>、<a href="#/api-halfedge">HalfEdge</a>、<a href="#/api-vertexnode">VertexNode</a>、<a href="#/api-vertexlist">VertexList</a>。<a href="#/api-convexgeometry">ConvexGeometry</a> 內部使用它。</p>',
  ctor: { sig: 'new ConvexHull()' },
  examples: [{ title: '計算凸包並走訪面與邊', consoleOnly: true, code: code`
import * as THREE from 'three';
import { ConvexHull } from 'three/addons/math/ConvexHull.js';
const pts = [];
for (let i = 0; i < 200; i++) pts.push(new THREE.Vector3().randomDirection().multiplyScalar(Math.random()));
pts.push(...[[2, 0, 0], [-2, 0, 0], [0, 2, 0], [0, -2, 0], [0, 0, 2], [0, 0, -2]].map((p) => new THREE.Vector3(...p)));
const hull = new ConvexHull().setFromPoints(pts);
console.log('輸入點', pts.length, '｜凸包面數', hull.faces.length, '｜凸包頂點數', new Set(hull.faces.flatMap((f) => { const v = []; let e = f.edge; do { v.push(e.head().point); e = e.next; } while (e !== f.edge); return v; })).size);
const f = hull.faces[0];
console.log('第一個面：法線', f.normal, '面積', f.area.toFixed(3), '中心', f.midpoint);
console.log('包含原點？', hull.containsPoint(new THREE.Vector3()), '｜包含 (3,0,0)？', hull.containsPoint(new THREE.Vector3(3, 0, 0)));
const hit = hull.intersectRay(new THREE.Ray(new THREE.Vector3(5, 0.1, 0), new THREE.Vector3(-1, 0, 0)), new THREE.Vector3());
console.log('射線命中凸包於', hit);
` }],
  props: [['.faces : Array', '凸包的面（Face 陣列）。'], ['.vertices : Array', '輸入的頂點（VertexNode）。'], ['.tolerance : Number', '數值容差。']],
  methods: [
    ['.setFromPoints( points ) : this', '由點陣列計算。'], ['.setFromObject( object ) : this', '由物件的所有頂點計算。'], ['.containsPoint( point ) : Boolean', '是否包含點。'],
    ['.intersectRay( ray, target ) : Vector3', '射線交點。'], ['.intersectsRay( ray ) : Boolean', '是否相交。'], ['.makeEmpty() : this', '清空。'],
  ],
},
{ id: 'api-face', title: 'Face', api: true, src: 'examples/jsm/math/ConvexHull.js', module: imp('Face', 'math/ConvexHull.js'),
  desc: '<p><a href="#/api-convexhull">ConvexHull</a> 的一個面（三角形），以一個環狀的 <a href="#/api-halfedge">HalfEdge</a> 串列描述其邊界。</p>',
  ctor: { sig: 'new Face()' },
  props: [['.normal : Vector3', '法線。'], ['.midpoint : Vector3', '中心點。'], ['.area : Number', '面積。'], ['.constant : Number', '平面常數。'], ['.outside : VertexNode', '在此面外側、尚未處理的頂點。'], ['.mark : Number', 'VISIBLE / DELETED 標記。'], ['.edge : HalfEdge', '第一條半邊。']],
  methods: [['.getEdge( i ) : HalfEdge', '第 i 條半邊（可為負數）。'], ['.compute() : this', '重新計算法線、中心、面積。'], ['.distanceToPoint( point ) : Number', '點到面的有號距離。']],
  statics: [['.create( a, b, c : VertexNode ) : Face', '由三個頂點建立面。']] },
{ id: 'api-halfedge', title: 'HalfEdge', api: true, src: 'examples/jsm/math/ConvexHull.js', module: imp('HalfEdge', 'math/ConvexHull.js'),
  desc: '<p>半邊資料結構中的一條有向邊。每條邊由兩個方向相反的半邊組成（互為 twin），分屬相鄰的兩個面。</p>',
  ctor: { sig: 'new HalfEdge( vertex : VertexNode, face : Face )' },
  props: [['.vertex : VertexNode', '終點頂點。'], ['.prev / .next : HalfEdge', '同一面上的前 / 後一條半邊。'], ['.twin : HalfEdge', '相鄰面上方向相反的半邊。'], ['.face : Face', '所屬的面。']],
  methods: [['.head() : VertexNode', '終點。'], ['.tail() : VertexNode', '起點。'], ['.length() / .lengthSquared() : Number', '長度。'], ['.setTwin( edge ) : this', '設定 twin。']] },
{ id: 'api-vertexnode', title: 'VertexNode', api: true, src: 'examples/jsm/math/ConvexHull.js', module: imp('VertexNode', 'math/ConvexHull.js'),
  desc: '<p><a href="#/api-convexhull">ConvexHull</a> 中的頂點節點，同時是 <a href="#/api-vertexlist">VertexList</a> 雙向鏈結串列的節點。</p>',
  ctor: { sig: 'new VertexNode( point : Vector3 )' },
  props: [['.point : Vector3', '座標。'], ['.prev / .next : VertexNode', '串列中的前後節點。'], ['.face : Face', '此頂點位於其外側的面。']] },
{ id: 'api-vertexlist', title: 'VertexList', api: true, src: 'examples/jsm/math/ConvexHull.js', module: imp('VertexList', 'math/ConvexHull.js'),
  desc: '<p>Quickhull 演算法使用的頂點雙向鏈結串列（存放已分配 / 未分配的頂點）。</p>',
  ctor: { sig: 'new VertexList()' },
  props: [['.head / .tail : VertexNode', '首尾節點。']],
  methods: [['.first() / .last() : VertexNode', '首 / 尾。'], ['.append( vertex ) / .appendChain( vertex ) : this', '加入。'], ['.insertBefore( target, vertex ) / .insertAfter( target, vertex ) : this', '插入。'], ['.remove( vertex ) / .removeSubList( a, b ) : this', '移除。'], ['.isEmpty() : Boolean', '是否為空。'], ['.clear() : this', '清空。']] },
]);

/* ================= 工具 ================= */
add('附加：工具 Utils', [
{
  id: 'api-buffergeometryutils', title: 'BufferGeometryUtils', api: true, src: 'examples/jsm/utils/BufferGeometryUtils.js',
  module: "import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';",
  desc: '<p>處理 BufferGeometry 的工具函式集合。最常用的是 <code>mergeGeometries</code>（把大量靜態物件合併成一個，減少 draw call）與 <code>mergeVertices</code>（合併重複頂點、產生索引）。</p>',
  examples: [{ title: '合併 1,000 個方塊', desc: '左：1,000 個獨立 Mesh；右：合併成 1 個 Mesh。console 比較 draw calls。', code: code`
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { createStage } from 'doc-stage';
const { scene, renderer, onFrame } = createStage({ cameraPosition: [0, 12, 22] });
const mat = new THREE.MeshStandardMaterial({ color: 0x4db6ac });
const left = new THREE.Group(), geos = [];
for (let i = 0; i < 1000; i++) {
  const g = new THREE.BoxGeometry(0.3, 0.3 + Math.random(), 0.3);
  const x = (i % 32) * 0.4 - 6.2, z = Math.floor(i / 32) * 0.4 - 6;
  const m = new THREE.Mesh(g, mat); m.position.set(x - 7, 0, z); left.add(m);
  geos.push(g.clone().translate(x + 7, 0, z));
}
const merged = BufferGeometryUtils.mergeGeometries(geos);
const right = new THREE.Mesh(merged, mat);
scene.add(left, right);
let step = 0;
onFrame(() => {
  step++;
  if (step === 5) { left.visible = true; right.visible = false; }
  if (step === 6) console.log('1,000 個 Mesh：draw calls =', renderer.info.render.calls);
  if (step === 7) { left.visible = false; right.visible = true; }
  if (step === 8) { console.log('合併後：draw calls =', renderer.info.render.calls, '｜頂點', merged.attributes.position.count); left.visible = true; }
});
const indexed = BufferGeometryUtils.mergeVertices(new THREE.BoxGeometry().deleteAttribute('normal').deleteAttribute('uv'));
console.log('mergeVertices：Box 去掉 normal/uv 後頂點 24 →', indexed.attributes.position.count);
console.log('estimateBytesUsed(merged) =', BufferGeometryUtils.estimateBytesUsed(merged), 'bytes');
` }],
  statics: [
    ['.mergeGeometries( geometries, useGroups ) : BufferGeometry', '合併多個幾何體（attribute 必須一致）；useGroups 為 true 時保留群組以使用多材質。'], ['.mergeAttributes( attributes ) : BufferAttribute', '合併 attribute。'],
    ['.mergeVertices( geometry, tolerance ) : BufferGeometry', '合併位置相同（容差內）的頂點，產生索引幾何體。'], ['.toCreasedNormals( geometry, creaseAngle ) : BufferGeometry', '依折角計算法線：小於角度的平滑、大於的保持銳利。'],
    ['.interleaveAttributes( attributes ) : Array', '轉為交錯緩衝區。'], ['.deinterleaveGeometry( geometry )', '把交錯 attribute 轉回一般 attribute。'],
    ['.estimateBytesUsed( geometry ) : Number', '估算記憶體用量。'], ['.computeMorphedAttributes( object ) : Object', '計算套用 morph / skin 後的頂點。'],
    ['.mergeGroups( geometry ) : BufferGeometry', '合併相同材質的群組。'], ['.toTrianglesDrawMode( geometry, drawMode ) : BufferGeometry', '把三角形條帶 / 扇形轉為一般三角形。'], ['.computeMikkTSpaceTangents( geometry, MikkTSpace ) : BufferGeometry', '以 MikkTSpace 計算切線。'],
  ],
},
{
  id: 'api-skeletonutils', title: 'SkeletonUtils', api: true, src: 'examples/jsm/utils/SkeletonUtils.js',
  module: "import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';",
  desc: '<p>骨架相關工具。最重要的是 <code>clone()</code>：一般的 <code>object.clone()</code> 無法正確複製 SkinnedMesh（複製品仍綁定原本的骨骼），需要用 <code>SkeletonUtils.clone()</code>。另有 <code>retarget</code> / <code>retargetClip</code> 把動畫套用到不同骨架。</p>',
  examples: [{ title: '複製帶骨架的角色', desc: '同一個 glTF 角色複製 3 份，各自播放不同動畫。', code: code`
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ grid: true, cameraPosition: [0, 2, 5], target: [0, 1, 0] });
const gltf = await new GLTFLoader().loadAsync('https://threejs.org/examples/models/gltf/Soldier.glb');
const mixers = [];
['Idle', 'Walk', 'Run'].forEach((name, i) => {
  const model = SkeletonUtils.clone(gltf.scene);   // 正確複製骨架
  model.position.x = (i - 1) * 1.5;
  scene.add(model);
  const mixer = new THREE.AnimationMixer(model);
  mixer.clipAction(THREE.AnimationClip.findByName(gltf.animations, name)).play();
  mixers.push(mixer);
});
console.log('3 個獨立角色，動畫：Idle / Walk / Run');
onFrame((t, dt) => mixers.forEach((m) => m.update(dt)));
` }],
  statics: [['.clone( object ) : Object3D', '複製物件，並讓複製出的 SkinnedMesh 綁定到複製出的骨骼。'], ['.retarget( target, source, options ) : undefined', '把 source 骨架的姿勢套用到 target。'], ['.retargetClip( target, source, clip, options ) : AnimationClip', '把動畫轉換為 target 骨架可用的版本。']],
},
{
  id: 'api-sceneutils', title: 'SceneUtils', api: true, src: 'examples/jsm/utils/SceneUtils.js',
  module: "import * as SceneUtils from 'three/addons/utils/SceneUtils.js';",
  desc: '<p>場景相關工具函式。</p>',
  examples: [{ title: 'createMultiMaterialObject 與遍歷產生器', code: code`
import * as THREE from 'three';
import * as SceneUtils from 'three/addons/utils/SceneUtils.js';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 1, 4] });
// 同一幾何體套用多個材質（各自建立一個 Mesh 疊在一起）
const obj = SceneUtils.createMultiMaterialObject(new THREE.IcosahedronGeometry(1, 1), [
  new THREE.MeshStandardMaterial({ color: 0x26a69a, flatShading: true }),
  new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true }),
]);
scene.add(obj);
console.log('createMultiMaterialObject → Group，子物件', obj.children.length);
// 以產生器走訪（可以中途 break）
let n = 0;
for (const o of SceneUtils.traverseGenerator(scene)) { n++; if (o.isMesh) { console.log('第一個 Mesh 在第', n, '個節點'); break; } }
onFrame((t) => obj.rotation.set(t * 0.3, t * 0.5, 0));
` }],
  statics: [
    ['.createMultiMaterialObject( geometry, materials ) : Group', '每個材質建立一個 Mesh 並組成 Group。'], ['.createMeshesFromInstancedMesh( instancedMesh ) : Group', '把 InstancedMesh 拆成多個 Mesh。'],
    ['.createMeshesFromMultiMaterialMesh( mesh ) : Group', '把多材質 Mesh 依群組拆開。'], ['.sortInstancedMesh( mesh, compareFn ) : undefined', '排序實例（例如依距離，處理透明）。'],
    ['.reduceVertices( object, func, initialValue ) : Any', '對所有頂點做 reduce（例如計算最高點）。'], ['.traverseGenerator / .traverseVisibleGenerator / .traverseAncestorsGenerator( object )', '以產生器（for…of）走訪，可以中斷。'],
  ],
},
{
  id: 'api-camerautils', title: 'CameraUtils', api: true, src: 'examples/jsm/utils/CameraUtils.js',
  module: "import * as CameraUtils from 'three/addons/utils/CameraUtils.js';",
  desc: '<p>相機工具。<code>frameCorners()</code> 讓透視相機的視錐「剛好穿過」空間中一個矩形的四個角（離軸投影），用於傳送門、鏡子、頭部追蹤顯示、CAVE 投影等效果。</p>',
  examples: [{ title: '傳送門：透過窗戶看另一個場景', desc: '中央的框是一扇「窗戶」，透過它看到的是另一個場景，視角會隨著主相機正確變化。', code: code`
import * as THREE from 'three';
import * as CameraUtils from 'three/addons/utils/CameraUtils.js';
import { createStage } from 'doc-stage';
const stage = createStage({ cameraPosition: [1.5, 0.5, 5], grid: true });
const { scene, camera, renderer } = stage;
// 另一個世界
const other = new THREE.Scene();
other.background = new THREE.Color(0x311b92);
other.add(new THREE.HemisphereLight(0xffffff, 0x444444, 2));
for (let i = 0; i < 40; i++) {
  const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.3), new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(Math.random(), 0.8, 0.6), flatShading: true }));
  m.position.set((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 4, -2 - Math.random() * 8);
  other.add(m);
}
// 窗戶（2 × 1.5）
const rt = new THREE.WebGLRenderTarget(1024, 768);
const portal = new THREE.Mesh(new THREE.PlaneGeometry(2, 1.5), new THREE.MeshBasicMaterial({ map: rt.texture }));
scene.add(portal, new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(2.1, 1.6, 0.05)), new THREE.LineBasicMaterial({ color: 0xffffff })));
const bl = new THREE.Vector3(-1, -0.75, 0), br = new THREE.Vector3(1, -0.75, 0), tl = new THREE.Vector3(-1, 0.75, 0);
const portalCam = new THREE.PerspectiveCamera();
const render = stage.render;
stage.render = () => {
  portalCam.position.copy(camera.position);
  CameraUtils.frameCorners(portalCam, bl, br, tl, false);   // 視錐穿過窗戶四角
  renderer.setRenderTarget(rt);
  renderer.render(other, portalCam);
  renderer.setRenderTarget(null);
  render();
};
console.log('拖曳視角，從不同角度看進窗戶');
` }],
  statics: [['.frameCorners( camera, bottomLeft, bottomRight, topLeft, estimateViewFrustum ) : undefined', '設定相機的投影矩陣，使視錐通過三個角定義的矩形。']],
},
]);

/* ================= 其他 ================= */
add('附加：其他 Misc', [
{
  id: 'api-timer', title: 'Timer', api: true, src: 'examples/jsm/misc/Timer.js',
  module: imp('Timer', 'misc/Timer.js'),
  desc: '<p><a href="#/api-clock">Clock</a> 的改良版：每幀呼叫一次 <code>update()</code>，同一幀內多次呼叫 <code>getDelta()</code> 都會得到相同的值（Clock 的 getDelta 每次呼叫都會重設，容易出錯）；呼叫 <code>connect(document)</code> 後，分頁切到背景時會自動暫停，回來時不會出現巨大的 delta。另有 <code>FixedTimer</code> 以固定時間步長更新。</p>',
  ctor: { sig: 'new Timer()' },
  examples: [{ title: 'Timer 與 Clock 的差異', code: code`
import * as THREE from 'three';
import { Timer } from 'three/addons/misc/Timer.js';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const { scene, renderer } = createStage({ cameraPosition: [0, 1, 5] });
const timer = new Timer();
timer.connect(document);   // 分頁隱藏時自動暫停
const box = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshNormalMaterial());
scene.add(box);
const clock = new THREE.Clock();
clock.getDelta(); const d2 = clock.getDelta();
console.log('Clock 連續兩次 getDelta：第二次 =', d2.toFixed(6), '（被第一次重設了）');
let logged = false;
renderer.setAnimationLoop((ts) => {
  timer.update(ts);
  const a = timer.getDelta(), b = timer.getDelta();
  if (!logged && timer.getElapsed() > 0.5) { logged = true; console.log('Timer 同一幀兩次 getDelta：', a.toFixed(4), b.toFixed(4), '（相同）'); }
  box.rotation.y += a;
  box.rotation.x = timer.getElapsed() * 0.5;
});
new GUI().add({ s: 1 }, 's', 0, 3, 0.01).name('setTimescale').onChange((v) => timer.setTimescale(v));
` }],
  methods: [['.update( timestamp ) : this', '每幀呼叫一次（傳入 requestAnimationFrame 的時間戳）。'], ['.getDelta() : Number', '上一幀到這一幀的秒數（已乘 timescale）。'], ['.getElapsed() : Number', '總經過秒數。'], ['.getTimescale() / .setTimescale( v )', '時間倍率。'], ['.connect( document ) / .disconnect()', '啟用 / 停用 Page Visibility 自動暫停。'], ['.reset() : this', '重設。'], ['.dispose() : undefined', '釋放。']],
},
{
  id: 'api-edgesplitmodifier', title: 'EdgeSplitModifier', en: 'EdgeSplit', official: 'EdgeSplit', api: true, src: 'examples/jsm/modifiers/EdgeSplitModifier.js',
  module: imp('EdgeSplitModifier', 'modifiers/EdgeSplitModifier.js'),
  desc: '<p>依角度拆分邊：在相鄰面夾角大於 cutOffAngle 的地方把頂點分開，讓平滑著色的模型在銳利的稜角處保持銳利（類似 Blender 的 Edge Split 修改器）。</p>',
  ctor: { sig: 'new EdgeSplitModifier()' },
  examples: [{ title: '調整拆分角度', code: code`
import * as THREE from 'three';
import { EdgeSplitModifier } from 'three/addons/modifiers/EdgeSplitModifier.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 1.5, 4] });
const base = BufferGeometryUtils.mergeVertices(new THREE.CylinderGeometry(0.8, 1, 1.6, 10, 2).deleteAttribute('normal').deleteAttribute('uv'));
const mesh = new THREE.Mesh(base, new THREE.MeshStandardMaterial({ color: 0xb0bec5, roughness: 0.4 }));
scene.add(mesh);
const modifier = new EdgeSplitModifier();
const p = { cutOffAngle: 20, enabled: true };
function apply() {
  if (mesh.geometry !== base) mesh.geometry.dispose();
  if (!p.enabled) { base.computeVertexNormals(); mesh.geometry = base; return; }
  mesh.geometry = modifier.modify(base, THREE.MathUtils.degToRad(p.cutOffAngle));
  mesh.geometry.computeVertexNormals();
  console.log('cutOffAngle', p.cutOffAngle + '°', '→ 頂點', mesh.geometry.attributes.position.count);
}
apply();
const gui = new GUI();
gui.add(p, 'enabled').name('啟用 EdgeSplit').onChange(apply);
gui.add(p, 'cutOffAngle', 0, 90, 1).onFinishChange(apply);
onFrame((t) => { mesh.rotation.y = t * 0.3; });
` }],
  methods: [['.modify( geometry, cutOffAngle, tryKeepNormals ) : BufferGeometry', '回傳拆分後的新幾何體。cutOffAngle 為弧度；tryKeepNormals 為 true 時盡量保留原法線。']],
},
{
  id: 'api-xrestimatedlight', title: 'XREstimatedLight', api: true, inherits: ['EventDispatcher', 'Object3D', 'Group'], src: 'examples/jsm/webxr/XREstimatedLight.js',
  module: imp('XREstimatedLight', 'webxr/XREstimatedLight.js'),
  desc: '<p>WebXR AR 的光照估計：利用裝置相機估算真實環境的光照，產生對應的 LightProbe、DirectionalLight 與環境貼圖，讓虛擬物件的明暗與真實環境一致。需要支援 <code>light-estimation</code> 功能的 AR 裝置（如 Android Chrome），本文件環境無法執行。</p><pre class="code"><code>import { ARButton } from \'three/addons/webxr/ARButton.js\';\nrenderer.xr.enabled = true;\nconst xrLight = new XREstimatedLight(renderer);\nxrLight.addEventListener(\'estimationstart\', () =&gt; {\n  scene.add(xrLight);\n  if (xrLight.environment) scene.environment = xrLight.environment;\n});\nxrLight.addEventListener(\'estimationend\', () =&gt; scene.remove(xrLight));\ndocument.body.appendChild(ARButton.createButton(renderer, { optionalFeatures: [\'light-estimation\'] }));</code></pre>',
  ctor: { sig: 'new XREstimatedLight( renderer : WebGLRenderer, environmentEstimation : Boolean )' },
  props: [['.lightProbe : LightProbe', '估算的環境光。'], ['.directionalLight : DirectionalLight', '估算的主光源。'], ['.environment : Texture', '估算的環境反射貼圖（environmentEstimation 為 true 時）。']],
  methods: [['.addEventListener( type, fn )', '事件：estimationstart、estimationend。'], ['.dispose() : undefined', '釋放。']],
},
]);

/* ================= 動畫 ================= */
add('附加：動畫 Animation', [
{
  id: 'api-ccdiksolver', title: 'CCDIKSolver', api: true, src: 'examples/jsm/animation/CCDIKSolver.js',
  module: imp('CCDIKSolver, CCDIKHelper', 'animation/CCDIKSolver.js'),
  desc: '<p>以 CCD（Cyclic Coordinate Descent）演算法求解反向運動學（IK）：給定「末端骨骼（effector）」與「目標骨骼（target）」，自動旋轉中間的骨骼鏈（links），讓末端碰到目標。常用於手臂抓取、腳部貼地。</p>',
  ctor: { sig: 'new CCDIKSolver( mesh : SkinnedMesh, iks : Array )', params: [['iks', 'Array', 'IK 設定陣列：<code>{ target, effector, links: [{ index, limitation, rotationMin, rotationMax }], iteration, minAngle, maxAngle }</code>，皆以 skeleton.bones 的索引表示。']] },
  examples: [{ title: '觸手追蹤目標', desc: '紅球是目標骨骼的位置；觸手（5 根骨骼）會自動彎曲讓尖端碰到它。', code: code`
import * as THREE from 'three';
import { CCDIKSolver, CCDIKHelper } from 'three/addons/animation/CCDIKSolver.js';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ grid: true, cameraPosition: [0, 3, 9], target: [0, 2, 0] });

const segH = 0.8, segs = 5, height = segH * segs;
const geo = new THREE.CylinderGeometry(0.08, 0.3, height, 12, segs * 4).translate(0, height / 2, 0);
const pos = geo.attributes.position, skinIndex = [], skinWeight = [];
for (let i = 0; i < pos.count; i++) {
  const y = pos.getY(i), idx = Math.min(Math.floor(y / segH), segs - 1), w = (y % segH) / segH;
  skinIndex.push(idx, Math.min(idx + 1, segs), 0, 0);
  skinWeight.push(1 - w, w, 0, 0);
}
geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndex, 4));
geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeight, 4));

const bones = [];
for (let i = 0; i <= segs; i++) {          // 0..5：骨骼鏈，5 為末端（effector）
  const b = new THREE.Bone();
  b.position.y = i === 0 ? 0 : segH;
  if (i > 0) bones[i - 1].add(b);
  bones.push(b);
}
const targetBone = new THREE.Bone();       // 6：目標
targetBone.position.set(2, 2, 0);
bones.push(targetBone);

const mesh = new THREE.SkinnedMesh(geo, new THREE.MeshStandardMaterial({ color: 0xab47bc }));
mesh.add(bones[0], targetBone);
mesh.bind(new THREE.Skeleton(bones));
scene.add(mesh);
const ball = new THREE.Mesh(new THREE.SphereGeometry(0.15), new THREE.MeshBasicMaterial({ color: 0xff1744 }));
scene.add(ball);

const iks = [{ target: 6, effector: 5, links: [{ index: 4 }, { index: 3 }, { index: 2 }, { index: 1 }, { index: 0 }], iteration: 10 }];
const solver = new CCDIKSolver(mesh, iks);
scene.add(new CCDIKHelper(mesh, iks, 0.05));
console.log('IK 鏈：effector', iks[0].effector, '→ links', iks[0].links.map((l) => l.index).join(', '));
onFrame((t) => {
  targetBone.position.set(Math.cos(t) * 2.2, 2.2 + Math.sin(t * 1.7) * 1.2, Math.sin(t) * 1.2);
  ball.position.copy(targetBone.position);
  solver.update();
});
` }],
  props: [['.mesh : SkinnedMesh', '目標網格。'], ['.iks : Array', 'IK 設定。']],
  methods: [['.update() : this', '求解所有 IK（每幀呼叫）。'], ['.updateOne( ik ) : this', '只求解一組。'], ['.createHelper( sphereSize ) : CCDIKHelper', '建立輔助顯示。']],
},
{
  id: 'api-mmdanimationhelper', title: 'MMDAnimationHelper', api: true, src: 'examples/jsm/animation/MMDAnimationHelper.js',
  module: imp('MMDAnimationHelper', 'animation/MMDAnimationHelper.js'),
  desc: '<p>處理 MMD 模型的動畫播放：同時套用骨骼動畫、IK、Grant（附加旋轉）、物理（需 MMDPhysics 與 ammo.js）、相機動畫與音樂同步。</p>' + DEPRECATED + '<pre class="code"><code>const helper = new MMDAnimationHelper({ afterglow: 2.0 });\nhelper.add(mesh, { animation, physics: true });\nhelper.add(camera, { animation: cameraAnimation });\n// 每幀\nhelper.update(clock.getDelta());</code></pre>',
  ctor: { sig: 'new MMDAnimationHelper( params : Object )' },
  methods: [['.add( object, params ) : this', '加入 SkinnedMesh、Camera 或 Audio。'], ['.remove( object ) : this', '移除。'], ['.update( delta ) : this', '每幀更新。'], ['.pose( mesh, vpd, params ) : this', '套用 .vpd 姿勢。'], ['.enable( key, enabled ) : this', '開關 animation / ik / grant / physics / cameraAnimation。']],
},
{
  id: 'api-mmdphysics', title: 'MMDPhysics', api: true, src: 'examples/jsm/animation/MMDPhysics.js',
  module: imp('MMDPhysics', 'animation/MMDPhysics.js'),
  desc: '<p>以 ammo.js（Bullet 物理引擎）模擬 MMD 模型的剛體與關節（頭髮、裙擺等擺動），通常由 <a href="#/api-mmdanimationhelper">MMDAnimationHelper</a> 自動建立。</p>' + DEPRECATED,
  ctor: { sig: 'new MMDPhysics( mesh : SkinnedMesh, rigidBodyParams : Array, constraintParams : Array, params : Object )' },
  methods: [['.update( delta ) : this', '模擬一步。'], ['.reset() : this', '重設剛體到骨骼位置。'], ['.warmup( cycles ) : this', '預先模擬數步以穩定。'], ['.setGravity( gravity ) : this', '設定重力。'], ['.createHelper() : MMDPhysicsHelper', '顯示剛體。']],
},
]);
})();
