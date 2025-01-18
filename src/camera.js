
export default class Webcam {
    constructor() {
        this.isRunning = false;

        this.initVideo();
        this.initWebcam();
    }

    initVideo() {
        this.video = document.createElement('video');
        this.video.id = "webcam";
        this.video.style.width = '100%';
        this.video.style.height = '100%';
        this.video.style.objectFit = 'contain';
        this.video.controls = false;
        this.video.autoplay = false;
        this.video.style.opacity = "0.0";
    }

    initWebcam() {
        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            .then((stream) => {
                this.video.srcObject = stream;
                this.video.isRunning = true;
            })
            .catch((err) => {
                console.error('Error accessing the webcam:', err);
                alert('Could not access your webcam. Please check permissions.');
                this.video.isRunning = false;
            });
    }

    addPlayCallback(callbackFunc) {
        this.video.addEventListener('play', callbackFunc);
    }

    togglePlay() {
        if (this.isRunning) {
            this.isRunning = false;
            this.video.pause();
        } else {
            this.isRunning = true;
            this.video.play();
        }
    }
}