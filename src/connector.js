import HandPoseAnalyzer from "./hand_pose_analyzer.js";


export default class Connector {
    constructor(controlPoints, handPoseAnalyzers, ui) {
        this.controlPoints = controlPoints;
        this.handPoseAnalyzers = handPoseAnalyzers;
        this.ui = ui;
    }

    processPoses = (handPoses) => {
        for (let i = 0; i < this.controlPoints.length; i++) {
            let handPose = HandPoseAnalyzer.getNearestForControlPoint(handPoses, this.controlPoints[i]);
            if (handPose !== undefined) {
                this.handPoseAnalyzers[i].analyze(handPose);
            }
        }

        this.ui.draw(this.handPoseAnalyzers);
    }
}