import UIOverlay from "uiOverlay";
import UIScene2D from "uiScene2D";
import UIScene3D from "uiScene3D";


export default class UI {
    constructor(webcam, handPoseAnalyzers) {
        this.simpleUI = false;

        this.webcam = webcam;
        this.initContainer();

        this.overlay = new UIOverlay(handPoseAnalyzers);
        this.scene = null;
        this.clickListener = null;

        this.container.appendChild(this.webcam.video);
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
        if (this.simpleUI) this.scene = new UIScene2D(controllers, synthCollection);
        else               this.scene = new UIScene3D(controllers, synthCollection, effectChain);
        this.container.appendChild(this.scene.getCanvas());
        this.scene.start();
    }

    stopScene() {
        if (this.scene) this.scene.stop();
        this.scene = null;
    }

    initContainer() {
        this.container = document.createElement("div");
        this.container.classList.add("full-container");
    }

    resize = () => {
        this.overlay.canvas.width = window.innerWidth;
        this.overlay.canvas.height = window.innerHeight;
        if (this.scene !== null) {
            this.scene.getCanvas().width = window.innerWidth;
            this.scene.getCanvas().height = window.innerHeight;
        }
    }
}
