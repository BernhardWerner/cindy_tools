
defaultDuration = 1;
defaultPause = 1;

tweenBuffer = [];


intermediateValue(id, prop) := (
    regional(res);

    res = errorTofu;
    
    forall(tweenBuffer,
        if(#_1 == id & #_2 == prop,
            res = #_3;
        );
    );

    res;
);




t(i) := parse("t" + i);


animate(commandList, duration) := (
    regional(n, index, command, arr, oldStart, newStart, target);

    n = length(trackData);
    if(n == 0,
        trackData = [startDelay];
        n = 1;
    );
    if(mod(n, 2) == 0,
        trackData = trackData :> defaultPause;
        n = n + 1;
    );


    index = (n + 1) / 2;

    arr = [];
    forall(commandList, list,
        command = list_1;
        if(command == tween % command == tweenRelative,
            oldStart = intermediateValue(list_2.id, list_3);
            newStart = if(oldStart == errorTofu, (list_2)_(list_3), oldStart);
            target = if(command == tweenRelative, newStart + list_4, list_4);
            
            //println([list_2.id, list_2.type, list_3, oldStart, newStart, target]);
            
            tweenBuffer = tweenBuffer :> [list_2.id, list_3, target];
            arr = arr :> {
                "mode": "tween",
                "object": list_2,
                "property": list_3,
                "start":  newStart,
                "target": target,
                "easing": if(length(list) >= 5, list_5, 0)
            };
        ,if(command == ladder,
            arr = arr :> {
                "mode": "ladder",
                "separation": list_2,
                "command": list_3,
                "objects": list_4
            };
        , // else //
            if(contains(allActions, command),
                if(command == write,
                    duration = duration(list_(-1));
                );
                arr = arr :> {
                    "mode": "simple",
                    "command": command,
                    "objects": bite(list)
                };
            , // else //
                println("Unknown animation action '" + command + "'.");
            );
        ));
    );
    calculationQueue = calculationQueue :> arr;

    trackData = trackData :> duration;

    index;
);
animate(commandList) := animate(commandList, defaultDuration);



pause(duration) := (
    regional(n);

    n = length(trackData);
    if(n == 0,
        trackData = [startDelay];
        n = 1;
    );
    if(mod(n, 2) == 1,
        trackData_(-1) = trackData_(-1) + duration;
    , // else //
        trackData = trackData :> duration;
    );
);

pause() := pause(defaultPause);





// ************************************************************

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
        calculate(trackData_(2 * currentTrackIndex) + trackData_(2 * currentTrackIndex + 1));
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

calculationQueue = [];

startTrack = 1;
currentTrackIndex = 1;


showDebugInfo = true;
debugInfoPosition = screenbounds()_1.xy + [1, -1.5];

debugInfoColor = (0,0,0);

totalTime = 0;

timeScale = 1;

fpsBuffer = [0];

delayedSetup() := ();
update() := ();
render() := ();

frameExportWaitTime = 8;
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
    regional(listOfDicts, ladder);

    totalTime = totalTime + d * timeScale;
    endOfAnimationReached = if(length(trackData) == 0, true,
        totalTime ~>= totalDuration - trackData_(-1);
        
        forall(tracks, updateAnimationTrack(#));

        forall(1..numberOfTracks, 
            parse("t" + # + " = tracks_" + # +".progress;");
            if(# < startTrack % trackRunning(tracks_#),
                listOfDicts = calculationQueue_#;
                forall(listOfDicts, dict,
                    if(dict.mode == "simple",
                        forall(dict.objects, obj,
                            obj_(dict.command) = t(#);
                        );
                    );
                    if(dict.mode == "ladder",
                        ladder = ladder(#, length(dict.objects), dict.separation);
                        forall(dict.objects, obj,
                            obj_(dict.command) = ladder.doStep;
                        );
                    );
                    if(dict.mode == "tween",

                        (dict.object)_(dict.property) = lerp(dict.start, dict.target, parse(if(dict.easing == 0, "", dict.easing) + "(" + t(#) + ")"));
                    );
                );
            );
        );




        update();
    );
);



