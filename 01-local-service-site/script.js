const form = document.querySelector('#quoteForm');
const message = document.querySelector('#formMessage');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  message.textContent = `Demo quote saved for ${data.name}. In a real build, this would email the shop or create a job card.`;
  form.reset();
});
