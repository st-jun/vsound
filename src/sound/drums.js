

export class DrumPattern {
    constructor(pattern, outRoute) {
        this.pattern = pattern;
        this.kick = new Tone.MembraneSynth({ volume: -10 }).toDestination();
        this.snare = new Tone.NoiseSynth({ volume: -5 }).toDestination();
        this.hihat = new Tone.NoiseSynth({ volume: -10 }).toDestination();
        this.connectOut(outRoute);

        this.sequence = new Tone.Sequence(this.playDrumPattern, [...Array(16).keys()], "16n");
    }

    connectOut(outRoute) {
        this.kick.connect(outRoute);
        this.snare.connect(outRoute);
        this.hihat.connect(outRoute);
    }

    getDrumPattern() {
        return undefined;
    }

    playDrumPattern = (time, step) => {
        this.pattern.forEach(([instrument, ...steps]) => {
            if (steps[step] === 1) {
                if (instrument === "kick") this.kick.triggerAttackRelease("C1", "8n", time);
                if (instrument === "snare") this.snare.triggerAttackRelease("8n", time);
                if (instrument === "hihat") this.hihat.triggerAttackRelease("32n", time);
            }
        });
    }

    start() {
        console.log(Tone.Transport.state);
        if (!this.sequence.started) this.sequence.start(Tone.Transport.now() + 0.1);
    }

    stop() {
        console.log(Tone.Transport.state);

        this.sequence.stop();
    }
}


export class P0 extends DrumPattern {
    constructor(...opts) {
        let pattern = [
            ["kick",  1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0], // Kick
            ["snare", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],  // Snare
            ["hihat", 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1] // Hi-hat
        ];
        super(pattern, ...opts);
    }
}


export class P1 extends DrumPattern {
    constructor(...opts) {
        let pattern = [
            ["kick", 1, 0, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0], // Kick
            ["snare", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],  // Snare
            ["hihat", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] // Hi-hat
        ];
        super(pattern, ...opts);
    }
}

export class P2 extends DrumPattern {
    constructor(...opts) {
        let pattern = [
            ["kick",  1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0], // Kick
            ["snare", 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],  // Snare
            ["hihat", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] // Hi-hat
        ];
        super(pattern, ...opts);
    }
}
