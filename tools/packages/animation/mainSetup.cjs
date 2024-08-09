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
SKIPFORWARDS = "X";
SKIPBACKWARDS = "Q";

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

calculation() := ();
rendering() := ();

frameExportWaitTime = 2;
frameExportTimer = frameExportWaitTime;

endOfAnimationReached = false;

delta = 0;

// ************************************************************

tick(d) := (
    if(frameCount < maxFrames,
        calculate(d);
        frameRenderState = FRAMERENDERSTATES.RENDERING;
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



