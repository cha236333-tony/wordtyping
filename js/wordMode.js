// =============================================
// js/wordMode.js - 단어 연습 모드 (한국어/영어/구구단 지원)
// =============================================

const WordMode = (() => {
  // ── 상태 ──────────────────────────────────
  let state = {
    level: 'easy',
    scoreKey: 'korean_word',
    words: [],
    currentIndex: 0,
    totalWords: 20,
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
    isActive: false,
    isTimesTable: false
  };

  // ── 시작 ──────────────────────────────────

  /**
   * @param {string} level    - 'easy' | 'medium' | 'hard'
   * @param {string} scoreKey - 'korean_word' | 'english_word' | 'times_table_word'
   */
  function start(level, scoreKey) {
    state.level = level || 'easy';
    state.scoreKey = scoreKey || 'korean_word';
    state.isTimesTable = isTimesTableMode();

    // 단어 목록 로드
    state.words = getWords(state.level).slice(0, state.totalWords);
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
    displayCurrentWord();
    startTimer();
    setupInputListeners();
    clearAndFocusInput();
  }

  // ── 게임 UI 초기화 ─────────────────────────

  function setupGameUI() {
    const subjectInfo = SUBJECT_INFO[AppState.currentSubject] || {};

    const modeLabel = document.getElementById('game-mode-label');
    if (modeLabel) {
      modeLabel.textContent = state.isTimesTable ? '구구단 연습' : '단어 연습';
    }

    const levelLabel = document.getElementById('game-level-label');
    if (levelLabel) {
      const li = LEVEL_INFO[state.level];
      levelLabel.textContent = li ? `${li.emoji} ${li.name}` : '';
    }

    // 과목 배지
    const subjectBadge = document.getElementById('game-subject-badge');
    if (subjectBadge) {
      subjectBadge.textContent = `${subjectInfo.emoji || ''} ${subjectInfo.name || ''}`;
      subjectBadge.style.background = subjectInfo.color || '#FF7043';
    }

    // 아케이드 전용 요소 숨기기
    const livesEl = document.getElementById('lives-display');
    if (livesEl) livesEl.style.display = 'none';

    const arcadeArea = document.getElementById('arcade-area');
    if (arcadeArea) arcadeArea.style.display = 'none';

    const progressEl = document.getElementById('progress-container');
    if (progressEl) progressEl.style.display = 'flex';

    updateScore(0);
    updateProgressBar(0, state.totalWords);
    updateTimer(state.timeLimit);
    updateAccuracy(100);
    updateComboDisplay(0);
  }

  // ── 단어/구구단 표시 ──────────────────────

  function displayCurrentWord() {
    if (state.currentIndex >= state.words.length) {
      end();
      return;
    }

    const wordObj = state.words[state.currentIndex];
    const emojiEl = document.getElementById('word-emoji');
    const wordEl = document.getElementById('word-display');
    const sentenceEl = document.getElementById('sentence-display');

    if (sentenceEl) sentenceEl.style.display = 'none';

    if (state.isTimesTable) {
      // 구구단 모드: 문제 표시
      if (emojiEl) {
        emojiEl.textContent = wordObj.emoji || '🔢';
        emojiEl.style.display = 'block';
      }
      if (wordEl) {
        wordEl.textContent = wordObj.question || wordObj.display || wordObj.word;
        wordEl.style.display = 'block';
        wordEl.style.fontSize = 'clamp(2rem, 6vw, 4rem)';
        bounceIn(wordEl);
      }
      // 입력창 placeholder 변경
      const inp = document.getElementById('typing-input');
      if (inp) inp.placeholder = '답을 입력하세요';
    } else {
      // 일반 단어 모드
      if (emojiEl) {
        emojiEl.textContent = wordObj.emoji || '';
        emojiEl.style.display = wordObj.emoji ? 'block' : 'none';
      }
      if (wordEl) {
        wordEl.textContent = wordObj.word;
        wordEl.style.display = 'block';
        wordEl.style.fontSize = '';
        bounceIn(wordEl);
      }
      const inp = document.getElementById('typing-input');
      if (inp) inp.placeholder = '여기에 입력하세요';
    }

    updateProgressBar(state.currentIndex, state.totalWords);
    clearAndFocusInput();
    setInputState('normal');
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
      // BUG4 수정: compositionend 후 input 이벤트가 연달아 발생하므로
      // setTimeout으로 다음 틱에 처리하여 중복 제출 방지
      setTimeout(() => checkAutoSubmit(e.target.value), 0);
    });

    inp.addEventListener('input', (e) => {
      if (!state.isActive) return;
      // BUG4 수정: isComposing 중에는 자동 제출하지 않음
      // compositionend의 setTimeout이 처리하므로 여기서는 isComposing 체크만
      if (!state.isComposing) {
        checkAutoSubmit(e.target.value);
      }
    });

    inp.addEventListener('keydown', (e) => {
      if (!state.isActive) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        const val = inp.value.trim();
        if (val) submitAnswer(val);
      }
    });
  }

  /**
   * 자동 제출 체크
   * - 구구단: 숫자 입력 후 Enter 또는 자동 (2자리 이상)
   * - 일반: 글자 수 일치 시 자동 제출
   */
  function checkAutoSubmit(value) {
    if (!state.isActive || state.isComposing) return;
    const wordObj = state.words[state.currentIndex];
    if (!wordObj) return;

    const trimmed = value.trim();

    if (state.isTimesTable) {
      // 구구단: 정답이 숫자이므로 길이 일치 시 자동 제출
      const answer = wordObj.answer || '';
      if (trimmed.length >= answer.length && trimmed.length > 0) {
        submitAnswer(trimmed);
      }
    } else {
      // 일반 단어: 글자 수 일치 시 자동 제출
      const targetWord = wordObj.word || '';
      if (trimmed.length >= targetWord.length && !state.isComposing) {
        submitAnswer(trimmed);
      }
    }
  }

  // ── 정답 처리 ─────────────────────────────

  function submitAnswer(input) {
    if (!state.isActive) return;
    const wordObj = state.words[state.currentIndex];
    if (!wordObj) return;

    const trimmed = input.trim();
    const correct = state.isTimesTable
      ? trimmed === wordObj.answer
      : trimmed === wordObj.word;

    if (correct) {
      onCorrect(wordObj);
    } else {
      onWrong(wordObj);
    }
  }

  function onCorrect(wordObj) {
    state.correctCount++;
    state.combo++;
    if (state.combo > state.maxCombo) state.maxCombo = state.combo;

    const charLen = state.isTimesTable
      ? (wordObj.answer || '').length
      : (wordObj.word || '').length;
    state.totalChars += charLen;

    const baseScore = state.isTimesTable ? 80 : 100;
    const comboBonus = state.combo >= 3 ? state.combo * 10 : 0;
    state.score += baseScore + comboBonus;

    updateScore(state.score);
    updateComboDisplay(state.combo);
    updateAccuracy(calcAccuracy(state.correctCount, state.currentIndex + 1));

    setInputState('correct');

    if (state.isTimesTable) {
      const wordObj2 = state.words[state.currentIndex];
      showMessage(`🎉 정답! ${wordObj2.question} = ${wordObj2.answer}`, 'correct');
    } else {
      showMessage('🎉 정답!', 'correct');
    }

    const wordEl = document.getElementById('word-display');
    popElement(wordEl);
    createParticlesFromElement(wordEl);

    state.currentIndex++;
    if (state.currentIndex >= state.totalWords) {
      setTimeout(() => end(), 400);
    } else {
      setTimeout(() => displayCurrentWord(), 350);
    }
  }

  function onWrong(wordObj) {
    state.wrongCount++;
    state.combo = 0;
    state.score = Math.max(0, state.score - 20);

    updateScore(state.score);
    updateComboDisplay(0);
    updateAccuracy(calcAccuracy(state.correctCount, state.currentIndex + 1));

    setInputState('wrong');

    if (state.isTimesTable) {
      showMessage(`❌ 틀렸어요! 정답은 ${wordObj.answer}`, 'wrong');
    } else {
      showMessage('❌ 틀렸어요! 다시 해봐요', 'wrong');
    }

    const input = document.getElementById('typing-input');
    shakeElement(input);

    setTimeout(() => {
      clearAndFocusInput();
      setInputState('normal');
    }, 500);
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
        const wpm = calcWPM(state.totalChars, state.elapsedSeconds);
        updateWPM(wpm);
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
      state.correctCount,
      state.wrongCount,
      elapsed,
      state.maxCombo,
      state.timeLimit
    );

    const scoreData = { score: finalScore, wpm, accuracy, correct: state.correctCount };
    const isNewRecord = saveScore(state.scoreKey, state.level, scoreData);

    showResult({
      score: finalScore,
      wpm,
      accuracy,
      correct: state.correctCount,
      wrong: state.wrongCount,
      isNewRecord,
      mode: state.scoreKey,
      level: state.level
    });
  }

  function stop() {
    state.isActive = false;
    stopTimer();
  }

  return { start, stop };
})();
