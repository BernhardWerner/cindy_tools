RENDERMODES = {
    "REAL": 0,
    "FRAMES": 1,
    "STEPS": 2
};
renderMode = RENDERMODES.REAL;

FRAMERENDERSTATES = {
    "CALCULATING": 0,
    "RENDERING": 1,
    "EXPORTING": 2
};
frameRenderState = FRAMERENDERSTATES.CALCULATING;

STEPRENDERSTATES = {
    "WAITING": 0,
    "RUNNING": 1
};
stepRenderState = STEPRENDERSTATES.WAITING;

STEPBACKWARDS = "A";
STEPFORWARDS = "D";
SKIPFORWARDS = "S";
SKIPBACKWARDS = "W";



showDebugInfo = true;
debugInfoPosition = screenbounds()_1.xy + [1, -3];

debugInfoColor = (0,0,0);




fpsBuffer = [0];

objectSetup() := ();
calculation() := ();
rendering() := ();

frameExportWaitTime = 3;
frameExportTimer = frameExportWaitTime;


// ************************************************************

tick(delta) := (
    if(frameCount < maxFrames,
        calculate(delta);
        frameRenderState = FRAMERENDERSTATES.RENDERING;
    );
);


triggerScreenshot() := (
    if(frameRenderState == FRAMERENDERSTATES.RENDERING,
        frameRenderState = FRAMERENDERSTATES.EXPORTING;
        frameCount = frameCount + 1;
        println(frameCount + "/" + maxFrames);
        javascript("cindy.exportPNG('" + frameCount + "');");
        frameExportTimer = frameExportWaitTime;
        playanimation();
    );
);

continueAnimation() := (
    frameRenderState = FRAMERENDERSTATES.CALCULATING;
    stopanimation();
    tick(1/60);
);

calculate(delta) := (
    totalTime = totalTime + delta;
    forall(tracks, updateAnimationTrack(#, delta));

    forall(1..numberOfTracks, parse("t" + # + " = tracks_" + # +".progress;"));

    objectSetup();
    calculation();

);