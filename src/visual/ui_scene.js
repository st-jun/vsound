/**
 * Interface for all scene implementations.
 * @class
 */
export default class UIScene {
    static rainbowColors = [
        "#FF0000",
        "#FF7F00",
        "#FFFF00",
        "#7FFF00",
        "#00FF00",
        "#00FF7F",
        "#00FFFF",
        "#007FFF",
        "#0000FF",
        "#7F00FF",
        "#FF00FF",
        "#FF007F"
    ];

    constructor() {
        this.initCanvas();
    }

    initCanvas() {
        this.canvas = document.createElement("canvas");
        this.canvas.classList.add("full-canvas");
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    getCanvas() {
        return this.canvas;
    }

    start() {
        throw new Error("Cannot instantiate an abstract class.");
    }

    stop() {
        throw new Error("Cannot instantiate an abstract class.");
    }
}