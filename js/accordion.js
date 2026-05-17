/* =============================================================================
   MERIDIAN POOLS — accordion.js
   FAQ accordion — one item open at a time.
   Loads on: index.html only
============================================================================= */

document.addEventListener('DOMContentLoaded', () => {

  const accordion = document.getElementById('faqAccordion');
  if (!accordion) return;

  const items = accordion.querySelectorAll('.faq-item');

  const closeItem = (item) => {
    const body = item.querySelector('.faq-body');
    const trigger = item.querySelector('.faq-trigger');
    // Set explicit height before closing so transition has something to animate from
    body.style.height = body.scrollHeight + 'px';
    // Force reflow
    body.offsetHeight;
    body.style.height = '0px';
    item.classList.remove('open');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  };

  const openItem = (item) => {
    const body = item.querySelector('.faq-body');
    const trigger = item.querySelector('.faq-trigger');
    body.style.height = body.scrollHeight + 'px';
    item.classList.add('open');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    // After transition ends, set to auto so content can resize
    body.addEventListener('transitionend', () => {
      if (item.classList.contains('open')) {
        body.style.height = 'auto';
      }
    }, { once: true });
  };

  const closeAll = () => {
    items.forEach(item => {
      if (item.classList.contains('open')) closeItem(item);
    });
  };

  items.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    if (!trigger) return;

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      closeAll();
      if (!isOpen) openItem(item);
    });
  });

});