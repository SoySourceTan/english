// gameState.js
class GameState {
    #state = {
        name: 'ゆうしゃ',
        job: 'warrior',
        level: 1,
        exp: 0,
        expToNextLevel: 100,
        hp: 30,
        maxHp: 30,
        mp: 50,
        maxMp: 50,
        score: 0,
        title: '初心者',
        monster: null,
        isCommandPhase: true,
        currentAction: null,
        items: ['やくそう', 'まほうのせいすい'],
        spells: ['ホイミ', 'スカラ', 'ギガデイン', 'メラ', 'ギラ', 'バギ', 'ヒャド', 'レムオム', 'ルーラ'],
        isMonsterDefeated: false,
        sukaraCount: 0,
        godMode: false,
        godModeBoss: null,
        originalState: null,
        isWaitingForClick: false,
        nextCallback: null,
        isBgmMuted: false,
        isSeMuted: false
    };

    getState() {
        return { ...this.#state };
    }

    setState(updates) {
        Object.assign(this.#state, updates);
        this.save();
        console.log('State updated:', this.#state);
    }

    save() {
        localStorage.setItem('gameState', JSON.stringify(this.#state));
        console.log('Game state saved:', this.#state);
    }

    load() {
        const savedState = localStorage.getItem('gameState');
        if (savedState) {
            this.#state = { ...this.#state, ...JSON.parse(savedState) };
            console.log('Game state loaded:', this.#state);
            return true;
        }
        return false;
    }

    reset() {
        this.#state = {
            name: 'ゆうしゃ',
            job: 'warrior',
            level: 1,
            exp: 0,
            expToNextLevel: 100,
            hp: 30,
            maxHp: 30,
            mp: 50,
            maxMp: 50,
            score: 0,
            title: '初心者',
            monster: null,
            isCommandPhase: true,
            currentAction: null,
            items: ['やくそう', 'まほうのせいすい'],
            spells: ['ホイミ', 'スカラ', 'ギガデイン', 'メラ', 'ギラ', 'バギ', 'ヒャド', 'レムオム', 'ルーラ'],
            isMonsterDefeated: false,
            sukaraCount: 0,
            godMode: false,
            godModeBoss: null,
            originalState: null,
            isWaitingForClick: false,
            nextCallback: null,
            isBgmMuted: false,
            isSeMuted: false
        };
        this.save();
        console.log('Game state reset');
    }
}

export const gameState = new GameState();