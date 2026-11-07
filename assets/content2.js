/* Three.js 繁中文件內容（第二部分：動畫、互動、載入、進階、數學） */
(function () {
  var code = String.raw;

  window.DOCS.push(
    /* ===================================================== */
    {
      group: '動畫與互動', items: [

        {
          id: 'animation', title: '動畫', en: 'Animation',
          html: `
<p>three.js 中的動畫有兩種做法：</p>
<ol>
<li><b>程式驅動</b>：在渲染迴圈中依時間直接修改物件屬性。簡單、彈性高。</li>
<li><b>動畫系統</b>：用 <code>KeyframeTrack</code> 定義關鍵影格，組成 <code>AnimationClip</code>，再由 <code>AnimationMixer</code> 播放。從 glTF 模型載入的骨架動畫也使用這套系統。</li>
</ol>

<h2>時間控制：Clock / Timer</h2>
<p>不同裝置的更新率不同（60Hz、120Hz…），動畫應根據<b>經過的時間</b>而非幀數。<code>THREE.Clock</code> 提供：</p>
<ul>
<li><code>clock.getDelta()</code>：距離上次呼叫經過的秒數。</li>
<li><code>clock.getElapsedTime()</code>：從開始至今經過的秒數。</li>
</ul>

<h2>動畫系統類別</h2>
<table>
<tr><th>類別</th><th>說明</th></tr>
<tr><td><code>VectorKeyframeTrack</code></td><td>向量屬性（position、scale）的關鍵影格。</td></tr>
<tr><td><code>QuaternionKeyframeTrack</code></td><td>旋轉關鍵影格。</td></tr>
<tr><td><code>ColorKeyframeTrack</code></td><td>顏色關鍵影格。</td></tr>
<tr><td><code>NumberKeyframeTrack</code></td><td>數值（例如 opacity）。</td></tr>
<tr><td><code>AnimationClip</code></td><td>由多條 track 組成的一段動畫。</td></tr>
<tr><td><code>AnimationMixer</code></td><td>動畫播放器，每幀呼叫 <code>mixer.update(delta)</code>。</td></tr>
<tr><td><code>AnimationAction</code></td><td>由 <code>mixer.clipAction(clip)</code> 取得，可 <code>play()</code>、<code>stop()</code>、<code>fadeIn()</code>、設定 <code>loop</code>、<code>timeScale</code>。</td></tr>
</table>
<p>Track 名稱格式為 <code>'物件名稱.屬性'</code>，例如 <code>'.position'</code>（作用在 mixer 的根物件）或 <code>'box.material.color'</code>。</p>
`,
          examples: [{
            title: '以時間為基準的動畫',
            desc: '使用 Clock 讓動畫速度與幀率無關。觀察每個物件不同的運動方式。',
            code: code`
import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x14161b);
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 3, 9);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const l = new THREE.DirectionalLight(0xffffff, 2);
l.position.set(3, 5, 4);
scene.add(l);

const mk = (geo, color, x) => {
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color }));
  m.position.x = x;
  scene.add(m);
  return m;
};
const spinner = mk(new THREE.BoxGeometry(1, 1, 1), 0xff7675, -3);
const bouncer = mk(new THREE.SphereGeometry(0.6, 32, 16), 0x74b9ff, -1);
const pulser = mk(new THREE.OctahedronGeometry(0.7), 0x55efc4, 1);
const orbiter = mk(new THREE.TorusGeometry(0.4, 0.15, 12, 32), 0xffeaa7, 3);

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = clock.getDelta();          // 這一幀經過的秒數
  const t = clock.getElapsedTime();     // 總經過秒數

  spinner.rotation.y += dt * Math.PI;   // 每秒轉半圈
  bouncer.position.y = Math.abs(Math.sin(t * 3)) * 2;
  pulser.scale.setScalar(1 + Math.sin(t * 4) * 0.3);
  orbiter.position.set(3 + Math.cos(t * 2), Math.sin(t * 2), 0);
  orbiter.rotation.x = t;

  renderer.render(scene, camera);
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
`
          }, {
            title: 'AnimationMixer 與關鍵影格',
            desc: '定義位置、旋轉、顏色、縮放的關鍵影格，組合成一個循環播放的動畫片段。按鈕可暫停或改變播放速度。',
            code: code`
import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1d1f27);
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 2, 8);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const l = new THREE.DirectionalLight(0xffffff, 2);
l.position.set(2, 4, 5);
scene.add(l);
scene.add(new THREE.GridHelper(10, 10, 0x444444, 0x333333));

const box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0xff0000 }));
box.name = 'box';
scene.add(box);

// 關鍵影格：times 為秒數，values 依序排列
const times = [0, 1, 2, 3, 4];
const positionKF = new THREE.VectorKeyframeTrack('box.position', times, [
  -3, 0.5, 0,   0, 2.5, 0,   3, 0.5, 0,   0, 0.5, 0,   -3, 0.5, 0,
]);
const yAxis = new THREE.Vector3(0, 1, 0);
const q = (deg) => new THREE.Quaternion().setFromAxisAngle(yAxis, THREE.MathUtils.degToRad(deg)).toArray();
const rotationKF = new THREE.QuaternionKeyframeTrack('box.quaternion', [0, 2, 4], [...q(0), ...q(180), ...q(360)]);
const colorKF = new THREE.ColorKeyframeTrack('box.material.color', [0, 1.3, 2.6, 4], [
  1, 0, 0,   0, 1, 0,   0, 0, 1,   1, 0, 0,
]);
const scaleKF = new THREE.VectorKeyframeTrack('box.scale', [0, 1, 2, 3, 4], [
  1, 1, 1,   0.6, 1.6, 0.6,   1, 1, 1,   1.5, 0.5, 1.5,   1, 1, 1,
]);

const clip = new THREE.AnimationClip('demo', -1, [positionKF, rotationKF, colorKF, scaleKF]);
const mixer = new THREE.AnimationMixer(scene);
const action = mixer.clipAction(clip);
action.play();
console.log('動畫長度：', clip.duration, '秒，tracks：', clip.tracks.map((t) => t.name).join(', '));

// 控制按鈕
const bar = document.createElement('div');
bar.style.cssText = 'position:absolute;top:10px;left:10px;display:flex;gap:6px';
const btn = (text, fn) => {
  const b = document.createElement('button');
  b.textContent = text;
  b.style.cssText = 'padding:6px 10px;cursor:pointer';
  b.onclick = fn;
  bar.appendChild(b);
};
btn('暫停/繼續', () => (action.paused = !action.paused));
btn('0.5x', () => (action.timeScale = 0.5));
btn('1x', () => (action.timeScale = 1));
btn('2x', () => (action.timeScale = 2));
btn('倒轉', () => (action.timeScale *= -1));
document.body.appendChild(bar);

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  mixer.update(clock.getDelta());
  renderer.render(scene, camera);
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
`
          }]
        },

        {
          id: 'controls', title: '相機控制器', en: 'OrbitControls',
          html: `
<p>控制器讓使用者用滑鼠、觸控或鍵盤操控相機。它們位於附加模組中，需要另外 import。</p>
<pre class="code"><code>
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
const controls = new OrbitControls(camera, renderer.domElement);
</code></pre>

<h2>OrbitControls 操作方式</h2>
<table>
<tr><th>操作</th><th>滑鼠</th><th>觸控</th></tr>
<tr><td>旋轉（環繞）</td><td>左鍵拖曳</td><td>單指拖曳</td></tr>
<tr><td>縮放</td><td>滾輪 / 中鍵</td><td>雙指捏合</td></tr>
<tr><td>平移</td><td>右鍵拖曳 / Shift + 左鍵</td><td>雙指拖曳</td></tr>
</table>

<h2>常用屬性</h2>
<table>
<tr><th>屬性</th><th>說明</th></tr>
<tr><td><code>target</code></td><td>環繞中心點（Vector3），修改後需 <code>controls.update()</code>。</td></tr>
<tr><td><code>enableDamping</code> / <code>dampingFactor</code></td><td>慣性阻尼，開啟後每幀必須呼叫 <code>controls.update()</code>。</td></tr>
<tr><td><code>autoRotate</code> / <code>autoRotateSpeed</code></td><td>自動旋轉。</td></tr>
<tr><td><code>minDistance</code> / <code>maxDistance</code></td><td>縮放距離限制。</td></tr>
<tr><td><code>minPolarAngle</code> / <code>maxPolarAngle</code></td><td>垂直角度限制，例如 <code>Math.PI / 2</code> 防止轉到地面下。</td></tr>
<tr><td><code>enableZoom</code> / <code>enablePan</code> / <code>enableRotate</code></td><td>個別啟用 / 停用。</td></tr>
</table>

<h2>其他控制器</h2>
<table>
<tr><th>控制器</th><th>用途</th></tr>
<tr><td><code>MapControls</code></td><td>類似地圖的操作（左鍵平移）。</td></tr>
<tr><td><code>TrackballControls</code></td><td>無上下限制的自由旋轉。</td></tr>
<tr><td><code>FlyControls</code> / <code>FirstPersonControls</code></td><td>飛行 / 第一人稱移動。</td></tr>
<tr><td><code>PointerLockControls</code></td><td>FPS 遊戲式滑鼠鎖定。</td></tr>
<tr><td><code>TransformControls</code></td><td>在場景中拖曳、旋轉、縮放物件的操作把手。</td></tr>
<tr><td><code>DragControls</code></td><td>直接拖曳物件。</td></tr>
</table>
`,
          examples: [{
            title: 'OrbitControls 環繞相機',
            desc: '用滑鼠拖曳旋轉、滾輪縮放、右鍵平移。面板中可切換阻尼、自動旋轉與角度限制。',
            code: code`
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'three/addons/libs/lil-gui.module.min.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202530);
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 200);
camera.position.set(8, 6, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.target.set(0, 1, 0);
controls.minDistance = 3;
controls.maxDistance = 40;
controls.maxPolarAngle = Math.PI / 2 - 0.05; // 不讓相機鑽到地面下
controls.update();

scene.add(new THREE.HemisphereLight(0xffffff, 0x444466, 1.5));
const d = new THREE.DirectionalLight(0xffffff, 1.5);
d.position.set(5, 10, 5);
scene.add(d);
scene.add(new THREE.GridHelper(30, 30, 0x666666, 0x3a3a3a));

// 隨機城市方塊
for (let i = 0; i < 120; i++) {
  const h = 0.5 + Math.random() * 4;
  const b = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, h, 0.8),
    new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(0.55 + Math.random() * 0.1, 0.4, 0.4 + Math.random() * 0.3) })
  );
  b.position.set(Math.round((Math.random() - 0.5) * 24), h / 2, Math.round((Math.random() - 0.5) * 24));
  scene.add(b);
}

controls.addEventListener('end', () => console.log('相機位置：', camera.position));

const gui = new GUI();
gui.add(controls, 'enableDamping').name('阻尼');
gui.add(controls, 'autoRotate').name('自動旋轉');
gui.add(controls, 'autoRotateSpeed', -10, 10, 0.1).name('旋轉速度');
gui.add(controls, 'enablePan').name('允許平移');
gui.add(controls, 'maxPolarAngle', 0.1, Math.PI, 0.01).name('最大俯仰角');
gui.add({ reset: () => controls.reset() }, 'reset').name('重設視角');
controls.saveState();

renderer.setAnimationLoop(() => {
  controls.update(); // 有阻尼或自動旋轉時必須每幀呼叫
  renderer.render(scene, camera);
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
`
          }, {
            title: 'TransformControls 操作把手',
            desc: '點擊物件後出現把手，可拖曳移動。按 W / E / R 切換 移動 / 旋轉 / 縮放 模式。',
            code: code`
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x26292f);
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 100);
camera.position.set(5, 4, 7);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff, 0x333344, 2));
scene.add(new THREE.GridHelper(10, 10));

const orbit = new OrbitControls(camera, renderer.domElement);
const transform = new TransformControls(camera, renderer.domElement);
// 拖曳把手時暫停 OrbitControls，避免同時旋轉相機
transform.addEventListener('dragging-changed', (e) => (orbit.enabled = !e.value));
transform.addEventListener('objectChange', () => {
  const o = transform.object;
  console.log(o.name, '位置', o.position);
});
scene.add(transform.getHelper());

const objects = [];
[[0xe17055, -1.5], [0x00b894, 1.5]].forEach(([color, x], i) => {
  const m = new THREE.Mesh(
    i ? new THREE.SphereGeometry(0.7, 32, 16) : new THREE.BoxGeometry(1.2, 1.2, 1.2),
    new THREE.MeshStandardMaterial({ color })
  );
  m.name = i ? '球體' : '方塊';
  m.position.set(x, 0.7, 0);
  scene.add(m);
  objects.push(m);
});
transform.attach(objects[0]);

// 點擊選取物件
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
renderer.domElement.addEventListener('pointerdown', (e) => {
  if (transform.dragging) return;
  pointer.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(objects)[0];
  if (hit) transform.attach(hit.object);
});
addEventListener('keydown', (e) => {
  const modes = { w: 'translate', e: 'rotate', r: 'scale' };
  if (modes[e.key]) transform.setMode(modes[e.key]);
});

const tip = document.createElement('div');
tip.textContent = '點擊物件選取 · W 移動 · E 旋轉 · R 縮放（請先點一下畫面取得焦點）';
tip.style.cssText = 'position:absolute;left:10px;top:10px;color:#ccc;font-size:13px';
document.body.appendChild(tip);

renderer.setAnimationLoop(() => renderer.render(scene, camera));

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
`
          }]
        },

        {
          id: 'raycaster', title: '滑鼠互動', en: 'Raycaster',
          html: `
<p><code>Raycaster</code> 從某點沿某方向發射一條射線，回傳與之相交的物件。最常見的用途是<b>滑鼠拾取</b>：判斷游標下方是哪個物件。</p>

<h2>使用步驟</h2>
<ol>
<li>把滑鼠座標轉換為<b>標準化裝置座標（NDC）</b>，範圍 -1 ~ 1：
<pre class="code"><code>
pointer.x =  (event.clientX / width)  * 2 - 1;
pointer.y = -(event.clientY / height) * 2 + 1;
</code></pre></li>
<li><code>raycaster.setFromCamera(pointer, camera)</code></li>
<li><code>const hits = raycaster.intersectObjects(scene.children, true)</code></li>
</ol>

<h2>相交結果（陣列，依距離由近到遠排序）</h2>
<table>
<tr><th>欄位</th><th>說明</th></tr>
<tr><td><code>object</code></td><td>被射中的物件。</td></tr>
<tr><td><code>distance</code></td><td>與射線起點的距離。</td></tr>
<tr><td><code>point</code></td><td>交點的世界座標（Vector3）。</td></tr>
<tr><td><code>face</code></td><td>被射中的三角面（含 normal）。</td></tr>
<tr><td><code>uv</code></td><td>交點的貼圖座標。</td></tr>
<tr><td><code>instanceId</code></td><td>若為 InstancedMesh，為被射中的實例索引。</td></tr>
</table>
<div class="tip">若畫布不是全螢幕，請用 <code>renderer.domElement.getBoundingClientRect()</code> 計算相對座標。</div>
`,
          examples: [{
            title: '滑鼠懸停與點擊',
            desc: '游標移到方塊上會高亮，點擊會讓方塊跳起並換色；console 顯示交點座標。',
            code: code`
import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 9, 10);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const l = new THREE.DirectionalLight(0xffffff, 2);
l.position.set(3, 10, 5);
scene.add(l);

const cubes = [];
const geo = new THREE.BoxGeometry(0.9, 0.9, 0.9);
for (let x = -3; x <= 3; x++) for (let z = -3; z <= 3; z++) {
  const c = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x6c8ebf }));
  c.position.set(x * 1.2, 0, z * 1.2);
  c.name = 'cube(' + x + ',' + z + ')';
  c.userData.vy = 0;
  scene.add(c);
  cubes.push(c);
}

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2(10, 10);
let hovered = null;

function updatePointer(e) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
}
renderer.domElement.addEventListener('pointermove', updatePointer);
renderer.domElement.addEventListener('pointerleave', () => pointer.set(10, 10));
renderer.domElement.addEventListener('click', (e) => {
  updatePointer(e);
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(cubes)[0];
  if (!hit) return;
  hit.object.material.color.setHSL(Math.random(), 0.7, 0.55);
  hit.object.userData.vy = 6;
  console.log('點擊', hit.object.name, '交點', hit.point, '距離', hit.distance.toFixed(2));
});

const gravity = -20;
const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.05);

  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(cubes)[0];
  const obj = hit ? hit.object : null;
  if (obj !== hovered) {
    if (hovered) hovered.material.emissive.setHex(0x000000);
    if (obj) obj.material.emissive.setHex(0x553300);
    hovered = obj;
    renderer.domElement.style.cursor = obj ? 'pointer' : 'default';
  }

  for (const c of cubes) {          // 簡單的跳躍物理
    c.userData.vy += gravity * dt;
    c.position.y = Math.max(0, c.position.y + c.userData.vy * dt);
    if (c.position.y === 0) c.userData.vy = 0;
  }
  renderer.render(scene, camera);
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
`
          }, {
            title: '在地面上作畫',
            desc: '利用交點 point 在滑鼠位置放置物件。按住滑鼠拖曳試試看。',
            code: code`
import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101820);
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 12, 10);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff, 0x223344, 2));
const ground = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshStandardMaterial({ color: 0x2d3e50 }));
ground.rotation.x = -Math.PI / 2;
scene.add(ground);
scene.add(new THREE.GridHelper(20, 20, 0x456, 0x345));

const cursor = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.4, 32), new THREE.MeshBasicMaterial({ color: 0xffffff }));
cursor.rotation.x = -Math.PI / 2;
scene.add(cursor);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const dotGeo = new THREE.SphereGeometry(0.2, 12, 8);
let drawing = false, hue = 0, count = 0;

function pick(e) {
  pointer.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  raycaster.setFromCamera(pointer, camera);
  return raycaster.intersectObject(ground)[0];
}
addEventListener('pointerdown', () => (drawing = true));
addEventListener('pointerup', () => { drawing = false; console.log('目前共有', count, '個點'); });
addEventListener('pointermove', (e) => {
  const hit = pick(e);
  if (!hit) return;
  cursor.position.copy(hit.point).setY(0.02);
  if (!drawing) return;
  hue = (hue + 0.005) % 1;
  const dot = new THREE.Mesh(dotGeo, new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(hue, 0.8, 0.6) }));
  dot.position.copy(hit.point).setY(0.2);
  scene.add(dot);
  count++;
});

renderer.setAnimationLoop(() => renderer.render(scene, camera));

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
`
          }]
        }
      ]
    },

    /* ===================================================== */
    {
      group: '載入器', items: [

        {
          id: 'loaders', title: '載入 3D 模型', en: 'GLTFLoader',
          html: `
<p><b>glTF</b>（.gltf / .glb）是 three.js 官方推薦的 3D 格式，被稱為「3D 界的 JPEG」，支援網格、PBR 材質、骨架、動畫、相機等。</p>
<pre class="code"><code>
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
loader.load('model.glb', (gltf) =&gt; {
  scene.add(gltf.scene);
}, (xhr) =&gt; {
  console.log((xhr.loaded / xhr.total * 100) + '% 已載入');
}, (error) =&gt; {
  console.error(error);
});

// 或使用 Promise 版本
const gltf = await loader.loadAsync('model.glb');
</code></pre>

<h2>gltf 物件內容</h2>
<table>
<tr><th>屬性</th><th>說明</th></tr>
<tr><td><code>gltf.scene</code></td><td>模型的根 Group，直接加入場景即可。</td></tr>
<tr><td><code>gltf.animations</code></td><td>AnimationClip 陣列，搭配 AnimationMixer 播放。</td></tr>
<tr><td><code>gltf.cameras</code></td><td>檔案中定義的相機。</td></tr>
<tr><td><code>gltf.asset</code></td><td>檔案資訊（產生器、版本）。</td></tr>
</table>

<h2>其他常用載入器</h2>
<table>
<tr><th>載入器</th><th>格式</th></tr>
<tr><td><code>DRACOLoader</code></td><td>搭配 GLTFLoader 解壓 Draco 壓縮的網格。</td></tr>
<tr><td><code>KTX2Loader</code></td><td>GPU 壓縮貼圖。</td></tr>
<tr><td><code>RGBELoader</code> / <code>EXRLoader</code></td><td>HDR 環境貼圖。</td></tr>
<tr><td><code>FBXLoader</code>、<code>OBJLoader</code>、<code>STLLoader</code>、<code>PLYLoader</code></td><td>其他常見 3D 格式。</td></tr>
<tr><td><code>FontLoader</code> + <code>TextGeometry</code></td><td>3D 文字。</td></tr>
<tr><td><code>LoadingManager</code></td><td>統一追蹤多個載入器的進度。</td></tr>
</table>
<div class="tip">模型看起來太暗？試試設定 <code>scene.environment</code>：<code>new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment()).texture</code>，PBR 材質會因環境反射而更真實。</div>
`,
          examples: [{
            title: '載入帶動畫的 glTF 模型',
            desc: '從 threejs.org 載入鸚鵡模型並播放其內建的飛行動畫。可用滑鼠旋轉視角。',
            code: code`
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa0c4e4);
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 1, 1000);
camera.position.set(0, 40, 180);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const status = document.createElement('div');
status.style.cssText = 'position:absolute;left:10px;top:10px;color:#123;font-size:14px';
status.textContent = '載入中…';
document.body.appendChild(status);

let mixer;
const loader = new GLTFLoader();
loader.load(
  'https://threejs.org/examples/models/gltf/Parrot.glb',
  (gltf) => {
    const model = gltf.scene;
    scene.add(model);

    // 自動置中並計算尺寸
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);
    console.log('模型尺寸：', box.getSize(new THREE.Vector3()));
    console.log('動畫片段：', gltf.animations.map((a) => a.name + '（' + a.duration.toFixed(2) + ' 秒）'));

    mixer = new THREE.AnimationMixer(model);
    gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
    status.textContent = '';
  },
  (xhr) => { if (xhr.total) status.textContent = '載入中… ' + Math.round(xhr.loaded / xhr.total * 100) + '%'; },
  (err) => { status.textContent = '載入失敗'; console.error(err.message || err); }
);

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = clock.getDelta();
  if (mixer) mixer.update(dt);
  controls.update();
  renderer.render(scene, camera);
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
`
          }, {
            title: '3D 文字：FontLoader + TextGeometry',
            desc: '載入 typeface JSON 字型並建立立體文字（內建字型僅支援英文字母）。修改 text 變數試試看。',
            code: code`
import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const text = 'three.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);
const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 1, 9);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);
new OrbitControls(camera, renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 0.3));
const l1 = new THREE.PointLight(0xff3366, 80); l1.position.set(-4, 3, 4);
const l2 = new THREE.PointLight(0x33ccff, 80); l2.position.set(4, -2, 4);
scene.add(l1, l2);

const font = await new FontLoader().loadAsync(
  'https://unpkg.com/three@0.170.0/examples/fonts/helvetiker_bold.typeface.json'
);
const geometry = new TextGeometry(text, {
  font, size: 1, depth: 0.35, curveSegments: 8,
  bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.03, bevelSegments: 4,
});
geometry.center();
const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.4, roughness: 0.25 }));
scene.add(mesh);
console.log('文字網格頂點數：', geometry.attributes.position.count);

renderer.setAnimationLoop((t) => {
  mesh.rotation.y = Math.sin(t / 1500) * 0.4;
  renderer.render(scene, camera);
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
`
          }]
        }
      ]
    },

    /* ===================================================== */
    {
      group: '進階', items: [

        {
          id: 'points', title: '粒子與線條', en: 'Points / Lines',
          html: `
<p>除了 <code>Mesh</code>，three.js 還提供兩種繪製基本圖元的物件：</p>
<table>
<tr><th>物件</th><th>材質</th><th>說明</th></tr>
<tr><td><code>Points</code></td><td><code>PointsMaterial</code></td><td>每個頂點繪製成一個點（粒子、星空、點雲）。</td></tr>
<tr><td><code>Line</code></td><td><code>LineBasicMaterial</code> / <code>LineDashedMaterial</code></td><td>依序連接所有頂點。</td></tr>
<tr><td><code>LineLoop</code></td><td>同上</td><td>首尾相連的線。</td></tr>
<tr><td><code>LineSegments</code></td><td>同上</td><td>每兩個頂點一段線。</td></tr>
</table>

<h2>PointsMaterial 屬性</h2>
<table>
<tr><th>屬性</th><th>說明</th></tr>
<tr><td><code>size</code></td><td>點大小。</td></tr>
<tr><td><code>sizeAttenuation</code></td><td>是否隨距離縮小（預設 true）。</td></tr>
<tr><td><code>vertexColors</code></td><td>使用頂點顏色。</td></tr>
<tr><td><code>map</code> / <code>alphaMap</code></td><td>點的形狀貼圖。</td></tr>
<tr><td><code>blending</code></td><td><code>AdditiveBlending</code> 讓重疊處更亮，適合發光粒子。</td></tr>
</table>
<div class="note">WebGL 中線寬 <code>linewidth</code> 在大部分平台上固定為 1。需要粗線時請使用附加模組 <code>Line2</code> / <code>LineMaterial</code>。</div>
`,
          examples: [{
            title: '螺旋星系',
            desc: '以 50,000 個粒子組成的星系，使用頂點顏色與加法混合。調整參數後重新執行即可產生不同星系。',
            code: code`
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const params = {
  count: 50000,
  radius: 6,
  branches: 4,
  spin: 1.2,
  randomness: 0.35,
  insideColor: '#ff7a3d',
  outsideColor: '#3d6bff',
};

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100);
camera.position.set(4, 5, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const positions = new Float32Array(params.count * 3);
const colors = new Float32Array(params.count * 3);
const inside = new THREE.Color(params.insideColor);
const outside = new THREE.Color(params.outsideColor);

for (let i = 0; i < params.count; i++) {
  const r = Math.random() ** 1.5 * params.radius;
  const branch = ((i % params.branches) / params.branches) * Math.PI * 2;
  const angle = branch + r * params.spin;
  const rand = () => (Math.random() - 0.5) * params.randomness * r * Math.random();

  positions[i * 3] = Math.cos(angle) * r + rand();
  positions[i * 3 + 1] = rand() * 0.5;
  positions[i * 3 + 2] = Math.sin(angle) * r + rand();

  const c = inside.clone().lerp(outside, r / params.radius);
  colors.set([c.r, c.g, c.b], i * 3);
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const galaxy = new THREE.Points(geometry, new THREE.PointsMaterial({
  size: 0.03,
  vertexColors: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
}));
scene.add(galaxy);
console.log('粒子數量：', params.count);

renderer.setAnimationLoop((t) => {
  galaxy.rotation.y = t / 20000;
  controls.update();
  renderer.render(scene, camera);
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
`
          }, {
            title: '曲線與線條',
            desc: '用 CatmullRomCurve3 建立平滑曲線，以 Line 繪製並讓小球沿著曲線移動；TubeGeometry 則把曲線變成管子。',
            code: code`
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 6, 12);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);
new OrbitControls(camera, renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const pl = new THREE.PointLight(0xffffff, 100);
pl.position.set(0, 6, 4);
scene.add(pl);

const curve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-5, 0, 0),
  new THREE.Vector3(-2.5, 3, -2),
  new THREE.Vector3(0, 0, 2),
  new THREE.Vector3(2.5, -2, -1),
  new THREE.Vector3(5, 1, 0),
], true);

// 線條
const line = new THREE.LineLoop(
  new THREE.BufferGeometry().setFromPoints(curve.getPoints(200)),
  new THREE.LineBasicMaterial({ color: 0x00ffcc })
);
scene.add(line);

// 管子（往下偏移）
const tube = new THREE.Mesh(
  new THREE.TubeGeometry(curve, 200, 0.12, 12, true),
  new THREE.MeshStandardMaterial({ color: 0xff8844, roughness: 0.3 })
);
tube.position.y = -3;
scene.add(tube);

// 控制點
curve.points.forEach((p) => {
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  dot.position.copy(p);
  scene.add(dot);
});

const ball = new THREE.Mesh(new THREE.SphereGeometry(0.25, 24, 12), new THREE.MeshStandardMaterial({ color: 0xffee00, emissive: 0x664400 }));
scene.add(ball);
console.log('曲線長度：', curve.getLength().toFixed(3));

renderer.setAnimationLoop((t) => {
  const u = (t / 8000) % 1;
  ball.position.copy(curve.getPointAt(u));
  renderer.render(scene, camera);
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
`
          }]
        },

        {
          id: 'shader', title: '自訂著色器', en: 'ShaderMaterial',
          html: `
<p>當內建材質不夠用時，可以用 <code>ShaderMaterial</code> 撰寫自己的 GLSL 著色器：</p>
<ul>
<li><b>頂點著色器（vertexShader）</b>：對每個頂點執行，決定頂點在畫面上的位置，可以做形變。</li>
<li><b>片段著色器（fragmentShader）</b>：對每個像素執行，決定像素顏色。</li>
</ul>

<h2>ShaderMaterial vs. RawShaderMaterial</h2>
<p><code>ShaderMaterial</code> 會自動注入常用的 uniform 與 attribute：</p>
<table>
<tr><th>名稱</th><th>類型</th><th>說明</th></tr>
<tr><td><code>position</code>、<code>normal</code>、<code>uv</code></td><td>attribute</td><td>頂點資料。</td></tr>
<tr><td><code>modelMatrix</code>、<code>viewMatrix</code></td><td>uniform mat4</td><td>模型 / 視圖矩陣。</td></tr>
<tr><td><code>modelViewMatrix</code>、<code>projectionMatrix</code></td><td>uniform mat4</td><td>常用：<code>projectionMatrix * modelViewMatrix * vec4(position, 1.0)</code></td></tr>
<tr><td><code>normalMatrix</code></td><td>uniform mat3</td><td>法線轉換矩陣。</td></tr>
<tr><td><code>cameraPosition</code></td><td>uniform vec3</td><td>相機世界座標。</td></tr>
</table>
<p><code>RawShaderMaterial</code> 不會注入任何東西，需要自行宣告。</p>

<h2>Uniforms</h2>
<p>從 JavaScript 傳值給著色器：</p>
<pre class="code"><code>
const material = new THREE.ShaderMaterial({
  uniforms: {
    uTime:  { value: 0 },
    uColor: { value: new THREE.Color('orange') },
  },
  vertexShader, fragmentShader,
});
// 每幀更新
material.uniforms.uTime.value = clock.getElapsedTime();
</code></pre>
<p>要修改內建材質的著色器片段，可以使用 <code>material.onBeforeCompile</code>。</p>
`,
          examples: [{
            title: '波動的漸層平面',
            desc: '頂點著色器以正弦波讓平面起伏，片段著色器依高度與 UV 上色。修改 uniform 或 GLSL 後重新執行。',
            code: code`
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05060a);
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 3.5, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);
new OrbitControls(camera, renderer.domElement);

const vertexShader = [
  'uniform float uTime;',
  'uniform float uAmplitude;',
  'varying vec2 vUv;',
  'varying float vHeight;',
  'void main() {',
  '  vUv = uv;',
  '  vec3 p = position;',
  '  float h = sin(p.x * 3.0 + uTime * 2.0) * cos(p.y * 3.0 + uTime * 1.5);',
  '  p.z += h * uAmplitude;',
  '  vHeight = h;',
  '  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);',
  '}',
].join('\n');

const fragmentShader = [
  'uniform vec3 uColorA;',
  'uniform vec3 uColorB;',
  'uniform float uTime;',
  'varying vec2 vUv;',
  'varying float vHeight;',
  'void main() {',
  '  vec3 color = mix(uColorA, uColorB, vHeight * 0.5 + 0.5);',
  '  float grid = step(0.96, fract(vUv.x * 20.0)) + step(0.96, fract(vUv.y * 20.0));',
  '  color += grid * 0.25;',
  '  gl_FragColor = vec4(color, 1.0);',
  '}',
].join('\n');

const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uTime: { value: 0 },
    uAmplitude: { value: 0.35 },
    uColorA: { value: new THREE.Color('#1b1464') },
    uColorB: { value: new THREE.Color('#00e5ff') },
  },
  side: THREE.DoubleSide,
});

const plane = new THREE.Mesh(new THREE.PlaneGeometry(6, 6, 200, 200), material);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  material.uniforms.uTime.value = clock.getElapsedTime();
  renderer.render(scene, camera);
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
`
          }, {
            title: '全螢幕片段著色器',
            desc: '用一個覆蓋整個畫面的平面與正交相機，純粹以片段著色器繪製圖案（類似 Shadertoy）。移動滑鼠會影響圖案。',
            code: code`
import * as THREE from 'three';

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

const uniforms = {
  uTime: { value: 0 },
  uResolution: { value: new THREE.Vector2(innerWidth, innerHeight) },
  uMouse: { value: new THREE.Vector2(0.5, 0.5) },
};

const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader: 'void main() { gl_Position = vec4(position, 1.0); }',
  fragmentShader: [
    'uniform float uTime;',
    'uniform vec2 uResolution;',
    'uniform vec2 uMouse;',
    'void main() {',
    '  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;',
    '  vec2 m = uMouse - 0.5;',
    '  float d = length(uv - m * 0.8);',
    '  float rings = sin(d * 30.0 - uTime * 4.0);',
    '  vec3 col = 0.5 + 0.5 * cos(uTime + uv.xyx * 3.0 + vec3(0.0, 2.0, 4.0));',
    '  col *= smoothstep(0.0, 0.1, abs(rings));',
    '  col *= 1.2 - d;',
    '  gl_FragColor = vec4(col, 1.0);',
    '}',
  ].join('\n'),
});
scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

addEventListener('pointermove', (e) => {
  uniforms.uMouse.value.set(e.clientX / innerWidth, 1 - e.clientY / innerHeight);
});

renderer.setAnimationLoop((t) => {
  uniforms.uTime.value = t / 1000;
  renderer.render(scene, camera);
});

addEventListener('resize', () => {
  renderer.setSize(innerWidth, innerHeight);
  uniforms.uResolution.value.set(innerWidth, innerHeight);
});
`
          }]
        },

        {
          id: 'postprocessing', title: '後期處理', en: 'Post-processing',
          html: `
<p>後期處理（Post-processing）是在場景渲染完成後，對整張畫面套用濾鏡效果，例如泛光、景深、色差、像素化等。使用 <code>EffectComposer</code> 串接多個 Pass：</p>
<pre class="code"><code>
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));   // 第一步：正常渲染場景
composer.addPass(new UnrealBloomPass(size, 1.5, 0.4, 0.85));
composer.addPass(new OutputPass());                // 最後：色調映射與色彩空間轉換

// 渲染迴圈中改用 composer.render() 取代 renderer.render()
</code></pre>

<h2>常用 Pass</h2>
<table>
<tr><th>Pass</th><th>效果</th></tr>
<tr><td><code>UnrealBloomPass</code></td><td>泛光／發光。</td></tr>
<tr><td><code>BokehPass</code></td><td>景深模糊。</td></tr>
<tr><td><code>FilmPass</code></td><td>底片雜訊與掃描線。</td></tr>
<tr><td><code>GlitchPass</code></td><td>故障效果。</td></tr>
<tr><td><code>OutlinePass</code></td><td>物件描邊（選取高亮）。</td></tr>
<tr><td><code>SMAAPass</code> / <code>FXAA</code></td><td>後製反鋸齒。</td></tr>
<tr><td><code>ShaderPass</code></td><td>套用任意自訂著色器。</td></tr>
<tr><td><code>AfterimagePass</code></td><td>殘影。</td></tr>
</table>
<div class="note">使用 EffectComposer 後，記得在 resize 時同時呼叫 <code>composer.setSize(w, h)</code>。</div>
`,
          examples: [{
            title: 'Bloom 泛光效果',
            desc: '自發光（emissive）的物件經過 UnrealBloomPass 後會產生光暈。用面板調整強度、半徑與閾值。',
            code: code`
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import GUI from 'three/addons/libs/lil-gui.module.min.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020205);
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 2, 9);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

scene.add(new THREE.AmbientLight(0xffffff, 0.1));

const rings = [];
for (let i = 0; i < 6; i++) {
  const color = new THREE.Color().setHSL(i / 6, 1, 0.5);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1 + i * 0.45, 0.04, 16, 128),
    new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 2 })
  );
  ring.rotation.x = Math.random() * Math.PI;
  scene.add(ring);
  rings.push(ring);
}
const core = new THREE.Mesh(
  new THREE.IcosahedronGeometry(0.6, 3),
  new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.5 })
);
scene.add(core);

// 後期處理
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 1.2, 0.5, 0.1);
composer.addPass(bloom);
composer.addPass(new OutputPass());

const gui = new GUI();
gui.add(bloom, 'enabled').name('啟用 Bloom');
gui.add(bloom, 'strength', 0, 3, 0.01).name('強度');
gui.add(bloom, 'radius', 0, 1, 0.01).name('半徑');
gui.add(bloom, 'threshold', 0, 1, 0.01).name('閾值');

renderer.setAnimationLoop((t) => {
  rings.forEach((r, i) => { r.rotation.x += 0.003 * (i + 1); r.rotation.y += 0.002 * (6 - i); });
  core.scale.setScalar(1 + Math.sin(t / 300) * 0.08);
  controls.update();
  composer.render();       // 取代 renderer.render()
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  composer.setSize(innerWidth, innerHeight);
});
`
          }]
        },

        {
          id: 'performance', title: '效能與 InstancedMesh', en: 'Performance',
          html: `
<p>每一個 Mesh 通常會產生一次 <b>draw call</b>。draw call 越多，CPU 負擔越重。當需要繪製大量相同幾何體的物件時，應使用 <code>InstancedMesh</code>：一次 draw call 繪製成千上萬個實例。</p>

<h2>InstancedMesh</h2>
<pre class="code"><code>
const mesh = new THREE.InstancedMesh(geometry, material, count);
const matrix = new THREE.Matrix4();
for (let i = 0; i &lt; count; i++) {
  matrix.setPosition(x, y, z);
  mesh.setMatrixAt(i, matrix);
  mesh.setColorAt(i, color);
}
mesh.instanceMatrix.needsUpdate = true; // 之後若有修改
</code></pre>

<h2>效能技巧清單</h2>
<table>
<tr><th>技巧</th><th>說明</th></tr>
<tr><td>共用幾何體與材質</td><td>多個 Mesh 使用同一個 geometry / material 實例。</td></tr>
<tr><td>InstancedMesh / BatchedMesh</td><td>大量重複物件合併為一次 draw call。</td></tr>
<tr><td>合併幾何體</td><td><code>BufferGeometryUtils.mergeGeometries()</code> 合併靜態物件。</td></tr>
<tr><td>限制像素比</td><td><code>renderer.setPixelRatio(Math.min(devicePixelRatio, 2))</code>。</td></tr>
<tr><td>LOD</td><td><code>THREE.LOD</code> 依距離切換不同精細度模型。</td></tr>
<tr><td>陰影</td><td>僅讓必要物件 castShadow，縮小陰影相機範圍。</td></tr>
<tr><td>需要時才渲染</td><td>靜態場景可只在 controls 的 change 事件時呼叫 render。</td></tr>
<tr><td>釋放資源</td><td>移除物件後呼叫 <code>geometry.dispose()</code>、<code>material.dispose()</code>、<code>texture.dispose()</code>，否則 GPU 記憶體不會釋放。</td></tr>
<tr><td>監看</td><td><code>renderer.info</code> 與 <code>Stats</code> 模組。</td></tr>
</table>
`,
          examples: [{
            title: '20,000 個實例',
            desc: 'InstancedMesh 一次 draw call 繪製兩萬個方塊。左上角是 FPS 監看器；console 印出 draw call 數。試著把 count 改成 100000。',
            code: code`
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';

const count = 20000;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0c10);
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 500);
camera.position.set(0, 0, 60);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.autoRotate = true;

const stats = new Stats();
document.body.appendChild(stats.dom);

scene.add(new THREE.HemisphereLight(0xffffff, 0x222244, 2));

const mesh = new THREE.InstancedMesh(
  new THREE.BoxGeometry(0.5, 0.5, 0.5),
  new THREE.MeshStandardMaterial({ roughness: 0.5 }),
  count
);
const dummy = new THREE.Object3D();
const color = new THREE.Color();
const data = [];
for (let i = 0; i < count; i++) {
  // 分布在球殼上
  const r = 15 + Math.random() * 15;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  data.push({ r, theta, phi, speed: 0.1 + Math.random() * 0.3 });
  mesh.setColorAt(i, color.setHSL(r / 30, 0.7, 0.55));
}
scene.add(mesh);

const clock = new THREE.Clock();
let logged = false;
renderer.setAnimationLoop(() => {
  const t = clock.getElapsedTime();
  for (let i = 0; i < count; i++) {
    const d = data[i];
    const th = d.theta + t * d.speed;
    dummy.position.setFromSphericalCoords(d.r, d.phi, th);
    dummy.rotation.set(t * d.speed * 3, th, 0);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;

  controls.update();
  renderer.render(scene, camera);
  stats.update();

  if (!logged) {
    logged = true;
    console.log('實例數：', count, '｜draw calls：', renderer.info.render.calls,
      '｜三角形：', renderer.info.render.triangles);
  }
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
`
          }]
        },

        {
          id: 'helpers', title: '輔助物件', en: 'Helpers',
          html: `
<p>輔助物件用來視覺化座標軸、網格、包圍盒、光源方向等，是除錯的好幫手。</p>
<table>
<tr><th>類別</th><th>用途</th></tr>
<tr><td><code>AxesHelper(size)</code></td><td>顯示 XYZ 軸：<span style="color:#e5534b">X 紅</span>、<span style="color:#3aa55d">Y 綠</span>、<span style="color:#4a8cff">Z 藍</span>。</td></tr>
<tr><td><code>GridHelper(size, divisions)</code></td><td>地面網格。</td></tr>
<tr><td><code>PolarGridHelper</code></td><td>極座標網格。</td></tr>
<tr><td><code>BoxHelper(object)</code></td><td>物件的包圍盒線框（需呼叫 update()）。</td></tr>
<tr><td><code>Box3Helper(box3)</code></td><td>顯示一個 Box3。</td></tr>
<tr><td><code>ArrowHelper(dir, origin, length, color)</code></td><td>箭頭，可表示向量。</td></tr>
<tr><td><code>CameraHelper(camera)</code></td><td>顯示相機視錐。</td></tr>
<tr><td><code>PlaneHelper(plane)</code></td><td>顯示一個數學平面。</td></tr>
<tr><td><code>SkeletonHelper(object)</code></td><td>顯示骨架。</td></tr>
<tr><td>各種 <code>LightHelper</code></td><td>顯示光源位置與方向。</td></tr>
</table>
`,
          examples: [{
            title: '輔助物件總覽',
            desc: '中央物件的包圍盒、表面法線箭頭與副相機的視錐，全部即時更新。',
            code: code`
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1c1c1c);
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 100);
camera.position.set(7, 6, 9);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);
new OrbitControls(camera, renderer.domElement);

scene.add(new THREE.AxesHelper(3));
scene.add(new THREE.GridHelper(12, 12, 0x888888, 0x444444));
const polar = new THREE.PolarGridHelper(5, 8, 5, 64, 0x335577, 0x335577);
polar.position.y = 0.01;
scene.add(polar);

scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const dl = new THREE.DirectionalLight(0xffffff, 2);
dl.position.set(3, 5, 2);
scene.add(dl, new THREE.DirectionalLightHelper(dl, 0.6));

const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(0.8, 0.25, 100, 16), new THREE.MeshStandardMaterial({ color: 0xcc8844 }));
knot.position.y = 2;
scene.add(knot);
const boxHelper = new THREE.BoxHelper(knot, 0xffff00);
scene.add(boxHelper);

const arrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 2, 0), 2.5, 0x00ffff, 0.4, 0.2);
scene.add(arrow);

// 副相機與其視錐
const subCam = new THREE.PerspectiveCamera(40, 1.5, 0.5, 4);
subCam.position.set(-4, 2, 3);
subCam.lookAt(knot.position);
const camHelper = new THREE.CameraHelper(subCam);
scene.add(subCam, camHelper);

const dir = new THREE.Vector3();
renderer.setAnimationLoop((t) => {
  const s = t / 1000;
  knot.rotation.set(s * 0.5, s, 0);
  knot.position.x = Math.sin(s) * 1.5;
  boxHelper.update();

  dir.set(Math.cos(s), Math.sin(s * 0.7) * 0.5, Math.sin(s)).normalize();
  arrow.setDirection(dir);

  subCam.lookAt(knot.position);
  camHelper.update();
  renderer.render(scene, camera);
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
`
          }]
        }
      ]
    },

    /* ===================================================== */
    {
      group: '數學', items: [

        {
          id: 'math-vector', title: '向量 Vector3', en: 'Vector2 / Vector3',
          html: `
<p><code>Vector3</code> 表示三維空間中的點或方向，是 three.js 中最常用的數學類別。大多數方法會<b>直接修改自身並回傳 this</b>，因此可以鏈式呼叫；若不想改動原向量，請先 <code>clone()</code>。</p>
<table>
<tr><th>方法</th><th>說明</th></tr>
<tr><td><code>set(x, y, z)</code> / <code>copy(v)</code> / <code>clone()</code></td><td>設定、複製。</td></tr>
<tr><td><code>add(v)</code> / <code>sub(v)</code></td><td>向量加 / 減。</td></tr>
<tr><td><code>addVectors(a, b)</code> / <code>subVectors(a, b)</code></td><td>this = a ± b。</td></tr>
<tr><td><code>multiplyScalar(s)</code> / <code>divideScalar(s)</code></td><td>純量乘 / 除。</td></tr>
<tr><td><code>length()</code> / <code>lengthSq()</code></td><td>長度 / 長度平方（較快，適合比較）。</td></tr>
<tr><td><code>normalize()</code></td><td>正規化為單位向量。</td></tr>
<tr><td><code>dot(v)</code></td><td>內積：判斷夾角、投影。</td></tr>
<tr><td><code>cross(v)</code> / <code>crossVectors(a, b)</code></td><td>外積：求垂直於兩向量的向量。</td></tr>
<tr><td><code>distanceTo(v)</code></td><td>兩點距離。</td></tr>
<tr><td><code>angleTo(v)</code></td><td>夾角（弧度）。</td></tr>
<tr><td><code>lerp(v, t)</code></td><td>線性插值。</td></tr>
<tr><td><code>applyMatrix4(m)</code> / <code>applyQuaternion(q)</code></td><td>套用矩陣 / 旋轉。</td></tr>
<tr><td><code>project(camera)</code> / <code>unproject(camera)</code></td><td>世界座標 ↔ 螢幕 NDC 座標。</td></tr>
</table>
`,
          examples: [{
            title: '向量運算練習',
            desc: '純數學運算，結果顯示在下方輸出區。修改數值後重新執行看看。',
            consoleOnly: true,
            code: code`
import * as THREE from 'three';

const a = new THREE.Vector3(1, 2, 3);
const b = new THREE.Vector3(4, 0, -1);

console.log('a =', a, ' b =', b);
console.log('a + b =', a.clone().add(b));
console.log('a - b =', a.clone().sub(b));
console.log('a × 2 =', a.clone().multiplyScalar(2));
console.log('|a| =', a.length().toFixed(4));
console.log('a 正規化 =', a.clone().normalize());
console.log('a · b（內積）=', a.dot(b));
console.log('a × b（外積）=', new THREE.Vector3().crossVectors(a, b));
console.log('a 到 b 的距離 =', a.distanceTo(b).toFixed(4));
console.log('夾角 =', THREE.MathUtils.radToDeg(a.angleTo(b)).toFixed(2), '度');
console.log('lerp(a, b, 0.25) =', a.clone().lerp(b, 0.25));

// 注意：大多數方法會修改自身！
const c = new THREE.Vector3(1, 1, 1);
c.add(b);
console.log('c.add(b) 之後，c 已被修改為', c);

// 投影：把 b 投影到 x 軸
console.log('b 投影到 (1,0,0) =', b.clone().projectOnVector(new THREE.Vector3(1, 0, 0)));
`
          }, {
            title: '視覺化：內積與外積',
            desc: '紅、綠箭頭為向量 a、b；藍色箭頭為 a × b（永遠垂直於兩者）。左上角顯示即時內積。',
            code: code`
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x151515);
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 100);
camera.position.set(4, 4, 6);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);
new OrbitControls(camera, renderer.domElement);
scene.add(new THREE.GridHelper(8, 8, 0x444444, 0x2a2a2a));

const origin = new THREE.Vector3();
const arrowA = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), origin, 2, 0xff5555, 0.3, 0.15);
const arrowB = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), origin, 2, 0x55ff55, 0.3, 0.15);
const arrowC = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), origin, 2, 0x5599ff, 0.3, 0.15);
scene.add(arrowA, arrowB, arrowC);

const info = document.createElement('div');
info.style.cssText = 'position:absolute;left:10px;top:10px;font:13px monospace;color:#ddd;line-height:1.6';
document.body.appendChild(info);

const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
renderer.setAnimationLoop((t) => {
  const s = t / 1000;
  a.set(Math.cos(s), 0.3, Math.sin(s)).normalize();
  b.set(Math.cos(s * 0.6 + 2), -0.2, Math.sin(s * 0.6 + 2)).normalize();
  c.crossVectors(a, b);

  arrowA.setDirection(a);
  arrowB.setDirection(b);
  arrowC.setDirection(c.clone().normalize());
  arrowC.setLength(Math.max(c.length() * 2, 0.01), 0.3, 0.15);

  info.innerHTML =
    '<span style="color:#f55">a</span> · <span style="color:#5f5">b</span> = ' + a.dot(b).toFixed(3) +
    '<br>夾角 = ' + THREE.MathUtils.radToDeg(a.angleTo(b)).toFixed(1) + '°' +
    '<br><span style="color:#59f">|a × b|</span> = ' + c.length().toFixed(3);
  renderer.render(scene, camera);
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
`
          }]
        },

        {
          id: 'math-rotation', title: '旋轉與矩陣', en: 'Euler / Quaternion / Matrix4',
          html: `
<p>three.js 中表示旋轉的方式有三種：</p>
<table>
<tr><th>類別</th><th>說明</th><th>優缺點</th></tr>
<tr><td><code>Euler</code></td><td>繞 X、Y、Z 軸的角度（弧度）與旋轉順序。</td><td>直覺，但有萬向鎖問題、插值不平順。</td></tr>
<tr><td><code>Quaternion</code></td><td>四元數 (x, y, z, w)。</td><td>無萬向鎖、可平滑插值（<code>slerp</code>），但不直覺。</td></tr>
<tr><td><code>Matrix4</code></td><td>4×4 矩陣，同時包含位移、旋轉、縮放。</td><td>功能最完整，可組合多個變換。</td></tr>
</table>

<h2>常用方法</h2>
<table>
<tr><th>方法</th><th>說明</th></tr>
<tr><td><code>quaternion.setFromAxisAngle(axis, angle)</code></td><td>繞指定軸旋轉。</td></tr>
<tr><td><code>quaternion.setFromEuler(euler)</code></td><td>由尤拉角轉換。</td></tr>
<tr><td><code>quaternion.slerp(qb, t)</code></td><td>球面線性插值。</td></tr>
<tr><td><code>object.quaternion.rotateTowards(q, step)</code></td><td>逐步轉向目標。</td></tr>
<tr><td><code>matrix.compose(pos, quat, scale)</code></td><td>由位移、旋轉、縮放組成矩陣。</td></tr>
<tr><td><code>matrix.decompose(pos, quat, scale)</code></td><td>拆解矩陣。</td></tr>
<tr><td><code>matrix.multiply(m)</code></td><td>矩陣相乘（this = this × m）。</td></tr>
<tr><td><code>matrix.invert()</code></td><td>反矩陣。</td></tr>
<tr><td><code>matrix.makeRotationY(θ)</code> / <code>makeTranslation(x,y,z)</code></td><td>產生特定變換矩陣。</td></tr>
</table>
<p>另外，<code>MathUtils</code> 提供 <code>degToRad</code>、<code>radToDeg</code>、<code>clamp</code>、<code>lerp</code>、<code>damp</code>、<code>smoothstep</code>、<code>randFloat</code>、<code>mapLinear</code> 等工具函式。</p>
`,
          examples: [{
            title: '旋轉表示法互相轉換',
            consoleOnly: true,
            desc: '同一個旋轉以 Euler、Quaternion、Matrix4 三種方式表示，並驗證結果一致。',
            code: code`
import * as THREE from 'three';
const { degToRad } = THREE.MathUtils;

// 繞 Y 軸 90 度
const euler = new THREE.Euler(0, degToRad(90), 0, 'XYZ');
const quat = new THREE.Quaternion().setFromEuler(euler);
const mat = new THREE.Matrix4().makeRotationFromQuaternion(quat);

console.log('Euler =', euler);
console.log('Quaternion =', quat);
console.log(mat);

// 對同一個向量套用三種旋轉
const v = new THREE.Vector3(1, 0, 0);
console.log('applyEuler      →', v.clone().applyEuler(euler));
console.log('applyQuaternion →', v.clone().applyQuaternion(quat));
console.log('applyMatrix4    →', v.clone().applyMatrix4(mat));

// 組合變換：先縮放、再旋轉、最後位移
const m = new THREE.Matrix4().compose(
  new THREE.Vector3(10, 0, 0),
  quat,
  new THREE.Vector3(2, 2, 2)
);
console.log('compose 後套用到 (1,0,0) →', new THREE.Vector3(1, 0, 0).applyMatrix4(m));

// 拆解
const p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3();
m.decompose(p, q, s);
console.log('decompose → 位置', p, '縮放', s);

// 反矩陣可以把點轉回來
console.log('反矩陣還原 →', new THREE.Vector3(10, 0, -2).applyMatrix4(m.clone().invert()));

// 四元數插值
const q2 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), degToRad(180));
const half = quat.clone().slerp(q2, 0.5);
console.log('slerp(90°, 180°, 0.5) 對應角度 =',
  THREE.MathUtils.radToDeg(new THREE.Euler().setFromQuaternion(half).y).toFixed(1), '度');
`
          }, {
            title: 'Euler 與 Quaternion 插值比較',
            desc: '兩個方塊從相同的起始旋轉轉到相同的目標旋轉：左邊直接插值 Euler 角，右邊用 Quaternion.slerp。注意左邊的路徑不自然。',
            code: code`
import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1f2229);
const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 2, 8);
camera.lookAt(0, 0, 0);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 2.5));

const makeBox = (x) => {
  const g = new THREE.Group();
  const box = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4, 2), new THREE.MeshStandardMaterial({ color: 0xdddddd }));
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.6, 16), new THREE.MeshStandardMaterial({ color: 0xff4444 }));
  nose.rotation.x = Math.PI / 2;
  nose.position.z = 1.3;
  g.add(box, nose, new THREE.AxesHelper(1.5));
  g.position.x = x;
  scene.add(g);
  return g;
};
const left = makeBox(-2), right = makeBox(2);

const label = document.createElement('div');
label.style.cssText = 'position:absolute;bottom:12px;left:0;right:0;display:flex;justify-content:space-around;color:#ccc;font-size:14px';
label.innerHTML = '<span>Euler 角線性插值</span><span>Quaternion.slerp</span>';
document.body.appendChild(label);

const e0 = new THREE.Euler(0, 0, 0);
const e1 = new THREE.Euler(Math.PI * 0.9, Math.PI * 0.5, Math.PI * 0.7);
const q0 = new THREE.Quaternion().setFromEuler(e0);
const q1 = new THREE.Quaternion().setFromEuler(e1);

renderer.setAnimationLoop((t) => {
  const k = THREE.MathUtils.smoothstep(Math.sin(t / 1200) * 0.5 + 0.5, 0, 1);
  left.rotation.set(
    THREE.MathUtils.lerp(e0.x, e1.x, k),
    THREE.MathUtils.lerp(e0.y, e1.y, k),
    THREE.MathUtils.lerp(e0.z, e1.z, k)
  );
  right.quaternion.slerpQuaternions(q0, q1, k);
  renderer.render(scene, camera);
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
`
          }]
        },

        {
          id: 'math-color', title: '顏色 Color', en: 'Color',
          html: `
<p><code>Color</code> 以 r、g、b（0–1 的浮點數）儲存顏色，可以用多種格式建立：</p>
<pre class="code"><code>
new THREE.Color(0xff0000);          // 十六進位
new THREE.Color('red');             // CSS 色名
new THREE.Color('#ff0000');         // CSS 十六進位字串
new THREE.Color('rgb(255, 0, 0)');  // CSS rgb()
new THREE.Color('hsl(0, 100%, 50%)');
new THREE.Color(1, 0, 0);           // r, g, b
</code></pre>
<table>
<tr><th>方法</th><th>說明</th></tr>
<tr><td><code>set(value)</code></td><td>以上述任意格式設定。</td></tr>
<tr><td><code>setHSL(h, s, l)</code> / <code>getHSL(target)</code></td><td>以色相、飽和度、亮度設定 / 取得（0–1）。</td></tr>
<tr><td><code>getHex()</code> / <code>getHexString()</code> / <code>getStyle()</code></td><td>轉成數字 / 字串 / CSS 字串。</td></tr>
<tr><td><code>lerp(color, t)</code> / <code>lerpColors(a, b, t)</code></td><td>顏色插值。</td></tr>
<tr><td><code>offsetHSL(h, s, l)</code></td><td>位移 HSL。</td></tr>
<tr><td><code>multiplyScalar(s)</code></td><td>調整亮度（可超過 1，用於 HDR 發光）。</td></tr>
</table>
<div class="tip">three.js 的色彩管理預設開啟：以 hex / CSS 字串設定的顏色被視為 sRGB，內部會轉換成線性色彩空間計算光照，因此 <code>color.r</code> 的值可能和你預期的 0–255 / 255 不同。</div>
`,
          examples: [{
            title: 'HSL 色輪',
            desc: '用 setHSL 產生色相環，每個方塊的顏色與亮度隨時間變化。',
            code: code`
import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color('#181818');
const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 9, 9);
camera.lookAt(0, 0, 0);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

const rings = 5, perRing = 36;
const cells = [];
const geo = new THREE.BoxGeometry(0.35, 0.35, 0.35);
for (let r = 0; r < rings; r++) {
  for (let i = 0; i < perRing; i++) {
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial());
    const a = (i / perRing) * Math.PI * 2;
    const radius = 1.5 + r * 0.7;
    m.position.set(Math.cos(a) * radius, 0, Math.sin(a) * radius);
    m.userData = { h: i / perRing, l: 0.25 + (r / (rings - 1)) * 0.5 };
    scene.add(m);
    cells.push(m);
  }
}
const sample = new THREE.Color().setHSL(0.6, 0.8, 0.5);
console.log('HSL(0.6, 0.8, 0.5) → #' + sample.getHexString(), '／', sample.getStyle());
console.log('red lerp blue 0.5 →', new THREE.Color('red').lerp(new THREE.Color('blue'), 0.5));

renderer.setAnimationLoop((t) => {
  const s = t / 1000;
  for (const c of cells) {
    const { h, l } = c.userData;
    c.material.color.setHSL((h + s * 0.05) % 1, 0.85, l);
    c.position.y = Math.sin(h * Math.PI * 4 + s * 2) * 0.3 * l;
  }
  scene.rotation.y = s * 0.1;
  renderer.render(scene, camera);
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
`
          }]
        }
      ]
    }
  );
})();
