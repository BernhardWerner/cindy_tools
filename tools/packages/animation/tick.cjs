if(renderMode == RENDERMODES.FRAMES,
    delta = 1/60;
    if(frameRenderState == FRAMERENDERSTATES.EXPORTING,
        if(frameExportTimer > 0,
            frameExportTimer = frameExportTimer - 1;
        , // else //
            continueAnimation();
        );
    );
, // else //
    if(katexLoaded,
        if(renderMode == RENDERMODES.REAL,
            delta = deltaTime();  
            fpsBuffer = fpsBuffer :> 1 / delta;
            if(length(fpsBuffer) > 30, fpsBuffer = bite(fpsBuffer));
            
            calculate(delta);
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
                    );
                );
            );
        );

        if(currentTrackIndex < numberOfTracks,
            if(tracks_currentTrackIndex.progress >= 1,
                currentTrackIndex = currentTrackIndex + 1;
            );
        );
    , // else //
        if(pixelsize(katexForceString)_1 < katexBufferWidth,
            katexLoaded = true;
            delayedSetup();
        , // else //
            delayedSetup();
        );
    );
);

