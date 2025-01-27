

class Synthesizer {
    constructor(cls, baseGain) {
        this.synth = new Tone.PolySynth(cls, this.getDefaultParameters());
        this.synth.maxPolyphony = 80;
        this.baseGain = baseGain;
        this.gain = new Tone.Gain(0.1);
        this.synth.connect(this.gain);

        this.arpeggioSynth = new cls(this.getDefaultParameters());
        this.arpeggioGain = new Tone.Gain(0.1);
        this.arpeggioSynth.connect(this.arpeggioGain);
    }

    getDefaultParameters() {
        return undefined;
    }

    connect(outRoute) {
        this.gain.connect(outRoute);
    }

    connectArpeggio(outRoute) {
        this.arpeggioGain.connect(outRoute);
    }

    setGain(newGain) {
        //console.log(this.synth.name, newGain);
        this.gain.gain.value = newGain * this.baseGain;
        this.arpeggioGain.gain.value = newGain * this.baseGain;
    }

    setTone(newTone) {
        return undefined;
    }
}


export class FMSynthesizer extends Synthesizer {
    constructor() {
        super(Tone.FMSynth, 0.4);
    }

    getDefaultParameters() {
        return {
            oscillator: {type: "square"},
            modulation: {type: "sawtooth"},
            harmonicity: 10,
            envelope: { attack: 0.1, release: 0.3 }
        };
    }

    setTone(newTone) {
        this.synth.set({modulationIndex: 50 * newTone});
        // this.synth.get().modulationIndex.value = 50 * newTone;
        this.arpeggioSynth.modulationIndex.value = 50 * newTone;
    }
}


export class AMSynthesizer extends Synthesizer {
    constructor() {
        super(Tone.AMSynth, 1);
    }

    getDefaultParameters() {
        return {
            envelope: { attack: 0.3, release: 2 }
        };
    }

    setTone(newTone) {
        this.synth.set({harmonicity: 1 * newTone});
        this.arpeggioSynth.harmonicity.value = 1 * newTone;
    }
}


export class DuoSynthesizer extends Synthesizer {
    constructor() {
        super(Tone.DuoSynth, 0.25);
    }

    getDefaultParameters() {
        return {
            voice0: { oscillator: { type: "sine" } },
            voice1: { oscillator: { type: "sawtooth" } },
            vibratoAmount: 0.5
        };
    }

    setTone(newTone) {
        this.synth.set({harmonicity: 2 * newTone, vibratoRate: newTone * 10, vibratoAmount: newTone});
        this.arpeggioSynth.set({harmonicity: 2 * newTone, vibratoRate: newTone * 10, vibratoAmount: newTone});
    }
}