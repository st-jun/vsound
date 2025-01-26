export default class UIOverlay {
    constructor(handPoseAnalyzers) {
        this.handPoseAnalyzers = handPoseAnalyzers;
        this.border = 0.2;
        this.drawHandPlacement = false;
        this.drawRun = false;

        this.initMenuDiv();
        this.initCanvas();
        this.ctx = this.canvas.getContext('2d');
    }

    initCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
    }

    initMenuDiv() {
        this.menuDiv = document.createElement('div');
        this.menuDiv.style.position = 'fixed';
        this.menuDiv.style.top = '0';
        this.menuDiv.style.left = '0';
        this.menuDiv.style.width = '100%';
        this.menuDiv.style.height = '100%';
        this.menuDiv.style.backgroundColor = 'black';
    }

    getX(normalizedX) {
        return this.canvas.width * normalizedX;
    }

    getY(normalizedY) {
        return this.canvas.height * normalizedY;
    }

    setMenuContent(content) {
        this.menuDiv.innerHTML = "";
        this.menuDiv.appendChild(content);
    }

    startDrawHandPlacement() {
        this.drawHandPlacement = true;
        this.drawHandPlacementOverlay();
        this.menuDiv.style.opacity = '1';
    }

    stopDrawHandPlacement() {
        this.drawHandPlacement = false;
        this.menuDiv.style.opacity = '0';
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawHandPlacementOverlay = () => {
        if (this.drawHandPlacement) {
            requestAnimationFrame(this.drawHandPlacementOverlay);
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.drawBorderWarnings()
            this.drawHandOverlay();
        }
    }

    startDrawRun() {
        this.drawRun = true;
        this.drawRunOverlay();
    }

    stopDrawRun() {
        this.drawRun = false;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawRunOverlay = () => {
        if (this.drawRun) {
            requestAnimationFrame(this.drawRunOverlay);
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.drawBorderWarnings()
        }
    }

    drawCircle(ctx, x, y, radius, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    drawBorderWarnings() {
        // only draw one indicator per hand at most
        for (let handPoseAnalyzer of this.handPoseAnalyzers) {
            if (handPoseAnalyzer.handX < this.border) {
                this.drawBorderWarning(this.getX(1), this.getY(handPoseAnalyzer.handY), 1 - handPoseAnalyzer.handX * 5)
            } else if (handPoseAnalyzer.handX > 1 - this.border) {
                this.drawBorderWarning(this.getX(0), this.getY(handPoseAnalyzer.handY), 1 - (1 - handPoseAnalyzer.handX) * 5)
            } else if (handPoseAnalyzer.handY < this.border) {
                this.drawBorderWarning(this.getX(1 - handPoseAnalyzer.handX), this.getY(0), 1 - handPoseAnalyzer.handY * 5)
            } else if (handPoseAnalyzer.handY > 1 - this.border) {
                this.drawBorderWarning(this.getX(1 - handPoseAnalyzer.handX), this.getY(1), 1 - (1 - handPoseAnalyzer.handY) * 5)
            }
        }
    }

    drawBorderWarning(x, y, intensity) {
        const grad = this.ctx.createRadialGradient(x, y, 0, x, y, intensity * this.canvas.width / 3);
        grad.addColorStop(0.5, `rgba(255, 0, 0, ${intensity})`);
        grad.addColorStop(0, "rgba(255, 128, 0, 1)");
        grad.addColorStop(1, "rgba(255, 0, 0, 0)");

        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawHandOverlay() {
        for (let handPoseAnalyzer of this.handPoseAnalyzers) {
            // palm
            this.drawCircle(
                this.ctx,
                this.getX((1. - handPoseAnalyzer.handX)),
                this.getY(handPoseAnalyzer.handY),
                this.getX(handPoseAnalyzer.handLength / 10.),
                "red");

            // fingers
            for (let i = 0; i < handPoseAnalyzer.fingerTipX.length; i++) {
                if (handPoseAnalyzer.fingerIsExtended[i] || i === 0) {
                    this.drawCircle(
                        this.ctx,
                        this.getX((1. - handPoseAnalyzer.fingerTipX[i])),
                        this.getY(handPoseAnalyzer.fingerTipY[i]),
                        this.getX(handPoseAnalyzer.fingerExtension[i] / 100.),
                        "red");
                }
            }
        }
    }
}