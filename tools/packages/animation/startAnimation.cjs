tracks = setupMultiAnimationTracks(startDelay <: trackData);
numberOfTracks = length(tracks);

forall(1..numberOfTracks, parse("t" + # + " = " + 0 + ";"));

now() := totalTime;



if(renderMode == RENDERMODES.FRAMES,
    totalDuration = startDelay + sum(trackData);
    frameCount = 0;
    maxFrames = 60 * totalDuration;
);





if(renderMode == RENDERMODES.REAL,
    totalTime = if(currentTrackIndex > 1, startDelay + sum(trackData_(1 .. 2 * (currentTrackIndex-1))), 0);
    setupTime();
    playanimation();
    calculate(0);
);

if(renderMode == RENDERMODES.FRAMES,
    totalTime = if(currentTrackIndex > 1, startDelay + sum(trackData_(1 .. 2 * (currentTrackIndex-1))), 0);
    calculate(0);
);


if(renderMode == RENDERMODES.STEPS,
    totalTime = startDelay + if(currentTrackIndex > 1, sum(trackData_(1 .. 2 * (currentTrackIndex-1))), 0);
    setupTime();
    playanimation();
    calculate(0);


);