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
You must have an even number of entries, i.e., end with a pause. Set `startDelay` to have a pause at the very start. By default, this setup will create animation tracks that run in sequence. If you want overlapping animations, there are two main cases:
- For very simple overlaps, you can set the appropriate pauses to be negative. Just make sure that the track that ends last is also last in the list to ensure that the following tracks are handled correctly.
- If you want tightly linked animations to be slightly offset -- e.g. when drawing grid lines -- use the function `timeOffset` to create this effect within a single track that covers the whole animation.

For every animation track, you get a progress variable `t1`, ..., `tN` that runs from 0 to 1 during its run.

Complex calculations go into the body of `calculation()`. Draw commands go into `rendering()`. Very special configurations go into `delayedSetup()`. At the moment, there are two cases where you might need to use this function:
- If you are using `fragment` to preprocess *Nyka* maths strings, you have to call it inside `delayedSetup()`. The function requires precise font information from the *KaTeX* plugin which is only guaranteed to be fully loaded before `delayedSetup()` is called. (But not before the init script is executed.) If you call `fragment` outside of `delayedSetup()`, you only get the correct number of glyphs, but they will not be positioned correctly.
- You want to make an animation track loop. Set `tracks_k.looping = true;` in `delayedSetup()` to make the `k`-th animation track loop.

With that, the full boilerplate code for an animation that goes in to the init script looks like this
```
startDelay = 0.5;
trackData = [
    1, 0.5,    //  01   track 1 is doing x
    1, 0.5,    //  02   track 2 is doing y
    1, 0.5     //  03   track 3 is doing z
];

delayedSetup := ();
calculation := ();
rendering := ();
```


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
- `now()` gives you the current total time.
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
These are the functions and commands found in the libraries `animationBase` and `mainSetup` relevant to creating animations. The first is a stand-alone library that can be used to create custom animations and animation frameworks. The second one is used to setup the full management suite of this package and uses many of the functions found in `animationBase`. It has very few parts you will have to interact with, unless you want to remodel the package.

There are more functions in both libraries than listed here, but those are for backend purposes and would only ever be interesting for hyper-specific use cases.

Unless explicitly mentioned, all distances and sizes are in Cindy units.

### Functions & Commands of `animationBase`

---
#### `ang2vec(alpha)`
Converts an angle `alpha` in degrees to a unit vector pointing in that direction. Just sytanctic sugar for the expression `[cos(alpha), sin(alpha)]`.

---
#### `animatePolygon(vertices, t)`
This function interprets the list of vertices as a polygonal curve that is parametrized by the interval $[0,1]$. It assumes that `t` is in this interval, and returns the point on the curve at this parameter value, together with all vertices up to that points.

Use it to animate a polygonal curve via `connect(animatePoylgon(vertices, t));` with `t` being the progress variable of an animation track. This is preferable to `samplePolygon` if the polygon itself doesn't drastically change because this function outputs much fewer points.

---
#### `arrowTip(tipPos, dir, size)`
Creates an equilateral triangle at `tipPos` with the tip pointing in the direction `dir` (does not has to be normalized in advance) and a size of `size`. Feed the result into `connect(list)` or `fillpoly(list)` to draw arrow tips. The cleaner way to draw arrows is to set the modifier `arrow` in the appropriate `draw` command to true and maybe animate the size via the modifier `arrowsize`. But for some special use cases this function here might be useful.

---
#### `bezier(controls, t)`
Calculates the point on the Bezier curve defined by the control points `controls` at the parameter value `t`, assuming the latter is in the interval $[0,1]$.

---
#### `bite(list, i)`
Removes the first `i` elements from `list` and returns the shortened array.

---
#### `bite(list)`
Removes the first element from `list` and returns the shortened array.

---
#### `canvasAnchors`
An array of anchor points around the border of the canvas. They are index in the order indicated by a standard number pad on a computer keyboard. I.e. entry 1 is the bottom-left corner, entry 6 is the centre of the right edge of the canvas. Etc.

---
#### `canvasBottom`
The y-coordinate of the bottom edge of the canvas.

---
#### `canvasCenter`
The centre of the canvas. Identical to `canvasAnchors_5`.

---
#### `canvasHeight`
The height of the canvas.

---
#### `canvasLeft`
The x-coordinate of the left edge of the canvas.

---
#### `canvasPoly`
An array of the four corners of the canvas. Ordered top-left, top-right, bottom-right, bottom-left. Basically a version of `screenbounds()` with dehomogenized coordinates.

---
#### `canvasRight`
The x-coordinate of the right edge of the canvas.

---
#### `canvasTop`
The y-coordinate of the top edge of the canvas.

---
#### `canvasWidth`
The width of the canvas.

---
#### `catmullRom(controls, alpha, t)`
Calculates the point on the Catmull-Rom curve defined by the four control points `controls` at the parameter value `t`, assuming the latter is in the interval $[0,1]$. The parameter `alpha` determines the knot parametrization. 


---
#### `deltaTime()`
Calculates the time elapsed since the last frame. Call it in the tick script if you use `animationBase` on its own and use its result for custom time-dependent calculations.

---
#### `drawFragments(pos, fragmentedString, time, mode, modifs) `
Draws a fragmented *Nyka* maths string `fragmentedString` (the output of `fragment`) at position `pos` with progress `t` in a typewriter-like effect. At the moment, there are two values for `mode`:
- `"up"` will let the glyphs appear from the bottom.
- `"down"` will let the glyphs appear from the top.
- Any other value will let the glyphs simply appear at the righttime at the right position. Since `mode` is necessary, I propose to set it to `"none"` to make this case clear.
Lastly, `modifs` is a dictionary that allows you to set the usual modifiers for drawing text like colour, opacity, outline width and outline colour. (Size and font family are stored in the fragmented string.) Moreover, you can set the keys `"colorMap"` and `"alphaMap"`

---
#### Easing function
These functions are used to create more dynamic transitions between values. Use the progress variable of an animation track as their input. Cf. https://easings.net/ for details. The full list of easing functions in this package is:

```
easeInSine
easeOutSine
easeInOutSine
easeInQuad
easeOutQuad
easeInOutQuad
easeInCubic
easeOutCubic
easeInOutCubic
easeInQuart
easeOutQuart
easeInOutQuart
easeInQuint
easeOutQuint
easeInOutQuint
easeInExpo
easeOutExpo
easeInOutExpo
easeInCirc
easeOutCirc
easeInOutCirc
easeInBack
easeOutBack
easeInOutBack
easeInElastic
easeOutElastic
easeInOutElastic
```

---
#### `eerp(x, y, t)`
Exponentially interpolates between `x` and `y` at the parameter value `t`. The value `t` is allowed to be outside the interval $[0,1]$.


--- 
#### `END`
The number 1. If you are testing parts of your animation and you want to set some progress to always be 1, use this constant to make it easier to see and later on change where you did this.

---
#### `fragment(string, size, family)`
Fragments a string containing *Nyka* maths commands into individual glyphs, based on font size `size` and font family `family`. Make sure to call this function inside `delayedSetup()` to preprocess these strings if you want to draw them on screen at the correct position.

---
#### `fragment(string, size)`
Fragments a string containing *Nyka* maths commands into individual glyphs, based on font size `size` using the default font family. Make sure to call this function inside `delayedSetup()` to preprocess these strings if you want to draw them on screen at the correct position.

---
#### `fragmentLength(fragmentedString)`
Calculates the number of glyphs in a fragmented *Nyka* maths string. Only useful to call on the output of `fragment`.

---
#### `inverseEerp(x, y, p)`
Calculates the parameter value `t` at which the exponential interpolation between `x` and `y` equals `p`. In other words, it calculates the growth rate from `x` to `p` relative to the growth rate from `x` to `y`. The result is set to 0.5 when `x` and `y` are equal.

---
#### `inverseLerp(x, y, p)`
Calculates the parameter value `t` at which the linear interpolation between `x` and `y` equals `p`. In other words, it calculates the distance from `p` to `x` relative to the distance from `y` to `x`. The result is set to 0.5 when `x` and `y` are equal.

---
#### `inverseSlerp(u, v, w)`
Calculates the parameter value `t` at which the spherical interpolation between the vectors `u` and `v` equals `w`. In other words, it calculates the angle between `w` and `u` relative to the angle between `v` and `u`. The vectors are assumed to be normalized.

---
#### `lerp(x, y, t)`
Linearly interpolates between `x` and `y` at the parameter value `t`. The value `t` is allowed to be outside the interval $[0,1]$ to give the full affine combination of `x` and `y`.

---
#### `lerp(x, y, t, a, b)`
Linearly interpolates between `x` and `y` at the parameter value `t` with the latter being in the interval $[a,b]$. In other words, it reparametrizes the interval $[a, b]$ to $[x, y]$.

---
#### `now()`
The total time elapsed since the start of the animation.

---
#### `pop(list, i)`
Removes the last `i` elements from `list` and returns the shortened array.

---
#### `pop(list)`
Removes the last element from `list` and returns the shortened array.

---
#### `randomChoose(list, k)`
Chooses `k` elements from `list` at random and returns them as a new array.

---
#### `randomChoose(list)`
Chooses one element from `list` at random.

---
#### `randomSort(list)`
Shuffles the elements of `list` randomly.

---
#### `roundedRectangleStroke(center, w, h, cornerRadius)`
Creates a list of `strokeSampleRate`-many points that form a rectangle with rounded corners with centre `center`, width `w`, height `h`, and corner radius `cornerRadius`. The stroke starts on the left end of the top edge and goes counter-clockwise.

---
#### `sampleCatmullRomCurve(controls, alpha)`
Creates `strokeSampleRate`-many points on the Catmull-Rom curve defined by the four control points `controls`. The parameter `alpha` determines the knot parametrization.

---
#### `sampleCatmullRomCurve(controls)`
Creates `strokeSampleRate`-many points on the centripetal Catmull-Rom curve (knot parametrization of 0.5) defined by the four control points `controls`.

### `sampleCatmullRomSpline(points, modifs)`
Creates points on the Catmull-Rom spline defined by the points in `points`. The parameter `modifs` is a dictionary that allows you to set the knot parametrization with the key `alpha` and the number of points to sample with the key `nop`. The default values are `alpha = 0.5` and `nop = strokeSampleRate`.

### `sampleCatmullRomSpline(points)`
Creates `strokeSampleRate`-many points on the centripetal Catmull-Rom spline (knot parametrization of 0.5) defined by the points in `points`.


---
#### `sampleCircle(rad, angle)`
Creates `strokeSampleRate`-many points on a circle with radius `rad`, starting on the right side and going counter-clockwise for an angle of `angle`.

---
#### `sampleCircle(rad, startAngle, endAngle)`
Creates `strokeSampleRate`-many points on a circle with radius `rad`, starting at `startAngle` and ending at `endAngle`.

---
#### `sampleCircle(rad)`
Creates `strokeSampleRate`-many points on a circle with radius `rad`, starting on the right.

---
#### `samplePolygon(poly, nop)`
Creates `nop`-many points on a polygonal curve given by the points in `poly`. The original points are included in the output, and the rest are spread as evenly as possible along the curve.

---
#### `samplePolygon(poly)`
Creates `strokeSampleRate`-many points on a polygonal curve given by the points in `poly`. The original points are included in the output, and the rest are spread as evenly as possible along the curve. 

---
#### `screenMouse()`
The coordinates of the mouse cursor normalized to the canvas such that they both lie in the interval $[0,1]$.

---
#### `setupAnimationTrack(s, e)`
Sets up one animation track based on its start time `s` and its end time `e`. Mostly only interesting if you are using `animationBase` on its own. But it can also be useful to create animations completely independent of the main setup provided via `trackData`.


---
#### `setupMultiAnimationTracks(times)`
Given time information of the form `times = [startPause, duration 1, endPause 1, duration 2, endPause 2, ...]`, this will create multiple animation tracks that run in sequence.

There is basically no reason to call this yourself. But! You can override it to accomodate for your own timing setup. I.e. when you don't like the way durations and pauses are listed in `trackData`, reimplement this function to your liking. The return value must be an array of animation tracks, though.

---
#### `setupTime()`
Sets up the basic time keeping system. Call it together with `playanimation()` in the init script if you use `animationBase` on its own.

---
#### `sign(x)`
Returns the sign of `x`.

---
#### `slerp(u, v, t)`
Spherical interpolation between the vectors `u` and `v` at the parameter value `t`. The vectors are assumed to be normalized. Is equivalent to `ang2vec(lerp(alpha, beta, t))` for appropriate angles `alpha` and `beta`.

---
#### `smoothStep(x)`
The polynomial 3x^2 - 2x^3. The function assumes that `x` is betwenn 0 and 1 and smoothly transitions from 0 to 1 as `x` grows.

---
#### `smoothStep(x, a, b)`
The function is 0 if `x` is smaller than `a` and 1 if `x` is larger than `b`. It transitions smoothly between `a` and `b` via an appropriate cubic polynomial.


---
#### `START`
The number 0. If you are testing parts of your animation and you want to set some progress to always be 0, use this constant to make it easier to see and later on change where you did this.

---
#### `stepSignal(t, a, b, c, d)`
Returns 0 if `t` is smaller than `a` or larger than `d`. Returns 1 if `t` is between `b` and `c`. Transitions linearly when `t` is between `a` and `b` or between `c` and `d`.

---
#### `strokeSampleRate`
Global constant that is used as a default value for sampling various curves like circles or Bezier curves.

---
#### `timeOffset(t, a, b)`
Reparametrizes the interval $[0,1]$ to the interval $[a,b]$, but assumes that `t` is strictly between 0 and 1. In other words, for values $0\leq a < b \leq 1$, this returns 0 if `t` is below `a` and 1 if `t` is above `b`. In between, it linearly interpolates from 0 to 1.

The main use is to slightly offset movements within the same animation track. Cf. the example `animations/coordinate_grid.html` in the examples folder where gridlines are drawn with such a time offset from one another.

---
#### `triangleSignal(t, a, b)`
Returns 0 if `t` is smaller than `a` or larger than `b`. Between `a` and `b`, it rises linearly from 0 to 1 and then falls linearly back to 0.

---
#### `triangleSignal(t)`
Returns 0 if `t` is smaller than 0 or larger than 1. Between 0 and 1, it rises linearly from 0 to 1 and then falls linearly back to 0.

---
#### `tween(obj, prop, target, time)`
Syntactic sugar for lerping properties of objects. For example, if you define

```
    circle = {
        center: [0, 0],
        radius: 1
    };
```
inside of `calculation()`, you can write

```tween(circle, "radius", 2, t1);```

to animate the radius of the circle instead of

```circle.radius = lerp(circle.radius, 2, t1);```

---
#### `updateAnimationTrack(track)`
Updates the progress and all other variables of the animation track `track` based on the current total time. Mostly only interesting if you are using `animationBase` on its own.



















### Functions & Commands of `mainSetup`



### The *Nyka* typesetting language

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
