import HandPoseDetector from "handPoseDetector";
import Webcam from "camera";
import SynthCollection from "oscillatorStage";
import EffectChain, {
    AutoFilterEffect,
    AutoWahEffect,
    BitCrusherEffect, ChebyshevEffect, ChorusEffect,
    DistortionEffect, FeedbackDelayEffect,
    PhaserEffect, FreeverbEffect, FrequencyShifterEffect,
    ReverbEffect, TremoloEffect, VibratoEffect
} from "effectStage";
import HandPoseAnalyzer from "handPoseAnalyzer";
import {EffectController, InstrumentController} from "controller";
import UI from "ui";
import {AMSynthesizer, FMSynthesizer, DuoSynthesizer} from "synthesizer";
import MasteringStage from "masteringStage";
import {GreetingMenu, HandPlacementMenu} from "menu";
import {getGPUTier} from "detect-gpu";
import {startSpinner, stopSpinner} from "util";


/**
 * Main class that handles the program flow.
 * @class
 */
export default class App {
    constructor(devMode = false, controlPoints = [[0.35, 0.5], [0.65, 0.5]]) {
        // The control points indicate the references for left and right hand.
        // Hand positions w.r.t. them influence some aspects of the instruments and effects.
        this.controlPoints = controlPoints;
        this.devMode = devMode;
    }

    /**
     * Run the program.
     * @returns {Promise<void>}
     */
    run = async () => {
        // this is modeled in a "synchronous" way on purpose to make the flow more explicit
        this.checkCompatibility();
        this.initDetection();
        await this.startMenu();
        this.startMain();
    }

    /**
     * Check if there are issues like browser support or weak gpu.
     */
    checkCompatibility() {
        // check browser
        if (/firefox/i.test(navigator.userAgent)) {
            alert("A Chromium-like browser is recommended. Performance may be subpar.");
        }

        // check webgl
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl") || canvas.getContext("webgl2");
        if (gl) {
            console.log("WebGL context successfully created.");
        } else {
            alert("WebGL could not be instantiated. Some features may not work as expected.");
        }

        // check gpu
        (async () => {
            const gpuTier = await getGPUTier();
            console.log(gpuTier);
            if (gpuTier.tier < 3) {
                alert("Your GPU is classified below tier 3 by detect-gpu. Some features may not work as expected.");
            }
        })();
    }

    /**
     * Set up the hand pose detection and user interface modules.
     */
    initDetection() {
        // Camera
        this.webcam = new Webcam();

        // Detector
        this.handPoseDetector = new HandPoseDetector(this.webcam);

        // Analyzers
        this.handPoseAnalyzers = [];
        for (let xy of this.controlPoints) {
            let handPoseAnalyzer = new HandPoseAnalyzer(xy);
            this.handPoseAnalyzers.push(handPoseAnalyzer);
        }

        // UI
        this.ui = new UI(this.webcam, this.handPoseAnalyzers);

        // start
        this.handPoseDetector.setPostDetectionCallback(this.processDetections);
        this.detectionActive = true;
    }

    /**
     * Run through the start menu.
     * @returns {Promise<void>}
     */
    startMenu = async () => {
        const greetingMenu = new GreetingMenu(this.ui, this.ui.overlay);
        await greetingMenu.run();

        startSpinner();
        this.webcam.start();

        if (!this.devMode) {
            const handPlacementMenu = new HandPlacementMenu(this.ui.overlay, this.handPoseAnalyzers)
            await handPlacementMenu.run();
        }
    }

    /**
     * Initialize sound generation, controller and non-menu parts of the user interface.
     * Then run!
     */
    startMain() {
        // Output/Mastering
        this.masteringStage = new MasteringStage();

        // Effects
        this.effectChain = new EffectChain();
        this.effectChain.add(new AutoWahEffect(), 0);
        this.effectChain.add(new PhaserEffect(), 1);
        this.effectChain.add(new ChebyshevEffect(), 6);
        this.effectChain.add(new DistortionEffect(), 2);
        this.effectChain.add(new FrequencyShifterEffect(-1000), 5);
        this.effectChain.add(new FrequencyShifterEffect(-5000), 8);
        this.effectChain.add(new FrequencyShifterEffect(5000), 7);
        this.effectChain.add(new FeedbackDelayEffect(), 4);
        this.effectChain.add(new VibratoEffect(), 3);
        this.effectChain.connectOut(this.masteringStage.mainGain);

        // Synthesizers
        const duoSynth = new DuoSynthesizer();
        this.synthCollection = new SynthCollection([duoSynth], this.effectChain.lowpass, true);

        // Controllers
        this.controllers = [];
        this.controllers.push(new InstrumentController(this.synthCollection, this.effectChain, this.handPoseAnalyzers[0]));
        this.controllers.push(new EffectController(this.synthCollection, this.effectChain, this.handPoseAnalyzers[1]));

        // Glue everything together
        this.handsMissing = null;
        this.ui.startScene(this.controllers, this.synthCollection, this.effectChain);
        this.ui.overlay.startDrawRun();
        this.masteringStage.start();
    }

    /**
     * Stop everything and reload to start screen.
     */
    stop() {
        this.ui.overlay.stopDrawRun();
        this.ui.stopScene();
        if (this.synthCollection) this.synthCollection.stop();
        if (this.masteringStage) this.masteringStage.stop();
        this.handPoseDetector.resetPostDetectionCallback();

        this.controllers = [];
        this.effectChain = null;
        this.synthCollection = null;
        this.masteringStage = null;
        this.detectionActive = false;
        this.webcam.stop();

        window.location.reload();
    }

    processDetections = (handPoses) => {
        if (this.detectionActive) {
            handPoses = HandPoseAnalyzer.assignToControlPoints(handPoses, this.controlPoints);
            for (let i = 0; i < handPoses.length; i++) {
                if (handPoses[i] !== undefined) {
                    this.handsMissing = null;
                    this.handPoseAnalyzers[i].analyze(handPoses[i]);
                } else {
                    if (this.handsMissing === null) {
                        this.handsMissing = performance.now();
                    } else {
                        if (performance.now() >= this.handsMissing + 3000) {
                            this.detectionActive = false;
                            this.stop();
                        }
                    }
                }
            }
        }
    }
}