export default class MasteringStage {
    constructor() {
        this.targetLoudness = -35; // dB
        this.compressor = new Tone.Compressor({
            threshold: this.targetLoudness + 1,
            ratio: 8,
            attack: 0.1,
            release: 0.1
        })

        this.mainGain = new Tone.Gain(0.);

        this.mainGain.connect(this.compressor);
        this.compressor.toDestination();
    }

    start() {
        this.mainGain.gain.rampTo(0.1, 1);
    }

    stop() {
        this.mainGain.gain.rampTo(0.0, 1);
    }
}