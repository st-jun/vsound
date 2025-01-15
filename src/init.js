import HandPose from './hand_pose.js';
import Webcam from './camera.js';
import SynthCollection from './synthesizer.js';
import EffectChain from "./effects.js";
import * as controls from "./control_elements.js";
import HandPoseAnalyzer from "./hand_pose_analyzer.js";

const mainGain = controls.createGainSlider("Main Gain")
mainGain.toDestination();

const effectChain = new EffectChain();
effectChain.addDistortion();
effectChain.addPhaser();
effectChain.connect(mainGain);

const synthCollection = new SynthCollection([Tone.FMSynth, Tone.AMSynth], effectChain.effects[0]);

controls.createNoteCheckboxGroup(synthCollection);
controls.createChordSlider(synthCollection);

const webcam = new Webcam();
const handposeDetector = new HandPose(webcam);
const handposeAnalyzer = new HandPoseAnalyzer(0.5, 0.5);
handposeDetector.setDetectionCallback(handposeAnalyzer.analyze);
