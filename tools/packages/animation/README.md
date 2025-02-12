# The animation package

## The general workflow

### Setting things up
Set up timing information for sequential animation tracks in `trackData`. The general pattern is
```
trackData = [
    duration1, pause1,
    // ...
    durationN, pauseN
];
```
You must have an even number of entries, i.e., end with a pause. Set `startDelay` to have a pause at the very start.

For every animation track, you get a progress variable `t1`, ..., `tN` that runs from 0 to 1 during its run.

Complex calculations go into the body of `calculation()`, draw commands go into `rendering()`.

### Basic animations
The basic command to animate is `lerp`. There are, broadly speaking, two cases to consider:
1. You want to change a variable `property` over time. Define it in `calculation()`, and write something like
   
    ```property = lerp(property, newValue, t1)```
   
    also in `calculation()`.
3. You are building a new value from fixed references. Define them outside of `calculation()`, and then write something like

    ```newProperty = lerp(referenceA, referenceB, t1)```

    inside.

If you are using `fragment` to preprocess *Nyka* maths strings, you have to call it inside a function called `delayedSetup()`.

If you need absolute time information:
- `now()` gives you the currently total time.
- `delta` gives you the duration of the last frame.
- `tracks_k.timeElapsed` gives you the absolute time elapsed in the `k`-th animation track.

Set `showDebugInfo = false;` to remove the debug information in the top left.

Set `currentTrackIndex = k;` to determine at which animation track to start.

### Exporting
 There are three render modes available. You can set `renderMode` to
1. `RENDERMODES.REAL`. This lets the animation run in real time from start to finish as is. It is mostly intended for development and debugging.
2. `RENDERMODES.FRAMES`. This will export the animation frame by frame at 60FPS after you double-click inside the canvas. This will download many(!) PNGs to your computer. Firefox seems to cause the fewest problems here. But in any case, it's better to export more short animation sequences. You can turn the PNGs into a video with, for example, \emph{FFmpeg} or \emph{DaVinci Resolve}.
3. `RENDERMODES.STEPS`. This will run in real time, too, but will pause the animation at the start of each track. Use it to embed animations into blog posts for readers to control, or to build presentation slides. It is also very handy for debugging. After clicking inside the canvas once, this mode can be controlled with the keyboard. The key 'D' will play the next animation track. With 'W', you can jump back one animation; and with 'S' you jump forward.












## Animation Commands & Functions
These are the functions and commands found in the libraries `animationBase` and `mainSetup` relevant to creating animations. The first is a stand-alone library that can be used to create custom animations and animation frameworks. The second is used to setup the full management suite. This second file has very few parts you will have to interact with, unless you want to remodel the package.

Relative reference points and sizes. `canvasCenter`, `canvasWidth`, `canvasHeight`, `canvasAnchors`

Linear interpolation between `x` and `y` where `t` is a percentage: `lerp(x, y, t)`

% Distance from `x` to `p` relative to distance from `x` to `y`: `inverseLerp(x, y, p)`

Linear interpolation between `x` and `y` relative to `t` where `t` is between `a` and `b`: `lerp(x, y, t, a, b)`

Limit `x` to the interval between `a` and `b`: `clamp(x, a, b)`

% Total time of current animation: `now()`

% Duration of last frame: `delta`

Easing function are all of the form `easeInOutCubic(t)`. See \url{https://easings.net/} for all of them.

The result moves from 0 to 1 while the progress `t` moves from `a` to `b`: `timeOffset(t, a, b)`

% "Random" value between 0 and 1 given a position: `randomValue(point)`

% 2D Perlin noise given a position: `perlinNoise2D(point)`

Samples a circular arc stroke: `sampleCircle(radius, startAngle, endAngle)`

% Samples a rectangle with rounded corners:\newline`roundedRectangleStroke(center, width, height, cornerRadius)`

Samples a Bézier curve: `sampleBezierCurve(listOfPoints)`

% Samples a cubic Bézier spline: `sampleBezierSpline(listOfPoints)`

% Samples a single Catmul-Rom curve: `sampleCatmulRomCurve(listOfPoints)`

% Samples a Catmul-Rom spline: `sampleCatmulRomSpline(listOfPoints)`

Samples a polygonal curve: `samplePolygonCurve(listOfPoints)`

Checks if a point is in a polygon: `pointInPolygon(point, listOfPoints)`

% Creates unit vector pointing in a given angle direction: `ang2vec(angle)`

Rotates a point around a centre: `rotate(point, angle, center)`

% Shuffles an array: `randomSort(array)`

% Chooses `k` elements from an array at random: `randomChoose(array, k)`

% Removes first element of an array: `bite(array)`

% Removes last element of an array : `pop(array)`


Splits a \emph{Nyka} maths string into individual glyphs: `fragment(nykaString, textSize)`

Returns number of glyphs in a fragmented \emph{Nyka} maths string: `fragmentLength(fragmentedString)`

Draws a fragmented \emph{Nyka} maths string over time `t` with a typewriter effect. `mode` can be `"up"` or `"down"`:
\newline`drawFragments(position, fragmentedString, t, mode, dictOfModifiers)`

\emph{Nyka} commands via examples:
\setlength\parindent{2em}

Shorthand for `\mathbb`, `\mathfrak`, `\mathscr` and `\mathcal`: `"$\bA$"`, `"$\fB$"`, `"$\sC$"`, `"$\cD$"`

Matrices and cases: `"$\bmatrix{1 & 2 & 3}{4 & 5 & 6}{7 & 8 & 9}$"`

Sums, products, and integrals. Must be followed by two square brackets or nothing:

\vspace{-0.8em}
`"$\sum[k\in\bN][] k$"`

Limits. Can be followed by square brackets: `"$\lim[x\to\infty] \frac{1}{x}$"`

Fractions must be followed by curly braces: `"$\frac{a}{b}$"`

Roots. Can be followed by square brackets. Must end with curly braces:

\vspace{-0.8em}
`"$\sqrt{2} \cdot \sqrt[3]{2}$"`
