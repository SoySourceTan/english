import { soundEffects } from './battle.js';

export function playSpellEffect(spell, effectLayer, battleScreen) {
    console.log(`Playing effect for spell: ${spell}`);

    const createFlamePath = (className) => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('class', className);
        path.setAttribute('d', 'M150,400 Q200,300 250,400 T350,400 T450,400 T550,400');
        effectLayer.appendChild(path);
        return path;
    };

    const createLightningPath = (className) => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('class', className);
        path.setAttribute('d', 'M200,100 L220,300 L180,350 L200,500 L180,600');
        effectLayer.appendChild(path);
        return path;
    };

    const createTornadoPath = (className) => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('class', className);
        path.setAttribute('d', 'M300,600 Q350,500 400,600 T500,600 Q450,400 400,300 T300,100');
        effectLayer.appendChild(path);
        return path;
    };

    const createIcePath = (className) => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('class', className);
        path.setAttribute('d', 'M150,400 Q200,350 250,400 T350,400 Q300,300 250,200 T150,100');
        effectLayer.appendChild(path);
        return path;
    };

    switch (spell) {
        case 'ホイミ':
        case 'スカラ':
            soundEffects.recover.play();
            const flamePath = createFlamePath('flame-path');
            anime({
                targets: flamePath,
                strokeDashoffset: [anime.setDashoffset, 0],
                easing: 'easeInOutSine',
                duration: 2000,
                complete: () => effectLayer.removeChild(flamePath)
            });
            break;
        case 'ギガデイン':
            soundEffects.attack.play();
            const lightningPath = createLightningPath('lightning-path');
            anime({
                targets: lightningPath,
                strokeDashoffset: [anime.setDashoffset, 0],
                easing: 'easeInOutSine',
                duration: 2000,
                complete: () => effectLayer.removeChild(lightningPath)
            });
            break;
        case 'メラ':
            soundEffects.spell.play();
            const flamePathMera = createFlamePath('flame-path');
            anime({
                targets: flamePathMera,
                strokeDashoffset: [anime.setDashoffset, 0],
                translateY: -100,
                easing: 'easeInOutSine',
                duration: 2000,
                complete: () => effectLayer.removeChild(flamePathMera)
            });
            break;
        case 'ギラ':
            soundEffects.spell.play();
            const lightningPathGira = createLightningPath('lightning-path');
            anime({
                targets: lightningPathGira,
                strokeDashoffset: [anime.setDashoffset, 0],
                easing: 'easeInOutSine',
                duration: 2000,
                complete: () => effectLayer.removeChild(lightningPathGira)
            });
            break;
        case 'バギ':
            soundEffects.spell.play();
            const tornadoPath = createTornadoPath('tornado-path');
            anime({
                targets: tornadoPath,
                strokeDashoffset: [anime.setDashoffset, 0],
                rotate: 360,
                easing: 'easeInOutSine',
                duration: 2000,
                complete: () => effectLayer.removeChild(tornadoPath)
            });
            break;
        case 'ヒャド':
            soundEffects.spell.play();
            const icePath = createIcePath('ice-path');
            anime({
                targets: icePath,
                strokeDashoffset: [anime.setDashoffset, 0],
                translateY: -50,
                easing: 'easeInOutSine',
                duration: 2000,
                complete: () => effectLayer.removeChild(icePath)
            });
            break;
        case 'レムオム':
            soundEffects.spell.play();
            battleScreen.fadeTo(1000, 0.3, () => {
                battleScreen.fadeTo(1000, 1);
            });
            break;
        case 'ルーラ':
            soundEffects.spell.play();
            battleScreen.slideUp(1000, () => {
                battleScreen.slideDown(1000);
                const path = createFlamePath('flame-path');
                anime({
                    targets: path,
                    strokeDashoffset: [anime.setDashoffset, 0],
                    easing: 'easeInOutSine',
                    duration: 2000,
                    complete: () => effectLayer.removeChild(path)
                });
            });
            break;
        default:
            console.log(`No effect defined for spell: ${spell}`);
    }
}