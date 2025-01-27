# VSound

A demo application that allows you to control a simple synthesizer setup by tracking the movement of your hands through your webcam.
While there is no full orchestra at your disposal, you get a synthesizer and a full effect chain with filters that you can go wild with.


![Whiplashhhh](https://media1.tenor.com/m/daLmQ9PQmDsAAAAC/whiplash-drums.gif)


## Prerequisites
- Webcam
- Speakers/Headphones
- A somewhat decent graphics card (GTX 1080 Ti +)
- A Chromium-like browser is recommended

## Run
There is a hosted version at https://st-jun.github.io/vsound/.

If you want to host it yourself, simply publish the files on a webserver, [third party resources](#third-party-resources) are loaded automatically.


If for some reason you can not access the hosted version, you can watch an example video here:

https://github.com/user-attachments/assets/02afdb65-b9c1-4ecb-84fe-067e2f3e4469


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

```
  y 
  | z
  |/
  +--- x
```

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
- [detect-gpu](https://github.com/pmndrs/detect-gpu) for assessing GPU capabilities
- <a href="https://www.flaticon.com/free-icons/finger" title="finger icons">Finger icons created by Freepik - Flaticon</a>





