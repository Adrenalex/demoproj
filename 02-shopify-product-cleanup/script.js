const scoreValue = document.querySelector('#scoreValue');
const improveBtn = document.querySelector('#improveBtn');
const risks = document.querySelectorAll('.risk');
const buyButton = document.querySelector('.buy-button');

improveBtn.addEventListener('click', () => {
  let score = Number(scoreValue.textContent);
  const timer = setInterval(() => {
    score += 3;
    scoreValue.textContent = Math.min(score, 91);
    scoreValue.parentElement.style.color = score >= 75 ? '#0f766e' : '#b45309';
    if (score >= 91) clearInterval(timer);
  }, 35);

  risks.forEach((risk) => {
    risk.textContent = 'Fixed';
    risk.classList.remove('high', 'medium');
    risk.style.background = '#0f766e';
  });

  improveBtn.textContent = 'Cleanup applied';
});

buyButton.addEventListener('click', () => {
  buyButton.textContent = 'Demo cart updated ✓';
  setTimeout(() => {
    buyButton.textContent = 'Add to cart — $39.00';
  }, 1600);
});
