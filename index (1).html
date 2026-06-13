/**
 * WEARSHIVER — Floating DVD-style logo
 * script.js
 */

(function bounce() {
  const el    = document.getElementById('bouncer');
  const timer = document.getElementById('corner-timer');
  if (!el) return;

  const SPEED = 1.8; // px per frame

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
    void el.offsetWidth;
    el.classList.add('is-hit');
  }

  function updateTimer() {
    if (!timer) return;
    timer.textContent = 'TIME: ' + elapsed.toFixed(2).padStart(5, '0');
  }

  function step(time) {
    if (!lastTime) lastTime = time;
    elapsed += (time - lastTime) / 1000;
    lastTime = time;
    updateTimer();

    x += vx;
    y += vy;

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
        updateTimer();
      }
    }

    el.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
    requestAnimationFrame(step);
  }

  setColor();
  updateTimer();

  requestAnimationFrame(function () {
    measure();
    el.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
    requestAnimationFrame(step);
  });

  window.addEventListener('resize', measure);
})();


/* --------------------------------------------------------------------------
   Notify form — mock submission
   -------------------------------------------------------------------------- */
(function initStampForm() {
  const btn     = document.getElementById('stamp-btn');
  const input   = document.getElementById('email');
  const form    = document.getElementById('stamp-form');
  const success = document.getElementById('stamp-success');

  if (!btn || !input || !form || !success) return;

  btn.addEventListener('click', handleSubmit);

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') handleSubmit();
  });

  function handleSubmit() {
    const email = input.value.trim();

    if (!isValidEmail(email)) {
      shake();
      return;
    }

    form.style.transition = 'opacity 0.3s ease';
    form.style.opacity = '0';

    setTimeout(function () {
      form.style.display = 'none';
      success.classList.add('is-visible');
    }, 300);
  }

  function isValidEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
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
