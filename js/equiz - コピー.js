let wordData = {};
let quizState = {
    score: 0,
    total: 10,
    current: null,
    options: [],
    currentIndex: 0,
    results: [],
    name: '',
    job: 'warrior',
    level: 1,
    exp: 0,
    expToNextLevel: 100,
    hp: 30,
    maxHp: 30,
    mp: 30,
    maxMp: 30,
    gold: 0,
    spells: ['ホイミ', 'メラ'],
    stats: { strength: 10, agility: 10, intelligence: 10 },
    monster: null,
    messageQueue: [],
    isTyping: false,
    currentMessage: '',
    items: { 'やくそう': 0, 'アモールの水': 0, 'うまのふん': 0, '雷鳴のつるぎ': 0 },
    hasThunderSword: false
};
let selectedVoice = null;
let voiceModal = null;
let battleModal = null;
let nameModal = null;
let jobModal = null;
let spellModal = null;
let categoryModal = null;
let statusModal = null;
let resultsModal = null;
const sounds = {
    field: new Howl({ src: ['sounds/field.mp3'], loop: true, volume: 0.3 }),
    battle: new Howl({ src: ['sounds/battle.mp3'], loop: true, volume: 0.3 }),
    click: new Howl({ src: ['sounds/click.mp3'], volume: 0.6 }),
    correct: new Howl({ src: ['sounds/correct.mp3'], volume: 0.6 }),
    incorrect: new Howl({ src: ['sounds/incorrect.mp3'], volume: 0.6 }),
    magic: new Howl({ src: ['sounds/magic.mp3'], volume: 0.6 }),
    levelup: new Howl({ src: ['sounds/levelup.mp3'], volume: 0.6 }),
    castle: new Howl({ src: ['sounds/castle.mp3'], loop: true, volume: 0.3 })
};

// モンスター定義とレベルごとの分類
const monsters = {
    weak: [
        { name: 'スライム', hp: 8, exp: 5, gold: 2, sprite: 'images/zoma.png', drop: 'やくそう' },
        { name: 'バブルスライム', hp: 10, exp: 6, gold: 3, sprite: 'images/zoma.png', drop: 'やくそう' },
        { name: 'メタルスライム', hp: 12, exp: 50, gold: 5, sprite: 'images/zoma.png', drop: 'やくそう' },
        { name: 'はぐれメタル', hp: 12, exp: 100, gold: 10, sprite: 'images/zoma.png', drop: 'アモールの水' }
    ],
    medium: [
        { name: 'ドラキー', hp: 15, exp: 8, gold: 4, sprite: 'images/zoma.png', drop: 'やくそう' },
        { name: 'くさったしたい', hp: 20, exp: 10, gold: 5, sprite: 'images/zoma.png', drop: 'うまのふん' },
        { name: 'キメラ', hp: 25, exp: 12, gold: 6, sprite: 'images/zoma.png', drop: 'やくそう' },
        { name: 'さまようよろい', hp: 30, exp: 15, gold: 8, sprite: 'images/zoma.png', drop: 'アモールの水' }
    ],
    strong: [
        { name: 'ゴーレム', hp: 40, exp: 20, gold: 10, sprite: 'images/zoma.png', drop: 'うまのふん' },
        { name: 'ゲマ', hp: 50, exp: 25, gold: 12, sprite: 'images/zoma.png', drop: 'やくそう' },
        { name: 'ムドー', hp: 60, exp: 30, gold: 15, sprite: 'images/zoma.png', drop: 'アモールの水' },
        { name: 'エビルプリースト', hp: 70, exp: 35, gold: 18, sprite: 'images/zoma.png', drop: 'うまのふん' },
        { name: 'キングヒドラ', hp: 80, exp: 40, gold: 20, sprite: 'images/zoma.png', drop: 'やくそう' },
        { name: 'バラモスゾンビ', hp: 70, exp: 35, gold: 18, sprite: 'images/zoma.png', drop: '雷鳴のつるぎ' },
        { name: 'バラモスブロス', hp: 60, exp: 30, gold: 15, sprite: 'images/zoma.png', drop: 'アモールの水' }
    ],
    boss: [
        { name: 'りゅうおう', hp: 100, exp: 50, gold: 25, sprite: 'images/zoma.png', drop: 'アモールの水' },
        { name: 'ハーゴン', hp: 120, exp: 60, gold: 30, sprite: 'images/zoma.png', drop: 'うまのふん' },
        { name: 'シドー', hp: 140, exp: 70, gold: 35, sprite: 'images/zoma.png', drop: 'やくそう' },
        { name: 'バラモス', hp: 160, exp: 80, gold: 40, sprite: 'images/zoma.png', drop: 'アモールの水' },
        { name: 'ゾーマ', hp: 180, exp: 90, gold: 45, sprite: 'images/zoma.png', drop: 'うまのふん' },
        { name: 'デスピサロ', hp: 190, exp: 95, gold: 48, sprite: 'images/zoma.png', drop: 'やくそう' },
        { name: 'ミルドラース', hp: 200, exp: 100, gold: 50, sprite: 'images/zoma.png', drop: 'アモールの水' },
        { name: 'デスタムーア', hp: 200, exp: 100, gold: 50, sprite: 'images/zoma.png', drop: 'うまのふん' }
    ],
    secret: [
        { name: 'ダークドレアム', hp: 300, exp: 150, gold: 75, sprite: 'images/zoma.png', drop: 'やくそう' },
        { name: 'しんりゅう', hp: 250, exp: 125, gold: 60, sprite: 'images/zoma.png', drop: 'アモールの水' },
        { name: 'エスターク', hp: 280, exp: 140, gold: 70, sprite: 'images/zoma.png', drop: 'うまのふん' }
    ]
};

// 職業ごとの設定
const jobs = {
    warrior: { name: 'せんし', expMod: 1.0, quizPref: 'nouns', spells: { 1: ['ホイミ', 'メラ'], 10: 'ベホイミ', 30: 'ベホマ' } },
    mage: { name: 'まほうつかい', expMod: 0.8, quizPref: 'phrases', spells: { 1: ['ホイミ', 'メラ'], 10: 'ベホイミ', 20: 'メラミ', 30: 'ベホマ', 35: 'メラゾーマ', 40: 'ライデイン' } },
    priest: { name: 'そうりょ', expMod: 0.9, quizPref: 'verbs', spells: { 1: ['ホイミ', 'メラ'], 10: 'ベホイミ', 30: 'ベホマ' } },
    thief: { name: 'とうぞく', expMod: 1.1, quizPref: 'adverbs', spells: { 1: ['ホイミ', 'メラ'], 20: 'メラミ', 40: 'ギガデイン' } },
    merchant: { name: 'しょうにん', expMod: 1.0, quizPref: 'prepositions', spells: { 1: ['ホイミ', 'メラ'], 10: 'ベホイミ', 30: 'ベホマ', 35: 'メラゾーマ' } },
    jester: { name: 'あそびにん', expMod: 0.7, quizPref: 'adjectives', spells: { 1: ['ホイミ', 'メラ'], 20: 'メラミ', 40: 'ライデイン' } },
    sage: { name: 'けんじゃ', expMod: 1.2, quizPref: 'phrases', spells: { 1: ['ホイミ', 'メラ'], 10: 'ベホイミ', 20: 'メラミ', 30: 'ベホマ', 35: 'メラゾーマ', 40: 'ギガデイン' } }
};

// 魔法定義
const spells = {
    ホイミ: { mp: 3, effect: () => restoreHp(Math.floor(Math.random() * (12 - 8 + 1)) + 8) },
    ベホイミ: { mp: 8, effect: () => restoreHp(Math.floor(Math.random() * (80 - 40 + 1)) + 40) },
    ベホマ: { mp: 15, effect: () => restoreHp(quizState.maxHp - quizState.hp) },
    メラ: { mp: 5, effect: () => lowerMonsterHp(Math.floor(Math.random() * (30 - 6 + 1)) + 6) },
    メラミ: { mp: 10, effect: () => lowerMonsterHp(Math.floor(Math.random() * (80 - 50 + 1)) + 50) },
    メラゾーマ: { mp: 15, effect: () => lowerMonsterHp(Math.floor(Math.random() * (120 - 80 + 1)) + 80) },
    ライデイン: { mp: 15, effect: () => lowerMonsterHp(Math.floor(Math.random() * (120 - 80 + 1)) + 80) },
    ギガデイン: { mp: 20, effect: () => lowerMonsterHp(Math.floor(Math.random() * (180 - 120 + 1)) + 120) },
    カテゴリー選択: { mp: 2, effect: () => showCategoryMenu() }
};

// カテゴリー定義
const categoriesList = [
    { name: 'めいし', value: 'nouns' },
    { name: 'どうし', value: 'verbs' },
    { name: 'けいようし', value: 'adjectives' },
    { name: 'ふくし', value: 'adverbs' },
    { name: 'ぜんちし', value: 'prepositions' },
    { name: 'じゅくご', value: 'phrases' }
];

// localStorageから状態を読み込み
function loadState() {
    quizState.name = localStorage.getItem('name') || '';
    quizState.job = localStorage.getItem('job') || 'warrior';
    quizState.level = parseInt(localStorage.getItem('level') || '1');
    quizState.exp = parseInt(localStorage.getItem('exp') || '0');
    quizState.expToNextLevel = parseInt(localStorage.getItem('expToNextLevel') || '100');
    quizState.hp = parseInt(localStorage.getItem('hp') || '30');
    quizState.maxHp = parseInt(localStorage.getItem('maxHp') || '30');
    quizState.mp = parseInt(localStorage.getItem('mp') || '30');
    quizState.maxMp = parseInt(localStorage.getItem('maxMp') || '30');
    quizState.gold = parseInt(localStorage.getItem('gold') || '0');
    quizState.spells = JSON.parse(localStorage.getItem('spells') || '["ホイミ", "メラ"]');
    quizState.stats = JSON.parse(localStorage.getItem('stats') || '{"strength":10,"agility":10,"intelligence":10}');
    quizState.items = JSON.parse(localStorage.getItem('items') || '{"やくそう":0,"アモールの水":0,"うまのふん":0,"雷鳴のつるぎ":0}');
    quizState.hasThunderSword = localStorage.getItem('hasThunderSword') === 'true';
    updateHeader();
    updateStatus();
}

// 状態を保存
function saveState() {
    localStorage.setItem('name', quizState.name);
    localStorage.setItem('job', quizState.job);
    localStorage.setItem('level', quizState.level);
    localStorage.setItem('exp', quizState.exp);
    localStorage.setItem('expToNextLevel', quizState.expToNextLevel);
    localStorage.setItem('hp', quizState.hp);
    localStorage.setItem('maxHp', quizState.maxHp);
    localStorage.setItem('mp', quizState.mp);
    localStorage.setItem('maxMp', quizState.maxMp);
    localStorage.setItem('gold', quizState.gold);
    localStorage.setItem('spells', JSON.stringify(quizState.spells));
    localStorage.setItem('stats', JSON.stringify(quizState.stats));
    localStorage.setItem('items', JSON.stringify(quizState.items));
    localStorage.setItem('hasThunderSword', quizState.hasThunderSword);
}

// ヘッダー更新
function updateHeader() {
    document.getElementById('player-name').textContent = `冒険者: ${quizState.name || '未登録'}`;
    document.getElementById('player-job').textContent = `職業: ${jobs[quizState.job].name || 'なし'}`;
    document.getElementById('player-level').textContent = `レベル: ${quizState.level}`;
    document.getElementById('player-exp').textContent = `EXP: ${quizState.exp}/${quizState.expToNextLevel}`;
    const percentage = (quizState.exp / quizState.expToNextLevel) * 100;
    document.getElementById('header-exp-bar').style.width = `${percentage}%`;
    document.getElementById('header-exp-bar').setAttribute('aria-valuenow', quizState.exp);
    document.getElementById('header-exp-bar').setAttribute('aria-valuemax', quizState.expToNextLevel);
}

// ステータス更新
function updateStatus() {
    document.getElementById('battle-player-name').textContent = quizState.name || 'ゆうしゃ';
    document.getElementById('battle-player-job').textContent = `職業: ${jobs[quizState.job].name || 'せんし'}`;
    document.getElementById('battle-player-level').textContent = `レベル: ${quizState.level}`;
    document.getElementById('battle-player-hp').textContent = `HP: ${quizState.hp}/${quizState.maxHp}`;
    document.getElementById('battle-player-mp').textContent = `MP: ${quizState.mp}/${quizState.maxMp}`;
    document.getElementById('battle-player-exp').textContent = `EXP: ${quizState.exp}/${quizState.expToNextLevel}`;
    document.getElementById('battle-player-gold').textContent = `G: ${quizState.gold}`;
    updateHeader();
}

// 名前登録
function promptName() {
    if (!quizState.name) {
        nameModal.show();
        document.getElementById('nameInput').focus();
    } else if (!quizState.job) {
        promptJob();
    } else {
        startAdventure();
    }
}

function saveName() {
    const nameInput = document.getElementById('nameInput').value.trim();
    if (nameInput) {
        quizState.name = nameInput;
        saveState();
        updateHeader();
        nameModal.hide();
        promptJob();
    } else {
        addMessage('なまえを いれなさい！');
    }
}

// 職業選択
function promptJob() {
    jobModal.show();
    document.getElementById('jobSelect').focus();
}

function saveJob() {
    quizState.job = document.getElementById('jobSelect').value;
    saveState();
    updateHeader();
    jobModal.hide();
    startAdventure();
}

// 音声読み込み
function loadVoices(target = 'inline') {
    const voices = window.speechSynthesis.getVoices();
    const voiceRadios = target === 'inline' ? document.getElementById('voiceRadios') : document.getElementById('voiceRadiosModal');
    voiceRadios.innerHTML = '';
    if (voices.length === 0) {
        console.warn('No voices loaded yet, waiting for onvoiceschanged');
        return;
    }

    let defaultVoiceIndex = null;
    voices.forEach((voice, index) => {
        if (voice.name === 'Google UK English Female' && voice.lang === 'en-GB') {
            defaultVoiceIndex = index;
            selectedVoice = voice;
        }
    });
    if (defaultVoiceIndex === null) {
        voices.forEach((voice, index) => {
            if (voice.lang === 'en-GB' && defaultVoiceIndex === null) {
                defaultVoiceIndex = index;
                selectedVoice = voice;
            }
        });
    }
    console.log('Default voice set:', selectedVoice ? selectedVoice.name : 'None');

    voices.forEach((voice, index) => {
        if (voice.lang.includes('en')) {
            const div = document.createElement('div');
            div.className = 'form-check';
            div.innerHTML = `
                <input class="form-check-input" type="radio" name="voiceSelect" id="voice${index}_${target}" value="${index}" ${index === defaultVoiceIndex ? 'checked' : ''}>
                <label class="form-check-label" for="voice${index}_${target}">${voice.name} (${voice.lang})</label>
            `;
            voiceRadios.appendChild(div);
        }
    });
    console.log('Voices loaded for', target, ':', voices.filter(v => v.lang.includes('en')));
}

function setVoice(event) {
    const index = event.target.value;
    const voices = window.speechSynthesis.getVoices();
    selectedVoice = index ? voices[parseInt(index)] : null;
    console.log('Selected voice:', selectedVoice ? selectedVoice.name : 'Default');
    const allRadios = document.querySelectorAll(`input[name="voiceSelect"][value="${index}"]`);
    allRadios.forEach(radio => radio.checked = true);
}

async function loadData() {
    document.getElementById('loadingModal').classList.add('active');
    try {
        const response = await fetch('words.json');
        if (!response.ok) throw new Error('単語データの読み込みに失敗しました');
        wordData = await response.json();
        populateTables();
        document.getElementById('loadingModal').classList.remove('active');
    } catch (error) {
        console.error('Error loading words:', error);
        document.getElementById('loadingModal').innerHTML = `<p>単語データの読み込みに失敗しました。words.jsonを確認してください。エラー: ${error.message}</p>`;
    }
}

function populateTables(filter = '') {
    const categories = [
        { id: 'nouns-tables', data: wordData.nouns, key: 'word' },
        { id: 'verbs-tables', data: wordData.verbs, key: 'word' },
        { id: 'adjectives-tables', data: wordData.adjectives, key: 'word' },
        { id: 'adverbs-tables', data: wordData.adverbs, key: 'word' },
        { id: 'prepositions-tables', data: wordData.prepositions, key: 'word' },
        { id: 'phrases-tables', data: wordData.phrases, key: 'phrase' }
    ];

    categories.forEach(category => {
        const container = document.getElementById(category.id);
        container.innerHTML = '';
        const filteredData = category.data ? category.data.filter(item =>
            item[category.key].toLowerCase().includes(filter.toLowerCase()) ||
            item.meaning.toLowerCase().includes(filter.toLowerCase())
        ) : [];

        let columns = 1;
        if (window.innerWidth >= 992) columns = 3;
        else if (window.innerWidth >= 768) columns = 2;

        const itemsPerColumn = Math.ceil(filteredData.length / columns);
        for (let i = 0; i < columns; i++) {
            const table = document.createElement('table');
            table.innerHTML = '<tr><th>英単語</th><th>意味</th></tr>';
            const start = i * itemsPerColumn;
            const end = Math.min(start + itemsPerColumn, filteredData.length);
            for (let j = start; j < end; j++) {
                const item = filteredData[j];
                const row = table.insertRow();
                const cell1 = row.insertCell(0);
                const cell2 = row.insertCell(1);
                cell1.textContent = `🔉 ${item[category.key]}`;
                cell2.textContent = item.meaning;
                cell1.onclick = () => speak(item[category.key]);
            }
            container.appendChild(table);
        }
    });
}

function speak(text) {
    try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-GB';
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
        window.speechSynthesis.speak(utterance);
        console.log('Speaking with voice:', selectedVoice ? selectedVoice.name : 'Default', 'Text:', text);
    } catch (error) {
        console.error('Speech error:', error);
    }
}

function speakOption(index, event) {
    if (event) {
        event.stopPropagation();
    }
    if (!quizState.options || !quizState.options[index] || !quizState.current) {
        console.error('Invalid quiz state for speakOption:', quizState);
        return;
    }
    const key = quizState.current.key;
    const text = quizState.options[index][key];
    speak(text);
}

function handleSpeakerKeydown(index, event) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.stopPropagation();
        speakOption(index);
    }
}

function searchWords() {
    const query = document.getElementById('search').value;
    populateTables(query);
}

// メッセージを1文字ずつ表示
function typeMessage(message, callback) {
    if (quizState.isTyping) return;
    quizState.isTyping = true;
    quizState.currentMessage = '';
    const feedback = document.getElementById('battle-feedback');
    feedback.textContent = '';
    let i = 0;
    const interval = setInterval(() => {
        if (i < message.length) {
            quizState.currentMessage += message[i];
            feedback.textContent = quizState.currentMessage;
            i++;
        } else {
            clearInterval(interval);
            quizState.isTyping = false;
            if (callback) callback();
        }
    }, 50);
}

// メッセージキューを処理
function processMessageQueue() {
    if (quizState.messageQueue.length === 0 || quizState.isTyping) return;
    const { message, callback } = quizState.messageQueue.shift();
    typeMessage(message, () => {
        if (callback) callback();
        processMessageQueue();
    });
}

function addMessage(message, callback) {
    quizState.messageQueue.push({ message, callback });
    processMessageQueue();
}

// クリック音再生
function playClick() {
    sounds.click.play();
}

// 冒険開始
function startAdventure() {
    if (!wordData.nouns) {
        alert('単語データが読み込まれていません。ページをリロードしてください。');
        return;
    }
    sounds.field.play();
    quizState = {
        score: 0,
        total: 10,
        current: null,
        options: [],
        currentIndex: 0,
        results: [],
        name: quizState.name,
        job: quizState.job,
        level: quizState.level,
        exp: quizState.exp,
        expToNextLevel: quizState.expToNextLevel,
        hp: quizState.hp,
        maxHp: quizState.maxHp,
        mp: quizState.mp,
        maxMp: quizState.maxMp,
        gold: quizState.gold,
        spells: quizState.spells,
        stats: quizState.stats,
        monster: null,
        messageQueue: [],
        isTyping: false,
        currentMessage: '',
        items: quizState.items,
        hasThunderSword: quizState.hasThunderSword
    };
    updateStatus();
    addMessage(`${quizState.name}は アリアハンから たびだった！`, () => {
        battleModal.show();
        setTimeout(nextBattle, 2000);
    });
}

// ステータス更新
function updateStatus() {
    document.getElementById('battle-player-name').textContent = quizState.name || 'ゆうしゃ';
    document.getElementById('battle-player-job').textContent = `職業: ${jobs[quizState.job].name || 'せんし'}`;
    document.getElementById('battle-player-level').textContent = `レベル: ${quizState.level}`;
    document.getElementById('battle-player-hp').textContent = `HP: ${quizState.hp}/${quizState.maxHp}`;
    document.getElementById('battle-player-mp').textContent = `MP: ${quizState.mp}/${quizState.maxMp}`;
    document.getElementById('battle-player-exp').textContent = `EXP: ${quizState.exp}/${quizState.expToNextLevel}`;
    document.getElementById('battle-player-gold').textContent = `G: ${quizState.gold}`;
    updateHeader();
}

// レベルに応じたモンスター選択
function selectMonster() {
    if (quizState.level >= 40) return monsters.secret[Math.floor(Math.random() * monsters.secret.length)];
    if (quizState.level >= 30) return monsters.boss[Math.floor(Math.random() * monsters.boss.length)];
    if (quizState.level >= 20) return monsters.strong[Math.floor(Math.random() * monsters.strong.length)];
    if (quizState.level >= 10) return monsters.medium[Math.floor(Math.random() * monsters.medium.length)];
    return monsters.weak[Math.floor(Math.random() * monsters.weak.length)];
}

// 戦闘開始
function nextBattle() {
    sounds.field.stop();
    sounds.battle.play();
    quizState.currentIndex++;
    if (quizState.currentIndex > quizState.total) {
        sounds.battle.stop();
        sounds.castle.play();
        showResults();
        return;
    }

    const monster = selectMonster();
    quizState.monster = { ...monster, currentHp: monster.hp, magic: ['メラ', 'メラミ', 'メラゾーマ', 'ライデイン', 'ギガデイン'][Math.floor(Math.random() * 5)] };
    document.getElementById('monster-name').textContent = monster.name;
    document.getElementById('monster-sprite').style.backgroundImage = `url('${monster.sprite}')`;
    addMessage(`${monster.name}が あらわれた！`, () => selectCommand('fight'));
}

// コマンド選択
function selectCommand(command) {
    playClick();
    document.getElementById('battle-feedback').textContent = '';
    if (command === 'fight') {
        nextQuestion();
    } else if (command === 'magic') {
        showSpellMenu();
    } else if (command === 'item') {
        useItem();
    } else if (command === 'flee') {
        fleeBattle();
    }
}

// クイズ（戦闘）
function nextQuestion() {
    document.getElementById('quiz-options').querySelectorAll('.dq3-option').forEach(btn => {
        btn.classList.remove('correct', 'incorrect');
        btn.querySelector('.option-text').textContent = '';
        btn.disabled = false;
    });
    document.getElementById('quiz-question-line1').textContent = '';
    document.getElementById('quiz-question-line2').textContent = '';

    const categories = ['nouns', 'verbs', 'adjectives', 'adverbs', 'prepositions', 'phrases'];
    const jobPref = jobs[quizState.job].quizPref;
    const category = quizState.selectedCategory || (Math.random() < 0.5 ? jobPref : categories[Math.floor(Math.random() * categories.length)]);
    const key = category === 'phrases' ? 'phrase' : 'word';
    const items = wordData[category];
    if (!items || items.length < 4) {
        addMessage('もんだいが たりないぞ！');
        return;
    }

    const correctItem = items[Math.floor(Math.random() * items.length)];
    quizState.current = { category, item: correctItem, key, index: quizState.currentIndex };
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

    document.getElementById('quiz-question-line1').textContent = `${quizState.monster.name}の こうげき！！`;
    document.getElementById('quiz-question-line2').textContent = `「${correctItem.meaning}」の えいごは なに？`;
    document.getElementById('quiz-options').querySelectorAll('.dq3-option').forEach((btn, index) => {
        btn.querySelector('.option-text').textContent = options[index][key];
    });
}

// 回答チェック
function checkAnswer(index) {
    playClick();
    const selectedOption = quizState.options[index];
    const correctAnswer = quizState.current.item[quizState.current.key];
    const isCorrect = selectedOption[quizState.current.key] === correctAnswer;

    quizState.results.push({
        question: quizState.current.item.meaning,
        correct: correctAnswer,
        selected: selectedOption[quizState.current.key],
        isCorrect
    });

    document.getElementById('quiz-options').querySelectorAll('.dq3-option').forEach(btn => btn.disabled = true);
    document.getElementById('quiz-options').querySelectorAll('.dq3-option').forEach((btn, i) => {
        if (quizState.options[i][quizState.current.key] === correctAnswer) {
            btn.classList.add('correct');
        } else if (i === index) {
            btn.classList.add('incorrect');
        }
    });

    if (isCorrect) {
        quizState.score++;
        quizState.monster.currentHp -= Math.floor(quizState.stats.strength / 2);
        quizState.stats.intelligence += 1;
        sounds.correct.play();
        addMessage(`${quizState.name}の こうげき！${quizState.monster.name}に ダメージ！`, () => {
            showEffect('correct');
            confetti({ particleCount: 50, spread: 30, origin: { y: 0.6 } });
            if (quizState.monster.currentHp <= 0) {
                defeatMonster();
            } else {
                setTimeout(monsterAttack, 1000);
            }
        });
    } else {
        quizState.hp -= 5;
        sounds.incorrect.play();
        addMessage(`${quizState.name}の こうげき ミス!!! ダメージを与えられない`, () => {
            showEffect('wrong');
            applyShakeEffect();
            updateStatus();
            if (quizState.hp <= 0) {
                gameOver();
            } else {
                setTimeout(monsterAttack, 1000);
            }
        });
    }
}

// 魔法メニュー表示
function showSpellMenu() {
    playClick();
    if (quizState.spells.length === 0) {
        addMessage('じゅもんを ひとつも おぼえていない！');
        return;
    }
    const spellList = document.getElementById('spell-list');
    spellList.innerHTML = '';
    quizState.spells.forEach(spell => {
        const button = document.createElement('button');
        button.className = 'dq3-btn';
        button.textContent = `${spell} (MP: ${spells[spell].mp})`;
        button.disabled = quizState.mp < spells[spell].mp;
        button.onclick = () => useMagic(spell);
        spellList.appendChild(button);
    });
    spellModal.show();
}

// カテゴリー選択メニュー表示
function showCategoryMenu() {
    playClick();
    const categoryList = document.getElementById('category-list');
    categoryList.innerHTML = '';
    categoriesList.forEach(cat => {
        const button = document.createElement('button');
        button.className = 'dq3-btn';
        button.textContent = cat.name;
        button.onclick = () => selectCategory(cat.value);
        categoryList.appendChild(button);
    });
    spellModal.hide();
    categoryModal.show();
}

function selectCategory(category) {
    playClick();
    quizState.selectedCategory = category;
    addMessage(`${category}を えらんだ！`, () => {
        categoryModal.hide();
        setTimeout(monsterAttack, 1000);
    });
}

// 魔法使用
function useMagic(spell) {
    playClick();
    if (quizState.mp < spells[spell].mp) {
        addMessage('MPが たりない！');
        spellModal.hide();
        return;
    }
    quizState.mp -= spells[spell].mp;
    addMessage(`${quizState.name}は ${spell}を となえた！`, () => {
        sounds.magic.play();
        spells[spell].effect();
        updateStatus();
        spellModal.hide();
        if (quizState.monster.currentHp > 0) {
            setTimeout(monsterAttack, 1000);
        }
    });
}

// モンスター撃破
function defeatMonster() {
    const expGain = Math.floor(quizState.monster.exp * jobs[quizState.job].expMod);
    const goldGain = quizState.monster.gold;
    quizState.exp += expGain;
    quizState.gold += goldGain;
    let dropMessage = '';
    if (!quizState.hasThunderSword && quizState.monster.name === 'バラモスゾンビ' && Math.random() < 0.1) {
        quizState.items['雷鳴のつるぎ'] = 1;
        quizState.hasThunderSword = true;
        dropMessage = '雷鳴のつるぎを てにいれた！';
    } else if (quizState.items[quizState.monster.drop] < 10 && quizState.monster.drop !== '雷鳴のつるぎ') {
        quizState.items[quizState.monster.drop]++;
        dropMessage = `${quizState.monster.drop}を てにいれた！`;
    } else if (quizState.items[quizState.monster.drop] >= 10 && quizState.monster.drop !== '雷鳴のつるぎ') {
        dropMessage = 'どうぐが 満杯なので 捨てた…';
    }
    addMessage(`${quizState.monster.name}を たおした！${expGain}の けいけんちと ${goldGain}ゴールドを てにいれた！${dropMessage}`, () => {
        checkLevelUp();
        saveState();
        updateStatus();
        addMessage('冒険を つづけますか？', () => {
            document.getElementById('battle-choices').style.display = 'flex';
        });
    });
}

// メッセージウィンドウクリックで次のメッセージへ
function advanceMessage() {
    playClick();
    if (quizState.isTyping) {
        quizState.isTyping = false;
        document.getElementById('battle-feedback').textContent = quizState.currentMessage;
        processMessageQueue();
        return;
    }
    if (quizState.messageQueue.length > 0) {
        processMessageQueue();
        return;
    }
}

// 「はい」「いいえ」選択
function selectFightChoice(choice) {
    playClick();
    document.getElementById('battle-choices').style.display = 'none';
    if (choice === 'yes') {
        nextBattle();
    } else {
        addMessage('おつかれさまでした。電源は きらずに こちらのボタンを おして下さい', () => {
            document.getElementById('end-game-choice').style.display = 'flex';
        });
    }
}

// ゲーム終了
function endGame() {
    playClick();
    sounds.battle.stop();
    sounds.field.play();
    battleModal.hide();
    document.getElementById('end-game-choice').style.display = 'none';
}

// モンスターの攻撃
function monsterAttack() {
    const isCorrect = quizState.results[quizState.results.length - 1]?.isCorrect;
    const damage = Math.floor(Math.random() * 5) + 3; // 3～7のランダムダメージ
    if (isCorrect) {
        addMessage(`${quizState.monster.name}の こうげき！ だた ${quizState.name}は きかなかった`, () => {
            setTimeout(nextQuestion, 1000);
        });
    } else {
        quizState.hp -= damage;
        sounds.incorrect.play();
        addMessage(`${quizState.monster.name}の こうげき ${quizState.name}に ${damage} のダメージ`, () => {
            applyShakeEffect();
            updateStatus();
            if (quizState.hp <= 0) {
                gameOver();
            } else {
                setTimeout(nextQuestion, 1000);
            }
        });
    }
}

// レベルアップ
function checkLevelUp() {
    while (quizState.exp >= quizState.expToNextLevel) {
        quizState.level++;
        quizState.exp -= quizState.expToNextLevel;
        quizState.expToNextLevel = 100 + 50 * quizState.level;
        quizState.maxHp += 5;
        quizState.hp = quizState.maxHp;
        quizState.maxMp += 3;
        quizState.mp = quizState.maxMp;
        quizState.stats.strength += 2;
        quizState.stats.agility += 1;
        quizState.stats.intelligence += 2;
        const newSpells = jobs[quizState.job].spells[quizState.level];
        if (newSpells) {
            if (Array.isArray(newSpells)) {
                newSpells.forEach(spell => {
                    if (!quizState.spells.includes(spell)) quizState.spells.push(spell);
                });
            } else if (!quizState.spells.includes(newSpells)) {
                quizState.spells.push(newSpells);
            }
            addMessage(`${newSpells.join ? newSpells.join('と ') : newSpells}を おぼえた！`);
        }
        addMessage(`${quizState.name}は レベル${quizState.level}に あがった！`, () => {
            sounds.levelup.play();
            showEffect('correct');
            confetti({ particleCount: 100, spread: 50, origin: { y: 0.6 } });
            saveState();
            updateStatus();
        });
    }
}

// ゲームオーバー
function gameOver() {
    sounds.battle.stop();
    addMessage(`${quizState.name}は ぜんめつした！復活の祈りを ささげますか？`, () => {
        document.getElementById('revive-choice').style.display = 'flex';
    });
}

function selectReviveChoice(choice) {
    playClick();
    document.getElementById('revive-choice').style.display = 'none';
    if (choice === 'yes') {
        revive();
        nextBattle();
    } else {
        addMessage('おつかれさまでした。電源は きらずに こちらのボタンを おして下さい', () => {
            document.getElementById('end-game-choice').style.display = 'flex';
        });
    }
}

function revive() {
    quizState.hp = quizState.maxHp;
    quizState.mp = quizState.maxMp;
    addMessage(`${quizState.name}は いきかえった！`);
    updateStatus();
}

// 魔法効果
function restoreHp(amount) {
    quizState.hp = Math.min(quizState.hp + amount, quizState.maxHp);
    addMessage(`HPが ${amount} かいふくした！`);
}

function lowerMonsterHp(amount) {
    quizState.monster.currentHp -= amount;
    addMessage(`${quizState.monster.name}に ${amount}の ダメージ！`, () => {
        if (quizState.monster.currentHp <= 0) {
            defeatMonster();
        }
    });
}

function fleeBattle() {
    playClick();
    const fleeSuccess = Math.random() < 0.85; // 85%の成功確率
    if (fleeSuccess) {
        sounds.battle.stop();
        sounds.field.play();
        addMessage(`${quizState.name}は にげだした！`, () => {
            addMessage('冒険に もどりますか？', () => {
                document.getElementById('flee-choice').style.display = 'flex';
            });
        });
    } else {
        addMessage(`${quizState.name}は にげだした。しかし てきに まわりこまれた！`, () => {
            setTimeout(monsterAttack, 1000);
        });
    }
}

function selectFleeChoice(choice) {
    playClick();
    document.getElementById('flee-choice').style.display = 'none';
    if (choice === 'yes') {
        nextBattle();
    } else {
        addMessage('おつかれさまでした。電源は きらずに こちらのボタンを おして下さい', () => {
            document.getElementById('end-game-choice').style.display = 'flex';
        });
    }
}

// 道具使用
function useItem() {
    playClick();
    const itemList = Object.keys(quizState.items).filter(item => quizState.items[item] > 0);
    if (itemList.length === 0) {
        addMessage('どうぐを もっていない！');
        return;
    }
    const itemSelect = document.getElementById('spell-list');
    itemSelect.innerHTML = '';
    itemList.forEach(item => {
        const button = document.createElement('button');
        button.className = 'dq3-btn';
        button.textContent = `${item} (残り: ${quizState.items[item]})`;
        button.onclick = () => {
            playClick();
            useSelectedItem(item);
            spellModal.hide();
        };
        itemSelect.appendChild(button);
    });
    spellModal.show();
}

function useSelectedItem(item) {
    switch (item) {
        case 'やくそう':
            restoreHp(Math.floor(Math.random() * (12 - 8 + 1)) + 8);
            quizState.items[item]--;
            break;
        case 'アモールの水':
            restoreHp(Math.floor(Math.random() * (80 - 40 + 1)) + 40);
            quizState.items[item]--;
            break;
        case 'うまのふん':
            lowerMonsterHp(Math.floor(Math.random() * (30 - 6 + 1)) + 6);
            quizState.items[item]--;
            break;
        case '雷鳴のつるぎ':
            lowerMonsterHp(Math.floor(Math.random() * (120 - 80 + 1)) + 80);
            break;
    }
    updateStatus();
    if (quizState.monster.currentHp <= 0) {
        defeatMonster();
    }
}

// 結果表示
function showResults() {
    const table = document.querySelector('#resultsModal .dq3-table');
    while (table.rows.length > 1) table.deleteRow(1);
    quizState.results.forEach(result => {
        const row = table.insertRow();
        row.insertCell(0).textContent = result.question;
        row.insertCell(1).textContent = result.correct;
        row.insertCell(2).textContent = result.selected;
        row.insertCell(3).textContent = result.isCorrect ? 'せいかい' : 'はずれ';
    });
    document.getElementById('results-level').textContent = `レベル: ${quizState.level}`;
    document.getElementById('results-exp').textContent = `けいけんち: ${quizState.exp}/${quizState.expToNextLevel}`;
    document.getElementById('results-gold').textContent = `ゴールド: ${quizState.gold}`;
    battleModal.hide();
    resultsModal.show();
    saveState();
}

function closeResults() {
    playClick();
    sounds.castle.stop();
    sounds.field.play();
    resultsModal.hide();
}

// ステータス表示
function showStatus() {
    playClick();
    const statusDisplay = document.getElementById('status-display');
    statusDisplay.innerHTML = `
        ${quizState.name || 'ゆうしゃ'}の ステータス<br>
        職業: ${jobs[quizState.job].name || 'せんし'}<br>
        レベル: ${quizState.level}<br>
        HP: ${quizState.hp}/${quizState.maxHp}<br>
        MP: ${quizState.mp}/${quizState.maxMp}<br>
        EXP: ${quizState.exp}/${quizState.expToNextLevel}<br>
        ちから: ${quizState.stats.strength}<br>
        すばやさ: ${quizState.stats.agility}<br>
        かしこさ: ${quizState.stats.intelligence}<br>
        ゴールド: ${quizState.gold}<br>
        じゅもん: ${quizState.spells.length > 0 ? quizState.spells.join(', ') : 'なし'}<br>
        どうぐ: ${Object.entries(quizState.items).map(([k, v]) => `${k}: ${v}`).join(', ') || 'なし'}
    `;
    statusModal.show();
}

// エフェクト表示
function showEffect(type) {
    const overlay = document.getElementById('effectOverlay');
    overlay.textContent = type === 'correct' ? '〇' : '×';
    overlay.className = `effect-overlay ${type}`;
    gsap.to(overlay, { scale: 2.5, opacity: 1, duration: 0.6, ease: "elastic.out(1, 0.3)", onStart: () => overlay.style.display = 'flex' });
    gsap.to(overlay, { scale: 3.5, opacity: 0, duration: 0.6, delay: 0.6, ease: "power2.in", onComplete: () => overlay.style.display = 'none' });
}

// 画面揺れエフェクトと枠線色変更
function applyShakeEffect() {
    const screen = document.querySelector('.dq3-screen');
    const windows = document.querySelectorAll('.dq3-window');
    screen.classList.add('shake');
    windows.forEach(window => window.classList.add('red-border'));
    setTimeout(() => {
        screen.classList.remove('shake');
        windows.forEach(window => window.classList.remove('red-border'));
    }, 1000);
}

// 初期化
window.addEventListener('load', () => {
    voiceModal = new bootstrap.Modal(document.getElementById('voiceModal'), { keyboard: true });
    battleModal = new bootstrap.Modal(document.getElementById('battleModal'), { keyboard: true });
    nameModal = new bootstrap.Modal(document.getElementById('nameModal'), { keyboard: true });
    jobModal = new bootstrap.Modal(document.getElementById('jobModal'), { keyboard: true });
    spellModal = new bootstrap.Modal(document.getElementById('spellModal'), { keyboard: true });
    categoryModal = new bootstrap.Modal(document.getElementById('categoryModal'), { keyboard: true });
    statusModal = new bootstrap.Modal(document.getElementById('statusModal'), { keyboard: true });
    resultsModal = new bootstrap.Modal(document.getElementById('resultsModal'), { keyboard: true });
    loadVoices();
    window.speechSynthesis.onvoiceschanged = () => loadVoices();
    loadState();
    loadData();
    document.querySelector('.message-window').addEventListener('click', advanceMessage);
    document.querySelectorAll('input[name="voiceSelect"]').forEach(radio => {
        radio.addEventListener('change', setVoice);
    });
    document.getElementById('status-btn')?.addEventListener('click', showStatus);
    // コマンドウィンドウの幅を調整
    const commandWindow = document.querySelector('.dq3-command-window');
    if (commandWindow) {
        commandWindow.style.width = '400px'; // 幅を400pxに拡張
    }
});