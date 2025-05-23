// js/ui.js
import { gameState } from './gameState.js';
import { config } from './config.js';
import { typeMessage } from './quiz.js';
import { soundEffects } from './battle.js';

console.log('ui.js loaded, exporting updateUI, showInitialScreen, showCharacterCreation, showFieldScreen, showReviveScreen');

export function updateUI() {
    console.log('updateUI called');
    const state = gameState.getState();
    document.getElementById('player-name').textContent = state.name;
    document.getElementById('player-job').textContent = state.job;
    document.getElementById('player-level').textContent = `Lv ${state.level} ${state.title}`;
    document.getElementById('player-hp').textContent = `HP ${state.hp}/${state.maxHp}`;
    document.getElementById('player-mp').textContent = `MP ${state.mp}/${state.maxMp}`;
    document.getElementById('player-score').textContent = `Score: ${state.score}`;
    document.getElementById('bgm-toggle').textContent = state.isBgmMuted ? 'BGM: OFF' : 'BGM: ON';
    document.getElementById('se-toggle').textContent = state.isSeMuted ? 'SE: OFF' : 'SE: ON';
    if (state.monster) {
        document.getElementById('monster-sprite').src = state.monster.image;
    }
}

export function showInitialScreen() {
    console.log('Calling showInitialScreen');
    const startScreen = document.getElementById('start-screen');
    const battleScreen = document.getElementById('battle-screen');
    const fieldScreen = document.getElementById('field-screen');
    const godModeMenu = document.getElementById('god-mode-menu');

    if (!startScreen) {
        console.error('start-screen element not found in DOM');
        return;
    }

    battleScreen.classList.add('hidden');
    fieldScreen.classList.add('hidden');
    godModeMenu.classList.add('hidden');
    startScreen.classList.remove('hidden');

    startScreen.innerHTML = `
        <div class="dq3-window text-center p-4">
            <h1>ドラクエ風クイズゲーム</h1>
            <button id="newGame" class="btn btn-primary mt-3">新しい冒険</button>
            <button id="loadGame" class="btn btn-secondary mt-3">冒険を再開</button>
        </div>
    `;
    console.log('start-screen updated with initial content');
}

export function showCharacterCreation() {
    const startScreen = document.getElementById('start-screen');
    startScreen.innerHTML = `
        <div class="dq3-window text-center p-4">
            <h2>キャラクター作成</h2>
            <div class="mb-3">
                <label for="nameInput" class="form-label">名前</label>
                <input type="text" class="form-control" id="nameInput" placeholder="ゆうしゃ">
            </div>
            <div class="mb-3">
                <label for="jobSelect" class="form-label">職業</label>
                <select class="form-select" id="jobSelect">
                    <option value="warrior">せんし</option>
                    <option value="wizard">まほうつかい</option>
                    <option value="priest">そうりょ</option>
                </select>
            </div>
            <button id="startAdventure" class="btn btn-primary mt-3">冒険をはじめる</button>
        </div>
    `;
}

export async function showFieldScreen(message) {
    console.log('showFieldScreen called:', message);
    const state = gameState.getState();
    const fieldScreen = document.getElementById('field-screen');
    const battleScreen = document.getElementById('battle-screen');
    const startScreen = document.getElementById('start-screen');
    if (!fieldScreen || !battleScreen || !startScreen) {
        console.error('Field screen elements not found');
        return;
    }
    battleScreen.classList.add('hidden');
    startScreen.classList.add('hidden');
    fieldScreen.classList.remove('hidden');
    const messageElement = document.getElementById('field-message');
    if (!messageElement) {
        console.error('field-message element not found');
        return;
    }
    await typeMessage(message, messageElement, { clear: true, waitForClick: true });
    const fieldOptions = document.getElementById('field-options');
    if (!fieldOptions) {
        console.error('field-options element not found');
        return;
    }
    fieldOptions.innerHTML = `
        <div class="row g-2">
            <div class="col-6"><button class="dq3-btn btn w-100" data-action="continue">冒険をつづける</button></div>
            <div class="col-6"><button class="dq3-btn btn w-100" data-action="save">ぼうけんのしょに かきこむ</button></div>
            <div class="col-6"><button class="dq3-btn btn w-100" data-action="quit">冒険をやめる</button></div>
        </div>
    `;
    return new Promise(resolve => {
        fieldOptions.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', () => {
                if (!state.isSeMuted) soundEffects.buttonClick.play();
                console.log('Field option clicked:', button.dataset.action);
                resolve(button.dataset.action);
            }, { once: true });
        });
    });
}

export async function showReviveScreen() {
    console.log('showReviveScreen called');
    const state = gameState.getState();
    const messageElement = document.getElementById('battle-message');
    if (!messageElement) {
        console.error('battle-message element not found');
        return;
    }
    await typeMessage(`${state.name}は しんでしまった！\nふっかつしますか？`, messageElement, { clear: true, waitForClick: true });
    const commandWindow = document.getElementById('command-window');
    if (!commandWindow) {
        console.error('command-window element not found');
        return;
    }
    commandWindow.innerHTML = `
        <div class="row g-2">
            <div class="col-6"><button class="dq3-btn btn w-100" data-action="revive">ふっかつする</button></div>
            <div class="col-6"><button class="dq3-btn btn w-100" data-action="quit">やめる</button></div>
        </div>
    `;
    return new Promise(resolve => {
        commandWindow.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', () => {
                if (!state.isSeMuted) soundEffects.buttonClick.play();
                console.log('Revive option clicked:', button.dataset.action);
                resolve(button.dataset.action === 'revive');
            }, { once: true });
        });
    });
}