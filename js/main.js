/* =============================================================================
   MERIDIAN POOLS — main.js
   MigsFlow Web Design

   Loads on EVERY page.

   TABLE OF CONTENTS
   01. DOM Ready Helper
   02. Navigation — Scroll Shadow
   03. Navigation — Hamburger & Mobile Drawer
   04. Navigation — Services Dropdown (Desktop)
   05. Navigation — Services Dropdown (Mobile Drawer)
   06. Navigation — Close on Outside Click
   07. Navigation — Close on Resize
   08. Scroll Animations — IntersectionObserver
============================================================================= */


/* =============================================================================
   01 — DOM READY HELPER
   Wraps everything so we never query the DOM before it exists.
============================================================================= */

document.addEventListener('DOMContentLoaded', () => {


  /* ===========================================================================
     02 — NAVIGATION — SCROLL SHADOW
     Adds .scrolled to #navbar when the page scrolls past 10px.
     components.css uses .scrolled to apply box-shadow.
  =========================================================================== */

  const navbar = document.getElementById('navbar');

  if (navbar) {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    };

    // Run once on load in case page is already scrolled (e.g. browser back)
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
  }


  /* ===========================================================================
     03 — NAVIGATION — HAMBURGER & MOBILE DRAWER
     Toggles .menu-open on #navbar.
     components.css uses .menu-open to:
       - Slide in the .nav-drawer
       - Animate hamburger bars → X
     Also locks body scroll while drawer is open.
  =========================================================================== */

  const hamburger    = document.querySelector('.nav-hamburger');
  const drawer       = document.querySelector('.nav-drawer');
  const drawerClose  = document.querySelector('.nav-drawer-close');

  if (hamburger && navbar) {

    hamburger.addEventListener('click', () => {
      const isOpen = navbar.classList.toggle('menu-open');

      // Update ARIA for accessibility
      hamburger.setAttribute('aria-expanded', isOpen);
      hamburger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');

      // Lock / unlock body scroll
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close drawer when the X button is clicked
    if (drawerClose) {
      drawerClose.addEventListener('click', closeMobileMenu);
    }

    // Close drawer when a drawer link is clicked (navigation occurs)
    if (drawer) {
      const drawerLinks = drawer.querySelectorAll('a');
      drawerLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
      });
    }
  }

  function closeMobileMenu() {
    if (navbar) {
      navbar.classList.remove('menu-open');
      document.body.style.overflow = '';
      if (hamburger) {
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', 'Open menu');
      }
    }
  }


  /* ===========================================================================
     04 — NAVIGATION — SERVICES DROPDOWN (DESKTOP)
     Toggles .open on the parent <li> of the dropdown.
     components.css uses .open to:
       - Fade + slide down the .nav-dropdown
       - Rotate the .nav-chevron
     Keyboard accessible: Enter/Space opens, Escape closes.
  =========================================================================== */

  const dropdownToggles = document.querySelectorAll('.nav-links .nav-drop-toggle');

  dropdownToggles.forEach(toggle => {
    const parentLi = toggle.closest('li');
    const dropdown = parentLi ? parentLi.querySelector('.nav-dropdown') : null;

    if (!parentLi || !dropdown) return;

    // Click toggle
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = parentLi.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen);
    });

    // Keyboard: Enter or Space
    toggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const isOpen = parentLi.classList.toggle('open');
        toggle.setAttribute('aria-expanded', isOpen);
      }

      // Escape closes
      if (e.key === 'Escape') {
        closeAllDropdowns();
      }
    });

    // Close dropdown when focus leaves the entire nav item
    parentLi.addEventListener('focusout', (e) => {
      // relatedTarget is where focus is going next
      if (!parentLi.contains(e.relatedTarget)) {
        parentLi.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  function closeAllDropdowns() {
    document.querySelectorAll('.nav-links li.open').forEach(li => {
      li.classList.remove('open');
      const toggle = li.querySelector('.nav-drop-toggle');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
  }


  /* ===========================================================================
     05 — NAVIGATION — SERVICES DROPDOWN (MOBILE DRAWER)
     Separate toggle for the accordion-style sub-menu inside the drawer.
     Toggles .open on the .nav-sub list to show/hide sub-links.
  =========================================================================== */

  const drawerDropToggles = document.querySelectorAll('.nav-drawer .nav-drop-toggle');

  drawerDropToggles.forEach(toggle => {
    const parentLi = toggle.closest('li');
    const subMenu  = parentLi ? parentLi.querySelector('.nav-sub') : null;

    if (!parentLi || !subMenu) return;

    toggle.addEventListener('click', () => {
      const isOpen = subMenu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen);

      // Rotate chevron inside drawer toggle
      const chevron = toggle.querySelector('.nav-chevron');
      if (chevron) {
        chevron.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
      }
    });
  });


  /* ===========================================================================
     06 — NAVIGATION — CLOSE ON OUTSIDE CLICK
     Clicks anywhere outside the navbar close all open dropdowns.
  =========================================================================== */

  document.addEventListener('click', (e) => {
    if (navbar && !navbar.contains(e.target)) {
      closeAllDropdowns();
    }
  });


  /* ===========================================================================
     07 — NAVIGATION — CLOSE ON RESIZE
     If user resizes from mobile → desktop, close the mobile drawer cleanly
     so it doesn't stay open or locked.
  =========================================================================== */

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth > 1024) {
        closeMobileMenu();
        closeAllDropdowns();
      }
    }, 150);
  });


  /* ===========================================================================
     08 — SCROLL ANIMATIONS — INTERSECTIONOBSERVER
     Watches all elements with the .reveal class.
     When an element enters the viewport, .is-visible is added.
     animations.css uses .is-visible to trigger the CSS transition.

     threshold: 0.15 — element is 15% visible before animating.
     Once animated, the observer stops watching that element (no re-trigger).
  =========================================================================== */

  const revealElements = document.querySelectorAll('.reveal');

  if (revealElements.length > 0) {

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Stop observing once animated — no performance cost on re-scroll
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px' // trigger slightly before bottom of viewport
    });

    revealElements.forEach(el => revealObserver.observe(el));
  }


}); // end DOMContentLoaded



/* ===========================================================================
   SERVICES CAROUSEL
   Prev/Next buttons slide the track by one card width at a time.
=========================================================================== */

const track    = document.getElementById('servicesTrack');
const prevBtn  = document.getElementById('servicesPrev');
const nextBtn  = document.getElementById('servicesNext');

if (track && prevBtn && nextBtn) {
  let current = 0;

  const getCardWidth = () => {
    const card = track.querySelector('.service-card');
    if (!card) return 0;
    const gap = parseInt(getComputedStyle(track).gap) || 0;
    return card.offsetWidth + gap;
  };

  const totalCards  = track.querySelectorAll('.service-card').length;
  const visibleCount = () => window.innerWidth <= 600 ? 1 : window.innerWidth <= 1024 ? 2 : 3;

  const updateButtons = () => {
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current >= totalCards - visibleCount();
  };

  const slideTo = (index) => {
    current = Math.max(0, Math.min(index, totalCards - visibleCount()));
    track.style.transform = `translateX(-${current * getCardWidth()}px)`;
    updateButtons();
  };

  prevBtn.addEventListener('click', () => slideTo(current - 1));
  nextBtn.addEventListener('click', () => slideTo(current + 1));

  // Reset on resize
  window.addEventListener('resize', () => slideTo(0));

  // Init
  updateButtons();
}




/* ===========================================================================
   TESTIMONIALS CAROUSEL
   Slides through 3 slides (2 cards each on desktop, 1 on mobile).
   Prev/Next buttons + dot indicators.
=========================================================================== */

const testimonialsTrack = document.getElementById('testimonialsTrack');
const testimonialsPrev  = document.getElementById('testimonialsPrev');
const testimonialsNext  = document.getElementById('testimonialsNext');
const testimonialsDots  = document.querySelectorAll('.testimonials-dot');

if (testimonialsTrack && testimonialsPrev && testimonialsNext) {
  let currentSlide = 0;
  const totalSlides = testimonialsTrack.querySelectorAll('.testimonials-slide').length;

  const goToSlide = (index) => {
    currentSlide = Math.max(0, Math.min(index, totalSlides - 1));
    testimonialsTrack.style.transform = `translateX(-${currentSlide * 100}%)`;

    // Update dots
    testimonialsDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });

    // Update buttons
    testimonialsPrev.disabled = currentSlide === 0;
    testimonialsNext.disabled = currentSlide === totalSlides - 1;
  };

  testimonialsPrev.addEventListener('click', () => goToSlide(currentSlide - 1));
  testimonialsNext.addEventListener('click', () => goToSlide(currentSlide + 1));

  // Dot click
  testimonialsDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      goToSlide(parseInt(dot.dataset.slide));
    });
  });

  // Init
  goToSlide(0);
}



/* ===========================================================================
   SCROLL TO TOP BUTTON
=========================================================================== */
const scrollTopBtn = document.getElementById('scrollTop');

if (scrollTopBtn) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  }, { passive: true });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}


/* ===========================================================================
   TEAM CAROUSEL — mobile only
=========================================================================== */
const teamTrack = document.getElementById('teamTrack');
const teamPrev  = document.getElementById('teamPrev');
const teamNext  = document.getElementById('teamNext');

if (teamTrack && teamPrev && teamNext) {
  let teamIndex = 0;
  const teamCards = teamTrack.querySelectorAll('.team-card');
  const totalTeam = teamCards.length;

  const getTeamCardWidth = () => {
    const card = teamCards[0];
    if (!card) return 0;
    const gap = parseInt(getComputedStyle(teamTrack).gap) || 0;
    return card.offsetWidth + gap;
  };

  const updateTeamBtns = () => {
    teamPrev.disabled = teamIndex === 0;
    teamNext.disabled = teamIndex >= totalTeam - 1;
  };

const slideTeamTo = (index) => {
  if (window.innerWidth >= 768) return;
  teamIndex = Math.max(0, Math.min(index, totalTeam - 1));
  const cardWidth = getTeamCardWidth();
  const offset = (window.innerWidth - teamCards[0].offsetWidth) / 2;
  const translateX = teamIndex * cardWidth - offset;
  teamTrack.style.transform = `translateX(-${Math.max(0, translateX)}px)`;
  updateTeamBtns();
};

  teamPrev.addEventListener('click', () => slideTeamTo(teamIndex - 1));
  teamNext.addEventListener('click', () => slideTeamTo(teamIndex + 1));

  window.addEventListener('resize', () => slideTeamTo(0));
  updateTeamBtns();
}