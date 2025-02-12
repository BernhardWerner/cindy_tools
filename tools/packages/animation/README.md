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

Unless explicitly mentioned, all distances and sizes are in Cindy units.

### `animationBase`

#### `arrowTip(tipPos, dir, size)`
Creates an equilateral triangle at `tipPos` with the tip pointing in the direction `dir` (does not has to be normalized in advance) and a size of `size`. Feed the result into `connect(list)` or `fillpoly(list)` to draw arrow tips.

#### `canvasAnchors`
An array of anchor points around the border of the canvas. They are index in the order indicated by a standard number pad on a computer keyboard. I.e. entry 1 is the bottom-left corner, entry 6 is the centre of the right edge of the canvas. Etc.

#### `canvasBottom`
The coordinate of the bottom edge of the canvas.

#### `canvasCenter`
The centre of the canvas. Identical to `canvasAnchors_5`.

#### `canvasHeight`
The height of the canvas.

#### `canvasLeft`
The coordinate of the left edge of the canvas.

#### `canvasPoly`
An array of the four corners of the canvas. Order top-left, top-right, bottom-right, bottom-left. Basically a version of `screenbounds()` with dehomogenized coordinates.

#### `canvasRight`
The coordinate of the right edge of the canvas.

#### `canvasTop`
The coordinate of the top edge of the canvas.

#### `canvasWidth`
The width of the canvas.

#### `roundedRectangleStroke(center, w, h, cornerRadius)`
Creates a list of `strokeSampleRate`-many points that form a rounded rectangle with centre `center`, width `w`, height `h`, and corner radius `cornerRadius`. The stroke starts on the left of the top edge and goes counter-clockwise.

#### `sampleCircle(rad, angle)`
Creates `strokeSampleRate`-many points on a circle with radius `rad`, starting on the right side and going counter-clockwise for an angle of `angle`.

#### `sampleCircle(rad, startAngle, endAngle)`
Creates `strokeSampleRate`-many points on a circle with radius `rad`, starting at `startAngle` and ending at `endAngle`.

#### `sampleCircle(rad)`
Creates `strokeSampleRate`-many points on a circle with radius `rad`, starting on the right.

#### `screenMouse()`
The coordinates of the mouse cursor normalized to the canvas such that they boh lie in the interval $[0,1]$.

#### `strokeSampleRate`
Global constant that is used as a default value for sampling various curves like circles or Bezier curves.





















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


### 'mainSetup'
##
