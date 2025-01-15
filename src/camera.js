
export default class Webcam {
    constructor() {
        this.isRunning = false;

        this.initContainer();
        this.initVideo();
        this.initCanvas();

        this.container.appendChild(this.video);
        this.container.appendChild(this.canvas);
        document.body.appendChild(this.container);

        this.initWebcam();
    }

    initContainer() {
        this.container = document.createElement('div');
        this.container.style.position = 'relative';
        this.container.style.maxWidth = '50%';
        this.container.style.maxHeight = '50%';
    }

    initVideo() {
        this.video = document.createElement('video');
        this.video.id = "webcam";
        this.video.style.width = '100%';
        this.video.style.height = '100%';
        this.video.style.objectFit = 'contain';
        this.video.controls = false;
        this.video.autoplay = false;
        this.video.style.opacity = "0.2";
        // this.video.style.transform = "scaleX(-1)";
        // this.video.style.transformOrigin = "center";
    }

    initCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = "output_canvas";
        this.canvas.width = 512;
        this.canvas.height = 512;
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.addEventListener("click",
            () => {
                if (this.isRunning) {
                    this.isRunning = false;
                    this.video.pause();
                } else {
                    this.isRunning = true;
                    this.video.play();
                }
            });
    }

    initWebcam() {
        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            .then((stream) => {
                this.video.srcObject = stream;
                this.video.isRunning = true;
                this.video.addEventListener('loadedmetadata', () => {
                    this.canvas.width = this.video.videoWidth;
                    this.canvas.height = this.video.videoHeight;

                    this.canvas.style.width = `${this.video.offsetWidth}px`;
                    this.canvas.style.height = `${this.video.offsetHeight}px`;
                });
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
}