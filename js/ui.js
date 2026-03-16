// =============================================
// js/ui.js - 공통 UI 헬퍼 함수
// =============================================

// ── 화면 전환 ──────────────────────────────

/**
 * 특정 화면을 표시하고 나머지를 숨김
 * @param {string} screenId - 표시할 화면 ID
 */
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(el => {
    el.classList.add('hidden');
  });
  const target = document.getElementById(screenId);
  if (target) {
    target.classList.remove('hidden');
    target.classList.add('slide-in');
    setTimeout(() => target.classList.remove('slide-in'), 400);
  }
}

// ── 피드백 메시지 ──────────────────────────

/**
 * 피드백 메시지 표시
 * @param {string} text - 메시지 텍스트
 * @param {string} type - 'correct' | 'wrong' | 'info'
 */
function showMessage(text, type = 'info') {
  const el = document.getElementById('feedback-message');
  if (!el) return;

  el.textContent = text;
  el.className = 'feedback-message ' + type;
  el.style.display = 'block';
  el.style.opacity = '1';

  clearTimeout(el._hideTimer);
  el._hideTimer = setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => { el.style.display = 'none'; }, 300);
  }, 1400);
}

// ── 파티클 효과 ────────────────────────────

/**
 * 파티클(폭죽) 생성
 * @param {number} x - 화면 X 좌표
 * @param {number} y - 화면 Y 좌표
 */
function createParticles(x, y) {
  const colors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF6BFF', '#FF9F43'];
  const container = document.getElementById('particle-container');
  if (!container) return;

  for (let i = 0; i < 18; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    const color = colors[Math.floor(Math.random() * colors.length)];
    const angle = (Math.PI * 2 * i) / 18;
    const distance = 60 + Math.random() * 80;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    const size = 8 + Math.random() * 8;

    particle.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%);
      transition: transform 0.6s ease-out, opacity 0.6s ease-out;
    `;
    container.appendChild(particle);

    requestAnimationFrame(() => {
      particle.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
      particle.style.opacity = '0';
    });

    setTimeout(() => particle.remove(), 700);
  }
}

/**
 * 요소 중앙에서 파티클 생성
 * @param {HTMLElement} el
 */
function createParticlesFromElement(el) {
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  createParticles(x, y);
}

// ── 애니메이션 헬퍼 ────────────────────────

/**
 * 요소 흔들기 (오답 피드백)
 * @param {HTMLElement} el
 */
function shakeElement(el) {
  if (!el) return;
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
  setTimeout(() => el.classList.remove('shake'), 500);
}

/**
 * 요소 팝 애니메이션 (정답 피드백)
 * @param {HTMLElement} el
 */
function popElement(el) {
  if (!el) return;
  el.classList.remove('pop');
  void el.offsetWidth;
  el.classList.add('pop');
  setTimeout(() => el.classList.remove('pop'), 400);
}

/**
 * 요소 bounce-in 애니메이션
 * @param {HTMLElement} el
 */
function bounceIn(el) {
  if (!el) return;
  el.classList.remove('bounce-in');
  void el.offsetWidth;
  el.classList.add('bounce-in');
  setTimeout(() => el.classList.remove('bounce-in'), 500);
}

// ── 진행 바 ────────────────────────────────

/**
 * 진행 바 업데이트
 * @param {number} current - 현재 진행 수
 * @param {number} total   - 전체 수
 */
function updateProgressBar(current, total) {
  const bar = document.getElementById('progress-bar');
  const text = document.getElementById('progress-text');
  if (bar) {
    const pct = total > 0 ? (current / total) * 100 : 0;
    bar.style.width = pct + '%';
  }
  if (text) {
    text.textContent = `${current} / ${total}`;
  }
}

// ── 타이머 표시 ────────────────────────────

/**
 * 타이머 표시 업데이트
 * @param {number} seconds - 남은 초
 */
function updateTimer(seconds) {
  const el = document.getElementById('timer-display');
  if (!el) return;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  el.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

  if (seconds <= 10) {
    el.classList.add('timer-warning');
  } else {
    el.classList.remove('timer-warning');
  }
}

// ── 점수 표시 ──────────────────────────────

/**
 * 점수 표시 업데이트
 * @param {number} score
 */
function updateScore(score) {
  const el = document.getElementById('score-display');
  if (el) el.textContent = score.toLocaleString();
}

/**
 * WPM 표시 업데이트
 * @param {number} wpm
 */
function updateWPM(wpm) {
  const el = document.getElementById('wpm-display');
  if (el) el.textContent = wpm;
}

/**
 * 정확도 표시 업데이트
 * @param {number} accuracy
 */
function updateAccuracy(accuracy) {
  const el = document.getElementById('accuracy-display');
  if (el) el.textContent = accuracy + '%';
}

// ── 목숨 표시 ──────────────────────────────

/**
 * 목숨 UI 업데이트
 * @param {number} lives - 남은 목숨 수
 */
function updateLivesDisplay(lives) {
  const el = document.getElementById('lives-display');
  if (!el) return;
  el.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const heart = document.createElement('span');
    heart.className = 'heart ' + (i < lives ? 'alive' : 'dead');
    heart.textContent = i < lives ? '❤️' : '🖤';
    el.appendChild(heart);
  }
}

// ── 결과 화면 ──────────────────────────────

/**
 * 결과 화면 렌더링
 * @param {object} stats - { score, wpm, accuracy, correct, wrong, isNewRecord, mode, level }
 */
function showResult(stats) {
  showScreen('result-screen');

  // 별점
  const stars = calcStars(stats.accuracy, stats.wpm);
  const starEl = document.getElementById('result-stars');
  if (starEl) {
    starEl.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const s = document.createElement('span');
      s.className = 'star ' + (i < stars ? 'filled' : 'empty');
      s.textContent = i < stars ? '⭐' : '☆';
      starEl.appendChild(s);
    }
  }

  // 통계
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setVal('result-score', (stats.score || 0).toLocaleString() + '점');
  setVal('result-wpm', stats.wpm || 0);
  setVal('result-accuracy', (stats.accuracy || 0) + '%');
  setVal('result-correct', stats.correct || 0);
  setVal('result-wrong', stats.wrong || 0);

  // 신기록 배너
  const newRecordEl = document.getElementById('new-record-banner');
  if (newRecordEl) {
    newRecordEl.style.display = stats.isNewRecord ? 'block' : 'none';
    if (stats.isNewRecord) popElement(newRecordEl);
  }

  // 최고 점수 표시 (stats.mode는 scoreKey 형식: 'korean_word' 등)
  if (stats.mode && stats.level) {
    const hs = getHighScore(stats.mode, stats.level);
    setVal('result-highscore', (hs.score || 0).toLocaleString() + '점');
  }

  // 다음 레벨 버튼 표시 여부
  const nextBtn = document.getElementById('btn-next-level');
  if (nextBtn) {
    const levels = ['easy', 'medium', 'hard'];
    const hasNext = levels.indexOf(stats.level) < levels.length - 1;
    nextBtn.style.display = hasNext ? 'inline-flex' : 'none';
  }

  // 결과 화면 진입 시 파티클
  if (stars >= 2) {
    setTimeout(() => {
      createParticles(window.innerWidth / 2, window.innerHeight / 3);
    }, 300);
    if (stars === 3) {
      setTimeout(() => {
        createParticles(window.innerWidth / 4, window.innerHeight / 2);
        createParticles(window.innerWidth * 3 / 4, window.innerHeight / 2);
      }, 600);
    }
  }
}

// ── 콤보 표시 ──────────────────────────────

/**
 * 콤보 표시 업데이트
 * @param {number} combo
 */
function updateComboDisplay(combo) {
  const el = document.getElementById('combo-display');
  if (!el) return;
  if (combo >= 3) {
    el.textContent = `🔥 ${combo} 콤보!`;
    el.style.display = 'block';
    popElement(el);
  } else {
    el.style.display = 'none';
  }
}

// ── 메인 메뉴 최고점수 ─────────────────────

/**
 * 메인 메뉴의 최고 점수 표시 업데이트
 */
function updateMainMenuHighScore() {
  const el = document.getElementById('main-highscore');
  if (el) {
    const subject = (typeof AppState !== 'undefined') ? AppState.currentSubject : 'korean';
    const score = getSubjectHighScore ? getSubjectHighScore(subject) : getOverallHighScore();
    el.textContent = score > 0 ? score.toLocaleString() + '점' : '없음';
  }
}

// ── 입력창 상태 ────────────────────────────

/**
 * 입력창 상태 설정
 * @param {string} state - 'correct' | 'wrong' | 'normal'
 */
function setInputState(state) {
  const input = document.getElementById('typing-input');
  if (!input) return;
  input.classList.remove('correct', 'wrong');
  if (state !== 'normal') input.classList.add(state);
}

/**
 * 입력창 초기화 및 포커스
 */
function clearAndFocusInput() {
  const input = document.getElementById('typing-input');
  if (!input) return;
  input.value = '';
  input.classList.remove('correct', 'wrong');
  setTimeout(() => input.focus(), 50);
}
