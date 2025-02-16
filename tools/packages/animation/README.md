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

### The debug view
By default, you will see debug information in the top left corner of the canvas -- like the current animation track, its progress, the current total time and the FPS. You can turn it off by setting `showDebugInfo = false;`. You can customize its position and color by setting `debugInfoPosition` and `debugInfoColor`, respectively.


### Exporting
 There are three render modes available. You can set `renderMode` to
1. `RENDERMODES.REAL`. This lets the animation run in real time from start to finish as is. It is mostly intended for development and debugging.
2. `RENDERMODES.FRAMES`. This will export the animation frame by frame at 60FPS after you double-click inside the canvas. This will download many(!) PNGs to your computer. Firefox seems to cause the fewest problems here. But in any case, it's better to export more short animation sequences. You can turn the PNGs into a video with, for example, *FFmpeg* or *DaVinci Resolve*.
3. `RENDERMODES.STEPS`. This will run in real time, too, but will pause the animation at the start of each track. Use it to embed animations into blog posts for readers to control, or to build presentation slides. It's very cool to combine this with *Reveal.js* to make presentations. It is also very handy for debugging. After clicking inside the canvas once, this mode can be controlled with the keyboard. The key 'D' will play the next animation track. With 'W', you can jump back one animation; and with 'S' you jump forward.


### Customization
Apart from the things already mentioned above, there are a few more things you can customize:

#### In general
Set `currentTrackIndex = k;` to start the animation at track `k`. Great for debugging/development; but also handy when you want to export frames starting at a specific track. This variable is also used in the backend to keep track of the current animation track. Therefore, you should only set it once in the init script.

You can change the global speed of the animation by setting `timeScale` to something different than 1.

#### During `RENDERMODE.FRAMES`
You can set the variable `disableFrameDownload` to `true` to run through the whole frame-by-frame exporting process without actually downloading the PNGs. This is useful to check that the fixed-FPS rendering produces the same result as the real-time rendering -- especially if there are heavy calculations involved.

You can specify the frames you want to export by listing them in the array `framesToExport`. If you set it to `0`, all frames will be exported.

If you look into `mainSetup.cjs`, it looks as if you can specify the output format of the frames -- PNG, SVG or PDF. But this is only a placeholder. At the moment, only the PNG export works in *CindyJS*.

#### During `RENDERMODE.STEPS`
As explained above, you can control the steps animation with the keyboard. Override the variables
```
STEPFORWARDS = "D";
SKIPFORWARDS = "W";
SKIPBACKWARDS = "S";
```
to create your own key bindings.

Moreover, you can set `stepMode`. By default it is `STEPMODES.KEYBOARD` and does work as described. Set it to `STEPMODES.MANUAL` and you can implement your own custom controller. Call the function `moveStepForwards()`, `skipStepForwards()` and `skipStepBackwards()` during appropriate mouse or keyboard events to achieve the same effect as the default key bindings.









## Animation Commands & Functions
These are the functions and commands found in `animationBase` relevant to creating animations. It is a stand-alone library that can be used to create custom animations and animation frameworks. There are more functions than listed here, but those are for backend purposes and would only ever be interesting for hyper-specific use cases.

Unless explicitly mentioned, all distances and sizes are in Cindy units.


### `ang2vec(alpha)`
Converts an angle `alpha` in degrees to a unit vector pointing in that direction. Just sytanctic sugar for the expression `[cos(alpha), sin(alpha)]`.

---
### `animatePolygon(vertices, t)`
This function interprets the list of vertices as a polygonal curve that is parametrized by the interval $[0,1]$. It assumes that `t` is in this interval, and returns the point on the curve at this parameter value, together with all vertices up to that points.

Use it to animate a polygonal curve via `connect(animatePoylgon(vertices, t));` with `t` being the progress variable of an animation track. This is preferable to `samplePolygon` if the polygon itself doesn't drastically change because this function outputs much fewer points.

---
### `arrowTip(tipPos, dir, size)`
Creates an equilateral triangle at `tipPos` with the tip pointing in the direction `dir` (does not has to be normalized in advance) and a size of `size`. Feed the result into `connect(list)` or `fillpoly(list)` to draw arrow tips. The cleaner way to draw arrows is to set the modifier `arrow` in the appropriate `draw` command to true and maybe animate the size via the modifier `arrowsize`. But for some special use cases this function here might be useful.

---
### `bezier(controls, t)`
Calculates the point on the Bezier curve defined by the control points `controls` at the parameter value `t`, assuming the latter is in the interval $[0,1]$.

---
### `bite(list, i)`
Removes the first `i` elements from `list` and returns the shortened array.


### `bite(list)`
Removes the first element from `list` and returns the shortened array.

---
### `canvasAnchors`
An array of anchor points around the border of the canvas. They are index in the order indicated by a standard number pad on a computer keyboard. I.e. entry 1 is the bottom-left corner, entry 6 is the centre of the right edge of the canvas. Etc.

---
### `canvasBottom`
The y-coordinate of the bottom edge of the canvas.

---
### `canvasCenter`
The centre of the canvas. Identical to `canvasAnchors_5`.

---
### `canvasHeight`
The height of the canvas.

---
### `canvasLeft`
The x-coordinate of the left edge of the canvas.

---
### `canvasPoly`
An array of the four corners of the canvas. Ordered top-left, top-right, bottom-right, bottom-left. Basically a version of `screenbounds()` with dehomogenized coordinates.

---
### `canvasRight`
The x-coordinate of the right edge of the canvas.

---
### `canvasTop`
The y-coordinate of the top edge of the canvas.

---
### `canvasWidth`
The width of the canvas.

---
### `catmullRom(controls, alpha, t)`
Calculates the point on the Catmull-Rom curve defined by the four control points `controls` at the parameter value `t`, assuming the latter is in the interval $[0,1]$. The parameter `alpha` determines the knot parametrization. 


---
### `deltaTime()`
Calculates the time elapsed since the last frame. Call it every frame in the *tick* script if you use `animationBase` on its own and use its result for custom time-dependent calculations. If you use the full package, this function is automatically called and its result is stored in the variable `delta`.

---
### `drawFragments(pos, fragmentedString, time, mode, modifs) `
Draws a fragmented *Nyka* maths string `fragmentedString` (the output of `fragment`) at position `pos` with progress `t` in a typewriter-like effect. At the moment, there are two values for `mode`:

- `"up"` will let the glyphs appear from the bottom.
- `"down"` will let the glyphs appear from the top.
- Any other value will let the glyphs simply appear at the righttime at the right position. Since `mode` is necessary, I propose to set it to `"none"` to make this case clear.

Lastly, `modifs` is a dictionary that allows you to set the usual modifiers for drawing text like colour, opacity, outline width and outline colour. (Size and font family are stored in the fragmented string.) Moreover, you can set the keys `"colorMap"` and `"alphaMap"`. They allow you set individual glyphs to a particular colour or alpha value. Use them, for example, to highlight a part of a maths formula. They work by specifying a list of indices that represent the appropriate glyphs and the corresponding values. For example, say you want to draw the string

```
    fragmentedString = fragment("a + b = c", 30);
```

and you want to highlight the `b` and `c` in red. The you would write

```
    drawFragments([0, 0], fragmentedString, t, "none", {
        "colorMap": [
            [[3, 5], [1, 0, 0]]
        ]
    });
```
as they are the third and fifth glyph in the string. You can reference the same glyph multiple times. For example, in the same string as above, if you want to make the `a + b` red during the first animation track and then turn the `b` blue in the second track, you would write

```
    drawFragments([0, 0], fragmentedString, t, "none", {
        "colorMap": [
            [[1, 2, 3], lerp([0, 0, 0], [1, 0, 0], t1)],
            [[4], lerp([1, 0, 0], [0, 0, 1], t2)]
        ]
    });
```
Clunky, but it gets the job done.

### `drawFragments(pos, fragmentedString, time, mode)`
Draws a fragmented *Nyka* maths string `fragmentedString` (the output of `fragment`) at position `pos` with progress `t` in a typewriter-like effect. At the moment, there are two values for `mode`:
- `"up"` will let the glyphs appear from the bottom.
- `"down"` will let the glyphs appear from the top.
- Any other value will let the glyphs simply appear at the righttime at the right position. Since `mode` is necessary, I propose to set it to `"none"` to make this case clear.

---
### Easing functions
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
### `eerp(x, y, t)`
Exponentially interpolates between `x` and `y` at the parameter value `t`. The value `t` is allowed to be outside the interval $[0,1]$.


--- 
### `END`
The number 1. If you are testing parts of your animation and you want to set some progress to always be 1, use this constant to make it easier to see and later on change where you did this.

---
### `expandRect(pos, w, h, a)`
Calculates the four corners of a rectangle -- ordered counter-clockwise starting in the bottom-left -- at position `pos` with width `w` and height `h`. The parameter `a` determines the anchor point around the border of the rectangle which is used for `pos`. The anchor points are numbered in the order of a standard number pad on a computer keyboard. I.e. 1 is the bottom-left corner, 5 is the centre, etc.

### `expandRect(pos, w, h)`
Calculates the four corners of a rectangle -- ordered counter-clockwise starting in the bottom-left -- with bottom-left corner `pos`, width `w` and height `h`.

### `expandRect(rect)`
Calculates the four corners of a rectangle -- ordered counter-clockwise starting in the bottom-left. The rectangle `rect` must be an object with properties `position`, `width`, `height` and `anchor`.

---
### `findIn(list, x)`
Returns the index of the first occurrence of the value `x` in the array `list`. Returns 0 if `x` is not in `list`.

---
### `findMatchingBracket(string, startIndex, bracketA, bracketB)`
Finds the index of the matching bracket of `bracketA` in the string `string` starting at index `startIndex`. The bracket `bracketB` is used to determine the matching bracket. Returns 0 if no matching bracket is found. The bracket symbols can be anything you want to pair up in a string.

This is heavily used in *Nyka* maths string processing.  But very occasionally, it might be useful for other purposes.

---
### `fract(x)`
The fractional part of `x`. I.e. the digits after the decimal point. Syntactic sugar for `mod(x, 1)`.

---
### `fragment(string, size, family)`
Fragments a string containing *Nyka* maths commands into individual glyphs, based on font size `size` and font family `family`. Make sure to call this function inside `delayedSetup()` to preprocess these strings if you want to draw them on screen at the correct position.


### `fragment(string, size)`
Fragments a string containing *Nyka* maths commands into individual glyphs, based on font size `size` using the default font family. Make sure to call this function inside `delayedSetup()` to preprocess these strings if you want to draw them on screen at the correct position.

---
### `fragmentLength(fragmentedString)`
Calculates the number of glyphs in a fragmented *Nyka* maths string. Only useful to call on the output of `fragment`.

---
### `frequency(list, x)`
Returns the number of times the value `x` appears in the array `list`.

---
### `inverseEerp(x, y, p)`
Calculates the parameter value `t` at which the exponential interpolation between `x` and `y` equals `p`. In other words, it calculates the growth rate from `x` to `p` relative to the growth rate from `x` to `y`. The result is set to 0.5 when `x` and `y` are equal.

---
### `inverseLerp(x, y, p)`
Calculates the parameter value `t` at which the linear interpolation between `x` and `y` equals `p`. In other words, it calculates the distance from `p` to `x` relative to the distance from `y` to `x`. The result is set to 0.5 when `x` and `y` are equal.

---
### `inverseSlerp(u, v, w)`
Calculates the parameter value `t` at which the spherical interpolation between the vectors `u` and `v` equals `w`. In other words, it calculates the angle between `w` and `u` relative to the angle between `v` and `u`. The vectors are assumed to be normalized.

---
### `joinStrings(list, symbol)`
Joins the strings in `list` together to a new one and inserts the symbol `symbol` in between them. 

---
### `lerp(x, y, t)`
Linearly interpolates between `x` and `y` at the parameter value `t`. The value `t` is allowed to be outside the interval $[0,1]$ to give the full affine combination of `x` and `y`.


### `lerp(x, y, t, a, b)`
Linearly interpolates between `x` and `y` at the parameter value `t` with the latter being in the interval $[a,b]$. In other words, it reparametrizes the interval $[a, b]$ to $[x, y]$.

---
### `newRect(pos, w, h, a)`
Creates a rectangle object at position `pos` with width `w` and height `h`. The parameter `a` determines the anchor point around the vorder of the rectangle which is used for `pos`. The anchor points are numbered in the order of a standard number pad on a computer keyboard. I.e. 1 is the bottom-left corner, 5 is the centre, etc.

### `newRect(pos, w, h)`
Creates a rectangle object with bottom-left corner `pos`, width `w` and height `h`.

---
### `now()`
The total time elapsed since the start of the animation.

---
### `perlinNoise2D(pos)`
Returns a smooth, continuous pseudo-random value between 0 and 1 based on a 2D-vector `pos`. You can use it to randomize parts of your animation such that it looks the same each time you run it. It is fully compatible with CindyGL if you want to use it in a shader.

---
### `perlinNoise2DOctaves(pos)`
Returns a smooth, continuous pseudo-random value between 0 and 1 based on a 2D-vector `pos`. The value is the sum of 3 copies of Perlin noise with varying resolutions. You can use it to randomize parts of your animation such that it looks the same each time you run it. It is fully compatible with CindyGL if you want to use it in a shader.

The packages does not provide a general way to create Perlin noise with any number of octaves. Firstly, it doesn't work on the GPU. Secondly, I haven't found the need for that level of detail in CPU-based applications.

---
### `pointInPolygon(point, polygon)`
Checks if the point `point` is inside the polygon defined by the points in `polygon`. Returns a boolean.

---
### `pop(list, i)`
Removes the last `i` elements from `list` and returns the shortened array.


### `pop(list)`
Removes the last element from `list` and returns the shortened array.

---
### `randomChoose(list, k)`
Chooses `k` elements from `list` at random and returns them as a new array.


### `randomChoose(list)`
Chooses one element from `list` at random.

---
### `randomSort(list)`
Shuffles the elements of `list` randomly.

---
### `randomGradient2D(pos)`
Returns a 2D-unit vector that is pseudo-random based on the 2D-vector `pos`. It is mostly used in `perlinNoise2D`. But you can use it to randomize parts of your animation such that it looks the same each time you run it. It is fully compatible with CindyGL if you want to use it in a shader.

---
### `randomValue(pos)`
Returns a pseudo-random value between 0 and 1 based on a 2D-vector `pos`. It is mostly used in `randomGradient2D` and `perlinNoise2D`. But you can use it to randomize parts of your animation such that it looks the same each time you run it. It is fully compatible with CindyGL if you want to use it in a shader.

---
### `rndSeed`
The seed for the pseudo-random number generator `rnd()`.

---
### `rnd()`
A pseudo-random number between 0 and 1. Can be seeded by setting `rndSeed`. This is equivalent to the built-in function `random()` combined with `seedrandom(x)`. For large, complex calculations the built-in version doesn't seem to work and does not produce the same outcame each time you run the animation.

---
### `rotate(point, alpha, center)`
Rotates the point `point` around the centre `center` by the angle `alpha`.

### `rotate(vector, alpha)`
Rotates the vector `vector` by the angle `alpha`.

---
### `rotation(alpha)`
Creates a 2x2 rotation matrix that rotates vectors by the angle `alpha`.

---
### `roundedRectangleStroke(center, w, h, cornerRadius)`
Creates a list of `strokeSampleRate`-many points that form a rectangle with rounded corners with centre `center`, width `w`, height `h`, and corner radius `cornerRadius`. The stroke starts on the left end of the top edge and goes counter-clockwise.

---
### `sampleBezierCurve(controls, n)`
Creates `n` points on the Bezier curve defined by the control points `controls`. These are equidistant in time, not in space. Use `sampleBezierSpline([controls], sampleRate, n)` for that.

---
### `sampleBezierSpline(spline, sampleRate, strokeResolution)`
Creates `strokeResolution`-many approximately equidistant points on a given Bezier spline. The spline has to be given as a list of lists of control points. E.g. 
```
    spline = [
        [(0, 0), (1, 1), (2, 2)],
        [(2, 2), (3, 3), (4, 4), (5, 5)]
    ];
```
would describe a spline built from a quadratic and a cubic Bezier curve. It is your own responsibility to make sure that the end point of one curve is the start point of the next. The parameter `sampleRate` determines how many points are sampled on each curve to approximate an equidistant distribution. If you use this in a preprocessing step, feel free to set `sampleRate` as high as necessary. In realtime processing -- e.g. recalculating a spline each frame of an animation -- you want to set this as low as possible while still getting good results.

---
### `sampleCatmullRomCurve(controls, alpha)`
Creates `strokeSampleRate`-many approximately equidistant points on the Catmull-Rom curve defined by the four control points `controls`. The parameter `alpha` determines the knot parametrization.


### `sampleCatmullRomCurve(controls)`
Creates `strokeSampleRate`-many approximately equidistant points on the centripetal Catmull-Rom curve (knot parametrization of 0.5) defined by the four control points `controls`.

---
### `sampleCatmullRomSpline(points, modifs)`
Creates approximately equidistant points on the Catmull-Rom spline defined by the points in `points`. The parameter `modifs` is a dictionary that allows you to set the knot parametrization with the key `alpha` and the number of points to sample with the key `nop`. The default values are `alpha = 0.5` and `nop = strokeSampleRate`.


### `sampleCatmullRomSpline(points)`
Creates `strokeSampleRate`-many approximately equidistant points on the centripetal Catmull-Rom spline (knot parametrization of 0.5) defined by the points in `points`.


---
### `sampleCircle(rad, angle)`
Creates `strokeSampleRate`-many equidistant points on a circle with radius `rad`, starting on the right side and going counter-clockwise for an angle of `angle`.


### `sampleCircle(rad, startAngle, endAngle)`
Creates `strokeSampleRate`-many equidistant points on a circle with radius `rad`, starting at `startAngle` and ending at `endAngle`.


### `sampleCircle(rad)`
Creates `strokeSampleRate`-many equidistant points on a circle with radius `rad`, starting on the right.

---
### `samplePolygon(poly, nop)`
Creates `nop`-many points on a polygonal curve given by the points in `poly`. The original points are included in the output, and the rest are spread as evenly as possible along the curve.


### `samplePolygon(poly)`
Creates `strokeSampleRate`-many points on a polygonal curve given by the points in `poly`. The original points are included in the output, and the rest are spread as evenly as possible along the curve. 

---
### `screenMouse()`
The coordinates of the mouse cursor normalized to the canvas such that they both lie in the interval $[0,1]$. This is particularly handy for development and debugging of animations: Instead of using the progress variable of an animation track, use `screenMouse().x` and you will be able to scrub through the animation by moving your mouse across the canvas.

---
### `setupAnimationTrack(s, e)`
Sets up one animation track based on its start time `s` and its end time `e`. Mostly only interesting if you are using `animationBase` on its own. But it can also be useful to create animations completely independent of the main setup provided via `trackData`.


---
### `setupMultiAnimationTracks(times)`
Given time information of the form `times = [startPause, duration 1, endPause 1, duration 2, endPause 2, ...]`, this will create multiple animation tracks that run in sequence.

There is basically no reason to call this yourself. But! You can override it to accomodate for your own timing setup. I.e. when you don't like the way durations and pauses are listed in `trackData`, reimplement this function to your liking. The return value must be an array of animation tracks, though.

---
### `setupTime()`
Sets up the basic time keeping system. Call it together with `playanimation()` in the init script if you use `animationBase` on its own.

---
### `sign(x)`
Returns the sign of `x`.

---
### `slerp(u, v, t)`
Spherical interpolation between the vectors `u` and `v` at the parameter value `t`. The vectors are assumed to be normalized. Is equivalent to `ang2vec(lerp(alpha, beta, t))` for appropriate angles `alpha` and `beta`.

---
### `smoothStep(x)`
The polynomial $3x^2 - 2x^3$. The function assumes that `x` is betwenn 0 and 1 and smoothly transitions from 0 to 1 as `x` grows.


### `smoothStep(x, a, b)`
The function is 0 if `x` is smaller than `a` and 1 if `x` is larger than `b`. It transitions smoothly between `a` and `b` via an appropriate cubic polynomial.


---
### `START`
The number 0. If you are testing parts of your animation and you want to set some progress to always be 0, use this constant to make it easier to see and later on change where you did this.

---
### `stepSignal(t, a, b, c, d)`
Returns 0 if `t` is smaller than `a` or larger than `d`. Returns 1 if `t` is between `b` and `c`. Transitions linearly when `t` is between `a` and `b` or between `c` and `d`.

---
### `strokeSampleRate`
Global constant that is used as a default value for sampling various curves like circles or Bezier curves.

---
### `timeOffset(t, a, b)`
Reparametrizes the interval $[0,1]$ to the interval $[a,b]$, but assumes that `t` is strictly between 0 and 1. In other words, for values $0\leq a < b \leq 1$, this returns 0 if `t` is below `a` and 1 if `t` is above `b`. In between, it linearly interpolates from 0 to 1.

The main use is to slightly offset movements within the same animation track. Cf. the example `animations/coordinate_grid.html` in the examples folder where gridlines are drawn with such a time offset from one another.

---
### `triangleSignal(t, a, b)`
Returns 0 if `t` is smaller than `a` or larger than `b`. Between `a` and `b`, it rises linearly from 0 to 1 and then falls linearly back to 0.


### `triangleSignal(t)`
Returns 0 if `t` is smaller than 0 or larger than 1. Between 0 and 1, it rises linearly from 0 to 1 and then falls linearly back to 0.

---
### `tween(obj, prop, target, time)`
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
### `updateAnimationTrack(track)`
Updates the progress and all other variables of the animation track `track` based on the current total time. Mostly only interesting if you are using `animationBase` on its own. Hasto be called every frame inthe *tick* script.


---
### `zip(a, b)`
Pairs up corresponding entries of two arrays of the same length `a` and `b`. I.e. the first entry of the output is `[a_1, b_1]`, the second entry is `[a_2, b_2]`, etc. Syntactic sugar for `transpose([a, b])`.

---



## The *Nyka* typesetting language
When creating the parser for the function `fragment`, which splits strings containing *KaTeX* commands into individual glyphs, I thought that it would be much simpler if the string followed to certain formating rules. Especially, since I was using them anyway. For example, always using curly braces for fractions: `"$\frac{1}{2}$"` even though `"$\frac12$"` would also work. Or listing the subscript part of a sum always before the superscript part: `"$\sum_{k=1}^{n}$"` instead of `"$\sum^{n}_{k=1}$"`. When deciding to make the animation package more public, I thought that asking the user to adhere to these rules might be a bit awkward. In my mind, it is much more convenient to create a completely new maths typesetting language that incorporates these rules; even though it is 99% identical to ordinary *LaTeX*. Or, at least, to the old *KaTeX* version that *CindyJS* is using. With this, *Nyka* was created, which stands for *Not Yet KaTeX*. It also allows me to make some minor adaptions, since there's no way to create custom *KaTeX* commands in *CindyJS*.

Here are the things that are different in *Nyka* compared to *KaTeX*:

- *Nyka* provides shorthand version for `\mathbb`, `\mathfrak`, `\mathscr` and `\mathcal`. FOr example, you can write `"$\bA$"` instead of `"$\mathbb{A}$"`. For the others, it is `"$\fA$"`, `"$\sA$"`, and `"$\cA$"`, respectively.
- Matrices and cases are not created via environment, but via regular, multi-argument commands. E.g., you would write
  
    ```"$\bmatrix{1 & 2 & 3}{4 & 5 & 6}{7 & 8 & 9}$"```
    
    instead of
    
    ```"$\begin{bmatrix} 1 & 2 & 3 \\ 4 & 5 & 6 \\ 7 & 8 & 9 \end{bmatrix}$"```
    
    and 
    
    ```"$\cases{1 & \text{if } x = 0}{0 & \text{otherwise}}$"```
    
    instead of
    
    ```"$\begin{cases} 1 & \text{if } x = 0 \\ 0 & \text{otherwise} \end{cases}$"```
- Fractions must be followed by curly braces: `"$\frac{a}{b}$"`.
- Roots must end with curly braces for the radicand: `"$\sqrt{2}$"`. The order/degree of the root is optional: `"$\sqrt[3]{2}$"`.
- Commands that take subscripts and superscripts must have them in square brackets. For limits, this means that you have to write `"$\lim[x \to 0]$"` instead of `"$\lim_{x \to 0}$"`. Writing `"$\lim$"` alone is also valid. The other cases are sums, products and integrals. Here, You must type both square brackets even if you only need one. E.g. for sums you would write `"$\sum[k=0][\infty]$"` or `"$\sum[k\in\bN][]$"`. If you don't need either subscript and superscript, you can omit the square brackets. E.g. `"$\sum$"` and `"$\sum[][]$"` are both valid.
