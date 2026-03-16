// =============================================
// js/main.js - 메인 컨트롤러 (화면 라우팅 & 전역 상태)
// =============================================

// ── 전역 앱 상태 ──────────────────────────────
const AppState = {
  currentSubject: 'korean',  // 'korean' | 'english' | 'times_table'
  currentMode: null,          // 'word' | 'sentence' | 'arcade'
  currentLevel: null,         // 'easy' | 'medium' | 'hard'
  activeMode: null            // 현재 실행 중인 모드 객체
};

// ── 앱 초기화 ─────────────────────────────────

function initApp() {
  updateMainMenuHighScore();
  bindSubjectSelectEvents();
  bindMainMenuEvents();
  bindLevelSelectEvents();
  bindResultEvents();
  bindBackButtons();

  showScreen('subject-select');
  createClouds();

  console.log('🎮 한글 타자왕 초기화 완료!');
}

// ── 과목 선택 화면 ────────────────────────────

function bindSubjectSelectEvents() {
  const subjects = ['korean', 'english', 'times_table'];
  subjects.forEach(subject => {
    const btn = document.getElementById(`btn-subject-${subject}`);
    if (btn) {
      btn.addEventListener('click', () => {
        AppState.currentSubject = subject;
        setSubject(subject);
        showMainMenu(subject);
      });
    }
  });
}

function showMainMenu(subject) {
  const info = SUBJECT_INFO[subject];

  // 메인 메뉴 제목/설명 업데이트
  const titleEl = document.getElementById('main-title');
  if (titleEl) titleEl.textContent = `${info.emoji} ${info.name} 타자왕`;

  const descEl = document.getElementById('main-desc');
  if (descEl) descEl.textContent = info.description;

  // 구구단이면 문장 연습 버튼 숨기기
  const sentenceBtn = document.getElementById('btn-sentence-mode');
  if (sentenceBtn) {
    sentenceBtn.style.display = info.isTimesTable ? 'none' : 'flex';
  }

  // 구구단이면 단어 버튼 텍스트 변경
  const wordBtn = document.getElementById('btn-word-mode');
  if (wordBtn) {
    const wordBtnLabel = wordBtn.querySelector('.btn-label');
    if (wordBtnLabel) {
      wordBtnLabel.textContent = info.isTimesTable ? '구구단 연습' : '단어 연습';
    }
    const wordBtnEmoji = wordBtn.querySelector('.btn-emoji');
    if (wordBtnEmoji) {
      wordBtnEmoji.textContent = info.isTimesTable ? '🔢' : '✏️';
    }
  }

  // 아케이드 버튼 텍스트 변경
  const arcadeBtn = document.getElementById('btn-arcade-mode');
  if (arcadeBtn) {
    const arcadeBtnLabel = arcadeBtn.querySelector('.btn-label');
    if (arcadeBtnLabel) {
      arcadeBtnLabel.textContent = info.isTimesTable ? '구구단 게임' : '받아쓰기 게임';
    }
  }

  updateMainMenuHighScore();
  showScreen('main-menu');
}

// ── 메인 메뉴 이벤트 ──────────────────────────

function bindMainMenuEvents() {
  const wordBtn = document.getElementById('btn-word-mode');
  if (wordBtn) {
    wordBtn.addEventListener('click', () => {
      AppState.currentMode = 'word';
      showLevelSelect('word');
    });
  }

  const sentenceBtn = document.getElementById('btn-sentence-mode');
  if (sentenceBtn) {
    sentenceBtn.addEventListener('click', () => {
      AppState.currentMode = 'sentence';
      showLevelSelect('sentence');
    });
  }

  const arcadeBtn = document.getElementById('btn-arcade-mode');
  if (arcadeBtn) {
    arcadeBtn.addEventListener('click', () => {
      AppState.currentMode = 'arcade';
      showLevelSelect('arcade');
    });
  }

  // 과목 변경 버튼 (메인 메뉴 → 과목 선택)
  const changeSubjectBtn = document.getElementById('btn-change-subject');
  if (changeSubjectBtn) {
    changeSubjectBtn.addEventListener('click', () => {
      showScreen('subject-select');
    });
  }
}

// ── 레벨 선택 ─────────────────────────────────

function showLevelSelect(mode) {
  const modeTitle = document.getElementById('level-select-mode-title');
  if (modeTitle) {
    const subjectInfo = SUBJECT_INFO[AppState.currentSubject];
    const modeInfo = MODE_INFO[mode];
    let label = modeInfo?.name || '';
    if (AppState.currentSubject === 'times_table') {
      label = mode === 'word' ? '구구단 연습' : '구구단 게임';
    }
    modeTitle.textContent = `${subjectInfo?.emoji || ''} ${label}`;
  }

  // 레벨별 최고 점수 표시
  ['easy', 'medium', 'hard'].forEach(level => {
    const scoreKey = `${AppState.currentSubject}_${mode}`;
    const hs = getHighScore(scoreKey, level);
    const el = document.getElementById(`hs-${level}`);
    if (el) {
      el.textContent = hs.score > 0 ? `최고: ${hs.score.toLocaleString()}점` : '도전해봐요!';
    }

    // 레벨 카드 설명 업데이트 (구구단)
    const descEl = document.getElementById(`level-desc-${level}`);
    if (descEl && AppState.currentSubject === 'times_table') {
      const descs = { easy: '2단·3단·4단', medium: '5단·6단·7단', hard: '8단·9단' };
      descEl.textContent = descs[level] || '';
    } else if (descEl) {
      const descs = { easy: '1~2학년', medium: '3~4학년', hard: '5~6학년' };
      descEl.textContent = descs[level] || '';
    }
  });

  showScreen('level-select');
}

function bindLevelSelectEvents() {
  ['easy', 'medium', 'hard'].forEach(level => {
    const btn = document.getElementById(`btn-level-${level}`);
    if (btn) {
      btn.addEventListener('click', () => {
        AppState.currentLevel = level;
        startGame(AppState.currentMode, level);
      });
    }
  });
}

// ── 게임 시작 ─────────────────────────────────

function startGame(mode, level) {
  if (AppState.activeMode) {
    AppState.activeMode.stop();
    AppState.activeMode = null;
  }

  // 아케이드 영역 초기화
  const arcadeArea = document.getElementById('arcade-area');
  if (arcadeArea) {
    arcadeArea.style.display = 'none';
    arcadeArea.innerHTML = '';
  }

  // 진행 바 복원
  const progressEl = document.getElementById('progress-container');
  if (progressEl) progressEl.style.display = 'flex';

  // 과목 키를 포함한 저장 키 설정
  const subjectMode = `${AppState.currentSubject}_${mode}`;

  switch (mode) {
    case 'word':
      AppState.activeMode = WordMode;
      WordMode.start(level, subjectMode);
      break;
    case 'sentence':
      AppState.activeMode = SentenceMode;
      SentenceMode.start(level, subjectMode);
      break;
    case 'arcade':
      AppState.activeMode = ArcadeMode;
      ArcadeMode.start(level, subjectMode);
      break;
    default:
      showScreen('main-menu');
  }
}

// ── 결과 화면 이벤트 ──────────────────────────

function bindResultEvents() {
  const retryBtn = document.getElementById('btn-retry');
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      if (AppState.currentMode && AppState.currentLevel) {
        startGame(AppState.currentMode, AppState.currentLevel);
      }
    });
  }

  const menuBtn = document.getElementById('btn-to-menu');
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      if (AppState.activeMode) {
        AppState.activeMode.stop();
        AppState.activeMode = null;
      }
      updateMainMenuHighScore();
      showScreen('main-menu');
    });
  }

  const nextBtn = document.getElementById('btn-next-level');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const levels = ['easy', 'medium', 'hard'];
      const currentIdx = levels.indexOf(AppState.currentLevel);
      const nextLevel = levels[currentIdx + 1];
      if (nextLevel) {
        AppState.currentLevel = nextLevel;
        startGame(AppState.currentMode, nextLevel);
      } else {
        updateMainMenuHighScore();
        showScreen('main-menu');
      }
    });
  }
}

// ── 뒤로가기 버튼 ─────────────────────────────

function bindBackButtons() {
  // 메인 메뉴 → 과목 선택
  const backFromMain = document.getElementById('btn-back-from-main');
  if (backFromMain) {
    backFromMain.addEventListener('click', () => {
      showScreen('subject-select');
    });
  }

  // 레벨 선택 → 메인 메뉴
  const backFromLevel = document.getElementById('btn-back-from-level');
  if (backFromLevel) {
    backFromLevel.addEventListener('click', () => {
      showScreen('main-menu');
    });
  }

  // ESC 키: 게임 화면 → 메인 메뉴
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const gameScreen = document.getElementById('game-screen');
      if (gameScreen && !gameScreen.classList.contains('hidden')) {
        if (confirm('게임을 종료하고 메뉴로 돌아갈까요?')) {
          if (AppState.activeMode) {
            AppState.activeMode.stop();
            AppState.activeMode = null;
          }
          updateMainMenuHighScore();
          showScreen('main-menu');
        }
      }
    }
  });
}

// ── 구름 애니메이션 ───────────────────────────

function createClouds() {
  const containers = document.querySelectorAll('.cloud-container');
  containers.forEach(container => {
    container.innerHTML = '';
    const cloudEmojis = ['☁️', '⛅', '🌤️'];
    for (let i = 0; i < 6; i++) {
      const cloud = document.createElement('div');
      cloud.className = 'cloud';
      cloud.textContent = cloudEmojis[i % cloudEmojis.length];
      const top = 5 + Math.random() * 40;
      const duration = 15 + Math.random() * 20;
      const delay = -Math.random() * duration;
      const size = 1.5 + Math.random() * 1.5;
      cloud.style.cssText = `
        top: ${top}%;
        font-size: ${size}rem;
        animation: float ${duration}s ${delay}s linear infinite;
        opacity: ${0.5 + Math.random() * 0.4};
      `;
      container.appendChild(cloud);
    }
  });
}

// ── DOMContentLoaded ──────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});
