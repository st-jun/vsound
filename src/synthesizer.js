import {createGainSlider, createFrequencySlider} from "./control_elements.js";


class Chords {
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
}

export default class SynthCollection {

    static chords = [Chords.major, Chords.minor, Chords.power];
    static chordProgressions = [Chords.majorProgression, Chords.minorProgression, Chords.powerProgression];

    constructor(synthesizers, outRoute) {
        this.synthesizers = [];
        this.synthesizerGains = [];
        for (let s of synthesizers) {
            let ps = new Tone.PolySynth(s);
            let gain = createGainSlider(s.name);
            console.log(gain);
            ps.connect(gain);
            gain.connect(outRoute);
            this.synthesizers.push(ps);
            this.synthesizerGains.push(gain);
        }

        // createFrequencySlider(this.synthesizers, this.frequencyMin, this.frequencyMax, this.frequencyStep);

        this.currentNotes = null;
        this.currentIndices = [];

        this.chordIndex = 0;
        this.frequencyIndex = 0;
        this.currentChord = Chords.minor;

    }

    setFrequencyStep(frequencyIndex) {
        frequencyIndex = Math.round(frequencyIndex);

        if (frequencyIndex !== this.frequencyIndex) {
            this.frequencyIndex = frequencyIndex;
            this.currentChord = SynthCollection.chordProgressions[this.chordIndex][this.frequencyIndex];

            if (this.currentIndices.length > 0) {
                let oldNotes = this.currentNotes;
                this.currentNotes = this.currentIndices.map(index => this.currentChord[index]);

                for (let j = 0; j < oldNotes.length; j++) {
                    if (this.currentNotes[j] !== oldNotes[j]) {
                        this.stop(oldNotes[j]);
                        this.play(this.currentNotes[j]);
                    }
                }
            }
        }
    }

    changeChord(chordIndex) {
        chordIndex = Math.round(chordIndex);

        if (chordIndex !== this.chordIndex) {
            this.chordIndex = chordIndex;
            this.currentChord = SynthCollection.chordProgressions[this.chordIndex][this.frequencyIndex];

            let oldNotes = this.currentNotes;
            this.currentNotes = this.currentIndices.map(index => this.currentChord[index]);

            for (let j = 0; j < oldNotes.length; j++) {
                if (this.currentNotes[j] !== oldNotes[j]) {
                    this.stop(oldNotes[j]);
                    this.play(this.currentNotes[j]);
                }
            }
        }
    };

    setInstrumentGain(index, gain) {
        this.synthesizerGains[index].gain.value = gain;
    }

    play(notes) {
        for (let s of this.synthesizers) {
            s.triggerAttack(notes);
        }
    }

    stop(notes) {
        for (let s of this.synthesizers) {
            s.triggerRelease(notes);
        }
    }

    addChordNote(index) {
        if (this.currentIndices.includes(index)) {

        } else {
            this.currentIndices.push(index);
            this.currentNotes = this.currentIndices.map(index => this.currentChord[index]);
            this.play(this.currentChord[index]);
        }
    }

    removeChordNote(index) {
        if (this.currentIndices.includes(index)) {
            this.currentIndices = this.currentIndices.filter(item => item !== index);
            this.currentNotes = this.currentIndices.map(index => this.currentChord[index]);
            this.stop(this.currentChord[index]);
        } else {
        }
    }
}
