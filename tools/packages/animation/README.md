# The animation package

## The general workflow

### Setting things up
Set up timing information for sequential animation tracks in \lstinline|trackData|. The general pattern is
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
The basic command to animate is \lstinline|lerp|. There are, broadly speaking, two cases to consider:
\begin{enumerate}
    \item You want to change a variable \lstinline|property| over time. Define it in \lstinline|calculation()|, and write something like \lstinline|property = lerp(property, newValue, t1)|, also in \lstinline|calculation()|.
    \item You are building a new value from fixed references. Define them outside of \lstinline|calculation()|, and then write something like \lstinline|newProperty = lerp(referenceA, referenceB, t1)| inside.
\end{enumerate}

\item If you are using \lstinline|fragment| to preprocess \emph{Nyka} maths strings, you have to call it inside a function called \lstinline|delayedSetup()|.

\item If you need absolute time information:
    \begin{enumerate}
        \item \lstinline|now()| gives you the currently total time.
        \item \lstinline|delta| gives you the duration of the last frame.
        \item \lstinline|tracks_k.timeElapsed| gives you the absolute time elapsed in the \lstinline|k|-th animation track.
    \end{enumerate}

\item Set \lstinline|showDebugInfo = false;| to remove the debug information in the top left.

\item Set \lstinline|currentTrackIndex = k;| to determine at which animation track to start.

### Exporting
\item There are three render modes available. You can set \lstinline|renderMode| to
\begin{enumerate}
    \item \lstinline|RENDERMODES.REAL|. This lets the animation run in real time from start to finish as is. It is mostly intended for development and debugging.
    \item \lstinline|RENDERMODES.FRAMES|. This will export the animation frame by frame at 60FPS after you double-click inside the canvas. This will download many(!) PNGs to your computer. Firefox seems to cause the fewest problems here. But in any case, it's better to export more short animation sequences. You can turn the PNGs into a video with, for example, \emph{FFmpeg} or \emph{DaVinci Resolve}.
    \item \lstinline|RENDERMODES.STEPS|. This will run in real time, too, but will pause the animation at the start of each track. Use it to embed animations into blog posts for readers to control, or to build presentation slides. It is also very handy for debugging. After clicking inside the canvas once, this mode can be controlled with the keyboard. The key 'D' will play the next animation track. With 'W', you can jump back one animation; and with 'S' you jump forward.
\end{enumerate}



\end{enumerate}









## Animation Commands & Functions

Relative reference points and sizes. \lstinline|canvasCenter|, \lstinline|canvasWidth|, \lstinline|canvasHeight|, \lstinline|canvasAnchors|

Linear interpolation between \lstinline|x| and \lstinline|y| where \lstinline|t| is a percentage: \lstinline|lerp(x, y, t)|

% Distance from \lstinline|x| to \lstinline|p| relative to distance from \lstinline|x| to \lstinline|y|: \lstinline|inverseLerp(x, y, p)|

Linear interpolation between \lstinline|x| and \lstinline|y| relative to \lstinline|t| where \lstinline|t| is between \lstinline|a| and \lstinline|b|: \lstinline|lerp(x, y, t, a, b)|

Limit \lstinline|x| to the interval between \lstinline|a| and \lstinline|b|: \lstinline|clamp(x, a, b)|

% Total time of current animation: \lstinline|now()|

% Duration of last frame: \lstinline|delta|

Easing function are all of the form \lstinline|easeInOutCubic(t)|. See \url{https://easings.net/} for all of them.

The result moves from 0 to 1 while the progress \lstinline|t| moves from \lstinline|a| to \lstinline|b|: \lstinline|timeOffset(t, a, b)|

% "Random" value between 0 and 1 given a position: \lstinline|randomValue(point)|

% 2D Perlin noise given a position: \lstinline|perlinNoise2D(point)|

Samples a circular arc stroke: \lstinline|sampleCircle(radius, startAngle, endAngle)|

% Samples a rectangle with rounded corners:\newline\lstinline|roundedRectangleStroke(center, width, height, cornerRadius)|

Samples a Bézier curve: \lstinline|sampleBezierCurve(listOfPoints)|

% Samples a cubic Bézier spline: \lstinline|sampleBezierSpline(listOfPoints)|

% Samples a single Catmul-Rom curve: \lstinline|sampleCatmulRomCurve(listOfPoints)|

% Samples a Catmul-Rom spline: \lstinline|sampleCatmulRomSpline(listOfPoints)|

Samples a polygonal curve: \lstinline|samplePolygonCurve(listOfPoints)|

Checks if a point is in a polygon: \lstinline|pointInPolygon(point, listOfPoints)|

% Creates unit vector pointing in a given angle direction: \lstinline|ang2vec(angle)|

Rotates a point around a centre: \lstinline|rotate(point, angle, center)|

% Shuffles an array: \lstinline|randomSort(array)|

% Chooses \lstinline|k| elements from an array at random: \lstinline|randomChoose(array, k)|

% Removes first element of an array: \lstinline|bite(array)|

% Removes last element of an array : \lstinline|pop(array)|


Splits a \emph{Nyka} maths string into individual glyphs: \lstinline|fragment(nykaString, textSize)|

Returns number of glyphs in a fragmented \emph{Nyka} maths string: \lstinline|fragmentLength(fragmentedString)|

Draws a fragmented \emph{Nyka} maths string over time \lstinline|t| with a typewriter effect. \lstinline|mode| can be \lstinline|"up"| or \lstinline|"down"|:
\newline\lstinline|drawFragments(position, fragmentedString, t, mode, dictOfModifiers)|

\emph{Nyka} commands via examples:
\setlength\parindent{2em}

Shorthand for \lstinline|\mathbb|, \lstinline|\mathfrak|, \lstinline|\mathscr| and \lstinline|\mathcal|: \lstinline|"$\bA$"|, \lstinline|"$\fB$"|, \lstinline|"$\sC$"|, \lstinline|"$\cD$"|

Matrices and cases: \lstinline|"$\bmatrix{1 & 2 & 3}{4 & 5 & 6}{7 & 8 & 9}$"|

Sums, products, and integrals. Must be followed by two square brackets or nothing:

\vspace{-0.8em}
\lstinline|"$\sum[k\in\bN][] k$"|

Limits. Can be followed by square brackets: \lstinline|"$\lim[x\to\infty] \frac{1}{x}$"|

Fractions must be followed by curly braces: \lstinline|"$\frac{a}{b}$"|

Roots. Can be followed by square brackets. Must end with curly braces:

\vspace{-0.8em}
\lstinline|"$\sqrt{2} \cdot \sqrt[3]{2}$"|
