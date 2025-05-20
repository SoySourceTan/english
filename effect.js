import { soundEffects } from './battle.js';

export function playSpellEffect(spell, effectLayer, battleScreen) {
    console.log(`Playing effect for spell: ${spell}`);

    // 画面フラッシュエフェクト
    const flash = document.createElement('div');
    flash.style.position = 'absolute';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100%';
    flash.style.height = '100%';
    flash.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    flash.style.opacity = '0';
    flash.style.zIndex = '1000';
    battleScreen[0].appendChild(flash);
    anime({
        targets: flash,
        opacity: [0, 1, 0],
        duration: 500,
        easing: 'easeInOutQuad',
        complete: () => battleScreen[0].removeChild(flash)
    });

    // パーティクルエフェクト（モンスター付近）
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.width = battleScreen[0].offsetWidth;
    canvas.height = battleScreen[0].offsetHeight;
    canvas.style.zIndex = '999';
    battleScreen[0].appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const particles = [];
    const particleCount = 20;
    const monsterRect = document.getElementById('monster-sprite').getBoundingClientRect();
    const centerX = monsterRect.left + monsterRect.width / 2 - battleScreen[0].getBoundingClientRect().left;
    const centerY = monsterRect.top + monsterRect.height / 2 - battleScreen[0].getBoundingClientRect().top;

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: centerX,
            y: centerY,
            radius: Math.random() * 3 + 1,
            vx: Math.random() * 4 - 2,
            vy: Math.random() * 4 - 2,
            life: Math.random() * 100 + 50
        });
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p, i) => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 1;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = spell === 'メラ' ? 'red' : spell === 'ヒャド' ? 'cyan' : 'yellow';
            ctx.fill();
            if (p.life <= 0) {
                particles.splice(i, 1);
            }
        });
        if (particles.length > 0) {
            requestAnimationFrame(animateParticles);
        } else {
            battleScreen[0].removeChild(canvas);
        }
    }
    animateParticles();

    // 既存のSVGパスエフェクト
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