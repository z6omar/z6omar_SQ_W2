// ============================================================
// PLATFORMER WITH BACKGROUND, PLAYER IMAGE, AND CRUMBLING PLATFORM
// ============================================================

// ------------------------------------------------------------
// ASSETS
// ------------------------------------------------------------
let bgImg;        // background image placeholder
let playerImg;    // player image placeholder

function preload() {
  bgImg = loadImage("sushi.png");
  playerImg = loadImage("sushi_kitchen.jpg");
}

// ------------------------------------------------------------
// PLATFORMS ARRAY
// Added: type: "normal" or "crumble"
// Added: state tracking for crumble platform
// ------------------------------------------------------------
let platforms = [
  { x: 0,   y: 410, w: 800, h: 40, type: "normal" }, // ground
  { x: 100, y: 300, w: 150, h: 16, type: "normal" },
  { x: 350, y: 240, w: 150, h: 16, type: "normal" },
  { x: 600, y: 180, w: 120, h: 16, type: "normal" },

  // ⭐ Special crumbling platform
  {
    x: 250,
    y: 150,
    w: 140,
    h: 16,
    type: "crumble",
    timer: 0,
    shaking: false,
    falling: false,
    originalY: 150
  }
];

// ------------------------------------------------------------
// PLAYER OBJECT
// ------------------------------------------------------------
let player = {
  x: 100,
  y: 100,
  vx: 0,
  vy: 0,
  w: 40,   // width for image
  h: 40,   // height for image
  speed: 0.55,
  maxSpeed: 4.5,
  jumpForce: -12,
  friction: 0.78,
  onGround: false
};

const GRAVITY = 0.6;

// ============================================================
// setup()
// ============================================================
function setup() {
  createCanvas(800, 450);
  player.y = platforms[0].y - player.h / 2;
}

// ============================================================
// draw()
// ============================================================
function draw() {
  // Draw background image
  image(bgImg, 0, 0, width, height);

  handleInput();
  applyPhysics();
  resolvePlatformCollisions();
  updateCrumblePlatform();

  drawPlatforms();
  drawPlayer();
  drawHUD();
}

// ------------------------------------------------------------
// handleInput()
// ------------------------------------------------------------
function handleInput() {
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) player.vx -= player.speed;
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) player.vx += player.speed;

  player.vx = constrain(player.vx, -player.maxSpeed, player.maxSpeed);

  if (
    !keyIsDown(LEFT_ARROW) &&
    !keyIsDown(65) &&
    !keyIsDown(RIGHT_ARROW) &&
    !keyIsDown(68)
  ) {
    player.vx *= player.friction;
  }

  if ((keyIsDown(UP_ARROW) || keyIsDown(87)) && player.onGround) {
    player.vy = player.jumpForce;
    player.onGround = false;
  }
}

// ------------------------------------------------------------
// applyPhysics()
// ------------------------------------------------------------
function applyPhysics() {
  player.vy += GRAVITY;
  player.x += player.vx;
  player.y += player.vy;

  player.x = constrain(player.x, player.w / 2, width - player.w / 2);

  if (player.y > height + 100) resetPlayer();

  player.onGround = false;
}

// ------------------------------------------------------------
// resolvePlatformCollisions()
// ------------------------------------------------------------
function resolvePlatformCollisions() {
  for (let p of platforms) {
    if (p.falling) continue; // falling platforms can't be stood on

    let playerLeft = player.x - player.w / 2;
    let playerRight = player.x + player.w / 2;
    let playerBottom = player.y + player.h / 2;

    let overlapsHoriz = playerRight > p.x && playerLeft < p.x + p.w;
    let landingOnTop =
      player.vy >= 0 &&
      playerBottom >= p.y &&
      playerBottom <= p.y + 20;

    if (overlapsHoriz && landingOnTop) {
      player.y = p.y - player.h / 2;
      player.vy = 0;
      player.onGround = true;

      if (p.type === "crumble") {
        if (!p.shaking && !p.falling) {
          p.shaking = true;
          p.timer = millis();
        }
      }
    }
  }
}

// ------------------------------------------------------------
// updateCrumblePlatform()
// Handles shaking → falling → resetting
// ------------------------------------------------------------
function updateCrumblePlatform() {
  for (let p of platforms) {
    if (p.type !== "crumble") continue;

    if (p.shaking && !p.falling) {
      // Shake for 3 seconds
      if (millis() - p.timer < 3000) {
        p.x += random(-2, 2);
      } else {
        p.falling = true;
      }
    }

    if (p.falling) {
      p.y += 5; // fall speed
      if (p.y > height + 50) {
        // Reset platform
        p.y = p.originalY;
        p.falling = false;
        p.shaking = false;
      }
    }
  }
}

// ------------------------------------------------------------
// drawPlatforms()
// ------------------------------------------------------------
function drawPlatforms() {
  noStroke();

  for (let p of platforms) {
    if (p.type === "crumble") {
      fill(255, 60, 60); // red
    } else {
      fill(255, 160, 50);
    }
    rect(p.x, p.y, p.w, p.h, 6);
  }
}

// ------------------------------------------------------------
// drawPlayer()
// ------------------------------------------------------------
function drawPlayer() {
  imageMode(CENTER);
  image(playerImg, player.x, player.y, player.w, player.h);
}

// ------------------------------------------------------------
// drawHUD()
// ------------------------------------------------------------
function drawHUD() {
  fill(255);
  textSize(14);
  text("Move: Arrow Keys or WASD   Jump: W or Up Arrow", 16, 24);
}

// ------------------------------------------------------------
// resetPlayer()
// ------------------------------------------------------------
function resetPlayer() {
  player.x = 100;
  player.y = platforms[0].y - player.h / 2;
  player.vx = 0;
  player.vy = 0;

  // Reset crumble platform
  for (let p of platforms) {
    if (p.type === "crumble") {
      p.y = p.originalY;
      p.shaking = false;
      p.falling = false;
    }
  }
}
