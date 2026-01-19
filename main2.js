import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';

// 1. CONFIGURAZIONE CAMERE
const cameraViews = {
    '1': { pos: { x: 2198, y: 1082, z: 1592 }, rot: { x: -0.11, y: 1.8, z: 0 }, focalLength: 40 },
    '2': { pos: { x: -1375, y: 321, z: -3225 }, rot: { x: -0.088, y: -2.328, z: -0.000 }, focalLength: 27 }
};

let SCENE, CAMERA, RENDERER, FP_CONTROLS, GUI_GLOBAL;
let BALLERINA_5, BACINO_5, BALLERINA_6, BACINO_6; 
let BALLERINA_7, GAMBA_DX_7, GAMBA_SX_7, BRACCIO_DX_7, BRACCIO_SX_7; 
let BALLERINA_8, BRACCIO_DX_8, BRACCIO_SX_8; 

let isJumpingB7 = false, jumpStartTimeB7 = 0, isSpeedBoosted = false; 
const clock = new THREE.Clock();
let controlsEnabled = true;

const paramsB5 = { posX: -2870, posY: -4, posZ: 820, bounceFreq: 3.0, bounceAmp: 10.0, currentRotSpeed: 0.05 };
const paramsB6 = { posX: -650, posY: -4, posZ: 100, bounceFreq: 4.0, bounceAmp: 5.0, currentRotSpeed: -0.04 };
const paramsB7 = { posX: 330, posY: 14, posZ: -200, jumpHeight: 300, jumpSpeed: 4, splitAmp: 1.5 };
const paramsB8 = { posX: -1500, posY: -4, posZ: 400, armAmp: 0.5, armFreq: 2.0 }; 

RectAreaLightUniformsLib.init();
init();
animate();

function init() {
    SCENE = new THREE.Scene();
    SCENE.background = new THREE.Color(0x21130d);
    SCENE.fog = new THREE.Fog(0x21130d, 2000, 20000);

    CAMERA = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100000);
    const v1 = cameraViews['1'];
    CAMERA.position.set(v1.pos.x, v1.pos.y, v1.pos.z);
    CAMERA.rotation.set(v1.rot.x, v1.rot.y, v1.rot.z);
    CAMERA.setFocalLength(v1.focalLength);

    RENDERER = new THREE.WebGLRenderer({ antialias: true });
    RENDERER.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(RENDERER.domElement);

    FP_CONTROLS = new FirstPersonControls(CAMERA, RENDERER.domElement);
    FP_CONTROLS.movementSpeed = 1200;
    FP_CONTROLS.lookSpeed = 0.1;

    GUI_GLOBAL = new GUI();
    const addBaseFolder = (name, params, obj) => {
        const f = GUI_GLOBAL.addFolder(name);
        f.add(params, 'posX', -5000, 5000).onChange(v => { if(obj) obj.position.x = v; });
        f.add(params, 'posZ', -5000, 5000).onChange(v => { if(obj) obj.position.z = v; });
        return f;
    };

    addBaseFolder('Ballerina 5', paramsB5, BALLERINA_5);
    addBaseFolder('Ballerina 7', paramsB7, BALLERINA_7);
    const f8 = addBaseFolder('Ballerina 8', paramsB8, BALLERINA_8);
    f8.add(paramsB8, 'armAmp', 0, 1.5);

    // Caricamento Luci (Sintetizzato per leggibilità)
    const shadowLight = new THREE.DirectionalLight(0xffffff, 1.5);
    shadowLight.position.set(-800, 2000, -2500);
    SCENE.add(shadowLight);
    SCENE.add(new THREE.AmbientLight(0xffffff, 0.2));

    const loader = new GLTFLoader();
    loader.load('/ballerina_castana.glb', (g) => { BALLERINA_5 = g.scene; BALLERINA_5.position.set(paramsB5.posX, -4, paramsB5.posZ); SCENE.add(BALLERINA_5); BACINO_5 = BALLERINA_5.getObjectByName('bacino001'); });
    loader.load('/ballerina_asiatica.glb', (g) => { BALLERINA_6 = g.scene; BALLERINA_6.position.set(paramsB6.posX, -4, paramsB6.posZ); SCENE.add(BALLERINA_6); BACINO_6 = BALLERINA_6.getObjectByName('bacino033'); });
    loader.load('/ballerina_rossa.glb', (g) => { BALLERINA_7 = g.scene; BALLERINA_7.position.set(paramsB7.posX, 14, paramsB7.posZ); SCENE.add(BALLERINA_7); GAMBA_DX_7 = BALLERINA_7.getObjectByName('gamba_dx040'); GAMBA_SX_7 = BALLERINA_7.getObjectByName('gamba_sx040'); BRACCIO_DX_7 = BALLERINA_7.getObjectByName('braccio_dx063'); BRACCIO_SX_7 = BALLERINA_7.getObjectByName('braccio_dx064'); });
    
    loader.load('/ballerina_bionda.glb', (g) => {
        BALLERINA_8 = g.scene; 
        BALLERINA_8.scale.set(150, 150, 150);
        BALLERINA_8.position.set(paramsB8.posX, -4, paramsB8.posZ);
        SCENE.add(BALLERINA_8);
        BRACCIO_DX_8 = BALLERINA_8.getObjectByName('braccio_dx017');
        BRACCIO_SX_8 = BALLERINA_8.getObjectByName('braccio_sx018');
    });
}

window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'j' && !isJumpingB7) { isJumpingB7 = true; jumpStartTimeB7 = clock.getElapsedTime(); }
    if (key === 's') {
        isSpeedBoosted = !isSpeedBoosted;
        paramsB5.currentRotSpeed = isSpeedBoosted ? 0.35 : 0.05;
        paramsB6.currentRotSpeed = isSpeedBoosted ? -0.34 : -0.04;
        // La Bionda 8 rimane costante, non aggiungiamo boost qui.
    }
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
    const elapsed = clock.getElapsedTime();
    if (FP_CONTROLS && controlsEnabled) FP_CONTROLS.update(clock.getDelta());

    // Rotazioni B5 e B6
    if (BALLERINA_5 && BACINO_5) BACINO_5.rotation.z += paramsB5.currentRotSpeed;
    if (BALLERINA_6 && BACINO_6) BACINO_6.rotation.z += paramsB6.currentRotSpeed;

    // Animazione Bionda 8 (Sempre semplice, non influenzata da S)
    if (BALLERINA_8) {
        const armWave = Math.sin(elapsed * paramsB8.armFreq) * paramsB8.armAmp;
        if (BRACCIO_DX_8) BRACCIO_DX_8.rotation.z = armWave;
        if (BRACCIO_SX_8) BRACCIO_SX_8.rotation.z = -armWave;
    }

    // Salto B7
    if (BALLERINA_7 && isJumpingB7) {
        const t = (elapsed - jumpStartTimeB7) * paramsB7.jumpSpeed;
        if (t <= Math.PI) {
            const jF = Math.sin(t), sF = Math.pow(jF, 2);
            BALLERINA_7.position.y = paramsB7.posY + jF * paramsB7.jumpHeight;
            if (GAMBA_DX_7) GAMBA_DX_7.rotation.y = sF * paramsB7.splitAmp;
            if (GAMBA_SX_7) GAMBA_SX_7.rotation.y = sF * paramsB7.splitAmp;
            if (BRACCIO_DX_7) BRACCIO_DX_7.rotation.z = -sF * (paramsB7.splitAmp * 0.7);
            if (BRACCIO_SX_7) BRACCIO_SX_7.rotation.z = sF * (paramsB7.splitAmp * 0.7);
        } else {
            isJumpingB7 = false; BALLERINA_7.position.y = paramsB7.posY;
            [GAMBA_DX_7, GAMBA_SX_7, BRACCIO_DX_7, BRACCIO_SX_7].forEach(part => { if(part) part.rotation.set(0,0,0); });
        }
    }
    RENDERER.render(SCENE, CAMERA);
}