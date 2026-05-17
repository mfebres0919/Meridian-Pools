/* =============================================================================
   MERIDIAN POOLS — calculator.js
   Budget calculator with live price estimate.
   Loads on: custom-builds page only.

   FILTER LOGIC:
   - Scoring system — each image gets a score based on how many
     selected filters it matches (1 point per matching category)
   - Images with score > 0 are shown, sorted best match first
   - This guarantees results for any combination as long as images
     are tagged to cover every filter option
   - Add-ons use OR within the category (any matching addon = 1 point)

   OTHER FEATURES:
   - Collapsible filter sections
   - Live price range calculation
   - Dynamic image grid spanning (odd count = first spans full width)
   - URL param passing to quote page
   - Save estimate as PDF via browser print
============================================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ── DOM refs ────────────────────────────────────────────────────────────── */
  const gallery        = document.getElementById('calcGallery');
  const noResults      = document.getElementById('calcNoResults');
  const resultCount    = document.getElementById('calcResultCount');
  const rangeEl        = document.getElementById('calcRange');
  const tagsEl         = document.getElementById('calcTags');
  const baseRangeEl    = document.getElementById('calcBaseRange');
  const matRangeEl     = document.getElementById('calcMatRange');
  const addonRangeEl   = document.getElementById('calcAddonRange');
  const selectedRow    = document.getElementById('calcSelectedRow');
  const selectedList   = document.getElementById('calcSelectedList');
  const resetBtn       = document.getElementById('calcReset');
  const saveBtn        = document.getElementById('calcSaveBtn');
  const quoteBtn       = document.getElementById('calcQuoteBtn');
  const allItems       = gallery ? [...gallery.querySelectorAll('.calc-img-item')] : [];
  const allOptions     = document.querySelectorAll('.calc-option');

  if (!gallery) return;

  /* ── State ───────────────────────────────────────────────────────────────── */
  const state = {
    type:     [],
    style:    [],
    material: [],
    addon:    []
  };

  /* ── Collapsible sections ────────────────────────────────────────────────── */
  document.querySelectorAll('.calc-section-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const section = toggle.closest('.calc-section');
      section.classList.toggle('collapsed');
      const isExpanded = !section.classList.contains('collapsed');
      toggle.setAttribute('aria-expanded', isExpanded);
    });
  });

  /* ── Filter option click ─────────────────────────────────────────────────── */
  allOptions.forEach(option => {
    option.addEventListener('click', (e) => {
      e.preventDefault();

      const filter = option.dataset.filter;
      const value  = option.dataset.value;

      if (!filter || !value) return;

      if (filter !== 'addon') {
        // Single select per category — toggle off if already selected
        const alreadySelected = option.classList.contains('selected');

        allOptions.forEach(o => {
          if (o.dataset.filter === filter) {
            o.classList.remove('selected');
          }
        });

        if (!alreadySelected) {
          option.classList.add('selected');
          state[filter] = [value];
        } else {
          state[filter] = [];
        }

      } else {
        // Add-ons — multi select
        option.classList.toggle('selected');
        const isSelected = option.classList.contains('selected');
        if (isSelected) {
          if (!state.addon.includes(value)) {
            state.addon.push(value);
          }
        } else {
          state.addon = state.addon.filter(v => v !== value);
        }
      }

      update();
    });
  });

  /* ── Reset ───────────────────────────────────────────────────────────────── */
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      state.type     = [];
      state.style    = [];
      state.material = [];
      state.addon    = [];

      allOptions.forEach(o => o.classList.remove('selected'));

      update();
    });
  }

  /* ── Main update function ────────────────────────────────────────────────── */
  function update() {
    const hasFilters = state.type.length || state.style.length ||
                       state.material.length || state.addon.length;

    let scoredItems = [];

    allItems.forEach(item => {
      // No filters — show everything with score 0
      if (!hasFilters) {
        item.dataset.score = 0;
        item.classList.remove('hidden', 'span-full');
        scoredItems.push({ el: item, score: 0 });
        return;
      }

      const itemType     = item.dataset.type     || '';
      const itemStyle    = item.dataset.style    || '';
      const itemMaterial = item.dataset.material || '';
      const itemAddons   = (item.dataset.addons  || '').split(',').map(a => a.trim());

      // Score: 1 point per matching active category
      let score = 0;

      if (state.type.length && state.type.includes(itemType))             score++;
      if (state.style.length && state.style.includes(itemStyle))           score++;
      if (state.material.length && state.material.includes(itemMaterial))  score++;
      // Add-ons: 1 point if ANY selected addon matches
      if (state.addon.length && state.addon.some(a => itemAddons.includes(a))) score++;

      item.dataset.score = score;

      if (score > 0) {
        item.classList.remove('hidden');
        scoredItems.push({ el: item, score });
      } else {
        item.classList.add('hidden');
        item.classList.remove('span-full');
      }
    });

    // Sort visible items by score descending — best matches first
    if (hasFilters) {
      scoredItems.sort((a, b) => b.score - a.score);
      // Re-append in sorted order so DOM reflects ranking
      scoredItems.forEach(({ el }) => gallery.appendChild(el));
    }

    const visibleItems = scoredItems.map(s => s.el);

    // Apply span-full logic
    applySpanLogic(visibleItems);

    // Update result count
    if (resultCount) resultCount.textContent = visibleItems.length;

    // Show/hide no results state
    if (noResults) {
      noResults.style.display = visibleItems.length === 0 ? 'block' : 'none';
    }

    // Update pricing
    updatePricing();

    // Update quote button URL
    updateQuoteUrl();
  }

  /* ── Span logic ──────────────────────────────────────────────────────────── */
  function applySpanLogic(visibleItems) {
    visibleItems.forEach(item => item.classList.remove('span-full'));

    const count = visibleItems.length;
    if (count === 0) return;

    // Odd number — first item spans full width
    if (count % 2 !== 0) {
      visibleItems[0].classList.add('span-full');
    }
  }

  /* ── Pricing calculation ─────────────────────────────────────────────────── */
  function updatePricing() {
    // Base build from selected type
    let baseMin = 80000;
    let baseMax = 120000;

    if (state.type.length) {
      const typeCheckbox = document.querySelector(
        `.calc-option[data-filter="type"][data-value="${state.type[0]}"] .calc-checkbox`
      );
      if (typeCheckbox) {
        baseMin = parseInt(typeCheckbox.dataset.baseMin) || baseMin;
        baseMax = parseInt(typeCheckbox.dataset.baseMax) || baseMax;
      }
    }

    // Material
    let matMin = 0;
    let matMax = 0;

    if (state.material.length) {
      const matCheckbox = document.querySelector(
        `.calc-option[data-filter="material"][data-value="${state.material[0]}"] .calc-checkbox`
      );
      if (matCheckbox) {
        matMin = parseInt(matCheckbox.dataset.matMin) || 0;
        matMax = parseInt(matCheckbox.dataset.matMax) || 0;
      }
    }

    // Style
    let styleMin = 0;
    let styleMax = 0;

    if (state.style.length) {
      const styleCheckbox = document.querySelector(
        `.calc-option[data-filter="style"][data-value="${state.style[0]}"] .calc-checkbox`
      );
      if (styleCheckbox) {
        styleMin = parseInt(styleCheckbox.dataset.addMin) || 0;
        styleMax = parseInt(styleCheckbox.dataset.addMax) || 0;
      }
    }

    // Add-ons (multi)
    let addonMin = 0;
    let addonMax = 0;

    state.addon.forEach(addonVal => {
      const addonCheckbox = document.querySelector(
        `.calc-option[data-filter="addon"][data-value="${addonVal}"] .calc-checkbox`
      );
      if (addonCheckbox) {
        addonMin += parseInt(addonCheckbox.dataset.addonMin) || 0;
        addonMax += parseInt(addonCheckbox.dataset.addonMax) || 0;
      }
    });

    // Totals
    const totalMin = baseMin + matMin + styleMin + addonMin;
    const totalMax = baseMax + matMax + styleMax + addonMax;

    // Formatters
    const fmt     = n => '$' + (n >= 1000 ? (n / 1000).toFixed(0) + 'k' : n);
    const fmtFull = n => '$' + n.toLocaleString();

    // Update DOM
    if (rangeEl)      rangeEl.textContent      = `${fmtFull(totalMin)} - ${fmtFull(totalMax)}`;
    if (baseRangeEl)  baseRangeEl.textContent  = `${fmt(baseMin)}-${fmt(baseMax)}`;
    if (matRangeEl)   matRangeEl.textContent   = `${fmt(matMin + styleMin)}-${fmt(matMax + styleMax)}`;
    if (addonRangeEl) addonRangeEl.textContent = `${fmt(addonMin)}-${fmt(addonMax)}`;

    // Tags line
    const tagParts = [];
    if (state.type.length)     tagParts.push(capitalize(state.type[0]));
    if (state.style.length)    tagParts.push(capitalize(state.style[0]));
    if (state.material.length) tagParts.push(capitalize(state.material[0]));
    if (state.addon.length)    tagParts.push(...state.addon.map(capitalize));
    tagParts.push('Greater Houston');
    if (tagsEl) tagsEl.textContent = tagParts.join(' · ');

    // Selected add-ons row
    if (selectedRow && selectedList) {
      if (state.addon.length) {
        selectedRow.style.display = 'flex';
        selectedList.textContent = state.addon.map(a => {
          const label = document.querySelector(
            `.calc-option[data-filter="addon"][data-value="${a}"] .calc-option-label`
          );
          return label ? label.textContent.trim() : capitalize(a);
        }).join(', ');
      } else {
        selectedRow.style.display = 'none';
      }
    }
  }

  /* ── Update quote URL with selections ────────────────────────────────────── */
  function updateQuoteUrl() {
    if (!quoteBtn) return;
    const params = new URLSearchParams();
    params.set('service', 'custom-build');
    if (state.type.length)     params.set('type',     state.type[0]);
    if (state.style.length)    params.set('style',    state.style[0]);
    if (state.material.length) params.set('material', state.material[0]);
    if (state.addon.length)    params.set('addons',   state.addon.join(','));
    quoteBtn.href = `/html/quote.html?${params.toString()}`;
  }

  /* ── Save estimate as PDF ────────────────────────────────────────────────── */
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      window.print();
    });
  }

  /* ── Helper ──────────────────────────────────────────────────────────────── */
  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /* ── Init ────────────────────────────────────────────────────────────────── */
  update();

});