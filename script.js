/**
 * WEARSHIVER — Bouncing Logo Coming Soon
 * script.js
 *
 * Handles:
 *  - DVD-style bouncing animation for the logo
 *  - Color shift on each wall collision
 *  - Resize handling so the logo stays inside the viewport
 *  - Mock email form submission
 */

(function bounce() {
  const el = document.getElementById('bouncer');

  // Speed in pixels per frame (kept gentle, per the brief)
  const SPEED = 1.6;

  // Color classes cycled through on impact
  const COLOR_CLASSES = [
    'bouncer--c0', // off-white
    'bouncer--c1', // dark red
    'bouncer--c2', // ice grey-blue
    'bouncer--c3', // dusty pink
    'bouncer--c4', // muted acid green
  ];
  let colorIndex = 0;

  // Position + velocity
  let x = 40;
  let y = 60;
  let vx = SPEED;
  let vy = SPEED;

  let boxW = el.offsetWidth;
  let boxH = el.offsetHeight;
  let viewW = window.innerWidth;
  let viewH = window.innerHeight;

  function measure() {
    boxW = el.offsetWidth;
    boxH = el.offsetHeight;
    viewW = window.innerWidth;
    viewH = window.innerHeight;

    // Clamp current position so the logo never sits outside
    // the viewport after a resize.
    x = Math.min(Math.max(x, 0), Math.max(viewW - boxW, 0));
    y = Math.min(Math.max(y, 0), Math.max(viewH - boxH, 0));
  }

  function setColor() {
    COLOR_CLASSES.forEach(function (cls) {
      el.classList.remove(cls);
    });
    el.classList.add(COLOR_CLASSES[colorIndex]);
    colorIndex = (colorIndex + 1) % COLOR_CLASSES.length;
  }

  function triggerHitEffect() {
    setColor();
    el.classList.remove('is-hit');
    // restart animation
    void el.offsetWidth;
    el.classList.add('is-hit');
  }

  function step() {
    x += vx;
    y += vy;

    let hit = false;

    if (x <= 0) {
      x = 0;
      vx = Math.abs(vx);
      hit = true;
    } else if (x + boxW >= viewW) {
      x = viewW - boxW;
      vx = -Math.abs(vx);
      hit = true;
    }

    if (y <= 0) {
      y = 0;
      vy = Math.abs(vy);
      hit = true;
    } else if (y + boxH >= viewH) {
      y = viewH - boxH;
      vy = -Math.abs(vy);
      hit = true;
    }

    if (hit) triggerHitEffect();

    el.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';

    requestAnimationFrame(step);
  }

  // Initial color
  setColor();

  // Wait one frame so layout is settled before measuring
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