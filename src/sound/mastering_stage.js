

export default class MasteringStage {
    constructor() {
        this.targetLoudness = -35; // dB
        this.compressor = new Tone.Compressor({
            threshold: this.targetLoudness + 1,
            ratio: 8,
            attack: 0.01,
            release: 0.1
        })
        this.levelMeter = new Tone.Meter();
        this.mainGain = new Tone.Gain(0.1);

        this.mainGain.connect(this.levelMeter);
        this.mainGain.connect(this.compressor);
        this.compressor.toDestination();

        setInterval(() => {
            const loudness = this.levelMeter.getValue();
            if (loudness > -Infinity) this.adjustGain(loudness);
        }, 100);
    }

    adjustGain(loudness) {
        const adjustment = Math.min(20, this.targetLoudness - loudness);
        this.mainGain.gain.value = Tone.dbToGain(adjustment);
    }
}