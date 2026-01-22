import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';

/**
 * 1. CONFIGURAZIONI (OGGETTI)
 */
const visteCamere = {
    '1': { pos: [-1375, 321, -3225], rot: [-0.088, -2.328, 0], focale: 27 },
    '2': { pos: [2876, 1146, 1395], rot: [-0.11, 1.8, 0], focale: 40 },
    '3': { pos: [3250, 335, -1950], rot: [-0.11, 1.525, 0], focale: 44 }
};

let pubPosX = 2800, pubPosY = 200, pubPosZ = -2023, pubScale = 3000, pubRotY = -1.57;

// --- VARIABILI GLOBALI ---
let scena, camera, renderer, orologio = new THREE.Clock();
let mixers = [], azioniDanzatrici = [], azioniPubblico = [];
let tremaCamera = false, scenaCorrente = '1';
let boostVelocita = false, tempoInizioSaltoB7 = 0, staSaltandoB7 = false;

let ballerina1, torso1, ballerina2, gambaDx2, brDx2A, brDx2B;
let ballerina3, gambaDx3, ballerina4, gambaDx4, brDx4;
let ballerina5, bacino5, ballerina6, bacino6, ballerina7, gambaDx7, gambaSx7, brDx7, brSx7;
let ballerina8, brDx8, brSx8, maestro, maestroBrDx, maestroBrSx;

/**
 * 2. INIZIALIZZAZIONE
 */
RectAreaLightUniformsLib.init();
init();
animate();

function init() {
    scena = new THREE.Scene();
    scena.background = new THREE.Color(0x21130d);
    scena.fog = new THREE.Fog(0x21130d, 2000, 20000);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100000);
    camera.rotation.order = 'YXZ';
    impostaCamera('1');

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    
    // ATTIVAZIONE OMBRE
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap; 
    
    document.body.appendChild(renderer.domElement);

    setupLuci();
    setupSpecchio();
    caricaModelli();

    window.addEventListener('keydown', gestisciInput);
    window.addEventListener('keyup', (e) => { if (e.key.toLowerCase() === 't') tremaCamera = false; });
}

/**
 * 3. FUNZIONI DI SETUP
 */

/**LUCI */
function setupLuci() {

    /**LUCI SCENA CENTRALE */

    const areaLight1 = new THREE.RectAreaLight(0xffffff, 3.5, 3769, 285);
    areaLight1.position.set(416, 920, 912); areaLight1.rotation.set(-0.95, 0, 0); scena.add(areaLight1);

    const areaLight2 = new THREE.RectAreaLight(0xffffff, 5, 455, 945);
    areaLight2.position.set(2848, 960, 1000); areaLight2.rotation.set(-2.55, 0.88, 1.12); scena.add(areaLight2);

    const areaLight3 = new THREE.RectAreaLight(0xffffff, 8.2, 1190, 1000);
    areaLight3.position.set(208, 1000, -400); areaLight3.rotation.set(-2.71, 0, 0); scena.add(areaLight3);

    const areaLight4 = new THREE.RectAreaLight(0xffffff, 7.6, 455, 455);
    areaLight4.position.set(-1440, 624, 912); areaLight4.rotation.set(2.14, 0, 0); scena.add(areaLight4);
    
    /**LUCI SCENA PRE */

    const areaLight5 = new THREE.RectAreaLight(0xfef1d7, 9.45, 160, 290);
    areaLight5.position.set(-700, 525, -2500); areaLight5.rotation.set(-1.46, 0, 0); scena.add(areaLight5);

    const areaLight6 = new THREE.RectAreaLight(0xfef1d7, 17.3, 500, 160);
    areaLight6.position.set(-1280, 486, -3110); areaLight6.rotation.set(-1.79, 0, 0); scena.add(areaLight6);

    const areaLight7 = new THREE.RectAreaLight(0xfef1d7, 18.6, 290, 95);
    areaLight7.position.set(-500, 500, -3110); areaLight7.rotation.set(-1.95, 0, 0); scena.add(areaLight7);

    /**LUCI SCENA POST */

    const areaLightPalco = new THREE.RectAreaLight(0xffe2a1, 0.5, 2000, 1000); 
    areaLightPalco.position.set(2250, 600, -2000); areaLightPalco.lookAt(2250, 0, -2000); scena.add(areaLightPalco);

    
    const spotConfig = [-1950, -1900, -2100];
    spotConfig.forEach((z) => {
        const spot = new THREE.SpotLight(0xffe2a1, 1000000);
        spot.position.set(3250, 700, z);
        spot.target.position.set(2250, 250, -2000);
        spot.angle = Math.PI / 18;
        spot.castShadow = true;
        scena.add(spot, spot.target);

    /**LUCE GENERALE AMBIENTE */

    const sole = new THREE.DirectionalLight(0xffffff, 1.5);
    sole.position.set(-800, 2000, -2500); 
    sole.castShadow = true; 
    sole.shadow.mapSize.width = 2048; 
    sole.shadow.mapSize.height = 2048;
    scena.add(sole);

    scena.add(new THREE.AmbientLight(0xffffff, 0.2));
    });
}

/**FUNZIONE PER CARICARE SPECCHIO NELLA SCENA PRE */

function setupSpecchio() {
    const specchio = new Reflector(new THREE.PlaneGeometry(660, 380), { 
        clipBias: 0.003, textureWidth: window.innerWidth, textureHeight: window.innerHeight, color: 0x777777 
    });
    specchio.position.set(-300, 285, -2638); specchio.rotation.y = -Math.PI / 2;
    scena.add(specchio);
}

/**
 * 4. CARICAMENTO MODELLI
 */
function caricaModelli() {
    const loader = new GLTFLoader();
    
    // FUNZIONE PER APPLICARE OMBRE AI MODELLI
    const ombra = (o) => { 
        o.traverse(n => { 
            if (n.isMesh) { 
                n.castShadow = true; 
                n.receiveShadow = true; 
            } 
        }); 
    };

    /**MODELLI AMBIENTI */

    loader.load('/TEATROBallerine.glb', g => { g.scene.scale.set(150, 150, 150); scena.add(g.scene); ombra(g.scene); });
    loader.load('/stanzapre2.glb', g => { g.scene.scale.set(400, 400, 400); g.scene.position.set(-880, 45, -2530); scena.add(g.scene); ombra(g.scene); });
    loader.load('/architettura_teatro_scena.glb', g => { g.scene.scale.set(150, 150, 150); g.scene.position.set(2000, 45, -2000); scena.add(g.scene); ombra(g.scene); });

    /**MODELLI BALLERINE */

    loader.load('/ScenaPreAnimata.glb', g => { ballerina1 = g.scene; ballerina1.scale.set(400, 400, 400); ballerina1.position.set(-500, 45, -2500); scena.add(ballerina1); ombra(ballerina1); torso1 = ballerina1.getObjectByName('torso002'); });
    loader.load('/ballerina_rossastra2.glb', g => { ballerina2 = g.scene; ballerina2.scale.set(400, 400, 400); ballerina2.position.set(-900, 45, -2500); ballerina2.rotation.y = 0.67; scena.add(ballerina2); ombra(ballerina2); gambaDx2 = ballerina2.getObjectByName('gamba_dx003'); brDx2A = ballerina2.getObjectByName('braccio_dx005'); brDx2B = ballerina2.getObjectByName('braccio_dx006'); });
    loader.load('/ballerina_rossastra3.glb', g => { ballerina3 = g.scene; ballerina3.scale.set(400, 400, 400); ballerina3.position.set(-600, 60, -2500); scena.add(ballerina3); ombra(ballerina3); gambaDx3 = ballerina3.getObjectByName('gamba_dx001'); });
    loader.load('/ballerina_nera.glb', g => { ballerina4 = g.scene; ballerina4.scale.set(400, 400, 400); ballerina4.position.set(-980, 60, -2300); scena.add(ballerina4); ombra(ballerina4); gambaDx4 = ballerina4.getObjectByName('gamba_dx045'); brDx4 = ballerina4.getObjectByName('braccio_dx074'); });
    loader.load('/ballerina_castana.glb', g => { ballerina5 = g.scene; ballerina5.scale.set(150, 150, 150); ballerina5.position.set(-2870, -4, 570); scena.add(ballerina5); ombra(ballerina5); bacino5 = ballerina5.getObjectByName('bacino001'); });
    loader.load('/ballerina_asiatica.glb', g => { ballerina6 = g.scene; ballerina6.scale.set(150, 150, 150); ballerina6.position.set(-160, -4, 100); scena.add(ballerina6); ombra(ballerina6); bacino6 = ballerina6.getObjectByName('bacino033'); });
    loader.load('/ballerina_rossa.glb', g => { ballerina7 = g.scene; ballerina7.scale.set(150, 150, 150); ballerina7.position.set(940, 14, -410); scena.add(ballerina7); ombra(ballerina7); gambaDx7 = ballerina7.getObjectByName('gamba_dx040'); gambaSx7 = ballerina7.getObjectByName('gamba_sx040'); brDx7 = ballerina7.getObjectByName('braccio_dx063'); brSx7 = ballerina7.getObjectByName('braccio_dx064'); });
    loader.load('/ballerina_bionda.glb', g => { ballerina8 = g.scene; ballerina8.scale.set(150, 150, 150); ballerina8.position.set(-40, -4, -4); scena.add(ballerina8); ombra(ballerina8); brDx8 = ballerina8.getObjectByName('braccio_dx017'); brSx8 = ballerina8.getObjectByName('braccio_dx018'); });
    loader.load('/maestro_di_ballo.glb', g => { maestro = g.scene; maestro.scale.set(170, 170, 170); maestro.position.set(210, -70, -200); scena.add(maestro); ombra(maestro); maestroBrDx = maestro.getObjectByName('braccio_dx009'); maestroBrSx = maestro.getObjectByName('braccio_sx009'); });

    /**MODELLO MIXAMO DEL PUBBLICO CHE APPLAUDE */

    const loadPub = (pos) => {
        loader.load('/modello_pubblico.glb', g => {
            const o = g.scene; o.scale.set(pubScale, pubScale, pubScale); o.position.set(...pos);
            scena.add(o); ombra(o);
            const m = new THREE.AnimationMixer(o);
            const i = m.clipAction(THREE.AnimationClip.findByName(g.animations, 'Applauso'));
            const s = m.clipAction(THREE.AnimationClip.findByName(g.animations, 'Caduta_4'));
            s.loop = THREE.LoopOnce; s.clampWhenFinished = true; i.play();
            azioniPubblico.push({ obj: o, applauso: i, shock: s }); mixers.push(m);
        });
    };

    loadPub([2800, 200, -2023]);
    loadPub([2840, 200, -2070]);
    loadPub([2800, 200, -1890]);
    loadPub([2840, 200, -1855]);

    /**MODELLI MIXAMO BALLERINE CHE SI INCHINANO (e cadono) */

    const mixD = [
        ['/ballerina_indiana_animata.glb', 2450, -1960, 2500, 'indiana'],
        ['/ballerina_indiana_animata.glb', 2450, -2040, 2500, 'indiana'],
        ['/ballerina_asiatica_animata.glb', 2450, -1920, 15000, 'asiatica'],
        ['/ballerina_asiatica_animata.glb', 2450, -2080, 15000, 'asiatica'],
        ['/ballerina_nera_animata.glb', 2450, -1880, 2500, 'nera'],
        ['/ballerina_nera_animata.glb', 2450, -2000, 2500, 'nera']
    ];
    mixD.forEach(c => {
        const sc = c[0].includes('asiatica') ? 15000 : 2500;
        loader.load(c[0], g => {
            const o = g.scene; o.scale.set(sc, sc, sc); o.position.set(c[1], 250, c[2]); o.rotation.y = 1.57; scena.add(o);
            ombra(o);
            const m = new THREE.AnimationMixer(o);
            const b = m.clipAction(THREE.AnimationClip.findByName(g.animations, c[0].includes('indiana') ? 'Inchino_1' : c[0].includes('asiatica') ? 'Inchino_2.001' : 'Inchino_3'));
            const f = m.clipAction(THREE.AnimationClip.findByName(g.animations, c[0].includes('indiana') ? 'Caduta_1' : c[0].includes('asiatica') ? 'Caduta_2.001' : 'Caduta_3'));
            f.clampWhenFinished = true; f.loop = THREE.LoopOnce; b.play();
            azioniDanzatrici.push({ inchino: b, caduta: f }); mixers.push(m);
        });
    });
}

/**FUNZIONE PER ESEGUIRE AZIONI CON TASTI */

function gestisciInput(e) {
    const k = e.key.toLowerCase();
    if (k === 's' && !staSaltandoB7) { staSaltandoB7 = true; tempoInizioSaltoB7 = orologio.getElapsedTime(); }
    if (k === 'v') boostVelocita = !boostVelocita;
    if (k === 't') {
        tremaCamera = true;
        azioniDanzatrici.forEach(d => { d.inchino.fadeOut(0.5); d.caduta.reset().fadeIn(0.5).play(); });
        azioniPubblico.forEach(a => { a.applauso.fadeOut(0.5); a.shock.reset().fadeIn(0.5).play(); });
    }
    if (k === 'i') {
        azioniDanzatrici.forEach(d => { d.caduta.fadeOut(0.5); d.inchino.reset().fadeIn(0.5).play(); });
        azioniPubblico.forEach(a => { a.shock.fadeOut(0.5); a.applauso.reset().fadeIn(0.5).play(); });
    }
    if (visteCamere[k]) impostaCamera(k);
}

/**FUNZIONE CHE REIMPOSTA LA POSIZIONE DELLA CAMERA AD OGNI CAMBIO */

function impostaCamera(n) {
    const v = visteCamere[n];
    camera.position.set(...v.pos); camera.rotation.set(...v.rot);
    camera.setFocalLength(v.focale); camera.updateProjectionMatrix();
}

/**FUNZIONE PER ANIMAZIONI */

function animate() {
    requestAnimationFrame(animate);
    const dt = orologio.getDelta(), el = orologio.getElapsedTime();
    mixers.forEach(m => m.update(dt));

    /**ANIMAZIONI PUBBLICO, forza i parametri del modello perché mixamo li resetta a ogni animazione */

    if (azioniPubblico.length >= 4) {
        azioniPubblico[0].obj.position.set(pubPosX, pubPosY, pubPosZ);
        azioniPubblico.forEach(a => { a.obj.rotation.y = pubRotY; a.obj.scale.set(pubScale, pubScale, pubScale); });
    }

    /**TREMBLE DELLA CAMERA AL TERREMOTO */

    if (tremaCamera) { camera.position.x += (Math.random()-0.5)*15; camera.position.y += (Math.random()-0.5)*15; }

    /**ANIMAZIONI DI STRETCHING NELLA SCENA PRE */

    const wave = (f, a) => Math.sin(el * f) * a;
    if (torso1) torso1.rotation.z = wave(1.5, 0.3);
    if (gambaDx2) gambaDx2.rotation.y = wave(3, 0.5);
    if (brDx2A) brDx2A.rotation.z = wave(4, 0.3);
    if (brDx2B) brDx2B.rotation.z = wave(4, 0.3);
    if (gambaDx3) gambaDx3.rotation.y = wave(2, 0.6);
    if (ballerina4 && gambaDx4) gambaDx4.rotation.y = wave(2, 1);
    if (brDx4) brDx4.rotation.x = wave(4, 0.3);

    /**ANIMAZIONI SCENA CENTRALE + ACCELERAZIONE DEI MOVIMENTI */

    if (ballerina5 && bacino5) { bacino5.rotation.z += boostVelocita ? 0.35 : 0.05; ballerina5.position.y = -4 + Math.abs(wave(3, 10)); }
    if (ballerina6 && bacino6) { bacino6.rotation.z += boostVelocita ? -0.34 : -0.04; ballerina6.position.y = -4 + Math.abs(wave(4, 5)); }
    if (ballerina8) { if (brDx8) brDx8.rotation.z = wave(8, 0.1); if (brSx8) brSx8.rotation.z = -wave(8, 0.1); }
    if (maestro) { let f = boostVelocita ? 40 : 10; if (maestroBrDx) maestroBrDx.rotation.y = wave(f, 0.5); if (maestroBrSx) maestroBrSx.rotation.y = -wave(f, 0.5); }

    /**BALLERINA CENTRALE, SALTO E MOVIMENTI IN ARIA + RITORNO ALLA POSIZIONE DI PARTENZA */

    if (ballerina7 && staSaltandoB7) {
        let t = (el - tempoInizioSaltoB7) * 4;
        if (t <= Math.PI) {
            let jF = Math.sin(t);
            ballerina7.position.y = 14 + jF * 300;
            if (gambaDx7) gambaDx7.rotation.y = Math.pow(jF, 2) * 1.5;
            if (gambaSx7) gambaSx7.rotation.y = Math.pow(jF, 2) * 1.5;
            if (brDx7) brDx7.rotation.z = -Math.pow(jF, 2) * 1.0;
            if (brSx7) brSx7.rotation.z = Math.pow(jF, 2) * 1.0;
        } else { staSaltandoB7 = false; ballerina7.position.y = 14; }
    }

    renderer.render(scena, camera);
}