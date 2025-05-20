export const config = {
    // メッセージ表示速度（ミリ秒/文字）
    messageSpeed: 20,
    // 敵への攻撃時の揺れ幅（ピクセル）
    enemyShakeMagnitude: 10,
    // プレイヤーがダメージを受けた時の揺れ幅（ピクセル）
    playerShakeMagnitude: 5,
    // モンスター設定（レベルごとの追加モンスター）
    monsters: {
        1: [
            { name: 'スライム', hpRange: [8, 14], exp: 22, attack: [1, 5], image: './images/zoma.png', bgm: './sounds/dq3-battle.mp3', weight: 0.4 },
            { name: 'ドラキー', hpRange: [10, 14], exp: 40, attack: [1, 6], image: './images/zoma.png', bgm: './sounds/DQ2-battle.mp3', weight: 0.3 }
        ],
        2: [
            // レベル2では新たなモンスターなし（スライム、ドラキーはレベル1から引き続き出現）
        ],
        3: [
            { name: 'ゴーレム', hpRange: [20, 30], exp: 60, attack: [5, 10], image: './images/zoma.png', bgm: './sounds/04 Monsters.mp3', weight: 0.2 }
        ],
        4: [
            { name: 'ゾーマ', hpRange: [50, 70], exp: 100, attack: [10, 15], image: './images/zoma.png', bgm: './sounds/zoma-bgm.mp3', weight: 0.1 }
        ]
    },
    // LVアップに必要なEXPの倍率
    expMultiplier: 1.5,
    // LVごとのHP増加量
    hpPerLevel: 20,
    // LVごとのMP増加量
    mpPerLevel: 20,
    // LVごとの称号
    titles: {
        1: '初心者',
        5: '冒険者',
        10: '勇者',
        20: '伝説'
    },
    spells: {
        'ホイミ': { requiredLevel: 1, mpCost: 5 },
        'スカラ': { requiredLevel: 1, mpCost: 20 },
        'ギガデイン': { requiredLevel: 1, mpCost: 30 },
        'メラ': { requiredLevel: 1, mpCost: 5 },
        'ギラ': { requiredLevel: 1, mpCost: 5 },
        'バギ': { requiredLevel: 1, mpCost: 5 },
        'ヒャド': { requiredLevel: 1, mpCost: 5 },
        'レムオム': { requiredLevel: 1, mpCost: 5 },
        'ルーラ': { requiredLevel: 1, mpCost: 5 }
    }
};