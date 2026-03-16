// =============================================
// js/data.js - 게임 데이터 (한국어 / 영어 / 구구단)
// =============================================

// ── 한국어 데이터 ─────────────────────────────
const KOREAN_DATA = {
  word: {
    easy: [
      { word: "사과", emoji: "🍎" },
      { word: "바나나", emoji: "🍌" },
      { word: "포도", emoji: "🍇" },
      { word: "딸기", emoji: "🍓" },
      { word: "수박", emoji: "🍉" },
      { word: "토마토", emoji: "🍅" },
      { word: "강아지", emoji: "🐶" },
      { word: "고양이", emoji: "🐱" },
      { word: "토끼", emoji: "🐰" },
      { word: "코끼리", emoji: "🐘" },
      { word: "나비", emoji: "🦋" },
      { word: "무지개", emoji: "🌈" },
      { word: "해님", emoji: "☀️" },
      { word: "달님", emoji: "🌙" },
      { word: "별님", emoji: "⭐" },
      { word: "자동차", emoji: "🚗" },
      { word: "기차", emoji: "🚂" },
      { word: "비행기", emoji: "✈️" },
      { word: "학교", emoji: "🏫" },
      { word: "연필", emoji: "✏️" },
      { word: "사자", emoji: "🦁" },
      { word: "호랑이", emoji: "🐯" },
      { word: "원숭이", emoji: "🐒" },
      { word: "펭귄", emoji: "🐧" },
      { word: "오리", emoji: "🦆" }
    ],
    medium: [
      { word: "도서관", emoji: "📚" },
      { word: "운동장", emoji: "⚽" },
      { word: "선생님", emoji: "👩‍🏫" },
      { word: "친구들", emoji: "👫" },
      { word: "생일파티", emoji: "🎂" },
      { word: "태권도", emoji: "🥋" },
      { word: "수영장", emoji: "🏊" },
      { word: "미술시간", emoji: "🎨" },
      { word: "음악시간", emoji: "🎵" },
      { word: "체육시간", emoji: "🏃" },
      { word: "점심시간", emoji: "🍱" },
      { word: "방과후", emoji: "🌅" },
      { word: "봄소풍", emoji: "🌸" },
      { word: "여름방학", emoji: "🏖️" },
      { word: "가을운동회", emoji: "🍁" },
      { word: "겨울방학", emoji: "☃️" },
      { word: "졸업식", emoji: "🎓" },
      { word: "입학식", emoji: "🌱" },
      { word: "가족여행", emoji: "✈️" },
      { word: "할머니댁", emoji: "🏡" },
      { word: "피아노", emoji: "🎹" },
      { word: "축구공", emoji: "⚽" },
      { word: "수학책", emoji: "📐" },
      { word: "국어책", emoji: "📖" },
      { word: "과학실", emoji: "🔬" }
    ],
    hard: [
      { word: "대한민국", emoji: "🇰🇷" },
      { word: "태극기", emoji: "🚩" },
      { word: "경복궁", emoji: "🏯" },
      { word: "한강공원", emoji: "🌊" },
      { word: "남대문시장", emoji: "🛒" },
      { word: "인사동거리", emoji: "🏮" },
      { word: "설악산등산", emoji: "⛰️" },
      { word: "제주도여행", emoji: "🌋" },
      { word: "독도수호", emoji: "🏝️" },
      { word: "우리나라말", emoji: "💬" },
      { word: "한글날기념", emoji: "📝" },
      { word: "세종대왕", emoji: "👑" },
      { word: "이순신장군", emoji: "⚔️" },
      { word: "과학발명품", emoji: "🔬" },
      { word: "수학문제풀기", emoji: "📐" },
      { word: "컴퓨터프로그램", emoji: "💻" },
      { word: "환경보호운동", emoji: "♻️" },
      { word: "봉사활동하기", emoji: "🤝" },
      { word: "독서감상문", emoji: "📖" },
      { word: "발표수업시간", emoji: "🎤" },
      { word: "우주탐험대", emoji: "🚀" },
      { word: "역사박물관", emoji: "🏛️" },
      { word: "전통문화체험", emoji: "🎎" },
      { word: "자연보호구역", emoji: "🌿" },
      { word: "미래과학기술", emoji: "🤖" }
    ]
  },
  sentence: {
    easy: [
      "나는 사과를 먹어요.",
      "강아지가 귀여워요.",
      "오늘 날씨가 맑아요.",
      "학교에 갑니다.",
      "밥을 먹었어요.",
      "책을 읽어요.",
      "물을 마셔요.",
      "손을 씻어요.",
      "잠을 자요.",
      "놀이터에서 놀아요.",
      "엄마가 좋아요.",
      "꽃이 예뻐요.",
      "하늘이 파래요.",
      "새가 날아요.",
      "나무가 커요."
    ],
    medium: [
      "친구들과 운동장에서 뛰었어요.",
      "선생님께서 수업을 가르쳐 주셨어요.",
      "도서관에서 재미있는 책을 빌렸어요.",
      "점심시간에 맛있는 급식을 먹었어요.",
      "방과후에 태권도 학원에 갔어요.",
      "가족과 함께 공원에서 산책했어요.",
      "봄이 되면 꽃이 피기 시작해요.",
      "여름방학에 수영장에서 놀았어요.",
      "가을에는 낙엽이 떨어져요.",
      "겨울에는 눈사람을 만들어요.",
      "생일 파티에서 케이크를 먹었어요.",
      "미술 시간에 그림을 그렸어요.",
      "음악 시간에 노래를 불렀어요.",
      "체육 시간에 줄넘기를 했어요.",
      "방학 숙제를 열심히 했어요."
    ],
    hard: [
      "대한민국은 아름다운 나라입니다.",
      "세종대왕께서 한글을 만드셨어요.",
      "이순신 장군은 나라를 지켰습니다.",
      "경복궁은 조선 시대의 궁궐입니다.",
      "우리는 환경을 보호해야 합니다.",
      "과학 기술이 발전하면 생활이 편리해져요.",
      "독서를 많이 하면 지식이 넓어집니다.",
      "친구에게 친절하게 대하는 것이 중요해요.",
      "매일 운동을 하면 건강해질 수 있어요.",
      "꿈을 이루기 위해 열심히 공부합시다.",
      "우리나라의 전통 문화를 소중히 여겨야 해요.",
      "자연을 보호하면 지구가 건강해집니다.",
      "서로 도우며 살아가는 것이 행복의 비결이에요.",
      "한글은 세계에서 가장 과학적인 문자입니다.",
      "미래를 위해 오늘도 최선을 다합시다."
    ]
  }
};

// ── 영어 데이터 ───────────────────────────────
const ENGLISH_DATA = {
  word: {
    easy: [
      { word: "apple", emoji: "🍎" },
      { word: "banana", emoji: "🍌" },
      { word: "cat", emoji: "🐱" },
      { word: "dog", emoji: "🐶" },
      { word: "egg", emoji: "🥚" },
      { word: "fish", emoji: "🐟" },
      { word: "grape", emoji: "🍇" },
      { word: "hat", emoji: "🎩" },
      { word: "ice", emoji: "🧊" },
      { word: "jump", emoji: "🦘" },
      { word: "kite", emoji: "🪁" },
      { word: "lion", emoji: "🦁" },
      { word: "moon", emoji: "🌙" },
      { word: "nose", emoji: "👃" },
      { word: "open", emoji: "📂" },
      { word: "pen", emoji: "✏️" },
      { word: "queen", emoji: "👑" },
      { word: "rain", emoji: "🌧️" },
      { word: "sun", emoji: "☀️" },
      { word: "tree", emoji: "🌳" },
      { word: "up", emoji: "⬆️" },
      { word: "van", emoji: "🚐" },
      { word: "water", emoji: "💧" },
      { word: "box", emoji: "📦" },
      { word: "zoo", emoji: "🦒" }
    ],
    medium: [
      { word: "school", emoji: "🏫" },
      { word: "friend", emoji: "👫" },
      { word: "flower", emoji: "🌸" },
      { word: "butter", emoji: "🧈" },
      { word: "castle", emoji: "🏰" },
      { word: "dragon", emoji: "🐉" },
      { word: "engine", emoji: "🚂" },
      { word: "forest", emoji: "🌲" },
      { word: "garden", emoji: "🌻" },
      { word: "hammer", emoji: "🔨" },
      { word: "island", emoji: "🏝️" },
      { word: "jungle", emoji: "🌴" },
      { word: "kitten", emoji: "🐱" },
      { word: "lemon", emoji: "🍋" },
      { word: "market", emoji: "🛒" },
      { word: "nature", emoji: "🌿" },
      { word: "orange", emoji: "🍊" },
      { word: "planet", emoji: "🪐" },
      { word: "rabbit", emoji: "🐰" },
      { word: "silver", emoji: "🥈" },
      { word: "ticket", emoji: "🎫" },
      { word: "umbrella", emoji: "☂️" },
      { word: "village", emoji: "🏡" },
      { word: "window", emoji: "🪟" },
      { word: "yellow", emoji: "💛" }
    ],
    hard: [
      { word: "adventure", emoji: "🗺️" },
      { word: "beautiful", emoji: "✨" },
      { word: "chocolate", emoji: "🍫" },
      { word: "dangerous", emoji: "⚠️" },
      { word: "education", emoji: "📚" },
      { word: "fantastic", emoji: "🌟" },
      { word: "geography", emoji: "🌍" },
      { word: "happiness", emoji: "😊" },
      { word: "important", emoji: "❗" },
      { word: "knowledge", emoji: "🧠" },
      { word: "language", emoji: "💬" },
      { word: "mountain", emoji: "⛰️" },
      { word: "necessary", emoji: "✅" },
      { word: "operation", emoji: "⚙️" },
      { word: "president", emoji: "🏛️" },
      { word: "question", emoji: "❓" },
      { word: "remember", emoji: "💭" },
      { word: "scientist", emoji: "🔬" },
      { word: "telephone", emoji: "📞" },
      { word: "universe", emoji: "🌌" },
      { word: "vacation", emoji: "🏖️" },
      { word: "wonderful", emoji: "🎉" },
      { word: "excellent", emoji: "🏆" },
      { word: "butterfly", emoji: "🦋" },
      { word: "celebrate", emoji: "🎊" }
    ]
  },
  sentence: {
    easy: [
      "I like cats.",
      "The sun is hot.",
      "I can run fast.",
      "She has a dog.",
      "We go to school.",
      "He eats an apple.",
      "The sky is blue.",
      "I love my mom.",
      "Birds can fly.",
      "Fish swim in water.",
      "I read a book.",
      "The dog is big.",
      "I drink milk.",
      "She is my friend.",
      "We play outside."
    ],
    medium: [
      "I go to school every day.",
      "My favorite color is blue.",
      "She likes to read books.",
      "We play soccer after school.",
      "The cat is sleeping on the bed.",
      "I eat breakfast in the morning.",
      "He runs faster than me.",
      "The flowers are very pretty.",
      "We have fun at the park.",
      "My teacher is very kind.",
      "I brush my teeth every night.",
      "She draws beautiful pictures.",
      "We sing songs together.",
      "The bird flies in the sky.",
      "I help my mom at home."
    ],
    hard: [
      "Learning English is very important.",
      "She studies hard every evening.",
      "The library has many interesting books.",
      "We should protect our environment.",
      "Science helps us understand the world.",
      "Friendship is one of life's greatest gifts.",
      "Exercise keeps our bodies healthy.",
      "Reading books expands our knowledge.",
      "We must be kind to everyone.",
      "Technology changes our daily lives.",
      "The universe is incredibly vast and beautiful.",
      "Education opens doors to new opportunities.",
      "Working together makes difficult tasks easier.",
      "Creativity helps us solve problems.",
      "Every day is a chance to learn something new."
    ]
  }
};

// ── 구구단 데이터 ─────────────────────────────
function generateTimesTableData() {
  const easy = [];    // 2단, 3단, 4단
  const medium = [];  // 5단, 6단, 7단
  const hard = [];    // 8단, 9단

  const easyTables = [2, 3, 4];
  const mediumTables = [5, 6, 7];
  const hardTables = [8, 9];

  const emojis = {
    2: "🐣", 3: "🌸", 4: "🍀",
    5: "⭐", 6: "🌈", 7: "🎵",
    8: "🚀", 9: "👑"
  };

  easyTables.forEach(n => {
    for (let i = 1; i <= 9; i++) {
      easy.push({
        word: `${n}x${i}=${n * i}`,
        display: `${n} × ${i} = ?`,
        answer: String(n * i),
        emoji: emojis[n],
        question: `${n} × ${i}`
      });
    }
  });

  mediumTables.forEach(n => {
    for (let i = 1; i <= 9; i++) {
      medium.push({
        word: `${n}x${i}=${n * i}`,
        display: `${n} × ${i} = ?`,
        answer: String(n * i),
        emoji: emojis[n],
        question: `${n} × ${i}`
      });
    }
  });

  hardTables.forEach(n => {
    for (let i = 1; i <= 9; i++) {
      hard.push({
        word: `${n}x${i}=${n * i}`,
        display: `${n} × ${i} = ?`,
        answer: String(n * i),
        emoji: emojis[n],
        question: `${n} × ${i}`
      });
    }
  });

  return { easy, medium, hard };
}

const TIMES_TABLE_DATA = generateTimesTableData();

// ── 통합 GAME_DATA ────────────────────────────
// 현재 선택된 언어/과목에 따라 동적으로 설정됨
let GAME_DATA = KOREAN_DATA;

// ── 언어/과목 설정 ────────────────────────────
const SUBJECT_INFO = {
  korean: {
    name: "한국어",
    emoji: "🇰🇷",
    description: "한글 단어를 연습해요!",
    color: "#FF7043",
    data: KOREAN_DATA,
    isTimesTable: false
  },
  english: {
    name: "영어",
    emoji: "🇺🇸",
    description: "Learn English words!",
    color: "#42A5F5",
    data: ENGLISH_DATA,
    isTimesTable: false
  },
  times_table: {
    name: "구구단",
    emoji: "🔢",
    description: "구구단을 외워봐요!",
    color: "#AB47BC",
    data: null,  // 특수 처리
    isTimesTable: true
  }
};

// 현재 선택된 과목
let currentSubject = 'korean';

/**
 * 과목 설정
 * @param {string} subject - 'korean' | 'english' | 'times_table'
 */
function setSubject(subject) {
  currentSubject = subject;
  if (subject === 'times_table') {
    GAME_DATA = { word: TIMES_TABLE_DATA, sentence: null };
  } else {
    GAME_DATA = SUBJECT_INFO[subject]?.data || KOREAN_DATA;
  }
}

// ── 레벨 정보 ─────────────────────────────────
const LEVEL_INFO = {
  easy: {
    name: "쉬움",
    grade: "1~2학년",
    emoji: "🐣",
    color: "#66BB6A",
    wordCount: 20,
    sentenceCount: 10,
    timeLimit: 180
  },
  medium: {
    name: "보통",
    grade: "3~4학년",
    emoji: "🐥",
    color: "#FFA726",
    wordCount: 20,
    sentenceCount: 10,
    timeLimit: 150
  },
  hard: {
    name: "어려움",
    grade: "5~6학년",
    emoji: "🐓",
    color: "#EF5350",
    wordCount: 20,
    sentenceCount: 10,
    timeLimit: 120
  }
};

// ── 모드 정보 ─────────────────────────────────
const MODE_INFO = {
  word: {
    name: "연습 모드",
    emoji: "✏️",
    description: "단어를 보고 따라 써요!"
  },
  sentence: {
    name: "문장 연습",
    emoji: "📖",
    description: "문장을 보고 따라 써요!"
  },
  arcade: {
    name: "게임 모드",
    emoji: "🎮",
    description: "떨어지는 단어를 잡아라!"
  }
};

// ── 유틸리티 ──────────────────────────────────

/**
 * 배열 셔플
 */
function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * 레벨별 단어 목록 가져오기
 * @param {string} level
 * @returns {Array}
 */
function getWords(level) {
  const pool = GAME_DATA?.word?.[level] || GAME_DATA?.word?.easy || [];
  return shuffleArray(pool);
}

/**
 * 레벨별 문장 목록 가져오기
 * @param {string} level
 * @returns {Array}
 */
function getSentences(level) {
  const pool = GAME_DATA?.sentence?.[level] || GAME_DATA?.sentence?.easy || [];
  return shuffleArray(pool);
}

/**
 * 구구단 모드 여부 확인
 */
function isTimesTableMode() {
  return currentSubject === 'times_table';
}
