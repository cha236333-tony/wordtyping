// =============================================
// js/score.js - 점수 관리 및 localStorage 저장
// =============================================

const STORAGE_KEY = 'koreanTypingGame';

// ── 점수 계산 ──────────────────────────────

/**
 * WPM 계산 (분당 타수)
 * @param {number} charCount - 입력한 총 글자 수
 * @param {number} seconds   - 경과 시간(초)
 * @returns {number} WPM
 */
function calcWPM(charCount, seconds) {
  if (seconds <= 0) return 0;
  const minutes = seconds / 60;
  return Math.round(charCount / minutes);
}

/**
 * 정확도 계산
 * @param {number} correct - 맞은 수
 * @param {number} total   - 전체 수
 * @returns {number} 정확도 (0~100)
 */
function calcAccuracy(correct, total) {
  if (total <= 0) return 0;
  return Math.round((correct / total) * 100);
}

/**
 * 최종 점수 계산
 * @param {number} correct   - 맞은 수
 * @param {number} wrong     - 틀린 수
 * @param {number} seconds   - 경과 시간(초)
 * @param {number} combo     - 최대 연속 정답 수
 * @param {number} timeLimit - 제한 시간(초)
 * @returns {number} 최종 점수
 */
function calculateScore(correct, wrong, seconds, combo, timeLimit) {
  const baseScore = correct * 100;
  const comboBonus = combo * 10;
  const timeBonus = Math.max(0, (timeLimit - seconds) * 2);
  const wrongPenalty = wrong * 20;
  return Math.max(0, baseScore + comboBonus + timeBonus - wrongPenalty);
}

/**
 * 별점 계산 (0~3)
 * @param {number} accuracy - 정확도(%)
 * @param {number} wpm      - WPM
 * @returns {number} 별 개수
 */
function calcStars(accuracy, wpm) {
  if (accuracy >= 95 && wpm >= 40) return 3;
  if (accuracy >= 80 && wpm >= 25) return 2;
  if (accuracy >= 60) return 1;
  return 0;
}

// ── localStorage 관리 ──────────────────────

/**
 * 저장 데이터 전체 로드
 * @returns {object} SaveData
 */
function loadSaveData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultSaveData();
    return JSON.parse(raw);
  } catch (e) {
    return createDefaultSaveData();
  }
}

/**
 * 기본 저장 데이터 구조 생성
 * 과목별 동적 키를 지원하기 위해 highScores를 평탄한 맵으로 관리
 */
function createDefaultSaveData() {
  return {
    highScores: {},   // { "korean_word_easy": { score, wpm, accuracy, date }, ... }
    totalGamesPlayed: 0,
    totalCorrect: 0
  };
}

/**
 * 저장 데이터 쓰기
 * @param {object} data
 */
function writeSaveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('localStorage 저장 실패:', e);
  }
}

/**
 * 저장 키 생성
 * @param {string} modeKey - 'korean_word' | 'english_sentence' | 'times_table_arcade' 등
 * @param {string} level   - 'easy' | 'medium' | 'hard'
 * @returns {string}
 */
function makeStorageKey(modeKey, level) {
  return `${modeKey}_${level}`;
}

/**
 * 최고 점수 로드
 * @param {string} modeKey - 과목+모드 키 (예: 'korean_word')
 * @param {string} level   - 'easy' | 'medium' | 'hard'
 * @returns {object} { score, wpm, accuracy, date }
 */
function getHighScore(modeKey, level) {
  const data = loadSaveData();
  const key = makeStorageKey(modeKey, level);
  return data.highScores?.[key] || { score: 0, wpm: 0, accuracy: 0, date: '' };
}

/**
 * 점수 저장 (신기록이면 갱신)
 * @param {string} modeKey   - 과목+모드 키
 * @param {string} level     - 'easy' | 'medium' | 'hard'
 * @param {object} scoreData - { score, wpm, accuracy, correct }
 * @returns {boolean} 신기록 여부
 */
function saveScore(modeKey, level, scoreData) {
  const data = loadSaveData();
  const key = makeStorageKey(modeKey, level);
  const current = data.highScores[key] || { score: 0 };
  const isNew = scoreData.score > current.score;

  if (isNew) {
    data.highScores[key] = {
      score: scoreData.score,
      wpm: scoreData.wpm || 0,
      accuracy: scoreData.accuracy || 0,
      date: new Date().toLocaleDateString('ko-KR')
    };
  }

  data.totalGamesPlayed = (data.totalGamesPlayed || 0) + 1;
  data.totalCorrect = (data.totalCorrect || 0) + (scoreData.correct || 0);
  writeSaveData(data);
  return isNew;
}

/**
 * 전체 최고 점수 중 가장 높은 점수 반환
 * @returns {number}
 */
function getOverallHighScore() {
  const data = loadSaveData();
  let max = 0;
  for (const val of Object.values(data.highScores || {})) {
    if (val.score > max) max = val.score;
  }
  return max;
}

/**
 * 현재 과목의 최고 점수 반환
 * @param {string} subject - 'korean' | 'english' | 'times_table'
 * @returns {number}
 */
function getSubjectHighScore(subject) {
  const data = loadSaveData();
  let max = 0;
  for (const [key, val] of Object.entries(data.highScores || {})) {
    if (key.startsWith(subject) && val.score > max) max = val.score;
  }
  return max;
}

/**
 * 모든 점수 초기화
 */
function resetAllScores() {
  writeSaveData(createDefaultSaveData());
}
