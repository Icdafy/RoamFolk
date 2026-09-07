import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
export interface PreviewController { zoom(direction: number): void; reset(): void; dispose(): void }
type Callbacks = { ready(): void; error(message: string): void };
function releaseObject(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  root.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
    geometries.add(object.geometry);
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material);
  });
  for (const material of materials) {
    for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value);
    material.dispose();
  }
  for (const texture of textures) texture.dispose();
  for (const geometry of geometries) geometry.dispose();
}
/** Demand rendering; no animation loop or per-frame React updates. */
export function createPreview(host: HTMLElement, callbacks: Callbacks): PreviewController {
  let disposed = false;
  let renderer: THREE.WebGLRenderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); }
  catch { callbacks.error('无法启动 3D 画面。请启用浏览器硬件加速后重试；楼层状态仍可查看。'); return { zoom() {}, reset() {}, dispose() {} }; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-9, 9, 9, -9, 0.1, 100);
  camera.position.set(12, 11, 16);
  camera.lookAt(0, 1.4, 0);
  scene.add(new THREE.HemisphereLight(0xfff7df, 0x77868c, 2.5));
  const sun = new THREE.DirectionalLight(0xffe4be, 4);
  sun.position.set(-5, 12, 7);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, far: 40 });
  sun.shadow.normalBias = 0.03;
  scene.add(sun);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ opacity: 0.12 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -0.1; ground.receiveShadow = true; scene.add(ground);
  function render() { if (!disposed && !document.hidden) renderer.render(scene, camera); }
  function resize() {
    if (disposed) return;
    const width = Math.max(host.clientWidth, 1), height = Math.max(host.clientHeight, 1);
    const aspect = width / height, halfHeight = Math.max(6.5, 8 / aspect);
    camera.left = -halfHeight * aspect; camera.right = halfHeight * aspect;
    camera.top = halfHeight; camera.bottom = -halfHeight; camera.updateProjectionMatrix();
    renderer.setSize(width, height); render();
  }
  const observer = new ResizeObserver(resize); observer.observe(host);
  const abort = new AbortController();
  const timeout = setTimeout(() => abort.abort(), 20000);
  fetch('/assets/models/pipeline-sample.glb', { signal: abort.signal })
    .then(response => { if (!response.ok) throw new Error('asset-response'); return response.arrayBuffer(); })
    .then(data => new GLTFLoader().parseAsync(data, '/assets/models/'))
    .then(gltf => {
      if (disposed) { releaseObject(gltf.scene); return; }
      gltf.scene.traverse(object => { if (object instanceof THREE.Mesh) { object.castShadow = true; object.receiveShadow = true; } });
      scene.add(gltf.scene); render(); callbacks.ready();
    }).catch(() => { if (!disposed) callbacks.error('模型加载失败或连接超时，请重新加载。'); })
    .finally(() => clearTimeout(timeout));
  const contextLost = (event: Event) => { event.preventDefault(); callbacks.error('3D 画面已中断，请重新加载。'); };
  renderer.domElement.addEventListener('webglcontextlost', contextLost);
  document.addEventListener('visibilitychange', render); resize();
  return {
    zoom(direction) { camera.zoom = THREE.MathUtils.clamp(camera.zoom + direction * 0.15, 0.7, 1.6); camera.updateProjectionMatrix(); render(); },
    reset() { camera.zoom = 1; camera.updateProjectionMatrix(); render(); },
    dispose() {
      if (disposed) return;
      disposed = true; abort.abort(); clearTimeout(timeout); observer.disconnect();
      document.removeEventListener('visibilitychange', render);
      renderer.domElement.removeEventListener('webglcontextlost', contextLost);
      releaseObject(scene); sun.shadow.dispose(); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
    },
  };
}
