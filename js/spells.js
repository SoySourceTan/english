import { quizState } from './state.js';
import { showCategoryMenu } from './battle.js';

export const spells = {
    ホイミ: { mp: 3, effect: () => restoreHp(Math.floor(Math.random() * (12 - 8 + 1)) + 8) },
    ベホイミ: { mp: 8, effect: () => restoreHp(Math.floor(Math.random() * (80 - 40 + 1)) + 40) },
    ベホマ: { mp: 15, effect: () => restoreHp(quizState.maxHp - quizState.hp) },
    メラ: { mp: 5, effect: () => lowerMonsterHp(Math.floor(Math.random() * (30 - 6 + 1)) + 6) },
    メラミ: { mp: 10, effect: () => lowerMonsterHp(Math.floor(Math.random() * (80 - 50 + 1)) + 50) },
    メラゾーマ: { mp: 15, effect: () => lowerMonsterHp(Math.floor(Math.random() * (120 - 80 + 1)) + 80) },
    ライデイン: { mp: 15, effect: () => lowerMonsterHp(Math.floor(Math.random() * (120 - 80 + 1)) + 80) },
    ギガデイン: { mp: 20, effect: () => lowerMonsterHp(Math.floor(Math.random() * (180 - 120 + 1)) + 120) },
    カテゴリー選択: { mp: 2, effect: () => showCategoryMenu() },
    ギラ: { mp: 7, effect: () => lowerMonsterHp(Math.floor(Math.random() * (50 - 20 + 1)) + 20) },
    ヒャド: { mp: 4, effect: () => lowerMonsterHp(Math.floor(Math.random() * (40 - 15 + 1)) + 15) },
    ヒャダルコ: { mp: 12, effect: () => lowerMonsterHp(Math.floor(Math.random() * (100 - 60 + 1)) + 60) },
    イオ: { mp: 8, effect: () => lowerMonsterHp(Math.floor(Math.random() * (60 - 30 + 1)) + 30) },
    イオナズン: { mp: 18, effect: () => lowerMonsterHp(Math.floor(Math.random() * (150 - 100 + 1)) + 100) },
    キアリー: { mp: 3, effect: () => restoreHp(5) },
    スカラ: { mp: 4, effect: () => { quizState.stats.defense = (quizState.stats.defense || 10) + 5; } },
    ルカニ: { mp: 4, effect: () => { if (quizState.monster) quizState.monster.defense = Math.max(0, (quizState.monster.defense || 10) - 5); } },
    マホトーン: { mp: 5, effect: () => { /* モンスターの魔法封じ（効果なし） */ } },
    パルプンテ: { mp: 20, effect: () => { /* ランダム効果（未実装） */ } },
    バギ: { mp: 6, effect: () => lowerMonsterHp(Math.floor(Math.random() * (70 - 40 + 1)) + 40) }
};

function restoreHp(amount) {
    quizState.hp = Math.min(quizState.hp + amount, quizState.maxHp);
}

function lowerMonsterHp(amount) {
    if (quizState.monster) {
        quizState.monster.currentHp = Math.max(quizState.monster.currentHp - amount, 0);
    }
}