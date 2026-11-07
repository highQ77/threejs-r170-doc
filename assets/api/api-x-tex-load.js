/* API 參考（補充）：貼圖、渲染目標、著色器庫、WebXR、載入器 */
(function () {
var code = String.raw;
function add(name, items) {
  var g = window.DOCS.find(function (x) { return x.group === name; });
  if (!g) { g = { group: name, section: 'api', items: [] }; window.DOCS.push(g); }
  g.items.push.apply(g.items, items);
}
var TB = ['EventDispatcher', 'Texture'];

/* ================= 貼圖 ================= */
add('貼圖 Textures', [
{
  id: 'api-depthtexture', title: 'DepthTexture', api: true, inherits: TB, src: 'textures/DepthTexture.js',
  desc: '<p>儲存深度資訊的貼圖。設定為 render target 的 <code>depthTexture</code> 後，渲染時深度值會寫入其中，之後可以在著色器中讀取，用於 SSAO、景深、軟粒子、輪廓偵測等效果。</p>',
  ctor: { sig: 'new DepthTexture( width, height, type, mapping, wrapS, wrapT, magFilter, minFilter, anisotropy, format )', params: [['type', 'Constant', '預設 UnsignedIntType。'], ['format', 'Constant', 'DepthFormat（預設）或 DepthStencilFormat。']] },
  examples: [{ title: '讀取深度並視覺化', desc: '先把場景渲染到含深度貼圖的 render target，再用全螢幕著色器把深度轉為灰階（越近越亮）。', code: code`
import * as THREE from 'three';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const stage = createStage({ cameraPosition: [0, 3, 8], near: 1, far: 20 });
const { scene, camera, renderer } = stage;
for (let i = 0; i < 40; i++) {
  const m = new THREE.Mesh(new THREE.TorusKnotGeometry(0.3, 0.1, 64, 8), new THREE.MeshStandardMaterial({ color: 0x90caf9 }));
  m.position.set((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 3, -Math.random() * 10 + 2);
  scene.add(m);
}
const size = renderer.getDrawingBufferSize(new THREE.Vector2());
const rt = new THREE.WebGLRenderTarget(size.x, size.y, { depthTexture: new THREE.DepthTexture(size.x, size.y) });

const post = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
  uniforms: { tColor: { value: rt.texture }, tDepth: { value: rt.depthTexture }, near: { value: camera.near }, far: { value: camera.far }, mixAmt: { value: 1 } },
  vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 1.0); }',
  fragmentShader: [
    '#include <packing>',
    'uniform sampler2D tColor; uniform sampler2D tDepth; uniform float near; uniform float far; uniform float mixAmt; varying vec2 vUv;',
    'void main() {',
    '  float viewZ = perspectiveDepthToViewZ(texture2D(tDepth, vUv).x, near, far);',
    '  float d = 1.0 - viewZToOrthographicDepth(viewZ, near, far);',
    '  gl_FragColor = vec4(mix(texture2D(tColor, vUv).rgb, vec3(d), mixAmt), 1.0);',
    '}',
  ].join('\n'),
}));
const postScene = new THREE.Scene();
postScene.add(post);
const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
new GUI().add(post.material.uniforms.mixAmt, 'value', 0, 1, 0.01).name('彩色 ↔ 深度');
stage.render = () => {
  renderer.setRenderTarget(rt);
  renderer.render(scene, camera);
  renderer.setRenderTarget(null);
  renderer.render(postScene, postCam);
};
stage.onResize(() => { const s = renderer.getDrawingBufferSize(new THREE.Vector2()); rt.setSize(s.x, s.y); });
console.log('depthTexture format =', rt.depthTexture.format === THREE.DepthFormat ? 'DepthFormat' : rt.depthTexture.format);
` }],
  props: [['.format : Constant', 'DepthFormat 或 DepthStencilFormat。'], ['.type : Constant', 'UnsignedShortType、UnsignedIntType、FloatType 或 UnsignedInt248Type（深度模板）。'], ['.compareFunction : Constant', '設定後可作為 sampler2DShadow 進行硬體深度比較。'], ['.flipY / .generateMipmaps', '固定為 false。']],
},
{
  id: 'api-framebuffertexture', title: 'FramebufferTexture', api: true, inherits: TB, src: 'textures/FramebufferTexture.js',
  desc: '<p>用來接收「目前畫面內容」的貼圖：以 <code>renderer.copyFramebufferToTexture(texture, position)</code> 把畫面的一部分複製進來，例如做放大鏡、畫中畫、殘影效果。</p>',
  ctor: { sig: 'new FramebufferTexture( width : Number, height : Number )' },
  examples: [{ title: '放大鏡', desc: '每幀把滑鼠位置附近的畫面複製到貼圖，再顯示在左上角的 Sprite 上。', code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const stage = createStage({ cameraPosition: [0, 0, 6], lights: true });
const { scene, camera, renderer } = stage;
for (let i = 0; i < 30; i++) {
  const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.4, 0), new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(i / 30, 0.7, 0.55), flatShading: true }));
  m.position.set((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 2);
  scene.add(m);
}
const size = 64 * Math.round(devicePixelRatio);
const tex = new THREE.FramebufferTexture(size, size);
const hud = new THREE.Scene();
const hudCam = new THREE.OrthographicCamera(0, innerWidth, innerHeight, 0, -1, 1);
const lens = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex }));
lens.scale.set(180, 180, 1);
lens.position.set(110, innerHeight - 110, 0);
hud.add(lens);
const mouse = new THREE.Vector2(innerWidth / 2, innerHeight / 2);
addEventListener('pointermove', (e) => mouse.set(e.clientX, innerHeight - e.clientY));
const pos = new THREE.Vector2();
stage.render = () => {
  renderer.autoClear = true;
  renderer.render(scene, camera);
  pos.set(mouse.x * devicePixelRatio - size / 2, mouse.y * devicePixelRatio - size / 2).floor();
  renderer.copyFramebufferToTexture(tex, pos);   // 複製畫面到貼圖
  renderer.autoClear = false;
  renderer.render(hud, hudCam);
};
console.log('移動滑鼠，左上角顯示放大畫面');
` }],
  props: [['.isFramebufferTexture : Boolean', '型別檢查旗標。'], ['.generateMipmaps / .magFilter / .minFilter', '預設不產生 mipmap，使用 NearestFilter。']],
},
{
  id: 'api-data3dtexture', title: 'Data3DTexture', api: true, inherits: TB, src: 'textures/Data3DTexture.js',
  desc: '<p>三維貼圖（體積貼圖），在著色器中以 <code>sampler3D</code> 與 <code>texture(tex, vec3)</code> 取樣。用於體積渲染（醫學影像、雲、煙）、3D 雜訊、3D LUT 調色。</p>',
  ctor: { sig: 'new Data3DTexture( data : TypedArray, width : Number, height : Number, depth : Number )' },
  examples: [{ title: '在立方體內切片顯示 3D 貼圖', desc: '產生 32³ 的球形雜訊體積，以一個會移動的切面顯示其內容。', code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [2, 1.5, 2.5], lights: false });
const N = 32, data = new Uint8Array(N * N * N);
for (let z = 0; z < N; z++) for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
  const dx = x / N - 0.5, dy = y / N - 0.5, dz = z / N - 0.5;
  const r = Math.sqrt(dx * dx + dy * dy + dz * dz);
  data[x + y * N + z * N * N] = 255 * Math.max(0, Math.sin(r * 30) * (0.5 - r) * 2);
}
const tex = new THREE.Data3DTexture(data, N, N, N);
tex.format = THREE.RedFormat;
tex.minFilter = tex.magFilter = THREE.LinearFilter;
tex.needsUpdate = true;

const slice = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({
  glslVersion: THREE.GLSL3,
  side: THREE.DoubleSide,
  uniforms: { tVol: { value: tex }, uZ: { value: 0.5 } },
  vertexShader: 'out vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: 'precision highp sampler3D; uniform sampler3D tVol; uniform float uZ; in vec2 vUv; out vec4 color; void main() { float v = texture(tVol, vec3(vUv, uZ)).r; color = vec4(v * vec3(1.0, 0.6, 0.2), 1.0); }',
}));
scene.add(slice, new THREE.Box3Helper(new THREE.Box3(new THREE.Vector3(-0.5, -0.5, -0.5), new THREE.Vector3(0.5, 0.5, 0.5)), 0x888888));
console.log('Data3DTexture', tex.image.width + '×' + tex.image.height + '×' + tex.image.depth);
onFrame((t) => {
  const z = 0.5 + Math.sin(t) * 0.45;
  slice.material.uniforms.uZ.value = z;
  slice.position.z = z - 0.5;
});
` }],
  props: [['.image : Object', '<code>{ data, width, height, depth }</code>。'], ['.wrapR : Constant', '第三軸的包覆方式。'], ['.flipY / .generateMipmaps', '預設 false。'], ['.unpackAlignment', '預設 1。']],
  methods: [['.addLayerUpdate( layerIndex ) / .clearLayerUpdates()', '（DataArrayTexture）只更新部分層。']],
},
{
  id: 'api-dataarraytexture', title: 'DataArrayTexture', api: true, inherits: TB, src: 'textures/DataArrayTexture.js',
  desc: '<p>貼圖陣列：多張相同尺寸的 2D 圖層存在同一個貼圖中，著色器以 <code>sampler2DArray</code> 與 <code>texture(tex, vec3(uv, layer))</code> 取樣。適合大量不同圖案的實例（例如每個 InstancedMesh 實例使用不同圖層）、地形材質陣列、精靈圖動畫。</p>',
  ctor: { sig: 'new DataArrayTexture( data : TypedArray, width : Number, height : Number, depth : Number )', params: [['depth', 'Number', '圖層數。']] },
  examples: [{ title: '6 個圖層的貼圖陣列', code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 0, 6], lights: false });
const W = 64, H = 64, L = 6;
const c = document.createElement('canvas'); c.width = W; c.height = H;
const ctx = c.getContext('2d', { willReadFrequently: true });
const data = new Uint8Array(W * H * 4 * L);
for (let i = 0; i < L; i++) {
  ctx.fillStyle = 'hsl(' + (i * 60) + ',70%,45%)'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 44px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(String(i), 32, 48);
  data.set(ctx.getImageData(0, 0, W, H).data, i * W * H * 4);
}
const tex = new THREE.DataArrayTexture(data, W, H, L);
tex.colorSpace = THREE.SRGBColorSpace;
tex.needsUpdate = true;

const mat = (layer) => new THREE.ShaderMaterial({
  glslVersion: THREE.GLSL3,
  uniforms: { tArr: { value: tex }, layer: { value: layer } },
  vertexShader: 'out vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: 'precision highp sampler2DArray; uniform sampler2DArray tArr; uniform float layer; in vec2 vUv; out vec4 color; void main() { color = texture(tArr, vec3(vUv, layer)); }',
});
const tiles = [];
for (let i = 0; i < L; i++) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.2), mat(i));
  m.position.set((i % 3 - 1) * 1.5, i < 3 ? 0.8 : -0.8, 0);
  scene.add(m);
  tiles.push(m);
}
console.log('一張貼圖、', L, '個圖層');
onFrame((t) => tiles.forEach((m, i) => { m.material.uniforms.layer.value = (i + Math.floor(t)) % L; }));
` }],
  props: [['.image : Object', '<code>{ data, width, height, depth }</code>。'], ['.layerUpdates : Set', '待更新的圖層。'], ['.wrapR : Constant', '第三軸包覆。']],
  methods: [['.addLayerUpdate( layerIndex ) : undefined', '只重新上傳指定圖層（需再設 needsUpdate）。'], ['.clearLayerUpdates() : undefined', '清除。']],
},
{
  id: 'api-compressedtexture', title: 'CompressedTexture', api: true, inherits: TB, src: 'textures/CompressedTexture.js',
  desc: '<p>GPU 壓縮格式（DXT/S3TC、ETC、ASTC、BC7、PVRTC…）的貼圖。壓縮貼圖在 GPU 上保持壓縮狀態，可大幅節省顯示記憶體與頻寬。通常由 <code>KTX2Loader</code>、<code>DDSLoader</code>、<code>KTXLoader</code> 等載入器建立，不需要手動建立。</p><p>注意：不同 GPU 支援的格式不同；KTX2（Basis Universal）會在執行時轉碼成目前裝置支援的格式，是最推薦的方案。</p>',
  ctor: { sig: 'new CompressedTexture( mipmaps : Array, width, height, format, type, mapping, wrapS, wrapT, magFilter, minFilter, anisotropy, colorSpace )', params: [['mipmaps', 'Array', '<code>{ data, width, height }</code> 陣列，每個 mip 層一筆。']] },
  examples: [{ title: '載入 DDS 壓縮貼圖', code: code`
import * as THREE from 'three';
import { DDSLoader } from 'three/addons/loaders/DDSLoader.js';
import { createStage } from 'doc-stage';
const { scene, renderer, onFrame } = createStage({ cameraPosition: [0, 0, 3] });
const ext = renderer.extensions.has('WEBGL_compressed_texture_s3tc');
console.log('此裝置支援 S3TC（DXT）？', ext);
const tex = await new DDSLoader().loadAsync('https://threejs.org/examples/textures/compressed/explosion_dxt5_mip.dds');
tex.colorSpace = THREE.SRGBColorSpace;
console.log(tex.constructor.name, tex.image.width + 'x' + tex.image.height, '｜mipmap 層數', tex.mipmaps.length, '｜isCompressedTexture', tex.isCompressedTexture);
const box = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), new THREE.MeshBasicMaterial({ map: tex }));
scene.add(box);
onFrame((t) => box.rotation.set(t * 0.4, t * 0.6, 0));
` }],
  props: [['.mipmaps : Array', '各 mip 層資料。'], ['.flipY : Boolean', '固定 false（壓縮貼圖無法翻轉）。'], ['.generateMipmaps : Boolean', '固定 false（必須預先提供）。']],
},
{
  id: 'api-compressedarraytexture', title: 'CompressedArrayTexture', api: true, inherits: TB.concat('CompressedTexture'), src: 'textures/CompressedArrayTexture.js',
  desc: '<p>壓縮格式的貼圖陣列（<a href="#/api-dataarraytexture">DataArrayTexture</a> 的壓縮版），著色器以 sampler2DArray 取樣。通常由 KTX2Loader 載入含多層的 .ktx2 檔案建立。</p>',
  ctor: { sig: 'new CompressedArrayTexture( mipmaps : Array, width : Number, height : Number, depth : Number, format : Constant, type : Constant )' },
  props: [['.image.depth : Number', '圖層數。'], ['.wrapR : Constant', '第三軸包覆。'], ['.layerUpdates : Set', '待更新圖層。']],
  methods: [['.addLayerUpdate( layerIndex ) / .clearLayerUpdates()', '部分更新。']],
},
{
  id: 'api-source', title: 'Source', api: true, src: 'textures/Source.js',
  desc: '<p>貼圖的「資料來源」（影像或像素資料）。多個 Texture 可以共用同一個 Source：例如同一張圖以不同的 repeat / offset 用在不同物件上時，影像只會上傳到 GPU 一次。<code>texture.clone()</code> 產生的新貼圖就是共用 source。</p>',
  ctor: { sig: 'new Source( data : Any )' },
  examples: [{ title: '共用 Source', consoleOnly: true, code: code`
import * as THREE from 'three';
const c = document.createElement('canvas'); c.width = c.height = 4;
const a = new THREE.CanvasTexture(c);
const b = a.clone();
b.repeat.set(4, 4);
console.log('clone 共用 source？', a.source === b.source, '｜uuid', a.source.uuid.slice(0, 8));
console.log('repeat 各自獨立：', a.repeat, b.repeat);
const s = new THREE.Source(c);
const t = new THREE.Texture();
t.source = s;
console.log('手動指定 source：t.image === canvas？', t.image === c);
` }],
  props: [['.data : Any', '影像或像素資料（texture.image 即為 source.data）。'], ['.dataReady : Boolean', '資料是否已就緒。'], ['.needsUpdate : Boolean', '設為 true 重新上傳。'], ['.uuid / .version', '識別與版本。']],
  methods: [['.toJSON( meta ) : Object', '序列化。'], ['.getSize( target ) : Vector3', '取得尺寸。']],
},
]);

/* ================= 渲染目標 ================= */
add('渲染器 Renderers', [
{
  id: 'api-webglcuberendertarget', title: 'WebGLCubeRenderTarget', api: true, inherits: ['EventDispatcher', 'RenderTarget', 'WebGLRenderTarget'], src: 'renderers/WebGLCubeRenderTarget.js',
  desc: '<p>立方體渲染目標（6 個面），由 <a href="#/api-cubecamera">CubeCamera</a> 使用。也可以用 <code>fromEquirectangularTexture()</code> 把全景圖轉為立方體貼圖。</p>',
  ctor: { sig: 'new WebGLCubeRenderTarget( size : Number, options : Object )', params: [['size', 'Number', '每個面的邊長（像素）。'], ['options', 'Object', '同 WebGLRenderTarget。']] },
  examples: [{ title: '全景圖 → 立方體貼圖', code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, renderer } = createStage({ cameraPosition: [0, 0, 0.1], lights: false });
const tex = await new THREE.TextureLoader().loadAsync('https://threejs.org/examples/textures/2294472375_24a3b8ef46_o.jpg');
tex.colorSpace = THREE.SRGBColorSpace;
const cubeRT = new THREE.WebGLCubeRenderTarget(512).fromEquirectangularTexture(renderer, tex);
scene.background = cubeRT.texture;
console.log('全景圖', tex.image.width + 'x' + tex.image.height, '→ 立方體每面', cubeRT.width + 'x' + cubeRT.height);
console.log('拖曳畫面環顧四周');
` }],
  props: [['.texture : CubeTexture', '結果的立方體貼圖。']],
  methods: [['.fromEquirectangularTexture( renderer, texture ) : this', '把等距柱狀全景圖轉為立方體貼圖。'], ['.clear( renderer, color, depth, stencil ) : undefined', '清除 6 個面。']],
},
{
  id: 'api-webgl3drendertarget', title: 'WebGL3DRenderTarget', api: true, inherits: ['EventDispatcher', 'RenderTarget', 'WebGLRenderTarget'], src: 'renderers/WebGL3DRenderTarget.js',
  desc: '<p>以 <a href="#/api-data3dtexture">Data3DTexture</a> 為目標的渲染目標，可以逐層（<code>renderer.setRenderTarget(rt, layer)</code>）渲染到 3D 貼圖的某一切片，用於 GPU 產生體積資料。</p>',
  ctor: { sig: 'new WebGL3DRenderTarget( width : Number, height : Number, depth : Number, options : Object )' },
  examples: [{ title: '建立與屬性', consoleOnly: true, code: code`
import * as THREE from 'three';
const rt = new THREE.WebGL3DRenderTarget(64, 64, 16);
console.log('尺寸', rt.width, rt.height, rt.depth, '｜texture 型別', rt.texture.constructor.name);
// 渲染到第 5 層：renderer.setRenderTarget(rt, 5); renderer.render(scene, camera);
` }],
  props: [['.depth : Number', '層數。'], ['.texture : Data3DTexture', '結果貼圖。']],
},
{
  id: 'api-webglarrayrendertarget', title: 'WebGLArrayRenderTarget', api: true, inherits: ['EventDispatcher', 'RenderTarget', 'WebGLRenderTarget'], src: 'renderers/WebGLArrayRenderTarget.js',
  desc: '<p>以 <a href="#/api-dataarraytexture">DataArrayTexture</a> 為目標的渲染目標，可以逐層渲染到貼圖陣列中（例如一次產生多個視角、多層陰影貼圖）。</p>',
  ctor: { sig: 'new WebGLArrayRenderTarget( width : Number, height : Number, depth : Number, options : Object )' },
  examples: [{ title: '建立與屬性', consoleOnly: true, code: code`
import * as THREE from 'three';
const rt = new THREE.WebGLArrayRenderTarget(256, 256, 4);
console.log('層數', rt.depth, '｜texture 型別', rt.texture.constructor.name);
// 依序渲染到各層：for (let i = 0; i < 4; i++) { renderer.setRenderTarget(rt, i); renderer.render(scenes[i], camera); }
` }],
  props: [['.depth : Number', '層數。'], ['.texture : DataArrayTexture', '結果貼圖。']],
},
]);

/* ================= 著色器庫 ================= */
add('著色器 Shaders', [
{
  id: 'api-shaderchunk', title: 'ShaderChunk', api: true, src: 'renderers/shaders/ShaderChunk.js',
  desc: '<p>three.js 內建著色器的程式碼片段集合（約 150 段）。內建材質的著色器由這些片段透過 <code>#include &lt;名稱&gt;</code> 組合而成。在 ShaderMaterial 中可以直接 include 它們重用光照、霧、色彩空間等邏輯；在 <code>onBeforeCompile</code> 中則可以替換特定片段。</p>',
  examples: [{ title: '瀏覽片段', consoleOnly: true, code: code`
import * as THREE from 'three';
const names = Object.keys(THREE.ShaderChunk);
console.log('片段數量', names.length);
console.log('部分名稱：', names.filter((n) => /fog|color|normal/.test(n)).slice(0, 12).join(', '));
console.log('--- fog_fragment ---\n' + THREE.ShaderChunk.fog_fragment);
console.log('--- begin_vertex ---\n' + THREE.ShaderChunk.begin_vertex);
` }],
  props: [['[name] : String', '每個屬性就是一段 GLSL 程式碼，例如 <code>common</code>、<code>begin_vertex</code>、<code>lights_fragment_begin</code>、<code>fog_fragment</code>、<code>colorspace_fragment</code>。']],
},
{
  id: 'api-shaderlib', title: 'ShaderLib', api: true, src: 'renderers/shaders/ShaderLib.js',
  desc: '<p>內建材質完整的著色器定義：每個項目包含 <code>uniforms</code>、<code>vertexShader</code>、<code>fragmentShader</code>。例如 <code>ShaderLib.phong</code> 就是 MeshPhongMaterial 使用的著色器。可以複製後修改，製作「與內建材質相容、可接收光照與陰影」的自訂材質。</p>',
  examples: [{ title: '以 ShaderLib.phong 為基礎的自訂材質', desc: '複製 Phong 著色器並在片段著色器末端加入條紋，仍可正常接收場景光照。', code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 1, 4] });
console.log('ShaderLib 項目：', Object.keys(THREE.ShaderLib).join(', '));

const phong = THREE.ShaderLib.phong;
const uniforms = THREE.UniformsUtils.merge([phong.uniforms, { uTime: { value: 0 } }]);
uniforms.diffuse.value.set(0x29b6f6);
uniforms.shininess.value = 80;
const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader: phong.vertexShader,
  fragmentShader: 'uniform float uTime;\n' + phong.fragmentShader.replace(
    '#include <dithering_fragment>',
    '#include <dithering_fragment>\n gl_FragColor.rgb *= 0.75 + 0.25 * step(0.5, fract(gl_FragCoord.y * 0.05 + uTime));'
  ),
  lights: true,   // 讓渲染器傳入光源 uniform
});
const mesh = new THREE.Mesh(new THREE.TorusKnotGeometry(0.8, 0.3, 160, 24), material);
scene.add(mesh);
onFrame((t) => { uniforms.uTime.value = t; mesh.rotation.y = t * 0.3; });
` }],
  props: [['.basic / .lambert / .phong / .standard / .physical / .toon / .matcap / .points / .dashed / .depth / .normal / .sprite / .background / .cube / .equirect / .distanceRGBA / .shadow', '各內建材質與內部用途的著色器定義 <code>{ uniforms, vertexShader, fragmentShader }</code>。']],
},
{
  id: 'api-uniformslib', title: 'UniformsLib', api: true, src: 'renderers/shaders/UniformsLib.js',
  desc: '<p>內建著色器共用的 uniform 群組定義（common、fog、lights、specularmap、envmap、normalmap、points、sprite…）。ShaderLib 的各個項目就是由這些群組合併而成。自訂 ShaderMaterial 若要支援霧或光照，可以合併對應的群組並設定 <code>fog: true</code> / <code>lights: true</code>。</p>',
  examples: [{ title: '支援場景霧的 ShaderMaterial', code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene } = createStage({ cameraPosition: [0, 1, 4], target: [0, 0, -8], lights: false, background: 0x9fb4c7 });
scene.fog = new THREE.Fog(0x9fb4c7, 2, 14);
console.log('UniformsLib 群組：', Object.keys(THREE.UniformsLib).join(', '));
console.log('fog 群組的 uniforms：', Object.keys(THREE.UniformsLib.fog).join(', '));

const material = new THREE.ShaderMaterial({
  uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uColor: { value: new THREE.Color(0xff7043) } }]),
  vertexShader: ['#include <fog_pars_vertex>', 'void main() {', '  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);', '  gl_Position = projectionMatrix * mvPosition;', '  #include <fog_vertex>', '}'].join('\n'),
  fragmentShader: ['uniform vec3 uColor;', '#include <fog_pars_fragment>', 'void main() {', '  gl_FragColor = vec4(uColor, 1.0);', '  #include <fog_fragment>', '}'].join('\n'),
  fog: true,
});
for (let i = 0; i < 12; i++) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), material);
  m.position.set(i % 2 ? 1 : -1, 0, -i * 1.4);
  scene.add(m);
}
` }],
  props: [['.common / .fog / .lights / .envmap / .normalmap / .bumpmap / .displacementmap / .emissivemap / .aomap / .lightmap / .specularmap / .points / .sprite …', '各 uniform 群組。']],
},
{
  id: 'api-uniformsutils', title: 'UniformsUtils', api: true, src: 'renderers/shaders/UniformsUtils.js',
  desc: '<p>操作 uniforms 物件的工具函式。最常用的是 <code>merge()</code>（合併多個 uniform 群組並深度複製）與 <code>clone()</code>。</p>',
  examples: [{ title: 'merge 與 clone', consoleOnly: true, code: code`
import * as THREE from 'three';
const a = { uColor: { value: new THREE.Color('red') } };
const b = { uTime: { value: 0 } };
const merged = THREE.UniformsUtils.merge([a, b]);
console.log('merge 結果的鍵：', Object.keys(merged).join(', '));
merged.uColor.value.set('blue');
console.log('merge 是深度複製：a.uColor 仍是', a.uColor.value);
const copy = THREE.UniformsUtils.clone(merged);
console.log('clone 後獨立？', copy.uColor.value !== merged.uColor.value);
` }],
  statics: [['.merge( uniforms : Array ) : Object', '合併多組 uniforms（深度複製）。'], ['.clone( uniforms : Object ) : Object', '深度複製 uniforms。'], ['.cloneUniformsGroups( groups ) : Array', '複製 UniformsGroup。']],
},
]);

/* ================= WebXR ================= */
add('WebXR', [{
  id: 'api-webxrmanager', title: 'WebXRManager', api: true, inherits: ['EventDispatcher'], src: 'renderers/webxr/WebXRManager.js',
  desc: '<p>WebGLRenderer 的 WebXR（VR / AR）介面，透過 <code>renderer.xr</code> 取得，不需要自行建立。啟用流程：</p><ol><li><code>renderer.xr.enabled = true</code></li><li>用附加模組 <code>VRButton</code> / <code>ARButton</code> 建立進入按鈕（或自行呼叫 <code>navigator.xr.requestSession()</code> 再 <code>renderer.xr.setSession()</code>）。</li><li>渲染迴圈必須使用 <code>renderer.setAnimationLoop()</code>。</li></ol><div class="note">WebXR 需要相容的裝置與 HTTPS，本文件的範例環境（沙箱 iframe）無法進入 XR 工作階段，因此範例只示範設定與屬性。</div><pre class="code"><code>import { VRButton } from \'three/addons/webxr/VRButton.js\';\nrenderer.xr.enabled = true;\ndocument.body.appendChild(VRButton.createButton(renderer));\nconst controller = renderer.xr.getController(0);\ncontroller.addEventListener(\'selectstart\', onSelect);\nscene.add(controller);\nrenderer.setAnimationLoop(render);</code></pre>',
  examples: [{ title: '檢查支援與設定', consoleOnly: true, code: code`
import * as THREE from 'three';
const renderer = new THREE.WebGLRenderer();
renderer.xr.enabled = true;
renderer.xr.setReferenceSpaceType('local-floor');
renderer.xr.setFramebufferScaleFactor(1.0);
console.log('xr.enabled =', renderer.xr.enabled, '｜isPresenting =', renderer.xr.isPresenting);
console.log('getController(0) →', renderer.xr.getController(0));
if (navigator.xr) {
  for (const mode of ['immersive-vr', 'immersive-ar']) {
    navigator.xr.isSessionSupported(mode).then((ok) => console.log(mode, '支援？', ok)).catch(() => console.log(mode, '無法查詢'));
  }
} else console.log('此瀏覽器沒有 navigator.xr');
` }],
  props: [['.enabled : Boolean', '是否啟用 XR。'], ['.isPresenting : Boolean', '是否正在 XR 工作階段中。'], ['.cameraAutoUpdate : Boolean', '是否自動更新 XR 相機。']],
  methods: [
    ['.getController( index ) : Group', '控制器的「射線空間」（位置與指向），可監聽 select / squeeze 事件。'], ['.getControllerGrip( index ) : Group', '控制器的「握把空間」，用於放置控制器模型。'],
    ['.getHand( index ) : Group', '手部追蹤的關節。'], ['.getCamera() : ArrayCamera', 'XR 相機（左右眼）。'], ['.getSession() : XRSession', '目前工作階段。'],
    ['.setSession( session ) : Promise', '開始工作階段。'], ['.setReferenceSpaceType( type ) : undefined', '"local"、"local-floor"、"bounded-floor"…'],
    ['.setFramebufferScaleFactor( value ) : undefined', '渲染解析度縮放。'], ['.setFoveation( value ) : undefined', '注視點渲染強度 0–1。'],
    ['.getReferenceSpace() / .setReferenceSpace( space )', '參考空間。'], ['.getEnvironmentBlendMode() : String', '"opaque"（VR）或 "additive" / "alpha-blend"（AR）。'],
  ],
}]);

/* ================= 載入器 ================= */
add('載入器 Loaders', [
{
  id: 'api-loader', title: 'Loader', api: true, src: 'loaders/Loader.js',
  desc: '<p>所有載入器的基底類別，提供共通的設定：路徑、跨域、HTTP 標頭、LoadingManager，以及 <code>loadAsync()</code> Promise 介面。撰寫自訂載入器時繼承它並實作 <code>load()</code>。</p>',
  ctor: { sig: 'new Loader( manager : LoadingManager )' },
  examples: [{ title: '自訂載入器', consoleOnly: true, code: code`
import * as THREE from 'three';
// 載入 CSV 並轉為點陣列的自訂載入器
class CSVPointsLoader extends THREE.Loader {
  load(url, onLoad, onProgress, onError) {
    const file = new THREE.FileLoader(this.manager);
    file.setPath(this.path);
    file.load(url, (text) => {
      const pts = text.trim().split('\n').map((l) => new THREE.Vector3(...l.split(',').map(Number)));
      onLoad(pts);
    }, onProgress, onError);
  }
}
const csv = 'data:text/plain,0,0,0%0A1,2,3%0A4,5,6';
const pts = await new CSVPointsLoader().loadAsync(csv);
console.log('載入', pts.length, '個點：', pts);
` }],
  props: [['.manager : LoadingManager', '載入管理器。'], ['.path : String', '基礎路徑。'], ['.resourcePath : String', '相依資源（貼圖等）的路徑。'], ['.crossOrigin : String', '預設 "anonymous"。'], ['.withCredentials : Boolean', '是否帶 cookie。'], ['.requestHeader : Object', 'HTTP 標頭。']],
  methods: [
    ['.load( url, onLoad, onProgress, onError ) : undefined', '（子類別實作）開始載入。'], ['.loadAsync( url, onProgress ) : Promise', 'Promise 版本。'], ['.parse( data ) : undefined', '（子類別實作）解析資料。'],
    ['.setPath / .setResourcePath / .setCrossOrigin / .setWithCredentials / .setRequestHeader : this', '設定。'],
  ],
  statics: [['DEFAULT_MATERIAL_NAME : String', '載入器建立預設材質時使用的名稱 "__DEFAULT"。']],
},
{
  id: 'api-fileloader', title: 'FileLoader', api: true, inherits: ['Loader'], src: 'loaders/FileLoader.js',
  desc: '<p>以 fetch 載入任意檔案，回傳文字、JSON、ArrayBuffer、Blob 或 Document。大多數載入器內部都使用它。啟用 <a href="#/api-cache">Cache</a> 後會快取結果。</p>',
  ctor: { sig: 'new FileLoader( manager : LoadingManager )' },
  examples: [{ title: '載入 JSON 與二進位資料', consoleOnly: true, code: code`
import * as THREE from 'three';
const loader = new THREE.FileLoader();
loader.setResponseType('json');
const pkg = await loader.loadAsync('https://unpkg.com/three@0.170.0/package.json');
console.log('package.json → name', pkg.name, '｜version', pkg.version, '｜license', pkg.license);

loader.setResponseType('arraybuffer');
const buf = await loader.loadAsync('https://threejs.org/examples/models/gltf/Parrot.glb',
  (e) => e.total && console.log('進度', Math.round(e.loaded / e.total * 100) + '%'));
const magic = new TextDecoder().decode(new Uint8Array(buf, 0, 4));
console.log('Parrot.glb 大小', buf.byteLength, 'bytes｜檔頭', magic);
` }],
  props: [['.responseType : String', '"text"（預設）、"json"、"arraybuffer"、"blob"、"document"。'], ['.mimeType : String', '覆寫 MIME 類型。']],
  methods: [['.load( url, onLoad, onProgress, onError ) : undefined', '載入，onLoad 收到依 responseType 解析後的資料。'], ['.setResponseType( value ) : this', '設定回應類型。'], ['.setMimeType( mimeType ) : this', '設定 MIME。']],
},
{
  id: 'api-imageloader', title: 'ImageLoader', api: true, inherits: ['Loader'], src: 'loaders/ImageLoader.js',
  desc: '<p>載入圖片並回傳 <code>HTMLImageElement</code>。<a href="#/api-textureloader">TextureLoader</a> 內部使用它。</p>',
  ctor: { sig: 'new ImageLoader( manager : LoadingManager )' },
  examples: [{ title: '載入圖片元素', code: code`
import * as THREE from 'three';
const img = await new THREE.ImageLoader().loadAsync('https://threejs.org/examples/textures/crate.gif');
console.log(img.constructor.name, img.naturalWidth + 'x' + img.naturalHeight, '｜crossOrigin =', img.crossOrigin);
img.style.cssText = 'width:160px;margin:20px;border-radius:8px';
document.body.appendChild(img);
` }],
  methods: [['.load( url, onLoad, onProgress, onError ) : HTMLImageElement', '載入圖片（onProgress 不會被呼叫）。']],
},
{
  id: 'api-imagebitmaploader', title: 'ImageBitmapLoader', api: true, inherits: ['Loader'], src: 'loaders/ImageBitmapLoader.js',
  desc: '<p>以 <code>createImageBitmap()</code> 載入圖片，解碼可在背景執行緒進行，減少主執行緒卡頓（GLTFLoader 在支援的瀏覽器上使用它）。注意 ImageBitmap 無法在上傳時翻轉，因此需透過 <code>setOptions({ imageOrientation: "flipY" })</code> 在解碼時翻轉，或將貼圖 flipY 設為 false。</p>',
  ctor: { sig: 'new ImageBitmapLoader( manager : LoadingManager )' },
  examples: [{ title: '載入 ImageBitmap 作為貼圖', code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 0, 3] });
const loader = new THREE.ImageBitmapLoader();
loader.setOptions({ imageOrientation: 'flipY' });
const bitmap = await loader.loadAsync('https://threejs.org/examples/textures/uv_grid_opengl.jpg');
console.log(bitmap.constructor.name, bitmap.width + 'x' + bitmap.height);
const tex = new THREE.Texture(bitmap);
tex.colorSpace = THREE.SRGBColorSpace;
tex.needsUpdate = true;
const box = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.3, 1.3), new THREE.MeshStandardMaterial({ map: tex }));
scene.add(box);
onFrame((t) => box.rotation.set(t * 0.3, t * 0.5, 0));
` }],
  props: [['.options : Object', '傳給 createImageBitmap 的選項。']],
  methods: [['.setOptions( options ) : this', '設定選項（imageOrientation、premultiplyAlpha、colorSpaceConversion…）。'], ['.load( url, onLoad, onProgress, onError ) : undefined', '載入。']],
},
{
  id: 'api-cubetextureloader', title: 'CubeTextureLoader', api: true, inherits: ['Loader'], src: 'loaders/CubeTextureLoader.js',
  desc: '<p>載入 6 張圖片組成 <a href="#/api-cubetexture">CubeTexture</a>，順序為 <b>+X、-X、+Y、-Y、+Z、-Z</b>（px、nx、py、ny、pz、nz）。常用於天空盒與環境反射。</p>',
  ctor: { sig: 'new CubeTextureLoader( manager : LoadingManager )' },
  examples: [{ title: '天空盒與反射', code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 0, 4], lights: false });
const cube = await new THREE.CubeTextureLoader()
  .setPath('https://threejs.org/examples/textures/cube/Bridge2/')
  .loadAsync(['posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg']);
cube.colorSpace = THREE.SRGBColorSpace;
scene.background = cube;
const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(0.8, 0.3, 160, 24), new THREE.MeshBasicMaterial({ envMap: cube }));
scene.add(knot);
console.log('CubeTexture images', cube.images.length, '｜每張', cube.images[0].width + 'x' + cube.images[0].height);
onFrame((t) => { knot.rotation.y = t * 0.3; });
` }],
  methods: [['.load( urls : Array, onLoad, onProgress, onError ) : CubeTexture', '載入 6 張圖片。']],
},
{
  id: 'api-objectloader', title: 'ObjectLoader', api: true, inherits: ['Loader'], src: 'loaders/ObjectLoader.js',
  desc: '<p>載入 three.js JSON 格式（由 <code>object.toJSON()</code> 或 three.js 編輯器匯出），可還原完整的物件階層、幾何體、材質、貼圖、動畫。</p>',
  ctor: { sig: 'new ObjectLoader( manager : LoadingManager )' },
  examples: [{ title: 'toJSON → parse 往返', code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 1, 5] });
// 建立並序列化
const original = new THREE.Group();
original.name = 'robot';
const body = new THREE.Mesh(new THREE.BoxGeometry(1, 1.4, 0.6), new THREE.MeshStandardMaterial({ color: 0x78909c }));
const head = new THREE.Mesh(new THREE.SphereGeometry(0.4, 32, 16), new THREE.MeshStandardMaterial({ color: 0xffca28 }));
head.position.y = 1.1;
original.add(body, head);
const json = original.toJSON();
console.log('JSON 大小', JSON.stringify(json).length, '字元｜geometries', json.geometries.length, '｜materials', json.materials.length);
// 還原
const restored = new THREE.ObjectLoader().parse(json);
console.log('還原：', restored.name, '子物件', restored.children.map((c) => c.geometry.type).join(', '));
scene.add(restored);
onFrame((t) => { restored.rotation.y = t; });
` }],
  methods: [['.load( url, onLoad, onProgress, onError ) : undefined', '載入 JSON 檔。'], ['.parse( json, onLoad ) : Object3D', '解析 JSON 物件。'], ['.parseAsync( json ) : Promise', '非同步解析（等待貼圖載入）。'], ['.parseGeometries / .parseMaterials / .parseAnimations / .parseImages / .parseTextures / .parseObject', '各部分的解析方法。']],
},
{
  id: 'api-buffergeometryloader', title: 'BufferGeometryLoader', api: true, inherits: ['Loader'], src: 'loaders/BufferGeometryLoader.js',
  desc: '<p>載入 <code>BufferGeometry.toJSON()</code> 產生的 JSON 格式幾何體。</p>',
  ctor: { sig: 'new BufferGeometryLoader( manager : LoadingManager )' },
  examples: [{ title: '載入 JSON 幾何體', code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 0, 4] });
const geometry = await new THREE.BufferGeometryLoader().loadAsync('https://threejs.org/examples/models/json/suzanne_buffergeometry.json');
geometry.computeVertexNormals();
console.log('頂點數', geometry.attributes.position.count, '｜attributes', Object.keys(geometry.attributes).join(', '));
const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0xffab40 }));
scene.add(mesh);
// parse：從記憶體中的 JSON 還原
const copy = new THREE.BufferGeometryLoader().parse(new THREE.TorusGeometry(0.5, 0.15).toJSON());
console.log('parse 還原', copy.type);
onFrame((t) => { mesh.rotation.y = t * 0.5; });
` }],
  methods: [['.load( url, onLoad, onProgress, onError ) : undefined', '載入。'], ['.parse( json ) : BufferGeometry', '解析 JSON。']],
},
{
  id: 'api-materialloader', title: 'MaterialLoader', api: true, inherits: ['Loader'], src: 'loaders/MaterialLoader.js',
  desc: '<p>載入 <code>Material.toJSON()</code> 產生的 JSON 格式材質。材質中引用的貼圖需透過 <code>setTextures()</code> 提供。</p>',
  ctor: { sig: 'new MaterialLoader( manager : LoadingManager )' },
  examples: [{ title: 'toJSON → parse', consoleOnly: true, code: code`
import * as THREE from 'three';
const mat = new THREE.MeshPhysicalMaterial({ color: 0x3399ff, roughness: 0.2, clearcoat: 1, transparent: true, opacity: 0.8 });
const json = mat.toJSON();
console.log('JSON：', JSON.stringify(json).slice(0, 160) + '…');
const restored = new THREE.MaterialLoader().parse(json);
console.log('還原', restored.type, '｜color', restored.color, '｜clearcoat', restored.clearcoat, '｜opacity', restored.opacity);
console.log('createMaterialFromType("MeshToonMaterial") →', THREE.MaterialLoader.createMaterialFromType('MeshToonMaterial').type);
` }],
  props: [['.textures : Object', '以 uuid 為鍵的貼圖表，parse 時用來解析貼圖參照。']],
  methods: [['.load / .parse( json ) : Material', '載入 / 解析。'], ['.setTextures( textures ) : this', '提供貼圖表。']],
  statics: [['.createMaterialFromType( type : String ) : Material', '依類別名稱建立材質。']],
},
{
  id: 'api-animationloader', title: 'AnimationLoader', api: true, inherits: ['Loader'], src: 'loaders/AnimationLoader.js',
  desc: '<p>載入 JSON 格式的 <a href="#/api-animationclip">AnimationClip</a> 陣列（由 <code>AnimationClip.toJSON()</code> 產生）。</p>',
  ctor: { sig: 'new AnimationLoader( manager : LoadingManager )' },
  examples: [{ title: 'parse JSON 動畫', code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ grid: true, cameraPosition: [0, 3, 6] });
const clip = new THREE.AnimationClip('hop', 1, [new THREE.VectorKeyframeTrack('.position', [0, 0.5, 1], [0, 0.5, 0, 0, 2, 0, 0, 0.5, 0])]);
const json = [THREE.AnimationClip.toJSON(clip)];      // 模擬從檔案讀入的資料
const clips = new THREE.AnimationLoader().parse(json);
console.log('載入 clip：', clips.map((c) => c.name + '（' + c.duration + 's）').join(', '));
const box = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial({ color: 0x26a69a }));
scene.add(box);
const mixer = new THREE.AnimationMixer(box);
mixer.clipAction(clips[0]).play();
onFrame((t, dt) => mixer.update(dt));
` }],
  methods: [['.load( url, onLoad, onProgress, onError ) : undefined', '載入，onLoad 收到 AnimationClip 陣列。'], ['.parse( json : Array ) : Array', '解析。']],
},
{
  id: 'api-audioloader', title: 'AudioLoader', api: true, inherits: ['Loader'], src: 'loaders/AudioLoader.js',
  desc: '<p>載入音訊檔（mp3、ogg、wav…）並解碼成 <code>AudioBuffer</code>，給 <a href="#/api-audio">Audio</a> / <a href="#/api-positionalaudio">PositionalAudio</a> 的 <code>setBuffer()</code> 使用。</p>',
  ctor: { sig: 'new AudioLoader( manager : LoadingManager )' },
  examples: [{ title: '解碼音訊資料', consoleOnly: true, code: code`
import * as THREE from 'three';
const buffer = await new THREE.AudioLoader().loadAsync('https://threejs.org/examples/sounds/358232_j_s_song.mp3');
console.log('AudioBuffer：長度', buffer.duration.toFixed(2), '秒｜取樣率', buffer.sampleRate, '｜聲道', buffer.numberOfChannels);
const ch = buffer.getChannelData(0);
let peak = 0;
for (let i = 0; i < ch.length; i++) peak = Math.max(peak, Math.abs(ch[i]));
console.log('峰值音量', peak.toFixed(3), '（播放需配合 Audio 與使用者互動）');
` }],
  methods: [['.load( url, onLoad, onProgress, onError ) : undefined', '載入並解碼，onLoad 收到 AudioBuffer。']],
},
{
  id: 'api-datatextureloader', title: 'DataTextureLoader', api: true, inherits: ['Loader'], src: 'loaders/DataTextureLoader.js',
  desc: '<p>以二進位資料建立 <a href="#/api-datatexture">DataTexture</a> 的抽象基底載入器。子類別只需實作 <code>parse(buffer)</code> 回傳 <code>{ data, width, height, … }</code>。附加模組中的 <code>RGBELoader</code>（.hdr）、<code>EXRLoader</code>、<code>TGALoader</code> 都繼承自它。</p>',
  ctor: { sig: 'new DataTextureLoader( manager : LoadingManager )' },
  examples: [{ title: 'RGBELoader 載入 HDR 環境貼圖', code: code`
import * as THREE from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { createStage } from 'doc-stage';
const { scene, renderer } = createStage({ cameraPosition: [0, 0, 4], lights: false });
renderer.toneMapping = THREE.ACESFilmicToneMapping;
const hdr = await new RGBELoader().loadAsync('https://threejs.org/examples/textures/equirectangular/venice_sunset_1k.hdr');
hdr.mapping = THREE.EquirectangularReflectionMapping;
scene.background = hdr;
scene.environment = hdr;
console.log(hdr.constructor.name, hdr.image.width + 'x' + hdr.image.height, '｜type', hdr.type === THREE.HalfFloatType ? 'HalfFloatType' : hdr.type, '｜繼承 DataTextureLoader？', new RGBELoader() instanceof THREE.DataTextureLoader);
[0, 0.3, 0.7].forEach((r, i) => {
  const s = new THREE.Mesh(new THREE.SphereGeometry(0.55, 64, 32), new THREE.MeshStandardMaterial({ metalness: 1, roughness: r }));
  s.position.x = (i - 1) * 1.3;
  scene.add(s);
});
` }],
  methods: [['.load( url, onLoad, onProgress, onError ) : DataTexture', '載入並立即回傳 DataTexture。'], ['.parse( buffer ) : Object', '（子類別實作）解析二進位資料。']],
},
{
  id: 'api-compressedtextureloader', title: 'CompressedTextureLoader', api: true, inherits: ['Loader'], src: 'loaders/CompressedTextureLoader.js',
  desc: '<p>載入 GPU 壓縮貼圖的抽象基底載入器，建立 <a href="#/api-compressedtexture">CompressedTexture</a>（或 CompressedCubeTexture）。子類別實作 <code>parse(buffer)</code>。附加模組的 <code>DDSLoader</code>、<code>KTXLoader</code>、<code>PVRLoader</code> 繼承自它。範例見 CompressedTexture。</p>',
  ctor: { sig: 'new CompressedTextureLoader( manager : LoadingManager )' },
  methods: [['.load( url, onLoad, onProgress, onError ) : CompressedTexture', '載入（url 可為陣列，載入 6 張組成立方體貼圖）。'], ['.parse( buffer, loadMipmaps ) : Object', '（子類別實作）解析。']],
},
{
  id: 'api-cache', title: 'Cache', api: true, src: 'loaders/Cache.js',
  desc: '<p>FileLoader 使用的簡易快取（以 URL 為鍵）。<b>預設關閉</b>；設定 <code>THREE.Cache.enabled = true</code> 後，重複載入同一個 URL 會直接回傳快取內容。</p>',
  examples: [{ title: '啟用快取', consoleOnly: true, code: code`
import * as THREE from 'three';
THREE.Cache.enabled = true;
const loader = new THREE.FileLoader();
const url = 'https://unpkg.com/three@0.170.0/package.json';
let t0 = performance.now();
await loader.loadAsync(url);
console.log('第一次載入', (performance.now() - t0).toFixed(1), 'ms');
t0 = performance.now();
await loader.loadAsync(url);
console.log('第二次（快取）', (performance.now() - t0).toFixed(1), 'ms');
console.log('Cache.get 有資料？', THREE.Cache.get(url) !== undefined, '｜目前快取數', Object.keys(THREE.Cache.files).length);
THREE.Cache.clear();
console.log('clear 後', Object.keys(THREE.Cache.files).length);
` }],
  props: [['.enabled : Boolean', '是否啟用，預設 false。'], ['.files : Object', '快取內容。']],
  methods: [['.add( key, file ) : undefined', '加入。'], ['.get( key ) : Object', '取得。'], ['.remove( key ) : undefined', '移除。'], ['.clear() : undefined', '清空。']],
},
{
  id: 'api-loaderutils', title: 'LoaderUtils', api: true, src: 'loaders/LoaderUtils.js',
  desc: '<p>載入器使用的工具函式。</p>',
  examples: [{ title: 'URL 工具', consoleOnly: true, code: code`
import * as THREE from 'three';
const url = 'https://example.com/models/car/scene.gltf';
console.log('extractUrlBase →', THREE.LoaderUtils.extractUrlBase(url));
console.log('resolveURL("textures/a.png", base) →', THREE.LoaderUtils.resolveURL('textures/a.png', 'https://example.com/models/car/'));
console.log('resolveURL(絕對網址) →', THREE.LoaderUtils.resolveURL('https://cdn.com/b.png', 'https://example.com/'));
` }],
  statics: [['.extractUrlBase( url ) : String', '取出 URL 的目錄部分。'], ['.resolveURL( url, path ) : String', '把相對 URL 依 path 解析為完整 URL（data: / blob: / 絕對網址保持不變）。'], ['.decodeText( array ) : String', '（已棄用）以 TextDecoder 取代。']],
},
{
  id: 'api-defaultloadingmanager', title: 'DefaultLoadingManager', api: true, src: 'loaders/LoadingManager.js',
  desc: '<p>全域預設的 <a href="#/api-loadingmanager">LoadingManager</a> 實例。建立載入器時若沒有傳入 manager，就會使用它，因此可以在這裡統一監聽所有載入進度。</p>',
  examples: [{ title: '監聽所有載入', consoleOnly: true, code: code`
import * as THREE from 'three';
THREE.DefaultLoadingManager.onStart = (url, loaded, total) => console.log('開始', url.split('/').pop(), loaded + '/' + total);
THREE.DefaultLoadingManager.onLoad = () => console.log('全部完成');
THREE.DefaultLoadingManager.onProgress = (url, loaded, total) => console.log('完成', url.split('/').pop(), loaded + '/' + total);
// 這些載入器都沒有傳入 manager → 使用 DefaultLoadingManager
const tl = new THREE.TextureLoader().setPath('https://threejs.org/examples/textures/');
tl.load('crate.gif');
tl.load('sprite.png');
` }],
  props: [['.onStart / .onLoad / .onProgress / .onError : Function', '同 LoadingManager。']],
},
]);
})();
