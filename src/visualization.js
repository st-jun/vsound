

function drawCircle(ctx, x, y, radius, color) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
}


export default class UI {
    constructor(camera, handPoseAnalyzer) {
        this.camera = camera;
        this.handPoseAnalyzer = handPoseAnalyzer;
        this.handPoseAnalyzer.addAnalysisCallback(this.draw);

        this.initContainer();
        this.initCanvas();
        this.container.appendChild(this.camera.video);
        this.container.appendChild(this.canvas);
        document.body.appendChild(this.container);

        this.drawing = false;
    }

    initContainer() {
        this.container = document.createElement('div');
        this.container.style.position = 'relative';
        this.container.style.maxWidth = '100%';
        this.container.style.maxHeight = '100%';
    }

    initCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = "output_canvas";
        this.canvas.width = 1024;
        this.canvas.height = 1024;
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.addEventListener("click",
            () => {
                this.camera.togglePlay();
            });

        this.ctx = this.canvas.getContext('2d');
        this.ctx.fillStyle = 'lightblue';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        window.addEventListener('resize', this.resizeCanvas);
        this.resizeCanvas();
    }

    resizeCanvas = () => {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    getX(normalizedX) {
        return this.canvas.width * normalizedX;
    }

    getY(normalizedY) {
        return this.canvas.height * normalizedY;
    }

    draw = async () => {
        if (!this.drawing) {
            this.drawing = true;

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // palm
            drawCircle(
                this.ctx,
                this.getX((1. - this.handPoseAnalyzer.palmX)),
                this.getY(this.handPoseAnalyzer.palmY),
                this.getX(this.handPoseAnalyzer.handLength / 5.),
                "red");

            // fingers
            for (let i = 0; i < this.handPoseAnalyzer.fingerTipX.length; i++) {
                if (this.handPoseAnalyzer.fingerIsExtended[i]) {
                    drawCircle(
                        this.ctx,
                        this.getX((1. - this.handPoseAnalyzer.fingerTipX[i])),
                        this.getY(this.handPoseAnalyzer.fingerTipY[i]),
                        this.getX(this.handPoseAnalyzer.fingerExtension[i]/100.),
                        "red");
                }
            }

            this.drawing = false;
        }
    }
}