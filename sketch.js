let bgImg;
let playerImg;

let platforms = [
  { x: 0,   y: 410, w: 800, h: 40 },
  { x: 60,  y: 330, w: 130, h: 16 },
  { x: 250, y: 275, w: 140, h: 16 },
  { x: 470, y: 220, w: 130, h: 16 },
  { x: 620, y: 150, w: 120, h: 16 },
  { x: 130, y: 180, w: 110, h: 16 },

  // custom falling platform
  {
    x: 360,
    y: 340,
    w: 130,
    h: 16,
    falling: true,
    activated: false,
    startTime: 0,
    fallSpeed: 0
  }
];

let player = {
  x: 100,
  y: 100,
  vx: 0,
  vy: 0,
  r: 20,
  speed: 0.55,
  maxSpeed: 4.5,
  jumpForce: -12,
  friction: 0.78,
  onGround: false
};

const GRAVITY = 0.6;
const PLATFORM_COLOR = [255, 160, 50];

function preload() {
  bgImg = loadImage("assets/images/sushi_kitchen.jpg");   // placeholder background image
  playerImg = loadImage("assets/images/sushi.png"); // placeholder character image
}

function setup() {
  createCanvas(800, 450);
  player.y = platforms[0].y - player.r;
}

function draw() {
  image(bgImg, 0, 0, width, height);

  handleInput();
  applyPhysics();
  updateFallingPlatforms();
  resolvePlatformCollisions();

  drawPlatforms();
  drawPlayer();
  drawHUD();
}

function handleInput() {
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
    player.vx -= player.speed;
  }

  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
    player.vx += player.speed;
  }

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

function applyPhysics() {
  player.vy += GRAVITY;

  player.x += player.vx;
  player.y += player.vy;

  player.x = constrain(player.x, player.r, width - player.r);

  if (player.y > height + 100) {
    player.x = 100;
    player.y = platforms[0].y - player.r;
    player.vx = 0;
    player.vy = 0;
  }

  player.onGround = false;
}

function resolvePlatformCollisions() {
  for (let i = 0; i < platforms.length; i++) {
    let p = platforms[i];

    let playerLeft = player.x - player.r;
    let playerRight = player.x + player.r;
    let playerBottom = player.y + player.r;

    let platLeft = p.x;
    let platRight = p.x + p.w;
    let platTop = p.y;

    let overlapsHorizontally = playerRight > platLeft && playerLeft < platRight;

    let landingOnTop =
      player.vy >= 0 &&
      playerBottom >= platTop &&
      playerBottom <= platTop + 20;

    if (overlapsHorizontally && landingOnTop) {
      player.y = platTop - player.r;
      player.vy = 0;
      player.onGround = true;

      if (p.falling && !p.activated) {
        p.activated = true;
        p.startTime = millis();
      }
    }
  }
}

function updateFallingPlatforms() {
  for (let i = 0; i < platforms.length; i++) {
    let p = platforms[i];

    if (p.falling && p.activated) {
      let timeStanding = millis() - p.startTime;

      if (timeStanding > 3000) {
        p.fallSpeed += 0.4;
        p.y += p.fallSpeed;
      }
    }
  }
}

function drawPlatforms() {
  noStroke();

  for (let i = 0; i < platforms.length; i++) {
    let p = platforms[i];

    let shakeX = 0;

    if (p.falling && p.activated && millis() - p.startTime <= 3000) {
      fill(255, 0, 0);
      shakeX = random(-3, 3);
    } else {
      fill(PLATFORM_COLOR[0], PLATFORM_COLOR[1], PLATFORM_COLOR[2]);
    }

    rect(p.x + shakeX, p.y, p.w, p.h, 6);
  }
}

function drawPlayer() {
  imageMode(CENTER);

  // character image placeholder
  image(playerImg, player.x, player.y, player.r * 2.5, player.r * 2.5);

  imageMode(CORNER);
}

function drawHUD() {
  fill(255);
  noStroke();
  textSize(13);
  textAlign(LEFT);
  text("Move: Arrow Keys or WASD   Jump: W or Up Arrow", 16, 24);
}