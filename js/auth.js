document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('register-form');
  const errorEl = document.getElementById('error-msg');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.classList.remove('show');

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!name || !email || !password) {
      errorEl.textContent = 'Barcha maydonlarni to\'ldiring';
      errorEl.classList.add('show');
      return;
    }

    if (password.length < 6) {
      errorEl.textContent = 'Parol kamida 6 ta belgi bo\'lishi kerak';
      errorEl.classList.add('show');
      return;
    }

    const btn = form.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'Yuklanmoqda...';

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        errorEl.textContent = data.error;
        errorEl.classList.add('show');
        btn.disabled = false;
        btn.textContent = 'Ro\'yxatdan o\'tish';
        return;
      }

      setAuth(data.token, data.user);
      window.location.href = '/index.html';
    } catch (err) {
      errorEl.textContent = 'Serverga ulanib bo\'lmadi';
      errorEl.classList.add('show');
      btn.disabled = false;
      btn.textContent = 'Ro\'yxatdan o\'tish';
    }
  });
});
