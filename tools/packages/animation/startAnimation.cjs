tracks = setupMultiAnimationTracks(startDelay <: trackData);
numberOfTracks = length(tracks);

forall(1..numberOfTracks, parse("t" + # + " = " + 0 + ";"));




if(renderMode == RENDERMODES.FRAMES,
    totalDuration = sum(trackData);
    frameCount = 0;
    maxFrames = 60 * totalDuration;
);





if(renderMode == RENDERMODES.REAL,
    totalTime = 0;
    setupTime();
    playanimation();
);

if(renderMode == RENDERMODES.FRAMES,
    totalTime = 0;
    now() := totalTime;
);

if(renderMode == RENDERMODES.STEPS,
    totalTime = startDelay + if(currentTrackIndex > 1, sum(trackData_(1 .. 2 * (currentTrackIndex-1))), 0);
    now() := totalTime;
    calculate(totalTime);
    setupTime();
    playanimation();

);