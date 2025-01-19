import HandPoseDetector from './hand_pose_detector.js';
import Webcam from './camera.js';
import SynthCollection from './oscillator_stage.js';
import EffectChain, {
    AutoFilterEffect,
    AutoWahEffect,
    BitCrusherEffect, ChebyshevEffect, ChorusEffect,
    DistortionEffect, FeedbackDelayEffect,
    PhaserEffect
} from "./effect_stage.js";
import Connector from "./connector.js";
import HandPoseAnalyzer from "./hand_pose_analyzer.js";
import {EffectController, InstrumentController} from "./controller.js";
import UI from "./visualization.js";
import {AMSynthesizer, FMSynthesizer, DuoSynthesizer} from "./synthesizer.js";
import MasteringStage from "./mastering_stage.js";


// Camera
const webcam = new Webcam();

// Detector
const handPoseDetector = new HandPoseDetector(webcam);

// UI
const ui = new UI(webcam);

// Output/Mastering
const masteringStage = new MasteringStage();

// Effects
const effectChain = new EffectChain();
effectChain.add(new AutoWahEffect());
effectChain.add(new PhaserEffect());
effectChain.add(new ChebyshevEffect());
effectChain.add(new DistortionEffect());
effectChain.add(new FeedbackDelayEffect());
effectChain.connectOut(masteringStage.mainGain);

// Synthesizers
const amSynth = new AMSynthesizer();
const fmSynth = new FMSynthesizer();
const duoSynth = new DuoSynthesizer();
const synthCollection = new SynthCollection([amSynth, duoSynth], effectChain.lowpass);

// Analyzers
let controlPoints = [[0.65, 0.5], [0.35, 0.5]]; // left right (video is mirrored along y axis)
let handPoseAnalyzers = [];
for (let xy of controlPoints) {
    let handPoseAnalyzer = new HandPoseAnalyzer(xy);
    handPoseAnalyzers.push(handPoseAnalyzer);
}

// Controllers
let controllers = [];
controllers.push(new InstrumentController(synthCollection, effectChain, handPoseAnalyzers[0]));
controllers.push(new EffectController(synthCollection, effectChain, handPoseAnalyzers[1]));

// Glue everything together
const connector = new Connector(controlPoints, handPoseAnalyzers, ui);
handPoseDetector.setPostDetectionCallback(connector.processPoses);
