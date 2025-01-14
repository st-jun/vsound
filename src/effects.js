import {createEffectSlider} from "./control_elements.js";

export default class EffectChain {
    constructor() {
        this.effects = [];
        this.effectSetter = [];
        this.effectGetter = [];
    }

    connect(outRoute) {
        for (let i = 0; i < this.effects.length - 1; i++) {
            this.effects[i].connect(this.effects[i+1]);
        }
        this.effects[this.effects.length-1].connect(outRoute);
    }

    registerEffect(effect, setter, getter, description) {
        this.effects.push(effect);
        this.effectSetter.push(setter);
        this.effectGetter.push(getter);

        createEffectSlider(description, this, this.effects.length-1)
    }

    addDistortion(distortionValue = 0.4, description = "Distortion") {
        const distortion = new Tone.Distortion(distortionValue);
        this.registerEffect(
            distortion,
            (value) => { distortion.distortion = value; },
            () => { return distortion.distortion; },
            description);
    }

    addPhaser(frequency = 5, octaves = 5, baseFrequency = 1000, description = "Phaser") {
        const phaser = new Tone.Phaser({
            frequency: frequency,
            octaves: octaves,
            baseFrequency: baseFrequency
        });
        this.registerEffect(
            phaser,
            (value) => {
                phaser.octaves = octaves * value;
                phaser.baseFrequency = baseFrequency * value * 2.;
                },
            () => { return phaser.baseFrequency / baseFrequency / 2.; },
            description);
    }
}