/**
 * WEARSHIVER — Floating DVD-style logo
 * script.js
 */

(function bounce() {
  const el    = document.getElementById('bouncer');
  const timer = document.getElementById('corner-timer');
  if (!el) return;

  const isSmallScreen = window.matchMedia('(max-width: 640px)');
  const SPEED = isSmallScreen.matches ? 96 : 112; // px per second

  const COLOR_CLASSES = [
    'bouncer--c0',
    'bouncer--c1',
    'bouncer--c2',
    'bouncer--c3',
    'bouncer--c4',
    'bouncer--c5',
  ];
  let colorIndex = 0;

  let x = Math.round(window.innerWidth * 0.18);
  let y = Math.round(window.innerHeight * 0.18);
  let vx = SPEED;
  let vy = SPEED;
  let elapsed = 0;
  let lastTime = 0;
  let lastTimerUpdate = 0;
  let resizeFrame = 0;
  let hitTimer = 0;

  let boxW, boxH, areaW, areaH;

  function measure() {
    boxW  = el.offsetWidth;
    boxH  = el.offsetHeight;
    areaW = window.innerWidth;
    areaH = window.innerHeight;

    x = Math.min(Math.max(x, 0), Math.max(areaW - boxW, 0));
    y = Math.min(Math.max(y, 0), Math.max(areaH - boxH, 0));
  }

  function setColor() {
    COLOR_CLASSES.forEach(function (cls) { el.classList.remove(cls); });
    el.classList.add(COLOR_CLASSES[colorIndex]);
    colorIndex = (colorIndex + 1) % COLOR_CLASSES.length;
  }

  function triggerHit() {
    setColor();
    el.classList.remove('is-hit');
    if (hitTimer) window.clearTimeout(hitTimer);
    requestAnimationFrame(function () {
      el.classList.add('is-hit');
      hitTimer = window.setTimeout(function () {
        el.classList.remove('is-hit');
      }, 220);
    });
  }

  function updateTimer(force) {
    if (!timer) return;
    if (!force && elapsed - lastTimerUpdate < 0.04) return;
    lastTimerUpdate = elapsed;
    timer.textContent = 'TIME: ' + elapsed.toFixed(2).padStart(5, '0');
  }

  function step(time) {
    if (!lastTime) lastTime = time;
    const dt = Math.min((time - lastTime) / 1000, 0.05);
    elapsed += dt;
    lastTime = time;
    updateTimer();

    x += vx * dt;
    y += vy * dt;

    let hit = false;
    let hitX = false;
    let hitY = false;

    if (x <= 0) {
      x = 0;
      vx = Math.abs(vx);
      hit = true;
      hitX = true;
    } else if (x + boxW >= areaW) {
      x = areaW - boxW;
      vx = -Math.abs(vx);
      hit = true;
      hitX = true;
    }

    if (y <= 0) {
      y = 0;
      vy = Math.abs(vy);
      hit = true;
      hitY = true;
    } else if (y + boxH >= areaH) {
      y = areaH - boxH;
      vy = -Math.abs(vy);
      hit = true;
      hitY = true;
    }

    if (hit) {
      triggerHit();
      if (hitX && hitY) {
        elapsed = 0;
        updateTimer(true);
      }
    }

    el.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
    requestAnimationFrame(step);
  }

  setColor();
  updateTimer(true);

  requestAnimationFrame(function () {
    measure();
    el.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
    requestAnimationFrame(step);
  });

  window.addEventListener('resize', function () {
    if (resizeFrame) return;
    resizeFrame = requestAnimationFrame(function () {
      resizeFrame = 0;
      measure();
    });
  });
})();


/* --------------------------------------------------------------------------
   Notify form
   -------------------------------------------------------------------------- */
(function initStampForm() {
  const btn     = document.getElementById('stamp-btn');
  const input   = document.getElementById('email');
  const form    = document.getElementById('stamp-form');
  const success = document.getElementById('stamp-success');
  const SUBSCRIBE_PATH = '/api/subscribe';

  if (!btn || !input || !form || !success) return;

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    submitEmail('comingsoon');
  });

  btn.addEventListener('click', function (event) {
    event.preventDefault();
    submitEmail('comingsoon');
  });

  async function submitEmail(source) {
    const rawEmail = input.value.trim();
    const email = rawEmail.toLowerCase();

    if (!isValidEmail(email)) {
      showError('Invalid email.');
      shake();
      return;
    }

    const payload = { email, source };
    const fetchUrl = getFetchUrl();

    console.log('[subscribe frontend] Fetch URL:', fetchUrl);
    console.log('[subscribe frontend] Payload:', payload);

    if (window.location.protocol === 'file:') {
      console.error('[subscribe frontend] This page is running from file://. Start the Express server with npm start and open http://localhost:3000 instead.');
      showError('Something went wrong. Try again.');
      return;
    }

    try {
      const response = await fetch(fetchUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('[subscribe frontend] Backend response:', {
        status: response.status,
        ok: response.ok,
        data: data,
      });

      if (response.ok && data.success) {
        success.textContent = data.message;
        success.classList.add('is-visible');
        form.style.opacity = '0';
        setTimeout(function () {
          form.style.display = 'none';
        }, 300);
        return;
      }

      showError(data.message || 'Something went wrong. Try again.');
    } catch (err) {
      showError('Something went wrong. Try again.');
      console.error('[subscribe frontend] Subscribe request failed:', err);
    }
  }

  function getFetchUrl() {
    try {
      return new URL(SUBSCRIBE_PATH, window.location.origin).href;
    } catch (err) {
      return SUBSCRIBE_PATH;
    }
  }

  function isValidEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  function showError(message) {
    success.textContent = message;
    success.classList.add('is-visible');
    success.style.color = '#8b1a1a';
  }

  function shake() {
    const row = document.querySelector('.stamp__row');
    if (!row) return;

    row.style.transition = 'transform 0.05s ease, border-color 0.2s ease';
    row.style.borderColor = '#8b1a1a';

    let count = 0;
    const dir = [4, -4, 3, -3, 2, -2, 1, 0];

    const interval = setInterval(function () {
      row.style.transform = 'translateX(' + dir[count] + 'px)';
      count++;
      if (count >= dir.length) {
        clearInterval(interval);
        row.style.transform = 'translateX(0)';
        row.style.borderColor = '';
      }
    }, 50);
  }
})();
