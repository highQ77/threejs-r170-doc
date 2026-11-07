/* API 參考：物件 Objects */
(function () {
var code = String.raw;
var O3D = ['EventDispatcher', 'Object3D'];

window.DOCS.push(
{ group: '物件 Objects', section: 'api', items: [
{
  id: 'api-mesh', title: 'Mesh', api: true, src: 'objects/Mesh.js', inherits: O3D,
  desc: '<p>以三角形組成的多邊形物件，由 <a href="#/api-buffergeometry">幾何體</a> 與 <a href="#/api-material">材質</a> 組成。是 three.js 中最常用的可見物件。</p>',
  ctor: { sig: 'new Mesh( geometry : BufferGeometry, material : Material | Array )', params: [
    ['geometry', 'BufferGeometry', '（選填）幾何體，預設為空的 BufferGeometry。'],
    ['material', 'Material | Array', '（選填）單一材質或材質陣列（配合 geometry.groups），預設為 MeshBasicMaterial。'],
  ]},
  examples: [{
    title: '共用幾何體與材質',
    desc: '多個 Mesh 共用同一個 geometry 與 material，修改材質顏色會同時影響全部。點擊按鈕更換共用材質的顏色。',
    code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 4, 9] });

const geometry = new THREE.DodecahedronGeometry(0.5);
const material = new THREE.MeshStandardMaterial({ color: 0x26a69a, flatShading: true });
const meshes = [];
for (let i = 0; i < 25; i++) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set((i % 5 - 2) * 1.4, 0, (Math.floor(i / 5) - 2) * 1.4);
  scene.add(mesh);
  meshes.push(mesh);
}
console.log('Mesh 數', meshes.length, '｜共用幾何體？', meshes[0].geometry === meshes[24].geometry);

const btn = document.createElement('button');
btn.textContent = '隨機改變共用材質顏色';
btn.style.cssText = 'position:absolute;top:10px;left:10px;padding:6px 10px';
btn.onclick = () => material.color.setHSL(Math.random(), 0.6, 0.5);
document.body.appendChild(btn);

onFrame((t) => meshes.forEach((m, i) => { m.position.y = Math.sin(t * 2 + i * 0.5) * 0.4; m.rotation.y = t + i; }));
`
  }],
  props: [
    ['.geometry : BufferGeometry', '幾何體，可在執行時替換（記得 dispose 舊的）。'],
    ['.material : Material | Array', '材質或材質陣列。'],
    ['.morphTargetInfluences : Array', '各變形目標的權重（0–1）。'],
    ['.morphTargetDictionary : Object', '變形目標名稱 → 索引的對照表。'],
  ],
  methods: [
    ['.getVertexPosition( index : Integer, target : Vector3 ) : Vector3', '取得頂點位置（已考慮 morph target 與骨架變形）。'],
    ['.raycast( raycaster : Raycaster, intersects : Array ) : undefined', '與射線相交檢測，由 Raycaster 呼叫。'],
    ['.updateMorphTargets() : undefined', '依幾何體的 morphAttributes 更新 morphTargetInfluences 與 dictionary。'],
    ['.copy( source : Mesh, recursive : Boolean ) : this', '複製。'],
  ],
},
{
  id: 'api-instancedmesh', title: 'InstancedMesh', api: true, src: 'objects/InstancedMesh.js', inherits: O3D.concat('Mesh'),
  desc: '<p>特殊的 Mesh：以<b>一次 draw call</b> 繪製大量使用相同幾何體與材質、但位置 / 旋轉 / 縮放 / 顏色不同的實例。適合草地、樹林、粒子、群眾等。</p>',
  ctor: { sig: 'new InstancedMesh( geometry : BufferGeometry, material : Material, count : Integer )', params: [
    ['geometry', 'BufferGeometry', '幾何體。'], ['material', 'Material', '材質。'], ['count', 'Integer', '最大實例數。'],
  ]},
  examples: [{
    title: '實例矩陣、顏色與拾取',
    desc: '1,000 個方塊只用 1 次 draw call。滑鼠移到方塊上，Raycaster 會回傳 instanceId，並把該實例變色。',
    code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, camera, renderer, onFrame } = createStage({ cameraPosition: [14, 12, 14] });

const n = 10, count = n * n * n;
const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), new THREE.MeshStandardMaterial(), count);
const m = new THREE.Matrix4();
const color = new THREE.Color();
let i = 0;
for (let x = 0; x < n; x++) for (let y = 0; y < n; y++) for (let z = 0; z < n; z++) {
  m.setPosition(x - n / 2, y - n / 2, z - n / 2);
  mesh.setMatrixAt(i, m);
  mesh.setColorAt(i, color.setRGB(x / n, y / n, z / n));
  i++;
}
scene.add(mesh);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2(9, 9);
renderer.domElement.addEventListener('pointermove', (e) => pointer.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1));
const white = new THREE.Color(1, 1, 1);
let last = -1;
onFrame(() => {
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObject(mesh)[0];
  if (hit && hit.instanceId !== last) {
    last = hit.instanceId;
    mesh.setColorAt(last, white);
    mesh.instanceColor.needsUpdate = true;
    mesh.getMatrixAt(last, m);
    console.log('instanceId', last, '位置', new THREE.Vector3().setFromMatrixPosition(m));
  }
});
`
  }],
  props: [
    ['.count : Integer', '要繪製的實例數。可設為小於建構時的 count 以只畫一部分（不可超過）。'],
    ['.instanceMatrix : InstancedBufferAttribute', '每個實例的變換矩陣。修改後需設 <code>instanceMatrix.needsUpdate = true</code>。'],
    ['.instanceColor : InstancedBufferAttribute', '每個實例的顏色，第一次呼叫 setColorAt 時建立。修改後需設 needsUpdate。'],
    ['.morphTexture : DataTexture', '每個實例的變形權重。'],
    ['.boundingBox / .boundingSphere', '所有實例的包圍盒 / 球。實例移動後需呼叫 computeBoundingSphere()，否則可能被錯誤剔除或拾取失敗。'],
  ],
  methods: [
    ['.setMatrixAt( index : Integer, matrix : Matrix4 ) : undefined', '設定第 index 個實例的矩陣。'],
    ['.getMatrixAt( index : Integer, matrix : Matrix4 ) : undefined', '把第 index 個實例的矩陣寫入 matrix。'],
    ['.setColorAt( index : Integer, color : Color ) : undefined', '設定實例顏色。'],
    ['.getColorAt( index : Integer, color : Color ) : undefined', '取得實例顏色。'],
    ['.setMorphAt( index : Integer, mesh : Mesh ) : undefined', '以 mesh 的 morphTargetInfluences 設定實例的變形權重。'],
    ['.computeBoundingBox() / .computeBoundingSphere() : undefined', '依所有實例重算包圍體。'],
    ['.dispose() : this', '釋放實例資料（幾何體與材質仍需各自 dispose）。'],
  ],
},
{
  id: 'api-group', title: 'Group', api: true, src: 'objects/Group.js', inherits: O3D,
  desc: '<p>與 Object3D 幾乎相同，但語意更清楚：用來把多個物件組成一組，一起移動、旋轉、縮放。</p>',
  ctor: { sig: 'new Group()' },
  examples: [{
    title: '組合成一個「風車」',
    code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ grid: true, cameraPosition: [4, 3, 6], target: [0, 1.5, 0] });

const windmill = new THREE.Group();
const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.3, 3), new THREE.MeshStandardMaterial({ color: 0xeeeeee }));
tower.position.y = 1.5;
const blades = new THREE.Group();          // 葉片自成一組，方便一起旋轉
blades.position.set(0, 3, 0.3);
for (let i = 0; i < 4; i++) {
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.4, 0.05), new THREE.MeshStandardMaterial({ color: 0xd84315 }));
  blade.position.y = 0.7;
  const pivot = new THREE.Group();
  pivot.rotation.z = (i * Math.PI) / 2;
  pivot.add(blade);
  blades.add(pivot);
}
windmill.add(tower, blades);
scene.add(windmill);
console.log('windmill 子物件', windmill.children.map((c) => c.type));

onFrame((t, dt) => {
  blades.rotation.z -= dt * 2;
  windmill.rotation.y = Math.sin(t * 0.3) * 0.8;
});
`
  }],
  props: [['.isGroup : Boolean', '型別檢查旗標。']],
},
{
  id: 'api-points', title: 'Points', api: true, src: 'objects/Points.js', inherits: O3D,
  desc: '<p>把幾何體的每個頂點繪製成一個點，搭配 <a href="#/api-pointsmaterial">PointsMaterial</a>。適合粒子、星空、點雲。</p>',
  ctor: { sig: 'new Points( geometry : BufferGeometry, material : Material )' },
  examples: [{
    title: '點雲與 Raycaster 拾取',
    desc: 'raycaster.params.Points.threshold 決定滑鼠離點多近才算命中。',
    code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, camera, renderer, onFrame } = createStage({ cameraPosition: [0, 0, 8], lights: false, background: 0x000000 });

const count = 3000;
const pos = new Float32Array(count * 3);
for (let i = 0; i < count; i++) {
  const v = new THREE.Vector3().randomDirection().multiplyScalar(2 + Math.random() * 0.3);
  pos.set([v.x, v.y, v.z], i * 3);
}
const geo = new THREE.BufferGeometry();
geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
const points = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.04, color: 0x88ccff }));
scene.add(points);

const marker = new THREE.Mesh(new THREE.SphereGeometry(0.08), new THREE.MeshBasicMaterial({ color: 0xff3366 }));
scene.add(marker);
const raycaster = new THREE.Raycaster();
raycaster.params.Points.threshold = 0.05;
const pointer = new THREE.Vector2(9, 9);
renderer.domElement.addEventListener('pointermove', (e) => pointer.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1));

onFrame((t) => {
  points.rotation.y = t * 0.1;
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObject(points)[0];
  marker.visible = !!hit;
  if (hit) marker.position.copy(hit.point);
});
`
  }],
  props: [
    ['.geometry : BufferGeometry', '幾何體。'],
    ['.material : Material', '材質，通常為 PointsMaterial 或 ShaderMaterial。'],
    ['.morphTargetInfluences : Array', '變形權重。'],
  ],
  methods: [['.raycast( raycaster, intersects ) : undefined', '相交檢測，依 raycaster.params.Points.threshold 判定。']],
},
{
  id: 'api-line', title: 'Line', api: true, src: 'objects/Line.js', inherits: O3D,
  desc: '<p>依序連接所有頂點的連續線條。相關類別：<a href="#/api-linesegments">LineSegments</a>（每兩點一段）、<code>LineLoop</code>（首尾相連）。</p><p>注意：WebGL 限制下 <code>linewidth</code> 幾乎總是 1；需要粗線請使用附加模組 <code>Line2</code>。</p>',
  ctor: { sig: 'new Line( geometry : BufferGeometry, material : Material )' },
  examples: [{
    title: '虛線與 computeLineDistances',
    desc: 'LineDashedMaterial 需要先呼叫 line.computeLineDistances()。',
    code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 0, 6], lights: false });

const pts = [];
for (let i = 0; i <= 200; i++) {
  const t = (i / 200) * Math.PI * 2;
  pts.push(new THREE.Vector3(Math.sin(t * 3) * 2, Math.sin(t * 2) * 1.5, Math.cos(t * 5) * 0.5));
}
const geo = new THREE.BufferGeometry().setFromPoints(pts);

const solid = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0x4fc3f7 }));
solid.position.y = 0.9;
const dashed = new THREE.Line(geo, new THREE.LineDashedMaterial({ color: 0xffb74d, dashSize: 0.2, gapSize: 0.1 }));
dashed.computeLineDistances();
dashed.position.y = -0.9;
scene.add(solid, dashed);
console.log('lineDistance 屬性', dashed.geometry.attributes.lineDistance.count, '筆');

onFrame((t) => {
  solid.rotation.y = dashed.rotation.y = t * 0.4;
  dashed.material.dashSize = 0.15 + Math.sin(t * 2) * 0.1;
});
`
  }],
  props: [['.geometry : BufferGeometry', '頂點資料。'], ['.material : Material', 'LineBasicMaterial 或 LineDashedMaterial。']],
  methods: [
    ['.computeLineDistances() : this', '計算每個頂點到起點的累計距離（lineDistance attribute），LineDashedMaterial 需要。'],
    ['.raycast( raycaster, intersects ) : undefined', '相交檢測，依 raycaster.params.Line.threshold 判定。'],
  ],
},
{
  id: 'api-linesegments', title: 'LineSegments', api: true, src: 'objects/LineSegments.js', inherits: O3D.concat('Line'),
  desc: '<p>每兩個頂點組成一條獨立線段（頂點 0–1、2–3……）。常與 <code>EdgesGeometry</code>、<code>WireframeGeometry</code> 搭配使用。</p>',
  ctor: { sig: 'new LineSegments( geometry : BufferGeometry, material : Material )' },
  examples: [{
    title: 'EdgesGeometry 描邊',
    desc: 'EdgesGeometry 只保留夾角大於 thresholdAngle 的邊；WireframeGeometry 則顯示所有三角形邊。',
    code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 1, 6] });

const geo = new THREE.CylinderGeometry(0.8, 0.8, 1.6, 12, 3);
const left = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 15), new THREE.LineBasicMaterial({ color: 0xffffff }));
left.position.x = -1.5;
const right = new THREE.LineSegments(new THREE.WireframeGeometry(geo), new THREE.LineBasicMaterial({ color: 0x80cbc4 }));
right.position.x = 1.5;
const fill = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x37474f, polygonOffset: true, polygonOffsetFactor: 1 }));
fill.position.x = -1.5;
scene.add(left, right, fill);
console.log('EdgesGeometry 線段數', left.geometry.attributes.position.count / 2,
  '｜WireframeGeometry 線段數', right.geometry.attributes.position.count / 2);
onFrame((t) => { left.rotation.x = right.rotation.x = fill.rotation.x = t * 0.5; });
`
  }],
},
{
  id: 'api-sprite', title: 'Sprite', api: true, src: 'objects/Sprite.js', inherits: O3D,
  desc: '<p>永遠面向相機的平面，不會投射陰影。常用於標籤、血條、樹木貼片、粒子。搭配 <a href="#/api-spritematerial">SpriteMaterial</a>。</p>',
  ctor: { sig: 'new Sprite( material : SpriteMaterial )' },
  examples: [{
    title: '文字標籤',
    desc: '用 CanvasTexture 繪製文字作為 Sprite 的貼圖，旋轉視角時標籤永遠面向你。',
    code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene } = createStage({ grid: true, cameraPosition: [4, 4, 6] });

function makeLabel(text, color) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 64;
  const ctx = c.getContext('2d');
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.beginPath(); ctx.roundRect(0, 0, 256, 64, 16); ctx.fill();
  ctx.fillStyle = color; ctx.font = 'bold 34px sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 34);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex }));
  sprite.scale.set(1.6, 0.4, 1);   // 依 canvas 比例縮放
  sprite.center.set(0.5, 0);       // 錨點設在底部中央
  return sprite;
}

[['方塊', '#ff8a65', new THREE.BoxGeometry(1, 1, 1)], ['球體', '#4fc3f7', new THREE.SphereGeometry(0.6, 32, 16)], ['圓錐', '#aed581', new THREE.ConeGeometry(0.6, 1.2, 24)]]
  .forEach(([name, color, geo], i) => {
    const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color }));
    mesh.position.set((i - 1) * 2, 0.6, 0);
    const label = makeLabel(name, color);
    label.position.y = 0.9;
    mesh.add(label);
    scene.add(mesh);
  });
`
  }],
  props: [
    ['.material : SpriteMaterial', '材質。'],
    ['.center : Vector2', '錨點，預設 (0.5, 0.5) 為中心；(0.5, 0) 為底部中央。也是旋轉中心。'],
  ],
  methods: [['.raycast( raycaster, intersects ) : undefined', '相交檢測（需要 raycaster.camera，setFromCamera 會自動設定）。']],
},
{
  id: 'api-lod', title: 'LOD', api: true, src: 'objects/LOD.js', inherits: O3D,
  desc: '<p>Level of Detail（細節層級）：依物件與相機的距離切換不同精細度的模型。遠處使用低多邊形版本以節省效能。</p>',
  ctor: { sig: 'new LOD()' },
  examples: [{
    title: '依距離切換精細度',
    desc: '用滾輪拉近拉遠，球體的分段數會改變；console 顯示目前層級。',
    code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, camera, onFrame } = createStage({ cameraPosition: [0, 0, 6] });

const lod = new THREE.LOD();
const levels = [[48, 0], [16, 8], [6, 15], [3, 25]];   // [分段數, 距離]
const colors = [0x66bb6a, 0xffee58, 0xffa726, 0xef5350];
levels.forEach(([seg, dist], i) => {
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, seg, Math.max(2, seg / 2)),
    new THREE.MeshStandardMaterial({ color: colors[i], wireframe: true }));
  lod.addLevel(m, dist);
});
scene.add(lod);

let lastLevel = -1;
onFrame(() => {
  const level = lod.getCurrentLevel();   // 由 renderer 依 autoUpdate 自動更新
  if (level !== lastLevel) {
    lastLevel = level;
    console.log('距離', camera.position.distanceTo(lod.position).toFixed(1), '→ 層級', level, '（分段', levels[level][0] + '）');
  }
});
`
  }],
  props: [
    ['.levels : Array', '層級陣列，每個元素為 <code>{ object, distance, hysteresis }</code>。'],
    ['.autoUpdate : Boolean', '是否由渲染器每幀自動更新，預設 true。'],
  ],
  methods: [
    ['.addLevel( object : Object3D, distance : Float, hysteresis : Float ) : this', '新增層級。hysteresis（0–1）可避免在邊界來回閃爍。'],
    ['.removeLevel( distance : Float ) : Boolean', '移除指定距離的層級。'],
    ['.getCurrentLevel() : Integer', '目前使用的層級索引。'],
    ['.getObjectForDistance( distance : Float ) : Object3D', '取得指定距離應使用的物件。'],
    ['.update( camera : Camera ) : undefined', '手動依相機更新層級。'],
  ],
},
{
  id: 'api-skinnedmesh', title: 'SkinnedMesh', api: true, src: 'objects/SkinnedMesh.js', inherits: O3D.concat('Mesh'),
  desc: '<p>帶有骨架（<code>Skeleton</code>）的網格，頂點會依骨骼（<code>Bone</code>）的變換而變形，用於角色動畫。通常由 GLTFLoader 等載入器建立，再搭配 <a href="#/api-animationmixer">AnimationMixer</a> 播放動畫。幾何體需要 <code>skinIndex</code> 與 <code>skinWeight</code> attribute。</p>',
  ctor: { sig: 'new SkinnedMesh( geometry : BufferGeometry, material : Material )' },
  examples: [{
    title: '手動建立骨骼與蒙皮',
    desc: '一根圓柱由 4 根骨骼控制，以程式擺動骨骼即可讓圓柱彎曲。SkeletonHelper 顯示骨骼位置。',
    code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 3, 9], target: [0, 3, 0], grid: true });

const segH = 1.5, segs = 4, height = segH * segs;
const geo = new THREE.CylinderGeometry(0.4, 0.4, height, 12, segs * 4, false);
geo.translate(0, height / 2, 0);
const pos = geo.attributes.position, skinIndex = [], skinWeight = [];
for (let i = 0; i < pos.count; i++) {
  const y = pos.getY(i);
  const idx = Math.min(Math.floor(y / segH), segs - 1);
  const w = (y % segH) / segH;
  skinIndex.push(idx, Math.min(idx + 1, segs - 1), 0, 0);
  skinWeight.push(1 - w, w, 0, 0);
}
geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndex, 4));
geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeight, 4));

const bones = [];
let prev;
for (let i = 0; i <= segs; i++) {
  const b = new THREE.Bone();
  b.position.y = i === 0 ? 0 : segH;
  if (prev) prev.add(b);
  bones.push(b); prev = b;
}
const mesh = new THREE.SkinnedMesh(geo, new THREE.MeshStandardMaterial({ color: 0x7e57c2, flatShading: true }));
mesh.add(bones[0]);
mesh.bind(new THREE.Skeleton(bones));
scene.add(mesh, new THREE.SkeletonHelper(mesh));
console.log('骨骼數', mesh.skeleton.bones.length);

onFrame((t) => bones.forEach((b, i) => { b.rotation.z = Math.sin(t * 2 + i * 0.6) * 0.35; }));
`
  }],
  props: [
    ['.skeleton : Skeleton', '骨架。'],
    ['.bindMatrix : Matrix4', '綁定時的基礎矩陣。'],
    ['.bindMatrixInverse : Matrix4', 'bindMatrix 的反矩陣。'],
    ['.bindMode : String', '<code>"attached"</code>（預設，跟隨網格）或 <code>"detached"</code>。'],
  ],
  methods: [
    ['.bind( skeleton : Skeleton, bindMatrix : Matrix4 ) : undefined', '綁定骨架。'],
    ['.pose() : undefined', '回到綁定姿勢。'],
    ['.normalizeSkinWeights() : undefined', '正規化 skinWeight。'],
    ['.applyBoneTransform( index : Integer, vector : Vector3 ) : Vector3', '計算頂點經骨骼變形後的位置。'],
  ],
},
]}
);
})();
