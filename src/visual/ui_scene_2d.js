import {EffectControllable, SynthControllable} from "controller";
import UIScene from "uiScene";
import {drawCircle, getRandom} from "util";


export default class UIScene2D extends UIScene {
    constructor(controllers, synthCollection) {
        super();
        this.synthCollection = synthCollection;
        this.ctx = this.canvas.getContext("2d");
        this.controllers = controllers;
        this.handPoseAnalyzers = [controllers[0].handPoseAnalyzer, controllers[1].handPoseAnalyzer]
        this.sceneSynths = new UISceneSynths(synthCollection);
        this.sceneEffects = new UISceneEffects(this);
    }

    start() {
        this.active = true;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawScene();
    }

    stop() {
        this.active = false;
    }

    drawScene = () => {
        if (this.active) requestAnimationFrame(this.drawScene);

        // fade out old drawings
        this.ctx.globalAlpha = 0.02;
        this.ctx.fillStyle = this.sceneEffects.effectColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // draw this step
        this.ctx.globalAlpha = 1.0;
        for (let controller of this.controllers) {
            controller.setParameters(this.sceneSynths, this.sceneEffects);
        }
        //this.drawHandOverlay(this.handPoseAnalyzers[0]);
        this.drawHandPolygon(this.handPoseAnalyzers[0], this.sceneSynths.syntholygonWidth, "white");
        this.drawHandPolygon(this.handPoseAnalyzers[1], this.sceneEffects.effectPolygonWidth, this.sceneEffects.filterColor);
        this.drawFingerSplatter(this.handPoseAnalyzers[0], this.sceneSynths.pulseScale);
    }

    getX(normalizedX) {
        return this.canvas.width * normalizedX;
    }

    getY(normalizedY) {
        return this.canvas.height * normalizedY;
    }

    drawHand(handPoseAnalyzer) {
        // palm
        drawCircle(
            this.ctx,
            this.getX(handPoseAnalyzer.handX),
            this.getY(handPoseAnalyzer.handY),
            this.getX(handPoseAnalyzer.handLength / 10.),
            this.sceneSynths.handColor);

        // fingers
        for (let i = 0; i < handPoseAnalyzer.fingerTipX.length; i++) {
            if (handPoseAnalyzer.fingerIsExtended[i] || i === 0) {
                drawCircle(
                    this.ctx,
                    this.getX(handPoseAnalyzer.fingerTipX[i]),
                    this.getY(handPoseAnalyzer.fingerTipY[i]),
                    this.getX(handPoseAnalyzer.fingerExtension[i] / 100.),
                    this.sceneSynths.fingerColors[i]);
            }
        }
    }

    drawFingerSplatter(handPoseAnalyzer, pulseScale) {
        for (let i = 1; i < handPoseAnalyzer.fingerTipX.length; i++) {
            if (getRandom(0, 1) < pulseScale && handPoseAnalyzer.fingerIsExtended[i]) {
                drawCircle(
                    this.ctx,
                    this.getX(handPoseAnalyzer.fingerTipX[i] + getRandom(-0.1, 0.1) * getRandom(0.5, 2)),
                    this.getY(handPoseAnalyzer.fingerTipY[i] + getRandom(-0.1, 0.1) * getRandom(0.5, 2)),
                    this.getX(handPoseAnalyzer.fingerExtension[i] * getRandom(0.001, 0.003)),
                    this.sceneSynths.fingerColors[i - 1]);
            }
        }
    }

    drawHandPolygon(handPoseAnalyzer, lineWidth, color, fillColor = null) {
        this.ctx.beginPath();
        this.ctx.moveTo(this.getX(handPoseAnalyzer.handX), this.getY(handPoseAnalyzer.handY));
        for (let i = 0; i < handPoseAnalyzer.fingerTipX.length; i++) {
            if (handPoseAnalyzer.fingerIsExtended[i] || i === 0) {
                this.ctx.lineTo(this.getX(handPoseAnalyzer.fingerTipX[i]), this.getY(handPoseAnalyzer.fingerTipY[i]));
            }
        }
        this.ctx.closePath();

        if (fillColor !== null) {
            this.ctx.fillStyle = fillColor;
            this.ctx.fill();
        }

        this.ctx.lineWidth = lineWidth;
        this.ctx.strokeStyle = color;
        this.ctx.stroke();
    }
}


class UISceneSynths extends SynthControllable {
    constructor(synthCollection) {
        super();
        this.synthCollection = synthCollection;
        this.fingerColors = new Array(4).fill(UIScene.rainbowColors[0]);
        for (let i = 0; i < this.fingerColors.length; i++) {
            this.fingerColors[i] = UIScene.rainbowColors[i * 3];
        }
        this.handColor = UIScene.rainbowColors[0];
        this.syntholygonWidth = 10;
        this.pulseClock = performance.now();
    }

    setFrequencyStep(frequencyIndex) {
        return undefined;
    }

    setChord(chordIndex) {
        return undefined;
    };

    setInstrumentGain(index, gain) {
        return undefined;
    }

    setInstrumentTone(index, tone) {
        this.syntholygonWidth = tone * 50;
    }

    addChordNote(index) {
        return undefined;
    }

    removeChordNote(index) {
        return undefined;
    }

    setArpeggioContribution(arpeggioContribution) {
        return undefined;
    }

    setArpeggioSpeed(speed) {
        this.pulseScale = Math.pow(this.synthCollection.bpm / this.synthCollection.arpeggioSpeeds[this.synthCollection.arpeggioSpeeds.length - 1], 2);
    }

    setArpeggioDirection(index) {
        return undefined;
    }
}


class UISceneEffects extends EffectControllable {
    constructor(ui) {
        super();
        this.ui = ui;
        this.filterColor = "black";
        this.effectColors = ["blue", "red", "green", "yellow"];
        this.effectColor = "black";
        this.syntholygonWidth = 10;
        this.effectPolygonWidth = 10;
    }

    setEffectTone(index, tone) {
        return undefined;
    }

    setEffectWetness(index, wetness) {
        let x, y, color;

        if (wetness > 0) {
            if (index < 5) {
                this.effectPolygonWidth = wetness * 50;
            } else {
                for (let i = 0; i < wetness * 10; i++) {
                    x = this.ui.getX(getRandom(0, 1));
                    y = this.ui.getY(getRandom(0, 1));
                    if (index === 5) {  // bottom
                        color = `rgb(${(1-getRandom(0.3, 1)) * 255}, ${(1-getRandom(0.3, 1)) * 255}, 255)`
                    } else if (index === 6) {  // top
                        color = `rgb(255, ${(1-getRandom(0.3, 1)) * 255}, ${(1-getRandom(0.3, 1)) * 255})`
                    } else if (index === 7) {  // left
                        color = `rgb(${(1-getRandom(0.3, 1)) * 255}, 255, ${(1-getRandom(0.3, 1)) * 255})`
                    } else if (index === 8) {  // right
                        color = `rgb(255, 255, ${(1-getRandom(0.3, 1)) * 255})`
                    }
                    drawCircle(this.ui.ctx, x, y, Math.pow(getRandom(wetness, wetness*3), 2) * 5, color); // this.effectColors[index - 5]
                }
            }
        }
    }

    setHighpassFilter(value) {
        if (value > 0) {
            this.filterColor = `rgb(255, ${(1-value) * 255}, ${(1-value) * 255})`;
        }
    }

    setLowpassFilter(value) {
        if (value > 0) {
            this.filterColor = `rgb(${(1-value) * 255}, ${(1-value) * 255}, 255)`;
        }
    }
}
