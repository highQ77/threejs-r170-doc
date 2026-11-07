/* API 參考（補充）：常數、核心緩衝區、動畫工具、關鍵影格軌道 */
(function () {
var code = String.raw;
function add(name, items) {
  var g = window.DOCS.find(function (x) { return x.group === name; });
  if (!g) { g = { group: name, section: 'api', items: [] }; window.DOCS.push(g); }
  g.items.push.apply(g.items, items);
}
function table(rows, head) {
  return '<table><tr>' + (head || ['常數', '說明']).map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr>' +
    rows.map(function (r) { return '<tr><td><code>' + r[0] + '</code></td><td>' + r[1] + '</td></tr>'; }).join('') + '</table>';
}
function constPage(id, title, official, desc, sections, ex) {
  return {
    id: id, title: title, en: official, official: official, api: true, src: 'constants.js',
    desc: desc + sections.map(function (s) { return '<h3>' + s[0] + '</h3>' + table(s[1]); }).join(''),
    examples: ex ? [ex] : [],
  };
}

/* ================= 常數 ================= */
add('常數 Constants', [
constPage('api-const-animation', '動畫常數', 'Animation', '<p>用於 <a href="#/api-animationaction">AnimationAction</a> 與 <a href="#/api-keyframetrack">KeyframeTrack</a> 的常數。</p>', [
  ['循環模式（action.loop）', [['THREE.LoopOnce', '只播放一次。'], ['THREE.LoopRepeat', '重複播放（預設），次數由 repetitions 決定。'], ['THREE.LoopPingPong', '來回播放。']]],
  ['插值模式', [['THREE.InterpolateDiscrete', '不插值，直接跳到下一個關鍵影格。'], ['THREE.InterpolateLinear', '線性插值（預設）。'], ['THREE.InterpolateSmooth', '三次樣條平滑插值。']]],
  ['端點模式', [['THREE.ZeroCurvatureEnding', '端點曲率為零（預設）。'], ['THREE.ZeroSlopeEnding', '端點斜率為零。'], ['THREE.WrapAroundEnding', '首尾相接（適合循環動畫）。']]],
  ['混合模式（blendMode）', [['THREE.NormalAnimationBlendMode', '一般混合（預設）。'], ['THREE.AdditiveAnimationBlendMode', '疊加混合，搭配 AnimationUtils.makeClipAdditive。']]],
], { title: '印出常數值', consoleOnly: true, code: code`
import * as THREE from 'three';
const names = ['LoopOnce', 'LoopRepeat', 'LoopPingPong', 'InterpolateDiscrete', 'InterpolateLinear', 'InterpolateSmooth',
  'ZeroCurvatureEnding', 'ZeroSlopeEnding', 'WrapAroundEnding', 'NormalAnimationBlendMode', 'AdditiveAnimationBlendMode'];
names.forEach((n) => console.log(n.padEnd(28), '=', THREE[n]));
` }),
constPage('api-const-core', '核心常數', 'Core', '<p>版本號、滑鼠與觸控按鍵、色彩空間等核心常數。</p>', [
  ['版本', [['THREE.REVISION', '目前版本字串，例如 "170"。']]],
  ['色彩空間', [['THREE.NoColorSpace', '無（資料貼圖使用）。'], ['THREE.SRGBColorSpace', 'sRGB（顏色貼圖、輸出）。'], ['THREE.LinearSRGBColorSpace', '線性 sRGB（內部運算）。']]],
  ['滑鼠按鍵 THREE.MOUSE', [['MOUSE.LEFT / MIDDLE / RIGHT', '0 / 1 / 2'], ['MOUSE.ROTATE / DOLLY / PAN', '控制器動作，用於 controls.mouseButtons。']]],
  ['觸控 THREE.TOUCH', [['TOUCH.ROTATE / PAN / DOLLY_PAN / DOLLY_ROTATE', '控制器的觸控動作，用於 controls.touches。']]],
], { title: '版本與控制器按鍵設定', consoleOnly: true, code: code`
import * as THREE from 'three';
console.log('REVISION =', THREE.REVISION);
console.log('MOUSE =', THREE.MOUSE);
console.log('TOUCH =', THREE.TOUCH);
console.log('色彩空間：', THREE.NoColorSpace || '(空字串)', '/', THREE.SRGBColorSpace, '/', THREE.LinearSRGBColorSpace);
// 例：讓 OrbitControls 左鍵平移、右鍵旋轉
const mouseButtons = { LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE };
console.log('自訂 mouseButtons =', mouseButtons);
` }),
constPage('api-const-blending', '自訂混合常數', 'CustomBlendingEquation', '<p>當材質 <code>blending = THREE.CustomBlending</code> 時，以 <code>blendEquation</code>、<code>blendSrc</code>、<code>blendDst</code> 自訂混合公式：<br><code>結果 = 來源色 × blendSrc (blendEquation) 目標色 × blendDst</code></p>', [
  ['混合方程式（blendEquation）', [['THREE.AddEquation', '相加（預設）。'], ['THREE.SubtractEquation', '來源 − 目標。'], ['THREE.ReverseSubtractEquation', '目標 − 來源。'], ['THREE.MinEquation', '取最小值。'], ['THREE.MaxEquation', '取最大值。']]],
  ['來源 / 目標因子', [['THREE.ZeroFactor / OneFactor', '0 / 1'], ['THREE.SrcColorFactor / OneMinusSrcColorFactor', '來源色 / 1 − 來源色'], ['THREE.SrcAlphaFactor / OneMinusSrcAlphaFactor', '來源 alpha / 1 − 來源 alpha'], ['THREE.DstColorFactor / OneMinusDstColorFactor', '目標色 / 1 − 目標色'], ['THREE.DstAlphaFactor / OneMinusDstAlphaFactor', '目標 alpha / 1 − 目標 alpha'], ['THREE.SrcAlphaSaturateFactor', '僅來源因子可用。'], ['THREE.ConstantColorFactor / ConstantAlphaFactor（及 OneMinus…）', '搭配 material.blendColor、blendAlpha。']]],
], { title: '自訂混合：重疊處取最大值', code: code`
import * as THREE from 'three';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const { scene } = createStage({ cameraPosition: [0, 0, 4], lights: false, background: 0x222222 });

const eq = { Add: THREE.AddEquation, Subtract: THREE.SubtractEquation, ReverseSubtract: THREE.ReverseSubtractEquation, Min: THREE.MinEquation, Max: THREE.MaxEquation };
const mats = [0xff3333, 0x33ff33, 0x3333ff].map((color, i) => {
  const m = new THREE.MeshBasicMaterial({ color, transparent: true, blending: THREE.CustomBlending,
    blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, depthWrite: false });
  const c = new THREE.Mesh(new THREE.CircleGeometry(0.8, 64), m);
  const a = (i / 3) * Math.PI * 2 + Math.PI / 2;
  c.position.set(Math.cos(a) * 0.5, Math.sin(a) * 0.5, 0);
  scene.add(c);
  return m;
});
const p = { equation: 'Add' };
new GUI().add(p, 'equation', Object.keys(eq)).onChange((v) => mats.forEach((m) => { m.blendEquation = eq[v]; m.needsUpdate = true; }));
console.log('Add + OneFactor/OneFactor = 加法混色（RGB 光的三原色）');
` }),
constPage('api-const-usage', '緩衝區用途常數', 'BufferAttributeUsage', '<p>用於 <code>BufferAttribute.setUsage()</code>，提示 GPU 這筆資料多久更新一次，以便驅動程式最佳化。</p>', [
  ['用途', [['THREE.StaticDrawUsage', '內容設定一次、多次使用（預設）。'], ['THREE.DynamicDrawUsage', '內容經常改變（例如每幀更新的粒子位置）。'], ['THREE.StreamDrawUsage', '內容每次使用前都會改變。'], ['THREE.StaticReadUsage / DynamicReadUsage / StreamReadUsage', '從 GPU 讀回資料用。'], ['THREE.StaticCopyUsage / DynamicCopyUsage / StreamCopyUsage', 'GPU 間複製用。']]],
], { title: 'setUsage', consoleOnly: true, code: code`
import * as THREE from 'three';
const attr = new THREE.Float32BufferAttribute(new Float32Array(300), 3);
console.log('預設 usage =', attr.usage, '（StaticDrawUsage =', THREE.StaticDrawUsage, '）');
attr.setUsage(THREE.DynamicDrawUsage);   // 必須在第一次渲染前設定
console.log('setUsage 後 =', attr.usage, '（DynamicDrawUsage =', THREE.DynamicDrawUsage, '）');
` }),
constPage('api-const-materials', '材質常數', 'Materials', '<p>材質相關屬性使用的常數。</p>', [
  ['面向（side）', [['THREE.FrontSide', '正面（預設）。'], ['THREE.BackSide', '背面。'], ['THREE.DoubleSide', '雙面。']]],
  ['混合（blending）', [['THREE.NoBlending', '不混合。'], ['THREE.NormalBlending', '一般 alpha 混合（預設）。'], ['THREE.AdditiveBlending', '相加，適合發光。'], ['THREE.SubtractiveBlending', '相減。'], ['THREE.MultiplyBlending', '相乘。'], ['THREE.CustomBlending', '自訂，見 <a href="#/api-const-blending">自訂混合常數</a>。']]],
  ['深度函式（depthFunc）', [['THREE.NeverDepth / AlwaysDepth', '永不 / 永遠通過。'], ['THREE.LessDepth / LessEqualDepth', '小於 / 小於等於（預設）。'], ['THREE.EqualDepth / NotEqualDepth', '等於 / 不等於。'], ['THREE.GreaterEqualDepth / GreaterDepth', '大於等於 / 大於。']]],
  ['環境貼圖結合（combine）', [['THREE.MultiplyOperation', '相乘（預設）。'], ['THREE.MixOperation', '依 reflectivity 混合。'], ['THREE.AddOperation', '相加。']]],
  ['模板（stencil）', [['THREE.KeepStencilOp / ZeroStencilOp / ReplaceStencilOp / IncrementStencilOp …', '模板操作。'], ['THREE.AlwaysStencilFunc / EqualStencilFunc / NotEqualStencilFunc …', '模板比較函式。']]],
  ['法線貼圖類型', [['THREE.TangentSpaceNormalMap', '切線空間（預設）。'], ['THREE.ObjectSpaceNormalMap', '物件空間。']]],
], { title: 'depthFunc 視覺比較', code: code`
import * as THREE from 'three';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const { scene } = createStage({ cameraPosition: [0, 1, 5] });

const wall = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 0.2), new THREE.MeshStandardMaterial({ color: 0x607d8b }));
scene.add(wall);
const mat = new THREE.MeshStandardMaterial({ color: 0xff7043 });
const ball = new THREE.Mesh(new THREE.SphereGeometry(0.7, 32, 16), mat);
ball.position.z = -0.6;    // 一半藏在牆後
ball.renderOrder = 1;      // 最後畫，才看得出 depthFunc 的差異
scene.add(ball);
const funcs = { LessEqualDepth: THREE.LessEqualDepth, GreaterDepth: THREE.GreaterDepth, AlwaysDepth: THREE.AlwaysDepth, NeverDepth: THREE.NeverDepth };
new GUI().add({ depthFunc: 'LessEqualDepth' }, 'depthFunc', Object.keys(funcs)).onChange((v) => (mat.depthFunc = funcs[v]));
console.log('GreaterDepth：只畫出被牆擋住的部分');
` }),
constPage('api-const-renderer', '渲染器常數', 'Renderer', '<p>WebGLRenderer 使用的常數。</p>', [
  ['陰影類型（shadowMap.type）', [['THREE.BasicShadowMap', '不過濾，最快。'], ['THREE.PCFShadowMap', 'PCF 過濾（預設）。'], ['THREE.PCFSoftShadowMap', '較柔和的 PCF。'], ['THREE.VSMShadowMap', 'Variance Shadow Map。']]],
  ['色調映射（toneMapping）', [['THREE.NoToneMapping', '無（預設）。'], ['THREE.LinearToneMapping', '線性。'], ['THREE.ReinhardToneMapping', 'Reinhard。'], ['THREE.CineonToneMapping', 'Cineon。'], ['THREE.ACESFilmicToneMapping', 'ACES Filmic。'], ['THREE.AgXToneMapping', 'AgX。'], ['THREE.NeutralToneMapping', 'Khronos PBR Neutral。'], ['THREE.CustomToneMapping', '自訂。']]],
  ['剔除面', [['THREE.CullFaceNone / CullFaceBack / CullFaceFront / CullFaceFrontBack', 'renderer.state 使用。']]],
], { title: '印出渲染器常數', consoleOnly: true, code: code`
import * as THREE from 'three';
['BasicShadowMap', 'PCFShadowMap', 'PCFSoftShadowMap', 'VSMShadowMap',
 'NoToneMapping', 'LinearToneMapping', 'ReinhardToneMapping', 'CineonToneMapping', 'ACESFilmicToneMapping', 'AgXToneMapping', 'NeutralToneMapping']
  .forEach((n) => console.log(n.padEnd(22), '=', THREE[n]));
` }),
constPage('api-const-textures', '貼圖常數', 'Textures', '<p>Texture 屬性使用的常數。</p>', [
  ['映射（mapping）', [['THREE.UVMapping', 'UV 映射（預設）。'], ['THREE.CubeReflectionMapping / CubeRefractionMapping', '立方體貼圖反射 / 折射。'], ['THREE.EquirectangularReflectionMapping / EquirectangularRefractionMapping', '等距柱狀（全景圖）反射 / 折射。'], ['THREE.CubeUVReflectionMapping', 'PMREM 產生的貼圖。']]],
  ['包覆（wrapS / wrapT）', [['THREE.RepeatWrapping', '重複。'], ['THREE.ClampToEdgeWrapping', '延伸邊緣像素（預設）。'], ['THREE.MirroredRepeatWrapping', '鏡像重複。']]],
  ['放大過濾（magFilter）', [['THREE.NearestFilter', '最近像素（像素風）。'], ['THREE.LinearFilter', '雙線性（預設）。']]],
  ['縮小過濾（minFilter）', [['THREE.NearestFilter / LinearFilter', '不使用 mipmap。'], ['THREE.NearestMipmapNearestFilter / NearestMipmapLinearFilter', '最近像素 + mipmap。'], ['THREE.LinearMipmapNearestFilter / LinearMipmapLinearFilter', '雙線性 + mipmap（後者為預設，三線性）。']]],
  ['資料型別（type）', [['THREE.UnsignedByteType', '8 位元（預設）。'], ['THREE.HalfFloatType / FloatType', '半精度 / 單精度浮點（HDR）。'], ['THREE.ByteType / ShortType / UnsignedShortType / IntType / UnsignedIntType', '整數型別。'], ['THREE.UnsignedShort4444Type / UnsignedShort5551Type / UnsignedInt248Type / UnsignedInt5999Type', '壓縮像素型別。']]],
  ['格式（format）', [['THREE.RGBAFormat', 'RGBA（預設）。'], ['THREE.RedFormat / RGFormat', '單通道 / 雙通道。'], ['THREE.AlphaFormat', '只有 alpha。'], ['THREE.DepthFormat / DepthStencilFormat', '深度 / 深度模板。'], ['THREE.RedIntegerFormat / RGIntegerFormat / RGBAIntegerFormat', '整數格式。']]],
  ['壓縮格式', [['THREE.RGB_S3TC_DXT1_Format …', 'S3TC（桌面）。'], ['THREE.RGB_ETC2_Format / RGBA_ETC2_EAC_Format', 'ETC2（行動裝置）。'], ['THREE.RGBA_ASTC_4x4_Format …', 'ASTC。'], ['THREE.RGBA_BPTC_Format', 'BC7。'], ['THREE.RGB_PVRTC_4BPPV1_Format …', 'PVRTC（舊 iOS）。']]],
], { title: '過濾模式比較', code: code`
import * as THREE from 'three';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { createStage } from 'doc-stage';
const { scene } = createStage({ cameraPosition: [0, 0.6, 3], target: [0, 0, -4], lights: false });

const c = document.createElement('canvas'); c.width = c.height = 32;
const ctx = c.getContext('2d');
for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { ctx.fillStyle = (x + y) % 2 ? '#fff' : '#e53935'; ctx.fillRect(x * 4, y * 4, 4, 4); }
const tex = new THREE.CanvasTexture(c);
tex.colorSpace = THREE.SRGBColorSpace;
tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
tex.repeat.set(20, 20);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshBasicMaterial({ map: tex }));
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.5;
scene.add(floor);

const mins = { LinearMipmapLinearFilter: THREE.LinearMipmapLinearFilter, NearestMipmapNearestFilter: THREE.NearestMipmapNearestFilter, LinearFilter: THREE.LinearFilter, NearestFilter: THREE.NearestFilter };
const mags = { LinearFilter: THREE.LinearFilter, NearestFilter: THREE.NearestFilter };
const p = { minFilter: 'LinearMipmapLinearFilter', magFilter: 'LinearFilter', anisotropy: 1 };
const gui = new GUI();
gui.add(p, 'minFilter', Object.keys(mins)).onChange((v) => { tex.minFilter = mins[v]; tex.needsUpdate = true; });
gui.add(p, 'magFilter', Object.keys(mags)).onChange((v) => { tex.magFilter = mags[v]; tex.needsUpdate = true; });
gui.add(p, 'anisotropy', [1, 2, 4, 8, 16]).onChange((v) => { tex.anisotropy = v; tex.needsUpdate = true; });
console.log('遠處的格子：沒有 mipmap 會出現閃爍的摩爾紋');
` }),
]);

/* ================= 核心：緩衝區 ================= */
var BA = ['BufferAttribute'];
add('核心 Core', [
{
  id: 'api-bufferattribute-types', title: 'BufferAttribute 型別', en: 'BufferAttribute Types', official: 'BufferAttribute Types', api: true, src: 'core/BufferAttribute.js',
  desc: '<p>為了方便，three.js 為每種 TypedArray 提供對應的 BufferAttribute 子類別，可以直接傳入一般陣列：</p>' + table([
    ['Float32BufferAttribute', 'Float32Array（最常用：position、normal、uv）'], ['Float16BufferAttribute', '半精度浮點（以 Uint16Array 儲存）'],
    ['Uint32BufferAttribute / Int32BufferAttribute', '32 位元整數（大型索引）'], ['Uint16BufferAttribute / Int16BufferAttribute', '16 位元整數（索引、skinIndex）'],
    ['Uint8BufferAttribute / Int8BufferAttribute', '8 位元整數'], ['Uint8ClampedBufferAttribute', 'Uint8ClampedArray'],
  ], ['類別', '對應陣列']),
  ctor: { sig: 'new Float32BufferAttribute( array : Array | Number, itemSize : Integer, normalized : Boolean )', desc: 'array 可為一般陣列、TypedArray，或一個數字（建立該長度的空陣列）。' },
  examples: [{ title: '各種型別', consoleOnly: true, code: code`
import * as THREE from 'three';
const a = new THREE.Float32BufferAttribute([0, 1, 2, 3, 4, 5], 3);
const b = new THREE.Uint16BufferAttribute([0, 1, 2], 1);
const c = new THREE.Uint8BufferAttribute([255, 128, 0, 255], 4, true);   // normalized：0~255 對應到 0~1
console.log('Float32 →', a.array.constructor.name, 'count', a.count);
console.log('Uint16  →', b.array.constructor.name, 'count', b.count);
console.log('Uint8 normalized → getX(0) =', c.getX(0), '（讀取時自動正規化）');
const h = new THREE.Float16BufferAttribute([0.5, 1.5], 1);
console.log('Float16 → 底層', h.array.constructor.name, '｜getX(1) =', h.getX(1));
` }],
},
{
  id: 'api-instancedbufferattribute', title: 'InstancedBufferAttribute', api: true, inherits: BA, src: 'core/InstancedBufferAttribute.js',
  desc: '<p>每個「實例」一筆資料的 attribute（而不是每個頂點一筆），搭配 <a href="#/api-instancedbuffergeometry">InstancedBufferGeometry</a> 或 InstancedMesh 使用。<code>InstancedMesh.instanceMatrix</code> 與 <code>instanceColor</code> 就是它。</p>',
  ctor: { sig: 'new InstancedBufferAttribute( array : TypedArray, itemSize : Integer, normalized : Boolean, meshPerAttribute : Number )', params: [['meshPerAttribute', 'Number', '每幾個實例前進一筆資料，預設 1。']] },
  props: [['.meshPerAttribute : Number', '每幾個實例使用一筆資料。'], ['.isInstancedBufferAttribute : Boolean', '型別檢查旗標。']],
  methods: [['.copy( source ) : this', '複製。']],
},
{
  id: 'api-instancedbuffergeometry', title: 'InstancedBufferGeometry', api: true, inherits: ['EventDispatcher', 'BufferGeometry'], src: 'core/InstancedBufferGeometry.js',
  desc: '<p>支援實例化繪製的 BufferGeometry：一份頂點資料，重複繪製 <code>instanceCount</code> 次，每個實例可以透過 <a href="#/api-instancedbufferattribute">InstancedBufferAttribute</a> 取得不同的資料（位置、顏色、縮放……），通常搭配自訂著色器。比 InstancedMesh 更有彈性。</p>',
  ctor: { sig: 'new InstancedBufferGeometry()' },
  examples: [{ title: '自訂著色器的實例化繪製', desc: '5,000 個三角形實例，每個實例有自己的 offset 與 color，位置在頂點著色器中計算。', code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 0, 6], lights: false, background: 0x050508 });

const base = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([0, 0.04, 0, -0.035, -0.03, 0, 0.035, -0.03, 0], 3));
const geo = new THREE.InstancedBufferGeometry();
geo.index = base.index;
geo.attributes.position = base.attributes.position;

const count = 5000;
const offsets = new Float32Array(count * 3), colors = new Float32Array(count * 3);
const c = new THREE.Color();
for (let i = 0; i < count; i++) {
  offsets.set(new THREE.Vector3().randomDirection().multiplyScalar(1 + Math.random() * 1.5).toArray(), i * 3);
  colors.set(c.setHSL(Math.random(), 0.8, 0.6).toArray(), i * 3);
}
geo.setAttribute('offset', new THREE.InstancedBufferAttribute(offsets, 3));
geo.setAttribute('iColor', new THREE.InstancedBufferAttribute(colors, 3));
geo.instanceCount = count;

const mat = new THREE.ShaderMaterial({
  uniforms: { uTime: { value: 0 } },
  vertexShader: [
    'attribute vec3 offset;', 'attribute vec3 iColor;', 'uniform float uTime;', 'varying vec3 vColor;',
    'void main() {', '  vColor = iColor;',
    '  vec3 p = offset * (1.0 + 0.15 * sin(uTime * 2.0 + offset.x * 4.0));',
    '  vec4 mv = modelViewMatrix * vec4(p, 1.0);', '  mv.xy += position.xy;   // 面向相機的小三角形',
    '  gl_Position = projectionMatrix * mv;', '}',
  ].join('\n'),
  fragmentShader: 'varying vec3 vColor; void main() { gl_FragColor = vec4(vColor, 1.0); }',
});
const mesh = new THREE.Mesh(geo, mat);
mesh.frustumCulled = false;   // 頂點在著色器中移動，關閉剔除
scene.add(mesh);
console.log('一次 draw call 繪製', geo.instanceCount, '個實例');
onFrame((t) => { mat.uniforms.uTime.value = t; mesh.rotation.y = t * 0.1; });
` }],
  props: [['.instanceCount : Number', '要繪製的實例數，預設 Infinity（依 attribute 長度）。'], ['.isInstancedBufferGeometry : Boolean', '型別檢查旗標。']],
  methods: [['.copy( source ) : this', '複製。']],
},
{
  id: 'api-interleavedbuffer', title: 'InterleavedBuffer', api: true, src: 'core/InterleavedBuffer.js',
  desc: '<p>交錯式緩衝區：把多個 attribute（例如位置與顏色）交錯存放在同一個 TypedArray 中：<code>[x,y,z,r,g,b, x,y,z,r,g,b, …]</code>。可以改善 GPU 快取效率。透過 <a href="#/api-interleavedbufferattribute">InterleavedBufferAttribute</a> 存取其中一部分。</p>',
  ctor: { sig: 'new InterleavedBuffer( array : TypedArray, stride : Integer )', params: [['array', 'TypedArray', '資料。'], ['stride', 'Integer', '每個頂點占用的數值數（例如 3 + 3 = 6）。']] },
  examples: [{ title: '位置與顏色交錯存放', code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 0, 3], lights: false });

// 每個頂點：x, y, z, r, g, b（stride = 6）
const data = new Float32Array([
  -1, -1, 0,   1, 0, 0,
   1, -1, 0,   0, 1, 0,
   0,  1, 0,   0, 0, 1,
]);
const buffer = new THREE.InterleavedBuffer(data, 6);
const geo = new THREE.BufferGeometry();
geo.setAttribute('position', new THREE.InterleavedBufferAttribute(buffer, 3, 0));   // offset 0
geo.setAttribute('color', new THREE.InterleavedBufferAttribute(buffer, 3, 3));      // offset 3
const tri = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide }));
scene.add(tri);
console.log('count =', buffer.count, '｜stride =', buffer.stride, '｜color.getX(1) =', geo.attributes.color.getX(1));
onFrame((t) => { tri.rotation.y = t; });
` }],
  props: [
    ['.array : TypedArray', '資料。'], ['.stride : Integer', '每個頂點的數值數。'], ['.count : Integer', '頂點數（array.length / stride）。'],
    ['.usage : Usage', '使用提示，見 <a href="#/api-const-usage">緩衝區用途常數</a>。'], ['.updateRanges : Array', '部分更新範圍。'],
    ['.needsUpdate : Boolean', '設為 true 會重新上傳。'], ['.version : Integer', '版本號。'],
  ],
  methods: [['.setUsage( usage ) : this', '設定用途。'], ['.set( value, offset ) : this', '寫入資料。'], ['.copyAt( index1, buffer, index2 ) : this', '複製某個頂點的資料。'], ['.clone( data ) : InterleavedBuffer', '複製。'], ['.addUpdateRange( start, count )', '新增更新範圍。']],
},
{
  id: 'api-interleavedbufferattribute', title: 'InterleavedBufferAttribute', api: true, src: 'core/InterleavedBufferAttribute.js',
  desc: '<p><a href="#/api-interleavedbuffer">InterleavedBuffer</a> 中的某一段資料，介面與 BufferAttribute 相同（getX、setXYZ…），可以直接 setAttribute 到幾何體。範例見 InterleavedBuffer。</p>',
  ctor: { sig: 'new InterleavedBufferAttribute( interleavedBuffer : InterleavedBuffer, itemSize : Integer, offset : Integer, normalized : Boolean )' },
  props: [['.data : InterleavedBuffer', '所屬的交錯緩衝區。'], ['.itemSize : Integer', '每頂點分量數。'], ['.offset : Integer', '在每個頂點區塊中的起始位置。'], ['.count : Integer', '頂點數。'], ['.array : TypedArray', '等同 data.array。']],
  methods: [['.getX / .setX / .setXYZ …', '同 BufferAttribute。'], ['.applyMatrix4( m ) : this', '套用矩陣。'], ['.clone( data ) : BufferAttribute', '複製（未傳 data 時轉為一般 BufferAttribute）。']],
},
{
  id: 'api-instancedinterleavedbuffer', title: 'InstancedInterleavedBuffer', api: true, inherits: ['InterleavedBuffer'], src: 'core/InstancedInterleavedBuffer.js',
  desc: '<p>以實例為單位前進的 InterleavedBuffer，讓多個 per-instance attribute 交錯存放（例如每個實例的位置 + 顏色）。附加模組的 <code>LineSegmentsGeometry</code>（粗線）內部即使用它。</p>',
  ctor: { sig: 'new InstancedInterleavedBuffer( array : TypedArray, stride : Integer, meshPerAttribute : Number )' },
  props: [['.meshPerAttribute : Number', '每幾個實例前進一筆，預設 1。']],
},
{
  id: 'api-glbufferattribute', title: 'GLBufferAttribute', api: true, src: 'core/GLBufferAttribute.js',
  desc: '<p>直接使用你自己建立的 <code>WebGLBuffer</code> 作為 attribute，three.js 不會管理其資料（不會上傳、也無法讀取）。適合與其他 WebGL 函式庫或 GPU 運算結果共用緩衝區。</p>',
  ctor: { sig: 'new GLBufferAttribute( buffer : WebGLBuffer, type : GLenum, itemSize : Integer, elementSize : Integer, count : Integer )', params: [
    ['buffer', 'WebGLBuffer', '已建立的緩衝區。'], ['type', 'GLenum', '資料型別，例如 gl.FLOAT。'], ['itemSize', 'Integer', '每頂點分量數。'], ['elementSize', 'Integer', '每個分量的位元組數（FLOAT 為 4）。'], ['count', 'Integer', '頂點數。'],
  ]},
  examples: [{ title: '使用原生 WebGLBuffer', code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, renderer, onFrame } = createStage({ cameraPosition: [0, 0, 6], lights: false });

const gl = renderer.getContext();
const count = 2000;
const data = new Float32Array(count * 3);
for (let i = 0; i < count; i++) data.set(new THREE.Vector3().randomDirection().multiplyScalar(2).toArray(), i * 3);
const buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

const geo = new THREE.BufferGeometry();
geo.setAttribute('position', new THREE.GLBufferAttribute(buf, gl.FLOAT, 3, 4, count));
geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 2);   // three.js 無法自行計算，需手動設定
const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.04, color: 0xffcc80 }));
scene.add(pts);
console.log('GLBufferAttribute：', count, '個點，資料由原生 WebGL 上傳');
onFrame((t) => { pts.rotation.y = t * 0.3; });
` }],
  props: [['.buffer : WebGLBuffer', '緩衝區。'], ['.type / .itemSize / .elementSize / .count', '資料描述。'], ['.needsUpdate : Boolean', '設為 true 表示緩衝區已更換。']],
  methods: [['.setBuffer( buffer ) / .setType( type, elementSize ) / .setItemSize( n ) / .setCount( n ) : this', '修改描述。']],
},
{
  id: 'api-uniform', title: 'Uniform', api: true, src: 'core/Uniform.js',
  desc: '<p>著色器 uniform 的容器，只有一個 <code>value</code> 屬性。在 ShaderMaterial 的 uniforms 中可以寫成 <code>{ value: 1 }</code> 物件字面值，也可以用 <code>new THREE.Uniform(1)</code>。</p><p>支援的值型別：Number、Boolean、Vector2/3/4、Color、Matrix3/4、Quaternion、Texture，以及上述型別的陣列（對應 GLSL 的 float、bool、vec2/3/4、mat3/4、sampler2D…）。</p>',
  ctor: { sig: 'new Uniform( value : Object )' },
  examples: [{ title: '共用 uniform', desc: '兩個材質共用同一個 Uniform 物件，修改一次兩者都會更新。', code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 0, 5], lights: false });

const uTime = new THREE.Uniform(0);   // 共用
const frag = 'uniform float uTime; uniform vec3 uColor; varying vec2 vUv; void main() { gl_FragColor = vec4(uColor * (0.5 + 0.5 * sin(vUv.x * 20.0 + uTime * 4.0)), 1.0); }';
const vert = 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
[0xff5252, 0x40c4ff].forEach((col, i) => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.8), new THREE.ShaderMaterial({
    uniforms: { uTime, uColor: new THREE.Uniform(new THREE.Color(col)) }, vertexShader: vert, fragmentShader: frag,
  }));
  m.position.x = i * 2 - 1;
  scene.add(m);
});
const copy = uTime.clone();
console.log('clone() 產生獨立的 Uniform：', copy !== uTime);
onFrame((t) => { uTime.value = t; });
` }],
  props: [['.value : Object', 'uniform 的值。']],
  methods: [['.clone() : Uniform', '複製（value 若有 clone 方法也會被複製）。']],
},
]);

/* ================= 動畫：工具類別 ================= */
add('動畫 Animation', [
{
  id: 'api-animationobjectgroup', title: 'AnimationObjectGroup', api: true, src: 'animation/AnimationObjectGroup.js',
  desc: '<p>讓多個物件共用同一個動畫狀態：把群組當作 <code>AnimationMixer</code> 的根物件，所有成員會同步播放，比為每個物件各建立一個 mixer 更有效率。成員必須有相同的結構與名稱。</p>',
  ctor: { sig: 'new AnimationObjectGroup( obj1, obj2, … )' },
  examples: [{ title: '一個 mixer 驅動 25 個物件', code: code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ cameraPosition: [0, 8, 9] });

const group = new THREE.AnimationObjectGroup();
for (let i = 0; i < 25; i++) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), new THREE.MeshStandardMaterial({ color: 0xffffff }));
  m.position.set((i % 5 - 2) * 1.3, 0, (Math.floor(i / 5) - 2) * 1.3);
  scene.add(m);
  group.add(m);
}
const clip = new THREE.AnimationClip('spin', 3, [
  new THREE.QuaternionKeyframeTrack('.quaternion', [0, 1.5, 3], [
    ...new THREE.Quaternion().toArray(),
    ...new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 1, 0).normalize(), Math.PI).toArray(),
    ...new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 1, 0).normalize(), Math.PI * 2).toArray(),
  ]),
  new THREE.ColorKeyframeTrack('.material.color', [0, 1, 2, 3], [1, 0.3, 0.3, 0.3, 1, 0.3, 0.3, 0.3, 1, 1, 0.3, 0.3]),
]);
const mixer = new THREE.AnimationMixer(group);
mixer.clipAction(clip).play();
console.log('群組成員數', group.stats.objects.total, '｜mixer 數量 1');
onFrame((t, dt) => mixer.update(dt));
` }],
  props: [['.stats : Object', '<code>{ objects: { total, inUse }, bindingsPerObject }</code> 統計資訊。'], ['.uuid : String', '識別碼。']],
  methods: [['.add( obj, … ) : undefined', '加入物件。'], ['.remove( obj, … ) : undefined', '移除物件。'], ['.uncache( obj, … ) : undefined', '徹底移除並釋放快取。']],
},
{
  id: 'api-animationutils', title: 'AnimationUtils', api: true, src: 'animation/AnimationUtils.js',
  desc: '<p>處理動畫資料的工具函式（皆為靜態函式）。</p>',
  examples: [{ title: 'subclip 與 makeClipAdditive', consoleOnly: true, code: code`
import * as THREE from 'three';
const track = new THREE.NumberKeyframeTrack('.position[x]', [0, 1, 2, 3, 4], [0, 1, 2, 3, 4]);
const clip = new THREE.AnimationClip('walk', -1, [track]);

// 依「影格」擷取片段（fps = 1 → 第 1 到第 3 格）
const sub = THREE.AnimationUtils.subclip(clip, 'walk-mid', 1, 3, 1);
console.log('subclip times =', Array.from(sub.tracks[0].times), 'values =', Array.from(sub.tracks[0].values));

// 轉成相對於第 0 格的疊加動畫
const additive = THREE.AnimationUtils.makeClipAdditive(clip.clone());
console.log('additive values =', Array.from(additive.tracks[0].values), '｜blendMode =', additive.blendMode === THREE.AdditiveAnimationBlendMode ? 'Additive' : 'Normal');

console.log('getKeyframeOrder([3,1,2]) =', THREE.AnimationUtils.getKeyframeOrder([3, 1, 2]));
console.log('convertArray →', THREE.AnimationUtils.convertArray([1, 2, 3], Float32Array));
` }],
  statics: [
    ['.subclip( clip, name, startFrame, endFrame, fps ) : AnimationClip', '依影格範圍擷取新的 clip（fps 預設 30）。'],
    ['.makeClipAdditive( targetClip, referenceFrame, referenceClip, fps ) : AnimationClip', '把 clip 轉為疊加（additive）動畫：每格的值減去參考影格。'],
    ['.convertArray( array, type, forceClone ) : Array', '轉換陣列型別。'],
    ['.isTypedArray( object ) : Boolean', '是否為 TypedArray。'],
    ['.getKeyframeOrder( times ) : Array', '回傳排序後的索引。'],
    ['.sortedArray( values, stride, order ) : Array', '依索引重新排列。'],
    ['.flattenJSON( jsonKeys, times, values, valuePropertyName ) : undefined', '把 JSON 關鍵影格攤平成陣列。'],
  ],
},
{
  id: 'api-propertybinding', title: 'PropertyBinding', api: true, src: 'animation/PropertyBinding.js',
  desc: '<p>把 track 名稱（例如 <code>"arm.rotation[x]"</code>）解析並綁定到場景中實際物件的屬性。AnimationMixer 內部使用；一般不需要直接操作，但了解其名稱語法很有幫助。</p><p>語法：<code>[節點名稱].[物件名稱][物件索引].屬性名稱[屬性索引]</code>，例如 <code>.position</code>、<code>box.material.color</code>、<code>.morphTargetInfluences[smile]</code>、<code>.bones[Spine].position</code>。</p>',
  ctor: { sig: 'new PropertyBinding( rootNode : Object3D, path : String, parsedPath : Object )' },
  examples: [{ title: '解析與直接綁定', consoleOnly: true, code: code`
import * as THREE from 'three';
console.log(THREE.PropertyBinding.parseTrackName('arm.material.color'));
console.log(THREE.PropertyBinding.parseTrackName('.morphTargetInfluences[smile]'));
console.log('sanitizeNodeName("my arm.L") =', THREE.PropertyBinding.sanitizeNodeName('my arm.L'));

const root = new THREE.Group();
const box = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial());
box.name = 'box';
root.add(box);
const binding = new THREE.PropertyBinding(root, 'box.position[y]');
binding.setValue([5], 0);
console.log('透過 binding 設定後 box.position.y =', box.position.y);
const out = [0];
binding.getValue(out, 0);
console.log('getValue =', out[0]);
` }],
  props: [['.path : String', '原始路徑。'], ['.parsedPath : Object', '解析結果。'], ['.node : Object', '找到的物件。'], ['.rootNode : Object', '根節點。']],
  methods: [['.getValue( targetArray, offset ) : undefined', '讀取屬性值到陣列。'], ['.setValue( sourceArray, offset ) : undefined', '從陣列寫入屬性值。'], ['.bind() / .unbind() : undefined', '建立 / 解除綁定。']],
  statics: [['.create( root, path, parsedPath ) : PropertyBinding', '建立綁定（多個物件時回傳 Composite）。'], ['.parseTrackName( trackName ) : Object', '解析名稱。'], ['.findNode( root, nodeName ) : Object', '依名稱找節點（支援 bones）。'], ['.sanitizeNodeName( name ) : String', '把名稱中的保留字元（. : / [ ]）換成底線。']],
},
{
  id: 'api-propertymixer', title: 'PropertyMixer', api: true, src: 'animation/PropertyMixer.js',
  desc: '<p>AnimationMixer 內部使用的類別：當多個 AnimationAction 作用在同一個屬性時，依權重混合它們的結果，再透過 PropertyBinding 寫回物件。一般不需要直接使用。</p>',
  ctor: { sig: 'new PropertyMixer( binding : PropertyBinding, typeName : String, valueSize : Number )' },
  props: [['.binding : PropertyBinding', '目標屬性。'], ['.buffer : TypedArray', '混合用的暫存區。'], ['.valueSize : Number', '值大小。'], ['.cumulativeWeight : Number', '目前累計權重。'], ['.useCount / .referenceCount : Number', '使用計數。']],
  methods: [['.accumulate( accuIndex, weight ) : undefined', '以權重累加。'], ['.accumulateAdditive( weight ) : undefined', '疊加累加。'], ['.apply( accuIndex ) : undefined', '寫回屬性。'], ['.saveOriginalState() / .restoreOriginalState()', '儲存 / 還原原始值。']],
},
]);

/* ================= 動畫軌道 ================= */
function track(name, kind, n, desc, exCode) {
  return {
    id: 'api-' + name.toLowerCase(), title: name, api: true, inherits: ['KeyframeTrack'], src: 'animation/tracks/' + name + '.js',
    desc: '<p>' + desc + '</p><p>每個關鍵影格的值數量：<b>' + n + '</b>。名稱語法與共通方法見 <a href="#/api-keyframetrack">KeyframeTrack</a>。</p>',
    ctor: { sig: 'new ' + name + '( name : String, times : Array, values : Array' + (kind ? ', interpolation : Constant' : '') + ' )' },
    examples: [{ title: name + ' 範例', code: exCode }],
    props: [['.ValueTypeName : String', '<code>"' + ({ NumberKeyframeTrack: 'number', VectorKeyframeTrack: 'vector', QuaternionKeyframeTrack: 'quaternion', ColorKeyframeTrack: 'color', BooleanKeyframeTrack: 'bool', StringKeyframeTrack: 'string' })[name] + '"</code>'],
      ['.DefaultInterpolation', kind ? '預設插值方式。' : '固定為 InterpolateDiscrete（不可插值）。']],
  };
}
var TRACK_STAGE = code`
import * as THREE from 'three';
import { createStage } from 'doc-stage';
const { scene, onFrame } = createStage({ grid: true, cameraPosition: [0, 3, 6] });
const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0x42a5f5, transparent: true }));
mesh.position.y = 0.5;
scene.add(mesh);
const mixer = new THREE.AnimationMixer(mesh);
onFrame((t, dt) => mixer.update(dt));
`;
add('動畫軌道 Tracks', [
  track('NumberKeyframeTrack', true, 1, '數值屬性的關鍵影格，例如 <code>.material.opacity</code>、<code>.position[x]</code>、<code>.morphTargetInfluences[0]</code>。', TRACK_STAGE + code`
const track = new THREE.NumberKeyframeTrack('.material.opacity', [0, 1, 2], [1, 0.1, 1]);
mixer.clipAction(new THREE.AnimationClip('fade', -1, [track])).play();
console.log('opacity：1 → 0.1 → 1');
`),
  track('VectorKeyframeTrack', true, '2 / 3 / 4（依屬性）', '向量屬性（Vector2/3/4）的關鍵影格，例如 <code>.position</code>、<code>.scale</code>。', TRACK_STAGE + code`
const track = new THREE.VectorKeyframeTrack('.scale', [0, 0.5, 1], [1, 1, 1, 1.6, 0.6, 1.6, 1, 1, 1]);
mixer.clipAction(new THREE.AnimationClip('squash', -1, [track])).play();
console.log('scale 每格 3 個值：', track.getValueSize());
`),
  track('QuaternionKeyframeTrack', true, 4, '四元數旋轉的關鍵影格，作用於 <code>.quaternion</code>。插值時使用球面線性插值（slerp），旋轉路徑最短且平順。', TRACK_STAGE + code`
const axis = new THREE.Vector3(0, 1, 0);
const q = (deg) => new THREE.Quaternion().setFromAxisAngle(axis, THREE.MathUtils.degToRad(deg)).toArray();
const track = new THREE.QuaternionKeyframeTrack('.quaternion', [0, 1, 2], [...q(0), ...q(90), ...q(0)]);
mixer.clipAction(new THREE.AnimationClip('turn', -1, [track])).play();
console.log('Quaternion 插值器：', track.InterpolantFactoryMethodLinear ? 'QuaternionLinearInterpolant' : '');
`),
  track('ColorKeyframeTrack', true, 3, '顏色的關鍵影格（r, g, b，線性色彩空間），例如 <code>.material.color</code>、<code>.material.emissive</code>。', TRACK_STAGE + code`
const track = new THREE.ColorKeyframeTrack('.material.color', [0, 1, 2, 3], [1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0]);
mixer.clipAction(new THREE.AnimationClip('rgb', -1, [track])).play();
console.log('紅 → 綠 → 藍 → 紅');
`),
  track('BooleanKeyframeTrack', false, 1, '布林屬性的關鍵影格，例如 <code>.visible</code>。布林值無法插值，因此只能使用 InterpolateDiscrete（直接切換）。', TRACK_STAGE + code`
const track = new THREE.BooleanKeyframeTrack('.visible', [0, 0.3, 0.6, 0.9, 1.2], [true, false, true, false, true]);
mixer.clipAction(new THREE.AnimationClip('blink', -1, [track])).play();
console.log('visible 在 true / false 之間閃爍');
`),
  track('StringKeyframeTrack', false, 1, '字串屬性的關鍵影格（只能離散切換），例如切換 <code>.name</code> 或自訂的字串屬性。', TRACK_STAGE + code`
mesh.userData.label = '';
const label = document.createElement('div');
label.style.cssText = 'position:absolute;top:10px;left:10px;font-size:22px;color:#fff';
document.body.appendChild(label);
const track = new THREE.StringKeyframeTrack('.name', [0, 1, 2], ['紅色方塊', '綠色方塊', '藍色方塊']);
const colors = new THREE.ColorKeyframeTrack('.material.color', [0, 1, 2], [1, 0, 0, 0, 1, 0, 0, 0, 1], THREE.InterpolateDiscrete);
mixer.clipAction(new THREE.AnimationClip('labels', 3, [track, colors])).play();
onFrame(() => { label.textContent = 'mesh.name = ' + mesh.name; });
`),
]);
})();
