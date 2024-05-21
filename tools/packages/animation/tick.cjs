if(renderMode == RENDERMODES.REAL,
    delta = deltaTime();  
    fpsBuffer = fpsBuffer :> 1 / delta;
    if(length(fpsBuffer) > 30, fpsBuffer = bite(fpsBuffer));
    
    calculate(delta);
);

if(renderMode == RENDERMODES.FRAMES,
    if(frameRenderState == FRAMERENDERSTATES.EXPORTING,
        if(frameExportTimer > 0,
            frameExportTimer = frameExportTimer - 1;
        , // else //
            continueAnimation();
        );
    );
);


if(renderMode == RENDERMODES.STEPS,
    delta = deltaTime();
    if(stepRenderState == STEPRENDERSTATES.RUNNING,
        fpsBuffer = fpsBuffer :> 1 / delta;
        if(length(fpsBuffer) > 30, fpsBuffer = bite(fpsBuffer));

        calculate(delta);

        if(stepRenderState == STEPRENDERSTATES.RUNNING,
            if(tracks_currentTrackIndex.progress >= 1,
                stepRenderState = STEPRENDERSTATES.WAITING;
                totalTime = startDelay + sum(trackData_(1..2 * currentTrackIndex));
                currentTrackIndex = currentTrackIndex + 1;
            );
        );
    );
);