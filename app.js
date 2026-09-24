// 2026 고연전 선수 얼굴 매칭 퀴즈 App Logic
(function() {
  // Elements
  const startScreen = document.getElementById('start-screen');
  const quizScreen = document.getElementById('quiz-screen');
  const resultScreen = document.getElementById('result-screen');
  const modalOverlay = document.getElementById('modal-overlay');

  // Selectors
  const sportSelector = document.getElementById('sport-selector');
  const schoolSelector = document.getElementById('school-selector');
  const countSelector = document.getElementById('count-selector');
  const startQuizBtn = document.getElementById('start-quiz-btn');
  const soundToggleBtn = document.getElementById('sound-toggle-btn');

  // Quiz DOM Elements
  const questionIndexText = document.getElementById('question-index-text');
  const scoreCounterText = document.getElementById('score-counter-text');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const comboBadge = document.getElementById('combo-badge');
  const cardSportTag = document.getElementById('card-sport-tag');
  const cardSchoolTag = document.getElementById('card-school-tag');
  const playerImg = document.getElementById('player-img');
  const hintBtn = document.getElementById('hint-btn');
  const hintBox = document.getElementById('hint-box');
  const hintPos = document.getElementById('hint-pos');
  const hintNum = document.getElementById('hint-num');
  const hintText = document.getElementById('hint-text');
  const optionsContainer = document.getElementById('options-container');
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
  const reviewListContainer = document.getElementById('review-list-container');
  const retryBtn = document.getElementById('retry-btn');
  const changeModeBtn = document.getElementById('change-mode-btn');
  const shareBtn = document.getElementById('share-btn');

  // State
  let soundEnabled = true;
  let selectedSport = 'all';
  let selectedSchool = 'all';
  let selectedCount = 10;

  let quizQuestions = [];
  let currentIndex = 0;
  let score = 0;
  let currentCombo = 0;
  let userAnswers = []; // { player, chosenName, isCorrect }
  let isAnswerLocked = false;

  // Web Audio Synth for crisp sound effects without external audio files
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
        // Cheerful chord
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.15); // G5
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'wrong') {
        // Low double buzz
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
    } catch (e) {
      // Audio fallback fail silently
    }
  }

  function triggerHaptic(type) {
    if (navigator.vibrate) {
      if (type === 'correct') navigator.vibrate(40);
      else if (type === 'wrong') navigator.vibrate([60, 40, 60]);
    }
  }

  // Sport icons mapping
  const sportIcons = {
    '농구': '🏀',
    '야구': '⚾',
    '빙구': '🏒',
    '럭비': '🏉',
    '축구': '⚽'
  };

  // Setup Event Listeners for Filters
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

    // Filter players based on selected sport and school
    let pool = allPlayers.filter(p => {
      const matchSport = (selectedSport === 'all') || (p.sport === selectedSport);
      const matchSchool = (selectedSchool === 'all') || (p.school === selectedSchool);
      return matchSport && matchSchool;
    });

    if (pool.length < 4) {
      // If pool is too small, relax school filter
      pool = allPlayers.filter(p => selectedSport === 'all' || p.sport === selectedSport);
    }

    if (!pool.length) {
      alert('선택하신 조건에 해당하는 선수가 없습니다.');
      return;
    }

    // Shuffle pool
    const shuffled = [...pool].sort(() => Math.random() - 0.5);

    // Limit count
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

    // Switch screen
    startScreen.classList.remove('active');
    resultScreen.classList.remove('active');
    quizScreen.classList.add('active');

    loadQuestion();
  }

  function loadQuestion() {
    isAnswerLocked = false;
    hintBox.classList.add('hidden');
    hintBtn.textContent = '💡 힌트 보기';

    const player = quizQuestions[currentIndex];
    const total = quizQuestions.length;

    // Update status bar
    questionIndexText.textContent = `Q ${currentIndex + 1} / ${total}`;
    scoreCounterText.textContent = `점수: ${score}`;
    progressBarFill.style.width = `${((currentIndex) / total) * 100}%`;

    // Combo badge
    if (currentCombo >= 2) {
      comboBadge.textContent = `🔥 ${currentCombo}연속 정답!`;
      comboBadge.classList.remove('hidden');
    } else {
      comboBadge.classList.add('hidden');
    }

    // Card Meta
    const icon = sportIcons[player.sport] || '🏅';
    cardSportTag.textContent = `${icon} ${player.sport}`;
    cardSchoolTag.textContent = player.school;
    cardSchoolTag.className = `meta-tag school-tag ${player.school === '고려대학교' ? 'ku' : 'yu'}`;

    // Photo
    playerImg.src = player.image;
    playerImg.alt = `${player.school} ${player.sport} 선수`;

    // Hints
    hintPos.textContent = `${player.position || '-'} · ${player.grade || '-'}`;
    hintNum.textContent = player.number !== '-' ? player.number : '배번 미기재';
    const sampleTip = (player.highlights && player.highlights.length) 
      ? player.highlights[Math.floor(Math.random() * player.highlights.length)]
      : '전력분석 핵심 전력';
    hintText.textContent = sampleTip;

    // Build 4 Options
    generateOptions(player);
  }

  function generateOptions(targetPlayer) {
    const allPlayers = window.GOYEONJEON_PLAYERS || [];
    
    // Pick 3 distractors
    // Priority: same sport first
    let candidates = allPlayers.filter(p => p.name !== targetPlayer.name && p.sport === targetPlayer.sport);
    if (candidates.length < 3) {
      candidates = allPlayers.filter(p => p.name !== targetPlayer.name);
    }

    // Shuffle candidates and pick 3
    const distractors = [...candidates].sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [targetPlayer, ...distractors].sort(() => Math.random() - 0.5);

    optionsContainer.innerHTML = '';
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.innerHTML = `
        <span class="option-name">${opt.name}</span>
        <span class="option-school">${opt.school}</span>
      `;
      btn.addEventListener('click', () => handleOptionClick(btn, opt, targetPlayer));
      optionsContainer.appendChild(btn);
    });
  }

  function handleOptionClick(clickedBtn, selectedPlayer, targetPlayer) {
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

      // Highlight the correct answer button
      const allBtns = optionsContainer.querySelectorAll('.option-btn');
      allBtns.forEach(btn => {
        if (btn.querySelector('.option-name').textContent.trim() === targetPlayer.name) {
          btn.classList.add('correct');
        }
      });
    }

    userAnswers.push({
      player: targetPlayer,
      chosenName: selectedPlayer.name,
      isCorrect: isCorrect
    });

    // Show explanation modal after 450ms
    setTimeout(() => {
      showModal(targetPlayer, isCorrect);
    }, 450);
  }

  function showModal(player, isCorrect) {
    modalResultBanner.className = `result-banner ${isCorrect ? 'correct' : 'wrong'}`;
    modalResultBanner.querySelector('.result-icon').textContent = isCorrect ? '⭕' : '❌';
    modalResultBanner.querySelector('.result-title').textContent = isCorrect 
      ? '정답입니다!' 
      : `아쉬워요! 정답은 ${player.name} 선수입니다.`;

    modalPlayerImg.src = player.image;
    modalSchoolBadge.textContent = `${player.school} · ${player.sport}`;
    modalSchoolBadge.style.color = player.school === '고려대학교' ? '#ff6b81' : '#60a5fa';
    modalName.textContent = player.name;
    
    const numStr = player.number !== '-' ? ` · 등번호 ${player.number}` : '';
    modalDetails.textContent = `포지션: ${player.position || '-'} · ${player.grade || '-'}${numStr}`;

    modalHighlightsList.innerHTML = '';
    if (player.highlights && player.highlights.length) {
      player.highlights.forEach(h => {
        const li = document.createElement('li');
        li.textContent = h;
        modalHighlightsList.appendChild(li);
      });
    } else {
      const li = document.createElement('li');
      li.textContent = '2026 고연전 주요 핵심 전력';
      modalHighlightsList.appendChild(li);
    }

    const isLast = (currentIndex === quizQuestions.length - 1);
    modalNextBtn.querySelector('span:first-child').textContent = isLast ? '최종 결과 확인하기' : '다음 문제 풀기';

    modalOverlay.classList.remove('hidden');
  }

  modalNextBtn.addEventListener('click', () => {
    modalOverlay.classList.add('hidden');
    currentIndex++;
    if (currentIndex < quizQuestions.length) {
      loadQuestion();
    } else {
      showResults();
    }
  });

  // Hint toggle
  hintBtn.addEventListener('click', () => {
    const isHidden = hintBox.classList.contains('hidden');
    if (isHidden) {
      hintBox.classList.remove('hidden');
      hintBtn.textContent = '💡 힌트 접기';
    } else {
      hintBox.classList.add('hidden');
      hintBtn.textContent = '💡 힌트 보기';
    }
    playSound('click');
  });

  // Give Up
  giveUpBtn.addEventListener('click', () => {
    if (confirm('현재 진행 상황을 마무리하고 결과를 확인할까요?')) {
      showResults();
    }
  });

  // Results View
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
      resultTitle.textContent = '🏆 완벽합니다! 전력분석 마스터!';
    } else if (accuracy >= 80) {
      resultTitle.textContent = '👏 대단해요! 고연전 준전문가!';
    } else if (accuracy >= 50) {
      resultTitle.textContent = '👍 좋은 성적입니다! 조금만 더 복습해봐요!';
    } else {
      resultTitle.textContent = '💪 아직 낯선 얼굴들이 있죠? 다시 도전해보세요!';
    }

    // Populate review list
    reviewListContainer.innerHTML = '';
    userAnswers.forEach(ans => {
      const p = ans.player;
      const item = document.createElement('div');
      item.className = `review-item ${ans.isCorrect ? 'was-correct' : 'was-wrong'}`;
      item.innerHTML = `
        <img class="review-thumb" src="${p.image}" alt="${p.name}">
        <div class="review-info">
          <div class="review-name">${p.name} ${ans.isCorrect ? '✅' : '❌'}</div>
          <div class="review-sub">${p.school} · ${p.sport} · ${p.position || '-'}</div>
        </div>
      `;
      reviewListContainer.appendChild(item);
    });
  }

  // Result Action Handlers
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
        alert('퀴즈 페이지 링크가 클립보드에 복사되었습니다! 친구들에게 공유해보세요.');
      });
    } else {
      alert(`링크 주소: ${window.location.href}`);
    }
  });

})();
