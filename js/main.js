const gameState = {
    player: { hp: 30, maxHp: 30, level: 1, score: 0 },
    monster: { name: 'スライム', hp: 10, exp: 10, attack: [5, 8] },
    phase: 'command',
    currentQuiz: null,
    options: []
};

const words = [
    { meaning: 'りんご', word: 'apple' },
    { meaning: '走る', word: 'run' },
    { meaning: '大きい', word: 'big' },
    { meaning: '速く', word: 'quickly' }
];

function typeMessage(message, element, callback) {
    element.innerHTML = '';
    let i = 0;
    const interval = setInterval(() => {
        element.innerHTML += message[i];
        i++;
        if (i >= message.length) {
            clearInterval(interval);
            callback();
        }
    }, 50);
}

function showCommandOptions() {
    const commandWindow = document.getElementById('command-window');
    commandWindow.innerHTML = `
        <button class="dq3-btn" data-action="fight">たたかう</button>
        <button class="dq3-btn" data-action="run">にげる</button>
    `;
}

function showQuizOptions() {
    const quizOptions = document.getElementById('quiz-options');
    const messageElement = document.getElementById('battle-message');
    const current = words[Math.floor(Math.random() * words.length)];
    const options = [current];
    while (options.length < 4) {
        const word = words[Math.floor(Math.random() * words.length)];
        if (!options.some(opt => opt.word === word.word)) options.push(word);
    }
    options.sort(() => Math.random() - 0.5);
    gameState.currentQuiz = current;
    gameState.options = options;
    typeMessage(`「${current.meaning}」の英単語は？`, messageElement, () => {
        quizOptions.innerHTML = options.map((opt, i) => `
            <button class="dq3-btn" data-index="${i}">${opt.word}</button>
        `).join('');
    });
}

function updateUI() {
    document.getElementById('player-hp').textContent = `${gameState.player.hp}/${gameState.player.maxHp}`;
}

function startBattle() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('battle-screen').classList.remove('hidden');
    updateUI();
    typeMessage(`${gameState.monster.name}が あらわれた！`, document.getElementById('battle-message'), showCommandOptions);
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('start-screen').addEventListener('click', (e) => {
        if (e.target.id === 'start-btn') startBattle();
    });

    document.getElementById('battle-screen').addEventListener('click', (e) => {
        const btn = e.target.closest('.dq3-btn');
        if (!btn) return;
        const action = btn.dataset.action;
        const index = btn.dataset.index;
        const messageElement = document.getElementById('battle-message');

        if (action === 'fight') {
            gameState.phase = 'quiz';
            showQuizOptions();
        } else if (action === 'run') {
            typeMessage('ゆうしゃは にげだした！', messageElement, () => {
                typeMessage('うまく にげきれた！', messageElement, () => {
                    document.getElementById('battle-screen').classList.add('hidden');
                    document.getElementById('start-screen').classList.remove('hidden');
                });
            });
        } else if (index !== undefined) {
            const isCorrect = gameState.options[index].word === gameState.currentQuiz.word;
            if (isCorrect) {
                const damage = Math.floor(Math.random() * 10) + 10;
                gameState.monster.hp -= damage;
                gameState.player.score += 10;
                typeMessage(`ゆうしゃの こうげき！\n${gameState.monster.name}に ${damage}の ダメージ！`, messageElement, () => {
                    if (gameState.monster.hp <= 0) {
                        typeMessage(`${gameState.monster.name}を たおした！`, messageElement, () => {
                            document.getElementById('battle-screen').classList.add('hidden');
                            document.getElementById('start-screen').classList.remove('hidden');
                        });
                    } else {
                        enemyTurn();
                    }
                });
            } else {
                typeMessage('しかし こうげきは はずれた！', messageElement, enemyTurn);
            }
        }
    });
});

function enemyTurn() {
    const damage = Math.floor(Math.random() * (gameState.monster.attack[1] - gameState.monster.attack[0] + 1)) + gameState.monster.attack[0];
    gameState.player.hp = Math.max(0, gameState.player.hp - damage);
    updateUI();
    typeMessage(`${gameState.monster.name}の こうげき！\nゆうしゃに ${damage}の ダメージ！`, document.getElementById('battle-message'), () => {
        if (gameState.player.hp <= 0) {
            typeMessage('ゆうしゃは たおれた！', document.getElementById('battle-message'), () => {
                document.getElementById('battle-screen').classList.add('hidden');
                document.getElementById('start-screen').classList.remove('hidden');
            });
        } else {
            gameState.phase = 'command';
            showCommandOptions();
        }
    });
}