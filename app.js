// 2026 고연전 194명 선수 얼굴 매칭 퀴즈 App Logic
(function() {
  // Elements
  const tabQuiz = document.getElementById('tab-quiz');
  const tabStudy = document.getElementById('tab-study');
  const quizFlowContainer = document.getElementById('quiz-flow-container');
  const studyFlowContainer = document.getElementById('study-flow-container');

  const startScreen = document.getElementById('start-screen');
  const quizScreen = document.getElementById('quiz-screen');
  const resultScreen = document.getElementById('result-screen');

  // Filter Selectors (Quiz Start)
  const quizTypeSelector = document.getElementById('quiz-type-selector');
  const difficultySelector = document.getElementById('difficulty-selector');
  const sportSelector = document.getElementById('sport-selector');
  const schoolSelector = document.getElementById('school-selector');
  const countSelector = document.getElementById('count-selector');
  const startQuizBtn = document.getElementById('start-quiz-btn');
  const soundToggleBtn = document.getElementById('sound-toggle-btn');
  const themeToggleBtn = document.getElementById('theme-toggle-btn');

  // Quiz DOM Elements
  const questionIndexText = document.getElementById('question-index-text');
  const scoreCounterText = document.getElementById('score-counter-text');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const comboBadge = document.getElementById('combo-badge');
  const cardSportTag = document.getElementById('card-sport-tag');
  const cardDiffTag = document.getElementById('card-diff-tag');
  const playerPhotoWrapper = document.getElementById('player-photo-wrapper');
  const playerImg = document.getElementById('player-img');

  // Jersey Card DOM Elements (등번호 매칭 모드)
  const jerseyCardWrapper = document.getElementById('jersey-card-wrapper');
  const jerseyCard = document.getElementById('jersey-card');
  const jerseySchoolBadge = document.getElementById('jersey-school-badge');
  const jerseyNumVal = document.getElementById('jersey-num-val');
  const jerseySportPill = document.getElementById('jersey-sport-pill');
  const jerseyPosPill = document.getElementById('jersey-pos-pill');
  const jerseyHintBtn = document.getElementById('jersey-hint-btn');
  const quizQuestionTitle = document.getElementById('quiz-question-title');

  // Hints
  const hintBtn = document.getElementById('hint-btn');
  const hintBox = document.getElementById('hint-box');
  const hintNum = document.getElementById('hint-num');
  const hintPos = document.getElementById('hint-pos');
  const hintChosungWrap = document.getElementById('hint-chosung-wrap');
  const hintChosung = document.getElementById('hint-chosung');
  const hintText = document.getElementById('hint-text');

  // Mode Containers
  const optionsContainer = document.getElementById('options-container');
  const inputModeContainer = document.getElementById('input-mode-container');
  const textAnswerForm = document.getElementById('text-answer-form');
  const textAnswerInput = document.getElementById('text-answer-input');
  const textSubmitBtn = document.getElementById('text-submit-btn');
  const showChosungBtn = document.getElementById('show-chosung-btn');
  const skipQuestionBtn = document.getElementById('skip-question-btn');
  const giveUpBtn = document.getElementById('give-up-btn');

  // Modal Elements
  const modalOverlay = document.getElementById('modal-overlay');
  const modalCloseIcon = document.getElementById('modal-close-icon');
  const modalResultBanner = document.getElementById('modal-result-banner');
  const modalPlayerImg = document.getElementById('modal-player-img');
  const modalPhotoBadge = document.getElementById('modal-photo-badge');
  const modalSchoolBadge = document.getElementById('modal-school-badge');
  const modalName = document.getElementById('modal-name');
  const modalNumBadge = document.getElementById('modal-num-badge');
  const modalPosBadge = document.getElementById('modal-pos-badge');
  const modalGradeBadge = document.getElementById('modal-grade-badge');
  const modalHighlightsList = document.getElementById('modal-highlights-list');
  const modalNextBtn = document.getElementById('modal-next-btn');

  // Result Elements
  const resultTitle = document.getElementById('result-title');
  const finalScoreDisplay = document.getElementById('final-score-display');
  const finalAccuracyDisplay = document.getElementById('final-accuracy-display');
  const reviewTabAll = document.getElementById('review-tab-all');
  const reviewTabSkipped = document.getElementById('review-tab-skipped');
  const countAllSolved = document.getElementById('count-all-solved');
  const countSkipped = document.getElementById('count-skipped');
  const reviewListContainer = document.getElementById('review-list-container');
  const retryBtn = document.getElementById('retry-btn');
  const changeModeBtn = document.getElementById('change-mode-btn');
  const shareBtn = document.getElementById('share-btn');
  const bragScoreBtn = document.getElementById('brag-score-btn');
  const bragModalOverlay = document.getElementById('brag-modal-overlay');
  const bragModalCloseIcon = document.getElementById('brag-modal-close-icon');
  const bragPreviewImg = document.getElementById('brag-preview-img');
  const bragDownloadBtn = document.getElementById('brag-download-btn');
  const bragShareNativeBtn = document.getElementById('brag-share-native-btn');
  const bragCanvas = document.getElementById('brag-canvas');

  // Study View Elements
  const studySearchInput = document.getElementById('study-search-input');
  const studySchoolChips = document.getElementById('study-school-chips');
  const studySportChips = document.getElementById('study-sport-chips');
  const studyCountInfo = document.getElementById('study-count-info');
  const rosterGridContainer = document.getElementById('roster-grid-container');

  let currentStudySport = 'all';
  let currentStudySchool = 'all';

  // App State
  let soundEnabled = true;
  let selectedQuizType = 'face'; // 'face' or 'number'
  let selectedDifficulty = 'choice'; // 'choice' or 'input'
  let selectedSport = 'all';
  let selectedSchool = 'all';
  let selectedCount = 10;

  let quizQuestions = [];
  let currentIndex = 0;
  let score = 0;
  let currentCombo = 0;
  let userAnswers = []; // { player, chosenName, isCorrect, isSkipped }
  let skippedPlayers = [];
  let isAnswerLocked = false;
  let currentReviewTab = 'all';

  // Sport icons
  const sportIcons = {
    '농구': '🏀',
    '야구': '⚾',
    '아이스하키': '🏒',
    '빙구': '🏒',
    '럭비': '🏉',
    '축구': '⚽'
  };

  // Web Audio Synthesizer
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) audioCtx = new AudioCtxClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playSound(type) {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'correct') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.15); // G5
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.25);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      }
    } catch (e) {}
  }

  function triggerHaptic(type) {
    if (navigator.vibrate) {
      if (type === 'correct') navigator.vibrate(40);
      else if (type === 'wrong') navigator.vibrate([60, 40, 60]);
    }
  }

  // Safe Visibility Helpers (combines CSS class + HTML attribute)
  function showElement(el) {
    if (!el) return;
    el.classList.remove('hidden');
    el.hidden = false;
  }

  function hideElement(el) {
    if (!el) return;
    el.classList.add('hidden');
    el.hidden = true;
  }

  // Branded Image Fallback on Error (prevents broken image icon)
  function applyImageFallback(img, player) {
    if (!img) return;
    img.onerror = function() {
      const bg = (player && player.school === '고려대') ? '%239e1b32' : '%23003876';
      const schoolLabel = (player && player.school) ? player.school : '선수';
      const initial = encodeURIComponent((player && player.name) ? player.name.charAt(0) : '선');
      this.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240"><rect width="240" height="240" fill="${bg}"/><circle cx="120" cy="90" r="45" fill="%23ffffff" opacity="0.88"/><path d="M50 215 C50 145 190 145 190 215 Z" fill="%23ffffff" opacity="0.88"/><text x="120" y="104" font-size="38" font-weight="900" fill="${bg}" text-anchor="middle" font-family="sans-serif">${initial}</text></svg>`;
      this.onerror = null;
    };
  }

  // Tab Switching
  tabQuiz.addEventListener('click', () => {
    tabQuiz.classList.add('active');
    tabStudy.classList.remove('active');
    showElement(quizFlowContainer);
    hideElement(studyFlowContainer);
    playSound('click');
  });

  tabStudy.addEventListener('click', () => {
    tabStudy.classList.add('active');
    tabQuiz.classList.remove('active');
    showElement(studyFlowContainer);
    hideElement(quizFlowContainer);
    playSound('click');
    renderRoster();
  });

  // Filter Selectors Setup
  if (quizTypeSelector) {
    quizTypeSelector.addEventListener('click', (e) => {
      const btn = e.target.closest('.mode-card-btn') || e.target.closest('.chip');
      if (!btn) return;
      quizTypeSelector.querySelectorAll('.mode-card-btn, .chip').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      selectedQuizType = btn.dataset.type;

      // Dynamically sync hero title & desc to selected mode
      const heroTitleEl = document.querySelector('.hero-title');
      const heroDescEl = document.querySelector('.hero-desc');
      if (selectedQuizType === 'number') {
        if (heroTitleEl) heroTitleEl.innerHTML = '등번호 보고<br><span class="highlight-red">선수 이름</span> 맞추기';
        if (heroDescEl) heroDescEl.textContent = '5개 종목 선수들의 고유 등번호와 포지션을 보고 누구인지 이름을 맞춰보세요!';
      } else {
        if (heroTitleEl) heroTitleEl.innerHTML = '얼굴 보고<br><span class="highlight-red">선수 이름</span> 맞추기';
        if (heroDescEl) heroDescEl.textContent = '5개 전 종목(농구, 야구, 빙구, 럭비, 축구) 194명의 얼굴과 전력분석 정보를 완벽하게 암기해보세요!';
      }

      playSound('click');
    });
  }

  difficultySelector.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    difficultySelector.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    selectedDifficulty = chip.dataset.difficulty;
    playSound('click');
  });

  sportSelector.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    sportSelector.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    selectedSport = chip.dataset.sport;
    playSound('click');
  });

  schoolSelector.addEventListener('click', (e) => {
    const chip = e.target.closest('.school-chip');
    if (!chip) return;
    schoolSelector.querySelectorAll('.school-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    selectedSchool = chip.dataset.school;
    playSound('click');
  });

  countSelector.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    countSelector.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    selectedCount = chip.dataset.count;
    playSound('click');
  });

  soundToggleBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundToggleBtn.textContent = soundEnabled ? '🔊' : '🔇';
    if (soundEnabled) playSound('click');
  });

  // ==================== THEME MANAGEMENT (Light / Dark) ====================
  function initTheme() {
    let savedTheme = null;
    try {
      savedTheme = localStorage.getItem('goyeonjeon_theme');
    } catch (e) {}
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    applyTheme(initialTheme, false);

    // Listen to OS system theme changes if user hasn't explicitly set preference
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        let hasSaved = false;
        try {
          hasSaved = !!localStorage.getItem('goyeonjeon_theme');
        } catch (err) {}
        if (!hasSaved) {
          applyTheme(e.matches ? 'dark' : 'light', false);
        }
      });
    }
  }

  function applyTheme(theme, save = true) {
    document.documentElement.setAttribute('data-theme', theme);
    if (save) {
      try {
        localStorage.setItem('goyeonjeon_theme', theme);
      } catch (err) {}
    }
    if (themeToggleBtn) {
      themeToggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
      themeToggleBtn.title = theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환';
      themeToggleBtn.setAttribute('aria-label', themeToggleBtn.title);
    }
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme, true);
    playSound('click');
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }

  initTheme();

  // Start Quiz
  startQuizBtn.addEventListener('click', () => {
    getAudioContext();
    playSound('click');
    startQuiz();
  });

  function startQuiz() {
    const allPlayers = window.GOYEONJEON_PLAYERS || [];
    if (!allPlayers.length) {
      alert('선수 데이터를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    let pool = allPlayers.filter(p => {
      const matchSport = (selectedSport === 'all') || (p.sport === selectedSport);
      const matchSchool = (selectedSchool === 'all') || (p.school === selectedSchool);
      // In 'number' mode (등번호 매칭), only include players with valid registered jersey numbers!
      const matchNumber = (selectedQuizType !== 'number') || (p.number && p.number !== '-');
      return matchSport && matchSchool && matchNumber;
    });

    if (pool.length < 4 && selectedDifficulty === 'choice') {
      pool = allPlayers.filter(p => {
        const matchSport = (selectedSport === 'all') || (p.sport === selectedSport);
        const matchNumber = (selectedQuizType !== 'number') || (p.number && p.number !== '-');
        return matchSport && matchNumber;
      });
    }

    if (!pool.length) {
      alert('선택하신 조건에 해당하는 선수가 없습니다. (등번호 매칭 모드는 등번호가 등록된 선수만 출제됩니다)');
      return;
    }

    const shuffled = [...pool].sort(() => Math.random() - 0.5);

    let totalQuestions = shuffled.length;
    if (selectedCount !== 'all') {
      const limit = parseInt(selectedCount, 10);
      totalQuestions = Math.min(limit, shuffled.length);
    }

    quizQuestions = shuffled.slice(0, totalQuestions);
    currentIndex = 0;
    score = 0;
    currentCombo = 0;
    userAnswers = [];
    skippedPlayers = [];

    startScreen.classList.remove('active');
    resultScreen.classList.remove('active');
    quizScreen.classList.add('active');

    loadQuestion();
  }

  function loadQuestion() {
    isAnswerLocked = false;
    hideElement(hintBox);
    hintBtn.textContent = '💡 힌트 보기';
    if (jerseyHintBtn) jerseyHintBtn.textContent = '💡 힌트 보기';

    const player = quizQuestions[currentIndex];
    const total = quizQuestions.length;

    // Status bar
    questionIndexText.textContent = `Q ${currentIndex + 1} / ${total}`;
    scoreCounterText.textContent = `점수: ${score}`;
    progressBarFill.style.width = `${((currentIndex) / total) * 100}%`;

    // Combo
    if (currentCombo >= 2) {
      comboBadge.textContent = `🔥 ${currentCombo}연속 정답!`;
      showElement(comboBadge);
    } else {
      hideElement(comboBadge);
    }

    // Meta Tags
    const icon = sportIcons[player.sport] || '🏅';
    cardSportTag.textContent = `${icon} ${player.sport}`;
    const diffLabel = selectedDifficulty === 'choice' ? '보통' : '어려움';
    const typeLabel = selectedQuizType === 'number' ? '등번호 매칭' : '얼굴 매칭';
    cardDiffTag.textContent = `${typeLabel} · ${diffLabel}`;

    // Mode Display: Face vs Jersey Number
    if (selectedQuizType === 'number') {
      hideElement(playerPhotoWrapper);
      showElement(jerseyCardWrapper);
      jerseyCard.className = `jersey-card ${player.school === '고려대' ? 'ku' : 'yu'}`;
      jerseySchoolBadge.textContent = (player.school === '고려대' ? '🔴 고려대학교' : '🔵 연세대학교');
      jerseyNumVal.textContent = player.number;
      jerseySportPill.textContent = `${icon} ${player.sport}`;
      jerseyPosPill.textContent = player.position ? `포지션: ${player.position}` : (player.grade || '선수');
      if (quizQuestionTitle) {
        quizQuestionTitle.textContent = `등번호 [${player.number}번] 선수의 이름은?`;
      }
    } else {
      showElement(playerPhotoWrapper);
      hideElement(jerseyCardWrapper);
      applyImageFallback(playerImg, player);
      playerImg.src = player.image;
      playerImg.alt = `${player.school} ${player.sport} 선수`;
      if (quizQuestionTitle) {
        quizQuestionTitle.textContent = '이 선수의 이름은?';
      }
    }

    // Hints
    hintNum.textContent = (player.number && player.number !== '-') ? `${player.number}번` : '미기재';
    hintPos.textContent = `${player.position || '선수'}${player.grade ? ' · ' + player.grade : ''}`;
    hintChosung.textContent = player.chosung || '-';
    const sampleTip = (player.highlights && player.highlights.length)
      ? player.highlights[Math.floor(Math.random() * player.highlights.length)]
      : '2026 고연전 공식 엔트리';
    hintText.textContent = sampleTip;

    // Render Mode Form
    if (selectedDifficulty === 'choice') {
      showElement(optionsContainer);
      hideElement(inputModeContainer);
      generateChoiceOptions(player);
    } else {
      hideElement(optionsContainer);
      showElement(inputModeContainer);
      textAnswerInput.value = '';
      textAnswerInput.disabled = false;
      textSubmitBtn.disabled = false;
      setTimeout(() => {
        textAnswerInput.focus();
        if (textAnswerInput.scrollIntoView) {
          textAnswerInput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 150);
    }
  }

  // 4 Multiple Choice (Names ONLY - No school tags!)
  function generateChoiceOptions(targetPlayer) {
    const allPlayers = window.GOYEONJEON_PLAYERS || [];
    
    // Pick 3 distractors: prefer same sport
    let candidates = allPlayers.filter(p => p.name !== targetPlayer.name && p.sport === targetPlayer.sport);
    if (candidates.length < 3) {
      candidates = allPlayers.filter(p => p.name !== targetPlayer.name);
    }

    // Deduplicate candidates by name so identical names don't appear twice among choices
    const uniqueCandidateNames = new Set([targetPlayer.name]);
    const validCandidates = [];
    const shuffledCandidates = [...candidates].sort(() => Math.random() - 0.5);
    for (const c of shuffledCandidates) {
      if (!uniqueCandidateNames.has(c.name)) {
        uniqueCandidateNames.add(c.name);
        validCandidates.push(c);
        if (validCandidates.length === 3) break;
      }
    }

    const options = [targetPlayer, ...validCandidates].sort(() => Math.random() - 0.5);

    optionsContainer.innerHTML = '';
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      // Only the player's name is displayed!
      btn.textContent = opt.name;
      btn.addEventListener('click', () => handleChoiceSubmit(btn, opt, targetPlayer));
      optionsContainer.appendChild(btn);
    });
  }

  function handleChoiceSubmit(clickedBtn, selectedPlayer, targetPlayer) {
    if (isAnswerLocked) return;
    isAnswerLocked = true;

    const isCorrect = (selectedPlayer.name === targetPlayer.name);

    if (isCorrect) {
      score += 10;
      currentCombo++;
      clickedBtn.classList.add('correct');
      playSound('correct');
      triggerHaptic('correct');
    } else {
      currentCombo = 0;
      clickedBtn.classList.add('wrong');
      playSound('wrong');
      triggerHaptic('wrong');

      const allBtns = optionsContainer.querySelectorAll('.option-btn');
      allBtns.forEach(btn => {
        if (btn.textContent.trim() === targetPlayer.name) {
          btn.classList.add('correct');
        }
      });
    }

    userAnswers.push({
      player: targetPlayer,
      chosenName: selectedPlayer.name,
      isCorrect: isCorrect,
      isSkipped: false
    });

    setTimeout(() => {
      showModal(targetPlayer, isCorrect, false);
    }, 450);
  }

  // Direct Text Input Submit (Hard Mode)
  textAnswerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (isAnswerLocked) return;
    const targetPlayer = quizQuestions[currentIndex];
    const userVal = textAnswerInput.value.normalize('NFC').replace(/\s/g, '').toLowerCase();
    if (!userVal) {
      textAnswerInput.focus();
      return;
    }

    isAnswerLocked = true;
    textAnswerInput.disabled = true;
    textSubmitBtn.disabled = true;

    const targetVal = targetPlayer.name.normalize('NFC').replace(/\s/g, '').toLowerCase();
    const isCorrect = (userVal === targetVal);

    if (isCorrect) {
      score += 15; // Extra points for hard mode!
      currentCombo++;
      textAnswerInput.style.borderColor = '#3fb950';
      playSound('correct');
      triggerHaptic('correct');
    } else {
      currentCombo = 0;
      textAnswerInput.style.borderColor = '#f85149';
      playSound('wrong');
      triggerHaptic('wrong');
    }

    userAnswers.push({
      player: targetPlayer,
      chosenName: textAnswerInput.value.trim(),
      isCorrect: isCorrect,
      isSkipped: false
    });

    setTimeout(() => {
      textAnswerInput.style.borderColor = '';
      showModal(targetPlayer, isCorrect, false);
    }, 450);
  });

  // Skip question
  skipQuestionBtn.addEventListener('click', () => {
    if (isAnswerLocked) return;
    const targetPlayer = quizQuestions[currentIndex];
    currentCombo = 0;
    userAnswers.push({
      player: targetPlayer,
      chosenName: '(건너뜀)',
      isCorrect: false,
      isSkipped: true
    });
    skippedPlayers.push(targetPlayer);

    showModal(targetPlayer, false, true);
  });

  // Show Chosung button in hard mode
  showChosungBtn.addEventListener('click', () => {
    showElement(hintBox);
    hintBtn.textContent = '💡 힌트 접기';
    if (jerseyHintBtn) jerseyHintBtn.textContent = '💡 힌트 접기';
    playSound('click');
  });

  // Hint Toggle
  function toggleHintBox() {
    const isHidden = hintBox.hidden || hintBox.classList.contains('hidden');
    if (isHidden) {
      showElement(hintBox);
      hintBtn.textContent = '💡 힌트 접기';
      if (jerseyHintBtn) jerseyHintBtn.textContent = '💡 힌트 접기';
    } else {
      hideElement(hintBox);
      hintBtn.textContent = '💡 힌트 보기';
      if (jerseyHintBtn) jerseyHintBtn.textContent = '💡 힌트 보기';
    }
    playSound('click');
  }

  hintBtn.addEventListener('click', toggleHintBox);
  if (jerseyHintBtn) {
    jerseyHintBtn.addEventListener('click', toggleHintBox);
  }

  // Explanation / Profile Modal
  function showModal(player, isCorrect, isSkipped) {
    const isStudyMode = (!studyFlowContainer.hidden);
    const isResultReview = (resultScreen.classList.contains('active'));

    if (isStudyMode) {
      modalResultBanner.className = `result-banner info-banner ${player.school === '고려대' ? 'ku' : 'yu'}`;
      modalResultBanner.querySelector('.result-icon').textContent = (player.school === '고려대' ? '🔴' : '🔵');
      modalResultBanner.querySelector('.result-title').textContent = `${player.school} ${player.sport} · ${player.name} 선수`;
    } else if (isResultReview) {
      if (isSkipped) {
        modalResultBanner.className = 'result-banner skipped';
        modalResultBanner.querySelector('.result-icon').textContent = '⏩';
        modalResultBanner.querySelector('.result-title').textContent = `건너뜀 · ${player.name} 선수`;
      } else if (isCorrect) {
        modalResultBanner.className = 'result-banner correct';
        modalResultBanner.querySelector('.result-icon').textContent = '⭕';
        modalResultBanner.querySelector('.result-title').textContent = `정답! · ${player.name} 선수`;
      } else {
        modalResultBanner.className = 'result-banner wrong';
        modalResultBanner.querySelector('.result-icon').textContent = '❌';
        modalResultBanner.querySelector('.result-title').textContent = `오답 · 정답은 ${player.name} 선수`;
      }
    } else {
      if (isSkipped) {
        modalResultBanner.className = 'result-banner skipped';
        modalResultBanner.querySelector('.result-icon').textContent = '⏩';
        modalResultBanner.querySelector('.result-title').textContent = `건너뜀: 이 선수는 ${player.name} 선수입니다.`;
      } else if (isCorrect) {
        modalResultBanner.className = 'result-banner correct';
        modalResultBanner.querySelector('.result-icon').textContent = '⭕';
        modalResultBanner.querySelector('.result-title').textContent = '정답입니다!';
      } else {
        modalResultBanner.className = 'result-banner wrong';
        modalResultBanner.querySelector('.result-icon').textContent = '❌';
        modalResultBanner.querySelector('.result-title').textContent = `아쉬워요! 정답은 ${player.name} 선수입니다.`;
      }
    }

    applyImageFallback(modalPlayerImg, player);
    modalPlayerImg.src = player.image;

    // Photo School Tag
    if (modalPhotoBadge) {
      modalPhotoBadge.className = `modal-photo-tag ${player.school === '고려대' ? 'ku' : 'yu'}`;
      modalPhotoBadge.textContent = `${player.school === '고려대' ? '🔴 고려대학교' : '🔵 연세대학교'}`;
    }

    // Name & Badges
    modalName.textContent = player.name;

    if (modalNumBadge) {
      if (player.number && player.number !== '-') {
        modalNumBadge.textContent = `No. ${player.number}`;
        modalNumBadge.style.display = 'inline-flex';
      } else {
        modalNumBadge.style.display = 'none';
      }
    }

    if (modalSchoolBadge) {
      modalSchoolBadge.textContent = `${player.school} · ${player.sport}`;
      modalSchoolBadge.className = `modal-badge-pill ${player.school === '고려대' ? 'ku' : 'yu'}`;
    }

    if (modalPosBadge) {
      if (player.position) {
        modalPosBadge.textContent = player.position;
        modalPosBadge.style.display = 'inline-flex';
      } else {
        modalPosBadge.style.display = 'none';
      }
    }

    if (modalGradeBadge) {
      if (player.grade) {
        modalGradeBadge.textContent = player.grade;
        modalGradeBadge.style.display = 'inline-flex';
      } else {
        modalGradeBadge.style.display = 'none';
      }
    }

    // Highlights list
    modalHighlightsList.innerHTML = '';
    if (player.highlights && player.highlights.length) {
      player.highlights.forEach(h => {
        const li = document.createElement('li');
        li.textContent = h;
        modalHighlightsList.appendChild(li);
      });
    } else {
      const li = document.createElement('li');
      li.textContent = '등록된 추가 전력분석 정보가 없습니다.';
      modalHighlightsList.appendChild(li);
    }

    // Button Label
    if (isStudyMode || isResultReview) {
      modalNextBtn.querySelector('span:first-child').textContent = '닫기';
    } else {
      const isLast = (currentIndex === quizQuestions.length - 1);
      modalNextBtn.querySelector('span:first-child').textContent = isLast ? '최종 결과 확인하기' : '다음 문제 풀기';
    }

    showElement(modalOverlay);
  }

  function handleModalDismiss() {
    hideElement(modalOverlay);
    playSound('click');
    if (!studyFlowContainer.hidden || resultScreen.classList.contains('active')) {
      return;
    }
    currentIndex++;
    if (currentIndex < quizQuestions.length) {
      loadQuestion();
    } else {
      showResults();
    }
  }

  modalNextBtn.addEventListener('click', handleModalDismiss);
  if (modalCloseIcon) {
    modalCloseIcon.addEventListener('click', handleModalDismiss);
  }
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        handleModalDismiss();
      }
    });
  }

  // Give Up
  giveUpBtn.addEventListener('click', () => {
    if (confirm('현재 진행 상황을 마무리하고 결과를 확인할까요?')) {
      showResults();
    }
  });

  // Results Screen
  function showResults() {
    quizScreen.classList.remove('active');
    modalOverlay.classList.add('hidden');
    resultScreen.classList.add('active');

    const total = userAnswers.length || 1;
    const correctCount = userAnswers.filter(a => a.isCorrect).length;
    const accuracy = Math.round((correctCount / total) * 100);

    finalScoreDisplay.textContent = `${correctCount} / ${total}`;
    finalAccuracyDisplay.textContent = `정답률 ${accuracy}% (총점: ${score}점)`;

    if (accuracy === 100) {
      resultTitle.textContent = '🏆 완벽합니다! 2026 고연전 마스터!';
    } else if (accuracy >= 80) {
      resultTitle.textContent = '👏 대단해요! 고연전 준전문가 수준!';
    } else if (accuracy >= 50) {
      resultTitle.textContent = '👍 좋은 성적입니다! 조금만 더 복습해봐요!';
    } else {
      resultTitle.textContent = '💪 아직 낯선 얼굴들이 있죠? 도감에서 확인해보세요!';
    }

    countAllSolved.textContent = userAnswers.length;
    countSkipped.textContent = skippedPlayers.length;

    currentReviewTab = 'all';
    reviewTabAll.classList.add('active');
    reviewTabSkipped.classList.remove('active');
    renderReviewList();
  }

  function renderReviewList() {
    reviewListContainer.innerHTML = '';
    const listToRender = (currentReviewTab === 'all') 
      ? userAnswers 
      : userAnswers.filter(a => a.isSkipped);

    if (!listToRender.length) {
      reviewListContainer.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-muted); font-size:0.85rem;">해당하는 선수가 없습니다.</div>';
      return;
    }

    listToRender.forEach(ans => {
      const p = ans.player;
      const item = document.createElement('div');
      let statusClass = ans.isSkipped ? 'was-skipped' : (ans.isCorrect ? 'was-correct' : 'was-wrong');
      let statusIcon = ans.isSkipped ? '⏩' : (ans.isCorrect ? '✅' : '❌');

      item.className = `review-item ${statusClass}`;
      item.innerHTML = `
        <img class="review-thumb" src="${p.image}" alt="${p.name}">
        <div class="review-info">
          <div class="review-name">${p.name} ${statusIcon}</div>
          <div class="review-sub">${p.school} · ${p.sport} · ${p.number !== '-' ? '등번호 ' + p.number + '번' : ''}</div>
        </div>
      `;
      const thumb = item.querySelector('.review-thumb');
      applyImageFallback(thumb, p);
      // Clicking review item opens the player modal
      item.addEventListener('click', () => {
        showModal(p, ans.isCorrect, ans.isSkipped);
        modalNextBtn.querySelector('span:first-child').textContent = '닫기';
      });
      reviewListContainer.appendChild(item);
    });
  }

  reviewTabAll.addEventListener('click', () => {
    currentReviewTab = 'all';
    reviewTabAll.classList.add('active');
    reviewTabSkipped.classList.remove('active');
    renderReviewList();
  });

  reviewTabSkipped.addEventListener('click', () => {
    currentReviewTab = 'skipped';
    reviewTabSkipped.classList.add('active');
    reviewTabAll.classList.remove('active');
    renderReviewList();
  });

  retryBtn.addEventListener('click', () => {
    playSound('click');
    startQuiz();
  });

  changeModeBtn.addEventListener('click', () => {
    playSound('click');
    resultScreen.classList.remove('active');
    startScreen.classList.add('active');
  });

  shareBtn.addEventListener('click', () => {
    playSound('click');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('퀴즈 페이지 링크가 복사되었습니다!');
      });
    } else {
      alert(`링크: ${window.location.href}`);
    }
  });

  // ==================== SCORE BRAG CARD GENERATION (HTML5 Canvas) ====================
  function generateScoreCard() {
    if (!bragCanvas) return null;
    const ctx = bragCanvas.getContext('2d');
    const width = 800;
    const height = 1000;
    bragCanvas.width = width;
    bragCanvas.height = height;

    const isDark = (document.documentElement.getAttribute('data-theme') === 'dark');

    // Stats calculation
    const total = userAnswers.length || 1;
    const correctCount = userAnswers.filter(a => a.isCorrect).length;
    const wrongCount = userAnswers.filter(a => !a.isCorrect && !a.isSkipped).length;
    const skippedCount = skippedPlayers.length;
    const accuracy = Math.round((correctCount / total) * 100);

    // Color definitions based on theme
    const colors = {
      canvasBg: isDark ? '#121316' : '#f2f4f6',
      cardBg: isDark ? '#1c1d22' : '#ffffff',
      cardBorder: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
      boxBg: isDark ? '#25262e' : '#f9fafb',
      boxBorder: isDark ? 'rgba(255, 255, 255, 0.06)' : '#e5e8eb',
      textPrimary: isDark ? '#f9fafb' : '#191f28',
      textSecondary: isDark ? '#b0b8c1' : '#4e5968',
      textTertiary: isDark ? '#6b7684' : '#8b95a1',
      blue: '#3182f6',
      crimson: isDark ? '#f87171' : '#d32f2f',
      yuBlue: isDark ? '#38bdf8' : '#004b97',
      green: isDark ? '#10b981' : '#059669',
      red: isDark ? '#f87171' : '#dc2626',
      orange: isDark ? '#fbbf24' : '#d97706'
    };

    // Helper: Rounded Rectangle
    function roundRect(x, y, w, h, r, fill, stroke, strokeW) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
      }
      if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = strokeW || 1;
        ctx.stroke();
      }
    }

    // 1. Canvas Background
    ctx.fillStyle = colors.canvasBg;
    ctx.fillRect(0, 0, width, height);

    // Decorative ambient circles
    const gradKU = ctx.createRadialGradient(80, 80, 20, 80, 80, 240);
    gradKU.addColorStop(0, isDark ? 'rgba(239, 68, 68, 0.16)' : 'rgba(211, 47, 47, 0.08)');
    gradKU.addColorStop(1, 'transparent');
    ctx.fillStyle = gradKU;
    ctx.fillRect(0, 0, 400, 400);

    const gradYU = ctx.createRadialGradient(720, 80, 20, 720, 80, 240);
    gradYU.addColorStop(0, isDark ? 'rgba(56, 189, 248, 0.18)' : 'rgba(0, 75, 151, 0.08)');
    gradYU.addColorStop(1, 'transparent');
    ctx.fillStyle = gradYU;
    ctx.fillRect(400, 0, 400, 400);

    // 2. Main Floating Card
    roundRect(40, 40, 720, 920, 28, colors.cardBg, colors.cardBorder, 2);

    // 3. Brand Pill
    roundRect(240, 80, 320, 36, 18, isDark ? 'rgba(49, 130, 246, 0.18)' : '#e8f3ff', isDark ? 'rgba(49, 130, 246, 0.35)' : 'rgba(49, 130, 246, 0.2)', 1.5);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '800 15px "Pretendard", -apple-system, sans-serif';
    ctx.fillStyle = colors.blue;
    ctx.fillText('🔴 KU vs YU 🔵 · 2026 정기고연전', 400, 98);

    // 4. Header Titles
    ctx.font = '900 34px "Pretendard", -apple-system, sans-serif';
    ctx.fillStyle = colors.textPrimary;
    ctx.fillText('선수 얼굴 매칭 퀴즈 성적표', 400, 155);

    ctx.font = '700 15px "Pretendard", -apple-system, sans-serif';
    ctx.fillStyle = colors.textSecondary;
    ctx.fillText('KUBS 고려대학교 교육방송국 전력분석', 400, 190);

    // 5. Divider Line
    ctx.beginPath();
    ctx.moveTo(80, 218);
    ctx.lineTo(720, 218);
    ctx.strokeStyle = colors.boxBorder;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 6. Tier Calculation & Badge
    let tierTitle = '';
    let tierColor = '';
    let subQuote = '';
    if (accuracy === 100) {
      tierTitle = '🔥 고연전 전력분석의 신 (마스터)';
      tierColor = '#f59e0b';
      subQuote = '194명 엔트리를 완벽하게 암기한 고연전의 살아있는 백과사전!';
    } else if (accuracy >= 80) {
      tierTitle = '🎖️ 정기고연전 준전문가 (상위 5%)';
      tierColor = colors.blue;
      subQuote = '놀라운 눈썰미! 중계 해설진 급의 날카로운 전력분석력!';
    } else if (accuracy >= 60) {
      tierTitle = '🎓 든든한 고연전 서포터';
      tierColor = colors.green;
      subQuote = '선수들의 얼굴을 척척 알아보는 진정한 고연전 학우!';
    } else if (accuracy >= 40) {
      tierTitle = '🌱 열정 넘치는 고연전 루키';
      tierColor = '#8b5cf6';
      subQuote = '응원의 첫걸음! 도감에서 조금만 더 복습해보세요!';
    } else {
      tierTitle = '📖 전력분석 도감 입문자';
      tierColor = colors.textSecondary;
      subQuote = '아직 낯선 얼굴들이 있죠? 선수 도감에서 얼굴을 익혀봐요!';
    }

    roundRect(200, 245, 400, 44, 22, isDark ? 'rgba(49, 130, 246, 0.12)' : '#f0f6ff', tierColor, 2);
    ctx.font = '900 17px "Pretendard", -apple-system, sans-serif';
    ctx.fillStyle = tierColor;
    ctx.fillText(tierTitle, 400, 267);

    // 7. Large Score Display
    ctx.font = '900 78px "Pretendard", -apple-system, sans-serif';
    ctx.fillStyle = colors.blue;
    ctx.fillText(`${correctCount} / ${total}`, 400, 355);

    ctx.font = '800 22px "Pretendard", -apple-system, sans-serif';
    ctx.fillStyle = colors.textPrimary;
    ctx.fillText(`정답률 ${accuracy}% (총 ${score}점 획득)`, 400, 408);

    ctx.font = '600 15px "Pretendard", -apple-system, sans-serif';
    ctx.fillStyle = colors.textSecondary;
    ctx.fillText(`"${subQuote}"`, 400, 442);

    // 8. Quiz Setting 3-Box Grid
    const sportName = (selectedSport === 'all') ? '🏆 전 종목' : `${sportIcons[selectedSport] || ''} ${selectedSport}`;
    const diffName = (selectedDifficulty === 'choice') ? '보통' : '어려움';
    const schoolName = (selectedSchool === 'all') ? '양교 전체' : (selectedSchool === '고려대' ? '🔴 고려대만' : '🔵 연세대만');

    const boxY = 480;
    const boxH = 88;
    const boxW = 195;

    // Box 1: 종목
    roundRect(75, boxY, boxW, boxH, 16, colors.boxBg, colors.boxBorder, 1.5);
    ctx.font = '700 13px "Pretendard", -apple-system, sans-serif';
    ctx.fillStyle = colors.textTertiary;
    ctx.fillText('응시 종목', 75 + boxW / 2, boxY + 28);
    ctx.font = '800 15px "Pretendard", -apple-system, sans-serif';
    ctx.fillStyle = colors.textPrimary;
    ctx.fillText(sportName, 75 + boxW / 2, boxY + 58);

    // Box 2: 난이도
    roundRect(302, boxY, boxW, boxH, 16, colors.boxBg, colors.boxBorder, 1.5);
    ctx.font = '700 13px "Pretendard", -apple-system, sans-serif';
    ctx.fillStyle = colors.textTertiary;
    ctx.fillText('퀴즈 난이도', 302 + boxW / 2, boxY + 28);
    ctx.font = '800 15px "Pretendard", -apple-system, sans-serif';
    ctx.fillStyle = colors.textPrimary;
    ctx.fillText(diffName, 302 + boxW / 2, boxY + 58);

    // Box 3: 대상 학교
    roundRect(530, boxY, boxW, boxH, 16, colors.boxBg, colors.boxBorder, 1.5);
    ctx.font = '700 13px "Pretendard", -apple-system, sans-serif';
    ctx.fillStyle = colors.textTertiary;
    ctx.fillText('출제 범위', 530 + boxW / 2, boxY + 28);
    ctx.font = '800 15px "Pretendard", -apple-system, sans-serif';
    ctx.fillStyle = colors.textPrimary;
    ctx.fillText(schoolName, 530 + boxW / 2, boxY + 58);

    // 9. Detailed Stats Box
    const statBoxY = 590;
    const statBoxH = 135;
    roundRect(75, statBoxY, 650, statBoxH, 20, colors.boxBg, colors.boxBorder, 1.5);

    // Correct
    ctx.font = '700 14px "Pretendard", -apple-system, sans-serif';
    ctx.fillStyle = colors.textSecondary;
    ctx.fillText('정답', 183, statBoxY + 36);
    ctx.font = '900 24px "Pretendard", -apple-system, sans-serif';
    ctx.fillStyle = colors.green;
    ctx.fillText(`${correctCount}명`, 183, statBoxY + 70);

    // Wrong
    ctx.font = '700 14px "Pretendard", -apple-system, sans-serif';
    ctx.fillStyle = colors.textSecondary;
    ctx.fillText('오답', 400, statBoxY + 36);
    ctx.font = '900 24px "Pretendard", -apple-system, sans-serif';
    ctx.fillStyle = colors.red;
    ctx.fillText(`${wrongCount}명`, 400, statBoxY + 70);

    // Skipped
    ctx.font = '700 14px "Pretendard", -apple-system, sans-serif';
    ctx.fillStyle = colors.textSecondary;
    ctx.fillText('건너뜀', 616, statBoxY + 36);
    ctx.font = '900 24px "Pretendard", -apple-system, sans-serif';
    ctx.fillStyle = colors.orange;
    ctx.fillText(`${skippedCount}명`, 616, statBoxY + 70);

    // Divider inside stat box
    ctx.beginPath();
    ctx.moveTo(95, statBoxY + 95);
    ctx.lineTo(705, statBoxY + 95);
    ctx.strokeStyle = colors.boxBorder;
    ctx.stroke();

    ctx.font = '700 13px "Pretendard", -apple-system, sans-serif';
    ctx.fillStyle = colors.textSecondary;
    ctx.fillText(`🔥 푼 문제 수: ${total}문항 | 등록 선수 194명 전원 탑재`, 400, statBoxY + 115);

    // 10. Footer Section
    const nowStr = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
    ctx.font = '700 13px "Pretendard", -apple-system, sans-serif';
    ctx.fillStyle = colors.textTertiary;
    ctx.fillText(`${nowStr} · KUBS 고려대학교 교육방송국 공식 인증`, 400, 775);

    // URL Pill
    roundRect(220, 805, 360, 42, 21, isDark ? 'rgba(49, 130, 246, 0.16)' : '#e8f3ff', colors.blue, 1.5);
    ctx.font = '800 14px "Pretendard", -apple-system, sans-serif';
    ctx.fillStyle = colors.blue;
    ctx.fillText('🔗 kubs-player-quiz-2026.netlify.app', 400, 826);

    return bragCanvas.toDataURL('image/png');
  }

  function downloadScoreImage(dataUrl) {
    const total = userAnswers.length || 1;
    const correctCount = userAnswers.filter(a => a.isCorrect).length;
    const accuracy = Math.round((correctCount / total) * 100);

    const link = document.createElement('a');
    link.download = `2026_고연전_선수퀴즈_${accuracy}점.png`;
    link.href = dataUrl || bragPreviewImg.src;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Open Brag Modal & Generate Image
  if (bragScoreBtn) {
    bragScoreBtn.addEventListener('click', () => {
      playSound('click');
      const dataUrl = generateScoreCard();
      if (!dataUrl) return;

      bragPreviewImg.src = dataUrl;
      showElement(bragModalOverlay);

      // Automatically trigger download
      downloadScoreImage(dataUrl);
    });
  }

  if (bragDownloadBtn) {
    bragDownloadBtn.addEventListener('click', () => {
      playSound('click');
      downloadScoreImage(bragPreviewImg.src);
    });
  }

  if (bragShareNativeBtn) {
    bragShareNativeBtn.addEventListener('click', async () => {
      playSound('click');
      const total = userAnswers.length || 1;
      const correctCount = userAnswers.filter(a => a.isCorrect).length;
      const accuracy = Math.round((correctCount / total) * 100);

      if (navigator.share && bragCanvas) {
        try {
          bragCanvas.toBlob(async (blob) => {
            if (!blob) return;
            const file = new File([blob], `2026_고연전_선수퀴즈_${accuracy}점.png`, { type: 'image/png' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              await navigator.share({
                title: '2026 고연전 선수 얼굴 매칭 퀴즈',
                text: `나 2026 고연전 선수 얼굴 퀴즈에서 ${accuracy}% 맞췄어! 너도 194명 다 맞출 수 있는지 도전해봐!`,
                files: [file]
              });
            } else {
              await navigator.share({
                title: '2026 고연전 선수 얼굴 매칭 퀴즈',
                text: `나 2026 고연전 선수 얼굴 퀴즈에서 ${accuracy}% 맞췄어! 너도 도전해봐! 👉 https://kubs-player-quiz-2026.netlify.app`,
                url: window.location.href
              });
            }
          });
          return;
        } catch (err) {
          console.log('Share canceled or failed', err);
        }
      }

      // Fallback: Copy link
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href).then(() => {
          alert('퀴즈 페이지 링크가 복사되었습니다! 친구들에게 공유해보세요.');
        });
      } else {
        alert(`퀴즈 링크: ${window.location.href}`);
      }
    });
  }

  if (bragModalCloseIcon) {
    bragModalCloseIcon.addEventListener('click', () => {
      hideElement(bragModalOverlay);
      playSound('click');
    });
  }

  if (bragModalOverlay) {
    bragModalOverlay.addEventListener('click', (e) => {
      if (e.target === bragModalOverlay) {
        hideElement(bragModalOverlay);
        playSound('click');
      }
    });
  }

  // ==================== STUDY / ROSTER LOGIC ====================
  function renderRoster() {
    const allPlayers = window.GOYEONJEON_PLAYERS || [];
    const query = studySearchInput.value.trim().toLowerCase();
    const sportFilter = currentStudySport;
    const schoolFilter = currentStudySchool;

    const filtered = allPlayers.filter(p => {
      const matchSport = (sportFilter === 'all') || (p.sport === sportFilter);
      const matchSchool = (schoolFilter === 'all') || (p.school === schoolFilter);
      const matchQuery = !query || 
        p.name.toLowerCase().includes(query) || 
        (p.number && p.number.includes(query)) ||
        (p.position && p.position.toLowerCase().includes(query));
      return matchSport && matchSchool && matchQuery;
    });

    studyCountInfo.textContent = `전체 ${allPlayers.length}명 중 ${filtered.length}명 표시`;

    rosterGridContainer.innerHTML = '';
    filtered.forEach(p => {
      const card = document.createElement('article');
      card.className = `roster-card ${p.school === '고려대' ? 'ku' : 'yu'}`;
      card.innerHTML = `
        <div class="roster-photo">
          <img src="${p.image}" alt="${p.name}" loading="lazy">
        </div>
        <div class="roster-name">${p.name}</div>
        <div class="roster-meta">${p.school} · ${p.sport}</div>
        <div class="roster-meta roster-num">${p.number !== '-' ? 'No.' + p.number : ''} ${p.position || ''}</div>
      `;
      const img = card.querySelector('img');
      applyImageFallback(img, p);
      card.addEventListener('click', () => {
        playSound('click');
        showModal(p, true, false);
      });
      rosterGridContainer.appendChild(card);
    });
  }

  studySearchInput.addEventListener('input', renderRoster);

  if (studySchoolChips) {
    studySchoolChips.addEventListener('click', (e) => {
      const chip = e.target.closest('.study-filter-chip');
      if (!chip) return;
      studySchoolChips.querySelectorAll('.study-filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentStudySchool = chip.dataset.school;
      playSound('click');
      renderRoster();
    });
  }

  if (studySportChips) {
    studySportChips.addEventListener('click', (e) => {
      const chip = e.target.closest('.study-sport-chip');
      if (!chip) return;
      studySportChips.querySelectorAll('.study-sport-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentStudySport = chip.dataset.sport;
      playSound('click');
      renderRoster();
    });
  }

})();
