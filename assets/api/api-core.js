/* API 參考：總覽、核心、場景、相機、渲染器
 * 成員格式：[簽名, 說明(HTML), 範例?]；範例為字串時為「只輸出 console」的片段，
 * 若未寫 import 會自動補上 import * as THREE from 'three'。
 */
(function () {
var code = String.raw;

window.DOCS.push(
{ group: 'API 總覽', section: 'api', items: [
{
  id: 'api', title: 'API 參考', en: 'Reference',
  html: '', // 由 api-addons.js 產生類別索引
},
{
  id: 'api-stage', title: '範例輔助模組', en: 'doc-stage',
  html: `
<p>API 參考中的視覺範例使用了一個小型輔助模組 <code>doc-stage</code>，替你建立好場景、相機、渲染器、OrbitControls、燈光與渲染迴圈，讓範例程式碼可以專注在被說明的 API 上。它<b>不是</b> three.js 的一部分，只存在於本文件的範例環境中。</p>
<pre class="code"><code>
import { createStage } from 'doc-stage';

const stage = createStage({
  background: 0x1e2027,        // 背景色
  cameraPosition: [3, 2.5, 5], // 相機位置
  target: [0, 0, 0],           // 注視點 / OrbitControls 中心
  fov: 50,
  controls: true,              // 是否建立 OrbitControls
  lights: true,                // 是否加入半球光 + 平行光
  grid: false,                 // true 或尺寸：加入 GridHelper
  axes: false,                 // true 或長度：加入 AxesHelper
  shadows: false,              // 開啟 renderer.shadowMap
});
const { scene, camera, renderer, controls, clock } = stage;

stage.onFrame((elapsedSeconds, deltaSeconds) =&gt; { /* 每幀呼叫 */ });
stage.onResize((width, height) =&gt; { /* 尺寸改變時呼叫 */ });
stage.render = () =&gt; composer.render(); // 可替換渲染函式（例如後期處理）
</code></pre>
<p>以下是它的完整原始碼，若要把範例搬到自己的專案，把這段存成檔案並調整 import 路徑即可：</p>
<pre class="code"><code>__STAGE_SRC__</code></pre>
`,
},
]},

/* ===================================================== 核心 */
{ group: '核心 Core', section: 'api', items: [

{
  id: 'api-object3d', title: 'Object3D', api: true, src: 'core/Object3D.js',
  inherits: ['EventDispatcher'],
  desc: `<p>three.js 中大多數物件的基底類別，提供在 3D 空間中操作物件的屬性與方法：位置、旋轉、縮放、父子階層與矩陣更新。<code>Mesh</code>、<code>Light</code>、<code>Camera</code>、<code>Group</code>、<code>Scene</code> 都繼承自它。</p>
<p>注意：多數方法（如 <code>lookAt</code>、<code>getWorldPosition</code>）會依賴 <code>matrixWorld</code>，若在渲染之前呼叫，必要時先執行 <code>updateMatrixWorld()</code>。</p>`,
  ctor: { sig: 'new Object3D()', desc: '建構子不接受參數。通常不會直接使用，而是使用 Group 或其子類別。' },
  examples: [{
    title: '階層與區域 / 世界座標',
    desc: '子物件的 position 是相對於父物件。旋轉父物件時，子物件跟著繞行；console 顯示子物件的區域座標與世界座標。',
    code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';

const { scene, onFrame } = createStage({ grid: true, cameraPosition: [4, 5, 7] });

const parent = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0x4f9cff }));
parent.name = 'parent';
parent.add(new THREE.AxesHelper(1.5));
scene.add(parent);

const child = new THREE.Mesh(new THREE.SphereGeometry(0.3), new THREE.MeshStandardMaterial({ color: 0xff7043 }));
child.name = 'child';
child.position.set(2, 0, 0);    // 相對於 parent
parent.add(child);

const world = new THREE.Vector3();
let last = 0;
onFrame((t) => {
  parent.rotation.y = t;
  parent.position.y = Math.sin(t) * 0.5 + 0.5;
  if (t - last > 1) {
    last = t;
    console.log('child 區域座標', child.position, '世界座標', child.getWorldPosition(world));
  }
});
`
  }],
  props: [
    ['.id : Integer', '唯一的遞增編號（唯讀）。'],
    ['.uuid : String', '物件的 UUID，自動產生，不應修改。'],
    ['.name : String', '物件名稱，預設為空字串。可配合 <code>getObjectByName()</code> 查找。'],
    ['.type : String', '類別名稱字串，例如 <code>"Mesh"</code>。'],
    ['.parent : Object3D', '父物件，一個物件只能有一個父物件。'],
    ['.children : Array', '子物件陣列。請使用 add / remove 修改，不要直接 push。'],
    ['.position : Vector3', '區域位置，預設 <code>(0, 0, 0)</code>。',
      "const obj = new THREE.Object3D();\nobj.position.set(1, 2, 3);\nobj.position.x += 5;\nconsole.log(obj.position);"],
    ['.rotation : Euler', '以弧度表示的區域旋轉。修改 rotation 會自動同步 quaternion。',
      "const obj = new THREE.Object3D();\nobj.rotation.y = Math.PI / 2;\nconsole.log('rotation', obj.rotation);\nconsole.log('同步後的 quaternion', obj.quaternion);"],
    ['.quaternion : Quaternion', '以四元數表示的區域旋轉，與 rotation 雙向同步。'],
    ['.scale : Vector3', '區域縮放，預設 <code>(1, 1, 1)</code>。'],
    ['.up : Vector3', '供 <code>lookAt()</code> 使用的「上」方向，預設為 <code>Object3D.DEFAULT_UP</code>，即 <code>(0, 1, 0)</code>。'],
    ['.matrix : Matrix4', '區域變換矩陣，由 position / quaternion / scale 組合。'],
    ['.matrixWorld : Matrix4', '世界變換矩陣（父矩陣 × 區域矩陣）。'],
    ['.matrixAutoUpdate : Boolean', '預設 true：每幀自動由 position / rotation / scale 重算 matrix。靜態物件可設為 false 以節省運算，但之後修改變換時須手動呼叫 <code>updateMatrix()</code>。'],
    ['.matrixWorldAutoUpdate : Boolean', '預設 true：渲染時自動更新 matrixWorld。'],
    ['.matrixWorldNeedsUpdate : Boolean', '設為 true 時，下一次 updateMatrixWorld 會強制重算。'],
    ['.visible : Boolean', '預設 true。設為 false 時物件與其子物件都不會被繪製。'],
    ['.castShadow : Boolean', '是否投射陰影，預設 false。'],
    ['.receiveShadow : Boolean', '是否接收陰影，預設 false。'],
    ['.frustumCulled : Boolean', '預設 true：物件在相機視錐外時不繪製。若頂點由著色器移動導致被錯誤剔除，可設為 false。'],
    ['.renderOrder : Number', '覆寫繪製順序（數字小者先畫）。常用於處理透明物件的排序問題。'],
    ['.layers : Layers', '物件所屬的圖層。只有與相機圖層有交集的物件才會被繪製。'],
    ['.userData : Object', '存放自訂資料的物件。<code>clone()</code> 與 <code>toJSON()</code> 會一併複製（不可包含函式參照）。'],
    ['.animations : Array', '此物件的 AnimationClip 陣列（例如由載入器填入）。'],
  ],
  methods: [
    ['.add( object : Object3D, ... ) : this', '加入一個或多個子物件。若該物件已有父物件，會先從原父物件移除。',
      "const group = new THREE.Group();\nconst a = new THREE.Object3D(), b = new THREE.Object3D();\ngroup.add(a, b);\nconsole.log('子物件數', group.children.length);\nconsole.log('a 的父物件是 group？', a.parent === group);"],
    ['.remove( object : Object3D, ... ) : this', '移除子物件。注意：不會釋放幾何體或材質的 GPU 資源。'],
    ['.removeFromParent() : this', '把自己從父物件中移除。'],
    ['.clear() : this', '移除所有子物件。'],
    ['.attach( object : Object3D ) : this', '加入子物件，但<b>保持其世界變換不變</b>（會自動換算區域座標）。',
      "const parent = new THREE.Object3D();\nparent.position.set(10, 0, 0);\nparent.updateMatrixWorld();\n\nconst a = new THREE.Object3D();\na.position.set(1, 0, 0);\nconst b = a.clone();\n\nparent.add(a);     // 區域座標保持 (1,0,0) → 世界座標變成 (11,0,0)\nparent.attach(b);  // 世界座標保持 (1,0,0) → 區域座標變成 (-9,0,0)\nconsole.log('add    → local', a.position, 'world', a.getWorldPosition(new THREE.Vector3()));\nconsole.log('attach → local', b.position, 'world', b.getWorldPosition(new THREE.Vector3()));"],
    ['.getObjectByName( name : String ) : Object3D', '遞迴搜尋第一個名稱符合的子孫物件（包含自己）。',
      "const scene = new THREE.Scene();\nconst car = new THREE.Group(); car.name = 'car';\nconst wheel = new THREE.Object3D(); wheel.name = 'wheel';\ncar.add(wheel); scene.add(car);\nconsole.log(scene.getObjectByName('wheel'));\nconsole.log(scene.getObjectByName('nothing'));"],
    ['.getObjectById( id : Integer ) : Object3D', '依 id 搜尋子孫物件。'],
    ['.getObjectByProperty( name : String, value : any ) : Object3D', '依任意屬性值搜尋第一個符合的物件。'],
    ['.getObjectsByProperty( name : String, value : any, optionalTarget : Array ) : Array', '回傳所有屬性值符合的物件。'],
    ['.getWorldPosition( target : Vector3 ) : Vector3', '把世界座標寫入 target 並回傳。'],
    ['.getWorldQuaternion( target : Quaternion ) : Quaternion', '取得世界旋轉。'],
    ['.getWorldScale( target : Vector3 ) : Vector3', '取得世界縮放。'],
    ['.getWorldDirection( target : Vector3 ) : Vector3', '取得物件 +Z 軸（相機則為 -Z，即視線方向）在世界座標中的方向。',
      "const cam = new THREE.PerspectiveCamera();\ncam.lookAt(1, 0, 0);\nconsole.log('相機視線方向', cam.getWorldDirection(new THREE.Vector3()));"],
    ['.localToWorld( vector : Vector3 ) : Vector3', '把區域座標轉換為世界座標（直接修改傳入的向量）。'],
    ['.worldToLocal( vector : Vector3 ) : Vector3', '把世界座標轉換為區域座標。',
      "const o = new THREE.Object3D();\no.position.set(5, 0, 0);\no.rotation.y = Math.PI / 2;\no.updateMatrixWorld();\nconst p = new THREE.Vector3(1, 0, 0);\nconsole.log('localToWorld', o.localToWorld(p.clone()));\nconsole.log('worldToLocal', o.worldToLocal(new THREE.Vector3(5, 0, -1)));"],
    ['.lookAt( vector : Vector3 ) : undefined<br>.lookAt( x : Float, y : Float, z : Float ) : undefined', '旋轉物件使其 +Z 軸朝向世界座標中的某點（相機與光源則是 -Z 軸）。不支援父物件有非等比縮放的情況。', {
      title: '物件朝向移動中的目標',
      code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ grid: true, cameraPosition: [5, 6, 8] });

const target = new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial({ color: 0xffcc00 }));
scene.add(target);

const cones = [];
for (let i = 0; i < 9; i++) {
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.8, 12).rotateX(Math.PI / 2), new THREE.MeshNormalMaterial());
  cone.position.set((i % 3 - 1) * 2, 0.5, (Math.floor(i / 3) - 1) * 2);
  scene.add(cone);
  cones.push(cone);
}
onFrame((t) => {
  target.position.set(Math.cos(t) * 3, 1 + Math.sin(t * 2), Math.sin(t) * 3);
  cones.forEach((c) => c.lookAt(target.position));
});
`}],
    ['.rotateOnAxis( axis : Vector3, angle : Float ) : this', '繞區域座標中的軸旋轉（axis 須為單位向量）。'],
    ['.rotateOnWorldAxis( axis : Vector3, angle : Float ) : this', '繞世界座標中的軸旋轉。'],
    ['.rotateX( rad : Float ) : this', '繞區域 X 軸旋轉。rotateY、rotateZ 同理。'],
    ['.translateOnAxis( axis : Vector3, distance : Float ) : this', '沿區域座標軸移動。'],
    ['.translateX( distance : Float ) : this', '沿區域 X 軸移動。translateY、translateZ 同理。常用於「往物件前方前進」。',
      "const o = new THREE.Object3D();\no.rotation.y = Math.PI / 2; // 旋轉後，自身 +Z 軸指向世界 +X\no.translateZ(10);           // 沿自己的 +Z 前進\nconsole.log(o.position);"],
    ['.setRotationFromAxisAngle( axis : Vector3, angle : Float ) : undefined', '以軸角設定旋轉。'],
    ['.setRotationFromEuler( euler : Euler ) : undefined', '以 Euler 設定旋轉。'],
    ['.setRotationFromMatrix( m : Matrix4 ) : undefined', '以旋轉矩陣設定旋轉。'],
    ['.setRotationFromQuaternion( q : Quaternion ) : undefined', '以四元數設定旋轉。'],
    ['.applyMatrix4( matrix : Matrix4 ) : undefined', '套用矩陣到物件，並更新 position、quaternion、scale。'],
    ['.applyQuaternion( q : Quaternion ) : this', '套用旋轉。'],
    ['.updateMatrix() : undefined', '由 position / quaternion / scale 重算區域矩陣。'],
    ['.updateMatrixWorld( force : Boolean ) : undefined', '更新自己與所有子孫的世界矩陣。'],
    ['.updateWorldMatrix( updateParents : Boolean, updateChildren : Boolean ) : undefined', '更精細地控制是否更新祖先 / 子孫的世界矩陣。'],
    ['.traverse( callback : Function ) : undefined', '對自己與所有子孫執行 callback。callback 內不應新增或移除物件。',
      "const root = new THREE.Group(); root.name = 'root';\nconst a = new THREE.Group(); a.name = 'a';\na.add(new THREE.Mesh());\nroot.add(a, new THREE.PointLight());\nroot.traverse((o) => console.log(o.type, o.name || ''));\n\nlet meshes = 0;\nroot.traverse((o) => { if (o.isMesh) meshes++; });\nconsole.log('Mesh 數量', meshes);"],
    ['.traverseVisible( callback : Function ) : undefined', '同 traverse，但略過 visible 為 false 的物件。'],
    ['.traverseAncestors( callback : Function ) : undefined', '對所有祖先執行 callback。'],
    ['.clone( recursive : Boolean ) : Object3D', '複製物件（預設遞迴複製子物件）。幾何體與材質以參照共用，並未複製。'],
    ['.copy( object : Object3D, recursive : Boolean ) : this', '從另一物件複製屬性。'],
    ['.toJSON( meta : Object ) : Object', '轉換為 three.js JSON 格式，可用 ObjectLoader 讀回。'],
    ['.raycast( raycaster : Raycaster, intersects : Array ) : undefined', '供 Raycaster 呼叫的相交檢測，子類別會實作。'],
    ['.onBeforeRender : Function', '渲染此物件前呼叫的回呼 <code>(renderer, scene, camera, geometry, material, group)</code>。只對可繪製物件（Mesh、Line、Points、Sprite）有效。'],
    ['.onAfterRender : Function', '渲染此物件後呼叫的回呼。'],
    ['.addEventListener( type : String, listener : Function ) : undefined', '（繼承自 EventDispatcher）監聽事件。Object3D 會發出 <code>added</code>、<code>removed</code>、<code>childadded</code>、<code>childremoved</code> 事件。',
      "const g = new THREE.Group();\nconst m = new THREE.Object3D();\nm.addEventListener('added', () => console.log('m 被加入了'));\nm.addEventListener('removed', () => console.log('m 被移除了'));\ng.addEventListener('childadded', (e) => console.log('g 新增子物件', e.child.type));\ng.add(m);\ng.remove(m);"],
  ],
  statics: [
    ['DEFAULT_UP : Vector3', '新物件 <code>up</code> 的預設值 <code>(0, 1, 0)</code>。若要讓整個場景以 Z 軸為上方，可在建立物件前修改它。'],
    ['DEFAULT_MATRIX_AUTO_UPDATE : Boolean', 'matrixAutoUpdate 的預設值（true）。'],
  ],
},

{
  id: 'api-eventdispatcher', title: 'EventDispatcher', api: true, src: 'core/EventDispatcher.js',
  desc: '<p>為自訂物件提供事件機制的類別。<code>Object3D</code>、<code>BufferGeometry</code>、<code>Material</code>、<code>Texture</code>、控制器等都繼承自它。</p>',
  ctor: { sig: 'new EventDispatcher()' },
  examples: [{
    title: '自訂類別的事件', consoleOnly: true,
    code: code`
import * as THREE from 'three';

class Player extends THREE.EventDispatcher {
  constructor() { super(); this.hp = 100; }
  hit(damage) {
    this.hp -= damage;
    this.dispatchEvent({ type: 'damaged', damage, hp: this.hp });
    if (this.hp <= 0) this.dispatchEvent({ type: 'dead' });
  }
}

const p = new Player();
const onDamaged = (e) => console.log('受到', e.damage, '點傷害，剩下', e.hp);
p.addEventListener('damaged', onDamaged);
p.addEventListener('dead', () => console.log('玩家倒下'));

p.hit(30);
p.hit(50);
console.log('有 damaged 監聽器？', p.hasEventListener('damaged', onDamaged));
p.removeEventListener('damaged', onDamaged);
p.hit(40); // 不會再印出傷害訊息
`
  }],
  methods: [
    ['.addEventListener( type : String, listener : Function ) : undefined', '加入監聽器。'],
    ['.hasEventListener( type : String, listener : Function ) : Boolean', '檢查是否已註冊該監聽器。'],
    ['.removeEventListener( type : String, listener : Function ) : undefined', '移除監聽器。'],
    ['.dispatchEvent( event : Object ) : undefined', '發出事件，event 必須含 <code>type</code> 屬性。監聽器收到的 event 會被加上 <code>target</code>。'],
  ],
},

{
  id: 'api-buffergeometry', title: 'BufferGeometry', api: true, src: 'core/BufferGeometry.js',
  inherits: ['EventDispatcher'],
  desc: `<p>網格、線條與點的幾何資料表示法。資料以 <a href="#/api-bufferattribute">BufferAttribute</a> 儲存（位置、法線、UV、顏色……），可以高效率地傳給 GPU。所有內建幾何體（BoxGeometry 等）都是它的子類別。</p>
<p>常見的 attribute 名稱：<code>position</code>（itemSize 3）、<code>normal</code>（3）、<code>uv</code>（2）、<code>color</code>（3 或 4）。</p>`,
  ctor: { sig: 'new BufferGeometry()', desc: '建立一個沒有任何 attribute 的空幾何體。' },
  examples: [{
    title: '從零建立一個四邊形（索引式）',
    desc: '用 4 個頂點與 6 個索引組成 2 個三角形，並加上 UV 與頂點色。',
    code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene } = createStage({ cameraPosition: [0, 0, 3], lights: false });

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.Float32BufferAttribute([
  -1, -1, 0,   1, -1, 0,   1, 1, 0,   -1, 1, 0,
], 3));
geometry.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2));
geometry.setAttribute('color', new THREE.Float32BufferAttribute([
  1, 0, 0,   0, 1, 0,   0, 0, 1,   1, 1, 0,
], 3));
geometry.setIndex([0, 1, 2,  0, 2, 3]);
geometry.computeVertexNormals();
geometry.computeBoundingBox();

scene.add(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide })));
console.log('attributes：', Object.keys(geometry.attributes).join(', '));
console.log('index.count =', geometry.index.count, '｜boundingBox =', geometry.boundingBox);
`
  }],
  props: [
    ['.attributes : Object', '以名稱為鍵的 BufferAttribute 表。請使用 setAttribute / getAttribute 操作。'],
    ['.index : BufferAttribute', '索引緩衝區，讓多個三角形共用頂點。null 表示非索引幾何體（每 3 個頂點一個三角形）。'],
    ['.groups : Array', '把幾何體分成多段，每段可使用材質陣列中不同的材質。每個元素為 <code>{ start, count, materialIndex }</code>。'],
    ['.drawRange : Object', '<code>{ start, count }</code>，只繪製一部分頂點 / 索引。可用於「逐漸畫出」的動畫。', {
      title: 'drawRange 逐步繪製',
      code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 0, 6] });

const curve = new THREE.CatmullRomCurve3(
  Array.from({ length: 12 }, (_, i) => new THREE.Vector3(Math.cos(i) * 2, Math.sin(i * 1.7), Math.sin(i) * 2)), true);
const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(600));
const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0x00e5ff }));
scene.add(line);

const total = geo.attributes.position.count;
onFrame((t) => geo.setDrawRange(0, Math.floor(((t * 0.25) % 1) * total)));
`}],
    ['.boundingBox : Box3', '包圍盒，預設 null，需呼叫 computeBoundingBox()。'],
    ['.boundingSphere : Sphere', '包圍球，預設 null。用於視錐剔除與 Raycaster；修改頂點後應重算。'],
    ['.morphAttributes : Object', '變形目標（morph target）資料。'],
    ['.morphTargetsRelative : Boolean', '變形目標是否為相對位移。'],
    ['.name : String', '名稱。'],
    ['.userData : Object', '自訂資料。'],
    ['.id / .uuid', '唯一識別碼。'],
  ],
  methods: [
    ['.setAttribute( name : String, attribute : BufferAttribute ) : this', '設定 attribute。'],
    ['.getAttribute( name : String ) : BufferAttribute', '取得 attribute。'],
    ['.deleteAttribute( name : String ) : this', '刪除 attribute。'],
    ['.hasAttribute( name : String ) : Boolean', '是否存在該 attribute。'],
    ['.setIndex( index : BufferAttribute | Array ) : this', '設定索引。傳入陣列時會依大小自動選擇 Uint16 或 Uint32。'],
    ['.getIndex() : BufferAttribute', '取得索引。'],
    ['.addGroup( start : Integer, count : Integer, materialIndex : Integer ) : undefined', '新增一個群組。', {
      title: '多材質群組',
      code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 1, 4] });

// PlaneGeometry 有 6 個索引（2 個三角形）；這裡把它拆成兩個群組
const geo = new THREE.PlaneGeometry(2, 2);
geo.clearGroups();
geo.addGroup(0, 3, 0); // 第 1 個三角形用材質 0
geo.addGroup(3, 3, 1); // 第 2 個三角形用材質 1
const mesh = new THREE.Mesh(geo, [
  new THREE.MeshBasicMaterial({ color: 0xff5555, side: THREE.DoubleSide }),
  new THREE.MeshBasicMaterial({ color: 0x55aaff, side: THREE.DoubleSide }),
]);
scene.add(mesh);

// BoxGeometry 預設就有 6 個群組（每面一個）
const box = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8),
  [0xe53935, 0xfb8c00, 0xfdd835, 0x43a047, 0x1e88e5, 0x8e24aa].map((c) => new THREE.MeshStandardMaterial({ color: c })));
box.position.y = 1.5;
scene.add(box);
console.log('BoxGeometry.groups =', box.geometry.groups);
onFrame((t) => { box.rotation.set(t * 0.5, t, 0); });
`}],
    ['.clearGroups() : undefined', '清除所有群組。'],
    ['.setDrawRange( start : Integer, count : Integer ) : undefined', '設定 drawRange。'],
    ['.computeVertexNormals() : undefined', '依面計算頂點法線（索引幾何體會平均共用頂點的法線，產生平滑效果）。'],
    ['.computeBoundingBox() : undefined', '計算 boundingBox。'],
    ['.computeBoundingSphere() : undefined', '計算 boundingSphere。'],
    ['.computeTangents() : undefined', '計算切線（需要 index、position、normal、uv），供 normalMap 使用。'],
    ['.center() : this', '把幾何體平移，使包圍盒中心位於原點。',
      "const g = new THREE.BoxGeometry(1, 1, 1).translate(5, 2, 0);\ng.computeBoundingBox();\nconsole.log('平移後', g.boundingBox);\ng.center();\ng.computeBoundingBox();\nconsole.log('center() 後', g.boundingBox);"],
    ['.translate( x : Float, y : Float, z : Float ) : this', '直接平移頂點資料（通常只做一次，不適合每幀呼叫）。'],
    ['.rotateX( radians : Float ) : this', '直接旋轉頂點資料。rotateY、rotateZ 同理。'],
    ['.scale( x : Float, y : Float, z : Float ) : this', '直接縮放頂點資料。'],
    ['.lookAt( vector : Vector3 ) : this', '旋轉幾何體使其朝向某點。'],
    ['.applyMatrix4( matrix : Matrix4 ) : this', '把矩陣套用到頂點與法線。'],
    ['.applyQuaternion( q : Quaternion ) : this', '把旋轉套用到頂點。'],
    ['.setFromPoints( points : Array ) : this', '由 Vector3（或 Vector2）陣列設定 position attribute，常用於線條。'],
    ['.toNonIndexed() : BufferGeometry', '回傳非索引版本（每個三角形擁有獨立頂點），常用於平面著色或逐面上色。',
      "const g = new THREE.BoxGeometry();\nconsole.log('索引式頂點數', g.attributes.position.count, '索引數', g.index.count);\nconst n = g.toNonIndexed();\nconsole.log('非索引頂點數', n.attributes.position.count, 'index =', n.index);"],
    ['.clone() : BufferGeometry', '複製幾何體。'],
    ['.copy( bufferGeometry : BufferGeometry ) : this', '複製另一幾何體的資料。'],
    ['.dispose() : undefined', '釋放 GPU 資源。不再使用幾何體時必須呼叫，否則會造成記憶體洩漏。'],
    ['.toJSON() : Object', '轉換為 JSON。'],
  ],
},

{
  id: 'api-bufferattribute', title: 'BufferAttribute', api: true, src: 'core/BufferAttribute.js',
  desc: `<p>儲存 BufferGeometry 單一屬性（例如位置）的資料，背後是一個型別化陣列（TypedArray）。<code>itemSize</code> 表示每個頂點占用幾個數值。</p>
<p>便利子類別：<code>Float32BufferAttribute</code>、<code>Uint16BufferAttribute</code>、<code>Uint32BufferAttribute</code>、<code>Int8BufferAttribute</code> 等，可直接傳入一般陣列。另外 <code>InstancedBufferAttribute</code> 用於每個實例一筆資料。</p>`,
  ctor: { sig: 'new BufferAttribute( array : TypedArray, itemSize : Integer, normalized : Boolean )', params: [
    ['array', 'TypedArray', '資料陣列，長度應為 itemSize × 頂點數。'],
    ['itemSize', 'Integer', '每個頂點的分量數，例如 position 為 3、uv 為 2。'],
    ['normalized', 'Boolean', '（選填）整數資料是否正規化到 0–1 / -1–1。預設 false。'],
  ]},
  examples: [{
    title: '讀寫 attribute', consoleOnly: true,
    code: code`
import * as THREE from 'three';

const pos = new THREE.BufferAttribute(new Float32Array([0, 0, 0,  1, 2, 3,  4, 5, 6]), 3);
console.log('count =', pos.count, ' itemSize =', pos.itemSize);
console.log('第 1 個頂點 =', pos.getX(1), pos.getY(1), pos.getZ(1));

pos.setXYZ(2, 9, 9, 9);
console.log('修改後 array =', Array.from(pos.array));

// 用 Vector3 讀取
const v = new THREE.Vector3().fromBufferAttribute(pos, 1);
console.log('fromBufferAttribute →', v);

// 修改資料後若已上傳 GPU，需要標記更新
pos.needsUpdate = true;
console.log('version =', pos.version);
`
  }],
  props: [
    ['.array : TypedArray', '實際資料。'],
    ['.itemSize : Integer', '每個頂點的分量數。'],
    ['.count : Integer', '頂點數（array.length / itemSize），唯讀。'],
    ['.normalized : Boolean', '是否正規化。'],
    ['.needsUpdate : Boolean', '設為 true 會在下次渲染時重新上傳資料到 GPU，並增加 version。'],
    ['.usage : Usage', '使用提示：<code>StaticDrawUsage</code>（預設）、<code>DynamicDrawUsage</code>（每幀都會改動時使用）。'],
    ['.updateRanges : Array', '只上傳部分資料的範圍，透過 addUpdateRange(start, count) 新增。'],
    ['.version : Integer', '每次 needsUpdate 設為 true 時遞增。'],
    ['.name : String', '名稱。'],
  ],
  methods: [
    ['.getX( index : Integer ) : Number', '取得第 index 個頂點的 x 分量。另有 getY、getZ、getW。'],
    ['.setX( index : Integer, x : Number ) : this', '設定 x 分量。另有 setY、setZ、setW。'],
    ['.setXY( index, x, y ) : this', '一次設定 x、y。另有 setXYZ、setXYZW。'],
    ['.getComponent( index : Integer, component : Integer ) : Number', '取得任意分量。'],
    ['.set( value : Array, offset : Integer ) : this', '把陣列複製到 array 的指定位置。'],
    ['.setUsage( usage : Usage ) : this', '設定 usage，需在第一次渲染前呼叫。'],
    ['.addUpdateRange( start : Integer, count : Integer ) : undefined', '新增部分更新範圍。'],
    ['.clearUpdateRanges() : undefined', '清除更新範圍。'],
    ['.applyMatrix4( m : Matrix4 ) : this', '把矩陣套用到每個頂點（itemSize 須為 3）。'],
    ['.clone() : BufferAttribute', '複製。'],
    ['.copyArray( array : Array ) : this', '從陣列複製資料。'],
  ],
},

{
  id: 'api-raycaster', title: 'Raycaster', api: true, src: 'core/Raycaster.js',
  desc: '<p>射線投射，用來找出射線與哪些物件相交。最常見的用途是滑鼠拾取（判斷游標下方的物件），也可用於碰撞偵測、視線判定等。</p>',
  ctor: { sig: 'new Raycaster( origin : Vector3, direction : Vector3, near : Float, far : Float )', params: [
    ['origin', 'Vector3', '射線起點。'],
    ['direction', 'Vector3', '射線方向，必須是單位向量。'],
    ['near', 'Float', '只回傳距離大於 near 的結果，預設 0。'],
    ['far', 'Float', '只回傳距離小於 far 的結果，預設 Infinity。'],
  ]},
  examples: [{
    title: '滑鼠拾取與交點資訊',
    desc: '把游標移到物件上：顯示交點、面法線，並在 console 印出 intersection 物件的內容。',
    code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, camera, renderer, onFrame } = createStage({ cameraPosition: [0, 3, 7] });

const objects = [];
const geos = [new THREE.BoxGeometry(1.4, 1.4, 1.4), new THREE.SphereGeometry(0.9, 32, 16), new THREE.TorusKnotGeometry(0.6, 0.2, 100, 16)];
geos.forEach((g, i) => {
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0x8899aa }));
  m.position.x = (i - 1) * 2.6;
  m.name = g.type;
  scene.add(m);
  objects.push(m);
});

const marker = new THREE.Mesh(new THREE.SphereGeometry(0.06), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
const normalArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(), 0.7, 0xffff00);
scene.add(marker, normalArrow);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2(9, 9);
renderer.domElement.addEventListener('pointermove', (e) => {
  pointer.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
});
renderer.domElement.addEventListener('click', () => {
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(objects)[0];
  if (hit) console.log(hit.object.name, '｜distance', hit.distance.toFixed(3), '｜point', hit.point, '｜faceIndex', hit.faceIndex, '｜uv', hit.uv);
});

const n = new THREE.Vector3();
onFrame(() => {
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(objects, false)[0];
  objects.forEach((o) => o.material.color.set(o === (hit && hit.object) ? 0xff9800 : 0x8899aa));
  marker.visible = normalArrow.visible = !!hit;
  if (hit) {
    marker.position.copy(hit.point);
    n.copy(hit.face.normal).transformDirection(hit.object.matrixWorld);
    normalArrow.position.copy(hit.point);
    normalArrow.setDirection(n);
  }
});
console.log('移動滑鼠到物件上，點擊可印出相交資訊');
`
  }],
  props: [
    ['.ray : Ray', '實際用於計算的射線。'],
    ['.near : Float', '最小距離。'],
    ['.far : Float', '最大距離。'],
    ['.camera : Camera', '用於 Sprite 等需要相機的相交計算，setFromCamera 會自動設定。'],
    ['.layers : Layers', '只檢測與此圖層有交集的物件。'],
    ['.params : Object', '各類物件的額外參數：<code>{ Mesh: {}, Line: { threshold: 1 }, LOD: {}, Points: { threshold: 1 }, Sprite: {} }</code>。線條與點的 threshold 決定「多近算命中」。'],
  ],
  methods: [
    ['.set( origin : Vector3, direction : Vector3 ) : undefined', '設定射線起點與方向（方向需正規化）。', {
      title: '向下射線：偵測地面高度',
      code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [6, 6, 8] });

// 起伏地形
const geo = new THREE.PlaneGeometry(10, 10, 60, 60).rotateX(-Math.PI / 2);
const p = geo.attributes.position;
for (let i = 0; i < p.count; i++) p.setY(i, Math.sin(p.getX(i)) * Math.cos(p.getZ(i) * 0.8) * 0.8);
geo.computeVertexNormals();
const ground = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x4caf50, flatShading: true }));
scene.add(ground);

const ball = new THREE.Mesh(new THREE.SphereGeometry(0.25), new THREE.MeshStandardMaterial({ color: 0xff5252 }));
scene.add(ball);

const ray = new THREE.Raycaster();
const down = new THREE.Vector3(0, -1, 0);
const origin = new THREE.Vector3();
onFrame((t) => {
  origin.set(Math.cos(t * 0.6) * 4, 10, Math.sin(t * 0.9) * 4);
  ray.set(origin, down);
  const hit = ray.intersectObject(ground)[0];
  if (hit) ball.position.copy(hit.point).y += 0.25; // 球貼著地面滑動
});
`}],
    ['.setFromCamera( coords : Vector2, camera : Camera ) : undefined', '以相機與標準化裝置座標（NDC，-1 到 1）設定射線。'],
    ['.setFromXRController( controller : WebXRController ) : this', '以 XR 控制器的姿態設定射線。'],
    ['.intersectObject( object : Object3D, recursive : Boolean, optionalTarget : Array ) : Array', '檢測與單一物件（recursive 預設 true，含子孫）的相交，依距離排序回傳。<br>每個結果包含：<code>distance</code>、<code>point</code>、<code>face</code>、<code>faceIndex</code>、<code>object</code>、<code>uv</code>、<code>uv1</code>、<code>normal</code>、<code>instanceId</code>（InstancedMesh）。'],
    ['.intersectObjects( objects : Array, recursive : Boolean, optionalTarget : Array ) : Array', '檢測與多個物件的相交。'],
  ],
},

{
  id: 'api-clock', title: 'Clock', api: true, src: 'core/Clock.js',
  desc: '<p>追蹤時間的物件，使用 <code>performance.now()</code>。常用於讓動畫速度與幀率無關。（r168 起另有 addons 中的 <code>Timer</code>，會在分頁隱藏時自動暫停。）</p>',
  ctor: { sig: 'new Clock( autoStart : Boolean )', params: [['autoStart', 'Boolean', '（選填）第一次呼叫 getDelta 時是否自動開始，預設 true。']] },
  examples: [{
    title: 'getDelta 與 getElapsedTime', consoleOnly: true,
    code: code`
import * as THREE from 'three';

const clock = new THREE.Clock();
let n = 0;
const id = setInterval(() => {
  const dt = clock.getDelta();
  console.log('第', ++n, '次｜delta =', dt.toFixed(3), '秒｜elapsed =', clock.getElapsedTime().toFixed(3), '秒');
  if (n === 3) { clock.stop(); console.log('stop() → running =', clock.running); }
  if (n === 5) clearInterval(id);
}, 300);
`
  }],
  props: [
    ['.autoStart : Boolean', '是否自動開始。'],
    ['.startTime : Float', '呼叫 start 時的時間戳（毫秒）。'],
    ['.oldTime : Float', '上次 start / getElapsedTime / getDelta 的時間戳。'],
    ['.elapsedTime : Float', '累計經過的秒數。'],
    ['.running : Boolean', '是否正在計時。'],
  ],
  methods: [
    ['.start() : undefined', '開始計時，並把 elapsedTime 歸零。'],
    ['.stop() : undefined', '停止計時。'],
    ['.getElapsedTime() : Float', '回傳自開始以來的秒數（並更新 oldTime）。'],
    ['.getDelta() : Float', '回傳距離上次呼叫的秒數。注意：getElapsedTime 也會更新 oldTime，混用時要小心。'],
  ],
},

{
  id: 'api-layers', title: 'Layers', api: true, src: 'core/Layers.js',
  desc: '<p>圖層遮罩，共 32 個圖層（0–31）。物件與相機都有 <code>layers</code>，只有兩者有交集時物件才會被繪製；Raycaster 也可依圖層篩選。所有物件預設屬於圖層 0。</p>',
  ctor: { sig: 'new Layers()', desc: '建立一個只啟用圖層 0 的遮罩。' },
  examples: [{
    title: '切換相機可見圖層',
    desc: '紅色物件在圖層 1、藍色在圖層 2。點擊按鈕切換相機看得見的圖層。',
    code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, camera } = createStage({ grid: true, cameraPosition: [0, 3, 7] });
// 光源也需要在對應圖層中才會照亮（這裡讓所有光源在全部圖層中）
scene.traverse((o) => { if (o.isLight) o.layers.enableAll(); });

for (let i = 0; i < 6; i++) {
  const red = i % 2 === 0;
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), new THREE.MeshStandardMaterial({ color: red ? 0xef5350 : 0x42a5f5 }));
  m.position.set((i - 2.5) * 1.2, 0.4, 0);
  m.layers.set(red ? 1 : 2);
  scene.add(m);
}
camera.layers.enable(1);
camera.layers.enable(2);

const bar = document.createElement('div');
bar.style.cssText = 'position:absolute;top:10px;left:10px;display:flex;gap:6px';
[1, 2].forEach((n) => {
  const b = document.createElement('button');
  b.textContent = '切換圖層 ' + n + (n === 1 ? '（紅）' : '（藍）');
  b.onclick = () => { camera.layers.toggle(n); console.log('camera.layers.mask =', camera.layers.mask.toString(2).padStart(3, '0')); };
  bar.appendChild(b);
});
document.body.appendChild(bar);
`
  }],
  props: [['.mask : Integer', '以 32 位元整數儲存的圖層位元遮罩。']],
  methods: [
    ['.set( layer : Integer ) : undefined', '只啟用指定圖層（其他全部關閉）。'],
    ['.enable( layer : Integer ) : undefined', '加入圖層。'],
    ['.enableAll() : undefined', '啟用全部圖層。'],
    ['.disable( layer : Integer ) : undefined', '移除圖層。'],
    ['.disableAll() : undefined', '關閉全部圖層。'],
    ['.toggle( layer : Integer ) : undefined', '切換圖層。'],
    ['.test( layers : Layers ) : Boolean', '與另一個 Layers 是否至少有一個共同圖層。'],
    ['.isEnabled( layer : Integer ) : Boolean', '是否啟用指定圖層。'],
  ],
},
]},

/* ===================================================== 場景 */
{ group: '場景 Scenes', section: 'api', items: [
{
  id: 'api-scene', title: 'Scene', api: true, src: 'scenes/Scene.js',
  inherits: ['EventDispatcher', 'Object3D'],
  desc: '<p>場景是放置物件、光源與相機的地方，也是 <code>renderer.render(scene, camera)</code> 的繪製對象。</p>',
  ctor: { sig: 'new Scene()' },
  examples: [{
    title: '背景、環境貼圖與模糊',
    desc: '以 RoomEnvironment 產生環境貼圖，同時作為 background 與 environment。調整 backgroundBlurriness、backgroundIntensity、environmentIntensity。',
    code: code`
import * as THREE from 'three';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createStage } from 'doc-stage';
const { scene, renderer } = createStage({ lights: false, cameraPosition: [0, 0.5, 4] });

const envMap = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
scene.background = envMap;
scene.environment = envMap;   // 所有 PBR 材質都會反射這張環境貼圖

const mats = [
  new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0 }),
  new THREE.MeshStandardMaterial({ color: 0xff6633, metalness: 0.3, roughness: 0.4 }),
  new THREE.MeshStandardMaterial({ color: 0x3399ff, metalness: 0, roughness: 0.9 }),
];
mats.forEach((m, i) => {
  const s = new THREE.Mesh(new THREE.SphereGeometry(0.55, 64, 32), m);
  s.position.x = (i - 1) * 1.3;
  scene.add(s);
});

scene.backgroundBlurriness = 0.3;
const gui = new GUI();
gui.add(scene, 'backgroundBlurriness', 0, 1, 0.01);
gui.add(scene, 'backgroundIntensity', 0, 2, 0.01);
gui.add(scene, 'environmentIntensity', 0, 3, 0.01);
gui.add(scene.backgroundRotation, 'y', 0, Math.PI * 2, 0.01).name('backgroundRotation.y');
gui.add(scene.environmentRotation, 'y', 0, Math.PI * 2, 0.01).name('environmentRotation.y');
`
  }],
  props: [
    ['.background : Color | Texture | CubeTexture', '背景。null（預設）時使用 renderer 的 clear color。等距柱狀（equirectangular）貼圖需設定 <code>mapping = EquirectangularReflectionMapping</code>。'],
    ['.backgroundBlurriness : Float', '背景模糊度（0–1），僅對環境貼圖類背景有效。'],
    ['.backgroundIntensity : Float', '背景亮度倍率，預設 1。'],
    ['.backgroundRotation : Euler', '背景旋轉（弧度）。'],
    ['.environment : Texture', '套用到場景中所有物理材質（Standard / Physical）的環境貼圖，除非材質自己有 envMap。'],
    ['.environmentIntensity : Float', '環境貼圖強度，預設 1。'],
    ['.environmentRotation : Euler', '環境貼圖旋轉。'],
    ['.fog : Fog | FogExp2', '霧，預設 null。'],
    ['.overrideMaterial : Material', '若設定，場景中所有物件都以此材質繪製（例如做深度 / 法線預覽）。'],
  ],
  methods: [
    ['.toJSON( meta : Object ) : Object', '把場景轉換為 JSON。'],
  ],
},
{
  id: 'api-fog', title: 'Fog', api: true, src: 'scenes/Fog.js',
  desc: '<p>線性霧：從 <code>near</code> 開始變濃，到 <code>far</code> 完全成為霧色。設定在 <code>scene.fog</code>。材質的 <code>fog</code> 屬性為 false 時不受霧影響。</p>',
  ctor: { sig: 'new Fog( color : Color | Integer | String, near : Float, far : Float )', params: [
    ['color', 'Color', '霧色。'], ['near', 'Float', '開始起霧的距離，預設 1。'], ['far', 'Float', '霧完全覆蓋的距離，預設 1000。'],
  ]},
  examples: [{
    title: 'Fog 與 FogExp2 比較',
    desc: '切換霧的種類並調整參數。',
    code: code`
import * as THREE from 'three';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const { scene } = createStage({ background: 0xb0c4de, cameraPosition: [0, 2, 10], target: [0, 1, -10] });

const linear = new THREE.Fog(0xb0c4de, 5, 30);
const exp = new THREE.FogExp2(0xb0c4de, 0.06);
scene.fog = linear;

for (let z = 0; z < 20; z++) for (const x of [-3, 3]) {
  const tree = new THREE.Mesh(new THREE.ConeGeometry(0.8, 3, 8), new THREE.MeshStandardMaterial({ color: 0x2e7d32 }));
  tree.position.set(x, 1.5, -z * 3);
  scene.add(tree);
}
const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 100), new THREE.MeshStandardMaterial({ color: 0x8d6e63 }));
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

const p = { type: 'Fog' };
const gui = new GUI();
gui.add(p, 'type', ['Fog', 'FogExp2', '無']).onChange((v) => {
  scene.fog = v === 'Fog' ? linear : v === 'FogExp2' ? exp : null;
});
gui.add(linear, 'near', 0, 30, 0.1).name('Fog.near');
gui.add(linear, 'far', 1, 80, 0.1).name('Fog.far');
gui.add(exp, 'density', 0, 0.2, 0.001).name('FogExp2.density');
gui.addColor({ color: '#b0c4de' }, 'color').name('霧色 / 背景').onChange((c) => {
  linear.color.set(c); exp.color.set(c); scene.background.set(c);
});
`
  }],
  props: [
    ['.isFog : Boolean', '型別檢查旗標。'],
    ['.name : String', '名稱。'],
    ['.color : Color', '霧色。'],
    ['.near : Float', '開始距離。'],
    ['.far : Float', '結束距離。'],
  ],
  methods: [['.clone() : Fog', '複製。'], ['.toJSON() : Object', '轉為 JSON。']],
},
{
  id: 'api-fogexp2', title: 'FogExp2', api: true, src: 'scenes/FogExp2.js',
  desc: '<p>指數霧：霧的濃度隨距離以指數增加，比線性霧更接近真實大氣。範例請見 <a href="#/api-fog">Fog</a>。</p>',
  ctor: { sig: 'new FogExp2( color : Color | Integer | String, density : Float )', params: [
    ['color', 'Color', '霧色。'], ['density', 'Float', '霧的密度，預設 0.00025。常用 0.01～0.1。'],
  ]},
  props: [['.isFogExp2 : Boolean', '型別檢查旗標。'], ['.color : Color', '霧色。'], ['.density : Float', '密度。']],
  methods: [['.clone() : FogExp2', '複製。'], ['.toJSON() : Object', '轉為 JSON。']],
},
]},

/* ===================================================== 相機 */
{ group: '相機 Cameras', section: 'api', items: [
{
  id: 'api-camera', title: 'Camera', api: true, src: 'cameras/Camera.js',
  inherits: ['EventDispatcher', 'Object3D'],
  desc: '<p>相機的抽象基底類別，請使用 <a href="#/api-perspectivecamera">PerspectiveCamera</a> 或 <a href="#/api-orthographiccamera">OrthographicCamera</a>。相機朝向自身的 <b>-Z 軸</b>。</p>',
  ctor: { sig: 'new Camera()' },
  props: [
    ['.matrixWorldInverse : Matrix4', 'matrixWorld 的反矩陣，也就是視圖矩陣（view matrix）。'],
    ['.projectionMatrix : Matrix4', '投影矩陣。'],
    ['.projectionMatrixInverse : Matrix4', '投影矩陣的反矩陣。'],
    ['.layers : Layers', '相機能看見的圖層。'],
  ],
  methods: [
    ['.getWorldDirection( target : Vector3 ) : Vector3', '取得相機在世界空間中的視線方向（-Z）。'],
    ['.clone() : Camera', '複製相機。'],
  ],
},
{
  id: 'api-perspectivecamera', title: 'PerspectiveCamera', api: true, src: 'cameras/PerspectiveCamera.js',
  inherits: ['EventDispatcher', 'Object3D', 'Camera'],
  desc: '<p>透視投影相機，模擬人眼所見：近大遠小。是 3D 場景最常用的相機。</p><p><b>修改 fov、aspect、near、far、zoom、filmGauge、filmOffset 或 view 後，必須呼叫 <code>updateProjectionMatrix()</code>。</b></p>',
  ctor: { sig: 'new PerspectiveCamera( fov : Number, aspect : Number, near : Number, far : Number )', params: [
    ['fov', 'Number', '垂直視野角度（度），預設 50。'],
    ['aspect', 'Number', '寬高比，預設 1。通常為畫布寬 / 高。'],
    ['near', 'Number', '近裁切面，預設 0.1。'],
    ['far', 'Number', '遠裁切面，預設 2000。'],
  ]},
  examples: [{
    title: '視錐體視覺化',
    desc: '左邊為觀察相機，場景中的 CameraHelper 顯示被調整的透視相機的視錐；右下小視窗是該相機實際看到的畫面。',
    code: code`
import * as THREE from 'three';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const stage = createStage({ grid: 20, cameraPosition: [12, 8, 12] });
const { scene, renderer, camera } = stage;

const cam = new THREE.PerspectiveCamera(40, 1.6, 1, 8);
cam.position.set(0, 1.5, 6);
cam.lookAt(0, 1, 0);
const helper = new THREE.CameraHelper(cam);
scene.add(cam, helper);

for (let i = 0; i < 12; i++) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(i / 12, 0.7, 0.55) }));
  m.position.set(Math.cos(i) * 3, 0.4 + (i % 3), Math.sin(i * 1.3) * 3);
  scene.add(m);
}

const update = () => { cam.updateProjectionMatrix(); helper.update(); };
const gui = new GUI();
gui.add(cam, 'fov', 10, 120, 1).onChange(update);
gui.add(cam, 'aspect', 0.5, 3, 0.01).onChange(update);
gui.add(cam, 'near', 0.1, 5, 0.1).onChange(update);
gui.add(cam, 'far', 2, 20, 0.1).onChange(update);
gui.add(cam, 'zoom', 0.2, 3, 0.01).onChange(update);

// 雙視口渲染
stage.render = () => {
  const w = innerWidth, h = innerHeight;
  renderer.setScissorTest(true);
  renderer.setViewport(0, 0, w, h); renderer.setScissor(0, 0, w, h);
  helper.visible = true;
  renderer.render(scene, camera);
  const vw = Math.floor(w * 0.35), vh = Math.floor(vw / cam.aspect);
  renderer.setViewport(w - vw - 10, 10, vw, vh); renderer.setScissor(w - vw - 10, 10, vw, vh);
  helper.visible = false;
  renderer.render(scene, cam);
  renderer.setScissorTest(false);
};
`
  }],
  props: [
    ['.fov : Float', '垂直視野（度）。'],
    ['.aspect : Float', '寬高比。'],
    ['.near : Float', '近裁切面，須大於 0。'],
    ['.far : Float', '遠裁切面，須大於 near。'],
    ['.zoom : Float', '縮放倍率，預設 1。'],
    ['.focus : Float', '立體視覺與景深用的焦距，預設 10。'],
    ['.filmGauge : Float', '底片寬度（毫米），預設 35。用於 setFocalLength。'],
    ['.filmOffset : Float', '水平底片偏移。'],
    ['.view : Object', '由 setViewOffset 設定的視窗，預設 null。'],
  ],
  methods: [
    ['.updateProjectionMatrix() : undefined', '依目前參數重算投影矩陣。修改任何投影參數後必須呼叫。'],
    ['.setFocalLength( focalLength : Float ) : undefined', '以鏡頭焦距（毫米，基於 filmGauge）設定 fov。',
      "const cam = new THREE.PerspectiveCamera();\nfor (const mm of [16, 35, 50, 85, 200]) {\n  cam.setFocalLength(mm);\n  console.log(mm + 'mm 鏡頭 → fov =', cam.fov.toFixed(2), '度');\n}"],
    ['.getFocalLength() : Float', '取得目前 fov 對應的焦距。'],
    ['.getEffectiveFOV() : Float', '考慮 zoom 後的實際垂直視野。'],
    ['.getFilmWidth() : Float', '底片寬度。'],
    ['.getFilmHeight() : Float', '底片高度。'],
    ['.getViewSize( distance : Float, target : Vector2 ) : Vector2', '在指定距離處，視野的寬與高（世界單位）。常用於讓物件剛好填滿畫面。',
      "const cam = new THREE.PerspectiveCamera(50, 16 / 9);\nconsole.log('距離 10 時可見範圍（寬 × 高）', cam.getViewSize(10, new THREE.Vector2()));"],
    ['.getViewBounds( distance : Float, minTarget : Vector2, maxTarget : Vector2 ) : undefined', '在指定距離處的視野邊界。'],
    ['.setViewOffset( fullWidth, fullHeight, x, y, width, height ) : undefined', '設定在大畫面中的子視窗，用於多螢幕拼接或分塊渲染。'],
    ['.clearViewOffset() : undefined', '清除 view offset。'],
  ],
},
{
  id: 'api-orthographiccamera', title: 'OrthographicCamera', api: true, src: 'cameras/OrthographicCamera.js',
  inherits: ['EventDispatcher', 'Object3D', 'Camera'],
  desc: '<p>正交投影相機：物件大小不隨距離改變。適合 2D 介面、等角（isometric）遊戲、CAD 與陰影計算。</p>',
  ctor: { sig: 'new OrthographicCamera( left : Number, right : Number, top : Number, bottom : Number, near : Number, far : Number )', params: [
    ['left / right', 'Number', '視錐左 / 右邊界，預設 -1 / 1。'],
    ['top / bottom', 'Number', '視錐上 / 下邊界，預設 1 / -1。'],
    ['near / far', 'Number', '近 / 遠裁切面，預設 0.1 / 2000。'],
  ]},
  examples: [{
    title: '等角視角（Isometric）',
    desc: '用正交相機與固定角度做出等角視圖。滾輪縮放會改變 camera.zoom。',
    code: code`
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf3e9d2);

const frustum = 8;
let aspect = innerWidth / innerHeight;
const camera = new THREE.OrthographicCamera(-frustum * aspect / 2, frustum * aspect / 2, frustum / 2, -frustum / 2, 0.1, 100);
camera.position.set(10, 10, 10);   // 等角視角：從 (1,1,1) 方向看
camera.lookAt(0, 0, 0);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableRotate = false;      // 鎖定角度，只允許平移與縮放
controls.addEventListener('change', () => console.log('zoom =', camera.zoom.toFixed(2)));

scene.add(new THREE.HemisphereLight(0xffffff, 0x886644, 1.5));
const sun = new THREE.DirectionalLight(0xffffff, 1.5);
sun.position.set(5, 10, 2);
scene.add(sun);

for (let x = -3; x <= 3; x++) for (let z = -3; z <= 3; z++) {
  const h = 0.3 + Math.random() * 1.5;
  const b = new THREE.Mesh(new THREE.BoxGeometry(0.95, h, 0.95), new THREE.MeshLambertMaterial({ color: new THREE.Color().setHSL(0.08 + h * 0.1, 0.5, 0.6) }));
  b.position.set(x, h / 2, z);
  scene.add(b);
}

renderer.setAnimationLoop(() => { controls.update(); renderer.render(scene, camera); });
addEventListener('resize', () => {
  aspect = innerWidth / innerHeight;
  camera.left = -frustum * aspect / 2; camera.right = frustum * aspect / 2;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
`
  }],
  props: [
    ['.left / .right / .top / .bottom : Float', '視錐邊界。'],
    ['.near / .far : Float', '裁切面。正交相機的 near 可以為負值。'],
    ['.zoom : Float', '縮放倍率。'],
    ['.view : Object', '由 setViewOffset 設定。'],
  ],
  methods: [
    ['.updateProjectionMatrix() : undefined', '修改參數後必須呼叫。'],
    ['.setViewOffset( fullWidth, fullHeight, x, y, width, height ) : undefined', '設定子視窗。'],
    ['.clearViewOffset() : undefined', '清除子視窗。'],
  ],
},
]},

/* ===================================================== 渲染器 */
{ group: '渲染器 Renderers', section: 'api', items: [
{
  id: 'api-webglrenderer', title: 'WebGLRenderer', api: true, src: 'renderers/WebGLRenderer.js',
  desc: '<p>使用 WebGL 2 繪製場景的渲染器。（three.js 另提供 <code>WebGPURenderer</code>，位於 <code>three/webgpu</code>。）</p>',
  ctor: { sig: 'new WebGLRenderer( parameters : Object )', params: [
    ['canvas', 'HTMLCanvasElement', '使用指定的 canvas；未提供時自動建立。'],
    ['context', 'WebGL2RenderingContext', '使用既有的 context。'],
    ['precision', 'String', '著色器精度："highp"（預設）、"mediump"、"lowp"。'],
    ['alpha', 'Boolean', 'canvas 是否有透明通道，預設 false。'],
    ['premultipliedAlpha', 'Boolean', '預設 true。'],
    ['antialias', 'Boolean', '是否開啟 MSAA 反鋸齒，預設 false。'],
    ['stencil', 'Boolean', '是否有模板緩衝區，預設 false。'],
    ['preserveDrawingBuffer', 'Boolean', '是否保留繪圖緩衝區（截圖需要），預設 false。'],
    ['powerPreference', 'String', '"high-performance"、"low-power" 或 "default"。'],
    ['failIfMajorPerformanceCaveat', 'Boolean', '效能過低時建立失敗，預設 false。'],
    ['depth', 'Boolean', '是否有深度緩衝區，預設 true。'],
    ['logarithmicDepthBuffer', 'Boolean', '對數深度緩衝區，用於超大尺度場景，預設 false。'],
    ['reverseDepthBuffer', 'Boolean', '反向深度緩衝區（r169+），提升深度精度。'],
  ]},
  examples: [{
    title: '截圖、clear color 與 renderer.info',
    desc: '設定 preserveDrawingBuffer 才能用 toDataURL 截圖。點擊按鈕截圖會在下方顯示縮圖。',
    code: code`
import * as THREE from 'three';

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.setClearColor(0x263238, 1);   // 沒有設定 scene.background 時使用
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 100);
camera.position.z = 4;
const mesh = new THREE.Mesh(new THREE.TorusKnotGeometry(0.8, 0.3, 128, 16), new THREE.MeshNormalMaterial());
scene.add(mesh);

console.log('maxTextureSize', renderer.capabilities.maxTextureSize,
  '｜maxSamples', renderer.capabilities.maxSamples,
  '｜pixelRatio', renderer.getPixelRatio());

const btn = document.createElement('button');
btn.textContent = '📷 截圖';
btn.style.cssText = 'position:absolute;top:10px;left:10px;padding:6px 10px';
const img = document.createElement('img');
img.style.cssText = 'position:absolute;bottom:10px;left:10px;width:120px;border:2px solid #fff;display:none';
btn.onclick = () => {
  img.src = renderer.domElement.toDataURL('image/png');
  img.style.display = 'block';
  console.log('截圖完成，資料長度', img.src.length);
};
document.body.append(btn, img);

let frame = 0;
renderer.setAnimationLoop((t) => {
  mesh.rotation.set(t / 2000, t / 1000, 0);
  renderer.render(scene, camera);
  if (++frame === 30) console.log('renderer.info', renderer.info.render, renderer.info.memory);
});
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
`
  }],
  props: [
    ['.domElement : HTMLCanvasElement', '渲染器繪製的 canvas。'],
    ['.autoClear : Boolean', '每次 render 前是否自動清除畫面，預設 true。多次疊加渲染時設為 false。'],
    ['.autoClearColor / .autoClearDepth / .autoClearStencil : Boolean', '分別控制是否自動清除顏色、深度、模板。'],
    ['.sortObjects : Boolean', '是否依深度排序物件，預設 true。'],
    ['.clippingPlanes : Array', '全域裁切平面（Plane 陣列）。'],
    ['.localClippingEnabled : Boolean', '是否啟用材質層級的裁切平面，預設 false。'],
    ['.outputColorSpace : String', '輸出色彩空間，預設 <code>SRGBColorSpace</code>。'],
    ['.toneMapping : Constant', '色調映射：<code>NoToneMapping</code>（預設）、<code>LinearToneMapping</code>、<code>ReinhardToneMapping</code>、<code>CineonToneMapping</code>、<code>ACESFilmicToneMapping</code>、<code>AgXToneMapping</code>、<code>NeutralToneMapping</code>。'],
    ['.toneMappingExposure : Number', '曝光值，預設 1。'],
    ['.shadowMap : WebGLShadowMap', '<code>enabled</code>（是否啟用陰影）、<code>type</code>（BasicShadowMap / PCFShadowMap / PCFSoftShadowMap / VSMShadowMap）、<code>autoUpdate</code>、<code>needsUpdate</code>。'],
    ['.capabilities : Object', 'GPU 能力資訊：maxTextureSize、maxAnisotropy（透過 getMaxAnisotropy()）、maxSamples、precision 等。'],
    ['.info : Object', '統計資訊：<code>render.calls</code>（draw calls）、<code>render.triangles</code>、<code>render.points</code>、<code>render.lines</code>、<code>memory.geometries</code>、<code>memory.textures</code>、<code>programs</code>。'],
    ['.xr : WebXRManager', 'WebXR（VR / AR）介面。'],
    ['.debug : Object', '<code>checkShaderErrors</code>：是否檢查著色器錯誤（預設 true，正式環境可關閉以提升效能）。'],
  ],
  methods: [
    ['.render( scene : Object3D, camera : Camera ) : undefined', '以相機繪製場景。'],
    ['.setAnimationLoop( callback : Function ) : undefined', '設定每幀呼叫的函式（取代 requestAnimationFrame），callback 收到時間戳。傳入 null 停止。WebXR 必須使用它。'],
    ['.setSize( width : Integer, height : Integer, updateStyle : Boolean ) : undefined', '設定 canvas 尺寸（會乘上 pixelRatio），updateStyle 預設 true 會同步設定 CSS 尺寸。'],
    ['.getSize( target : Vector2 ) : Vector2', '取得 CSS 像素尺寸。'],
    ['.setPixelRatio( value : Number ) : undefined', '設定裝置像素比，通常為 <code>Math.min(devicePixelRatio, 2)</code>。'],
    ['.getPixelRatio() : Number', '取得像素比。'],
    ['.getDrawingBufferSize( target : Vector2 ) : Vector2', '取得實際繪圖緩衝區尺寸（CSS 尺寸 × pixelRatio）。'],
    ['.setViewport( x, y, width, height ) : undefined', '設定繪製區域（左下角為原點）。'],
    ['.setScissor( x, y, width, height ) : undefined', '設定裁剪區域。'],
    ['.setScissorTest( enable : Boolean ) : undefined', '啟用 / 停用裁剪測試。分割畫面多視口渲染時使用（見 PerspectiveCamera 範例）。'],
    ['.setClearColor( color : Color, alpha : Float ) : undefined', '設定清除顏色。'],
    ['.getClearColor( target : Color ) : Color', '取得清除顏色。'],
    ['.setClearAlpha( alpha : Float ) : undefined', '設定清除透明度。'],
    ['.clear( color : Boolean, depth : Boolean, stencil : Boolean ) : undefined', '手動清除緩衝區。'],
    ['.clearDepth() : undefined', '只清除深度，常用於把 UI 場景疊在主場景上。'],
    ['.setRenderTarget( renderTarget : WebGLRenderTarget, activeCubeFace, activeMipmapLevel ) : undefined', '設定繪製目標；傳入 null 表示繪製到畫面。'],
    ['.getRenderTarget() : WebGLRenderTarget', '取得目前的繪製目標。'],
    ['.readRenderTargetPixels( renderTarget, x, y, width, height, buffer ) : undefined', '從 render target 讀取像素到 TypedArray。'],
    ['.compile( scene, camera ) : Set', '預先編譯場景中的著色器，避免第一次繪製時卡頓。'],
    ['.compileAsync( scene, camera ) : Promise', '非同步版本的 compile。'],
    ['.initTexture( texture : Texture ) : undefined', '預先上傳貼圖到 GPU。'],
    ['.copyFramebufferToTexture( texture, position, level ) : undefined', '把目前畫面複製到貼圖。'],
    ['.getContext() : WebGL2RenderingContext', '取得 WebGL context。'],
    ['.dispose() : undefined', '釋放渲染器的 GPU 資源。'],
    ['.forceContextLoss() : undefined', '模擬 WebGL context 遺失（測試用）。'],
  ],
},
{
  id: 'api-webglrendertarget', title: 'WebGLRenderTarget', api: true, src: 'renderers/WebGLRenderTarget.js',
  inherits: ['EventDispatcher', 'RenderTarget'],
  desc: '<p>離屏繪製目標（framebuffer）。可以把場景繪製到一張貼圖上，再把該貼圖用在其他物件的材質上，例如監視器畫面、鏡子、後期處理。</p>',
  ctor: { sig: 'new WebGLRenderTarget( width : Number, height : Number, options : Object )', params: [
    ['width / height', 'Number', '尺寸，預設 1。'],
    ['options.format', 'Constant', '預設 RGBAFormat。'],
    ['options.type', 'Constant', '預設 UnsignedByteType；HDR 可用 HalfFloatType。'],
    ['options.depthBuffer', 'Boolean', '是否有深度緩衝區，預設 true。'],
    ['options.samples', 'Integer', 'MSAA 取樣數，預設 0。'],
    ['options.colorSpace', 'String', '貼圖色彩空間。'],
    ['options.count', 'Integer', '多重繪製目標（MRT）的貼圖數量，預設 1。'],
  ]},
  examples: [{
    title: '監視器：把場景畫到貼圖',
    desc: '第二台相機的畫面被繪製到 render target，再當作平面的貼圖。',
    code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const stage = createStage({ cameraPosition: [0, 1.5, 6], grid: true });
const { scene, renderer, camera } = stage;

// 被監視的旋轉物件
const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(0.4, 0.15, 100, 16), new THREE.MeshNormalMaterial());
knot.position.set(-2, 1, 0);
scene.add(knot);

// 監視相機與 render target
const rt = new THREE.WebGLRenderTarget(512, 512, { samples: 4 });
const spyCam = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
spyCam.position.set(-2, 1, 2.5);
spyCam.lookAt(knot.position);

// 螢幕：使用 rt.texture
const screen = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: rt.texture }));
screen.position.set(1.5, 1.2, 0);
scene.add(screen);

stage.onFrame((t) => {
  knot.rotation.set(t, t * 0.7, 0);
  screen.visible = false;              // 避免螢幕畫到自己
  renderer.setRenderTarget(rt);
  renderer.render(scene, spyCam);
  renderer.setRenderTarget(null);      // 回到畫面
  screen.visible = true;
});
console.log('rt.texture =', rt.texture, '尺寸', rt.width + 'x' + rt.height);
`
  }],
  props: [
    ['.width / .height : Number', '尺寸。'],
    ['.texture : Texture', '繪製結果的貼圖。'],
    ['.textures : Array', 'MRT 時的所有貼圖。'],
    ['.depthTexture : DepthTexture', '若設定，深度會寫入這張貼圖。'],
    ['.depthBuffer / .stencilBuffer : Boolean', '是否有深度 / 模板緩衝區。'],
    ['.samples : Integer', 'MSAA 取樣數。'],
    ['.viewport / .scissor : Vector4', '繪製區域 / 裁剪區域。'],
  ],
  methods: [
    ['.setSize( width : Number, height : Number ) : undefined', '調整尺寸。'],
    ['.clone() : WebGLRenderTarget', '複製。'],
    ['.copy( source ) : this', '複製設定。'],
    ['.dispose() : undefined', '釋放 GPU 資源。'],
  ],
},
]}
);
})();
