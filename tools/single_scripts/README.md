# Single Scripts

These are simple standalone scripts. The .cjs files should be imported into a CindyJS project via
```
var cindy = CindyJS({
  canvasname:"CSCanvas",
  scripts:"cs*",
  import: {
    "init": ["path/to/script.cjs"]
  }
});

```

## Camera

This is a simple camera controller to do 3D visualisations without the Cindy3D plugin. (Which is very good, but sometimes clunky to work with as it needs its own canvas to draw on.) All functions here assume that pass a camera object of the form
```
cam = {
    "rad": 60,
    "azimuth": 32°,
    "polar": 51°,
    "lookAt": [0,0,0],
    "up": [0, 0, 1],
    "fov": 60°,
    "anchor": [0,0,0],

    "position": [0,0,0],
    "basis": zeroMatrix(3, 3);
};
```
Please call `updateCamera(cam)` when you define it and whenever you change position in order to update its position and basis (i.e. local coordinate system).

Main use case will be to call `projectToScreen(point, cam)` to transform from 3D to 2D coordinates. This and other functions use the placeholder variables
```
screenWidth = 1920 / screenresolution();
screenCenter = [0, 0];
```
It is very much encouraged to override them for your use case.

## Color

Functions to translate between various colour spaces and representation as well as functions to interpolate/blend within these spaces. Most if not all things here are informed by Björn Ottosson's articles. The best starting point: [https://bottosson.github.io/posts/oklab/](https://bottosson.github.io/posts/oklab/)

## Egdod

My legacy über-library. I'm slowly chipping away at it to seprate its code into more meaningful chunks. These are exactly the single scripts and package found in this repository. This script only exists for reference.

## SVG-to-Cindy

A small Ruby script that extracts paths points from SVGs. The output is a nested array of Bézier splines, the Bézier curvesthey are composed of and individual points. Can be preprocessed, for example via `apply(listOfSplines, sampleBezierSpline(#, subSampling, strokeResolution))`, and then be animated. (`sampleBezierSpline` is part of the animation package.)