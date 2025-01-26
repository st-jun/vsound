import UIScene from "ui_scene";
import UIOverlay from "ui_overlay";


export default class UI {
    constructor(webcam, handPoseAnalyzers) {
        this.webcam = webcam;
        this.initContainer();
        this.initSceneCanvas();

        this.overlay = new UIOverlay(handPoseAnalyzers);
        this.scene = null;
        this.clickListener = null;

        this.container.appendChild(this.webcam.video);
        this.container.appendChild(this.sceneCanvas);
        this.container.appendChild(this.overlay.menuDiv);
        this.container.appendChild(this.overlay.canvas);
        document.body.appendChild(this.container);

        window.addEventListener('resize', this.resize);
        this.resize();
    }

    setClickListener(clickListener) {
        this.overlay.canvas.onclick = clickListener;
    }

    startScene(controllers, synthCollection, effectChain) {
        this.scene = new UIScene(this.sceneCanvas, controllers, synthCollection, effectChain);
    }

    stopScene() {
        if (this.scene) this.scene.stop();
        this.scene = null;
    }

    initContainer() {
        this.container = document.createElement('div');
        this.container.style.position = 'fixed';
        this.container.style.maxWidth = '100%';
        this.container.style.maxHeight = '100%';
        this.container.style.top = '0';
        this.container.style.left = '0';
    }

    initSceneCanvas() {
        this.sceneCanvas = document.createElement('canvas');
        this.sceneCanvas.style.position = 'fixed';
        this.sceneCanvas.style.top = '0';
        this.sceneCanvas.style.left = '0';
    }

    resize = () => {
        this.overlay.canvas.width = window.innerWidth;
        this.overlay.canvas.height = window.innerHeight;
        this.sceneCanvas.width = window.innerWidth;
        this.sceneCanvas.height = window.innerHeight;
    }
}
