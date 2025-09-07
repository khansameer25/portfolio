const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Smooth Mouse Movement
let targetMouseX = window.innerWidth / 2;
let lerpedMouseX = window.innerWidth / 2;
let targetMouseY = window.innerHeight / 2;
let lerpedMouseY = window.innerHeight / 2;

const lerpFactor = 0.08;
const tiltStrength = 4;
const verticalInfluence = 0.6;

window.addEventListener("mousemove", (e) => {
  targetMouseX = e.clientX;
  targetMouseY = e.clientY;
});

// Wave configuration
const waves = [
  {
    amplitude: 16,
    wavelength: 420,
    speed: 0.25,
    colorStops: [
      { stop: 0, color: "rgba(30, 120, 70, 0.22)" },
      { stop: 1, color: "rgba(20, 80, 50, 0.28)" },
    ],
    offset: 0,
    yOffset: 0.56,
  },
  {
    amplitude: 10,
    wavelength: 260,
    speed: 0.35,
    colorStops: [
      { stop: 0, color: "rgba(30, 120, 70, 0.15)" },
      { stop: 1, color: "rgba(20, 80, 50, 0.19)" },
    ],
    offset: Math.PI / 2,
    yOffset: 0.62,
  },
  {
    amplitude: 7,
    wavelength: 180,
    speed: 0.5,
    colorStops: [
      { stop: 0, color: "rgba(30, 120, 70, 0.10)" },
      { stop: 1, color: "rgba(20, 80, 50, 0.13)" },
    ],
    offset: Math.PI,
    yOffset: 0.7,
  },
];

// Stars
const stars = Array.from({ length: 200 }, () => ({
  x: Math.random() * window.innerWidth,
  y: Math.random() * window.innerHeight * 0.5,
  radius: Math.random() * 1.5 + 0.5,
  twinkleSpeed: Math.random() * 0.05 + 0.01,
  twinkleOffset: Math.random() * 1000,
}));

function drawStars(time) {
  stars.forEach((star) => {
    const alpha =
      0.5 + 0.5 * Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fill();
  });
}

// Shooting Stars
const shootingStars = [];

function createShootingStar() {
  const x = Math.random() * canvas.width * 1.5 - canvas.width * 0.25;
  const y = Math.random() * canvas.height * 0.2;
  const length = 250 + Math.random() * 150;
  const speed = 15;
  const angle = Math.PI / 4 + Math.random() * 0.2 - 0.1;
  const life = 100 + Math.random() * 50;

  shootingStars.push({ x, y, length, speed, angle, life, age: 0 });
}

function updateShootingStars() {
  for (let i = shootingStars.length - 1; i >= 0; i--) {
    const star = shootingStars[i];
    star.age++;

    if (star.age > star.life) {
      shootingStars.splice(i, 1);
      continue;
    }

    const progress = star.age / star.life;
    const currentX = star.x + Math.cos(star.angle) * star.speed * star.age;
    const currentY = star.y + Math.sin(star.angle) * star.speed * star.age;
    const tailX = currentX - Math.cos(star.angle) * star.length;
    const tailY = currentY - Math.sin(star.angle) * star.length;
    const grad = ctx.createLinearGradient(currentX, currentY, tailX, tailY);
    grad.addColorStop(0, "rgba(255, 255, 255, 1)");
    grad.addColorStop(1, "rgba(255, 255, 255, 0)");
    const alpha = Math.sin(progress * Math.PI);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(currentX, currentY);
    ctx.lineTo(tailX, tailY);
    ctx.stroke();
    ctx.restore();
  }

  if (Math.random() < 0.0015 && shootingStars.length < 3) {
    createShootingStar();
  }
}

// Clouds
const clouds = Array.from({ length: 5 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height * 0.4,
  speed: 0.2 + Math.random() * 0.3,
  size: 60 + Math.random() * 100,
}));

function drawClouds() {
  clouds.forEach((cloud) => {
    ctx.save();
    const gradient = ctx.createRadialGradient(
      cloud.x,
      cloud.y,
      cloud.size * 0.4,
      cloud.x,
      cloud.y,
      cloud.size
    );
    gradient.addColorStop(0, "rgba(255,255,255,0.04)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
    ctx.fill();
    cloud.x += cloud.speed;
    if (cloud.x - cloud.size > canvas.width) {
      cloud.x = -cloud.size;
    }
    ctx.restore();
  });
}

// Crescent Moon
function drawCrescentMoon() {
  const x = canvas.width - 130;
  const y = 100;
  const outerRadius = 40;
  const innerOffset = 10;

  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, outerRadius, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(253, 246, 227, 0.09)";
  ctx.shadowColor = "#b6b6a8";
  ctx.shadowBlur = 28;
  ctx.fill();
  ctx.closePath();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, outerRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#eae7d6";
  ctx.fill();

  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(x + innerOffset, y - 2, outerRadius * 0.9, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
  ctx.restore();
}

// Main drawing function
function drawScene(time) {
  lerpedMouseX += (targetMouseX - lerpedMouseX) * lerpFactor;
  lerpedMouseY += (targetMouseY - lerpedMouseY) * lerpFactor;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawStars(time);
  drawClouds();
  drawCrescentMoon();
  updateShootingStars();

  const amplitudeModifier =
    1 + (0.5 - lerpedMouseY / canvas.height) * 2 * verticalInfluence;
  const tilt = ((lerpedMouseX / canvas.width - 0.5) * Math.PI) / tiltStrength;

  waves.forEach((wave) => {
    ctx.save();
    const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    wave.colorStops.forEach((cs) => grad.addColorStop(cs.stop, cs.color));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    for (let x = 0; x <= canvas.width; x += 2) {
      const phase = wave.offset + time * wave.speed + tilt * (x / canvas.width);
      const y =
        Math.sin((x / wave.wavelength) * 2 * Math.PI + phase) *
          (wave.amplitude * amplitudeModifier) +
        canvas.height * wave.yOffset;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();
    ctx.shadowColor = "#101513";
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.restore();
  });
}

function animate() {
  const time = performance.now() / 1000;
  drawScene(time);
  requestAnimationFrame(animate);
}

animate();
