export const monsters = {
    weak: [
        { name: 'スライム', hp: 8, exp: 5, gold: 2, sprite: 'images/zoma.png', drop: 'やくそう', magic: ['メラ'] },
        { name: 'バブルスライム', hp: 10, exp: 6, gold: 3, sprite: 'images/zoma.png', drop: 'やくそう', magic: ['メラ'] },
        { name: 'メタルスライム', hp: 12, exp: 50, gold: 5, sprite: 'images/zoma.png', drop: 'やくそう', magic: ['メラミ'] },
        { name: 'はぐれメタル', hp: 12, exp: 100, gold: 10, sprite: 'images/zoma.png', drop: 'アモールの水', magic: ['メラミ'] }
    ],
    medium: [
        { name: 'ドラキー', hp: 15, exp: 8, gold: 4, sprite: 'images/zoma.png', drop: 'やくそう', magic: ['メラ'] },
        { name: 'くさったしたい', hp: 20, exp: 10, gold: 5, sprite: 'images/zoma.png', drop: 'うまのふん', magic: ['メラミ'] },
        { name: 'キメラ', hp: 25, exp: 12, gold: 6, sprite: 'images/zoma.png', drop: 'やくそう', magic: ['メラミ'] },
        { name: 'さまようよろい', hp: 30, exp: 15, gold: 8, sprite: 'images/zoma.png', drop: 'アモールの水', magic: ['ライデイン'] }
    ],
    strong: [
        { name: 'ゴーレム', hp: 40, exp: 20, gold: 10, sprite: 'images/zoma.png', drop: 'うまのふん', magic: ['メラゾーマ'] },
        { name: 'ゲマ', hp: 50, exp: 25, gold: 12, sprite: 'images/zoma.png', drop: 'やくそう', magic: ['メラゾーマ'] },
        { name: 'ムドー', hp: 60, exp: 30, gold: 15, sprite: 'images/zoma.png', drop: 'アモールの水', magic: ['ライデイン'] },
        { name: 'エビルプリースト', hp: 70, exp: 35, gold: 18, sprite: 'images/zoma.png', drop: 'うまのふん', magic: ['ギガデイン'] },
        { name: 'キングヒドラ', hp: 80, exp: 40, gold: 20, sprite: 'images/zoma.png', drop: 'やくそう', magic: ['ギガデイン'] },
        { name: 'バラモスゾンビ', hp: 70, exp: 35, gold: 18, sprite: 'images/zoma.png', drop: '雷鳴のつるぎ', magic: ['ライデイン'] },
        { name: 'バラモスブロス', hp: 60, exp: 30, gold: 15, sprite: 'images/zoma.png', drop: 'アモールの水', magic: ['メラゾーマ'] }
    ],
    boss: [
        { name: 'りゅうおう', hp: 100, exp: 50, gold: 25, sprite: 'images/zoma.png', drop: 'アモールの水', magic: ['メラゾーマ'] },
        { name: 'ハーゴン', hp: 120, exp: 60, gold: 30, sprite: 'images/zoma.png', drop: 'うまのふん', magic: ['ライデイン'] },
        { name: 'シドー', hp: 140, exp: 70, gold: 35, sprite: 'images/zoma.png', drop: 'やくそう', magic: ['ギガデイン'] },
        { name: 'バラモス', hp: 160, exp: 80, gold: 40, sprite: 'images/zoma.png', drop: 'アモールの水', magic: ['ギガデイン'] },
        { name: 'ゾーマ', hp: 180, exp: 90, gold: 45, sprite: 'images/zoma.png', drop: 'うまのふん', magic: ['ギガデイン'] },
        { name: 'デスピサロ', hp: 190, exp: 95, gold: 48, sprite: 'images/zoma.png', drop: 'やくそう', magic: ['ギガデイン'] },
        { name: 'ミルドラース', hp: 200, exp: 100, gold: 50, sprite: 'images/zoma.png', drop: 'アモールの水', magic: ['ギガデイン'] },
        { name: 'デスタムーア', hp: 200, exp: 100, gold: 50, sprite: 'images/zoma.png', drop: 'うまのふん', magic: ['ギガデイン'] }
    ],
    secret: [
        { name: 'ダークドレアム', hp: 300, exp: 150, gold: 75, sprite: 'images/zoma.png', drop: 'やくそう', magic: ['ギガデイン'] },
        { name: 'しんりゅう', hp: 250, exp: 125, gold: 60, sprite: 'images/zoma.png', drop: 'アモールの水', magic: ['ギガデイン'] },
        { name: 'エスターク', hp: 280, exp: 140, gold: 70, sprite: 'images/zoma.png', drop: 'うまのふん', magic: ['ギガデイン'] }
    ]
};

export function selectMonster(level) {
    if (level >= 40) return { ...monsters.secret[Math.floor(Math.random() * monsters.secret.length)], currentHp: monsters.secret[0].hp };
    if (level >= 30) return { ...monsters.boss[Math.floor(Math.random() * monsters.boss.length)], currentHp: monsters.boss[0].hp };
    if (level >= 20) return { ...monsters.strong[Math.floor(Math.random() * monsters.strong.length)], currentHp: monsters.strong[0].hp };
    if (level >= 10) return { ...monsters.medium[Math.floor(Math.random() * monsters.medium.length)], currentHp: monsters.medium[0].hp };
    return { ...monsters.weak[Math.floor(Math.random() * monsters.weak.length)], currentHp: monsters.weak[0].hp };
}