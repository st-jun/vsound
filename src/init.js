import HandPoseDetector from 'handPoseDetector';
import Webcam from 'camera';
import SynthCollection from 'oscillatorStage';
import EffectChain, {
    AutoFilterEffect,
    AutoWahEffect,
    BitCrusherEffect, ChebyshevEffect, ChorusEffect,
    DistortionEffect, FeedbackDelayEffect,
    PhaserEffect
} from "effectStage";
import Connector from "connector";
import HandPoseAnalyzer from "handPoseAnalyzer";
import {EffectController, InstrumentController} from "controller";
import UI from "visualization";
import {AMSynthesizer, FMSynthesizer, DuoSynthesizer} from "synthesizer";
import MasteringStage from "masteringStage";


// Camera
const webcam = new Webcam();

// Detector
const handPoseDetector = new HandPoseDetector(webcam);

// Analyzers
let controlPoints = [[0.65, 0.5], [0.35, 0.5]]; // left right (video is mirrored along y axis)
let handPoseAnalyzers = [];
for (let xy of controlPoints) {
    let handPoseAnalyzer = new HandPoseAnalyzer(xy);
    handPoseAnalyzers.push(handPoseAnalyzer);
}

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

// Controllers
let controllers = [];
controllers.push(new InstrumentController(synthCollection, effectChain, handPoseAnalyzers[0]));
controllers.push(new EffectController(synthCollection, effectChain, handPoseAnalyzers[1]));

// UI
const ui = new UI(webcam, controllers, synthCollection, effectChain);

// Glue everything together
const connector = new Connector(controlPoints, handPoseAnalyzers, ui);
handPoseDetector.setPostDetectionCallback(connector.processPoses);
