import { quizState } from './gameState.js';
import { config } from './config.js';

export let wordData = { nouns: [], verbs: [], adjectives: [], adverbs: [], prepositions: [], phrases: [] };

export async function loadWordData() {
    try {
        const response = await fetch('./words.json');
        if (!response.ok) {
            throw new Error(`Failed to fetch words.json: ${response.statusText}`);
        }
        const loadedData = await response.json();
        wordData = { ...wordData, ...loadedData };
        console.log('Word data loaded and merged:', wordData);
    } catch (error) {
        console.error('Error loading word data:', error);
        // ダミーデータでフォールバック
        wordData.nouns = [
            { word: 'sword', meaning: '剣' },
            { word: 'shield', meaning: '盾' },
            { word: 'armor', meaning: '鎧' },
            { word: 'potion', meaning: '薬' }
        ];
        console.log('Using fallback wordData:', wordData);
    }
}

let isTyping = false;

export function typeMessage(text, element, callback, wait = false) {
    if (!element) return;
    console.log('Displaying message:', text);
    element.textContent = '';
    element.style.pointerEvents = 'auto';
    element.classList.remove('blinking-cursor'); // 初期化
    let i = 0;

    function type() {
        if (i < text.length) {
            element.textContent += text[i];
            i++;
            setTimeout(type, config.messageSpeed);
        } else if (wait) {
            element.textContent += '_';
            element.classList.add('blinking-cursor'); // 点滅開始
            const handleClick = () => {
                console.log('Message clicked');
                element.classList.remove('blinking-cursor');
                element.textContent = element.textContent.replace('_', '');
                element.removeEventListener('click', handleClick);
                element.style.pointerEvents = 'none';
                if (callback) callback();
            };
            element.addEventListener('click', handleClick, { once: true });
        } else if (callback) {
            setTimeout(() => {
                console.log('Message typing complete, executing callback');
                callback();
            }, 500);
        }
    }
    type();
}

export function showQuizOptions() {
    const optionsDiv = document.getElementById('quiz-options');
    const message = document.getElementById('battle-message');
    const feedback = document.getElementById('battle-feedback');
    message.textContent = '';
    feedback.textContent = '';

    console.log('Current wordData:', wordData); // デバッグ用ログ
    const categories = Object.keys(wordData).filter(key => Array.isArray(wordData[key]) && wordData[key].length > 0);
    if (categories.length === 0) {
        console.error('No categories available for quiz');
        typeMessage('単語データがありません！ 戦闘を続けられません。', message);
        return;
    }
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const items = wordData[randomCategory];
    if (items.length === 0) {
        console.error('No items available for quiz in category:', randomCategory);
        typeMessage('単語データがありません！ 戦闘を続けられません。', message);
        return;
    }

    const correctItem = items[Math.floor(Math.random() * items.length)];
    const adaptedItem = { word: correctItem.phrase || correctItem.word, meaning: correctItem.meaning };
    quizState.current = { item: adaptedItem, category: randomCategory };
    const optionsList = [adaptedItem];
    const otherItems = items.filter(item => (item.phrase || item.word) !== (correctItem.phrase || correctItem.word));
    while (optionsList.length < 4 && otherItems.length > 0) {
        const randomIndex = Math.floor(Math.random() * otherItems.length);
        const otherItem = otherItems[randomIndex];
        optionsList.push({ word: otherItem.phrase || otherItem.word, meaning: otherItem.meaning });
        otherItems.splice(randomIndex, 1);
    }
    optionsList.sort(() => Math.random() - 0.5);
    quizState.options = optionsList;

    optionsDiv.innerHTML = `
        <div class="row g-2">
            ${optionsList.map((option, index) => `
                <div class="col-6">
                    <button class="dq3-option btn w-100" data-index="${index}" data-is-correct="${option.word === adaptedItem.word}">
                        <span class="option-text py-0 fs-3">${option.word}</span>
                    </button>
                </div>
            `).join('')}
        </div>
    `;
    typeMessage(`${quizState.monster.name}の こうげき！！\n「${adaptedItem.meaning}」は どれ？`, message);
    console.log('Quiz options rendered, Category:', randomCategory, 'Items:', items);
    console.log('showQuizOptions called, wordData:', wordData, 'categories:', categories);
console.log('Selected category:', randomCategory, 'items:', items);
console.log('Quiz state after generation, current:', quizState.current, 'options:', quizState.options);
}