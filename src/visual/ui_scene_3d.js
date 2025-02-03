import * as THREE from "three";
import {EffectComposer} from "three/addons/postprocessing/EffectComposer.js";
import {RenderPass} from "three/addons/postprocessing/RenderPass.js";
import {UnrealBloomPass} from "three/addons/postprocessing/UnrealBloomPass.js";
import {OutputPass} from "three/addons/postprocessing/OutputPass.js";
import {EffectControllable, SynthControllable} from "controller";
import SynthCollection, {Chords} from "oscillatorStage";
import UIScene from "uiScene";


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


export default class UIScene3D extends UIScene {
    constructor(controllers, synthCollection, effectChain) {
        super();

        this.controllers = controllers;
        this.renderer = new THREE.WebGLRenderer({canvas: this.canvas, antialias: true});
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.toneMapping = THREE.ReinhardToneMapping;

        this.camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 100 );
        this.camera.position.set( 0, 0, 20);
        this.camera.lookAt(0, 0, 0);
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
        this.octaveRing = new BoxTorus(this.scene, numBoxes, [boxSize, boxSize, boxSize], torusRadius, UIScene.rainbowColors, false);
        this.effectLines = new BoxTorus(this.scene, effectChain.effects.length * this.nLinesPerEffect, [0.15, 0.15, 1000], 3, ["#000000"], true, [0, 0, -100]);
        this.filterPoti = new Potentiometer(this.scene);

        this.sceneSynths = new UISceneSynths(this.camera, this.octaveRing, this.filterPoti, synthCollection);
        this.sceneEffects = new UISceneEffects(this.camera, this.effectLines, this.filterPoti, this.nLinesPerEffect);

        this.lastUpdate = performance.now();
    }

    start() {
        this.active = true;
        this.drawScene();
    }

    stop() {
        this.active = false;
    }

    drawScene = () => {
        const now = performance.now();

        if (this.active) requestAnimationFrame(this.drawScene);

        if (now - this.lastUpdate > 0) {
            this.lastUpdate = now;

            for (let controller of this.controllers) {
                controller.setParameters(this.sceneSynths, this.sceneEffects);
            }

            this.composer.render();
        }
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
                if (currentNote !== null && currentNote.length - 1 === Chords.octave[i].length &&
                    currentNote.substring(0, currentNote.length - 1) === Chords.octave[i]) {
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
            this.camera.fov = (tone) * 40 + 20;
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
        this.cameraRange = 1;
    }

    setEffectTone(index, tone) {
        for (let i = 0; i < this.nLinesPerEffect; i++) {
            if (tone < 0.02)  {
                this.effectLines.setOpacity(index * this.nLinesPerEffect + i, 0);
            } else {
                this.effectLines.setOpacity(index * this.nLinesPerEffect + i, 1);
                this.effectLines.setColorHSL(index * this.nLinesPerEffect + i, tone, 1, tone * 0.5);
            }
        }
    }

    setEffectWetness(index, wetness) {
        if (index >= 5 && wetness > 0) {
            if      (index === 5) this.camera.position.y = wetness * this.cameraRange;
            else if (index === 6) this.camera.position.y = -wetness * this.cameraRange;
            else if (index === 7) this.camera.position.x = -wetness * this.cameraRange;
            else if (index === 8) this.camera.position.x = wetness * this.cameraRange;
            this.camera.lookAt(0, 0, 0);

            for (let i = 0; i < this.nLinesPerEffect; i++) {
                this.effectLines.setScales(index * this.nLinesPerEffect + i, wetness * 2, wetness * 2, 1);
            }
        } else if (index < 5) {
            for (let i = 0; i < this.nLinesPerEffect; i++) {
                this.effectLines.setScales(index * this.nLinesPerEffect + i, wetness * 2, wetness * 2, 1);
            }
        }
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


class BoxTorus {
    constructor(scene, numBoxes, boxSizes, torusRadius, colors, fullBox, lookAt = [0, 0, 0]) {
        this.boxes = [];

        const angleStep = (2 * Math.PI) / numBoxes;

        for (let i = 0; i < numBoxes; i++) {
            const lineMaterial = new THREE.LineBasicMaterial({color: colors[i % colors.length]});
            const meshMaterial = new THREE.MeshBasicMaterial({color: colors[i % colors.length]});
            meshMaterial.transparent = true;
            lineMaterial.transparent = true;

            const boxGeometry = new THREE.BoxGeometry(...boxSizes);
            const edges = new THREE.EdgesGeometry(boxGeometry);
            let box;
            if (fullBox) box = new THREE.Mesh(boxGeometry, meshMaterial);
            else         box = new THREE.LineSegments(edges, lineMaterial);

            const angle = i * angleStep;
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
