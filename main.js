import { quizState, saveGameState, loadGameState, resetGameState } from './gameState.js';
import { updateUI, showInitialScreen, showCharacterCreation, showFieldScreen, showEscapeScreen, showReviveScreen } from './ui.js';
import { jobs, soundEffects, nextBattle, showCommandOptions, executeAction, selectItemOrSpell, checkAnswer, cancelAction } from './battle.js';
import { loadWordData, typeMessage, wordData } from './quiz.js';

async function startAdventure() {
    await loadWordData();
    if (!wordData.nouns || wordData.nouns.length === 0) {
        console.error('No nouns available for quiz');
        return;
    }
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('battle-screen').classList.remove('hidden');
    updateUI();
    nextBattle();
}

function handleFieldChoice(action) {
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
                saveGameState();
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
}

document.addEventListener('DOMContentLoaded', () => {
    showInitialScreen();

    document.getElementById('start-screen').addEventListener('click', (e) => {
        const newGameBtn = e.target.closest('#newGame');
        const loadGameBtn = e.target.closest('#loadGame');
        const startAdventureBtn = e.target.closest('#startAdventure');

        if (newGameBtn) {
            soundEffects.buttonClick.play();
            resetGameState();
            showCharacterCreation();
        } else if (loadGameBtn) {
            soundEffects.buttonClick.play();
            if (loadGameState()) {
                startAdventure();
            } else {
                alert('ぼうけんのしょがありません。はじめからスタートしてください。');
                resetGameState();
                showCharacterCreation();
            }
        } else if (startAdventureBtn) {
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
        console.log('Command window clicked, btn:', btn, 'isCommandPhase:', quizState.isCommandPhase, 'event target:', e.target);

        if (quizState.isMonsterDefeated) {
            e.stopPropagation();
            return;
        }

        if (!btn || btn.disabled) {
            console.log('No valid button clicked or button is disabled');
            return;
        }

        soundEffects.buttonClick.play();
        const action = btn.dataset.action;
        if (['fight', 'run', 'spell', 'item'].includes(action)) {
            executeAction(action);
        } else if (action.startsWith('use-') || action.startsWith('cast-') || action === 'cancel-spell' || action === 'cancel-item') {
            selectItemOrSpell(action);
        }
    });

    document.getElementById('quiz-options').addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        console.log('Quiz options clicked, btn:', btn, 'isCommandPhase:', quizState.isCommandPhase, 'event target:', e.target);

        if (quizState.isMonsterDefeated) {
            e.stopPropagation();
            return;
        }

        if (!btn || btn.disabled) return;

        soundEffects.buttonClick.play();
        const index = parseInt(btn.dataset.index, 10);
        console.log('Quiz option selected, index:', index);
        checkAnswer(index);
    });

    document.getElementById('field-options').addEventListener('click', (e) => {
        const btn = e.target.closest('.dq3-btn');
        if (btn) {
            soundEffects.buttonClick.play();
            handleFieldChoice(btn.dataset.action);
        }
    });
});