import {angleDeg, norm, clip} from "util";


export default class HandPoseAnalyzer {
    constructor(controlPoint) {
        this.isAnalyzing = false;

        this.referenceX = controlPoint[0];
        this.referenceY = controlPoint[1];

        this.palmX = 0.; // [0, 1]
        this.palmY = 0.; // [0, 1]

        this.handDistX = 0.;   // -> [-0.5, 0.5]
        this.handDistY = 0.;   // -> [-0.5, 0.5]
        this.handLength = 0.;  // [0,05, 0.5]  -> [0, 1]
        this.handAngle = 0.;   // [0, 360]
        this.thumbAngle = 0.;  // [0, 45]

        this.fingerTipX = new Array(5).fill(0.); // [0, 1]
        this.fingerTipY = new Array(5).fill(0.); // [0, 1]

        this.fingerExtension = new Array(5).fill(0.); // [0, 1]
        this.fingerIsExtended = new Array(5).fill(false); // [true, false]

        this.analysisCallback = [];
    }

    addPostAnalysisCallback(analysisCallback) {
        this.analysisCallback.push(analysisCallback);
    }

    analyze = (handPose) => {
        if (!this.isAnalyzing) {
            this.isAnalyzing = true;

            this.palmX = clip((handPose[5].x + handPose[17].x + handPose[0].x) / 3.);
            this.palmY = clip((handPose[5].y + handPose[17].y + handPose[0].y) / 3.);
            this.handDistX = clip((handPose[0].x + handPose[5].x + handPose[9].x + handPose[13].x + handPose[17].x) / 5. - this.referenceX, -0.5, 0.5);
            this.handDistY = clip((handPose[0].y + handPose[5].y + handPose[9].y + handPose[13].y + handPose[17].y) / 5. - this.referenceY, -0.5, 0.5);
            this.handLength = clip((norm(handPose[5].x - handPose[0].x, handPose[5].y - handPose[0].y) - 0.05) / 0.3);
            this.handAngle = clip(angleDeg(handPose[5].x - handPose[0].x, handPose[5].y - handPose[0].y, 1., 0), 0, 360);
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

                this.fingerTipX[i] = handPose[i * 4 + 4].x;
                this.fingerTipY[i] = handPose[i * 4 + 4].y;
            }

            for (let callbackFunc of this.analysisCallback) {
                callbackFunc();
            }

            this.isAnalyzing = false;
        }
    }
}