// =============================================
// js/sentenceMode.js - 문장 연습 모드 (한국어/영어 지원)
// =============================================

const SentenceMode = (() => {
  // ── 상태 ──────────────────────────────────
  let state = {
    level: 'easy',
    scoreKey: 'korean_sentence',
    sentences: [],
    currentIndex: 0,
    totalSentences: 10,
    correctCount: 0,
    wrongCount: 0,
    score: 0,
    combo: 0,
    maxCombo: 0,
    totalChars: 0,
    startTime: null,
    timerInterval: null,
    timeLimit: 180,
    elapsedSeconds: 0,
    isComposing: false,
    isActive: false
  };

  // ── 시작 ──────────────────────────────────

  /**
   * @param {string} level    - 'easy' | 'medium' | 'hard'
   * @param {string} scoreKey - 'korean_sentence' | 'english_sentence'
   */
  function start(level, scoreKey) {
    state.level = level || 'easy';
    state.scoreKey = scoreKey || 'korean_sentence';
    state.sentences = getSentences(state.level).slice(0, state.totalSentences);
    state.currentIndex = 0;
    state.correctCount = 0;
    state.wrongCount = 0;
    state.score = 0;
    state.combo = 0;
    state.maxCombo = 0;
    state.totalChars = 0;
    state.elapsedSeconds = 0;
    state.isActive = true;

    const levelInfo = LEVEL_INFO[level];
    state.timeLimit = levelInfo ? levelInfo.timeLimit : 180;

    showScreen('game-screen');
    setupGameUI();
    displayCurrentSentence();
    startTimer();
    setupInputListeners();
    clearAndFocusInput();
  }

  // ── 게임 UI 초기화 ─────────────────────────

  function setupGameUI() {
    const subjectInfo = SUBJECT_INFO[AppState.currentSubject] || {};

    const modeLabel = document.getElementById('game-mode-label');
    if (modeLabel) modeLabel.textContent = '문장 연습';

    const levelLabel = document.getElementById('game-level-label');
    if (levelLabel) {
      const li = LEVEL_INFO[state.level];
      levelLabel.textContent = li ? `${li.emoji} ${li.name}` : '';
    }

    const subjectBadge = document.getElementById('game-subject-badge');
    if (subjectBadge) {
      subjectBadge.textContent = `${subjectInfo.emoji || ''} ${subjectInfo.name || ''}`;
      subjectBadge.style.background = subjectInfo.color || '#FF7043';
    }

    const livesEl = document.getElementById('lives-display');
    if (livesEl) livesEl.style.display = 'none';

    const arcadeArea = document.getElementById('arcade-area');
    if (arcadeArea) arcadeArea.style.display = 'none';

    const emojiEl = document.getElementById('word-emoji');
    if (emojiEl) emojiEl.style.display = 'none';

    const progressEl = document.getElementById('progress-container');
    if (progressEl) progressEl.style.display = 'flex';

    updateScore(0);
    updateProgressBar(0, state.totalSentences);
    updateTimer(state.timeLimit);
    updateAccuracy(100);
    updateComboDisplay(0);
  }

  // ── 문장 표시 ─────────────────────────────

  function displayCurrentSentence() {
    if (state.currentIndex >= state.sentences.length) {
      end();
      return;
    }

    const sentence = state.sentences[state.currentIndex];
    const wordEl = document.getElementById('word-display');
    const sentenceEl = document.getElementById('sentence-display');

    if (wordEl) wordEl.style.display = 'none';

    if (sentenceEl) {
      sentenceEl.style.display = 'block';
      renderSentenceChars(sentence, sentenceEl);
      bounceIn(sentenceEl);
    }

    const inp = document.getElementById('typing-input');
    if (inp) inp.placeholder = '여기에 입력하세요';

    updateProgressBar(state.currentIndex, state.totalSentences);
    clearAndFocusInput();
    setInputState('normal');
  }

  /**
   * 문장을 글자별 <span>으로 분리하여 렌더링
   */
  function renderSentenceChars(sentence, container) {
    container.innerHTML = '';
    for (let i = 0; i < sentence.length; i++) {
      const span = document.createElement('span');
      span.className = 'char pending';
      span.textContent = sentence[i];
      span.dataset.index = i;
      container.appendChild(span);
    }
  }

  // ── 실시간 글자 피드백 ─────────────────────

  function updateCharFeedback(inputValue) {
    const sentenceEl = document.getElementById('sentence-display');
    if (!sentenceEl) return;

    const spans = sentenceEl.querySelectorAll('.char');
    const sentence = state.sentences[state.currentIndex] || '';

    spans.forEach((span, i) => {
      span.classList.remove('correct-char', 'wrong-char', 'pending', 'cursor');
      if (i < inputValue.length) {
        span.classList.add(inputValue[i] === sentence[i] ? 'correct-char' : 'wrong-char');
      } else if (i === inputValue.length) {
        span.classList.add('cursor');
      } else {
        span.classList.add('pending');
      }
    });
  }

  // ── 입력 이벤트 ───────────────────────────

  function setupInputListeners() {
    const input = document.getElementById('typing-input');
    if (!input) return;

    const newInput = input.cloneNode(true);
    input.parentNode.replaceChild(newInput, input);
    const inp = document.getElementById('typing-input');

    inp.addEventListener('compositionstart', () => {
      state.isComposing = true;
    });

    inp.addEventListener('compositionend', (e) => {
      state.isComposing = false;
      updateCharFeedback(e.target.value);
      // BUG5 수정: compositionend 직후 input 이벤트가 연달아 발생하므로
      // setTimeout으로 다음 틱에 처리하여 중복 제출 방지
      setTimeout(() => checkSentenceComplete(e.target.value), 0);
    });

    inp.addEventListener('input', (e) => {
      if (!state.isActive) return;
      updateCharFeedback(e.target.value);
      // BUG5 수정: isComposing 중에는 자동 제출하지 않음
      // compositionend의 setTimeout이 처리하므로 여기서는 isComposing 체크만
      if (!state.isComposing) {
        checkSentenceComplete(e.target.value);
      }
    });

    inp.addEventListener('keydown', (e) => {
      if (!state.isActive) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        submitSentence(inp.value);
      }
    });
  }

  function checkSentenceComplete(inputValue) {
    if (!state.isActive || state.isComposing) return;
    const sentence = state.sentences[state.currentIndex] || '';
    if (inputValue.length >= sentence.length) {
      submitSentence(inputValue);
    }
  }

  // ── 정답 처리 ─────────────────────────────

  function submitSentence(input) {
    if (!state.isActive) return;
    const sentence = state.sentences[state.currentIndex] || '';

    if (input === sentence) {
      onCorrect(sentence);
    } else if (input.length >= sentence.length) {
      onWrong(input, sentence);
    }
  }

  function onCorrect(sentence) {
    state.correctCount++;
    state.combo++;
    if (state.combo > state.maxCombo) state.maxCombo = state.combo;
    state.totalChars += sentence.length;

    const baseScore = 150;
    const comboBonus = state.combo >= 3 ? state.combo * 15 : 0;
    state.score += baseScore + comboBonus;

    updateScore(state.score);
    updateComboDisplay(state.combo);
    updateAccuracy(calcAccuracy(state.correctCount, state.currentIndex + 1));

    setInputState('correct');
    showMessage('🎉 완벽해요!', 'correct');

    const sentenceEl = document.getElementById('sentence-display');
    popElement(sentenceEl);
    createParticlesFromElement(sentenceEl);

    state.currentIndex++;
    if (state.currentIndex >= state.totalSentences) {
      setTimeout(() => end(), 400);
    } else {
      setTimeout(() => displayCurrentSentence(), 400);
    }
  }

  function onWrong(input, sentence) {
    state.wrongCount++;
    state.combo = 0;
    state.score = Math.max(0, state.score - 30);

    updateScore(state.score);
    updateComboDisplay(0);
    updateAccuracy(calcAccuracy(state.correctCount, state.currentIndex + 1));

    setInputState('wrong');
    showMessage('❌ 틀렸어요! 다시 해봐요', 'wrong');

    const inp = document.getElementById('typing-input');
    shakeElement(inp);

    highlightErrors(input, sentence);

    setTimeout(() => {
      clearAndFocusInput();
      setInputState('normal');
      const sentenceEl = document.getElementById('sentence-display');
      if (sentenceEl) {
        sentenceEl.querySelectorAll('.char').forEach(span => {
          span.classList.remove('correct-char', 'wrong-char', 'cursor');
          span.classList.add('pending');
        });
      }
    }, 600);
  }

  function highlightErrors(input, sentence) {
    const sentenceEl = document.getElementById('sentence-display');
    if (!sentenceEl) return;
    const spans = sentenceEl.querySelectorAll('.char');
    spans.forEach((span, i) => {
      span.classList.remove('correct-char', 'wrong-char', 'pending', 'cursor');
      if (i < input.length) {
        span.classList.add(input[i] === sentence[i] ? 'correct-char' : 'wrong-char');
      } else {
        span.classList.add('pending');
      }
    });
  }

  // ── 타이머 ────────────────────────────────

  function startTimer() {
    clearInterval(state.timerInterval);
    state.startTime = Date.now();
    state.elapsedSeconds = 0;

    state.timerInterval = setInterval(() => {
      state.elapsedSeconds++;
      const remaining = Math.max(0, state.timeLimit - state.elapsedSeconds);
      updateTimer(remaining);

      if (state.elapsedSeconds > 0) {
        updateWPM(calcWPM(state.totalChars, state.elapsedSeconds));
      }

      if (remaining <= 0) end();
    }, 1000);
  }

  function stopTimer() {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }

  // ── 종료 ──────────────────────────────────

  function end() {
    if (!state.isActive) return;
    state.isActive = false;
    stopTimer();

    const elapsed = state.elapsedSeconds || 1;
    const wpm = calcWPM(state.totalChars, elapsed);
    const accuracy = calcAccuracy(state.correctCount, state.currentIndex || 1);
    const finalScore = calculateScore(
      state.correctCount, state.wrongCount, elapsed, state.maxCombo, state.timeLimit
    );

    const scoreData = { score: finalScore, wpm, accuracy, correct: state.correctCount };
    const isNewRecord = saveScore(state.scoreKey, state.level, scoreData);

    showResult({
      score: finalScore, wpm, accuracy,
      correct: state.correctCount, wrong: state.wrongCount,
      isNewRecord, mode: state.scoreKey, level: state.level
    });
  }

  function stop() {
    state.isActive = false;
    stopTimer();
  }

  return { start, stop };
})();
