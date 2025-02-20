# VSound

A demo application that allows you to control a simple synthesizer setup by tracking the movement of your hands through your webcam.
While there is no full orchestra at your disposal, you get a synthesizer and a full effect chain with filters that you can go wild with.


![ezgif-6bdf9fd986c96](https://github.com/user-attachments/assets/79c82ec4-6c96-46b8-bbd1-682db4b4d742)


## Prerequisites
- Webcam
- Speakers/Headphones
- A somewhat decent graphics card (GTX 1080 Ti +)
- A Chromium-like browser is recommended

## Run
There is a hosted version at https://st-jun.github.io/vsound/.

You can also host the app yourself by simply publishing the files on a webserver, [third party resources](#third-party-resources) are loaded automatically.


If for some reason you can not access the hosted version, you can watch example videos for the 2D and 3D version here:

https://github.com/user-attachments/assets/a740179e-a539-4e18-945f-304277f3ce38

https://github.com/user-attachments/assets/473120d1-5f1d-43bf-b43e-851736a59f17





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
- [x] Improve performance
- [x] Provide resource friendly version
- [x] Reduce popping and crackling
- [ ] Softer synth + effect set
- [ ] Real patterns instead of chords/arpeggios
- [ ] YouTube integration

## Third party resources
- [MediaPipe](https://github.com/google-ai-edge/mediapipe) for hand pose detection
- [Tone.js](https://github.com/Tonejs/Tone.js) for the audio pipeline
- [Three.js](https://github.com/mrdoob/three.js) for drawing the 3D scene
- [detect-gpu](https://github.com/pmndrs/detect-gpu) for assessing GPU capabilities
- <a href="https://www.flaticon.com/free-icons/finger" title="finger icons">Finger icons created by Freepik - Flaticon</a>





