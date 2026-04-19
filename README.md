# cindy_tools
A collection of tools, libraries, and packages made in and for [CindyJS](https://cindyjs.org/) — an interactive geometry and mathematics visualization framework.

---

## Packages

Reusable modules composed together to build CindyJS projects. Use them via
```
CindyJS({,
    canvasname: "CSCanvas",
    scripts: "cs*",
    import: {
        "packages": [
            "PATH/TO/PACKAGE_A",
            "PATH/TO/PACKAGE_B"
        ]
    }
});

```

### Animation
A full animation framework for creating frame-based, multi-track animations. Supports tweening, 20+ easing functions, Bézier/Catmull-Rom splines, typewriter-style math rendering via **Nyka** (a KaTeX wrapper), polygon animation, Perlin noise, and multiple render modes (real-time, frame-by-frame, step-by-step).

### Responsive
Handles canvas resizing and responsive layouts. Provides a 9-point compass anchor system for positioning elements relative to canvas edges and center, with automatic recalculation on window resize.

### UI
Interactive UI component library: buttons, sliders, option sliders, and selectors. Uses SDF-based collision detection for rounded shapes and a lerp-based animation system for smooth interactions.

---

## Single Scripts

Standalone utility modules that can be dropped into any CindyJS project. Use them via
```
CindyJS({,
    canvasname: "CSCanvas",
    scripts: "cs*",
    import: {
        "init": [
            "PATH/TO/SCRIPT_A",
            "PATH/TO/SCRIPT_B"
        ]
    }
});

```

| Script | Description |
|---|---|
| `camera.cjs` | 3D camera system for perspective projection without the Cindy3D plugin. Spherical coordinates, 3D↔2D projection. |
| `color.cjs` | Color space conversions and blending. Supports RGB, HSV, OkLab, OkLCH, and hex strings, plus blend modes (multiply, screen). |
| `corvis.cjs` | Modern general-purpose utility library: interpolation (lerp, eerp, slerp), geometry helpers, SDF shapes, Poisson disc sampling. |
| `egdod.cjs` | Legacy uber-library; being gradually refactored into the focused packages above. |

Moreover, there is `svg2cindy.rb`: a Ruby script that converts SVG paths into CindyScript arrays of Bézier splines for animation.

---

## Full Widgets

Self-contained HTML templates.

- **template.html** — Minimal CindyJS project scaffold.
- **stroke_recorder.html** — Interactive canvas tool for recording hand-drawn strokes with pressure sensitivity; outputs normalized point arrays.

---

## Examples

Runnable HTML demos covering animations, UI components, color spaces, math typesetting (KaTeX), SVG import, and fullscreen widgets.

---

## Core Files (`cindy/`)

Local copies of the CindyJS framework and plugins: `Cindy.js`, `CindyGL.js`, `Cindy3D.js`, KaTeX, and supporting utilities.
