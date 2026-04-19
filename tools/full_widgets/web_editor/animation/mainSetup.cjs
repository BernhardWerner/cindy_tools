// Force KaTeX to load fonts:
katexForceString = "$\begin{bmatrix}\frac{1+e}{\pi \oplus 1} & \prod_{k=3}^{\mathbb{A}\mathfrak{B}\mathscr{D}\mathcal{E}} 123 \\ \big(\bigg)\Big(\Bigg) & \lim\limits_{x\to\infty} \alpha^{2} \\ \sqrt[\sqrt{\infty + 4}]{\beta_{3 + 4}} & 6\end{bmatrix}$";
katexLoaded = false;
katexBufferWidth = pixelsize(katexForceString)_1;
if(not(katexBufferWidth < 10000), katexBufferWidth = 10000);



// ************************************************************



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
    regional(n, index, command, arr, oldStart, newStart, target, secondCommand);

    n = length(trackData);
    if(n == 0,
        trackData = [startDelay];
        n = 1;
    );
    if(mod(n, 2) == 0,
        trackData = trackData :> 0;
        n = n + 1;
    );


    index = (n + 1) / 2;

    arr = [];
    forall(commandList, list,
        command = list_1;
        if(command == "tween" % command == "tweenRelative",
            oldStart = intermediateValue(list_2.id, list_3);
            newStart = if(oldStart == errorTofu, (list_2)_(list_3), oldStart);
            target = if(command == "tweenRelative", newStart + list_4, list_4);
            
            //println([list_2.id, list_2.type, list_3, oldStart, newStart, target]);
            
            tweenBuffer = tweenBuffer :> [list_2.id, list_3, target];
            arr = arr :> {
                "mode": "tween",
                "object": list_2,
                "property": list_3,
                "start":  newStart,
                "target": target,
                "easing": if(length(list) >= 5, list_5, "easeNot")
            };
        ,if(command == "set",
            arr = arr :> {
                "mode": "set",
                "object": list_2,
                "property": list_3,
                "value": list_4
            };
        ,if(command == run,
            arr = arr :> {
                "mode": run,
                "code": list_2
            };
        ,if(command == ladder,
            secondCommand = list_3;
            if(secondCommand == "tween" % secondCommand == "tweenRelative",
                oldStart = apply(list_4, intermediateValue(#.id, list_5));
                newStart = apply(list_4, obj, index, if(oldStart_index == errorTofu, obj_(list_5), oldStart_index));
                target = if(command == "tweenRelative", newStart + list_6, list_6);
                forall(list_4, obj, index,
                    tweenBuffer = tweenBuffer :> [obj.id, list_5, target_index];
                );
                arr = arr :> {
                    "mode": "ladder",
                    "separation": list_2,
                    "command": tween,
                    "objects": list_4,
                    "property": list_5,
                    "starts":  newStart,
                    "targets": target,
                    "easing": if(length(list) >= 7, list_7, "easeNot")
                };
            ,if(contains(allActions, secondCommand),
                arr = arr :> {
                    "mode": "ladder",
                    "separation": list_2,
                    "command": secondCommand,
                    "objects": list_4
                };
            , // else //
                println("Unknown animation action '" + command + "'.");
            ));
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
        ))));
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

SKIPBACKWARDS = "1";
MOVEBACKWARDS = "2";
MOVEFORWARDS = "3";
SKIPFORWARDS = "4";
RELOAD = "0";

STEPMODES := {
    "KEYBOARD": 0,
    "MANUAL": 1
};
stepMode = STEPMODES.KEYBOARD;

stepGaps = [];
currentGap = 0;

skipStepBackwards() := (
    if(stepRenderState == STEPRENDERSTATES.WAITING,
        if(currentGap > 1,
            calculate(0.5 * sum(stepGaps_(currentGap - 1)) - totalTime);
            currentGap = currentGap - 1;
        );
    );
);

moveStepBackwards() := (
    if(stepRenderState == STEPRENDERSTATES.WAITING,
        timeScale = -abs(timeScale);
        stepRenderState = STEPRENDERSTATES.RUNNING;
    );
);

moveStepForwards() := (
    if(stepRenderState == STEPRENDERSTATES.WAITING,
        stepRenderState = STEPRENDERSTATES.RUNNING;
    );
);

skipStepForwards() := (
    if(stepRenderState == STEPRENDERSTATES.WAITING,
        if(currentGap < length(stepGaps),
            calculate(0.5 * sum(stepGaps_(currentGap + 1)) - totalTime);
            currentGap = currentGap + 1;
        );
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

currentTrack() := (
    regional(hitTracks);

    hitTracks = select(1..length(tracks), tracks_#.start <= totalTime & totalTime <= tracks_#.end);
    if(length(hitTracks) == 0, 0, 
        sort(hitTracks, tracks_#.start)_1;
    );
);


showDebugInfo = true;
debugInfoPosition = screenbounds()_1.xy + [1, -1.5];

debugInfoColor = (0,0,0);

totalTime = 0;

timeScale = 1;

fullProcessing = false;

fpsBuffer = [0];

delayedSetup() := ();
update() := ();
render() := ();

frameExportWaitTime = 6;
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
        logMessage = if(currentTrack() == 0, "pause", "track " + currentTrack()) + ": frame " + frameCount + "/" + maxFrames;
        if(!disableFrameDownload,
            if(framesToExport != 0,
                if(contains(framesToExport, frameCount) & contains(values(FORMATS), exportFormat),
                    logMessage = logMessage + "  ↓";
                    javascript("cindy.export" + exportFormat + "('" + frameCount + "');");
                );
            , // else //
                logMessage = logMessage + "  ↓";
                javascript("cindy.export" + exportFormat + "('" + frameCount + "');");
            );
        );

        println(logMessage);

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

        forall(tracks, track, index, 
            parse("t" + index + " = " + track.progress + ";");
            
            track.started = track.iterations > 0;

            if(index <= startTrack % fullProcessing % (track.started & not(track.ended)),
                listOfDicts = calculationQueue_index;
                forall(listOfDicts, dict,
                    if(dict.mode == "simple",
                        forall(dict.objects, obj,
                            obj_(dict.command) = track.progress;
                        );
                    );
                    if(dict.mode == "set",
                        if(track.iterations == 1,
                            (dict.object)_(dict.property) = dict.value;
                        );
                    );
                    if(dict.mode == "run",
                        if(track.iterations == 1,
                            parse(dict.code);
                        );
                    );
                    if(dict.mode == "ladder",
                        ladder = ladder(index, length(dict.objects), dict.separation);
                        if(dict.command == tween,
                            forall(dict.objects, obj, index,
                                obj_(dict.property) = lerp(dict.starts_index, dict.targets_index, parse(dict.easing + "(" + ladder.doStep + ")"));
                            );
                        , // else //
                            forall(dict.objects, obj,
                                obj_(dict.command) = ladder.doStep;
                            );
                        );
                    );
                    if(dict.mode == "tween",
                        (dict.object)_(dict.property) = lerp(dict.start, dict.target, parse(dict.easing + "(" + track.progress + ")"));
                    );
                );
            );
        );




        update();

        forall(tracks, #.ended = #.progress >= 1);
    );
);



