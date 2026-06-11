/**
 * WEARSHIVER — Coming Soon
 * script.js
 *
 * Handles:
 *  - Email form submission (mock — no backend)
 *  - Staggered entrance animation for key elements
 */

/* --------------------------------------------------------------------------
   Email form — mock submission
   -------------------------------------------------------------------------- */
(function initNotifyForm() {
  const btn     = document.getElementById('notify-btn');
  const input   = document.getElementById('email');
  const form    = document.getElementById('notify-form');
  const success = document.getElementById('notify-success');
  const hint    = document.querySelector('.notify__hint');

  if (!btn || !input || !form || !success) return;

  btn.addEventListener('click', handleSubmit);

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') handleSubmit();
  });

  function handleSubmit() {
    const email = input.value.trim();

    /* Basic email validation */
    if (!isValidEmail(email)) {
      shakeInput();
      return;
    }

    /* Mock success — replace form row with confirmation */
    form.style.opacity    = '0';
    form.style.transition = 'opacity 0.35s ease';

    setTimeout(function () {
      form.style.display   = 'none';
      hint.style.display   = 'none';
      success.classList.add('is-visible');
    }, 380);
  }

  function isValidEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  /* Subtle horizontal shake for invalid input */
  function shakeInput() {
    const row = document.querySelector('.notify__row');
    if (!row) return;

    row.style.transition = 'transform 0.06s ease, border-color 0.2s ease';
    row.style.borderColor = '#8b1a1a';

    let count = 0;
    const dir = [4, -4, 3, -3, 2, -2, 1, 0];

    const interval = setInterval(function () {
      row.style.transform = `translateX(${dir[count]}px)`;
      count++;
      if (count >= dir.length) {
        clearInterval(interval);
        row.style.transform   = 'translateX(0)';
        row.style.borderColor = '';
      }
    }, 55);
  }
})();


/* --------------------------------------------------------------------------
   Staggered entrance — delay each block progressively
   -------------------------------------------------------------------------- */
(function staggerEntrance() {
  const targets = document.querySelectorAll(
    '.meta--top, .brand, .divider, .headline, .subtext--primary, .subtext--secondary, .notify, .meta--bottom'
  );

  targets.forEach(function (el, i) {
    el.style.opacity         = '0';
    el.style.transform       = 'translateY(12px)';
    el.style.transition      = 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)';
    el.style.transitionDelay = (i * 0.085 + 0.1) + 's';

    /* Trigger after a minimal paint delay */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.style.opacity   = '1';
        el.style.transform = 'translateY(0)';
      });
    });
  });
})();