import HandPoseDetector from './hand_pose_detector.js';
import Webcam from './camera.js';
import SynthCollection from './synthesizer.js';
import EffectChain from "./effects.js";
import * as controls from "./control_elements.js";
import Connector from "./connector.js";
import HandPoseAnalyzer from "./hand_pose_analyzer.js";
import {EffectController, InstrumentController} from "./controller.js";
import UI from "./visualization.js";


// Camera
const webcam = new Webcam();

// UI
const ui = new UI(webcam);

// Instruments and effects
const mainGain = new Tone.Gain(0.1);
controls.createGainSlider("Main Gain", mainGain);
mainGain.toDestination();

const effectChain = new EffectChain();
effectChain.addDistortion();
effectChain.addPhaser();
effectChain.connect(mainGain);

const synthCollection = new SynthCollection([Tone.FMSynth, Tone.AMSynth], effectChain.effects[0]);

controls.createNoteCheckboxGroup(synthCollection);
controls.createChordSlider(synthCollection);

// Camera and detector
const handPoseDetector = new HandPoseDetector(webcam);

// Analyzers
let controlPoints = [[0.75, 0.5], [0.25, 0.5]]; // left right (video is mirrored along y axis)
let handPoseAnalyzers = [];
for (let xy of controlPoints) {
    let handPoseAnalyzer = new HandPoseAnalyzer(xy);
    handPoseAnalyzers.push(handPoseAnalyzer);
}

// Controllers
let controllers = [];
controllers.push(new InstrumentController(synthCollection, effectChain, mainGain, handPoseAnalyzers[0]));
controllers.push(new EffectController(synthCollection, effectChain, mainGain, handPoseAnalyzers[1]));

// Glue everything together
const connector = new Connector(controlPoints, handPoseAnalyzers, ui);
handPoseDetector.setPostDetectionCallback(connector.processPoses);
