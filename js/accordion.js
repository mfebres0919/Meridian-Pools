/* =============================================================================
   MERIDIAN POOLS — accordion.js
   FAQ accordion — one item open at a time.
   Loads on: index.html only
============================================================================= */

document.addEventListener('DOMContentLoaded', () => {

  const accordion = document.getElementById('faqAccordion');
  if (!accordion) return;

  const items = accordion.querySelectorAll('.faq-item');

  const closeAll = () => {
    items.forEach(item => {
      item.classList.remove('open');
      const trigger = item.querySelector('.faq-trigger');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    });
  };

  items.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    if (!trigger) return;

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all first
      closeAll();

      // If it wasn't open, open it
      if (!isOpen) {
        item.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

});