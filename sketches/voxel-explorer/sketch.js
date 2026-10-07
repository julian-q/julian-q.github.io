const TILE = 34;
const WORLD_RADIUS = 18;
const WATER_LEVEL = 0;
const RENDER_RADIUS = 12;
const MAX_PITCH = 1.15;

let terrain = new Map();
let crystals = [];
let beacons = [];
let player;
let dragging = false;
let lastMouseX = 0;
let lastMouseY = 0;
let lastTime = 0;
let collected = 0;
let canvas;
let shardHud;

function setup() {
  canvas = createCanvas(400, 400, WEBGL);
  canvas.parent("p5");
  pixelDensity(Math.min(2, window.devicePixelRatio || 1));
  frameRate(60);
  noiseSeed(42);
  randomSeed(8);
  textFont("Trebuchet MS");

  buildWorld();
  placeCrystals();
  setupHud();
  player = {
    x: 0.5,
    z: -2.5,
    y: groundAt(0.5, -2.5) + 1.65,
    vy: 0,
    yaw: -0.75,
    pitch: 0.12,
    bob: 0
  };

  const elt = canvas.elt;
  elt.addEventListener("contextmenu", function(event) {
    event.preventDefault();
  });
  window.addEventListener("keydown", blockGameScroll, { passive: false });
  lastTime = millis();
}

function draw() {
  const now = millis();
  const dt = Math.min(0.05, (now - lastTime) / 1000 || 0.016);
  lastTime = now;

  updatePlayer(dt);
  collectCrystals();

  background(126, 184, 218);
  setPlayerCamera();
  drawSkyGlow();
  drawWater();
  drawWorld();
  drawCrystals();
  drawBeacons();
  drawOverlay();
}

function buildWorld() {
  terrain.clear();
  for (let gx = -WORLD_RADIUS; gx <= WORLD_RADIUS; gx++) {
    for (let gz = -WORLD_RADIUS; gz <= WORLD_RADIUS; gz++) {
      const dist = Math.sqrt(gx * gx + gz * gz);
      if (dist > WORLD_RADIUS + 0.35) {
        continue;
      }

      const broad = noise(gx * 0.1 + 50, gz * 0.1 - 30);
      const detail = noise(gx * 0.25 - 10, gz * 0.25 + 70);
      const ridge = Math.sin(gx * 0.45) * 0.55 + Math.cos(gz * 0.35) * 0.4;
      const island = 1 - Math.pow(dist / WORLD_RADIUS, 1.8);
      let h = Math.floor(1 + island * 7 + broad * 4 + detail * 2 + ridge);
      if (dist > WORLD_RADIUS - 3) {
        h -= Math.floor((dist - (WORLD_RADIUS - 3)) * 1.6);
      }
      h = constrain(h, -1, 9);
      terrain.set(keyFor(gx, gz), h);
    }
  }

  softenSpawn();
}

function softenSpawn() {
  for (let gx = -5; gx <= 5; gx++) {
    for (let gz = -7; gz <= 4; gz++) {
      const d = Math.sqrt(gx * gx + (gz + 2) * (gz + 2));
      if (d < 3) {
        terrain.set(keyFor(gx, gz), 7);
      } else if (d < 5.4) {
        terrain.set(keyFor(gx, gz), 8);
      }
    }
  }
}

function placeCrystals() {
  crystals = [];
  const candidates = [];
  terrain.forEach(function(h, key) {
    if (h <= WATER_LEVEL) {
      return;
    }
    const parts = key.split(",");
    const gx = Number(parts[0]);
    const gz = Number(parts[1]);
    const dist = Math.sqrt(gx * gx + gz * gz);
    const slope = Math.abs(h - heightAt(gx + 1, gz)) +
      Math.abs(h - heightAt(gx - 1, gz)) +
      Math.abs(h - heightAt(gx, gz + 1)) +
      Math.abs(h - heightAt(gx, gz - 1));
    if (dist > 5 && dist < WORLD_RADIUS - 2 && slope < 8) {
      candidates.push({ x: gx, z: gz, h: h, score: h * 2 + dist + random() });
    }
  });
  candidates.sort(function(a, b) {
    return b.score - a.score;
  });

  for (let i = 0; i < candidates.length && crystals.length < 8; i++) {
    const c = candidates[i];
    let farEnough = true;
    for (let j = 0; j < crystals.length; j++) {
      if (dist(c.x, c.z, crystals[j].x, crystals[j].z) < 6) {
        farEnough = false;
        break;
      }
    }
    if (farEnough) {
      crystals.push({ x: c.x, z: c.z, h: c.h, found: false, spin: random(TWO_PI) });
    }
  }
}

function updatePlayer(dt) {
  const turnSpeed = 1.55;
  if (keyIsDown(LEFT_ARROW)) {
    player.yaw -= turnSpeed * dt;
  }
  if (keyIsDown(RIGHT_ARROW)) {
    player.yaw += turnSpeed * dt;
  }
  if (keyIsDown(UP_ARROW)) {
    player.pitch = constrain(player.pitch - turnSpeed * 0.45 * dt, -MAX_PITCH, MAX_PITCH);
  }
  if (keyIsDown(DOWN_ARROW)) {
    player.pitch = constrain(player.pitch + turnSpeed * 0.45 * dt, -MAX_PITCH, MAX_PITCH);
  }

  let forward = 0;
  let strafe = 0;
  if (keyIsDown(87)) forward += 1;
  if (keyIsDown(83)) forward -= 1;
  if (keyIsDown(65)) strafe -= 1;
  if (keyIsDown(68)) strafe += 1;
  if (keyIsDown(UP_ARROW)) forward += 1;
  if (keyIsDown(DOWN_ARROW)) forward -= 1;

  const moving = forward !== 0 || strafe !== 0;
  if (moving) {
    const mag = Math.sqrt(forward * forward + strafe * strafe);
    forward /= mag;
    strafe /= mag;
    const speed = keyIsDown(SHIFT) ? 5.8 : 4.15;
    const sx = Math.sin(player.yaw + HALF_PI);
    const sz = Math.cos(player.yaw + HALF_PI);
    const fx = Math.sin(player.yaw);
    const fz = Math.cos(player.yaw);
    tryMove((fx * forward + sx * strafe) * speed * dt,
            (fz * forward + sz * strafe) * speed * dt);
    player.bob += dt * speed * 2.4;
  } else {
    player.bob = lerp(player.bob, 0, 0.08);
  }

  const ground = groundAt(player.x, player.z) + 1.65;
  const grounded = player.y <= ground + 0.03;
  if (grounded && keyIsDown(32)) {
    player.vy = 5.1;
  }
  player.vy -= 13.5 * dt;
  player.y += player.vy * dt;
  if (player.y < ground) {
    player.y = ground;
    player.vy = 0;
  }

  const targetGround = groundAt(player.x, player.z) + 1.65;
  if (player.y < targetGround) {
    player.y = lerp(player.y, targetGround, 0.35);
  }
}

function tryMove(dx, dz) {
  const nextX = player.x + dx;
  const nextZ = player.z + dz;
  const here = heightAt(Math.floor(player.x), Math.floor(player.z));
  const there = heightAt(Math.floor(nextX), Math.floor(nextZ));
  const worldEdge = Math.sqrt(nextX * nextX + nextZ * nextZ) > WORLD_RADIUS - 0.75;
  if (!worldEdge && there > WATER_LEVEL && Math.abs(there - here) <= 2.25) {
    player.x = nextX;
    player.z = nextZ;
  }
}

function collectCrystals() {
  for (let i = 0; i < crystals.length; i++) {
    const c = crystals[i];
    if (c.found) {
      continue;
    }
    const d = dist(player.x, player.z, c.x + 0.5, c.z + 0.5);
    if (d < 1.15 && player.y < c.h + 3.2) {
      c.found = true;
      collected++;
      beacons.push({
        x: c.x,
        z: c.z,
        h: c.h,
        t: millis()
      });
    }
  }
}

function setPlayerCamera() {
  const eye = worldToScene(player.x, player.y + Math.sin(player.bob) * 0.035, player.z);
  const lookDistance = 6;
  const dirX = Math.sin(player.yaw) * Math.cos(player.pitch);
  const dirZ = Math.cos(player.yaw) * Math.cos(player.pitch);
  const dirY = Math.sin(player.pitch);
  const center = {
    x: eye.x + dirX * TILE * lookDistance,
    y: eye.y + dirY * TILE * lookDistance,
    z: eye.z + dirZ * TILE * lookDistance
  };
  perspective(PI / 3.2, width / height, 1, 4200);
  camera(eye.x, eye.y, eye.z, center.x, center.y, center.z, 0, 1, 0);
}

function drawSkyGlow() {
  push();
  noStroke();
  translate(0, -360, -900);
  emissiveMaterial(255, 207, 125, 80);
  sphere(95, 16, 10);
  pop();

  ambientLight(120, 128, 146);
  directionalLight(245, 236, 202, -0.4, 0.75, -0.35);
  pointLight(255, 156, 90, 0, -300, -500);
}

function drawWater() {
  push();
  noStroke();
  translate(0, sceneY(WATER_LEVEL - 0.35), 0);
  rotateX(HALF_PI);
  ambientMaterial(45, 117, 170, 185);
  plane(TILE * WORLD_RADIUS * 2.7, TILE * WORLD_RADIUS * 2.7);
  pop();
}

function drawWorld() {
  const px = Math.floor(player.x);
  const pz = Math.floor(player.z);
  for (let gx = px - RENDER_RADIUS; gx <= px + RENDER_RADIUS; gx++) {
    for (let gz = pz - RENDER_RADIUS; gz <= pz + RENDER_RADIUS; gz++) {
      const h = heightAt(gx, gz);
      if (h <= WATER_LEVEL) {
        continue;
      }
      const d = dist(player.x, player.z, gx + 0.5, gz + 0.5);
      if (d > RENDER_RADIUS + 1.5) {
        continue;
      }

      for (let gy = 1; gy <= h; gy++) {
        if (!isVisibleVoxel(gx, gy, gz, h)) {
          continue;
        }
        drawVoxel(gx, gy, gz, blockColor(gy, h, gx, gz), d);
      }
    }
  }
}

function isVisibleVoxel(gx, gy, gz, columnHeight) {
  if (gy === columnHeight) {
    return true;
  }
  return heightAt(gx + 1, gz) < gy ||
    heightAt(gx - 1, gz) < gy ||
    heightAt(gx, gz + 1) < gy ||
    heightAt(gx, gz - 1) < gy;
}

function drawVoxel(gx, gy, gz, col, distanceFromPlayer) {
  const p = worldToScene(gx + 0.5, gy - 0.5, gz + 0.5);
  push();
  translate(p.x, p.y, p.z);
  noStroke();
  ambientMaterial(
    Math.max(0, col[0] - distanceFromPlayer * 2),
    Math.max(0, col[1] - distanceFromPlayer * 2),
    Math.max(0, col[2] - distanceFromPlayer * 2)
  );
  box(TILE * 0.96);
  pop();
}

function blockColor(gy, h, gx, gz) {
  if (gy < h - 2) {
    return [91, 74, 56];
  }
  if (h >= 9 && gy === h) {
    return [202, 216, 204];
  }
  if (h >= 7 && gy === h) {
    return [72, 135, 96];
  }
  if (h <= 2 && gy === h) {
    return [207, 184, 112];
  }
  const fleck = noise(gx * 0.7, gz * 0.7) * 25;
  if (gy === h) {
    return [68 + fleck, 146 + fleck * 0.5, 85 + fleck * 0.2];
  }
  return [118, 88, 57];
}

function drawCrystals() {
  for (let i = 0; i < crystals.length; i++) {
    const c = crystals[i];
    if (c.found || dist(player.x, player.z, c.x, c.z) > RENDER_RADIUS + 2) {
      continue;
    }
    const floatY = c.h + 0.72 + Math.sin(frameCount * 0.04 + c.spin) * 0.16;
    const p = worldToScene(c.x + 0.5, floatY, c.z + 0.5);
    push();
    translate(p.x, p.y, p.z);
    rotateY(frameCount * 0.025 + c.spin);
    rotateX(0.62);
    noStroke();
    emissiveMaterial(69, 238, 212);
    box(TILE * 0.34, TILE * 0.62, TILE * 0.34);
    pointLight(60, 220, 210, p.x, p.y, p.z);
    pop();
  }
}

function drawBeacons() {
  for (let i = beacons.length - 1; i >= 0; i--) {
    const b = beacons[i];
    const age = (millis() - b.t) / 1000;
    if (age > 2.6) {
      beacons.splice(i, 1);
      continue;
    }
    const p = worldToScene(b.x + 0.5, b.h + age * 2.2, b.z + 0.5);
    push();
    translate(p.x, p.y, p.z);
    rotateY(frameCount * 0.05);
    noFill();
    stroke(166, 255, 232, 190 * (1 - age / 2.6));
    strokeWeight(2);
    box(TILE * (0.8 + age * 0.45));
    pop();
  }
}

function setupHud() {
  shardHud = document.getElementById("voxel-shards");
  if (!shardHud) {
    return;
  }
  shardHud.innerHTML = "";
  for (let i = 0; i < crystals.length; i++) {
    shardHud.appendChild(document.createElement("span"));
  }
}

function drawOverlay() {
  if (!shardHud) {
    return;
  }
  for (let i = 0; i < shardHud.children.length; i++) {
    shardHud.children[i].classList.toggle("found", i < collected);
  }
}

function heightAt(gx, gz) {
  return terrain.get(keyFor(gx, gz)) ?? -4;
}

function groundAt(x, z) {
  return heightAt(Math.floor(x), Math.floor(z));
}

function keyFor(gx, gz) {
  return gx + "," + gz;
}

function worldToScene(x, y, z) {
  return {
    x: x * TILE,
    y: sceneY(y),
    z: z * TILE
  };
}

function sceneY(y) {
  return -y * TILE;
}

function mousePressed() {
  if (mouseInsideCanvas()) {
    dragging = true;
    lastMouseX = mouseX;
    lastMouseY = mouseY;
  }
}

function mouseReleased() {
  dragging = false;
}

function mouseDragged() {
  if (!dragging) {
    return;
  }
  const dx = mouseX - lastMouseX;
  const dy = mouseY - lastMouseY;
  player.yaw += dx * 0.007;
  player.pitch = constrain(player.pitch + dy * 0.006, -MAX_PITCH, MAX_PITCH);
  lastMouseX = mouseX;
  lastMouseY = mouseY;
  return false;
}

function touchMoved() {
  if (touches.length > 0 && mouseInsideCanvas()) {
    player.yaw += (pmouseX - mouseX) * -0.006;
    player.pitch = constrain(player.pitch + (mouseY - pmouseY) * 0.005, -MAX_PITCH, MAX_PITCH);
    return false;
  }
}

function mouseInsideCanvas() {
  return mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
}

function blockGameScroll(event) {
  const gameKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "];
  if (gameKeys.includes(event.key)) {
    event.preventDefault();
  }
}
