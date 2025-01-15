

class Controller {
    constructor(synthCollection, effectChain, mainGain, handPoseAnalyzer) {
        this.synthCollection = synthCollection;
        this.effectChain = effectChain;
        this.mainGain = mainGain;
        this.handPoseAnalyzer = handPoseAnalyzer;
        this.handPoseAnalyzer.setAnalysisCallback(this.setParameters);
    }

    getMainGain() {
        return 0.1;
    }

    getInstrumentGain(nInstruments, i) {
        return undefined;
    }

    getNoteActive(nNotes, i) {
        return undefined;
    }

    getChordType(nChords) {
        return undefined;
    }

    getFrequency(nSteps) {
        return undefined;
    }

    getEffectTone(nEffects, i) {
        return undefined;
    }

    getEffectWetness(nEffects, i) {
        return undefined;
    }

    setParameters = () => {
        for (let i = 0; i < this.synthCollection.currentChord.length; i++) {
            if (this.getNoteActive(this.synthCollection.currentChord.length, i)) {
                this.synthCollection.addChordNote(i);
            } else{
                this.synthCollection.removeChordNote(i);
            }
        }
    }
}

export class InstrumentController extends Controller {
    getNoteActive(nNotes, i) {
        return this.handPoseAnalyzer.fingerIsExtended[i+1];
    }
}