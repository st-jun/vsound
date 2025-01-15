
function norm(x, y) {
    return Math.sqrt(x ** 2 + y ** 2);
}


function angleRad(x0, y0, x1, y1) {
    const dotProduct = x0 * x1 + y0 * y1;
    const magnitudeA = norm(x0, y0);
    const magnitudeB = norm(x1, y1);
    const cosTheta = dotProduct / (magnitudeA * magnitudeB);
    return Math.acos(cosTheta);
}


function angleDeg(x0, y0, x1, y1) {
    return angleRad(x0, y0, x1, y1) * (180. / Math.PI);
}


export default class HandPoseAnalyzer {
    constructor(controlPoint) {
        this.isAnalyzing = false;

        this.referenceX = controlPoint[0];
        this.referenceY = controlPoint[1];

        this.handPosX = 0.;
        this.handPosY = 0.;
        this.handLength = 0.;  // [0,05, 0.5]
        this.handAngle = 0.;   // [0, 180]
        this.thumbAngle = 0.;  // [0, 45]

        this.fingerExtension = new Array(5).fill(0.); // thumb [1.4, 1.7] fingers [0.8, 1.3] (more stable [1.0, 1.3])
        this.fingerIsExtended = new Array(5).fill(false);

        this.analysisCallback = undefined;
    }

    setAnalysisCallback(analysisCallback) {
        this.analysisCallback = analysisCallback;
    }

    analyze = (handPose) => {
        if (!this.isAnalyzing) {
            this.isAnalyzing = true;

            this.handPosX = (handPose[0].x + handPose[5].x + handPose[9].x + handPose[13].x + handPose[17].x) / 5. - this.referenceX;
            this.handPosY = (handPose[0].y + handPose[5].y + handPose[9].y + handPose[13].y + handPose[17].y) / 5. - this.referenceY;

            this.handLength = norm(handPose[5].x - handPose[0].x, handPose[5].y - handPose[0].y);

            this.handAngle = angleDeg(
                handPose[5].x - handPose[0].x, handPose[5].y - handPose[0].y, 1., 0);
            this.thumbAngle = angleDeg(
                handPose[4].x - handPose[1].x, handPose[4].y - handPose[1].y,
                handPose[5].x - handPose[0].x, handPose[5].y - handPose[0].y);

            for (let i = 0; i < this.fingerExtension.length; i++) {
                this.fingerExtension[i] =
                    norm(handPose[i * 4 + 4].x - handPose[0].x, handPose[i * 4 + 4].y - handPose[0].y) /
                    norm(handPose[i * 4 + 2].x - handPose[0].x, handPose[i * 4 + 2].y - handPose[0].y);
                this.fingerIsExtended[i] = (i === 0)? this.fingerExtension[i] > 1.6 : this.fingerExtension[i] > 1.0;
            }

            this.isAnalyzing = false;

            if (this.analysisCallback !== undefined) this.analysisCallback();
        }
    }

    static distanceToControlPoint(pose, controlPoint) {
        return Math.abs(pose[9].x - controlPoint[0]) + Math.abs(pose[9].y - controlPoint[1]);
    }

    static getNearestForControlPoint(handPoses, controlPoint) {
        if (handPoses.length === 0) return undefined;

        return handPoses.reduce((min, pose) => (
            (HandPoseAnalyzer.distanceToControlPoint(pose, controlPoint) < HandPoseAnalyzer.distanceToControlPoint(min, controlPoint)) ? pose : min), handPoses[0]);
    }
}