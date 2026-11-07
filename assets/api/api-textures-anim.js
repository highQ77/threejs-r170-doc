/* API 參考：貼圖、載入器、動畫 */
(function () {
var code = String.raw;
var TB = ['EventDispatcher', 'Texture'];

window.DOCS.push(
{ group: '貼圖 Textures', section: 'api', items: [
{
  id: 'api-texture', title: 'Texture', api: true, inherits: ['EventDispatcher'], src: 'textures/Texture.js',
  desc: '<p>建立可套用到物件表面的貼圖。通常透過 <a href="#/api-textureloader">TextureLoader</a> 載入圖片取得，或使用子類別 CanvasTexture、DataTexture、VideoTexture 等。</p><p>注意：修改 wrap、filter、format 等屬性，或圖片內容改變後，需設定 <code>texture.needsUpdate = true</code>。修改 offset、repeat、rotation、center 則不需要。</p>',
  ctor: { sig: 'new Texture( image, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, colorSpace )' },
  examples: [{
    title: 'UV 變換：offset、repeat、rotation、center',
    desc: '這些屬性透過 UV 變換矩陣作用，修改後立即生效、不需要 needsUpdate。',
    code: code`
import * as THREE from 'three';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const { scene } = createStage({ cameraPosition: [0, 0, 3.2], lights: false });

const c = document.createElement('canvas'); c.width = c.height = 256;
const ctx = c.getContext('2d');
ctx.fillStyle = '#263238'; ctx.fillRect(0, 0, 256, 256);
ctx.fillStyle = '#ffca28'; ctx.fillRect(0, 0, 128, 128);
ctx.fillStyle = '#29b6f6'; ctx.fillRect(128, 128, 128, 128);
ctx.fillStyle = '#fff'; ctx.font = 'bold 80px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
ctx.fillText('UV', 128, 128);
const texture = new THREE.CanvasTexture(c);
texture.colorSpace = THREE.SRGBColorSpace;
texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: texture })));

const gui = new GUI();
gui.add(texture.offset, 'x', -1, 1, 0.01).name('offset.x');
gui.add(texture.offset, 'y', -1, 1, 0.01).name('offset.y');
gui.add(texture.repeat, 'x', 0.1, 4, 0.01).name('repeat.x');
gui.add(texture.repeat, 'y', 0.1, 4, 0.01).name('repeat.y');
gui.add(texture, 'rotation', -Math.PI, Math.PI, 0.01);
gui.add(texture.center, 'x', 0, 1, 0.01).name('center.x');
gui.add(texture.center, 'y', 0, 1, 0.01).name('center.y');
gui.add(texture, 'wrapS', { Repeat: THREE.RepeatWrapping, Clamp: THREE.ClampToEdgeWrapping, Mirrored: THREE.MirroredRepeatWrapping }).onChange(() => (texture.needsUpdate = true));
gui.add(texture, 'wrapT', { Repeat: THREE.RepeatWrapping, Clamp: THREE.ClampToEdgeWrapping, Mirrored: THREE.MirroredRepeatWrapping }).onChange(() => (texture.needsUpdate = true));
`
  }],
  props: [
    ['.image : Image', '貼圖來源：HTMLImageElement、Canvas、Video、ImageBitmap 或 <code>{ data, width, height }</code>。'],
    ['.source : Source', '貼圖資料來源物件，可在多個 Texture 間共用。'],
    ['.mapping : Integer', '映射方式：<code>UVMapping</code>（預設）、<code>EquirectangularReflectionMapping</code>、<code>CubeReflectionMapping</code> 等。'],
    ['.channel : Integer', '使用哪一組 UV（0 = uv、1 = uv1…）。'],
    ['.wrapS / .wrapT : Integer', '水平 / 垂直包覆：<code>ClampToEdgeWrapping</code>（預設）、<code>RepeatWrapping</code>、<code>MirroredRepeatWrapping</code>。'],
    ['.magFilter : Integer', '放大時的取樣：<code>LinearFilter</code>（預設）或 <code>NearestFilter</code>（像素風）。'],
    ['.minFilter : Integer', '縮小時的取樣，預設 <code>LinearMipmapLinearFilter</code>。'],
    ['.anisotropy : Number', '非等向過濾等級，最大值可由 <code>renderer.capabilities.getMaxAnisotropy()</code> 取得。'],
    ['.format / .type / .internalFormat', '像素格式、資料型別。'],
    ['.colorSpace : String', '色彩空間。顏色貼圖（map、emissiveMap）應設為 <code>SRGBColorSpace</code>，資料貼圖（normal、roughness）保持 <code>NoColorSpace</code>。'],
    ['.offset : Vector2', 'UV 偏移。'],
    ['.repeat : Vector2', 'UV 重複次數（需要 RepeatWrapping 才看得到重複）。'],
    ['.rotation : Float', 'UV 旋轉（弧度），以 center 為中心。'],
    ['.center : Vector2', '旋轉中心，預設 (0, 0)；(0.5, 0.5) 為貼圖中央。'],
    ['.matrixAutoUpdate : Boolean', '是否自動由 offset / repeat / rotation / center 計算 matrix，預設 true。'],
    ['.matrix : Matrix3', 'UV 變換矩陣。'],
    ['.generateMipmaps : Boolean', '是否產生 mipmap，預設 true。'],
    ['.flipY : Boolean', '上傳時是否垂直翻轉，預設 true（glTF 模型的貼圖為 false）。'],
    ['.premultiplyAlpha : Boolean', '是否預乘 alpha。'],
    ['.needsUpdate : Boolean', '設為 true 會重新上傳到 GPU。'],
    ['.name / .id / .uuid / .userData', '識別與自訂資料。'],
  ],
  methods: [
    ['.updateMatrix() : undefined', '由 offset、repeat、rotation、center 更新 matrix。'],
    ['.clone() : Texture', '複製（與原貼圖共用 source / image）。'],
    ['.dispose() : undefined', '釋放 GPU 資源。'],
    ['.transformUv( uv : Vector2 ) : Vector2', '依貼圖設定變換 UV 座標。'],
    ['.toJSON( meta ) : Object', '轉為 JSON。'],
  ],
},
{
  id: 'api-canvastexture', title: 'CanvasTexture', api: true, inherits: TB, src: 'textures/CanvasTexture.js',
  desc: '<p>以 Canvas 元素作為來源的貼圖，建立後 <code>needsUpdate</code> 會自動設為 true。重新繪製 canvas 後，再次設定 <code>needsUpdate = true</code> 就能更新貼圖，適合動態文字、儀表板、繪圖板。</p>',
  ctor: { sig: 'new CanvasTexture( canvas : HTMLCanvasElement, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy )' },
  examples: [{
    title: '動態更新的 Canvas：時鐘',
    code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [2, 1.5, 3] });

const canvas = document.createElement('canvas');
canvas.width = canvas.height = 256;
const ctx = canvas.getContext('2d');
const texture = new THREE.CanvasTexture(canvas);
texture.colorSpace = THREE.SRGBColorSpace;

const box = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.5), new THREE.MeshStandardMaterial({ map: texture }));
scene.add(box);

function draw() {
  const d = new Date();
  ctx.fillStyle = '#1a237e'; ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.arc(128, 128, 110, 0, Math.PI * 2); ctx.stroke();
  const hand = (angle, len, w) => {
    ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(128, 128);
    ctx.lineTo(128 + Math.sin(angle) * len, 128 - Math.cos(angle) * len); ctx.stroke();
  };
  hand((d.getHours() % 12 + d.getMinutes() / 60) / 12 * Math.PI * 2, 55, 8);
  hand(d.getMinutes() / 60 * Math.PI * 2, 85, 5);
  ctx.strokeStyle = '#ff5252';
  hand((d.getSeconds() + d.getMilliseconds() / 1000) / 60 * Math.PI * 2, 95, 2);
  texture.needsUpdate = true;   // 重繪後通知 three.js 重新上傳
}
onFrame((t) => { draw(); box.rotation.y = Math.sin(t * 0.5) * 0.6; });
`
  }],
  props: [['.isCanvasTexture : Boolean', '型別檢查旗標。'], ['.needsUpdate : Boolean', '建構時已自動設為 true；之後每次重繪 canvas 後需再設定。']],
},
{
  id: 'api-datatexture', title: 'DataTexture', api: true, inherits: TB, src: 'textures/DataTexture.js',
  desc: '<p>直接以 TypedArray 提供像素資料的貼圖，適合程式產生的圖案、查找表（LUT）、資料視覺化或傳遞資料給著色器。預設 magFilter / minFilter 為 NearestFilter、flipY 為 false、不產生 mipmap。</p>',
  ctor: { sig: 'new DataTexture( data : TypedArray, width : Number, height : Number, format : Constant, type : Constant, mapping, wrapS, wrapT, magFilter, minFilter, anisotropy, colorSpace )' },
  examples: [{
    title: '程式產生的雜訊貼圖',
    desc: '每幀改寫像素陣列並設定 needsUpdate，產生動態圖案。',
    code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 0, 2.6], lights: false });

const size = 64;
const data = new Uint8Array(size * size * 4);
const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
texture.colorSpace = THREE.SRGBColorSpace;
scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: texture })));

onFrame((t) => {
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const i = (y * size + x) * 4;
    const v = Math.sin(x * 0.2 + t * 2) + Math.sin(y * 0.15 - t) + Math.sin((x + y) * 0.1 + t * 1.5);
    data[i] = 128 + 127 * Math.sin(v);
    data[i + 1] = 128 + 127 * Math.sin(v + 2);
    data[i + 2] = 128 + 127 * Math.sin(v + 4);
    data[i + 3] = 255;
  }
  texture.needsUpdate = true;
});
console.log('DataTexture', size + 'x' + size, '｜magFilter 為 NearestFilter？', texture.magFilter === THREE.NearestFilter);
`
  }],
  props: [
    ['.image : Object', '<code>{ data, width, height }</code>。'],
    ['.flipY : Boolean', '預設 false。'],
    ['.generateMipmaps : Boolean', '預設 false。'],
    ['.unpackAlignment : Integer', '預設 1。'],
  ],
},
{
  id: 'api-videotexture', title: 'VideoTexture', api: true, inherits: TB, src: 'textures/VideoTexture.js',
  desc: '<p>以 &lt;video&gt; 元素為來源的貼圖，會在影片播放時自動每幀更新，不需要手動設定 needsUpdate。瀏覽器的自動播放政策通常要求影片 <code>muted</code>，或在使用者互動後才呼叫 <code>video.play()</code>。</p>',
  ctor: { sig: 'new VideoTexture( video : HTMLVideoElement, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy )' },
  examples: [{
    title: '以 Canvas 串流作為影片來源',
    desc: '為了不依賴外部影片檔，這裡用 canvas.captureStream() 產生一段即時影片，再交給 VideoTexture。',
    code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 0.5, 3.5] });

// 產生影片來源
const src = document.createElement('canvas'); src.width = 320; src.height = 180;
const ctx = src.getContext('2d');
const video = document.createElement('video');
video.srcObject = src.captureStream(30);
video.muted = true;
video.playsInline = true;
video.play();

const texture = new THREE.VideoTexture(video);
texture.colorSpace = THREE.SRGBColorSpace;
const screen = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.8), new THREE.MeshBasicMaterial({ map: texture }));
scene.add(screen);

onFrame((t) => {
  ctx.fillStyle = 'hsl(' + (t * 40 % 360) + ',60%,30%)'; ctx.fillRect(0, 0, 320, 180);
  ctx.fillStyle = '#fff'; ctx.font = '32px monospace';
  ctx.fillText('VIDEO ' + t.toFixed(2) + 's', 40 + Math.sin(t) * 30, 100);
  screen.rotation.y = Math.sin(t * 0.5) * 0.3;
});
`
  }],
  props: [['.isVideoTexture : Boolean', '型別檢查旗標。']],
  methods: [['.update() : undefined', '由渲染器自動呼叫，若影片有新影格則更新。']],
},
{
  id: 'api-cubetexture', title: 'CubeTexture', api: true, inherits: TB, src: 'textures/CubeTexture.js',
  desc: '<p>由 6 張圖片組成的立方體貼圖，順序為 +X、-X、+Y、-Y、+Z、-Z，常用作天空盒（scene.background）或環境反射（envMap）。通常以 <code>CubeTextureLoader</code> 載入。</p><pre class="code"><code>const loader = new THREE.CubeTextureLoader().setPath(\'textures/cube/\');\nscene.background = loader.load([\'px.jpg\', \'nx.jpg\', \'py.jpg\', \'ny.jpg\', \'pz.jpg\', \'nz.jpg\']);</code></pre>',
  ctor: { sig: 'new CubeTexture( images : Array, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, colorSpace )' },
  examples: [{
    title: '以 Canvas 產生的天空盒與反射',
    code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene } = createStage({ cameraPosition: [0, 0, 4], lights: false });

const labels = ['+X', '-X', '+Y', '-Y', '+Z', '-Z'];
const colors = ['#e53935', '#8e24aa', '#1e88e5', '#43a047', '#fdd835', '#fb8c00'];
const faces = labels.map((label, i) => {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = colors[i]; ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 2;
  for (let k = 0; k <= 256; k += 32) { ctx.beginPath(); ctx.moveTo(k, 0); ctx.lineTo(k, 256); ctx.moveTo(0, k); ctx.lineTo(256, k); ctx.stroke(); }
  ctx.fillStyle = '#fff'; ctx.font = 'bold 80px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(label, 128, 128);
  return c;
});
const cube = new THREE.CubeTexture(faces);
cube.colorSpace = THREE.SRGBColorSpace;
cube.needsUpdate = true;
scene.background = cube;

const ball = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 32), new THREE.MeshBasicMaterial({ envMap: cube }));
scene.add(ball);
console.log('拖曳視角查看 6 個面；中央球體以 envMap 反射天空盒');
`
  }],
  props: [['.images : Array', '6 張圖片。'], ['.flipY : Boolean', '預設 false。']],
},
]},

{ group: '載入器 Loaders', section: 'api', items: [
{
  id: 'api-textureloader', title: 'TextureLoader', api: true, inherits: ['Loader'], src: 'loaders/TextureLoader.js',
  desc: '<p>載入圖片並建立 <a href="#/api-texture">Texture</a>。<code>load()</code> 會<b>立即</b>回傳一個 Texture（圖片載入完成前是空的），所以可以直接指定給材質。跨網域圖片需伺服器允許 CORS。</p>',
  ctor: { sig: 'new TextureLoader( manager : LoadingManager )', params: [['manager', 'LoadingManager', '（選填）載入管理器，預設為 THREE.DefaultLoadingManager。']] },
  examples: [{
    title: 'load 與 loadAsync',
    code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 0.5, 4] });

const loader = new THREE.TextureLoader();
loader.setPath('https://threejs.org/examples/textures/');

// 方法一：callback（load 立即回傳 Texture）
const crate = loader.load('crate.gif',
  (tex) => console.log('crate.gif 載入完成', tex.image.width + 'x' + tex.image.height),
  undefined,
  (err) => console.error('載入失敗', err));
crate.colorSpace = THREE.SRGBColorSpace;

const a = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), new THREE.MeshStandardMaterial({ map: crate }));
a.position.x = -1;
scene.add(a);

// 方法二：Promise
const uv = await loader.loadAsync('uv_grid_opengl.jpg');
uv.colorSpace = THREE.SRGBColorSpace;
console.log('uv_grid_opengl.jpg 載入完成', uv.image.width + 'x' + uv.image.height);
const b = new THREE.Mesh(new THREE.SphereGeometry(0.7, 48, 24), new THREE.MeshStandardMaterial({ map: uv }));
b.position.x = 1;
scene.add(b);

onFrame((t) => { a.rotation.y = b.rotation.y = t * 0.4; });
`
  }],
  methods: [
    ['.load( url : String, onLoad : Function, onProgress : Function, onError : Function ) : Texture', '開始載入並立即回傳 Texture。onProgress 對圖片通常不會被呼叫。'],
    ['.loadAsync( url : String, onProgress : Function ) : Promise', 'Promise 版本，resolve 時得到載入完成的 Texture。'],
    ['.setPath( path : String ) : this', '設定基礎路徑。'],
    ['.setCrossOrigin( value : String ) : this', '設定 crossOrigin，預設 "anonymous"。'],
    ['.setRequestHeader( header : Object ) : this', '設定 HTTP 標頭（ImageLoader 不支援，FileLoader 支援）。'],
  ],
},
{
  id: 'api-loadingmanager', title: 'LoadingManager', api: true, src: 'loaders/LoadingManager.js',
  desc: '<p>追蹤多個載入器的整體進度。把同一個 manager 傳給多個載入器，就能統一顯示載入畫面、在全部完成後啟動場景。</p>',
  ctor: { sig: 'new LoadingManager( onLoad : Function, onProgress : Function, onError : Function )' },
  examples: [{
    title: '載入進度條',
    code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene } = createStage({ cameraPosition: [0, 1, 5] });

const bar = document.createElement('div');
bar.style.cssText = 'position:absolute;left:10%;right:10%;top:48%;height:8px;background:#333;border-radius:4px;overflow:hidden';
const fill = document.createElement('div');
fill.style.cssText = 'height:100%;width:0;background:#4fc3f7;transition:width .2s';
bar.appendChild(fill);
document.body.appendChild(bar);

const manager = new THREE.LoadingManager();
manager.onStart = (url, loaded, total) => console.log('開始載入', url.split('/').pop(), loaded + '/' + total);
manager.onProgress = (url, loaded, total) => {
  fill.style.width = (loaded / total) * 100 + '%';
  console.log('完成', url.split('/').pop(), loaded + '/' + total);
};
manager.onLoad = () => { console.log('全部載入完成！'); setTimeout(() => bar.remove(), 400); };
manager.onError = (url) => console.error('載入失敗', url);

const loader = new THREE.TextureLoader(manager).setPath('https://threejs.org/examples/textures/');
['crate.gif', 'uv_grid_opengl.jpg', 'disturb.jpg', 'sprite.png'].forEach((file, i) => {
  const tex = loader.load(file);
  tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
  m.position.set((i - 1.5) * 1.2, 0, 0);
  scene.add(m);
});
`
  }],
  props: [
    ['.onStart : Function', '第一個項目開始載入時呼叫 <code>(url, itemsLoaded, itemsTotal)</code>。'],
    ['.onProgress : Function', '每個項目完成時呼叫 <code>(url, itemsLoaded, itemsTotal)</code>。'],
    ['.onLoad : Function', '所有項目都完成時呼叫。'],
    ['.onError : Function', '任一項目失敗時呼叫 <code>(url)</code>。'],
  ],
  methods: [
    ['.setURLModifier( callback : Function ) : this', '在請求前改寫 URL（例如對應到 blob URL）。'],
    ['.addHandler( regex : RegExp, loader : Loader ) : this', '依檔名規則指定載入器。'],
    ['.removeHandler( regex : RegExp ) : this', '移除 handler。'],
    ['.getHandler( file : String ) : Loader', '取得檔案對應的載入器。'],
    ['.itemStart( url ) / .itemEnd( url ) / .itemError( url )', '由載入器內部呼叫，自訂載入器時使用。'],
  ],
},
{
  id: 'api-gltfloader', title: 'GLTFLoader', api: true, inherits: ['Loader'], src: 'examples/jsm/loaders/GLTFLoader.js',
  module: "import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';",
  desc: '<p>載入 glTF 2.0 模型（.gltf / .glb）。glTF 是 three.js 推薦的 3D 交換格式，支援網格、PBR 材質、貼圖、骨架、變形目標、動畫、相機與光源（KHR_lights_punctual）。</p><p>搭配 <code>DRACOLoader</code>（網格壓縮）、<code>KTX2Loader</code>（貼圖壓縮）、<code>MeshoptDecoder</code> 可以支援壓縮過的模型。</p>',
  ctor: { sig: 'new GLTFLoader( manager : LoadingManager )' },
  examples: [{
    title: '載入模型、走訪節點與播放動畫',
    desc: '載入 threejs.org 上的 Soldier.glb，列出動畫名稱，並可切換動作。',
    code: code`
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [2, 2, 4], target: [0, 1, 0], grid: true, shadows: true });

const gltf = await new GLTFLoader().loadAsync('https://threejs.org/examples/models/gltf/Soldier.glb',
  (e) => e.total && console.log('下載中', Math.round(e.loaded / e.total * 100) + '%'));
const model = gltf.scene;
scene.add(model);

let meshCount = 0;
model.traverse((o) => { if (o.isMesh) { meshCount++; o.castShadow = true; } });
console.log('Mesh 數', meshCount, '｜動畫：', gltf.animations.map((a) => a.name).join(', '));

const mixer = new THREE.AnimationMixer(model);
const actions = Object.fromEntries(gltf.animations.map((clip) => [clip.name, mixer.clipAction(clip)]));
let current = actions.Walk || Object.values(actions)[0];
current.play();

const p = { action: current.getClip().name };
new GUI().add(p, 'action', Object.keys(actions)).onChange((name) => {
  const next = actions[name];
  next.reset().play();
  current.crossFadeTo(next, 0.4, false);   // 平滑切換動作
  current = next;
});
onFrame((t, dt) => mixer.update(dt));
`
  }],
  methods: [
    ['.load( url, onLoad, onProgress, onError ) : undefined', '載入，onLoad 收到 gltf 物件：<code>{ scene, scenes, animations, cameras, asset, parser, userData }</code>。'],
    ['.loadAsync( url, onProgress ) : Promise', 'Promise 版本。'],
    ['.parse( data, path, onLoad, onError ) : undefined', '解析已在記憶體中的 glTF（JSON 字串或 ArrayBuffer）。'],
    ['.setDRACOLoader( dracoLoader : DRACOLoader ) : this', '設定 Draco 解碼器。'],
    ['.setKTX2Loader( ktx2Loader : KTX2Loader ) : this', '設定 KTX2 貼圖解碼器。'],
    ['.setMeshoptDecoder( decoder ) : this', '設定 meshopt 解碼器。'],
    ['.register( callback ) : this', '註冊自訂擴充（plugin）。'],
  ],
},
]},

{ group: '動畫 Animation', section: 'api', items: [
{
  id: 'api-animationmixer', title: 'AnimationMixer', api: true, inherits: ['EventDispatcher'], src: 'animation/AnimationMixer.js',
  desc: '<p>場景中特定物件的動畫播放器。每個需要動畫的根物件各建立一個 mixer，透過 <code>clipAction()</code> 取得 <a href="#/api-animationaction">AnimationAction</a> 控制播放，並在每幀呼叫 <code>mixer.update(delta)</code>。</p>',
  ctor: { sig: 'new AnimationMixer( rootObject : Object3D )', params: [['rootObject', 'Object3D', '動畫作用的根物件，track 名稱會從這裡開始解析。']] },
  examples: [{
    title: 'finished / loop 事件',
    desc: '一個動作設定為只播放一次（LoopOnce）並停在最後一格；另一個重複 3 次。console 顯示 mixer 發出的事件。',
    code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ grid: true, cameraPosition: [0, 3, 7] });

const a = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), new THREE.MeshStandardMaterial({ color: 0xef5350 }));
a.name = 'A'; a.position.x = -1.5;
const b = new THREE.Mesh(new THREE.SphereGeometry(0.45), new THREE.MeshStandardMaterial({ color: 0x42a5f5 }));
b.name = 'B'; b.position.x = 1.5;
scene.add(a, b);

const jump = (name) => new THREE.AnimationClip(name + '-jump', 1, [
  new THREE.NumberKeyframeTrack(name + '.position[y]', [0, 0.5, 1], [0.4, 2, 0.4]),
]);
const mixer = new THREE.AnimationMixer(scene);
const actA = mixer.clipAction(jump('A'));
actA.setLoop(THREE.LoopOnce);
actA.clampWhenFinished = true;
const actB = mixer.clipAction(jump('B'));
actB.setLoop(THREE.LoopRepeat, 3);

mixer.addEventListener('loop', (e) => console.log('loop：', e.action.getClip().name, '第', e.loopDelta, '次循環事件'));
mixer.addEventListener('finished', (e) => console.log('finished：', e.action.getClip().name));
actA.play();
actB.play();

const btn = document.createElement('button');
btn.textContent = '重新播放';
btn.style.cssText = 'position:absolute;top:10px;left:10px';
btn.onclick = () => { actA.reset().play(); actB.reset().play(); };
document.body.appendChild(btn);
onFrame((t, dt) => mixer.update(dt));
`
  }],
  props: [
    ['.time : Number', '全域 mixer 時間（秒），呼叫 update 時累加。'],
    ['.timeScale : Number', '全域時間縮放：0 暫停所有動作，負數倒放。'],
  ],
  methods: [
    ['.clipAction( clip : AnimationClip, optionalRoot : Object3D, blendMode ) : AnimationAction', '取得（若無則建立）該 clip 的 AnimationAction。同一個 clip 多次呼叫會回傳同一個 action。'],
    ['.existingAction( clip, optionalRoot ) : AnimationAction', '只取得既有的 action，不建立。'],
    ['.update( deltaTimeInSeconds : Number ) : AnimationMixer', '推進時間並更新所有動作。'],
    ['.setTime( timeInSeconds : Number ) : AnimationMixer', '把全域時間設到某一點並更新。'],
    ['.stopAllAction() : AnimationMixer', '停止所有動作。'],
    ['.getRoot() : Object3D', '取得根物件。'],
    ['.uncacheClip( clip ) / .uncacheRoot( root ) / .uncacheAction( clip, root )', '釋放快取，避免記憶體洩漏。'],
    ['.addEventListener( type, listener )', '事件：<code>finished</code>（非循環動作結束）、<code>loop</code>（每次循環）。'],
  ],
},
{
  id: 'api-animationclip', title: 'AnimationClip', api: true, src: 'animation/AnimationClip.js',
  desc: '<p>一段可重複使用的動畫資料，由多條 <a href="#/api-keyframetrack">KeyframeTrack</a> 組成。例如角色的「走路」、「跑步」各是一個 clip。</p>',
  ctor: { sig: 'new AnimationClip( name : String, duration : Number, tracks : Array, blendMode : Number )', params: [
    ['name', 'String', '名稱。'], ['duration', 'Number', '長度（秒）。-1（預設）表示依 tracks 自動計算。'],
    ['tracks', 'Array', 'KeyframeTrack 陣列。'], ['blendMode', 'Number', '<code>NormalAnimationBlendMode</code>（預設）或 <code>AdditiveAnimationBlendMode</code>。'],
  ]},
  examples: [{
    title: '建立、查找與修剪 clip', consoleOnly: true,
    code: code`
import * as THREE from 'three';

const clip = new THREE.AnimationClip('bounce', -1, [
  new THREE.VectorKeyframeTrack('.position', [0, 1, 2], [0, 0, 0, 0, 2, 0, 0, 0, 0]),
  new THREE.NumberKeyframeTrack('.material.opacity', [0, 3], [1, 0]),
]);
console.log('name', clip.name, '｜duration（自動計算）', clip.duration, '｜tracks', clip.tracks.length);

clip.duration = 2;
clip.trim();   // 把超出 duration 的關鍵影格裁掉
console.log('trim 後 opacity track 的 times =', Array.from(clip.tracks[1].times));

console.log('validate() =', clip.validate());
const found = THREE.AnimationClip.findByName([clip], 'bounce');
console.log('findByName 找到', found.name);

const json = THREE.AnimationClip.toJSON(clip);
console.log('toJSON →', JSON.stringify(json).slice(0, 120) + '…');
const restored = THREE.AnimationClip.parse(json);
console.log('parse 還原，tracks', restored.tracks.map((t) => t.name).join(', '));
`
  }],
  props: [
    ['.name : String', '名稱。'],
    ['.duration : Number', '長度（秒）。'],
    ['.tracks : Array', 'KeyframeTrack 陣列。'],
    ['.blendMode : Number', '混合模式。'],
    ['.uuid : String', '唯一識別碼。'],
  ],
  methods: [
    ['.clone() : AnimationClip', '複製。'],
    ['.optimize() : this', '移除每條 track 中多餘的連續相同關鍵影格。'],
    ['.resetDuration() : this', '依 tracks 重新計算 duration。'],
    ['.trim() : this', '把所有 track 裁切到 duration 範圍內。'],
    ['.validate() : Boolean', '檢查資料是否有效。'],
  ],
  statics: [
    ['.findByName( objectOrClipArray, name : String ) : AnimationClip', '依名稱在陣列（或物件的 animations）中查找 clip。'],
    ['.CreateFromMorphTargetSequence( name, morphTargets, fps, noLoop ) : AnimationClip', '由變形目標序列產生 clip。'],
    ['.parse( json : Object ) : AnimationClip', '由 JSON 建立。'],
    ['.toJSON( clip : AnimationClip ) : Object', '轉為 JSON。'],
  ],
},
{
  id: 'api-animationaction', title: 'AnimationAction', api: true, src: 'animation/AnimationAction.js',
  desc: '<p>控制一個 clip 在某個 mixer 上的播放狀態：播放、暫停、速度、循環方式、權重與淡入淡出。請用 <code>mixer.clipAction(clip)</code> 取得，不要直接 new。多數方法回傳 this，可以鏈式呼叫，例如 <code>action.reset().setEffectiveWeight(1).fadeIn(0.5).play()</code>。</p>',
  ctor: { sig: 'new AnimationAction( mixer : AnimationMixer, clip : AnimationClip, localRoot : Object3D, blendMode )', desc: '請使用 mixer.clipAction() 取得。' },
  examples: [{
    title: '權重混合與時間控制',
    desc: '兩個動作（左右擺動、上下彈跳）同時播放，用權重混合；也可以調整 timeScale、暫停、或直接拖曳 time。',
    code: code`
import * as THREE from 'three';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ grid: true, cameraPosition: [0, 3, 7] });

const ball = new THREE.Mesh(new THREE.SphereGeometry(0.4, 32, 16), new THREE.MeshStandardMaterial({ color: 0xffb300 }));
scene.add(ball);
const mixer = new THREE.AnimationMixer(ball);
const sway = mixer.clipAction(new THREE.AnimationClip('sway', 2, [
  new THREE.VectorKeyframeTrack('.position', [0, 1, 2], [-2, 0.4, 0, 2, 0.4, 0, -2, 0.4, 0]),
]));
const bounce = mixer.clipAction(new THREE.AnimationClip('bounce', 0.8, [
  new THREE.VectorKeyframeTrack('.position', [0, 0.4, 0.8], [0, 0.4, 0, 0, 2.2, 0, 0, 0.4, 0]),
]));
sway.play();
bounce.play();
sway.setEffectiveWeight(1);
bounce.setEffectiveWeight(0);

const p = { mix: 0 };
const gui = new GUI();
gui.add(p, 'mix', 0, 1, 0.01).name('sway ↔ bounce').onChange((v) => {
  sway.setEffectiveWeight(1 - v);
  bounce.setEffectiveWeight(v);
});
gui.add(sway, 'timeScale', -2, 3, 0.01).name('sway.timeScale');
gui.add(sway, 'paused').name('sway.paused');
gui.add(sway, 'time', 0, 2, 0.01).name('sway.time').listen();
gui.add({ fade: () => { bounce.fadeIn(1); sway.fadeOut(1); console.log('淡入 bounce，淡出 sway'); } }, 'fade').name('fadeIn / fadeOut');
gui.add({ reset: () => { sway.reset().fadeIn(0.5); bounce.setEffectiveWeight(0); } }, 'reset').name('重設');
onFrame((t, dt) => mixer.update(dt));
`
  }],
  props: [
    ['.time : Number', '此動作的區域時間（秒）。'],
    ['.timeScale : Number', '速度倍率，負數倒放，0 等同暫停。'],
    ['.weight : Number', '權重 0–1（混合多個動作時使用）。'],
    ['.enabled : Boolean', '設為 false 停用此動作（但保留狀態）。'],
    ['.paused : Boolean', '暫停。'],
    ['.loop : Number', '<code>LoopRepeat</code>（預設）、<code>LoopOnce</code>、<code>LoopPingPong</code>。'],
    ['.repetitions : Number', '循環次數，預設 Infinity。'],
    ['.clampWhenFinished : Boolean', '結束時停在最後一格（而不是回到第一格），預設 false。'],
    ['.zeroSlopeAtStart / .zeroSlopeAtEnd : Boolean', '插值在起點 / 終點是否平滑。'],
  ],
  methods: [
    ['.play() : this', '開始播放（加入 mixer 的活動列表）。'],
    ['.stop() : this', '停止並重設。'],
    ['.reset() : this', '重設時間、循環計數與停用狀態。'],
    ['.isRunning() : Boolean', '是否正在播放。'],
    ['.isScheduled() : Boolean', '是否已在 mixer 中啟用。'],
    ['.setLoop( loopMode : Number, repetitions : Number ) : this', '設定循環方式與次數。'],
    ['.setEffectiveWeight( weight : Number ) : this', '設定權重並啟用。'],
    ['.getEffectiveWeight() : Number', '取得目前實際權重（含淡入淡出）。'],
    ['.setEffectiveTimeScale( timeScale : Number ) : this', '設定速度。'],
    ['.setDuration( durationInSeconds : Number ) : this', '設定一次循環的時長（自動換算 timeScale）。'],
    ['.fadeIn( durationInSeconds ) : this', '權重從 0 漸增到 1。'],
    ['.fadeOut( durationInSeconds ) : this', '權重從 1 漸減到 0。'],
    ['.crossFadeTo( fadeInAction, durationInSeconds, warp : Boolean ) : this', '從本動作淡出、同時讓另一個動作淡入，warp 為 true 時會同步調整速度。'],
    ['.crossFadeFrom( fadeOutAction, durationInSeconds, warp ) : this', '反向的 crossFade。'],
    ['.syncWith( otherAction ) : this', '與另一個動作同步時間與速度。'],
    ['.halt( durationInSeconds ) : this', '在指定時間內減速至停止。'],
    ['.warp( startTimeScale, endTimeScale, durationInSeconds ) : this', '在指定時間內改變速度。'],
    ['.startAt( startTimeInSeconds ) : this', '延遲到 mixer 時間到達此值才開始。'],
    ['.getMixer() / .getClip() / .getRoot()', '取得 mixer、clip、根物件。'],
  ],
},
{
  id: 'api-keyframetrack', title: 'KeyframeTrack', api: true, src: 'animation/KeyframeTrack.js',
  desc: '<p>一條關鍵影格序列：某個屬性在哪些時間點（times）應該是什麼值（values）。請使用以下子類別：</p><table><tr><th>類別</th><th>用途</th><th>每個關鍵影格的值數量</th></tr><tr><td><code>NumberKeyframeTrack</code></td><td>數值（opacity、某一分量）</td><td>1</td></tr><tr><td><code>VectorKeyframeTrack</code></td><td>position、scale</td><td>2–4</td></tr><tr><td><code>QuaternionKeyframeTrack</code></td><td>quaternion（球面插值）</td><td>4</td></tr><tr><td><code>ColorKeyframeTrack</code></td><td>material.color</td><td>3</td></tr><tr><td><code>BooleanKeyframeTrack</code></td><td>visible 等布林值（無插值）</td><td>1</td></tr><tr><td><code>StringKeyframeTrack</code></td><td>字串（無插值）</td><td>1</td></tr></table><p><b>名稱語法</b>（由 PropertyBinding 解析）：<code>"物件名稱.屬性"</code>、<code>".position"</code>（作用於根物件）、<code>"box.material.color"</code>、<code>"box.position[x]"</code>、<code>"mesh.morphTargetInfluences[smile]"</code>。</p>',
  ctor: { sig: 'new NumberKeyframeTrack( name : String, times : Array, values : Array, interpolation : Constant )', params: [
    ['name', 'String', '目標屬性路徑。'], ['times', 'Array', '時間點（秒），遞增排列。'],
    ['values', 'Array', '扁平化的值陣列，長度 = times.length × 每格值數量。'],
    ['interpolation', 'Constant', '<code>InterpolateLinear</code>（預設）、<code>InterpolateSmooth</code>、<code>InterpolateDiscrete</code>。'],
  ]},
  examples: [{
    title: '三種插值方式',
    desc: '同樣的關鍵影格，分別以 Discrete（跳格）、Linear（線性）、Smooth（平滑）插值。',
    code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ grid: true, cameraPosition: [0, 4, 8], target: [0, 1, 0] });

const modes = [['Discrete', THREE.InterpolateDiscrete, 0xef5350], ['Linear', THREE.InterpolateLinear, 0x66bb6a], ['Smooth', THREE.InterpolateSmooth, 0x42a5f5]];
const times = [0, 1, 2, 3, 4];
const ys = [0.3, 2.5, 0.8, 2, 0.3];
const mixers = modes.map(([name, interp, color], i) => {
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.3), new THREE.MeshStandardMaterial({ color }));
  m.position.x = (i - 1) * 2;
  scene.add(m);
  const track = new THREE.NumberKeyframeTrack('.position[y]', times, ys, interp);
  const mixer = new THREE.AnimationMixer(m);
  mixer.clipAction(new THREE.AnimationClip(name, -1, [track])).play();
  // 標出關鍵影格位置
  ys.forEach((y) => {
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.05), new THREE.MeshBasicMaterial({ color }));
    dot.position.set(m.position.x + 0.5, y, 0);
    scene.add(dot);
  });
  return mixer;
});
console.log('紅：Discrete｜綠：Linear｜藍：Smooth');
onFrame((t, dt) => mixers.forEach((mx) => mx.update(dt)));
`
  }],
  props: [
    ['.name : String', '屬性路徑。'],
    ['.times : Float32Array', '時間點。'],
    ['.values : Float32Array', '值。'],
    ['.ValueTypeName : String', '值型別（"number"、"vector"、"quaternion"…）。'],
  ],
  methods: [
    ['.getValueSize() : Number', '每個關鍵影格的值數量。'],
    ['.setInterpolation( interpolation ) : this', '設定插值方式。'],
    ['.getInterpolation() : Constant', '取得插值方式。'],
    ['.shift( timeOffsetInSeconds ) : this', '整體平移時間。'],
    ['.scale( timeScale ) : this', '整體縮放時間。'],
    ['.trim( startTime, endTime ) : this', '裁切到時間範圍。'],
    ['.optimize() : this', '移除多餘關鍵影格。'],
    ['.validate() : Boolean', '檢查資料。'],
    ['.clone() : KeyframeTrack', '複製。'],
  ],
},
]}
);
})();
