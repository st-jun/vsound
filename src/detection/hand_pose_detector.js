// https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker/web_js#video

import {
    HandLandmarker,
    FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";


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

    setPostDetectionCallback(callbackFunc) {
        this.detectionCallback = callbackFunc;
    }

    resetPostDetectionCallback() {
        this.detectionCallback = undefined;
    }

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
