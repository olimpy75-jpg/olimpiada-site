let currentGrade = null;
let quizConfig = null;
const userAnswers = {};

function initQuiz() {
  const params = new URLSearchParams(window.location.search);
  currentGrade = parseInt(params.get('grade'));
  if (!currentGrade || !QUIZ_DATA[currentGrade]) {
    window.location.href = '/';
    return;
  }
  quizConfig = QUIZ_DATA[currentGrade];
  document.getElementById('quiz-title').textContent = quizConfig.title + ' — Olimpiada';
  document.getElementById('grade-badge').textContent = quizConfig.title;
  document.getElementById('max-score').textContent = quizConfig.maxScore.toFixed(1);
  renderQuiz();
}

function renderQuiz() {
  const container = document.getElementById('quiz-container');
  let html = '';

  quizConfig.sections.forEach(sec => {
    html += `<div class="section-header">
      <span class="section-num s${sec.num}">${sec.num}</span>
      <h2>${sec.num}-QISM: ${sec.name}</h2>
      <span class="pts">${sec.pts} ball / savol</span>
    </div>`;

    const qs = quizConfig.questions.filter(q => q.section === sec.num);
    qs.forEach(q => {
      html += renderQuestion(q);
    });
  });

  html += `<div class="submit-section">
    <button class="btn btn-primary" id="check-btn" disabled onclick="checkAll()" style="max-width:400px;margin:0 auto">
      Natijani tekshirish
    </button>
  </div>
  <div id="result-section">
    <h2>Olimpiada natijalari</h2>
    <p class="subtitle">Barcha savollar baholandi</p>
    <div class="big-score" id="final-score">0 / ${quizConfig.maxScore.toFixed(1)}</div>
    <div class="progress-bar"><div class="progress-fill" id="progress-fill" style="width:0%"></div></div>
    <div class="score-detail">
      <div class="item"><div class="val" id="r-correct" style="color:var(--success)">0</div><div class="lbl">To'g'ri</div></div>
      <div class="item"><div class="val" id="r-wrong" style="color:var(--danger)">0</div><div class="lbl">Noto'g'ri</div></div>
      <div class="item"><div class="val" id="r-percent" style="color:var(--primary)">0%</div><div class="lbl">Foiz</div></div>
    </div>
    <div class="result-msg" id="result-msg"></div>
  </div>`;

  container.innerHTML = html;
}

function renderQuestion(q) {
  const cls = q.section === 1 ? 's1' : q.section === 2 ? 's2' : 's3';
  let html = `<div class="question-card" id="q${q.id}">
    <div class="q-header">
      <span class="q-num ${cls}">${q.id}</span>
      <div class="q-text">${escHtml(q.text)}</div>
    </div>`;

  if (q.code) {
    html += `<div class="code-block">${escHtml(q.code)}</div>`;
  }

  if (q.type === 'choice') {
    html += `<div class="options">`;
    q.options.forEach(o => {
      html += `<label class="option" data-q="${q.id}" data-val="${o.l}" onclick="sel(this)">
        <span class="option-letter">${o.l}</span> ${escHtml(o.t)}
      </label>`;
    });
    html += `</div>`;
  } else {
    html += `<div class="text-input-area">
      <input type="text" class="text-answer" data-q="${q.id}" data-answer="${escAttr(q.answer)}" placeholder="Javobni kiriting..." oninput="onTextinput(this)">
    </div>`;
  }

  html += `<div class="comment" id="comment-${q.id}">${escHtml(q.comment)}</div>`;
  html += `</div>`;
  return html;
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;').replace(/\n/g,'<br>');
}

function escAttr(s) {
  return s.replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

function sel(el) {
  const q = el.getAttribute('data-q');
  document.querySelectorAll(`[data-q="${q}"]`).forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  userAnswers[q] = el.getAttribute('data-val');
  checkReady();
}

function onTextinput(el) {
  userAnswers[el.getAttribute('data-q')] = el.value.trim();
  checkReady();
}

function checkReady() {
  const total = quizConfig.questions.length;
  document.getElementById('check-btn').disabled = Object.keys(userAnswers).length < total;
}

function norm(s) { return s.replace(/\s+/g,' ').trim().toLowerCase(); }

function checkAll() {
  let score = 0, correct = 0, wrong = 0;

  quizConfig.questions.forEach(q => {
    const card = document.getElementById('q' + q.id);
    const ua = userAnswers[q.id] || '';

    if (q.type === 'choice') {
      document.querySelectorAll(`[data-q="${q.id}"]`).forEach(o => {
        o.classList.add('disabled');
        const v = o.getAttribute('data-val');
        if (v === q.answer) o.classList.add('correct');
        if (v === ua && v !== q.answer) o.classList.add('wrong');
      });
      if (ua === q.answer) {
        card.classList.add('answered-correct');
        score += q.pts;
        correct++;
      } else {
        card.classList.add('answered-wrong');
        wrong++;
      }
    } else {
      const inp = document.querySelector(`[data-q="${q.id}"].text-answer`);
      inp.disabled = true;
      if (norm(ua) === norm(q.answer)) {
        inp.classList.add('correct-input');
        card.classList.add('answered-correct');
        score += q.pts;
        correct++;
      } else {
        inp.classList.add('wrong-input');
        card.classList.add('answered-wrong');
        wrong++;
      }
    }
    document.getElementById('comment-' + q.id).classList.add('show');
  });

  score = Math.round(score * 10) / 10;

  document.getElementById('check-btn').style.display = 'none';
  const rs = document.getElementById('result-section');
  rs.style.display = 'block';
  document.getElementById('final-score').textContent = score.toFixed(1) + ' / ' + quizConfig.maxScore.toFixed(1);
  document.getElementById('r-correct').textContent = correct;
  document.getElementById('r-wrong').textContent = wrong;
  const pct = ((score / quizConfig.maxScore) * 100).toFixed(0);
  document.getElementById('r-percent').textContent = pct + '%';
  document.getElementById('progress-fill').style.width = pct + '%';

  let msg = '';
  if (pct >= 90) msg = 'Ajoyib natija! Siz haqiqiy chempionsiz!';
  else if (pct >= 70) msg = 'Yaxshi natija! Davom eting!';
  else if (pct >= 50) msg = "O'rtacha natija. Ko'proq mashq qiling!";
  else msg = "Ko'proq o'rganing va qayta urinib ko'ring!";
  document.getElementById('result-msg').textContent = msg;
  rs.scrollIntoView({ behavior: 'smooth' });

  const user = getUser();
  if (user) {
    const parts = { 1: [1, 10], 2: [11, 20], 3: [21, 30] };
    const partScores = {};
    for (const sec of quizConfig.sections) {
      let ps = 0;
      quizConfig.questions.filter(q => q.section === sec.num).forEach(q => {
        const ua = userAnswers[q.id] || '';
        if (q.type === 'choice') {
          if (ua === q.answer) ps += q.pts;
        } else {
          if (norm(ua) === norm(q.answer)) ps += q.pts;
        }
      });
      partScores['part' + sec.num] = Math.round(ps * 10) / 10;
    }

    apiPost('/api/scores', {
      grade: currentGrade,
      part1: partScores.part1 || 0,
      part2: partScores.part2 || 0,
      part3: partScores.part3 || 0,
      total: score,
      answers: userAnswers
    });
  }
}

document.addEventListener('DOMContentLoaded', initQuiz);
