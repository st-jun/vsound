import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {EffectControllable, SynthControllable} from "./controller.js";
import SynthCollection, {Chords} from "./oscillator_stage.js";



const rainbowColors = [
    "#FF0000",
    "#FF7F00",
    "#FFFF00",
    "#7FFF00",
    "#00FF00",
    "#00FF7F",
    "#00FFFF",
    "#007FFF",
    "#0000FF",
    "#7F00FF",
    "#FF00FF",
    "#FF007F"
];


class BoxTorus {
    constructor(scene, numBoxes, boxSizes, torusRadius, colors, fullBox, lookAt = [0, 0, 0]) {
        this.boxes = [];

        const angleStep = (2 * Math.PI) / numBoxes;

        for (let i = 0; i < numBoxes; i++) {
            const angle = i * angleStep;
            const boxGeometry = new THREE.BoxGeometry(...boxSizes);
            const edges = new THREE.EdgesGeometry(boxGeometry);
            const lineMaterial = new THREE.LineBasicMaterial({color: colors[i % colors.length]});
            const meshMaterial = new THREE.MeshBasicMaterial({color: colors[i % colors.length]});
            meshMaterial.transparent = true;
            lineMaterial.transparent = true;
            //meshMaterial.opacity = 0.3;
            let box;
            if (fullBox) box = new THREE.Mesh(boxGeometry, meshMaterial);
            else box = new THREE.LineSegments(edges, lineMaterial);
            const x = torusRadius * Math.cos(angle);
            const y = torusRadius * Math.sin(angle);
            const z = 0;
            box.position.set(x, y, z);
            box.lookAt(...lookAt);
            this.boxes.push(box);
            scene.add(box);
        }
    }

    setOpacity(index, opacity) {
        this.boxes[index].material.opacity = opacity;
    }

    setColor(index, r, g, b) {
        this.boxes[index].material.color.set(r, g, b);
    }

    setColorHSL(index, h, s, l) {
        this.boxes[index].material.color.setHSL(h, s, l);
    }

    setScales(index, x, y, z) {
        this.boxes[index].scale.x = x;
        this.boxes[index].scale.y = y;
        this.boxes[index].scale.z = z;
    }

    setScaleX(index, x) {
        this.boxes[index].scale.x = x;
    }

    setScaleY(index, y) {
        this.boxes[index].scale.y = y;
    }

    setScaleZ(index, z) {
        this.boxes[index].scale.z = z;
    }
}


class Potentiometer {
    constructor(scene) {
        this.startAngle = Math.PI + 0.2;
        const geometry = new THREE.CylinderGeometry( 0.5, 1, 0.4, 32 , 2, true, this.startAngle, 2*Math.PI - 0.4 );
        const material = new THREE.MeshBasicMaterial( {color: [1,1,1]} );
        this.model = new THREE.Mesh( geometry, material );
        this.model.lookAt(0, -1, 0);
        scene.add( this.model );
    }

    setColor(r, g, b) {
        this.model.material.color.set(r, g, b);
    }

    setColorHSL(h, s, l) {
        this.model.material.color.setHSL(h, s, l);
    }

    setAngleOffset(angle) {
        this.model.rotation.y =  angle;
    }

    setScales(x, y, z) {
        this.model.scale.x = x;
        this.model.scale.y = y;
        this.model.scale.z = z;
    }
}


class UIScene {
    constructor(sceneCanvas, controllers, synthCollection, effectChain) {
        this.controllers = controllers;

        this.renderer = new THREE.WebGLRenderer({canvas: sceneCanvas, antialias: true});
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.toneMapping = THREE.ReinhardToneMapping;

        this.camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 100 );
        this.camera.position.set( 0, 0, 20);
        this.scene.add( this.camera );

        this.scene.add( new THREE.AmbientLight( 0xcccccc ) );

        const pointLight = new THREE.PointLight( 0xffffff, 100 );
        this.camera.add( pointLight );

        const renderScene = new RenderPass( this.scene, this.camera );

        const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
        bloomPass.threshold = 0;
        bloomPass.strength = 1;
        bloomPass.radius = 0;

        const outputPass = new OutputPass();

        this.composer = new EffectComposer( this.renderer );
        this.composer.addPass( renderScene );
        this.composer.addPass( bloomPass );
        this.composer.addPass( outputPass );

        const boxSize = 0.5;
        const torusRadius = 2;
        const numBoxes = 12;
        this.nLinesPerEffect = 3;
        this.octaveRing = new BoxTorus(this.scene, numBoxes, [boxSize, boxSize, boxSize], torusRadius, rainbowColors, false);
        this.effectLines = new BoxTorus(this.scene, effectChain.effects.length * this.nLinesPerEffect, [0.3, 0.3, 1000], 3, ["#000000"], true, [0, 0, -100]);
        this.filterPoti = new Potentiometer(this.scene);

        this.sceneSynths = new UISceneSynths(this.camera, this.octaveRing, this.filterPoti, synthCollection);
        this.sceneEffects = new UISceneEffects(this.camera, this.effectLines, this.filterPoti, this.nLinesPerEffect);

        this.drawScene();
    }


    drawScene = () => {
        requestAnimationFrame( this.drawScene );

        for (let controller of this.controllers) {
            controller.setParameters(this.sceneSynths, this.sceneEffects);
        }

        this.composer.render();
    }
}


class UISceneSynths extends SynthControllable {
    constructor(camera, octaveRing, filterPoti, synthCollection) {
        super();
        this.camera = camera;
        this.octaveRing = octaveRing;
        this.filterPoti = filterPoti;
        this.synthCollection = synthCollection;
        this.clock = new THREE.Clock();
    }

    setFrequencyStep(frequencyIndex) {
        for (let i = 0; i < Chords.octave.length; i++) {
            let found = false;
            for (let currentNote of this.synthCollection.currentNotes) {
                if (currentNote !== null && currentNote.length - 1 === Chords.octave[i].length && currentNote.substring(0, currentNote.length - 1) === Chords.octave[i]) {
                    found = true;
                    this.octaveRing.setOpacity(i, 1);
                }
            }
            if (!found) {
                this.octaveRing.setOpacity(i, 0);
            }
        }
    }

    setChord(chordIndex) {
        return undefined;
    };

    setInstrumentGain(index, gain) {
        return undefined;
    }

    setInstrumentTone(index, tone) {
        if (tone > 0 && index === 0) {
            this.camera.fov = (1 - tone) * 90;
            this.camera.updateProjectionMatrix();
        }
    }

    addChordNote(index) {
        return undefined;
    }

    removeChordNote(index) {
        return undefined;
    }

    setArpeggioContribution(arpeggioContribution) {
        return undefined;
    }

    setArpeggioSpeed(speed) {
        const secondsPerBeat = 60 / this.synthCollection.bpm;
        const elapsedTime = this.clock.getElapsedTime();

        const pulse = Math.sin((2 * Math.PI * elapsedTime) / secondsPerBeat);
        const scale = (this.synthCollection.currentIndices.length > 0) ? 1 + 0.05 * Math.abs(pulse) : 1;

        this.filterPoti.setScales(scale, 1, scale);
    }

    setArpeggioDirection(index) {
        return undefined;
    }
}

class UISceneEffects extends EffectControllable {
    constructor(camera, effectLines, filterPoti, nLinesPerEffect) {
        super();
        this.camera = camera;
        this.effectLines = effectLines;
        this.nLinesPerEffect = nLinesPerEffect;
        this.filterPoti = filterPoti;
    }

    setEffectTone(index, tone) {
        for (let i = 0; i < this.nLinesPerEffect; i++) {
            this.effectLines.setColorHSL(index * this.nLinesPerEffect + i, tone, 1, tone * 0.5);
        }
    }

    setEffectWetness(index, wetness) {
        // for (let i = 0; i < this.nLinesPerEffect; i++) {
        //     this.effectLines.setScaleZ(index * this.nLinesPerEffect + i, wetness * 1000);
        // }
    }

    setHighpassFilter(value) {
        if (value > 0) {
            this.filterPoti.setColor(1, 1 - Math.sqrt(value), 1 - Math.sqrt(value));
            this.filterPoti.setAngleOffset(-value * Math.PI);
        }
    }

    setLowpassFilter(value) {
        if (value > 0) {
            this.filterPoti.setColor(1 - Math.sqrt(value), 1 - Math.sqrt(value), 1);
            this.filterPoti.setAngleOffset(value * Math.PI);
        }
    }
}


class UIOverlay {
    constructor(overlayCanvas) {

    }

    getX(normalizedX) {
        return this.overlayCanvas.width * normalizedX;
    }

    getY(normalizedY) {
        return this.overlayCanvas.height * normalizedY;
    }

    drawOverlay = (handPoseAnalyzers) => {
        if (!this.drawing) {
            this.drawing = true;

            this.ctx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);

            this.drawHandOverlay(handPoseAnalyzers);
            this.drawing = false;
        }
    }

    drawCircle(ctx, x, y, radius, color) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
    }

    drawHandOverlay(handPoseAnalyzers) {
        for (let handPoseAnalyzer of handPoseAnalyzers) {
            // palm
            this.drawCircle(
                this.ctx,
                this.getX((1. - handPoseAnalyzer.palmX)),
                this.getY(handPoseAnalyzer.palmY),
                this.getX(handPoseAnalyzer.handLength / 10.),
                "red");

            // fingers
            for (let i = 0; i < handPoseAnalyzer.fingerTipX.length; i++) {
                if (handPoseAnalyzer.fingerIsExtended[i] || i === 0) {
                    this.drawCircle(
                        this.ctx,
                        this.getX((1. - handPoseAnalyzer.fingerTipX[i])),
                        this.getY(handPoseAnalyzer.fingerTipY[i]),
                        this.getX(handPoseAnalyzer.fingerExtension[i] / 100.),
                        "red");
                }
            }
        }
    }
}


export default class UI {
    constructor(webcam, controllers, synthCollection, effectChain) {
        this.webcam = webcam;
        this.initContainer();
        this.initSceneCanvas();
        this.initOverlayCanvas();

        this.container.appendChild(this.webcam.video);
        this.container.appendChild(this.sceneCanvas);
        this.container.appendChild(this.overlayCanvas);
        document.body.appendChild(this.container);
        window.addEventListener('resize', this.resizeCanvas);

        this.controllers = controllers;
        this.overlay = new UIOverlay();
        this.scene = new UIScene(this.sceneCanvas, controllers, synthCollection, effectChain);

        this.drawing = false;
    }

    initContainer() {
        this.container = document.createElement('div');
        this.container.style.position = 'fixed';
        this.container.style.maxWidth = '100%';
        this.container.style.maxHeight = '100%';
        this.container.style.top = '0';
        this.container.style.left = '0';
    }

    initOverlayCanvas() {
        this.overlayCanvas = document.createElement('canvas');
        this.overlayCanvas.style.position = 'fixed';
        this.overlayCanvas.style.top = '0';
        this.overlayCanvas.style.left = '0';
        this.overlayCanvas.addEventListener("click",
            () => {
                this.webcam.togglePlay();
            });

        this.ctx = this.overlayCanvas.getContext('2d');

        this.resizeCanvas();
    }

    initSceneCanvas() {
        this.sceneCanvas = document.createElement('canvas');
        this.sceneCanvas.style.position = 'fixed';
        this.sceneCanvas.style.top = '0';
        this.sceneCanvas.style.left = '0';
    }

    resizeCanvas = () => {
        this.overlayCanvas.width = window.innerWidth;
        this.overlayCanvas.height = window.innerHeight;
        this.sceneCanvas.width = window.innerWidth;
        this.sceneCanvas.height = window.innerHeight;
    }
}
