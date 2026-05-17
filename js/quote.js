/* =============================================================================
   MERIDIAN POOLS — quote.js
   MigsFlow Web Design
   Multi-step branching quote form.
   Tracks: custom-build | renovation | addon | unsure
   URL params: ?service=custom-build&type=...&style=...&material=...&budget=...&addons=...
============================================================================= */

document.addEventListener('DOMContentLoaded', function() {

  /* ── DOM refs ────────────────────────────────────────────────────────────── */
  var stepsWrap     = document.getElementById('quoteSteps');
  var progressCard  = document.getElementById('quoteProgressCard');
  var progressFill  = document.getElementById('quoteProgressFill');
  var progressLabel = document.getElementById('quoteProgressLabel');
  var progressPct   = document.getElementById('quoteProgressPct');
  var progressTrack = document.getElementById('quoteProgressTrack');
  var backBtn       = document.getElementById('quoteBack');
  var nextBtn       = document.getElementById('quoteNext');
  var quoteCard     = document.getElementById('quoteCard');
  var quoteSuccess  = document.getElementById('quoteSuccess');

  if (!stepsWrap) return;

  /* ── URL params ──────────────────────────────────────────────────────────── */
  var params  = new URLSearchParams(window.location.search);
  var prefill = {
    service  : params.get('service')  || null,
    type     : params.get('type')     || null,
    style    : params.get('style')    || null,
    material : params.get('material') || null,
    budget   : params.get('budget')   || null,
    addons   : params.get('addons')   ? params.get('addons').split(',') : []
  };

  /* ── Tracks ──────────────────────────────────────────────────────────────── */
  var TRACKS = {
    'custom-build' : ['service', 'cb-type', 'cb-design', 'cb-material', 'cb-features', 'cb-yard', 'cb-budget', 'timeline', 'heard', 'contact'],
    'renovation'   : ['service', 'reno-issue', 'reno-age', 'budget', 'timeline', 'heard', 'contact'],
    'addon'        : ['service', 'addon-type', 'budget', 'timeline', 'heard', 'contact'],
    'unsure'       : ['service', 'unsure-desc', 'budget', 'heard', 'contact']
  };

  var TRACK_LABELS = {
    'custom-build' : 'Custom Build',
    'renovation'   : 'Remodel & Renovation',
    'addon'        : 'Luxury Add-On',
    'unsure'       : 'Exploring Options'
  };

  /* ── Step library ────────────────────────────────────────────────────────── */
  var STEPS = {

    'service': {
      label    : 'Getting Started',
      question : 'What are you looking for?',
      hint     : 'Select one to get started.',
      type     : 'service-grid',
      options  : [
        { value: 'custom-build', title: 'Custom Pool Build',     desc: 'Design & build a brand new pool from the ground up.' },
        { value: 'renovation',   title: 'Remodel & Renovation',  desc: 'Refresh or restructure your existing pool.' },
        { value: 'addon',        title: 'Luxury Feature Add-On', desc: 'Add waterfalls, lighting, fire features & more.' },
        { value: 'unsure',       title: 'Not Sure Yet',          desc: 'Still exploring — tell us what you\'re thinking.' }
      ]
    },

    'cb-type': {
      label   : 'Pool Type',
      question: 'What type of pool are you interested in?',
      hint    : 'Select one.',
      type    : 'options',
      multi   : false,
      options : [
        { value: 'inground',   label: 'In-Ground Pool' },
        { value: 'lap',        label: 'Lap Pool' },
        { value: 'plunge',     label: 'Plunge Pool' },
        { value: 'spa',        label: 'Spa / Hot Tub' }
      ]
    },

    'cb-design': {
      label   : 'Pool Design',
      question: 'What design style appeals to you?',
      hint    : 'Select one.',
      type    : 'options',
      multi   : false,
      options : [
        { value: 'geometric', label: 'Geometric' },
        { value: 'freeform',  label: 'Freeform' },
        { value: 'infinity',  label: 'Infinity Edge' },
        { value: 'lagoon',    label: 'Natural / Lagoon' }
      ]
    },

    'cb-material': {
      label   : 'Material & Finish',
      question: 'What finish are you leaning toward?',
      hint    : 'Select one. We can advise if you\'re not sure.',
      type    : 'options',
      multi   : false,
      options : [
        { value: 'concrete',   label: 'Concrete / Gunite' },
        { value: 'fiberglass', label: 'Fiberglass' },
        { value: 'vinyl',      label: 'Vinyl Liner' },
        { value: 'pebble',     label: 'Pebble / Tile Finish' }
      ]
    },

    'cb-features': {
      label   : 'Features & Add-Ons',
      question: 'Any features you\'d like to include?',
      hint    : 'Select all that apply.',
      type    : 'options',
      multi   : true,
      options : [
        { value: 'water',      label: 'Water Features (waterfall, jets)' },
        { value: 'lighting',   label: 'LED Lighting' },
        { value: 'tanning',    label: 'Tanning Ledge' },
        { value: 'automation', label: 'Smart Automation' },
        { value: 'fire',       label: 'Fire Features' },
        { value: 'none',       label: 'None for now' }
      ]
    },

    'cb-yard': {
      label   : 'Yard & Lot',
      question: 'How would you describe your backyard?',
      hint    : 'This helps us understand scope and any constraints.',
      type    : 'options',
      multi   : false,
      options : [
        { value: 'under500',    label: 'Under 500 sq ft' },
        { value: '500to1000',   label: '500 – 1,000 sq ft' },
        { value: '1000to2000',  label: '1,000 – 2,000 sq ft' },
        { value: 'over2000',    label: '2,000+ sq ft' },
        { value: 'unsure',      label: 'Not sure — we can assess on site' }
      ]
    },

    'reno-issue': {
      label   : 'Current Problem',
      question: 'What\'s the main issue with your existing pool?',
      hint    : 'Select all that apply.',
      type    : 'options',
      multi   : true,
      options : [
        { value: 'surface',   label: 'Surface / finish is cracked or worn' },
        { value: 'equipment', label: 'Equipment is outdated or failing' },
        { value: 'leak',      label: 'Possible leak or structural issue' },
        { value: 'aesthetic', label: 'It just looks outdated — full refresh' },
        { value: 'features',  label: 'Want to add new features to it' }
      ]
    },

    'reno-age': {
      label   : 'Pool Age',
      question: 'How old is your existing pool?',
      hint    : 'Select one.',
      type    : 'options',
      multi   : false,
      options : [
        { value: 'under10', label: 'Under 10 years' },
        { value: '10to20',  label: '10 – 20 years' },
        { value: 'over20',  label: '20+ years' },
        { value: 'unsure',  label: 'Not sure' }
      ]
    },

    'addon-type': {
      label   : 'Feature Type',
      question: 'What would you like to add?',
      hint    : 'Select all that apply.',
      type    : 'options',
      multi   : true,
      options : [
        { value: 'kitchen',    label: 'Outdoor Kitchen' },
        { value: 'fire',       label: 'Fire Feature (pit, bowls, wall)' },
        { value: 'lighting',   label: 'LED Lighting Upgrade' },
        { value: 'automation', label: 'Smart Automation System' },
        { value: 'water',      label: 'Water Feature (waterfall, jets)' },
        { value: 'spa',        label: 'Spa / Hot Tub Addition' },
        { value: 'other',      label: 'Something else' }
      ]
    },

    'unsure-desc': {
      label   : 'Tell Us More',
      question: 'What are you thinking about?',
      hint    : 'Select the closest option — no commitment required.',
      type    : 'options',
      multi   : false,
      options : [
        { value: 'new-pool',  label: 'I want a pool but haven\'t decided on anything' },
        { value: 'upgrade',   label: 'I want to upgrade my current pool somehow' },
        { value: 'cost',      label: 'I want to understand what things cost first' },
        { value: 'comparing', label: 'I\'m comparing a few builders right now' }
      ]
    },

    'cb-budget': {
      label   : 'Budget Range',
      question: 'What\'s your approximate budget?',
      hint    : 'Custom builds at Meridian start at $80,000.',
      type    : 'options',
      multi   : false,
      options : [
        { value: '80to150',  label: '$80,000 — $150,000' },
        { value: '150to250', label: '$150,000 — $250,000' },
        { value: '250to400', label: '$250,000 — $400,000' },
        { value: 'over400',  label: '$400,000+' },
        { value: 'unsure',   label: 'Not sure yet' }
      ]
    },

        'budget': {
      label   : 'Budget Range',
      question: 'What\'s your approximate budget?',
      hint    : 'This helps us recommend the right options for you.',
      type    : 'options',
      multi   : false,
      options : [
        { value: 'under50',  label: 'Under $50,000' },
        { value: '50to100',  label: '$50,000 — $100,000' },
        { value: '100to200', label: '$100,000 — $200,000' },
        { value: 'over200',  label: '$200,000+' },
        { value: 'unsure',   label: 'Not sure yet' }
      ]
    },

    'timeline': {
      label   : 'Timeline',
      question: 'When are you hoping to get started?',
      hint    : 'Select one.',
      type    : 'options',
      multi   : false,
      options : [
        { value: 'asap',      label: 'As soon as possible' },
        { value: '3to6',      label: 'Within 3–6 months' },
        { value: '6to12',     label: 'Within 6–12 months' },
        { value: 'exploring', label: 'Just exploring options' }
      ]
    },

    'heard': {
      label   : 'Almost There!',
      question: 'How did you hear about us?',
      hint    : 'Select one.',
      type    : 'options',
      multi   : false,
      options : [
        { value: 'google',   label: 'Google Search' },
        { value: 'referral', label: 'Friend or Family Referral' },
        { value: 'social',   label: 'Social Media' },
        { value: 'drove',    label: 'Drove Past a Job Site' },
        { value: 'other',    label: 'Other' }
      ]
    },

    'contact': {
      label   : 'Your Information',
      question: 'Last step — how do we reach you?',
      hint    : 'We\'ll send your welcome package here.',
      type    : 'inputs',
      fields  : [
        { id: 'q-name',  label: 'Full Name*',     type: 'text',  placeholder: 'John Smith',       required: true  },
        { id: 'q-email', label: 'Email Address*', type: 'email', placeholder: 'john@example.com', required: true  },
        { id: 'q-phone', label: 'Phone Number*',  type: 'tel',   placeholder: '(832) 555-0100',   required: true  },
        { id: 'q-zip',   label: 'Zip Code',       type: 'text',  placeholder: '77001',            required: false }
      ]
    }
  };

  /* ── State ───────────────────────────────────────────────────────────────── */
  var activeTrack  = null;
  var trackSteps   = [];
  var currentIndex = 0;
  var answers      = {};

  /* ── Build service selector step ─────────────────────────────────────────── */
  function buildServiceStep() {
    var step = STEPS['service'];
    var div  = document.createElement('div');
    div.className = 'quote-step active';
    div.setAttribute('data-step', 'service');

    var html = '<p class="quote-step-label">' + step.label + '</p>'
             + '<h3 class="quote-step-question">' + step.question + '</h3>'
             + '<p class="quote-step-hint">' + step.hint + '</p>'
             + '<div class="quote-service-grid">';

    step.options.forEach(function(opt) {
      html += '<button class="quote-service-card" data-value="' + opt.value + '" type="button">'
            +   '<span class="quote-service-title">' + opt.title + '</span>'
            +   '<span class="quote-service-desc">' + opt.desc + '</span>'
            + '</button>';
    });

    html += '</div>';
    div.innerHTML = html;
    stepsWrap.appendChild(div);
  }

  /* ── Build all steps for a track ────────────────────────────────────────── */
  function buildTrackSteps(trackKey) {
    var old = stepsWrap.querySelectorAll('.quote-step:not([data-step="service"])');
    old.forEach(function(el) { el.remove(); });

    trackSteps = TRACKS[trackKey];

    trackSteps.slice(1).forEach(function(stepId) {
      var step = STEPS[stepId];
      if (!step) return;

      var div = document.createElement('div');
      div.className = 'quote-step';
      div.setAttribute('data-step', stepId);

      var html = '<div class="quote-track-badge">' + TRACK_LABELS[trackKey] + '</div>'
               + '<p class="quote-step-label">' + step.label + '</p>'
               + '<h3 class="quote-step-question">' + step.question + '</h3>'
               + (step.hint ? '<p class="quote-step-hint">' + step.hint + '</p>' : '');

      if (step.type === 'inputs') {
        html += '<div class="quote-inputs"><div class="quote-input-row">';
        step.fields.forEach(function(field) {
          html += '<div class="quote-input-field">'
               +    '<label for="' + field.id + '">' + field.label + '</label>'
               +    '<input type="' + field.type + '" id="' + field.id + '" name="' + field.id + '" placeholder="' + field.placeholder + '"' + (field.required ? ' required' : '') + '>'
               + '</div>';
        });
        html += '</div></div>';
      } else {
        html += '<div class="quote-options">';
        step.options.forEach(function(opt) {
          var multiClass = step.multi ? ' multi' : '';
          html += '<button class="quote-option' + multiClass + '" data-step="' + stepId + '" data-value="' + opt.value + '" type="button">'
               +    '<span class="quote-option-dot" aria-hidden="true"></span>'
               +    opt.label
               + '</button>';
        });
        html += '</div>';
      }

      // Validation error message container
      html += '<p class="quote-error-msg" id="err-' + stepId + '" aria-live="polite"></p>';

      div.innerHTML = html;
      stepsWrap.appendChild(div);
    });

    // Apply prefills
    applyPrefills(trackKey);
  }

  /* ── Apply URL prefills ──────────────────────────────────────────────────── */
  function applyPrefills(trackKey) {
    if (trackKey !== 'custom-build') return;

    // Single-select prefills: stepId -> param value
    var singleMap = {
      'cb-type'    : prefill.type,
      'cb-design'  : prefill.style,
      'cb-material': prefill.material,
      'cb-budget'  : prefill.budget
    };

    Object.keys(singleMap).forEach(function(stepId) {
      var val = singleMap[stepId];
      if (!val) return;
      var stepEl = stepsWrap.querySelector('[data-step="' + stepId + '"]');
      if (!stepEl) return;
      var btn = stepEl.querySelector('[data-value="' + val + '"]');
      if (btn) {
        btn.classList.add('selected');
        answers[stepId] = [val];
      }
    });

    // Multi-select prefill: cb-features from addons param
    if (prefill.addons && prefill.addons.length) {
      var featuresEl = stepsWrap.querySelector('[data-step="cb-features"]');
      if (featuresEl) {
        answers['cb-features'] = [];
        prefill.addons.forEach(function(addonVal) {
          var btn = featuresEl.querySelector('[data-value="' + addonVal + '"]');
          if (btn) {
            btn.classList.add('selected');
            answers['cb-features'].push(addonVal);
          }
        });
      }
    }
  }

  /* ── Show validation error on the current step ───────────────────────────── */
  function showError(stepId, message) {
    var stepEl = stepsWrap.querySelector('[data-step="' + stepId + '"]');
    if (!stepEl) return;

    // Highlight options container or inputs
    var optionsEl = stepEl.querySelector('.quote-options');
    if (optionsEl) {
      optionsEl.classList.add('options-error');
      setTimeout(function() { optionsEl.classList.remove('options-error'); }, 2500);
    }

    // Show error message
    var errEl = stepEl.querySelector('.quote-error-msg');
    if (errEl) {
      errEl.textContent = message;
      errEl.classList.add('visible');
      setTimeout(function() {
        errEl.classList.remove('visible');
        errEl.textContent = '';
      }, 2500);
    }
  }

  /* ── Show step by track index ────────────────────────────────────────────── */
  function showStep(index, back) {
    var allSteps = stepsWrap.querySelectorAll('.quote-step');
    allSteps.forEach(function(s) { s.classList.remove('active', 'slide-back'); });

    var stepId = trackSteps[index];
    if (!stepId) return;

    var target = stepsWrap.querySelector('[data-step="' + stepId + '"]');
    if (!target) return;

    target.classList.add('active');
    if (back) target.classList.add('slide-back');

    currentIndex = index;

    if (currentIndex === 0) {
      progressCard.classList.add('hidden');
    } else {
      progressCard.classList.remove('hidden');
    }

    updateProgress();
    backBtn.disabled = currentIndex === 0;

    var isLast = currentIndex === trackSteps.length - 1;
    if (isLast) {
      nextBtn.innerHTML = 'Submit <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>';
    } else {
      nextBtn.innerHTML = 'Next <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>';
    }
  }

  /* ── Update progress bar ─────────────────────────────────────────────────── */
  function updateProgress() {
    if (!activeTrack || currentIndex === 0) {
      progressFill.style.width  = '0%';
      progressLabel.textContent = '';
      progressPct.textContent   = '';
      return;
    }
    var total = trackSteps.length - 1;
    var pct   = Math.round((currentIndex / total) * 100);
    progressFill.style.width  = pct + '%';
    progressLabel.textContent = 'Step ' + currentIndex + ' of ' + total;
    progressPct.textContent   = pct + '%';
    progressTrack.setAttribute('aria-valuenow', pct);
  }

  /* ── Handle service selection ────────────────────────────────────────────── */
  function handleServiceSelect(value) {
    if (!value || !TRACKS[value]) return;

    var cards = stepsWrap.querySelectorAll('.quote-service-card');
    cards.forEach(function(card) {
      card.classList.toggle('selected', card.getAttribute('data-value') === value);
    });

    answers['service'] = [value];
    activeTrack = value;
    buildTrackSteps(value);

    setTimeout(function() { showStep(1, false); }, 280);
  }

  /* ── Validate current step — returns true/false and shows error if not ───── */
  function validateStep() {
    var stepId = trackSteps[currentIndex];
    var step   = STEPS[stepId];
    if (!step) return false;

    if (step.type === 'inputs') {
      var inputs = stepsWrap.querySelectorAll('[data-step="' + stepId + '"] input[required]');
      var valid  = true;
      inputs.forEach(function(input) {
        if (!input.value.trim()) {
          input.classList.add('error');
          setTimeout(function() { input.classList.remove('error'); }, 2500);
          if (valid) input.focus(); // focus only the first empty field
          valid = false;
        }
      });
      if (!valid) {
        var errEl = stepsWrap.querySelector('[data-step="' + stepId + '"] .quote-error-msg');
        if (errEl) {
          errEl.textContent = 'Please fill in all required fields to continue.';
          errEl.classList.add('visible');
          setTimeout(function() { errEl.classList.remove('visible'); errEl.textContent = ''; }, 2500);
        }
      }
      return valid;
    }

    if (step.type === 'service-grid') return !!activeTrack;

    var hasAnswer = !!(answers[stepId] && answers[stepId].length > 0);
    if (!hasAnswer) {
      showError(stepId, 'Please make a selection to continue.');
    }
    return hasAnswer;
  }

  /* ── Advance — shared logic used by Next button and Enter key ────────────── */
  function advance() {
    if (!validateStep()) return;

    var isLast = currentIndex === trackSteps.length - 1;
    if (isLast) {
      var lastStepId  = trackSteps[trackSteps.length - 1];
      var inputs      = stepsWrap.querySelectorAll('[data-step="' + lastStepId + '"] input');
      var contactData = {};
      inputs.forEach(function(input) { contactData[input.id] = input.value.trim(); });

      // Build flat payload for Formspree
      var payload = new FormData();
      payload.append('_subject',  'New Quote Request — Meridian Pools (' + (activeTrack || '') + ')');
      payload.append('name',      contactData['q-name']  || '');
      payload.append('email',     contactData['q-email'] || '');
      payload.append('phone',     contactData['q-phone'] || '');
      payload.append('zip',       contactData['q-zip']   || '');
      payload.append('service',   activeTrack            || '');

      // Append each answer as a readable field
      Object.keys(answers).forEach(function(stepId) {
        if (stepId !== 'contact') {
          payload.append(stepId, answers[stepId].join(', '));
        }
      });

      // Disable next button while submitting
      nextBtn.disabled    = true;
      nextBtn.textContent = 'Submitting…';

      fetch('https://formspree.io/f/maqkynee', {
        method : 'POST',
        body   : payload,
        headers: { 'Accept': 'application/json' }
      })
      .then(function(response) {
        if (response.ok) {
          quoteCard.style.display          = 'none';
          progressCard.style.display       = 'none';
          quoteSuccess.style.display       = 'flex';
          quoteSuccess.style.flexDirection = 'column';
        } else {
          nextBtn.disabled  = false;
          nextBtn.innerHTML = 'Submit <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>';
          alert('Something went wrong. Please try again or call us directly.');
        }
      })
      .catch(function() {
        nextBtn.disabled  = false;
        nextBtn.innerHTML = 'Submit <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>';
        alert('Network error. Please check your connection and try again.');
      });

      return;
    }

    showStep(currentIndex + 1, false);
  }

  /* ── Click handler ───────────────────────────────────────────────────────── */
  stepsWrap.addEventListener('click', function(e) {
    var node = e.target;

    while (node && node !== stepsWrap) {
      if (node.classList && node.classList.contains('quote-service-card')) {
        handleServiceSelect(node.getAttribute('data-value'));
        return;
      }
      if (node.classList && node.classList.contains('quote-option')) {
        var stepId  = node.getAttribute('data-step');
        var val     = node.getAttribute('data-value');
        var isMulti = node.classList.contains('multi');
        var stepEl  = stepsWrap.querySelector('[data-step="' + stepId + '"]');
        if (!stepEl) return;

        // Clear error state on interaction
        var optionsEl = stepEl.querySelector('.quote-options');
        if (optionsEl) optionsEl.classList.remove('options-error');
        var errEl = stepEl.querySelector('.quote-error-msg');
        if (errEl) { errEl.classList.remove('visible'); errEl.textContent = ''; }

        if (!isMulti) {
          stepEl.querySelectorAll('.quote-option').forEach(function(o) { o.classList.remove('selected'); });
          node.classList.add('selected');
          answers[stepId] = [val];
        } else {
          node.classList.toggle('selected');
          if (!answers[stepId]) answers[stepId] = [];
          if (node.classList.contains('selected')) {
            if (answers[stepId].indexOf(val) === -1) answers[stepId].push(val);
          } else {
            answers[stepId] = answers[stepId].filter(function(v) { return v !== val; });
          }
        }
        return;
      }
      node = node.parentElement;
    }
  });

  /* ── Next button ─────────────────────────────────────────────────────────── */
  nextBtn.addEventListener('click', function() { advance(); });

  /* ── Enter key — advance form (skip on service-grid step) ───────────────── */
  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Enter') return;

    // Don't fire if user is inside a textarea
    if (document.activeElement && document.activeElement.tagName === 'TEXTAREA') return;

    // On the service selector, Enter does nothing (click only)
    var stepId = trackSteps[currentIndex];
    if (!stepId || stepId === 'service') return;

    // Prevent default form submission behavior
    e.preventDefault();
    advance();
  });

  /* ── Back button ─────────────────────────────────────────────────────────── */
  backBtn.addEventListener('click', function() {
    if (currentIndex === 0) return;

    if (currentIndex === 1) {
      activeTrack  = null;
      trackSteps   = [];
      currentIndex = 0;
      progressCard.classList.add('hidden');

      stepsWrap.querySelectorAll('.quote-step').forEach(function(s) {
        s.classList.remove('active', 'slide-back');
      });

      var serviceStep = stepsWrap.querySelector('[data-step="service"]');
      if (serviceStep) serviceStep.classList.add('active', 'slide-back');

      backBtn.disabled  = true;
      nextBtn.innerHTML = 'Next <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>';
      return;
    }

    showStep(currentIndex - 1, true);
  });

  /* ── Init ────────────────────────────────────────────────────────────────── */
  buildServiceStep();

  if (prefill.service && TRACKS[prefill.service]) {
    answers['service'] = [prefill.service];
    activeTrack        = prefill.service;
    buildTrackSteps(prefill.service);
    currentIndex = 1;
    progressCard.classList.remove('hidden');
    showStep(1, false);
  } else {
    progressCard.classList.add('hidden');
    backBtn.disabled = true;
    updateProgress();
  }

});