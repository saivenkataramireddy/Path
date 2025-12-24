const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let tracking = false;
let path = [];
let pos = { x: canvas.width / 2, y: canvas.height / 2 };
let velocity = { x: 0, y: 0 };

const sensitivity = 10;
const returnThreshold = 10; // px

// ===== PERMISSION (iOS REQUIRED) =====
function requestPermission() {
    if (typeof DeviceMotionEvent !== "undefined" &&
        typeof DeviceMotionEvent.requestPermission === "function") {

        DeviceMotionEvent.requestPermission()
            .then(res => res === "granted" && startTracking());
    } else {
        startTracking();
    }
}

function startTracking() {
    tracking = true;
    path = [{ ...pos }];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    window.addEventListener("devicemotion", handleMotion, true);
}

function stopTracking() {
    tracking = false;
    window.removeEventListener("devicemotion", handleMotion);
}

// ===== MOTION HANDLER =====
function handleMotion(e) {
    if (!tracking) return;

    const acc = e.accelerationIncludingGravity;
    if (!acc) return;

    velocity.x += acc.x * sensitivity;
    velocity.y += acc.y * sensitivity;

    pos.x += velocity.x;
    pos.y += velocity.y;

    velocity.x *= 0.9;
    velocity.y *= 0.9;

    drawPath();
    detectReturn();
}

// ===== DRAW PATH =====
function drawPath() {
    const last = path[path.length - 1];
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#00b0ff";
    ctx.lineWidth = 3;
    ctx.stroke();

    path.push({ ...pos });
}

// ===== DETECT RETURN & SHOW DIRECTION =====
function detectReturn() {
    for (let i = 0; i < path.length - 20; i++) {
        const p = path[i];
        const dx = p.x - pos.x;
        const dy = p.y - pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < returnThreshold) {
            drawArrow(p.x, p.y);
            document.getElementById("info").innerText =
                "⬅️ You are returning — follow arrows";
            return;
        }
    }
    document.getElementById("info").innerText =
        "➡️ Moving forward — drawing path";
}

// ===== DRAW DIRECTION ARROW =====
function drawArrow(x, y) {
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
}

