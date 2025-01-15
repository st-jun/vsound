// https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker/web_js#video

import {
    HandLandmarker,
    FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";


export default class HandPose {
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

    setDetectionCallback(callbackFunc) {
        this.detectionCallback = callbackFunc;
    }

    detect = async () => {
        if (this.detector === undefined) {
            await this.createDetector();
        }

        if (this.runningMode === "IMAGE") {
            this.runningMode = "VIDEO";
            await this.detector.setOptions({ runningMode: "VIDEO" });
        }

        if (this.lastVideoTime !== this.webcam.video.currentTime) {
            this.lastVideoTime = this.webcam.video.currentTime;
            this.results = this.detector.detectForVideo(this.webcam.video, performance.now());
        }

        let canvasCtx = this.webcam.canvas.getContext("2d");
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, this.webcam.canvas.width, this.webcam.canvas.height);
        if (this.results.landmarks) {
            for (const pose of this.results.landmarks) {
                if (this.detectionCallback !== undefined) {
                    this.detectionCallback(pose);
                }
                drawConnectors(canvasCtx, pose, HAND_CONNECTIONS, {
                    color: "#00FF00",
                    lineWidth: 5
                });
                drawLandmarks(canvasCtx, pose, { color: "#FF0000", lineWidth: 2 });
            }
        }
        canvasCtx.restore();

        if (this.webcam.isRunning === true) {
            window.requestAnimationFrame(this.detect);
        }
    }
}
