/**
 * 3D model viewer for project pages.
 *
 *   <figure class="model-viewer" data-model-viewer>
 *     <div class="model-viewer__stage"> poster <img> + a [data-mv-load] button </div>
 *     <div class="model-viewer__bar"> [data-mv-view="outside|inside|above"], [data-mv-clay], [data-mv-cut],
 *       [data-mv-full] </div>
 *     <div class="model-viewer__cut"> [data-mv-axis="y|x|z"], [data-mv-cut-at] (range 0–1000), [data-mv-flip] </div>
 *     <a data-mv-src href="model.glb" download>…</a>   (the model to load)
 *   </figure>
 *
 * three.js (about 1 MB) is loaded only when the visitor presses the button, through the
 * page's import map ("three", "three/addons/"), from assets/vendor/three/.
 * Models are Draco-compressed glTF (.glb), made with tools/models/ (see its README).
 * It renders on demand (only while something moves), not every frame.
 */

// The Draco decoder (draco_decoder.wasm + draco_wasm_wrapper.js) is loaded from this folder
const DRACO_WASM = new URL("../vendor/three/addons/libs/draco/gltf/draco_decoder.wasm", import.meta.url);

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

for (const fig of document.querySelectorAll("[data-model-viewer]")) {
  const button = fig.querySelector("[data-mv-load]");
  button?.addEventListener("click", () => start(fig), { once: true });
}

async function start(fig) {
  const stage = fig.querySelector(".model-viewer__stage");
  const status = fig.querySelector("[data-mv-status]");
  const src = fig.querySelector("[data-mv-src]").href;
  fig.classList.add("is-loading");
  const say = (text) => status && (status.textContent = text);
  say("Loading the viewer…");

  let THREE, OrbitControls, GLTFLoader, DRACOLoader, RoomEnvironment;
  try {
    [THREE, { OrbitControls }, { GLTFLoader }, { DRACOLoader }, { RoomEnvironment }] = await Promise.all([
      import("three"),
      import("three/addons/controls/OrbitControls.js"),
      import("three/addons/loaders/GLTFLoader.js"),
      import("three/addons/loaders/DRACOLoader.js"),
      import("three/addons/environments/RoomEnvironment.js"),
    ]);
  } catch (err) {
    return fail(fig, say, err);
  }

  // --- Renderer, scene, camera ------------------------------------------------
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.domElement.className = "model-viewer__canvas";
  renderer.domElement.setAttribute("aria-label", fig.dataset.label || "3D model");
  renderer.domElement.setAttribute("role", "img");

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.7;
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d2c4, 0.8));
  const sun = new THREE.DirectionalLight(0xfff4e0, 2.2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.bias = -0.0004;
  scene.add(sun, sun.target);

  const camera = new THREE.PerspectiveCamera(40, 1, 0.05, 500);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = !reduceMotion;
  controls.dampingFactor = 0.08;
  controls.maxPolarAngle = Math.PI * 0.495; // stay above the ground
  controls.screenSpacePanning = true;
  // The page scrolls over the model until the visitor presses on it; zoom only after that
  controls.enableZoom = false;
  renderer.domElement.addEventListener("pointerdown", () => (controls.enableZoom = true));
  renderer.domElement.addEventListener("pointerleave", (e) => {
    if (e.pointerType === "mouse") controls.enableZoom = false;
  });

  // --- Render on demand -----------------------------------------------------------
  let queued = false;
  let tween = null;
  const frame = (now) => {
    queued = false;
    if (tween) stepTween(now);
    if (controls.update() || tween) request();
    renderer.render(scene, camera);
  };
  const request = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(frame);
    }
  };
  controls.addEventListener("change", request);

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = stage;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    request();
  };
  new ResizeObserver(resize).observe(stage);

  // --- Load the model ------------------------------------------------------------
  say("Loading the model…");
  const draco = new DRACOLoader().setDecoderPath(new URL(".", DRACO_WASM).href);
  const loader = new GLTFLoader().setDRACOLoader(draco);
  let gltf;
  try {
    gltf = await loader.loadAsync(src, (e) => {
      if (e.lengthComputable) say(`Loading the model… ${Math.round((e.loaded / e.total) * 100)}%`);
    });
  } catch (err) {
    return fail(fig, say, err);
  }
  draco.dispose();

  const model = gltf.scene;
  model.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = o.receiveShadow = true;
    for (const m of [o.material].flat()) {
      // SketchUp faces are one-sided and often drawn inside out
      m.side = THREE.DoubleSide;
      // The glass comes through the export opaque; make it read as glass again
      if (/glass/i.test(m.name)) {
        m.transparent = true;
        m.opacity = 0.28;
        m.depthWrite = false;
        m.roughness = 0.05;
        m.metalness = 0;
        o.castShadow = false;
      } else if (m.transparent) {
        // Already see-through (e.g. Rhino/Enscape glass): don't hide what's behind it
        m.depthWrite = false;
        o.castShadow = false;
      }
    }
  });
  scene.add(model);

  // Framing from the model's size (models are exported with the floor at y = 0)
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const centre = box.getCenter(new THREE.Vector3());
  const span = Math.max(size.x, size.z);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(span * 6, span * 6),
    new THREE.ShadowMaterial({ opacity: 0.16 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = box.min.y - 0.002;
  ground.receiveShadow = true;
  scene.add(ground);

  sun.position.set(centre.x + span, box.max.y + span * 1.4, centre.z + span * 0.6);
  sun.target.position.copy(centre);
  const sc = sun.shadow.camera;
  sc.left = sc.bottom = -span;
  sc.right = sc.top = span;
  sc.far = span * 5;
  sc.updateProjectionMatrix();

  controls.minDistance = 0.3;
  controls.maxDistance = span * 5;

  // Look from direction (x, y, z), just far enough back that the model
  // fills 85% of the frame (a few rounds of: project its points, move to fit)
  camera.aspect = stage.clientWidth / stage.clientHeight || 1.6;
  // A sample of real vertices, not the box's corners: a site drawn at an angle has a much bigger
  // box than silhouette
  const corners = [];
  model.updateMatrixWorld(true);
  model.traverse((o) => {
    if (!o.isMesh) return;
    const pos = o.geometry.attributes.position;
    const step = Math.max(1, Math.floor(pos.count / 1500));
    for (let i = 0; i < pos.count; i += step) {
      corners.push(new THREE.Vector3().fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld));
    }
  });
  const probe = camera.clone();
  const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  // `keep` narrows the points to fit, e.g. to the half a section cut leaves
  const fitView = (x, y, z, keep = () => true) => {
    const kept = corners.filter(keep);
    const points = kept.length > 20 ? kept : corners;
    const dir = new THREE.Vector3(x, y, z).normalize();
    const target = centre.clone();
    let dist = size.length();
    for (let i = 0; i < 8; i++) {
      probe.position.copy(dir).multiplyScalar(dist).add(target);
      probe.lookAt(target);
      probe.updateMatrixWorld();
      probe.updateProjectionMatrix();
      let [x0, x1, y0, y1] = [Infinity, -Infinity, Infinity, -Infinity];
      for (const c of points) {
        const p = c.clone().project(probe);
        [x0, x1, y0, y1] = [Math.min(x0, p.x), Math.max(x1, p.x), Math.min(y0, p.y), Math.max(y1, p.y)];
      }
      // Aim at the middle of what's seen, then move to fit it
      const right = new THREE.Vector3().setFromMatrixColumn(probe.matrixWorld, 0);
      const up = new THREE.Vector3().setFromMatrixColumn(probe.matrixWorld, 1);
      target.addScaledVector(right, ((x0 + x1) / 2) * dist * tanHalf * probe.aspect)
        .addScaledVector(up, ((y0 + y1) / 2) * dist * tanHalf);
      dist *= Math.max((x1 - x0) / 2, (y1 - y0) / 2) / 0.85;
    }
    return { position: dir.multiplyScalar(dist).add(target).toArray(), target: target.toArray() };
  };
  const eye = Math.min(1.5, size.y * 0.5);
  // The building itself, not its site: where most of the detail (vertices) is. Its middle is the
  // median point, its size the spread of the middle 80% (a street or context blocks are sparse)
  const pct = (axis, q) => corners.map((c) => c[axis]).sort((a, b) => a - b)[Math.floor(q * (corners.length - 1))];
  const core = {
    x: pct("x", 0.5),
    z: pct("z", 0.5),
    span: Math.max(pct("x", 0.9) - pct("x", 0.1), pct("z", 0.9) - pct("z", 0.1)),
  };
  const views = {
    outside: fitView(0.85, 0.5, 1.1),
    inside: {
      // From one corner of the building, looking across to the other, at seated eye height
      position: [core.x + core.span * 0.3, box.min.y + eye, core.z + core.span * 0.3],
      target: [core.x - core.span * 0.25, box.min.y + eye * 0.85, core.z - core.span * 0.25],
    },
    above: fitView(0, 1, 0.001),
  };

  function goTo(name, v = views[name]) {
    const to = { position: new THREE.Vector3(...v.position), target: new THREE.Vector3(...v.target) };
    for (const b of fig.querySelectorAll("[data-mv-view]")) b.setAttribute("aria-pressed", b.dataset.mvView === name);
    if (reduceMotion || (!tween && !camera.userData.placed)) {
      camera.position.copy(to.position);
      controls.target.copy(to.target);
      camera.userData.placed = true;
      tween = null;
    } else {
      tween = { from: { position: camera.position.clone(), target: controls.target.clone() }, to, start: -1 };
    }
    request();
  }

  function stepTween(now) {
    if (tween.start < 0) tween.start = now;
    const t = Math.min(1, (now - tween.start) / 900);
    const k = t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2; // ease in-out
    camera.position.lerpVectors(tween.from.position, tween.to.position, k);
    controls.target.lerpVectors(tween.from.target, tween.to.target, k);
    if (t === 1) tween = null;
  }

  // --- Controls bar -----------------------------------------------------------------
  for (const b of fig.querySelectorAll("[data-mv-view]")) b.addEventListener("click", () => goTo(b.dataset.mvView));
  // Grabbing the model cancels a view change in progress
  controls.addEventListener("start", () => (tween = null));

  // The section cut's plane list, shared by every model material (empty = no cut); see below
  const plane = new THREE.Plane();
  const planes = [];

  // Clay: every surface in one warm white, like a card model (glass stays see-through).
  // Useful for models whose colours are only Rhino layer colours; on at the start when the
  // button starts pressed (the project's "clay" setting).
  const clay = new THREE.MeshStandardMaterial({ color: 0xe2dccf, roughness: 1, side: THREE.DoubleSide });
  const clayGlass = new THREE.MeshStandardMaterial({
    color: 0xdde6ec,
    roughness: 0.1,
    transparent: true,
    opacity: 0.25,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const originals = new Map();
  model.traverse((o) => o.isMesh && originals.set(o, o.material));
  const toClay = (m) => (m.transparent ? clayGlass : clay);
  // Ink lines on the creases, as on a drawing; made the first time clay is turned on
  let edges = null;
  const setClay = (on) => {
    for (const [mesh, mat] of originals) {
      mesh.material = on ? (Array.isArray(mat) ? mat.map(toClay) : toClay(mat)) : mat;
    }
    if (on && !edges) {
      edges = [];
      const ink = new THREE.LineBasicMaterial({ color: 0x34322f, transparent: true, opacity: 0.45 });
      ink.clippingPlanes = planes;
      for (const mesh of originals.keys()) {
        const lines = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 30), ink);
        mesh.add(lines);
        edges.push(lines);
      }
    }
    for (const lines of edges ?? []) lines.visible = on;
    scene.environmentIntensity = on ? 0.35 : 0.7; // less fill light, so the planes read
    request();
  };
  const clayBtn = fig.querySelector("[data-mv-clay]");
  if (clayBtn?.getAttribute("aria-pressed") === "true") setClay(true);
  clayBtn?.addEventListener("click", () => {
    const on = clayBtn.getAttribute("aria-pressed") !== "true";
    clayBtn.setAttribute("aria-pressed", on);
    setClay(on);
  });

  // --- Section cut --------------------------------------------------------------------
  // One plane through the model only (the ground and its shadow stay whole): horizontal for a
  // plan, or vertical along either side for a section. The slider moves it through the model,
  // Flip keeps the other half, and a thin outline in the semester's colour shows where it is.
  const cut = { on: false, axis: "y", at: { y: 0, x: 0.5, z: 0.5 }, flip: false };
  // Plan cut at sill height to start with; sections through the middle
  cut.at.y = Math.min(1.2, size.y * 0.45) / size.y;
  renderer.localClippingEnabled = true;
  const clipped = new Set([clay, clayGlass]);
  for (const mat of originals.values()) for (const m of [mat].flat()) clipped.add(m);
  const clipAll = () => {
    for (const m of clipped) {
      m.clippingPlanes = planes;
      m.clipShadows = true;
    }
  };
  clipAll();

  const semColour = getComputedStyle(fig).getPropertyValue("--sem").trim() || "#34322f";
  const outline = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints([0, 1, 2, 3].map(() => new THREE.Vector3())),
    new THREE.LineBasicMaterial({ color: new THREE.Color(semColour), transparent: true, opacity: 0.9 }),
  );
  outline.visible = false;
  scene.add(outline);

  const cutRow = fig.querySelector(".model-viewer__cut");
  const slider = fig.querySelector("[data-mv-cut-at]");
  const axisBtns = fig.querySelectorAll("[data-mv-axis]");

  function applyCut() {
    const a = cut.axis;
    const lo = box.min[a], hi = box.max[a];
    const pos = lo + cut.at[a] * (hi - lo);
    // Clipping keeps the side the normal points to: below the plan cut, or before the section
    const normal = new THREE.Vector3();
    normal[a] = cut.flip ? 1 : -1;
    plane.set(normal, cut.flip ? -pos : pos);
    planes.length = 0;
    if (cut.on) planes.push(plane);
    // Outline: the model's box, sliced at the plane, a hair to the kept side
    const [u, v] = ["x", "y", "z"].filter((k) => k !== a);
    const pad = 0.03 * span;
    const corner = (cu, cv) => {
      const p = new THREE.Vector3();
      p[a] = pos + normal[a] * 0.01;
      p[u] = cu;
      p[v] = cv;
      return p;
    };
    outline.geometry.setFromPoints([
      corner(box.min[u] - pad, box.min[v] - pad),
      corner(box.max[u] + pad, box.min[v] - pad),
      corner(box.max[u] + pad, box.max[v] + pad),
      corner(box.min[u] - pad, box.max[v] + pad),
    ]);
    outline.visible = cut.on;
    request();
  }

  // Turn to face the cut: down onto a plan, or square-ish onto the section's face
  function faceCut() {
    const s = cut.flip ? -1 : 1;
    const dir = cut.axis === "y" ? [0.45, 1.3, 0.65] : cut.axis === "x" ? [s, 0.45, 0.35] : [0.35, 0.45, s];
    goTo(null, fitView(...dir, (p) => plane.distanceToPoint(p) >= 0));
  }

  function showCutControls() {
    for (const b of axisBtns) b.setAttribute("aria-pressed", b.dataset.mvAxis === cut.axis);
    if (slider) {
      slider.value = String(Math.round(cut.at[cut.axis] * 1000));
      slider.setAttribute("aria-valuetext", `${(cut.at[cut.axis] * size[cut.axis]).toFixed(1)} m in`);
    }
  }

  const cutBtn = fig.querySelector("[data-mv-cut]");
  cutBtn?.addEventListener("click", () => {
    cut.on = cutBtn.getAttribute("aria-pressed") !== "true";
    cutBtn.setAttribute("aria-pressed", cut.on);
    if (cutRow) cutRow.hidden = !cut.on;
    showCutControls();
    applyCut();
    if (cut.on) faceCut();
  });
  for (const b of axisBtns) {
    b.addEventListener("click", () => {
      cut.axis = b.dataset.mvAxis;
      showCutControls();
      applyCut();
      faceCut();
    });
  }
  slider?.addEventListener("input", () => {
    cut.at[cut.axis] = Number(slider.value) / 1000;
    showCutControls();
    applyCut();
  });
  fig.querySelector("[data-mv-flip]")?.addEventListener("click", () => {
    cut.flip = !cut.flip;
    applyCut();
    faceCut();
  });

  const fullBtn = fig.querySelector("[data-mv-full]");
  if (fullBtn && stage.requestFullscreen) {
    fullBtn.hidden = false;
    fullBtn.addEventListener("click", () => {
      if (document.fullscreenElement) document.exitFullscreen();
      else stage.requestFullscreen();
    });
    document.addEventListener("fullscreenchange", () => {
      fullBtn.setAttribute("aria-pressed", document.fullscreenElement === stage);
      controls.enableZoom = document.fullscreenElement === stage || controls.enableZoom;
    });
  } else if (fullBtn) {
    fullBtn.hidden = true;
  }

  stage.append(renderer.domElement);
  goTo("outside");
  resize();
  fig.classList.remove("is-loading");
  fig.classList.add("is-live");
  say("");
}

function fail(fig, say, err) {
  console.error(err);
  fig.classList.remove("is-loading");
  fig.classList.add("is-failed");
  say("Couldn't open the model here. You can still download it below.");
}
