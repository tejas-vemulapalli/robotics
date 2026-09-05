import * as THREE from "three";

/* ==========================================================================
   1. Slide Deck Navigation
   ========================================================================== */
const slides = Array.from(document.querySelectorAll(".slide"));
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const slideIndicator = document.getElementById("slide-indicator");
const progressBar = document.getElementById("progress-bar");
const slideDotsContainer = document.getElementById("slide-dots");

let currentSlideIndex = 0;
const totalSlides = slides.length;

// Build navigation dots
slides.forEach((_, idx) => {
  const dot = document.createElement("button");
  dot.type = "button";
  dot.setAttribute("aria-label", `Go to slide ${idx + 1}`);
  if (idx === 0) dot.classList.add("active");
  dot.addEventListener("click", () => goToSlide(idx));
  slideDotsContainer.appendChild(dot);
});

function updateDeckUI() {
  slides.forEach((slide, idx) => {
    slide.classList.remove("active", "exit-left");
    if (idx === currentSlideIndex) {
      slide.classList.add("active");
    } else if (idx < currentSlideIndex) {
      slide.classList.add("exit-left");
    }
  });

  const formattedNum = String(currentSlideIndex + 1).padStart(2, "0");
  const formattedTotal = String(totalSlides).padStart(2, "0");
  slideIndicator.textContent = `SLIDE ${formattedNum} / ${formattedTotal}`;

  const pct = ((currentSlideIndex + 1) / totalSlides) * 100;
  progressBar.style.width = `${pct}%`;

  const dots = slideDotsContainer.querySelectorAll("button");
  dots.forEach((dot, idx) => {
    dot.classList.toggle("active", idx === currentSlideIndex);
  });

  prevBtn.disabled = currentSlideIndex === 0;
  nextBtn.disabled = currentSlideIndex === totalSlides - 1;

  // Trigger resize if entering 3D slide
  if (currentSlideIndex === 10 && resizeRenderer) {
    setTimeout(resizeRenderer, 150);
  }
}

function goToSlide(targetIndex) {
  if (targetIndex < 0 || targetIndex >= totalSlides) return;
  currentSlideIndex = targetIndex;
  updateDeckUI();
}

prevBtn.addEventListener("click", () => goToSlide(currentSlideIndex - 1));
nextBtn.addEventListener("click", () => goToSlide(currentSlideIndex + 1));

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight" || e.key === "PageDown") {
    goToSlide(currentSlideIndex + 1);
  } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
    goToSlide(currentSlideIndex - 1);
  }
});

/* ==========================================================================
   2. Slide 3: Mix and Match Interactive
   ========================================================================== */
const pairs = [
  {
    term: "Machine",
    def: "A mechanical tool made of moving parts that uses energy to do a specific job."
  },
  {
    term: "Algorithm",
    def: "A step-by-step set of rules or instructions for a computer to follow."
  },
  {
    term: "Machine Learning",
    def: "The process where computers analyse data to get smarter over time without being given every single rule."
  },
  {
    term: "Sensor",
    def: "A hardware piece that takes in real-world information (like light or touch) and sends it to a computer."
  },
  {
    term: "Autonomous System",
    def: "A system or machine that can run entirely on its own without a human controller."
  },
  {
    term: "Android",
    def: "A robot that is specifically designed to look and act like a human being."
  }
];

const vocabStack = document.getElementById("vocab-stack");
const defStack = document.getElementById("def-stack");
const unmatchedColumns = document.getElementById("unmatched-columns");
const matchedColumns = document.getElementById("matched-columns");
const matchBtn = document.getElementById("match-btn");

let isMatched = false;

function setupMixMatch() {
  vocabStack.innerHTML = "";
  defStack.innerHTML = "";
  matchedColumns.innerHTML = "";

  // Render initial separated vocabulary
  pairs.forEach((p, i) => {
    const t = document.createElement("div");
    t.className = "term";
    t.id = `term-${i}`;
    t.textContent = p.term;
    vocabStack.appendChild(t);
  });

  // Render shuffled definitions for authentic mix-and-match
  const shuffledDefIndices = [2, 0, 4, 1, 5, 3];
  shuffledDefIndices.forEach((defIdx) => {
    const d = document.createElement("div");
    d.className = "def";
    d.id = `def-${defIdx}`;
    d.textContent = pairs[defIdx].def;
    defStack.appendChild(d);
  });

  // Prepare matched layout
  pairs.forEach((p) => {
    const row = document.createElement("div");
    row.className = "matched-pair";
    row.innerHTML = `
      <div class="term" style="font-size: 0.98rem; display: flex; align-items: center; justify-content: center;">${p.term}</div>
      <div class="def" style="font-size: 0.95rem;">${p.def}</div>
    `;
    matchedColumns.appendChild(row);
  });
}

matchBtn.addEventListener("click", () => {
  if (!isMatched) {
    matchBtn.disabled = true;
    matchBtn.textContent = "Matching...";

    // Visual flying animation for terms to corresponding definitions
    const termElements = Array.from(vocabStack.querySelectorAll(".term"));
    termElements.forEach((el, idx) => {
      const defTarget = document.getElementById(`def-${idx}`);
      if (defTarget) {
        const fromRect = el.getBoundingClientRect();
        const toRect = defTarget.getBoundingClientRect();

        const ghost = el.cloneNode(true);
        ghost.className = "term ghost-fly";
        ghost.style.left = `${fromRect.left}px`;
        ghost.style.top = `${fromRect.top}px`;
        ghost.style.width = `${fromRect.width}px`;
        ghost.style.height = `${fromRect.height}px`;
        document.body.appendChild(ghost);

        requestAnimationFrame(() => {
          ghost.style.transform = `translate(${toRect.left - fromRect.left}px, ${toRect.top - fromRect.top}px)`;
          ghost.style.borderColor = "var(--mint)";
        });

        setTimeout(() => {
          ghost.remove();
        }, 700);
      }
    });

    setTimeout(() => {
      unmatchedColumns.classList.add("hidden-layout");
      matchedColumns.classList.remove("hidden-layout");
      matchBtn.disabled = false;
      matchBtn.textContent = "Reset Mix";
      isMatched = true;
    }, 750);
  } else {
    unmatchedColumns.classList.remove("hidden-layout");
    matchedColumns.classList.add("hidden-layout");
    matchBtn.textContent = "Match";
    isMatched = false;
  }
});

/* ==========================================================================
   3. Slide 4: Classification Interactive
   ========================================================================== */
const specimens = [
  {
    id: 1,
    title: "1. Robotic Vacuum Cleaner",
    classification: "Both",
    reason: "The Robotic Vacuum Cleaner is classified both an AI and a robot because it uses physical motion to classify itself as a robot and it uses problem solving software to classify itself as an AI."
  },
  {
    id: 2,
    title: "2. Smartphone Face Recognition",
    classification: "AI",
    reason: "Smartphone Face Recognition is only an AI because it has no moving parts to call itself as a robot and can use data from previous inputs to find out whether it is your face or not."
  },
  {
    id: 3,
    title: "3. Mars Rover",
    classification: "Both",
    reason: "The Mars Rover is both a robot and an AI because it can physically interact with it’s environment and can move to places, sample weather, and collect rock samples without the instruction of humans."
  },
  {
    id: 4,
    title: "4. Chatbot",
    classification: "AI",
    reason: "Chatbot is an AI because it does not have physical moving parts and can simulate the conversation of a human."
  },
  {
    id: 5,
    title: "5. Cochlear Implant",
    classification: "Neither",
    reason: "Cochlear implants are neither robots nor AI because it does not have moving parts and cannot imitate the thinking and decision of a human."
  }
];

const specimensRow = document.getElementById("specimens-row");
const zoneAI = document.getElementById("zone-ai");
const zoneRobot = document.getElementById("zone-robot");
const zoneBoth = document.getElementById("zone-both");

function setupClassification() {
  specimensRow.innerHTML = "";
  zoneAI.innerHTML = "";
  zoneRobot.innerHTML = "";
  zoneBoth.innerHTML = "";

  specimens.forEach((spec) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "panel specimen";
    card.dataset.id = spec.id;
    card.innerHTML = `
      <div class="specimen-name">${spec.title}</div>
      <div class="specimen-reason">
        <div><span class="class-tag">Classification: ${spec.classification}</span></div>
        <p style="margin-top: 4px;"><strong>My Reason:</strong> ${spec.reason}</p>
      </div>
    `;

    card.addEventListener("click", () => {
      card.classList.toggle("revealed");

      // Place or highlight into target zone
      const zoneId = spec.classification.toLowerCase();
      let targetZone = null;
      if (zoneId === "ai") targetZone = zoneAI;
      if (zoneId === "robot") targetZone = zoneRobot;
      if (zoneId === "both") targetZone = zoneBoth;

      if (targetZone) {
        const existingBadge = targetZone.querySelector(`[data-placed="${spec.id}"]`);
        if (!existingBadge) {
          const badge = document.createElement("div");
          badge.dataset.placed = spec.id;
          badge.className = "panel";
          badge.style.padding = "8px 12px";
          badge.style.fontSize = "0.88rem";
          badge.style.borderLeft = "4px solid var(--cyan)";
          badge.innerHTML = `<b>${spec.title}</b><p style="font-size: 0.8rem; color: var(--muted); margin-top: 2px;">${spec.reason}</p>`;
          targetZone.appendChild(badge);
        }
      }
    });

    specimensRow.appendChild(card);
  });
}

/* ==========================================================================
   4. Slide 11: Real-Time 3D Medisort Model (Three.js)
   ========================================================================== */
let scene, camera, renderer, trayGroup, suctionGroup, pillMesh;
let resizeRenderer = null;
let isDispensing = false;
let trayTargetAngle = 0;

function initMedisort3D() {
  const canvas = document.getElementById("medisort-canvas");
  if (!canvas) return;

  const width = canvas.clientWidth || 600;
  const height = canvas.clientHeight || 450;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a1424);
  scene.fog = new THREE.FogExp2(0x0a1424, 0.04);

  camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
  camera.position.set(0, 7.5, 9.8);
  camera.lookAt(0, 0.5, 0);

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(width, height, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0x7af0ff, 2.2);
  keyLight.position.set(6, 12, 8);
  keyLight.castShadow = true;
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x8b7cff, 1.8);
  rimLight.position.set(-8, 6, -6);
  scene.add(rimLight);

  const fillLight = new THREE.PointLight(0xffbe3c, 1.2, 12);
  fillLight.position.set(0, 4, 3);
  scene.add(fillLight);

  // Machine Base Plate
  const baseGeo = new THREE.CylinderGeometry(4.2, 4.4, 0.45, 48);
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x132640,
    metalness: 0.7,
    roughness: 0.3
  });
  const machineBase = new THREE.Mesh(baseGeo, baseMat);
  machineBase.position.y = -0.22;
  machineBase.receiveShadow = true;
  scene.add(machineBase);

  // Outer protective housing (Translucent acrylic cylinder)
  const housingGeo = new THREE.CylinderGeometry(4.15, 4.15, 3.4, 48, 1, true);
  const housingMat = new THREE.MeshPhysicalMaterial({
    color: 0x3ee0ff,
    transparent: true,
    opacity: 0.18,
    roughness: 0.1,
    transmission: 0.75,
    thickness: 0.5,
    side: THREE.DoubleSide
  });
  const housing = new THREE.Mesh(housingGeo, housingMat);
  housing.position.y = 1.6;
  scene.add(housing);

  // Top Housing Rim
  const rimGeo = new THREE.TorusGeometry(4.15, 0.08, 16, 64);
  const rimMat = new THREE.MeshStandardMaterial({ color: 0x3ee0ff, metalness: 0.8, roughness: 0.2 });
  const topRim = new THREE.Mesh(rimGeo, rimMat);
  topRim.rotation.x = Math.PI / 2;
  topRim.position.y = 3.3;
  scene.add(topRim);

  // Central Rotating Hub & Mechanism
  const hubGeo = new THREE.CylinderGeometry(0.8, 0.95, 1.1, 32);
  const hubMat = new THREE.MeshStandardMaterial({ color: 0x1f3b60, metalness: 0.85, roughness: 0.25 });
  const centralHub = new THREE.Mesh(hubGeo, hubMat);
  centralHub.position.y = 0.55;
  scene.add(centralHub);

  const hubCoreGeo = new THREE.CylinderGeometry(0.35, 0.35, 1.8, 24);
  const hubCoreMat = new THREE.MeshStandardMaterial({ color: 0xffbe3c, metalness: 0.9, roughness: 0.2 });
  const hubCore = new THREE.Mesh(hubCoreGeo, hubCoreMat);
  hubCore.position.y = 0.9;
  scene.add(hubCore);

  // Circular Rotating Tray Group
  trayGroup = new THREE.Group();
  trayGroup.position.y = 0.4;
  scene.add(trayGroup);

  const trayDiscGeo = new THREE.CylinderGeometry(3.6, 3.6, 0.3, 48);
  const trayMat = new THREE.MeshStandardMaterial({
    color: 0x1a3354,
    metalness: 0.6,
    roughness: 0.35
  });
  const trayDisc = new THREE.Mesh(trayDiscGeo, trayMat);
  trayDisc.receiveShadow = true;
  trayGroup.add(trayDisc);

  // Create 8 numbered sequential compartments
  const compartmentCount = 8;
  const trayRadius = 2.45;

  for (let i = 0; i < compartmentCount; i++) {
    const angle = (i / compartmentCount) * Math.PI * 2;
    const x = Math.cos(angle) * trayRadius;
    const z = Math.sin(angle) * trayRadius;

    // Compartment hole
    const holeGeo = new THREE.CylinderGeometry(0.48, 0.44, 0.32, 24);
    const holeMat = new THREE.MeshStandardMaterial({
      color: 0x081324,
      roughness: 0.5,
      metalness: 0.4
    });
    const hole = new THREE.Mesh(holeGeo, holeMat);
    hole.position.set(x, 0.02, z);
    trayGroup.add(hole);

    // Pill in compartment 1 and compartment 5
    if (i === 0 || i === 4) {
      const tabletGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.12, 20);
      const tabletMat = new THREE.MeshStandardMaterial({
        color: i === 0 ? 0xff6b8a : 0x5dffc4,
        roughness: 0.3
      });
      const tablet = new THREE.Mesh(tabletGeo, tabletMat);
      tablet.position.set(x, 0.14, z);
      trayGroup.add(tablet);
    }

    // Number Badge (1 to 8 sequentially)
    const canvasText = document.createElement("canvas");
    canvasText.width = 128;
    canvasText.height = 128;
    const ctx = canvasText.getContext("2d");
    ctx.fillStyle = "#102038";
    ctx.beginPath();
    ctx.arc(64, 64, 56, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#3ee0ff";
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 58px Orbitron, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(i + 1), 64, 66);

    const texture = new THREE.CanvasTexture(canvasText);
    const badgeGeo = new THREE.PlaneGeometry(0.46, 0.46);
    const badgeMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const badge = new THREE.Mesh(badgeGeo, badgeMat);
    badge.rotation.x = -Math.PI / 2;
    badge.rotation.z = -angle - Math.PI / 2;
    badge.position.set(x * 0.72, 0.16, z * 0.72);
    trayGroup.add(badge);
  }

  // Suction pipes positioned over tray positions 1 and 8
  const angle1 = 0; // Position 1
  const angle8 = ((compartmentCount - 1) / compartmentCount) * Math.PI * 2; // Position 8

  function buildSuctionPipe(angle, colorHex, label) {
    const pipeGroup = new THREE.Group();
    const x = Math.cos(angle) * trayRadius;
    const z = Math.sin(angle) * trayRadius;

    // Overhead Arm Mount
    const armGeo = new THREE.BoxGeometry(0.3, 0.3, 1.4);
    const armMat = new THREE.MeshStandardMaterial({ color: 0x30486c, metalness: 0.8, roughness: 0.2 });
    const arm = new THREE.Mesh(armGeo, armMat);
    arm.position.set(x * 0.7, 2.7, z * 0.7);
    arm.lookAt(x, 2.7, z);
    pipeGroup.add(arm);

    // Suction Tube
    const tubeGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.4, 16);
    const tubeMat = new THREE.MeshStandardMaterial({ color: colorHex, metalness: 0.85, roughness: 0.15 });
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    tube.position.set(x, 1.9, z);
    pipeGroup.add(tube);

    // Suction Nozzle / Cup
    const nozzleGeo = new THREE.ConeGeometry(0.2, 0.28, 20);
    const nozzleMat = new THREE.MeshStandardMaterial({ color: 0xffbe3c, roughness: 0.3 });
    const nozzle = new THREE.Mesh(nozzleGeo, nozzleMat);
    nozzle.position.set(x, 1.15, z);
    pipeGroup.add(nozzle);

    // Indicator Sensor Light
    const sensorGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const sensorMat = new THREE.MeshBasicMaterial({ color: 0x3ee0ff });
    const sensor = new THREE.Mesh(sensorGeo, sensorMat);
    sensor.position.set(x, 2.65, z);
    pipeGroup.add(sensor);

    return pipeGroup;
  }

  const suctionPipe1 = buildSuctionPipe(angle1, 0x3ee0ff, "Position 1");
  const suctionPipe8 = buildSuctionPipe(angle8, 0x7af0ff, "Position 8");
  scene.add(suctionPipe1);
  scene.add(suctionPipe8);

  // Active Dispensing Mechanism Assembly
  suctionGroup = new THREE.Group();
  scene.add(suctionGroup);

  const gantryGeo = new THREE.CylinderGeometry(0.09, 0.09, 1.6, 16);
  const gantryMat = new THREE.MeshStandardMaterial({ color: 0x9db4cc, metalness: 0.9, roughness: 0.2 });
  const gantry = new THREE.Mesh(gantryGeo, gantryMat);
  gantry.position.set(Math.cos(angle1) * trayRadius, 2.0, Math.sin(angle1) * trayRadius);
  suctionGroup.add(gantry);

  // Active Picked Pill (initially hidden)
  const pillGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.13, 20);
  const pillMat = new THREE.MeshStandardMaterial({ color: 0xff6b8a, roughness: 0.2, metalness: 0.1 });
  pillMesh = new THREE.Mesh(pillGeo, pillMat);
  pillMesh.position.set(Math.cos(angle1) * trayRadius, 1.05, Math.sin(angle1) * trayRadius);
  pillMesh.visible = false;
  scene.add(pillMesh);

  // Medicine Output / Dispensing Chute Area
  const chuteGeo = new THREE.BoxGeometry(1.2, 0.8, 1.4);
  const chuteMat = new THREE.MeshStandardMaterial({ color: 0x132a48, metalness: 0.7, roughness: 0.3 });
  const chute = new THREE.Mesh(chuteGeo, chuteMat);
  chute.position.set(0, 0.4, 4.3);
  scene.add(chute);

  const chuteTrayGeo = new THREE.BoxGeometry(0.9, 0.2, 0.9);
  const chuteTrayMat = new THREE.MeshStandardMaterial({ color: 0x5dffc4, metalness: 0.4, roughness: 0.4 });
  const chuteTray = new THREE.Mesh(chuteTrayGeo, chuteTrayMat);
  chuteTray.position.set(0, 0.12, 4.5);
  scene.add(chuteTray);

  // Sensors & Alarm Unit
  const alarmBoxGeo = new THREE.BoxGeometry(0.9, 0.7, 0.4);
  const alarmBoxMat = new THREE.MeshStandardMaterial({ color: 0x162c4a, metalness: 0.7, roughness: 0.3 });
  const alarmBox = new THREE.Mesh(alarmBoxGeo, alarmBoxMat);
  alarmBox.position.set(-3.2, 1.2, 0);
  scene.add(alarmBox);

  const alarmLedGeo = new THREE.SphereGeometry(0.16, 16, 16);
  const alarmLedMat = new THREE.MeshBasicMaterial({ color: 0xffbe3c });
  const alarmLed = new THREE.Mesh(alarmLedGeo, alarmLedMat);
  alarmLed.position.set(-3.2, 1.62, 0);
  scene.add(alarmLed);

  // Mouse Orbit Controls (drag to rotate view)
  let isDragging = false;
  let prevMouseX = 0;
  let prevMouseY = 0;
  let spherical = { radius: 12.5, phi: Math.PI / 3.4, theta: 0.2 };

  function updateCameraPos() {
    camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
    camera.position.y = spherical.radius * Math.cos(spherical.phi);
    camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
    camera.lookAt(0, 1.0, 0);
  }
  updateCameraPos();

  canvas.addEventListener("mousedown", (e) => {
    isDragging = true;
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;
  });

  window.addEventListener("mouseup", () => {
    isDragging = false;
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - prevMouseX;
    const deltaY = e.clientY - prevMouseY;
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;

    spherical.theta -= deltaX * 0.007;
    spherical.phi = Math.max(0.25, Math.min(Math.PI / 2.05, spherical.phi - deltaY * 0.007));
    updateCameraPos();
  });

  canvas.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      spherical.radius = Math.max(7, Math.min(18, spherical.radius + e.deltaY * 0.01));
      updateCameraPos();
    },
    { passive: false }
  );

  // Render Loop
  let clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const dt = clock.getDelta();

    // Smooth tray rotation toward target angle
    if (trayGroup) {
      trayGroup.rotation.y += (trayTargetAngle - trayGroup.rotation.y) * 0.08;
    }

    // Gentle alarm pulse
    if (alarmLed) {
      const pulse = 0.5 + 0.5 * Math.sin(clock.getElapsedTime() * 4);
      alarmLed.scale.setScalar(0.9 + 0.2 * pulse);
    }

    renderer.render(scene, camera);
  }
  animate();

  resizeRenderer = () => {
    if (!canvas) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w > 0 && h > 0) {
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    }
  };

  window.addEventListener("resize", resizeRenderer);
}

/* ==========================================================================
   5. Slide 11 Controls & 6-Step Dispense Sequence
   ========================================================================== */
const rotateTrayBtn = document.getElementById("btn-rotate-tray");
const dispenseBtn = document.getElementById("btn-dispense");
const resetTrayBtn = document.getElementById("btn-reset-tray");
const medisortStatus = document.getElementById("medisort-status");

function setStatus(text, color = "var(--cyan)") {
  if (medisortStatus) {
    medisortStatus.textContent = text;
    medisortStatus.style.color = color;
  }
}

if (rotateTrayBtn) {
  rotateTrayBtn.addEventListener("click", () => {
    if (isDispensing) return;
    trayTargetAngle += Math.PI / 4; // Advance by one compartment (45 deg)
    setStatus("Tray rotating...");
    setTimeout(() => setStatus("Ready"), 600);
  });
}

if (resetTrayBtn) {
  resetTrayBtn.addEventListener("click", () => {
    if (isDispensing) return;
    trayTargetAngle = 0;
    if (pillMesh) {
      pillMesh.visible = false;
      pillMesh.position.set(2.45, 1.05, 0);
    }
    if (suctionGroup) suctionGroup.position.set(0, 0, 0);
    setStatus("Reset complete");
    setTimeout(() => setStatus("Ready"), 500);
  });
}

if (dispenseBtn) {
  dispenseBtn.addEventListener("click", async () => {
    if (isDispensing) return;
    isDispensing = true;
    dispenseBtn.disabled = true;

    // Step 1: The tray rotates to the required position.
    setStatus("1. Tray rotates to required position", "var(--amber)");
    trayTargetAngle = 0; // Align position 1 with primary suction pipe
    await delay(800);

    // Step 2: The correct compartment aligns with the suction pipe.
    setStatus("2. Compartment aligned with suction pipe", "var(--cyan)");
    await delay(600);

    // Step 3: The suction mechanism activates.
    setStatus("3. Suction mechanism activates", "var(--mint)");
    if (suctionGroup) {
      // Lower suction mechanism
      await animateValue(0, -0.65, 500, (v) => (suctionGroup.position.y = v));
    }
    await delay(300);

    // Step 4: The medicine is picked up.
    setStatus("4. Medicine picked up", "var(--mint)");
    if (pillMesh) {
      pillMesh.visible = true;
      pillMesh.position.set(2.45, 0.7, 0);
    }
    // Raise suction and pill together
    await animateValue(-0.65, 0.4, 600, (v) => {
      if (suctionGroup) suctionGroup.position.y = v;
      if (pillMesh) pillMesh.position.y = 1.35 + v;
    });

    // Step 5: The medicine travels toward the dispensing area.
    setStatus("5. Medicine travels to dispensing area", "var(--amber)");
    await animateValue(0, 1, 900, (t) => {
      // Arc toward chute at (0, 0.4, 4.3)
      const curX = 2.45 * (1 - t);
      const curZ = 4.3 * t;
      const curY = 1.6 + Math.sin(t * Math.PI) * 0.4;
      if (pillMesh) pillMesh.position.set(curX, curY, curZ);
      if (suctionGroup) suctionGroup.position.set(curX - 2.45, curY - 1.6, curZ);
    });

    // Step 6: The medicine is released.
    setStatus("6. Medicine released into output area", "var(--mint)");
    // Drop pill into chute
    await animateValue(1.6, 0.3, 400, (y) => {
      if (pillMesh) pillMesh.position.y = y;
    });
    // Retract suction mechanism back home
    await delay(300);
    if (suctionGroup) {
      await animateValue(0, 1, 600, (t) => {
        suctionGroup.position.x = (1 - t) * (0 - 2.45) + t * 0;
        suctionGroup.position.z = (1 - t) * 4.3 + t * 0;
        suctionGroup.position.y = (1 - t) * 0 + t * 0;
      });
      suctionGroup.position.set(0, 0, 0);
    }

    setStatus("Dispense complete", "var(--cyan-2)");
    dispenseBtn.disabled = false;
    isDispensing = false;
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function animateValue(start, end, duration, onUpdate) {
  return new Promise((resolve) => {
    const startTime = performance.now();
    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // smoothstep easing
      const eased = progress * progress * (3 - 2 * progress);
      const value = start + (end - start) * eased;
      onUpdate(value);
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        resolve();
      }
    }
    requestAnimationFrame(tick);
  });
}

/* ==========================================================================
   Initialization on DOM Load
   ========================================================================== */
window.addEventListener("DOMContentLoaded", () => {
  updateDeckUI();
  setupMixMatch();
  setupClassification();
  initMedisort3D();
});
