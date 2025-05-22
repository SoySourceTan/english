import { soundEffects } from './battle.js';

// 汎用パーティクルエフェクトクラス
class ParticleEffect {
    constructor(battleScreen, targetRect, color, count = 50, lifetime = 60, size = 0.2, gravity = 0) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, battleScreen[0].offsetWidth / battleScreen[0].offsetHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.renderer.setSize(battleScreen[0].offsetWidth, battleScreen[0].offsetHeight);
        this.renderer.domElement.style.position = 'absolute';
        this.renderer.domElement.style.top = '0';
        this.renderer.domElement.style.left = '0';
        this.renderer.domElement.style.zIndex = '1000';
        battleScreen[0].appendChild(this.renderer.domElement);

        // パーティクル
        this.particleCount = count;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.particleCount * 3);
        const velocities = new Float32Array(this.particleCount * 3);
        for (let i = 0; i < this.particleCount * 3; i += 3) {
            positions[i] = 0;
            positions[i + 1] = 0;
            positions[i + 2] = 0;
            velocities[i] = (Math.random() - 0.5) * 0.2;
            velocities[i + 1] = (Math.random() - 0.5) * 0.2;
            velocities[i + 2] = (Math.random() - 0.5) * 0.2;
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({
            color: color,
            size: size,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);

        // ターゲット位置（モンスターまたはプレイヤー）
        const centerX = targetRect.left + targetRect.width / 2 - battleScreen[0].getBoundingClientRect().left;
        const centerY = targetRect.top + targetRect.height / 2 - battleScreen[0].getBoundingClientRect().top;
        this.camera.position.set(centerX / 100, -centerY / 100 + 2, 5);
        this.camera.lookAt(new THREE.Vector3(centerX / 100, -centerY / 100, 0));

        this.velocities = velocities;
        this.lifetime = lifetime;
        this.gravity = gravity;
    }

    animate(rotation = 0) {
        if (this.lifetime <= 0) {
            this.renderer.domElement.remove();
            return false;
        }
        const positions = this.particles.geometry.attributes.position.array;
        for (let i = 0; i < this.particleCount * 3; i += 3) {
            positions[i] += this.velocities[i];
            positions[i + 1] += this.velocities[i + 1];
            positions[i + 2] += this.velocities[i + 2];
            this.velocities[i + 1] -= this.gravity;
        }
        this.particles.geometry.attributes.position.needsUpdate = true;
        this.particles.rotation.z += rotation;
        this.renderer.render(this.scene, this.camera);
        this.lifetime--;
        return true;
    }
}

// ギガデインの稲妻エフェクト（フルスクリーン）
class LightningEffect {
    constructor(battleScreen) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, battleScreen[0].offsetWidth / battleScreen[0].offsetHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.renderer.setSize(battleScreen[0].offsetWidth, battleScreen[0].offsetHeight);
        this.renderer.domElement.style.position = 'absolute';
        this.renderer.domElement.style.top = '0';
        this.renderer.domElement.style.left = '0';
        this.renderer.domElement.style.zIndex = '1001';
        battleScreen[0].appendChild(this.renderer.domElement);

        // ポストプロセッシング（フラッシュ）
        this.composer = new THREE.EffectComposer(this.renderer);
        this.composer.addPass(new THREE.RenderPass(this.scene, this.camera));
        this.flashPass = new THREE.ShaderPass({
            uniforms: {
                tDiffuse: { value: null },
                time: { value: 0 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform float time;
                varying vec2 vUv;
                void main() {
                    vec4 color = texture2D(tDiffuse, vUv);
                    float flash = abs(sin(time * 15.0)) * 0.7;
                    gl_FragColor = color + vec4(flash, flash, flash * 0.8, 0.5);
                }
            `
        });
        this.composer.addPass(this.flashPass);

        // 稲妻ライン（複数）
        this.lightnings = [];
        for (let j = 0; j < 3; j++) {
            const points = [];
            for (let i = 0; i < 10; i++) {
                points.push(new THREE.Vector3(
                    (Math.random() - 0.5) * 10 + (j - 1) * 2,
                    5 - i * 1,
                    (Math.random() - 0.5) * 2
                ));
            }
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({ color: 0x00ffff, linewidth: 3 });
            const lightning = new THREE.Line(geometry, material);
            this.scene.add(lightning);
            this.lightnings.push(lightning);
        }

        this.camera.position.z = 5;
        this.lifetime = 30;
        this.time = 0;
    }

    animate() {
        if (this.lifetime <= 0) {
            this.renderer.domElement.remove();
            return false;
        }
        this.time += 0.1;
        this.flashPass.uniforms.time.value = this.time;
        this.lightnings.forEach(lightning => {
            const positions = lightning.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i] += (Math.random() - 0.5) * 0.15;
            }
            lightning.geometry.attributes.position.needsUpdate = true;
        });
        this.composer.render();
        this.lifetime--;
        return true;
    }
}

// スカラのバリアエフェクト
class BarrierEffect {
    constructor(battleScreen, targetRect) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, battleScreen[0].offsetWidth / battleScreen[0].offsetHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.renderer.setSize(battleScreen[0].offsetWidth, battleScreen[0].offsetHeight);
        this.renderer.domElement.style.position = 'absolute';
        this.renderer.domElement.style.top = '0';
        this.renderer.domElement.style.left = '0';
        this.renderer.domElement.style.zIndex = '1000';
        battleScreen[0].appendChild(this.renderer.domElement);

        // バリア（球体）
        this.barrier = new THREE.Mesh(
            new THREE.SphereGeometry(0.5, 16, 16),
            new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 }
                },
                vertexShader: `
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform float time;
                    varying vec2 vUv;
                    void main() {
                        float glow = sin(time * 2.0) * 0.3 + 0.7;
                        gl_FragColor = vec4(0.0, 0.7, 1.0, glow * 0.5);
                    }
                `,
                transparent: true
            })
        );
        this.scene.add(this.barrier);

        // 位置
        const centerX = targetRect.left + targetRect.width / 2 - battleScreen[0].getBoundingClientRect().left;
        const centerY = targetRect.top + targetRect.height / 2 - battleScreen[0].getBoundingClientRect().top;
        this.camera.position.set(centerX / 100, -centerY / 100 + 2, 5);
        this.camera.lookAt(new THREE.Vector3(centerX / 100, -centerY / 100, 0));

        this.lifetime = 40;
        this.time = 0;
    }

    animate() {
        if (this.lifetime <= 0) {
            this.renderer.domElement.remove();
            return false;
        }
        this.time += 0.1;
        this.barrier.material.uniforms.time.value = this.time;
        this.barrier.rotation.y += 0.05;
        this.renderer.render(this.scene, this.camera);
        this.lifetime--;
        return true;
    }
}

export function playSpellEffect(spell, effectLayer, battleScreen) {
    console.log(`Playing effect for spell: ${spell}`);

    // モンスターとプレイヤーの位置
    const monsterRect = document.getElementById('monster-sprite').getBoundingClientRect();
    const playerRect = { left: battleScreen[0].offsetWidth / 2, top: battleScreen[0].offsetHeight - 100, width: 100, height: 100 }; // 仮のプレイヤー位置

    switch (spell) {
        case 'ホイミ':
            soundEffects.recover.play();
            const hoimiEffect = new ParticleEffect(battleScreen, playerRect, 0x00ff00, 50, 60, 0.15, -0.01); // 上昇
            function animateHoimi() {
                if (hoimiEffect.animate(0)) {
                    requestAnimationFrame(animateHoimi);
                }
            }
            animateHoimi();
            break;

        case 'スカラ':
            soundEffects.recover.play();
            const sukaraEffect = new ParticleEffect(battleScreen, playerRect, 0x00b7eb, 30, 40, 0.2, 0);
            const barrierEffect = new BarrierEffect(battleScreen, playerRect);
            function animateSukara() {
                const particleContinue = sukaraEffect.animate(0);
                const barrierContinue = barrierEffect.animate();
                if (particleContinue || barrierContinue) {
                    requestAnimationFrame(animateSukara);
                }
            }
            animateSukara();
            break;

        case 'ギガデイン':
            soundEffects.attack.play();
            const lightningEffect = new LightningEffect(battleScreen);
            const sparkEffect = new ParticleEffect(battleScreen, monsterRect, 0xffff00, 100, 30, 0.3, 0.01);
            function animateGigaDein() {
                const lightningContinue = lightningEffect.animate();
                const sparkContinue = sparkEffect.animate(0);
                if (lightningContinue || sparkContinue) {
                    requestAnimationFrame(animateGigaDein);
                }
            }
            animateGigaDein();
            break;

        case 'メラ':
            soundEffects.spell.play();
            const meraEffect = new ParticleEffect(battleScreen, monsterRect, 0xff4500, 80, 50, 0.25, 0.01);
            function animateMera() {
                if (meraEffect.animate(0)) {
                    requestAnimationFrame(animateMera);
                }
            }
            animateMera();
            break;

        case 'ギラ':
            soundEffects.spell.play();
            const giraEffect = new ParticleEffect(battleScreen, monsterRect, 0xff8c00, 60, 40, 0.2, 0);
            const linePoints = [
                new THREE.Vector3(-2, 0, 0),
                new THREE.Vector3(2, 0, 0)
            ];
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
            const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff8c00 });
            const flameLine = new THREE.Line(lineGeometry, lineMaterial);
            giraEffect.scene.add(flameLine);
            function animateGira() {
                if (giraEffect.animate(0)) {
                    requestAnimationFrame(animateGira);
                }
            }
            animateGira();
            break;

        case 'バギ':
            soundEffects.spell.play();
            const bagiEffect = new ParticleEffect(battleScreen, monsterRect, 0x00ff7f, 70, 50, 0.2, 0);
            function animateBagi() {
                if (bagiEffect.animate(0.05)) { // 渦巻き
                    requestAnimationFrame(animateBagi);
                }
            }
            animateBagi();
            break;

        case 'ヒャド':
            soundEffects.spell.play();
            const hyadoEffect = new ParticleEffect(battleScreen, monsterRect, 0x00b7eb, 60, 50, 0.25, 0.01);
            function animateHyado() {
                if (hyadoEffect.animate(0)) {
                    requestAnimationFrame(animateHyado);
                }
            }
            animateHyado();
            break;

        case 'レムオム':
            soundEffects.spell.play();
            const remuomuEffect = new ParticleEffect(battleScreen, monsterRect, 0x800080, 40, 60, 0.15, -0.005); // ゆっくり上昇
            function animateRemuomu() {
                if (remuomuEffect.animate(0)) {
                    requestAnimationFrame(animateRemuomu);
                }
            }
            animateRemuomu();
            break;

        case 'ルーラ':
            soundEffects.spell.play();
            const ruraEffect = new ParticleEffect(battleScreen, playerRect, 0x00ced1, 100, 80, 0.3, -0.02); // 高速上昇
            function animateRura() {
                if (ruraEffect.animate(0.1)) { // 渦巻き
                    requestAnimationFrame(animateRura);
                }
            }
            animateRura();
            // フェード（ポストプロセッシング）
            const fadeScene = new THREE.Scene();
            const fadeCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
            const fadeRenderer = new THREE.WebGLRenderer({ alpha: true });
            fadeRenderer.setSize(battleScreen[0].offsetWidth, battleScreen[0].offsetHeight);
            fadeRenderer.domElement.style.position = 'absolute';
            fadeRenderer.domElement.style.top = '0';
            fadeRenderer.domElement.style.left = '0';
            fadeRenderer.domElement.style.zIndex = '1002';
            battleScreen[0].appendChild(fadeRenderer.domElement);
            const fadeComposer = new THREE.EffectComposer(fadeRenderer);
            fadeComposer.addPass(new THREE.RenderPass(fadeScene, fadeCamera));
            const fadePass = new THREE.ShaderPass({
                uniforms: {
                    tDiffuse: { value: null },
                    time: { value: 0 }
                },
                vertexShader: `
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform float time;
                    varying vec2 vUv;
                    void main() {
                        float fade = smoothstep(0.0, 1.0, time) * smoothstep(2.0, 1.0, time);
                        gl_FragColor = vec4(0.0, 0.0, 0.0, fade);
                    }
                `
            });
            fadeComposer.addPass(fadePass);
            let fadeTime = 0;
            function animateFade() {
                if (fadeTime > 2) {
                    fadeRenderer.domElement.remove();
                    return;
                }
                fadeTime += 0.05;
                fadePass.uniforms.time.value = fadeTime;
                fadeComposer.render();
                requestAnimationFrame(animateFade);
            }
            animateFade();
            break;

        default:
            console.log(`No effect defined for spell: ${spell}`);
    }
}