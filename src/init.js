import HandPoseDetector from 'handPoseDetector';
import Webcam from 'camera';
import SynthCollection from 'oscillatorStage';
import EffectChain, {
    AutoFilterEffect,
    AutoWahEffect,
    BitCrusherEffect, ChebyshevEffect, ChorusEffect,
    DistortionEffect, FeedbackDelayEffect,
    PhaserEffect, FreeverbEffect, FrequencyShifterEffect,
    ReverbEffect, TremoloEffect, VibratoEffect
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
effectChain.add(new AutoWahEffect(), 0);
effectChain.add(new PhaserEffect(), 8);
effectChain.add(new ChebyshevEffect(), 6);
effectChain.add(new DistortionEffect(), 5);
effectChain.add(new ChorusEffect(), 7);
effectChain.add(new FrequencyShifterEffect(-5000), 1);
effectChain.add(new FrequencyShifterEffect(5000), 3);
//effectChain.add(new ChorusEffect(), 3);
effectChain.add(new FeedbackDelayEffect(), 4);
//effectChain.add(new TremoloEffect(), 1);
effectChain.add(new VibratoEffect(), 2);
//effectChain.add(new ReverbEffect(), 0);
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
