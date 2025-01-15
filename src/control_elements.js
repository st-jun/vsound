

export function createGainSlider(description) {
  const newGain = new Tone.Gain(0.1)

  const newSlider = document.createElement('input');
  newSlider.type = 'range';
  newSlider.min = '0.';
  newSlider.max = '100';
  newSlider.value = newGain.gain.value * 100;
  newSlider.step = '0.1';

  const newDisplay = document.createElement('p');
  newDisplay.textContent = `${description}: ${newGain.gain.value}`;

  newSlider.addEventListener('input', () => {
    newGain.gain.value = Number(newSlider.value)  / 100.;
    newDisplay.textContent = `${description}: ${newGain.gain.value}`;
  });

  document.body.appendChild(newDisplay);
  document.body.appendChild(newSlider);

  return newGain;
}


export function createFrequencySlider(synthesizers) {
  let description = "Frequency";

  const newSlider = document.createElement('input');
  newSlider.type = 'range';
  newSlider.min = '-2400';
  newSlider.max = '2400';
  newSlider.value = synthesizers[0].get().detune;
  newSlider.step = '100';

  const newDisplay = document.createElement('p');
  newDisplay.textContent = `${description}: ${synthesizers[0].get().detune}`;

  for (let synth of synthesizers) {

    newSlider.addEventListener('input', () => {
      synth.set({detune: Number(newSlider.value)});
      newDisplay.textContent = `${description}: ${synthesizers[0].get().detune}`;
    });
  }

  document.body.appendChild(newDisplay);
  document.body.appendChild(newSlider);
}


export function createNoteCheckboxGroup(synthCollection) {
  for (let i = 0; i < 4; i++) {
    const newCheckbox = document.createElement('input');
    newCheckbox.type = 'checkbox';

    const newDisplay = document.createElement('p');
    newDisplay.textContent = `Note ${i}`;

    newCheckbox.addEventListener('change', () => {
      if (newCheckbox.checked) {
        synthCollection.addChordNote(i);
      } else {
        synthCollection.removeChordNote(i);
      }
    });

    document.body.appendChild(newDisplay);
    document.body.appendChild(newCheckbox);
  }
}


export function createChordSlider(synthCollection) {
  let description = "Chord";

  const newSlider = document.createElement('input');
  newSlider.type = 'range';
  newSlider.min = '0';
  newSlider.max = '2';
  newSlider.step = '1';
  newSlider.value = synthCollection.chordIndex;

  const newDisplay = document.createElement('p');
  newDisplay.textContent = `${description}: ${synthCollection.chordIndex}`;

  newSlider.addEventListener('input', () => {
    synthCollection.changeChord(newSlider.value);
    newDisplay.textContent = `${description}: ${synthCollection.chordIndex}`;
  });

  document.body.appendChild(newDisplay);
  document.body.appendChild(newSlider);
}


export function createEffectSlider(description, effectChain, effectIndex) {
  // control tone using a number between 0 and 1
  // specifics are done in the effectChain
  const toneSlider = document.createElement('input');
  toneSlider.type = 'range';
  toneSlider.min = '0.';
  toneSlider.max = '100';
  toneSlider.value = effectChain.effectGetter[effectIndex]() * 100;
  toneSlider.step = '0.1';

  const toneDisplay = document.createElement('p');
  toneDisplay.textContent = `${description} tone: ${effectChain.effectGetter[effectIndex]()}`;

  toneSlider.addEventListener('input', () => {
    effectChain.effectSetter[effectIndex](Number(toneSlider.value)  / 100.);
    toneDisplay.textContent = `${description} tone: ${effectChain.effectGetter[effectIndex]()}`;
  });

  document.body.appendChild(toneDisplay);
  document.body.appendChild(toneSlider);

  // control the contribution to the output signal
  const wetSlider = document.createElement('input');
  wetSlider.type = 'range';
  wetSlider.min = '0.';
  wetSlider.max = '100';
  wetSlider.value = effectChain.effects[effectIndex].wet.value * 100;
  wetSlider.step = '0.1';

  const wetDisplay = document.createElement('p');
  wetDisplay.textContent = `${description} wet: ${effectChain.effects[effectIndex].wet.value}`;

  wetSlider.addEventListener('input', () => {
    effectChain.effects[effectIndex].wet.value = Number(wetSlider.value)  / 100.;
    wetDisplay.textContent = `${description} wet: ${effectChain.effects[effectIndex].wet.value}`;
  });

  document.body.appendChild(wetDisplay);
  document.body.appendChild(wetSlider);
}