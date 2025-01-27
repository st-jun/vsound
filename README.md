# VSound

A demo application that allows you to control a simple synthesizer setup through the movement of your hands. Just like this guy!
While there is no full orchestra at your disposal, you get a synthesizer and a full effect chain with filters that you can go wild with.


![Whiplashhhh](https://media1.tenor.com/m/vahYKqfPzkgAAAAC/notsure500-drums.gif)

## Run
Simply host the files on a webserver, [third party resources](#third-party-resources) are loaded automatically.

## Controls
The controls are designed to be easily modifiable through the `Controller` class. The current layout is as follows:

|                 | Left hand                              | Right hand                   |
|-----------------|----------------------------------------|------------------------------|
| Translation (X) | Synthesizer mix (currently only one)   | Effect tone + wetness (5, 7) |
| Translation (Y) | Pitch                                  | Effect tone + wetness (6, 8) |
| Translation (Z) | Synthesizer Tone                       | Effect Wetness (0-4)         |
| Rotation (Z)    | Chord/Arpeggio speed                   | Low-/Highpass Filter         |
| Fingers         | Chord notes                            | Effect tones (1-4)           |
| Thumb           | Chord Type (major, minor, power)       | Effect tone (0)              |

## Planned
- [ ] Improve performance through webworkers
- [ ] Provide resource friendly version
- [ ] Softer synth + effect set
- [ ] Real patterns instead of chords/arpeggios
- [ ] YouTube integration

## Third party resources
- [MediaPipe](https://github.com/google-ai-edge/mediapipe) for hand pose detection
- [Tone.js](https://github.com/Tonejs/Tone.js) for the audio pipeline
- [Three.js](https://github.com/mrdoob/three.js) for drawing the 3D scene
- <a href="https://www.flaticon.com/free-icons/finger" title="finger icons">Finger icons created by Freepik - Flaticon</a>