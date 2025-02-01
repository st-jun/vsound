/**
 * Control over webcam.
 * @class
 */
export default class Webcam {
    constructor() {
        this.isRunning = false;

        this.initVideo();

        this.callbackFuncs = [];
    }

    /**
     * Initialize the video element.
     */
    initVideo() {
        this.video = document.createElement("video");
        this.video.id = "webcam";
        this.video.controls = false;
        this.video.autoplay = false;
    }

    /**
     * Access webcam.
     */
    initWebcam() {
        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            .then((stream) => {
                this.video.srcObject = stream;
            })
            .catch((err) => {
                console.error("Error accessing the webcam:", err);
                alert("Could not access your webcam. Please check permissions.");
                this.video.isRunning = false;
            });
    }

    /**
     * Set function that is called after each video frame that was received.
     * @param {Function} callbackFunc
     */
    addPlayCallback(callbackFunc) {
        this.callbackFuncs.push(callbackFunc);
    }

    /**
     * Start when stopped, stop when started.
     */
    togglePlay() {
        if (this.isRunning) {
            this.stop();
        } else {
            this.start();
        }
    }

    /**
     * Start webcam recording and call callback functions each frame.
     */
    start = () => {
        this.initWebcam();
        this.video.play();
        this.isRunning = true;
        for (let callback of this.callbackFuncs) {
            this.video.requestVideoFrameCallback(callback);
        }
    }

    /**
     * Stop webcam recording.
     */
    stop = () => {
        this.isRunning = false;
        this.video.pause();
    }
}