let wordData = {};
let quizState = { score: 0, total: 10, current: null, options: [], currentIndex: 0, results: [] };
let quizModal = null;
let stars = 0;
let avatar = '🐶';
const sounds = { click: null, correct: null, wrong: null };

// スターとアバター初期化
window.addEventListener('load', () => {
    const starDisplay = document.getElementById('starDisplay');
    if (starDisplay) {
        starDisplay.innerHTML = `<span class="badge bg-success hvr-pulse">★ ${stars}</span>`;
    } else {
        console.error('エラー: starDisplay要素が見つかりません。');
    }

    const avatarElement = document.querySelector('.avatar');
    if (avatarElement) {
        avatarElement.textContent = avatar;
    } else {
        console.error('エラー: avatar要素が見つかりません。');
    }

    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: { value: 50, density: { enable: true, value_area: 800 } },
                color: { value: ['#ffeb3b', '#f44336', '#2196f3', '#4caf50'] },
                shape: { type: ['star', 'circle'] },
                opacity: { value: 0.7, random: true },
                size: { value: 6, random: true },
                move: { enable: true, speed: 3, direction: 'none', random: true }
            },
            interactivity: {
                events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' } }
            }
        });
    }

    quizModal = new bootstrap.Modal(document.getElementById('quiz'), { keyboard: true, focus: true, backdrop: 'static' });
    initQuizButtons();
    initFilterButtons();
    loadData();
});

// データ読み込み
async function loadData() {
    const loadingModal = document.getElementById('loadingModal');
    if (loadingModal) loadingModal.classList.add('show');
    try {
        const response = await fetch('words.json');
        if (!response.ok) {
            throw new Error(`単語データ読み込み失敗: ${response.status}`);
        }
        wordData = await response.json();
        wordData.nouns = wordData.nouns || [];
        wordData.verbs = wordData.verbs || [];
        wordData.adjectives = wordData.adjectives || [];
        wordData.adverbs = wordData.adverbs || [];
        wordData.prepositions = wordData.prepositions || [];
        wordData.phrases = wordData.phrases || [];
        if (Object.values(wordData).every(category => category.length === 0)) {
            throw new Error('JSONデータが空です');
        }
        populateTables();
        initIsotope();
        if (loadingModal) loadingModal.classList.remove('show');
        gsap.from('.container', { opacity: 0, y: 50, duration: 1, ease: 'power2.out' });
    } catch (error) {
        console.error('データ読み込みエラー:', error);
        Swal.fire({
            title: 'エラー',
            text: `データの読み込みに失敗しました: ${error.message}`,
            icon: 'error',
            confirmButtonText: 'OK'
        });
        if (loadingModal) loadingModal.classList.remove('show');
    }
}

// 単語カード生成
function populateTables(filter = '') {
    const wordGrid = document.getElementById('word-grid');
    if (!wordGrid) {
        console.error('エラー: word-grid要素が見つかりません。');
        Swal.fire({
            title: 'エラー',
            text: '単語グリッド要素が見つかりません。',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return;
    }

    const categories = [
        { id: 'nouns-tables', data: wordData.nouns, key: 'word', label: '名詞' },
        { id: 'verbs-tables', data: wordData.verbs, key: 'word', label: '動詞' },
        { id: 'adjectives-tables', data: wordData.adjectives, key: 'word', label: '形容詞' },
        { id: 'adverbs-tables', data: wordData.adverbs, key: 'word', label: '副詞' },
        { id: 'prepositions-tables', data: wordData.prepositions, key: 'word', label: '前置詞' },
        { id: 'phrases-tables', data: wordData.phrases, key: 'phrase', label: 'フレーズ' }
    ];

    wordGrid.innerHTML = '';
    categories.forEach(category => {
        const container = document.createElement('div');
        container.id = category.id;
        container.className = 'isotope-container';
        container.innerHTML = `<h2 class="text-primary">${category.label}</h2><div class="grid"></div>`;
        const grid = container.querySelector('.grid');
        const filteredData = category.data.filter(item =>
            item[category.key].toLowerCase().includes(filter.toLowerCase()) ||
            item.meaning.toLowerCase().includes(filter.toLowerCase())
        );

        filteredData.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card isotope-item';
            card.setAttribute('data-category', category.label);
            card.innerHTML = `<div class="card-body">${item[category.key]} ( ${item.meaning} )</div>`;
            card.onclick = () => speak(item[category.key]);
            card.onkeydown = e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
            };
            grid.appendChild(card);
        });
        wordGrid.appendChild(container);
    });
}

// Isotope初期化
function initIsotope() {
    const wordGrid = document.getElementById('word-grid');
    if (!wordGrid) {
        console.error('エラー: word-grid要素が見つかりません（initIsotope）。');
        return;
    }
    const isotope = new Isotope(wordGrid, {
        itemSelector: '.isotope-item',
        layoutMode: 'masonry',
        filter: function(itemElem) {
            const search = document.getElementById('search')?.value.toLowerCase() || '';
            const category = document.querySelector('.filter-btn.active')?.dataset.filter || '*';
            const text = itemElem.textContent.toLowerCase();
            const itemCategory = itemElem.dataset.category;
            const matchesSearch = search === '' || text.includes(search);
            const matchesCategory = category === '*' || itemCategory === category;
            return matchesSearch && matchesCategory;
        }
    });

    // 検索やフィルター変更時にIsotopeを更新
    document.getElementById('search')?.addEventListener('input', () => isotope.arrange());
}

// フィルターボタン初期化
function initFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            initIsotope();
        });
    });
}

// 音声再生
function speak(text) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-GB';
    window.speechSynthesis.speak(utterance);
}

// クイズ機能
function startQuiz(category = null) {
    if (!wordData.nouns || Object.values(wordData).every(cat => cat.length === 0)) {
        Swal.fire({
            title: 'エラー',
            text: '単語データが読み込まれていません。',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return;
    }
    quizState = { score: 0, total: 10, current: null, options: [], currentIndex: 0, results: [] };
    const quizScore = document.getElementById('quiz-score');
    if (quizScore) quizScore.textContent = `スコア: ${quizState.score}/${quizState.total}`;
    const quizFeedback = document.getElementById('quiz-feedback');
    if (quizFeedback) quizFeedback.textContent = '';
    quizModal.show();
    gsap.from('#quiz .modal-content', { scale: 0.8, opacity: 0, duration: 0.5, ease: 'back.out' });
    nextQuestion(category);
}

function nextQuestion(category = null) {
    const optionButtons = document.querySelectorAll('.quiz-option');
    optionButtons.forEach(btn => {
        btn.classList.remove('correct', 'incorrect');
        btn.disabled = true;
        const optionText = btn.querySelector('.option-text');
        if (optionText) optionText.textContent = '';
    });
    const quizFeedback = document.getElementById('quiz-feedback');
    if (quizFeedback) quizFeedback.textContent = '';
    const quizQuestion = document.getElementById('quiz-question');
    if (quizQuestion) quizQuestion.textContent = '';

    if (quizState.currentIndex >= quizState.total) {
        closeQuiz();
        showResults();
        return;
    }

    const availableCategories = Object.keys(wordData).filter(cat => wordData[cat].length >= 4);
    if (availableCategories.length === 0) {
        Swal.fire({
            title: 'エラー',
            text: 'クイズに必要なデータが不足しています。',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        closeQuiz();
        return;
    }
    const categories = category ? [category].filter(cat => availableCategories.includes(cat)) : availableCategories;
    if (categories.length === 0) {
        Swal.fire({
            title: 'エラー',
            text: `指定されたカテゴリ（${category}）に十分なデータがありません。`,
            icon: 'error',
            confirmButtonText: 'OK'
        });
        closeQuiz();
        return;
    }
    const selectedCategory = categories[Math.floor(Math.random() * categories.length)];
    const key = selectedCategory === 'phrases' ? 'phrase' : 'word';
    const items = wordData[selectedCategory];
    if (!items || items.length < 4) {
        Swal.fire({
            title: 'エラー',
            text: 'データ不足です。',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        closeQuiz();
        return;
    }

    const correctItem = items[Math.floor(Math.random() * items.length)];
    quizState.current = { category: selectedCategory, item: correctItem, key, index: (quizState.currentIndex || 0) + 1 };
    quizState.currentIndex = quizState.current.index;

    const options = [correctItem];
    const otherItems = items.filter(item => item[key] !== correctItem[key]);
    while (options.length < 4 && otherItems.length > 0) {
        const randomIndex = Math.floor(Math.random() * otherItems.length);
        options.push(otherItems.splice(randomIndex, 1)[0]);
    }
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }
    quizState.options = options;

    if (quizQuestion) quizQuestion.textContent = `${correctItem.meaning} の英語は？`;
    optionButtons.forEach((btn, index) => {
        const optionText = btn.querySelector('.option-text');
        if (optionText) optionText.textContent = options[index][key];
        btn.disabled = false;
        anime({
            targets: btn,
            scale: [0.9, 1],
            duration: 300,
            easing: 'easeOutQuad'
        });
    });
}

function checkAnswer(index) {
    if (!quizState.current || !quizState.current.item) {
        Swal.fire({
            title: 'エラー',
            text: 'クイズ状態エラー。',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        closeQuiz();
        return;
    }

    const selectedOption = quizState.options[index];
    const correctAnswer = quizState.current.item[quizState.current.key];
    const optionButtons = document.querySelectorAll('.quiz-option');
    optionButtons.forEach(btn => btn.disabled = true);

    optionButtons.forEach((btn, i) => {
        if (quizState.options[i][quizState.current.key] === correctAnswer) {
            btn.classList.add('correct');
            anime({
                targets: btn,
                scale: [1, 1.1, 1],
                duration: 500,
                easing: 'easeInOutQuad'
            });
        } else if (i === index) {
            btn.classList.add('incorrect');
            anime({
                targets: btn,
                x: [-10, 10, -10, 0],
                duration: 300,
                easing: 'easeInOutQuad'
            });
        }
    });

    const isCorrect = selectedOption[quizState.current.key] === correctAnswer;
    quizState.results.push({
        question: quizState.current.item.meaning,
        correct: correctAnswer,
        selected: selectedOption[quizState.current.key],
        isCorrect
    });

    if (isCorrect) {
        quizState.score++;
        stars += 1;
        const starDisplay = document.getElementById('starDisplay');
        if (starDisplay) {
            starDisplay.innerHTML = `<span class="badge bg-success hvr-pulse">★ ${stars}</span>`;
        } else {
            console.error('エラー: starDisplay要素が見つかりません（checkAnswer）。');
        }
        const quizScore = document.getElementById('quiz-score');
        if (quizScore) quizScore.textContent = `スコア: ${quizState.score}/${quizState.total}`;
        const quizFeedback = document.getElementById('quiz-feedback');
        if (quizFeedback) quizFeedback.textContent = 'スーパー！よくできた！🌟';
        showConfetti();
        if (stars % 10 === 0) {
            const toast = new bootstrap.Toast(document.createElement('div'));
            toast._element.className = 'toast position-fixed bottom-0 end-0 m-3';
            toast._element.innerHTML = `
                <div class="toast-header">
                    <strong class="me-auto">すごい！</strong>
                    <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
                </div>
                <div class="toast-body">${stars}スター達成！単語マスターだ！🎉</div>
            `;
            document.body.appendChild(toast._element);
            toast.show();
        }
    } else {
        const quizFeedback = document.getElementById('quiz-feedback');
        if (quizFeedback) quizFeedback.textContent = 'ドンマイ！次はできるよ！💪';
    }

    setTimeout(nextQuestion, 2000);
}

function showConfetti() {
    const confettiCount = 30;
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = `${Math.random() * 100}vw`;
        const colors = ['#f44336', '#2196f3', '#ffeb3b', '#4caf50'];
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        document.body.appendChild(confetti);
        gsap.to(confetti, {
            y: window.innerHeight,
            x: (Math.random() - 0.5) * 200,
            rotation: Math.random() * 360,
            opacity: 0,
            duration: 2,
            ease: 'power1.out',
            onComplete: () => confetti.remove()
        });
    }
}

function showResults() {
    let resultHtml = '<table class="table table-striped"><tr><th>問題</th><th>正解</th><th>あなたの回答</th><th>結果</th></tr>';
    quizState.results.forEach(result => {
        resultHtml += `<tr><td>${result.question}</td><td>${result.correct}</td><td>${result.selected}</td><td>${result.isCorrect ? '正解' : '不正解'}</td></tr>`;
    });
    resultHtml += '</table>';
    Swal.fire({
        title: `クイズ終了！ スコア: ${quizState.score}/${quizState.total}`,
        html: resultHtml,
        icon: quizState.score >= 8 ? 'success' : 'info',
        confirmButtonText: 'もう一度！',
        customClass: { popup: 'swal-wide' }
    }).then(() => {
        const quizAllBtn = document.querySelector('.btn-primary.quiz-all');
        if (quizAllBtn) quizAllBtn.focus();
    });
}

function closeQuiz() {
    quizModal.hide();
    const optionButtons = document.querySelectorAll('.quiz-option');
    optionButtons.forEach(btn => {
        btn.classList.remove('correct', 'incorrect');
        btn.disabled = true;
        const optionText = btn.querySelector('.option-text');
        if (optionText) optionText.textContent = '';
    });
    const quizAllBtn = document.querySelector('.btn-primary.quiz-all');
    if (quizAllBtn) quizAllBtn.focus();
}

function speakOption(index, event) {
    event.stopPropagation();
    speak(quizState.options[index][quizState.current.key]);
}

function handleSpeakerKeydown(index, event) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        speakOption(index, event);
    }
}

document.getElementById('avatarOptions').addEventListener('click', e => {
    if (e.target.classList.contains('avatar-btn')) {
        avatar = e.target.dataset.avatar;
        document.querySelectorAll('.avatar').forEach(el => el.textContent = avatar);
        bootstrap.Modal.getInstance(document.getElementById('avatarModal')).hide();
    }
});

function searchWords() {
    const searchInput = document.getElementById('search');
    if (searchInput) {
        const query = searchInput.value;
        populateTables(query);
        initIsotope();
    }
}

function initQuizButtons() {
    const quizAllBtn = document.querySelector('.quiz-all');
    const quizNounsBtn = document.querySelector('.quiz-nouns');
    if (quizAllBtn) quizAllBtn.addEventListener('click', () => startQuiz());
    if (quizNounsBtn) quizNounsBtn.addEventListener('click', () => startQuiz('nouns'));
}