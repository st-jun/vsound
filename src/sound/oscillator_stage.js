import {clip} from "util";
import {SynthControllable} from "controller";


export class Chords {
    static major = ["C4", "E4",  "G4", "Bb4"];
    static minor = ["C4", "Eb4", "G4", "Bb4"];
    static power = ["C4", "G4", "C5"];

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

    constructor(synthesizers, outRoute) {
        super();
        this.chordGain = new Tone.Gain(0.);
        this.arpeggioGain = new Tone.Gain(0.);
        this.chordGain.connect(outRoute);
        this.arpeggioGain.connect(outRoute);

        this.synthesizers = synthesizers;
        for (let synth of this.synthesizers) {
            synth.connect(this.chordGain);
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
        Tone.Transport.start();
        Tone.Transport.bpm.value = this.bpm;
        this.arpeggio.start();
    }

    setFrequencyStep(frequencyIndex) {
        frequencyIndex = Math.round(frequencyIndex);

        if (frequencyIndex !== this.frequencyIndex) {
            this.frequencyIndex = frequencyIndex;
            this.currentChord = SynthCollection.chordProgressions[this.chordIndex][this.frequencyIndex];

            if (this.currentIndices.length > 0 && this.currentChord) {
                let oldNotes = this.currentNotes;
                this.currentNotes = this.currentIndices.map(index => this.currentChord[index]);

                this.updateArpeggioChord();

                for (let j = 0; j < oldNotes.length; j++) {
                    if (this.currentNotes[j] !== oldNotes[j]) {
                        this.stopChord(oldNotes[j]);
                        this.startChord(this.currentNotes[j]);
                    }
                }
            }
        }
    }

    setChord(chordIndex) {
        chordIndex = Math.round(chordIndex);

        if (chordIndex !== this.chordIndex) {
            this.chordIndex = chordIndex;
            this.currentChord = SynthCollection.chordProgressions[this.chordIndex][this.frequencyIndex];

            if (this.currentIndices.length > 0) {
                let oldNotes = this.currentNotes;
                this.currentNotes = this.currentIndices.map(index => this.currentChord[index]);

                this.updateArpeggioChord();

                for (let j = 0; j < oldNotes.length; j++) {
                    if (this.currentNotes[j] !== oldNotes[j]) {
                        this.stopChord(oldNotes[j]);
                        this.startChord(this.currentNotes[j]);
                    }
                }
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
            synth.synth.set({envelope: envelope});
            synth.arpeggioSynth.set({envelope: envelope});
        }
    }

    setInstrumentGain(index, gain) {
        this.synthesizers[index].setGain(gain);
    }

    setInstrumentTone(index, tone) {
        this.synthesizers[index].setTone(clip(tone));
    }

    startChord(notes) {
        for (let s of this.synthesizers) {
            s.synth.triggerAttack(notes);
        }
    }

    stopChord(notes) {
        for (let s of this.synthesizers) {
            s.synth.triggerRelease(notes);
        }
    }

    addChordNote(index) {
        if (this.currentIndices.includes(index)) {

        } else {
            this.currentIndices.push(index);
            this.currentNotes = this.currentIndices.map(index => this.currentChord[index]);

            this.updateArpeggioChord();
            this.startChord(this.currentChord[index]);
        }
    }

    removeChordNote(index) {
        if (this.currentIndices.includes(index)) {
            this.currentIndices = this.currentIndices.filter(item => item !== index);
            this.currentNotes = this.currentIndices.map(index => this.currentChord[index]);

            this.updateArpeggioChord();
            this.stopChord(this.currentChord[index]);
        } else {
        }
    }

    setArpeggioContribution(arpeggioContribution) {
        if (this.currentNotes.length === 0) {
            this.arpeggioGain.gain.value = 0.;
            this.chordGain.gain.value = 0.;
        } else {
            this.arpeggioGain.gain.value = arpeggioContribution;
            this.chordGain.gain.value = (1. - arpeggioContribution) / 4.;
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
