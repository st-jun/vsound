import SynthCollection from "./synthesizer.js";


class Controller {
    constructor(synthCollection, effectChain, mainGain, handPoseAnalyzer) {
        this.synthCollection = synthCollection;
        this.effectChain = effectChain;
        this.mainGain = mainGain;
        this.handPoseAnalyzer = handPoseAnalyzer;
        this.handPoseAnalyzer.addPostAnalysisCallback(this.setParameters);

        this.settingParameters = false;
    }

    getMainGain() {
        return 0.1;
    }

    getInstrumentGain(nInstruments, i) {
        return null;
    }

    getNoteActive(nNotes, i) {
        return null;
    }

    getChordType(nChords) {
        return null;
    }

    getFrequency(nSteps) {
        return null;
    }

    getEffectTone(nEffects, i) {
        return null;
    }

    getEffectWetness(nEffects, i) {
        return null;
    }

    setParameters = () => {
        if (!this.settingParameters) {
            this.settingParameters = true;

            let result;

            // chord type
            result = this.getChordType(SynthCollection.chords.length);
            if (result !== null) this.synthCollection.changeChord(result);

            // chord notes
            for (let i = 0; i < this.synthCollection.currentChord.length; i++) {
                result = this.getNoteActive(this.synthCollection.currentChord.length, i);
                if (result !== null) {
                    if (result === true) {
                        this.synthCollection.addChordNote(i);
                    } else{
                        this.synthCollection.removeChordNote(i);
                    }
                }
            }

            // frequency / detune
            result = this.getFrequency(SynthCollection.chordProgressions[0].length);
            if (result !== null) this.synthCollection.setFrequencyStep(result);

            // instrument gains
            for (let i = 0; i < this.synthCollection.synthesizers.length; i++) {
                result = this.getInstrumentGain(this.synthCollection.synthesizers.length, i);
                if (result !== null) this.synthCollection.setInstrumentGain(i, result);
            }

            // effect tone
            for (let i = 0; i < this.effectChain.effects.length; i++) {
                result = this.getEffectTone(this.effectChain.effects.length, i);
                if (result !== null) this.effectChain.setEffectTone(i, result);
            }

            // effect wetness
            for (let i = 0; i < this.effectChain.effects.length; i++) {
                result = this.getEffectWetness(this.effectChain.effects.length, i);
                if (result !== null) this.effectChain.setEffectWetness(i, result);
            }

            this.settingParameters = false;
        }
    }
}


export class InstrumentController extends Controller {
    getInstrumentGain(nInstruments, i) {
        let l = i / nInstruments / 2. - 0.25;
        let r = (i + 1) / nInstruments / 2. - 0.25;
        let dist =  Math.abs((r - l) / 2. + l - this.handPoseAnalyzer.handDistX);
        return (dist < 0.35)? 1 - dist / 0.35 : 0;
    }

    getNoteActive(nNotes, i) {
        return this.handPoseAnalyzer.fingerIsExtended[i+1];
    }

    getChordType(nChords) {
        //return (this.handPoseAnalyzer.thumbAngle < 20)? 0 : 1; // only change between minor and major here
        return Math.round((this.handPoseAnalyzer.handAngle - 45) / 135. * (nChords - 1));
    }

    getFrequency(nSteps) {
        return nSteps - (this.handPoseAnalyzer.handDistY + 0.5) * nSteps;
    }
}


export class EffectController extends Controller {
    getEffectTone(nEffects, i) {
        return (this.handPoseAnalyzer.fingerIsExtended[i+1])? Math.min(1., Math.max(0., (this.handPoseAnalyzer.fingerExtension[i+1] - 0.9) / 0.4)) : 0.;
    }

    getEffectWetness(nEffects, i) {
        return this.handPoseAnalyzer.handAngle / 180.;
    }
}