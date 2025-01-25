import UIScene from "ui_scene";
import UIOverlay from "ui_overlay";


export default class UI {
    constructor(webcam, handposeAnalyzers, controllers, synthCollection, effectChain) {
        this.webcam = webcam;
        this.initContainer();
        this.initSceneCanvas();
        this.initOverlayCanvas();

        this.container.appendChild(this.webcam.video);
        this.container.appendChild(this.sceneCanvas);
        this.container.appendChild(this.overlayCanvas);
        document.body.appendChild(this.container);
        window.addEventListener('resize', this.resizeCanvas);

        this.controllers = controllers;
        this.overlay = new UIOverlay(this.overlayCanvas, handposeAnalyzers);
        this.scene = new UIScene(this.sceneCanvas, controllers, synthCollection, effectChain);
    }

    initContainer() {
        this.container = document.createElement('div');
        this.container.style.position = 'fixed';
        this.container.style.maxWidth = '100%';
        this.container.style.maxHeight = '100%';
        this.container.style.top = '0';
        this.container.style.left = '0';
    }

    initOverlayCanvas() {
        this.overlayCanvas = document.createElement('canvas');
        this.overlayCanvas.style.position = 'fixed';
        this.overlayCanvas.style.top = '0';
        this.overlayCanvas.style.left = '0';
        //this.overlayCanvas.style.opacity = "30%";
        this.overlayCanvas.addEventListener("click",
            () => {
                this.webcam.togglePlay();
            });

        this.resizeCanvas();
    }

    initSceneCanvas() {
        this.sceneCanvas = document.createElement('canvas');
        this.sceneCanvas.style.position = 'fixed';
        this.sceneCanvas.style.top = '0';
        this.sceneCanvas.style.left = '0';
    }

    resizeCanvas = () => {
        this.overlayCanvas.width = window.innerWidth;
        this.overlayCanvas.height = window.innerHeight;
        this.sceneCanvas.width = window.innerWidth;
        this.sceneCanvas.height = window.innerHeight;
    }
}
