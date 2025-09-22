// Snake game - HTML Canvas implementation
// Compact, readable, and dependency-free

(function () {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');

  // UI elements
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  const speedSlider = document.getElementById('speed');
  const speedDisplay = document.getElementById('speedDisplay');

  const overlay = document.getElementById('overlay');
  const overlayTitle = document.getElementById('overlayTitle');
  const overlaySub = document.getElementById('overlaySub');
  const btnResume = document.getElementById('btnResume');
  const btnRestart = document.getElementById('btnRestart');

  const btnStart = document.getElementById('btnStart');
  const btnReset = document.getElementById('btnReset');

  // Game settings
  const COLS = 24;
  const ROWS = 24;
  const CELL = canvas.width / COLS; // 480 / 24 = 20

  // Game state
  let snake;
  let dir; // current direction vector {x,y}
  let nextDir; // queued direction to apply at next tick
  let food;
  let score;
  let best = Number(localStorage.getItem('snake-best') || 0);
  let running = false;
  let lastTime = 0;
  let stepMs = 100; // derived from speed slider
  let acc = 0; // accumulator for delta time
  let gameOver = false;

  bestEl.textContent = String(best);

  function reset() {
    snake = [
      { x: 8, y: 12 },
      { x: 7, y: 12 },
      { x: 6, y: 12 },
    ];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score = 0;
    scoreEl.textContent = String(score);
    food = spawnFood();
    running = false;
    acc = 0;
    lastTime = 0;
    gameOver = false;
    hideOverlay();
    draw();
  }

  function spawnFood() {
    while (true) {
      const x = Math.floor(Math.random() * COLS);
      const y = Math.floor(Math.random() * ROWS);
      if (!snake.some((s) => s.x === x && s.y === y)) return { x, y };
    }
  }

  function tick() {
    // apply nextDir if not reversing
    if (!isOpposite(nextDir, dir)) dir = nextDir;

    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    // collisions: walls
    if (head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS) {
      return endGame();
    }

    // collisions: self
    if (snake.some((s) => s.x === head.x && s.y === head.y)) {
      return endGame();
    }

    snake.unshift(head);

    // eat
    if (head.x === food.x && head.y === food.y) {
      score += 1;
      scoreEl.textContent = String(score);
      if (score > best) {
        best = score;
        localStorage.setItem('snake-best', String(best));
        bestEl.textContent = String(best);
      }
      food = spawnFood();
    } else {
      snake.pop();
    }
  }

  function endGame() {
    running = false;
    gameOver = true;
    showOverlay('Game Over', 'Press R to restart');
  }

  function isOpposite(a, b) {
    return a.x === -b.x && a.y === -b.y;
  }

  function loop(ts) {
    if (!running) return; // paused or stopped
    if (!lastTime) lastTime = ts;
    const dt = ts - lastTime;
    lastTime = ts;
    acc += dt;

    while (acc >= stepMs) {
      acc -= stepMs;
      tick();
      if (!running) break; // ended during tick
    }
    draw();
    if (running) requestAnimationFrame(loop);
  }

  function draw() {
    // clear
    ctx.fillStyle = '#071024';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // grid background
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#0a1936');
    grad.addColorStop(1, '#0a102a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // subtle grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(Math.floor(x * CELL) + 0.5, 0);
      ctx.lineTo(Math.floor(x * CELL) + 0.5, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, Math.floor(y * CELL) + 0.5);
      ctx.lineTo(canvas.width, Math.floor(y * CELL) + 0.5);
      ctx.stroke();
    }

    // draw food
    drawCell(food.x, food.y, '#6cf0a5', '#2a8159');

    // draw snake
    for (let i = 0; i < snake.length; i++) {
      const s = snake[i];
      const isHead = i === 0;
      const color = isHead ? '#6cb7f0' : '#a9c9ff';
      const edge = isHead ? '#2a4f81' : '#3b4a7a';
      drawCell(s.x, s.y, color, edge, isHead);
    }
  }

  function drawCell(x, y, fill, edge, isHead = false) {
    const px = x * CELL;
    const py = y * CELL;
    const r = Math.max(3, CELL * 0.2);
    const w = CELL - 1;
    const h = CELL - 1;

    // cell base
    ctx.fillStyle = fill;
    roundRect(ctx, px + 1, py + 1, w - 1, h - 1, r);
    ctx.fill();

    // outline
    ctx.strokeStyle = edge;
    ctx.lineWidth = 1;
    roundRect(ctx, px + 0.5, py + 0.5, w, h, r);
    ctx.stroke();

    // head eye for fun
    if (isHead) {
      ctx.fillStyle = '#0b1020';
      const eyeOffsetX = dir.x !== 0 ? (dir.x > 0 ? 5 : -5) : 0;
      const eyeOffsetY = dir.y !== 0 ? (dir.y > 0 ? 5 : -5) : 0;
      ctx.beginPath();
      ctx.arc(px + CELL / 2 + eyeOffsetX, py + CELL / 2 + eyeOffsetY, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function roundRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  // Input handling
  function setDir(x, y) {
    const proposed = { x, y };
    if (!isOpposite(proposed, dir)) {
      nextDir = proposed;
    }
  }

  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (['arrowup', 'w'].includes(k)) { setDir(0, -1); e.preventDefault(); }
    else if (['arrowdown', 's'].includes(k)) { setDir(0, 1); e.preventDefault(); }
    else if (['arrowleft', 'a'].includes(k)) { setDir(-1, 0); e.preventDefault(); }
    else if (['arrowright', 'd'].includes(k)) { setDir(1, 0); e.preventDefault(); }
    else if (k === ' ') { togglePause(); e.preventDefault(); }
    else if (k === 'r') { restart(); e.preventDefault(); }
  });

  // Buttons
  btnStart.addEventListener('click', togglePause);
  btnReset.addEventListener('click', restart);
  btnResume.addEventListener('click', () => { if (!gameOver) togglePause(true); });
  btnRestart.addEventListener('click', restart);

  // Speed control
  function updateSpeed() {
    const val = Number(speedSlider.value); // 5..20
    // map to ms per step: faster when higher slider
    // 5 -> 160ms, 20 -> 60ms
    stepMs = Math.round(220 - val * 8);
    speedDisplay.textContent = String(val);
  }
  speedSlider.addEventListener('input', updateSpeed);
  updateSpeed();

  function togglePause(forceRun) {
    if (gameOver) return;
    running = forceRun ?? !running;
    if (running) {
      hideOverlay();
      lastTime = 0; // reset to avoid big dt after pause
      requestAnimationFrame(loop);
    } else {
      showOverlay('Paused', 'Press Space to resume');
    }
  }

  function restart() {
    reset();
    showOverlay('Ready', 'Press Space to start');
  }

  function showOverlay(title, sub) {
    overlayTitle.textContent = title;
    overlaySub.textContent = sub || '';
    overlay.hidden = false;
  }
  function hideOverlay() { overlay.hidden = true; }

  // Initialize
  reset();
  showOverlay('Ready', 'Press Space to start');
})();
