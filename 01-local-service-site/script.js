const form      = document.querySelector('#quoteForm');
const message   = document.querySelector('#formMessage');
const submitBtn = form.querySelector('button[type="submit"]');
const slotCount = document.querySelector('#slotCount');
const slots     = document.querySelectorAll('.slot');

let slotsLeft    = 3;

// ── Inline validation ────────────────────────────────────────────────────────
const fields = [
  { input: form.querySelector('#f-name'),    error: form.querySelector('#err-name') },
  { input: form.querySelector('#f-vehicle'), error: form.querySelector('#err-vehicle') },
  { input: form.querySelector('#f-problem'), error: form.querySelector('#err-problem') },
];

fields.forEach(({ input, error }) => {
  input.addEventListener('blur', () => validateField(input, error));
  input.addEventListener('input', () => {
    if (input.value.trim()) clearError(input, error);
  });
});

function validateField(input, error) {
  if (!input.value.trim()) {
    input.classList.add('field-invalid');
    error.classList.add('visible');
    return false;
  }
  clearError(input, error);
  return true;
}

function clearError(input, error) {
  input.classList.remove('field-invalid');
  error.classList.remove('visible');
}

// ── Form submit ──────────────────────────────────────────────────────────────
form.addEventListener('submit', (event) => {
  event.preventDefault();

  // Validate all fields
  const valid = fields.every(({ input, error }) => validateField(input, error));
  if (!valid) return;

  const data = Object.fromEntries(new FormData(form).entries());

  // Success state
  form.classList.add('form-success');
  submitBtn.textContent = '\u2713 Quote submitted';
  submitBtn.classList.add('success');
  message.innerHTML = '<span class="check-icon">\u2713</span> Demo quote saved for ' + data.name + '. In a real build, this would email the shop or create a job card.';
  message.classList.add('visible');

  // Tick down a slot
  if (slotsLeft > 0) {
    const claimed = slots[3 - slotsLeft];
    claimed.classList.add('slot-claimed');
    claimed.querySelector('span').textContent = 'Claimed';
    slotsLeft--;
    slotCount.textContent = slotsLeft;
    if (slotsLeft === 0) {
      document.querySelector('#slotHeading').innerHTML = 'No slots left today';
      document.querySelector('#slotHeading').classList.add('slots-full');
    }
  }

  // Reset after 4s
  setTimeout(() => {
    form.classList.remove('form-success');
    submitBtn.textContent = 'Submit demo quote';
    submitBtn.classList.remove('success');
    message.classList.remove('visible');
    fields.forEach(({ input, error }) => clearError(input, error));
    form.reset();
  }, 4000);
});
