let wordData = { nouns: [], verbs: [], adjectives: [], adverbs: [], prepositions: [], phrases: [] }; // デフォルトで複数のカテゴリを想定

// プレイヤー状態の初期化
const quizState = {
    name: 'ゆうしゃ',
    job: 'warrior',
    level: 1,
    exp: 0,
    expToNextLevel: 100,
    hp: 30,
    maxHp: 30,
    mp: 30,
    maxMp: 30,
    score: 0,
    monster: null,
    isCommandPhase: true,
    currentAction: null,
    items: ['やくそう'],
    spells: ['ホイミ'],
    isMonsterDefeated: false
};

const jobs = {
    thief: { name: 'とうぞく', quizPref: 'nouns' },
    warrior: { name: 'せんし', quizPref: 'nouns' },
    mage: { name: 'まほうつかい', quizPref: 'verbs' },
    priest: { name: 'そうりょ', quizPref: 'verbs' },
    hero: { name: 'ゆうしゃ', quizPref: 'nouns' },
    merchant: { name: 'しょうにん', quizPref: 'nouns' },
    jester: { name: 'あそびにん', quizPref: 'adjectives' },
    sage: { name: 'けんじゃ', quizPref: 'verbs' }
};

const soundEffects = {
    click: new Howl({ src: ['./sounds/click.mp3'], volume: 0.5 }),
    cursole: new Howl({ src: ['./sounds/cursole.mp3'], volume: 0.5 }),
    buttonClick: new Howl({ src: ['./sounds/cursole.mp3'], volume: 0.5 }),
    miss: new Howl({ src: ['./sounds/miss.mp3'], volume: 0.5 }),
    attack: new Howl({ src: ['./sounds/attack.mp3'], volume: 0.5 }),
    eneattack: new Howl({ src: ['./sounds/eneattack.mp3'], volume: 0.5 }),
    lvup: new Howl({ src: ['./sounds/lvup.mp3'], volume: 0.5 }),
    pattack: new Howl({ src: ['./sounds/pattack.mp3'], volume: 0.5 }),
    spell: new Howl({ src: ['./sounds/spell.mp3'], volume: 0.5 }),
    recover: new Howl({ src: ['./sounds/recover.mp3'], volume: 0.5 }),
    win: new Howl({ src: ['./sounds/win.mp3'], volume: 0.5 }),
    escape: new Howl({ src: ['./sounds/escape.mp3'], volume: 0.5 }),
    yesno: new Howl({ src: ['./sounds/yesno.mp3'], volume: 0.5 }),
    incorrect: new Howl({ src: ['./sounds/incorrect.mp3'], volume: 0.5 })
};

// モンスターの定義リスト
const monsters = {
    1: [
        { name: 'スライム', hpRange: [8, 14], exp: 8, image: './images/slime.png' }
    ],
    2: [
        { name: 'スライム', hpRange: [8, 14], exp: 8, image: './images/slime.png' },
        { name: 'ドラキー', hpRange: [10, 14], exp: 10, image: './images/dracky.png' }
    ],
    // 将来的な拡張: レベル3以降のモンスターを追加
    // 3: [
    //     { name: 'ゴーレム', hpRange: [20, 30], exp: 20, image: './images/golem.png' },
    //     ...
    // ]
};

// プレイヤー状態の保存
function saveGameState() {
    const stateToSave = {
        name: quizState.name,
        job: quizState.job,
        level: quizState.level,
        hp: quizState.hp,
        maxHp: quizState.maxHp,
        mp: quizState.mp,
        maxMp: quizState.maxMp,
        exp: quizState.exp,
        expToNextLevel: quizState.expToNextLevel
    };
    localStorage.setItem('gameState', JSON.stringify(stateToSave));
    console.log('Game state saved:', stateToSave);
}

// プレイヤー状態の読み込み
function loadGameState() {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
        const parsedState = JSON.parse(savedState);
        quizState.name = parsedState.name;
        quizState.job = parsedState.job;
        quizState.level = parsedState.level;
        quizState.hp = parsedState.hp;
        quizState.maxHp = parsedState.maxHp;
        quizState.mp = parsedState.mp;
        quizState.maxMp = parsedState.maxMp;
        quizState.exp = parsedState.exp;
        quizState.expToNextLevel = parsedState.expToNextLevel;
        console.log('Game state loaded:', parsedState);
        return true;
    }
    return false;
}

// プレイヤー状態のリセット
function resetGameState() {
    quizState.name = 'ゆうしゃ';
    quizState.job = 'warrior';
    quizState.level = 1;
    quizState.exp = 0;
    quizState.expToNextLevel = 100;
    quizState.hp = 30;
    quizState.maxHp = 30;
    quizState.mp = 30;
    quizState.maxMp = 30;
    quizState.score = 0;
    quizState.items = ['やくそう'];
    quizState.spells = ['ホイミ'];
}

async function loadWordData() {
    // イベント: 単語データロード - 開始
    try {
        const response = await fetch('./words.json');
        const loadedData = await response.json();
        // デフォルトのwordDataにロードしたデータをマージ
        wordData = { ...wordData, ...loadedData };
        console.log('Word data loaded and merged:', wordData);
    } catch (error) {
        console.error('Error loading word data:', error);
        console.log('Using default wordData:', wordData);
    }
    // イベント: 単語データロード - 終了
}

function typeMessage(text, element, callback, wait = false) {
    // メッセージ: 表示開始
    if (!element) return;
    console.log('Displaying message:', text);
    element.textContent = '';
    element.style.pointerEvents = 'auto';
    let i = 0;

    function type() {
        if (i < text.length) {
            element.textContent += text[i];
            i++;
            setTimeout(type, 50);
        } else if (wait) {
            element.textContent += '_';
            const handleClick = () => {
                console.log('Message clicked');
                element.removeEventListener('click', handleClick);
                element.style.pointerEvents = 'none';
                if (callback) callback();
            };
            element.addEventListener('click', handleClick, { once: true });
            setTimeout(() => {
                if (element.textContent.endsWith('_')) {
                    console.log('Message timeout, proceeding');
                    element.textContent = element.textContent.replace('_', '');
                    element.style.pointerEvents = 'none';
                    if (callback) callback();
                }
            }, 5000);
        } else if (callback) {
            setTimeout(() => {
                console.log('Message typing complete, executing callback');
                callback();
            }, 500);
        }
    }
    type();
    // メッセージ: 表示終了
}

function updateUI() {
    const stats = document.getElementById('player-stats');
    if (stats) stats.textContent = `LV: ${quizState.level} EXP: ${quizState.exp}/${quizState.expToNextLevel} HP: ${quizState.hp}/${quizState.maxHp} MP: ${quizState.mp}/${quizState.maxMp}`;
}

function showInitialScreen() {
    // イベント: 初期画面表示 - 開始
    const startScreen = document.getElementById('start-screen');
    startScreen.classList.remove('hidden');
    startScreen.innerHTML = `
        <h1 class="fs-4 mb-4">冒険をはじめる</h1>
        <div class="d-grid gap-2">
            <button id="newGame" class="dq3-btn btn">はじめから</button>
            <button id="loadGame" class="dq3-btn btn">ぼうけんのしょ</button>
        </div>
    `;
    // イベント: 初期画面表示 - 終了
}

function showCharacterCreation() {
    // イベント: キャラクター作成画面表示 - 開始
    const startScreen = document.getElementById('start-screen');
    startScreen.innerHTML = `
        <h1 class="fs-4 mb-4">冒険をはじめる</h1>
        <div class="d-flex flex-column gap-3">
            <input id="nameInput" class="dq3-input form-control" type="text" placeholder="名前を入力" aria-label="名前" value="ゆうしゃ">
            <select id="jobSelect" class="dq3-input form-select">
                <option value="thief">とうぞく</option>
                <option value="warrior" selected>せんし</option>
                <option value="mage">まほうつかい</option>
                <option value="priest">そうりょ</option>
                <option value="hero">ゆうしゃ</option>
                <option value="merchant">しょうにん</option>
                <option value="jester">あそびにん</option>
                <option value="sage">けんじゃ</option>
            </select>
            <button id="startAdventure" class="dq3-btn btn">冒険開始！</button>
        </div>
    `;
    // イベント: キャラクター作成画面表示 - 終了
}

async function startAdventure() {
    // イベント: 冒険開始 - 開始
    await loadWordData();
    if (!wordData.nouns || wordData.nouns.length === 0) {
        console.error('No nouns available for quiz');
        return;
    }
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('battle-screen').classList.remove('hidden');
    updateUI();
    nextBattle();
    // イベント: 冒険開始 - 終了
}

function nextBattle() {
    // イベント: 戦闘開始 - 開始
    const availableMonsters = monsters[quizState.level] || monsters[1];
    const randomMonster = availableMonsters[Math.floor(Math.random() * availableMonsters.length)];
    const [minHp, maxHp] = randomMonster.hpRange;
    quizState.monster = {
        name: randomMonster.name,
        maxHp: Math.floor(Math.random() * (maxHp - minHp + 1)) + minHp,
        currentHp: Math.floor(Math.random() * (maxHp - minHp + 1)) + minHp,
        exp: randomMonster.exp,
        image: randomMonster.image
    };
    const monsterImage = document.getElementById('monster-sprite');
    if (monsterImage) {
        monsterImage.src = quizState.monster.image;
        monsterImage.style.filter = 'none'; // リセット
        monsterImage.style.opacity = '1';   // リセット
    }
    document.getElementById('monster-name').textContent = quizState.monster.name;
    quizState.isCommandPhase = true;
    quizState.currentAction = null;
    quizState.isMonsterDefeated = false;
    showCommandOptions();
    typeMessage(`${quizState.monster.name}が あらわれた`, document.getElementById('battle-message'));
    saveGameState(); // 戦闘開始時に状態を保存
    // イベント: 戦闘開始 - 終了
}

function showCommandOptions() {
    // イベント: コマンド表示 - 開始
    const commandWindow = document.getElementById('command-window');
    commandWindow.innerHTML = `
        <div class="d-grid gap-1" style="grid-template-columns: repeat(2, 1fr);">
            <button class="dq3-btn btn" data-action="fight">たたかう</button>
            <button class="dq3-btn btn" data-action="spell">じゅもん</button>
            <button class="dq3-btn btn" data-action="item">どうぐ</button>
            <button class="dq3-btn btn" data-action="run">にげる</button>
        </div>
    `;
    console.log('Command options re-rendered');
    // イベント: コマンド表示 - 終了
}

function showSpellOptions() {
    // イベント: 魔法選択画面表示 - 開始
    console.log('Showing spell options');
    const commandWindow = document.getElementById('command-window');
    commandWindow.innerHTML = `
        <div class="d-grid gap-1" style="grid-template-columns: repeat(2, 1fr);">
            ${quizState.spells.map(spell => `<button class="dq3-btn btn" data-action="cast-${spell}">${spell}</button>`).join('')}
        </div>
    `;
    quizState.isCommandPhase = true;
    // イベント: 魔法選択画面表示 - 終了
}

function showItemOptions() {
    // イベント: アイテム選択画面表示 - 開始
    console.log('Showing item options');
    const commandWindow = document.getElementById('command-window');
    commandWindow.innerHTML = `
        <div class="d-grid gap-1" style="grid-template-columns: repeat(2, 1fr);">
            ${quizState.items.map(item => `<button class="dq3-btn btn" data-action="use-${item}">${item}</button>`).join('')}
        </div>
    `;
    quizState.isCommandPhase = true;
    // イベント: アイテム選択画面表示 - 終了
}

function executeAction(action) {
    // イベント: アクション実行 - 開始
    const message = document.getElementById('battle-message');
    quizState.isCommandPhase = false;
    quizState.currentAction = action;
    console.log('Executing action:', action);

    if (action === 'fight') {
        showQuizOptions();
    } else if (action === 'spell') {
        showSpellOptions();
    } else if (action === 'item') {
        showItemOptions();
    } else if (action === 'run') {
        soundEffects.escape.play();
        typeMessage(`${quizState.name}は にげだした_`, message, showEscapeScreen, true);
    }
    // イベント: アクション実行 - 終了
}

function selectItemOrSpell(action) {
    // イベント: アイテム/魔法使用 - 開始
    console.log('Selecting item or spell:', action);
    const message = document.getElementById('battle-message');
    if (action.startsWith('use-')) {
        const item = action.replace('use-', '');
        console.log('Checking item:', item, 'Available items:', quizState.items);
        if (quizState.items.includes(item)) {
            const healAmount = Math.floor(Math.random() * (18 - 8 + 1)) + 8;
            quizState.hp = Math.min(quizState.hp + healAmount, quizState.maxHp);
            soundEffects.recover.play();
            typeMessage(`${quizState.name}は ${item}を つかった！\nHPが ${healAmount} かいふくした！`, message, () => {
                updateUI();
                quizState.isCommandPhase = true;
                showCommandOptions();
                // イベント: アイテム/魔法使用 - 回復終了
            });
        } else {
            console.log('Item not found:', item);
        }
    } else if (action.startsWith('cast-')) {
        const spell = action.replace('cast-', '');
        console.log('Checking spell:', spell, 'Available spells:', quizState.spells);
        if (quizState.spells.includes(spell)) {
            const healAmount = Math.floor(Math.random() * (18 - 8 + 1)) + 8;
            quizState.hp = Math.min(quizState.hp + healAmount, quizState.maxHp);
            soundEffects.recover.play();
            typeMessage(`${quizState.name}は ${spell}を となえた！\nHPが ${healAmount} かいふくした！`, message, () => {
                updateUI();
                quizState.isCommandPhase = true;
                showCommandOptions();
                // イベント: アイテム/魔法使用 - 魔法終了
            });
        } else {
            console.log('Spell not found:', spell);
        }
    }
    // イベント: アイテム/魔法使用 - 終了
}

function showQuizOptions() {
    // イベント: クイズ表示 - 開始
    const commandWindow = document.getElementById('command-window');
    commandWindow.innerHTML = `
        <div id="quiz-options" class="row row-cols-2 g-2">
            <div class="col"><button class="dq3-option btn w-100"><span class="option-text"></span></button></div>
            <div class="col"><button class="dq3-option btn w-100"><span class="option-text"></span></button></div>
            <div class="col"><button class="dq3-option btn w-100"><span class="option-text"></span></button></div>
            <div class="col"><button class="dq3-option btn w-100"><span class="option-text"></span></button></div>
        </div>
    `;
    const message = document.getElementById('battle-message');
    const feedback = document.getElementById('battle-feedback');
    message.textContent = '';
    feedback.textContent = '';

    // すべてのカテゴリを取得し、ランダムに選択
    const categories = Object.keys(wordData).filter(key => Array.isArray(wordData[key]) && wordData[key].length > 0);
    if (categories.length === 0) {
        console.error('No categories available for quiz');
        return;
    }
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const items = wordData[randomCategory];
    if (items.length === 0) {
        console.error('No items available for quiz in category:', randomCategory);
        return;
    }

    // phrasesカテゴリのデータ構造を調整
    const correctItem = items[Math.floor(Math.random() * items.length)];
    const adaptedItem = { word: correctItem.phrase || correctItem.word, meaning: correctItem.meaning };
    quizState.current = { item: adaptedItem, category: randomCategory };
    const optionsList = [adaptedItem];
    const otherItems = items.filter(item => (item.phrase || item.word) !== (correctItem.phrase || correctItem.word));
    while (optionsList.length < 4 && otherItems.length > 0) {
        const randomIndex = Math.floor(Math.random() * otherItems.length);
        const otherItem = otherItems[randomIndex];
        optionsList.push({ word: otherItem.phrase || otherItem.word, meaning: otherItem.meaning });
        otherItems.splice(randomIndex, 1);
    }
    optionsList.sort(() => Math.random() - 0.5);
    quizState.options = optionsList;
    typeMessage(`${quizState.monster.name}の こうげき！！\n「${adaptedItem.meaning}」は どれ？`, message);
    document.querySelectorAll('.dq3-option').forEach((btn, index) => {
        if (optionsList[index]) {
            btn.querySelector('.option-text').textContent = optionsList[index].word;
        }
    });
    console.log('Quiz options rendered, currentAction:', quizState.currentAction, 'Category:', randomCategory, 'Items:', items);
    // イベント: クイズ表示 - 終了
}

function checkAnswer(index) {
    // イベント: クイズ回答 - 開始
    const selectedOption = quizState.options[index];
    const isCorrect = selectedOption.word === quizState.current.item.word;
    const feedback = document.getElementById('battle-feedback');
    document.querySelectorAll('.dq3-option').forEach(btn => btn.disabled = true);

if (isCorrect) {
    soundEffects.miss.play();
    typeMessage(`ミス！！！${quizState.name}はダメージを受けない！`, feedback, () => {
        // プレイヤーの攻撃ターン
        const damage = Math.floor(Math.random() * 10) + 1; // 1-10のランダムダメージ
        quizState.monster.currentHp -= damage;
        soundEffects.attack.play();
        // モンスターのウィンドウに揺れエフェクト
        const monsterImage = document.getElementById('monster-sprite');
        if (monsterImage) {
            monsterImage.style.animation = 'none'; // monster-wiggleを停止
            monsterImage.classList.add('shake');
            setTimeout(() => {
                monsterImage.classList.remove('shake');
                monsterImage.style.animation = 'monster-wiggle 1s infinite'; // 元に戻す
            }, 500);
        }
        // 画面全体に揺れエフェクトを追加
        const battleScreen = document.getElementById('battle-screen');
        if (battleScreen) {
            battleScreen.classList.add('shake');
            setTimeout(() => battleScreen.classList.remove('shake'), 500);
        }
        typeMessage(`${quizState.name}の攻撃！${quizState.monster.name}に ${damage} のダメージ`, feedback, () => {
            // 以降の処理はそのまま
            if (quizState.monster.currentHp <= 0) {                    // モンスター撃破処理
                    soundEffects.win.play();
                    if (monsterImage) {
                        monsterImage.style.filter = 'grayscale(100%)';
                        monsterImage.style.opacity = '0.5';
                    }
                    quizState.exp += quizState.monster.exp; // EXP付与
                    quizState.isMonsterDefeated = true;
                    typeMessage(`${quizState.monster.name}を たおした！！！`, document.getElementById('battle-message'), () => {
                        if (quizState.exp >= quizState.expToNextLevel) {
                            quizState.level++;
                            quizState.maxHp += 5;
                            quizState.maxMp += 5;
                            quizState.hp = quizState.maxHp;
                            quizState.mp = quizState.maxMp;
                            quizState.expToNextLevel *= 1.5;
                            soundEffects.lvup.play();
                            typeMessage(`${quizState.name}はレベル${quizState.level}に上がった！\nHPとMPが最大まで回復！`, feedback, () => {
                                // フィードバックをクリアして次の画面へ
                                feedback.textContent = '';
                                updateUI();
                                showFieldScreen();
                                saveGameState(); // 撃破時に状態を保存
                            });
                        } else {
                            // フィードバックをクリアして次の画面へ
                            feedback.textContent = '';
                            updateUI();
                            showFieldScreen();
                            saveGameState(); // 撃破時に状態を保存
                        }
                    });
                } else {
                    showQuizOptions(); // 次の問題へ
                }
            });
        });
    } else {
        const damage = Math.floor(Math.random() * 10) + 1;
        quizState.hp = Math.max(0, quizState.hp - damage);
        soundEffects.eneattack.play();
        // 画面全体に揺れエフェクト
        document.getElementById('battle-screen').classList.add('shake');
        setTimeout(() => document.getElementById('battle-screen').classList.remove('shake'), 500);
        typeMessage(`${quizState.name}は ${damage} のダメージを受けた`, feedback, () => {
            updateUI();
            if (quizState.hp <= 0) {
                showReviveScreen();
            } else {
                showQuizOptions(); // 次の問題へ
            }
        });
    }
    // イベント: クイズ回答 - 終了
}

function showFieldScreen() {
    // イベント: 戦闘終了画面表示 - 開始
    console.log('Showing field screen');
    document.getElementById('battle-screen').classList.add('hidden');
    const fieldScreen = document.getElementById('field-screen');
    fieldScreen.classList.remove('hidden');
    const commandWindow = document.getElementById('command-window');
    commandWindow.innerHTML = '';
    const fieldMessage = document.getElementById('field-message');
    const fieldOptions = document.getElementById('field-options');
    fieldMessage.textContent = '';
    fieldOptions.textContent = ''; // 選択肢をクリア
    fieldOptions.classList.remove('hidden'); // 非表示解除
    typeMessage('冒険をつづけますか？', fieldMessage, () => {
        console.log('Rendering field options');
        fieldOptions.innerHTML = `
            <button class="dq3-btn btn w-100" data-action="yes">はい</button>
            <button class="dq3-btn btn w-100" data-action="no">いいえ</button>
        `;
        console.log('Field options HTML:', fieldOptions.innerHTML);
    });
    // イベント: 戦闘終了画面表示 - 終了
}

function showEscapeScreen() {
    // イベント: 逃走画面表示 - 開始
    document.getElementById('battle-screen').classList.add('hidden');
    const fieldScreen = document.getElementById('field-screen');
    fieldScreen.classList.remove('hidden');
    const fieldMessage = document.getElementById('field-message');
    const fieldOptions = document.getElementById('field-options');
    fieldMessage.textContent = '';
    fieldOptions.textContent = ''; // 選択肢をクリア
    fieldOptions.classList.remove('hidden'); // 非表示解除
    typeMessage('ゲームを おわりますか？', fieldMessage, () => {
        fieldOptions.innerHTML = `
            <button class="dq3-btn btn w-100" data-action="yes">はい</button>
            <button class="dq3-btn btn w-100" data-action="no">いいえ</button>
        `;
    });
    // イベント: 逃走画面表示 - 終了
}

function showReviveScreen() {
    // イベント: 復活画面表示 - 開始
    document.getElementById('battle-screen').classList.add('hidden');
    const fieldScreen = document.getElementById('field-screen');
    fieldScreen.classList.remove('hidden');
    const fieldMessage = document.getElementById('field-message');
    const fieldOptions = document.getElementById('field-options');
    fieldMessage.textContent = '';
    fieldOptions.textContent = ''; // 選択肢をクリア
    fieldOptions.classList.remove('hidden'); // 非表示解除
    typeMessage('ふっかつのいのりを ささげますか？', fieldMessage, () => {
        fieldOptions.innerHTML = `
            <button class="dq3-btn btn w-100" data-action="yes">はい</button>
            <button class="dq3-btn btn w-100" data-action="no">いいえ</button>
        `;
    });
    // イベント: 復活画面表示 - 終了
}

function handleFieldChoice(action) {
    // イベント: フィールド選択 - 開始
    const fieldMessage = document.getElementById('field-message');
    const fieldOptions = document.getElementById('field-options');
    console.log('Handling field choice:', action, 'Message:', fieldMessage.textContent);

    if (fieldMessage.textContent.includes('冒険をつづけますか？')) {
        if (action === 'yes') {
            document.getElementById('field-screen').classList.add('hidden');
            document.getElementById('battle-screen').classList.remove('hidden');
            nextBattle();
        } else {
            typeMessage('おつかれさまでした。本体の電源は切らずにウインドウを閉じてください', fieldMessage, () => {
                fieldOptions.classList.add('hidden');
                saveGameState(); // ゲーム終了時に状態を保存
                // 画面クリックで初期画面に戻る
                const fieldScreen = document.getElementById('field-screen');
                const returnToInitialScreen = () => {
                    fieldScreen.removeEventListener('click', returnToInitialScreen);
                    document.getElementById('field-screen').classList.add('hidden');
                    resetGameState();
                    showInitialScreen();
                };
                fieldScreen.addEventListener('click', returnToInitialScreen);
            });
        }
    } else if (fieldMessage.textContent.includes('ゲームを おわりますか？')) {
        if (action === 'yes') {
            typeMessage('おつかれさまでした。本体の電源は切らずにウインドウを閉じてください', fieldMessage, () => {
                fieldOptions.classList.add('hidden');
                saveGameState();
                // 画面クリックで初期画面に戻る
                const fieldScreen = document.getElementById('field-screen');
                const returnToInitialScreen = () => {
                    fieldScreen.removeEventListener('click', returnToInitialScreen);
                    document.getElementById('field-screen').classList.add('hidden');
                    resetGameState();
                    showInitialScreen();
                };
                fieldScreen.addEventListener('click', returnToInitialScreen);
            });
        } else {
            console.log('Returning to battle');
            document.getElementById('field-screen').classList.add('hidden');
            document.getElementById('battle-screen').classList.remove('hidden');
            nextBattle();
        }
    } else if (fieldMessage.textContent.includes('ふっかつのいのりを ささげますか？')) {
        if (action === 'yes') {
            quizState.hp = quizState.maxHp;
            quizState.mp = quizState.maxMp;
            updateUI();
            typeMessage(`${quizState.name}は ふっかくしました。`, fieldMessage, () => {
                document.getElementById('field-screen').classList.add('hidden');
                document.getElementById('battle-screen').classList.remove('hidden');
                nextBattle();
            });
        } else {
            typeMessage('おつかれさまでした。本体の電源は切らずにウインドウを閉じてください', fieldMessage, () => {
                fieldOptions.classList.add('hidden');
                saveGameState();
                // 画面クリックで初期画面に戻る
                const fieldScreen = document.getElementById('field-screen');
                const returnToInitialScreen = () => {
                    fieldScreen.removeEventListener('click', returnToInitialScreen);
                    document.getElementById('field-screen').classList.add('hidden');
                    resetGameState();
                    showInitialScreen();
                };
                fieldScreen.addEventListener('click', returnToInitialScreen);
            });
        }
    }
    // イベント: フィールド選択 - 終了
}

document.addEventListener('DOMContentLoaded', () => {
    // イベント: ページ読み込み - 開始
    showInitialScreen();

    document.getElementById('start-screen').addEventListener('click', (e) => {
        const newGameBtn = e.target.closest('#newGame');
        const loadGameBtn = e.target.closest('#loadGame');
        const startAdventureBtn = e.target.closest('#startAdventure');

        if (newGameBtn) {
            // ボタン: はじめから押下
            soundEffects.buttonClick.play();
            resetGameState();
            showCharacterCreation();
        } else if (loadGameBtn) {
            // ボタン: ぼうけんのしょ押下
            soundEffects.buttonClick.play();
            if (loadGameState()) {
                startAdventure();
            } else {
                alert('ぼうけんのしょがありません。はじめからスタートしてください。');
                resetGameState();
                showCharacterCreation();
            }
        } else if (startAdventureBtn) {
            // ボタン: 冒険開始ボタン押下
            soundEffects.buttonClick.play();
            const playerNameInput = document.getElementById('nameInput').value.trim();
            const playerJobSelect = document.getElementById('jobSelect').value;
            quizState.name = playerNameInput || 'ゆうしゃ';
            quizState.job = playerJobSelect || 'warrior';
            startAdventure();
        }
    });

    document.getElementById('command-window').addEventListener('click', (e) => {
        const btn = e.target.closest('.dq3-btn');
        const optionBtn = e.target.closest('.dq3-option');
        console.log('Command window clicked, btn:', btn, 'isCommandPhase:', quizState.isCommandPhase, 'event target:', e.target);

        if (quizState.isMonsterDefeated) {
            e.stopPropagation();
            return;
        }

        if (btn && !btn.disabled) {
            // ボタン: コマンドボタン押下
            soundEffects.buttonClick.play();
            const action = btn.dataset.action;
            if (['fight', 'run', 'spell', 'item'].includes(action) && quizState.isCommandPhase) {
                executeAction(action);
            } else if (action.startsWith('use-') || action.startsWith('cast-')) {
                selectItemOrSpell(action);
            }
        } else if (optionBtn && !optionBtn.disabled && !quizState.isCommandPhase && quizState.currentAction === 'fight') {
            // ボタン: クイズ選択ボタン押下
            soundEffects.buttonClick.play();
            const index = Array.from(optionBtn.parentElement.parentElement.children).indexOf(optionBtn.parentElement);
            checkAnswer(index);
        } else if (btn === null) {
            console.log('No button detected, checking DOM:', document.getElementById('command-window').innerHTML);
        }
    });

    document.getElementById('field-options').addEventListener('click', (e) => {
        const btn = e.target.closest('.dq3-btn');
        if (btn) {
            // ボタン: フィールド選択ボタン押下
            soundEffects.buttonClick.play();
            handleFieldChoice(btn.dataset.action);
        }
    });
    // イベント: ページ読み込み - 終了
});