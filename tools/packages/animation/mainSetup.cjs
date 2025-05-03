// Force KaTeX to load fonts:
katexForceString = "$\begin{bmatrix}\frac{1+e}{\pi \oplus 1} & \prod_{k=3}^{\mathbb{A}\mathfrak{B}\mathscr{D}\mathcal{E}} 123 \\ \big(\bigg)\Big(\Bigg) & \lim\limits_{x\to\infty} \alpha^{2} \\ \sqrt[\sqrt{\infty + 4}]{\beta_{3 + 4}} & 6\end{bmatrix}$";
katexLoaded = false;
katexBufferWidth = pixelsize(katexForceString)_1;
if(not(katexBufferWidth < 10000), katexBufferWidth = 10000);

// ************************************************************

RENDERMODES := {
    "REAL": 0,
    "FRAMES": 1,
    "STEPS": 2
};
renderMode = RENDERMODES.REAL;

// ************************************************************

FRAMERENDERSTATES := {
    "CALCULATING": 0,
    "RENDERING": 1,
    "EXPORTING": 2
};
frameRenderState = FRAMERENDERSTATES.CALCULATING;
framesToExport = 0;
FORMATS := {
    "PNG": "PNG",
    "SVG": "SVG",
    "PDF": "PDF"
};
exportFormat = FORMATS.PNG;

disableFrameDownload = false;

// ************************************************************

STEPRENDERSTATES := {
    "WAITING": 0,
    "RUNNING": 1
};
stepRenderState = STEPRENDERSTATES.WAITING;

STEPBACKWARDS = "A";
STEPFORWARDS = "D";
SKIPFORWARDS = "S";
SKIPBACKWARDS = "W";
RELOAD = "R";

STEPMODES := {
    "KEYBOARD": 0,
    "MANUAL": 1
};
stepMode = STEPMODES.KEYBOARD;

moveStepForwards() := (
    if(stepRenderState == STEPRENDERSTATES.WAITING & currentTrackIndex <= numberOfTracks,
        stepRenderState = STEPRENDERSTATES.RUNNING;
    );
);
skipStepForwards() := (
    if(stepRenderState == STEPRENDERSTATES.WAITING & currentTrackIndex <= numberOfTracks,
        calculate(trackData_(2 * currentTrackIndex - 1) + trackData_(2 * currentTrackIndex));
        currentTrackIndex = min(currentTrackIndex + 1, numberOfTracks);
    );
);
skipStepBackwards() := (
    if(stepRenderState == STEPRENDERSTATES.WAITING & currentTrackIndex > 1,
        if(!endOfAnimationReached,
            currentTrackIndex = currentTrackIndex - 1;    
        );
        calculate(-trackData_(2 * currentTrackIndex) - trackData_(2 * currentTrackIndex - 1));
    );
);
reload() := (
    javascript("location.reload();");
);

// ************************************************************

startDelay = 0;
trackData = [];

currentTrackIndex = 1;


showDebugInfo = true;
debugInfoPosition = screenbounds()_1.xy + [1, -1.5];

debugInfoColor = (0,0,0);

totalTime = 0;

timeScale = 1;

fpsBuffer = [0];

delayedSetup() := ();
calculation() := ();
rendering() := ();

frameExportWaitTime = 2;
frameExportTimer = frameExportWaitTime;

endOfAnimationReached = false;

delta = 0;

// ************************************************************

tick(d) := (
    if(katexLoaded,
        if(frameCount < maxFrames,
            calculate(d);
            frameRenderState = FRAMERENDERSTATES.RENDERING;
        );
    , // else //
        if(pixelsize(katexForceString)_1 < 10000,
            katexLoaded = true;
            delayedSetup();
        , // else //
            delayedSetup();
            tick(1/60);
        );
    );
);


triggerScreenshot() := (
    if(frameRenderState == FRAMERENDERSTATES.RENDERING,
        frameRenderState = FRAMERENDERSTATES.EXPORTING;
        frameCount = frameCount + 1;
        if(!disableFrameDownload,

            if(framesToExport != 0,
                if(contains(framesToExport, frameCount) & contains(values(FORMATS), exportFormat),
                    println(frameCount + "/" + maxFrames);
                    javascript("cindy.export" + exportFormat + "('" + frameCount + "');");
                );
            , // else //
                println(frameCount + "/" + maxFrames);
                javascript("cindy.export" + exportFormat + "('" + frameCount + "');");
            );
        );

        frameExportTimer = frameExportWaitTime;
        playanimation();
    );
);

continueAnimation() := (
    frameRenderState = FRAMERENDERSTATES.CALCULATING;
    stopanimation();
    tick(delta);
);

calculate(d) := (
    totalTime = totalTime + d * timeScale;
    endOfAnimationReached = totalTime ~>= totalDuration -trackData_(-1);
    
    forall(tracks, updateAnimationTrack(#));

    forall(1..numberOfTracks, parse("t" + # + " = tracks_" + # +".progress;"));


    calculation();
);



