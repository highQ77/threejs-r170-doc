/* API 參考（補充）：物件、相機、音訊、輔助物件 */
(function () {
var code = String.raw;
var O3D = ['EventDispatcher', 'Object3D'];
function add(name, items) {
  var g = window.DOCS.find(function (x) { return x.group === name; });
  if (!g) { g = { group: name, section: 'api', items: [] }; window.DOCS.push(g); }
  g.items.push.apply(g.items, items);
}

/* ================= 物件 ================= */
add('物件 Objects', [
{
  id: 'api-batchedmesh', title: 'BatchedMesh', api: true, inherits: O3D.concat('Mesh'), src: 'objects/BatchedMesh.js',
  desc: '<p>把<b>多種不同幾何體</b>（但共用同一個材質）的大量物件合併成一次 draw call。與 InstancedMesh 的差異：InstancedMesh 只能重複同一個幾何體；BatchedMesh 可以混合多個幾何體，且每個實例可獨立設定矩陣、顏色、可見性，並支援逐物件視錐剔除與排序。</p>',
  ctor: { sig: 'new BatchedMesh( maxInstanceCount : Integer, maxVertexCount : Integer, maxIndexCount : Integer, material : Material )', params: [
    ['maxInstanceCount', 'Integer', '最大實例數。'], ['maxVertexCount', 'Integer', '所有幾何體合計的最大頂點數。'], ['maxIndexCount', 'Integer', '所有幾何體合計的最大索引數。'], ['material', 'Material', '共用材質。'],
  ]},
  examples: [{ title: '三種幾何體、600 個實例、一次 draw call', code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, renderer, onFrame } = createStage({ cameraPosition: [0, 6, 14] });

const geos = [new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.SphereGeometry(0.3, 16, 8), new THREE.ConeGeometry(0.3, 0.6, 12)];
const maxV = geos.reduce((n, g) => n + g.attributes.position.count, 0);
const maxI = geos.reduce((n, g) => n + g.index.count, 0);
const batched = new THREE.BatchedMesh(600, maxV, maxI, new THREE.MeshStandardMaterial());
const geoIds = geos.map((g) => batched.addGeometry(g));   // 每個幾何體只存一份

const m = new THREE.Matrix4(), q = new THREE.Quaternion(), color = new THREE.Color();
const items = [];
for (let i = 0; i < 600; i++) {
  const id = batched.addInstance(geoIds[i % 3]);
  const pos = new THREE.Vector3().randomDirection().multiplyScalar(3 + Math.random() * 4);
  items.push({ id, pos, axis: new THREE.Vector3().randomDirection(), speed: Math.random() * 2 });
  batched.setColorAt(id, color.setHSL(i / 600, 0.7, 0.55));
}
scene.add(batched);

const one = new THREE.Vector3(1, 1, 1);
let logged = false;
onFrame((t) => {
  for (const it of items) {
    q.setFromAxisAngle(it.axis, t * it.speed);
    batched.setMatrixAt(it.id, m.compose(it.pos, q, one));
  }
  batched.rotation.y = t * 0.1;
  if (!logged && t > 0.5) { logged = true; console.log('實例數', batched.instanceCount, '｜draw calls', renderer.info.render.calls); }
});
` }],
  props: [
    ['.instanceCount : Integer', '目前的實例數（唯讀）。'], ['.maxInstanceCount : Integer', '最大實例數（唯讀）。'],
    ['.perObjectFrustumCulled : Boolean', '是否逐實例做視錐剔除，預設 true。'], ['.sortObjects : Boolean', '是否依距離排序實例，預設 true（透明材質需要）。'],
    ['.customSort : Function', '自訂排序函式，用 setCustomSort 設定。'], ['.boundingBox / .boundingSphere', '所有實例的包圍體。'],
  ],
  methods: [
    ['.addGeometry( geometry, reservedVertexCount, reservedIndexCount ) : Integer', '加入幾何體，回傳 geometryId。可預留空間以便之後用 setGeometryAt 替換更大的幾何體。'],
    ['.addInstance( geometryId ) : Integer', '新增一個使用該幾何體的實例，回傳 instanceId。'],
    ['.setMatrixAt( instanceId, matrix ) : this', '設定實例矩陣。'], ['.getMatrixAt( instanceId, matrix ) : Matrix4', '取得實例矩陣。'],
    ['.setColorAt( instanceId, color ) : this', '設定實例顏色。'], ['.getColorAt( instanceId, color ) : Color', '取得實例顏色。'],
    ['.setVisibleAt( instanceId, visible ) : this', '設定可見性。'], ['.getVisibleAt( instanceId ) : Boolean', '取得可見性。'],
    ['.setGeometryIdAt( instanceId, geometryId ) : this', '更換實例使用的幾何體。'], ['.getGeometryIdAt( instanceId ) : Integer', '取得實例的幾何體。'],
    ['.deleteInstance( instanceId ) : this', '刪除實例。'], ['.deleteGeometry( geometryId ) : this', '刪除幾何體（及其所有實例）。'],
    ['.setGeometryAt( geometryId, geometry ) : Integer', '替換幾何體資料。'], ['.getGeometryRangeAt( geometryId, target ) : Object', '取得幾何體在緩衝區中的範圍。'],
    ['.optimize() : this', '重新整理緩衝區，回收刪除幾何體留下的空間。'],
    ['.setInstanceCount( n ) / .setGeometrySize( vertexCount, indexCount ) : undefined', '調整容量。'],
    ['.computeBoundingBox() / .computeBoundingSphere()', '重算包圍體。'], ['.setCustomSort( func ) : this', '設定排序函式。'], ['.dispose() : this', '釋放資源。'],
  ],
},
{
  id: 'api-bone', title: 'Bone', api: true, inherits: O3D, src: 'objects/Bone.js',
  desc: '<p>骨架中的一根骨骼，本質上就是一個 Object3D：透過父子關係組成骨骼鏈，修改 position / rotation 即可帶動 <a href="#/api-skinnedmesh">SkinnedMesh</a> 的頂點。完整範例見 SkinnedMesh。</p>',
  ctor: { sig: 'new Bone()' },
  examples: [{ title: '骨骼鏈與世界座標', consoleOnly: true, code: code`
import * as THREE from 'three';
const root = new THREE.Bone(); root.name = 'root';
const mid = new THREE.Bone(); mid.name = 'mid'; mid.position.y = 1;
const tip = new THREE.Bone(); tip.name = 'tip'; tip.position.y = 1;
root.add(mid); mid.add(tip);
root.rotation.z = Math.PI / 4;
mid.rotation.z = Math.PI / 4;
root.updateMatrixWorld();
console.log('tip 世界座標 =', tip.getWorldPosition(new THREE.Vector3()));
console.log('isBone =', tip.isBone, '｜type =', tip.type);
` }],
  props: [['.isBone : Boolean', '型別檢查旗標。'], ['.type : String', '"Bone"。']],
},
{
  id: 'api-skeleton', title: 'Skeleton', api: true, src: 'objects/Skeleton.js',
  desc: '<p>一組骨骼（<a href="#/api-bone">Bone</a> 陣列）與其反綁定矩陣，供 <a href="#/api-skinnedmesh">SkinnedMesh</a> 使用。骨骼矩陣會被上傳到 GPU（或骨骼紋理）以進行頂點蒙皮。</p>',
  ctor: { sig: 'new Skeleton( bones : Array, boneInverses : Array )', params: [['bones', 'Array', 'Bone 陣列。'], ['boneInverses', 'Array', '（選填）每根骨骼的反綁定矩陣；省略時依目前姿勢自動計算。']] },
  examples: [{ title: 'pose 與 getBoneByName', consoleOnly: true, code: code`
import * as THREE from 'three';
const bones = ['hip', 'spine', 'head'].map((n, i) => { const b = new THREE.Bone(); b.name = n; b.position.y = i ? 1 : 0; return b; });
bones[0].add(bones[1]); bones[1].add(bones[2]);
const skeleton = new THREE.Skeleton(bones);
console.log('骨骼數', skeleton.bones.length, '｜boneInverses', skeleton.boneInverses.length);

bones[1].rotation.x = 1;
console.log('spine 旋轉後 rotation.x =', bones[1].rotation.x.toFixed(2));
skeleton.pose();   // 回到綁定姿勢
console.log('pose() 後 rotation.x =', bones[1].rotation.x.toFixed(2));
console.log('getBoneByName("head") =', skeleton.getBoneByName('head'));
` }],
  props: [
    ['.bones : Array', '骨骼陣列。'], ['.boneInverses : Array', '反綁定矩陣陣列。'], ['.boneMatrices : Float32Array', '傳給 GPU 的骨骼矩陣資料。'],
    ['.boneTexture : DataTexture', '骨骼多時使用的骨骼紋理。'],
  ],
  methods: [
    ['.pose() : undefined', '把骨骼恢復到綁定姿勢。'], ['.calculateInverses() : undefined', '依目前姿勢重新計算 boneInverses。'],
    ['.computeBoneTexture() : this', '建立骨骼紋理。'], ['.update() : undefined', '更新 boneMatrices（渲染器自動呼叫）。'],
    ['.getBoneByName( name ) : Bone', '依名稱找骨骼。'], ['.clone() : Skeleton', '複製。'], ['.dispose() : undefined', '釋放骨骼紋理。'],
  ],
},
{
  id: 'api-lineloop', title: 'LineLoop', api: true, inherits: O3D.concat('Line'), src: 'objects/LineLoop.js',
  desc: '<p>與 <a href="#/api-line">Line</a> 相同，但最後一個頂點會自動連回第一個頂點，形成封閉的線。</p>',
  ctor: { sig: 'new LineLoop( geometry : BufferGeometry, material : Material )' },
  examples: [{ title: 'Line 與 LineLoop 比較', code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene } = createStage({ cameraPosition: [0, 0, 5], lights: false });
const pts = Array.from({ length: 5 }, (_, i) => { const a = (i / 5) * Math.PI * 2 + Math.PI / 2; return new THREE.Vector3(Math.cos(a), Math.sin(a), 0); });
const geo = new THREE.BufferGeometry().setFromPoints(pts);
const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xff7043 }));
line.position.x = -1.3;
const loop = new THREE.LineLoop(geo, new THREE.LineBasicMaterial({ color: 0x4fc3f7 }));
loop.position.x = 1.3;
scene.add(line, loop);
console.log('左：Line（開放）｜右：LineLoop（封閉），使用相同的 5 個頂點');
` }],
},
]);

/* ================= 相機 ================= */
add('相機 Cameras', [
{
  id: 'api-cubecamera', title: 'CubeCamera', api: true, inherits: O3D, src: 'cameras/CubeCamera.js',
  desc: '<p>由 6 台 90° 透視相機組成，一次把場景渲染到 <a href="#/api-webglcuberendertarget">WebGLCubeRenderTarget</a> 的 6 個面。常用於即時反射（鏡面球、車漆）。</p>',
  ctor: { sig: 'new CubeCamera( near : Number, far : Number, renderTarget : WebGLCubeRenderTarget )' },
  examples: [{ title: '即時反射的鏡面球', desc: '中央的鉻球反射周圍移動的物體。渲染立方體貼圖前先把球隱藏，避免反射到自己。', code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, renderer, onFrame } = createStage({ cameraPosition: [0, 2, 7], background: 0x223344, grid: 20 });

const cubeRT = new THREE.WebGLCubeRenderTarget(256, { generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter });
const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRT);
scene.add(cubeCamera);

const mirror = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 32), new THREE.MeshStandardMaterial({ envMap: cubeRT.texture, metalness: 1, roughness: 0.05 }));
scene.add(mirror);

const orbiters = [0xff5252, 0x69f0ae, 0x40c4ff, 0xffd740].map((c, i) => {
  const m = new THREE.Mesh(new THREE.TorusKnotGeometry(0.35, 0.12, 64, 12), new THREE.MeshStandardMaterial({ color: c }));
  scene.add(m);
  return m;
});
onFrame((t) => {
  orbiters.forEach((m, i) => {
    const a = t * 0.6 + (i / 4) * Math.PI * 2;
    m.position.set(Math.cos(a) * 3, Math.sin(t + i) * 0.8, Math.sin(a) * 3);
    m.rotation.set(t, t * 1.3, 0);
  });
  mirror.visible = false;
  cubeCamera.update(renderer, scene);   // 渲染 6 個面
  mirror.visible = true;
});
console.log('cubeRT 每面', cubeRT.width + 'x' + cubeRT.height);
` }],
  props: [['.renderTarget : WebGLCubeRenderTarget', '渲染目標。'], ['.coordinateSystem', '座標系統（WebGL / WebGPU）。'], ['.activeMipmapLevel : Integer', '要渲染的 mipmap 層級。']],
  methods: [['.update( renderer, scene ) : undefined', '渲染 6 個面到 renderTarget。'], ['.updateCoordinateSystem() : undefined', '依座標系統調整 6 台相機的方向。']],
},
{
  id: 'api-arraycamera', title: 'ArrayCamera', api: true, inherits: O3D.concat('Camera', 'PerspectiveCamera'), src: 'cameras/ArrayCamera.js',
  desc: '<p>一組相機，每台相機有自己的 <code>viewport</code>（Vector4，像素），渲染器會在一次 render 中依序以每台相機繪製到各自的區域。可用於多視角預覽、VR（WebXR 內部即使用 ArrayCamera）。</p>',
  ctor: { sig: 'new ArrayCamera( array : Array )' },
  examples: [{ title: '3×3 多視角', code: code`
import * as THREE from 'three';

const N = 3;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

function buildCameras() {
  const w = (innerWidth / N) * devicePixelRatio, h = (innerHeight / N) * devicePixelRatio;
  const cams = [];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const c = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.1, 50);
    c.viewport = new THREE.Vector4(Math.floor(x * w), Math.floor(y * h), Math.ceil(w), Math.ceil(h));
    c.position.set(x / N - 0.5, 0.5 - y / N, 1.5).multiplyScalar(3);
    c.position.z = 4;
    c.lookAt(0, 0, 0);
    c.updateMatrixWorld();
    cams.push(c);
  }
  return cams;
}
let camera = new THREE.ArrayCamera(buildCameras());
camera.position.z = 4;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1d24);
scene.add(new THREE.HemisphereLight(0xffffff, 0x445566, 2));
const mesh = new THREE.Mesh(new THREE.TorusKnotGeometry(0.6, 0.2, 128, 16), new THREE.MeshStandardMaterial({ color: 0xff8a65 }));
scene.add(mesh);
console.log('子相機數', camera.cameras.length);

renderer.setAnimationLoop((t) => {
  mesh.rotation.set(t / 1500, t / 1000, 0);
  renderer.render(scene, camera);
});
addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); camera = new THREE.ArrayCamera(buildCameras()); });
` }],
  props: [['.cameras : Array', '子相機陣列，每台需設定 viewport。'], ['.isArrayCamera : Boolean', '型別檢查旗標。']],
},
{
  id: 'api-stereocamera', title: 'StereoCamera', api: true, src: 'cameras/StereoCamera.js',
  desc: '<p>由一台主相機產生左右眼兩台相機（cameraL、cameraR），用於立體視覺效果（3D 眼鏡、並排立體圖、VR 預覽）。</p>',
  ctor: { sig: 'new StereoCamera()' },
  examples: [{ title: '並排立體圖', desc: '左右兩半分別為左眼、右眼視角。用面板調整兩眼距離 eyeSep。', code: code`
import * as THREE from 'three';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const stage = createStage({ cameraPosition: [0, 1, 6] });
const { scene, camera, renderer } = stage;

for (let i = 0; i < 20; i++) {
  const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 0), new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(i / 20, 0.7, 0.55), flatShading: true }));
  m.position.set((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 4);
  scene.add(m);
}
const stereo = new THREE.StereoCamera();
stereo.eyeSep = 0.1;
new GUI().add(stereo, 'eyeSep', 0, 0.5, 0.001);

stage.render = () => {
  camera.updateMatrixWorld();
  stereo.update(camera);
  const w = innerWidth / 2, h = innerHeight;
  renderer.setScissorTest(true);
  renderer.setScissor(0, 0, w, h); renderer.setViewport(0, 0, w, h);
  renderer.render(scene, stereo.cameraL);
  renderer.setScissor(w, 0, w, h); renderer.setViewport(w, 0, w, h);
  renderer.render(scene, stereo.cameraR);
  renderer.setScissorTest(false);
};
console.log('cameraL / cameraR 已由 stereo.update(camera) 產生');
` }],
  props: [['.aspect : Float', '寬高比，預設 1。'], ['.eyeSep : Float', '兩眼距離，預設 0.064。'], ['.cameraL / .cameraR : PerspectiveCamera', '左 / 右眼相機。']],
  methods: [['.update( camera : PerspectiveCamera ) : undefined', '依主相機更新左右眼相機。']],
},
]);

/* ================= 音訊 ================= */
var AUDIO_NOTE = '<div class="note">瀏覽器要求<b>使用者互動後</b>才能播放聲音，因此範例都需要先點擊畫面上的按鈕。</div>';
add('音訊 Audio', [
{
  id: 'api-audiolistener', title: 'AudioListener', api: true, inherits: O3D, src: 'audio/AudioListener.js',
  desc: '<p>場景中的「耳朵」，通常加到相機上。所有 Audio / PositionalAudio 都需要一個 listener；PositionalAudio 會依 listener 與音源的相對位置計算音量與左右聲道。</p>' + AUDIO_NOTE,
  ctor: { sig: 'new AudioListener()' },
  examples: [{ title: '主音量與濾波器', desc: '以振盪器產生聲音（不需要音檔），調整 listener 的主音量與低通濾波。', code: code`
import * as THREE from 'three';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const { camera } = createStage({ cameraPosition: [0, 0, 5] });

const btn = document.createElement('button');
btn.textContent = '▶ 點擊開始播放';
btn.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:16px;padding:10px 18px';
document.body.appendChild(btn);

btn.onclick = () => {
  btn.remove();
  const listener = new THREE.AudioListener();
  camera.add(listener);
  const sound = new THREE.Audio(listener);
  const osc = listener.context.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.value = 220;
  osc.start();
  sound.setNodeSource(osc);
  sound.setVolume(0.2);

  const filter = listener.context.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 800;
  const p = { masterVolume: 1, filter: true };
  listener.setFilter(filter);
  const gui = new GUI();
  gui.add(p, 'masterVolume', 0, 1, 0.01).onChange((v) => listener.setMasterVolume(v));
  gui.add(filter.frequency, 'value', 100, 5000, 1).name('lowpass Hz');
  gui.add(p, 'filter').name('啟用濾波器').onChange((v) => (v ? listener.setFilter(filter) : listener.removeFilter()));
  gui.add({ stop: () => { osc.stop(); console.log('已停止'); } }, 'stop').name('停止');
  console.log('AudioContext 取樣率', listener.context.sampleRate, 'Hz');
};
` }],
  props: [['.context : AudioContext', 'Web Audio 的 AudioContext。'], ['.gain : GainNode', '主音量節點。'], ['.filter : AudioNode', '目前的濾波器，預設 null。'], ['.timeDelta : Number', '位置更新的時間差，預設 0。']],
  methods: [
    ['.getInput() : GainNode', '輸入節點。'], ['.setMasterVolume( value ) : this', '主音量 0–1。'], ['.getMasterVolume() : Float', '取得主音量。'],
    ['.setFilter( node ) : this', '設定濾波器。'], ['.getFilter() : AudioNode', '取得濾波器。'], ['.removeFilter() : this', '移除濾波器。'],
  ],
},
{
  id: 'api-audio', title: 'Audio', api: true, inherits: O3D, src: 'audio/Audio.js',
  desc: '<p>非定位（全域）音訊，例如背景音樂。音量不隨距離改變。資料來源可以是 AudioBuffer（由 <a href="#/api-audioloader">AudioLoader</a> 載入）、&lt;audio&gt; 元素、MediaStream 或任意 AudioNode。</p>' + AUDIO_NOTE,
  ctor: { sig: 'new Audio( listener : AudioListener )' },
  examples: [{ title: '載入音檔並控制播放', code: code`
import * as THREE from 'three';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const { camera } = createStage({ cameraPosition: [0, 0, 5] });

const btn = document.createElement('button');
btn.textContent = '▶ 點擊載入並播放音樂';
btn.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:16px;padding:10px 18px';
document.body.appendChild(btn);
btn.onclick = async () => {
  btn.textContent = '載入中…';
  const listener = new THREE.AudioListener();
  camera.add(listener);
  const sound = new THREE.Audio(listener);
  const buffer = await new THREE.AudioLoader().loadAsync('https://threejs.org/examples/sounds/358232_j_s_song.mp3');
  btn.remove();
  sound.setBuffer(buffer);
  sound.setLoop(true);
  sound.setVolume(0.5);
  sound.play();
  console.log('長度', buffer.duration.toFixed(1), '秒｜聲道', buffer.numberOfChannels);
  const gui = new GUI();
  gui.add({ play: () => sound.play() }, 'play').name('play()');
  gui.add({ pause: () => sound.pause() }, 'pause').name('pause()');
  gui.add({ stop: () => sound.stop() }, 'stop').name('stop()');
  gui.add({ v: 0.5 }, 'v', 0, 1, 0.01).name('setVolume').onChange((v) => sound.setVolume(v));
  gui.add({ r: 1 }, 'r', 0.25, 2, 0.01).name('setPlaybackRate').onChange((v) => sound.setPlaybackRate(v));
  gui.add({ d: 0 }, 'd', -1200, 1200, 1).name('setDetune').onChange((v) => sound.setDetune(v));
};
` }],
  props: [
    ['.autoplay : Boolean', '設定 buffer 後是否自動播放。'], ['.buffer : AudioBuffer', '音訊資料。'], ['.context : AudioContext', 'AudioContext。'],
    ['.detune : Float', '音高微調（cents）。'], ['.duration : Number', '播放長度（秒），undefined 表示整段。'], ['.gain : GainNode', '音量節點。'],
    ['.hasPlaybackControl : Boolean', '是否可控制播放（MediaStream / 自訂節點時為 false）。'], ['.isPlaying : Boolean', '是否正在播放。'],
    ['.loop / .loopStart / .loopEnd', '循環設定。'], ['.offset : Number', '開始播放的時間偏移。'], ['.playbackRate : Float', '播放速度。'],
    ['.source : AudioNode', '來源節點。'], ['.sourceType : String', '"empty"、"audioNode"、"mediaNode"、"mediaStreamNode"、"buffer"。'], ['.filters : Array', '濾波器陣列。'],
  ],
  methods: [
    ['.setBuffer( audioBuffer ) : this', '設定音訊資料。'], ['.setMediaElementSource( audioElement ) : this', '使用 &lt;audio&gt; 元素。'],
    ['.setMediaStreamSource( mediaStream ) : this', '使用 MediaStream（麥克風等）。'], ['.setNodeSource( audioNode ) : this', '使用任意 AudioNode。'],
    ['.play( delay ) : this', '播放。'], ['.pause() : this', '暫停。'], ['.stop( delay ) : this', '停止。'],
    ['.setLoop( value ) / .setLoopStart( s ) / .setLoopEnd( s ) : this', '循環設定。'], ['.setVolume( value ) / .getVolume()', '音量。'],
    ['.setPlaybackRate( value ) / .getPlaybackRate()', '播放速度。'], ['.setDetune( value ) / .getDetune()', '音高微調。'],
    ['.setFilter( filter ) / .setFilters( array ) / .getFilters()', '濾波器。'], ['.connect() / .disconnect() : this', '連接 / 中斷 Web Audio 節點。'],
  ],
},
{
  id: 'api-positionalaudio', title: 'PositionalAudio', api: true, inherits: O3D.concat('Audio'), src: 'audio/PositionalAudio.js',
  desc: '<p>3D 定位音訊：音量依與 listener 的距離衰減，並依方向產生左右聲道差異。把它加到場景中的物件上，物件移動時聲音位置也跟著移動。</p>' + AUDIO_NOTE,
  ctor: { sig: 'new PositionalAudio( listener : AudioListener )' },
  examples: [{ title: '繞著你轉的聲源', desc: '戴上耳機效果最明顯。PositionalAudioHelper 顯示聲音的指向錐。', code: code`
import * as THREE from 'three';
import { PositionalAudioHelper } from 'three/addons/helpers/PositionalAudioHelper.js';
import { createStage } from 'doc-stage';
const { scene, camera, onFrame } = createStage({ cameraPosition: [0, 6, 8], grid: 20 });

const speaker = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.5), new THREE.MeshStandardMaterial({ color: 0xffb300 }));
scene.add(speaker);

const btn = document.createElement('button');
btn.textContent = '▶ 點擊開始（建議戴耳機）';
btn.style.cssText = 'position:absolute;top:12px;left:50%;transform:translateX(-50%);font-size:15px;padding:8px 14px';
document.body.appendChild(btn);
btn.onclick = () => {
  btn.remove();
  const listener = new THREE.AudioListener();
  camera.add(listener);
  const sound = new THREE.PositionalAudio(listener);
  const osc = listener.context.createOscillator();
  osc.type = 'triangle';
  osc.frequency.value = 330;
  osc.start();
  sound.setNodeSource(osc);
  sound.setRefDistance(2);
  sound.setRolloffFactor(1.5);
  sound.setDirectionalCone(120, 230, 0.1);
  speaker.add(sound);
  speaker.add(new PositionalAudioHelper(sound, 2));
  console.log('distanceModel =', sound.getDistanceModel(), '｜refDistance =', sound.getRefDistance());
};
onFrame((t) => {
  speaker.position.set(Math.cos(t * 0.8) * 5, 0.5, Math.sin(t * 0.8) * 5);
  speaker.lookAt(0, 0.5, 0);
});
` }],
  props: [['.panner : PannerNode', 'Web Audio 的 PannerNode。']],
  methods: [
    ['.setRefDistance( v ) / .getRefDistance()', '開始衰減的參考距離。'], ['.setRolloffFactor( v ) / .getRolloffFactor()', '衰減速度。'],
    ['.setDistanceModel( v ) / .getDistanceModel()', '"linear"、"inverse"（預設）、"exponential"。'], ['.setMaxDistance( v ) / .getMaxDistance()', '最大距離（linear 模式）。'],
    ['.setDirectionalCone( innerAngle, outerAngle, outerGain ) : this', '指向錐（度）。外錐之外的音量為 outerGain。'],
  ],
},
{
  id: 'api-audioanalyser', title: 'AudioAnalyser', api: true, src: 'audio/AudioAnalyser.js',
  desc: '<p>以 Web Audio 的 AnalyserNode 分析 Audio 的頻譜資料，常用於音樂視覺化。</p>' + AUDIO_NOTE,
  ctor: { sig: 'new AudioAnalyser( audio : Audio, fftSize : Number )', params: [['audio', 'Audio', '要分析的音訊。'], ['fftSize', 'Number', 'FFT 大小（2 的次方），預設 2048；頻率資料長度為 fftSize / 2。']] },
  examples: [{ title: '音樂頻譜視覺化', code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, camera, onFrame } = createStage({ cameraPosition: [0, 6, 12], background: 0x0a0a12 });

const bars = [];
for (let i = 0; i < 64; i++) {
  const b = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1, 0.18), new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(i / 64, 0.8, 0.55) }));
  const a = (i / 64) * Math.PI * 2;
  b.position.set(Math.cos(a) * 4, 0, Math.sin(a) * 4);
  scene.add(b);
  bars.push(b);
}
let analyser = null;
const btn = document.createElement('button');
btn.textContent = '▶ 點擊播放音樂';
btn.style.cssText = 'position:absolute;top:12px;left:50%;transform:translateX(-50%);font-size:15px;padding:8px 14px';
document.body.appendChild(btn);
btn.onclick = async () => {
  btn.textContent = '載入中…';
  const listener = new THREE.AudioListener();
  camera.add(listener);
  const sound = new THREE.Audio(listener);
  sound.setBuffer(await new THREE.AudioLoader().loadAsync('https://threejs.org/examples/sounds/376737_Skullbeatz___Bad_Cat_Maste.mp3'));
  sound.setLoop(true);
  sound.play();
  analyser = new THREE.AudioAnalyser(sound, 128);
  btn.remove();
};
let last = 0;
onFrame((t) => {
  if (!analyser) return;
  const data = analyser.getFrequencyData();   // Uint8Array，長度 64
  bars.forEach((b, i) => { b.scale.y = 0.1 + data[i] / 40; b.position.y = b.scale.y / 2; });
  if (t - last > 2) { last = t; console.log('平均頻率強度', analyser.getAverageFrequency().toFixed(1)); }
});
` }],
  props: [['.analyser : AnalyserNode', 'Web Audio 的 AnalyserNode。'], ['.data : Uint8Array', '頻率資料緩衝區（長度 fftSize / 2）。']],
  methods: [['.getFrequencyData() : Uint8Array', '取得目前的頻率資料（0–255）。'], ['.getAverageFrequency() : Number', '平均頻率強度。']],
},
{
  id: 'api-audiocontext', title: 'AudioContext', api: true, src: 'audio/AudioContext.js',
  desc: '<p>管理整個 three.js 共用的 Web Audio <code>AudioContext</code>（單例）。AudioListener 預設使用它。</p>',
  examples: [{ title: '取得共用的 AudioContext', consoleOnly: true, code: code`
import * as THREE from 'three';
const ctx = THREE.AudioContext.getContext();
console.log('state =', ctx.state, '（使用者互動前通常為 suspended）');
console.log('sampleRate =', ctx.sampleRate);
const listener = new THREE.AudioListener();
console.log('listener.context 與共用 context 相同？', listener.context === ctx);
` }],
  statics: [['.getContext() : AudioContext', '取得（必要時建立）共用的 AudioContext。'], ['.setContext( value : AudioContext ) : undefined', '指定要共用的 AudioContext。']],
},
]);

/* ================= 輔助物件 ================= */
var HELP_STAGE = code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ lights: false, grid: true, cameraPosition: [5, 5, 7] });
const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshStandardMaterial({ color: 0x777777 }));
floor.rotation.x = -Math.PI / 2;
const ball = new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 16), new THREE.MeshStandardMaterial({ color: 0xffffff }));
ball.position.y = 0.6;
scene.add(floor, ball, new THREE.AmbientLight(0xffffff, 0.15));
`;
var LINES = ['EventDispatcher', 'Object3D', 'Line', 'LineSegments'];
add('輔助物件 Helpers', [
{
  id: 'api-directionallighthelper', title: 'DirectionalLightHelper', api: true, inherits: O3D, src: 'helpers/DirectionalLightHelper.js',
  desc: '<p>顯示 <a href="#/api-directionallight">DirectionalLight</a> 的位置（一個平面）與照射方向（指向 target 的線）。光源或 target 移動後需呼叫 <code>update()</code>。</p>',
  ctor: { sig: 'new DirectionalLightHelper( light : DirectionalLight, size : Number, color : Color )', params: [['size', 'Number', '平面大小，預設 1。'], ['color', 'Color', '（選填）顏色，預設使用光的顏色。']] },
  examples: [{ title: '移動的平行光', code: HELP_STAGE + code`
const light = new THREE.DirectionalLight(0xffcc80, 3);
scene.add(light, light.target);
const helper = new THREE.DirectionalLightHelper(light, 0.8);
scene.add(helper);
onFrame((t) => {
  light.position.set(Math.cos(t) * 4, 4, Math.sin(t) * 4);
  light.target.position.x = Math.sin(t * 0.7) * 2;
  helper.update();
});
` }],
  props: [['.light : DirectionalLight', '光源。'], ['.lightPlane : Line', '代表光源的平面。'], ['.targetLine : Line', '指向 target 的線。'], ['.color', '顏色。']],
  methods: [['.update() : undefined', '依光源更新。'], ['.dispose() : undefined', '釋放資源。']],
},
{
  id: 'api-pointlighthelper', title: 'PointLightHelper', api: true, inherits: O3D.concat('Mesh'), src: 'helpers/PointLightHelper.js',
  desc: '<p>以線框球體顯示 <a href="#/api-pointlight">PointLight</a> 的位置。</p>',
  ctor: { sig: 'new PointLightHelper( light : PointLight, sphereSize : Float, color : Color )' },
  examples: [{ title: '三盞點光源', code: HELP_STAGE + code`
const lights = [0xff5252, 0x69f0ae, 0x448aff].map((c) => {
  const l = new THREE.PointLight(c, 15);
  scene.add(l, new THREE.PointLightHelper(l, 0.2));
  return l;
});
onFrame((t) => lights.forEach((l, i) => {
  const a = t + (i / 3) * Math.PI * 2;
  l.position.set(Math.cos(a) * 2, 1.2, Math.sin(a) * 2);
}));
` }],
  props: [['.light : PointLight', '光源。'], ['.color', '顏色。']],
  methods: [['.update() : undefined', '光源顏色改變後更新。'], ['.dispose() : undefined', '釋放資源。']],
},
{
  id: 'api-spotlighthelper', title: 'SpotLightHelper', api: true, inherits: O3D, src: 'helpers/SpotLightHelper.js',
  desc: '<p>以圓錐線框顯示 <a href="#/api-spotlight">SpotLight</a> 的光錐。修改 angle、distance 或 target 後需呼叫 <code>update()</code>。</p>',
  ctor: { sig: 'new SpotLightHelper( light : SpotLight, color : Color )' },
  examples: [{ title: '掃射的聚光燈', code: HELP_STAGE + code`
const spot = new THREE.SpotLight(0xffffff, 60, 8, Math.PI / 8, 0.3);
spot.position.set(0, 5, 0);
scene.add(spot, spot.target);
const helper = new THREE.SpotLightHelper(spot);
scene.add(helper);
onFrame((t) => {
  spot.target.position.set(Math.cos(t) * 3, 0, Math.sin(t * 1.3) * 3);
  spot.angle = Math.PI / 10 + Math.sin(t * 2) * 0.1;
  helper.update();
});
` }],
  props: [['.light : SpotLight', '光源。'], ['.cone : LineSegments', '光錐線條。'], ['.color', '顏色。']],
  methods: [['.update() : undefined', '依光源更新。'], ['.dispose() : undefined', '釋放資源。']],
},
{
  id: 'api-hemispherelighthelper', title: 'HemisphereLightHelper', api: true, inherits: O3D, src: 'helpers/HemisphereLightHelper.js',
  desc: '<p>以上下兩色的八面體顯示 <a href="#/api-hemispherelight">HemisphereLight</a> 的天空色與地面色。範例見 HemisphereLight 頁面。</p>',
  ctor: { sig: 'new HemisphereLightHelper( light : HemisphereLight, sphereSize : Number, color : Color )' },
  examples: [{ title: '天空色與地面色', code: HELP_STAGE + code`
const hemi = new THREE.HemisphereLight(0x80d8ff, 0xff6e40, 2);
hemi.position.set(0, 3, 0);
const helper = new THREE.HemisphereLightHelper(hemi, 0.6);
scene.add(hemi, helper);
onFrame((t) => { hemi.color.setHSL((t * 0.1) % 1, 0.8, 0.6); helper.update(); });
` }],
  props: [['.light : HemisphereLight', '光源。'], ['.color', '顏色（未設定時使用光的顏色）。']],
  methods: [['.update() : undefined', '更新。'], ['.dispose() : undefined', '釋放資源。']],
},
{
  id: 'api-skeletonhelper', title: 'SkeletonHelper', api: true, inherits: LINES, src: 'helpers/SkeletonHelper.js',
  desc: '<p>以線段顯示物件中的所有骨骼（Bone）。傳入 SkinnedMesh 或任何含有 Bone 的物件（例如 glTF 模型的根節點）。範例見 <a href="#/api-skinnedmesh">SkinnedMesh</a>。</p>',
  ctor: { sig: 'new SkeletonHelper( object : Object3D )' },
  examples: [{ title: 'glTF 模型的骨架', code: code`
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [2, 2, 3], target: [0, 1, 0], grid: true });
const gltf = await new GLTFLoader().loadAsync('https://threejs.org/examples/models/gltf/Soldier.glb');
scene.add(gltf.scene);
gltf.scene.traverse((o) => { if (o.isMesh) { o.material.transparent = true; o.material.opacity = 0.35; } });
const helper = new THREE.SkeletonHelper(gltf.scene);
scene.add(helper);
console.log('骨骼數', helper.bones.length);
const mixer = new THREE.AnimationMixer(gltf.scene);
mixer.clipAction(gltf.animations.find((a) => a.name === 'Run') || gltf.animations[0]).play();
onFrame((t, dt) => mixer.update(dt));
` }],
  props: [['.bones : Array', '骨骼陣列。'], ['.root : Object3D', '傳入的物件。']],
  methods: [['.dispose() : undefined', '釋放資源。']],
},
{
  id: 'api-planehelper', title: 'PlaneHelper', api: true, inherits: LINES, src: 'helpers/PlaneHelper.js',
  desc: '<p>顯示一個數學 <a href="#/api-plane">Plane</a>（無限平面）的一部分，常用於檢視裁切平面。</p>',
  ctor: { sig: 'new PlaneHelper( plane : Plane, size : Float, hex : Color )' },
  examples: [{ title: '旋轉的平面', code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [4, 3, 5], axes: 2 });
const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const helper = new THREE.PlaneHelper(plane, 3, 0xffeb3b);
scene.add(helper);
const n = new THREE.Vector3();
onFrame((t) => {
  plane.normal.copy(n.set(Math.sin(t), 1, Math.cos(t * 0.7)).normalize());
  plane.constant = Math.sin(t * 1.5) * 0.5;
});
` }],
  props: [['.plane : Plane', '平面。'], ['.size : Float', '顯示大小。']],
  methods: [['.dispose() : undefined', '釋放資源。']],
},
{
  id: 'api-box3helper', title: 'Box3Helper', api: true, inherits: LINES, src: 'helpers/Box3Helper.js',
  desc: '<p>以線框顯示一個 <a href="#/api-box3">Box3</a>。修改 Box3 後線框會自動更新（每幀讀取）。範例見 Box3。</p>',
  ctor: { sig: 'new Box3Helper( box : Box3, color : Color )' },
  examples: [{ title: '動態包圍盒', code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [4, 3, 6] });
const box = new THREE.Box3();
scene.add(new THREE.Box3Helper(box, 0x00e5ff));
const pts = Array.from({ length: 6 }, () => {
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshStandardMaterial({ color: 0xff4081 }));
  scene.add(m);
  return m;
});
onFrame((t) => {
  box.makeEmpty();
  pts.forEach((m, i) => {
    m.position.set(Math.sin(t + i) * 1.5, Math.cos(t * 1.3 + i * 2) * 1, Math.sin(t * 0.7 + i * 3) * 1.5);
    box.expandByPoint(m.position);
  });
});
` }],
  props: [['.box : Box3', '包圍盒。']],
  methods: [['.dispose() : undefined', '釋放資源。']],
},
{
  id: 'api-polargridhelper', title: 'PolarGridHelper', api: true, inherits: LINES, src: 'helpers/PolarGridHelper.js',
  desc: '<p>極座標格線：由同心圓與放射線組成。範例見 <a href="#/api-gridhelper">GridHelper</a>。</p>',
  ctor: { sig: 'new PolarGridHelper( radius : Number, sectors : Number, rings : Number, divisions : Number, color1 : Color, color2 : Color )', params: [
    ['radius', 'Number', '半徑，預設 10。'], ['sectors', 'Number', '扇區數（放射線），預設 16。'], ['rings', 'Number', '同心圓數，預設 8。'],
    ['divisions', 'Number', '每個圓的分段數，預設 64。'], ['color1 / color2', 'Color', '交替的線條顏色。'],
  ]},
  examples: [{ title: '雷達畫面', code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 9, 0.01], lights: false, background: 0x001a0d });
scene.add(new THREE.PolarGridHelper(4, 12, 4, 64, 0x00e676, 0x00703c));
const sweep = new THREE.Mesh(new THREE.CircleGeometry(4, 32, 0, 0.4), new THREE.MeshBasicMaterial({ color: 0x00e676, transparent: true, opacity: 0.3, side: THREE.DoubleSide }));
sweep.rotation.x = -Math.PI / 2;
scene.add(sweep);
onFrame((t) => { sweep.rotation.z = -t * 1.5; });
` }],
  methods: [['.dispose() : undefined', '釋放資源。']],
},
]);
})();
