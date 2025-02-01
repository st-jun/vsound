import {waitForCondition} from "util";

function createContainer() {
    const container = document.createElement("div");

    container.classList.add("full-container");

    return container;
}

function createTextfield(text) {
    const textField = document.createElement("div");

    textField.classList.add("menu-text");
    textField.innerHTML = text;

    return textField;
}


function createImage(src, centerX, centerY, width, height) {
    const img = document.createElement("img");

    img.src = src;
    img.style.position = "absolute";
    img.style.left = `${centerX * 100}vw`;
    img.style.top = `${centerY * 100}vh`;
    img.style.width = `${width * 100}vh`;
    img.style.height = `${height * 100}vh`;
    img.style.transform = "translate(-50%, -50%)";

    return img;
}


function createVideo(src, centerX, centerY, width, height) {
    const video = document.createElement("video");

    video.src = src;
    video.style.position = "absolute";
    video.style.left = `${centerX * 100}vw`;
    video.style.top = `${centerY * 100}vh`;
    video.style.width = `${width * 100}vh`;
    video.style.height = `${height * 100}vh`;
    video.style.transform = "translate(-50%, -50%)";

    return video;
}


export class GreetingMenu {
    constructor(ui, overlay) {
        this.ui = ui;
        this.overlay = overlay;
        this.finished = false;
    }

    run = async () => {
        this.setContent();
        this.ui.setClickListener(() => this.finished = true);
        await waitForCondition(() => this.finished, 500);
    }

    setContent() {
        const container = createContainer();

        const video = createVideo("public/example.mp4", 0.5, 0.4, 0.7, 0.5);
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.playbackRate = 5;
        container.appendChild(video);

        const textField = createTextfield(
            "This is a demo application that allows you to control a simple synthesizer setup through the movement of your hands.<br><br>" +
            "In order to track your hands, please allow the browser to access your camera. In order to hear the sound, make sure your speakers are active.<br><br>" +
            "Click anywhere to proceed.");
        container.appendChild(textField);

        this.overlay.setMenuContent(container);
    }
}


export class HandPlacementMenu {
    constructor(overlay, handPoseAnalyzers) {
        this.overlay = overlay;
        this.handPoseAnalyzers = handPoseAnalyzers;
        this.handPlaced = [false, false];
    }

    run = async () => {
        this.setContent();

        this.waiting = true;
        for (let i = 0; i < this.handPoseAnalyzers.length; i++) {
            this.handPoseAnalyzers[i].setPostAnalysisCallback(() => this.checkPlacement(i));
        }

        this.overlay.startDrawHandPlacement();
        await waitForCondition(() => this.handPlaced[0] && this.handPlaced[1], 500);
        this.overlay.stopDrawHandPlacement();
    }

    setContent() {
        const container = createContainer();
        const imgLeft = createImage("public/left_hand.png", 0.35, 0.5, 0.3, 0.3);
        const imgRight = createImage("public/right_hand.png", 0.65, 0.5, 0.3, 0.3);
        const textField = createTextfield(
            "Place your hands according to the indicators to start.<br><br>" +
            "Afterwards, carefully try to move your hands and fingers to find out how it affects the sound.<br><br>" +
            "Remove your hands from the detection area for more than three seconds to exit.");
        container.appendChild(imgLeft);
        container.appendChild(imgRight);
        container.appendChild(textField);

        this.overlay.setMenuContent(container);
    }

    checkPlacement = (index) => {
        let result = true;
        const maxDistToControlPoint = 0.05;
        if (index === 0) { // left hand

            for (let i = 0; i < 5; i++) {
                if (i === 1) result &= this.handPoseAnalyzers[index].fingerIsExtended[i];  // only index finger should be extended
                else         result &= !this.handPoseAnalyzers[index].fingerIsExtended[i];
            }
        } else { // right hand
            for (let i = 0; i < 5; i++) {
                result &= !this.handPoseAnalyzers[index].fingerIsExtended[i];  // no finger should be extended
            }
        }

        // hands should be close to control point
        result &= Math.abs(this.handPoseAnalyzers[index].handRefX) < maxDistToControlPoint;
        result &= Math.abs(this.handPoseAnalyzers[index].handRefY) < maxDistToControlPoint;

        this.handPlaced[index] = result;
    }
}