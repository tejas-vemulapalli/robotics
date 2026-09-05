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
    id: 0,
    term: "Machine",
    def: "A mechanical tool made of moving parts that uses energy to do a specific job."
  },
  {
    id: 1,
    term: "Algorithm",
    def: "A step-by-step set of rules or instructions for a computer to follow."
  },
  {
    id: 2,
    term: "Machine Learning",
    def: "The process where computers analyse data to get smarter over time without being given every single rule."
  },
  {
    id: 3,
    term: "Sensor",
    def: "A hardware piece that takes in real-world information (like light or touch) and sends it to a computer."
  },
  {
    id: 4,
    term: "Autonomous System",
    def: "A system or machine that can run entirely on its own without a human controller."
  },
  {
    id: 5,
    term: "Android",
    def: "A robot that is specifically designed to look and act like a human being."
  }
];

const vocabStack = document.getElementById("vocab-stack");
const defStack = document.getElementById("def-stack");
const matchBtn = document.getElementById("match-btn");
const matchSvg = document.getElementById("match-svg");
const matchArena = document.getElementById("match-arena");

let isMatched = false;
let isMatchingInProgress = false;

function setupMixMatch() {
  if (!vocabStack || !defStack) return;
  vocabStack.innerHTML = "";
  defStack.innerHTML = "";
  if (matchSvg) matchSvg.innerHTML = "";

  // Render initial separated vocabulary
  pairs.forEach((p, i) => {
    const slot = document.createElement("div");
    slot.className = "vocab-slot";
    slot.id = `vocab-slot-${i}`;
    slot.dataset.pairId = String(i);

    const chip = document.createElement("div");
    chip.className = "term-chip";
    chip.id = `term-chip-${i}`;
    chip.dataset.pairId = String(i);
    chip.innerHTML = `<span class="chip-num">0${i + 1}</span> <span class="chip-text">${p.term}</span>`;

    // Click individual chip to trigger single match animation
    chip.addEventListener("click", () => {
      if (!isMatchingInProgress && !chip.classList.contains("chip-docked")) {
        matchSingleItem(i);
      }
    });

    slot.appendChild(chip);
    vocabStack.appendChild(slot);
  });

  // Render shuffled definitions for authentic mix-and-match
  const shuffledDefIndices = [2, 0, 4, 1, 5, 3];
  shuffledDefIndices.forEach((defIdx) => {
    const p = pairs[defIdx];
    const card = document.createElement("div");
    card.className = "panel def-card";
    card.id = `def-card-${defIdx}`;
    card.dataset.pairId = String(defIdx);

    const dock = document.createElement("div");
    dock.className = "def-dock";
    dock.id = `def-dock-${defIdx}`;
    dock.dataset.pairId = String(defIdx);
    dock.innerHTML = `<span class="dock-placeholder">Receptor 0${defIdx + 1}</span>`;

    const text = document.createElement("div");
    text.className = "def-text";
    text.textContent = p.def;

    card.appendChild(dock);
    card.appendChild(text);
    defStack.appendChild(card);
  });
}

function matchSingleItem(pairId) {
  const chip = document.getElementById(`term-chip-${pairId}`);
  const slot = document.getElementById(`vocab-slot-${pairId}`);
  const dock = document.getElementById(`def-dock-${pairId}`);
  const defCard = document.getElementById(`def-card-${pairId}`);
  if (!chip || !slot || !dock || !defCard) return;

  const arenaRect = matchArena ? matchArena.getBoundingClientRect() : null;
  animateChipToDock(chip, slot, dock, defCard, arenaRect, matchSvg, () => {
    checkAllMatchedStatus();
  });
}

function checkAllMatchedStatus() {
  const dockedChips = document.querySelectorAll(".term-chip.chip-docked");
  if (dockedChips.length === pairs.length) {
    isMatched = true;
    if (matchBtn) matchBtn.textContent = "Reset Mix";
  }
}

function animateChipToDock(chip, slot, dock, defCard, arenaRect, svg, onComplete) {
  const startRect = chip.getBoundingClientRect();
  const targetRect = dock.getBoundingClientRect();

  const deltaX = targetRect.left - startRect.left;
  const deltaY = targetRect.top - startRect.top;

  // Draw glowing SVG trajectory
  if (svg && arenaRect) {
    const startX = startRect.right - arenaRect.left;
    const startY = startRect.top + startRect.height / 2 - arenaRect.top;
    const endX = targetRect.left - arenaRect.left;
    const endY = targetRect.top + targetRect.height / 2 - arenaRect.top;
    const midX = (startX + endX) / 2;

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute(
      "d",
      `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`
    );
    path.setAttribute("stroke", "url(#laser-grad)");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke-dasharray", "6 4");
    path.style.transition = "opacity 0.4s ease";
    svg.appendChild(path);

    setTimeout(() => {
      path.style.opacity = "0";
      setTimeout(() => path.remove(), 400);
    }, 700);
  }

  // Smooth transit
  chip.classList.add("chip-in-transit");
  chip.style.transition = "transform 0.72s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s ease";
  chip.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;

  slot.innerHTML = `<span class="slot-ghost">✓ Transferred</span>`;

  setTimeout(() => {
    dock.innerHTML = "";
    chip.style.transition = "none";
    chip.style.transform = "none";
    chip.classList.remove("chip-in-transit");
    chip.classList.add("chip-docked");
    dock.appendChild(chip);

    defCard.classList.add("card-matched");

    dock.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.04)", borderColor: "var(--mint)" },
        { transform: "scale(1)" }
      ],
      { duration: 250, easing: "ease-out" }
    );

    if (onComplete) onComplete();
  }, 730);
}

function animateChipBackToSlot(chip, slot, dock, defCard, onComplete) {
  const startRect = chip.getBoundingClientRect();
  const targetRect = slot.getBoundingClientRect();

  const deltaX = targetRect.left - startRect.left;
  const deltaY = targetRect.top - startRect.top;

  chip.classList.remove("chip-docked");
  chip.classList.add("chip-in-transit");
  chip.style.transition = "transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)";
  chip.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;

  defCard.classList.remove("card-matched");
  const pairId = Number(chip.dataset.pairId);
  dock.innerHTML = `<span class="dock-placeholder">Receptor 0${pairId + 1}</span>`;

  setTimeout(() => {
    slot.innerHTML = "";
    chip.style.transition = "none";
    chip.style.transform = "none";
    chip.classList.remove("chip-in-transit");
    slot.appendChild(chip);

    slot.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.03)", borderColor: "var(--cyan)" },
        { transform: "scale(1)" }
      ],
      { duration: 220, easing: "ease-out" }
    );

    if (onComplete) onComplete();
  }, 660);
}

if (matchBtn) {
  matchBtn.addEventListener("click", async () => {
    if (isMatchingInProgress) return;
    isMatchingInProgress = true;
    matchBtn.disabled = true;

    if (!isMatched) {
      matchBtn.textContent = "Matching...";

      const arenaRect = matchArena ? matchArena.getBoundingClientRect() : null;
      if (matchSvg) {
        matchSvg.innerHTML = `
          <defs>
            <linearGradient id="laser-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#3ee0ff" stop-opacity="0.3"/>
              <stop offset="50%" stop-color="#7af0ff" stop-opacity="0.95"/>
              <stop offset="100%" stop-color="#5dffc4" stop-opacity="0.4"/>
            </linearGradient>
          </defs>
        `;
      }

      const promises = [];
      pairs.forEach((p, idx) => {
        const chip = document.getElementById(`term-chip-${idx}`);
        const slot = document.getElementById(`vocab-slot-${idx}`);
        const dock = document.getElementById(`def-dock-${idx}`);
        const defCard = document.getElementById(`def-card-${idx}`);

        if (chip && chip.parentElement !== dock) {
          const delayMs = idx * 85;
          promises.push(
            new Promise((resolve) => {
              setTimeout(() => {
                animateChipToDock(chip, slot, dock, defCard, arenaRect, matchSvg, resolve);
              }, delayMs);
            })
          );
        }
      });

      await Promise.all(promises);

      setTimeout(() => {
        if (matchSvg) matchSvg.innerHTML = "";
        matchBtn.textContent = "Reset Mix";
        matchBtn.disabled = false;
        isMatched = true;
        isMatchingInProgress = false;
      }, 400);
    } else {
      matchBtn.textContent = "Resetting...";

      const promises = [];
      pairs.forEach((p, idx) => {
        const chip = document.getElementById(`term-chip-${idx}`);
        const slot = document.getElementById(`vocab-slot-${idx}`);
        const dock = document.getElementById(`def-dock-${idx}`);
        const defCard = document.getElementById(`def-card-${idx}`);

        if (chip && chip.parentElement === dock) {
          const delayMs = idx * 60;
          promises.push(
            new Promise((resolve) => {
              setTimeout(() => {
                animateChipBackToSlot(chip, slot, dock, defCard, resolve);
              }, delayMs);
            })
          );
        }
      });

      await Promise.all(promises);

      setTimeout(() => {
        matchBtn.textContent = "Match";
        matchBtn.disabled = false;
        isMatched = false;
        isMatchingInProgress = false;
      }, 350);
    }
  });
}

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
   4. Slide 11: Real-Time 3D Medisort Model (Three.js) & Concept View
   ========================================================================== */
let scene, camera, renderer, trayGroup, suctionGroup, pillMesh, dispensedPillMesh;
let resizeRenderer = null;
let isDispensing = false;
let trayTargetAngle = 0;
let alarmLed;

// Helper to create the top digital touchscreen texture matching the concept
function createScreenTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  // High-tech dark gradient
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, "#0b172a");
  grad.addColorStop(1, "#050b14");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  // Border & Header
  ctx.strokeStyle = "rgba(62, 224, 255, 0.4)";
  ctx.lineWidth = 6;
  ctx.strokeRect(16, 16, 992, 480);

  // Brand Name
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 46px Orbitron, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("MEDISORT", 512, 72);

  // Card 1: Time & Next Dose
  ctx.fillStyle = "rgba(16, 34, 60, 0.88)";
  ctx.strokeStyle = "rgba(62, 224, 255, 0.5)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(42, 106, 430, 260, 16);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#9db4cc";
  ctx.font = "22px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Mon, 12 May 2025", 68, 148);

  ctx.fillStyle = "#3ee0ff";
  ctx.font = "bold 58px Orbitron, sans-serif";
  ctx.fillText("08:30", 68, 215);
  ctx.font = "bold 24px Orbitron, sans-serif";
  ctx.fillText("AM", 262, 192);
  ctx.fillStyle = "#ffbe3c";
  ctx.font = "20px sans-serif";
  ctx.fillText("Next Dose", 262, 222);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 26px sans-serif";
  ctx.fillText("Tray 5: B-12 Tablet", 68, 282);
  ctx.fillStyle = "#7af0ff";
  ctx.font = "20px sans-serif";
  ctx.fillText("Take 1 pill • Administrate every 2-3 weeks", 68, 320);

  // Card 2: Status Ready & Alarm
  ctx.fillStyle = "rgba(16, 34, 60, 0.88)";
  ctx.beginPath();
  ctx.roundRect(494, 106, 230, 260, 16);
  ctx.fill();
  ctx.stroke();

  // Green badge
  ctx.fillStyle = "#10b981";
  ctx.beginPath();
  ctx.arc(609, 172, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 36px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("✓", 609, 184);

  ctx.fillStyle = "#5dffc4";
  ctx.font = "bold 28px Orbitron, sans-serif";
  ctx.fillText("Ready", 609, 246);

  ctx.fillStyle = "#ffbe3c";
  ctx.font = "20px sans-serif";
  ctx.fillText("⏰ Alarm in 0 min", 609, 305);

  // Card 3: Quick Menu
  ctx.fillStyle = "rgba(16, 34, 60, 0.88)";
  ctx.beginPath();
  ctx.roundRect(746, 106, 236, 260, 16);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#7af0ff";
  ctx.font = "20px Orbitron, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("📅 Schedule", 772, 160);
  ctx.fillText("💊 Medication", 772, 212);
  ctx.fillText("🕒 History", 772, 264);
  ctx.fillText("⚙️ Settings", 772, 316);

  // Bottom Status Bar
  ctx.fillStyle = "#10b981";
  ctx.beginPath();
  ctx.arc(68, 424, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 20px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("CHILD & PET PROOF: SECURE", 90, 431);

  ctx.fillStyle = "#3ee0ff";
  ctx.textAlign = "right";
  ctx.fillText("ENCRYPTED HEALTH DATA • BACKUP ACTIVE", 955, 431);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Helper to create the Weight Scanner OLED texture
function createScannerTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#071220";
  ctx.fillRect(0, 0, 512, 256);
  ctx.strokeStyle = "#3ee0ff";
  ctx.lineWidth = 4;
  ctx.strokeRect(10, 10, 492, 236);

  ctx.fillStyle = "#3ee0ff";
  ctx.font = "bold 26px Orbitron, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("⚖️ WEIGHT SCANNER", 28, 55);

  ctx.fillStyle = "#5dffc4";
  ctx.font = "bold 32px sans-serif";
  ctx.fillText("Verified: 1 pill", 28, 115);

  ctx.fillStyle = "#ffffff";
  ctx.font = "28px sans-serif";
  ctx.fillText("Weight: 0.52 g", 28, 165);

  ctx.fillStyle = "#8b7cff";
  ctx.font = "bold 22px sans-serif";
  ctx.fillText("🛡️ DATA ENCRYPTED", 28, 215);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Helper to create the Emergency Backup battery texture
function createBackupTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#091424";
  ctx.fillRect(0, 0, 256, 512);
  ctx.strokeStyle = "rgba(62, 224, 255, 0.4)";
  ctx.lineWidth = 4;
  ctx.strokeRect(10, 10, 236, 492);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 22px Orbitron, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("EMERGENCY", 128, 60);
  ctx.fillText("BACKUP", 128, 92);

  // Battery icon
  ctx.strokeStyle = "#5dffc4";
  ctx.lineWidth = 4;
  ctx.strokeRect(58, 140, 140, 70);
  ctx.fillRect(198, 160, 14, 30);
  ctx.fillStyle = "#5dffc4";
  ctx.fillRect(66, 148, 124, 54);

  ctx.fillStyle = "#ffbe3c";
  ctx.font = "bold 44px sans-serif";
  ctx.fillText("⚡", 128, 280);

  ctx.fillStyle = "#5dffc4";
  ctx.font = "bold 24px Orbitron, sans-serif";
  ctx.fillText("System OK", 128, 335);

  ctx.beginPath();
  ctx.arc(128, 395, 14, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function initMedisort3D() {
  const canvas = document.getElementById("medisort-canvas");
  if (!canvas) return;

  const width = canvas.clientWidth || 600;
  const height = canvas.clientHeight || 450;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x070e1a);
  scene.fog = new THREE.FogExp2(0x070e1a, 0.035);

  camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
  camera.position.set(0, 7.8, 10.4);
  camera.lookAt(0, 0.7, 0);

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(width, height, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0x7af0ff, 2.5);
  keyLight.position.set(6, 14, 8);
  keyLight.castShadow = true;
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x8b7cff, 2.0);
  rimLight.position.set(-8, 8, -6);
  scene.add(rimLight);

  const fillLight = new THREE.PointLight(0xffbe3c, 1.4, 14);
  fillLight.position.set(0, 4, 3);
  scene.add(fillLight);

  // Machine Outer Chassis (Two-tone White & Anthracite like concept)
  const chassisGroup = new THREE.Group();
  scene.add(chassisGroup);

  const whiteMat = new THREE.MeshStandardMaterial({
    color: 0xebf1f6,
    metalness: 0.25,
    roughness: 0.3
  });
  const darkMetalMat = new THREE.MeshStandardMaterial({
    color: 0x142032,
    metalness: 0.8,
    roughness: 0.25
  });
  const cyanGlowMat = new THREE.MeshBasicMaterial({ color: 0x3ee0ff });

  // Lower Base Platform
  const baseBoxGeo = new THREE.BoxGeometry(6.6, 0.5, 6.2);
  const baseBox = new THREE.Mesh(baseBoxGeo, whiteMat);
  baseBox.position.set(0, -0.25, 0.2);
  baseBox.receiveShadow = true;
  chassisGroup.add(baseBox);

  // Rear Machine Tower Body
  const towerGeo = new THREE.BoxGeometry(6.4, 4.6, 2.8);
  const tower = new THREE.Mesh(towerGeo, whiteMat);
  tower.position.set(0, 2.2, -1.5);
  chassisGroup.add(tower);

  // Dark Inner Chamber Well
  const chamberFloorGeo = new THREE.CylinderGeometry(3.3, 3.3, 0.3, 48);
  const chamberFloor = new THREE.Mesh(chamberFloorGeo, darkMetalMat);
  chamberFloor.position.set(0, 0.1, 0.3);
  chassisGroup.add(chamberFloor);

  // Top Angled Console Head with Digital Screen
  const consoleHeadGroup = new THREE.Group();
  consoleHeadGroup.position.set(0, 3.8, -0.6);
  consoleHeadGroup.rotation.x = -Math.PI * 0.14; // Angled backward like concept
  chassisGroup.add(consoleHeadGroup);

  const consoleHousingGeo = new THREE.BoxGeometry(5.2, 2.4, 1.2);
  const consoleHousing = new THREE.Mesh(consoleHousingGeo, whiteMat);
  consoleHeadGroup.add(consoleHousing);

  const screenGeo = new THREE.PlaneGeometry(4.7, 2.1);
  const screenMat = new THREE.MeshBasicMaterial({ map: createScreenTexture() });
  const screenMesh = new THREE.Mesh(screenGeo, screenMat);
  screenMesh.position.set(0, 0, 0.61);
  consoleHeadGroup.add(screenMesh);

  // Right Side Module: Emergency Backup Battery Panel
  const backupGeo = new THREE.PlaneGeometry(1.6, 2.4);
  const backupMat = new THREE.MeshBasicMaterial({ map: createBackupTexture() });
  const backupMesh = new THREE.Mesh(backupGeo, backupMat);
  backupMesh.position.set(3.21, 2.4, -1.2);
  backupMesh.rotation.y = Math.PI / 2;
  chassisGroup.add(backupMesh);

  // Right Side Module: Purge Bin (Clear container with discarded pills)
  const purgeBinGroup = new THREE.Group();
  purgeBinGroup.position.set(3.2, 0.6, 1.0);
  chassisGroup.add(purgeBinGroup);

  const purgeBinGeo = new THREE.BoxGeometry(0.8, 1.6, 1.0);
  const clearAcrylicMat = new THREE.MeshPhysicalMaterial({
    color: 0x3ee0ff,
    transparent: true,
    opacity: 0.28,
    transmission: 0.85,
    roughness: 0.1,
    thickness: 0.4
  });
  const purgeBinMesh = new THREE.Mesh(purgeBinGeo, clearAcrylicMat);
  purgeBinGroup.add(purgeBinMesh);

  // Pills inside purge bin
  const wastePillColors = [0xff6b8a, 0xffbe3c, 0x5dffc4, 0x7af0ff];
  for (let p = 0; p < 7; p++) {
    const wpGeo = new THREE.SphereGeometry(0.1, 10, 10);
    const wpMat = new THREE.MeshStandardMaterial({ color: wastePillColors[p % wastePillColors.length] });
    const wp = new THREE.Mesh(wpGeo, wpMat);
    wp.position.set((Math.random() - 0.5) * 0.4, -0.6 + p * 0.12, (Math.random() - 0.5) * 0.4);
    purgeBinGroup.add(wp);
  }

  // Left Side Module: Pill Intake Hopper Slide
  const hopperGroup = new THREE.Group();
  hopperGroup.position.set(-3.2, 2.8, -0.8);
  chassisGroup.add(hopperGroup);

  const hopperGeo = new THREE.BoxGeometry(0.9, 0.5, 1.6);
  const hopperMesh = new THREE.Mesh(hopperGeo, clearAcrylicMat);
  hopperGroup.add(hopperMesh);

  // Front Lower Left Module: Weight Scanner OLED Display
  const scannerGeo = new THREE.PlaneGeometry(1.9, 0.95);
  const scannerMat = new THREE.MeshBasicMaterial({ map: createScannerTexture() });
  const scannerMesh = new THREE.Mesh(scannerGeo, scannerMat);
  scannerMesh.position.set(-1.8, 0.4, 3.31);
  chassisGroup.add(scannerMesh);

  // Front Lower Right Module: Child & Pet Proof Status Light
  const lockPlateGeo = new THREE.BoxGeometry(1.6, 0.95, 0.2);
  const lockPlate = new THREE.Mesh(lockPlateGeo, darkMetalMat);
  lockPlate.position.set(1.9, 0.4, 3.25);
  chassisGroup.add(lockPlate);

  alarmLed = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
  alarmLed.position.set(1.9, 0.4, 3.38);
  chassisGroup.add(alarmLed);

  // Front Center: Illuminated Dispensing Output Chute Drawer
  const chuteGroup = new THREE.Group();
  chuteGroup.position.set(0, 0.35, 3.2);
  chassisGroup.add(chuteGroup);

  const chuteFrameGeo = new THREE.BoxGeometry(1.5, 0.95, 0.8);
  const chuteFrame = new THREE.Mesh(chuteFrameGeo, darkMetalMat);
  chuteGroup.add(chuteFrame);

  // Dispenser Scoop Interior
  const scoopGeo = new THREE.BoxGeometry(1.1, 0.35, 0.6);
  const scoopMat = new THREE.MeshStandardMaterial({ color: 0x081324, roughness: 0.3 });
  const scoop = new THREE.Mesh(scoopGeo, scoopMat);
  scoop.position.set(0, -0.1, 0.15);
  chuteGroup.add(scoop);

  // Glowing Blue Accent Light Strip in Dispenser Scoop
  const scoopGlow = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.05, 0.05), cyanGlowMat);
  scoopGlow.position.set(0, -0.22, 0.42);
  chuteGroup.add(scoopGlow);

  // Pre-dispensed tablet resting in chute (visible after dispense)
  const tabletGeo = new THREE.CapsuleGeometry ? new THREE.CapsuleGeometry(0.12, 0.32, 8, 16) : new THREE.CylinderGeometry(0.14, 0.14, 0.35, 16);
  const dispensedPillMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
  dispensedPillMesh = new THREE.Mesh(tabletGeo, dispensedPillMat);
  dispensedPillMesh.rotation.z = Math.PI / 2;
  dispensedPillMesh.position.set(0, -0.05, 0.22);
  dispensedPillMesh.visible = false;
  chuteGroup.add(dispensedPillMesh);

  // Protective Curved Graphene Glass Canopy
  const canopyGeo = new THREE.CylinderGeometry(3.15, 3.15, 2.6, 48, 1, true, 0, Math.PI);
  const canopyMat = new THREE.MeshPhysicalMaterial({
    color: 0x7af0ff,
    transparent: true,
    opacity: 0.18,
    transmission: 0.88,
    roughness: 0.08,
    thickness: 0.3,
    side: THREE.DoubleSide
  });
  const canopy = new THREE.Mesh(canopyGeo, canopyMat);
  canopy.rotation.y = -Math.PI / 2;
  canopy.position.set(0, 1.5, 0.3);
  chassisGroup.add(canopy);

  // Circular Rotating Tray Group
  trayGroup = new THREE.Group();
  trayGroup.position.set(0, 0.45, 0.3);
  scene.add(trayGroup);

  const trayDiscGeo = new THREE.CylinderGeometry(2.9, 2.9, 0.28, 48);
  const trayMat = new THREE.MeshStandardMaterial({
    color: 0x182436,
    metalness: 0.75,
    roughness: 0.25
  });
  const trayDisc = new THREE.Mesh(trayDiscGeo, trayMat);
  trayDisc.receiveShadow = true;
  trayGroup.add(trayDisc);

  // Central Rotating Hub Mechanism with Cyan LED Ring
  const centralHubGeo = new THREE.CylinderGeometry(0.75, 0.85, 0.5, 32);
  const centralHub = new THREE.Mesh(centralHubGeo, darkMetalMat);
  centralHub.position.y = 0.25;
  trayGroup.add(centralHub);

  const hubRingGeo = new THREE.TorusGeometry(0.78, 0.04, 16, 48);
  const hubRing = new THREE.Mesh(hubRingGeo, cyanGlowMat);
  hubRing.rotation.x = Math.PI / 2;
  hubRing.position.y = 0.4;
  trayGroup.add(hubRing);

  // Create 8 numbered sequential compartments with colorful 3D pills
  const compartmentCount = 8;
  const trayRadius = 2.05;

  for (let i = 0; i < compartmentCount; i++) {
    const angle = (i / compartmentCount) * Math.PI * 2;
    const x = Math.cos(angle) * trayRadius;
    const z = Math.sin(angle) * trayRadius;

    // Compartment hole pocket
    const holeGeo = new THREE.CylinderGeometry(0.44, 0.4, 0.26, 24);
    const holeMat = new THREE.MeshStandardMaterial({
      color: 0x091424,
      roughness: 0.45,
      metalness: 0.5
    });
    const hole = new THREE.Mesh(holeGeo, holeMat);
    hole.position.set(x, 0.03, z);
    trayGroup.add(hole);

    // Number Badge (1 to 8 sequentially in blue circular pill style)
    const canvasText = document.createElement("canvas");
    canvasText.width = 128;
    canvasText.height = 128;
    const ctx = canvasText.getContext("2d");
    ctx.fillStyle = "#0c2448";
    ctx.beginPath();
    ctx.arc(64, 64, 56, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#3ee0ff";
    ctx.lineWidth = 10;
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 64px Orbitron, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(i + 1), 64, 66);

    const texture = new THREE.CanvasTexture(canvasText);
    const badgeGeo = new THREE.PlaneGeometry(0.42, 0.42);
    const badgeMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const badge = new THREE.Mesh(badgeGeo, badgeMat);
    badge.rotation.x = -Math.PI / 2;
    badge.rotation.z = -angle - Math.PI / 2;
    badge.position.set(x * 0.7, 0.16, z * 0.7);
    trayGroup.add(badge);

    // Populate ALL compartments with realistic pills/capsules
    const pillGroup = new THREE.Group();
    pillGroup.position.set(x, 0.16, z);
    trayGroup.add(pillGroup);

    if (i === 0) {
      // Tray 1: White round tablets
      for (let k = 0; k < 4; k++) {
        const pMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16), new THREE.MeshStandardMaterial({ color: 0xffffff }));
        pMesh.position.set((k % 2 - 0.5) * 0.18, 0, (Math.floor(k / 2) - 0.5) * 0.18);
        pillGroup.add(pMesh);
      }
    } else if (i === 1) {
      // Tray 2: Blue & white two-tone capsules
      for (let k = 0; k < 2; k++) {
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.28, 16), new THREE.MeshStandardMaterial({ color: 0x3ee0ff }));
        cap.rotation.z = Math.PI / 3;
        cap.position.set((k - 0.5) * 0.22, 0, 0);
        pillGroup.add(cap);
      }
    } else if (i === 2) {
      // Tray 3: Pink & orange round tablets
      for (let k = 0; k < 4; k++) {
        const color = k % 2 === 0 ? 0xff6b8a : 0xff9e44;
        const pMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.08, 16), new THREE.MeshStandardMaterial({ color }));
        pMesh.position.set((k % 2 - 0.5) * 0.18, 0, (Math.floor(k / 2) - 0.5) * 0.18);
        pillGroup.add(pMesh);
      }
    } else if (i === 3) {
      // Tray 4: Translucent yellow gel caps
      for (let k = 0; k < 3; k++) {
        const gel = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), new THREE.MeshPhysicalMaterial({ color: 0xffbe3c, transparent: true, opacity: 0.75, roughness: 0.1 }));
        gel.position.set((k - 1) * 0.16, 0, 0);
        pillGroup.add(gel);
      }
    } else if (i === 4) {
      // Tray 5: B-12 yellow round tablets & blue pills (as in prompt rule)
      for (let k = 0; k < 4; k++) {
        const b12 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.09, 16), new THREE.MeshStandardMaterial({ color: 0xffd026, roughness: 0.3 }));
        b12.position.set((k % 2 - 0.5) * 0.18, 0, (Math.floor(k / 2) - 0.5) * 0.18);
        pillGroup.add(b12);
      }
      const extraBlue = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.24, 16), new THREE.MeshStandardMaterial({ color: 0x3ee0ff }));
      extraBlue.rotation.z = Math.PI / 2;
      extraBlue.position.set(0, 0.1, 0);
      pillGroup.add(extraBlue);
    } else if (i === 5) {
      // Tray 6: Green round tablets
      for (let k = 0; k < 4; k++) {
        const pMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16), new THREE.MeshStandardMaterial({ color: 0x10b981 }));
        pMesh.position.set((k % 2 - 0.5) * 0.18, 0, (Math.floor(k / 2) - 0.5) * 0.18);
        pillGroup.add(pMesh);
      }
    } else if (i === 6) {
      // Tray 7: Orange & white capsules
      for (let k = 0; k < 2; k++) {
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.28, 16), new THREE.MeshStandardMaterial({ color: 0xff7e26 }));
        cap.rotation.z = -Math.PI / 4;
        cap.position.set((k - 0.5) * 0.22, 0, 0);
        pillGroup.add(cap);
      }
    } else if (i === 7) {
      // Tray 8: White capsules
      for (let k = 0; k < 3; k++) {
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.26, 16), new THREE.MeshStandardMaterial({ color: 0xf5f7fb }));
        cap.position.set((k - 1) * 0.16, 0, 0);
        pillGroup.add(cap);
      }
    }
  }

  // Suction pipes positioned over tray positions 1 and 8 as shown in the reference design
  const angle1 = 0; // Position 1
  const angle8 = ((compartmentCount - 1) / compartmentCount) * Math.PI * 2; // Position 8

  function buildSuctionAssembly(angle, colorHex, label) {
    const pipeGroup = new THREE.Group();
    const x = Math.cos(angle) * trayRadius;
    const z = Math.sin(angle) * trayRadius + 0.3;

    // Overhead Bracket Arm
    const armGeo = new THREE.BoxGeometry(0.28, 0.28, 1.2);
    const armMat = new THREE.MeshStandardMaterial({ color: 0x243b5a, metalness: 0.8, roughness: 0.2 });
    const arm = new THREE.Mesh(armGeo, armMat);
    arm.position.set(x * 0.7, 2.5, z * 0.7);
    arm.lookAt(x, 2.5, z);
    pipeGroup.add(arm);

    // Clear Flexible Pneumatic Hose
    const tubeGeo = new THREE.CylinderGeometry(0.07, 0.07, 1.4, 16);
    const tubeMat = new THREE.MeshPhysicalMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.65,
      transmission: 0.7,
      roughness: 0.2
    });
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    tube.position.set(x, 1.8, z);
    pipeGroup.add(tube);

    // Chrome Collar Fitting
    const collarGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.2, 20);
    const collarMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.95, roughness: 0.1 });
    const collar = new THREE.Mesh(collarGeo, collarMat);
    collar.position.set(x, 1.2, z);
    pipeGroup.add(collar);

    // Suction Nozzle / Cup
    const nozzleGeo = new THREE.ConeGeometry(0.18, 0.24, 20);
    const nozzleMat = new THREE.MeshStandardMaterial({ color: 0xffbe3c, roughness: 0.3 });
    const nozzle = new THREE.Mesh(nozzleGeo, nozzleMat);
    nozzle.position.set(x, 1.02, z);
    pipeGroup.add(nozzle);

    // Pneumatic Indicator Sensor LED
    const sensorGeo = new THREE.SphereGeometry(0.1, 16, 16);
    const sensorMat = new THREE.MeshBasicMaterial({ color: 0x3ee0ff });
    const sensor = new THREE.Mesh(sensorGeo, sensorMat);
    sensor.position.set(x, 2.45, z);
    pipeGroup.add(sensor);

    return pipeGroup;
  }

  const suctionPipe1 = buildSuctionAssembly(angle1, 0x3ee0ff, "Position 1");
  const suctionPipe8 = buildSuctionAssembly(angle8, 0x7af0ff, "Position 8");
  scene.add(suctionPipe1);
  scene.add(suctionPipe8);

  // Active Dispensing Mechanism Gantry Assembly (Position 1)
  suctionGroup = new THREE.Group();
  scene.add(suctionGroup);

  const gantryPiston = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 1.5, 16),
    new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9, roughness: 0.15 })
  );
  gantryPiston.position.set(Math.cos(angle1) * trayRadius, 1.9, Math.sin(angle1) * trayRadius + 0.3);
  suctionGroup.add(gantryPiston);

  // Active Picked Pill (lifts from tray to chute during dispense)
  const pillGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.11, 20);
  const pillMat = new THREE.MeshStandardMaterial({ color: 0xffd026, roughness: 0.2, metalness: 0.1 });
  pillMesh = new THREE.Mesh(pillGeo, pillMat);
  pillMesh.position.set(Math.cos(angle1) * trayRadius, 0.95, Math.sin(angle1) * trayRadius + 0.3);
  pillMesh.visible = false;
  scene.add(pillMesh);

  // Mouse Orbit Controls (drag to rotate view)
  let isDragging = false;
  let prevMouseX = 0;
  let prevMouseY = 0;
  let spherical = { radius: 12.0, phi: Math.PI / 3.4, theta: 0.2 };

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
      spherical.radius = Math.max(6.5, Math.min(18, spherical.radius + e.deltaY * 0.01));
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

    // Pulse Child & Pet proof security light
    if (alarmLed) {
      const pulse = 0.5 + 0.5 * Math.sin(clock.getElapsedTime() * 3);
      alarmLed.scale.setScalar(0.9 + 0.18 * pulse);
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
   5. Slide 11 Controls, View Toggle & 6-Step Dispense Sequence
   ========================================================================== */
const rotateTrayBtn = document.getElementById("btn-rotate-tray");
const dispenseBtn = document.getElementById("btn-dispense");
const resetTrayBtn = document.getElementById("btn-reset-tray");
const medisortStatus = document.getElementById("medisort-status");

const btnView3D = document.getElementById("btn-view-3d");
const btnViewConcept = document.getElementById("btn-view-concept");
const pane3D = document.getElementById("pane-3d");
const paneConcept = document.getElementById("pane-concept");

if (btnView3D && btnViewConcept && pane3D && paneConcept) {
  btnView3D.addEventListener("click", () => {
    btnView3D.classList.add("active");
    btnViewConcept.classList.remove("active");
    pane3D.classList.remove("hidden-layout");
    paneConcept.classList.add("hidden-layout");
    if (resizeRenderer) setTimeout(resizeRenderer, 120);
  });

  btnViewConcept.addEventListener("click", () => {
    btnViewConcept.classList.add("active");
    btnView3D.classList.remove("active");
    paneConcept.classList.remove("hidden-layout");
    pane3D.classList.add("hidden-layout");
  });
}

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
      pillMesh.position.set(2.05, 0.95, 0.3);
    }
    if (dispensedPillMesh) {
      dispensedPillMesh.visible = false;
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
    trayTargetAngle = Math.PI; // Rotate Tray 5 into position
    await delay(800);

    // Step 2: The correct compartment aligns with the suction pipe.
    setStatus("2. Compartment aligned with suction pipe", "var(--cyan)");
    await delay(600);

    // Step 3: The suction mechanism activates.
    setStatus("3. Suction mechanism activates", "var(--mint)");
    if (suctionGroup) {
      // Lower suction mechanism
      await animateValue(0, -0.6, 500, (v) => (suctionGroup.position.y = v));
    }
    await delay(300);

    // Step 4: The medicine is picked up.
    setStatus("4. Medicine picked up", "var(--mint)");
    if (pillMesh) {
      pillMesh.visible = true;
      pillMesh.position.set(2.05, 0.65, 0.3);
    }
    // Raise suction and pill together
    await animateValue(-0.6, 0.4, 600, (v) => {
      if (suctionGroup) suctionGroup.position.y = v;
      if (pillMesh) pillMesh.position.y = 1.25 + v;
    });

    // Step 5: The medicine travels toward the dispensing area.
    setStatus("5. Medicine travels to dispensing area", "var(--amber)");
    await animateValue(0, 1, 900, (t) => {
      // Arc toward chute at (0, 0.35, 3.2)
      const curX = 2.05 * (1 - t);
      const curZ = 0.3 + 2.9 * t;
      const curY = 1.6 + Math.sin(t * Math.PI) * 0.4;
      if (pillMesh) pillMesh.position.set(curX, curY, curZ);
      if (suctionGroup) suctionGroup.position.set(curX - 2.05, curY - 1.6, curZ - 0.3);
    });

    // Step 6: The medicine is released.
    setStatus("6. Medicine released into output area", "var(--mint)");
    // Drop pill into chute
    await animateValue(1.6, 0.35, 350, (y) => {
      if (pillMesh) pillMesh.position.y = y;
    });
    if (pillMesh) pillMesh.visible = false;
    if (dispensedPillMesh) dispensedPillMesh.visible = true;

    // Retract suction mechanism back home
    await delay(250);
    if (suctionGroup) {
      await animateValue(0, 1, 550, (t) => {
        suctionGroup.position.x = (1 - t) * (0 - 2.05);
        suctionGroup.position.z = (1 - t) * 2.9;
        suctionGroup.position.y = (1 - t) * (0.35 - 1.6);
      });
      suctionGroup.position.set(0, 0, 0);
    }

    setStatus("Dispense complete • Verified 1 pill (0.52g)", "var(--cyan-2)");
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
