/* =============================================================================
   MERIDIAN POOLS — gallery-filter.js
   Handles:
   - Category filter tabs (All / Custom / Renovation / Luxury)
   - Mobile carousel prev/next
   - Homepage lightbox (uses data-img attribute)
   - Gallery page filter tabs + lightbox
   Loads on: index.html + gallery.html
============================================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ===========================================================================
     FILTER TABS — Homepage projects section
  =========================================================================== */

  const filterBtns   = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  if (filterBtns.length && projectCards.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;

        projectCards.forEach(card => {
          const category = card.dataset.category;
          const show = filter === 'all' || category === filter;

          if (show) {
            card.classList.remove('hidden');
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
     LIGHTBOX — Homepage (uses data-img for correct full-size path)
  =========================================================================== */

  const lightbox      = document.getElementById('lightbox');
  const lightboxImg   = document.getElementById('lightboxImg');
  const lightboxCap   = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');

  if (lightbox) {
    const openLightbox = (imgSrc, title) => {
      lightboxImg.src = imgSrc;
      lightboxImg.alt = title;
      if (lightboxCap) lightboxCap.textContent = title;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
      setTimeout(() => { lightboxImg.src = ''; }, 300);
    };

    // Use data-img attribute — set on each project card in HTML
    projectCards.forEach(card => {
      card.addEventListener('click', () => {
        const imgSrc = card.dataset.img;
        const title  = card.dataset.title || '';
        if (imgSrc) openLightbox(imgSrc, title);
      });
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
    });
  }


  /* ===========================================================================
     GALLERY PAGE — Filter tabs + lightbox
  =========================================================================== */

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

        galLightboxImg.src         = img.src;
        galLightboxImg.alt         = img.alt;
        galLightboxCap.textContent = location ? `${title} — ${location}` : title;

        galLightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });

    const closeGalLightbox = () => {
      galLightbox.classList.remove('open');
      document.body.style.overflow = '';
    };

    if (galLightboxClose) galLightboxClose.addEventListener('click', closeGalLightbox);

    galLightbox.addEventListener('click', (e) => {
      if (e.target === galLightbox) closeGalLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && galLightbox.classList.contains('open')) closeGalLightbox();
    });
  }

});