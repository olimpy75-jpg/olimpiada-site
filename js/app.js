const API = '';

function getToken() {
  return localStorage.getItem('token');
}

function getUser() {
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
}

function setAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login.html';
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + getToken()
  };
}

async function apiGet(url) {
  const res = await fetch(API + url, { headers: authHeaders() });
  if (res.status === 401) { logout(); return null; }
  return res.json();
}

async function apiPost(url, data) {
  const res = await fetch(API + url, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  if (res.status === 401) { logout(); return null; }
  return res.json();
}

function updateNav() {
  const user = getUser();
  const nav = document.getElementById('nav-links');
  if (!nav) return;

  if (user) {
    nav.innerHTML = `
      <a href="/index.html" ${location.pathname === '/' || location.pathname === '/index.html' ? 'class="active"' : ''}>Test</a>
      <a href="/dashboard.html" ${location.pathname === '/dashboard.html' ? 'class="active"' : ''}>Kabinet</a>
      <a href="/leaderboard.html" ${location.pathname === '/leaderboard.html' ? 'class="active"' : ''}>Liderlar</a>
      <span style="color:var(--text-secondary);font-size:0.85rem;padding:0 8px">${user.name}</span>
      <button class="btn-logout" onclick="logout()">Chiqish</button>
    `;
  } else {
    nav.innerHTML = `
      <a href="/login.html">Kirish</a>
      <a href="/register.html" class="btn-login">Ro'yxatdan o'tish</a>
    `;
  }
}

document.addEventListener('DOMContentLoaded', updateNav);
