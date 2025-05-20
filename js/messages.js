import { quizState } from './state.js';
import { playClick } from './battle.js';

export function typeMessage(message, callback, addUnderscore = false) {
    if (quizState.isTyping) return;
    quizState.isTyping = true;
    quizState.currentMessage = '';
    const feedback = document.getElementById('battle-feedback');
    feedback.innerHTML = '';
    let i = 0;
    const interval = setInterval(() => {
        if (i < message.length) {
            quizState.currentMessage += message[i];
            feedback.textContent = quizState.currentMessage;
            i++;
        } else {
            clearInterval(interval);
            if (addUnderscore) {
                const underscore = document.createElement('span');
                underscore.className = 'blinking-underscore';
                underscore.textContent = '_';
                feedback.appendChild(underscore);
            }
            quizState.isTyping = false;
            if (callback) callback();
        }
    }, 50);
}

export function processMessageQueue() {
    if (quizState.messageQueue.length === 0 || quizState.isTyping) return;
    const { message, callback, addUnderscore } = quizState.messageQueue.shift();
    typeMessage(message, callback, addUnderscore);
}

export function addMessage(message, callback = null, addUnderscore = false) {
    quizState.messageQueue.push({ message, callback, addUnderscore });
    processMessageQueue();
}

export function advanceMessage() {
    playClick();
    if (quizState.isTyping) {
        quizState.isTyping = false;
        const feedback = document.getElementById('battle-feedback');
        feedback.textContent = quizState.currentMessage;
        processMessageQueue();
        return;
    }
    if (quizState.messageQueue.length > 0) {
        processMessageQueue();
    }
}

export function clearMessages() {
    quizState.messageQueue = [];
    quizState.isTyping = false;
    quizState.currentMessage = '';
    document.getElementById('battle-feedback').textContent = '';
}