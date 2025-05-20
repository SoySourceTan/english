export const quizState = {
    score: 0,
    total: 10,
    current: null,
    options: [],
    currentIndex: 0,
    results: [],
    name: '',
    job: 'warrior',
    level: 1,
    exp: 0,
    expToNextLevel: 100,
    hp: 30,
    maxHp: 30,
    mp: 30,
    maxMp: 30,
    gold: 0,
    spells: ['ホイミ', 'メラ'],
    stats: { strength: 10, agility: 10, intelligence: 10 },
    monster: null,
    messageQueue: [],
    isTyping: false,
    currentMessage: '',
    items: { 'やくそう': 0, 'アモールの水': 0, 'うまのふん': 0, '雷鳴のつるぎ': 0 },
    hasThunderSword: false,
    selectedCategory: null
};

export function loadState() {
    quizState.name = localStorage.getItem('name') || '';
    quizState.job = localStorage.getItem('job') || 'warrior';
    quizState.level = parseInt(localStorage.getItem('level') || '1');
    quizState.exp = parseInt(localStorage.getItem('exp') || '0');
    quizState.expToNextLevel = parseInt(localStorage.getItem('expToNextLevel') || '100');
    quizState.hp = parseInt(localStorage.getItem('hp') || '30');
    quizState.maxHp = parseInt(localStorage.getItem('maxHp') || '30');
    quizState.mp = parseInt(localStorage.getItem('mp') || '30');
    quizState.maxMp = parseInt(localStorage.getItem('maxMp') || '30');
    quizState.gold = parseInt(localStorage.getItem('gold') || '0');
    quizState.spells = JSON.parse(localStorage.getItem('spells') || '["ホイミ", "メラ"]');
    quizState.stats = JSON.parse(localStorage.getItem('stats') || '{"strength":10,"agility":10,"intelligence":10}');
    quizState.items = JSON.parse(localStorage.getItem('items') || '{"やくそう":0,"アモールの水":0,"うまのふん":0,"雷鳴のつるぎ":0}');
    quizState.hasThunderSword = localStorage.getItem('hasThunderSword') === 'true';
}

export function saveState() {
    localStorage.setItem('name', quizState.name);
    localStorage.setItem('job', quizState.job);
    localStorage.setItem('level', quizState.level);
    localStorage.setItem('exp', quizState.exp);
    localStorage.setItem('expToNextLevel', quizState.expToNextLevel);
    localStorage.setItem('hp', quizState.hp);
    localStorage.setItem('maxHp', quizState.maxHp);
    localStorage.setItem('mp', quizState.mp);
    localStorage.setItem('maxMp', quizState.maxMp);
    localStorage.setItem('gold', quizState.gold);
    localStorage.setItem('spells', JSON.stringify(quizState.spells));
    localStorage.setItem('stats', JSON.stringify(quizState.stats));
    localStorage.setItem('items', JSON.stringify(quizState.items));
    localStorage.setItem('hasThunderSword', quizState.hasThunderSword);
}

export function resetGameState() {
    quizState.score = 0;
    quizState.total = 10;
    quizState.current = null;
    quizState.options = [];
    quizState.currentIndex = 0;
    quizState.results = [];
    quizState.monster = null;
    quizState.messageQueue = [];
    quizState.isTyping = false;
    quizState.currentMessage = '';
    quizState.selectedCategory = null;
}