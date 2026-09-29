/**
 * 3D model viewer for project pages.
 *
 *   <figure class="model-viewer" data-model-viewer>
 *     <div class="model-viewer__stage"> poster <img> + a [data-mv-load] button </div>
 *     <div class="model-viewer__bar"> [data-mv-view="outside|inside|above"], [data-mv-cut], [data-mv-full] </div>
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

  // Section cut: a horizontal plane, to look down into the plan (height set once the model is in)
  const cut = new THREE.Plane(new THREE.Vector3(0, -1, 0), 1.2);

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

  cut.constant = box.min.y + Math.min(1.2, size.y * 0.45);
  // Far enough back that the whole model fits: its bounding sphere against the field of view
  const fit = 1.08 * (size.length() / 2) / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2));
  const from = (x, y, z) => new THREE.Vector3(x, y, z).normalize().multiplyScalar(fit).add(centre).toArray();
  const eye = Math.min(1.5, size.y * 0.5);
  const views = {
    outside: {
      position: from(0.85, 0.5, 1.1),
      target: centre.toArray(),
    },
    inside: {
      // From one corner, looking across to the other, at seated eye height
      position: [centre.x + span * 0.3, box.min.y + eye, centre.z + span * 0.3],
      target: [centre.x - span * 0.25, box.min.y + eye * 0.85, centre.z - span * 0.25],
    },
    above: {
      position: from(0, 1, 0.001),
      target: centre.toArray(),
    },
  };

  function goTo(name) {
    const v = views[name];
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

  const cutBtn = fig.querySelector("[data-mv-cut]");
  cutBtn?.addEventListener("click", () => {
    const on = cutBtn.getAttribute("aria-pressed") !== "true";
    cutBtn.setAttribute("aria-pressed", on);
    renderer.clippingPlanes = on ? [cut] : [];
    request();
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
