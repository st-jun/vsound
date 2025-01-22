
const controlElementsActivated = false;


export function createGainSlider(description, newGain) {
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

  if (controlElementsActivated) document.body.appendChild(newDisplay);
  if (controlElementsActivated) document.body.appendChild(newSlider);
}


export function createFrequencySlider(synthesizers, min, max, step) {
  let description = "Frequency";

  const newSlider = document.createElement('input');
  newSlider.type = 'range';
  newSlider.min = `${min}`;
  newSlider.max = `${max}`;
  newSlider.value = synthesizers[0].get().detune;
  newSlider.step = `${step}`;

  const newDisplay = document.createElement('p');
  newDisplay.textContent = `${description}: ${synthesizers[0].get().detune}`;

  for (let synth of synthesizers) {
    newSlider.addEventListener('input', () => {
      synth.set({detune: Number(newSlider.value)});
      newDisplay.textContent = `${description}: ${synthesizers[0].get().detune}`;
    });
  }

  if (controlElementsActivated) document.body.appendChild(newDisplay);
  if (controlElementsActivated) document.body.appendChild(newSlider);
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

    if (controlElementsActivated) document.body.appendChild(newDisplay);
    if (controlElementsActivated) document.body.appendChild(newCheckbox);
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
    synthCollection.setChord(newSlider.value);
    newDisplay.textContent = `${description}: ${synthCollection.chordIndex}`;
  });

  if (controlElementsActivated) document.body.appendChild(newDisplay);
  if (controlElementsActivated) document.body.appendChild(newSlider);
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

  if (controlElementsActivated) document.body.appendChild(toneDisplay);
  if (controlElementsActivated) document.body.appendChild(toneSlider);

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

  if (controlElementsActivated) document.body.appendChild(wetDisplay);
  if (controlElementsActivated) document.body.appendChild(wetSlider);
}