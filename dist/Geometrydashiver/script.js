(function initShiverDash() {
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const timeReadout = document.getElementById('time-readout');
  const rebootCopy = document.getElementById('reboot-copy');
  const form = document.getElementById('stamp-form');
  const email = document.getElementById('email');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const logoImage = new Image();
  let logoReady = false;

  logoImage.onload = function () {
    logoReady = true;
  };
  logoImage.src = 'logo-mask.png';

  const state = {
    width: 0,
    height: 0,
    dpr: 1,
    groundY: 0,
    speed: 0,
    time: 0,
    lastTime: 0,
    nextPatternX: 0,
    shake: 0,
    jumpFlash: 0,
    jumpBuffer: 0,
    hitFlash: 0,
    isRebooting: false,
    items: [],
    particles: [],
    trails: [],
  };

  const player = {
    x: 0,
    y: 0,
    previousY: 0,
    size: 54,
    vy: 0,
    rotation: 0,
    grounded: true,
    glow: 0.45,
  };

  const patterns = [
    singleSpike,
    doubleSpike,
    lowBlock,
    platformStep,
    platformGap,
    blockSpikeCombo,
    staggeredBlocks,
  ];

  function resize() {
    state.dpr = Math.min(window.devicePixelRatio || 1, 2);
    state.width = window.innerWidth;
    state.height = window.innerHeight;
    canvas.width = Math.floor(state.width * state.dpr);
    canvas.height = Math.floor(state.height * state.dpr);
    canvas.style.width = state.width + 'px';
    canvas.style.height = state.height + 'px';
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);

    player.size = clamp(state.width * 0.044, 44, 68);
    player.x = clamp(state.width * 0.17, 70, 188);
    state.groundY = Math.round(state.height * 0.73);
    state.speed = reducedMotion.matches ? 1.15 : clamp(state.width * 0.0045, 4.6, 7.8);

    if (player.grounded || player.y > state.groundY - player.size) {
      player.y = state.groundY - player.size;
      player.previousY = player.y;
      player.vy = 0;
      player.grounded = true;
    }

    resetPatterns();
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function resetPatterns() {
    state.items = [];
    state.nextPatternX = state.width + 220;
    while (state.nextPatternX < state.width + 2300) addPattern();
  }

  function addPattern() {
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    const startX = state.nextPatternX;
    const width = pattern(startX);
    state.nextPatternX = startX + width + rand(180, 330);
  }

  function addSpike(x, y, size) {
    state.items.push({
      type: 'spike',
      x,
      y,
      w: size,
      h: size,
      react: 0.18,
    });
  }

  function addSolid(x, y, w, h, kind) {
    state.items.push({
      type: kind || 'block',
      x,
      y,
      w,
      h,
      react: 0.16,
    });
  }

  function singleSpike(x) {
    const s = clamp(state.width * 0.032, 30, 48);
    addSpike(x, state.groundY, s);
    return s;
  }

  function doubleSpike(x) {
    const s = clamp(state.width * 0.03, 28, 44);
    addSpike(x, state.groundY, s);
    addSpike(x + s * 0.92, state.groundY, s);
    return s * 1.9;
  }

  function lowBlock(x) {
    const h = clamp(state.height * 0.055, 34, 54);
    addSolid(x, state.groundY - h, player.size * 1.15, h, 'block');
    return player.size * 1.15;
  }

  function platformStep(x) {
    const w = player.size * 2.1;
    const h = 16;
    const y = state.groundY - player.size * 1.65;
    addSolid(x, y, w, h, 'platform');
    addSpike(x + w + 42, state.groundY, player.size * 0.78);
    return w + player.size * 1.15;
  }

  function platformGap(x) {
    const w = player.size * 1.45;
    const y = state.groundY - player.size * 1.25;
    addSolid(x, y, w, 14, 'platform');
    addSolid(x + w + player.size * 1.5, y - player.size * 0.35, w * 1.15, 14, 'platform');
    addSpike(x + w + player.size * 0.62, state.groundY, player.size * 0.72);
    return w * 2.15 + player.size * 1.5;
  }

  function blockSpikeCombo(x) {
    const blockW = player.size * 1.05;
    const blockH = player.size * 0.85;
    addSolid(x, state.groundY - blockH, blockW, blockH, 'block');
    addSpike(x + blockW + 26, state.groundY, player.size * 0.8);
    addSpike(x + blockW + 26 + player.size * 0.76, state.groundY, player.size * 0.8);
    return blockW + player.size * 1.75;
  }

  function staggeredBlocks(x) {
    const w = player.size * 1.1;
    const h1 = player.size * 0.7;
    const h2 = player.size * 1.15;
    addSolid(x, state.groundY - h1, w, h1, 'block');
    addSolid(x + w + 58, state.groundY - h2, w, h2, 'block');
    addSpike(x + w * 2 + 96, state.groundY, player.size * 0.74);
    return w * 2 + 150;
  }

  function jump() {
    if (state.isRebooting || !player.grounded) return;

    player.vy = -clamp(state.height * 0.027, 16, 22);
    player.grounded = false;
    state.jumpBuffer = 0;
    player.glow = 1;
    state.jumpFlash = 1;
    state.shake = Math.max(state.shake, 2.4);
    document.body.classList.add('is-jumping');
    window.setTimeout(function () {
      document.body.classList.remove('is-jumping');
    }, 180);

    burst(player.x + player.size * 0.42, player.y + player.size, 20, 'jump');
    pulseTrail();

    state.items.forEach(function (item) {
      item.react = Math.max(item.react, 0.78);
    });
  }

  function requestJump() {
    if (state.isRebooting) return;

    state.jumpBuffer = 9;
    jump();
  }

  function burst(x, y, count, mode) {
    for (let i = 0; i < count; i++) {
      state.particles.push({
        x,
        y,
        vx: rand(-2.7, 2.3),
        vy: rand(mode === 'land' ? -2.8 : -4.4, -0.5),
        life: 1,
        size: rand(1.1, mode === 'hit' ? 4.6 : 2.9),
        color: mode === 'hit' && i % 2 ? '#8b1a1a' : '#d9f0f7',
      });
    }
  }

  function pulseTrail() {
    state.trails.push({
      x: player.x + player.size / 2,
      y: player.y + player.size / 2,
      r: player.size * 0.65,
      life: 1,
    });
  }

  function triggerHit() {
    if (state.isRebooting) return;

    state.isRebooting = true;
    state.hitFlash = 1;
    state.shake = 8;
    burst(player.x + player.size * 0.5, player.y + player.size * 0.5, 34, 'hit');
    document.body.classList.add('is-hit');
    rebootCopy.classList.add('is-visible');

    window.setTimeout(resetRun, 680);
  }

  function resetRun() {
    state.time = 0;
    state.hitFlash = 0;
    state.shake = 0;
    state.isRebooting = false;
    player.y = state.groundY - player.size;
    player.previousY = player.y;
    player.vy = 0;
    player.rotation = 0;
    player.grounded = true;
    player.glow = 0.5;
    state.particles = [];
    state.trails = [];
    resetPatterns();
    updateTimer();
    document.body.classList.remove('is-hit');
    rebootCopy.classList.remove('is-visible');
  }

  function update(dt) {
    const slow = reducedMotion.matches ? 0.3 : 1;
    const frameSpeed = state.speed * slow * dt;

    if (!state.isRebooting) state.time += (dt / 60) * slow;
    updateTimer();

    moveWorld(frameSpeed);
    movePlayer(dt);
    resolveCollisions();

    player.glow = Math.max(0.45, player.glow - 0.04 * dt);
    state.jumpFlash = Math.max(0, state.jumpFlash - 0.055 * dt);
    state.jumpBuffer = Math.max(0, state.jumpBuffer - dt);
    state.hitFlash = Math.max(0, state.hitFlash - 0.055 * dt);
    state.shake = Math.max(0, state.shake - 0.5 * dt);

    updateParticles(dt);
    updateTrails(dt);
  }

  function updateTimer() {
    if (!timeReadout) return;
    timeReadout.textContent = 'TIME: ' + state.time.toFixed(2).padStart(5, '0');
  }

  function moveWorld(frameSpeed) {
    state.items.forEach(function (item) {
      item.x -= frameSpeed;
      item.react = Math.max(0.14, item.react - 0.025);
    });

    state.items = state.items.filter(function (item) {
      return item.x + item.w > -120;
    });

    state.nextPatternX -= frameSpeed;
    while (state.nextPatternX < state.width + 2200) addPattern();
  }

  function movePlayer(dt) {
    if (state.isRebooting) return;

    player.previousY = player.y;
    player.vy += clamp(state.height * 0.00148, 0.76, 1.12) * dt;
    player.y += player.vy * dt;
    player.rotation += player.grounded ? 0 : 0.1 * dt;
    player.grounded = false;
  }

  function resolveCollisions() {
    if (state.isRebooting) return;

    const previousBottom = player.previousY + player.size;
    let landed = false;
    let landingY = state.groundY - player.size;

    if (player.y + player.size >= state.groundY) {
      landed = true;
      landingY = state.groundY - player.size;
    }

    const rect = playerRect();

    state.items.forEach(function (item) {
      if (item.type === 'spike') {
        if (intersects(rect, spikeHitRect(item))) triggerHit();
        return;
      }

      const top = item.y;
      const fromAbove = previousBottom <= top + 8 && player.vy >= 0;
      const horizontal = rect.x < item.x + item.w && rect.x + rect.w > item.x;
      const vertical = rect.y < item.y + item.h && rect.y + rect.h > item.y;

      if (fromAbove && horizontal && player.y + player.size >= top) {
        landed = true;
        landingY = Math.min(landingY, top - player.size);
        return;
      }

      if (vertical && horizontal) triggerHit();
    });

    if (landed) {
      const wasAirborne = !player.grounded && player.vy > 2;
      player.y = landingY;
      player.vy = 0;
      player.grounded = true;
      player.rotation = Math.round(player.rotation / (Math.PI / 2)) * (Math.PI / 2);
      if (wasAirborne) burst(player.x + player.size * 0.45, player.y + player.size, 10, 'land');
      if (state.jumpBuffer > 0) jump();
    }
  }

  function playerRect() {
    return {
      x: player.x + player.size * 0.12,
      y: player.y + player.size * 0.1,
      w: player.size * 0.76,
      h: player.size * 0.78,
    };
  }

  function spikeHitRect(item) {
    return {
      x: item.x + item.w * 0.22,
      y: item.y - item.h * 0.86,
      w: item.w * 0.56,
      h: item.h * 0.86,
    };
  }

  function intersects(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function updateParticles(dt) {
    state.particles = state.particles.filter(function (p) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 0.13 * dt;
      p.life -= 0.024 * dt;
      return p.life > 0;
    });
  }

  function updateTrails(dt) {
    state.trails = state.trails.filter(function (trail) {
      trail.r += 1.9 * dt;
      trail.life -= 0.035 * dt;
      return trail.life > 0;
    });
  }

  function render() {
    const sx = state.shake ? rand(-state.shake, state.shake) : 0;
    const sy = state.shake ? rand(-state.shake, state.shake) : 0;

    ctx.save();
    ctx.translate(sx, sy);
    ctx.clearRect(-20 - sx, -20 - sy, state.width + 40, state.height + 40);

    drawBackgroundGrid();
    drawGround();
    drawItems();
    drawTrails();
    drawPlayer();
    drawParticles();
    drawFlashes();

    ctx.restore();
  }

  function drawBackgroundGrid() {
    ctx.save();
    ctx.globalAlpha = 0.32;
    ctx.strokeStyle = 'rgba(185, 221, 237, 0.06)';
    ctx.lineWidth = 1;

    const spacing = 56;
    const offset = -(state.time * state.speed * 60) % spacing;
    for (let x = offset; x < state.width + spacing; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x - state.width * 0.08, state.height);
      ctx.stroke();
    }

    for (let y = state.height * 0.2; y < state.height; y += 48) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(state.width, y);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawGround() {
    const pulse = 0.38 + state.jumpFlash * 0.62;

    ctx.save();
    ctx.strokeStyle = 'rgba(217, 240, 247, ' + (0.34 + pulse * 0.26) + ')';
    ctx.lineWidth = 1.5 + state.jumpFlash * 1.4;
    ctx.shadowColor = '#b9dded';
    ctx.shadowBlur = 16 + state.jumpFlash * 32;
    ctx.beginPath();
    ctx.moveTo(0, state.groundY + 0.5);
    ctx.lineTo(state.width, state.groundY + 0.5);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    const dash = 30;
    const offset = -(state.time * state.speed * 115) % dash;
    for (let x = offset; x < state.width + dash; x += dash) {
      const active = Math.floor((x - offset) / dash) % 4 === 0;
      ctx.fillStyle = active ? 'rgba(185, 221, 237, 0.34)' : 'rgba(240, 237, 232, 0.12)';
      ctx.shadowColor = '#b9dded';
      ctx.shadowBlur = active ? 10 : 2;
      ctx.fillRect(x, state.groundY + 13, 14, 1);
      ctx.fillRect(x + 9, state.groundY + 27, 30, 1);
    }
    ctx.restore();
  }

  function drawItems() {
    state.items.forEach(function (item) {
      if (item.type === 'spike') drawSpike(item);
      else drawSolid(item);
    });
  }

  function drawSpike(item) {
    ctx.save();
    ctx.shadowColor = item.react > 0.5 ? '#d9f0f7' : '#8b1a1a';
    ctx.shadowBlur = 14 + item.react * 24;
    ctx.strokeStyle = 'rgba(217, 240, 247, ' + (0.5 + item.react * 0.38) + ')';
    ctx.fillStyle = 'rgba(139, 26, 26, 0.68)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(item.x, item.y);
    ctx.lineTo(item.x + item.w * 0.5, item.y - item.h);
    ctx.lineTo(item.x + item.w, item.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawSolid(item) {
    ctx.save();
    const isPlatform = item.type === 'platform';
    const cols = Math.max(1, Math.round(item.w / (player.size * 0.48)));
    const rows = Math.max(1, Math.round(item.h / (player.size * 0.48)));
    const cellW = item.w / cols;
    const cellH = item.h / rows;

    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.72)';
    ctx.lineWidth = 4.2;
    ctx.strokeRect(item.x, item.y, item.w, item.h);

    ctx.shadowColor = '#d9f0f7';
    ctx.shadowBlur = isPlatform ? 24 + item.react * 18 : 20 + item.react * 18;
    ctx.strokeStyle = 'rgba(217, 240, 247, ' + (0.72 + item.react * 0.22) + ')';
    ctx.lineWidth = 1.8;
    ctx.strokeRect(item.x, item.y, item.w, item.h);

    ctx.shadowBlur = 8 + item.react * 10;
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(217, 240, 247, ' + (0.42 + item.react * 0.26) + ')';

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = item.x + col * cellW;
        const y = item.y + row * cellH;

        ctx.save();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.64)';
        ctx.lineWidth = 3.2;
        ctx.strokeRect(x, y, cellW, cellH);
        ctx.beginPath();
        ctx.moveTo(x + 5, y + 5);
        ctx.lineTo(x + cellW - 5, y + cellH - 5);
        ctx.moveTo(x + cellW - 5, y + 5);
        ctx.lineTo(x + 5, y + cellH - 5);
        ctx.stroke();
        ctx.restore();

        ctx.strokeRect(x, y, cellW, cellH);

        ctx.beginPath();
        ctx.moveTo(x + 5, y + 5);
        ctx.lineTo(x + cellW - 5, y + cellH - 5);
        ctx.moveTo(x + cellW - 5, y + 5);
        ctx.lineTo(x + 5, y + cellH - 5);
        ctx.stroke();
      }
    }

    ctx.globalAlpha = 0.24 + item.react * 0.16;
    ctx.strokeStyle = '#f0ede8';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(item.x + 3, item.y + 3, item.w - 6, item.h - 6);
    ctx.restore();
  }

  function drawTrails() {
    state.trails.forEach(function (trail) {
      ctx.save();
      ctx.globalAlpha = trail.life * 0.34;
      ctx.strokeStyle = '#d9f0f7';
      ctx.shadowColor = '#b9dded';
      ctx.shadowBlur = 18;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(trail.x, trail.y, trail.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });
  }

  function drawPlayer() {
    const centerX = player.x + player.size / 2;
    const centerY = player.y + player.size / 2;
    const glow = 0.55 + player.glow * 0.55;
    const visualW = player.size * 1.35;
    const visualH = visualW * (729 / 800);

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(player.rotation);
    ctx.shadowColor = '#d9f0f7';
    ctx.shadowBlur = 20 + glow * 38;

    if (logoReady) {
      ctx.globalAlpha = 0.95;
      ctx.drawImage(logoImage, -visualW / 2, -visualH / 2, visualW, visualH);

      ctx.globalAlpha = 0.22 + player.glow * 0.18;
      ctx.shadowBlur = 34 + glow * 38;
      ctx.drawImage(logoImage, -visualW / 2, -visualH / 2, visualW, visualH);
    } else {
      ctx.fillStyle = '#f7f3ec';
      ctx.fillRect(-player.size / 2, -player.size / 2, player.size, player.size);
    }

    ctx.restore();
  }

  function drawParticles() {
    state.particles.forEach(function (p) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 12;
      ctx.fillRect(p.x, p.y, p.size, p.size);
      ctx.restore();
    });
  }

  function drawFlashes() {
    if (state.hitFlash > 0) {
      ctx.save();
      ctx.globalAlpha = state.hitFlash * 0.18;
      ctx.fillStyle = '#8b1a1a';
      ctx.fillRect(0, 0, state.width, state.height);
      ctx.restore();
    }

    if (state.jumpFlash > 0) {
      ctx.save();
      ctx.globalAlpha = state.jumpFlash * 0.11;
      ctx.fillStyle = '#d9f0f7';
      ctx.fillRect(0, state.groundY - 14, state.width, 30);
      ctx.restore();
    }
  }

  function tick(time) {
    if (!state.lastTime) state.lastTime = time;
    const dt = Math.min((time - state.lastTime) / 16.666, 2.4);
    state.lastTime = time;

    update(dt);
    render();
    requestAnimationFrame(tick);
  }

  function shouldIgnoreJump(target) {
    return Boolean(target.closest('input, button, textarea, select, form, a'));
  }

  window.addEventListener('pointerdown', function (event) {
    if (shouldIgnoreJump(event.target)) return;
    requestJump();
  });

  window.addEventListener('keydown', function (event) {
    if (event.code !== 'Space') return;
    if (shouldIgnoreJump(document.activeElement)) return;
    event.preventDefault();
    requestJump();
  });

  window.addEventListener('resize', resize);
  reducedMotion.addEventListener('change', resize);

  resize();
  updateTimer();
  requestAnimationFrame(tick);

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const value = email.value.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      form.classList.remove('is-complete');
      form.querySelector('.stamp__row').animate(
        [
          { transform: 'translateX(0)' },
          { transform: 'translateX(-5px)' },
          { transform: 'translateX(5px)' },
          { transform: 'translateX(0)' },
        ],
        { duration: 180, iterations: 1 }
      );
      return;
    }

    form.classList.add('is-complete');
  });
})();
