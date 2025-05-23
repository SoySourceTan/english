// js/godMode.js
import { gameState } from './gameState.js';
import { config } from './config.js';
import { nextBattle, initializeGodMode, restoreNormalMode } from './battle.js';
import { updateUI } from './ui.js';
import { loadWordData } from './quiz.js';

async function startGodModeAdventure(bossName) {
    await loadWordData();
    gameState.setState({ godModeBoss: bossName, monster: null });
    initializeGodMode();
    document.getElementById('god-mode-menu').classList.add('hidden');
    document.getElementById('start-screen')?.classList.add('hidden');
    document.getElementById('field-screen')?.classList.add('hidden');
    document.getElementById('battle-screen').classList.remove('hidden');
    updateUI();
    await nextBattle();
}
document.addEventListener('DOMContentLoaded', () => {
    const godModeMenu = document.getElementById('god-mode-menu');
    const bossSelect = document.getElementById('boss-select');
    const startGodBattleBtn = document.getElementById('start-god-battle');
    const playerJob = document.getElementById('player-job');

    const monsters = [];
    for (const level in config.monsters) {
        config.monsters[level].forEach(monster => {
            if (!monsters.some(m => m.name === monster.name)) {
                monsters.push(monster);
            }
        });
    }
    bossSelect.innerHTML = `<option value="">ボスを選択</option>` + monsters.map(m => `<option value="${m.name}">${m.name}</option>`).join('');

    playerJob.addEventListener('click', () => {
        godModeMenu.classList.toggle('hidden');
    });

    bossSelect.addEventListener('change', () => {
        startGodBattleBtn.disabled = !bossSelect.value;
    });

    startGodBattleBtn.addEventListener('click', async () => {
        if (bossSelect.value) {
            await startGodModeAdventure(bossSelect.value);
        }
    });

    if (new URLSearchParams(window.location.search).get('godMode') === 'true') {
        godModeMenu.classList.remove('hidden');
    }
});