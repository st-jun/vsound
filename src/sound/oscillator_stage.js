import {clip} from "util";
import {SynthControllable} from "controller";


export class Chords {
    static major = ["C4", "E4",  "G4", "Bb4"];
    static minor = ["C4", "Eb4", "G4", "Bb4"];
    static power = ["C4", "G4", "C5", "G5"];

    static majorProgression = [
        ["C4", "E4", "G4", "B4"],
        ["D4", "F4", "A4", "C5"],
        ["E4", "G4", "B4", "D5"],
        ["F4", "A4", "C5", "E5"],
        ["G4", "B4", "D5", "F5"],
        ["A4", "C5", "E5", "G5"],
        ["B4", "D5", "F5", "A5"],
        ["C5", "E5", "G5", "B5"]
    ];

    static minorProgression = [
        ["A3", "C4", "E4", "G4"],
        ["B3", "D4", "F4", "A4"],
        ["C4", "Eb4", "G4", "Bb4"],
        ["D4", "F4", "A4", "C5"],
        ["E4", "G4", "B4", "D5"],
        ["F4", "Ab4", "C5", "Eb5"],
        ["G4", "Bb4", "D5", "F5"],
        ["A4", "C5", "E5", "G5"]
    ];

    static powerProgression = [
        ["C4", "G4", "C5", "G5"],
        ["D4", "A4", "D5", "A5"],
        ["E4", "B4", "E5", "B5"],
        ["F4", "C5", "F5", "C6"],
        ["G4", "D5", "G5", "D6"],
        ["A4", "E5", "A5", "E6"],
        ["B4", "F#5", "B5", "F#6"],
        ["C5", "G5", "C6", "G6"]
    ];

    static majorProgressionCents = [
        [0, 400, 700, 1100],      // C4, E4, G4, B4
        [200, 500, 900, 1200],    // D4, F4, A4, C5
        [400, 700, 1100, 1400],   // E4, G4, B4, D5
        [500, 900, 1200, 1600],   // F4, A4, C5, E5
        [700, 1100, 1400, 1700],  // G4, B4, D5, F5
        [900, 1200, 1600, 1900],  // A4, C5, E5, G5
        [1100, 1400, 1700, 2100], // B4, D5, F5, A5
        [1200, 1600, 1900, 2300]  // C5, E5, G5, B5
    ];

    static minorProgressionCents = [
        [-300, 0, 400, 700],      // A3, C4, E4, G4
        [-100, 200, 500, 900],    // B3, D4, F4, A4
        [0, 300, 700, 1000],      // C4, Eb4, G4, Bb4
        [200, 500, 900, 1200],    // D4, F4, A4, C5
        [400, 700, 1100, 1400],   // E4, G4, B4, D5
        [500, 800, 1200, 1500],   // F4, Ab4, C5, Eb5
        [700, 1000, 1400, 1700],  // G4, Bb4, D5, F5
        [900, 1200, 1600, 1900]   // A4, C5, E5, G5
    ];

    static powerProgressionCents = [
        [0, 700, 1200, 1900],     // C4, G4, C5, G5
        [200, 900, 1400, 2100],   // D4, A4, D5, A5
        [400, 1100, 1600, 2300],  // E4, B4, E5, B5
        [500, 1200, 1700, 2400],  // F4, C5, F5, C6
        [700, 1400, 1900, 2600],  // G4, D5, G5, D6
        [900, 1600, 2100, 2800],  // A4, E5, A5, E6
        [1100, 1800, 2300, 3000], // B4, F#5, B5, F#6
        [1200, 1900, 2400, 3100]  // C5, G5, C6, G6
    ];

    static octave = [
        "C",
        "Db",
        "D",
        "Eb",
        "E",
        "F",
        "F#",
        "G",
        "Ab",
        "A",
        "Bb",
        "B"
    ];
}


export default class SynthCollection extends SynthControllable{
    static chords = [Chords.major, Chords.minor, Chords.power];
    static chordProgressions = [Chords.majorProgression, Chords.minorProgression, Chords.powerProgression];
    static chordProgressionsCents = [Chords.majorProgressionCents, Chords.minorProgressionCents, Chords.powerProgressionCents];

    constructor(synthesizers, outRoute, chordActive) {
        super();
        this.chordActive = chordActive;

        this.arpeggioGain = new Tone.Gain(0.);
        this.arpeggioGain.connect(outRoute);

        if (this.chordActive) {
            this.chordGain = new Tone.Gain(0.);
            this.chordGain.connect(outRoute);
        } else {
            this.arpeggioGain.gain.value = 1;
        }

        this.synthesizers = synthesizers;
        for (let synth of this.synthesizers) {
            if (this.chordActive) synth.connect(this.chordGain);
            synth.connectArpeggio(this.arpeggioGain);
        }

        this.currentNotes = [null];
        this.currentIndices = [];

        this.chordIndex = 0;
        this.frequencyIndex = 0;
        this.currentChord = Chords.minor;

        this.arpeggioDirections = ["up", "down", "random"];
        this.bpm = 1;
        this.arpeggioSpeeds = [];
        for (let i = 4; i <= 9; i++) {
            this.arpeggioSpeeds.push(Math.pow(2, i));
        }
        this.arpeggio = new Tone.Pattern(
            (time, note) => {
                for (let synth of this.synthesizers) {
                    synth.arpeggioSynth.triggerAttackRelease(note, "32n", time);
                }
            },
            this.currentNotes,
            this.arpeggioDirections[0]
        );
        this.arpeggio.interval = "16n";

        // start arpeggio
        Tone.Transport.start();
        Tone.Transport.bpm.value = this.bpm;
        this.arpeggio.start();

        // start chord
        if (this.chordActive) {
            for (let synth of this.synthesizers) {
                for (let cs of synth.chordSynths) {
                    cs.triggerAttack("C4");
                    cs.volume.value = 0;
                }
            }
            this.updateChord();
        }
    }

    stop() {
        this.arpeggio.stop();
        Tone.Transport.stop();
    }

    setFrequencyStep(frequencyIndex) {
        frequencyIndex = Math.round(frequencyIndex);

        if (frequencyIndex !== this.frequencyIndex) {
            this.frequencyIndex = frequencyIndex;
            this.currentChord = SynthCollection.chordProgressions[this.chordIndex][this.frequencyIndex];

            if (this.currentIndices.length > 0 && this.currentChord) {
                this.currentNotes = this.currentIndices.map(index => this.currentChord[index]);

                this.updateArpeggioChord();
                this.updateChord();
            }
        }
    }

    setChord(chordIndex) {
        chordIndex = Math.round(chordIndex);

        if (chordIndex !== this.chordIndex) {
            this.chordIndex = chordIndex;
            this.currentChord = SynthCollection.chordProgressions[this.chordIndex][this.frequencyIndex];

            if (this.currentIndices.length > 0) {
                this.currentNotes = this.currentIndices.map(index => this.currentChord[index]);

                this.updateArpeggioChord();
                this.updateChord();
            }
        }
    };

    setEnvelope(attack, decay, sustain, release) {
        const envelope = {
            attack: attack * 1,
            decay: decay * 0.5,
            sustain: sustain * 0.5 + 0.3,
            release: release * 2 + 0.1,
        };
        //console.log(envelope);
        for (let synth of this.synthesizers) {
            if (this.chordActive) {
                for (let cs of synth.chordSynths) {
                    cs.set({envelope: envelope});
                }
            }
            synth.arpeggioSynth.set({envelope: envelope});
        }
    }

    setInstrumentGain(index, gain) {
        this.synthesizers[index].setGain(gain);
    }

    setInstrumentTone(index, tone) {
        this.synthesizers[index].setTone(clip(tone));
    }

    addChordNote(index) {
        if (this.currentIndices.includes(index)) {

        } else {
            this.currentIndices.push(index);
            this.currentNotes = this.currentIndices.map(index => this.currentChord[index]);

            this.updateArpeggioChord();
            if (this.chordActive) {
                for (let synth of this.synthesizers) {
                    synth.chordSynths[index].volume.value = 0;
                }
            }
        }
    }

    removeChordNote(index) {
        if (this.currentIndices.includes(index)) {
            this.currentIndices = this.currentIndices.filter(item => item !== index);
            this.currentNotes = this.currentIndices.map(index => this.currentChord[index]);

            this.updateArpeggioChord();
            if (this.chordActive) {
                for (let synth of this.synthesizers) {
                    synth.chordSynths[index].volume.value = 0;
                }
            }
        } else {
        }
    }

    updateChord() {
        for (let synth of this.synthesizers) {
            for (let i = 0; i < synth.chordSynths.length; i++) {
                synth.chordSynths[i].detune.value = SynthCollection.chordProgressionsCents[this.chordIndex][this.frequencyIndex][i];
            }
        }
    }

    setArpeggioContribution(arpeggioContribution) {
        if (this.chordActive) {
            if (this.currentNotes.length === 0) {
                this.arpeggioGain.gain.value = 0.;
                this.chordGain.gain.value = 0.;
            } else {
                this.arpeggioGain.gain.value = arpeggioContribution;
                this.chordGain.gain.value = (1. - arpeggioContribution) / 4.;
            }
        }
    }

    updateArpeggioChord() {
        // Pattern throws exception if there are no notes, we can set null as a "silent note"
        if (this.currentNotes.length === 0) {
            this.arpeggio.values = [null];
        } else {
            this.arpeggio.values = this.currentNotes;
        }
    }

    setArpeggioSpeed(speed) {
        this.bpm = this.arpeggioSpeeds[Math.round(speed * (this.arpeggioSpeeds.length-1))];
        Tone.Transport.bpm.value = this.bpm;
    }

    setArpeggioDirection(index) {
        if (this.arpeggioDirections[index] !== this.arpeggio.pattern) this.arpeggio.pattern = this.arpeggioDirections[index];
    }
}
