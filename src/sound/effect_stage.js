import {clip} from "util";
import {EffectControllable} from "controller";


export default class EffectChain extends EffectControllable{
    constructor(nEffects) {
        super();
        this.effects = new Array(nEffects).fill(null);

        this.lowpass = new Tone.Filter({
            type: "lowpass",
            frequency: 1000,
            rolloff: -12,
            Q: 5
        });

        this.highpass = new Tone.Filter({
            type: "highpass",
            frequency: 500,
            rolloff: -12,
            Q: 5
        });

        this.lowpass.connect(this.highpass);
        this.currentOut = this.highpass;
    }

    connectIn(inRoute) {
        inRoute.connect(this.lowpass);
    }

    connectOut(outRoute) {
        this.currentOut.connect(outRoute);
    }

    add(effect, index) {
        this.effects[index] = effect;
        this.currentOut.connect(effect.effect);
        this.currentOut = effect.effect;
    }

    setEffectTone(index, tone) {
        this.effects[index].setTone(clip(tone));
    }

    setEffectWetness(index, wetness) {
        this.effects[index].effect.wet.value = clip(wetness);
    }

    setHighpassFilter(value) {
        this.highpass.frequency.value = 10000 * Math.pow(value, 2);
    }

    setLowpassFilter(value) {
        this.lowpass.frequency.value = 10000 * Math.pow(1 - value, 2);
    }
}


class Effect {
    constructor(cls) {
        this.effect = new cls(this.getDefaultParameters());
    }

    getDefaultParameters() {
        return undefined;
    }

    setTone(newTone) {
        return undefined;
    }
}

export class DistortionEffect extends Effect {
    constructor() {
        super(Tone.Distortion);
    }

    getDefaultParameters() {
        return {distortion: 0.4};
    }

    setTone(newTone) {
        // this.effect.distortion = newTone;
        this.effect.set({
            distortion: newTone,
            oversample: (newTone > 0.6) ? "4x" : ((newTone > 0.3) ? "2x" : "none")
        })
    }
}

export class PhaserEffect extends Effect {
    constructor() {
        super(Tone.Phaser);
    }

    getDefaultParameters() {
        return {
            frequency: 5,
            octaves: 3,
            stages: 10,
            Q: 20,
            baseFrequency: 350,
            wet: 1
        };
    }

    setTone(newTone) {
        this.effect.set({
            frequency: 50 * newTone,
            //Q: Math.round(newTone * 30)
            // phaser.octaves = maxOctaves * value;
            //phaser.baseFrequency = maxBaseFrequency * value;
        })
        //this.effect.frequency.value = newTone * 50;
    }
}


// settings are meh
export class AutoFilterEffect extends Effect {
    constructor() {
        super(Tone.AutoFilter);
    }

    getDefaultParameters() {
        return {
            frequency: 3,
            depth: 1,
            baseFrequency: 200
        };
    }

    setTone(newTone) {
        // this.effect.set({
        //     frequency: 10 * newTone,
        //     depth: 1 * newTone,
        //     baseFrequency: 200 * newTone,
        //     octaves: 6 * newTone,
        // })
    }
}

export class AutoWahEffect extends Effect {
    constructor() {
        super(Tone.AutoWah);
    }

    getDefaultParameters() {
        return {
            baseFrequency: 1000,
            octaves: 10,
            sensitivity: 0,
            Q: 10,
            gain: 10,
        };
    }

    setTone(newTone) {
        const value = Math.round(5 * newTone) / 5;
        this.effect.set({
            baseFrequency: 1000 * value,
            octaves: 10 * value,
            Q: 10 * value
        })
    }
}


// settings are meh
export class BitCrusherEffect extends Effect {
    constructor() {
        super(Tone.BitCrusher);
    }

    getDefaultParameters() {
        return {
            bits: 4
        };
    }

    setTone(newTone) {
        this.effect.set({
            bits: Math.round((1-newTone) * 4 + 4)//((newTone > 0.5) ? 4 : 8)
        })
    }
}


export class ChebyshevEffect extends Effect {
    constructor() {
        super(Tone.Chebyshev);
    }

    getDefaultParameters() {
        return {
            order: 50,
            oversample: "4x",
        };
    }

    setTone(newTone) {
        this.effect.set({
            order: Math.round(20 * newTone),
            oversample: (newTone > 0.6) ? "4x" : ((newTone > 0.3) ? "2x" : "none")
        })
    }
}


export class ChorusEffect extends Effect {
    constructor() {
        super(Tone.Chorus);
    }

    getDefaultParameters() {
        return {
            frequency: 5,
            delayTime: 10,
            depth: 1,
            spread: 360
        };
    }

    setTone(newTone) {
        // this.effect.set({
        //     frequency: 5 * newTone,
        //     delayTime: 10 * newTone,
        //     depth: 1 * newTone,
        //     spread: 360 * newTone,
        // })
    }
}


export class FeedbackDelayEffect extends Effect {
    constructor() {
        super(Tone.FeedbackDelay);
    }

    getDefaultParameters() {
        return {
            delayTime: 0.5,
            feedback: 0.9,
        };
    }

    setTone(newTone) {
        this.effect.set({
            delayTime: Math.round(2.5 * newTone) / 5.,
            //feedback: 0.5 + 0.3 * newTone,
        })
    }
}


export class FreeverbEffect extends Effect {
    constructor() {
        super(Tone.Freeverb);
    }

    getDefaultParameters() {
        return {
            roomSize: 1,
            dampening: 10000,
        };
    }

    setTone(newTone) {
        this.effect.set({
            roomSize: newTone,
            dampening: 10000 * newTone,
        })
    }
}


export class ReverbEffect extends Effect {
    constructor() {
        super(Tone.Reverb);
    }

    getDefaultParameters() {
        return {
            decay: 0.5,
            preDelay: 0
        };
    }

    setTone(newTone) {
        this.effect.set({
            decay: 10 * newTone + 0.01,
            preDelay: 0.1 * newTone + 0.01
        })
    }
}


export class TremoloEffect extends Effect {
    constructor() {
        super(Tone.Tremolo);
    }

    getDefaultParameters() {
        return {
            frequency: 100,
            depth: 1,
        };
    }

    setTone(newTone) {
        this.effect.set({
            frequency: 100 * newTone,
            depth: newTone,
        })
    }
}


export class VibratoEffect extends Effect {
    constructor() {
        super(Tone.Vibrato);
    }

    getDefaultParameters() {
        return {
            frequency: 10,
            depth: 1
        };
    }

    setTone(newTone) {
        this.effect.set({
            frequency: 10 * newTone,
            depth: newTone
        })
    }
}


export class FrequencyShifterEffect extends Effect {
    constructor(maxShift) {
        super(Tone.FrequencyShifter);
        this.maxShift = maxShift;
    }

    getDefaultParameters() {
        return {
            frequency: 0
        };
    }

    setTone(newTone) {
        this.effect.set({
            frequency: this.maxShift * newTone,
        })
    }
}