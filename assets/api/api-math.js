/* API 參考：數學 Math、曲線 Curves
 * 字串形式的成員範例會自動加上 import * as THREE from 'three'，並只在 console 輸出。
 */
(function () {
var code = String.raw;

window.DOCS.push(
{ group: '數學 Math', section: 'api', items: [
{
  id: 'api-vector3', title: 'Vector3', api: true, src: 'math/Vector3.js',
  desc: '<p>三維向量，可表示：空間中的點、方向（與長度）、或任意三個數值的組合（例如尤拉角、RGB）。</p><p>⚠️ 大多數方法會<b>修改自身並回傳 this</b>（方便鏈式呼叫）。若需保留原向量，請先 <code>clone()</code>。在渲染迴圈中應重複使用暫存向量，避免每幀 new 造成垃圾回收壓力。</p>',
  ctor: { sig: 'new Vector3( x : Float, y : Float, z : Float )', params: [['x, y, z', 'Float', '分量，預設皆為 0。']] },
  examples: [{
    title: '基本操作總覽', consoleOnly: true,
    code: code`
import * as THREE from 'three';

const a = new THREE.Vector3(1, 2, 3);
const b = new THREE.Vector3(4, 0, -1);

console.log('a + b =', a.clone().add(b));
console.log('a - b =', a.clone().sub(b));
console.log('a · b =', a.dot(b));
console.log('a × b =', new THREE.Vector3().crossVectors(a, b));
console.log('|a| =', a.length());
console.log('距離 =', a.distanceTo(b));
console.log('鏈式呼叫：', new THREE.Vector3(3, 4, 0).normalize().multiplyScalar(10).setZ(1));
`
  }],
  props: [
    ['.x / .y / .z : Float', '分量。'],
    ['.isVector3 : Boolean', '型別檢查旗標。'],
  ],
  methods: [
    ['.set( x, y, z ) : this', '設定分量。', "const v = new THREE.Vector3();\nv.set(1, 2, 3);\nconsole.log(v);\nv.setX(10).setY(20);\nconsole.log(v);\nv.setScalar(7);\nconsole.log('setScalar(7) →', v);"],
    ['.setScalar( s ) / .setX( x ) / .setY( y ) / .setZ( z ) : this', '設定全部 / 單一分量。'],
    ['.setComponent( index, value ) / .getComponent( index ) ', '以索引 0、1、2 存取分量。'],
    ['.clone() : Vector3', '複製出新向量。', "const a = new THREE.Vector3(1, 1, 1);\nconst b = a;          // 同一個物件！\nconst c = a.clone();  // 新物件\na.x = 99;\nconsole.log('b =', b, '（跟著改變）');\nconsole.log('c =', c, '（不受影響）');"],
    ['.copy( v : Vector3 ) : this', '複製 v 的值到自己。'],
    ['.add( v ) / .addScalar( s ) / .addVectors( a, b ) / .addScaledVector( v, s ) : this', '加法。addScaledVector 計算 this + v × s（常用於「位置 += 速度 × 時間」）。',
      "const pos = new THREE.Vector3(0, 0, 0);\nconst vel = new THREE.Vector3(2, 5, 0);\nconst dt = 0.5;\npos.addScaledVector(vel, dt);\nconsole.log('pos += vel × dt →', pos);\nconsole.log('addScalar(1) →', pos.clone().addScalar(1));\nconsole.log('addVectors →', new THREE.Vector3().addVectors(pos, vel));"],
    ['.sub( v ) / .subScalar( s ) / .subVectors( a, b ) : this', '減法。<code>subVectors(b, a)</code> 得到從 a 指向 b 的向量。',
      "const from = new THREE.Vector3(1, 1, 0);\nconst to = new THREE.Vector3(4, 5, 0);\nconst dir = new THREE.Vector3().subVectors(to, from);\nconsole.log('from → to =', dir, '長度', dir.length());"],
    ['.multiply( v ) / .multiplyScalar( s ) / .multiplyVectors( a, b ) : this', '逐分量乘法 / 純量乘法。'],
    ['.divide( v ) / .divideScalar( s ) : this', '逐分量除法 / 純量除法。'],
    ['.negate() : this', '反轉方向。'],
    ['.dot( v ) : Float', '內積。兩個單位向量的內積 = cos(夾角)：1 同向、0 垂直、-1 反向。',
      "const forward = new THREE.Vector3(0, 0, -1);\nconst toEnemy = new THREE.Vector3(1, 0, -1).normalize();\nconst d = forward.dot(toEnemy);\nconsole.log('dot =', d.toFixed(3), d > 0 ? '→ 敵人在前方' : '→ 敵人在後方');\nconsole.log('夾角 =', THREE.MathUtils.radToDeg(Math.acos(d)).toFixed(1), '度');"],
    ['.cross( v ) / .crossVectors( a, b ) : this', '外積：結果垂直於兩個向量，長度等於兩向量構成的平行四邊形面積。',
      "const x = new THREE.Vector3(1, 0, 0);\nconst y = new THREE.Vector3(0, 1, 0);\nconsole.log('X × Y =', new THREE.Vector3().crossVectors(x, y), '（= Z，右手定則）');\nconsole.log('Y × X =', new THREE.Vector3().crossVectors(y, x));"],
    ['.length() / .lengthSq() / .manhattanLength() : Float', '長度 / 長度平方 / 曼哈頓長度。比較距離時用 lengthSq 可避免開根號。'],
    ['.normalize() : this', '轉為單位向量（長度 1）。', "const v = new THREE.Vector3(3, 4, 0);\nconsole.log('原長度', v.length());\nv.normalize();\nconsole.log('normalize →', v, '長度', v.length());"],
    ['.setLength( l ) : this', '保持方向，設定長度。'],
    ['.distanceTo( v ) / .distanceToSquared( v ) / .manhattanDistanceTo( v ) : Float', '距離。'],
    ['.angleTo( v ) : Float', '兩向量夾角（弧度）。'],
    ['.lerp( v, alpha ) / .lerpVectors( v1, v2, alpha ) : this', '線性插值。在渲染迴圈中 <code>pos.lerp(target, 0.1)</code> 可做平滑跟隨。', {
      title: 'lerp 平滑跟隨',
      code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, camera, renderer, onFrame } = createStage({ controls: false, cameraPosition: [0, 10, 0.01] });

const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const target = new THREE.Vector3();
const raycaster = new THREE.Raycaster();
renderer.domElement.addEventListener('pointermove', (e) => {
  raycaster.setFromCamera(new THREE.Vector2((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1), camera);
  raycaster.ray.intersectPlane(plane, target);
});
const followers = [0.02, 0.05, 0.15].map((alpha, i) => {
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.3), new THREE.MeshStandardMaterial({ color: [0xef5350, 0x66bb6a, 0x42a5f5][i] }));
  m.userData.alpha = alpha;
  scene.add(m);
  return m;
});
console.log('移動滑鼠：紅 alpha=0.02、綠 0.05、藍 0.15');
onFrame(() => followers.forEach((m) => m.position.lerp(target, m.userData.alpha)));
`}],
    ['.clamp( min, max ) / .clampLength( min, max ) / .clampScalar( min, max ) : this', '限制分量或長度。'],
    ['.min( v ) / .max( v ) : this', '逐分量取最小 / 最大。'],
    ['.floor() / .ceil() / .round() / .roundToZero() : this', '逐分量取整。'],
    ['.applyMatrix3( m ) / .applyMatrix4( m ) : this', '乘上矩陣（applyMatrix4 會做透視除法，適合變換「點」）。'],
    ['.applyQuaternion( q ) / .applyEuler( euler ) / .applyAxisAngle( axis, angle ) : this', '旋轉向量。',
      "const v = new THREE.Vector3(1, 0, 0);\nconsole.log('繞 Y 軸 90° →', v.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2));\nconsole.log('applyEuler(0, 0, 90°) →', v.clone().applyEuler(new THREE.Euler(0, 0, Math.PI / 2)));"],
    ['.transformDirection( m : Matrix4 ) : this', '以矩陣的旋轉部分變換方向並正規化（忽略位移）。'],
    ['.project( camera ) : this', '把世界座標投影到 NDC（-1~1）。常用於把 3D 位置轉成螢幕座標，放置 HTML 標籤。', {
      title: '3D 位置 → 螢幕座標（HTML 標籤）',
      code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, camera, onFrame } = createStage({ grid: true, cameraPosition: [4, 3, 5] });

const box = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial({ color: 0x7e57c2 }));
scene.add(box);
const label = document.createElement('div');
label.textContent = '我是 HTML 標籤';
label.style.cssText = 'position:absolute;padding:2px 8px;background:#fff;color:#000;border-radius:4px;font-size:13px;transform:translate(-50%,-100%);pointer-events:none';
document.body.appendChild(label);

const v = new THREE.Vector3();
onFrame((t) => {
  box.position.set(Math.cos(t) * 2, 0.5 + Math.sin(t * 2) * 0.3, Math.sin(t) * 2);
  v.copy(box.position).setY(box.position.y + 0.8).project(camera);   // → NDC
  label.style.left = ((v.x + 1) / 2) * innerWidth + 'px';
  label.style.top = ((1 - v.y) / 2) * innerHeight + 'px';
  label.style.display = v.z > 1 ? 'none' : 'block';                   // 在相機後方時隱藏
});
`}],
    ['.unproject( camera ) : this', '把 NDC 座標轉回世界座標。'],
    ['.projectOnVector( v ) / .projectOnPlane( planeNormal ) : this', '投影到向量 / 平面上。',
      "const v = new THREE.Vector3(3, 4, 5);\nconsole.log('投影到 X 軸 →', v.clone().projectOnVector(new THREE.Vector3(1, 0, 0)));\nconsole.log('投影到 XZ 平面 →', v.clone().projectOnPlane(new THREE.Vector3(0, 1, 0)));"],
    ['.reflect( normal ) : this', '以法線反射（normal 需為單位向量），可做反彈。',
      "const incoming = new THREE.Vector3(1, -1, 0);\nconsole.log('撞到地面反彈 →', incoming.clone().reflect(new THREE.Vector3(0, 1, 0)));"],
    ['.setFromMatrixPosition( m ) / .setFromMatrixScale( m ) / .setFromMatrixColumn( m, index ) : this', '從矩陣取出位移 / 縮放 / 某一欄。'],
    ['.setFromSpherical( s ) / .setFromSphericalCoords( radius, phi, theta ) : this', '由球座標設定。'],
    ['.setFromCylindrical( c ) / .setFromCylindricalCoords( radius, theta, y ) : this', '由柱座標設定。'],
    ['.randomDirection() : this', '設為隨機單位向量（均勻分布於球面）。'],
    ['.random() : this', '各分量設為 0–1 隨機值。'],
    ['.equals( v ) : Boolean', '是否完全相等。'],
    ['.fromArray( array, offset ) / .toArray( array, offset ) : this / Array', '與陣列互轉。', "const v = new THREE.Vector3().fromArray([10, 20, 30, 40, 50, 60], 3);\nconsole.log('fromArray(offset 3) →', v);\nconsole.log('toArray →', v.toArray());"],
    ['.fromBufferAttribute( attribute, index ) : this', '從 BufferAttribute 讀取第 index 個頂點。'],
  ],
},
{
  id: 'api-vector2', title: 'Vector2', api: true, src: 'math/Vector2.js',
  desc: '<p>二維向量，常用於 UV 座標、螢幕 / 滑鼠座標、2D 形狀的點、貼圖 offset / repeat。方法與 <a href="#/api-vector3">Vector3</a> 大致相同（add、sub、dot、length、normalize、lerp……），另有 2D 專屬方法。</p>',
  ctor: { sig: 'new Vector2( x : Float, y : Float )' },
  examples: [{
    title: '2D 專屬方法', consoleOnly: true,
    code: code`
import * as THREE from 'three';

const v = new THREE.Vector2(1, 1);
console.log('angle() =', THREE.MathUtils.radToDeg(v.angle()), '度（相對於 +X 軸）');
console.log('cross（2D 外積純量）=', new THREE.Vector2(1, 0).cross(new THREE.Vector2(0, 1)));
console.log('rotateAround 原點 90° →', new THREE.Vector2(1, 0).rotateAround(new THREE.Vector2(0, 0), Math.PI / 2));
console.log('width / height 別名：', new THREE.Vector2(800, 600).width, new THREE.Vector2(800, 600).height);

// 滑鼠像素座標 → NDC
const px = new THREE.Vector2(200, 150), size = new THREE.Vector2(800, 600);
const ndc = new THREE.Vector2(px.x / size.x * 2 - 1, -(px.y / size.y) * 2 + 1);
console.log('像素', px, '→ NDC', ndc);
`
  }],
  props: [['.x / .y : Float', '分量。'], ['.width / .height : Float', 'x / y 的別名。']],
  methods: [
    ['.angle() : Float', '相對於 +X 軸的角度（弧度，0~2π）。'],
    ['.cross( v ) : Float', '2D 外積（純量）。'],
    ['.rotateAround( center, angle ) : this', '繞某點旋轉。'],
    ['.add / .sub / .multiplyScalar / .dot / .length / .normalize / .lerp / .distanceTo ...', '與 Vector3 相同。'],
  ],
},
{
  id: 'api-quaternion', title: 'Quaternion', api: true, src: 'math/Quaternion.js',
  desc: '<p>四元數 (x, y, z, w)，用來表示旋轉。相較於尤拉角，它沒有萬向鎖問題，且能平滑插值（slerp）。Object3D 的 <code>quaternion</code> 與 <code>rotation</code> 自動同步。</p><p>四元數不直覺，通常不直接設定 x/y/z/w，而是透過 setFromAxisAngle、setFromEuler、setFromUnitVectors 等方法建立。</p>',
  ctor: { sig: 'new Quaternion( x : Float, y : Float, z : Float, w : Float )', params: [['x, y, z, w', 'Float', '預設 (0, 0, 0, 1)，即「沒有旋轉」。']] },
  examples: [{
    title: 'rotateTowards：限制轉向速度',
    desc: '炮塔以每秒固定角速度轉向目標，而不是瞬間對準。',
    code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ grid: true, cameraPosition: [0, 7, 7] });

const turret = new THREE.Group();
turret.add(new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.4, 24), new THREE.MeshStandardMaterial({ color: 0x607d8b })));
const barrel = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 1.2), new THREE.MeshStandardMaterial({ color: 0xffc107 }));
barrel.position.z = 0.6;
turret.add(barrel);
scene.add(turret);

const target = new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial({ color: 0xff1744 }));
scene.add(target);

const m = new THREE.Matrix4();
const goal = new THREE.Quaternion();
const speed = Math.PI / 2; // 每秒 90°
onFrame((t, dt) => {
  if (Math.floor(t / 2) !== target.userData.k) {   // 每 2 秒換一個位置
    target.userData.k = Math.floor(t / 2);
    target.position.set((Math.random() - 0.5) * 8, 0.2, (Math.random() - 0.5) * 8);
  }
  // lookAt(目標, 自身位置, up)：讓 +Z（炮管方向）指向目標
  m.lookAt(target.position, turret.position, turret.up);
  goal.setFromRotationMatrix(m);
  turret.quaternion.rotateTowards(goal, speed * dt);
});
`
  }],
  props: [['.x / .y / .z / .w : Float', '分量（修改後會觸發 onChange 回呼以同步 Euler）。'], ['.isQuaternion : Boolean', '型別檢查旗標。']],
  methods: [
    ['.setFromAxisAngle( axis : Vector3, angle : Float ) : this', '繞軸旋轉 angle 弧度（axis 需正規化）。',
      "const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);\nconsole.log('繞 Y 軸 90° =', q);\nconsole.log('套用到 (1,0,0) →', new THREE.Vector3(1, 0, 0).applyQuaternion(q));"],
    ['.setFromEuler( euler : Euler ) : this', '由尤拉角設定。'],
    ['.setFromRotationMatrix( m : Matrix4 ) : this', '由旋轉矩陣設定。'],
    ['.setFromUnitVectors( vFrom : Vector3, vTo : Vector3 ) : this', '求出把 vFrom 轉到 vTo 的最短旋轉（兩者需正規化）。常用於「讓物件的 Y 軸對齊某法線」。',
      "const up = new THREE.Vector3(0, 1, 0);\nconst normal = new THREE.Vector3(1, 1, 0).normalize();\nconst q = new THREE.Quaternion().setFromUnitVectors(up, normal);\nconsole.log('q =', q);\nconsole.log('驗證：up 旋轉後 =', up.clone().applyQuaternion(q), '應等於 normal', normal);"],
    ['.multiply( q ) / .premultiply( q ) / .multiplyQuaternions( a, b ) : this', '組合旋轉：<code>a.multiply(b)</code> = a × b（先套用 b 再套用 a）。'],
    ['.invert() : this', '反向旋轉（共軛）。'],
    ['.conjugate() : this', '共軛。'],
    ['.slerp( qb, t ) / .slerpQuaternions( qa, qb, t ) : this', '球面線性插值，t ∈ [0, 1]。',
      "const a = new THREE.Quaternion();\nconst b = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI);\nfor (const t of [0, 0.25, 0.5, 0.75, 1]) {\n  const q = a.clone().slerp(b, t);\n  const e = new THREE.Euler().setFromQuaternion(q);\n  console.log('t =', t, '→ 角度', THREE.MathUtils.radToDeg(e.z).toFixed(1));\n}"],
    ['.rotateTowards( q, step ) : this', '朝 q 旋轉，最多 step 弧度。'],
    ['.angleTo( q ) : Float', '兩個旋轉之間的角度差（弧度）。'],
    ['.dot( v ) / .length() / .lengthSq() / .normalize() : …', '數學運算。'],
    ['.identity() : this', '重設為無旋轉。'],
    ['.random() : this', '隨機旋轉（均勻分布）。'],
    ['.equals( q ) / .clone() / .copy( q ) / .set( x, y, z, w )', '比較、複製、設定。'],
    ['.fromArray / .toArray / .fromBufferAttribute', '與陣列互轉。'],
  ],
},
{
  id: 'api-euler', title: 'Euler', api: true, src: 'math/Euler.js',
  desc: '<p>尤拉角：依指定順序繞各軸旋轉的角度（弧度）。直覺易懂，但有萬向鎖（gimbal lock）且插值不平順；需要複雜旋轉時改用 <a href="#/api-quaternion">Quaternion</a>。</p><p>旋轉順序 <code>order</code> 為 <code>"XYZ"</code>（預設）時，表示先繞 X、再繞 Y、最後繞 Z（以物件的區域座標軸）。第一人稱相機常用 <code>"YXZ"</code>。</p>',
  ctor: { sig: 'new Euler( x : Float, y : Float, z : Float, order : String )', params: [
    ['x, y, z', 'Float', '繞各軸的角度（弧度），預設 0。'], ['order', 'String', '旋轉順序，預設 "XYZ"。'],
  ]},
  examples: [{
    title: '旋轉順序的差異',
    desc: '兩個物件都設定相同的 x=45°、y=45°，但順序不同，結果姿態就不同。',
    code: code`
import * as THREE from 'three';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const { scene } = createStage({ cameraPosition: [0, 2, 6] });
const deg = THREE.MathUtils.degToRad;

const make = (x, color) => {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.3, 0.8), new THREE.MeshStandardMaterial({ color })));
  g.add(new THREE.AxesHelper(1.2));
  g.position.x = x;
  scene.add(g);
  return g;
};
const a = make(-1.5, 0xff8a65), b = make(1.5, 0x4fc3f7);
const p = { x: 45, y: 45, z: 0, orderA: 'XYZ', orderB: 'ZYX' };
function update() {
  a.rotation.set(deg(p.x), deg(p.y), deg(p.z), p.orderA);
  b.rotation.set(deg(p.x), deg(p.y), deg(p.z), p.orderB);
  console.log(p.orderA, a.quaternion, '｜', p.orderB, b.quaternion);
}
update();
const orders = ['XYZ', 'YXZ', 'ZXY', 'ZYX', 'YZX', 'XZY'];
const gui = new GUI();
gui.add(p, 'x', -180, 180, 1).onChange(update);
gui.add(p, 'y', -180, 180, 1).onChange(update);
gui.add(p, 'z', -180, 180, 1).onChange(update);
gui.add(p, 'orderA', orders).name('左（橘）order').onChange(update);
gui.add(p, 'orderB', orders).name('右（藍）order').onChange(update);
`
  }],
  props: [['.x / .y / .z : Float', '角度（弧度）。'], ['.order : String', '旋轉順序。'], ['.isEuler : Boolean', '型別檢查旗標。']],
  methods: [
    ['.set( x, y, z, order ) : this', '設定。'],
    ['.setFromQuaternion( q, order ) : this', '由四元數設定。'],
    ['.setFromRotationMatrix( m, order ) : this', '由旋轉矩陣設定。'],
    ['.setFromVector3( v, order ) : this', '由向量設定。'],
    ['.reorder( newOrder ) : this', '改變順序但保持相同的旋轉結果（重新計算角度）。',
      "const e = new THREE.Euler(0.5, 0.8, 0, 'XYZ');\nconst q1 = new THREE.Quaternion().setFromEuler(e);\ne.reorder('ZYX');\nconst q2 = new THREE.Quaternion().setFromEuler(e);\nconsole.log('reorder 後', e);\nconsole.log('旋轉結果相同？角度差 =', q1.angleTo(q2).toFixed(6));"],
    ['.clone() / .copy( e ) / .equals( e )', '複製與比較。'],
    ['.fromArray / .toArray', '與陣列互轉（order 也會包含在陣列中）。'],
  ],
  statics: [['DEFAULT_ORDER : String', '預設順序 "XYZ"。']],
},
{
  id: 'api-matrix4', title: 'Matrix4', api: true, src: 'math/Matrix4.js',
  desc: '<p>4×4 矩陣，最常用來表示 3D 變換（位移、旋轉、縮放、投影）。每個 Object3D 都有 <code>matrix</code>（區域）與 <code>matrixWorld</code>（世界）。</p><p><b>注意</b>：<code>set()</code> 以「列優先（row-major）」順序傳入，但內部 <code>elements</code> 陣列以「行優先（column-major）」儲存。</p>',
  ctor: { sig: 'new Matrix4( n11, n12, n13, n14, n21, …, n44 )', desc: '不帶參數時為單位矩陣。也可傳入 16 個值（列優先）。' },
  examples: [{
    title: '組合與拆解變換', consoleOnly: true,
    code: code`
import * as THREE from 'three';

const T = new THREE.Matrix4().makeTranslation(5, 0, 0);
const R = new THREE.Matrix4().makeRotationY(Math.PI / 2);
const S = new THREE.Matrix4().makeScale(2, 2, 2);

// 矩陣乘法的順序很重要：M = T × R × S 表示「先縮放、再旋轉、最後平移」
const M = new THREE.Matrix4().multiplyMatrices(T, R).multiply(S);
console.log(M);
const p = new THREE.Vector3(1, 0, 0);
console.log('(1,0,0) 經過 T×R×S →', p.clone().applyMatrix4(M));
console.log('(1,0,0) 經過 S×R×T →', p.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(S, R).multiply(T)));

// compose / decompose
const pos = new THREE.Vector3(), quat = new THREE.Quaternion(), scale = new THREE.Vector3();
M.decompose(pos, quat, scale);
console.log('decompose → position', pos, 'scale', scale, 'quaternion', quat);
console.log('determinant =', M.determinant());
console.log('elements（行優先）=', M.elements.map((x) => +x.toFixed(2)).join(', '));
`
  }],
  props: [['.elements : Array', '16 個數值，以行優先（column-major）排列。'], ['.isMatrix4 : Boolean', '型別檢查旗標。']],
  methods: [
    ['.set( n11, n12, …, n44 ) : this', '以列優先順序設定 16 個值。'],
    ['.identity() : this', '重設為單位矩陣。'],
    ['.compose( position, quaternion, scale ) : this', '由位置、旋轉、縮放組成矩陣。'],
    ['.decompose( position, quaternion, scale ) : this', '拆解成位置、旋轉、縮放。'],
    ['.multiply( m ) / .premultiply( m ) / .multiplyMatrices( a, b ) : this', '矩陣乘法：<code>this = this × m</code> / <code>this = m × this</code> / <code>this = a × b</code>。'],
    ['.multiplyScalar( s ) : this', '每個元素乘以 s。'],
    ['.invert() : this', '反矩陣（行列式為 0 時會得到零矩陣）。',
      "const m = new THREE.Matrix4().makeTranslation(1, 2, 3);\nconst inv = m.clone().invert();\nconsole.log(inv);\nconsole.log('m × m⁻¹ 是單位矩陣？', m.clone().multiply(inv).equals(new THREE.Matrix4()));"],
    ['.transpose() : this', '轉置。'],
    ['.determinant() : Float', '行列式。'],
    ['.makeTranslation( x, y, z ) : this', '產生平移矩陣。'],
    ['.makeRotationX/Y/Z( theta ) : this', '產生繞軸旋轉矩陣。'],
    ['.makeRotationAxis( axis, theta ) : this', '繞任意軸旋轉。'],
    ['.makeRotationFromEuler( euler ) / .makeRotationFromQuaternion( q ) : this', '由尤拉角 / 四元數產生旋轉矩陣。'],
    ['.makeScale( x, y, z ) : this', '縮放矩陣。'],
    ['.makeShear( xy, xz, yx, yz, zx, zy ) : this', '剪切矩陣。'],
    ['.makeBasis( xAxis, yAxis, zAxis ) : this', '由三個軸向量建立基底矩陣。'],
    ['.extractBasis( xAxis, yAxis, zAxis ) : this', '取出三個軸向量。'],
    ['.extractRotation( m ) : this', '取出 m 的純旋轉部分。'],
    ['.lookAt( eye, target, up ) : this', '產生讓 -Z 從 eye 指向 target 的旋轉矩陣。'],
    ['.makePerspective( left, right, top, bottom, near, far ) : this', '透視投影矩陣。'],
    ['.makeOrthographic( left, right, top, bottom, near, far ) : this', '正交投影矩陣。'],
    ['.setPosition( x, y, z ) / .copyPosition( m ) : this', '只設定 / 複製平移部分。'],
    ['.getMaxScaleOnAxis() : Float', '三軸中最大的縮放值。'],
    ['.equals( m ) / .clone() / .copy( m )', '比較與複製。'],
    ['.fromArray / .toArray', '與陣列互轉（行優先）。'],
  ],
},
{
  id: 'api-color', title: 'Color', api: true, src: 'math/Color.js',
  desc: '<p>顏色，以 <code>r</code>、<code>g</code>、<code>b</code>（0–1 浮點數，線性色彩空間）儲存。可以從十六進位數字、CSS 字串、RGB 或 HSL 建立。</p><p>色彩管理：以 hex、CSS 字串或 setHSL 設定時，輸入被視為 sRGB 並轉換成線性；<code>getHex()</code>、<code>getStyle()</code> 會轉回 sRGB。因此 <code>new Color(0x808080).r</code> 約為 0.216 而非 0.5。</p>',
  ctor: { sig: 'new Color( r : Color | Integer | String, g : Float, b : Float )', params: [
    ['r', 'Color | Integer | String', '單一參數時可為 Color、hex（0xff0000）或 CSS 字串（"red"、"#f00"、"rgb(255,0,0)"、"hsl(0,100%,50%)"）。三個參數時為 r, g, b（0–1）。'],
  ]},
  examples: [{
    title: '各種建立方式與轉換', consoleOnly: true,
    code: code`
import * as THREE from 'three';

const list = [
  new THREE.Color(0xff8800),
  new THREE.Color('skyblue'),
  new THREE.Color('#4caf50'),
  new THREE.Color('rgb(255, 0, 128)'),
  new THREE.Color('hsl(270, 80%, 60%)'),
  new THREE.Color(1, 0.5, 0),
];
list.forEach((c) => console.log(c, '→ getHex', '0x' + c.getHexString(), '｜getStyle', c.getStyle()));

const gray = new THREE.Color(0x808080);
console.log('0x808080 的線性 r =', gray.r.toFixed(4), '（因為 sRGB → 線性轉換）');

const hsl = {};
new THREE.Color('orange').getHSL(hsl);
console.log('orange 的 HSL =', hsl);
`
  }],
  props: [['.r / .g / .b : Float', '紅、綠、藍分量（線性，通常 0–1；HDR 可大於 1）。'], ['.isColor : Boolean', '型別檢查旗標。']],
  methods: [
    ['.set( r, g, b ) : this', '以任何支援的格式設定。'],
    ['.setHex( hex, colorSpace ) / .setRGB( r, g, b, colorSpace ) / .setHSL( h, s, l, colorSpace ) / .setStyle( style ) : this', '以特定格式設定。'],
    ['.setColorName( name ) : this', '以 CSS 顏色名稱設定。'],
    ['.setScalar( s ) : this', 'r = g = b = s。'],
    ['.getHex( colorSpace ) : Integer / .getHexString() : String / .getStyle() : String', '轉為 hex 數字 / 字串 / CSS 字串。'],
    ['.getHSL( target, colorSpace ) : Object / .getRGB( target, colorSpace ) : Color', '取得 HSL / RGB。'],
    ['.offsetHSL( h, s, l ) : this', '偏移色相、飽和度、亮度。',
      "const c = new THREE.Color('red');\nfor (let i = 0; i < 6; i++) {\n  console.log('#' + c.getHexString());\n  c.offsetHSL(1 / 6, 0, 0);\n}"],
    ['.lerp( color, alpha ) / .lerpColors( c1, c2, alpha ) / .lerpHSL( color, alpha ) : this', 'RGB / HSL 插值。lerpHSL 在色相環上插值，顏色更鮮豔。',
      "const a = new THREE.Color('red'), b = new THREE.Color('blue');\nconsole.log('RGB 插值 50% →', a.clone().lerp(b, 0.5));\nconsole.log('HSL 插值 50% →', a.clone().lerpHSL(b, 0.5));"],
    ['.add( c ) / .addScalar( s ) / .sub( c ) / .multiply( c ) / .multiplyScalar( s ) : this', '算術運算。'],
    ['.convertSRGBToLinear() / .convertLinearToSRGB() : this', '手動轉換色彩空間。'],
    ['.equals( c ) / .clone() / .copy( c )', '比較與複製。'],
    ['.fromArray / .toArray / .fromBufferAttribute', '與陣列 / attribute 互轉。'],
  ],
  statics: [['NAMES : Object', '所有 CSS 顏色名稱與其 hex 值的對照表。']],
},
{
  id: 'api-box3', title: 'Box3', api: true, src: 'math/Box3.js',
  desc: '<p>軸對齊包圍盒（AABB），以 <code>min</code> 與 <code>max</code> 兩個角點定義。常用於計算模型大小、置中、碰撞偵測、相機自動取景。</p>',
  ctor: { sig: 'new Box3( min : Vector3, max : Vector3 )', params: [['min / max', 'Vector3', '預設為 (+∞, +∞, +∞) 與 (-∞, -∞, -∞)，即空盒。']] },
  examples: [{
    title: 'setFromObject 與碰撞偵測',
    desc: '黃色線框為即時更新的包圍盒；兩個盒子相交時變成紅色。',
    code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ grid: true, cameraPosition: [0, 5, 7] });

const a = new THREE.Mesh(new THREE.TorusKnotGeometry(0.5, 0.18, 64, 8), new THREE.MeshStandardMaterial({ color: 0x90a4ae }));
const b = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0x90a4ae }));
scene.add(a, b);
const boxA = new THREE.Box3(), boxB = new THREE.Box3();
const helperA = new THREE.Box3Helper(boxA, 0xffff00), helperB = new THREE.Box3Helper(boxB, 0xffff00);
scene.add(helperA, helperB);

let was = false;
onFrame((t) => {
  a.position.set(Math.sin(t) * 2, 0.8, 0);
  a.rotation.set(t, t * 0.7, 0);
  b.position.set(-Math.sin(t * 0.8) * 1.5, 0.8, 0);
  boxA.setFromObject(a);
  boxB.setFromObject(b);
  const hit = boxA.intersectsBox(boxB);
  [a, b].forEach((m) => m.material.color.set(hit ? 0xef5350 : 0x90a4ae));
  helperA.material.color.set(hit ? 0xff1744 : 0xffff00);
  if (hit !== was) { was = hit; console.log(hit ? '碰撞！' : '分開', '｜A 的尺寸', boxA.getSize(new THREE.Vector3())); }
});
`
  }],
  props: [['.min : Vector3', '最小角點。'], ['.max : Vector3', '最大角點。'], ['.isBox3 : Boolean', '型別檢查旗標。']],
  methods: [
    ['.set( min, max ) : this', '設定角點。'],
    ['.setFromObject( object, precise : Boolean ) : this', '計算物件（含子孫）在世界座標中的包圍盒。precise 為 true 時逐頂點計算（較慢但更緊）。'],
    ['.setFromPoints( points : Array ) : this', '包含所有點的最小盒。',
      "const box = new THREE.Box3().setFromPoints([new THREE.Vector3(1, 2, 3), new THREE.Vector3(-1, 0, 5), new THREE.Vector3(0, 4, -2)]);\nconsole.log(box);\nconsole.log('center', box.getCenter(new THREE.Vector3()), 'size', box.getSize(new THREE.Vector3()));"],
    ['.setFromCenterAndSize( center, size ) : this', '由中心與尺寸設定。'],
    ['.setFromBufferAttribute( attribute ) : this', '由頂點資料設定。'],
    ['.getCenter( target ) : Vector3', '中心點。'],
    ['.getSize( target ) : Vector3', '尺寸。'],
    ['.getBoundingSphere( target : Sphere ) : Sphere', '外接球。'],
    ['.expandByPoint( p ) / .expandByVector( v ) / .expandByScalar( s ) / .expandByObject( obj ) : this', '擴大盒子。'],
    ['.containsPoint( p ) / .containsBox( box ) : Boolean', '是否包含點 / 盒子。'],
    ['.intersectsBox( box ) / .intersectsSphere( s ) / .intersectsPlane( p ) / .intersectsTriangle( t ) : Boolean', '相交測試。'],
    ['.intersect( box ) / .union( box ) : this', '交集 / 聯集。',
      "const a = new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(2, 2, 2));\nconst b = new THREE.Box3(new THREE.Vector3(1, 1, 1), new THREE.Vector3(3, 3, 3));\nconsole.log('交集', a.clone().intersect(b));\nconsole.log('聯集', a.clone().union(b));"],
    ['.clampPoint( p, target ) : Vector3', '盒內離 p 最近的點。'],
    ['.distanceToPoint( p ) : Float', '點到盒子的距離。'],
    ['.applyMatrix4( m ) : this', '變換後重新計算 AABB。'],
    ['.translate( offset ) : this', '平移。'],
    ['.isEmpty() / .makeEmpty()', '是否為空 / 設為空。'],
  ],
},
{
  id: 'api-sphere', title: 'Sphere', api: true, src: 'math/Sphere.js',
  desc: '<p>以中心與半徑定義的球體（數學物件，不是可見網格）。幾何體的 <code>boundingSphere</code> 就是 Sphere，用於視錐剔除與快速相交測試。</p>',
  ctor: { sig: 'new Sphere( center : Vector3, radius : Float )', params: [['center', 'Vector3', '預設 (0,0,0)。'], ['radius', 'Float', '預設 -1（空）。']] },
  examples: [{
    title: '基本操作', consoleOnly: true,
    code: code`
import * as THREE from 'three';

const s = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 2);
console.log(s);
console.log('包含 (1,1,1)？', s.containsPoint(new THREE.Vector3(1, 1, 1)));
console.log('(3,0,0) 到球面的距離 =', s.distanceToPoint(new THREE.Vector3(3, 0, 0)));
console.log('與另一球相交？', s.intersectsSphere(new THREE.Sphere(new THREE.Vector3(3.5, 0, 0), 1)));

const geo = new THREE.TorusKnotGeometry(1, 0.3);
geo.computeBoundingSphere();
console.log('TorusKnot 的 boundingSphere =', geo.boundingSphere);
console.log('外接盒 =', s.getBoundingBox(new THREE.Box3()));
`
  }],
  props: [['.center : Vector3', '中心。'], ['.radius : Float', '半徑。']],
  methods: [
    ['.set( center, radius ) : this', '設定。'],
    ['.setFromPoints( points, optionalCenter ) : this', '包含所有點的球。'],
    ['.containsPoint( p ) : Boolean', '是否包含點。'],
    ['.distanceToPoint( p ) : Float', '到球面的距離（內部為負）。'],
    ['.intersectsSphere( s ) / .intersectsBox( b ) / .intersectsPlane( p ) : Boolean', '相交測試。'],
    ['.clampPoint( p, target ) : Vector3', '把點限制到球內。'],
    ['.getBoundingBox( target ) : Box3', '外接盒。'],
    ['.applyMatrix4( m ) : this', '變換。'],
    ['.expandByPoint( p ) / .union( s ) : this', '擴大。'],
    ['.isEmpty() / .makeEmpty()', '空球判斷 / 設為空。'],
  ],
},
{
  id: 'api-ray', title: 'Ray', api: true, src: 'math/Ray.js',
  desc: '<p>射線：從 <code>origin</code> 出發、沿 <code>direction</code>（單位向量）無限延伸。<a href="#/api-raycaster">Raycaster</a> 內部使用它。也可以直接拿來做與平面、盒子、球、三角形的相交計算。</p>',
  ctor: { sig: 'new Ray( origin : Vector3, direction : Vector3 )' },
  examples: [{
    title: '射線與各種形狀相交', consoleOnly: true,
    code: code`
import * as THREE from 'three';

const ray = new THREE.Ray(new THREE.Vector3(0, 5, 0), new THREE.Vector3(0, -1, 0));
const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
console.log('與地面交點', ray.intersectPlane(ground, new THREE.Vector3()));
console.log('到地面的距離', ray.distanceToPlane(ground));

const box = new THREE.Box3(new THREE.Vector3(-1, 1, -1), new THREE.Vector3(1, 2, 1));
console.log('與盒子交點', ray.intersectBox(box, new THREE.Vector3()));
const sphere = new THREE.Sphere(new THREE.Vector3(3, 0, 0), 1);
console.log('與球相交？', ray.intersectsSphere(sphere), '（球在旁邊）');

console.log('t = 2 時的點', ray.at(2, new THREE.Vector3()));
console.log('點 (2, 0, 0) 到射線距離', ray.distanceToPoint(new THREE.Vector3(2, 0, 0)));
const tri = ray.intersectTriangle(new THREE.Vector3(-1, 0, -1), new THREE.Vector3(1, 0, -1), new THREE.Vector3(0, 0, 1), false, new THREE.Vector3());
console.log('與三角形交點', tri);
`
  }],
  props: [['.origin : Vector3', '起點。'], ['.direction : Vector3', '方向（單位向量）。']],
  methods: [
    ['.set( origin, direction ) : this', '設定。'],
    ['.at( t, target ) : Vector3', '取得 origin + direction × t。'],
    ['.lookAt( v ) : this', '讓方向指向某點。'],
    ['.recast( t ) : this', '把起點沿射線移動 t。'],
    ['.closestPointToPoint( point, target ) : Vector3', '射線上離 point 最近的點。'],
    ['.distanceToPoint( p ) / .distanceSqToPoint( p ) : Float', '點到射線的距離。'],
    ['.distanceToPlane( plane ) : Float', '沿射線到平面的距離（不相交為 null）。'],
    ['.intersectPlane( plane, target ) / .intersectBox( box, target ) / .intersectSphere( sphere, target ) : Vector3', '交點，不相交時回傳 null。'],
    ['.intersectTriangle( a, b, c, backfaceCulling, target ) : Vector3', '與三角形交點。'],
    ['.intersectsPlane / .intersectsBox / .intersectsSphere : Boolean', '只判斷是否相交。'],
    ['.applyMatrix4( m ) : this', '變換射線。'],
  ],
},
{
  id: 'api-plane', title: 'Plane', api: true, src: 'math/Plane.js',
  desc: '<p>無限延伸的數學平面，以單位法線 <code>normal</code> 與常數 <code>constant</code> 定義：平面上的點 p 滿足 <code>normal · p + constant = 0</code>。用於裁切平面（clippingPlanes）、射線拾取到地面、點的半空間判斷。</p>',
  ctor: { sig: 'new Plane( normal : Vector3, constant : Float )', params: [['normal', 'Vector3', '單位法線，預設 (1, 0, 0)。'], ['constant', 'Float', '原點到平面的有號距離，預設 0。']] },
  examples: [{
    title: '有號距離與投影', consoleOnly: true,
    code: code`
import * as THREE from 'three';

// y = 2 的水平面：normal (0,1,0)，constant = -2
const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -2);
for (const y of [5, 2, -1]) {
  const p = new THREE.Vector3(0, y, 0);
  console.log('點 y=' + y, '有號距離 =', plane.distanceToPoint(p), '（正：法線那側，負：另一側）');
}
console.log('投影 (3,7,1) 到平面 →', plane.projectPoint(new THREE.Vector3(3, 7, 1), new THREE.Vector3()));

// 由三點建立平面
const p2 = new THREE.Plane().setFromCoplanarPoints(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, -1));
console.log('三點建立的平面', p2);
// 由法線與平面上一點建立
const p3 = new THREE.Plane().setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 4));
console.log('setFromNormalAndCoplanarPoint', p3);
`
  }],
  props: [['.normal : Vector3', '單位法線。'], ['.constant : Float', '常數。']],
  methods: [
    ['.set( normal, constant ) / .setComponents( x, y, z, w ) : this', '設定。'],
    ['.setFromNormalAndCoplanarPoint( normal, point ) : this', '由法線與平面上一點建立。'],
    ['.setFromCoplanarPoints( a, b, c ) : this', '由三點建立（逆時針為正面）。'],
    ['.distanceToPoint( p ) : Float', '有號距離。'],
    ['.projectPoint( p, target ) : Vector3', '把點投影到平面上。'],
    ['.intersectLine( line, target ) : Vector3', '與線段的交點。'],
    ['.intersectsBox( box ) / .intersectsSphere( s ) / .intersectsLine( line ) : Boolean', '相交測試。'],
    ['.coplanarPoint( target ) : Vector3', '平面上的一點（離原點最近）。'],
    ['.negate() : this', '反轉法線與常數（翻面）。'],
    ['.normalize() : this', '正規化法線並調整常數。'],
    ['.applyMatrix4( m ) / .translate( offset ) : this', '變換平面。'],
  ],
},
{
  id: 'api-spherical', title: 'Spherical', api: true, src: 'math/Spherical.js',
  desc: '<p>球座標：以半徑 <code>radius</code>、極角 <code>phi</code>（從 +Y 軸量起，0~π）與方位角 <code>theta</code>（繞 Y 軸，從 +Z 量起）表示一個點。OrbitControls 內部即以球座標運作；也適合把點分布在球面上。</p>',
  ctor: { sig: 'new Spherical( radius : Float, phi : Float, theta : Float )', params: [['radius', 'Float', '預設 1。'], ['phi', 'Float', '極角，預設 0。'], ['theta', 'Float', '方位角，預設 0。']] },
  examples: [{
    title: '球面上的經緯線',
    code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 2, 6], lights: false });

const pts = [];
const s = new THREE.Spherical(2);
const v = new THREE.Vector3();
for (let i = 1; i < 12; i++) for (let j = 0; j < 48; j++) {
  s.phi = (i / 12) * Math.PI;        // 緯度
  s.theta = (j / 48) * Math.PI * 2;  // 經度
  pts.push(v.setFromSpherical(s).clone());
}
const points = new THREE.Points(new THREE.BufferGeometry().setFromPoints(pts), new THREE.PointsMaterial({ size: 0.06, color: 0x80deea }));
scene.add(points);

const back = new THREE.Spherical().setFromVector3(new THREE.Vector3(1, 1, 1));
console.log('(1,1,1) 的球座標：radius', back.radius.toFixed(3), 'phi', THREE.MathUtils.radToDeg(back.phi).toFixed(1) + '°', 'theta', THREE.MathUtils.radToDeg(back.theta).toFixed(1) + '°');
onFrame((t) => { points.rotation.y = t * 0.2; });
`
  }],
  props: [['.radius : Float', '半徑。'], ['.phi : Float', '極角（弧度）。'], ['.theta : Float', '方位角（弧度）。']],
  methods: [
    ['.set( radius, phi, theta ) : this', '設定。'],
    ['.setFromVector3( v ) / .setFromCartesianCoords( x, y, z ) : this', '由直角座標轉換。'],
    ['.makeSafe() : this', '把 phi 限制在 (0, π) 之間的安全範圍，避免在極點出現問題。'],
    ['.clone() / .copy( s )', '複製。'],
  ],
},
{
  id: 'api-mathutils', title: 'MathUtils', api: true, src: 'math/MathUtils.js',
  desc: '<p>常用數學工具函式的集合（皆為靜態函式）。</p>',
  examples: [{
    title: '常用函式', consoleOnly: true,
    code: code`
import * as THREE from 'three';
const M = THREE.MathUtils;

console.log('degToRad(180) =', M.degToRad(180));
console.log('radToDeg(Math.PI / 4) =', M.radToDeg(Math.PI / 4));
console.log('clamp(15, 0, 10) =', M.clamp(15, 0, 10));
console.log('lerp(0, 100, 0.25) =', M.lerp(0, 100, 0.25));
console.log('inverseLerp(0, 100, 25) =', M.inverseLerp(0, 100, 25));
console.log('mapLinear(5, 0, 10, 100, 200) =', M.mapLinear(5, 0, 10, 100, 200));
console.log('smoothstep(0.5, 0, 1) =', M.smoothstep(0.5, 0, 1));
console.log('smootherstep(0.5, 0, 1) =', M.smootherstep(0.5, 0, 1));
console.log('euclideanModulo(-1, 5) =', M.euclideanModulo(-1, 5), '（JS 的 -1 % 5 =', -1 % 5, '）');
console.log('pingpong(3.5, 2) =', M.pingpong(3.5, 2));
console.log('isPowerOfTwo(256) =', M.isPowerOfTwo(256), '｜ceilPowerOfTwo(300) =', M.ceilPowerOfTwo(300));
console.log('randInt(1, 6) =', M.randInt(1, 6), '｜randFloat(0, 1) =', M.randFloat(0, 1).toFixed(3));
console.log('randFloatSpread(10) =', M.randFloatSpread(10).toFixed(3), '（-5 ~ 5）');
console.log('seededRandom(42) =', M.seededRandom(42), '（相同種子結果相同）');
console.log('generateUUID() =', M.generateUUID());

// damp：與幀率無關的平滑趨近，適合每幀更新
let x = 0;
for (let i = 0; i < 5; i++) { x = M.damp(x, 10, 4, 1 / 60); }
console.log('damp 5 幀後 x =', x.toFixed(3));
`
  }],
  statics: [
    ['.degToRad( degrees ) / .radToDeg( radians ) : Float', '角度與弧度互換。另有常數 <code>DEG2RAD</code>、<code>RAD2DEG</code>。'],
    ['.clamp( value, min, max ) : Float', '限制範圍。'],
    ['.lerp( x, y, t ) : Float', '線性插值。'],
    ['.inverseLerp( x, y, value ) : Float', '反向插值：value 位於 x~y 的比例。'],
    ['.mapLinear( x, a1, a2, b1, b2 ) : Float', '把 x 從範圍 [a1, a2] 映射到 [b1, b2]。'],
    ['.damp( x, y, lambda, dt ) : Float', '與幀率無關的平滑趨近。'],
    ['.smoothstep( x, min, max ) / .smootherstep( x, min, max ) : Float', '平滑的 0~1 過渡曲線。'],
    ['.euclideanModulo( n, m ) : Integer', '永遠為正的取餘數。'],
    ['.pingpong( x, length ) : Float', '在 0 與 length 之間來回。'],
    ['.randInt( low, high ) / .randFloat( low, high ) / .randFloatSpread( range ) : Number', '隨機數。'],
    ['.seededRandom( seed ) : Float', '可重現的偽隨機數。'],
    ['.generateUUID() : String', '產生 UUID。'],
    ['.isPowerOfTwo( n ) / .ceilPowerOfTwo( n ) / .floorPowerOfTwo( n )', '2 的次方相關。'],
    ['.setQuaternionFromProperEuler( q, a, b, c, order ) : undefined', '以 proper Euler 角設定四元數。'],
  ],
},
]},

{ group: '曲線 Curves', section: 'api', items: [
{
  id: 'api-curve', title: 'Curve', api: true, src: 'extras/core/Curve.js',
  desc: '<p>曲線的抽象基底類別。子類別只需實作 <code>getPoint(t)</code>（t ∈ [0, 1]）。內建子類別包括：</p><table><tr><th>2D</th><th>3D</th></tr><tr><td><code>LineCurve</code>、<code>QuadraticBezierCurve</code>、<code>CubicBezierCurve</code>、<code>SplineCurve</code>、<code>EllipseCurve</code>、<code>ArcCurve</code></td><td><code>LineCurve3</code>、<code>QuadraticBezierCurve3</code>、<code>CubicBezierCurve3</code>、<a href="#/api-catmullromcurve3">CatmullRomCurve3</a></td></tr></table><p><code>getPoint(t)</code> 的 t 不保證與弧長成比例；需要等速移動時使用 <code>getPointAt(u)</code>。</p>',
  ctor: { sig: 'new Curve()' },
  examples: [{
    title: '自訂曲線與等速取樣',
    desc: '自訂一條心形曲線。紅點使用 getPoint(t)（速度不均），綠點使用 getPointAt(u)（等速）。',
    code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 0, 6], lights: false });

class HeartCurve extends THREE.Curve {
  getPoint(t, target = new THREE.Vector3()) {
    const a = t * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(a), 3);
    const y = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a);
    return target.set(x, y, 0).multiplyScalar(0.12);
  }
}
const curve = new HeartCurve();
scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getSpacedPoints(200)), new THREE.LineBasicMaterial({ color: 0xff80ab })));

const red = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({ color: 0xff1744 }));
const green = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({ color: 0x00e676 }));
scene.add(red, green);
console.log('曲線長度', curve.getLength().toFixed(3));
console.log('t=0.25 的切線', curve.getTangent(0.25));
onFrame((t) => {
  const u = (t * 0.12) % 1;
  curve.getPoint(u, red.position);
  curve.getPointAt(u, green.position);
});
`
  }],
  props: [['.arcLengthDivisions : Integer', '計算弧長時的取樣數，預設 200。']],
  methods: [
    ['.getPoint( t, optionalTarget ) : Vector', '取得參數 t 處的點（子類別實作）。'],
    ['.getPointAt( u, optionalTarget ) : Vector', '依弧長比例 u 取得點（等速）。'],
    ['.getPoints( divisions ) : Array', '以 t 等分取樣，回傳 divisions + 1 個點。'],
    ['.getSpacedPoints( divisions ) : Array', '以弧長等分取樣。'],
    ['.getLength() : Float', '曲線總長度。'],
    ['.getLengths( divisions ) : Array', '累計長度表。'],
    ['.updateArcLengths() : undefined', '曲線改變後重新計算弧長快取。'],
    ['.getUtoTmapping( u, distance ) : Float', '弧長比例 u 轉換為參數 t。'],
    ['.getTangent( t, target ) / .getTangentAt( u, target ) : Vector', '切線（單位向量）。'],
    ['.computeFrenetFrames( segments, closed ) : Object', '計算 Frenet 標架（tangents、normals、binormals），TubeGeometry 使用。'],
    ['.clone() / .copy() / .toJSON() / .fromJSON()', '複製與序列化。'],
  ],
},
{
  id: 'api-catmullromcurve3', title: 'CatmullRomCurve3', api: true, inherits: ['Curve'], src: 'extras/curves/CatmullRomCurve3.js',
  desc: '<p>通過所有控制點的平滑 3D 樣條曲線（Catmull-Rom spline）。適合相機路徑、物體移動軌跡、管線。</p>',
  ctor: { sig: 'new CatmullRomCurve3( points : Array, closed : Boolean, curveType : String, tension : Float )', params: [
    ['points', 'Array', 'Vector3 控制點陣列（至少 2 個）。'],
    ['closed', 'Boolean', '是否封閉，預設 false。'],
    ['curveType', 'String', '<code>"centripetal"</code>（預設，最不容易打結）、<code>"chordal"</code>、<code>"catmullrom"</code>。'],
    ['tension', 'Float', 'curveType 為 "catmullrom" 時的張力，預設 0.5。'],
  ]},
  examples: [{
    title: '相機沿路徑飛行',
    desc: '相機沿著封閉曲線移動，並使用 getTangentAt 讓它看向前方。切換 curveType 比較形狀差異。',
    code: code`
import * as THREE from 'three';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const stage = createStage({ grid: 30, cameraPosition: [14, 16, 18] });
const { scene, renderer, camera } = stage;

const pts = [[-8, 1, -6], [0, 4, -9], [8, 1, -5], [7, 6, 3], [0, 1, 8], [-7, 3, 4]].map((p) => new THREE.Vector3(...p));
const curve = new THREE.CatmullRomCurve3(pts, true, 'centripetal');
const line = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xffeb3b }));
scene.add(line);
pts.forEach((p) => { const d = new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial({ color: 0xff5722 })); d.position.copy(p); scene.add(d); });
for (let i = 0; i < 30; i++) {
  const b = new THREE.Mesh(new THREE.BoxGeometry(1, 1 + Math.random() * 4, 1), new THREE.MeshStandardMaterial({ color: 0x546e7a }));
  b.position.set((Math.random() - 0.5) * 24, b.geometry.parameters.height / 2, (Math.random() - 0.5) * 24);
  scene.add(b);
}
const rebuild = () => line.geometry.setFromPoints(curve.getPoints(300));
rebuild();

const rider = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 100);
const p = { view: '俯視', speed: 0.04 };
const gui = new GUI();
gui.add(p, 'view', ['俯視', '搭乘']);
gui.add(p, 'speed', 0.01, 0.2, 0.01);
gui.add(curve, 'curveType', ['centripetal', 'chordal', 'catmullrom']).onChange(rebuild);
gui.add(curve, 'tension', 0, 1, 0.01).onChange(rebuild);
console.log('曲線長度', curve.getLength().toFixed(2));

const tangent = new THREE.Vector3();
stage.onFrame((t) => {
  const u = (t * p.speed) % 1;
  curve.getPointAt(u, rider.position).y += 0.5;
  curve.getTangentAt(u, tangent);
  rider.lookAt(rider.position.clone().add(tangent));
});
stage.onResize((w, h) => { rider.aspect = w / h; rider.updateProjectionMatrix(); });
stage.render = () => renderer.render(scene, p.view === '搭乘' ? rider : camera);
`
  }],
  props: [
    ['.points : Array', '控制點，修改後若需重算弧長請呼叫 updateArcLengths()。'],
    ['.closed : Boolean', '是否封閉。'],
    ['.curveType : String', '曲線類型。'],
    ['.tension : Float', '張力。'],
  ],
},
]}
);
})();
