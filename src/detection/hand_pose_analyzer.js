import {angleDeg, norm, clip} from "util";


/**
 * Extract numerical values from mediapipe handpose detection. ( {@link HandPoseDetector})
 *
 * {property} handX - [0, 1]
 * {property} handY - [0, 1]
 * {property} handRefX - [-0.5, 0.5]
 * {property} handRefY - [-0.5, 0.5]
 * {property} handLength - [0, 1]
 * {property} handAngle - [0, 360]
 * {property} thumbAngle - [0, 45]
 * {property} fingerTipX - [0, 1]
 * {property} fingerTipY - [0, 1]
 * {property} fingerExtension - [0, 1]
 * {property} fingerIsExtended - [true, false]
 *
 * @class
 */
export default class HandPoseAnalyzer {
    constructor(controlPoint) {
        this.isAnalyzing = false;

        this.referenceX = controlPoint[0];
        this.referenceY = controlPoint[1];

        this.handX = 0.; // [0, 1]
        this.handY = 0.; // [0, 1]

        this.handRefX = 0.;   // -> [-0.5, 0.5]
        this.handRefY = 0.;   // -> [-0.5, 0.5]
        this.handLength = 0.;  // [0,05, 0.5]  -> [0, 1]
        this.handAngle = 0.;   // [0, 360]
        this.thumbAngle = 0.;  // [0, 45]

        this.fingerTipX = new Array(5).fill(0.); // [0, 1]
        this.fingerTipY = new Array(5).fill(0.); // [0, 1]

        this.fingerExtension = new Array(5).fill(0.); // [0, 1]
        this.fingerIsExtended = new Array(5).fill(false); // [true, false]

        this.analysisCallback = undefined;
    }

    /**
     * Assign left handpose to the left controlpoint and right handpose to the right controlpoint.
     * @param {HandPose} handPoses
     * @param {number[][]} controlPoints
     * @returns {*[]}
     */
    static assignToControlPoints(handPoses, controlPoints) {
        // if (handPoses[0] === undefined) return [];
        // else if (handPoses[1] === undefined) return handPoses;
        if (handPoses[0] === undefined || handPoses[1] === undefined) {
            return [undefined, undefined];
        }

        // video is mirrored, thus we have to check for the inverted condition here (left x is bigger than right x, instead of smaller)
        if (handPoses[0][9].x > handPoses[1][9].x) {
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

    /**
     * Set a function that is called after a hand pose has been analyzed.
     * @param {Function} analysisCallback
     */
    setPostAnalysisCallback(analysisCallback) {
        this.analysisCallback = analysisCallback;
    }

    /**
     * Remove the function that is called after analysis.
     */
    resetPostAnalysisCallback() {
        this.analysisCallback = undefined;
    }

    /**
     * Extract numerical values from mediapipe handpose detections for left and right hand.
     * @param handPose
     */
    analyze = (handPose) => {
        if (!this.isAnalyzing) {
            this.isAnalyzing = true;

            this.handX = 1 - clip((handPose[5].x + handPose[17].x + handPose[0].x) / 3.);  // video is mirrored
            this.handY = clip((handPose[5].y + handPose[17].y + handPose[0].y) / 3.);
            this.handAngle = clip(angleDeg(handPose[13].x - handPose[0].x, handPose[13].y - handPose[0].y, 1., 0), 0, 360);

            this.handRefX = clip(this.handX - this.referenceX, -0.5, 0.5);
            this.handRefY = clip(this.handY - this.referenceY, -0.5, 0.5);
            this.handRefAngle = clip(angleDeg(this.handX - this.referenceX, this.handY - this.referenceY, 1., 0), 0, 360);

            this.handLength = clip((norm(handPose[5].x - handPose[0].x, handPose[5].y - handPose[0].y) - 0.1) / 0.25);
            this.thumbAngle = clip(angleDeg(
                handPose[4].x - handPose[1].x, handPose[4].y - handPose[1].y,
                handPose[5].x - handPose[0].x, handPose[5].y - handPose[0].y, true), 0, 40);

            for (let i = 0; i < this.fingerExtension.length; i++) {
                if (i === 0) {
                    // thumb
                    this.fingerExtension[i] = clip(this.thumbAngle / 40);
                    this.fingerIsExtended[i] = this.thumbAngle > 15;
                } else {
                    // fingers
                    this.fingerExtension[i] =
                        clip((norm(handPose[i * 4 + 4].x - handPose[0].x, handPose[i * 4 + 4].y - handPose[0].y) /
                            norm(handPose[i * 4 + 2].x - handPose[0].x, handPose[i * 4 + 2].y - handPose[0].y) - 0.9) / 0.4);
                    this.fingerIsExtended[i] = this.fingerExtension[i] > 0;
                }

                this.fingerTipX[i] = 1 - handPose[i * 4 + 4].x;
                this.fingerTipY[i] = handPose[i * 4 + 4].y;
            }

            if (this.analysisCallback !== undefined) this.analysisCallback();

            this.isAnalyzing = false;
        }
    }
}