import UIScene from "uiScene";
import UIOverlay from "uiOverlay";


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

        window.addEventListener("resize", this.resize);
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
        this.container = document.createElement("div");
        this.container.classList.add("full-container");
    }

    initSceneCanvas() {
        this.sceneCanvas = document.createElement("canvas");
        this.sceneCanvas.classList.add("full-canvas");
    }

    resize = () => {
        this.overlay.canvas.width = window.innerWidth;
        this.overlay.canvas.height = window.innerHeight;
        this.sceneCanvas.width = window.innerWidth;
        this.sceneCanvas.height = window.innerHeight;
    }
}
