const scoreValue    = document.querySelector('#scoreValue');
const improveBtn    = document.querySelector('#improveBtn');
const resetBtn      = document.querySelector('#resetBtn');
const toggleState   = document.querySelector('#toggleState');
const scoreCta      = document.querySelector('#scoreCta');
const shareLink     = document.querySelector('#shareLink');
const heroHeadline  = document.querySelector('#heroHeadline');
const heroSub       = document.querySelector('#heroSub');
const risks         = document.querySelectorAll('.risk');
const productBefore = document.querySelector('#productBefore');
const productAfter  = document.querySelector('#productAfter');
const auditSection  = document.querySelector('#audit');
const fixesSection  = document.querySelector('#fixes');
const buyButton     = productAfter.querySelector('.after-buy');

const originalRiskData = Array.from(risks).map(r => ({
  el: r, text: r.textContent, cls: r.className,
}));

// Initial state
productAfter.style.display  = 'none';
auditSection.style.display  = 'none';
fixesSection.style.display  = 'none';
resetBtn.style.display      = 'none';
toggleState.classList.add('state-before');

let cleaned = false;

function runCleanup() {
  if (cleaned) return;
  cleaned = true;

  let score = 42;
  const timer = setInterval(() => {
    score += 3;
    scoreValue.textContent = Math.min(score, 91);
    scoreValue.parentElement.style.color = score >= 75 ? '#0f766e' : '#b45309';
    if (score >= 91) clearInterval(timer);
  }, 35);

  risks.forEach(r => { r.textContent = 'Fixed'; r.className = 'risk fixed'; });

  productBefore.style.display = 'none';
  productAfter.style.display  = 'grid';
  auditSection.style.display  = '';
  fixesSection.style.display  = '';

  // Swap headline
  heroHeadline.textContent = 'This is what a good product page looks like.';
  heroSub.textContent      = 'Clear price. Real policies. One obvious action. No tricks.';
  heroHeadline.classList.add('headline-after');

  improveBtn.style.display = 'none';
  resetBtn.style.display   = '';
  scoreCta.classList.add('hidden');
  if (shareLink) shareLink.classList.add('visible');
  toggleState.className    = 'toggle-state state-after';
  toggleState.textContent  = 'Showing: after cleanup';
}

function runReset() {
  if (!cleaned) return;
  cleaned = false;

  scoreValue.textContent = '42';
  scoreValue.parentElement.style.color = '';

  originalRiskData.forEach(({ el, text, cls }) => {
    el.textContent = text;
    el.className   = cls;
  });

  productAfter.style.display  = 'none';
  productBefore.style.display = 'grid';
  auditSection.style.display  = 'none';
  fixesSection.style.display  = 'none';

  // Restore headline
  heroHeadline.textContent = 'This is a bad product page.';
  heroSub.innerHTML        = 'Fake urgency. Missing policies. Screaming buy button. Scroll down to see it \u2014 then hit the button to fix it.';
  heroHeadline.classList.remove('headline-after');

  improveBtn.style.display = '';
  resetBtn.style.display   = 'none';
  scoreCta.classList.remove('hidden');
  if (shareLink) shareLink.classList.remove('visible');
  toggleState.className    = 'toggle-state state-before';
  toggleState.textContent  = 'Showing: before';
}

improveBtn.addEventListener('click', runCleanup);
resetBtn.addEventListener('click', runReset);

buyButton.addEventListener('click', () => {
  buyButton.textContent = 'Demo cart updated \u2713';
  setTimeout(() => { buyButton.textContent = 'Add to cart \u2014 $39.00'; }, 1600);
});

// ── URL state: ?state=after auto-runs cleanup on load ────────────────────────
if (new URLSearchParams(window.location.search).get('state') === 'after') {
  // Small delay so DOM is fully ready
  setTimeout(runCleanup, 100);
}
