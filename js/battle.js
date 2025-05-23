// js/battle.js
import { gameState } from './gameState.js';
import { config } from './config.js';
import { typeMessage, showQuizOptions } from './quiz.js';
import { playSpellEffect } from './effect.js';
import { updateUI, showFieldScreen, showReviveScreen } from './ui.js';

console.log('battle.js loaded, importing updateUI, showFieldScreen, showReviveScreen from ui.js');

// soundEffects を定義し、エクスポート
export const soundEffects = {
    attack: new Howl({ src: ['./sounds/attack.mp3'], volume: 0.5 }),
    spell: new Howl({ src: ['./sounds/spell.mp3'], volume: 0.5 }),
    recover: new Howl({ src: ['./sounds/recover.mp3'], volume: 0.5 }),
    buttonClick: new Howl({ src: ['./sounds/click.mp3'], volume: 0.5 }),
    battleBgm: null // BGM は nextBattle で動的に設定
};

// コマンド選択画面を表示
export async function showCommandOptions() {
    console.log('showCommandOptions called');
    const state = gameState.getState();
    const commandWindow = document.getElementById('command-window');
    if (!commandWindow) {
        console.error('command-window element not found');
        return;
    }
    commandWindow.innerHTML = `
        <div class="row g-2">
            <div class="col-6"><button class="dq3-btn btn w-100" data-action="fight">たたかう</button></div>
            <div class="col-6"><button class="dq3-btn btn w-100" data-action="run">にげる</button></div>
            <div class="col-6"><button class="dq3-btn btn w-100" data-action="spell">まほう</button></div>
            <div class="col-6"><button class="dq3-btn btn w-100" data-action="item">どうぐ</button></div>
        </div>
    `;
    // ボタンにクリックイベントリスナーを追加（initializeCommandListeners で処理）
}

// 魔法選択画面を表示
export async function showSpellOptions() {
    console.log('showSpellOptions called');
    const state = gameState.getState();
    const commandWindow = document.getElementById('command-window');
    if (!commandWindow) {
        console.error('command-window element not found');
        return;
    }
    const spells = state.spells || [];
    commandWindow.innerHTML = `
        <div class="row g-2">
            ${spells.length > 0 ? spells.map(spell => `
                <div class="col-6"><button class="dq3-btn btn w-100" data-action="cast-${spell}">${spell}</button></div>
            `).join('') : '<div class="col-12"><p>まほうが ありません！</p></div>'}
            <div class="col-6"><button class="dq3-btn btn w-100" data-action="cancel-spell">もどる</button></div>
        </div>
    `;
}

// アイテム選択画面を表示
export async function showItemOptions() {
    console.log('showItemOptions called');
    const state = gameState.getState();
    const commandWindow = document.getElementById('command-window');
    if (!commandWindow) {
        console.error('command-window element not found');
        return;
    }
    const items = state.items || [];
    commandWindow.innerHTML = `
        <div class="row g-2">
            ${items.length > 0 ? items.map(item => `
                <div class="col-6"><button class="dq3-btn btn w-100" data-action="use-${item}">${item}</button></div>
            `).join('') : '<div class="col-12"><p>どうぐが ありません！</p></div>'}
            <div class="col-6"><button class="dq3-btn btn w-100" data-action="cancel-item">もどる</button></div>
        </div>
    `;
}

export async function executeAction(action) {
    console.log('Executing action:', action);
    const state = gameState.getState();
    const message = document.getElementById('battle-message');
    try {
        if (action === 'fight') {
            console.log('Calling showQuizOptions');
            await showQuizOptions();
        } else if (action === 'run') {
            console.log('Processing run action');
            await typeMessage(`${state.name}は にげだした！`, message, { clear: true, waitForClick: true });
            if (Math.random() < 0.5) {
                await typeMessage('しかし まわりこまれてしまった！', message, { clear: true, waitForClick: true });
                await enemyTurn();
            } else {
                await typeMessage('うまく にげきれた！', message, { clear: true, waitForClick: true });
                showFieldScreen('冒険をつづけますか？');
            }
        } else if (action === 'spell') {
            console.log('Calling showSpellOptions');
            gameState.setState({ currentAction: action });
            await showSpellOptions();
        } else if (action === 'item') {
            console.log('Calling showItemOptions');
            gameState.setState({ currentAction: action });
            await showItemOptions();
        } else {
            console.warn('Unknown action:', action);
        }
    } catch (error) {
        console.error('Error in executeAction:', error);
        await typeMessage('アクションの実行中にエラーが発生しました。', message, { clear: true, waitForClick: true });
    }
}

// 残りの関数（selectItemOrSpell, checkAnswer, etc.）は変更なし

export async function selectItemOrSpell(action) {
    console.log('Selecting item or spell:', action);
    const state = gameState.getState();
    const message = document.getElementById('battle-message');
    const feedback = document.getElementById('battle-feedback');
    const battleScreen = document.getElementById('battle-screen');

    if (action === 'cancel-spell' || action === 'cancel-item') {
        await showCommandOptions();
        return;
    }

    const [type, value] = action.split('-');
    if (type === 'use') {
        const itemIndex = state.items.indexOf(value);
        if (itemIndex !== -1) {
            state.items.splice(itemIndex, 1);
            if (value === 'やくそう') {
                const healAmount = Math.min(20, state.maxHp - state.hp);
                gameState.setState({ hp: state.hp + healAmount });
                await typeMessage(`${state.name}は やくそうを つかった！\nHPが ${healAmount} かいふくした！`, message, { clear: true, waitForClick: true });
            } else if (value === 'まほうのせいすい') {
                const healAmount = Math.min(30, state.maxMp - state.mp);
                gameState.setState({ mp: state.mp + healAmount });
                await typeMessage(`${state.name}は まほうのせいすいを つかった！\nMPが ${healAmount} かいふくした！`, message, { clear: true, waitForClick: true });
            }
            updateUI();
            await showCommandOptions();
            await enemyTurn();
        }
    } else if (type === 'cast') {
        const spellConfig = config.spells[value];
        if (state.mp < spellConfig.mpCost) {
            await typeMessage('MPが たりない！', message, { clear: true, waitForClick: true });
            await showCommandOptions();
            return;
        }
        gameState.setState({ mp: state.mp - spellConfig.mpCost });
        if (value === 'ホイミ') {
            const healAmount = Math.min(20, state.maxHp - state.hp);
            gameState.setState({ hp: state.hp + healAmount });
            await typeMessage(`${state.name}は ホイミを となえた！\nHPが ${healAmount} かいふくした！`, message, { clear: true, waitForClick: true });
            playSpellEffect(value, feedback, [battleScreen]);
            await new Promise(resolve => setTimeout(resolve, 1000));
        } else if (value === 'スカラ') {
            gameState.setState({ sukaraCount: state.sukaraCount + 1 });
            await typeMessage(`${state.name}は スカラを となえた！\n${state.name}の しゅびりょくが あがった！`, message, { clear: true, waitForClick: true });
            playSpellEffect(value, feedback, [battleScreen]);
            await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
            const damage = Math.floor(Math.random() * 10) + 10;
            gameState.setState({ monster: { ...state.monster, hp: state.monster.hp - damage } });
            await typeMessage(`${state.name}は ${value}を となえた！\n${state.monster.name}に ${damage}の ダメージ！`, message, { clear: true, waitForClick: true });
            playSpellEffect(value, feedback, [battleScreen]);
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (state.monster.hp <= 0) {
                await handleMonsterDefeated();
                return;
            }
        }
        updateUI();
        await showCommandOptions();
        await enemyTurn();
    }
}

export async function checkAnswer(index) {
    console.log('Checking answer:', index);
    const state = gameState.getState();
    const message = document.getElementById('battle-message');
    const feedback = document.getElementById('battle-feedback');
    const battleScreen = document.getElementById('battle-screen');
    const isCorrect = state.options[index].word === state.current.item.word;

    if (isCorrect) {
        const damage = Math.floor(Math.random() * 10) + (state.sukaraCount * 2 + 10);
        gameState.setState({ score: state.score + 10, monster: { ...state.monster, hp: state.monster.hp - damage } });
        await typeMessage(`${state.name}の こうげき！\n${state.monster.name}に ${damage}の ダメージ！`, message, { clear: true, waitForClick: true });
        if (!state.isSeMuted) soundEffects.attack.play();
        shakeElement(document.getElementById('monster-sprite'), config.enemyShakeMagnitude);
        if (state.monster.hp <= 0) {
            await handleMonsterDefeated();
            return;
        }
    } else {
        await typeMessage('しかし こうげきは はずれた！', message, { clear: true, waitForClick: true });
    }
    updateUI();
    await showCommandOptions();
    await enemyTurn();
}

async function enemyTurn() {
    const state = gameState.getState();
    const message = document.getElementById('battle-message');
    const damage = Math.max(1, Math.floor(Math.random() * state.monster.attack[1]) - state.sukaraCount * 2);
    gameState.setState({ hp: Math.max(0, state.hp - damage) });
    await typeMessage(`${state.monster.name}の こうげき！\n${state.name}に ${damage}の ダメージ！`, message, { clear: true, waitForClick: true });
    if (!state.isSeMuted) soundEffects.attack.play();
    updateUI();
    if (state.hp <= 0) {
        await typeMessage(`${state.name}は たおれた！`, message, { clear: true, waitForClick: true });
        showReviveScreen();
    } else {
        await showCommandOptions();
    }
}

async function handleMonsterDefeated() {
    const state = gameState.getState();
    const message = document.getElementById('battle-message');
    gameState.setState({ isMonsterDefeated: true, exp: state.exp + state.monster.exp });
    await typeMessage(`${state.monster.name}を たおした！\n${state.monster.exp}の けいけんちを かくとく！`, message, { clear: true, waitForClick: true });
    if (!state.isSeMuted) soundEffects.recover.play();
    if (state.exp >= state.expToNextLevel) {
        await handleLevelUp();
    } else {
        showFieldScreen('冒険をつづけますか？');
    }
}

async function handleLevelUp() {
    const state = gameState.getState();
    const message = document.getElementById('battle-message');
    gameState.setState({
        level: state.level + 1,
        exp: state.exp - state.expToNextLevel,
        expToNextLevel: Math.floor(state.expToNextLevel * config.expMultiplier),
        maxHp: state.maxHp + config.hpPerLevel,
        maxMp: state.maxMp + config.mpPerLevel,
        hp: state.maxHp + config.hpPerLevel,
        mp: state.maxMp + config.mpPerLevel,
        title: config.titles[state.level + 1] || state.title
    });
    await typeMessage(`${state.name}は レベル${state.level}に あがった！\n${state.name}の しゅびりょくが あがった！`, message, { clear: true, waitForClick: true });
    updateUI();
    showFieldScreen('冒険をつづけますか？');
}

export function selectMonster() {
    const state = gameState.getState();
    const level = state.godMode && state.godModeBoss ? 20 : Math.min(Math.floor(state.level / 5) + 1, 20);
    const monsterList = config.monsters[level] || config.monsters[1];
    const totalWeight = monsterList.reduce((sum, m) => sum + m.weight, 0);
    let random = Math.random() * totalWeight;
    let selectedMonster = monsterList[0];
    for (const monster of monsterList) {
        random -= monster.weight;
        if (random <= 0) {
            selectedMonster = monster;
            break;
        }
    }
    if (state.godMode && state.godModeBoss) {
        selectedMonster = config.monsters[20].find(m => m.name === state.godModeBoss) || selectedMonster;
    }
    const hp = Math.floor(Math.random() * (selectedMonster.hpRange[1] - selectedMonster.hpRange[0] + 1)) + selectedMonster.hpRange[0];
    gameState.setState({ monster: { ...selectedMonster, hp } });
}

export async function nextBattle() {
    console.log('Starting nextBattle');
    try {
        selectMonster();
        const state = gameState.getState();
        console.log('Current game state:', state);
        if (!state.monster || !state.monster.name) {
            console.error('Monster is null or invalid:', state.monster);
            const defaultMonster = {
                name: 'スライム',
                hp: 10,
                hpRange: [4, 14],
                exp: 22,
                attack: [5, 8],
                image: './images/slime.png',
                bgm: './sounds/dq3-battle.mp3',
                weight: 0.4
            };
            gameState.setState({ monster: defaultMonster });
            console.log('Set default monster:', defaultMonster);
        }
        gameState.setState({ isCommandPhase: true, isMonsterDefeated: false });
        console.log('Monster set:', state.monster);
        updateUI();
        const message = document.getElementById('battle-message');
        await typeMessage(`${state.monster.name}が あらわれた！`, message, { clear: true, waitForClick: true });
        console.log('Monster appearance message displayed:', state.monster.name);
        if (!state.isBgmMuted && state.monster.bgm) {
            if (soundEffects.battleBgm) soundEffects.battleBgm.stop();
            soundEffects.battleBgm = new Howl({ src: [state.monster.bgm], loop: true, volume: 0.3 });
            soundEffects.battleBgm.play();
        }
        await showCommandOptions();
        console.log('Command options displayed');
    } catch (error) {
        console.error('Error in nextBattle:', error);
        alert('戦闘の開始中にエラーが発生しました。コンソールを確認してください。');
        document.getElementById('battle-screen').classList.add('hidden');
        document.getElementById('start-screen').classList.remove('hidden');
    }
}

export function initializeSoundControls() {
    console.log('Initializing sound controls');
    const bgmToggle = document.getElementById('bgm-toggle');
    const seToggle = document.getElementById('se-toggle');
    if (!bgmToggle || !seToggle) {
        console.error('Sound control elements not found');
        return;
    }

    bgmToggle.addEventListener('click', () => {
        const state = gameState.getState();
        const isMuted = !state.isBgmMuted;
        gameState.setState({ isBgmMuted: isMuted });
        if (isMuted && soundEffects.battleBgm) {
            soundEffects.battleBgm.stop();
        } else if (!isMuted && state.monster && state.monster.bgm) {
            soundEffects.battleBgm = new Howl({ src: [state.monster.bgm], loop: true, volume: 0.3 });
            soundEffects.battleBgm.play();
        }
        bgmToggle.textContent = `BGM: ${isMuted ? 'OFF' : 'ON'}`;
        console.log('BGM toggled:', isMuted);
    });

    seToggle.addEventListener('click', () => {
        const state = gameState.getState();
        const isMuted = !state.isSeMuted;
        gameState.setState({ isSeMuted: isMuted });
        seToggle.textContent = `SE: ${isMuted ? 'OFF' : 'ON'}`;
        console.log('SE toggled:', isMuted);
    });
}

export function initializeCommandListeners() {
    console.log('Initializing command listeners');
    const commandWindow = document.getElementById('command-window');
    if (!commandWindow) {
        console.error('command-window element not found');
        return;
    }

    // 既存のリスナーをクリア
    commandWindow.removeEventListener('click', handleCommandClick);
    commandWindow.addEventListener('click', handleCommandClick);

    function handleCommandClick(e) {
        const button = e.target.closest('.dq3-btn');
        if (!button) return;
        const action = button.dataset.action;
        console.log('Command button clicked:', action);
        if (action.includes('cast-') || action.includes('use-') || action.includes('cancel-')) {
            selectItemOrSpell(action);
        } else {
            executeAction(action);
        }
    }
}

export function initializeGodMode() {
    const state = gameState.getState();
    gameState.setState({
        godMode: true,
        originalState: { ...state },
        level: 20,
        hp: 999,
        maxHp: 999,
        mp: 999,
        maxMp: 999,
        spells: Object.keys(config.spells),
        items: ['やくそう', 'まほうのせいすい']
    });
}

export function restoreNormalMode() {
    const state = gameState.getState();
    if (state.originalState) {
        gameState.setState({ ...state.originalState, godMode: false, godModeBoss: null, originalState: null });
    }
}

function shakeElement(element, magnitude) {
    let counter = 0;
    const originalPosition = element.style.position;
    element.style.position = 'relative';
    const shake = () => {
        if (counter < 10) {
            element.style.left = `${Math.random() * magnitude - magnitude / 2}px`;
            element.style.top = `${Math.random() * magnitude - magnitude / 2}px`;
            counter++;
            requestAnimationFrame(shake);
        } else {
            element.style.left = '0';
            element.style.top = '0';
            element.style.position = originalPosition;
        }
    };
    shake();
}

// DOMContentLoadedリスナーを1回だけ実行
let initialized = false;
document.addEventListener('DOMContentLoaded', () => {
    if (initialized) return;
    console.log('DOMContentLoaded: Initializing listeners');
    initializeCommandListeners();
    initializeSoundControls();
    initialized = true;
});