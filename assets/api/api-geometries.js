/* API 參考：幾何體 Geometries
 * 以 geoPage() 依參數規格自動產生「可用面板調整參數」的範例。
 */
(function () {
var code = String.raw;
var BG = ['EventDispatcher', 'BufferGeometry'];
var PI2 = 'Math.PI * 2', PI = 'Math.PI';

/* 參數規格：[名稱, 型別, 預設值(程式碼字串), 說明, GUI 規格]
 * GUI 規格：[min, max, step]、'bool'、'angle'（0~2π）、'angle1'（0~π）、null（不放入面板） */
function geoPage(name, desc, params, opt) {
  opt = opt || {};
  var guiParams = params.filter(function (p) { return p[4] !== null; });
  var lines = [];
  lines.push("import * as THREE from 'three';");
  lines.push("import GUI from 'three/addons/libs/lil-gui.module.min.js';");
  lines.push("import { createStage } from 'doc-stage';");
  lines.push("const { scene, onFrame } = createStage({ cameraPosition: " + JSON.stringify(opt.cam || [3, 2.5, 5]) + " });");
  lines.push('');
  lines.push('const params = {');
  guiParams.forEach(function (p) { lines.push('  ' + p[0] + ': ' + p[2] + ','); });
  lines.push('};');
  lines.push('');
  lines.push('const mesh = new THREE.Mesh(');
  lines.push('  new THREE.BufferGeometry(),');
  lines.push('  new THREE.MeshStandardMaterial({ color: 0x4f9cff, side: THREE.DoubleSide, flatShading: true })');
  lines.push(');');
  lines.push('const wire = new THREE.LineSegments(');
  lines.push('  new THREE.BufferGeometry(),');
  lines.push('  new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 })');
  lines.push(');');
  lines.push('mesh.add(wire);');
  lines.push('scene.add(mesh);');
  lines.push('');
  lines.push('function rebuild() {');
  lines.push('  mesh.geometry.dispose();');
  lines.push('  mesh.geometry = new THREE.' + name + '(');
  lines.push('    ' + params.map(function (p) { return p[4] === null ? p[2] : 'params.' + p[0]; }).join(', '));
  lines.push('  );');
  lines.push('  wire.geometry.dispose();');
  lines.push('  wire.geometry = new THREE.WireframeGeometry(mesh.geometry);');
  lines.push('}');
  lines.push('function report() {');
  lines.push("  console.log('頂點數', mesh.geometry.attributes.position.count, '｜parameters', mesh.geometry.parameters);");
  lines.push('}');
  lines.push('rebuild();');
  lines.push('report();');
  lines.push('');
  lines.push('const gui = new GUI();');
  guiParams.forEach(function (p) {
    var g = p[4], args;
    if (g === 'bool') args = '';
    else if (g === 'angle') args = ', 0, Math.PI * 2, 0.01';
    else if (g === 'angle1') args = ', 0, Math.PI, 0.01';
    else args = ', ' + g.join(', ');
    lines.push("gui.add(params, '" + p[0] + "'" + args + ').onChange(rebuild).onFinishChange(report);');
  });
  lines.push('');
  lines.push('onFrame((t) => { mesh.rotation.y = t * 0.3; });');

  return {
    id: 'api-' + name.toLowerCase(), title: name, api: true, inherits: BG,
    src: 'geometries/' + name + '.js',
    desc: desc,
    ctor: {
      sig: 'new ' + name + '( ' + params.map(function (p) { return p[0] + ' : ' + p[1]; }).join(', ') + ' )',
      params: params.map(function (p) { return [p[0], p[1], p[3] + (p[2] !== undefined && p[4] !== null ? '預設 <code>' + p[2].replace('Math.PI * 2', '2π').replace('Math.PI', 'π') + '</code>。' : '')]; }),
    },
    examples: [{ title: name + ' 參數調整', desc: '用右上角面板調整建構參數，即時重建幾何體；放開滑桿時 console 印出頂點數與 parameters。', code: lines.join('\n') }],
    props: [['.parameters : Object', '建構時傳入的參數。<b>修改它不會改變幾何體</b>，若要改變形狀需要建立新的幾何體（並 dispose 舊的）。']].concat(opt.props || []),
    methods: opt.methods,
  };
}

var items = [
  geoPage('BoxGeometry', '<p>長方體。預設中心位於原點，每個面各為一個 group（共 6 個，可分別指定材質）。</p>', [
    ['width', 'Float', '1', 'X 方向寬度。', [0.1, 3, 0.01]],
    ['height', 'Float', '1', 'Y 方向高度。', [0.1, 3, 0.01]],
    ['depth', 'Float', '1', 'Z 方向深度。', [0.1, 3, 0.01]],
    ['widthSegments', 'Integer', '1', '寬度方向分段數。', [1, 10, 1]],
    ['heightSegments', 'Integer', '1', '高度方向分段數。', [1, 10, 1]],
    ['depthSegments', 'Integer', '1', '深度方向分段數。', [1, 10, 1]],
  ]),
  geoPage('SphereGeometry', '<p>球體。透過 phi（水平）與 theta（垂直）的起點與長度，可以只建立球體的一部分，例如半球或球殼切片。</p>', [
    ['radius', 'Float', '1', '半徑。', [0.1, 2, 0.01]],
    ['widthSegments', 'Integer', '32', '水平分段數，最小 3。', [3, 64, 1]],
    ['heightSegments', 'Integer', '16', '垂直分段數，最小 2。', [2, 32, 1]],
    ['phiStart', 'Float', '0', '水平起始角度。', 'angle'],
    ['phiLength', 'Float', PI2, '水平掃過角度。', 'angle'],
    ['thetaStart', 'Float', '0', '垂直起始角度。', 'angle1'],
    ['thetaLength', 'Float', PI, '垂直掃過角度。', 'angle1'],
  ]),
  geoPage('PlaneGeometry', '<p>平面，位於 XY 平面、面向 +Z。用作地面時通常 <code>rotation.x = -Math.PI / 2</code>。增加分段數可做地形或波浪。</p>', [
    ['width', 'Float', '1', '寬度。', [0.1, 4, 0.01]],
    ['height', 'Float', '1', '高度。', [0.1, 4, 0.01]],
    ['widthSegments', 'Integer', '1', '寬度分段數。', [1, 30, 1]],
    ['heightSegments', 'Integer', '1', '高度分段數。', [1, 30, 1]],
  ], { cam: [0, 0, 3] }),
  geoPage('CircleGeometry', '<p>圓形（扇形），由中心向外的三角形組成。設定 thetaLength 可做扇形，也能用低 segments 做正多邊形。</p>', [
    ['radius', 'Float', '1', '半徑。', [0.1, 2, 0.01]],
    ['segments', 'Integer', '32', '分段數，最小 3。', [3, 64, 1]],
    ['thetaStart', 'Float', '0', '起始角度。', 'angle'],
    ['thetaLength', 'Float', PI2, '掃過角度。', 'angle'],
  ], { cam: [0, 0, 3.5] }),
  geoPage('RingGeometry', '<p>平面圓環（甜甜圈的 2D 版本）。</p>', [
    ['innerRadius', 'Float', '0.5', '內半徑。', [0, 2, 0.01]],
    ['outerRadius', 'Float', '1', '外半徑。', [0.1, 2, 0.01]],
    ['thetaSegments', 'Integer', '32', '圓周分段數，最小 3。', [3, 64, 1]],
    ['phiSegments', 'Integer', '1', '徑向分段數。', [1, 10, 1]],
    ['thetaStart', 'Float', '0', '起始角度。', 'angle'],
    ['thetaLength', 'Float', PI2, '掃過角度。', 'angle'],
  ], { cam: [0, 0, 3.5] }),
  geoPage('CylinderGeometry', '<p>圓柱。上下半徑不同時成為圓台；半徑設為 0 即成為圓錐。</p>', [
    ['radiusTop', 'Float', '1', '頂部半徑。', [0, 2, 0.01]],
    ['radiusBottom', 'Float', '1', '底部半徑。', [0, 2, 0.01]],
    ['height', 'Float', '1', '高度。', [0.1, 3, 0.01]],
    ['radialSegments', 'Integer', '32', '圓周分段數。', [3, 64, 1]],
    ['heightSegments', 'Integer', '1', '高度分段數。', [1, 10, 1]],
    ['openEnded', 'Boolean', 'false', '上下是否開口。', 'bool'],
    ['thetaStart', 'Float', '0', '起始角度。', 'angle'],
    ['thetaLength', 'Float', PI2, '掃過角度。', 'angle'],
  ]),
  geoPage('ConeGeometry', '<p>圓錐（CylinderGeometry 的子類別，頂部半徑為 0）。</p>', [
    ['radius', 'Float', '1', '底部半徑。', [0.1, 2, 0.01]],
    ['height', 'Float', '1', '高度。', [0.1, 3, 0.01]],
    ['radialSegments', 'Integer', '32', '圓周分段數。', [3, 64, 1]],
    ['heightSegments', 'Integer', '1', '高度分段數。', [1, 10, 1]],
    ['openEnded', 'Boolean', 'false', '底部是否開口。', 'bool'],
    ['thetaStart', 'Float', '0', '起始角度。', 'angle'],
    ['thetaLength', 'Float', PI2, '掃過角度。', 'angle'],
  ]),
  geoPage('CapsuleGeometry', '<p>膠囊：中段為圓柱，兩端為半球。常用作角色的碰撞體。</p>', [
    ['radius', 'Float', '1', '半徑。', [0.1, 2, 0.01]],
    ['length', 'Float', '1', '中段圓柱的長度。', [0, 3, 0.01]],
    ['capSegments', 'Integer', '4', '端蓋的分段數。', [1, 16, 1]],
    ['radialSegments', 'Integer', '8', '圓周分段數。', [3, 64, 1]],
  ], { cam: [3, 2.5, 6] }),
  geoPage('TorusGeometry', '<p>圓環（甜甜圈）。</p>', [
    ['radius', 'Float', '1', '圓環中心到管中心的距離。', [0.1, 2, 0.01]],
    ['tube', 'Float', '0.4', '管的半徑。', [0.01, 1, 0.01]],
    ['radialSegments', 'Integer', '12', '管截面分段數。', [2, 32, 1]],
    ['tubularSegments', 'Integer', '48', '沿圓環的分段數。', [3, 128, 1]],
    ['arc', 'Float', PI2, '圓環的弧長角度。', 'angle'],
  ]),
  geoPage('TorusKnotGeometry', '<p>環面紐結。p、q 決定纏繞方式：繞軸旋轉 p 次、繞環內 q 次。</p>', [
    ['radius', 'Float', '1', '半徑。', [0.1, 2, 0.01]],
    ['tube', 'Float', '0.4', '管半徑。', [0.01, 1, 0.01]],
    ['tubularSegments', 'Integer', '64', '沿管分段數。', [3, 300, 1]],
    ['radialSegments', 'Integer', '8', '管截面分段數。', [3, 32, 1]],
    ['p', 'Integer', '2', '繞旋轉軸的次數。', [1, 10, 1]],
    ['q', 'Integer', '3', '繞環內部的次數。', [1, 10, 1]],
  ]),
];

/* 多面體：自訂範例 */
items.push({
  id: 'api-icosahedrongeometry', title: 'IcosahedronGeometry', en: '多面體', api: true, inherits: BG.concat('PolyhedronGeometry'),
  src: 'geometries/IcosahedronGeometry.js',
  desc: '<p>正二十面體。同族的 <code>TetrahedronGeometry</code>（4 面）、<code>OctahedronGeometry</code>（8 面）、<code>DodecahedronGeometry</code>（12 面）參數完全相同，都繼承自 <code>PolyhedronGeometry</code>。</p><p><code>detail</code> 大於 0 時會細分三角形並推到球面上；IcosahedronGeometry 在 detail 較高時是比 SphereGeometry 更均勻的球體。</p>',
  ctor: { sig: 'new IcosahedronGeometry( radius : Float, detail : Integer )', params: [
    ['radius', 'Float', '半徑，預設 1。'], ['detail', 'Integer', '細分程度，預設 0。'],
  ]},
  examples: [{
    title: '多面體家族與 detail',
    code: code`
import * as THREE from 'three';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 2, 9] });

const types = ['TetrahedronGeometry', 'OctahedronGeometry', 'DodecahedronGeometry', 'IcosahedronGeometry'];
const params = { detail: 0 };
const meshes = types.map((type, i) => {
  const m = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(i / 4, 0.6, 0.55), flatShading: true }));
  m.position.x = (i - 1.5) * 2.2;
  scene.add(m);
  return m;
});
function rebuild() {
  meshes.forEach((m, i) => { m.geometry.dispose(); m.geometry = new THREE[types[i]](0.9, params.detail); });
  console.log('detail', params.detail, '→ 三角形數', meshes.map((m, i) => types[i].replace('Geometry', '') + ': ' + m.geometry.attributes.position.count / 3).join('、'));
}
rebuild();
new GUI().add(params, 'detail', 0, 5, 1).onFinishChange(rebuild);
onFrame((t) => meshes.forEach((m) => { m.rotation.set(t * 0.4, t * 0.6, 0); }));
`
  }],
  props: [['.parameters : Object', '建構參數（vertices、indices、radius、detail）。']],
});

/* Lathe */
items.push({
  id: 'api-lathegeometry', title: 'LatheGeometry', api: true, inherits: BG, src: 'geometries/LatheGeometry.js',
  desc: '<p>車床幾何體：把一條 2D 輪廓線（Vector2 陣列，x 為半徑、y 為高度）繞 Y 軸旋轉成形。適合花瓶、酒杯、棋子等旋轉對稱物體。</p>',
  ctor: { sig: 'new LatheGeometry( points : Array, segments : Integer, phiStart : Float, phiLength : Float )', params: [
    ['points', 'Array', 'Vector2 陣列，x 必須大於 0。'],
    ['segments', 'Integer', '圓周分段數，預設 12。'],
    ['phiStart', 'Float', '起始角度，預設 0。'],
    ['phiLength', 'Float', '旋轉角度，預設 2π。'],
  ]},
  examples: [{
    title: '用曲線產生花瓶輪廓',
    desc: '紅線是 2D 輪廓。調整面板中的參數改變花瓶外形。',
    code: code`
import * as THREE from 'three';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const { scene } = createStage({ cameraPosition: [0, 2, 5], target: [0, 1, 0] });

const p = { segments: 32, belly: 0.8, neck: 0.25, lip: 0.45, phiLength: Math.PI * 2 };
const vase = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial({ color: 0x26a69a, side: THREE.DoubleSide, roughness: 0.3 }));
const profile = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xff5252 }));
profile.position.x = 0.01;
scene.add(vase, profile);

function rebuild() {
  const curve = new THREE.SplineCurve([
    new THREE.Vector2(0.01, 0), new THREE.Vector2(0.5, 0.05), new THREE.Vector2(p.belly, 0.7),
    new THREE.Vector2(p.neck, 1.6), new THREE.Vector2(p.lip, 2.1),
  ]);
  const pts = curve.getPoints(40);
  vase.geometry.dispose();
  vase.geometry = new THREE.LatheGeometry(pts, p.segments, 0, p.phiLength);
  profile.geometry.dispose();
  profile.geometry = new THREE.BufferGeometry().setFromPoints(pts);
}
rebuild();
const gui = new GUI();
gui.add(p, 'segments', 3, 64, 1).onChange(rebuild);
gui.add(p, 'belly', 0.2, 1.5, 0.01).name('腹部半徑').onChange(rebuild);
gui.add(p, 'neck', 0.05, 1, 0.01).name('頸部半徑').onChange(rebuild);
gui.add(p, 'lip', 0.05, 1, 0.01).name('瓶口半徑').onChange(rebuild);
gui.add(p, 'phiLength', 0.1, Math.PI * 2, 0.01).onChange(rebuild);
`
  }],
  props: [['.parameters : Object', '建構參數。']],
});

/* Shape / ShapeGeometry / ExtrudeGeometry */
items.push({
  id: 'api-shape', title: 'Shape', api: true, inherits: ['Curve', 'CurvePath', 'Path'], src: 'extras/core/Shape.js',
  desc: '<p>以路徑定義的 2D 形狀（可含孔洞），語法類似 Canvas 2D 的路徑 API。可傳給 <a href="#/api-shapegeometry">ShapeGeometry</a> 產生平面，或傳給 <a href="#/api-extrudegeometry">ExtrudeGeometry</a> 擠出成 3D。</p>',
  ctor: { sig: 'new Shape( points : Array )', params: [['points', 'Array', '（選填）Vector2 陣列，會以直線連接。']] },
  examples: [{
    title: '路徑指令與孔洞', consoleOnly: true,
    code: code`
import * as THREE from 'three';

// 外框：圓角矩形
const shape = new THREE.Shape();
shape.moveTo(0, 0.2);
shape.lineTo(0, 1.8);
shape.quadraticCurveTo(0, 2, 0.2, 2);
shape.lineTo(2.8, 2);
shape.quadraticCurveTo(3, 2, 3, 1.8);
shape.lineTo(3, 0.2);
shape.quadraticCurveTo(3, 0, 2.8, 0);
shape.lineTo(0.2, 0);
shape.quadraticCurveTo(0, 0, 0, 0.2);

// 孔洞：圓形
const hole = new THREE.Path();
hole.absarc(1.5, 1, 0.5, 0, Math.PI * 2, false);
shape.holes.push(hole);

console.log('曲線段數', shape.curves.length, '｜孔洞數', shape.holes.length);
console.log('getPoints(4) 取得', shape.getPoints(4).length, '個點');
const { shape: outer, holes } = shape.extractPoints(8);
console.log('外框點數', outer.length, '｜孔洞點數', holes[0].length);
console.log('面積（ShapeUtils.area）', Math.abs(THREE.ShapeUtils.area(outer)).toFixed(3));
`
  }],
  props: [
    ['.holes : Array', '孔洞（Path 陣列）。'],
    ['.curves : Array', '組成形狀的曲線段。'],
    ['.currentPoint : Vector2', '目前畫筆位置。'],
  ],
  methods: [
    ['.moveTo( x, y ) : this', '移動畫筆（開始新的子路徑）。'],
    ['.lineTo( x, y ) : this', '畫直線。'],
    ['.quadraticCurveTo( cpX, cpY, x, y ) : this', '二次貝茲曲線。'],
    ['.bezierCurveTo( cp1X, cp1Y, cp2X, cp2Y, x, y ) : this', '三次貝茲曲線。'],
    ['.splineThru( points : Array ) : this', '通過多個點的平滑曲線。'],
    ['.arc( x, y, radius, startAngle, endAngle, clockwise ) : this', '相對於目前點的圓弧。'],
    ['.absarc( x, y, radius, startAngle, endAngle, clockwise ) : this', '絕對座標的圓弧。'],
    ['.ellipse / .absellipse( x, y, xRadius, yRadius, startAngle, endAngle, clockwise, rotation ) : this', '橢圓弧。'],
    ['.getPoints( divisions : Integer ) : Array', '取得取樣點。'],
    ['.extractPoints( divisions : Integer ) : Object', '回傳 <code>{ shape, holes }</code> 點陣列。'],
    ['.getPointsHoles( divisions : Integer ) : Array', '取得孔洞的取樣點。'],
  ],
});
items.push({
  id: 'api-shapegeometry', title: 'ShapeGeometry', api: true, inherits: BG, src: 'geometries/ShapeGeometry.js',
  desc: '<p>由一個或多個 <a href="#/api-shape">Shape</a> 三角化產生的平面幾何體。</p>',
  ctor: { sig: 'new ShapeGeometry( shapes : Shape | Array, curveSegments : Integer )', params: [
    ['shapes', 'Shape | Array', '一個或多個形狀。'], ['curveSegments', 'Integer', '每段曲線的取樣數，預設 12。'],
  ]},
  examples: [{
    title: '愛心形狀',
    code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 0, 6], lights: false });

const heart = new THREE.Shape();
heart.moveTo(0, 0.5);
heart.bezierCurveTo(0, 0.8, -0.5, 1.2, -1, 1.2);
heart.bezierCurveTo(-1.8, 1.2, -1.8, 0.3, -1.8, 0.3);
heart.bezierCurveTo(-1.8, -0.3, -1, -0.9, 0, -1.6);
heart.bezierCurveTo(1, -0.9, 1.8, -0.3, 1.8, 0.3);
heart.bezierCurveTo(1.8, 0.3, 1.8, 1.2, 1, 1.2);
heart.bezierCurveTo(0.5, 1.2, 0, 0.8, 0, 0.5);

const geo = new THREE.ShapeGeometry(heart, 24);
const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xe91e63, side: THREE.DoubleSide }));
const edges = new THREE.LineSegments(new THREE.WireframeGeometry(geo), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 }));
mesh.add(edges);
scene.add(mesh);
console.log('三角形數', geo.index.count / 3);
onFrame((t) => { mesh.scale.setScalar(1 + Math.sin(t * 6) * 0.04); });
`
  }],
  props: [['.parameters : Object', '建構參數。']],
});
items.push({
  id: 'api-extrudegeometry', title: 'ExtrudeGeometry', api: true, inherits: BG, src: 'geometries/ExtrudeGeometry.js',
  desc: '<p>把 2D <a href="#/api-shape">Shape</a> 沿 Z 方向（或沿一條 3D 路徑）擠出成立體，可加上斜角（bevel）。常用於 Logo、文字（TextGeometry 即繼承自它）、建築平面圖。</p>',
  ctor: { sig: 'new ExtrudeGeometry( shapes : Shape | Array, options : Object )', params: [
    ['shapes', 'Shape | Array', '形狀。'],
    ['options.curveSegments', 'Integer', '曲線取樣數，預設 12。'],
    ['options.steps', 'Integer', '擠出方向的分段數，預設 1。'],
    ['options.depth', 'Float', '擠出深度，預設 1。'],
    ['options.bevelEnabled', 'Boolean', '是否加斜角，預設 true。'],
    ['options.bevelThickness', 'Float', '斜角深入的厚度，預設 0.2。'],
    ['options.bevelSize', 'Float', '斜角向外延伸的距離，預設 bevelThickness - 0.1。'],
    ['options.bevelOffset', 'Float', '斜角起點偏移，預設 0。'],
    ['options.bevelSegments', 'Integer', '斜角分段數，預設 3。'],
    ['options.extrudePath', 'Curve', '沿此 3D 曲線擠出（取代 depth）。'],
    ['options.UVGenerator', 'Object', '自訂 UV 產生器。'],
  ]},
  examples: [{
    title: '星形擠出與斜角',
    code: code`
import * as THREE from 'three';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 1, 6] });

const star = new THREE.Shape();
for (let i = 0; i < 10; i++) {
  const r = i % 2 ? 0.5 : 1.2, a = (i / 10) * Math.PI * 2 + Math.PI / 2;
  i ? star.lineTo(Math.cos(a) * r, Math.sin(a) * r) : star.moveTo(Math.cos(a) * r, Math.sin(a) * r);
}
const hole = new THREE.Path().absarc(0, 0, 0.25, 0, Math.PI * 2, true);
star.holes.push(hole);

const opts = { depth: 0.4, steps: 1, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.08, bevelOffset: 0, bevelSegments: 3, curveSegments: 12 };
const mesh = new THREE.Mesh(new THREE.BufferGeometry(), [
  new THREE.MeshStandardMaterial({ color: 0xffc107, metalness: 0.5, roughness: 0.3 }), // group 0：正反面
  new THREE.MeshStandardMaterial({ color: 0xff7043, metalness: 0.5, roughness: 0.3 }), // group 1：側面與斜角
]);
scene.add(mesh);
function rebuild() {
  mesh.geometry.dispose();
  mesh.geometry = new THREE.ExtrudeGeometry(star, opts);
  mesh.geometry.center();
}
rebuild();
const gui = new GUI();
gui.add(opts, 'depth', 0.01, 2, 0.01).onChange(rebuild);
gui.add(opts, 'steps', 1, 10, 1).onChange(rebuild);
gui.add(opts, 'bevelEnabled').onChange(rebuild);
gui.add(opts, 'bevelThickness', 0, 0.5, 0.01).onChange(rebuild);
gui.add(opts, 'bevelSize', -0.2, 0.3, 0.01).onChange(rebuild);
gui.add(opts, 'bevelSegments', 1, 10, 1).onChange(rebuild);
onFrame((t) => { mesh.rotation.y = Math.sin(t * 0.7) * 0.9; });
`
  }],
  props: [['.parameters : Object', '建構參數。']],
});

/* Tube */
items.push({
  id: 'api-tubegeometry', title: 'TubeGeometry', api: true, inherits: BG, src: 'geometries/TubeGeometry.js',
  desc: '<p>沿著一條 3D <a href="#/api-curve">曲線</a> 擠出的管子。適合電纜、管線、雲霄飛車軌道。</p>',
  ctor: { sig: 'new TubeGeometry( path : Curve, tubularSegments : Integer, radius : Float, radialSegments : Integer, closed : Boolean )', params: [
    ['path', 'Curve', '3D 路徑（Curve 的子類別）。'],
    ['tubularSegments', 'Integer', '沿路徑的分段數，預設 64。'],
    ['radius', 'Float', '管半徑，預設 1。'],
    ['radialSegments', 'Integer', '截面分段數，預設 8。'],
    ['closed', 'Boolean', '是否首尾相接，預設 false。'],
  ]},
  examples: [{
    title: '螺旋管',
    code: code`
import * as THREE from 'three';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const { scene } = createStage({ cameraPosition: [4, 3, 5] });

// 自訂曲線：繼承 Curve 並實作 getPoint(t)
class HelixCurve extends THREE.Curve {
  constructor(turns = 3) { super(); this.turns = turns; }
  getPoint(t, target = new THREE.Vector3()) {
    const a = t * Math.PI * 2 * this.turns;
    return target.set(Math.cos(a) * 1.2, t * 3 - 1.5, Math.sin(a) * 1.2);
  }
}
const p = { turns: 3, tubularSegments: 200, radius: 0.15, radialSegments: 12, closed: false };
const mesh = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial({ color: 0xab47bc, roughness: 0.3 }));
scene.add(mesh);
function rebuild() {
  mesh.geometry.dispose();
  mesh.geometry = new THREE.TubeGeometry(new HelixCurve(p.turns), p.tubularSegments, p.radius, p.radialSegments, p.closed);
}
rebuild();
const gui = new GUI();
gui.add(p, 'turns', 0.5, 8, 0.1).onChange(rebuild);
gui.add(p, 'tubularSegments', 4, 400, 1).onChange(rebuild);
gui.add(p, 'radius', 0.01, 0.5, 0.01).onChange(rebuild);
gui.add(p, 'radialSegments', 3, 32, 1).onChange(rebuild);
gui.add(p, 'closed').onChange(rebuild);
console.log('tangents / normals / binormals 各', new THREE.TubeGeometry(new HelixCurve(), 10).tangents.length, '個（Frenet 標架）');
`
  }],
  props: [
    ['.parameters : Object', '建構參數。'],
    ['.tangents : Array', '路徑上每一點的切線（Vector3）。'],
    ['.normals : Array', '法線。'],
    ['.binormals : Array', '副法線。'],
  ],
});

/* Edges / Wireframe */
items.push({
  id: 'api-edgesgeometry', title: 'EdgesGeometry', api: true, inherits: BG, src: 'geometries/EdgesGeometry.js',
  desc: '<p>從既有幾何體中擷取「稜線」：只保留相鄰面法線夾角大於 thresholdAngle 的邊。搭配 <a href="#/api-linesegments">LineSegments</a> 顯示，常用於 CAD 風格描邊。</p>',
  ctor: { sig: 'new EdgesGeometry( geometry : BufferGeometry, thresholdAngle : Integer )', params: [
    ['geometry', 'BufferGeometry', '來源幾何體。'], ['thresholdAngle', 'Integer', '角度門檻（度），預設 1。'],
  ]},
  examples: [{
    title: '調整 thresholdAngle',
    code: code`
import * as THREE from 'three';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 1, 4] });

const source = new THREE.TorusKnotGeometry(0.8, 0.3, 64, 8);
const lines = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0x00e5ff }));
scene.add(lines);
const p = { thresholdAngle: 20 };
function rebuild() {
  lines.geometry.dispose();
  lines.geometry = new THREE.EdgesGeometry(source, p.thresholdAngle);
  console.log('thresholdAngle', p.thresholdAngle, '→ 線段數', lines.geometry.attributes.position.count / 2);
}
rebuild();
new GUI().add(p, 'thresholdAngle', 1, 90, 1).onFinishChange(rebuild);
onFrame((t) => { lines.rotation.y = t * 0.4; });
`
  }],
  props: [['.parameters : Object', '建構參數。']],
});
items.push({
  id: 'api-wireframegeometry', title: 'WireframeGeometry', api: true, inherits: BG, src: 'geometries/WireframeGeometry.js',
  desc: '<p>把幾何體的每個三角形邊轉成線段資料，搭配 <a href="#/api-linesegments">LineSegments</a> 顯示線框。與材質的 <code>wireframe: true</code> 不同，它是真正的線條幾何，可以和實體網格同時顯示。範例請見 <a href="#/api-linesegments">LineSegments</a> 或任一幾何體頁面。</p>',
  ctor: { sig: 'new WireframeGeometry( geometry : BufferGeometry )' },
  props: [['.parameters : Object', '建構參數。']],
});

window.DOCS.push({ group: '幾何體 Geometries', section: 'api', items: items });
})();
