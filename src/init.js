import HandPoseDetector from './hand_pose_detector.js';
import Webcam from './camera.js';
import SynthCollection from './synthesizer.js';
import EffectChain from "./effects.js";
import * as controls from "./control_elements.js";
import Connector from "./connector.js";
import HandPoseAnalyzer from "./hand_pose_analyzer.js";
import {InstrumentController} from "./controller.js";

// initialize instruments and effects
const mainGain = controls.createGainSlider("Main Gain")
mainGain.toDestination();

const effectChain = new EffectChain();
effectChain.addDistortion();
effectChain.addPhaser();
effectChain.connect(mainGain);

const synthCollection = new SynthCollection([Tone.FMSynth, Tone.AMSynth], effectChain.effects[0]);

controls.createNoteCheckboxGroup(synthCollection);
controls.createChordSlider(synthCollection);

// initialize camera and detector
const webcam = new Webcam();
const handPoseDetector = new HandPoseDetector(webcam);

// initialize analyzer and controller
let controlPoints = [[0.5, 0.5]];
let handPoseAnalyzers = [];
let controllers = [];
for (let xy of controlPoints) {
    let handPoseAnalyzer = new HandPoseAnalyzer(xy);
    handPoseAnalyzers.push(handPoseAnalyzer);
}
controllers.push(new InstrumentController(synthCollection, effectChain, mainGain, handPoseAnalyzers[0]));

// initialize the main component
const connector = new Connector(controlPoints, handPoseAnalyzers);
handPoseDetector.setDetectionCallback(connector.processPoses);
