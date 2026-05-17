/* =============================================================================
   MERIDIAN POOLS — gallery-filter.js
   Handles:
   - Category filter tabs (All / Custom / Renovation / Luxury)
   - Mobile carousel prev/next
   - Lightbox open/close
   Loads on: index.html + gallery.html
============================================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ===========================================================================
     FILTER TABS
  =========================================================================== */

  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  if (filterBtns.length && projectCards.length) {

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {

        // Update active state
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;

        projectCards.forEach(card => {
          const category = card.dataset.category;
          const show = filter === 'all' || category === filter;

          if (show) {
            card.classList.remove('hidden');
            // Stagger fade-in
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, 50);
          } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(8px)';
            setTimeout(() => card.classList.add('hidden'), 350);
          }
        });

        // Reset mobile carousel position on filter change
        const grid = document.getElementById('projectsGrid');
        if (grid) grid.style.transform = 'translateX(0)';
        mobileIndex = 0;
        updateProjectBtns();
      });
    });
  }


  /* ===========================================================================
     MOBILE CAROUSEL
  =========================================================================== */

  const grid      = document.getElementById('projectsGrid');
  const prevBtn   = document.getElementById('projectsPrev');
  const nextBtn   = document.getElementById('projectsNext');
  let mobileIndex = 0;

  const getVisibleCards = () =>
    [...projectCards].filter(c => !c.classList.contains('hidden'));

  const getMobileCardWidth = () => {
    const card = getVisibleCards()[0];
    if (!card) return 0;
    const gap = parseInt(getComputedStyle(grid).gap) || 0;
    return card.offsetWidth + gap;
  };

  const updateProjectBtns = () => {
    if (!prevBtn || !nextBtn) return;
    prevBtn.disabled = mobileIndex === 0;
    nextBtn.disabled = mobileIndex >= getVisibleCards().length - 1;
  };

  const slideTo = (index) => {
    const visible = getVisibleCards();
    mobileIndex = Math.max(0, Math.min(index, visible.length - 1));
    if (grid) grid.style.transform = `translateX(-${mobileIndex * getMobileCardWidth()}px)`;
    updateProjectBtns();
  };

  if (prevBtn) prevBtn.addEventListener('click', () => slideTo(mobileIndex - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => slideTo(mobileIndex + 1));

  window.addEventListener('resize', () => slideTo(0));
  updateProjectBtns();


  /* ===========================================================================
     LIGHTBOX
  =========================================================================== */

  const lightbox      = document.getElementById('lightbox');
  const lightboxImg   = document.getElementById('lightboxImg');
  const lightboxCap   = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');

  if (!lightbox) return;

  const openLightbox = (imgSrc, title) => {
    lightboxImg.src = imgSrc;
    lightboxImg.alt = title;
    lightboxCap.textContent = title;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    // Clear src after transition so no flash on reopen
    setTimeout(() => { lightboxImg.src = ''; }, 300);
  };

  // Open on card click
  projectCards.forEach(card => {
    card.addEventListener('click', () => {
      const imgSrc = card.dataset.img;
      const title  = card.dataset.title;
      if (imgSrc) openLightbox(imgSrc, title);
    });
  });

  // Close on X button
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);

  // Close on backdrop click (outside image)
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

});



/* =============================================================================
   MERIDIAN POOLS — gallery-filter.js
   Gallery page filter tabs + lightbox.
   Also used by homepage projects section lightbox.
   Loads on: gallery.html + index.html
============================================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Gallery page filter tabs ────────────────────────────────────────────── */
  const galTabs  = document.querySelectorAll('.gal-tab');
  const galItems = document.querySelectorAll('.gal-item');

  if (galTabs.length) {
    galTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const filter = tab.dataset.filter;

        galTabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        galItems.forEach(item => {
          const cat = item.dataset.category;
          if (filter === 'all' || cat === filter) {
            item.classList.remove('hidden');
          } else {
            item.classList.add('hidden');
          }
        });
      });
    });
  }

  /* ── Gallery lightbox ────────────────────────────────────────────────────── */
  const galLightbox      = document.getElementById('galLightbox');
  const galLightboxImg   = document.getElementById('galLightboxImg');
  const galLightboxCap   = document.getElementById('galLightboxCaption');
  const galLightboxClose = document.getElementById('galLightboxClose');

  if (galLightbox && galItems.length) {
    galItems.forEach(item => {
      item.addEventListener('click', () => {
        const img      = item.querySelector('img');
        const title    = item.dataset.title    || '';
        const location = item.dataset.location || '';

        if (!img) return;

        galLightboxImg.src     = img.src;
        galLightboxImg.alt     = img.alt;
        galLightboxCap.textContent = location ? `${title} — ${location}` : title;

        galLightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });

    const closeGalLightbox = () => {
      galLightbox.classList.remove('open');
      document.body.style.overflow = '';
    };

    if (galLightboxClose) {
      galLightboxClose.addEventListener('click', closeGalLightbox);
    }

    galLightbox.addEventListener('click', (e) => {
      if (e.target === galLightbox) closeGalLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && galLightbox.classList.contains('open')) {
        closeGalLightbox();
      }
    });
  }

  /* ── Homepage projects lightbox (index.html) ─────────────────────────────── */
  const homeLightbox      = document.getElementById('lightbox');
  const homeLightboxImg   = document.getElementById('lightboxImg');
  const homeLightboxClose = document.querySelector('.lightbox-close');

  if (homeLightbox) {
    document.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('click', () => {
        const img  = card.querySelector('img');
        const h4   = card.querySelector('h4');
        const p    = card.querySelector('p');

        if (!img || !homeLightboxImg) return;

        homeLightboxImg.src = img.src;
        homeLightboxImg.alt = img.alt;

        const cap = document.querySelector('.lightbox-caption');
        if (cap) {
          cap.textContent = h4 && p
            ? `${h4.textContent} — ${p.textContent}`
            : img.alt;
        }

        homeLightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });

    const closeHomeLightbox = () => {
      homeLightbox.classList.remove('open');
      document.body.style.overflow = '';
    };

    if (homeLightboxClose) {
      homeLightboxClose.addEventListener('click', closeHomeLightbox);
    }

    homeLightbox.addEventListener('click', (e) => {
      if (e.target === homeLightbox) closeHomeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && homeLightbox.classList.contains('open')) {
        closeHomeLightbox();
      }
    });
  }

});