export default class Webcam {
    constructor() {
        this.isRunning = false;

        this.initVideo();

        this.callbackFuncs = [];
    }

    initVideo() {
        this.video = document.createElement('video');
        this.video.id = "webcam";
        this.video.controls = false;
        this.video.autoplay = false;
    }

    initWebcam() {
        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            .then((stream) => {
                this.video.srcObject = stream;
            })
            .catch((err) => {
                console.error('Error accessing the webcam:', err);
                alert('Could not access your webcam. Please check permissions.');
                this.video.isRunning = false;
            });
    }

    addPlayCallback(callbackFunc) {
        this.callbackFuncs.push(callbackFunc);
    }

    togglePlay() {
        if (this.isRunning) {
            this.stop();
        } else {
            this.start();
        }
    }

    start = () => {
        this.initWebcam();
        this.video.play();
        this.isRunning = true;
        for (let callback of this.callbackFuncs) {
            this.video.requestVideoFrameCallback(callback);
        }
    }

    stop = () => {
        this.isRunning = false;
        this.video.pause();
    }
}