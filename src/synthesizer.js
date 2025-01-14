import {createGainSlider, createFrequencySlider} from "./control_elements.js";


export default class SynthCollection {
    static majorChord = ["C4", "E4",  "G4", "Bb4"];
    static minorChord = ["C4", "Eb4", "G4", "Bb4"];
    static powerChord = ["C4", "G4", "C5"];

    static chords = [SynthCollection.majorChord, SynthCollection.minorChord, SynthCollection.powerChord];

    constructor(synthesizers, outRoute) {
        this.synthesizers = [];
        for (let s of synthesizers) {
            let ps = new Tone.PolySynth(s);
            let gain = createGainSlider(s.name);
            ps.connect(gain);
            gain.connect(outRoute);
            this.synthesizers.push(ps);
        }
        createFrequencySlider(this.synthesizers);

        this.currentNotes = null;
        this.currentIndices = [];

        this.chordIndex = 0;
        this.currentChord = SynthCollection.minorChord;

    }

    changeChord(chordIndex) {
        if (chordIndex !== this.chordIndex) {
            this.chordIndex = chordIndex;
            this.currentChord = SynthCollection.chords[this.chordIndex];

            this.stop(this.currentNotes);
            this.currentNotes = this.currentIndices.map(index => this.currentChord[index]);
            this.play(this.currentNotes);
        }
    };

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

    addIndex(index) {
        if (this.currentIndices.includes(index)) {

        } else {
            this.currentIndices.push(index);
            this.currentNotes = this.currentIndices.map(index => this.currentChord[index]);
            this.play(this.currentChord[index]);
        }
    }

    removeIndex(index) {
        if (this.currentIndices.includes(index)) {
            this.currentIndices = this.currentIndices.filter(item => item !== index);
            this.currentNotes = this.currentIndices.map(index => this.currentChord[index]);
            this.stop(this.currentChord[index]);
        } else {
        }
    }
}
