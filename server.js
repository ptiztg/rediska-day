const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// ──────────────────────────────────────────────
// Контент — меняйте через переменные окружения в Railway
// ──────────────────────────────────────────────
const SITE_TITLE   = process.env.SITE_TITLE   || 'Лучший день — сегодня';
const SITE_BRAND   = process.env.SITE_BRAND   || '🌱 rediska';

const THOUGHT_TITLE   = process.env.THOUGHT_TITLE   || 'Мысль дня';
const THOUGHT_CONTENT = process.env.THOUGHT_CONTENT || 'Редиска — это не просто корнеплод. Это состояние души.';

const PARABLE_TITLE   = process.env.PARABLE_TITLE   || 'Притча для раздумий';
const PARABLE_CONTENT = process.env.PARABLE_CONTENT || 'Однажды редиска спросила морковь: «В чём смысл?» Морковь промолчала. Мораль: <strong>редиска всегда права.</strong>';

const PRACTICE_TITLE   = process.env.PRACTICE_TITLE   || 'Практика дня';
const PRACTICE_CONTENT = process.env.PRACTICE_CONTENT || 'Возьми редиску. Посмотри на неё. Подумай, кто из вас краснеет больше.';

const PAST_WEEK_TITLE   = process.env.PAST_WEEK_TITLE   || 'Прошлая неделя';
const PAST_WEEK_CONTENT = process.env.PAST_WEEK_CONTENT || 'На прошлой неделе редиска тоже была права. Но ты, возможно, ещё не знал.';

// ──────────────────────────────────────────────

function getDateString() {
  return new Date().toLocaleDateString('ru-RU', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

const html = () => `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${SITE_TITLE}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', sans-serif;
      min-height: 100vh;
      background: radial-gradient(ellipse at 60% 20%, #1a3a6e 0%, #0a1628 50%, #050d1a 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #fff;
      overflow-x: hidden;
      position: relative;
    }

    /* Stars */
    .stars { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
    .star {
      position: absolute;
      background: #fff;
      border-radius: 50%;
      animation: twinkle var(--d, 3s) ease-in-out infinite alternate;
    }
    @keyframes twinkle { from { opacity: 0.2; transform: scale(1); } to { opacity: 1; transform: scale(1.4); } }

    /* Brand */
    .brand {
      position: relative; z-index: 1;
      font-size: 1.6rem; font-weight: 700;
      letter-spacing: 0.05em;
      margin-bottom: 2rem;
      color: #fff;
      text-shadow: 0 0 20px rgba(100,160,255,0.6);
    }

    /* Card */
    .card {
      position: relative; z-index: 1;
      background: rgba(10, 30, 70, 0.85);
      border: 1px solid rgba(180, 140, 60, 0.5);
      border-radius: 20px;
      padding: 2.5rem 2rem 2rem;
      max-width: 680px;
      width: 90%;
      text-align: center;
      box-shadow: 0 0 60px rgba(0,50,150,0.3), inset 0 0 40px rgba(0,20,80,0.2);
    }

    .card h1 {
      font-size: clamp(1.6rem, 4vw, 2.4rem);
      font-weight: 700;
      margin-bottom: 0.4rem;
      line-height: 1.2;
    }

    .card .date {
      font-size: 0.85rem;
      color: rgba(255,255,255,0.55);
      margin-bottom: 2rem;
      text-transform: capitalize;
    }

    /* Buttons row */
    .btn-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      justify-content: center;
      margin-bottom: 1.25rem;
    }

    .btn {
      background: rgba(60, 100, 200, 0.55);
      border: 1px solid rgba(100, 150, 255, 0.35);
      color: #fff;
      font-size: 0.95rem;
      font-weight: 500;
      padding: 0.65rem 1.4rem;
      border-radius: 999px;
      cursor: pointer;
      transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
    }
    .btn:hover {
      background: rgba(80, 130, 255, 0.7);
      transform: translateY(-1px);
      box-shadow: 0 4px 20px rgba(80,130,255,0.3);
    }

    .divider {
      width: 50%; height: 1px;
      background: rgba(255,255,255,0.15);
      margin: 0 auto 1.25rem;
    }

    /* Modal */
    .overlay {
      display: none;
      position: fixed; inset: 0; z-index: 100;
      background: rgba(0,0,20,0.75);
      backdrop-filter: blur(4px);
      align-items: center;
      justify-content: center;
    }
    .overlay.open { display: flex; }

    .modal {
      background: linear-gradient(145deg, #0d2050, #0a1835);
      border: 1px solid rgba(180,140,60,0.4);
      border-radius: 16px;
      padding: 2rem;
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      position: relative;
      box-shadow: 0 20px 60px rgba(0,0,0,0.6);
      animation: popIn 0.25s ease;
    }
    @keyframes popIn { from { opacity:0; transform:scale(0.93) translateY(10px);} to { opacity:1; transform:scale(1) translateY(0);} }

    .modal h2 {
      font-size: 1.6rem; font-weight: 700;
      margin-bottom: 1.25rem;
      color: #fff;
    }
    .modal p {
      line-height: 1.75;
      color: rgba(255,255,255,0.85);
      margin-bottom: 1rem;
      font-size: 1rem;
    }
    .close-btn {
      position: absolute; top: 1rem; right: 1rem;
      background: none; border: none; color: #fff;
      font-size: 1.4rem; cursor: pointer; opacity: 0.6; line-height: 1;
    }
    .close-btn:hover { opacity: 1; }

    .modal-footer {
      text-align: center;
      margin-top: 1.5rem;
      font-size: 0.8rem;
      color: rgba(255,255,255,0.35);
    }
  </style>
</head>
<body>

<!-- Stars -->
<div class="stars" id="stars"></div>

<div class="brand">${SITE_BRAND}</div>

<div class="card">
  <h1>${SITE_TITLE}</h1>
  <p class="date">${getDateString()}</p>

  <div class="btn-row">
    <button class="btn" onclick="open('thought')">${THOUGHT_TITLE}</button>
    <button class="btn" onclick="open('parable')">${PARABLE_TITLE}</button>
    <button class="btn" onclick="open('practice')">${PRACTICE_TITLE}</button>
  </div>

  <div class="divider"></div>

  <div class="btn-row">
    <button class="btn" onclick="open('pastweek')">${PAST_WEEK_TITLE}</button>
  </div>
</div>

<!-- Modals -->
<div class="overlay" id="thought-modal" onclick="close('thought')">
  <div class="modal" onclick="event.stopPropagation()">
    <button class="close-btn" onclick="close('thought')">×</button>
    <h2>${THOUGHT_TITLE}</h2>
    <p>${THOUGHT_CONTENT}</p>
    <div class="modal-footer">Июнь, ${new Date().getFullYear()}</div>
  </div>
</div>

<div class="overlay" id="parable-modal" onclick="close('parable')">
  <div class="modal" onclick="event.stopPropagation()">
    <button class="close-btn" onclick="close('parable')">×</button>
    <h2>${PARABLE_TITLE}</h2>
    <p>${PARABLE_CONTENT}</p>
    <div class="modal-footer">Июнь, ${new Date().getFullYear()}</div>
  </div>
</div>

<div class="overlay" id="practice-modal" onclick="close('practice')">
  <div class="modal" onclick="event.stopPropagation()">
    <button class="close-btn" onclick="close('practice')">×</button>
    <h2>${PRACTICE_TITLE}</h2>
    <p>${PRACTICE_CONTENT}</p>
    <div class="modal-footer">Июнь, ${new Date().getFullYear()}</div>
  </div>
</div>

<div class="overlay" id="pastweek-modal" onclick="close('pastweek')">
  <div class="modal" onclick="event.stopPropagation()">
    <button class="close-btn" onclick="close('pastweek')">×</button>
    <h2>${PAST_WEEK_TITLE}</h2>
    <p>${PAST_WEEK_CONTENT}</p>
    <div class="modal-footer">Июнь, ${new Date().getFullYear()}</div>
  </div>
</div>

<script>
  // Stars
  const container = document.getElementById('stars');
  for (let i = 0; i < 80; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const size = Math.random() * 2.5 + 0.5;
    s.style.cssText = \`
      width:\${size}px; height:\${size}px;
      top:\${Math.random()*100}%;
      left:\${Math.random()*100}%;
      --d:\${(Math.random()*3+2).toFixed(1)}s;
      animation-delay:\${(Math.random()*3).toFixed(1)}s;
    \`;
    container.appendChild(s);
  }

  // Diamond stars (★)
  for (let i = 0; i < 8; i++) {
    const s = document.createElement('div');
    s.style.cssText = \`
      position:absolute;
      font-size:\${Math.random()*10+8}px;
      top:\${Math.random()*90}%;
      left:\${Math.random()*95}%;
      color:rgba(255,220,100,0.7);
      animation: twinkle \${(Math.random()*2+2).toFixed(1)}s ease-in-out infinite alternate;
      animation-delay:\${(Math.random()*2).toFixed(1)}s;
    \`;
    s.textContent = '✦';
    container.appendChild(s);
  }

  // Modal control
  function open(id) {
    document.getElementById(id + '-modal').classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close(id) {
    document.getElementById(id + '-modal').classList.remove('open');
    document.body.style.overflow = '';
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      ['thought','parable','practice','pastweek'].forEach(close);
    }
  });
</script>
</body>
</html>`;

app.get('/', (req, res) => {
  res.send(html());
});

app.listen(PORT, () => {
  console.log(`🌱 Rediska server running on port ${PORT}`);
  console.log('Content loaded from env vars (or defaults).');
});
