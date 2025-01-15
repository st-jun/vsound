import HandPoseAnalyzer from "./hand_pose_analyzer.js";
import {InstrumentController} from "./controller.js";


export default class Connector {
    constructor(synthCollection, effectChain, mainGain, handPoseDetector, controlPoints) {
        this.controlPoints = controlPoints;
        this.synthCollection = synthCollection;
        this.effectChain = effectChain;
        this.mainGain = mainGain;
        this.handPoseDetector = handPoseDetector;

        this.handPoseAnalyzers = [];
        this.controllers = [];
        for (let xy of this.controlPoints) {
            let handPoseAnalyzer = new HandPoseAnalyzer(xy);
            this.handPoseAnalyzers.push(handPoseAnalyzer)
            this.controllers.push(new InstrumentController(synthCollection, effectChain, mainGain, handPoseAnalyzer));
        }
    }

    run = (handPoses) => {
        for (let i = 0; i < this.controlPoints.length; i++) {
            let handPose = HandPoseAnalyzer.getNearestForControlPoint(handPoses, this.controlPoints[i]);
            if (handPose !== undefined) {
                this.handPoseAnalyzers[i].analyze(handPose);
                console.log(i, handPose[0].x);
            }
        }
    }
}