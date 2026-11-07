/* API 參考：輔助物件、附加模組（控制器、後期處理），以及 API 索引頁 */
(function () {
var code = String.raw;
var O3D = ['EventDispatcher', 'Object3D'];

window.DOCS.push(
{ group: '輔助物件 Helpers', section: 'api', items: [
{
  id: 'api-axeshelper', title: 'AxesHelper', api: true, inherits: O3D.concat('Line', 'LineSegments'), src: 'helpers/AxesHelper.js',
  desc: '<p>以三條線顯示座標軸：<span style="color:#e5534b">X 紅</span>、<span style="color:#3aa55d">Y 綠</span>、<span style="color:#4a8cff">Z 藍</span>。加到物件底下可以看出它的區域座標方向。</p>',
  ctor: { sig: 'new AxesHelper( size : Number )', params: [['size', 'Number', '軸線長度，預設 1。']] },
  examples: [{
    title: '區域座標軸與 setColors',
    code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ grid: true, cameraPosition: [3, 3, 4] });

scene.add(new THREE.AxesHelper(3));   // 世界座標軸
const box = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), new THREE.MeshStandardMaterial({ color: 0x9e9e9e, transparent: true, opacity: 0.6 }));
const local = new THREE.AxesHelper(1);
local.setColors(0xff00ff, 0xffff00, 0x00ffff);   // 自訂三軸顏色
box.add(local);                                  // 區域座標軸跟著物件旋轉
box.position.set(1.5, 0.8, 0);
scene.add(box);
onFrame((t) => box.rotation.set(t * 0.5, t, t * 0.3));
`
  }],
  methods: [
    ['.setColors( xAxisColor : Color, yAxisColor : Color, zAxisColor : Color ) : this', '設定三軸顏色。'],
    ['.dispose() : undefined', '釋放資源。'],
  ],
},
{
  id: 'api-gridhelper', title: 'GridHelper', api: true, inherits: O3D.concat('Line', 'LineSegments'), src: 'helpers/GridHelper.js',
  desc: '<p>XZ 平面上的格線。另有 <code>PolarGridHelper</code>（極座標格線）。</p>',
  ctor: { sig: 'new GridHelper( size : Number, divisions : Number, colorCenterLine : Color, colorGrid : Color )', params: [
    ['size', 'Number', '總尺寸，預設 10。'], ['divisions', 'Number', '分格數，預設 10。'],
    ['colorCenterLine', 'Color', '中心線顏色，預設 0x444444。'], ['colorGrid', 'Color', '格線顏色，預設 0x888888。'],
  ]},
  examples: [{
    title: 'GridHelper 與 PolarGridHelper',
    code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene } = createStage({ cameraPosition: [0, 8, 10] });

const grid = new THREE.GridHelper(10, 20, 0xff5252, 0x555555);
grid.position.x = -5.5;
scene.add(grid);

const polar = new THREE.PolarGridHelper(5, 16, 8, 64, 0x40c4ff, 0x40c4ff);
polar.position.x = 5.5;
scene.add(polar);

// 垂直的格線（旋轉到 XY 平面）
const wall = new THREE.GridHelper(4, 8, 0xffffff, 0x888888);
wall.rotation.x = Math.PI / 2;
wall.position.set(0, 2, -5);
scene.add(wall);
`
  }],
  methods: [['.dispose() : undefined', '釋放資源。']],
},
{
  id: 'api-arrowhelper', title: 'ArrowHelper', api: true, inherits: O3D, src: 'helpers/ArrowHelper.js',
  desc: '<p>3D 箭頭，用於視覺化方向或向量（速度、法線、力）。</p>',
  ctor: { sig: 'new ArrowHelper( dir : Vector3, origin : Vector3, length : Number, hex : Number, headLength : Number, headWidth : Number )', params: [
    ['dir', 'Vector3', '方向（需正規化），預設 (0, 0, 1)。'], ['origin', 'Vector3', '起點，預設 (0, 0, 0)。'],
    ['length', 'Number', '長度，預設 1。'], ['hex', 'Number', '顏色，預設 0xffff00。'],
    ['headLength', 'Number', '箭頭長度，預設 length × 0.2。'], ['headWidth', 'Number', '箭頭寬度，預設 headLength × 0.2。'],
  ]},
  examples: [{
    title: '向量場',
    code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 9, 6], lights: false });

const arrows = [];
for (let x = -4; x <= 4; x++) for (let z = -4; z <= 4; z++) {
  const a = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(x, 0, z), 0.8, 0xffffff, 0.25, 0.15);
  scene.add(a);
  arrows.push(a);
}
const dir = new THREE.Vector3(), color = new THREE.Color();
onFrame((t) => arrows.forEach((a) => {
  const { x, z } = a.position;
  dir.set(Math.sin(z * 0.6 + t), 0, Math.cos(x * 0.6 + t)).normalize();
  a.setDirection(dir);
  const strength = 0.5 + 0.5 * Math.sin(x * 0.5 + z * 0.5 + t * 2);
  a.setLength(0.4 + strength * 0.6, 0.25, 0.15);
  a.setColor(color.setHSL(0.6 - strength * 0.6, 1, 0.55));
}));
`
  }],
  methods: [
    ['.setDirection( dir : Vector3 ) : undefined', '設定方向（需正規化）。'],
    ['.setLength( length, headLength, headWidth ) : undefined', '設定長度與箭頭大小。'],
    ['.setColor( color ) : undefined', '設定顏色。'],
    ['.dispose() : undefined', '釋放資源。'],
  ],
},
{
  id: 'api-boxhelper', title: 'BoxHelper', api: true, inherits: O3D.concat('Line', 'LineSegments'), src: 'helpers/BoxHelper.js',
  desc: '<p>顯示物件在世界座標中的軸對齊包圍盒（線框）。物件移動或旋轉後需呼叫 <code>update()</code>。若要顯示一個 Box3，使用 <code>Box3Helper</code>。</p>',
  ctor: { sig: 'new BoxHelper( object : Object3D, color : Color )' },
  examples: [{
    title: '旋轉時包圍盒的變化',
    code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [3, 2, 5] });

const mesh = new THREE.Mesh(new THREE.BoxGeometry(2, 0.4, 0.8), new THREE.MeshNormalMaterial());
scene.add(mesh);
const helper = new THREE.BoxHelper(mesh, 0xffff00);
scene.add(helper);
onFrame((t) => {
  mesh.rotation.set(t * 0.4, t * 0.7, 0);
  helper.update();   // AABB 隨旋轉改變大小
});
`
  }],
  methods: [
    ['.update() : undefined', '依物件目前狀態更新。'],
    ['.setFromObject( object ) : this', '改為追蹤另一個物件。'],
    ['.dispose() : undefined', '釋放資源。'],
  ],
},
{
  id: 'api-camerahelper', title: 'CameraHelper', api: true, inherits: O3D.concat('Line', 'LineSegments'), src: 'helpers/CameraHelper.js',
  desc: '<p>以線條顯示相機的視錐體，也常用於查看光源的陰影相機（<code>new CameraHelper(light.shadow.camera)</code>）。範例請見 <a href="#/api-perspectivecamera">PerspectiveCamera</a> 與 <a href="#/api-directionallight">DirectionalLight</a>。</p>',
  ctor: { sig: 'new CameraHelper( camera : Camera )' },
  props: [['.camera : Camera', '被顯示的相機。']],
  methods: [
    ['.update() : undefined', '相機參數改變後更新。'],
    ['.setColors( frustum, cone, up, target, cross ) : this', '設定各部分顏色。'],
    ['.dispose() : undefined', '釋放資源。'],
  ],
},
]},

{ group: '附加模組 Addons', section: 'api', items: [
{
  id: 'api-orbitcontrols', title: 'OrbitControls', api: true, inherits: ['EventDispatcher', 'Controls'], src: 'examples/jsm/controls/OrbitControls.js',
  module: "import { OrbitControls } from 'three/addons/controls/OrbitControls.js';",
  desc: '<p>讓相機繞著目標點（target）環繞、縮放、平移。會保持相機的「上方」方向，因此無法翻轉過頭頂。</p><p>開啟 <code>enableDamping</code> 或 <code>autoRotate</code> 時，必須在渲染迴圈中呼叫 <code>controls.update()</code>。</p>',
  ctor: { sig: 'new OrbitControls( object : Camera, domElement : HTMLElement )', params: [
    ['object', 'Camera', '要控制的相機。'], ['domElement', 'HTMLElement', '監聽事件的元素，通常為 renderer.domElement。'],
  ]},
  examples: [{
    title: '限制範圍與事件',
    desc: '限制縮放距離、俯仰角與水平角度，並監聽 start / change / end 事件。按鍵盤方向鍵也可平移（需先點擊畫面）。',
    code: code`
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const { scene, camera, renderer, onFrame } = createStage({ controls: false, grid: true, cameraPosition: [4, 3, 6] });

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.5, 0);
controls.enableDamping = true;
controls.minDistance = 2;
controls.maxDistance = 15;
controls.minPolarAngle = 0.2;
controls.maxPolarAngle = Math.PI / 2 - 0.05;
controls.minAzimuthAngle = -Math.PI / 2;
controls.maxAzimuthAngle = Math.PI / 2;
controls.listenToKeyEvents(window);
controls.update();
controls.saveState();

scene.add(new THREE.Mesh(new THREE.TorusKnotGeometry(0.5, 0.18, 100, 16), new THREE.MeshStandardMaterial({ color: 0x26c6da })).translateY(0.8));

controls.addEventListener('start', () => console.log('start'));
controls.addEventListener('end', () => console.log('end｜距離', controls.getDistance().toFixed(2),
  '｜polar', THREE.MathUtils.radToDeg(controls.getPolarAngle()).toFixed(1) + '°',
  '｜azimuth', THREE.MathUtils.radToDeg(controls.getAzimuthalAngle()).toFixed(1) + '°'));

const gui = new GUI();
gui.add(controls, 'enableDamping');
gui.add(controls, 'dampingFactor', 0.01, 0.3, 0.01);
gui.add(controls, 'autoRotate');
gui.add(controls, 'autoRotateSpeed', -10, 10, 0.1);
gui.add(controls, 'rotateSpeed', 0.1, 3, 0.1);
gui.add(controls, 'zoomSpeed', 0.1, 3, 0.1);
gui.add(controls, 'panSpeed', 0.1, 3, 0.1);
gui.add(controls, 'screenSpacePanning');
gui.add(controls, 'zoomToCursor');
gui.add(controls, 'enabled');
gui.add({ reset: () => controls.reset() }, 'reset').name('reset()');
onFrame(() => controls.update());
`
  }],
  props: [
    ['.object : Camera', '被控制的相機。'],
    ['.domElement : HTMLElement', '監聽事件的元素。'],
    ['.enabled : Boolean', '是否啟用。'],
    ['.target : Vector3', '環繞中心。修改後需呼叫 update()。'],
    ['.cursor : Vector3', 'zoomToCursor 時使用的游標位置。'],
    ['.enableDamping : Boolean / .dampingFactor : Float', '慣性阻尼與其係數（預設 0.05）。'],
    ['.enableZoom / .enableRotate / .enablePan : Boolean', '個別啟用縮放 / 旋轉 / 平移。'],
    ['.zoomSpeed / .rotateSpeed / .panSpeed / .keyPanSpeed : Float', '各操作速度。'],
    ['.zoomToCursor : Boolean', '朝游標位置縮放。'],
    ['.screenSpacePanning : Boolean', '平移是否在螢幕平面上（預設 true），false 時在地面平面上平移。'],
    ['.minDistance / .maxDistance : Float', '透視相機的距離限制。'],
    ['.minZoom / .maxZoom : Float', '正交相機的縮放限制。'],
    ['.minTargetRadius / .maxTargetRadius : Float', 'target 離 cursor 的距離限制。'],
    ['.minPolarAngle / .maxPolarAngle : Float', '垂直角度限制（0 為正上方，π 為正下方）。'],
    ['.minAzimuthAngle / .maxAzimuthAngle : Float', '水平角度限制（弧度，預設無限制）。'],
    ['.autoRotate : Boolean / .autoRotateSpeed : Float', '自動旋轉與速度（預設 2.0，約 30 秒一圈）。'],
    ['.keys : Object', '方向鍵對應：<code>{ LEFT, UP, RIGHT, BOTTOM }</code>。'],
    ['.mouseButtons : Object', '滑鼠按鍵對應：<code>{ LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN }</code>。'],
    ['.touches : Object', '觸控對應：<code>{ ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN }</code>。'],
  ],
  methods: [
    ['.update( deltaTime : Number ) : Boolean', '更新相機。有阻尼或自動旋轉時每幀必須呼叫。'],
    ['.listenToKeyEvents( domElement ) : undefined', '啟用鍵盤方向鍵平移。'],
    ['.stopListenToKeyEvents() : undefined', '停用鍵盤。'],
    ['.saveState() : undefined', '儲存目前狀態，供 reset() 使用。'],
    ['.reset() : undefined', '回到上次 saveState 的狀態。'],
    ['.getDistance() : Float', '相機到 target 的距離。'],
    ['.getPolarAngle() / .getAzimuthalAngle() : Float', '目前的垂直 / 水平角度。'],
    ['.dispose() : undefined', '移除所有事件監聽器。'],
    ['.addEventListener( type, listener )', '事件：<code>change</code>（相機改變）、<code>start</code>（開始互動）、<code>end</code>（結束互動）。只在有變化時渲染的場景可監聽 change。'],
  ],
},
{
  id: 'api-transformcontrols', title: 'TransformControls', api: true, inherits: ['EventDispatcher', 'Controls'], src: 'examples/jsm/controls/TransformControls.js',
  module: "import { TransformControls } from 'three/addons/controls/TransformControls.js';",
  desc: '<p>類似 3D 編輯器的操作把手，可以拖曳移動、旋轉、縮放場景中的物件。r169 起把手本身需透過 <code>getHelper()</code> 取得後加入場景。與 OrbitControls 併用時，拖曳期間應暫停 OrbitControls。</p>',
  ctor: { sig: 'new TransformControls( camera : Camera, domElement : HTMLElement )' },
  examples: [{
    title: '模式、座標空間與吸附',
    desc: '面板中切換 translate / rotate / scale、world / local 座標空間與吸附間距。',
    code: code`
import * as THREE from 'three';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const { scene, camera, renderer, controls } = createStage({ grid: true, cameraPosition: [4, 4, 6] });

const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0xff7043 }));
mesh.position.y = 0.5;
mesh.rotation.y = 0.5;
scene.add(mesh);

const tc = new TransformControls(camera, renderer.domElement);
tc.attach(mesh);
scene.add(tc.getHelper());
tc.addEventListener('dragging-changed', (e) => (controls.enabled = !e.value));
tc.addEventListener('mouseUp', () => console.log('position', mesh.position, '｜rotation', mesh.rotation, '｜scale', mesh.scale));

const p = { snap: false };
const gui = new GUI();
gui.add(tc, 'mode', ['translate', 'rotate', 'scale']);
gui.add(tc, 'space', ['world', 'local']);
gui.add(tc, 'size', 0.3, 2, 0.01);
gui.add(tc, 'showX'); gui.add(tc, 'showY'); gui.add(tc, 'showZ');
gui.add(p, 'snap').name('吸附（0.5 / 15° / 0.25）').onChange((v) => {
  tc.setTranslationSnap(v ? 0.5 : null);
  tc.setRotationSnap(v ? THREE.MathUtils.degToRad(15) : null);
  tc.setScaleSnap(v ? 0.25 : null);
});
`
  }],
  props: [
    ['.object : Object3D', '目前附加的物件。'],
    ['.mode : String', '"translate"、"rotate"、"scale"。'],
    ['.space : String', '"world" 或 "local"。'],
    ['.size : Number', '把手大小。'],
    ['.showX / .showY / .showZ : Boolean', '顯示哪些軸。'],
    ['.dragging : Boolean', '是否正在拖曳（唯讀）。'],
    ['.translationSnap / .rotationSnap / .scaleSnap : Number', '吸附間距。'],
  ],
  methods: [
    ['.attach( object ) : this', '附加到物件。'],
    ['.detach() : this', '解除附加。'],
    ['.getHelper() : Object3D', '取得把手的視覺物件（需加入場景）。'],
    ['.setMode( mode ) / .setSpace( space ) / .setSize( size )', '設定模式 / 座標空間 / 大小。'],
    ['.setTranslationSnap( n ) / .setRotationSnap( rad ) / .setScaleSnap( n )', '設定吸附，null 為關閉。'],
    ['.reset() : undefined', '取消目前拖曳並還原。'],
    ['.dispose() : undefined', '移除事件監聽。'],
    ['.addEventListener( type, listener )', '事件：<code>change</code>、<code>dragging-changed</code>、<code>objectChange</code>、<code>mouseDown</code>、<code>mouseUp</code>。'],
  ],
},
{
  id: 'api-effectcomposer', title: 'EffectComposer', api: true, src: 'examples/jsm/postprocessing/EffectComposer.js',
  module: "import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';",
  desc: '<p>後期處理管線：依序執行多個 Pass，每個 Pass 讀取上一步的結果並輸出到下一步。第一個通常是 <code>RenderPass</code>（正常繪製場景），最後一個通常是 <code>OutputPass</code>（色調映射與色彩空間轉換）。使用時以 <code>composer.render()</code> 取代 <code>renderer.render()</code>。</p><table><tr><th>常用 Pass</th><th>引入路徑（three/addons/postprocessing/…）</th></tr><tr><td>RenderPass</td><td>RenderPass.js</td></tr><tr><td>UnrealBloomPass</td><td>UnrealBloomPass.js</td></tr><tr><td>ShaderPass</td><td>ShaderPass.js（搭配 three/addons/shaders/ 中的著色器）</td></tr><tr><td>OutlinePass</td><td>OutlinePass.js</td></tr><tr><td>BokehPass</td><td>BokehPass.js</td></tr><tr><td>FilmPass / GlitchPass / AfterimagePass / RenderPixelatedPass</td><td>同名 .js</td></tr><tr><td>SMAAPass / FXAAShader</td><td>反鋸齒</td></tr><tr><td>OutputPass</td><td>OutputPass.js</td></tr></table>',
  ctor: { sig: 'new EffectComposer( renderer : WebGLRenderer, renderTarget : WebGLRenderTarget )' },
  examples: [{
    title: '多個 Pass 串接',
    desc: '切換各 Pass 的 enabled，觀察疊加效果：像素化、Bloom、自訂 ShaderPass（RGB 色差）、殘影。',
    code: code`
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { RenderPixelatedPass } from 'three/addons/postprocessing/RenderPixelatedPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { RGBShiftShader } from 'three/addons/shaders/RGBShiftShader.js';
import { AfterimagePass } from 'three/addons/postprocessing/AfterimagePass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const stage = createStage({ cameraPosition: [0, 1, 6], background: 0x0a0a12 });
const { scene, camera, renderer } = stage;

const meshes = [];
for (let i = 0; i < 6; i++) {
  const c = new THREE.Color().setHSL(i / 6, 1, 0.5);
  const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.4, 0), new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.8, flatShading: true }));
  scene.add(m);
  meshes.push(m);
}

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
const pixelPass = new RenderPixelatedPass(5, scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 1.0, 0.4, 0.2);
const rgbPass = new ShaderPass(RGBShiftShader);
rgbPass.uniforms.amount.value = 0.004;
const afterPass = new AfterimagePass(0.9);
pixelPass.enabled = false; rgbPass.enabled = false; afterPass.enabled = false;
[renderPass, pixelPass, bloomPass, rgbPass, afterPass, new OutputPass()].forEach((p) => composer.addPass(p));
console.log('passes：', composer.passes.map((p) => p.constructor.name).join(' → '));

const gui = new GUI();
gui.add(pixelPass, 'enabled').name('RenderPixelatedPass');
gui.add(bloomPass, 'enabled').name('UnrealBloomPass');
gui.add(bloomPass, 'strength', 0, 3, 0.01);
gui.add(rgbPass, 'enabled').name('ShaderPass(RGBShift)');
gui.add(rgbPass.uniforms.amount, 'value', 0, 0.02, 0.0005).name('RGBShift amount');
gui.add(afterPass, 'enabled').name('AfterimagePass');

stage.render = () => composer.render();
stage.onResize((w, h) => composer.setSize(w, h));
stage.onFrame((t) => meshes.forEach((m, i) => {
  const a = t * 0.8 + (i / 6) * Math.PI * 2;
  m.position.set(Math.cos(a) * 2, Math.sin(a * 2) * 0.6, Math.sin(a) * 2);
  m.rotation.set(t, t * 1.3, 0);
}));
`
  }],
  props: [
    ['.passes : Array', 'Pass 陣列。'],
    ['.renderer : WebGLRenderer', '渲染器。'],
    ['.readBuffer / .writeBuffer : WebGLRenderTarget', '內部的乒乓緩衝區。'],
    ['.renderToScreen : Boolean', '最後一個 Pass 是否輸出到畫面，預設 true。'],
  ],
  methods: [
    ['.addPass( pass ) : undefined', '加入 Pass。'],
    ['.insertPass( pass, index ) : undefined', '插入 Pass。'],
    ['.removePass( pass ) : undefined', '移除 Pass。'],
    ['.render( deltaTime ) : undefined', '執行所有啟用的 Pass。'],
    ['.setSize( width, height ) : undefined', '調整尺寸（畫布 resize 時呼叫）。'],
    ['.setPixelRatio( pixelRatio ) : undefined', '設定像素比。'],
    ['.reset( renderTarget ) : undefined', '重設內部緩衝區。'],
    ['.dispose() : undefined', '釋放資源。'],
  ],
},
]}
);

})();
