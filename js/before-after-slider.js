/* =============================================================================
   MERIDIAN POOLS — before-after-slider.js
   Interactive drag slider for renovation before/after comparisons.
   Loads on: renovations page only.

   Features:
   - Filter tabs show/hide pairs by renovation category
   - Single result auto-centers in the grid
   - Drag handle works on mouse and touch
   - Starts at 50% (center)
============================================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ── DOM refs ────────────────────────────────────────────────────────────── */
  const tabs   = document.querySelectorAll('.ba-tab');
  const items  = document.querySelectorAll('.ba-item');
  const grid   = document.getElementById('baGrid');

  /* ── Filter tabs ─────────────────────────────────────────────────────────── */
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const filter = tab.dataset.filter;

      // Update active tab
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      // Show/hide items
      items.forEach(item => {
        const cat = item.dataset.category;
        if (filter === 'all' || cat === filter) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });

      // Count visible items — center grid if only one result
      if (grid) {
        const visibleCount = [...items].filter(
          item => !item.classList.contains('hidden')
        ).length;

        if (visibleCount === 1) {
          grid.classList.add('single-result');
        } else {
          grid.classList.remove('single-result');
        }
      }
    });
  });

  /* ── Slider drag logic ───────────────────────────────────────────────────── */
  document.querySelectorAll('[data-slider]').forEach(slider => {
    const after  = slider.querySelector('.ba-after');
    const handle = slider.querySelector('.ba-handle');

    if (!after || !handle) return;

    let isDragging = false;

    // Start at 50%
    setPosition(slider, after, handle, 50);

    /* Mouse events */
    slider.addEventListener('mousedown', (e) => {
      isDragging = true;
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const pct = getPercent(slider, e.clientX);
      setPosition(slider, after, handle, pct);
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    /* Touch events */
    slider.addEventListener('touchstart', () => {
      isDragging = true;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      const pct = getPercent(slider, touch.clientX);
      setPosition(slider, after, handle, pct);
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });
  });

  /* ── Helpers ─────────────────────────────────────────────────────────────── */
  function getPercent(slider, clientX) {
    const rect = slider.getBoundingClientRect();
    const pct  = ((clientX - rect.left) / rect.width) * 100;
    return Math.min(Math.max(pct, 2), 98); // clamp 2–98%
  }

  function setPosition(slider, after, handle, pct) {
    after.style.clipPath  = `inset(0 ${100 - pct}% 0 0)`;
    handle.style.left     = `${pct}%`;
  }

});