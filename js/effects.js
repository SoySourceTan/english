// js/effect.js
import { soundEffects } from './battle.js';
import { gameState } from './gameState.js';

console.log('effect.js loaded, exporting playSpellEffect');

class EffectManager {
    constructor(battleScreen) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, battleScreen.offsetWidth / battleScreen.offsetHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.renderer.setSize(battleScreen.offsetWidth, battleScreen.offsetHeight);
        this.renderer.domElement.style.position = 'absolute';
        this.renderer.domElement.style.top = '0';
        this.renderer.domElement.style.left = '0';
        this.renderer.domElement.style.zIndex = '1000';
        battleScreen.appendChild(this.renderer.domElement);
        this.effects = [];
        this.animate = this.animate.bind(this);
        this.animate();
    }

    addEffect(effect) {
        this.effects.push(effect);
        this.scene.add(effect.mesh);
    }

    animate() {
        this.effects = this.effects.filter(effect => effect.animate());
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.animate);
    }

    destroy() {
        this.renderer.domElement.remove();
    }
}

class ParticleEffect {
    constructor(targetRect, battleScreen, color, count = 50, lifetime = 60, size = 0.2, gravity = 0) {
        const centerX = targetRect.left + targetRect.width / 2 - battleScreen.getBoundingClientRect().left;
        const centerY = targetRect.top + targetRect.height / 2 - battleScreen.getBoundingClientRect().top;
        this.mesh = new THREE.Points(
            new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3)),
            new THREE.PointsMaterial({ color, size, transparent: true, blending: THREE.AdditiveBlending })
        );
        this.velocities = new Float32Array(count * 3).map(() => (Math.random() - 0.5) * 0.2);
        this.lifetime = lifetime;
        this.gravity = gravity;
        this.cameraPosition = { x: centerX / 100, y: -centerY / 100 + 2, z: 5 };
        this.targetPosition = { x: centerX / 100, y: -centerY / 100, z: 0 };
    }

    animate() {
        if (this.lifetime <= 0) return false;
        const positions = this.mesh.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += this.velocities[i];
            positions[i + 1] += this.velocities[i + 1];
            positions[i + 2] += this.velocities[i + 2];
            this.velocities[i + 1] -= this.gravity;
        }
        this.mesh.geometry.attributes.position.needsUpdate = true;
        this.lifetime--;
        return true;
    }
}

export async function playSpellEffect(spell, effectLayer, battleScreen) {
    console.log('playSpellEffect called:', { spell, effectLayer, battleScreen });
    const manager = new EffectManager(battleScreen[0]);
    const monsterRect = document.getElementById('monster-sprite').getBoundingClientRect();
    const playerRect = { left: battleScreen[0].offsetWidth / 2, top: battleScreen[0].offsetHeight - 100, width: 100, height: 100 };

    const state = gameState.getState();
    switch (spell) {
        case 'ホイミ':
            if (!state.isSeMuted) soundEffects.recover.play();
            manager.addEffect(new ParticleEffect(playerRect, battleScreen[0], 0x00ff00, 50, 60, 0.15, -0.01));
            break;
        case 'スカラ':
            if (!state.isSeMuted) soundEffects.recover.play();
            manager.addEffect(new ParticleEffect(playerRect, battleScreen[0], 0x00b7eb, 30, 40, 0.2, 0));
            break;
        case 'ギガデイン':
            if (!state.isSeMuted) soundEffects.attack.play();
            manager.addEffect(new ParticleEffect(monsterRect, battleScreen[0], 0xffff00, 100, 30, 0.3, 0.01));
            break;
        // その他の呪文（簡略化のため省略）
    }

    await new Promise(resolve => {
        const check = () => manager.effects.length > 0 ? requestAnimationFrame(check) : resolve();
        check();
    });
    manager.destroy();
}