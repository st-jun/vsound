import HandPoseAnalyzer from "./hand_pose_analyzer.js";


export default class Connector {
    constructor(controlPoints, handPoseAnalyzers) {
        this.controlPoints = controlPoints;
        this.handPoseAnalyzers = handPoseAnalyzers;
    }

    processPoses = (handPoses) => {
        for (let i = 0; i < this.controlPoints.length; i++) {
            let handPose = HandPoseAnalyzer.getNearestForControlPoint(handPoses, this.controlPoints[i]);
            if (handPose !== undefined) {
                this.handPoseAnalyzers[i].analyze(handPose);
            }
        }
    }
}