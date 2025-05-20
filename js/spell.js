import { quizState } from './state.js';
import { selectMonster } from './monsters.js';
import { addMessage } from './messages.js';
import { updateStatus, speak } from './ui.js';
import { showEffect, applyShakeEffect } from './battle.js';

export const spells = {
    メラ: {
        mp: 2,
        effect: () => {
            const damage = Math.floor(Math.random() * 5) + 5;
            quizState.monster.currentHp -= damage;
            addMessage(`メラの 炎が ${quizState.monster.name}を つつむ！${damage}の ダメージ！`, () => {
                showEffect('correct');
                if (quizState.monster.currentHp <= 0) {
                    addMessage(`${quizState.monster.name}を たおした！`);
                }
            });
        }
    },
    ヒャド: {
        mp: 3,
        effect: () => {
            const damage = Math.floor(Math.random() * 7) + 7;
            quizState.monster.currentHp -= damage;
            addMessage(`ヒャドの 冷気が ${quizState.monster.name}を こおらせる！${damage}の ダメージ！`, () => {
                showEffect('correct');
                if (quizState.monster.currentHp <= 0) {
                    addMessage(`${quizState.monster.name}を たおした！`);
                }
            });
        }
    },
    ホイミ: {
        mp: 4,
        effect: () => {
            const heal = Math.floor(Math.random() * 10) + 10;
            quizState.hp = Math.min(quizState.hp + heal, quizState.maxHp);
            addMessage(`ホイミの 光が ${quizState.name}を いやした！HPが ${heal} かいふく！`, () => {
                showEffect('correct');
                updateStatus();
            });
        }
    },
    バギ: {
        mp: 6,
        effect: () => {
            const damage = Math.floor(Math.random() * 10) + 10;
            quizState.monster.currentHp -= damage;
            addMessage(`バギの つむじ風が ${quizState.monster.name}を きりさく！${damage}の ダメージ！`, () => {
                showEffect('correct');
                if (quizState.monster.currentHp <= 0) {
                    addMessage(`${quizState.monster.name}を たおした！`);
                }
            });
        }
    },
    ザオリク: {
        mp: 15,
        effect: () => {
            if (quizState.hp > 0) {
                addMessage(`${quizState.name}は まだ しんでいない！`);
            } else {
                quizState.hp = quizState.maxHp;
                quizState.mp = quizState.maxMp;
                addMessage(`${quizState.name}は ふっかつした！`, () => {
                    showEffect('correct');
                    updateStatus();
                });
            }
        }
    },
    ルカニ: {
        mp: 3,
        effect: () => {
            quizState.monster.defense = Math.max(0, quizState.monster.defense - 5);
            addMessage(`${quizState.monster.name}の ぼうぎょりょくが さがった！`, () => {
                showEffect('correct');
            });
        }
    },
    ラリホー: {
        mp: 3,
        effect: () => {
            if (Math.random() < 0.7) {
                addMessage(`${quizState.monster.name}は ねむってしまった！`, () => {
                    showEffect('correct');
                });
            } else {
                addMessage(`${quizState.monster.name}は ねむらなかった！`);
            }
        }
    },
    マホトーン: {
        mp: 3,
        effect: () => {
            addMessage(`${quizState.monster.name}の じゅもんを ふうじた！`, () => {
                showEffect('correct');
            });
        }
    },
    イオ: {
        mp: 8,
        effect: () => {
            const damage = Math.floor(Math.random() * 15) + 15;
            quizState.monster.currentHp -= damage;
            addMessage(`イオの ばくはつが ${quizState.monster.name}を つつむ！${damage}の ダメージ！`, () => {
                showEffect('correct');
                if (quizState.monster.currentHp <= 0) {
                    addMessage(`${quizState.monster.name}を たおした！`);
                }
            });
        }
    },
    スクルト: {
        mp: 2,
        effect: () => {
            quizState.stats.defense = (quizState.stats.defense || 10) + 5;
            addMessage(`${quizState.name}の ぼうぎょりょくが あがった！`, () => {
                showEffect('correct');
                updateStatus();
            });
        }
    }
};