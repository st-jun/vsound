import SynthCollection from "oscillatorStage";
import {clip} from "util";


export class SynthControllable {
    setFrequencyStep(frequencyIndex) {
        return undefined;
    }

    setChord(chordIndex) {
        return undefined;
    };

    setEnvelope(attack, decay, sustain, release) {
        return undefined;
    }

    setInstrumentGain(index, gain) {
        return undefined;
    }

    setInstrumentTone(index, tone) {
        return undefined;
    }

    addChordNote(index) {
        return undefined;
    }

    removeChordNote(index) {
        return undefined;
    }

    setArpeggioContribution(arpeggioContribution) {
        return undefined;
    }

    setArpeggioSpeed(speed) {
        return undefined;
    }

    setArpeggioDirection(index) {
        return undefined;
    }
}


export class EffectControllable {
    setEffectTone(index, tone) {
        return undefined;
    }

    setEffectWetness(index, wetness) {
        return undefined;
    }

    setHighpassFilter(value) {
        return undefined;
    }

    setLowpassFilter(value) {
        return undefined;
    }
}


class Controller {
    constructor(synthCollection, effectChain, handPoseAnalyzer) {
        this.synthCollection = synthCollection;
        this.effectChain = effectChain;
        this.handPoseAnalyzer = handPoseAnalyzer;
        this.handPoseAnalyzer.setPostAnalysisCallback(this.setParameters);

        this.settingParameters = false;

        this.lastIter = performance.now();
        this.minIterDuration = 10;
    }

    getInstrumentGain(nInstruments, i) {
        return null;
    }

    getInstrumentTone(nInstruments, i) {
        return null;
    }

    getAttack() {
        return null;
    }

    getDecay() {
        return null;
    }

    getSustain() {
        return null;
    }

    getRelease() {
        return null;
    }

    getArpeggioContribution() {
        return null;
    }

    getArpeggioSpeed() {
        return null;
    }

    getArpeggioDirection(nDirections) {
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

    getLowpassValue() {
        return null;
    }

    getHighpassValue() {
        return null;
    }

    setParameters = (synthControllable = null, effectControllable = null) => {
        if (synthControllable === null) synthControllable = this.synthCollection;
        if (effectControllable === null) effectControllable = this.effectChain;

        // limit updates
        const now = performance.now();
        if (now - this.lastIter >= this.minIterDuration) {
            this.lastIter = now;
        } else {
            return;
        }

        if (!this.settingParameters) {
            this.settingParameters = true;

            let result;

            // chord type
            result = this.getChordType(SynthCollection.chords.length);
            if (result !== null) synthControllable.setChord(result);

            // chord note
            if (this.synthCollection.currentChord) {
                for (let i = 0; i < this.synthCollection.currentChord.length; i++) {
                    result = this.getNoteActive(this.synthCollection.currentChord.length, i);
                    if (result !== null) {
                        if (result === true) {
                            synthControllable.addChordNote(i);
                        } else {
                            synthControllable.removeChordNote(i);
                        }
                    }
                }
            }

            // arpeggio
            result = this.getArpeggioContribution();
            if (result !== null) synthControllable.setArpeggioContribution(result);
            result = this.getArpeggioSpeed();
            if (result !== null) synthControllable.setArpeggioSpeed(result);
            result = this.getArpeggioDirection(this.synthCollection.arpeggioDirections.length);
            if (result !== null) synthControllable.setArpeggioDirection(result);

            // frequency / detune
            result = this.getFrequency(SynthCollection.chordProgressions[0].length);
            if (result !== null) synthControllable.setFrequencyStep(result);

            // envelope
            const attack = this.getAttack();
            if (attack !== null) {
                const decay = this.getDecay();
                const sustain = this.getSustain();
                const release = this.getRelease();
                if (decay !== null && sustain !== null && release !== null) {
                    synthControllable.setEnvelope(attack, decay, sustain, release);
                }
            }

            // instrument gains
            for (let i = 0; i < this.synthCollection.synthesizers.length; i++) {
                result = this.getInstrumentGain(this.synthCollection.synthesizers.length, i);
                if (result !== null) synthControllable.setInstrumentGain(i, result);
            }

            // instrument tones
            for (let i = 0; i < this.synthCollection.synthesizers.length; i++) {
                result = this.getInstrumentTone(this.synthCollection.synthesizers.length, i);
                if (result !== null) synthControllable.setInstrumentTone(i, result);
            }

            // effect tone
            for (let i = 0; i < this.effectChain.effects.length; i++) {
                result = this.getEffectTone(this.effectChain.effects.length, i);
                if (result !== null) effectControllable.setEffectTone(i, result);
            }

            // effect wetness
            for (let i = 0; i < this.effectChain.effects.length; i++) {
                result = this.getEffectWetness(this.effectChain.effects.length, i);
                if (result !== null) effectControllable.setEffectWetness(i, result);
            }

            // filter
            result = this.getLowpassValue();
            if (result !== null) effectControllable.setLowpassFilter(result);
            result = this.getHighpassValue();
            if (result !== null) effectControllable.setHighpassFilter(result);

            this.settingParameters = false;
        }
    }
}


export class InstrumentController extends Controller {
    getInstrumentGain(nInstruments, i) {
        const w = 0.5 / nInstruments;
        const l = i / nInstruments / 2. - w;
        const r = (i + 1) / nInstruments / 2. - w;
        const dist =  Math.abs((r - l) / 2. + l - this.handPoseAnalyzer.handRefX);
        return (dist < w)? 1 - dist / w : 0;
    }

    getInstrumentTone(nInstruments, i) {
        return this.handPoseAnalyzer.handLength;
    }

    getNoteActive(nNotes, i) {
        return this.handPoseAnalyzer.fingerIsExtended[i+1];
    }

    getChordType(nChords) {
        //return (this.handPoseAnalyzer.thumbAngle < 20)? 0 : 1; // only change between minor and major here
        return Math.round(this.handPoseAnalyzer.thumbAngle / 30)
    }

    getFrequency(nSteps) {
        return Math.round(nSteps - (this.handPoseAnalyzer.handRefY + 0.5) * nSteps);
    }

    getArpeggioContribution() {
        if (this.handPoseAnalyzer.handAngle > 180) {
            return 1.;
        } else if (this.handPoseAnalyzer.handAngle > 105) {
            return clip ((this.handPoseAnalyzer.handAngle - 105.) / 20.);
        } else if (this.handPoseAnalyzer.handAngle < 85) {
            return clip((85 - this.handPoseAnalyzer.handAngle) / 10.);
        } else {
            return 0.;
        }
    }

    getArpeggioSpeed() {
        if (this.handPoseAnalyzer.handAngle > 180) {
            return 1. - clip(Math.abs(270 - this.handPoseAnalyzer.handAngle) / 70.);
        } else if (this.handPoseAnalyzer.handAngle > 90) {
            return 1. - clip((this.handPoseAnalyzer.handAngle - 110.) / 70.);
        } else {
            return 1. - clip( (80 - this.handPoseAnalyzer.handAngle) / 45.);
        }

    }

    getArpeggioDirection(nDirections) {
        if (this.handPoseAnalyzer.handAngle > 180) {
            return 2;
        } else if (this.handPoseAnalyzer.handAngle > 105) {
            return 0;
        } else if (this.handPoseAnalyzer.handAngle < 85) {
            return 1;
        } else {
            return 0;
        }
    }
}


export class EffectController extends Controller {
    constructor(...opts) {
        super(...opts);
        this.rangeMin = 0.02;
        this.rangeMax = 0.2;
    }

    getEffectTone(nEffects, i) {
        if (i < 5) {
            return (this.handPoseAnalyzer.fingerIsExtended[i])? this.handPoseAnalyzer.fingerExtension[i] : 0.;
        } else {
            if      (i === 5) return clip(this.handPoseAnalyzer.handRefY /  this.rangeMax - this.rangeMin);
            else if (i === 6) return clip(this.handPoseAnalyzer.handRefY / -this.rangeMax - this.rangeMin);
            else if (i === 7) return clip(this.handPoseAnalyzer.handRefX /  this.rangeMax - this.rangeMin);
            else if (i === 8) return clip(this.handPoseAnalyzer.handRefX / -this.rangeMax - this.rangeMin);
            else return 0;
        }
    }

    getEffectWetness(nEffects, i) {
        if (i < 5) {
            return (this.handPoseAnalyzer.fingerIsExtended[i]) ? this.handPoseAnalyzer.handLength : 0;
        } else {
            if      (i === 5) return clip(this.handPoseAnalyzer.handRefY /  this.rangeMax - this.rangeMin);
            else if (i === 6) return clip(this.handPoseAnalyzer.handRefY / -this.rangeMax - this.rangeMin);
            else if (i === 7) return clip(this.handPoseAnalyzer.handRefX /  this.rangeMax - this.rangeMin);
            else if (i === 8) return clip(this.handPoseAnalyzer.handRefX / -this.rangeMax - this.rangeMin);
            else return 0;
        }
    }

    getLowpassValue() {
        if (this.handPoseAnalyzer.handAngle > 90) {
            return 0.;
        } else {
            return clip((90 - this.handPoseAnalyzer.handAngle) / 30, 0.01);
        }
    }

    getHighpassValue() {
        if (this.handPoseAnalyzer.handAngle > 90 && this.handPoseAnalyzer.handAngle < 180) {
            return clip((this.handPoseAnalyzer.handAngle - 90) / 30, 0.01);
        } else {
            return 0.;
        }
    }
}