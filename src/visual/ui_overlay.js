export default class UIOverlay {
    constructor(overlayCanvas, handPoseAnalyzers) {
        this.canvas = overlayCanvas;
        this.ctx = this.canvas.getContext('2d');
        this.handPoseAnalyzers = handPoseAnalyzers;

        this.border = 0.2;

        this.drawOverlay()
    }

    getX(normalizedX) {
        return this.canvas.width * normalizedX;
    }

    getY(normalizedY) {
        return this.canvas.height * normalizedY;
    }

    drawOverlay = () => {
        requestAnimationFrame(this.drawOverlay);

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBorderWarnings()
        // this.drawHandOverlay(this.handPoseAnalyzers);
    }

    drawCircle(ctx, x, y, radius, color) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
    }

    drawBorderWarnings() {
        // only draw one indicator per hand at most
        for (let handPoseAnalyzer of this.handPoseAnalyzers) {
            if (handPoseAnalyzer.handX < this.border) {
                this.drawBorderWarning(this.canvas.width, handPoseAnalyzer.handY * this.canvas.height, 1 - handPoseAnalyzer.handX * 5)
            } else if (handPoseAnalyzer.handX > 1 - this.border) {
                this.drawBorderWarning(0, handPoseAnalyzer.handY * this.canvas.height, 1 - (1 - handPoseAnalyzer.handX) * 5)
            } else if (handPoseAnalyzer.handY < this.border) {
                this.drawBorderWarning((1 - handPoseAnalyzer.handX) * this.canvas.height, 0, 1 - handPoseAnalyzer.handY * 5)
            } else if (handPoseAnalyzer.handY > 1 - this.border) {
                this.drawBorderWarning((1 - handPoseAnalyzer.handX) * this.canvas.height, this.canvas.height, 1 - (1 - handPoseAnalyzer.handX) * 5)
            }
        }
    }

    drawBorderWarning(x, y, intensity) {
        const grad = this.ctx.createRadialGradient(x, y, 0, x, y, this.canvas.width / 4);
        grad.addColorStop(0.5, `rgba(255, 0, 0, ${intensity})`);
        grad.addColorStop(0, "rgba(255, 128, 0, 1)");
        grad.addColorStop(1, "rgba(255, 0, 0, 0)");

        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawHandOverlay(handPoseAnalyzers) {
        for (let handPoseAnalyzer of handPoseAnalyzers) {
            // palm
            this.drawCircle(
                this.ctx,
                this.getX((1. - handPoseAnalyzer.handX)),
                this.getY(handPoseAnalyzer.handY),
                this.getX(handPoseAnalyzer.handLength / 10.),
                "white");

            // fingers
            for (let i = 0; i < handPoseAnalyzer.fingerTipX.length; i++) {
                if (handPoseAnalyzer.fingerIsExtended[i] || i === 0) {
                    this.drawCircle(
                        this.ctx,
                        this.getX((1. - handPoseAnalyzer.fingerTipX[i])),
                        this.getY(handPoseAnalyzer.fingerTipY[i]),
                        this.getX(handPoseAnalyzer.fingerExtension[i] / 100.),
                        "white");
                }
            }
        }
    }
}