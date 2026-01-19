import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';

// 1. CONFIGURAZIONE CAMERE
const cameraViews = {
    '1': { pos: { x: 2876, y: 1146, z: 1395 }, rot: { x: -0.11, y: 1.8, z: 0 }, focalLength: 40 },
    '2': { pos: { x: -1375, y: 321, z: -3225 }, rot: { x: -0.088, y: -2.328, z: -0.000 }, focalLength: 27 }
};

const LIGHT_SETUP = [
    { "x": 416, "y": 920, "z": 912, "rx": -0.95, "ry": 0, "rz": 0, "w": 3769, "h": 285, "int": 3.5, "col": 0xffffff },
    { "x": 2848, "y": 960, "z": 1000, "rx": -2.55, "ry": 0.88, "rz": 1.12, "w": 455, "h": 945, "int": 5, "col": 0xffffff },
    { "x": 208, "y": 4168, "z": -400, "rx": -2.71, "ry": 0, "rz": 0, "w": 1190, "h": 1000, "int": 8.2, "col": 0xffffff },
    { "x": -1440, "y": 624, "z": 912, "rx": 2.14, "ry": 0, "rz": 0, "w": 455, "h": 455, "int": 7.6, "col": 0xffffff }
];

let SCENE, CAMERA, RENDERER, FP_CONTROLS, GUI_GLOBAL;
let MODELLO_OLIVASTRA, TORSO_OLIVASTRA; 
let BALLERINA_2, GAMBA_DX_2, BRACCIO_DX_2_A, BRACCIO_DX_2_B; 
let BALLERINA_3, GAMBA_DX_3; 
let BALLERINA_4, GAMBA_DX_4, BRACCIO_DX_4; 
let BALLERINA_5, BACINO_5; 
let BALLERINA_6, BACINO_6; 
let BALLERINA_7, GAMBA_DX_7, GAMBA_SX_7, BRACCIO_DX_7, BRACCIO_SX_7; 
let BALLERINA_8, BRACCIO_DX_8, BRACCIO_SX_8;

let isJumpingB7 = false;
let jumpStartTimeB7 = 0;
let isSpeedBoosted = false;

const HELPERS = []; 
let helpersVisible = true;
const clock = new THREE.Clock();
let controlsEnabled = true;

const paramsB5 = { posX: -2870, posY: -4, posZ: 570, rotY: 0.98, bounceAmp: 10.0, bounceFreq: 3.0, currentRotSpeed: 0.05 };
const paramsB6 = { posX: -160, posY: -4, posZ: 100, rotY: 0.98, bounceAmp: 5.0, bounceFreq: 4.0, currentRotSpeed: -0.04 };
const paramsB7 = { posX: 940, posY: 14, posZ: -410, jumpHeight: 300, jumpSpeed: 4, splitAmp: 1.5 };
const paramsB8 = { posX: -40, posY: -4, posZ: -4, armAmp: 0.1, armFreq: 8.0 };

RectAreaLightUniformsLib.init();
init();
animate();

function init() {
    SCENE = new THREE.Scene();
    SCENE.background = new THREE.Color(0x21130d);
    SCENE.fog = new THREE.Fog(0x21130d, 2000, 20000);

    CAMERA = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100000);
    CAMERA.rotation.order = 'YXZ';
    
    const v1 = cameraViews['1'];
    CAMERA.position.set(v1.pos.x, v1.pos.y, v1.pos.z);
    CAMERA.rotation.set(v1.rot.x, v1.rot.y, v1.rot.z);
    CAMERA.setFocalLength(v1.focalLength);

    RENDERER = new THREE.WebGLRenderer({ antialias: true });
    RENDERER.setSize(window.innerWidth, window.innerHeight);
    RENDERER.outputColorSpace = THREE.SRGBColorSpace;
    RENDERER.shadowMap.enabled = true;
    RENDERER.shadowMap.type = THREE.PCFSoftShadowMap;

    document.body.appendChild(RENDERER.domElement);

    FP_CONTROLS = new FirstPersonControls(CAMERA, RENDERER.domElement);
    FP_CONTROLS.movementSpeed = 1200;
    FP_CONTROLS.lookSpeed = 0.1;

    GUI_GLOBAL = new GUI();
    const f5 = GUI_GLOBAL.addFolder('Ballerina 5 (Castana)');
    f5.add(paramsB5, 'posX', -5000, 5000).name('X').onChange(v => { if(BALLERINA_5) BALLERINA_5.position.x = v; });
    f5.add(paramsB5, 'posZ', -5000, 5000).name('Z').onChange(v => { if(BALLERINA_5) BALLERINA_5.position.z = v; });

    // NUOVA GUI BALLERINA 6 (ASIATICA)
    const f6 = GUI_GLOBAL.addFolder('Ballerina 6 (Asiatica)');
    f6.add(paramsB6, 'posX', -5000, 5000).name('X').onChange(v => { if(BALLERINA_6) BALLERINA_6.position.x = v; });
    f6.add(paramsB6, 'posZ', -5000, 5000).name('Z').onChange(v => { if(BALLERINA_6) BALLERINA_6.position.z = v; });

    const f7 = GUI_GLOBAL.addFolder('Ballerina 7 (SPACCATA)');
    f7.add(paramsB7, 'posX', -5000, 5000).name('X').onChange(v => { if(BALLERINA_7) BALLERINA_7.position.x = v; });
    f7.add(paramsB7, 'posZ', -5000, 5000).name('Z').onChange(v => { if(BALLERINA_7) BALLERINA_7.position.z = v; });
    f7.add(paramsB7, 'jumpHeight', 0, 1000).name('Altezza Salto');
    f7.add(paramsB7, 'jumpSpeed', 0, 10).name('Velocità');
    f7.add(paramsB7, 'splitAmp', 0, Math.PI).name('Apertura Spaccata');

    const f8 = GUI_GLOBAL.addFolder('Ballerina 8 (Bionda)');
    f8.add(paramsB8, 'posX', -5000, 5000).name('X').onChange(v => { if(BALLERINA_8) BALLERINA_8.position.x = v; });
    f8.add(paramsB8, 'posZ', -5000, 5000).name('Z').onChange(v => { if(BALLERINA_8) BALLERINA_8.position.z = v; });
    f8.add(paramsB8, 'armAmp', 0, 1.5).name('Ampiezza Braccia');

    LIGHT_SETUP.forEach(c => {
        const l = new THREE.RectAreaLight(c.col, c.int, c.w, c.h);
        l.position.set(c.x, c.y, c.z); l.rotation.set(c.rx, c.ry, c.rz);
        SCENE.add(l);
        const h = new RectAreaLightHelper(l); SCENE.add(h); HELPERS.push(h);
    });

    const newLightsData = [
        { name: 'Luce_A', pos: [-700, 525, -2500], rotX: -1.46398, w: 159.968, h: 289.942, int: 9.45, col: 0xfef1d7 },
        { name: 'Luce_B', pos: [-1280, 486, -3110], rotX: -1.79070, w: 500, h: 159.968, int: 17.3, col: 0xfef1d7 },
        { name: 'Luce_C', pos: [-500, 500, -3110], rotX: -1.95407, w: 289.942, h: 94.981, int: 18.6, col: 0xfef1d7 }
    ];

    newLightsData.forEach(d => {
        const l = new THREE.RectAreaLight(d.col, d.int, d.w, d.h);
        l.position.set(...d.pos); l.rotation.x = d.rotX;
        SCENE.add(l);
        const h = new RectAreaLightHelper(l); SCENE.add(h); HELPERS.push(h);
    });

    const shadowLight = new THREE.DirectionalLight(0xffffff, 1.5);
    shadowLight.position.set(-800, 2000, -2500);
    shadowLight.castShadow = true;
    shadowLight.shadow.mapSize.set(2048, 2048);
    SCENE.add(shadowLight);
    SCENE.add(new THREE.AmbientLight(0xffffff, 0.2));

    const mirror = new Reflector(new THREE.PlaneGeometry(660, 380), {
        clipBias: 0.003, textureWidth: window.innerWidth, textureHeight: window.innerHeight, color: 0x777777
    });
    mirror.position.set(-300, 285, -2638); mirror.rotation.y = -Math.PI / 2;
    SCENE.add(mirror);

    const loader = new GLTFLoader();
    const applyShadows = (obj, cast) => {
        obj.traverse(n => { if(n.isMesh) { n.castShadow = cast; n.receiveShadow = true; } });
    };

    loader.load('/TEATROBallerine.glb', (g) => { g.scene.scale.set(150, 150, 150); applyShadows(g.scene, false); SCENE.add(g.scene); });
    loader.load('/stanzapre.glb', (g) => { g.scene.scale.set(400, 400, 400); g.scene.position.set(-880, 45, -2530); applyShadows(g.scene, false); SCENE.add(g.scene); });
    
    loader.load('/ScenaPreAnimata.glb', (g) => {
        MODELLO_OLIVASTRA = g.scene; MODELLO_OLIVASTRA.scale.set(400, 400, 400); MODELLO_OLIVASTRA.position.set(-500, 45, -2500);
        applyShadows(MODELLO_OLIVASTRA, true);
        SCENE.add(MODELLO_OLIVASTRA); TORSO_OLIVASTRA = MODELLO_OLIVASTRA.getObjectByName('torso002');
    });

    loader.load('/ballerina_rossastra2.glb', (g) => {
        BALLERINA_2 = g.scene; BALLERINA_2.scale.set(400, 400, 400); BALLERINA_2.position.set(-900, 45, -2500); BALLERINA_2.rotation.y = 0.67;
        applyShadows(BALLERINA_2, true); SCENE.add(BALLERINA_2); 
        GAMBA_DX_2 = BALLERINA_2.getObjectByName('gamba_dx003');
        BRACCIO_DX_2_A = BALLERINA_2.getObjectByName('braccio_dx005'); BRACCIO_DX_2_B = BALLERINA_2.getObjectByName('braccio_dx006');
    });

    loader.load('/ballerina_rossastra3.glb', (g) => {
        BALLERINA_3 = g.scene; BALLERINA_3.scale.set(400, 400, 400); BALLERINA_3.position.set(-600, 60, -2500);
        applyShadows(BALLERINA_3, true); SCENE.add(BALLERINA_3); 
        GAMBA_DX_3 = BALLERINA_3.getObjectByName('gamba_dx001');
    });

    loader.load('/ballerina_nera.glb', (g) => {
        BALLERINA_4 = g.scene; BALLERINA_4.scale.set(400, 400, 400); BALLERINA_4.position.set(-980, 60, -2300);
        applyShadows(BALLERINA_4, true); SCENE.add(BALLERINA_4); 
        GAMBA_DX_4 = BALLERINA_4.getObjectByName('gamba_dx045');
        BRACCIO_DX_4 = BALLERINA_4.getObjectByName('braccio_dx074');
    });

    loader.load('/ballerina_castana.glb', (g) => {
        BALLERINA_5 = g.scene; BALLERINA_5.scale.set(150, 150, 150); BALLERINA_5.position.set(paramsB5.posX, paramsB5.posY, paramsB5.posZ);
        applyShadows(BALLERINA_5, true); SCENE.add(BALLERINA_5);
        BACINO_5 = BALLERINA_5.getObjectByName('bacino001');
    });

    loader.load('/ballerina_asiatica.glb', (g) => {
        BALLERINA_6 = g.scene; BALLERINA_6.scale.set(150, 150, 150); BALLERINA_6.position.set(paramsB6.posX, paramsB6.posY, paramsB6.posZ);
        applyShadows(BALLERINA_6, true); SCENE.add(BALLERINA_6);
        BACINO_6 = BALLERINA_6.getObjectByName('bacino033');
    });

    loader.load('/ballerina_rossa.glb', (g) => {
        BALLERINA_7 = g.scene; BALLERINA_7.scale.set(150, 150, 150); BALLERINA_7.position.set(paramsB7.posX, paramsB7.posY, paramsB7.posZ);
        applyShadows(BALLERINA_7, true); SCENE.add(BALLERINA_7);
        GAMBA_DX_7 = BALLERINA_7.getObjectByName('gamba_dx040');
        GAMBA_SX_7 = BALLERINA_7.getObjectByName('gamba_sx040'); 
        BRACCIO_DX_7 = BALLERINA_7.getObjectByName('braccio_dx063');
        BRACCIO_SX_7 = BALLERINA_7.getObjectByName('braccio_dx064');
    });

    loader.load('/ballerina_bionda.glb', (g) => {
        BALLERINA_8 = g.scene; BALLERINA_8.scale.set(150, 150, 150); BALLERINA_8.position.set(paramsB8.posX, paramsB8.posY, paramsB8.posZ);
        applyShadows(BALLERINA_8, true); SCENE.add(BALLERINA_8);
        BRACCIO_DX_8 = BALLERINA_8.getObjectByName('braccio_dx017');
        BRACCIO_SX_8 = BALLERINA_8.getObjectByName('braccio_dx018');
    });
}

window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'j' && !isJumpingB7) { isJumpingB7 = true; jumpStartTimeB7 = clock.getElapsedTime(); }
    if (key === 's') {
        isSpeedBoosted = !isSpeedBoosted;
        if (isSpeedBoosted) { paramsB5.currentRotSpeed = 0.35; paramsB6.currentRotSpeed = -0.34; } 
        else { paramsB5.currentRotSpeed = 0.05; paramsB6.currentRotSpeed = -0.04; }
    }
    if (key === 'c') controlsEnabled = !controlsEnabled;
    if (key === 'h') { helpersVisible = !helpersVisible; HELPERS.forEach(h => h.visible = helpersVisible); }
    if (key === 'p') console.log("Cam:", { pos: CAMERA.position, rot: CAMERA.rotation });
    if (cameraViews[key]) {
        const v = cameraViews[key];
        CAMERA.position.set(v.pos.x, v.pos.y, v.pos.z);
        CAMERA.rotation.set(v.rot.x, v.rot.y, v.rot.z);
        CAMERA.setFocalLength(v.focalLength);
        CAMERA.updateProjectionMatrix();
    }
});

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();
    if (FP_CONTROLS && controlsEnabled) FP_CONTROLS.update(delta);

    const wave = Math.sin(elapsed * 3) * 0.5;
    const waveBraccia = Math.sin(elapsed * 4) * 0.3;
    if (TORSO_OLIVASTRA) TORSO_OLIVASTRA.rotation.z = Math.sin(elapsed * 1.5) * 0.3;
    if (GAMBA_DX_2) GAMBA_DX_2.rotation.y = wave; 
    if (BRACCIO_DX_2_A) BRACCIO_DX_2_A.rotation.z = waveBraccia * 0.4;
    if (BRACCIO_DX_2_B) BRACCIO_DX_2_B.rotation.z = waveBraccia * 0.4;
    if (GAMBA_DX_3) GAMBA_DX_3.rotation.y = Math.sin(elapsed * 2) * 0.6; 
    if (BALLERINA_4 && GAMBA_DX_4) GAMBA_DX_4.rotation.y = Math.sin(elapsed * 2) * 1;
    if (BRACCIO_DX_4) BRACCIO_DX_4.rotation.x = waveBraccia; 
    
    if (BALLERINA_5) {
        if (BACINO_5) BACINO_5.rotation.z += paramsB5.currentRotSpeed; 
        BALLERINA_5.position.y = paramsB5.posY + Math.abs(Math.sin(elapsed * paramsB5.bounceFreq)) * paramsB5.bounceAmp;
    }
    if (BALLERINA_6) {
        if (BACINO_6) BACINO_6.rotation.z += paramsB6.currentRotSpeed; 
        BALLERINA_6.position.y = paramsB6.posY + Math.abs(Math.sin(elapsed * paramsB6.bounceFreq)) * paramsB6.bounceAmp;
    }

    if (BALLERINA_8) {
        const armWave = Math.sin(elapsed * paramsB8.armFreq) * paramsB8.armAmp;
        if (BRACCIO_DX_8) BRACCIO_DX_8.rotation.z = armWave;
        if (BRACCIO_SX_8) BRACCIO_SX_8.rotation.z = -armWave;
    }

    if (BALLERINA_7 && isJumpingB7) {
        const jumpElapsed = clock.getElapsedTime() - jumpStartTimeB7;
        const t = jumpElapsed * paramsB7.jumpSpeed;
        if (t <= Math.PI) {
            const jumpFactor = Math.sin(t);
            const splitFactor = Math.pow(jumpFactor, 2);
            BALLERINA_7.position.y = paramsB7.posY + jumpFactor * paramsB7.jumpHeight;
            if (GAMBA_DX_7) GAMBA_DX_7.rotation.y = splitFactor * paramsB7.splitAmp;
            if (GAMBA_SX_7) GAMBA_SX_7.rotation.y = splitFactor * paramsB7.splitAmp;
            if (BRACCIO_DX_7) BRACCIO_DX_7.rotation.z = -splitFactor * (paramsB7.splitAmp * 0.7);
            if (BRACCIO_SX_7) BRACCIO_SX_7.rotation.z = splitFactor * (paramsB7.splitAmp * 0.7);
        } else {
            isJumpingB7 = false;
            BALLERINA_7.position.y = paramsB7.posY;
            if (GAMBA_DX_7) GAMBA_DX_7.rotation.y = 0;
            if (GAMBA_SX_7) GAMBA_SX_7.rotation.y = 0;
            if (BRACCIO_DX_7) BRACCIO_DX_7.rotation.z = 0;
            if (BRACCIO_SX_7) BRACCIO_SX_7.rotation.z = 0;
        }
    }

    RENDERER.render(SCENE, CAMERA);
}