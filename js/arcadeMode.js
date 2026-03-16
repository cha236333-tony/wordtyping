// =============================================
// js/arcadeMode.js - 받아쓰기 아케이드 모드
// 🎈 풍선/열기구가 하늘에서 떠오르고 대포로 맞추는 테마
// =============================================

const ArcadeMode = (() => {
  // ── 상태 ──────────────────────────────────
  let state = {
    level: 'easy',
    scoreKey: 'korean_arcade',
    wordPool: [],
    fallingWords: [],
    lives: 3,
    score: 0,
    correctCount: 0,
    wrongCount: 0,
    combo: 0,
    maxCombo: 0,
    totalChars: 0,
    timeLimit: 180,   // BUG2 수정: 하드코딩 60 → 기본값 180, start()에서 LEVEL_INFO로 덮어씀
    elapsedSeconds: 0,
    timerInterval: null,
    spawnInterval: null,
    animFrameId: null,
    lastTimestamp: null,
    isActive: false,
    wordIdCounter: 0,
    isComposing: false,
    isTimesTable: false,
    speedMultiplier: 0.24,  // 속도 배율 (기존 0.2에서 20% 상향)
    cannonAngle: 0,         // 대포 각도 (애니메이션용)
    lastFiredId: null,      // 마지막으로 맞춘 단어 ID
    isPaused: false         // 일시정지 상태
  };

  // 풍선/열기구 이모지 목록
  const TARGET_EMOJIS = ['🎈', '🪂', '🚁'];

  // 레벨별 기본 설정
  const LEVEL_CONFIG = {
    easy: { spawnMs: 3200, minSpeed: 0.2, maxSpeed: 0.4, maxWords: 3 },
    medium: { spawnMs: 2400, minSpeed: 0.35, maxSpeed: 0.6, maxWords: 4 },
    hard: { spawnMs: 1800, minSpeed: 0.55, maxSpeed: 0.85, maxWords: 5 }
  };

  // ── 시작 ──────────────────────────────────

  function start(level, scoreKey) {
    state.level = level || 'easy';
    state.scoreKey = scoreKey || 'korean_arcade';
    
    // 현재 과목 데이터 강제 동기화
    setSubject(AppState.currentSubject);
    
    state.isTimesTable = isTimesTableMode();
    state.wordPool = getWords(state.level);
    
    // BUG3 수정: wordPool이 비어있으면 fallback
    if (!state.wordPool || state.wordPool.length === 0) {
      state.wordPool = getWords('all'); // 구구단이면 전체, 아니면 easy
    }
    state.fallingWords = [];
    state.lives = 3;
    state.score = 0;
    state.correctCount = 0;
    state.wrongCount = 0;
    state.combo = 0;
    state.maxCombo = 0;
    state.totalChars = 0;
    state.elapsedSeconds = 0;
    state.isActive = true;
    state.wordIdCounter = 0;
    state.lastTimestamp = null;
    state.lastFiredId = null;

    // BUG2 수정: LEVEL_INFO에서 timeLimit 읽기
    const levelInfo = LEVEL_INFO[state.level];
    state.timeLimit = levelInfo ? levelInfo.timeLimit : 180;

    // 속도 슬라이더를 최하위(min)로 초기화
    const slider = document.getElementById('speed-slider');
    if (slider) slider.value = slider.min;
    state.speedMultiplier = slider ? parseFloat(slider.value) : 0.24;

    state.isPaused = false;
    showScreen('game-screen');
    setupArcadeUI();
    setupInputListeners();
    setupSpeedSlider();
    clearAndFocusInput();

    startTimer();

    const cfg = LEVEL_CONFIG[state.level] || LEVEL_CONFIG['easy'];
    spawnBalloon();
    state.spawnInterval = setInterval(() => {
      if (state.isActive && !state.isPaused && state.fallingWords.length < (cfg.maxWords || 3)) {
        spawnBalloon();
      }
    }, cfg.spawnMs || 3000);

    state.animFrameId = requestAnimationFrame(gameLoop);
  }

  // ── UI 초기화 ─────────────────────────────

  function setupArcadeUI() {
    const subjectInfo = SUBJECT_INFO[AppState.currentSubject] || {};

    const modeLabel = document.getElementById('game-mode-label');
    if (modeLabel) modeLabel.textContent = state.isTimesTable ? '구구단 게임 🎈' : '게임 모드 🎈';

    const levelLabel = document.getElementById('game-level-label');
    if (levelLabel) {
      if (state.isTimesTable && !isNaN(state.level)) {
        levelLabel.textContent = `🔢 ${state.level}단`;
      } else if (state.isTimesTable && state.level === 'all') {
        levelLabel.textContent = `🌟 전체`;
      } else {
        const li = LEVEL_INFO[state.level];
        levelLabel.textContent = li ? `${li.emoji} ${li.name}` : '';
      }
    }

    const subjectBadge = document.getElementById('game-subject-badge');
    if (subjectBadge) {
      subjectBadge.textContent = `${subjectInfo.emoji || ''} ${subjectInfo.name || ''}`;
      subjectBadge.style.background = subjectInfo.color || '#FF7043';
    }

    const livesEl = document.getElementById('lives-display');
    if (livesEl) livesEl.style.display = 'flex';
    updateLivesDisplay(state.lives);

    // 단어 카드 숨기기 및 입력 영역 배치 조정
    const wordCard = document.querySelector('.word-card');
    if (wordCard) wordCard.style.display = 'none';

    const gameMain = document.querySelector('.game-main');
    if (gameMain) gameMain.style.justifyContent = 'flex-end';

    const inputArea = document.querySelector('.input-area');
    if (inputArea) {
      inputArea.style.display = 'flex';
      inputArea.style.zIndex = '100';
      inputArea.style.marginBottom = '20px';
    }

    // 아케이드 영역 표시
    const arcadeArea = document.getElementById('arcade-area');
    if (arcadeArea) {
      arcadeArea.style.display = 'block';
      arcadeArea.innerHTML = '';
      // 대포 추가
      arcadeArea.appendChild(createCannonElement());
      // 땅 장식
      arcadeArea.appendChild(createGroundElement());
    }

    // 진행 바 숨기기
    const progressEl = document.getElementById('progress-container');
    if (progressEl) progressEl.style.display = 'none';

    // 속도 슬라이더 표시
    const speedControl = document.getElementById('speed-control');
    if (speedControl) speedControl.style.display = 'flex';

    const inp = document.getElementById('typing-input');
    if (inp) inp.placeholder = state.isTimesTable ? '답을 입력하고 Enter 🎯' : '단어를 입력하고 Enter 🎯';

    updateScore(0);
    updateTimer(state.timeLimit);
    updateLivesDisplay(3);
    updateComboDisplay(0);
  }

  // ── 대포 DOM 생성 ─────────────────────────

  function createCannonElement() {
    const cannon = document.createElement('div');
    cannon.id = 'arcade-cannon';
    cannon.className = 'arcade-cannon';
    cannon.innerHTML = `
      <div class="cannon-base">🏰</div>
      <div class="cannon-barrel" id="cannon-barrel">💣</div>
    `;
    return cannon;
  }

  function createGroundElement() {
    const ground = document.createElement('div');
    ground.className = 'arcade-ground';
    ground.innerHTML = '🌳🌿🌱🌿🌳🌿🌱🌿🌳🌿🌱🌿🌳🌿🌱🌿🌳';
    return ground;
  }

  // ── 풍선/열기구 스폰 ──────────────────────

  function spawnBalloon() {
    if (!state.isActive) return;
    // BUG3 수정: wordPool이 비어있으면 스폰하지 않음
    if (!state.wordPool || state.wordPool.length === 0) return;

    const cfg = LEVEL_CONFIG[state.level];
    const wordObj = state.wordPool[Math.floor(Math.random() * state.wordPool.length)];
    // BUG3 수정: wordObj가 undefined이면 스폰하지 않음
    if (!wordObj) return;
    const id = 'fw_' + (++state.wordIdCounter);

    // X 위치: 겹치지 않도록 최대 5번 시도
    let xPercent = 5 + Math.random() * 75;
    for (let i = 0; i < 5; i++) {
      const tooClose = state.fallingWords.some(fw => {
        // 화면 위쪽(y < 150)에 있는 단어들과 X축 거리가 15% 이내면 겹침으로 간주
        return fw.y < 150 && Math.abs(fw.x - xPercent) < 15;
      });
      if (!tooClose) break;
      xPercent = 5 + Math.random() * 75;
    }

    const baseSpeed = cfg.minSpeed + Math.random() * (cfg.maxSpeed - cfg.minSpeed);
    // BUG1 수정: speedMultiplier는 여기서만 곱함 (updateBalloons에서 중복 적용 제거)
    const speed = baseSpeed * state.speedMultiplier;

    // 풍선 이모지 랜덤 선택
    const balloonEmoji = TARGET_EMOJIS[Math.floor(Math.random() * TARGET_EMOJIS.length)];

    const el = document.createElement('div');
    el.className = 'falling-word balloon-target';
    el.id = id;

    if (state.isTimesTable) {
      el.innerHTML = `
        <div class="balloon-emoji">${balloonEmoji}</div>
        <div class="balloon-card">
          <div class="fw-text">${wordObj.question || wordObj.display}</div>
        </div>
        <div class="balloon-string">|</div>
      `;
      el.dataset.answer = wordObj.answer;
    } else {
      el.innerHTML = `
        <div class="balloon-emoji">${balloonEmoji}</div>
        <div class="balloon-card">
          <div class="fw-emoji-small">${wordObj.emoji || '📝'}</div>
          <div class="fw-text">${wordObj.word}</div>
        </div>
        <div class="balloon-string">|</div>
      `;
    }

    el.style.left = xPercent + '%';
    el.style.top = '-120px';

    const arcadeArea = document.getElementById('arcade-area');
    if (!arcadeArea) return;
    arcadeArea.appendChild(el);

    state.fallingWords.push({
      id,
      word: wordObj.word,
      answer: wordObj.answer || wordObj.word,
      question: wordObj.question || wordObj.word,
      emoji: wordObj.emoji,
      balloonEmoji,
      x: xPercent,
      y: -120,
      speed,
      element: el
    });
  }

  // ── 게임 루프 ─────────────────────────────

  function gameLoop(timestamp) {
    if (!state.isActive) return;
    if (state.isPaused) {
      state.lastTimestamp = timestamp; // 일시정지 중 시간 흐름 차단
      state.animFrameId = requestAnimationFrame(gameLoop);
      return;
    }
    if (!state.lastTimestamp) state.lastTimestamp = timestamp;
    const delta = timestamp - state.lastTimestamp;
    state.lastTimestamp = timestamp;
    updateBalloons(delta);
    state.animFrameId = requestAnimationFrame(gameLoop);
  }

  function updateBalloons(delta) {
    const area = document.getElementById('arcade-area');
    if (!area) return;
    const areaHeight = area.clientHeight || 500;
    const groundHeight = 48; // 땅 높이
    const toRemove = [];

    state.fallingWords.forEach(fw => {
      // BUG1 수정: speedMultiplier를 spawnBalloon()에서 이미 적용했으므로 여기서는 제거
      fw.y += fw.speed * (delta / 16.67);
      if (fw.element) fw.element.style.top = fw.y + 'px';
      // 땅(바닥 - groundHeight)에 닿으면 놓침
      if (fw.y >= areaHeight - groundHeight - 60) {
        toRemove.push(fw);
      }
    });

    toRemove.forEach(fw => onBalloonMissed(fw));
  }

  // ── 속도 슬라이더 ─────────────────────────

  function setupSpeedSlider() {
    const slider = document.getElementById('speed-slider');
    const label = document.getElementById('speed-label');
    if (!slider) return;

    slider.addEventListener('input', () => {
      const prevMultiplier = state.speedMultiplier;
      state.speedMultiplier = parseFloat(slider.value);
      if (label) {
        const pct = Math.round(state.speedMultiplier * 100);
        label.textContent = `속도: ${pct}%`;
      }
      // BUG1 수정: 기존 단어들의 속도를 비율로 재계산 (랜덤 재생성 대신 비율 조정)
      // fw.speed는 이미 이전 speedMultiplier가 적용된 값이므로, 비율로 조정
      if (prevMultiplier > 0) {
        state.fallingWords.forEach(fw => {
          fw.speed = fw.speed / prevMultiplier * state.speedMultiplier;
        });
      }
    });

    // 초기 라벨
    if (label) {
      const pct = Math.round(state.speedMultiplier * 100);
      label.textContent = `속도: ${pct}%`;
    }
  }

  // ── 입력 처리 ─────────────────────────────

  function setupInputListeners() {
    const input = document.getElementById('typing-input');
    if (!input) return;

    const newInput = input.cloneNode(true);
    input.parentNode.replaceChild(newInput, input);
    const inp = document.getElementById('typing-input');

    inp.addEventListener('compositionstart', () => { state.isComposing = true; });
    inp.addEventListener('compositionend', () => { state.isComposing = false; });

    inp.addEventListener('keydown', (e) => {
      if (!state.isActive) return;

      // 스페이스바: 일시정지 토글 (입력창이 비어있을 때만)
      if (e.key === ' ' && inp.value.trim() === '') {
        e.preventDefault();
        togglePause();
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        const val = inp.value.trim();
        if (val) {
          checkWordMatch(val);
          inp.value = '';
          state.fallingWords.forEach(fw => {
            if (fw.element) fw.element.classList.remove('highlighted');
          });
        }
      }
    });

    // 실시간 하이라이트 기능 제거 (사용자 요청)
    // inp.addEventListener('input', (e) => {
    //   if (!state.isActive) return;
    //   highlightMatchingBalloon(e.target.value.trim());
    // });
  }

  function checkWordMatch(input) {
    if (!state.isActive) return;

    const matched = state.isTimesTable
      ? state.fallingWords.find(fw => fw.answer === input)
      : state.fallingWords.find(fw => fw.word === input);

    if (matched) {
      onBalloonHit(matched);
    } else {
      state.wrongCount++;
      state.combo = 0;
      updateComboDisplay(0);
      setInputState('wrong');
      showMessage('❌ 없는 단어예요!', 'wrong');
      const inp = document.getElementById('typing-input');
      shakeElement(inp);
      // 대포 흔들기
      animateCannon(false);
      setTimeout(() => setInputState('normal'), 500);
    }
  }

  function highlightMatchingBalloon(input) {
    if (!input) {
      state.fallingWords.forEach(fw => {
        if (fw.element) fw.element.classList.remove('highlighted');
      });
      return;
    }
    state.fallingWords.forEach(fw => {
      if (!fw.element) return;
      const target = state.isTimesTable ? fw.answer : fw.word;
      fw.element.classList.toggle('highlighted', target.startsWith(input));
    });
  }

  // ── 정답/오답 처리 ────────────────────────

  function onBalloonHit(fw) {
    state.correctCount++;
    state.combo++;
    if (state.combo > state.maxCombo) state.maxCombo = state.combo;
    state.totalChars += (state.isTimesTable ? fw.answer : fw.word).length;

    const baseScore = 100;
    const comboBonus = state.combo >= 3 ? state.combo * 10 : 0;
    state.score += baseScore + comboBonus;

    updateScore(state.score);
    updateComboDisplay(state.combo);

    // 대포 발사 애니메이션
    animateCannon(true, fw);

    // 풍선 터지기 이펙트
    if (fw.element) {
      const rect = fw.element.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      triggerBalloonPop(cx, cy, fw.balloonEmoji);
      fw.element.classList.add('balloon-popping');
    }

    setInputState('correct');
    // showMessage 제거 (사용자 요청)

    removeWord(fw.id, true);
    setTimeout(() => setInputState('normal'), 300);
  }

  function onBalloonMissed(fw) {
    state.lives--;
    state.combo = 0;
    updateComboDisplay(0);
    updateLivesDisplay(state.lives);

    if (fw.element) fw.element.classList.add('missed');

    const missedWord = state.isTimesTable
      ? `${fw.question} = ${fw.answer}`
      : fw.word;
    showMessage(`💔 놓쳤어요! [${missedWord}] 목숨 ${state.lives}개 남음`, 'wrong');

    removeWord(fw.id, false);

    if (state.lives <= 0) {
      setTimeout(() => end(), 600);
    }
  }

  function removeWord(wordId, success) {
    const idx = state.fallingWords.findIndex(fw => fw.id === wordId);
    if (idx === -1) return;
    const fw = state.fallingWords[idx];
    if (fw.element) {
      setTimeout(() => {
        if (fw.element && fw.element.parentNode) {
          fw.element.parentNode.removeChild(fw.element);
        }
      }, success ? 350 : 500);
    }
    state.fallingWords.splice(idx, 1);
  }

  // ── 대포 발사 애니메이션 ──────────────────

  function animateCannon(success, fw) {
    const barrel = document.getElementById('cannon-barrel');
    if (!barrel) return;

    if (success && fw) {
      // 대포를 풍선 방향으로 조준
      const area = document.getElementById('arcade-area');
      const cannon = document.getElementById('arcade-cannon');
      if (area && cannon && fw.element) {
        const areaRect = area.getBoundingClientRect();
        const fwRect = fw.element.getBoundingClientRect();
        const cannonRect = cannon.getBoundingClientRect();
        const dx = (fwRect.left + fwRect.width / 2) - (cannonRect.left + cannonRect.width / 2);
        const dy = (fwRect.top + fwRect.height / 2) - (cannonRect.top + cannonRect.height / 2);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        barrel.style.transform = `rotate(${angle}deg)`;
      }

      barrel.textContent = '💥';
      setTimeout(() => { barrel.textContent = '💣'; barrel.style.transform = ''; }, 400);
    } else {
      // 오답: 흔들기
      barrel.textContent = '😵';
      setTimeout(() => { barrel.textContent = '💣'; }, 400);
    }
  }

  // ── 풍선 터지기 이펙트 ────────────────────

  function triggerBalloonPop(x, y, balloonEmoji) {
    createParticles(x, y);

    const container = document.getElementById('particle-container');
    if (!container) return;

    // 풍선 조각 파티클
    const pieces = ['💥', '✨', '🌟', '⭐', balloonEmoji || '🎈'];
    for (let i = 0; i < 8; i++) {
      const el = document.createElement('div');
      el.className = 'emoji-particle';
      el.textContent = pieces[i % pieces.length];
      const angle = (Math.PI * 2 * i) / 8;
      const dist = 50 + Math.random() * 60;
      el.style.cssText = `
        position: fixed;
        left: ${x}px; top: ${y}px;
        font-size: ${18 + Math.random() * 14}px;
        pointer-events: none; z-index: 9999;
        transform: translate(-50%, -50%);
        transition: transform 0.55s ease-out, opacity 0.55s ease-out;
      `;
      container.appendChild(el);
      requestAnimationFrame(() => {
        el.style.transform = `translate(calc(-50% + ${Math.cos(angle) * dist}px), calc(-50% + ${Math.sin(angle) * dist}px))`;
        el.style.opacity = '0';
      });
      setTimeout(() => el.remove(), 650);
    }
  }

  // ── 타이머 ────────────────────────────────

  function startTimer() {
    clearInterval(state.timerInterval);
    state.elapsedSeconds = 0;
    state.timerInterval = setInterval(() => {
      if (state.isPaused) return; // 일시정지 시 타이머 중지
      state.elapsedSeconds++;
      const remaining = Math.max(0, state.timeLimit - state.elapsedSeconds);
      updateTimer(remaining);
      if (remaining <= 0) end();
    }, 1000);
  }

  // ── 일시정지 ──────────────────────────────

  function togglePause() {
    if (!state.isActive) return;
    state.isPaused = !state.isPaused;

    if (state.isPaused) {
      showMessage('⏸️ 일시정지 (스페이스로 재시작)', 'info');
      // 화이트 아웃 효과 등 원하면 추가 가능
      const area = document.getElementById('arcade-area');
      if (area) area.style.opacity = '0.5';
    } else {
      showMessage('▶️ 게임 재개!', 'correct');
      const area = document.getElementById('arcade-area');
      if (area) area.style.opacity = '1';
      clearAndFocusInput();
    }
  }

  function stopTimer() { clearInterval(state.timerInterval); state.timerInterval = null; }
  function stopSpawn() { clearInterval(state.spawnInterval); state.spawnInterval = null; }
  function stopGameLoop() {
    if (state.animFrameId) { cancelAnimationFrame(state.animFrameId); state.animFrameId = null; }
  }

  // ── 종료 ──────────────────────────────────

  function end() {
    if (!state.isActive) return;
    state.isActive = false;
    stopTimer(); stopSpawn(); stopGameLoop();
    clearArcadeArea();

    const elapsed = state.elapsedSeconds || 1;
    const wpm = calcWPM(state.totalChars, elapsed);
    const total = state.correctCount + state.wrongCount;
    const accuracy = calcAccuracy(state.correctCount, total || 1);
    const finalScore = calculateScore(
      state.correctCount, state.wrongCount, elapsed, state.maxCombo, state.timeLimit
    );

    const isNewRecord = saveScore(state.scoreKey, state.level,
      { score: finalScore, wpm, accuracy, correct: state.correctCount });

    // UI 복원
    const arcadeArea = document.getElementById('arcade-area');
    if (arcadeArea) arcadeArea.style.display = 'none';
    const progressEl = document.getElementById('progress-container');
    if (progressEl) progressEl.style.display = 'flex';
    const speedControl = document.getElementById('speed-control');
    if (speedControl) speedControl.style.display = 'none';

    const gameMain = document.querySelector('.game-main');
    if (gameMain) gameMain.style.justifyContent = 'center';
    const wordCard = document.querySelector('.word-card');
    if (wordCard) wordCard.style.display = 'block';
    const inputArea = document.querySelector('.input-area');
    if (inputArea) {
      inputArea.style.zIndex = '';
      inputArea.style.marginBottom = '';
    }

    showResult({
      score: finalScore, wpm, accuracy,
      correct: state.correctCount, wrong: state.wrongCount,
      isNewRecord, mode: state.scoreKey, level: state.level
    });
  }

  function clearArcadeArea() {
    const area = document.getElementById('arcade-area');
    if (!area) return;
    area.querySelectorAll('.falling-word').forEach(el => el.remove());
    state.fallingWords = [];
  }

  function stop() {
    state.isActive = false;
    stopTimer(); stopSpawn(); stopGameLoop();
    clearArcadeArea();

    const arcadeArea = document.getElementById('arcade-area');
    if (arcadeArea) arcadeArea.style.display = 'none';
    const progressEl = document.getElementById('progress-container');
    if (progressEl) progressEl.style.display = 'flex';
    const speedControl = document.getElementById('speed-control');
    if (speedControl) speedControl.style.display = 'none';

    const gameMain = document.querySelector('.game-main');
    if (gameMain) gameMain.style.justifyContent = 'center';
    const wordCard = document.querySelector('.word-card');
    if (wordCard) wordCard.style.display = 'block';
    const inputArea = document.querySelector('.input-area');
    if (inputArea) {
      inputArea.style.zIndex = '';
      inputArea.style.marginBottom = '';
    }
  }

  return { start, stop };
})();
