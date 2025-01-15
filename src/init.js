import HandPoseDetector from './hand_pose_detector.js';
import Webcam from './camera.js';
import SynthCollection from './synthesizer.js';
import EffectChain from "./effects.js";
import * as controls from "./control_elements.js";
import Connector from "./connector.js";


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
const handPoseDetector = new HandPoseDetector(webcam);

const connector = new Connector(synthCollection, effectChain, mainGain, handPoseDetector, [[0.5, 0.5]]);
handPoseDetector.setDetectionCallback(connector.run);
