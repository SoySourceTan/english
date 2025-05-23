import { gameState } from './gameState.js';
import { config } from './config.js';
import { soundEffects } from './battle.js';
import { checkAnswer } from './battle.js';

console.log('quiz.js loaded, exporting loadWordData, wordData, getRandomWord, typeMessage, showQuizOptions');

export let wordData = {};

// words.json を読み込む
export async function loadWordData() {
    try {
        const response = await fetch('./words.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        wordData = await response.json();
        console.log('Word data loaded successfully:', wordData);
    } catch (error) {
        console.error('Error loading word data:', error);
        wordData = {
            nouns: [{ word: "apple", meaning: "りんご" }],
            verbs: [{ word: "run", meaning: "走る" }],
            adjectives: [{ word: "big", meaning: "大きい" }],
            adverbs: [{ word: "quickly", meaning: "速く" }]
        };
        console.log('Using fallback word data:', wordData);
    }
}

// ランダムな単語を取得
export function getRandomWord() {
    const categories = ['nouns', 'verbs', 'adjectives', 'adverbs'];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const wordList = wordData[category] || [];
    if (wordList.length === 0) {
        return { word: "apple", meaning: "りんご" };
    }
    return wordList[Math.floor(Math.random() * wordList.length)];
}

// メッセージをタイプライター形式で表示
export async function typeMessage(message, element, options = { clear: false, waitForClick: false }) {
    console.log('typeMessage called:', message, options);
    if (!element) {
        console.error('Message element not found');
        return;
    }
    if (options.clear) element.innerHTML = '';
    const characters = message.split('');
    element.classList.add('blinking-cursor');
    for (const char of characters) {
        element.innerHTML = element.innerHTML.replace('<span class="blinking-cursor"></span>', '');
        element.innerHTML += char + '<span class="blinking-cursor"></span>';
        await new Promise(resolve => setTimeout(resolve, config.messageSpeed || 50));
    }
    element.innerHTML = element.innerHTML.replace('<span class="blinking-cursor"></span>', '');
    if (options.waitForClick) {
        element.classList.add('blinking-cursor');
        await new Promise(resolve => {
            const handler = () => {
                element.removeEventListener('click', handler);
                resolve();
            };
            element.addEventListener('click', handler);
        });
    }
    element.classList.remove('blinking-cursor');
}

// クイズオプションを表示
export async function showQuizOptions() {
    console.log('showQuizOptions called');
    const state = gameState.getState();
    const messageElement = document.getElementById('battle-message');
    const quizOptions = document.getElementById('quiz-options');
    if (!messageElement || !quizOptions) {
        console.error('Required elements not found:', { messageElement, quizOptions });
        return;
    }

    // 難易度フィルタリング
    const levelRanges = {
        easy: [1, 5],
        medium: [6, 15],
        hard: [16, Infinity]
    };
    let difficulty = 'easy';
    for (const [diff, [min, max]] of Object.entries(levelRanges)) {
        if (state.level >= min && state.level <= max) {
            difficulty = diff;
            break;
        }
    }

    // カテゴリと単語の選択
    const categories = Object.keys(wordData).filter(key => Array.isArray(wordData[key]) && wordData[key].length > 0);
    if (categories.length === 0) {
        console.error('No valid categories found in wordData');
        await typeMessage('単語データがありません！', messageElement, { clear: true });
        return;
    }
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const items = wordData[randomCategory].filter(item => item.difficulty === difficulty);
    if (items.length === 0) {
        console.error(`No items for difficulty: ${difficulty} in category: ${randomCategory}`);
        await typeMessage('適切な単語が見つかりません！', messageElement, { clear: true });
        return;
    }

    // 正解の単語を選択
    const correctItem = items[Math.floor(Math.random() * items.length)];
    const questionType = correctItem.questionTypes[Math.floor(Math.random() * correctItem.questionTypes.length)];
    let correctAnswer = { word: correctItem.phrase || correctItem.word, meaning: correctItem.meaning };
    let questionText = `「${correctAnswer.meaning}」は どれ？`;

    // 反対語クイズの場合
    if (questionType === 'antonym' && correctItem.antonym) {
        const antonymItem = wordData[randomCategory].find(item => (item.phrase || item.word) === correctItem.antonym);
        if (antonymItem) {
            correctAnswer = { word: antonymItem.phrase || antonymItem.word, meaning: antonymItem.meaning };
            questionText = `「${correctItem.phrase || correctItem.word}」の反対語は どれ？`;
        } else {
            console.warn(`Antonym not found for ${correctItem.word}, falling back to meaning`);
            questionType = 'meaning'; // フォールバック
        }
    }

    gameState.setState({ current: { item: correctAnswer, category: randomCategory, questionType }, options: [] });

    // 選択肢生成（relatedWordsを優先）
    const options = [correctAnswer];
    const relatedItems = correctItem.relatedWords
        ? wordData[randomCategory].filter(item => correctItem.relatedWords.includes(item.phrase || item.word))
        : [];
    const otherItems = items.filter(item => (item.phrase || item.word) !== correctAnswer.word);

    while (options.length < 4 && (relatedItems.length > 0 || otherItems.length > 0)) {
        const source = relatedItems.length > 0 ? relatedItems : otherItems;
        const randomIndex = Math.floor(Math.random() * source.length);
        const otherItem = source[randomIndex];
        options.push({ word: otherItem.phrase || otherItem.word, meaning: otherItem.meaning });
        source.splice(randomIndex, 1);
    }

    // 選択肢が足りない場合のフォールバック
    if (options.length < 4) {
        console.warn('Not enough options generated, filling with placeholders');
        while (options.length < 4) {
            options.push({ word: `Dummy${options.length + 1}`, meaning: 'ダミー' });
        }
    }

    // 選択肢をシャッフル
    options.sort(() => Math.random() - 0.5);
    gameState.setState({ ...gameState.getState(), options });

    // UIに選択肢を表示
    quizOptions.innerHTML = `
        <div class="row g-2">
            ${options.map((opt, index) => `
                <div class="col-6">
                    <button class="dq3-btn btn w-100" data-index="${index}" data-is-correct="${opt.word === correctAnswer.word}">
                        <span class="option-text py-0 fs-5">${opt.word}</span>
                    </button>
                </div>
            `).join('')}
        </div>
    `;
    await typeMessage(`${state.monster.name}の こうげき！！\n${questionText}`, messageElement, { clear: true });

    // ボタンにイベントリスナーを追加
    quizOptions.querySelectorAll('button').forEach((button, index) => {
        button.addEventListener('click', () => {
            if (!state.isSeMuted) soundEffects.buttonClick.play();
            console.log('Quiz option clicked:', index);
            checkAnswer(index);
        }, { once: true });
    });
}

// 初期化時に words.json を読み込む
document.addEventListener('DOMContentLoaded', () => {
    loadWordData();
});