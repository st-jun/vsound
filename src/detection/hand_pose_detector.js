import {
    HandLandmarker,
    FilesetResolver
} from "mediapipe/tasksVision";


/**
 * Wrapper around mediapipe hand landmarker detection.
 * @see {@link https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker}
 * @class
 */
export default class HandPoseDetector {
    constructor(webcam) {
        this.detector = undefined;
        this.runningMode = "IMAGE";
        this.lastVideoTime = -1;
        this.results = undefined;
        this.webcam = webcam;
        this.webcam.addPlayCallback(this.detect);
        this.detectionCallback = undefined;
    }

    /**
     * Download model and create detector.
     * @returns {Promise<void>}
     */
    async createDetector() {
        const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        this.detector = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                delegate: "GPU"
            },
            runningMode: this.runningMode,
            numHands: 2
        });
    }

    /**
     * Set a function that is called after detection has finished.
     * @param callbackFunc
     */
    setPostDetectionCallback(callbackFunc) {
        this.detectionCallback = callbackFunc;
    }

    /**
     * Remove the function that is called after detection.
     */
    resetPostDetectionCallback() {
        this.detectionCallback = undefined;
    }

    /**
     * Detect handposes and call callback function.
     * @returns {Promise<void>}
     */
    detect = async () => {
        if (this.detector === undefined) {
            await this.createDetector();
        }

        if (this.webcam.isRunning) {
            if (this.runningMode === "IMAGE") {
                this.runningMode = "VIDEO";
                await this.detector.setOptions({ runningMode: "VIDEO" });
            }

            if (this.lastVideoTime !== this.webcam.video.currentTime) {
                this.lastVideoTime = this.webcam.video.currentTime;
                try {
                    this.results = this.detector.detectForVideo(this.webcam.video, performance.now());
                } catch (error) {
                    console.warn(error);
                    this.detector = undefined;
                    return;
                }
            }

            if (this.results.landmarks) {
                if (this.detectionCallback !== undefined) {
                    this.detectionCallback(this.results.landmarks);
                }
            }
        }
        this.webcam.video.requestVideoFrameCallback(this.detect);
    }
}
