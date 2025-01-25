

export default class Connector {
    constructor(controlPoints, handPoseAnalyzers, ui) {
        this.controlPoints = controlPoints;
        this.handPoseAnalyzers = handPoseAnalyzers;
        this.ui = ui;
    }

    processPoses = (handPoses) => {
        handPoses = Connector.assignToControlPoints(handPoses, this.controlPoints);
        for (let i = 0; i < handPoses.length; i++) {
            if (handPoses[i] !== undefined) {
                this.handPoseAnalyzers[i].analyze(handPoses[i]);
            }
        }
    }


    static assignToControlPoints(handPoses, controlPoints) {
        if (handPoses[0] === undefined) return [];
        else if (handPoses[1] === undefined) return handPoses;

        if (handPoses[0] === undefined || handPoses[1] === undefined) return [undefined, undefined];

        if (handPoses[0][9].x < handPoses[1][9].x) {
            if (controlPoints[0][0] < controlPoints[1][0]) {
                return [handPoses[0], handPoses[1]];
            } else {
                return [handPoses[1], handPoses[0]];
            }
        } else {
            if (controlPoints[0][0] > controlPoints[1][0]) {
                return [handPoses[0], handPoses[1]];
            } else {
                return [handPoses[1], handPoses[0]];
            }
        }
    }
}