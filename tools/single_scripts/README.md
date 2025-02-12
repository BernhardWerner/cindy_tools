# Single Scripts

These are simple standalone scripts. The .cjs files should be imported into a CindyJS project via
```JavaScript
var cindy = CindyJS({
  canvasname:"CSCanvas",
  scripts:"cs*",
  import: {
    "init": ["path/to/script.cjs"]
  }
});
```

## Camera

This is a simple camera controller to do 3D visualisations without the Cindy3D plugin. (Which is very good, but sometimes clunky to work with as it needs its own canvas to draw on.) All functions here assume that you pass a camera object of the form
```JavaScript
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
```JavaScript
screenWidth = 1920 / screenresolution();
screenCenter = [0, 0];
```
It is very much encouraged to override them for your use case.

## Color

Functions to translate between various colour spaces and representation as well as functions to interpolate/blend within these spaces. Most if not all things here are informed by Björn Ottosson's articles. The best starting point for these topics: [https://bottosson.github.io/posts/oklab/](https://bottosson.github.io/posts/oklab/)

## Corvis

A shorter, leaner, more focussed version of Egdod, see below.

## Egdod

My legacy über-library. I'm slowly chipping away at it to seprate its code into more meaningful chunks. These are exactly the single scripts and package found in this repository. This script only exists for reference.

## SVG-to-Cindy

A small Ruby script that extracts paths points from SVGs. Call it by running
```Bash
ruby svg2cindy.rb --file <path_to_svg>
```
in a terminal. The output is a nested array of Bézier splines, the Bézier curves they are composed of and individual points. Can be preprocessed, for example via 
```apply(listOfSplines, sampleBezierSpline(#, subSampling, strokeResolution))```
and then be animated or used in any other way. (Where `sampleBezierSpline` is part of the animation package.)

Note that the output is a .cjs file. So, you would load it just as any other CindyScript library. Moreover, the output file as well as the array stored in it get the name of the input SVG.

For emphasis: CindyJS can render SVGs directly via `drawimage`. This script is only useful if you want to subsample individual paths of an SVG for animations or similar. For example, like here: [https://www.youtube.com/watch?v=fW_Df8bytIU&t=37s](https://www.youtube.com/watch?v=fW_Df8bytIU&t=37s)
