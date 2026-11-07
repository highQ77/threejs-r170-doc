/* API 參考（補充）：數學、插值器、曲線、工具 */
(function () {
var code = String.raw;
function add(name, items) {
  var g = window.DOCS.find(function (x) { return x.group === name; });
  if (!g) { g = { group: name, section: 'api', items: [] }; window.DOCS.push(g); }
  g.items.push.apply(g.items, items);
}

/* ================= 數學 ================= */
add('數學 Math', [
{
  id: 'api-vector4', title: 'Vector4', api: true, src: 'math/Vector4.js',
  desc: '<p>四維向量 (x, y, z, w)。常用於齊次座標、RGBA 顏色、四元數以外的四分量資料、渲染器的 viewport / scissor（x, y, 寬, 高）。方法與 <a href="#/api-vector3">Vector3</a> 大致相同。</p>',
  ctor: { sig: 'new Vector4( x : Float, y : Float, z : Float, w : Float )', params: [['x, y, z, w', 'Float', '預設 (0, 0, 0, 1)。']] },
  examples: [{ title: '齊次座標與透視除法', consoleOnly: true, code: code`
import * as THREE from 'three';
const cam = new THREE.PerspectiveCamera(60, 1, 1, 100);
cam.position.set(0, 0, 5);
cam.updateMatrixWorld();
const p = new THREE.Vector4(1, 1, 0, 1);              // 世界座標點（w = 1）
p.applyMatrix4(cam.matrixWorldInverse).applyMatrix4(cam.projectionMatrix);
console.log('裁切空間座標 =', p);
console.log('透視除法後 NDC =', new THREE.Vector3(p.x / p.w, p.y / p.w, p.z / p.w));
console.log('對照 Vector3.project =', new THREE.Vector3(1, 1, 0).project(cam));
const vp = new THREE.Vector4(0, 0, 800, 600);
console.log('viewport 寬 =', vp.width, '高 =', vp.height);
` }],
  props: [['.x / .y / .z / .w : Float', '分量。'], ['.width / .height : Float', 'z / w 的別名。']],
  methods: [
    ['.set( x, y, z, w ) / .setScalar( s ) / .setX … .setW', '設定。'], ['.add / .sub / .multiplyScalar / .divideScalar / .negate', '算術。'],
    ['.dot( v ) / .length() / .lengthSq() / .normalize() / .setLength( l )', '長度與內積。'], ['.applyMatrix4( m ) : this', '乘上 4×4 矩陣（不做透視除法）。'],
    ['.setAxisAngleFromQuaternion( q ) : this', '由四元數得到軸角（xyz 為軸、w 為角度）。'], ['.setAxisAngleFromRotationMatrix( m ) : this', '由旋轉矩陣得到軸角。'],
    ['.setFromMatrixPosition( m ) : this', '取出矩陣的位移。'], ['.lerp / .lerpVectors / .clamp / .floor / .round', '插值與取整。'], ['.equals / .clone / .copy / .fromArray / .toArray', '比較與複製。'],
  ],
},
{
  id: 'api-matrix3', title: 'Matrix3', api: true, src: 'math/Matrix3.js',
  desc: '<p>3×3 矩陣。用途：法線矩陣（<code>normalMatrix</code>）、2D 變換（貼圖的 UV 矩陣 <code>texture.matrix</code>）、從 Matrix4 取出旋轉 / 縮放部分。與 Matrix4 一樣，<code>set()</code> 以列優先傳入，<code>elements</code> 以行優先儲存。</p>',
  ctor: { sig: 'new Matrix3( n11, n12, n13, n21, n22, n23, n31, n32, n33 )', desc: '不帶參數時為單位矩陣。' },
  examples: [{ title: '法線矩陣與 2D 變換', consoleOnly: true, code: code`
import * as THREE from 'three';
// 非等比縮放時，法線不能直接用模型矩陣變換，必須使用法線矩陣（反轉置）
const model = new THREE.Matrix4().makeScale(1, 3, 1);
const normalMatrix = new THREE.Matrix3().getNormalMatrix(model);
const n = new THREE.Vector3(1, 1, 0).normalize();
console.log('錯誤做法：', n.clone().applyMatrix3(new THREE.Matrix3().setFromMatrix4(model)).normalize());
console.log('正確做法：', n.clone().applyMatrix3(normalMatrix).normalize());

// 2D 變換：平移 → 旋轉 → 縮放
const m = new THREE.Matrix3().makeTranslation(2, 0).multiply(new THREE.Matrix3().makeRotation(Math.PI / 2)).multiply(new THREE.Matrix3().makeScale(2, 2));
console.log(m);
console.log('(1, 0) 變換後 =', new THREE.Vector2(1, 0).applyMatrix3(m));
` }],
  props: [['.elements : Array', '9 個數值（行優先）。']],
  methods: [
    ['.set( … ) / .identity() / .copy( m ) / .clone()', '設定與複製。'], ['.setFromMatrix4( m ) : this', '取 Matrix4 左上 3×3。'],
    ['.getNormalMatrix( m : Matrix4 ) : this', '計算法線矩陣（m 左上 3×3 的反轉置）。'], ['.multiply / .premultiply / .multiplyMatrices / .multiplyScalar', '乘法。'],
    ['.invert() / .transpose() / .determinant()', '反矩陣、轉置、行列式。'], ['.makeTranslation( x, y ) / .makeRotation( theta ) / .makeScale( x, y ) : this', '2D 變換矩陣。'],
    ['.translate( tx, ty ) / .rotate( theta ) / .scale( sx, sy ) : this', '在目前矩陣上套用 2D 變換。'], ['.setUvTransform( tx, ty, sx, sy, rotation, cx, cy ) : this', '設定 UV 變換（Texture 內部使用）。'],
    ['.extractBasis( x, y, z ) : this', '取出三個基底向量。'], ['.equals / .fromArray / .toArray', '比較與陣列互轉。'],
  ],
},
{
  id: 'api-matrix2', title: 'Matrix2', api: true, src: 'math/Matrix2.js',
  desc: '<p>2×2 矩陣（r167 新增）。功能精簡，主要用於 2D 線性變換資料的儲存與傳遞（例如 TSL / 著色器的 mat2）。</p>',
  ctor: { sig: 'new Matrix2( n11, n12, n21, n22 )', desc: '不帶參數時為單位矩陣。' },
  examples: [{ title: '基本用法', consoleOnly: true, code: code`
import * as THREE from 'three';
const m = new THREE.Matrix2();
console.log('單位矩陣 elements =', m.elements);
m.set(0, -1, 1, 0);    // 列優先：旋轉 90°
console.log('set(0,-1,1,0) → elements（行優先）=', m.elements);
console.log('fromArray →', new THREE.Matrix2().fromArray([2, 0, 0, 2]).elements);
` }],
  props: [['.elements : Array', '4 個數值（行優先）。'], ['.isMatrix2 : Boolean', '型別檢查旗標。']],
  methods: [['.set( n11, n12, n21, n22 ) : this', '以列優先設定。'], ['.identity() : this', '單位矩陣。'], ['.fromArray( array, offset ) : this', '由陣列設定。']],
},
{
  id: 'api-frustum', title: 'Frustum', api: true, src: 'math/Frustum.js',
  desc: '<p>視錐體：由 6 個 <a href="#/api-plane">Plane</a> 組成，表示相機可見的空間。渲染器以它做視錐剔除；你也可以用它判斷物件是否在畫面中（例如畫面外就暫停動畫、載入遠處資源）。</p>',
  ctor: { sig: 'new Frustum( p0, p1, p2, p3, p4, p5 : Plane )' },
  examples: [{ title: '判斷物件是否在畫面中', desc: '左上方的小相機以 CameraHelper 顯示視錐；在視錐內的方塊顯示為綠色。', code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ grid: 20, cameraPosition: [10, 12, 14] });

const watcher = new THREE.PerspectiveCamera(40, 1.5, 0.5, 8);
const helper = new THREE.CameraHelper(watcher);
scene.add(watcher, helper);
const boxes = [];
for (let i = 0; i < 80; i++) {
  const b = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), new THREE.MeshStandardMaterial());
  b.position.set((Math.random() - 0.5) * 16, 0.2, (Math.random() - 0.5) * 16);
  scene.add(b);
  boxes.push(b);
}
const frustum = new THREE.Frustum(), m = new THREE.Matrix4();
let last = -1;
onFrame((t) => {
  watcher.position.set(0, 1, 0);
  watcher.lookAt(Math.cos(t * 0.5) * 5, 0.5, Math.sin(t * 0.5) * 5);
  watcher.updateMatrixWorld();
  helper.update();
  frustum.setFromProjectionMatrix(m.multiplyMatrices(watcher.projectionMatrix, watcher.matrixWorldInverse));
  let n = 0;
  boxes.forEach((b) => { const inside = frustum.intersectsObject(b); if (inside) n++; b.material.color.set(inside ? 0x00e676 : 0x546e7a); });
  if (n !== last) { last = n; console.log('視錐內的方塊數', n); }
});
` }],
  props: [['.planes : Array', '6 個 Plane。']],
  methods: [
    ['.setFromProjectionMatrix( m : Matrix4, coordinateSystem ) : this', '由「投影矩陣 × 視圖矩陣」建立。'], ['.set( p0 … p5 ) / .copy / .clone', '設定與複製。'],
    ['.containsPoint( p ) : Boolean', '點是否在視錐內。'], ['.intersectsObject( object ) : Boolean', '物件（依 geometry.boundingSphere）是否與視錐相交。'],
    ['.intersectsSprite( sprite ) / .intersectsSphere( s ) / .intersectsBox( box ) : Boolean', '其他相交測試。'],
  ],
},
{
  id: 'api-box2', title: 'Box2', api: true, src: 'math/Box2.js',
  desc: '<p>二維軸對齊包圍盒，以 min、max（Vector2）定義。方法與 <a href="#/api-box3">Box3</a> 相同，適合 2D 遊戲碰撞、螢幕空間選取框、UV 範圍。</p>',
  ctor: { sig: 'new Box2( min : Vector2, max : Vector2 )' },
  examples: [{ title: '2D 碰撞與選取框', consoleOnly: true, code: code`
import * as THREE from 'three';
const player = new THREE.Box2(new THREE.Vector2(0, 0), new THREE.Vector2(2, 2));
const wall = new THREE.Box2().setFromCenterAndSize(new THREE.Vector2(3, 1), new THREE.Vector2(2, 4));
console.log('player', player.min, player.max);
console.log('wall', wall.min, wall.max);
console.log('碰撞？', player.intersectsBox(wall));
console.log('交集', player.clone().intersect(wall).getSize(new THREE.Vector2()));
const selection = new THREE.Box2().setFromPoints([new THREE.Vector2(-1, -1), new THREE.Vector2(5, 3)]);
console.log('選取框包含 player？', selection.containsBox(player));
console.log('點 (10, 0) 到 wall 的距離', wall.distanceToPoint(new THREE.Vector2(10, 0)));
` }],
  props: [['.min / .max : Vector2', '角點。']],
  methods: [
    ['.set / .setFromPoints / .setFromCenterAndSize / .copy / .clone', '設定。'], ['.getCenter( target ) / .getSize( target )', '中心與尺寸。'],
    ['.expandByPoint / .expandByVector / .expandByScalar', '擴大。'], ['.containsPoint / .containsBox / .intersectsBox', '包含與相交。'],
    ['.clampPoint / .distanceToPoint', '最近點與距離。'], ['.intersect / .union / .translate', '交集、聯集、平移。'], ['.isEmpty / .makeEmpty / .equals', '其他。'],
  ],
},
{
  id: 'api-line3', title: 'Line3', api: true, src: 'math/Line3.js',
  desc: '<p>以起點 start 與終點 end 定義的線段。常用於計算點到線段的最近點、線段與平面的交點。</p>',
  ctor: { sig: 'new Line3( start : Vector3, end : Vector3 )' },
  examples: [{ title: '點到線段的最近點', code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 6, 6], lights: false, grid: true });
const seg = new THREE.Line3(new THREE.Vector3(-3, 0, 0), new THREE.Vector3(3, 0, 1));
scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([seg.start, seg.end]), new THREE.LineBasicMaterial({ color: 0xffffff })));
const dot = (c) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.12), new THREE.MeshBasicMaterial({ color: c })); scene.add(m); return m; };
const p = dot(0xff5252), q = dot(0x69f0ae);
const link = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineDashedMaterial({ color: 0xffeb3b, dashSize: 0.15, gapSize: 0.1 }));
scene.add(link);
console.log('線段長度', seg.distance().toFixed(3), '｜中點', seg.getCenter(new THREE.Vector3()));
onFrame((t) => {
  p.position.set(Math.cos(t) * 4, 0, Math.sin(t * 1.3) * 2.5);
  seg.closestPointToPoint(p.position, true, q.position);   // clampToLine = true：限制在線段內
  link.geometry.setFromPoints([p.position, q.position]);
  link.computeLineDistances();
});
` }],
  props: [['.start / .end : Vector3', '起點與終點。']],
  methods: [
    ['.set( start, end ) / .copy / .clone / .equals', '設定與比較。'], ['.getCenter( target ) / .delta( target )', '中點 / 終點減起點的向量。'],
    ['.distance() / .distanceSq()', '長度。'], ['.at( t, target ) : Vector3', 't ∈ [0,1] 處的點。'],
    ['.closestPointToPointParameter( point, clampToLine ) : Float', '最近點的參數 t。'], ['.closestPointToPoint( point, clampToLine, target ) : Vector3', '最近點。'],
    ['.applyMatrix4( m ) : this', '變換。'],
  ],
},
{
  id: 'api-triangle', title: 'Triangle', api: true, src: 'math/Triangle.js',
  desc: '<p>由三個頂點 a、b、c 定義的三角形，提供面積、法線、重心座標、包含判斷、最近點等計算。常用於自訂碰撞、在網格表面取樣、重心插值。</p>',
  ctor: { sig: 'new Triangle( a : Vector3, b : Vector3, c : Vector3 )' },
  examples: [{ title: '常用計算', consoleOnly: true, code: code`
import * as THREE from 'three';
const tri = new THREE.Triangle(new THREE.Vector3(0, 0, 0), new THREE.Vector3(4, 0, 0), new THREE.Vector3(0, 3, 0));
console.log('面積 =', tri.getArea());
console.log('法線 =', tri.getNormal(new THREE.Vector3()));
console.log('重心 =', tri.getMidpoint(new THREE.Vector3()));
const p = new THREE.Vector3(1, 1, 0);
console.log('包含 (1,1,0)？', tri.containsPoint(p));
console.log('重心座標 =', tri.getBarycoord(p, new THREE.Vector3()));
console.log('(5, 5, 0) 最近點 =', tri.closestPointToPoint(new THREE.Vector3(5, 5, 0), new THREE.Vector3()));
// 以重心座標插值頂點屬性（例如顏色）
const colors = [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1)];
console.log('p 點插值顏色 =', THREE.Triangle.getInterpolation(p, tri.a, tri.b, tri.c, ...colors, new THREE.Vector3()));
` }],
  props: [['.a / .b / .c : Vector3', '三個頂點。']],
  methods: [
    ['.set( a, b, c ) / .setFromPointsAndIndices( points, i0, i1, i2 ) / .setFromAttributeAndIndices( attr, i0, i1, i2 )', '設定。'],
    ['.getArea() : Float', '面積。'], ['.getMidpoint( target ) : Vector3', '重心（三頂點平均）。'], ['.getNormal( target ) : Vector3', '法線（a→b→c 逆時針為正面）。'], ['.getPlane( target ) : Plane', '所在平面。'],
    ['.getBarycoord( point, target ) : Vector3', '重心座標。'], ['.getInterpolation( point, v1, v2, v3, target ) : Vector', '依重心座標插值屬性。'],
    ['.containsPoint( p ) : Boolean', '點是否在三角形內。'], ['.closestPointToPoint( p, target ) : Vector3', '三角形上離 p 最近的點。'],
    ['.intersectsBox( box ) : Boolean', '與 Box3 相交。'], ['.isFrontFacing( direction ) : Boolean', '對某方向是否為正面。'],
  ],
  statics: [['.getNormal / .getBarycoord / .containsPoint / .getInterpolation / .isFrontFacing( … )', '不建立實例的靜態版本。']],
},
{
  id: 'api-cylindrical', title: 'Cylindrical', api: true, src: 'math/Cylindrical.js',
  desc: '<p>柱座標：以半徑 radius、繞 Y 軸的角度 theta、高度 y 表示一個點。適合螺旋、圓柱排列。</p>',
  ctor: { sig: 'new Cylindrical( radius : Float, theta : Float, y : Float )', params: [['radius', 'Float', '到 Y 軸的距離，預設 1。'], ['theta', 'Float', '從 +Z 繞 Y 軸的角度，預設 0。'], ['y', 'Float', '高度，預設 0。']] },
  examples: [{ title: '螺旋排列', code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [6, 3, 6], target: [0, 2, 0] });
const group = new THREE.Group();
const c = new THREE.Cylindrical(2, 0, 0);
for (let i = 0; i < 80; i++) {
  c.theta = i * 0.35;
  c.y = i * 0.05;
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.6), new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(i / 80, 0.7, 0.55) }));
  m.position.setFromCylindrical(c);
  m.lookAt(0, m.position.y, 0);
  group.add(m);
}
scene.add(group);
const back = new THREE.Cylindrical().setFromVector3(new THREE.Vector3(1, 5, 1));
console.log('(1,5,1) → radius', back.radius.toFixed(3), 'theta', THREE.MathUtils.radToDeg(back.theta).toFixed(1) + '°', 'y', back.y);
onFrame((t) => { group.rotation.y = t * 0.3; });
` }],
  props: [['.radius / .theta / .y : Float', '柱座標分量。']],
  methods: [['.set( radius, theta, y ) / .copy / .clone', '設定。'], ['.setFromVector3( v ) / .setFromCartesianCoords( x, y, z ) : this', '由直角座標轉換。']],
},
{
  id: 'api-sphericalharmonics3', title: 'SphericalHarmonics3', api: true, src: 'math/SphericalHarmonics3.js',
  desc: '<p>三階球諧函數，以 9 組 RGB 係數（<code>coefficients</code>，Vector3 陣列）近似「來自各方向的光照」。<a href="#/api-lightprobe">LightProbe</a> 用它儲存環境光。</p>',
  ctor: { sig: 'new SphericalHarmonics3()' },
  examples: [{ title: '手動設定光照', desc: '只設定 L0（均勻）與 L1（方向）係數：上方偏藍、下方偏橘。', code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene } = createStage({ lights: false, cameraPosition: [0, 0.5, 4] });
const sh = new THREE.SphericalHarmonics3();
sh.coefficients[0].set(0.6, 0.6, 0.6);     // L0：均勻環境光
sh.coefficients[1].set(-0.3, 0.1, 0.5);    // L1 (y)：上方偏藍
scene.add(new THREE.LightProbe(sh, 2));
scene.add(new THREE.Mesh(new THREE.SphereGeometry(1, 64, 32), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 })));
const up = sh.getAt(new THREE.Vector3(0, 1, 0), new THREE.Vector3());
const down = sh.getAt(new THREE.Vector3(0, -1, 0), new THREE.Vector3());
console.log('正上方輻照度 RGB =', up, '｜正下方 =', down);
` }],
  props: [['.coefficients : Array', '9 個 Vector3（RGB）係數。']],
  methods: [
    ['.set( coefficients ) / .zero() / .copy / .clone / .equals', '設定。'], ['.getAt( normal, target ) : Vector3', '某方向的輻射度。'],
    ['.getIrradianceAt( normal, target ) : Vector3', '某方向的輻照度（用於漫反射）。'], ['.add( sh ) / .addScaledSH( sh, s ) / .scale( s ) / .lerp( sh, alpha )', '運算。'],
    ['.fromArray / .toArray', '陣列互轉。'],
  ],
  statics: [['.getBasisAt( normal, shBasis ) : undefined', '計算某方向的 9 個基底值。']],
},
]);

/* ================= 插值器 ================= */
var INTERP_EX = function (cls, note) {
  return code`
import * as THREE from 'three';
const times = new Float32Array([0, 1, 2, 3]);
const values = new Float32Array([0, 10, 5, 20]);
const interp = new THREE.CLASS(times, values, 1, new Float32Array(1));
const out = [];
for (let t = 0; t <= 3; t += 0.5) out.push('t=' + t + ' → ' + interp.evaluate(t)[0].toFixed(2));
console.log(out.join('\n'));
console.log('NOTE');
`.replace('CLASS', cls).replace('NOTE', note);
};
add('插值器 Interpolants', [
{
  id: 'api-interpolant', title: 'Interpolant', api: true, src: 'math/Interpolant.js',
  desc: '<p>插值器的抽象基底類別：給定一組「參數位置」（通常是時間）與對應的「取樣值」，計算任意位置的值。KeyframeTrack 會依插值模式建立對應的子類別：<a href="#/api-linearinterpolant">LinearInterpolant</a>、<a href="#/api-discreteinterpolant">DiscreteInterpolant</a>、<a href="#/api-cubicinterpolant">CubicInterpolant</a>、<a href="#/api-quaternionlinearinterpolant">QuaternionLinearInterpolant</a>。</p>',
  ctor: { sig: 'new Interpolant( parameterPositions, sampleValues, sampleSize, resultBuffer )', params: [
    ['parameterPositions', 'TypedArray', '參數位置（遞增）。'], ['sampleValues', 'TypedArray', '取樣值。'], ['sampleSize', 'Number', '每個取樣的值數量。'], ['resultBuffer', 'TypedArray', '（選填）存放結果的緩衝區。'],
  ]},
  examples: [{ title: '從 track 建立插值器', consoleOnly: true, code: code`
import * as THREE from 'three';
const track = new THREE.VectorKeyframeTrack('.position', [0, 1, 2], [0, 0, 0, 10, 0, 0, 10, 10, 0]);
const interp = track.createInterpolant();
console.log('插值器類別：', interp.constructor.name);
for (const t of [0, 0.5, 1, 1.5, 2]) console.log('t =', t, '→', Array.from(interp.evaluate(t)));
` }],
  props: [['.parameterPositions / .sampleValues / .valueSize / .resultBuffer', '資料。'], ['.settings : Object', '子類別使用的設定（例如端點模式）。']],
  methods: [['.evaluate( t : Number ) : TypedArray', '計算位置 t 的值（寫入 resultBuffer 並回傳）。']],
},
{ id: 'api-linearinterpolant', title: 'LinearInterpolant', api: true, inherits: ['Interpolant'], src: 'math/interpolants/LinearInterpolant.js',
  desc: '<p>線性插值：相鄰兩個取樣之間以直線連接。對應 <code>InterpolateLinear</code>。</p>',
  ctor: { sig: 'new LinearInterpolant( parameterPositions, sampleValues, sampleSize, resultBuffer )' },
  examples: [{ title: '線性插值', consoleOnly: true, code: INTERP_EX('LinearInterpolant', '在兩點之間等比例變化') }] },
{ id: 'api-discreteinterpolant', title: 'DiscreteInterpolant', api: true, inherits: ['Interpolant'], src: 'math/interpolants/DiscreteInterpolant.js',
  desc: '<p>離散插值：直接取前一個取樣的值（階梯狀），不做任何混合。對應 <code>InterpolateDiscrete</code>，BooleanKeyframeTrack 與 StringKeyframeTrack 只能使用它。</p>',
  ctor: { sig: 'new DiscreteInterpolant( parameterPositions, sampleValues, sampleSize, resultBuffer )' },
  examples: [{ title: '離散插值', consoleOnly: true, code: INTERP_EX('DiscreteInterpolant', '值會停在前一個關鍵影格，直到下一個時間點才跳變') }] },
{ id: 'api-cubicinterpolant', title: 'CubicInterpolant', api: true, inherits: ['Interpolant'], src: 'math/interpolants/CubicInterpolant.js',
  desc: '<p>三次樣條插值：曲線平滑通過每個取樣點。對應 <code>InterpolateSmooth</code>。端點行為由 settings 中的 endingStart / endingEnd 決定（見 <a href="#/api-const-animation">動畫常數</a>）。</p>',
  ctor: { sig: 'new CubicInterpolant( parameterPositions, sampleValues, sampleSize, resultBuffer )' },
  examples: [{ title: '平滑插值', consoleOnly: true, code: INTERP_EX('CubicInterpolant', '與線性插值相比，轉折處更平滑（可能稍微超出取樣值範圍）') }] },
{ id: 'api-quaternionlinearinterpolant', title: 'QuaternionLinearInterpolant', api: true, inherits: ['Interpolant'], src: 'math/interpolants/QuaternionLinearInterpolant.js',
  desc: '<p>四元數的球面線性插值（slerp），QuaternionKeyframeTrack 的線性模式使用它，保證旋轉以最短路徑、等角速度進行。</p>',
  ctor: { sig: 'new QuaternionLinearInterpolant( parameterPositions, sampleValues, sampleSize, resultBuffer )' },
  examples: [{ title: '四元數插值', consoleOnly: true, code: code`
import * as THREE from 'three';
const q0 = new THREE.Quaternion();
const q1 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
const interp = new THREE.QuaternionLinearInterpolant(new Float32Array([0, 1]), new Float32Array([...q0.toArray(), ...q1.toArray()]), 4, new Float32Array(4));
for (const t of [0, 0.25, 0.5, 0.75, 1]) {
  const q = new THREE.Quaternion().fromArray(interp.evaluate(t));
  console.log('t =', t, '→ 繞 Y 軸', THREE.MathUtils.radToDeg(2 * Math.acos(Math.min(1, Math.abs(q.w)))).toFixed(1), '度');
}
` }] },
]);

/* ================= 曲線 ================= */
function curvePage(name, is3D, sig, params, desc, makeCode, ctrlCode) {
  var ex = code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: CAM, lights: false, grid: GRID });

MAKE
const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(100)), new THREE.LineBasicMaterial({ color: 0x4fc3f7 }));
scene.add(line);
// 控制點
CTRL.forEach((p) => {
  const d = new THREE.Mesh(new THREE.SphereGeometry(0.07), new THREE.MeshBasicMaterial({ color: 0xff7043 }));
  d.position.set(p.x, p.y, p.z || 0);
  scene.add(d);
});
// 沿曲線等速移動的點與切線
const dot = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({ color: 0xffeb3b }));
const arrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 0.8, 0xffeb3b, 0.2, 0.1);
scene.add(dot, arrow);
console.log('長度', curve.getLength().toFixed(3), '｜getPoint(0.5) =', curve.getPoint(0.5));
const p = new THREE.Vector3(), tan = new THREE.Vector3();
onFrame((t) => {
  const u = (t * 0.15) % 1;
  const pt = curve.getPointAt(u), tg = curve.getTangentAt(u);
  dot.position.set(pt.x, pt.y, pt.z || 0);
  arrow.position.copy(dot.position);
  arrow.setDirection(tan.set(tg.x, tg.y, tg.z || 0).normalize());
});
`.replace('CAM', is3D ? '[3, 3, 5]' : '[0, 0, 5]').replace('GRID', is3D ? 'true' : 'false').replace('MAKE', makeCode).replace('CTRL', ctrlCode);
  return {
    id: 'api-' + name.toLowerCase(), title: name, api: true, inherits: ['Curve'], src: 'extras/curves/' + name + '.js',
    desc: '<p>' + desc + '</p><p>' + (is3D ? '3D 曲線（Vector3）' : '2D 曲線（Vector2），常用於 Shape / Path 中') + '。共通方法（getPoint、getPointAt、getPoints、getLength、getTangent…）見 <a href="#/api-curve">Curve</a>。</p>',
    ctor: { sig: 'new ' + name + '( ' + sig + ' )', params: params },
    examples: [{ title: name + '：控制點、等速移動與切線', code: ex }],
    props: params.map(function (r) { return ['.' + r[0].split(' ')[0] + ' : ' + r[1], r[2]]; }),
  };
}
var V2 = 'Vector2', V3 = 'Vector3';
add('曲線 Curves', [
  curvePage('LineCurve', false, 'v1 : Vector2, v2 : Vector2', [['v1', V2, '起點。'], ['v2', V2, '終點。']], '2D 直線段。',
    'const curve = new THREE.LineCurve(new THREE.Vector2(-2, -1), new THREE.Vector2(2, 1));', 'const ctrl = [curve.v1, curve.v2];\nctrl'),
  curvePage('LineCurve3', true, 'v1 : Vector3, v2 : Vector3', [['v1', V3, '起點。'], ['v2', V3, '終點。']], '3D 直線段。',
    'const curve = new THREE.LineCurve3(new THREE.Vector3(-2, 0, -1), new THREE.Vector3(2, 2, 1));', 'const ctrl = [curve.v1, curve.v2];\nctrl'),
  curvePage('QuadraticBezierCurve', false, 'v0 : Vector2, v1 : Vector2, v2 : Vector2', [['v0', V2, '起點。'], ['v1', V2, '控制點。'], ['v2', V2, '終點。']], '2D 二次貝茲曲線：曲線被控制點 v1「拉」向它，但不會經過它。',
    'const curve = new THREE.QuadraticBezierCurve(new THREE.Vector2(-2, -1), new THREE.Vector2(0, 2.5), new THREE.Vector2(2, -1));', 'const ctrl = [curve.v0, curve.v1, curve.v2];\nctrl'),
  curvePage('QuadraticBezierCurve3', true, 'v0 : Vector3, v1 : Vector3, v2 : Vector3', [['v0', V3, '起點。'], ['v1', V3, '控制點。'], ['v2', V3, '終點。']], '3D 二次貝茲曲線。',
    'const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(-2, 0, 0), new THREE.Vector3(0, 3, -2), new THREE.Vector3(2, 0, 1));', 'const ctrl = [curve.v0, curve.v1, curve.v2];\nctrl'),
  curvePage('CubicBezierCurve', false, 'v0 : Vector2, v1 : Vector2, v2 : Vector2, v3 : Vector2', [['v0', V2, '起點。'], ['v1', V2, '第一控制點。'], ['v2', V2, '第二控制點。'], ['v3', V2, '終點。']], '2D 三次貝茲曲線（與 Illustrator、CSS cubic-bezier 相同的曲線）。',
    'const curve = new THREE.CubicBezierCurve(new THREE.Vector2(-2, -1), new THREE.Vector2(-1, 2), new THREE.Vector2(1, -2), new THREE.Vector2(2, 1));', 'const ctrl = [curve.v0, curve.v1, curve.v2, curve.v3];\nctrl'),
  curvePage('CubicBezierCurve3', true, 'v0 : Vector3, v1 : Vector3, v2 : Vector3, v3 : Vector3', [['v0', V3, '起點。'], ['v1', V3, '第一控制點。'], ['v2', V3, '第二控制點。'], ['v3', V3, '終點。']], '3D 三次貝茲曲線。',
    'const curve = new THREE.CubicBezierCurve3(new THREE.Vector3(-2, 0, 0), new THREE.Vector3(-1, 3, 2), new THREE.Vector3(1, -1, -2), new THREE.Vector3(2, 2, 0));', 'const ctrl = [curve.v0, curve.v1, curve.v2, curve.v3];\nctrl'),
  curvePage('SplineCurve', false, 'points : Array', [['points', 'Array', 'Vector2 陣列，曲線會平滑通過每一點。']], '2D Catmull-Rom 樣條曲線（3D 版本為 <a href="#/api-catmullromcurve3">CatmullRomCurve3</a>）。',
    'const curve = new THREE.SplineCurve([new THREE.Vector2(-2.5, 0), new THREE.Vector2(-1, 1.5), new THREE.Vector2(0, -1), new THREE.Vector2(1.2, 1), new THREE.Vector2(2.5, -0.5)]);', 'const ctrl = curve.points;\nctrl'),
  curvePage('EllipseCurve', false, 'aX, aY, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation', [
    ['aX / aY', 'Float', '中心。'], ['xRadius / yRadius', 'Float', 'X / Y 半徑。'], ['aStartAngle / aEndAngle', 'Radians', '起始 / 結束角度（從 +X 軸逆時針）。'], ['aClockwise', 'Boolean', '是否順時針。'], ['aRotation', 'Radians', '整體旋轉角度。'],
  ], '橢圓（或橢圓弧）。', 'const curve = new THREE.EllipseCurve(0, 0, 2.2, 1.2, 0, Math.PI * 1.6, false, Math.PI / 8);', 'const ctrl = [new THREE.Vector2(curve.aX, curve.aY)];\nctrl'),
  curvePage('ArcCurve', false, 'aX, aY, aRadius, aStartAngle, aEndAngle, aClockwise', [
    ['aX / aY', 'Float', '圓心。'], ['aRadius', 'Float', '半徑。'], ['aStartAngle / aEndAngle', 'Radians', '起始 / 結束角度。'], ['aClockwise', 'Boolean', '是否順時針。'],
  ], '圓弧，是 <a href="#/api-ellipsecurve">EllipseCurve</a> 在 xRadius = yRadius 時的特例（繼承自 EllipseCurve）。', 'const curve = new THREE.ArcCurve(0, 0, 1.6, Math.PI * 0.1, Math.PI * 1.4, false);', 'const ctrl = [new THREE.Vector2(curve.aX, curve.aY)];\nctrl'),
  {
    id: 'api-curvepath', title: 'CurvePath', api: true, inherits: ['Curve'], src: 'extras/core/CurvePath.js',
    desc: '<p>由多段 Curve 串接成的複合曲線，本身也是一條 Curve（可傳給 TubeGeometry 等）。<a href="#/api-path">Path</a> 與 <a href="#/api-shape">Shape</a> 都繼承自它。</p>',
    ctor: { sig: 'new CurvePath()' },
    examples: [{ title: '串接直線與貝茲曲線成為管道路徑', code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [4, 4, 6], grid: true });
const path = new THREE.CurvePath();
path.add(new THREE.LineCurve3(new THREE.Vector3(-3, 0.3, 0), new THREE.Vector3(-1, 0.3, 0)));
path.add(new THREE.CubicBezierCurve3(new THREE.Vector3(-1, 0.3, 0), new THREE.Vector3(0, 0.3, 0), new THREE.Vector3(0, 2.5, 0), new THREE.Vector3(1, 2.5, 0)));
path.add(new THREE.LineCurve3(new THREE.Vector3(1, 2.5, 0), new THREE.Vector3(3, 2.5, 0)));
scene.add(new THREE.Mesh(new THREE.TubeGeometry(path, 120, 0.15, 12), new THREE.MeshStandardMaterial({ color: 0x26a69a })));
console.log('段數', path.curves.length, '｜總長', path.getLength().toFixed(3), '｜各段累計長度', path.getCurveLengths().map((l) => l.toFixed(2)));
const ball = new THREE.Mesh(new THREE.SphereGeometry(0.22), new THREE.MeshStandardMaterial({ color: 0xffca28 }));
scene.add(ball);
onFrame((t) => path.getPointAt((t * 0.2) % 1, ball.position));
` }],
    props: [['.curves : Array', '曲線陣列。'], ['.autoClose : Boolean', '是否自動首尾相連。']],
    methods: [['.add( curve ) : undefined', '加入一段曲線。'], ['.closePath() : this', '加入一段直線連回起點。'], ['.getCurveLengths() : Array', '各段累計長度。'], ['.getPoints( divisions ) / .getSpacedPoints( divisions ) : Array', '取樣點。']],
  },
  {
    id: 'api-path', title: 'Path', api: true, inherits: ['Curve', 'CurvePath'], src: 'extras/core/Path.js',
    desc: '<p>以類似 Canvas 2D 的繪圖指令（moveTo、lineTo、arc…）建立 2D 路徑。常作為 <a href="#/api-shape">Shape</a> 的孔洞，或用 <code>getPoints()</code> 取得點後畫線。</p>',
    ctor: { sig: 'new Path( points : Array )', params: [['points', 'Array', '（選填）Vector2 陣列，以直線連接。']] },
    examples: [{ title: '繪圖指令', code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene } = createStage({ cameraPosition: [0, 0, 6], lights: false });
const path = new THREE.Path();
path.moveTo(-2, -1);
path.lineTo(-2, 1);
path.quadraticCurveTo(-1, 2, 0, 1);
path.bezierCurveTo(0.5, 0, 1.5, 2, 2, 1);
path.lineTo(2, -1);
path.absarc(0, -1, 2, 0, Math.PI, true);   // 下方圓弧回到起點
const pts = path.getPoints(24);
scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xffd54f })));
console.log('曲線段數', path.curves.length, '｜取樣點數', pts.length, '｜目前點', path.currentPoint);
` }],
    props: [['.currentPoint : Vector2', '目前的畫筆位置。']],
    methods: [
      ['.moveTo( x, y ) / .lineTo( x, y ) : this', '移動 / 直線。'], ['.quadraticCurveTo( cpX, cpY, x, y ) / .bezierCurveTo( cp1X, cp1Y, cp2X, cp2Y, x, y ) : this', '貝茲曲線。'],
      ['.splineThru( points ) : this', '通過多點的樣條。'], ['.arc / .absarc( x, y, radius, start, end, clockwise ) : this', '圓弧（相對 / 絕對）。'],
      ['.ellipse / .absellipse( x, y, xRadius, yRadius, start, end, clockwise, rotation ) : this', '橢圓弧。'], ['.setFromPoints( points ) : this', '以直線連接點。'],
    ],
  },
  {
    id: 'api-shapepath', title: 'ShapePath', api: true, src: 'extras/core/ShapePath.js',
    desc: '<p>多個子路徑的集合，主要用於 SVG 或字型輪廓：<code>SVGLoader</code> 與 <code>Font</code> 都會產生 ShapePath。用 <code>toShapes()</code> 依路徑方向自動判斷外框與孔洞，轉成可三角化的 Shape 陣列。</p>',
    ctor: { sig: 'new ShapePath()' },
    examples: [{ title: '外框與孔洞自動判斷', code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene } = createStage({ cameraPosition: [0, 0, 6], lights: false });
const sp = new THREE.ShapePath();
// 外框（順時針）
sp.moveTo(-2, -2); sp.lineTo(-2, 2); sp.lineTo(2, 2); sp.lineTo(2, -2); sp.lineTo(-2, -2);
// 孔洞（逆時針）
sp.moveTo(-1, -1); sp.lineTo(1, -1); sp.lineTo(1, 1); sp.lineTo(-1, 1); sp.lineTo(-1, -1);
const shapes = sp.toShapes(true);
console.log('subPaths', sp.subPaths.length, '→ shapes', shapes.length, '｜第一個 shape 的孔洞數', shapes[0].holes.length);
scene.add(new THREE.Mesh(new THREE.ShapeGeometry(shapes), new THREE.MeshBasicMaterial({ color: 0x7e57c2, side: THREE.DoubleSide })));
` }],
    props: [['.subPaths : Array', 'Path 陣列。'], ['.currentPath : Path', '目前的子路徑。'], ['.color : Color', '路徑顏色（SVG 載入時設定）。']],
    methods: [['.moveTo / .lineTo / .quadraticCurveTo / .bezierCurveTo / .splineThru : this', '繪圖指令（moveTo 會開始新的子路徑）。'], ['.toShapes( isCCW : Boolean ) : Array', '轉為 Shape 陣列。isCCW 指定外框的方向。']],
  },
  {
    id: 'api-interpolations', title: 'Interpolations', api: true, src: 'extras/core/Interpolations.js',
    desc: '<p>曲線類別內部使用的插值函式：<code>CatmullRom( t, p0, p1, p2, p3 )</code>、<code>QuadraticBezier( t, p0, p1, p2 )</code>、<code>CubicBezier( t, p0, p1, p2, p3 )</code>，皆對單一數值（純量）運算。</p><div class="note">這些函式<b>沒有</b>從 <code>three</code> 主模組匯出。需要時可以直接使用對應的曲線類別（例如 <a href="#/api-cubicbeziercurve">CubicBezierCurve</a>），或自行實作（如下範例）。</div>',
    examples: [{ title: '自行實作的三次貝茲插值 vs. CubicBezierCurve', consoleOnly: true, code: code`
import * as THREE from 'three';
// 與 three.js 內部 CubicBezier() 相同的公式
function cubicBezier(t, p0, p1, p2, p3) {
  const k = 1 - t;
  return k * k * k * p0 + 3 * k * k * t * p1 + 3 * k * t * t * p2 + t * t * t * p3;
}
const curve = new THREE.CubicBezierCurve(new THREE.Vector2(0, 0), new THREE.Vector2(1, 2), new THREE.Vector2(3, 2), new THREE.Vector2(4, 0));
for (const t of [0, 0.25, 0.5, 0.75, 1]) {
  const mine = new THREE.Vector2(cubicBezier(t, 0, 1, 3, 4), cubicBezier(t, 0, 2, 2, 0));
  console.log('t =', t, '自行計算', mine, '｜curve.getPoint', curve.getPoint(t));
}
` }],
  },
]);

/* ================= 工具 ================= */
add('工具 Extras', [
{
  id: 'api-shapeutils', title: 'ShapeUtils', api: true, src: 'extras/ShapeUtils.js',
  desc: '<p>2D 形狀的工具函式：面積、方向判斷、三角化。ShapeGeometry、ExtrudeGeometry 內部使用。</p>',
  examples: [{ title: '三角化與方向', code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene } = createStage({ cameraPosition: [0, 0, 6], lights: false });
const contour = [new THREE.Vector2(-2, -1.5), new THREE.Vector2(2, -1.5), new THREE.Vector2(2, 1.5), new THREE.Vector2(0, 0.3), new THREE.Vector2(-2, 1.5)];
const hole = [new THREE.Vector2(-1.2, -1), new THREE.Vector2(-1.2, -0.3), new THREE.Vector2(-0.5, -0.3), new THREE.Vector2(-0.5, -1)];
console.log('面積', THREE.ShapeUtils.area(contour), '｜順時針？', THREE.ShapeUtils.isClockWise(contour), '｜孔洞順時針？', THREE.ShapeUtils.isClockWise(hole));
const faces = THREE.ShapeUtils.triangulateShape(contour, [hole]);
console.log('三角形數', faces.length, '｜前兩個', faces.slice(0, 2));
const all = contour.concat(hole);
const geo = new THREE.BufferGeometry().setFromPoints(all.map((p) => new THREE.Vector3(p.x, p.y, 0)));
geo.setIndex(faces.flat());
scene.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x26c6da, side: THREE.DoubleSide })));
scene.add(new THREE.LineSegments(new THREE.WireframeGeometry(geo), new THREE.LineBasicMaterial({ color: 0x000000 })));
` }],
  statics: [
    ['.area( contour : Array ) : Number', '有號面積（正為逆時針）。'], ['.isClockWise( pts : Array ) : Boolean', '是否為順時針。'],
    ['.triangulateShape( contour : Array, holes : Array ) : Array', '三角化，回傳索引三元組陣列（頂點順序：contour 後接各孔洞）。'],
  ],
},
{
  id: 'api-earcut', title: 'Earcut', api: true, src: 'extras/Earcut.js',
  desc: '<p>three.js 內建的多邊形三角化演算法（移植自 mapbox/earcut），支援孔洞，速度快。ShapeUtils.triangulateShape 內部使用它。</p><div class="note">Earcut <b>沒有</b>從 <code>three</code> 主模組匯出。請使用 <a href="#/api-shapeutils">ShapeUtils.triangulateShape()</a>，它會把資料轉成 Earcut 需要的格式並呼叫它。</div>',
  examples: [{ title: '透過 ShapeUtils 使用 Earcut', consoleOnly: true, code: code`
import * as THREE from 'three';
// Earcut.triangulate(data, holeIndices, dim) 的資料格式：扁平座標陣列
// 這裡改用公開的 ShapeUtils.triangulateShape，它內部即呼叫 Earcut
const square = [new THREE.Vector2(0, 0), new THREE.Vector2(10, 0), new THREE.Vector2(10, 10), new THREE.Vector2(0, 10)];
const hole = [new THREE.Vector2(3, 3), new THREE.Vector2(3, 7), new THREE.Vector2(7, 7), new THREE.Vector2(7, 3)];
const tris = THREE.ShapeUtils.triangulateShape(square, [hole]);
console.log('帶孔正方形 →', tris.length, '個三角形');
console.log(JSON.stringify(tris));
` }],
  statics: [['.triangulate( data : Array, holeIndices : Array, dim : Number ) : Array', '（內部）三角化扁平座標陣列，回傳索引陣列。']],
},
{
  id: 'api-datautils', title: 'DataUtils', api: true, src: 'extras/DataUtils.js',
  desc: '<p>資料轉換工具，主要用於半精度浮點（HalfFloat，16 位元）與一般浮點數的互轉，例如手動建立 HalfFloatType 的 DataTexture。</p>',
  examples: [{ title: 'Half Float 轉換', consoleOnly: true, code: code`
import * as THREE from 'three';
for (const v of [0, 1, 0.5, 3.14159, 65504, 1e-5]) {
  const h = THREE.DataUtils.toHalfFloat(v);
  console.log(String(v).padEnd(8), '→ half 0x' + h.toString(16).padStart(4, '0'), '→ 還原', THREE.DataUtils.fromHalfFloat(h));
}
// 建立 HalfFloat 貼圖資料
const data = new Uint16Array(4 * 4);
for (let i = 0; i < 4; i++) data.set([THREE.DataUtils.toHalfFloat(2.5), 0, 0, THREE.DataUtils.toHalfFloat(1)], i * 4);
const tex = new THREE.DataTexture(data, 2, 2, THREE.RGBAFormat, THREE.HalfFloatType);
console.log('HalfFloat DataTexture type =', tex.type === THREE.HalfFloatType ? 'HalfFloatType' : tex.type);
` }],
  statics: [['.toHalfFloat( val : Number ) : Number', '把浮點數轉為 16 位元表示（Uint16）。超出範圍時會警告並截斷。'], ['.fromHalfFloat( val : Number ) : Number', '把 16 位元表示轉回浮點數。']],
},
{
  id: 'api-imageutils', title: 'ImageUtils', api: true, src: 'extras/ImageUtils.js',
  desc: '<p>影像工具函式。</p>',
  examples: [{ title: 'getDataURL', code: code`
import * as THREE from 'three';
const c = document.createElement('canvas'); c.width = c.height = 32;
const ctx = c.getContext('2d');
ctx.fillStyle = '#ff7043'; ctx.fillRect(0, 0, 32, 32);
ctx.fillStyle = '#fff'; ctx.fillRect(8, 8, 16, 16);
const url = THREE.ImageUtils.getDataURL(c);
console.log('data URL 長度', url.length, '｜開頭', url.slice(0, 30));
const img = document.createElement('img');
img.src = url;
img.style.cssText = 'width:96px;image-rendering:pixelated;margin:20px';
document.body.appendChild(img);
` }],
  statics: [['.getDataURL( image : HTMLCanvasElement | Image | ImageBitmap ) : String', '把影像轉為 data URL（大圖會轉為 JPEG）。'], ['.sRGBToLinear( image ) : Object', '把影像像素由 sRGB 轉為線性。']],
},
{
  id: 'api-textureutils', title: 'TextureUtils', api: true, src: 'extras/TextureUtils.js',
  desc: '<p>貼圖工具函式：類似 CSS <code>object-fit</code> 的縮放（contain / cover / fill，作用於 texture.repeat 與 offset），以及計算貼圖占用的記憶體大小。</p>',
  examples: [{ title: 'contain / cover / fill', desc: '同一張 2:1 的貼圖套在正方形上的三種方式。', code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene } = createStage({ cameraPosition: [0, 0, 6], lights: false });
const c = document.createElement('canvas'); c.width = 256; c.height = 128;
const ctx = c.getContext('2d');
const g = ctx.createLinearGradient(0, 0, 256, 0); g.addColorStop(0, '#e91e63'); g.addColorStop(1, '#3f51b5');
ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 128);
ctx.fillStyle = '#fff'; ctx.font = 'bold 60px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('2 : 1', 128, 85);
['contain', 'cover', 'fill'].forEach((mode, i) => {
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  THREE.TextureUtils[mode](tex, 1);   // 目標寬高比 1:1
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), new THREE.MeshBasicMaterial({ map: tex }));
  m.position.x = (i - 1) * 1.9;
  scene.add(m);
  console.log(mode.padEnd(8), 'repeat', tex.repeat, 'offset', tex.offset);
});
console.log('256×128 RGBA 貼圖大小 =', THREE.TextureUtils.getByteLength(256, 128, THREE.RGBAFormat, THREE.UnsignedByteType), 'bytes');
` }],
  statics: [
    ['.contain( texture, aspect ) : Texture', '完整顯示貼圖（可能留空）。'], ['.cover( texture, aspect ) : Texture', '填滿區域（可能裁切）。'],
    ['.fill( texture ) : Texture', '拉伸填滿（重設 repeat / offset）。'], ['.getByteLength( width, height, format, type ) : Number', '計算貼圖資料大小。'],
  ],
},
{
  id: 'api-pmremgenerator', title: 'PMREMGenerator', api: true, src: 'extras/PMREMGenerator.js',
  desc: '<p>產生 PMREM（Prefiltered, Mipmapped Radiance Environment Map）：把環境貼圖預先模糊成不同粗糙度的層級，讓 MeshStandardMaterial / MeshPhysicalMaterial 能正確呈現不同 roughness 的反射。<code>scene.environment</code> 設定一般貼圖時，渲染器會自動呼叫它；也可以手動使用以控制時機或從場景產生環境。</p>',
  ctor: { sig: 'new PMREMGenerator( renderer : WebGLRenderer )' },
  examples: [{ title: 'fromScene：把場景烘焙成環境貼圖', desc: '以幾個發光方塊組成虛擬攝影棚，產生環境貼圖後就可以移除它們。', code: code`
import * as THREE from 'three';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const { scene, renderer } = createStage({ lights: false, cameraPosition: [0, 0.5, 5] });

const studio = new THREE.Scene();
const glow = (color, pos, size) => { const m = new THREE.Mesh(new THREE.BoxGeometry(...size), new THREE.MeshBasicMaterial({ color })); m.position.set(...pos); studio.add(m); };
glow(0xffffff, [0, 5, 0], [6, 0.2, 6]);
glow(0xff4081, [-5, 1, 0], [0.2, 4, 4]);
glow(0x40c4ff, [5, 1, 0], [0.2, 4, 4]);

const pmrem = new THREE.PMREMGenerator(renderer);
const envRT = pmrem.fromScene(studio, 0.02);
scene.environment = envRT.texture;
pmrem.dispose();   // 產生完即可釋放產生器
console.log('環境貼圖', envRT.texture.mapping === THREE.CubeUVReflectionMapping ? 'CubeUVReflectionMapping' : envRT.texture.mapping);

const mats = [0, 0.25, 0.5, 0.8].map((r, i) => {
  const m = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: r });
  const s = new THREE.Mesh(new THREE.SphereGeometry(0.5, 64, 32), m);
  s.position.x = (i - 1.5) * 1.2;
  scene.add(s);
  return m;
});
console.log('左到右 roughness：0、0.25、0.5、0.8');
` }],
  methods: [
    ['.fromScene( scene, sigma, near, far, options ) : WebGLRenderTarget', '把場景渲染成 PMREM（sigma 為模糊程度）。'], ['.fromEquirectangular( texture, renderTarget ) : WebGLRenderTarget', '由全景圖產生。'],
    ['.fromCubemap( cubemap, renderTarget ) : WebGLRenderTarget', '由立方體貼圖產生。'], ['.compileCubemapShader() / .compileEquirectangularShader()', '預先編譯著色器，避免第一次轉換時卡頓。'],
    ['.dispose() : undefined', '釋放產生器的內部資源（不會釋放已產生的貼圖）。'],
  ],
},
{
  id: 'api-controls', title: 'Controls', api: true, inherits: ['EventDispatcher'], src: 'extras/Controls.js',
  desc: '<p>所有相機 / 物件控制器（OrbitControls、TransformControls、MapControls…）的抽象基底類別（r168 新增），定義共通的屬性與生命週期方法。可以繼承它撰寫自己的控制器。</p>',
  ctor: { sig: 'new Controls( object : Object3D, domElement : HTMLElement )' },
  examples: [{ title: '自訂控制器：鍵盤移動物件', desc: '點一下畫面後，用方向鍵移動方塊。', code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, renderer, onFrame } = createStage({ grid: true, cameraPosition: [0, 6, 6] });

class KeyboardControls extends THREE.Controls {
  constructor(object, domElement) {
    super(object, domElement);
    this.speed = 3;
    this.keys = {};
    this._down = (e) => (this.keys[e.key] = true);
    this._up = (e) => (this.keys[e.key] = false);
    this.connect();
  }
  connect() { addEventListener('keydown', this._down); addEventListener('keyup', this._up); }
  disconnect() { removeEventListener('keydown', this._down); removeEventListener('keyup', this._up); }
  update(delta) {
    if (!this.enabled) return;
    const k = this.keys, d = this.speed * delta;
    if (k.ArrowLeft) this.object.position.x -= d;
    if (k.ArrowRight) this.object.position.x += d;
    if (k.ArrowUp) this.object.position.z -= d;
    if (k.ArrowDown) this.object.position.z += d;
  }
  dispose() { this.disconnect(); }
}
const box = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), new THREE.MeshStandardMaterial({ color: 0xab47bc }));
box.position.y = 0.4;
scene.add(box);
const controls = new KeyboardControls(box, renderer.domElement);
console.log('controls 繼承自 Controls？', controls instanceof THREE.Controls, '｜enabled =', controls.enabled);
onFrame((t, dt) => controls.update(dt));
` }],
  props: [['.object : Object3D', '被控制的物件。'], ['.domElement : HTMLElement', '監聽事件的元素。'], ['.enabled : Boolean', '是否啟用。'], ['.state : Number', '目前狀態（由子類別定義）。'], ['.keys / .mouseButtons / .touches : Object', '按鍵對應（由子類別使用）。']],
  methods: [['.connect() : undefined', '開始監聽事件。'], ['.disconnect() : undefined', '停止監聽事件。'], ['.update( delta ) : undefined', '每幀更新。'], ['.dispose() : undefined', '釋放資源。']],
},
]);
})();
