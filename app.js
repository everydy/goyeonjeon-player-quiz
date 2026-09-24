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
  const modalOverlay = document.getElementById('modal-overlay');

  // Filter Selectors (Quiz Start)
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
  const playerImg = document.getElementById('player-img');

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
  const modalResultBanner = document.getElementById('modal-result-banner');
  const modalPlayerImg = document.getElementById('modal-player-img');
  const modalSchoolBadge = document.getElementById('modal-school-badge');
  const modalName = document.getElementById('modal-name');
  const modalDetails = document.getElementById('modal-details');
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

  // Study View Elements
  const studySearchInput = document.getElementById('study-search-input');
  const studySportFilter = document.getElementById('study-sport-filter');
  const studySchoolFilter = document.getElementById('study-school-filter');
  const studyCountInfo = document.getElementById('study-count-info');
  const rosterGridContainer = document.getElementById('roster-grid-container');

  // App State
  let soundEnabled = true;
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
      return matchSport && matchSchool;
    });

    if (pool.length < 4 && selectedDifficulty === 'choice') {
      pool = allPlayers.filter(p => selectedSport === 'all' || p.sport === selectedSport);
    }

    if (!pool.length) {
      alert('선택하신 조건에 해당하는 선수가 없습니다.');
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
    cardDiffTag.textContent = selectedDifficulty === 'choice' ? '보통' : '어려움';

    // Photo with error fallback
    applyImageFallback(playerImg, player);
    playerImg.src = player.image;
    playerImg.alt = `${player.school} ${player.sport} 선수`;

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
    playSound('click');
  });

  // Hint Toggle
  hintBtn.addEventListener('click', () => {
    const isHidden = hintBox.hidden || hintBox.classList.contains('hidden');
    if (isHidden) {
      showElement(hintBox);
      hintBtn.textContent = '💡 힌트 접기';
    } else {
      hideElement(hintBox);
      hintBtn.textContent = '💡 힌트 보기';
    }
    playSound('click');
  });

  // Explanation Modal
  function showModal(player, isCorrect, isSkipped) {
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

    applyImageFallback(modalPlayerImg, player);
    modalPlayerImg.src = player.image;
    modalSchoolBadge.textContent = `${player.school} · ${player.sport}`;
    modalSchoolBadge.style.color = player.school === '고려대' ? '#ff6b81' : '#60a5fa';
    modalName.textContent = player.name;

    const numStr = (player.number && player.number !== '-') ? `등번호 ${player.number}번` : '등번호 미기재';
    const posStr = player.position ? ` · ${player.position}` : '';
    const gradeStr = player.grade ? ` · ${player.grade}` : '';
    modalDetails.textContent = `${numStr}${posStr}${gradeStr}`;

    modalHighlightsList.innerHTML = '';
    if (player.highlights && player.highlights.length) {
      player.highlights.forEach(h => {
        const li = document.createElement('li');
        li.textContent = h;
        modalHighlightsList.appendChild(li);
      });
    }

    const isLast = (currentIndex === quizQuestions.length - 1);
    modalNextBtn.querySelector('span:first-child').textContent = isLast ? '최종 결과 확인하기' : '다음 문제 풀기';

    showElement(modalOverlay);
  }

  modalNextBtn.addEventListener('click', () => {
    hideElement(modalOverlay);
    playSound('click');
    // If opened from Study mode or Results Review mode, just close the modal!
    if (!studyFlowContainer.hidden || resultScreen.classList.contains('active')) {
      return;
    }
    currentIndex++;
    if (currentIndex < quizQuestions.length) {
      loadQuestion();
    } else {
      showResults();
    }
  });

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

  // ==================== STUDY / ROSTER LOGIC ====================
  function renderRoster() {
    const allPlayers = window.GOYEONJEON_PLAYERS || [];
    const query = studySearchInput.value.trim().toLowerCase();
    const sportFilter = studySportFilter.value;
    const schoolFilter = studySchoolFilter.value;

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
        showModal(p, true, false);
        modalResultBanner.className = 'result-banner correct';
        modalResultBanner.querySelector('.result-icon').textContent = '📋';
        modalResultBanner.querySelector('.result-title').textContent = `${p.school} ${p.name} 선수`;
        modalNextBtn.querySelector('span:first-child').textContent = '닫기';
      });
      rosterGridContainer.appendChild(card);
    });
  }

  studySearchInput.addEventListener('input', renderRoster);
  studySportFilter.addEventListener('change', renderRoster);
  studySchoolFilter.addEventListener('change', renderRoster);

})();
